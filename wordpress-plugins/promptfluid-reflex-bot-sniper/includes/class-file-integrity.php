<?php
/**
 * File Integrity Monitor
 * 
 * Monitors WordPress core, plugin, and theme files for unauthorized changes
 *
 * @package PromptFluid_Defense
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Defense_File_Integrity {
    
    private $table_name;
    
    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'pfdef_file_hashes';
    }
    
    /**
     * Create file hashes table
     */
    public static function create_table() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'pfdef_file_hashes';
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE IF NOT EXISTS {$table_name} (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            file_path varchar(500) NOT NULL,
            file_hash varchar(64) NOT NULL,
            file_size bigint(20) NOT NULL,
            file_type varchar(50) NOT NULL,
            last_checked datetime DEFAULT CURRENT_TIMESTAMP,
            last_modified datetime DEFAULT CURRENT_TIMESTAMP,
            status varchar(20) DEFAULT 'clean',
            PRIMARY KEY (id),
            UNIQUE KEY file_path (file_path),
            KEY file_type (file_type),
            KEY status (status)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * Initialize file integrity baseline
     */
    public function initialize_baseline() {
        $files_scanned = 0;
        $files_added = 0;
        
        // Scan WordPress core files
        $core_files = $this->get_core_files();
        foreach ($core_files as $file) {
            if ($this->add_file_hash($file, 'core')) {
                $files_added++;
            }
            $files_scanned++;
        }
        
        // Scan active plugins
        $plugin_files = $this->get_plugin_files();
        foreach ($plugin_files as $file) {
            if ($this->add_file_hash($file, 'plugin')) {
                $files_added++;
            }
            $files_scanned++;
        }
        
        // Scan active theme
        $theme_files = $this->get_theme_files();
        foreach ($theme_files as $file) {
            if ($this->add_file_hash($file, 'theme')) {
                $files_added++;
            }
            $files_scanned++;
        }
        
        return array(
            'success' => true,
            'files_scanned' => $files_scanned,
            'files_added' => $files_added,
            'message' => sprintf(__('%d files scanned, %d added to baseline', 'promptfluid-defense'), $files_scanned, $files_added)
        );
    }
    
    /**
     * Check file integrity
     */
    public function check_integrity() {
        global $wpdb;
        
        $changes_detected = array();
        $files_checked = 0;
        
        // Get all monitored files
        $monitored_files = $wpdb->get_results("SELECT * FROM {$this->table_name}");
        
        foreach ($monitored_files as $file_record) {
            $current_hash = $this->calculate_file_hash($file_record->file_path);
            $files_checked++;
            
            if ($current_hash === false) {
                // File deleted
                $changes_detected[] = array(
                    'file' => $file_record->file_path,
                    'type' => 'deleted',
                    'severity' => 'high',
                    'original_hash' => $file_record->file_hash
                );
                
                $wpdb->update(
                    $this->table_name,
                    array('status' => 'deleted', 'last_checked' => current_time('mysql')),
                    array('id' => $file_record->id)
                );
                
            } elseif ($current_hash !== $file_record->file_hash) {
                // File modified
                $changes_detected[] = array(
                    'file' => $file_record->file_path,
                    'type' => 'modified',
                    'severity' => $this->assess_modification_severity($file_record->file_path),
                    'original_hash' => $file_record->file_hash,
                    'current_hash' => $current_hash
                );
                
                $wpdb->update(
                    $this->table_name,
                    array(
                        'status' => 'modified',
                        'last_checked' => current_time('mysql'),
                        'file_hash' => $current_hash
                    ),
                    array('id' => $file_record->id)
                );
                
                // Log to Brain
                $this->log_to_brain('file_modified', $file_record->file_path);
            } else {
                // File unchanged
                $wpdb->update(
                    $this->table_name,
                    array('last_checked' => current_time('mysql')),
                    array('id' => $file_record->id)
                );
            }
        }
        
        // Check for new files
        $new_files = $this->detect_new_files();
        foreach ($new_files as $new_file) {
            $changes_detected[] = array(
                'file' => $new_file,
                'type' => 'added',
                'severity' => 'medium'
            );
        }
        
        return array(
            'files_checked' => $files_checked,
            'changes_count' => count($changes_detected),
            'changes' => $changes_detected,
            'status' => count($changes_detected) === 0 ? 'clean' : 'modified'
        );
    }
    
    /**
     * Get WordPress core files
     */
    private function get_core_files() {
        $core_files = array();
        $scan_dirs = array(
            ABSPATH . 'wp-admin/',
            ABSPATH . 'wp-includes/',
            ABSPATH . 'wp-content/mu-plugins/'
        );
        
        foreach ($scan_dirs as $dir) {
            if (is_dir($dir)) {
                $files = $this->scan_directory($dir, array('php', 'js', 'css'));
                $core_files = array_merge($core_files, $files);
            }
        }
        
        // Add root files
        $root_files = glob(ABSPATH . '*.php');
        if ($root_files) {
            $core_files = array_merge($core_files, $root_files);
        }
        
        return array_slice($core_files, 0, 1000); // Limit to 1000 files
    }
    
    /**
     * Get plugin files
     */
    private function get_plugin_files() {
        $plugin_files = array();
        $active_plugins = get_option('active_plugins', array());
        
        foreach ($active_plugins as $plugin) {
            $plugin_path = WP_PLUGIN_DIR . '/' . dirname($plugin);
            if (is_dir($plugin_path)) {
                $files = $this->scan_directory($plugin_path, array('php'));
                $plugin_files = array_merge($plugin_files, $files);
            }
        }
        
        return array_slice($plugin_files, 0, 500); // Limit to 500 files per plugin
    }
    
    /**
     * Get theme files
     */
    private function get_theme_files() {
        $theme_files = array();
        $active_theme = wp_get_theme();
        $theme_path = $active_theme->get_stylesheet_directory();
        
        if (is_dir($theme_path)) {
            $files = $this->scan_directory($theme_path, array('php', 'js', 'css'));
            $theme_files = array_merge($theme_files, $files);
        }
        
        return array_slice($theme_files, 0, 500); // Limit to 500 files
    }
    
    /**
     * Scan directory recursively
     */
    private function scan_directory($dir, $extensions = array('php')) {
        $files = array();
        
        if (!is_dir($dir)) {
            return $files;
        }
        
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::SELF_FIRST
        );
        
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $extension = strtolower($file->getExtension());
                if (in_array($extension, $extensions)) {
                    $files[] = $file->getPathname();
                }
            }
        }
        
        return $files;
    }
    
    /**
     * Calculate file hash
     */
    private function calculate_file_hash($file_path) {
        if (!file_exists($file_path) || !is_readable($file_path)) {
            return false;
        }
        
        return hash_file('sha256', $file_path);
    }
    
    /**
     * Add file hash to database
     */
    private function add_file_hash($file_path, $file_type) {
        global $wpdb;
        
        $hash = $this->calculate_file_hash($file_path);
        if ($hash === false) {
            return false;
        }
        
        $file_size = filesize($file_path);
        
        $result = $wpdb->insert($this->table_name, array(
            'file_path' => $file_path,
            'file_hash' => $hash,
            'file_size' => $file_size,
            'file_type' => $file_type,
            'status' => 'clean'
        ));
        
        return $result !== false;
    }
    
    /**
     * Assess modification severity
     */
    private function assess_modification_severity($file_path) {
        // Core files are critical
        if (strpos($file_path, '/wp-admin/') !== false || strpos($file_path, '/wp-includes/') !== false) {
            return 'critical';
        }
        
        // PHP files are high risk
        if (pathinfo($file_path, PATHINFO_EXTENSION) === 'php') {
            return 'high';
        }
        
        return 'medium';
    }
    
    /**
     * Detect new files
     */
    private function detect_new_files() {
        global $wpdb;
        
        $new_files = array();
        $current_files = array();
        
        // Get current plugin files
        $plugin_files = $this->get_plugin_files();
        $current_files = array_merge($current_files, $plugin_files);
        
        // Check against database
        foreach ($current_files as $file) {
            $exists = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM {$this->table_name} WHERE file_path = %s",
                $file
            ));
            
            if (!$exists) {
                $new_files[] = $file;
            }
        }
        
        return $new_files;
    }
    
    /**
     * Log to Brain for AI learning
     */
    private function log_to_brain($event_type, $file_path) {
        if (!class_exists('PromptFluid_Defense_Smart_Learning')) {
            return;
        }
        
        // Log security event
        do_action('pfdef_security_event', array(
            'type' => $event_type,
            'module' => 'file_integrity',
            'severity' => 'high',
            'details' => array(
                'file' => $file_path,
                'timestamp' => current_time('mysql')
            )
        ));
    }
    
    /**
     * Get integrity status
     */
    public function get_status() {
        global $wpdb;
        
        $total_files = $wpdb->get_var("SELECT COUNT(*) FROM {$this->table_name}");
        $clean_files = $wpdb->get_var("SELECT COUNT(*) FROM {$this->table_name} WHERE status = 'clean'");
        $modified_files = $wpdb->get_var("SELECT COUNT(*) FROM {$this->table_name} WHERE status = 'modified'");
        $deleted_files = $wpdb->get_var("SELECT COUNT(*) FROM {$this->table_name} WHERE status = 'deleted'");
        
        $last_check = $wpdb->get_var("SELECT MAX(last_checked) FROM {$this->table_name}");
        
        return array(
            'total_files' => intval($total_files),
            'clean_files' => intval($clean_files),
            'modified_files' => intval($modified_files),
            'deleted_files' => intval($deleted_files),
            'last_check' => $last_check,
            'status' => $modified_files > 0 ? 'warning' : 'clean'
        );
    }
}
