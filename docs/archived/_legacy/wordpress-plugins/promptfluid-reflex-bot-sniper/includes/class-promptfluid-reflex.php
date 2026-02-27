<?php
/**
 * The core Reflex plugin class (singleton pattern).
 *
 * @package PromptFluid_Reflex
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Reflex {
    /**
     * Singleton instance
     */
    private static $instance = null;

    /** @var string */
    protected $plugin_name;
    /** @var string */
    protected $version;
    /** @var mixed */
    protected $loader;

    /**
     * Get singleton instance
     */
    public static function instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Initialize the plugin.
     */
    private function __construct() {
        $this->version = defined('PFREFLEX_VERSION') ? PFREFLEX_VERSION : '1.0.0';
        $this->plugin_name = 'promptfluid-reflex';

        $this->load_dependencies();
        $this->define_admin_hooks();
        $this->define_public_hooks();
    }

    /**
     * Prevent cloning
     */
    private function __clone() {}

    /**
     * Prevent unserializing
     */
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }

    /**
     * Load the required dependencies for this plugin.
     * Keep minimal to avoid missing-file fatals.
     */
    private function load_dependencies() {
        // Minimal dependency: loader only (optional)
        $loader_path = PFREFLEX_PLUGIN_DIR . 'includes/class-loader.php';
        if (file_exists($loader_path)) {
            require_once $loader_path;
            $this->loader = new PromptFluid_Defense_Loader();
        } else {
            // Fallback lightweight loader-shim if loader is not available
            $this->loader = new class {
                public function add_action($hook, $component, $callback, $priority = 10, $accepted_args = 1) {
                    add_action($hook, [$component, $callback], $priority, $accepted_args);
                }
                public function add_filter($hook, $component, $callback, $priority = 10, $accepted_args = 1) {
                    add_filter($hook, [$component, $callback], $priority, $accepted_args);
                }
                public function run() {}
            };
        }
    }

    /**
     * Register all hooks related to admin area functionality.
     */
    private function define_admin_hooks() {
        $this->loader->add_action('admin_menu', $this, 'add_plugin_admin_menu');
        $this->loader->add_action('admin_init', $this, 'register_settings');
        $this->loader->add_action('admin_enqueue_scripts', $this, 'enqueue_styles');
        $this->loader->add_action('admin_enqueue_scripts', $this, 'enqueue_scripts');
    }

    /**
     * Register all hooks related to public-facing functionality.
     */
    private function define_public_hooks() {
        // Minimal for now — add public hooks here when modules are available
    }

    /**
     * Run the loader to execute all hooks.
     */
    public function run() {
        if (method_exists($this->loader, 'run')) {
            $this->loader->run();
        }
    }

    // ----------------------
    // Admin area
    // ----------------------

    /**
     * Add admin menu and wizard pages so redirects land correctly.
     */
    public function add_plugin_admin_menu() {
        $cap = 'manage_options';

        add_menu_page(
            __('PromptFluid Reflex', 'promptfluid-reflex-bot-sniper'),
            'PromptFluid',
            $cap,
            'promptfluid-reflex',
            [$this, 'render_dashboard_page'],
            'dashicons-shield',
            65
        );

        add_submenu_page(
            'promptfluid-reflex',
            __('Setup Wizard', 'promptfluid-reflex-bot-sniper'),
            __('Setup Wizard', 'promptfluid-reflex-bot-sniper'),
            $cap,
            'promptfluid-reflex-wizard',
            [$this, 'render_wizard_page']
        );
    }

    /**
     * Register minimal settings.
     */
    public function register_settings() {
        register_setting('promptfluid_reflex', 'pfdef_wizard_completed', [
            'type' => 'boolean',
            'sanitize_callback' => function ($val) { return (bool)$val; },
            'default' => false,
        ]);
    }

    public function enqueue_styles() {
        // Placeholder for admin styles
    }

    public function enqueue_scripts() {
        // Placeholder for admin scripts
    }

    /**
     * Render main dashboard page.
     */
    public function render_dashboard_page() {
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'promptfluid-reflex-bot-sniper'));
        }
        ?>
        <div class="wrap">
            <h1><?php esc_html_e('PromptFluid Reflex — Dashboard', 'promptfluid-reflex-bot-sniper'); ?></h1>
            <p><?php esc_html_e('Bot Sniper is active. Use the setup wizard to finish configuration.', 'promptfluid-reflex-bot-sniper'); ?></p>
            <p>
                <a href="<?php echo esc_url(admin_url('admin.php?page=promptfluid-reflex-wizard')); ?>" class="button button-primary">
                    <?php esc_html_e('Open Setup Wizard', 'promptfluid-reflex-bot-sniper'); ?>
                </a>
            </p>
        </div>
        <?php
    }

    /**
     * Render setup wizard page.
     */
    public function render_wizard_page() {
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'promptfluid-reflex-bot-sniper'));
        }
        $completed = (bool) get_option('pfdef_wizard_completed', false);
        ?>
        <div class="wrap">
            <h1><?php esc_html_e('PromptFluid Reflex — Setup Wizard', 'promptfluid-reflex-bot-sniper'); ?></h1>
            <?php if ($completed): ?>
                <div class="notice notice-success"><p><?php esc_html_e('Wizard already completed. You can re-run or adjust settings below.', 'promptfluid-reflex-bot-sniper'); ?></p></div>
            <?php endif; ?>
            <form method="post" action="options.php">
                <?php settings_fields('promptfluid_reflex'); ?>
                <p>
                    <label>
                        <input type="checkbox" name="pfdef_wizard_completed" value="1" <?php checked($completed, true); ?> />
                        <?php esc_html_e('Mark setup as completed', 'promptfluid-reflex-bot-sniper'); ?>
                    </label>
                </p>
                <?php submit_button(__('Save', 'promptfluid-reflex-bot-sniper')); ?>
            </form>
        </div>
        <?php
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
}
