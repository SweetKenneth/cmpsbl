<?php
/**
 * Logging system for threat detection events.
 *
 * @package PromptFluid_Defense
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Defense_Logger {
    
    /**
     * Log a threat detection event.
     *
     * @param array $data Event data to log
     */
    public static function log($data) {
        global $wpdb;
        
        $settings = get_option('promptfluid_defense_settings');
        
        // Prepare IP address (anonymize if enabled)
        $ip = self::get_client_ip();
        if (isset($settings['anonymize_ips']) && $settings['anonymize_ips']) {
            $ip = self::anonymize_ip($ip);
        }
        
        $table_name = $wpdb->prefix . 'pf_defense_logs';
        
        $wpdb->insert(
            $table_name,
            array(
                'timestamp' => current_time('mysql'),
                'ip' => sanitize_text_field($ip),
                'user_agent' => sanitize_text_field(substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500)),
                'threat_type' => sanitize_text_field($data['threat_type'] ?? 'unknown'),
                'blocked' => intval($data['blocked'] ?? 1),
                'details' => sanitize_textarea_field($data['details'] ?? '')
            ),
            array('%s', '%s', '%s', '%s', '%d', '%s')
        );
    }
    
    /**
     * Get recent log entries.
     *
     * @param int $limit Number of entries to retrieve
     * @return array Log entries
     */
    public static function get_recent_logs($limit = 100) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'pf_defense_logs';
        $limit = intval($limit);
        
        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM $table_name ORDER BY timestamp DESC LIMIT %d",
                $limit
            ),
            ARRAY_A
        );
        
        return $results ? $results : array();
    }
    
    /**
     * Get statistics for dashboard.
     *
     * @return array Statistics data
     */
    public static function get_statistics() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'pf_defense_logs';
        
        // Blocks today
        $blocks_today = $wpdb->get_var(
            "SELECT COUNT(*) FROM $table_name 
            WHERE DATE(timestamp) = CURDATE() AND blocked = 1"
        );
        
        // Blocks this week
        $blocks_week = $wpdb->get_var(
            "SELECT COUNT(*) FROM $table_name 
            WHERE YEARWEEK(timestamp) = YEARWEEK(NOW()) AND blocked = 1"
        );
        
        // Top threat types
        $top_threats = $wpdb->get_results(
            "SELECT threat_type, COUNT(*) as count 
            FROM $table_name 
            WHERE blocked = 1 
            GROUP BY threat_type 
            ORDER BY count DESC 
            LIMIT 5",
            ARRAY_A
        );
        
        return array(
            'blocks_today' => intval($blocks_today),
            'blocks_week' => intval($blocks_week),
            'top_threats' => $top_threats
        );
    }
    
    /**
     * Clean up old log entries.
     */
    public static function cleanup_old_logs() {
        global $wpdb;
        
        $settings = get_option('promptfluid_defense_settings');
        $retention_days = isset($settings['log_retention_days']) ? intval($settings['log_retention_days']) : 30;
        
        $table_name = $wpdb->prefix . 'pf_defense_logs';
        
        $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM $table_name WHERE timestamp < DATE_SUB(NOW(), INTERVAL %d DAY)",
                $retention_days
            )
        );
    }
    
    /**
     * Get client IP address securely.
     * Uses the IP Validator to prevent header spoofing.
     */
    private static function get_client_ip() {
        if (class_exists('PromptFluid_Defense_IP_Validator')) {
            return PromptFluid_Defense_IP_Validator::get_client_ip();
        }
        
        // Fallback: only trust REMOTE_ADDR
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '0.0.0.0';
    }
    
    /**
     * Anonymize IP address for GDPR compliance.
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
add_action('promptfluid_defense_cleanup_logs', array('PromptFluid_Defense_Logger', 'cleanup_old_logs'));
