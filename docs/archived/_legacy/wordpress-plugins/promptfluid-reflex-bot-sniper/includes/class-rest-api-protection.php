<?php
/**
 * REST API Protection Endpoint
 *
 * Handles the /check-request endpoint for frontend bot detection
 *
 * @package PromptFluid_Defense
 */

// If this file is called directly, abort.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST API Protection Class
 */
class PromptFluid_Defense_REST_Protection {

    /**
     * Register REST API routes
     */
    public function register_routes() {
        register_rest_route('pfdef/v1', '/check-request', array(
            'methods' => 'POST',
            'callback' => array($this, 'check_request'),
            'permission_callback' => array($this, 'verify_request'),
        ));
    }

    /**
     * Verify the request has valid nonce
     *
     * @param WP_REST_Request $request
     * @return bool
     */
    public function verify_request($request) {
        $nonce = $request->get_header('X-WP-Nonce');
        if (empty($nonce)) {
            return false;
        }

        return wp_verify_nonce($nonce, 'wp_rest');
    }

    /**
     * Check incoming request for bot activity
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function check_request($request) {
        $params = $request->get_json_params();

        $session_id = sanitize_text_field($params['sessionId'] ?? '');
        $fingerprint = $params['fingerprint'] ?? array();
        $behavioral = $params['behavioral'] ?? array();
        $page = $params['page'] ?? array();

        // Get client IP
        $client_ip = $this->get_client_ip();

        // Perform bot detection
        $detector = new PromptFluid_Defense_Bot_Detector();
        $threat_scorer = new PromptFluid_Defense_Threat_Scorer();

        // Calculate threat score
        $threat_data = $threat_scorer->calculate_threat_score();
        $threat_score = $threat_data['threat_score'];
        $action = $threat_data['action'];

        // Log the detection event
        $logger = new PromptFluid_Defense_Logger();
        $logger->log_event(array(
            'session_id' => $session_id,
            'ip_address' => $client_ip,
            'threat_score' => $threat_score,
            'action' => $action,
            'fingerprint' => json_encode($fingerprint),
            'behavioral' => json_encode($behavioral),
            'page_url' => sanitize_text_field($page['url'] ?? ''),
            'user_agent' => sanitize_text_field($_SERVER['HTTP_USER_AGENT'] ?? '')
        ));

        // Prepare response
        $response = array(
            'action' => $action,
            'score' => $threat_score,
            'sessionId' => $session_id,
            'message' => $this->get_action_message($action),
        );

        // Add challenge details if needed
        if ($action === 'challenge') {
            $response['challengeType'] = 'captcha';
            $response['challengeToken'] = wp_generate_password(32, false);
        }

        return new WP_REST_Response($response, 200);
    }

    /**
     * Get appropriate message for action
     *
     * @param string $action
     * @return string
     */
    private function get_action_message($action) {
        switch ($action) {
            case 'allow':
                return __('Access granted', 'promptfluid-defense');
            
            case 'challenge':
                return __('Please complete verification to continue', 'promptfluid-defense');
            
            case 'block':
                return __('Access denied due to suspicious activity', 'promptfluid-defense');
            
            default:
                return __('Unknown action', 'promptfluid-defense');
        }
    }

    /**
     * Get client IP address
     *
     * @return string
     */
    private function get_client_ip() {
        $ip_headers = array(
            'HTTP_CF_CONNECTING_IP',
            'HTTP_X_REAL_IP',
            'HTTP_X_FORWARDED_FOR',
            'HTTP_CLIENT_IP',
            'REMOTE_ADDR'
        );

        foreach ($ip_headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ip = $_SERVER[$header];
                
                if (strpos($ip, ',') !== false) {
                    $ips = explode(',', $ip);
                    $ip = trim($ips[0]);
                }

                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }

        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }
}
