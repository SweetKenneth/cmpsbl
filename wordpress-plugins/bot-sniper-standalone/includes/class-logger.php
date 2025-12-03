<?php
/**
 * Logging System
 * 
 * Handles threat detection event logging and statistics
 *
 * @package BotSniper
 */

namespace BotSniper;

if (!defined('ABSPATH')) exit;

class Logger {
    
    /**
     * Log a threat detection event
     */
    public static function log($data) {
        global $wpdb;
        
        $settings = get_option('bot_sniper_settings');
        
        // Prepare IP address (anonymize if enabled)
        $ip = self::get_client_ip();
        if (isset($settings['anonymize_ips']) && $settings['anonymize_ips']) {
            $ip = self::anonymize_ip($ip);
        }
        
        $table_name = $wpdb->prefix . 'bot_sniper_logs';
        
        $wpdb->insert(
            $table_name,
            array(
                'ip_address' => sanitize_text_field($ip),
                'user_agent' => sanitize_text_field(substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500)),
                'threat_score' => intval($data['threat_score'] ?? 0),
                'risk_level' => sanitize_text_field($data['action'] ?? 'allow'),
                'action_taken' => sanitize_text_field($data['action'] ?? 'allow'),
                'page_url' => sanitize_text_field($_SERVER['REQUEST_URI'] ?? ''),
                'detected_at' => current_time('mysql'),
                'metadata' => sanitize_textarea_field($data['details'] ?? '')
            ),
            array('%s', '%s', '%d', '%s', '%s', '%s', '%s', '%s')
        );
    }
    
    /**
     * Get recent log entries
     */
    public static function get_recent_logs($limit = 100) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'bot_sniper_logs';
        $limit = intval($limit);
        
        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$table_name} ORDER BY detected_at DESC LIMIT %d",
                $limit
            ),
            ARRAY_A
        );
        
        return $results ? $results : array();
    }
    
    /**
     * Get statistics for dashboard
     */
    public static function get_statistics() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'bot_sniper_logs';
        
        // Threats blocked today
        $blocks_today = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$table_name} 
            WHERE DATE(detected_at) = CURDATE() AND action_taken = 'block'"
        );
        
        // Total detections today
        $detections_today = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$table_name} 
            WHERE DATE(detected_at) = CURDATE()"
        );
        
        // Threats blocked this week
        $blocks_week = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$table_name} 
            WHERE YEARWEEK(detected_at) = YEARWEEK(NOW()) AND action_taken = 'block'"
        );
        
        // Average threat score
        $avg_threat_score = $wpdb->get_var(
            "SELECT AVG(threat_score) FROM {$table_name} 
            WHERE detected_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)"
        );
        
        // Top threat IPs
        $top_threats = $wpdb->get_results(
            "SELECT ip_address, COUNT(*) as count, MAX(threat_score) as max_score 
            FROM {$table_name} 
            WHERE action_taken IN ('block', 'challenge')
            AND detected_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY ip_address 
            ORDER BY count DESC 
            LIMIT 10",
            ARRAY_A
        );
        
        return array(
            'threats_blocked_24h' => intval($blocks_today),
            'total_detections' => intval($detections_today),
            'blocks_week' => intval($blocks_week),
            'avg_threat_score' => round($avg_threat_score, 2),
            'top_threat_ips' => $top_threats
        );
    }
    
    /**
     * Clean up old log entries
     */
    public static function cleanup_old_logs() {
        global $wpdb;
        
        $settings = get_option('bot_sniper_settings');
        $retention_days = isset($settings['log_retention_days']) ? intval($settings['log_retention_days']) : 30;
        
        $table_name = $wpdb->prefix . 'bot_sniper_logs';
        
        $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM {$table_name} WHERE detected_at < DATE_SUB(NOW(), INTERVAL %d DAY)",
                $retention_days
            )
        );
    }
    
    /**
     * Get client IP address
     */
    private static function get_client_ip() {
        $ip_keys = array(
            'HTTP_CF_CONNECTING_IP',
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'REMOTE_ADDR'
        );
        
        foreach ($ip_keys as $key) {
            if (isset($_SERVER[$key]) && filter_var($_SERVER[$key], FILTER_VALIDATE_IP)) {
                return $_SERVER[$key];
            }
        }
        
        return '0.0.0.0';
    }
    
    /**
     * Anonymize IP address for GDPR compliance
     */
    private static function anonymize_ip($ip) {
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            // IPv4: mask last octet
            return preg_replace('/\.\d+$/', '.0', $ip);
        } elseif (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
            // IPv6: mask last 80 bits
            return preg_replace('/:[^:]+:[^:]+:[^:]+:[^:]+$/', '::0', $ip);
        }
        
        return $ip;
    }
}

// Schedule cleanup hook
add_action('bot_sniper_cleanup_logs', array('BotSniper\Logger', 'cleanup_old_logs'));
