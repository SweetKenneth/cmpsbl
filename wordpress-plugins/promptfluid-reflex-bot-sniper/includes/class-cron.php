<?php
/**
 * Cron Job Management - Handles scheduled scans
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Clarity_Cron {
    
    const HOOK_NAME = 'pfclarity_scheduled_scan';
    
    public function __construct() {
        add_action(self::HOOK_NAME, array($this, 'run_scheduled_scan'));
    }
    
    /**
     * Schedule cron jobs
     */
    public static function schedule_jobs() {
        if (!wp_next_scheduled(self::HOOK_NAME)) {
            $frequency = PromptFluid_Clarity_Database::get_setting('scan_frequency', 'weekly');
            wp_schedule_event(time(), $frequency, self::HOOK_NAME);
        }
    }
    
    /**
     * Clear scheduled jobs
     */
    public static function clear_jobs() {
        $timestamp = wp_next_scheduled(self::HOOK_NAME);
        if ($timestamp) {
            wp_unschedule_event($timestamp, self::HOOK_NAME);
        }
    }
    
    /**
     * Run scheduled scan
     */
    public function run_scheduled_scan() {
        // Check if auto-scan is enabled
        $auto_scan = PromptFluid_Clarity_Database::get_setting('auto_scan_enabled', '0');
        
        if ($auto_scan !== '1') {
            return;
        }
        
        // Check subscription
        $api_client = new PromptFluid_Clarity_API_Client();
        $scanner = new PromptFluid_Clarity_Scanner($api_client);
        $subscription = new PromptFluid_Clarity_Subscription($api_client);
        
        if (!$subscription->can_scan()) {
            error_log('PromptFluid Clarity: Scheduled scan skipped - no active subscription');
            return;
        }
        
        // Run the scan
        $result = $scanner->scan_site(get_site_url());
        
        if (is_wp_error($result)) {
            error_log('PromptFluid Clarity scheduled scan failed: ' . $result->get_error_message());
        }
    }
    
    /**
     * Update scan frequency
     */
    public static function update_frequency($frequency) {
        $valid = array('daily', 'weekly', 'monthly');
        
        if (!in_array($frequency, $valid)) {
            return false;
        }
        
        self::clear_jobs();
        PromptFluid_Clarity_Database::update_setting('scan_frequency', $frequency);
        self::schedule_jobs();
        
        return true;
    }
}
