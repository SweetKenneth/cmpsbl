<?php
/**
 * API Client - Handles communication with PromptFluid Clarity API
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Clarity_API_Client {
    
    private $api_base;
    private $api_key;
    
    public function __construct() {
        $this->api_base = PFCLARITY_API_BASE;
        $this->api_key = PromptFluid_Clarity_Database::get_setting('api_key');
    }
    
    public function request($method, $endpoint, $data = array()) {
        if (empty($this->api_key)) {
            return array('success' => false, 'error' => 'API key not configured');
        }
        
        $url = $this->api_base . $endpoint;
        
        $args = array(
            'method' => $method,
            'headers' => array(
                'Content-Type' => 'application/json',
                'x-api-key' => $this->api_key
            ),
            'timeout' => PFCLARITY_SCAN_TIMEOUT
        );
        
        if ($method === 'POST' && !empty($data)) {
            $args['body'] = json_encode($data);
        } elseif ($method === 'GET' && !empty($data)) {
            $url = add_query_arg($data, $url);
        }
        
        $response = wp_remote_request($url, $args);
        
        if (is_wp_error($response)) {
            return array('success' => false, 'error' => $response->get_error_message());
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if ($status_code >= 400) {
            return array('success' => false, 'error' => isset($data['error']) ? $data['error'] : 'API request failed');
        }
        
        return array('success' => true, 'data' => $data);
    }
}
