<?php
/**
 * Dashboard AJAX Handlers
 */

if (!defined('ABSPATH')) exit;

class PromptFluid_Defense_Dashboard_Ajax {
    
    public static function init() {
        add_action('wp_ajax_pfdef_toggle_module', array(__CLASS__, 'toggle_module'));
        add_action('wp_ajax_pfdef_run_scan', array(__CLASS__, 'run_scan'));
        add_action('wp_ajax_pfdef_refresh_activity', array(__CLASS__, 'refresh_activity'));
    }
    
    public static function toggle_module() {
        check_ajax_referer('pfdef_dashboard', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Permission denied'));
        }
        
        $module = sanitize_text_field($_POST['module'] ?? '');
        $enabled = intval($_POST['enabled'] ?? 0);
        
        update_option('pfdef_' . $module . '_enabled', $enabled === 1);
        
        wp_send_json_success(array(
            'message' => $enabled ? 'Module enabled successfully!' : 'Module disabled'
        ));
    }
    
    public static function run_scan() {
        check_ajax_referer('pfdef_dashboard', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Permission denied'));
        }
        
        // Trigger scan
        require_once PFDEF_PLUGIN_DIR . 'includes/class-malware-scanner.php';
        $scanner = new PromptFluid_Defense_Malware_Scanner();
        $results = $scanner->run_scan();
        
        wp_send_json_success(array(
            'message' => 'Found ' . $results['threats_found'] . ' threats'
        ));
    }
    
    public static function refresh_activity() {
        check_ajax_referer('pfdef_dashboard', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Permission denied'));
        }
        
        global $wpdb;
        $events = $wpdb->get_results(
            "SELECT * FROM {$wpdb->prefix}pfdef_bot_detection_logs 
            ORDER BY timestamp DESC LIMIT 10",
            ARRAY_A
        );
        
        ob_start();
        foreach ($events as $event) {
            echo '<div class="pfdef-activity-item">' . esc_html($event['reason']) . '</div>';
        }
        $html = ob_get_clean();
        
        wp_send_json_success(array('html' => $html));
    }
}

PromptFluid_Defense_Dashboard_Ajax::init();
