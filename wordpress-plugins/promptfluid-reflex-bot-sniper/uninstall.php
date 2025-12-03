<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * @package PromptFluid_Defense
 */

// If uninstall not called from WordPress, then exit.
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

global $wpdb;

// Delete plugin options
delete_option('pfdef_settings');
delete_option('pfdef_version');
delete_option('pfdef_db_version');
delete_option('pfdef_activation_redirect');

// Delete plugin tables
$detections_table = $wpdb->prefix . 'pfdef_detections';
$heatmap_table = $wpdb->prefix . 'pfdef_heatmap';
$learning_table = $wpdb->prefix . 'pfdef_learning';

$wpdb->query("DROP TABLE IF EXISTS {$detections_table}");
$wpdb->query("DROP TABLE IF EXISTS {$heatmap_table}");
$wpdb->query("DROP TABLE IF EXISTS {$learning_table}");

// Clear any cached data
wp_cache_flush();
