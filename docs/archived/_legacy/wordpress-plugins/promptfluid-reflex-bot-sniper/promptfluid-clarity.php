<?php
/**
 * Plugin Name: PromptFluid Clarity
 * Plugin URI: https://www.promptfluid.com/clarity
 * Description: AI-Powered WCAG 2.2 Accessibility Scanner for WordPress
 * Version: 3.0.0
 * Author: PromptFluid
 * Author URI: https://www.promptfluid.com
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: promptfluid-clarity
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit;
}

// Plugin constants
define('PFCLARITY_VERSION', '3.0.0');
define('PFCLARITY_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('PFCLARITY_PLUGIN_URL', plugin_dir_url(__FILE__));
define('PFCLARITY_PLUGIN_FILE', __FILE__);

// Load configuration
require_once PFCLARITY_PLUGIN_DIR . 'config.php';

// Load core classes
require_once PFCLARITY_PLUGIN_DIR . 'includes/class-database.php';
require_once PFCLARITY_PLUGIN_DIR . 'includes/class-api-client.php';
require_once PFCLARITY_PLUGIN_DIR . 'includes/class-scanner.php';
require_once PFCLARITY_PLUGIN_DIR . 'includes/class-subscription.php';
require_once PFCLARITY_PLUGIN_DIR . 'includes/class-admin.php';
require_once PFCLARITY_PLUGIN_DIR . 'includes/class-cron.php';

/**
 * Plugin activation hook
 */
function pfclarity_activate() {
    PromptFluid_Clarity_Database::create_tables();
    PromptFluid_Clarity_Cron::schedule_jobs();
    set_transient('pfclarity_activation_redirect', true, 30);
}
register_activation_hook(__FILE__, 'pfclarity_activate');

/**
 * Plugin deactivation hook
 */
function pfclarity_deactivate() {
    PromptFluid_Clarity_Cron::clear_jobs();
}
register_deactivation_hook(__FILE__, 'pfclarity_deactivate');

/**
 * Initialize the plugin
 */
function pfclarity_init() {
    if (is_admin()) {
        new PromptFluid_Clarity_Admin();
    }
    new PromptFluid_Clarity_Cron();
}
add_action('plugins_loaded', 'pfclarity_init');

/**
 * Handle activation redirect
 */
function pfclarity_activation_redirect() {
    if (get_transient('pfclarity_activation_redirect')) {
        delete_transient('pfclarity_activation_redirect');
        if (!isset($_GET['activate-multi'])) {
            wp_safe_redirect(admin_url('admin.php?page=promptfluid-clarity'));
            exit;
        }
    }
}
add_action('admin_init', 'pfclarity_activation_redirect');
