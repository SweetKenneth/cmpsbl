<?php
namespace BotSniper;

if (!defined('ABSPATH')) exit;

class Detector {
    
    private $api_base;
    private $api_key;
    private $threat_scorer;
    
    public function __construct() {
        $this->api_base = BOT_SNIPER_API_BASE;
        $this->api_key = get_option('bot_sniper_api_key');
        $this->threat_scorer = new ThreatScorer();
        
        add_action('init', [$this, 'detect_bot'], 1);
        add_action('init', [$this, 'pull_cloud_rules'], 5);
    }
    
    /**
     * Pull latest detection rules from cloud
     */
    public function pull_cloud_rules() {
        // Check if we need to refresh rules (cache for 1 hour)
        $cached_rules = get_transient('bot_sniper_cloud_rules');
        if ($cached_rules !== false) {
            return;
        }
        
        if (empty($this->api_key)) {
            return;
        }
        
        $response = wp_remote_get($this->api_base . '/pf-bot-sniper-rules', [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->api_key,
                'Content-Type' => 'application/json'
            ],
            'timeout' => 10
        ]);
        
        if (!is_wp_error($response)) {
            $body = wp_remote_retrieve_body($response);
            $rules = json_decode($body, true);
            
            if ($rules) {
                // Cache rules for 1 hour
                set_transient('bot_sniper_cloud_rules', $rules, 3600);
                update_option('bot_sniper_current_rules', $rules);
            }
        }
    }
    
    public function detect_bot() {
        // Skip detection for admin users
        if (is_admin() || current_user_can('manage_options')) {
            return;
        }
        
        // Skip if API key not configured
        if (empty($this->api_key)) {
            return;
        }
        
        $settings = get_option('bot_sniper_settings', [
            'detection_enabled' => true,
            'auto_block' => false,
            'threat_threshold' => 70,
            'log_retention_days' => 30
        ]);
        
        if (!$settings['detection_enabled']) {
            return;
        }
        
        // Use comprehensive threat scoring
        $threat_result = $this->threat_scorer->calculate_threat_score();
        
        // Take action if threat detected
        if ($threat_result['action'] === 'block') {
            $this->handle_threat($threat_result, $settings);
        }
    }
    
    private function collect_visitor_data() {
        return [
            'ip_address' => $this->get_client_ip(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'page_url' => $_SERVER['REQUEST_URI'] ?? '',
            'referer' => $_SERVER['HTTP_REFERER'] ?? '',
            'timestamp' => current_time('mysql'),
            'request_method' => $_SERVER['REQUEST_METHOD'] ?? 'GET'
        ];
    }
    
    private function get_client_ip() {
        $ip_keys = [
            'HTTP_CF_CONNECTING_IP',
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'REMOTE_ADDR'
        ];
        
        foreach ($ip_keys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = $_SERVER[$key];
                if (strpos($ip, ',') !== false) {
                    $ip = explode(',', $ip)[0];
                }
                return trim($ip);
            }
        }
        
        return '0.0.0.0';
    }
    
    private function call_detection_api($visitor_data) {
        $response = wp_remote_post($this->api_base . '/pf-bot-detection', [
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $this->api_key
            ],
            'body' => json_encode($visitor_data),
            'timeout' => 5
        ]);
        
        if (is_wp_error($response)) {
            return null;
        }
        
        $body = wp_remote_retrieve_body($response);
        return json_decode($body, true);
    }
    
    private function log_detection($visitor_data, $result) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'bot_sniper_logs';
        
        $wpdb->insert($table_name, [
            'ip_address' => $visitor_data['ip_address'],
            'user_agent' => $visitor_data['user_agent'],
            'threat_score' => $result['threat_score'] ?? 0,
            'risk_level' => $result['risk_level'] ?? 'human',
            'action_taken' => $result['action_taken'] ?? 'allow',
            'page_url' => $visitor_data['page_url'],
            'detected_at' => current_time('mysql'),
            'metadata' => json_encode($result)
        ]);
        
        // Clean up old logs
        $settings = get_option('bot_sniper_settings');
        $retention_days = $settings['log_retention_days'] ?? 30;
        
        $wpdb->query($wpdb->prepare(
            "DELETE FROM {$table_name} WHERE detected_at < DATE_SUB(NOW(), INTERVAL %d DAY)",
            $retention_days
        ));
    }
    
    private function handle_threat($result, $settings) {
        $threat_score = $result['threat_score'] ?? 0;
        $threshold = $settings['threat_threshold'] ?? 70;
        
        if ($threat_score >= $threshold && $settings['auto_block']) {
            wp_die(
                sprintf(
                    '<h1>Access Denied</h1><p>%s</p><p>If you believe this is an error, please contact the site administrator.</p>',
                    esc_html($result['reason'])
                ),
                'Bot Sniper: Access Denied',
                ['response' => 403]
            );
        }
    }
}
