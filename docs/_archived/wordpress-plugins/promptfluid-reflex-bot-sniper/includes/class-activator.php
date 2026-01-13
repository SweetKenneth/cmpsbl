<?php
/**
 * Fired during plugin activation.
 *
 * @package PromptFluid_Defense
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Defense_Activator {
    
    /**
     * Actions performed on plugin activation.
     */
    public static function activate() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // Table 1: Detection Logs
        $detections_table = $wpdb->prefix . 'pfdef_detections';
        $sql_detections = "CREATE TABLE $detections_table (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            timestamp datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            ip varchar(45) NOT NULL,
            user_agent text NOT NULL,
            threat_type varchar(50) NOT NULL,
            threat_score int(3) DEFAULT 0 NOT NULL,
            action_taken varchar(20) NOT NULL,
            blocked tinyint(1) DEFAULT 0 NOT NULL,
            details longtext,
            session_id varchar(64),
            PRIMARY KEY  (id),
            KEY ip (ip),
            KEY timestamp (timestamp),
            KEY threat_type (threat_type),
            KEY session_id (session_id)
        ) $charset_collate;";
        
        // Table 2: Threat Log
        $threat_log_table = $wpdb->prefix . 'pfdef_threat_log';
        $sql_threat_log = "CREATE TABLE $threat_log_table (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            ip varchar(45) NOT NULL,
            threat_score float NOT NULL,
            action varchar(20) NOT NULL,
            threat_type varchar(100),
            details longtext,
            user_agent text,
            url varchar(500),
            created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY  (id),
            KEY ip (ip),
            KEY created_at (created_at),
            KEY threat_score (threat_score)
        ) $charset_collate;";
        
        // Table 3: Behavioral Heatmap
        $heatmap_table = $wpdb->prefix . 'pfdef_heatmap';
        $sql_heatmap = "CREATE TABLE $heatmap_table (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            session_id varchar(64) NOT NULL,
            ip varchar(45) NOT NULL,
            mouse_movements int DEFAULT 0,
            clicks int DEFAULT 0,
            keystrokes int DEFAULT 0,
            scroll_depth int DEFAULT 0,
            time_on_page int DEFAULT 0,
            timestamp datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY  (id),
            KEY session_id (session_id),
            KEY ip (ip),
            KEY timestamp (timestamp)
        ) $charset_collate;";
        
        // Table 4: Smart Learning Patterns
        $learning_table = $wpdb->prefix . 'pfdef_learning_patterns';
        $sql_learning = "CREATE TABLE $learning_table (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            pattern_type varchar(50) NOT NULL,
            pattern_data longtext NOT NULL,
            threat_score float NOT NULL,
            action_taken varchar(20) NOT NULL,
            was_correct tinyint(1) DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY  (id),
            KEY pattern_type (pattern_type),
            KEY created_at (created_at),
            KEY was_correct (was_correct)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql_detections);
        dbDelta($sql_threat_log);
        dbDelta($sql_heatmap);
        dbDelta($sql_learning);
        
        // Create new security module tables (guarded to avoid fatals if files are missing)
        $maybe_require = function ($relative) {
            $path = PFDEF_PLUGIN_DIR . $relative;
            if (file_exists($path)) {
                require_once $path;
                return true;
            }
            return false;
        };

        if ($maybe_require('includes/class-file-integrity.php') && class_exists('PromptFluid_Defense_File_Integrity')) {
            PromptFluid_Defense_File_Integrity::create_table();
        }
        if ($maybe_require('includes/class-firewall.php') && class_exists('PromptFluid_Defense_Firewall')) {
            PromptFluid_Defense_Firewall::create_table();
        }
        if ($maybe_require('includes/class-login-guard.php') && class_exists('PromptFluid_Defense_Login_Guard')) {
            PromptFluid_Defense_Login_Guard::create_table();
        }
        if ($maybe_require('includes/class-malware-scanner.php') && class_exists('PromptFluid_Defense_Malware_Scanner')) {
            PromptFluid_Defense_Malware_Scanner::create_table();
        }
        if ($maybe_require('includes/class-smart-learning.php') && class_exists('PromptFluid_Defense_Smart_Learning')) {
            if (method_exists('PromptFluid_Defense_Smart_Learning', 'create_tables')) {
                PromptFluid_Defense_Smart_Learning::create_tables();
            }
        }
        
        // Set default options
        $default_settings = array(
            'enabled' => 'on',
            'protection_mode' => 'monitor',
            'sensitivity' => 'medium',
            'whitelist_ips' => '',
            'smart_learning' => 'on'
        );
        
        add_option('promptfluid_defense_settings', $default_settings);
        add_option('pfdef_activation_redirect', true);
        
        // Schedule cron jobs (guarded)
        if ($maybe_require('includes/class-cron-jobs.php') && class_exists('PromptFluid_Defense_Cron')) {
            if (method_exists('PromptFluid_Defense_Cron', 'schedule_jobs')) {
                PromptFluid_Defense_Cron::schedule_jobs();
            }
        }
    }
}
