<?php
/**
 * AJAX Handlers for Admin Interface
 *
 * @package PromptFluid_Defense
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Defense_Ajax_Handlers {
    
    /**
     * Initialize AJAX handlers
     */
    public static function init() {
        // Trial start handler
        add_action('wp_ajax_pfdef_start_trial', array(__CLASS__, 'handle_start_trial'));
        
        // License activation/deactivation
        add_action('wp_ajax_pfdef_activate_license', array(__CLASS__, 'handle_activate_license'));
        add_action('wp_ajax_pfdef_deactivate_license', array(__CLASS__, 'handle_deactivate_license'));
        
        // Feature availability check
        add_action('wp_ajax_pfdef_check_feature', array(__CLASS__, 'handle_check_feature'));
        
        // Stripe integration handlers
        add_action('wp_ajax_pfdef_create_checkout', array(__CLASS__, 'handle_create_checkout'));
        add_action('wp_ajax_pfdef_customer_portal', array(__CLASS__, 'handle_customer_portal'));
        add_action('wp_ajax_pfdef_check_subscription', array(__CLASS__, 'handle_check_subscription'));
    }
    
    /**
     * Handle trial start request
     */
    public static function handle_start_trial() {
        check_ajax_referer('pfdef_trial', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array(
                'message' => __('Permission denied.', 'promptfluid-defense')
            ));
        }
        
        require_once PFDEF_PLUGIN_DIR . 'includes/class-licensing.php';
        
        $tier = isset($_POST['tier']) ? sanitize_text_field($_POST['tier']) : 'pro';
        $result = PromptFluid_Defense_Licensing::start_trial($tier);
        
        if ($result) {
            // Log telemetry event
            PromptFluid_Defense_Licensing::log_tier_conversion('lite', $tier);
            
            wp_send_json_success(array(
                'message' => sprintf(__('Trial started successfully! You now have 3 days to try %s features.', 'promptfluid-defense'), ucfirst($tier))
            ));
        } else {
            wp_send_json_error(array(
                'message' => __('Could not start trial. You may have already used your trial.', 'promptfluid-defense')
            ));
        }
    }
    
    /**
     * Handle license activation
     */
    public static function handle_activate_license() {
        check_ajax_referer('pfdef_license', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array(
                'message' => __('Permission denied.', 'promptfluid-defense')
            ));
        }
        
        require_once PFDEF_PLUGIN_DIR . 'includes/class-licensing.php';
        
        $license_key = isset($_POST['license_key']) ? sanitize_text_field($_POST['license_key']) : '';
        $email = isset($_POST['email']) ? sanitize_email($_POST['email']) : '';
        
        $result = PromptFluid_Defense_Licensing::activate_license($license_key, $email);
        
        if ($result['success']) {
            // Log telemetry
            $current_tier = PromptFluid_Defense_Licensing::get_current_tier();
            PromptFluid_Defense_Licensing::log_tier_conversion('lite', $current_tier);
            
            wp_send_json_success($result);
        } else {
            wp_send_json_error($result);
        }
    }
    
    /**
     * Handle license deactivation
     */
    public static function handle_deactivate_license() {
        check_ajax_referer('pfdef_license', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array(
                'message' => __('Permission denied.', 'promptfluid-defense')
            ));
        }
        
        require_once PFDEF_PLUGIN_DIR . 'includes/class-licensing.php';
        
        $result = PromptFluid_Defense_Licensing::deactivate_license();
        
        if ($result['success']) {
            wp_send_json_success($result);
        } else {
            wp_send_json_error($result);
        }
    }
    
    /**
     * Check if a feature is available
     */
    public static function handle_check_feature() {
        check_ajax_referer('pfdef_feature_check', 'nonce');
        
        require_once PFDEF_PLUGIN_DIR . 'includes/class-licensing.php';
        
        $feature = isset($_POST['feature']) ? sanitize_text_field($_POST['feature']) : '';
        $has_feature = PromptFluid_Defense_Licensing::has_feature($feature);
        
        if ($has_feature) {
            wp_send_json_success(array(
                'has_feature' => true
            ));
        } else {
            $required_tier = PromptFluid_Defense_Licensing::get_required_tier($feature);
            wp_send_json_error(array(
                'has_feature' => false,
                'required_tier' => $required_tier,
                'upgrade_url' => PromptFluid_Defense_Licensing::get_upgrade_url($required_tier)
            ));
        }
    }
    
    /**
     * Handle Stripe checkout creation
     */
    public static function handle_create_checkout() {
        check_ajax_referer('pfdef_stripe_checkout', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array(
                'message' => __('Permission denied.', 'promptfluid-defense')
            ));
        }
        
        $price_id = isset($_POST['price_id']) ? sanitize_text_field($_POST['price_id']) : '';
        $tier = isset($_POST['tier']) ? sanitize_text_field($_POST['tier']) : '';
        $interval = isset($_POST['interval']) ? sanitize_text_field($_POST['interval']) : 'month';
        
        if (empty($price_id)) {
            wp_send_json_error(array(
                'message' => __('Invalid price ID.', 'promptfluid-defense')
            ));
        }
        
        // Get admin email for Stripe customer
        $admin_email = get_option('admin_email');
        $site_url = get_site_url();
        
        // PromptFluid Supabase configuration (hardcoded for plugin distribution)
        $supabase_url = 'https://hxgbibtkftocyrnuzxwd.supabase.co';
        $supabase_anon_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4Z2JpYnRrZnRvY3lybnV6eHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3OTM5OTEsImV4cCI6MjA3NzM2OTk5MX0.F5EBcIKn54gp5Os_L4wPmkmtg5pAJsbCZUKNwa59CZk';
        
        // Log for debugging
        error_log(sprintf(
            '[PromptFluid Reflex] Creating checkout: tier=%s, interval=%s, price_id=%s, email=%s',
            $tier, $interval, $price_id, $admin_email
        ));
        
        // Call Supabase edge function to create checkout session
        $response = wp_remote_post($supabase_url . '/functions/v1/defense-create-checkout', array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'apikey' => $supabase_anon_key
            ),
            'body' => json_encode(array(
                'priceId' => $price_id,
                'tier' => $tier,
                'billingInterval' => $interval,
                'email' => $admin_email,
                'success_url' => admin_url('admin.php?page=promptfluid-reflex-upgrade&checkout=success'),
                'cancel_url' => admin_url('admin.php?page=promptfluid-reflex-upgrade&checkout=cancelled'),
                'metadata' => array(
                    'site_url' => $site_url,
                    'plugin_version' => '1.5.2'
                )
            )),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            $error_message = $response->get_error_message();
            error_log('[PromptFluid Reflex] Checkout error: ' . $error_message);
            wp_send_json_error(array(
                'message' => sprintf(__('Payment system connection error: %s', 'promptfluid-reflex'), $error_message)
            ));
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        error_log(sprintf(
            '[PromptFluid Reflex] Checkout response: status=%d, body=%s',
            $status_code, $body
        ));
        
        if ($status_code === 200 && isset($data['url'])) {
            wp_send_json_success(array(
                'url' => $data['url']
            ));
        } else {
            $error_msg = isset($data['error']) ? $data['error'] : __('Unknown error creating checkout session.', 'promptfluid-reflex');
            error_log('[PromptFluid Reflex] Checkout failed: ' . $error_msg);
            wp_send_json_error(array(
                'message' => sprintf(__('Checkout error: %s', 'promptfluid-reflex'), $error_msg)
            ));
        }
    }
    
    /**
     * Handle customer portal session creation
     */
    public static function handle_customer_portal() {
        check_ajax_referer('pfdef_customer_portal', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array(
                'message' => __('Permission denied.', 'promptfluid-reflex')
            ));
        }
        
        $admin_email = get_option('admin_email');
        $return_url = admin_url('admin.php?page=promptfluid-reflex-upgrade');
        
        // PromptFluid Supabase configuration (hardcoded for plugin distribution)
        $supabase_url = 'https://hxgbibtkftocyrnuzxwd.supabase.co';
        $supabase_anon_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4Z2JpYnRrZnRvY3lybnV6eHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3OTM5OTEsImV4cCI6MjA3NzM2OTk5MX0.F5EBcIKn54gp5Os_L4wPmkmtg5pAJsbCZUKNwa59CZk';
        
        // Call Supabase edge function to create portal session
        $response = wp_remote_post($supabase_url . '/functions/v1/defense-customer-portal', array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'apikey' => $supabase_anon_key
            ),
            'body' => json_encode(array(
                'email' => $admin_email,
                'return_url' => $return_url
            )),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error(array(
                'message' => __('Error connecting to payment system.', 'promptfluid-reflex')
            ));
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        if (isset($body['url'])) {
            wp_send_json_success(array(
                'url' => $body['url']
            ));
        } else {
            wp_send_json_error(array(
                'message' => __('Error opening customer portal.', 'promptfluid-reflex')
            ));
        }
    }
    
    /**
     * Check subscription status
     */
    public static function handle_check_subscription() {
        check_ajax_referer('pfdef_subscription_check', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array(
                'message' => __('Permission denied.', 'promptfluid-reflex')
            ));
        }
        
        $admin_email = get_option('admin_email');
        
        // PromptFluid Supabase configuration (hardcoded for plugin distribution)
        $supabase_url = 'https://hxgbibtkftocyrnuzxwd.supabase.co';
        $supabase_anon_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4Z2JpYnRrZnRvY3lybnV6eHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3OTM5OTEsImV4cCI6MjA3NzM2OTk5MX0.F5EBcIKn54gp5Os_L4wPmkmtg5pAJsbCZUKNwa59CZk';
        
        // Call Supabase edge function to check subscription
        $response = wp_remote_post($supabase_url . '/functions/v1/defense-check-subscription', array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'apikey' => $supabase_anon_key
            ),
            'body' => json_encode(array(
                'email' => $admin_email
            )),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error(array(
                'message' => __('Error checking subscription status.', 'promptfluid-reflex')
            ));
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        if (isset($body['subscribed'])) {
            wp_send_json_success($body);
        } else {
            wp_send_json_error(array(
                'message' => __('Error retrieving subscription status.', 'promptfluid-reflex')
            ));
        }
    }
}

// Initialize AJAX handlers
PromptFluid_Defense_Ajax_Handlers::init();
