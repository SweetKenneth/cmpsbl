<?php
/**
 * API Client - Routes to PromptFluid Nexus only
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Clarity_API_Client {
    
    private $nexus_api;
    private $brain_endpoint;
    private $nexus_router;
    
    public function __construct() {
        $this->nexus_api = PF_NEXUS_API;
        $this->brain_endpoint = PF_BRAIN_ENDPOINT;
        $this->nexus_router = PF_NEXUS_ROUTER;
    }
    
    /**
     * Make request to Nexus router
     */
    public function request_nexus($prompt, $system_prompt = null, $metadata = []) {
        $payload = [
            'prompt' => $prompt,
            'systemPrompt' => $system_prompt,
            'metadata' => array_merge($metadata, [
                'source' => 'clarity',
                'version' => PFCLARITY_VERSION
            ])
        ];
        
        $response = wp_remote_post($this->nexus_router, [
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . PFCLARITY_API_KEY
            ],
            'body' => json_encode($payload),
            'timeout' => PFCLARITY_SCAN_TIMEOUT
        ]);
        
        if (is_wp_error($response)) {
            PromptFluid_Clarity_Logger::log('Nexus request failed: ' . $response->get_error_message(), 'error');
            return ['success' => false, 'error' => $response->get_error_message()];
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        if (!isset($body['success']) || !$body['success']) {
            PromptFluid_Clarity_Logger::log('Nexus returned error', 'error', $body);
            return ['success' => false, 'error' => $body['error'] ?? 'Unknown error'];
        }
        
        return $body;
    }
    
    /**
     * Send learning data to Brain
     */
    public function send_to_brain($event_type, $data) {
        $payload = [
            'event_type' => $event_type,
            'module' => 'clarity',
            'data' => $data,
            'timestamp' => current_time('mysql')
        ];
        
        $response = wp_remote_post($this->brain_endpoint, [
            'headers' => [
                'Content-Type' => 'application/json',
                'x-brain-key' => PFCLARITY_SERVICE_KEY
            ],
            'body' => json_encode($payload),
            'timeout' => 30
        ]);
        
        if (is_wp_error($response)) {
            PromptFluid_Clarity_Logger::log('Brain request failed: ' . $response->get_error_message(), 'error');
            return false;
        }
        
        return true;
    }
    
    /**
     * Health check
     */
    public function health_check() {
        $response = wp_remote_get($this->nexus_api . '/health', [
            'timeout' => 10
        ]);
        
        if (is_wp_error($response)) {
            return false;
        }
        
        return wp_remote_retrieve_response_code($response) === 200;
    }
}
