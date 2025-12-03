<?php
/**
 * WordPress integration hooks for login and comment protection.
 *
 * @package PromptFluid_Defense
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Defense_WP_Integration {
    
    private $threat_scorer;
    private $learning;
    
    public function __construct() {
        require_once PFDEF_PLUGIN_DIR . 'includes/class-threat-scorer.php';
        require_once PFDEF_PLUGIN_DIR . 'includes/class-smart-learning.php';
        
        $this->threat_scorer = new PromptFluid_Defense_Threat_Scorer();
        $this->learning = new PromptFluid_Defense_Smart_Learning();
    }
    
    /**
     * Check login attempts using comprehensive threat scoring.
     */
    public function check_login_attempt($user, $username, $password) {
        // Skip if settings disabled
        $settings = get_option('promptfluid_defense_settings');
        if (!isset($settings['enabled']) || $settings['enabled'] !== 'on') {
            return $user;
        }
        
        // Calculate threat score
        $threat_result = $this->threat_scorer->calculate_threat_score();
        
        // Record pattern for learning
        $this->learning->record_pattern(array(
            'type' => 'login_attempt',
            'data' => array(
                'username' => $username,
                'threat_details' => $threat_result['details']
            ),
            'threat_score' => $threat_result['threat_score'],
            'action' => $threat_result['action']
        ));
        
        // Handle based on action
        if ($threat_result['action'] === 'block') {
            return new WP_Error(
                'threat_detected',
                sprintf(
                    __('<strong>ERROR</strong>: %s. If you believe this is an error, please contact the site administrator.', 'promptfluid-defense'),
                    $threat_result['reason']
                )
            );
        } elseif ($threat_result['action'] === 'challenge') {
            // For challenge mode, we'll still allow but log for manual review
            error_log('PFDEF: Challenge required for login attempt. Score: ' . $threat_result['threat_score']);
        }
        
        return $user;
    }
    
    /**
     * Check comment submissions using comprehensive threat scoring.
     */
    public function check_comment_submission($commentdata) {
        // Skip if settings disabled
        $settings = get_option('promptfluid_defense_settings');
        if (!isset($settings['enabled']) || $settings['enabled'] !== 'on') {
            return $commentdata;
        }
        
        // Skip for logged-in users
        if (is_user_logged_in()) {
            return $commentdata;
        }
        
        // Calculate threat score
        $threat_result = $this->threat_scorer->calculate_threat_score();
        
        // Record pattern for learning
        $this->learning->record_pattern(array(
            'type' => 'comment_submission',
            'data' => array(
                'comment_content' => substr($commentdata['comment_content'], 0, 100),
                'threat_details' => $threat_result['details']
            ),
            'threat_score' => $threat_result['threat_score'],
            'action' => $threat_result['action']
        ));
        
        // Handle based on action
        if ($threat_result['action'] === 'block') {
            wp_die(
                sprintf(
                    __('<strong>ERROR</strong>: %s. If you believe this is an error, please contact the site administrator.', 'promptfluid-defense'),
                    $threat_result['reason']
                ),
                __('Comment Rejected', 'promptfluid-defense'),
                array('response' => 403, 'back_link' => true)
            );
        }
        
        return $commentdata;
    }
    
    /**
     * Get client IP address.
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
