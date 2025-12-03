<?php
/**
 * The core plugin class.
 *
 * @package PromptFluid_Defense
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Defense {
    
    /**
     * The loader that's responsible for maintaining and registering all hooks.
     *
     * @var PromptFluid_Defense_Loader
     */
    protected $loader;
    
    /**
     * The unique identifier of this plugin.
     *
     * @var string
     */
    protected $plugin_name;
    
    /**
     * The current version of the plugin.
     *
     * @var string
     */
    protected $version;
    
    /**
     * Initialize the plugin.
     */
    public function __construct() {
        $this->version = PFDEF_VERSION;
        $this->plugin_name = 'promptfluid-defense';
        
        $this->load_dependencies();
        $this->define_admin_hooks();
        $this->define_public_hooks();
        $this->handle_activation_redirect();
    }
    
    /**
     * Load the required dependencies for this plugin.
     */
    private function load_dependencies() {
        require_once PFDEF_PLUGIN_DIR . 'includes/class-promptfluid-defense.php';
        require_once PFDEF_PLUGIN_DIR . 'includes/class-loader.php';
        require_once PFDEF_PLUGIN_DIR . 'includes/class-licensing.php';
        require_once PFDEF_PLUGIN_DIR . 'includes/class-ajax-handlers.php';
        require_once PFDEF_PLUGIN_DIR . 'includes/class-bot-detector.php';
        require_once PFDEF_PLUGIN_DIR . 'includes/class-behavioral-analyzer.php';
        require_once PFDEF_PLUGIN_DIR . 'includes/class-threat-scorer.php';
        require_once PFDEF_PLUGIN_DIR . 'includes/class-smart-learning.php';
        require_once PFDEF_PLUGIN_DIR . 'includes/class-cron-jobs.php';
        require_once PFDEF_PLUGIN_DIR . 'includes/class-behavioral-tracking.php';
        require_once PFDEF_PLUGIN_DIR . 'includes/class-logger.php';
        require_once PFDEF_PLUGIN_DIR . 'includes/class-wp-integration.php';
        require_once PFDEF_PLUGIN_DIR . 'includes/class-rest-api.php';
        require_once PFDEF_PLUGIN_DIR . 'includes/class-rest-api-protection.php';
        require_once PFDEF_PLUGIN_DIR . 'includes/class-frontend-protection.php';
        require_once PFDEF_PLUGIN_DIR . 'includes/class-analytics.php';
        require_once PFDEF_PLUGIN_DIR . 'includes/class-email-digest.php';
        require_once PFDEF_PLUGIN_DIR . 'includes/class-file-integrity.php';
        require_once PFDEF_PLUGIN_DIR . 'includes/class-firewall.php';
        require_once PFDEF_PLUGIN_DIR . 'includes/class-login-guard.php';
        require_once PFDEF_PLUGIN_DIR . 'includes/class-malware-scanner.php';
        require_once PFDEF_PLUGIN_DIR . 'admin/class-admin-dashboard.php';
        require_once PFDEF_PLUGIN_DIR . 'includes/class-dashboard-ajax.php';
        
        $this->loader = new PromptFluid_Defense_Loader();
        
        // Initialize cron jobs and behavioral tracking
        PromptFluid_Defense_Cron::init();
        PromptFluid_Defense_Behavioral_Tracking::init();
        PromptFluid_Defense_Email_Digest::schedule_digest();
        
        // Initialize new security modules (with feature gating)
        if (PromptFluid_Defense_Licensing::has_feature('firewall')) {
            new PromptFluid_Defense_Firewall();
        }
        if (PromptFluid_Defense_Licensing::has_feature('login_protection')) {
            new PromptFluid_Defense_Login_Guard();
        }
    }
    
    /**
     * Register all hooks related to admin area functionality.
     */
    private function define_admin_hooks() {
        $admin = new PromptFluid_Defense_Admin($this->get_plugin_name(), $this->get_version());
        
        $this->loader->add_action('admin_menu', $admin, 'add_plugin_admin_menu');
        $this->loader->add_action('admin_init', $admin, 'register_settings');
        $this->loader->add_action('admin_enqueue_scripts', $admin, 'enqueue_styles');
        $this->loader->add_action('admin_enqueue_scripts', $admin, 'enqueue_scripts');
    }
    
    /**
     * Register all hooks related to public-facing functionality.
     */
    private function define_public_hooks() {
        $wp_integration = new PromptFluid_Defense_WP_Integration();
        
        // Login protection
        $this->loader->add_filter('authenticate', $wp_integration, 'check_login_attempt', 30, 3);
        
        // Comment protection
        $this->loader->add_filter('preprocess_comment', $wp_integration, 'check_comment_submission');
        
        // Frontend protection layer
        new PromptFluid_Defense_Frontend_Protection();
    }
    
    /**
     * Run the loader to execute all hooks.
     */
    public function run() {
        $this->loader->run();
    }
    
    /**
     * The name of the plugin.
     */
    public function get_plugin_name() {
        return $this->plugin_name;
    }
    
    /**
     * Retrieve the version number.
     */
    public function get_version() {
        return $this->version;
    }
    
    /**
     * Handle activation redirect to setup wizard.
     */
    private function handle_activation_redirect() {
        if (get_option('pfdef_activation_redirect', false)) {
            delete_option('pfdef_activation_redirect');
            if (!isset($_GET['activate-multi'])) {
                wp_safe_redirect(admin_url('admin.php?page=promptfluid-reflex-wizard'));
                exit;
            }
        }
    }
}
