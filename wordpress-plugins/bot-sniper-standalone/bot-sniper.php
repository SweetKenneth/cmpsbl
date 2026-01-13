<?php
/**
 * Plugin Name: promptfluid® bot sniper
 * Plugin URI: https://promptfluid.com/bot-sniper
 * Description: Defense intelligence substrate for WordPress — behavioral bot detection powered by the promptfluid® cognitive orchestration substrate.
 * Version: 1.0.0
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * Author: promptfluid®
 * Author URI: https://promptfluid.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: bot-sniper
 * 
 * promptfluid® is a cognitive orchestration substrate that provides routing, memory, learning cycles,
 * observability, defense, and execution coordination for AI systems.
 * 
 * For licensing inquiries: promptfluid@gmail.com | (760) FLUID-AI
 */

if (!defined('ABSPATH')) exit;

define('BOT_SNIPER_VERSION', '1.0.0');
define('BOT_SNIPER_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('BOT_SNIPER_PLUGIN_URL', plugin_dir_url(__FILE__));
define('BOT_SNIPER_API_BASE', 'https://spobyzaevtmijcwbqzmv.supabase.co/functions/v1');

// Autoload classes
spl_autoload_register(function ($class) {
    $prefix = 'BotSniper\\';
    $base_dir = BOT_SNIPER_PLUGIN_DIR . 'includes/';
    
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) return;
    
    $relative_class = substr($class, $len);
    $file = $base_dir . 'class-' . strtolower(str_replace('\\', '-', $relative_class)) . '.php';
    
    if (file_exists($file)) require $file;
});

// Main plugin class
class BotSniper {
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        add_action('plugins_loaded', [$this, 'init']);
        register_activation_hook(__FILE__, [$this, 'activate']);
        register_deactivation_hook(__FILE__, [$this, 'deactivate']);
    }
    
    public function init() {
        if (is_admin()) {
            new BotSniper\Admin();
        }
        
        // Only run detection if API key configured
        $api_key = get_option('bot_sniper_api_key');
        if ($api_key) {
            new BotSniper\Detector();
            new BotSniper\Dashboard();
            new BotSniper\WPIntegration();
        }
    }
    
    public function activate() {
        // Create options
        add_option('bot_sniper_api_key', '');
        add_option('bot_sniper_subscription_tier', 'none');
        add_option('bot_sniper_settings', [
            'detection_enabled' => true,
            'auto_block' => false,
            'threat_threshold' => 70,
            'log_retention_days' => 30
        ]);
        add_option('bot_sniper_learning_mode', [
            'enabled' => false,
            'start_date' => null,
            'duration_days' => 7,
            'baseline_ready' => false
        ]);
        
        // Create detection logs table
        global $wpdb;
        $table_name = $wpdb->prefix . 'bot_sniper_logs';
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            ip_address varchar(45) NOT NULL,
            user_agent text,
            threat_score int(3) DEFAULT 0,
            risk_level varchar(20) DEFAULT 'human',
            action_taken varchar(20) DEFAULT 'allow',
            page_url text,
            detected_at datetime DEFAULT CURRENT_TIMESTAMP,
            metadata text,
            PRIMARY KEY (id),
            KEY ip_address (ip_address),
            KEY detected_at (detected_at)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
        
        // Create learning and fingerprinting tables
        require_once BOT_SNIPER_PLUGIN_DIR . 'includes/class-smart-learning.php';
        \BotSniper\SmartLearning::create_tables();
        
        flush_rewrite_rules();
    }
    
    public function deactivate() {
        flush_rewrite_rules();
    }
}

// Initialize plugin
BotSniper::get_instance();
