<?php
/**
 * Smart Learning Engine
 * 
 * Adaptive AI-powered threat detection that learns from site-specific patterns
 *
 * @package PromptFluid_Defense
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Defense_Smart_Learning {
    
    /**
     * Create learning database tables
     */
    public static function create_tables() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        
        $learning_data_table = $wpdb->prefix . 'pfdef_learning_data';
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
        
        $patterns_table = $wpdb->prefix . 'pfdef_behavioral_patterns';
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
     * Get learning statistics
     */
    public function get_learning_stats() {
        global $wpdb;
        
        $learning_table = $wpdb->prefix . 'pfdef_learning';
        $detections_table = $wpdb->prefix . 'pfdef_detections';
        
        // Get learning mode status
        $learning_mode = get_option('pfdef_learning_mode', array(
            'enabled' => false,
            'start_date' => null,
            'duration_days' => 7,
            'baseline_ready' => false
        ));
        
        // Get pattern counts
        $total_patterns = $wpdb->get_var("SELECT COUNT(*) FROM {$learning_table}");
        $safe_patterns = $wpdb->get_var("SELECT COUNT(*) FROM {$learning_table} WHERE behavior_score >= 70");
        $suspicious_patterns = $wpdb->get_var("SELECT COUNT(*) FROM {$learning_table} WHERE behavior_score BETWEEN 40 AND 69");
        $malicious_patterns = $wpdb->get_var("SELECT COUNT(*) FROM {$learning_table} WHERE behavior_score < 40");
        
        // Get recent accuracy
        $recent_detections = $wpdb->get_var("SELECT COUNT(*) FROM {$detections_table} WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)");
        $false_positives = $wpdb->get_var("SELECT COUNT(*) FROM {$detections_table} WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR) AND details LIKE '%false_positive%'");
        
        $accuracy = $recent_detections > 0 ? ((($recent_detections - $false_positives) / $recent_detections) * 100) : 95;
        
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
        update_option('pfdef_learning_mode', array(
            'enabled' => true,
            'start_date' => current_time('mysql'),
            'duration_days' => $duration_days,
            'baseline_ready' => false
        ));
        
        return array(
            'success' => true,
            'message' => sprintf(__('Learning mode enabled for %d days. The system will observe traffic patterns.', 'promptfluid-defense'), $duration_days)
        );
    }
    
    /**
     * Record learning data
     */
    public function record_learning($ip, $user_agent, $fingerprint, $behavioral_data, $score) {
        global $wpdb;
        
        $learning_table = $wpdb->prefix . 'pfdef_learning';
        
        $wpdb->insert($learning_table, array(
            'ip' => $ip,
            'user_agent' => substr($user_agent, 0, 255),
            'fingerprint' => json_encode($fingerprint),
            'behavioral_data' => json_encode($behavioral_data),
            'behavior_score' => $score,
            'timestamp' => current_time('mysql')
        ));
        
        // Check if baseline ready
        $total = $wpdb->get_var("SELECT COUNT(*) FROM {$learning_table}");
        if ($total >= 100) {
            $learning_mode = get_option('pfdef_learning_mode');
            $learning_mode['baseline_ready'] = true;
            update_option('pfdef_learning_mode', $learning_mode);
        }
    }
    
    /**
     * Get adaptive thresholds based on learning
     */
    public function get_adaptive_thresholds() {
        global $wpdb;
        
        $learning_table = $wpdb->prefix . 'pfdef_learning';
        $learning_mode = get_option('pfdef_learning_mode');
        
        if (!$learning_mode['baseline_ready']) {
            return array(
                'block_threshold' => 20,
                'challenge_threshold' => 40,
                'safe_threshold' => 60
            );
        }
        
        // Calculate percentiles from learning data
        $scores = $wpdb->get_col("SELECT behavior_score FROM {$learning_table} ORDER BY behavior_score");
        
        if (count($scores) < 100) {
            return array(
                'block_threshold' => 20,
                'challenge_threshold' => 40,
                'safe_threshold' => 60
            );
        }
        
        $percentile_20 = $scores[intval(count($scores) * 0.2)];
        $percentile_50 = $scores[intval(count($scores) * 0.5)];
        $percentile_80 = $scores[intval(count($scores) * 0.8)];
        
        return array(
            'block_threshold' => max(15, min(30, $percentile_20)),
            'challenge_threshold' => max(35, min(50, $percentile_50)),
            'safe_threshold' => max(55, min(70, $percentile_80))
        );
    }
}