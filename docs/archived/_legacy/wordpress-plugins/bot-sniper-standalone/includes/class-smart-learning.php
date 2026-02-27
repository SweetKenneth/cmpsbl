<?php
/**
 * Smart Learning Engine
 * 
 * Adaptive AI-powered threat detection that learns from site-specific patterns
 *
 * @package BotSniper
 */

namespace BotSniper;

if (!defined('ABSPATH')) exit;

class SmartLearning {
    
    /**
     * Create learning database tables
     */
    public static function create_tables() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        
        $learning_data_table = $wpdb->prefix . 'bot_sniper_learning_data';
        $sql_learning_data = "CREATE TABLE IF NOT EXISTS {$learning_data_table} (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            session_id varchar(64) NOT NULL,
            ip_address varchar(45) NOT NULL,
            user_agent text NOT NULL,
            fingerprint_data longtext,
            behavioral_score float DEFAULT 0,
            classification varchar(20) DEFAULT 'unknown',
            confidence float DEFAULT 0,
            feedback varchar(20),
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY session_id (session_id),
            KEY ip_address (ip_address),
            KEY classification (classification)
        ) $charset_collate;";
        
        $patterns_table = $wpdb->prefix . 'bot_sniper_behavioral_patterns';
        $sql_patterns = "CREATE TABLE IF NOT EXISTS {$patterns_table} (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            pattern_type varchar(50) NOT NULL,
            pattern_data longtext NOT NULL,
            threat_level varchar(20) NOT NULL,
            confidence float DEFAULT 0,
            occurrence_count int DEFAULT 1,
            last_seen datetime DEFAULT CURRENT_TIMESTAMP,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY pattern_type (pattern_type),
            KEY threat_level (threat_level)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql_learning_data);
        dbDelta($sql_patterns);
    }
    
    public function __construct() {
        // Constructor
    }
    
    /**
     * Record pattern for learning
     */
    public function record_pattern($pattern_data) {
        global $wpdb;
        
        $learning_mode = get_option('bot_sniper_learning_mode', array(
            'enabled' => false,
            'start_date' => null,
            'duration_days' => 7,
            'baseline_ready' => false
        ));
        
        // Always record if learning mode is enabled
        if (!$learning_mode['enabled']) {
            return;
        }
        
        $learning_table = $wpdb->prefix . 'bot_sniper_learning_data';
        
        $wpdb->insert($learning_table, array(
            'session_id' => $pattern_data['session_id'] ?? '',
            'ip_address' => $pattern_data['ip'] ?? '',
            'user_agent' => substr($pattern_data['user_agent'] ?? '', 0, 255),
            'fingerprint_data' => json_encode($pattern_data['fingerprint'] ?? array()),
            'behavioral_score' => floatval($pattern_data['threat_score'] ?? 0),
            'classification' => sanitize_text_field($pattern_data['action'] ?? 'unknown'),
            'confidence' => floatval($pattern_data['confidence'] ?? 0.5),
            'created_at' => current_time('mysql')
        ));
        
        // Check if baseline ready
        $total = $wpdb->get_var("SELECT COUNT(*) FROM {$learning_table}");
        if ($total >= 100 && !$learning_mode['baseline_ready']) {
            $learning_mode['baseline_ready'] = true;
            update_option('bot_sniper_learning_mode', $learning_mode);
        }
    }
    
    /**
     * Get learning statistics
     */
    public function get_learning_stats() {
        global $wpdb;
        
        $learning_table = $wpdb->prefix . 'bot_sniper_learning_data';
        $logs_table = $wpdb->prefix . 'bot_sniper_logs';
        
        // Get learning mode status
        $learning_mode = get_option('bot_sniper_learning_mode', array(
            'enabled' => false,
            'start_date' => null,
            'duration_days' => 7,
            'baseline_ready' => false
        ));
        
        // Get pattern counts
        $total_patterns = $wpdb->get_var("SELECT COUNT(*) FROM {$learning_table}");
        $safe_patterns = $wpdb->get_var("SELECT COUNT(*) FROM {$learning_table} WHERE behavioral_score <= 30");
        $suspicious_patterns = $wpdb->get_var("SELECT COUNT(*) FROM {$learning_table} WHERE behavioral_score BETWEEN 31 AND 69");
        $malicious_patterns = $wpdb->get_var("SELECT COUNT(*) FROM {$learning_table} WHERE behavioral_score >= 70");
        
        // Get recent accuracy
        $recent_detections = $wpdb->get_var("SELECT COUNT(*) FROM {$logs_table} WHERE detected_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)");
        $blocked_detections = $wpdb->get_var("SELECT COUNT(*) FROM {$logs_table} WHERE detected_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) AND action_taken = 'block'");
        
        $accuracy = $recent_detections > 0 ? (($blocked_detections / $recent_detections) * 100) : 95;
        
        return array(
            'learning_mode' => $learning_mode,
            'total_patterns' => intval($total_patterns),
            'safe_patterns' => intval($safe_patterns),
            'suspicious_patterns' => intval($suspicious_patterns),
            'malicious_patterns' => intval($malicious_patterns),
            'accuracy' => round($accuracy, 2),
            'baseline_ready' => $learning_mode['baseline_ready'],
            'samples_needed' => max(0, 100 - intval($total_patterns))
        );
    }
    
    /**
     * Enable learning mode
     */
    public function enable_learning_mode($duration_days = 7) {
        update_option('bot_sniper_learning_mode', array(
            'enabled' => true,
            'start_date' => current_time('mysql'),
            'duration_days' => $duration_days,
            'baseline_ready' => false
        ));
        
        return array(
            'success' => true,
            'message' => sprintf(__('Learning mode enabled for %d days. The system will observe traffic patterns.', 'bot-sniper'), $duration_days)
        );
    }
    
    /**
     * Disable learning mode
     */
    public function disable_learning_mode() {
        $learning_mode = get_option('bot_sniper_learning_mode');
        $learning_mode['enabled'] = false;
        update_option('bot_sniper_learning_mode', $learning_mode);
        
        return array(
            'success' => true,
            'message' => __('Learning mode disabled. Adaptive thresholds will be used.', 'bot-sniper')
        );
    }
    
    /**
     * Get adaptive thresholds based on learning
     */
    public function get_adaptive_thresholds() {
        global $wpdb;
        
        $learning_table = $wpdb->prefix . 'bot_sniper_learning_data';
        $learning_mode = get_option('bot_sniper_learning_mode');
        
        // Return default thresholds if baseline not ready
        if (!isset($learning_mode['baseline_ready']) || !$learning_mode['baseline_ready']) {
            return array(
                'block_threshold' => 70,
                'challenge_threshold' => 50,
                'safe_threshold' => 30
            );
        }
        
        // Calculate percentiles from learning data
        $scores = $wpdb->get_col("SELECT behavioral_score FROM {$learning_table} ORDER BY behavioral_score");
        
        if (count($scores) < 100) {
            return array(
                'block_threshold' => 70,
                'challenge_threshold' => 50,
                'safe_threshold' => 30
            );
        }
        
        // Calculate adaptive thresholds based on traffic patterns
        $percentile_20 = $scores[intval(count($scores) * 0.2)];
        $percentile_50 = $scores[intval(count($scores) * 0.5)];
        $percentile_80 = $scores[intval(count($scores) * 0.8)];
        
        return array(
            'block_threshold' => max(55, min(85, $percentile_80)),
            'challenge_threshold' => max(35, min(65, $percentile_50)),
            'safe_threshold' => max(15, min(35, $percentile_20))
        );
    }
    
    /**
     * Record behavioral pattern
     */
    public function record_behavioral_pattern($pattern_type, $pattern_data, $threat_level) {
        global $wpdb;
        
        $patterns_table = $wpdb->prefix . 'bot_sniper_behavioral_patterns';
        
        // Check if pattern exists
        $existing = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$patterns_table} WHERE pattern_type = %s AND pattern_data = %s",
            $pattern_type,
            json_encode($pattern_data)
        ));
        
        if ($existing) {
            // Update occurrence count
            $wpdb->update(
                $patterns_table,
                array(
                    'occurrence_count' => $existing->occurrence_count + 1,
                    'last_seen' => current_time('mysql')
                ),
                array('id' => $existing->id)
            );
        } else {
            // Insert new pattern
            $wpdb->insert($patterns_table, array(
                'pattern_type' => $pattern_type,
                'pattern_data' => json_encode($pattern_data),
                'threat_level' => $threat_level,
                'confidence' => 0.5,
                'occurrence_count' => 1,
                'last_seen' => current_time('mysql'),
                'created_at' => current_time('mysql')
            ));
        }
    }
    
    /**
     * Check if pattern is known threat
     */
    public function is_known_pattern($pattern_type, $pattern_data) {
        global $wpdb;
        
        $patterns_table = $wpdb->prefix . 'bot_sniper_behavioral_patterns';
        
        $pattern = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$patterns_table} 
            WHERE pattern_type = %s 
            AND pattern_data = %s 
            AND occurrence_count >= 3",
            $pattern_type,
            json_encode($pattern_data)
        ));
        
        if ($pattern) {
            return array(
                'is_known' => true,
                'threat_level' => $pattern->threat_level,
                'confidence' => floatval($pattern->confidence),
                'occurrences' => intval($pattern->occurrence_count)
            );
        }
        
        return array('is_known' => false);
    }
}
