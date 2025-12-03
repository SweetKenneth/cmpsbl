<?php
namespace BotSniper;

if (!defined('ABSPATH')) exit;

class Dashboard {
    
    public function __construct() {
        add_action('wp_ajax_bot_sniper_stats', [$this, 'get_stats']);
        add_action('wp_ajax_bot_sniper_recent_logs', [$this, 'get_recent_logs']);
    }
    
    public function get_stats() {
        check_ajax_referer('bot_sniper_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Unauthorized']);
        }
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'bot_sniper_logs';
        
        // Total detections today
        $today_detections = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$table_name} WHERE DATE(detected_at) = CURDATE()"
        );
        
        // Threats blocked today
        $today_blocks = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$table_name} 
            WHERE DATE(detected_at) = CURDATE() AND action_taken = 'block'"
        );
        
        // Total detections (all time)
        $total_detections = $wpdb->get_var("SELECT COUNT(*) FROM {$table_name}");
        
        // Threat breakdown
        $threat_breakdown = $wpdb->get_results(
            "SELECT risk_level, COUNT(*) as count 
            FROM {$table_name} 
            WHERE DATE(detected_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY risk_level"
        );
        
        wp_send_json_success([
            'today_detections' => intval($today_detections),
            'today_blocks' => intval($today_blocks),
            'total_detections' => intval($total_detections),
            'threat_breakdown' => $threat_breakdown
        ]);
    }
    
    public function get_recent_logs() {
        check_ajax_referer('bot_sniper_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Unauthorized']);
        }
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'bot_sniper_logs';
        
        $logs = $wpdb->get_results(
            "SELECT * FROM {$table_name} 
            ORDER BY detected_at DESC 
            LIMIT 20"
        );
        
        wp_send_json_success(['logs' => $logs]);
    }
}
