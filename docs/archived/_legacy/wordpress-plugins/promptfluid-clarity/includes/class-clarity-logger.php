<?php
/**
 * Logging System
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Clarity_Logger {
    
    /**
     * Log message to database
     */
    public static function log($message, $level = 'info', $context = null) {
        global $wpdb;
        
        // Check if logging level is enabled
        $enabled_levels = ['debug', 'info', 'warning', 'error'];
        $min_level_index = array_search(PFCLARITY_LOG_LEVEL, $enabled_levels);
        $current_level_index = array_search($level, $enabled_levels);
        
        if ($current_level_index < $min_level_index) {
            return; // Skip logging below configured level
        }
        
        $wpdb->insert(
            PFCLARITY_TABLE_LOGS,
            [
                'log_level' => $level,
                'message' => $message,
                'context' => $context ? json_encode($context) : null
            ],
            ['%s', '%s', '%s']
        );
        
        // Also log to PHP error log for errors
        if ($level === 'error') {
            error_log('[PromptFluid Clarity] ' . $message);
        }
    }
    
    /**
     * Get recent logs
     */
    public static function get_logs($limit = 100, $level = null) {
        global $wpdb;
        
        $where = '';
        if ($level) {
            $where = $wpdb->prepare(' WHERE log_level = %s', $level);
        }
        
        return $wpdb->get_results(
            "SELECT * FROM " . PFCLARITY_TABLE_LOGS . $where . " ORDER BY created_at DESC LIMIT " . intval($limit)
        );
    }
    
    /**
     * Clean old logs
     */
    public static function cleanup_old_logs() {
        global $wpdb;
        
        $retention_date = date('Y-m-d H:i:s', strtotime('-' . PFCLARITY_LOG_RETENTION_DAYS . ' days'));
        
        $deleted = $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM " . PFCLARITY_TABLE_LOGS . " WHERE created_at < %s",
                $retention_date
            )
        );
        
        self::log("Cleaned up {$deleted} old log entries", 'info');
    }
}
