<?php
/**
 * PromptFluid Clarity Admin Controller
 * Manages admin interface and AJAX handlers
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Clarity_Admin {
    
    private $scanner;
    private $subscription;
    private $api_client;
    
    public function __construct() {
        $this->api_client = new PromptFluid_Clarity_API_Client();
        $this->scanner = new PromptFluid_Clarity_Scanner();
        $this->subscription = new PromptFluid_Clarity_Subscription();
        
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
        
        // AJAX handlers
        add_action('wp_ajax_pfclarity_scan_site', array($this, 'ajax_scan_site'));
        add_action('wp_ajax_pfclarity_get_results', array($this, 'ajax_get_scan_results'));
        add_action('wp_ajax_pfclarity_start_trial', array($this, 'ajax_start_trial'));
        add_action('wp_ajax_pfclarity_save_settings', array($this, 'ajax_save_settings'));
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_menu_page(
            'PromptFluid Clarity',
            'Clarity',
            'manage_options',
            'promptfluid-clarity',
            array($this, 'render_dashboard'),
            'dashicons-universal-access',
            80
        );
    }
    
    /**
     * Enqueue admin assets
     */
    public function enqueue_admin_assets($hook) {
        if (strpos($hook, 'promptfluid-clarity') === false) {
            return;
        }
        
        // Enqueue React app
        $react_build = PFCLARITY_PLUGIN_URL . 'admin/react-admin/dist/';
        
        if (file_exists(PFCLARITY_PLUGIN_DIR . 'admin/react-admin/dist/index.js')) {
            wp_enqueue_script(
                'pfclarity-react',
                $react_build . 'index.js',
                array(),
                PFCLARITY_VERSION,
                true
            );
            
            wp_enqueue_style(
                'pfclarity-react',
                $react_build . 'index.css',
                array(),
                PFCLARITY_VERSION
            );
            
            $status = $this->subscription->get_status();
            
            wp_localize_script('pfclarity-react', 'pfclarityData', array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('pfclarity_nonce'),
                'siteUrl' => get_site_url(),
                'hasSubscription' => $status['is_active'],
                'trialActive' => $status['is_trial'],
                'trialDaysRemaining' => $status['is_trial'] ? 7 : 0
            ));
        }
    }
    
    /**
     * Render dashboard
     */
    public function render_dashboard() {
        echo '<div id="pfclarity-root"></div>';
    }
    
    /**
     * AJAX: Scan site
     */
    public function ajax_scan_site() {
        check_ajax_referer('pfclarity_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Unauthorized');
        }
        
        $can_scan = $this->subscription->can_scan();
        if (!$can_scan['allowed']) {
            wp_send_json_error($can_scan['reason']);
        }
        
        $result = $this->scanner->scan_site();
        
        if ($result['success']) {
            wp_send_json_success($result);
        } else {
            wp_send_json_error($result['error']);
        }
    }
    
    /**
     * AJAX: Get scan results
     */
    public function ajax_get_scan_results() {
        check_ajax_referer('pfclarity_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Unauthorized');
        }
        
        $result = $this->scanner->get_scan_results();
        
        if ($result['success']) {
            wp_send_json_success($result['scan']);
        } else {
            wp_send_json_error($result['error']);
        }
    }
    
    /**
     * AJAX: Start trial
     */
    public function ajax_start_trial() {
        check_ajax_referer('pfclarity_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Unauthorized');
        }
        
        $result = $this->subscription->start_trial();
        
        if ($result['success']) {
            wp_send_json_success($result);
        } else {
            wp_send_json_error($result['error']);
        }
    }
    
    public function ajax_save_settings() {
        check_ajax_referer('pfclarity_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Unauthorized');
        }
        
        $settings = isset($_POST['settings']) ? json_decode(stripslashes($_POST['settings']), true) : array();
        
        foreach ($settings as $key => $value) {
            PromptFluid_Clarity_Database::update_setting($key, sanitize_text_field($value));
        }
        
        if (isset($settings['scan_frequency'])) {
            PromptFluid_Clarity_Cron::update_frequency($settings['scan_frequency']);
        }
        
        wp_send_json_success('Settings saved');
    }
}
