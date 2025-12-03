<?php
/**
 * Uninstall script - Clean up plugin data
 */

if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

global $wpdb;

// Define table names
$tables = [
    $wpdb->prefix . 'pfclarity_scans',
    $wpdb->prefix . 'pfclarity_issues',
    $wpdb->prefix . 'pfclarity_fixes',
    $wpdb->prefix . 'pfclarity_logs'
];

// Drop all plugin tables
foreach ($tables as $table) {
    $wpdb->query("DROP TABLE IF EXISTS {$table}");
}

// Remove all plugin options
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE 'pfclarity_%'");

// Clear any cached data
wp_cache_flush();
