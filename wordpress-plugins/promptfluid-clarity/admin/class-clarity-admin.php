<?php
/**
 * Admin Interface
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Clarity_Admin {
    
    /**
     * Register admin menu
     */
    public function register_menu() {
        add_menu_page(
            'PromptFluid Clarity',
            'Clarity',
            'manage_options',
            'promptfluid-clarity',
            [$this, 'render_dashboard'],
            'dashicons-universal-access',
            30
        );
        
        add_submenu_page(
            'promptfluid-clarity',
            'Dashboard',
            'Dashboard',
            'manage_options',
            'promptfluid-clarity',
            [$this, 'render_dashboard']
        );
        
        add_submenu_page(
            'promptfluid-clarity',
            'Scans',
            'Scans',
            'manage_options',
            'promptfluid-clarity-scans',
            [$this, 'render_scans']
        );
        
        add_submenu_page(
            'promptfluid-clarity',
            'Settings',
            'Settings',
            'manage_options',
            'promptfluid-clarity-settings',
            [$this, 'render_settings']
        );
    }
    
    /**
     * Enqueue admin assets
     */
    public function enqueue_assets($hook) {
        if (strpos($hook, 'promptfluid-clarity') === false) {
            return;
        }
        
        wp_enqueue_style(
            'pfclarity-admin',
            PFCLARITY_PLUGIN_URL . 'admin/assets/css/admin.css',
            [],
            PFCLARITY_VERSION
        );
        
        wp_enqueue_script(
            'pfclarity-admin',
            PFCLARITY_PLUGIN_URL . 'admin/assets/js/admin.js',
            ['jquery'],
            PFCLARITY_VERSION,
            true
        );
        
        wp_localize_script('pfclarity-admin', 'pfclarityData', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('pfclarity_nonce'),
            'version' => PFCLARITY_VERSION
        ]);
    }
    
    /**
     * Render dashboard page
     */
    public function render_dashboard() {
        require_once PFCLARITY_PLUGIN_DIR . 'admin/class-clarity-dashboard.php';
        $dashboard = new PromptFluid_Clarity_Dashboard();
        $dashboard->render();
    }
    
    /**
     * Render scans page
     */
    public function render_scans() {
        echo '<div class="wrap">';
        echo '<h1>Accessibility Scans</h1>';
        echo '<div id="pfclarity-scans-root"></div>';
        echo '</div>';
    }
    
    /**
     * Render settings page
     */
    public function render_settings() {
        echo '<div class="wrap">';
        echo '<h1>Clarity Settings</h1>';
        echo '<div id="pfclarity-settings-root"></div>';
        echo '</div>';
    }
}
