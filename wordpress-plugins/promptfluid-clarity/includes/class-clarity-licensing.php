<?php
/**
 * Licensing Management
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Clarity_Licensing {
    
    private $api_client;
    
    public function __construct() {
        $this->api_client = new PromptFluid_Clarity_API_Client();
    }
    
    /**
     * Validate license via Nexus
     */
    public function validate_license($license_key) {
        if (empty($license_key)) {
            return ['valid' => false, 'error' => 'License key required'];
        }
        
        // Check cache first
        $cached = get_transient('pfclarity_license_' . md5($license_key));
        if ($cached !== false) {
            return $cached;
        }
        
        // Validate via Nexus
        $result = $this->api_client->request_nexus(
            "Validate license: {$license_key}",
            "Check if this license is valid, active, and not expired.",
            ['license_key' => $license_key, 'domain' => get_site_url()]
        );
        
        $validation = [
            'valid' => $result['success'] ?? false,
            'tier' => $this->extract_tier($result),
            'expires' => time() + (30 * DAY_IN_SECONDS)
        ];
        
        // Cache for 24 hours
        set_transient('pfclarity_license_' . md5($license_key), $validation, DAY_IN_SECONDS);
        
        return $validation;
    }
    
    private function extract_tier($result) {
        // Default to trial if validation unclear
        return 'trial';
    }
    
    /**
     * Check if feature is available
     */
    public function can_use_feature($feature) {
        $license_key = get_option('pfclarity_api_key', '');
        $license = $this->validate_license($license_key);
        
        if (!$license['valid']) {
            return false;
        }
        
        $tier_features = [
            'trial' => ['basic_scan', 'manual_fix'],
            'starter' => ['basic_scan', 'manual_fix', 'ai_suggestions'],
            'pro' => ['basic_scan', 'manual_fix', 'ai_suggestions', 'auto_fix', 'scheduled_scans'],
            'enterprise' => ['basic_scan', 'manual_fix', 'ai_suggestions', 'auto_fix', 'scheduled_scans', 'api_access', 'white_label']
        ];
        
        $tier = $license['tier'] ?? 'trial';
        $allowed = $tier_features[$tier] ?? [];
        
        return in_array($feature, $allowed);
    }
    
    /**
     * Check license status
     */
    public function check_license() {
        $license_key = get_option('pfclarity_api_key', '');
        
        if (empty($license_key)) {
            return $this->get_trial_status();
        }
        
        $license = $this->validate_license($license_key);
        
        return [
            'status' => $license['valid'] ? 'active' : 'invalid',
            'plan' => $license['tier'] ?? 'trial',
            'expires_at' => $license['expires'] ?? null
        ];
    }
    
    /**
     * Get license status
     */
    public function get_license_status() {
        return $this->check_license();
    }
    
    /**
     * Get trial status
     */
    private function get_trial_status() {
        $activated_at = get_option('pfclarity_activated_at');
        
        if (!$activated_at) {
            return [
                'status' => 'trial',
                'days_remaining' => PFCLARITY_TRIAL_DAYS,
                'plan' => 'trial'
            ];
        }
        
        $activated_timestamp = strtotime($activated_at);
        $days_elapsed = floor((time() - $activated_timestamp) / DAY_IN_SECONDS);
        $days_remaining = max(0, PFCLARITY_TRIAL_DAYS - $days_elapsed);
        
        return [
            'status' => $days_remaining > 0 ? 'trial' : 'expired',
            'days_remaining' => $days_remaining,
            'plan' => 'trial'
        ];
    }
    
    /**
     * Activate license
     */
    public function activate_license($license_key) {
        update_option('pfclarity_api_key', sanitize_text_field($license_key));
        
        PromptFluid_Clarity_Logger::log('License activated', 'info', ['key' => substr($license_key, 0, 8) . '...']);
        
        return true;
    }
    
    /**
     * Deactivate license
     */
    public function deactivate_license() {
        delete_option('pfclarity_api_key');
        
        PromptFluid_Clarity_Logger::log('License deactivated', 'info');
        
        return true;
    }
}
