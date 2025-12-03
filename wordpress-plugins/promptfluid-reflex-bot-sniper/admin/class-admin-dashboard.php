<?php
/**
 * Admin dashboard and settings page.
 *
 * @package PromptFluid_Reflex
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Defense_Admin {
    
    private $plugin_name;
    private $version;
    
    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;
    }
    
    /**
     * Add plugin admin menu.
     */
    public function add_plugin_admin_menu() {
        // Main menu
        add_menu_page(
            __('PromptFluid Reflex', 'promptfluid-reflex'),
            __('PF Reflex', 'promptfluid-reflex'),
            'manage_options',
            'promptfluid-reflex',
            array($this, 'display_plugin_admin_page'),
            'dashicons-shield',
            100
        );
        
        // Wizard (hidden from menu)
        add_submenu_page(
            null, // Hide from menu
            __('Setup Wizard', 'promptfluid-reflex'),
            __('Setup Wizard', 'promptfluid-reflex'),
            'manage_options',
            'promptfluid-reflex-wizard',
            array($this, 'display_wizard_page')
        );
        
        // Analytics submenu
        add_submenu_page(
            'promptfluid-reflex',
            __('Analytics & Reporting', 'promptfluid-reflex'),
            __('Analytics', 'promptfluid-reflex'),
            'manage_options',
            'promptfluid-reflex-analytics',
            array($this, 'display_analytics_page')
        );
        
        // Security Overview submenu
        add_submenu_page(
            'promptfluid-reflex',
            __('Security Overview', 'promptfluid-reflex'),
            __('Security Overview', 'promptfluid-reflex'),
            'manage_options',
            'promptfluid-reflex-security',
            array($this, 'display_security_overview_page')
        );
        
        // Upgrade submenu
        add_submenu_page(
            'promptfluid-reflex',
            __('Upgrade to Premium', 'promptfluid-reflex'),
            '<span style="color:#01C9E8;font-weight:bold;">' . __('⚡ Upgrade', 'promptfluid-reflex') . '</span>',
            'manage_options',
            'promptfluid-reflex-upgrade',
            array($this, 'display_upgrade_page')
        );
        
        // License submenu
        add_submenu_page(
            'promptfluid-reflex',
            __('License', 'promptfluid-reflex'),
            __('License', 'promptfluid-reflex'),
            'manage_options',
            'promptfluid-reflex-license',
            array($this, 'display_license_page')
        );
    }
    
    /**
     * Register plugin settings.
     */
    public function register_settings() {
        register_setting(
            'promptfluid_defense_settings_group',
            'promptfluid_defense_settings',
            array($this, 'validate_settings')
        );
        
        // Register email digest settings
        register_setting('pfdef_email_digest_settings', 'pfdef_email_frequency');
        register_setting('pfdef_email_digest_settings', 'pfdef_digest_email');
        
        // Register CSV export handler
        add_action('admin_init', array($this, 'handle_csv_export'));
    }
    
    /**
     * Validate settings before saving.
     */
    public function validate_settings($input) {
        // Verify nonce
        if (!isset($_POST['promptfluid_defense_nonce']) || !wp_verify_nonce($_POST['promptfluid_defense_nonce'], 'promptfluid_defense_settings_nonce')) {
            add_settings_error(
                'promptfluid_defense_settings',
                'nonce_error',
                __('Security check failed. Please try again.', 'promptfluid-defense'),
                'error'
            );
            return get_option('promptfluid_defense_settings');
        }
        
        $validated = array();
        
        $validated['enabled'] = isset($input['enabled']) ? true : false;
        $validated['sensitivity'] = in_array($input['sensitivity'], array('low', 'medium', 'high')) 
            ? $input['sensitivity'] 
            : 'medium';
        $validated['whitelist_ips'] = sanitize_textarea_field($input['whitelist_ips']);
        $validated['anonymize_ips'] = isset($input['anonymize_ips']) ? true : false;
        $validated['log_retention_days'] = intval($input['log_retention_days']);
        
        if ($validated['log_retention_days'] < 1) {
            $validated['log_retention_days'] = 30;
        }
        
        return $validated;
    }
    
    /**
     * Display the plugin admin page (Enhanced Dashboard).
     */
    public function display_plugin_admin_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        
        // Check if should show wizard
        $wizard_completed = get_option('pfdef_wizard_completed', false);
        if (!$wizard_completed && !isset($_GET['skip_wizard'])) {
            wp_safe_redirect(admin_url('admin.php?page=promptfluid-reflex-wizard'));
            exit;
        }
        
        require_once PFDEF_PLUGIN_DIR . 'admin/pages/dashboard.php';
    }
    
    /**
     * Display wizard page
     */
    public function display_wizard_page() {
        require_once PFDEF_PLUGIN_DIR . 'admin/pages/wizard.php';
    }
    
    /**
     * Display wizard page
     */
    public function display_wizard_page() {
        require_once PFDEF_PLUGIN_DIR . 'admin/pages/wizard.php';
    }
    
    /**
     * Enqueue admin styles.
     */
    public function enqueue_styles($hook) {
        if (!in_array($hook, array('toplevel_page_promptfluid-reflex', 'pf-reflex_page_promptfluid-reflex-analytics', 'pf-reflex_page_promptfluid-reflex-upgrade', 'pf-reflex_page_promptfluid-reflex-license'))) {
            return;
        }
        
        // Toast notifications CSS
        wp_enqueue_style(
            $this->plugin_name . '-toast',
            PFDEF_PLUGIN_URL . 'admin/css/toast-notifications.css',
            array(),
            $this->version
        );
        
        wp_enqueue_style(
            $this->plugin_name . '-admin',
            PFDEF_PLUGIN_URL . 'admin/dist/pfdef-admin.css',
            array(),
            $this->version
        );
        
        // Analytics styles
        if ($hook === 'pf-reflex_page_promptfluid-reflex-analytics') {
            wp_enqueue_style(
                $this->plugin_name . '-analytics',
                PFDEF_PLUGIN_URL . 'admin/css/analytics.css',
                array(),
                $this->version
            );
        }
    }
    
    /**
     * Enqueue admin scripts.
     */
    public function enqueue_scripts($hook) {
        if (!in_array($hook, array('toplevel_page_promptfluid-reflex', 'pf-reflex_page_promptfluid-reflex-analytics', 'pf-reflex_page_promptfluid-reflex-upgrade', 'pf-reflex_page_promptfluid-reflex-license'))) {
            return;
        }
        
        // jQuery
        wp_enqueue_script('jquery');
        
        // Toast notifications
        wp_enqueue_script(
            $this->plugin_name . '-toast',
            PFDEF_PLUGIN_URL . 'admin/js/toast-notifications.js',
            array('jquery'),
            $this->version,
            true
        );
        
        // Dashboard enhancements
        if ($hook === 'toplevel_page_promptfluid-reflex') {
            wp_enqueue_script(
                $this->plugin_name . '-dashboard',
                PFDEF_PLUGIN_URL . 'admin/js/dashboard-enhancements.js',
                array('jquery', $this->plugin_name . '-toast'),
                $this->version,
                true
            );
            
            wp_localize_script(
                $this->plugin_name . '-dashboard',
                'pfdefDashboard',
                array(
                    'nonce' => wp_create_nonce('pfdef_dashboard'),
                    'analyticsUrl' => admin_url('admin.php?page=promptfluid-reflex-analytics'),
                    'settingsUrl' => admin_url('admin.php?page=promptfluid-reflex-settings'),
                )
            );
        }
        
        wp_enqueue_script(
            $this->plugin_name . '-admin',
            PFDEF_PLUGIN_URL . 'admin/dist/pfdef-admin.js',
            array('jquery'),
            $this->version,
            true
        );
        
        // Pass config to React app
        wp_localize_script(
            $this->plugin_name . '-admin',
            'pfdefConfig',
            array(
                'apiUrl' => esc_url_raw(rest_url('pfdef/v1')),
                'nonce' => wp_create_nonce('wp_rest'),
                'supabaseUrl' => 'https://hxgbibtkftocyrnuzxwd.supabase.co',
                'supabaseKey' => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4Z2JpYnRrZnRvY3lybnV6eHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3OTM5OTEsImV4cCI6MjA3NzM2OTk5MX0.F5EBcIKn54gp5Os_L4wPmkmtg5pAJsbCZUKNwa59CZk'
            )
        );
        
        // Analytics scripts
        if ($hook === 'pf-reflex_page_promptfluid-reflex-analytics') {
            wp_enqueue_script(
                $this->plugin_name . '-analytics',
                PFDEF_PLUGIN_URL . 'admin/js/analytics-charts.js',
                array('jquery'),
                $this->version,
                true
            );
        }
    }
    
    /**
     * Display analytics page
     */
    public function display_analytics_page() {
        require_once PFDEF_PLUGIN_DIR . 'admin/pages/analytics.php';
    }
    
    /**
     * Display security overview page
     */
    public function display_security_overview_page() {
        require_once PFDEF_PLUGIN_DIR . 'admin/pages/security-overview.php';
    }
    
    /**
     * Display upgrade page
     */
    public function display_upgrade_page() {
        require_once PFDEF_PLUGIN_DIR . 'admin/pages/upgrade.php';
    }
    
    /**
     * Display license page
     */
    public function display_license_page() {
        require_once PFDEF_PLUGIN_DIR . 'admin/pages/license.php';
    }
    
    /**
     * Handle CSV export
     */
    public function handle_csv_export() {
        if (!isset($_GET['action']) || $_GET['action'] !== 'pfdef_export_csv') {
            return;
        }
        
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions.'));
        }
        
        check_admin_referer('wp_rest', '_wpnonce');
        
        require_once PFDEF_PLUGIN_DIR . 'includes/class-analytics.php';
        $analytics = new PromptFluid_Defense_Analytics();
        
        $period = isset($_GET['period']) ? sanitize_text_field($_GET['period']) : '7d';
        $csv = $analytics->export_to_csv($period);
        
        $filename = 'promptfluid-defense-export-' . date('Y-m-d') . '.csv';
        
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Pragma: no-cache');
        header('Expires: 0');
        
        echo $csv;
        exit;
    }
}

