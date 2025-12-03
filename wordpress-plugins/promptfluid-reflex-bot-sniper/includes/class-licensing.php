<?php
/**
 * Licensing and Tier Management
 * 
 * Manages PromptFluid Reflex licensing tiers and feature gating
 *
 * @package PromptFluid_Reflex
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Defense_Licensing {
    
    /**
     * Pricing tiers configuration
     */
    const TIERS = array(
        'lite' => array(
            'name' => 'Lite',
            'price' => 0,
            'billing' => 'free',
            'features' => array(
                'behavioral_detection',
                'fingerprint_detection',
                'basic_ai_learning',
                'analytics',
                'heatmap',
                'honeypot_traps',
                'plugin_compatibility'
            )
        ),
        'pro' => array(
            'name' => 'Pro',
            'price' => 19,
            'billing' => 'monthly',
            'annual_price' => 149,
            'features' => array(
                'behavioral_detection',
                'fingerprint_detection',
                'basic_ai_learning',
                'analytics',
                'heatmap',
                'honeypot_traps',
                'plugin_compatibility',
                'realtime_blocking',
                'firewall',
                'login_protection',
                'rate_limiting',
                'geo_blocking',
                'file_integrity',
                'malware_scan_weekly',
                'brain_integration'
            )
        ),
        'complete' => array(
            'name' => 'Complete',
            'price' => 39,
            'billing' => 'monthly',
            'annual_price' => 349,
            'features' => array(
                'behavioral_detection',
                'fingerprint_detection',
                'basic_ai_learning',
                'analytics',
                'heatmap',
                'honeypot_traps',
                'plugin_compatibility',
                'realtime_blocking',
                'firewall',
                'login_protection',
                'rate_limiting',
                'geo_blocking',
                'file_integrity',
                'malware_scan_weekly',
                'brain_integration',
                'auto_remediation',
                'red_team_simulator',
                'brain_rule_reflection',
                'stealth_layer',
                'ai_config_tuning',
                'malware_scan_daily'
            )
        ),
        'sentinel' => array(
            'name' => 'Sentinel',
            'price' => 79,
            'billing' => 'monthly',
            'features' => array(
                'behavioral_detection',
                'fingerprint_detection',
                'basic_ai_learning',
                'analytics',
                'heatmap',
                'honeypot_traps',
                'plugin_compatibility',
                'realtime_blocking',
                'firewall',
                'login_protection',
                'rate_limiting',
                'geo_blocking',
                'file_integrity',
                'malware_scan_weekly',
                'brain_integration',
                'auto_remediation',
                'red_team_simulator',
                'brain_rule_reflection',
                'stealth_layer',
                'ai_config_tuning',
                'malware_scan_daily',
                'managed_service',
                'priority_updates',
                'red_team_access',
                'multi_site',
                'white_label'
            )
        )
    );
    
    /**
     * Get current license tier
     */
    public static function get_current_tier() {
        $license_data = get_option('pfdef_license_data', array(
            'tier' => 'lite',
            'status' => 'active',
            'expires' => null
        ));
        
        // Check if license is expired
        if (isset($license_data['expires']) && $license_data['expires'] && strtotime($license_data['expires']) < time()) {
            $license_data['tier'] = 'lite';
            $license_data['status'] = 'expired';
            update_option('pfdef_license_data', $license_data);
        }
        
        return $license_data['tier'];
    }
    
    /**
     * Get tier details
     */
    public static function get_tier_info($tier = null) {
        if (!$tier) {
            $tier = self::get_current_tier();
        }
        
        return isset(self::TIERS[$tier]) ? self::TIERS[$tier] : self::TIERS['lite'];
    }
    
    /**
     * Check if a feature is available in current tier
     */
    public static function has_feature($feature) {
        $tier = self::get_current_tier();
        $tier_info = self::get_tier_info($tier);
        
        return in_array($feature, $tier_info['features']);
    }
    
    /**
     * Get required tier for a feature
     */
    public static function get_required_tier($feature) {
        foreach (self::TIERS as $tier_key => $tier_data) {
            if (in_array($feature, $tier_data['features'])) {
                return $tier_key;
            }
        }
        return 'sentinel';
    }
    
    /**
     * Activate license
     */
    public static function activate_license($license_key, $email = '') {
        // Make API call to PromptFluid Core to validate license
        $response = wp_remote_post('https://www.promptfluid.com/api/defense/license/activate', array(
            'timeout' => 15,
            'body' => array(
                'license_key' => $license_key,
                'email' => $email,
                'domain' => home_url(),
                'version' => PFDEF_VERSION
            )
        ));
        
        if (is_wp_error($response)) {
            return array(
                'success' => false,
                'message' => __('Could not connect to license server. Please try again.', 'promptfluid-defense')
            );
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        if (!isset($body['success']) || !$body['success']) {
            return array(
                'success' => false,
                'message' => $body['message'] ?? __('Invalid license key.', 'promptfluid-defense')
            );
        }
        
        // Store license data
        $license_data = array(
            'key' => $license_key,
            'email' => $email,
            'tier' => $body['tier'],
            'status' => 'active',
            'expires' => $body['expires'] ?? null,
            'activated_at' => current_time('mysql')
        );
        
        update_option('pfdef_license_data', $license_data);
        
        return array(
            'success' => true,
            'message' => sprintf(
                __('License activated successfully! You now have access to %s features.', 'promptfluid-defense'),
                self::TIERS[$body['tier']]['name']
            ),
            'tier' => $body['tier']
        );
    }
    
    /**
     * Deactivate license
     */
    public static function deactivate_license() {
        $license_data = get_option('pfdef_license_data');
        
        if (!$license_data || !isset($license_data['key'])) {
            return array(
                'success' => false,
                'message' => __('No active license found.', 'promptfluid-defense')
            );
        }
        
        // Call API to deactivate
        wp_remote_post('https://www.promptfluid.com/api/defense/license/deactivate', array(
            'timeout' => 15,
            'body' => array(
                'license_key' => $license_data['key'],
                'domain' => home_url()
            )
        ));
        
        // Reset to Lite tier
        $license_data['tier'] = 'lite';
        $license_data['status'] = 'inactive';
        update_option('pfdef_license_data', $license_data);
        
        return array(
            'success' => true,
            'message' => __('License deactivated successfully.', 'promptfluid-defense')
        );
    }
    
    /**
     * Check license status (called daily via cron)
     */
    public static function check_license_status() {
        $license_data = get_option('pfdef_license_data');
        
        if (!$license_data || $license_data['tier'] === 'lite') {
            return; // Free tier, no need to check
        }
        
        $response = wp_remote_post('https://www.promptfluid.com/api/defense/license/status', array(
            'timeout' => 15,
            'body' => array(
                'license_key' => $license_data['key'],
                'domain' => home_url()
            )
        ));
        
        if (is_wp_error($response)) {
            return; // Silent fail, don't downgrade on network issues
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        if (isset($body['status']) && $body['status'] !== 'active') {
            // License is no longer valid, downgrade to Lite
            $license_data['tier'] = 'lite';
            $license_data['status'] = $body['status'];
            update_option('pfdef_license_data', $license_data);
        }
    }
    
    /**
     * Get upgrade URL for a specific tier
     */
    public static function get_upgrade_url($tier = 'pro') {
        $current_tier = self::get_current_tier();
        $site_url = urlencode(home_url());
        
        return "https://www.promptfluid.com/products/defense/upgrade?from={$current_tier}&to={$tier}&site={$site_url}";
    }
    
    /**
     * Log tier conversion event to telemetry
     */
    public static function log_tier_conversion($from_tier, $to_tier) {
        // Send anonymous telemetry to PromptFluid Brain
        wp_remote_post('https://www.promptfluid.com/api/defense/telemetry', array(
            'timeout' => 5,
            'blocking' => false, // Async
            'body' => array(
                'event' => 'tier_conversion',
                'from_tier' => $from_tier,
                'to_tier' => $to_tier,
                'version' => PFDEF_VERSION,
                'timestamp' => current_time('mysql')
            )
        ));
    }
    
    /**
     * Get trial status
     */
    public static function get_trial_status() {
        $trial_data = get_option('pfdef_trial_data');
        
        if (!$trial_data) {
            return array(
                'active' => false,
                'days_remaining' => 0
            );
        }
        
        $started = strtotime($trial_data['started']);
        $expires = $started + (3 * DAY_IN_SECONDS); // 3-day trial
        $now = time();
        
        if ($now > $expires) {
            return array(
                'active' => false,
                'days_remaining' => 0,
                'expired' => true
            );
        }
        
        $days_remaining = ceil(($expires - $now) / DAY_IN_SECONDS);
        
        return array(
            'active' => true,
            'days_remaining' => $days_remaining,
            'tier' => $trial_data['tier']
        );
    }
    
    /**
     * Start trial
     */
    public static function start_trial($tier = 'pro') {
        if (!in_array($tier, array('pro', 'complete', 'sentinel'))) {
            return false;
        }
        
        // Check if trial was already used
        $trial_history = get_option('pfdef_trial_history', array());
        if (!empty($trial_history)) {
            return false; // Only one trial per site
        }
        
        $trial_data = array(
            'tier' => $tier,
            'started' => current_time('mysql')
        );
        
        update_option('pfdef_trial_data', $trial_data);
        update_option('pfdef_trial_history', array($trial_data));
        
        // Temporarily set license to trial tier
        $license_data = get_option('pfdef_license_data', array());
        $license_data['tier'] = $tier;
        $license_data['status'] = 'trial';
        update_option('pfdef_license_data', $license_data);
        
        return true;
    }
}
