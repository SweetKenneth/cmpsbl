<?php
/**
 * Core plugin class - Singleton pattern
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Clarity_Core {
    
    private static $instance = null;
    protected $loader;
    
    /**
     * Get singleton instance
     */
    public static function instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor - initialize plugin
     */
    private function __construct() {
        $this->load_dependencies();
        $this->define_hooks();
    }
    
    /**
     * Load required dependencies
     */
    private function load_dependencies() {
        require_once PFCLARITY_PLUGIN_DIR . 'includes/class-clarity-loader.php';
        require_once PFCLARITY_PLUGIN_DIR . 'includes/class-clarity-scanner.php';
        require_once PFCLARITY_PLUGIN_DIR . 'includes/class-clarity-fixer.php';
        require_once PFCLARITY_PLUGIN_DIR . 'includes/class-clarity-api-client.php';
        require_once PFCLARITY_PLUGIN_DIR . 'includes/class-clarity-licensing.php';
        require_once PFCLARITY_PLUGIN_DIR . 'includes/class-clarity-logger.php';
        require_once PFCLARITY_PLUGIN_DIR . 'includes/class-clarity-ajax.php';
        require_once PFCLARITY_PLUGIN_DIR . 'includes/class-clarity-local-verify.php';
        
        if (is_admin()) {
            require_once PFCLARITY_PLUGIN_DIR . 'admin/class-clarity-admin.php';
            require_once PFCLARITY_PLUGIN_DIR . 'admin/class-clarity-dashboard.php';
        }
        
        require_once PFCLARITY_PLUGIN_DIR . 'public/class-clarity-frontend.php';
        
        $this->loader = new PromptFluid_Clarity_Loader();
    }
    
    /**
     * Define plugin hooks
     */
    private function define_hooks() {
        // Admin hooks
        if (is_admin()) {
            $admin = new PromptFluid_Clarity_Admin();
            $this->loader->add_action('admin_menu', $admin, 'register_menu');
            $this->loader->add_action('admin_enqueue_scripts', $admin, 'enqueue_assets');
        }
        
        // AJAX hooks
        new PromptFluid_Clarity_AJAX();
        
        // Frontend hooks
        $frontend = new PromptFluid_Clarity_Frontend();
        $this->loader->add_action('wp_enqueue_scripts', $frontend, 'enqueue_assets');
        
        // Run the loader
        $this->loader->run();
    }
    
    /**
     * Activation hook
     */
    public static function activate() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // Create scans table
        $sql_scans = "CREATE TABLE IF NOT EXISTS " . PFCLARITY_TABLE_SCANS . " (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            site_url varchar(255) NOT NULL,
            status varchar(50) DEFAULT 'pending',
            wcag_level varchar(10) DEFAULT 'AA',
            pages_scanned int(11) DEFAULT 0,
            issues_found int(11) DEFAULT 0,
            started_at datetime DEFAULT NULL,
            completed_at datetime DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY status (status),
            KEY site_url (site_url)
        ) $charset_collate;";
        
        // Create issues table
        $sql_issues = "CREATE TABLE IF NOT EXISTS " . PFCLARITY_TABLE_ISSUES . " (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            scan_id bigint(20) NOT NULL,
            page_url varchar(255) NOT NULL,
            issue_type varchar(100) NOT NULL,
            severity varchar(20) DEFAULT 'medium',
            wcag_criterion varchar(50) DEFAULT NULL,
            description text,
            selector text,
            fix_status varchar(50) DEFAULT 'open',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY scan_id (scan_id),
            KEY fix_status (fix_status)
        ) $charset_collate;";
        
        // Create fixes table
        $sql_fixes = "CREATE TABLE IF NOT EXISTS " . PFCLARITY_TABLE_FIXES . " (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            issue_id bigint(20) NOT NULL,
            fix_type varchar(50) NOT NULL,
            fix_data text,
            applied_at datetime DEFAULT NULL,
            applied_by bigint(20) DEFAULT NULL,
            status varchar(50) DEFAULT 'pending',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY issue_id (issue_id)
        ) $charset_collate;";
        
        // Create logs table
        $sql_logs = "CREATE TABLE IF NOT EXISTS " . PFCLARITY_TABLE_LOGS . " (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            log_level varchar(20) DEFAULT 'info',
            message text NOT NULL,
            context text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY log_level (log_level),
            KEY created_at (created_at)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql_scans);
        dbDelta($sql_issues);
        dbDelta($sql_fixes);
        dbDelta($sql_logs);
        
        // Set default options
        add_option('pfclarity_version', PFCLARITY_VERSION);
        add_option('pfclarity_activated_at', current_time('mysql'));
        
        // Log activation
        PromptFluid_Clarity_Logger::log('Plugin activated', 'info');
    }
    
    /**
     * Deactivation hook
     */
    public static function deactivate() {
        // Clear scheduled events
        wp_clear_scheduled_hook('pfclarity_daily_scan');
        
        // Log deactivation
        PromptFluid_Clarity_Logger::log('Plugin deactivated', 'info');
    }
}
