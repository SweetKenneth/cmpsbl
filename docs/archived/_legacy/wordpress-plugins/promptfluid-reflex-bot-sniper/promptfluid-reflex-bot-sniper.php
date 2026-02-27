<?php
/**
 * Plugin Name: promptfluid® reflex – bot sniper
 * Plugin URI: https://promptfluid.com/products/reflex
 * Description: Defense intelligence substrate: WAF, malware scan, login guard, file integrity, and Smart Learning — part of the promptfluid® cognitive orchestration substrate.
 * Version: 1.5.7
 * Author: promptfluid®
 * Author URI: https://promptfluid.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: promptfluid-reflex-bot-sniper
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * 
 * promptfluid® is a cognitive orchestration substrate that provides routing, memory, learning cycles,
 * observability, defense, and execution coordination for AI systems.
 * 
 * For licensing inquiries: promptfluid@gmail.com | (760) FLUID-AI
 */

// If this file is called directly, abort.
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants (Reflex)
if (!defined('PFREFLEX_VERSION')) define('PFREFLEX_VERSION', '1.5.7');
if (!defined('PFREFLEX_PLUGIN_DIR')) define('PFREFLEX_PLUGIN_DIR', plugin_dir_path(__FILE__));
if (!defined('PFREFLEX_PLUGIN_URL')) define('PFREFLEX_PLUGIN_URL', plugin_dir_url(__FILE__));
if (!defined('PFREFLEX_PLUGIN_BASENAME')) define('PFREFLEX_PLUGIN_BASENAME', plugin_basename(__FILE__));
if (!defined('PFREFLEX_DB_VERSION')) define('PFREFLEX_DB_VERSION', '1.5.7');

// Backward-compat constants (Defense) so existing includes don't break
if (!defined('PFDEF_VERSION')) define('PFDEF_VERSION', PFREFLEX_VERSION);
if (!defined('PFDEF_PLUGIN_DIR')) define('PFDEF_PLUGIN_DIR', PFREFLEX_PLUGIN_DIR);
if (!defined('PFDEF_PLUGIN_URL')) define('PFDEF_PLUGIN_URL', PFREFLEX_PLUGIN_URL);
if (!defined('PFDEF_PLUGIN_BASENAME')) define('PFDEF_PLUGIN_BASENAME', PFREFLEX_PLUGIN_BASENAME);
if (!defined('PFDEF_DB_VERSION')) define('PFDEF_DB_VERSION', PFREFLEX_DB_VERSION);

/**
 * Activation hook
 */
function activate_promptfluid_reflex_bot_sniper() {
    // Load and run legacy Defense activator (back-compat) if present
    $def_activator = PFREFLEX_PLUGIN_DIR . 'includes/class-activator.php';
    if (file_exists($def_activator)) {
        require_once $def_activator;
        if (class_exists('PromptFluid_Defense_Activator')) {
            PromptFluid_Defense_Activator::activate();
        }
    }

    // Reflex-specific activation
    update_option('pfreflex_enabled', true);
    if (!get_option('pfdef_wizard_completed', null)) {
        add_option('pfdef_wizard_completed', false);
    }
    // Flag redirect for next admin request
    add_option('pfref_activation_redirect', 1);
}

/**
 * Deactivation hook
 */
function deactivate_promptfluid_reflex_bot_sniper() {
    require_once PFREFLEX_PLUGIN_DIR . 'includes/class-deactivator.php';
    if (class_exists('PromptFluid_Reflex_Deactivator')) {
        PromptFluid_Reflex_Deactivator::deactivate();
    }
}

register_activation_hook(__FILE__, 'activate_promptfluid_reflex_bot_sniper');
register_deactivation_hook(__FILE__, 'deactivate_promptfluid_reflex_bot_sniper');

/**
 * Handle activation redirect after menus are registered
 */
function pfref_maybe_redirect_after_activation() {
    if (!is_admin() || !current_user_can('manage_options')) {
        return;
    }
    if (!get_option('pfref_activation_redirect')) {
        return;
    }
    // Clear the flag so it only happens once
    delete_option('pfref_activation_redirect');

    // Don't redirect on bulk activation
    if (isset($_GET['activate-multi'])) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        return;
    }

    $wizard_completed = get_option('pfdef_wizard_completed', false);
    $target_slug = $wizard_completed ? 'promptfluid-reflex' : 'promptfluid-reflex-wizard';
    $url = menu_page_url($target_slug, false);
    if (!$url) {
        $url = admin_url('admin.php?page=' . $target_slug);
    }
    wp_safe_redirect($url);
    exit;
}
add_action('admin_menu', 'pfref_maybe_redirect_after_activation', 9999);

/**
 * Load core plugin class
 */
$core_class = PFREFLEX_PLUGIN_DIR . 'includes/class-promptfluid-reflex.php';
if (file_exists($core_class)) {
    require_once $core_class;
} else {
    // Graceful fail: prevent fatal if file missing in packaged zip
    add_action('admin_notices', function() use ($core_class) {
        echo '<div class="notice notice-error"><p>';
        echo esc_html(sprintf('PromptFluid Reflex: missing core file: %s. Please re-upload the plugin ensuring the "includes" folder is present.', $core_class));
        echo '</p></div>';
    });
    return;
}

/**
 * Fallback admin pages registration to avoid access errors if core class fails to register menus
 */
function pfref_register_fallback_admin_pages() {
    if (!is_admin()) return;
    $cap = 'manage_options';

    global $admin_page_hooks, $submenu;

    // Top-level Dashboard page (only if not already registered)
    if (empty($admin_page_hooks['promptfluid-reflex'])) {
        add_menu_page(
            __('PromptFluid Reflex', 'promptfluid-reflex-bot-sniper'),
            'PromptFluid',
            $cap,
            'promptfluid-reflex',
            'pfref_render_dashboard_page',
            'dashicons-shield',
            65
        );
    }

    // Wizard submenu (guard against duplicates)
    $has_wizard = false;
    if (isset($submenu['promptfluid-reflex'])) {
        foreach ($submenu['promptfluid-reflex'] as $item) {
            if (isset($item[2]) && $item[2] === 'promptfluid-reflex-wizard') { $has_wizard = true; break; }
        }
    }
    if (!$has_wizard) {
        add_submenu_page(
            'promptfluid-reflex',
            __('Setup Wizard', 'promptfluid-reflex-bot-sniper'),
            __('Setup Wizard', 'promptfluid-reflex-bot-sniper'),
            $cap,
            'promptfluid-reflex-wizard',
            'pfref_render_wizard_page'
        );
    }
}
add_action('admin_menu', 'pfref_register_fallback_admin_pages', 5);

// Fallback renderers that delegate to core class when available
function pfref_render_dashboard_page() {
    if (!current_user_can('manage_options')) {
        wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'promptfluid-reflex-bot-sniper'));
    }
    if (class_exists('PromptFluid_Reflex')) {
        return PromptFluid_Reflex::instance()->render_dashboard_page();
    }
    echo '<div class="wrap"><h1>' . esc_html__('PromptFluid Reflex — Dashboard', 'promptfluid-reflex-bot-sniper') . '</h1>';
    echo '<p>' . esc_html__('Bot Sniper is active. Use the setup wizard to finish configuration.', 'promptfluid-reflex-bot-sniper') . '</p>';
    echo '<p><a class="button button-primary" href="' . esc_url(admin_url('admin.php?page=promptfluid-reflex-wizard')) . '">' . esc_html__('Open Setup Wizard', 'promptfluid-reflex-bot-sniper') . '</a></p></div>';
}

function pfref_render_wizard_page() {
    if (!current_user_can('manage_options')) {
        wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'promptfluid-reflex-bot-sniper'));
    }
    if (class_exists('PromptFluid_Reflex')) {
        return PromptFluid_Reflex::instance()->render_wizard_page();
    }
    $completed = (bool) get_option('pfdef_wizard_completed', false);
    echo '<div class="wrap">';
    echo '<h1>' . esc_html__('PromptFluid Reflex — Setup Wizard', 'promptfluid-reflex-bot-sniper') . '</h1>';
    if ($completed) {
        echo '<div class="notice notice-success"><p>' . esc_html__('Wizard already completed. You can re-run or adjust settings below.', 'promptfluid-reflex-bot-sniper') . '</p></div>';
    }
    echo '<form method="post" action="options.php">';
    settings_fields('promptfluid_reflex');
    echo '<p><label><input type="checkbox" name="pfdef_wizard_completed" value="1" ' . checked($completed, true, false) . ' /> ' . esc_html__('Mark setup as completed', 'promptfluid-reflex-bot-sniper') . '</label></p>';
    submit_button(esc_html__('Save', 'promptfluid-reflex-bot-sniper'));
    echo '</form></div>';
}

/**
 * Begin execution
 */
function run_promptfluid_reflex_bot_sniper() {
    if (class_exists('PromptFluid_Reflex')) {
        $plugin = PromptFluid_Reflex::instance();
        $plugin->run();
    }
}
add_action('plugins_loaded', 'run_promptfluid_reflex_bot_sniper', 20);
