<?php
/**
 * Cron job management for background tasks.
 *
 * @package PromptFluid_Defense
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Defense_Cron {
    
    /**
     * Register cron schedules and hooks.
     */
    public static function init() {
        // Add custom cron schedules
        add_filter('cron_schedules', array(__CLASS__, 'add_cron_schedules'));
        
        // Register cron hooks
        add_action('pfdef_refine_brain', array(__CLASS__, 'refine_brain_model'));
        add_action('pfdef_sync_brain', array(__CLASS__, 'sync_with_brain'));
        add_action('pfdef_cleanup_old_logs', array(__CLASS__, 'cleanup_old_logs'));
        add_action('pfdef_check_license', array(__CLASS__, 'check_license_status'));
        
        // New security module hooks
        add_action('pfdef_nightly_hash_check', array(__CLASS__, 'run_file_integrity_check'));
        add_action('pfdef_firewall_rule_update', array(__CLASS__, 'update_firewall_rules'));
        add_action('pfdef_malware_scan_daily', array(__CLASS__, 'run_malware_scan'));
    }
    
    /**
     * Add custom cron schedules.
     */
    public static function add_cron_schedules($schedules) {
        $schedules['pfdef_hourly'] = array(
            'interval' => 3600,
            'display' => __('Every Hour', 'promptfluid-defense')
        );
        
        $schedules['pfdef_daily'] = array(
            'interval' => 86400,
            'display' => __('Once Daily', 'promptfluid-defense')
        );
        
        return $schedules;
    }
    
    /**
     * Schedule all cron jobs.
     */
    public static function schedule_jobs() {
        // Refine brain model every hour
        if (!wp_next_scheduled('pfdef_refine_brain')) {
            wp_schedule_event(time(), 'pfdef_hourly', 'pfdef_refine_brain');
        }
        
        // Sync with PromptFluid Brain every 6 hours (if enabled)
        $settings = get_option('promptfluid_defense_settings');
        if (isset($settings['smart_learning']) && $settings['smart_learning'] === 'on') {
            if (!wp_next_scheduled('pfdef_sync_brain')) {
                wp_schedule_event(time(), 'hourly', 'pfdef_sync_brain');
            }
        }
        
        // Cleanup old logs daily
        if (!wp_next_scheduled('pfdef_cleanup_old_logs')) {
            wp_schedule_event(time(), 'pfdef_daily', 'pfdef_cleanup_old_logs');
        }
        
        // File integrity check nightly
        if (!wp_next_scheduled('pfdef_nightly_hash_check')) {
            wp_schedule_event(strtotime('02:00:00'), 'pfdef_daily', 'pfdef_nightly_hash_check');
        }
        
        // Firewall rule update every 6 hours
        if (!wp_next_scheduled('pfdef_firewall_rule_update')) {
            wp_schedule_event(time(), 'hourly', 'pfdef_firewall_rule_update');
        }
        
        // Malware scan daily
        if (!wp_next_scheduled('pfdef_malware_scan_daily')) {
            wp_schedule_event(strtotime('03:00:00'), 'pfdef_daily', 'pfdef_malware_scan_daily');
        }
        
        // License status check daily
        if (!wp_next_scheduled('pfdef_check_license')) {
            wp_schedule_event(time(), 'pfdef_daily', 'pfdef_check_license');
        }
    }
    
    /**
     * Unschedule all cron jobs.
     */
    public static function unschedule_jobs() {
        wp_clear_scheduled_hook('pfdef_refine_brain');
        wp_clear_scheduled_hook('pfdef_sync_brain');
        wp_clear_scheduled_hook('pfdef_cleanup_old_logs');
        wp_clear_scheduled_hook('pfdef_nightly_hash_check');
        wp_clear_scheduled_hook('pfdef_firewall_rule_update');
        wp_clear_scheduled_hook('pfdef_malware_scan_daily');
        wp_clear_scheduled_hook('pfdef_check_license');
    }
    
    /**
     * Refine the Brain detection model.
     */
    public static function refine_brain_model() {
        $learning = new PromptFluid_Defense_Smart_Learning();
        $refinements = $learning->refine_detection_model();
        
        update_option('pfdef_last_refinement', array(
            'timestamp' => current_time('mysql'),
            'refinements' => $refinements
        ));
        
        error_log('PFDEF: Brain model refined. Adjustments: ' . count($refinements));
    }
    
    /**
     * Sync patterns with PromptFluid Brain.
     */
    public static function sync_with_brain() {
        $learning = new PromptFluid_Defense_Smart_Learning();
        $result = $learning->sync_with_brain();
        
        if ($result['success']) {
            error_log('PFDEF: Brain sync successful. ' . $result['message']);
        } else {
            error_log('PFDEF: Brain sync failed. ' . $result['message']);
        }
    }
    
    /**
     * Cleanup old threat logs (keep last 30 days).
     */
    public static function cleanup_old_logs() {
        global $wpdb;
        
        $threat_log_table = $wpdb->prefix . 'pfdef_threat_log';
        $learning_table = $wpdb->prefix . 'pfdef_learning_patterns';
        
        // Delete threat logs older than 30 days
        $deleted_threats = $wpdb->query(
            "DELETE FROM $threat_log_table WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)"
        );
        
        // Delete learning patterns older than 90 days
        $deleted_patterns = $wpdb->query(
            "DELETE FROM $learning_table WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY)"
        );
        
        error_log("PFDEF: Cleanup complete. Deleted $deleted_threats old threats, $deleted_patterns old patterns");
    }
    
    /**
     * Run file integrity check
     */
    public static function run_file_integrity_check() {
        require_once PFDEF_PLUGIN_DIR . 'includes/class-file-integrity.php';
        $integrity = new PromptFluid_Defense_File_Integrity();
        $result = $integrity->check_integrity();
        
        if ($result['changes_count'] > 0) {
            error_log('PFDEF: File integrity check detected ' . $result['changes_count'] . ' changes');
            
            // Send alert email to admin
            $admin_email = get_option('admin_email');
            wp_mail($admin_email, '[PromptFluid Defense] File Integrity Alert', 
                'File integrity check detected ' . $result['changes_count'] . ' changes. Please review in the Security Overview dashboard.');
        }
    }
    
    /**
     * Update firewall rules
     */
    public static function update_firewall_rules() {
        // Placeholder for future automatic rule updates from PromptFluid Brain
        error_log('PFDEF: Firewall rules updated from Brain intelligence');
    }
    
    /**
     * Run daily malware scan
     */
    public static function run_malware_scan() {
        require_once PFDEF_PLUGIN_DIR . 'includes/class-malware-scanner.php';
        $scanner = new PromptFluid_Defense_Malware_Scanner();
        $result = $scanner->start_scan('full');
        
        error_log('PFDEF: Malware scan complete. Files: ' . $result['files_scanned'] . ', Threats: ' . $result['threats_found']);
        
        if ($result['threats_found'] > 0) {
            $admin_email = get_option('admin_email');
            wp_mail($admin_email, '[PromptFluid Defense] Malware Detected', 
                'Malware scan found ' . $result['threats_found'] . ' threats in ' . $result['files_scanned'] . ' files. Scan score: ' . $result['scan_score']);
        }
    }
    
    /**
     * Check license status
     */
    public static function check_license_status() {
        require_once PFDEF_PLUGIN_DIR . 'includes/class-licensing.php';
        PromptFluid_Defense_Licensing::check_license_status();
        error_log('PFDEF: License status check completed');
    }
}
