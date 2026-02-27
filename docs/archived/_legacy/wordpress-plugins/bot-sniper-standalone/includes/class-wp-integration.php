<?php
/**
 * WordPress Integration
 * 
 * Hooks into WordPress login and comment systems for protection
 *
 * @package BotSniper
 */

namespace BotSniper;

if (!defined('ABSPATH')) exit;

class WPIntegration {
    
    private $threat_scorer;
    
    public function __construct() {
        $this->threat_scorer = new ThreatScorer();
        
        // Hook into login
        add_filter('authenticate', array($this, 'check_login_attempt'), 30, 3);
        
        // Hook into comments
        add_filter('preprocess_comment', array($this, 'check_comment_submission'), 1);
    }
    
    /**
     * Check login attempts using comprehensive threat scoring
     */
    public function check_login_attempt($user, $username, $password) {
        // Skip if settings disabled
        $settings = get_option('bot_sniper_settings');
        if (!isset($settings['detection_enabled']) || !$settings['detection_enabled']) {
            return $user;
        }
        
        // Calculate threat score
        $threat_result = $this->threat_scorer->calculate_threat_score();
        
        // Handle based on action
        if ($threat_result['action'] === 'block') {
            return new \WP_Error(
                'threat_detected',
                sprintf(
                    __('<strong>ERROR</strong>: %s. If you believe this is an error, please contact the site administrator.', 'bot-sniper'),
                    $threat_result['reason']
                )
            );
        } elseif ($threat_result['action'] === 'challenge') {
            // For challenge mode, we'll still allow but log for manual review
            error_log('Bot Sniper: Challenge required for login attempt. Score: ' . $threat_result['threat_score']);
        }
        
        return $user;
    }
    
    /**
     * Check comment submissions using comprehensive threat scoring
     */
    public function check_comment_submission($commentdata) {
        // Skip if settings disabled
        $settings = get_option('bot_sniper_settings');
        if (!isset($settings['detection_enabled']) || !$settings['detection_enabled']) {
            return $commentdata;
        }
        
        // Skip for logged-in users
        if (is_user_logged_in()) {
            return $commentdata;
        }
        
        // Calculate threat score
        $threat_result = $this->threat_scorer->calculate_threat_score();
        
        // Handle based on action
        if ($threat_result['action'] === 'block') {
            wp_die(
                sprintf(
                    __('<strong>ERROR</strong>: %s. If you believe this is an error, please contact the site administrator.', 'bot-sniper'),
                    $threat_result['reason']
                ),
                __('Comment Rejected', 'bot-sniper'),
                array('response' => 403, 'back_link' => true)
            );
        }
        
        return $commentdata;
    }
}
