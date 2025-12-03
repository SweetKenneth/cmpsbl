<?php
/**
 * Threat scoring engine - combines all detection signals.
 *
 * @package PromptFluid_Defense
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Defense_Threat_Scorer {
    
    private $bot_detector;
    private $behavioral_analyzer;
    private $logger;
    
    /**
     * Constructor.
     */
    public function __construct() {
        $this->bot_detector = new PromptFluid_Defense_Bot_Detector();
        $this->behavioral_analyzer = new PromptFluid_Defense_Behavioral_Analyzer();
        $this->logger = new PromptFluid_Defense_Logger();
    }
    
    /**
     * Calculate comprehensive threat score (0-100).
     *
     * @return array Complete threat assessment
     */
    public function calculate_threat_score() {
        $ip = $this->get_client_ip();
        
        // Check whitelist first
        if ($this->bot_detector->is_whitelisted($ip)) {
            return array(
                'threat_score' => 0,
                'action' => 'allow',
                'reason' => 'IP whitelisted',
                'details' => array()
            );
        }
        
        // Gather all detection signals
        $bot_result = $this->bot_detector->detect();
        $behavioral_result = $this->behavioral_analyzer->analyze();
        $ip_reputation = $this->check_ip_reputation($ip);
        
        // Weight different signals
        $weights = array(
            'bot_detection' => 0.4,
            'behavioral' => 0.3,
            'ip_reputation' => 0.3
        );
        
        // Calculate weighted score
        $threat_score = ($bot_result['confidence'] * $weights['bot_detection']) +
                       ($behavioral_result['confidence'] * $weights['behavioral']) +
                       ($ip_reputation['score'] * $weights['ip_reputation']);
        
        // Cap at 100
        $threat_score = min($threat_score, 100);
        
        // Determine action based on settings
        $action = $this->determine_action($threat_score);
        
        // Build detailed result
        $details = array(
            'bot_detection' => $bot_result,
            'behavioral' => $behavioral_result,
            'ip_reputation' => $ip_reputation
        );
        
        $threat_indicators = array_merge(
            $bot_result['is_bot'] ? array($bot_result['threat_type']) : array(),
            $behavioral_result['threat_indicators']
        );
        
        // Log the threat
        if ($threat_score >= 30) {
            $this->logger->log_threat(array(
                'ip' => $ip,
                'threat_score' => $threat_score,
                'action' => $action,
                'threat_type' => $bot_result['threat_type'],
                'details' => wp_json_encode($details),
                'user_agent' => isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '',
                'url' => isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : ''
            ));
        }
        
        return array(
            'threat_score' => round($threat_score, 2),
            'action' => $action,
            'reason' => $this->get_action_reason($threat_score, $threat_indicators),
            'details' => $details,
            'threat_indicators' => $threat_indicators
        );
    }
    
    /**
     * Determine action based on threat score and settings.
     */
    private function determine_action($threat_score) {
        $settings = get_option('promptfluid_defense_settings');
        $mode = isset($settings['protection_mode']) ? $settings['protection_mode'] : 'monitor';
        
        if ($mode === 'monitor') {
            return 'allow'; // Just log, don't block
        }
        
        // Get sensitivity thresholds
        $sensitivity = isset($settings['sensitivity']) ? $settings['sensitivity'] : 'medium';
        
        $block_threshold = 70;
        $challenge_threshold = 50;
        
        if ($sensitivity === 'high') {
            $block_threshold = 50;
            $challenge_threshold = 30;
        } elseif ($sensitivity === 'low') {
            $block_threshold = 85;
            $challenge_threshold = 70;
        }
        
        if ($threat_score >= $block_threshold) {
            return $mode === 'block' ? 'block' : 'challenge';
        } elseif ($threat_score >= $challenge_threshold) {
            return 'challenge';
        }
        
        return 'allow';
    }
    
    /**
     * Get human-readable action reason.
     */
    private function get_action_reason($threat_score, $indicators) {
        if ($threat_score < 30) {
            return 'Normal user behavior';
        }
        
        if (empty($indicators)) {
            return 'Elevated threat score: ' . round($threat_score);
        }
        
        return implode(', ', array_slice($indicators, 0, 3));
    }
    
    /**
     * Check IP reputation from historical data.
     */
    private function check_ip_reputation($ip) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'pfdef_threat_log';
        
        // Get historical data for this IP
        $history = $wpdb->get_results($wpdb->prepare(
            "SELECT action, threat_score FROM $table_name 
             WHERE ip = %s 
             AND created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
             ORDER BY created_at DESC 
             LIMIT 20",
            $ip
        ));
        
        if (empty($history)) {
            return array(
                'score' => 0,
                'history_count' => 0,
                'avg_threat_score' => 0
            );
        }
        
        // Calculate reputation score
        $blocked_count = 0;
        $total_score = 0;
        
        foreach ($history as $record) {
            if ($record->action === 'block') {
                $blocked_count++;
            }
            $total_score += $record->threat_score;
        }
        
        $avg_threat_score = $total_score / count($history);
        $block_ratio = $blocked_count / count($history);
        
        // Higher historical threat = higher reputation score
        $reputation_score = ($avg_threat_score * 0.6) + ($block_ratio * 100 * 0.4);
        
        return array(
            'score' => min($reputation_score, 100),
            'history_count' => count($history),
            'avg_threat_score' => round($avg_threat_score, 2),
            'block_ratio' => round($block_ratio, 2)
        );
    }
    
    /**
     * Get the client's IP address.
     */
    private function get_client_ip() {
        $ip_keys = array(
            'HTTP_CF_CONNECTING_IP',
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'REMOTE_ADDR'
        );
        
        foreach ($ip_keys as $key) {
            if (isset($_SERVER[$key])) {
                $ip = $_SERVER[$key];
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
                // Handle comma-separated IPs (X-Forwarded-For)
                if (strpos($ip, ',') !== false) {
                    $ips = explode(',', $ip);
                    $ip = trim($ips[0]);
                    if (filter_var($ip, FILTER_VALIDATE_IP)) {
                        return $ip;
                    }
                }
            }
        }
        
        return '0.0.0.0';
    }
}
