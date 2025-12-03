<?php
/**
 * Scanner Class - Handles accessibility scanning operations
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Clarity_Scanner {
    
    private $api_client;
    
    public function __construct() {
        $this->api_client = new PromptFluid_Clarity_API_Client();
    }
    
    public function scan_site($site_url = null) {
        if (!$site_url) {
            $site_url = get_site_url();
        }
        
        $api_key = PromptFluid_Clarity_Database::get_setting('api_key');
        if (empty($api_key)) {
            return array('success' => false, 'error' => 'API key not configured');
        }
        
        $scan_id = 'scan_' . uniqid() . '_' . time();
        
        PromptFluid_Clarity_Database::save_scan(array(
            'scan_id' => $scan_id,
            'site_url' => $site_url,
            'status' => 'queued'
        ));
        
        $response = $this->api_client->request('POST', '/pf-clarity-api/scan', array(
            'site_url' => $site_url,
            'scan_id' => $scan_id,
            'options' => array(
                'max_pages' => PFCLARITY_MAX_PAGES_PER_SCAN,
                'wcag_level' => 'AA'
            )
        ));
        
        if (!$response['success']) {
            PromptFluid_Clarity_Database::update_scan($scan_id, array('status' => 'failed'));
            return $response;
        }
        
        PromptFluid_Clarity_Database::update_scan($scan_id, array('status' => 'processing'));
        PromptFluid_Clarity_Database::update_setting('last_scan_id', $scan_id);
        
        return array('success' => true, 'scan_id' => $scan_id, 'status' => 'processing');
    }
    
    public function get_scan_results($scan_id = null) {
        if (!$scan_id) {
            $scan_id = PromptFluid_Clarity_Database::get_setting('last_scan_id');
        }
        
        if (empty($scan_id)) {
            return array('success' => false, 'error' => 'No scan ID');
        }
        
        $local_scan = PromptFluid_Clarity_Database::get_scan($scan_id);
        if ($local_scan && $local_scan['status'] === 'completed') {
            return array('success' => true, 'scan' => $local_scan);
        }
        
        $response = $this->api_client->request('GET', '/pf-clarity-api/results', array('scan_id' => $scan_id));
        
        if (!$response['success']) {
            return $response;
        }
        
        $api_data = $response['data'];
        if ($api_data['status'] === 'completed') {
            PromptFluid_Clarity_Database::update_scan($scan_id, array(
                'status' => 'completed',
                'total_issues' => $api_data['total_issues'],
                'critical_issues' => $api_data['critical_issues'],
                'compliance_score' => $api_data['compliance_score'],
                'pages_scanned' => $api_data['pages_scanned'],
                'scan_data' => json_encode($api_data),
                'completed_at' => current_time('mysql')
            ));
        }
        
        return array('success' => true, 'scan' => PromptFluid_Clarity_Database::get_scan($scan_id));
    }
}
