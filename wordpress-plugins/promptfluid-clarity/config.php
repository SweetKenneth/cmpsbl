<?php
/**
 * PromptFluid Clarity Configuration
 * Nexus-only routing (no Lovable AI dependencies)
 */

if (!defined('ABSPATH')) {
    exit;
}

// Nexus API Configuration
define('PF_NEXUS_API', getenv('PF_NEXUS_API') ?: 'https://spobyzaevtmijcwbqzmv.supabase.co/functions/v1');
define('PF_BRAIN_ENDPOINT', getenv('PF_BRAIN_ENDPOINT') ?: 'https://spobyzaevtmijcwbqzmv.supabase.co/functions/v1/pf-brain-learn');
define('PF_NEXUS_ROUTER', getenv('PF_NEXUS_ROUTER') ?: 'https://spobyzaevtmijcwbqzmv.supabase.co/functions/v1/pf-nexus-router');
define('PF_ENV', getenv('PF_ENV') ?: 'production');

// API Authentication
define('PFCLARITY_API_KEY', get_option('pfclarity_api_key', ''));
define('PFCLARITY_SERVICE_KEY', getenv('PFCLARITY_SERVICE_KEY') ?: '');

// Feature Flags
define('PFCLARITY_ENABLE_AUTO_FIX', true);
define('PFCLARITY_ENABLE_SCHEDULED_SCANS', true);
define('PFCLARITY_ENABLE_AI_SUGGESTIONS', true);

// Scan Configuration
define('PFCLARITY_MAX_PAGES_PER_SCAN', 100);
define('PFCLARITY_SCAN_TIMEOUT', 300); // seconds
define('PFCLARITY_SCAN_INTERVAL', 'daily'); // daily, weekly, monthly

// Licensing Configuration
define('PFCLARITY_TRIAL_DAYS', 7);
define('PFCLARITY_LICENSE_CHECK_INTERVAL', 86400); // 24 hours

// Logging Configuration
define('PFCLARITY_LOG_LEVEL', getenv('PFCLARITY_LOG_LEVEL') ?: 'info'); // debug, info, warning, error
define('PFCLARITY_LOG_RETENTION_DAYS', 30);

// Database Table Names
global $wpdb;
define('PFCLARITY_TABLE_SCANS', $wpdb->prefix . 'pfclarity_scans');
define('PFCLARITY_TABLE_ISSUES', $wpdb->prefix . 'pfclarity_issues');
define('PFCLARITY_TABLE_FIXES', $wpdb->prefix . 'pfclarity_fixes');
define('PFCLARITY_TABLE_LOGS', $wpdb->prefix . 'pfclarity_logs');
