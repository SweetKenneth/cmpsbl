<?php
namespace BotSniper;

if (!defined('ABSPATH')) exit;

class Admin {
    
    public function __construct() {
        add_action('admin_menu', [$this, 'add_menu_pages']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_assets']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_public_scripts']);
        add_action('wp_ajax_bot_sniper_track_behavior', [$this, 'handle_behavior_tracking']);
        add_action('wp_ajax_nopriv_bot_sniper_track_behavior', [$this, 'handle_behavior_tracking']);
    }
    
    public function add_menu_pages() {
        add_menu_page(
            'Bot Sniper',
            'Bot Sniper',
            'manage_options',
            'bot-sniper',
            [$this, 'render_dashboard'],
            'dashicons-shield',
            30
        );
        
        add_submenu_page(
            'bot-sniper',
            'Dashboard',
            'Dashboard',
            'manage_options',
            'bot-sniper',
            [$this, 'render_dashboard']
        );
        
        add_submenu_page(
            'bot-sniper',
            'Analytics',
            'Analytics',
            'manage_options',
            'bot-sniper-analytics',
            [$this, 'render_analytics']
        );
        
        add_submenu_page(
            'bot-sniper',
            'Settings',
            'Settings',
            'manage_options',
            'bot-sniper-settings',
            [$this, 'render_settings']
        );
        
        add_submenu_page(
            'bot-sniper',
            'Upgrade',
            'Upgrade to Full Defense',
            'manage_options',
            'bot-sniper-upgrade',
            [$this, 'render_upgrade']
        );
    }
    
    public function enqueue_assets($hook) {
        if (strpos($hook, 'bot-sniper') === false) return;
        
        wp_enqueue_style(
            'bot-sniper-admin',
            BOT_SNIPER_PLUGIN_URL . 'assets/admin.css',
            [],
            BOT_SNIPER_VERSION
        );
        
        wp_enqueue_script(
            'bot-sniper-admin',
            BOT_SNIPER_PLUGIN_URL . 'assets/admin.js',
            ['jquery'],
            BOT_SNIPER_VERSION,
            true
        );
        
        wp_localize_script('bot-sniper-admin', 'botSniperData', [
            'apiBase' => BOT_SNIPER_API_BASE,
            'apiKey' => get_option('bot_sniper_api_key', ''),
            'nonce' => wp_create_nonce('bot_sniper_nonce'),
            'ajaxUrl' => admin_url('admin-ajax.php')
        ]);
    }
    
    /**
     * Enqueue public behavioral tracking script
     */
    public function enqueue_public_scripts() {
        $settings = get_option('bot_sniper_settings');
        
        // Only load if detection is enabled
        if (!isset($settings['detection_enabled']) || !$settings['detection_enabled']) {
            return;
        }
        
        wp_enqueue_script(
            'bot-sniper-tracking',
            BOT_SNIPER_PLUGIN_URL . 'assets/behavioral-tracking.js',
            [],
            BOT_SNIPER_VERSION,
            true
        );
        
        wp_localize_script('bot-sniper-tracking', 'botSniperData', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('bot_sniper_tracking')
        ]);
    }
    
    public function register_settings() {
        register_setting('bot_sniper_settings', 'bot_sniper_api_key');
        register_setting('bot_sniper_settings', 'bot_sniper_subscription_tier');
        register_setting('bot_sniper_settings', 'bot_sniper_settings');
    }
    
    public function render_dashboard() {
        $api_key = get_option('bot_sniper_api_key');
        
        if (empty($api_key)) {
            include BOT_SNIPER_PLUGIN_DIR . 'templates/setup.php';
        } else {
            include BOT_SNIPER_PLUGIN_DIR . 'templates/dashboard.php';
        }
    }
    
    public function render_analytics() {
        include BOT_SNIPER_PLUGIN_DIR . 'templates/analytics.php';
    }
    
    public function render_settings() {
        include BOT_SNIPER_PLUGIN_DIR . 'templates/settings.php';
    }
    
    public function render_upgrade() {
        include BOT_SNIPER_PLUGIN_DIR . 'templates/upgrade.php';
    }
    
    /**
     * Handle behavioral tracking AJAX
     */
    public function handle_behavior_tracking() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'bot_sniper_tracking')) {
            wp_send_json_error('Invalid nonce');
            return;
        }
        
        // Get behavioral data
        $data = isset($_POST['data']) ? json_decode(stripslashes($_POST['data']), true) : null;
        
        if (!$data) {
            wp_send_json_error('No data provided');
            return;
        }
        
        // Process the behavioral data
        require_once BOT_SNIPER_PLUGIN_DIR . 'includes/class-behavior-tracker.php';
        $tracker = new \BotSniper\BehaviorTracker();
        
        if (!$tracker->validate_data($data)) {
            wp_send_json_error('Invalid data structure');
            return;
        }
        
        $result = $tracker->process_behavioral_data(array_merge($data, array(
            'session_id' => sanitize_text_field($_POST['session_id'] ?? ''),
            'page_url' => sanitize_text_field($_POST['page_url'] ?? ''),
            'referrer' => sanitize_text_field($_POST['referrer'] ?? '')
        )));
        
        if ($result['success']) {
            wp_send_json_success($result);
        } else {
            wp_send_json_error($result['error']);
        }
    }
}
