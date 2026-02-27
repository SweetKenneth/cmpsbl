<?php
/**
 * Email Digest System
 *
 * Sends scheduled email reports with threat intelligence
 *
 * @package PromptFluid_Defense
 */

// If this file is called directly, abort.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Email Digest Class
 */
class PromptFluid_Defense_Email_Digest {

    /**
     * Schedule email digest cron job
     */
    public static function schedule_digest() {
        $frequency = get_option('pfdef_email_frequency', 'daily');
        
        // Clear existing schedules
        wp_clear_scheduled_hook('pfdef_send_email_digest');

        // Schedule new digest
        if ($frequency !== 'never' && !wp_next_scheduled('pfdef_send_email_digest')) {
            wp_schedule_event(time(), $frequency, 'pfdef_send_email_digest');
        }
    }

    /**
     * Send email digest
     */
    public static function send_digest() {
        $analytics = new PromptFluid_Defense_Analytics();
        $frequency = get_option('pfdef_email_frequency', 'daily');
        
        // Get period based on frequency
        $period = $frequency === 'daily' ? '24h' : '7d';
        
        $data = $analytics->get_email_digest_data($period);
        
        // Get recipient email
        $to = get_option('pfdef_digest_email', get_option('admin_email'));
        
        // Generate email content
        $subject = sprintf(
            __('PromptFluid Defense - %s Security Report', 'promptfluid-defense'),
            ucfirst($frequency)
        );
        
        $message = self::generate_email_html($data);
        
        // Set email headers
        $headers = array(
            'Content-Type: text/html; charset=UTF-8',
            'From: ' . get_bloginfo('name') . ' <' . get_option('admin_email') . '>'
        );
        
        // Send email
        wp_mail($to, $subject, $message, $headers);
        
        // Log the digest send
        error_log('PromptFluid Defense: Email digest sent to ' . $to);
    }

    /**
     * Generate HTML email content
     *
     * @param array $data Digest data
     * @return string HTML content
     */
    private static function generate_email_html($data) {
        $stats = $data['stats'];
        $top_ips = $data['top_ips'];
        $threat_types = $data['threat_types'];
        $period_label = $stats['period'] === '24h' ? 'Last 24 Hours' : 'Last 7 Days';

        ob_start();
        ?>
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .header h1 { margin: 0; font-size: 24px; }
                .stats { display: flex; flex-wrap: wrap; gap: 10px; margin: 20px 0; }
                .stat-card { flex: 1; min-width: 150px; background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #7A5FFF; }
                .stat-card h3 { margin: 0 0 5px 0; font-size: 14px; color: #666; }
                .stat-card .value { font-size: 28px; font-weight: bold; color: #1a1a1a; }
                .section { margin: 30px 0; }
                .section h2 { font-size: 18px; color: #1a1a1a; border-bottom: 2px solid #7A5FFF; padding-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; }
                table th { background: #f8f9fa; padding: 10px; text-align: left; font-size: 14px; }
                table td { padding: 10px; border-bottom: 1px solid #e5e5e5; font-size: 14px; }
                .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center; color: #999; font-size: 12px; }
                .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
                .badge-high { background: #fee; color: #c33; }
                .badge-medium { background: #fef3cd; color: #856404; }
                .badge-low { background: #d4edda; color: #155724; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🛡️ Security Report</h1>
                    <p><?php echo esc_html($period_label); ?></p>
                </div>

                <div class="stats">
                    <div class="stat-card">
                        <h3>Total Detections</h3>
                        <div class="value"><?php echo number_format($stats['total_detections']); ?></div>
                    </div>
                    <div class="stat-card">
                        <h3>Blocked Threats</h3>
                        <div class="value"><?php echo number_format($stats['blocked_threats']); ?></div>
                    </div>
                    <div class="stat-card">
                        <h3>Avg Threat Score</h3>
                        <div class="value"><?php echo $stats['avg_threat_score']; ?></div>
                    </div>
                </div>

                <?php if (!empty($top_ips)) : ?>
                <div class="section">
                    <h2>Top Threat IPs</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>IP Address</th>
                                <th>Requests</th>
                                <th>Avg Score</th>
                                <th>Blocked</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($top_ips as $ip) : ?>
                            <tr>
                                <td><code><?php echo esc_html($ip['ip']); ?></code></td>
                                <td><?php echo number_format($ip['total_requests']); ?></td>
                                <td><?php echo round($ip['avg_threat_score'], 1); ?></td>
                                <td><?php echo number_format($ip['blocked_count']); ?></td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
                <?php endif; ?>

                <?php if (!empty($threat_types)) : ?>
                <div class="section">
                    <h2>Threat Types</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Count</th>
                                <th>Avg Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($threat_types as $type) : ?>
                            <tr>
                                <td><?php echo esc_html(ucwords(str_replace('_', ' ', $type['threat_type']))); ?></td>
                                <td><?php echo number_format($type['count']); ?></td>
                                <td>
                                    <?php 
                                    $score = round($type['avg_score'], 1);
                                    $badge_class = $score >= 70 ? 'badge-high' : ($score >= 40 ? 'badge-medium' : 'badge-low');
                                    ?>
                                    <span class="badge <?php echo $badge_class; ?>"><?php echo $score; ?></span>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
                <?php endif; ?>

                <div class="footer">
                    <p><strong>PromptFluid Defense</strong> - AI-Powered Bot Protection</p>
                    <p>Protected by <a href="https://www.promptfluid.com">PromptFluid</a></p>
                </div>
            </div>
        </body>
        </html>
        <?php
        return ob_get_clean();
    }
}

// Register cron hooks
add_action('pfdef_send_email_digest', array('PromptFluid_Defense_Email_Digest', 'send_digest'));
