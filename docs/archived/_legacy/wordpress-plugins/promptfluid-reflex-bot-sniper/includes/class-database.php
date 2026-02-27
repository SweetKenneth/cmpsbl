<?php
/**
 * Database Setup and Management
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Clarity_Database {
    
    /**
     * Create plugin database tables
     */
    public static function create_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // Scans table
        $scans_table = $wpdb->prefix . 'pfclarity_scans';
        $sql_scans = "CREATE TABLE IF NOT EXISTS $scans_table (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            scan_id varchar(100) NOT NULL,
            site_url text NOT NULL,
            status varchar(20) NOT NULL DEFAULT 'pending',
            total_issues int(11) DEFAULT 0,
            critical_issues int(11) DEFAULT 0,
            warning_issues int(11) DEFAULT 0,
            compliance_score decimal(5,2) DEFAULT 0,
            pages_scanned int(11) DEFAULT 0,
            scan_data longtext,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            completed_at datetime,
            PRIMARY KEY (id),
            KEY scan_id (scan_id),
            KEY status (status),
            KEY created_at (created_at)
        ) $charset_collate;";
        
        // Issues table
        $issues_table = $wpdb->prefix . 'pfclarity_issues';
        $sql_issues = "CREATE TABLE IF NOT EXISTS $issues_table (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            scan_id varchar(100) NOT NULL,
            page_url text NOT NULL,
            issue_type varchar(50) NOT NULL,
            severity varchar(20) NOT NULL,
            wcag_criterion varchar(20),
            description text,
            element_selector text,
            suggested_fix text,
            fixed tinyint(1) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY scan_id (scan_id),
            KEY severity (severity),
            KEY fixed (fixed)
        ) $charset_collate;";
        
        // Settings table
        $settings_table = $wpdb->prefix . 'pfclarity_settings';
        $sql_settings = "CREATE TABLE IF NOT EXISTS $settings_table (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            setting_key varchar(100) NOT NULL,
            setting_value longtext,
            autoload tinyint(1) DEFAULT 1,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY setting_key (setting_key)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql_scans);
        dbDelta($sql_issues);
        dbDelta($sql_settings);
        
        // Set default settings
        self::set_default_settings();
    }
    
    /**
     * Set default plugin settings
     */
    private static function set_default_settings() {
        $defaults = array(
            'api_key' => '',
            'subscription_status' => 'inactive',
            'trial_started' => '',
            'trial_ends' => '',
            'auto_scan_enabled' => '0',
            'scan_frequency' => 'weekly',
            'last_scan_id' => '',
            'notification_email' => get_option('admin_email'),
            'auto_fix_enabled' => '0'
        );
        
        foreach ($defaults as $key => $value) {
            self::update_setting($key, $value, false);
        }
    }
    
    /**
     * Get a plugin setting
     */
    public static function get_setting($key, $default = '') {
        global $wpdb;
        $table = $wpdb->prefix . 'pfclarity_settings';
        
        $value = $wpdb->get_var($wpdb->prepare(
            "SELECT setting_value FROM $table WHERE setting_key = %s",
            $key
        ));
        
        return $value !== null ? $value : $default;
    }
    
    /**
     * Update a plugin setting
     */
    public static function update_setting($key, $value, $autoload = true) {
        global $wpdb;
        $table = $wpdb->prefix . 'pfclarity_settings';
        
        $wpdb->replace(
            $table,
            array(
                'setting_key' => $key,
                'setting_value' => $value,
                'autoload' => $autoload ? 1 : 0
            ),
            array('%s', '%s', '%d')
        );
    }
    
    /**
     * Save scan results
     */
    public static function save_scan($data) {
        global $wpdb;
        $table = $wpdb->prefix . 'pfclarity_scans';
        
        $wpdb->insert(
            $table,
            array(
                'scan_id' => $data['scan_id'],
                'site_url' => $data['site_url'],
                'status' => $data['status'],
                'total_issues' => isset($data['total_issues']) ? $data['total_issues'] : 0,
                'critical_issues' => isset($data['critical_issues']) ? $data['critical_issues'] : 0,
                'warning_issues' => isset($data['warning_issues']) ? $data['warning_issues'] : 0,
                'compliance_score' => isset($data['compliance_score']) ? $data['compliance_score'] : 0,
                'pages_scanned' => isset($data['pages_scanned']) ? $data['pages_scanned'] : 0,
                'scan_data' => isset($data['scan_data']) ? json_encode($data['scan_data']) : '',
                'completed_at' => isset($data['completed_at']) ? $data['completed_at'] : null
            ),
            array('%s', '%s', '%s', '%d', '%d', '%d', '%f', '%d', '%s', '%s')
        );
        
        return $wpdb->insert_id;
    }
    
    /**
     * Update scan status
     */
    public static function update_scan($scan_id, $data) {
        global $wpdb;
        $table = $wpdb->prefix . 'pfclarity_scans';
        
        $wpdb->update(
            $table,
            $data,
            array('scan_id' => $scan_id),
            null,
            array('%s')
        );
    }
    
    /**
     * Get scan by ID
     */
    public static function get_scan($scan_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'pfclarity_scans';
        
        $scan = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table WHERE scan_id = %s",
            $scan_id
        ), ARRAY_A);
        
        if ($scan && $scan['scan_data']) {
            $scan['scan_data'] = json_decode($scan['scan_data'], true);
        }
        
        return $scan;
    }
    
    /**
     * Get latest scan
     */
    public static function get_latest_scan() {
        global $wpdb;
        $table = $wpdb->prefix . 'pfclarity_scans';
        
        $scan = $wpdb->get_row(
            "SELECT * FROM $table ORDER BY created_at DESC LIMIT 1",
            ARRAY_A
        );
        
        if ($scan && $scan['scan_data']) {
            $scan['scan_data'] = json_decode($scan['scan_data'], true);
        }
        
        return $scan;
    }
    
    /**
     * Save scan issues
     */
    public static function save_issues($scan_id, $issues) {
        global $wpdb;
        $table = $wpdb->prefix . 'pfclarity_issues';
        
        foreach ($issues as $issue) {
            $wpdb->insert(
                $table,
                array(
                    'scan_id' => $scan_id,
                    'page_url' => $issue['page_url'],
                    'issue_type' => $issue['type'],
                    'severity' => $issue['severity'],
                    'wcag_criterion' => isset($issue['wcag']) ? $issue['wcag'] : '',
                    'description' => $issue['description'],
                    'element_selector' => isset($issue['selector']) ? $issue['selector'] : '',
                    'suggested_fix' => isset($issue['fix']) ? $issue['fix'] : ''
                ),
                array('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s')
            );
        }
    }
    
    /**
     * Get issues for a scan
     */
    public static function get_scan_issues($scan_id, $limit = 100, $offset = 0) {
        global $wpdb;
        $table = $wpdb->prefix . 'pfclarity_issues';
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table WHERE scan_id = %s ORDER BY severity DESC, id ASC LIMIT %d OFFSET %d",
            $scan_id,
            $limit,
            $offset
        ), ARRAY_A);
    }
}
