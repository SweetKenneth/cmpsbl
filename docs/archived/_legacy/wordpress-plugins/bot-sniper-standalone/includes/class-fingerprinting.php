<?php
/**
 * Device Fingerprinting System
 * 
 * Advanced device fingerprinting for bot detection and tracking
 *
 * @package BotSniper
 */

namespace BotSniper;

if (!defined('ABSPATH')) exit;

class Fingerprinting {
    
    /**
     * Generate device fingerprint
     */
    public function generate_fingerprint() {
        $components = array();
        
        // User Agent
        $components['user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? '';
        
        // Accept headers
        $components['accept'] = $_SERVER['HTTP_ACCEPT'] ?? '';
        $components['accept_encoding'] = $_SERVER['HTTP_ACCEPT_ENCODING'] ?? '';
        $components['accept_language'] = $_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '';
        
        // Connection type
        $components['connection'] = $_SERVER['HTTP_CONNECTION'] ?? '';
        
        // Browser capabilities
        $components['dnt'] = $_SERVER['HTTP_DNT'] ?? '';
        $components['upgrade_insecure_requests'] = $_SERVER['HTTP_UPGRADE_INSECURE_REQUESTS'] ?? '';
        
        // Client hints
        $components['sec_ch_ua'] = $_SERVER['HTTP_SEC_CH_UA'] ?? '';
        $components['sec_ch_ua_mobile'] = $_SERVER['HTTP_SEC_CH_UA_MOBILE'] ?? '';
        $components['sec_ch_ua_platform'] = $_SERVER['HTTP_SEC_CH_UA_PLATFORM'] ?? '';
        
        // TLS/SSL fingerprint
        if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
            $components['ssl_protocol'] = $_SERVER['SSL_PROTOCOL'] ?? '';
            $components['ssl_cipher'] = $_SERVER['SSL_CIPHER'] ?? '';
        }
        
        // Generate hash
        $fingerprint_string = json_encode($components);
        $fingerprint_hash = hash('sha256', $fingerprint_string);
        
        return array(
            'hash' => $fingerprint_hash,
            'components' => $components,
            'timestamp' => time()
        );
    }
    
    /**
     * Analyze fingerprint for bot indicators
     */
    public function analyze_fingerprint($fingerprint) {
        $score = 0;
        $indicators = array();
        
        $components = $fingerprint['components'];
        
        // Missing headers indicate automation
        $required_headers = array('accept', 'accept_language', 'accept_encoding');
        $missing_count = 0;
        
        foreach ($required_headers as $header) {
            if (empty($components[$header])) {
                $missing_count++;
            }
        }
        
        if ($missing_count > 0) {
            $score += ($missing_count * 20);
            $indicators[] = sprintf('Missing %d required browser headers', $missing_count);
        }
        
        // Check for suspicious header combinations
        if (!empty($components['user_agent'])) {
            $ua = strtolower($components['user_agent']);
            
            // Browser claims but missing JavaScript headers
            if ((strpos($ua, 'chrome') !== false || strpos($ua, 'firefox') !== false) && 
                empty($components['sec_ch_ua'])) {
                $score += 15;
                $indicators[] = 'Browser claims modern engine but missing client hints';
            }
            
            // Mobile claim mismatch
            if (strpos($ua, 'mobile') !== false && 
                isset($components['sec_ch_ua_mobile']) && 
                $components['sec_ch_ua_mobile'] === '?0') {
                $score += 20;
                $indicators[] = 'Mobile user agent but client hints indicate desktop';
            }
        }
        
        // Unusual Accept header
        if (!empty($components['accept'])) {
            if ($components['accept'] === '*/*' || strlen($components['accept']) < 10) {
                $score += 25;
                $indicators[] = 'Simplified Accept header typical of automation';
            }
        }
        
        // Missing connection persistence
        if (empty($components['connection']) || $components['connection'] === 'close') {
            $score += 10;
            $indicators[] = 'Connection type indicates non-browser behavior';
        }
        
        // Check fingerprint consistency
        $consistency = $this->check_fingerprint_consistency($fingerprint['hash']);
        if (!$consistency['consistent']) {
            $score += 30;
            $indicators[] = 'Fingerprint changed unexpectedly';
        }
        
        return array(
            'score' => min(100, $score),
            'is_suspicious' => $score >= 40,
            'indicators' => $indicators,
            'fingerprint_hash' => $fingerprint['hash']
        );
    }
    
    /**
     * Check fingerprint consistency over time
     */
    private function check_fingerprint_consistency($fingerprint_hash) {
        $ip = $this->get_client_ip();
        $transient_key = 'bot_sniper_fp_' . md5($ip);
        
        $stored_fingerprint = get_transient($transient_key);
        
        if ($stored_fingerprint === false) {
            // First time seeing this IP, store fingerprint
            set_transient($transient_key, $fingerprint_hash, 3600); // 1 hour
            return array('consistent' => true, 'first_visit' => true);
        }
        
        // Check if fingerprint matches
        $consistent = ($stored_fingerprint === $fingerprint_hash);
        
        return array('consistent' => $consistent, 'first_visit' => false);
    }
    
    /**
     * Track fingerprint in database
     */
    public function track_fingerprint($fingerprint, $threat_score) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'bot_sniper_fingerprints';
        
        // Create table if needed
        $this->maybe_create_fingerprints_table();
        
        $ip = $this->get_client_ip();
        
        // Check if fingerprint exists
        $existing = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table_name} WHERE fingerprint_hash = %s",
            $fingerprint['hash']
        ));
        
        if ($existing) {
            // Update visit count and last seen
            $wpdb->update(
                $table_name,
                array(
                    'visit_count' => $existing->visit_count + 1,
                    'avg_threat_score' => ($existing->avg_threat_score + $threat_score) / 2,
                    'last_seen' => current_time('mysql')
                ),
                array('id' => $existing->id)
            );
        } else {
            // Insert new fingerprint
            $wpdb->insert($table_name, array(
                'fingerprint_hash' => $fingerprint['hash'],
                'ip_address' => $ip,
                'user_agent' => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500),
                'fingerprint_data' => json_encode($fingerprint['components']),
                'threat_score' => $threat_score,
                'avg_threat_score' => $threat_score,
                'visit_count' => 1,
                'first_seen' => current_time('mysql'),
                'last_seen' => current_time('mysql')
            ));
        }
    }
    
    /**
     * Get fingerprint reputation
     */
    public function get_fingerprint_reputation($fingerprint_hash) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'bot_sniper_fingerprints';
        
        $fingerprint = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table_name} WHERE fingerprint_hash = %s",
            $fingerprint_hash
        ));
        
        if (!$fingerprint) {
            return array(
                'known' => false,
                'reputation' => 'unknown'
            );
        }
        
        $avg_score = floatval($fingerprint->avg_threat_score);
        
        if ($avg_score >= 70) {
            $reputation = 'malicious';
        } elseif ($avg_score >= 40) {
            $reputation = 'suspicious';
        } else {
            $reputation = 'clean';
        }
        
        return array(
            'known' => true,
            'reputation' => $reputation,
            'avg_threat_score' => $avg_score,
            'visit_count' => intval($fingerprint->visit_count),
            'first_seen' => $fingerprint->first_seen,
            'last_seen' => $fingerprint->last_seen
        );
    }
    
    /**
     * Create fingerprints table
     */
    private function maybe_create_fingerprints_table() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'bot_sniper_fingerprints';
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE IF NOT EXISTS {$table_name} (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            fingerprint_hash varchar(64) NOT NULL,
            ip_address varchar(45) NOT NULL,
            user_agent text,
            fingerprint_data longtext,
            threat_score int DEFAULT 0,
            avg_threat_score float DEFAULT 0,
            visit_count int DEFAULT 1,
            first_seen datetime DEFAULT CURRENT_TIMESTAMP,
            last_seen datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY fingerprint_hash (fingerprint_hash),
            KEY ip_address (ip_address),
            KEY last_seen (last_seen)
        ) {$charset_collate};";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * Get client IP address
     */
    private function get_client_ip() {
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
}
