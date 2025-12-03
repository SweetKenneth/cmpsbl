<?php
/**
 * Fired during plugin deactivation.
 *
 * @package PromptFluid_Reflex
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Reflex_Deactivator {
    
    /**
     * Actions performed on plugin deactivation.
     */
    public static function deactivate() {
        // Clear scheduled events using cron class (guarded)
        $cron_path = PFREFLEX_PLUGIN_DIR . 'includes/class-cron-jobs.php';
        if (file_exists($cron_path)) {
            require_once $cron_path;
        }
        if (class_exists('PromptFluid_Defense_Cron') && method_exists('PromptFluid_Defense_Cron', 'unschedule_jobs')) {
            PromptFluid_Defense_Cron::unschedule_jobs();
        }
        
        // Clear any cached data
        wp_cache_flush();
        
        // Clear activation redirect transient if it exists
        delete_transient('pfref_activation_redirect');
    }
}
