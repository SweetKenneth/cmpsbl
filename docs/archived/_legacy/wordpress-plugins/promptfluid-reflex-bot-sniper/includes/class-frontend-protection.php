<?php
/**
 * Frontend Protection Layer
 *
 * Handles enqueuing of frontend scripts and styles for bot detection
 *
 * @package PromptFluid_Defense
 */

// If this file is called directly, abort.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Frontend Protection Class
 */
class PromptFluid_Defense_Frontend_Protection {

    /**
     * Initialize the class
     */
    public function __construct() {
        // Enqueue frontend assets
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        
        // Add protection meta tag
        add_action('wp_head', array($this, 'add_meta_tag'), 1);
    }

    /**
     * Enqueue frontend scripts and styles
     */
    public function enqueue_scripts() {
        // Only load if protection is enabled
        $enabled = get_option('pfdef_enable_protection', true);
        if (!$enabled) {
            return;
        }

        // Check if we should skip protection for logged-in admins
        $skip_admin = get_option('pfdef_skip_admin', false);
        if ($skip_admin && current_user_can('manage_options')) {
            return;
        }

        // Enqueue protection JavaScript
        wp_enqueue_script(
            'pfdef-frontend-protection',
            PFDEF_PLUGIN_URL . 'public/js/frontend-protection.js',
            array(),
            PFDEF_VERSION,
            true // Load in footer
        );

        // Enqueue challenge UI styles
        wp_enqueue_style(
            'pfdef-challenge-ui',
            PFDEF_PLUGIN_URL . 'public/css/challenge-ui.css',
            array(),
            PFDEF_VERSION
        );

        // Localize script with config
        wp_localize_script(
            'pfdef-frontend-protection',
            'pfdefConfig',
            array(
                'apiUrl' => rest_url('pfdef/v1/'),
                'nonce' => wp_create_nonce('wp_rest'),
                'siteUrl' => get_site_url(),
                'checkInterval' => apply_filters('pfdef_check_interval', 5000),
                'debug' => defined('WP_DEBUG') && WP_DEBUG
            )
        );
    }

    /**
     * Add protection meta tag to header
     */
    public function add_meta_tag() {
        $enabled = get_option('pfdef_enable_protection', true);
        if (!$enabled) {
            return;
        }

        echo '<meta name="promptfluid-defense" content="active" />' . "\n";
    }

    /**
     * Check if current request should be protected
     *
     * @return bool
     */
    public function should_protect() {
        // Don't protect AJAX requests
        if (wp_doing_ajax()) {
            return false;
        }

        // Don't protect REST API requests
        if (defined('REST_REQUEST') && REST_REQUEST) {
            return false;
        }

        // Don't protect WP-CLI requests
        if (defined('WP_CLI') && WP_CLI) {
            return false;
        }

        // Don't protect cron jobs
        if (defined('DOING_CRON') && DOING_CRON) {
            return false;
        }

        // Check whitelist
        if ($this->is_ip_whitelisted()) {
            return false;
        }

        return true;
    }

    /**
     * Check if current IP is whitelisted
     *
     * @return bool
     */
    private function is_ip_whitelisted() {
        $whitelist = get_option('pfdef_ip_whitelist', '');
        if (empty($whitelist)) {
            return false;
        }

        $client_ip = $this->get_client_ip();
        $whitelist_ips = array_map('trim', explode("\n", $whitelist));

        return in_array($client_ip, $whitelist_ips);
    }

    /**
     * Get client IP address
     *
     * @return string
     */
    private function get_client_ip() {
        $ip_headers = array(
            'HTTP_CF_CONNECTING_IP', // Cloudflare
            'HTTP_X_REAL_IP',
            'HTTP_X_FORWARDED_FOR',
            'HTTP_CLIENT_IP',
            'REMOTE_ADDR'
        );

        foreach ($ip_headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ip = $_SERVER[$header];
                
                // Handle X-Forwarded-For with multiple IPs
                if (strpos($ip, ',') !== false) {
                    $ips = explode(',', $ip);
                    $ip = trim($ips[0]);
                }

                // Validate IP
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }

        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }

    /**
     * Handle protection check via AJAX
     */
    public function ajax_check_request() {
        check_ajax_referer('pfdef_check', 'nonce');

        $fingerprint = isset($_POST['fingerprint']) ? json_decode(stripslashes($_POST['fingerprint']), true) : array();
        $behavioral = isset($_POST['behavioral']) ? json_decode(stripslashes($_POST['behavioral']), true) : array();

        // Perform bot detection
        $detector = new PromptFluid_Defense_Bot_Detector();
        $result = $detector->check_request($fingerprint, $behavioral);

        wp_send_json_success($result);
    }
}
