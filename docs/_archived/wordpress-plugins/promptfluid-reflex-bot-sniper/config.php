<?php
/**
 * PromptFluid Clarity Configuration
 */

if (!defined('ABSPATH')) {
    exit;
}

// API Configuration
define('PFCLARITY_API_BASE', getenv('PFCLARITY_API_BASE') ?: 'https://hxgbibtkftocyrnuzxwd.supabase.co/functions/v1');
define('PFCLARITY_API_KEY', getenv('PFCLARITY_API_KEY') ?: '');

// Stripe Configuration
define('PFCLARITY_STRIPE_PUBLISHABLE_KEY', getenv('PFCLARITY_STRIPE_PUBLISHABLE_KEY') ?: '');

// Feature Flags
define('PFCLARITY_ENABLE_AUTO_FIX', true);
define('PFCLARITY_ENABLE_SCHEDULED_SCANS', true);
define('PFCLARITY_SCAN_INTERVAL', 'daily'); // daily, weekly, monthly

// Scan Configuration
define('PFCLARITY_MAX_PAGES_PER_SCAN', 100);
define('PFCLARITY_SCAN_TIMEOUT', 300); // seconds

// Trial Configuration
define('PFCLARITY_TRIAL_DAYS', 7);
