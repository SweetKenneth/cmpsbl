<?php
/**
 * REST API endpoints for React admin.
 *
 * @package PromptFluid_Defense
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Defense_REST_API {
    
    /**
     * Register REST API routes.
     */
    public static function register_routes() {
        // Register protection endpoint
        require_once PFDEF_PLUGIN_DIR . 'includes/class-rest-api-protection.php';
        $protection = new PromptFluid_Defense_REST_Protection();
        $protection->register_routes();
        
        // Register analytics endpoints
        register_rest_route('pfdef/v1/analytics', '/trends', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_trends'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('pfdef/v1/analytics', '/distribution', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_distribution'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('pfdef/v1/analytics', '/top-ips', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_top_ips'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('pfdef/v1/analytics', '/threat-types', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_threat_types'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('pfdef/v1', '/stats', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_stats'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('pfdef/v1', '/detections', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_detections'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('pfdef/v1', '/settings', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_settings'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('pfdef/v1', '/settings', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'update_settings'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('pfdef/v1', '/learning/stats', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_learning_stats'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('pfdef/v1', '/learning/enable', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'enable_learning_mode'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('pfdef/v1', '/threat-score', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'calculate_threat_score'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
    }
    
    /**
     * Check user permissions.
     */
    public static function check_permissions() {
        return current_user_can('manage_options');
    }
    
    /**
     * Get dashboard statistics.
     */
    public static function get_stats($request) {
        global $wpdb;
        
        $detections_table = $wpdb->prefix . 'pfdef_detections';
        $learning_table = $wpdb->prefix . 'pfdef_learning';
        
        $blocks_today = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$detections_table} 
             WHERE action_taken = 'blocked' 
             AND DATE(timestamp) = %s",
            current_time('Y-m-d')
        ));
        
        $blocks_week = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$detections_table} 
             WHERE action_taken = 'blocked' 
             AND timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
        ));
        
        $threats_detected = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$detections_table}"
        );
        
        $learning_patterns = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$learning_table}"
        );
        
        return rest_ensure_response(array(
            'blocksToday' => intval($blocks_today),
            'blocksWeek' => intval($blocks_week),
            'threatsDetected' => intval($threats_detected),
            'learningPatterns' => intval($learning_patterns)
        ));
    }
    
    /**
     * Get recent detections.
     */
    public static function get_detections($request) {
        global $wpdb;
        
        $limit = $request->get_param('limit') ?: 20;
        $detections_table = $wpdb->prefix . 'pfdef_detections';
        
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT timestamp, ip, threat_type, threat_score, action_taken, details 
             FROM {$detections_table} 
             ORDER BY timestamp DESC 
             LIMIT %d",
            $limit
        ), ARRAY_A);
        
        return rest_ensure_response($results);
    }
    
    /**
     * Get current settings.
     */
    public static function get_settings($request) {
        $settings = get_option('pfdef_settings');
        return rest_ensure_response($settings);
    }
    
    /**
     * Update settings.
     */
    public static function update_settings($request) {
        $params = $request->get_json_params();
        $current_settings = get_option('pfdef_settings');
        
        // Merge and sanitize
        $updated_settings = array_merge($current_settings, array(
            'enabled' => isset($params['enabled']) ? (bool)$params['enabled'] : $current_settings['enabled'],
            'protection_mode' => in_array($params['protection_mode'], array('monitor', 'challenge', 'block')) 
                ? $params['protection_mode'] 
                : $current_settings['protection_mode'],
            'sensitivity' => in_array($params['sensitivity'], array('low', 'medium', 'high')) 
                ? $params['sensitivity'] 
                : $current_settings['sensitivity'],
            'smart_learning' => isset($params['smart_learning']) ? (bool)$params['smart_learning'] : $current_settings['smart_learning'],
            'api_key' => isset($params['api_key']) ? sanitize_text_field($params['api_key']) : $current_settings['api_key']
        ));
        
        update_option('pfdef_settings', $updated_settings);
        
        return rest_ensure_response(array(
            'success' => true,
            'settings' => $updated_settings
        ));
    }
    
    /**
     * Get learning statistics.
     */
    public static function get_learning_stats($request) {
        require_once PFDEF_PLUGIN_DIR . 'includes/class-smart-learning.php';
        $learning = new PromptFluid_Defense_Smart_Learning();
        $stats = $learning->get_learning_stats();
        
        return rest_ensure_response($stats);
    }
    
    /**
     * Calculate threat score for current request.
     */
    public static function calculate_threat_score($request) {
        require_once PFDEF_PLUGIN_DIR . 'includes/class-threat-scorer.php';
        $scorer = new PromptFluid_Defense_Threat_Scorer();
        $result = $scorer->calculate_threat_score();
        
        return rest_ensure_response($result);
    }
    
    /**
     * Get analytics trends
     */
    public static function get_trends($request) {
        require_once PFDEF_PLUGIN_DIR . 'includes/class-analytics.php';
        $analytics = new PromptFluid_Defense_Analytics();
        $period = $request->get_param('period') ?: '7d';
        $data = $analytics->get_detection_trends($period);
        
        return rest_ensure_response($data);
    }
    
    /**
     * Get action distribution
     */
    public static function get_distribution($request) {
        require_once PFDEF_PLUGIN_DIR . 'includes/class-analytics.php';
        $analytics = new PromptFluid_Defense_Analytics();
        $period = $request->get_param('period') ?: '7d';
        $data = $analytics->get_action_distribution($period);
        
        return rest_ensure_response($data);
    }
    
    /**
     * Get top threat IPs
     */
    public static function get_top_ips($request) {
        require_once PFDEF_PLUGIN_DIR . 'includes/class-analytics.php';
        $analytics = new PromptFluid_Defense_Analytics();
        $period = $request->get_param('period') ?: '7d';
        $limit = $request->get_param('limit') ?: 10;
        $data = $analytics->get_top_threat_ips($limit, $period);
        
        return rest_ensure_response($data);
    }
    
    /**
     * Get threat types
     */
    public static function get_threat_types($request) {
        require_once PFDEF_PLUGIN_DIR . 'includes/class-analytics.php';
        $analytics = new PromptFluid_Defense_Analytics();
        $period = $request->get_param('period') ?: '7d';
        $data = $analytics->get_threat_types($period);
        
        return rest_ensure_response($data);
    }
    
    /**
     * Enable learning mode
     */
    public static function enable_learning_mode($request) {
        require_once PFDEF_PLUGIN_DIR . 'includes/class-smart-learning.php';
        $learning = new PromptFluid_Defense_Smart_Learning();
        $duration = $request->get_param('duration') ?: 7;
        
        return rest_ensure_response($learning->enable_learning_mode($duration));
    }
}

// Register routes on REST API init
add_action('rest_api_init', array('PromptFluid_Defense_REST_API', 'register_routes'));
