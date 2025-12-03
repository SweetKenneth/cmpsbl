<?php
/**
 * Plugin Name: PromptFluid Clarity
 * Plugin URI: https://www.promptfluid.com/clarity
 * Description: AI-powered WCAG 2.2 accessibility scanner with intelligent remediation via PromptFluid Nexus
 * Version: 3.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: PromptFluid
 * Author URI: https://www.promptfluid.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: promptfluid-clarity
 * Domain Path: /languages
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Define plugin constants
define('PFCLARITY_VERSION', '3.0.0');
define('PFCLARITY_PLUGIN_FILE', __FILE__);
define('PFCLARITY_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('PFCLARITY_PLUGIN_URL', plugin_dir_url(__FILE__));
define('PFCLARITY_PLUGIN_BASENAME', plugin_basename(__FILE__));

// Load configuration
require_once PFCLARITY_PLUGIN_DIR . 'config.php';

// Composer autoloader
if (file_exists(PFCLARITY_PLUGIN_DIR . 'vendor/autoload.php')) {
    require_once PFCLARITY_PLUGIN_DIR . 'vendor/autoload.php';
}

// Manual class loader fallback
spl_autoload_register(function ($class) {
    $prefix = 'PromptFluid_Clarity_';
    $base_dir = PFCLARITY_PLUGIN_DIR . 'includes/';
    
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    
    $relative_class = substr($class, $len);
    $file = $base_dir . 'class-clarity-' . strtolower(str_replace('_', '-', $relative_class)) . '.php';
    
    if (file_exists($file)) {
        require $file;
    }
});

/**
 * Initialize the plugin
 */
function pfclarity_init() {
    PromptFluid_Clarity_Core::instance();
}
add_action('plugins_loaded', 'pfclarity_init');

/**
 * Activation hook
 */
function pfclarity_activate() {
    require_once PFCLARITY_PLUGIN_DIR . 'includes/class-clarity-core.php';
    PromptFluid_Clarity_Core::activate();
}
register_activation_hook(__FILE__, 'pfclarity_activate');

/**
 * Deactivation hook
 */
function pfclarity_deactivate() {
    require_once PFCLARITY_PLUGIN_DIR . 'includes/class-clarity-core.php';
    PromptFluid_Clarity_Core::deactivate();
}
register_deactivation_hook(__FILE__, 'pfclarity_deactivate');
