<?php
/**
 * Analytics Aggregation and Processing
 *
 * Handles data aggregation, trend analysis, and statistics generation
 *
 * @package PromptFluid_Defense
 */

// If this file is called directly, abort.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Analytics Class
 */
class PromptFluid_Defense_Analytics {

    /**
     * Get dashboard statistics
     *
     * @param string $period Time period (24h, 7d, 30d)
     * @return array
     */
    public function get_dashboard_stats($period = '24h') {
        global $wpdb;
        $table_name = $wpdb->prefix . 'pfdef_detections';

        $interval = $this->get_interval_sql($period);

        // Total detections
        $total_detections = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$table_name} WHERE timestamp >= DATE_SUB(NOW(), INTERVAL %s)",
            $interval
        ));

        // Blocked threats
        $blocked_threats = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$table_name} 
             WHERE action_taken = 'blocked' 
             AND timestamp >= DATE_SUB(NOW(), INTERVAL %s)",
            $interval
        ));

        // Challenged requests
        $challenged_requests = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$table_name} 
             WHERE action_taken = 'challenged' 
             AND timestamp >= DATE_SUB(NOW(), INTERVAL %s)",
            $interval
        ));

        // Average threat score
        $avg_threat_score = $wpdb->get_var($wpdb->prepare(
            "SELECT AVG(threat_score) FROM {$table_name} 
             WHERE timestamp >= DATE_SUB(NOW(), INTERVAL %s)",
            $interval
        ));

        // Unique IPs
        $unique_ips = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(DISTINCT ip) FROM {$table_name} 
             WHERE timestamp >= DATE_SUB(NOW(), INTERVAL %s)",
            $interval
        ));

        return array(
            'total_detections' => intval($total_detections),
            'blocked_threats' => intval($blocked_threats),
            'challenged_requests' => intval($challenged_requests),
            'allowed_requests' => intval($total_detections) - intval($blocked_threats) - intval($challenged_requests),
            'avg_threat_score' => round(floatval($avg_threat_score), 2),
            'unique_ips' => intval($unique_ips),
            'period' => $period
        );
    }

    /**
     * Get detection trends over time
     *
     * @param string $period Time period (24h, 7d, 30d)
     * @return array
     */
    public function get_detection_trends($period = '7d') {
        global $wpdb;
        $table_name = $wpdb->prefix . 'pfdef_detections';

        $interval = $this->get_interval_sql($period);
        $group_by = $this->get_group_by_sql($period);

        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT 
                {$group_by} as time_period,
                COUNT(*) as total,
                SUM(CASE WHEN action_taken = 'blocked' THEN 1 ELSE 0 END) as blocked,
                SUM(CASE WHEN action_taken = 'challenged' THEN 1 ELSE 0 END) as challenged,
                SUM(CASE WHEN action_taken = 'allowed' THEN 1 ELSE 0 END) as allowed
             FROM {$table_name}
             WHERE timestamp >= DATE_SUB(NOW(), INTERVAL %s)
             GROUP BY time_period
             ORDER BY time_period ASC",
            $interval
        ), ARRAY_A);

        return $results;
    }

    /**
     * Get top threat IPs
     *
     * @param int $limit Number of IPs to return
     * @param string $period Time period
     * @return array
     */
    public function get_top_threat_ips($limit = 10, $period = '7d') {
        global $wpdb;
        $table_name = $wpdb->prefix . 'pfdef_detections';

        $interval = $this->get_interval_sql($period);

        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT 
                ip,
                COUNT(*) as total_requests,
                AVG(threat_score) as avg_threat_score,
                SUM(CASE WHEN action_taken = 'blocked' THEN 1 ELSE 0 END) as blocked_count,
                MAX(timestamp) as last_seen
             FROM {$table_name}
             WHERE timestamp >= DATE_SUB(NOW(), INTERVAL %s)
             GROUP BY ip
             ORDER BY avg_threat_score DESC, total_requests DESC
             LIMIT %d",
            $interval,
            $limit
        ), ARRAY_A);

        return $results;
    }

    /**
     * Get action distribution
     *
     * @param string $period Time period
     * @return array
     */
    public function get_action_distribution($period = '7d') {
        global $wpdb;
        $table_name = $wpdb->prefix . 'pfdef_detections';

        $interval = $this->get_interval_sql($period);

        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT 
                action_taken,
                COUNT(*) as count
             FROM {$table_name}
             WHERE timestamp >= DATE_SUB(NOW(), INTERVAL %s)
             GROUP BY action_taken",
            $interval
        ), ARRAY_A);

        return $results;
    }

    /**
     * Get threat type distribution
     *
     * @param string $period Time period
     * @return array
     */
    public function get_threat_types($period = '7d') {
        global $wpdb;
        $table_name = $wpdb->prefix . 'pfdef_detections';

        $interval = $this->get_interval_sql($period);

        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT 
                threat_type,
                COUNT(*) as count,
                AVG(threat_score) as avg_score
             FROM {$table_name}
             WHERE timestamp >= DATE_SUB(NOW(), INTERVAL %s)
             GROUP BY threat_type
             ORDER BY count DESC",
            $interval
        ), ARRAY_A);

        return $results;
    }

    /**
     * Get risk level heatmap data
     *
     * @param string $period Time period
     * @return array
     */
    public function get_risk_heatmap($period = '7d') {
        global $wpdb;
        $table_name = $wpdb->prefix . 'pfdef_detections';

        $interval = $this->get_interval_sql($period);

        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT 
                HOUR(timestamp) as hour,
                DATE_FORMAT(timestamp, '%%w') as day_of_week,
                COUNT(*) as count,
                AVG(threat_score) as avg_threat_score
             FROM {$table_name}
             WHERE timestamp >= DATE_SUB(NOW(), INTERVAL %s)
             GROUP BY hour, day_of_week
             ORDER BY day_of_week, hour",
            $interval
        ), ARRAY_A);

        return $results;
    }

    /**
     * Get interval SQL based on period
     *
     * @param string $period
     * @return string
     */
    private function get_interval_sql($period) {
        switch ($period) {
            case '24h':
                return '1 DAY';
            case '7d':
                return '7 DAY';
            case '30d':
                return '30 DAY';
            default:
                return '7 DAY';
        }
    }

    /**
     * Get GROUP BY SQL based on period
     *
     * @param string $period
     * @return string
     */
    private function get_group_by_sql($period) {
        switch ($period) {
            case '24h':
                return "DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00')";
            case '7d':
                return "DATE_FORMAT(timestamp, '%Y-%m-%d')";
            case '30d':
                return "DATE_FORMAT(timestamp, '%Y-%m-%d')";
            default:
                return "DATE_FORMAT(timestamp, '%Y-%m-%d')";
        }
    }

    /**
     * Export data to CSV
     *
     * @param string $period Time period
     * @return string CSV content
     */
    public function export_to_csv($period = '7d') {
        global $wpdb;
        $table_name = $wpdb->prefix . 'pfdef_detections';

        $interval = $this->get_interval_sql($period);

        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT 
                timestamp,
                ip,
                threat_type,
                threat_score,
                action_taken,
                details
             FROM {$table_name}
             WHERE timestamp >= DATE_SUB(NOW(), INTERVAL %s)
             ORDER BY timestamp DESC",
            $interval
        ), ARRAY_A);

        // Generate CSV
        $csv = "Timestamp,IP Address,Threat Type,Threat Score,Action Taken,Details\n";
        
        foreach ($results as $row) {
            $csv .= sprintf(
                '"%s","%s","%s",%s,"%s","%s"' . "\n",
                $row['timestamp'],
                $row['ip'],
                $row['threat_type'],
                $row['threat_score'],
                $row['action_taken'],
                str_replace('"', '""', $row['details'])
            );
        }

        return $csv;
    }

    /**
     * Get analytics summary for email digest
     *
     * @param string $period Time period
     * @return array
     */
    public function get_email_digest_data($period = '24h') {
        $stats = $this->get_dashboard_stats($period);
        $top_ips = $this->get_top_threat_ips(5, $period);
        $threat_types = $this->get_threat_types($period);

        return array(
            'stats' => $stats,
            'top_ips' => $top_ips,
            'threat_types' => $threat_types,
            'period' => $period
        );
    }
}
