<?php
/**
 * Subscription Management
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Clarity_Subscription {
    
    private $api_client;
    
    public function __construct() {
        $this->api_client = new PromptFluid_Clarity_API_Client();
    }
    
    public function get_status() {
        $status = PromptFluid_Clarity_Database::get_setting('subscription_status', 'inactive');
        $trial_ends = PromptFluid_Clarity_Database::get_setting('trial_ends');
        
        $result = array(
            'status' => $status,
            'plan' => 'free',
            'trial_ends' => $trial_ends,
            'is_trial' => $status === 'trial',
            'is_active' => in_array($status, array('trial', 'active'))
        );
        
        if ($status === 'trial' && !empty($trial_ends) && strtotime($trial_ends) < time()) {
            $result['status'] = 'expired';
            $result['is_trial'] = false;
            $result['is_active'] = false;
            PromptFluid_Clarity_Database::update_setting('subscription_status', 'expired');
        }
        
        return $result;
    }
    
    public function can_scan() {
        $status = $this->get_status();
        
        if (!$status['is_active']) {
            return array('allowed' => false, 'reason' => 'No active subscription');
        }
        
        return array('allowed' => true);
    }
    
    public function start_trial() {
        $current_status = PromptFluid_Clarity_Database::get_setting('subscription_status');
        
        if (in_array($current_status, array('trial', 'active', 'expired'))) {
            return array('success' => false, 'error' => 'Trial not available');
        }
        
        $trial_ends = date('Y-m-d H:i:s', strtotime('+' . PFCLARITY_TRIAL_DAYS . ' days'));
        
        PromptFluid_Clarity_Database::update_setting('subscription_status', 'trial');
        PromptFluid_Clarity_Database::update_setting('trial_started', current_time('mysql'));
        PromptFluid_Clarity_Database::update_setting('trial_ends', $trial_ends);
        
        return array('success' => true);
    }
}
