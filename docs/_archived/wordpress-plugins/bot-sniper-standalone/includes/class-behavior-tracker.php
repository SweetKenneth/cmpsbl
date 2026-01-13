<?php
/**
 * Behavioral Data Tracker
 * 
 * Receives and processes client-side behavioral tracking data
 *
 * @package BotSniper
 */

namespace BotSniper;

if (!defined('ABSPATH')) exit;

class BehaviorTracker {
    
    private $behavioral_analyzer;
    private $smart_learning;
    
    public function __construct() {
        $this->behavioral_analyzer = new BehavioralAnalyzer();
        $this->smart_learning = new SmartLearning();
    }
    
    /**
     * Process incoming behavioral data
     */
    public function process_behavioral_data($data) {
        if (empty($data) || !is_array($data)) {
            return array(
                'success' => false,
                'error' => 'Invalid behavioral data'
            );
        }
        
        // Analyze the behavioral data
        $analysis = $this->behavioral_analyzer->analyze($data);
        
        // Store in session for later use
        $session_id = $data['session_id'] ?? uniqid('bs_', true);
        set_transient('bot_sniper_behavior_' . $session_id, $analysis, 3600); // 1 hour
        
        // Record for learning if enabled
        $learning_mode = get_option('bot_sniper_learning_mode');
        if (isset($learning_mode['enabled']) && $learning_mode['enabled']) {
            $this->smart_learning->record_pattern(array(
                'session_id' => $session_id,
                'ip' => $this->get_client_ip(),
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
                'fingerprint' => array('behavioral_data' => $data),
                'threat_score' => 100 - $analysis['risk_score'],
                'action' => $analysis['is_human'] ? 'allow' : 'challenge',
                'confidence' => $analysis['confidence']
            ));
        }
        
        // If highly suspicious, log immediately
        if (!$analysis['is_human'] && $analysis['risk_score'] >= 70) {
            $this->log_suspicious_behavior($session_id, $data, $analysis);
        }
        
        return array(
            'success' => true,
            'analysis' => $analysis,
            'session_id' => $session_id
        );
    }
    
    /**
     * Get behavioral analysis for session
     */
    public function get_session_analysis($session_id) {
        $analysis = get_transient('bot_sniper_behavior_' . $session_id);
        
        if ($analysis === false) {
            return null;
        }
        
        return $analysis;
    }
    
    /**
     * Log suspicious behavioral patterns
     */
    private function log_suspicious_behavior($session_id, $data, $analysis) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'bot_sniper_logs';
        
        $wpdb->insert($table_name, array(
            'ip_address' => $this->get_client_ip(),
            'user_agent' => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500),
            'threat_score' => 100 - $analysis['risk_score'],
            'risk_level' => 'suspicious_behavior',
            'action_taken' => 'monitor',
            'page_url' => sanitize_text_field($_POST['page_url'] ?? ''),
            'detected_at' => current_time('mysql'),
            'metadata' => json_encode(array(
                'session_id' => $session_id,
                'anomalies' => $analysis['anomalies'],
                'confidence' => $analysis['confidence'],
                'behavioral_summary' => array(
                    'mouse_movements' => count($data['mouse_movements'] ?? []),
                    'keyboard_events' => count($data['keyboard_events'] ?? []),
                    'scroll_events' => count($data['scroll_events'] ?? []),
                    'click_events' => count($data['click_events'] ?? []),
                    'touch_events' => count($data['touch_events'] ?? []),
                    'time_on_page' => $data['time_on_page'] ?? 0
                )
            ))
        ));
    }
    
    /**
     * Get behavioral statistics
     */
    public function get_statistics() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'bot_sniper_logs';
        
        // Count behavioral detections in last 24h
        $behavioral_detections = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$table_name} 
            WHERE detected_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
            AND risk_level = 'suspicious_behavior'"
        );
        
        // Average time on page for legitimate users
        $avg_time = $wpdb->get_var(
            "SELECT AVG(CAST(JSON_EXTRACT(metadata, '$.behavioral_summary.time_on_page') AS UNSIGNED))
            FROM {$table_name}
            WHERE detected_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
            AND action_taken = 'allow'"
        );
        
        return array(
            'behavioral_detections_24h' => intval($behavioral_detections),
            'avg_time_on_page' => round($avg_time / 1000, 2), // Convert to seconds
            'tracking_active' => true
        );
    }
    
    /**
     * Validate behavioral data structure
     */
    public function validate_data($data) {
        $required_fields = array(
            'mouse_movements',
            'keyboard_events',
            'scroll_events',
            'click_events',
            'time_on_page'
        );
        
        foreach ($required_fields as $field) {
            if (!isset($data[$field])) {
                return false;
            }
        }
        
        return true;
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
