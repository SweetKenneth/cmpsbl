<?php
/**
 * Analytics Page Template
 *
 * @package PromptFluid_Reflex
 */

// If this file is called directly, abort.
if (!defined('ABSPATH')) {
    exit;
}

// Verify user has permission
if (!current_user_can('manage_options')) {
    wp_die(__('You do not have sufficient permissions to access this page.'));
}

$analytics = new PromptFluid_Defense_Analytics();
$stats = $analytics->get_dashboard_stats('7d');
?>

<div id="pfdef-analytics-page" class="wrap pfdef-analytics-container">
    <div class="pfdef-analytics-header">
        <h1><?php _e('Analytics & Reporting', 'promptfluid-reflex'); ?></h1>
        <div class="pfdef-analytics-controls">
            <select class="pfdef-period-selector">
                <option value="24h"><?php _e('Last 24 Hours', 'promptfluid-reflex'); ?></option>
                <option value="7d" selected><?php _e('Last 7 Days', 'promptfluid-reflex'); ?></option>
                <option value="30d"><?php _e('Last 30 Days', 'promptfluid-reflex'); ?></option>
            </select>
            <button id="pfdef-export-csv" class="pfdef-export-btn">
                <?php _e('Export CSV', 'promptfluid-reflex'); ?>
            </button>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="pfdef-stats-grid">
        <div class="pfdef-stat-card">
            <h3><?php _e('Total Detections', 'promptfluid-reflex'); ?></h3>
            <div class="value"><?php echo number_format($stats['total_detections']); ?></div>
        </div>
        <div class="pfdef-stat-card">
            <h3><?php _e('Blocked Threats', 'promptfluid-reflex'); ?></h3>
            <div class="value"><?php echo number_format($stats['blocked_threats']); ?></div>
        </div>
        <div class="pfdef-stat-card">
            <h3><?php _e('Challenged Requests', 'promptfluid-reflex'); ?></h3>
            <div class="value"><?php echo number_format($stats['challenged_requests']); ?></div>
        </div>
        <div class="pfdef-stat-card">
            <h3><?php _e('Avg Threat Score', 'promptfluid-reflex'); ?></h3>
            <div class="value"><?php echo $stats['avg_threat_score']; ?></div>
        </div>
    </div>

    <!-- Charts Grid -->
    <div class="pfdef-charts-grid">
        <!-- Detection Trends Chart -->
        <div class="pfdef-chart-card full-width">
            <h2><?php _e('Detection Trends', 'promptfluid-reflex'); ?></h2>
            <canvas id="pfdef-trends-chart" class="pfdef-chart-canvas"></canvas>
        </div>

        <!-- Action Distribution Chart -->
        <div class="pfdef-chart-card">
            <h2><?php _e('Action Distribution', 'promptfluid-reflex'); ?></h2>
            <canvas id="pfdef-distribution-chart" class="pfdef-chart-canvas"></canvas>
        </div>

        <!-- Threat Types Chart -->
        <div class="pfdef-chart-card">
            <h2><?php _e('Threat Types', 'promptfluid-reflex'); ?></h2>
            <canvas id="pfdef-threat-types-chart" class="pfdef-chart-canvas"></canvas>
        </div>
    </div>

    <!-- Top IPs Table -->
    <div class="pfdef-table-card">
        <h2><?php _e('Top Threat IPs', 'promptfluid-reflex'); ?></h2>
        <table id="pfdef-top-ips-table" class="pfdef-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th><?php _e('IP Address', 'promptfluid-reflex'); ?></th>
                    <th><?php _e('Total Requests', 'promptfluid-reflex'); ?></th>
                    <th><?php _e('Avg Score', 'promptfluid-reflex'); ?></th>
                    <th><?php _e('Blocked', 'promptfluid-reflex'); ?></th>
                </tr>
            </thead>
            <tbody>
                <tr><td colspan="5" class="no-data"><?php _e('Loading...', 'promptfluid-reflex'); ?></td></tr>
            </tbody>
        </table>
    </div>

    <!-- Email Digest Settings -->
    <div class="pfdef-table-card">
        <h2><?php _e('Email Digest Settings', 'promptfluid-reflex'); ?></h2>
        <form method="post" action="options.php">
            <?php settings_fields('pfdef_email_digest_settings'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row"><?php _e('Digest Frequency', 'promptfluid-reflex'); ?></th>
                    <td>
                        <select name="pfdef_email_frequency">
                            <option value="never" <?php selected(get_option('pfdef_email_frequency', 'daily'), 'never'); ?>><?php _e('Never', 'promptfluid-reflex'); ?></option>
                            <option value="daily" <?php selected(get_option('pfdef_email_frequency', 'daily'), 'daily'); ?>><?php _e('Daily', 'promptfluid-reflex'); ?></option>
                            <option value="weekly" <?php selected(get_option('pfdef_email_frequency', 'daily'), 'weekly'); ?>><?php _e('Weekly', 'promptfluid-reflex'); ?></option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php _e('Email Address', 'promptfluid-reflex'); ?></th>
                    <td>
                        <input type="email" name="pfdef_digest_email" value="<?php echo esc_attr(get_option('pfdef_digest_email', get_option('admin_email'))); ?>" class="regular-text" />
                    </td>
                </tr>
            </table>
            <?php submit_button(__('Save Email Settings', 'promptfluid-reflex')); ?>
        </form>
    </div>
</div>

<script>
// Localize analytics config
var pfdefAnalytics = {
    apiUrl: '<?php echo rest_url('pfdef/v1/analytics/'); ?>',
    adminUrl: '<?php echo admin_url('admin-ajax.php'); ?>',
    nonce: '<?php echo wp_create_nonce('wp_rest'); ?>'
};
</script>
