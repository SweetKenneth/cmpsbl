<?php
/**
 * Enhanced Main Dashboard with Real-Time Controls
 *
 * @package PromptFluid_Reflex
 */

if (!defined('ABSPATH')) {
    exit;
}

// Load all security modules
require_once PFDEF_PLUGIN_DIR . 'includes/class-bot-detector.php';
require_once PFDEF_PLUGIN_DIR . 'includes/class-file-integrity.php';
require_once PFDEF_PLUGIN_DIR . 'includes/class-firewall.php';
require_once PFDEF_PLUGIN_DIR . 'includes/class-login-guard.php';
require_once PFDEF_PLUGIN_DIR . 'includes/class-malware-scanner.php';
require_once PFDEF_PLUGIN_DIR . 'includes/class-analytics.php';

// Get current settings
$settings = get_option('promptfluid_defense_settings', array(
    'enabled' => true,
    'sensitivity' => 'medium',
    'whitelist_ips' => '',
    'anonymize_ips' => true,
    'log_retention_days' => 30
));

$bot_detector = new PromptFluid_Defense_Bot_Detector();
$file_integrity = new PromptFluid_Defense_File_Integrity();
$firewall = new PromptFluid_Defense_Firewall();
$login_guard = new PromptFluid_Defense_Login_Guard();
$malware_scanner = new PromptFluid_Defense_Malware_Scanner();
$analytics = new PromptFluid_Defense_Analytics();

// Get stats
$bot_stats = $bot_detector->get_stats();
$integrity_status = $file_integrity->get_status();
$firewall_stats = $firewall->get_stats();
$login_stats = $login_guard->get_stats();
$malware_stats = $malware_scanner->get_stats();
$analytics_data = $analytics->get_stats();

// Calculate overall security score
$security_score = 100;
$security_score -= min(20, $integrity_status['modified_files'] * 5);
$security_score -= ($firewall_stats['hits_24h'] > 50) ? 10 : 0;
$security_score -= ($login_stats['failed_24h'] > 20) ? 15 : 0;
$security_score -= ($malware_stats['latest_scan'] && $malware_stats['latest_scan']['threats_found'] > 0) ? 20 : 0;
$security_score = max(0, $security_score);

$score_class = $security_score >= 90 ? 'excellent' : ($security_score >= 70 ? 'good' : ($security_score >= 50 ? 'warning' : 'critical'));

// Calculate threats blocked in last 24h
$threats_blocked_24h = $bot_stats['blocked_24h'] + $firewall_stats['hits_24h'] + $login_stats['blocked_24h'];

// Get module status
$modules_status = array(
    'bot_sniper' => array(
        'name' => 'Bot Sniper™',
        'icon' => '🎯',
        'enabled' => $settings['enabled'],
        'description' => 'AI-powered behavioral bot detection',
        'stats' => array(
            'Bots Blocked (24h)' => number_format($bot_stats['blocked_24h']),
            'Detection Rate' => $bot_stats['detection_rate'] . '%',
            'Total Detections' => number_format($bot_stats['total_detections'])
        )
    ),
    'firewall' => array(
        'name' => 'Web Application Firewall',
        'icon' => '🛡️',
        'enabled' => get_option('pfdef_firewall_enabled', true),
        'description' => 'Blocks SQL injection, XSS, RCE, path traversal',
        'stats' => array(
            'Active Rules' => $firewall_stats['active_rules'],
            'Triggers (24h)' => number_format($firewall_stats['hits_24h']),
            'Total Hits' => number_format($firewall_stats['total_hits'])
        )
    ),
    'login_guard' => array(
        'name' => 'Login Guard',
        'icon' => '🔐',
        'enabled' => get_option('pfdef_login_guard_enabled', true),
        'description' => 'Brute force protection with intelligent lockouts',
        'stats' => array(
            'Failed Attempts (24h)' => number_format($login_stats['failed_24h']),
            'Active Lockouts' => $login_stats['current_lockouts'],
            'Success Rate' => $login_stats['success_rate'] . '%'
        )
    ),
    'file_integrity' => array(
        'name' => 'File Integrity Monitor',
        'icon' => '🔒',
        'enabled' => get_option('pfdef_file_integrity_enabled', true),
        'description' => 'Monitors 1000+ WordPress core files',
        'stats' => array(
            'Files Monitored' => number_format($integrity_status['total_files']),
            'Modified Files' => $integrity_status['modified_files'],
            'Last Check' => $integrity_status['last_check'] ? human_time_diff(strtotime($integrity_status['last_check'])) . ' ago' : 'Never'
        )
    ),
    'malware_scanner' => array(
        'name' => 'Malware Scanner',
        'icon' => '🦠',
        'enabled' => get_option('pfdef_malware_scanner_enabled', true),
        'description' => '13+ threat signatures detect backdoors & trojans',
        'stats' => $malware_stats['latest_scan'] ? array(
            'Files Scanned' => number_format($malware_stats['latest_scan']['files_scanned']),
            'Threats Found' => $malware_stats['latest_scan']['threats_found'],
            'Scan Score' => $malware_stats['latest_scan']['scan_score'] . '/100'
        ) : array(
            'Status' => 'Not initialized',
            'Action' => 'Run first scan',
            'Files' => '0'
        )
    )
);

// Get recent activity (last 10 events)
global $wpdb;
$recent_events = $wpdb->get_results(
    "SELECT * FROM {$wpdb->prefix}pfdef_bot_detection_logs 
    ORDER BY timestamp DESC LIMIT 10",
    ARRAY_A
);
?>

<div class="wrap pfdef-enhanced-dashboard">
    <h1 class="pfdef-dashboard-title">
        <span class="pfdef-logo">⚡</span> PromptFluid Reflex
        <span class="pfdef-subtitle">Enterprise Security Suite</span>
    </h1>
    
    <!-- Hero Stats Section -->
    <div class="pfdef-hero-stats">
        <!-- Security Score -->
        <div class="pfdef-hero-card pfdef-score-card">
            <h3><?php _e('Security Score', 'promptfluid-reflex'); ?></h3>
            <div class="pfdef-score-ring <?php echo esc_attr($score_class); ?>">
                <svg viewBox="0 0 200 200">
                    <circle class="pfdef-score-bg" cx="100" cy="100" r="80" />
                    <circle class="pfdef-score-progress" cx="100" cy="100" r="80" 
                            style="stroke-dasharray: <?php echo ($security_score * 5.026); ?>, 502.6;" />
                </svg>
                <div class="pfdef-score-value">
                    <span class="pfdef-score-number"><?php echo $security_score; ?></span>
                    <span class="pfdef-score-max">/100</span>
                </div>
            </div>
            <p class="pfdef-score-label <?php echo esc_attr($score_class); ?>">
                <?php
                if ($security_score >= 90) {
                    echo '<span class="dashicons dashicons-yes-alt"></span> ' . __('Excellent Security', 'promptfluid-reflex');
                } elseif ($security_score >= 70) {
                    echo '<span class="dashicons dashicons-warning"></span> ' . __('Good Security', 'promptfluid-reflex');
                } elseif ($security_score >= 50) {
                    echo '<span class="dashicons dashicons-info"></span> ' . __('Needs Attention', 'promptfluid-reflex');
                } else {
                    echo '<span class="dashicons dashicons-dismiss"></span> ' . __('Critical Issues', 'promptfluid-reflex');
                }
                ?>
            </p>
        </div>
        
        <!-- Threats Blocked -->
        <div class="pfdef-hero-card pfdef-threats-card">
            <h3><?php _e('Threats Blocked', 'promptfluid-reflex'); ?></h3>
            <div class="pfdef-threats-count">
                <span class="pfdef-count-number"><?php echo number_format($threats_blocked_24h); ?></span>
            </div>
            <p class="pfdef-threats-label">
                <span class="dashicons dashicons-clock"></span>
                <?php _e('Last 24 Hours', 'promptfluid-reflex'); ?>
            </p>
        </div>
        
        <!-- System Status -->
        <div class="pfdef-hero-card pfdef-status-card">
            <h3><?php _e('System Status', 'promptfluid-reflex'); ?></h3>
            <div class="pfdef-status-indicator <?php echo $settings['enabled'] ? 'active' : 'disabled'; ?>">
                <span class="pfdef-status-dot"></span>
                <span class="pfdef-status-text">
                    <?php echo $settings['enabled'] ? __('Protected', 'promptfluid-reflex') : __('Disabled', 'promptfluid-reflex'); ?>
                </span>
            </div>
            <p class="pfdef-status-label">
                <?php 
                $active_modules = count(array_filter($modules_status, function($m) { return $m['enabled']; }));
                printf(__('%d of 5 modules active', 'promptfluid-reflex'), $active_modules);
                ?>
            </p>
        </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="pfdef-quick-actions">
        <button class="button button-primary button-hero pfdef-action-btn" id="pfdef-run-scan">
            <span class="dashicons dashicons-search"></span>
            <?php _e('Run Full Scan', 'promptfluid-reflex'); ?>
        </button>
        <button class="button button-secondary button-hero pfdef-action-btn" id="pfdef-review-threats">
            <span class="dashicons dashicons-warning"></span>
            <?php _e('Review Threats', 'promptfluid-reflex'); ?>
        </button>
        <button class="button button-secondary button-hero pfdef-action-btn" id="pfdef-settings">
            <span class="dashicons dashicons-admin-generic"></span>
            <?php _e('Settings', 'promptfluid-reflex'); ?>
        </button>
        <button class="button button-secondary button-hero pfdef-action-btn" id="pfdef-export-report">
            <span class="dashicons dashicons-download"></span>
            <?php _e('Export Report', 'promptfluid-reflex'); ?>
        </button>
    </div>
    
    <!-- Security Modules Grid -->
    <div class="pfdef-modules-section">
        <h2>
            <span class="dashicons dashicons-shield-alt"></span>
            <?php _e('Security Modules', 'promptfluid-reflex'); ?>
        </h2>
        
        <div class="pfdef-modules-grid">
            <?php foreach ($modules_status as $module_key => $module): ?>
            <div class="pfdef-module-card <?php echo $module['enabled'] ? 'enabled' : 'disabled'; ?>" 
                 data-module="<?php echo esc_attr($module_key); ?>">
                <div class="pfdef-module-header">
                    <div class="pfdef-module-icon"><?php echo $module['icon']; ?></div>
                    <div class="pfdef-module-info">
                        <h3><?php echo esc_html($module['name']); ?></h3>
                        <p><?php echo esc_html($module['description']); ?></p>
                    </div>
                    <label class="pfdef-toggle-switch">
                        <input type="checkbox" 
                               class="pfdef-module-toggle" 
                               data-module="<?php echo esc_attr($module_key); ?>"
                               <?php checked($module['enabled']); ?> />
                        <span class="pfdef-toggle-slider"></span>
                    </label>
                </div>
                <div class="pfdef-module-stats">
                    <?php foreach ($module['stats'] as $stat_label => $stat_value): ?>
                    <div class="pfdef-stat">
                        <span class="pfdef-stat-value"><?php echo esc_html($stat_value); ?></span>
                        <span class="pfdef-stat-label"><?php echo esc_html($stat_label); ?></span>
                    </div>
                    <?php endforeach; ?>
                </div>
                <div class="pfdef-module-actions">
                    <button class="button button-small pfdef-module-settings" data-module="<?php echo esc_attr($module_key); ?>">
                        <span class="dashicons dashicons-admin-generic"></span>
                        <?php _e('Configure', 'promptfluid-reflex'); ?>
                    </button>
                    <button class="button button-small pfdef-module-details" data-module="<?php echo esc_attr($module_key); ?>">
                        <span class="dashicons dashicons-chart-bar"></span>
                        <?php _e('View Details', 'promptfluid-reflex'); ?>
                    </button>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
    
    <!-- Live Activity Feed -->
    <div class="pfdef-activity-section">
        <div class="pfdef-activity-header">
            <h2>
                <span class="pfdef-live-indicator"></span>
                <?php _e('Live Activity Feed', 'promptfluid-reflex'); ?>
            </h2>
            <button class="button button-small pfdef-refresh-activity">
                <span class="dashicons dashicons-update"></span>
                <?php _e('Refresh', 'promptfluid-reflex'); ?>
            </button>
        </div>
        
        <div class="pfdef-activity-feed" id="pfdef-activity-feed">
            <?php if (!empty($recent_events)): ?>
                <?php foreach ($recent_events as $event): ?>
                <div class="pfdef-activity-item <?php echo esc_attr($event['action']); ?>">
                    <div class="pfdef-activity-icon">
                        <?php 
                        switch($event['action']) {
                            case 'block':
                                echo '🔴';
                                break;
                            case 'challenge':
                                echo '🟡';
                                break;
                            case 'allow':
                                echo '🟢';
                                break;
                            default:
                                echo '⚪';
                        }
                        ?>
                    </div>
                    <div class="pfdef-activity-content">
                        <strong><?php echo esc_html(ucfirst($event['action'])); ?>:</strong>
                        <?php echo esc_html($event['reason']); ?>
                        <span class="pfdef-activity-ip">IP: <?php echo esc_html($event['ip_address']); ?></span>
                    </div>
                    <div class="pfdef-activity-meta">
                        <span class="pfdef-risk-score score-<?php echo esc_attr($event['risk_score'] >= 70 ? 'high' : ($event['risk_score'] >= 40 ? 'medium' : 'low')); ?>">
                            Risk: <?php echo esc_html($event['risk_score']); ?>
                        </span>
                        <span class="pfdef-activity-time">
                            <?php echo human_time_diff(strtotime($event['timestamp'])); ?> ago
                        </span>
                    </div>
                </div>
                <?php endforeach; ?>
            <?php else: ?>
                <div class="pfdef-no-activity">
                    <span class="dashicons dashicons-shield-alt"></span>
                    <p><?php _e('No recent activity. Your site is secure!', 'promptfluid-reflex'); ?></p>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<style>
.pfdef-enhanced-dashboard {
    margin: 20px 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, sans-serif;
}

.pfdef-dashboard-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 28px;
    margin-bottom: 30px;
}

.pfdef-logo {
    font-size: 36px;
}

.pfdef-subtitle {
    font-size: 14px;
    color: #666;
    font-weight: normal;
}

.pfdef-hero-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.pfdef-hero-card {
    background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 30px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s, box-shadow 0.2s;
}

.pfdef-hero-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
}

.pfdef-hero-card h3 {
    margin: 0 0 20px;
    font-size: 14px;
    text-transform: uppercase;
    color: #6b7280;
    font-weight: 600;
    letter-spacing: 0.5px;
}

/* Security Score Ring */
.pfdef-score-ring {
    position: relative;
    width: 160px;
    height: 160px;
    margin: 0 auto 15px;
}

.pfdef-score-ring svg {
    transform: rotate(-90deg);
}

.pfdef-score-bg {
    fill: none;
    stroke: #e5e7eb;
    stroke-width: 12;
}

.pfdef-score-progress {
    fill: none;
    stroke: #10b981;
    stroke-width: 12;
    stroke-linecap: round;
    transition: stroke-dasharray 1s ease;
}

.pfdef-score-ring.excellent .pfdef-score-progress {
    stroke: #10b981;
}

.pfdef-score-ring.good .pfdef-score-progress {
    stroke: #3b82f6;
}

.pfdef-score-ring.warning .pfdef-score-progress {
    stroke: #f59e0b;
}

.pfdef-score-ring.critical .pfdef-score-progress {
    stroke: #ef4444;
}

.pfdef-score-value {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
}

.pfdef-score-number {
    display: block;
    font-size: 48px;
    font-weight: 700;
    color: #1f2937;
}

.pfdef-score-max {
    font-size: 18px;
    color: #9ca3af;
}

.pfdef-score-label {
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
}

.pfdef-score-label.excellent {
    color: #10b981;
}

.pfdef-score-label.good {
    color: #3b82f6;
}

.pfdef-score-label.warning {
    color: #f59e0b;
}

.pfdef-score-label.critical {
    color: #ef4444;
}

/* Threats Blocked */
.pfdef-threats-count {
    margin: 20px 0;
}

.pfdef-count-number {
    font-size: 64px;
    font-weight: 700;
    color: #7A5FFF;
    background: linear-gradient(135deg, #7A5FFF, #01C9E8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.pfdef-threats-label {
    font-size: 14px;
    color: #6b7280;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
}

/* System Status */
.pfdef-status-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin: 20px 0;
}

.pfdef-status-dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #10b981;
    animation: pulse 2s infinite;
}

.pfdef-status-indicator.disabled .pfdef-status-dot {
    background: #ef4444;
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

.pfdef-status-text {
    font-size: 24px;
    font-weight: 600;
    color: #1f2937;
}

.pfdef-status-label {
    font-size: 14px;
    color: #6b7280;
}

/* Quick Actions */
.pfdef-quick-actions {
    display: flex;
    gap: 15px;
    margin-bottom: 40px;
    flex-wrap: wrap;
}

.pfdef-action-btn {
    flex: 1;
    min-width: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 50px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.2s;
}

.pfdef-action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Security Modules */
.pfdef-modules-section {
    margin-bottom: 40px;
}

.pfdef-modules-section h2 {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    font-size: 20px;
}

.pfdef-modules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 20px;
}

.pfdef-module-card {
    background: #fff;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px;
    transition: all 0.3s;
}

.pfdef-module-card.enabled {
    border-color: #7A5FFF;
    box-shadow: 0 0 0 1px rgba(122, 95, 255, 0.1);
}

.pfdef-module-card.disabled {
    opacity: 0.6;
}

.pfdef-module-header {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    margin-bottom: 15px;
}

.pfdef-module-icon {
    font-size: 36px;
    line-height: 1;
}

.pfdef-module-info {
    flex: 1;
}

.pfdef-module-info h3 {
    margin: 0 0 5px;
    font-size: 16px;
}

.pfdef-module-info p {
    margin: 0;
    font-size: 13px;
    color: #6b7280;
}

/* Toggle Switch */
.pfdef-toggle-switch {
    position: relative;
    width: 50px;
    height: 26px;
    display: inline-block;
    cursor: pointer;
}

.pfdef-toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.pfdef-toggle-slider {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #cbd5e1;
    border-radius: 26px;
    transition: 0.3s;
}

.pfdef-toggle-slider:before {
    content: "";
    position: absolute;
    height: 20px;
    width: 20px;
    left: 3px;
    bottom: 3px;
    background: white;
    border-radius: 50%;
    transition: 0.3s;
}

.pfdef-toggle-switch input:checked + .pfdef-toggle-slider {
    background: linear-gradient(135deg, #7A5FFF, #01C9E8);
}

.pfdef-toggle-switch input:checked + .pfdef-toggle-slider:before {
    transform: translateX(24px);
}

.pfdef-module-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-bottom: 15px;
    padding: 15px;
    background: #f9fafb;
    border-radius: 8px;
}

.pfdef-stat {
    text-align: center;
}

.pfdef-stat-value {
    display: block;
    font-size: 20px;
    font-weight: 700;
    color: #1f2937;
}

.pfdef-stat-label {
    display: block;
    font-size: 11px;
    color: #6b7280;
    margin-top: 3px;
}

.pfdef-module-actions {
    display: flex;
    gap: 10px;
}

.pfdef-module-actions .button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
}

/* Live Activity Feed */
.pfdef-activity-section {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px;
}

.pfdef-activity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.pfdef-activity-header h2 {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    font-size: 18px;
}

.pfdef-live-indicator {
    width: 8px;
    height: 8px;
    background: #ef4444;
    border-radius: 50%;
    animation: blink 1.5s infinite;
}

@keyframes blink {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.3;
    }
}

.pfdef-activity-feed {
    max-height: 500px;
    overflow-y: auto;
}

.pfdef-activity-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    border-bottom: 1px solid #f3f4f6;
    transition: background 0.2s;
}

.pfdef-activity-item:hover {
    background: #f9fafb;
}

.pfdef-activity-icon {
    font-size: 24px;
}

.pfdef-activity-content {
    flex: 1;
    font-size: 14px;
}

.pfdef-activity-ip {
    display: block;
    font-size: 12px;
    color: #6b7280;
    margin-top: 3px;
    font-family: monospace;
}

.pfdef-activity-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 5px;
}

.pfdef-risk-score {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
}

.pfdef-risk-score.score-high {
    background: #fee2e2;
    color: #991b1b;
}

.pfdef-risk-score.score-medium {
    background: #fef3c7;
    color: #92400e;
}

.pfdef-risk-score.score-low {
    background: #d1fae5;
    color: #065f46;
}

.pfdef-activity-time {
    font-size: 12px;
    color: #9ca3af;
}

.pfdef-no-activity {
    text-align: center;
    padding: 60px 20px;
    color: #9ca3af;
}

.pfdef-no-activity .dashicons {
    font-size: 64px;
    width: 64px;
    height: 64px;
    opacity: 0.3;
}

.pfdef-no-activity p {
    margin-top: 20px;
    font-size: 16px;
}

/* Responsive */
@media (max-width: 768px) {
    .pfdef-hero-stats,
    .pfdef-modules-grid {
        grid-template-columns: 1fr;
    }
    
    .pfdef-quick-actions {
        flex-direction: column;
    }
    
    .pfdef-action-btn {
        min-width: 100%;
    }
}
</style>

<script>
jQuery(document).ready(function($) {
    // Module toggle handler
    $('.pfdef-module-toggle').on('change', function() {
        const module = $(this).data('module');
        const enabled = $(this).is(':checked');
        const card = $(this).closest('.pfdef-module-card');
        
        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: {
                action: 'pfdef_toggle_module',
                module: module,
                enabled: enabled,
                nonce: '<?php echo wp_create_nonce("pfdef_toggle_module"); ?>'
            },
            success: function(response) {
                if (response.success) {
                    card.toggleClass('enabled', enabled);
                    card.toggleClass('disabled', !enabled);
                    
                    // Show notification
                    const message = enabled ? 'Module enabled' : 'Module disabled';
                    showNotification(message, 'success');
                    
                    // Refresh stats after 1 second
                    setTimeout(() => location.reload(), 1000);
                }
            },
            error: function() {
                showNotification('Failed to toggle module', 'error');
                // Revert checkbox
                $(this).prop('checked', !enabled);
            }
        });
    });
    
    // Quick action handlers
    $('#pfdef-run-scan').on('click', function() {
        showNotification('Starting full security scan...', 'info');
        window.location.href = '<?php echo admin_url("admin.php?page=promptfluid-reflex-security"); ?>';
    });
    
    $('#pfdef-review-threats').on('click', function() {
        window.location.href = '<?php echo admin_url("admin.php?page=promptfluid-reflex-analytics"); ?>';
    });
    
    $('#pfdef-settings').on('click', function() {
        window.location.href = '<?php echo admin_url("admin.php?page=promptfluid-reflex"); ?>';
    });
    
    $('#pfdef-export-report').on('click', function() {
        window.location.href = '<?php echo admin_url("admin.php?action=pfdef_export_csv&_wpnonce=" . wp_create_nonce("wp_rest")); ?>';
    });
    
    // Module settings buttons
    $('.pfdef-module-settings').on('click', function() {
        const module = $(this).data('module');
        showNotification('Opening ' + module + ' settings...', 'info');
    });
    
    // Module details buttons
    $('.pfdef-module-details').on('click', function() {
        const module = $(this).data('module');
        window.location.href = '<?php echo admin_url("admin.php?page=promptfluid-reflex-security"); ?>';
    });
    
    // Refresh activity feed
    $('.pfdef-refresh-activity').on('click', function() {
        showNotification('Refreshing activity feed...', 'info');
        location.reload();
    });
    
    // Auto-refresh activity feed every 10 seconds
    setInterval(function() {
        // Silent refresh without page reload (future enhancement)
    }, 10000);
    
    // Notification helper
    function showNotification(message, type) {
        const noticeClass = type === 'error' ? 'notice-error' : (type === 'success' ? 'notice-success' : 'notice-info');
        const notice = $('<div class="notice ' + noticeClass + ' is-dismissible"><p>' + message + '</p></div>');
        $('.wrap').prepend(notice);
        setTimeout(() => notice.fadeOut(), 3000);
    }
});
</script>

<?php
// Register AJAX handlers
add_action('wp_ajax_pfdef_toggle_module', 'pfdef_handle_toggle_module');

function pfdef_handle_toggle_module() {
    check_ajax_referer('pfdef_toggle_module', 'nonce');
    
    if (!current_user_can('manage_options')) {
        wp_send_json_error('Insufficient permissions');
    }
    
    $module = sanitize_text_field($_POST['module']);
    $enabled = (bool) $_POST['enabled'];
    
    update_option("pfdef_{$module}_enabled", $enabled);
    
    wp_send_json_success(array(
        'message' => $enabled ? __('Module enabled', 'promptfluid-reflex') : __('Module disabled', 'promptfluid-reflex')
    ));
}
?>
