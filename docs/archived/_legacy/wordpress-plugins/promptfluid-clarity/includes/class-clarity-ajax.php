<?php
/**
 * AJAX handlers for Clarity
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Clarity_AJAX {
    
    private $scanner;
    private $fixer;
    
    public function __construct() {
        $this->scanner = new PromptFluid_Clarity_Scanner();
        $this->fixer = new PromptFluid_Clarity_Fixer();
        
        add_action('wp_ajax_pfclarity_start_scan', [$this, 'handle_start_scan']);
        add_action('wp_ajax_pfclarity_auto_fix', [$this, 'handle_auto_fix']);
        add_action('wp_ajax_pfclarity_get_scan_details', [$this, 'handle_get_scan_details']);
    }
    
    /**
     * Handle scan request
     */
    public function handle_start_scan() {
        check_ajax_referer('pfclarity_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Unauthorized']);
        }
        
        $url = sanitize_text_field($_POST['url']);
        $wcag_level = sanitize_text_field($_POST['wcag_level'] ?? 'AA');
        
        if (empty($url)) {
            wp_send_json_error(['message' => 'URL is required']);
        }
        
        $result = $this->scanner->perform_scan($url, [
            'wcag_level' => $wcag_level
        ]);
        
        if ($result['success']) {
            wp_send_json_success($result);
        } else {
            wp_send_json_error(['message' => $result['error'] ?? 'Scan failed']);
        }
    }
    
    /**
     * Handle auto-fix request
     */
    public function handle_auto_fix() {
        check_ajax_referer('pfclarity_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Unauthorized']);
        }
        
        $scan_id = intval($_POST['scan_id']);
        
        if (!$scan_id) {
            wp_send_json_error(['message' => 'Scan ID is required']);
        }
        
        $results = $this->fixer->auto_fix_scan($scan_id);
        
        $success_count = count(array_filter($results, function($r) {
            return $r['success'];
        }));
        
        wp_send_json_success([
            'message' => "Applied {$success_count} fixes successfully",
            'results' => $results
        ]);
    }
    
    /**
     * Get scan details
     */
    public function handle_get_scan_details() {
        check_ajax_referer('pfclarity_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Unauthorized']);
        }
        
        $scan_id = intval($_POST['scan_id']);
        
        global $wpdb;
        $scan = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM " . PFCLARITY_TABLE_SCANS . " WHERE id = %d",
            $scan_id
        ));
        
        if (!$scan) {
            wp_send_json_error(['message' => 'Scan not found']);
        }
        
        $issues = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM " . PFCLARITY_TABLE_ISSUES . " WHERE scan_id = %d",
            $scan_id
        ));
        
        wp_send_json_success([
            'scan' => $scan,
            'issues' => $issues
        ]);
    }
}
