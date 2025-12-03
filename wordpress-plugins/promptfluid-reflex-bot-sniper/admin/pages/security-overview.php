<?php
/**
 * Security Overview Dashboard Page
 *
 * @package PromptFluid_Reflex
 */

if (!defined('ABSPATH')) {
    exit;
}

// Load all security modules
require_once PFDEF_PLUGIN_DIR . 'includes/class-file-integrity.php';
require_once PFDEF_PLUGIN_DIR . 'includes/class-firewall.php';
require_once PFDEF_PLUGIN_DIR . 'includes/class-login-guard.php';
require_once PFDEF_PLUGIN_DIR . 'includes/class-malware-scanner.php';
require_once PFDEF_PLUGIN_DIR . 'includes/class-smart-learning.php';

$file_integrity = new PromptFluid_Defense_File_Integrity();
$firewall = new PromptFluid_Defense_Firewall();
$login_guard = new PromptFluid_Defense_Login_Guard();
$malware_scanner = new PromptFluid_Defense_Malware_Scanner();
$learning = new PromptFluid_Defense_Smart_Learning();

$integrity_status = $file_integrity->get_status();
$firewall_stats = $firewall->get_stats();
$login_stats = $login_guard->get_stats();
$malware_stats = $malware_scanner->get_stats();
$learning_stats = $learning->get_learning_stats();
?>

<div class="wrap pfdef-security-overview">
    <h1><?php _e('Security Overview', 'promptfluid-reflex'); ?></h1>
    
    <div class="pfdef-security-grid">
        <!-- File Integrity Monitor -->
        <div class="pfdef-module-card">
            <div class="pfdef-module-header">
                <h2>🔒 <?php _e('File Integrity', 'promptfluid-defense'); ?></h2>
                <span class="pfdef-status-badge <?php echo esc_attr($integrity_status['status']); ?>">
                    <?php echo esc_html(ucfirst($integrity_status['status'])); ?>
                </span>
            </div>
            <div class="pfdef-module-stats">
                <div class="pfdef-stat">
                    <span class="pfdef-stat-value"><?php echo number_format($integrity_status['total_files']); ?></span>
                    <span class="pfdef-stat-label"><?php _e('Files Monitored', 'promptfluid-defense'); ?></span>
                </div>
                <div class="pfdef-stat">
                    <span class="pfdef-stat-value"><?php echo number_format($integrity_status['modified_files']); ?></span>
                    <span class="pfdef-stat-label"><?php _e('Modified Files', 'promptfluid-defense'); ?></span>
                </div>
                <div class="pfdef-stat">
                    <span class="pfdef-stat-value"><?php echo $integrity_status['last_check'] ? date('g:i A', strtotime($integrity_status['last_check'])) : 'Never'; ?></span>
                    <span class="pfdef-stat-label"><?php _e('Last Check', 'promptfluid-defense'); ?></span>
                </div>
            </div>
            <?php if ($integrity_status['modified_files'] > 0): ?>
            <div class="pfdef-alert pfdef-alert-warning">
                <?php printf(__('%d files have been modified. Review changes immediately.', 'promptfluid-defense'), $integrity_status['modified_files']); ?>
            </div>
            <?php endif; ?>
        </div>
        
        <!-- Firewall -->
        <div class="pfdef-module-card">
            <div class="pfdef-module-header">
                <h2>🛡️ <?php _e('Firewall', 'promptfluid-defense'); ?></h2>
                <span class="pfdef-status-badge <?php echo esc_attr($firewall_stats['status']); ?>">
                    <?php echo esc_html(ucfirst($firewall_stats['status'])); ?>
                </span>
            </div>
            <div class="pfdef-module-stats">
                <div class="pfdef-stat">
                    <span class="pfdef-stat-value"><?php echo number_format($firewall_stats['active_rules']); ?></span>
                    <span class="pfdef-stat-label"><?php _e('Active Rules', 'promptfluid-defense'); ?></span>
                </div>
                <div class="pfdef-stat">
                    <span class="pfdef-stat-value"><?php echo number_format($firewall_stats['hits_24h']); ?></span>
                    <span class="pfdef-stat-label"><?php _e('Triggers (24h)', 'promptfluid-defense'); ?></span>
                </div>
                <div class="pfdef-stat">
                    <span class="pfdef-stat-value"><?php echo number_format($firewall_stats['total_hits']); ?></span>
                    <span class="pfdef-stat-label"><?php _e('Total Hits', 'promptfluid-defense'); ?></span>
                </div>
            </div>
            <?php if (!empty($firewall_stats['top_triggered'])): ?>
            <div class="pfdef-top-rules">
                <h4><?php _e('Most Triggered Rules', 'promptfluid-defense'); ?></h4>
                <ul>
                    <?php foreach (array_slice($firewall_stats['top_triggered'], 0, 3) as $rule): ?>
                    <li>
                        <strong><?php echo esc_html($rule['rule_name']); ?></strong>
                        <span class="pfdef-rule-type"><?php echo esc_html($rule['rule_type']); ?></span>
                        <span class="pfdef-hit-count"><?php echo number_format($rule['hit_count']); ?> hits</span>
                    </li>
                    <?php endforeach; ?>
                </ul>
            </div>
            <?php endif; ?>
        </div>
        
        <!-- Login Guard -->
        <div class="pfdef-module-card">
            <div class="pfdef-module-header">
                <h2>🔐 <?php _e('Login Guard', 'promptfluid-defense'); ?></h2>
                <span class="pfdef-status-badge <?php echo $login_stats['current_lockouts'] > 0 ? 'active' : 'idle'; ?>">
                    <?php echo $login_stats['current_lockouts'] > 0 ? __('Active', 'promptfluid-defense') : __('Monitoring', 'promptfluid-defense'); ?>
                </span>
            </div>
            <div class="pfdef-module-stats">
                <div class="pfdef-stat">
                    <span class="pfdef-stat-value"><?php echo number_format($login_stats['failed_24h']); ?></span>
                    <span class="pfdef-stat-label"><?php _e('Failed Attempts (24h)', 'promptfluid-defense'); ?></span>
                </div>
                <div class="pfdef-stat">
                    <span class="pfdef-stat-value"><?php echo number_format($login_stats['current_lockouts']); ?></span>
                    <span class="pfdef-stat-label"><?php _e('Active Lockouts', 'promptfluid-defense'); ?></span>
                </div>
                <div class="pfdef-stat">
                    <span class="pfdef-stat-value"><?php echo $login_stats['success_rate']; ?>%</span>
                    <span class="pfdef-stat-label"><?php _e('Success Rate', 'promptfluid-defense'); ?></span>
                </div>
            </div>
            <?php if (!empty($login_stats['top_attacking_ips'])): ?>
            <div class="pfdef-top-attackers">
                <h4><?php _e('Top Attacking IPs', 'promptfluid-defense'); ?></h4>
                <ul>
                    <?php foreach (array_slice($login_stats['top_attacking_ips'], 0, 5) as $attacker): ?>
                    <li>
                        <code><?php echo esc_html($attacker['ip_address']); ?></code>
                        <span class="pfdef-attempt-count"><?php echo number_format($attacker['attempt_count']); ?> attempts</span>
                    </li>
                    <?php endforeach; ?>
                </ul>
            </div>
            <?php endif; ?>
        </div>
        
        <!-- Malware Scanner -->
        <div class="pfdef-module-card">
            <div class="pfdef-module-header">
                <h2>🦠 <?php _e('Malware Scanner', 'promptfluid-defense'); ?></h2>
                <?php if ($malware_stats['latest_scan']): ?>
                <span class="pfdef-score-badge score-<?php echo $malware_stats['latest_scan']['scan_score']; ?>">
                    <?php echo $malware_stats['latest_scan']['scan_score']; ?>/100
                </span>
                <?php endif; ?>
            </div>
            <?php if ($malware_stats['latest_scan']): ?>
            <div class="pfdef-module-stats">
                <div class="pfdef-stat">
                    <span class="pfdef-stat-value"><?php echo number_format($malware_stats['latest_scan']['files_scanned']); ?></span>
                    <span class="pfdef-stat-label"><?php _e('Files Scanned', 'promptfluid-defense'); ?></span>
                </div>
                <div class="pfdef-stat">
                    <span class="pfdef-stat-value"><?php echo number_format($malware_stats['latest_scan']['threats_found']); ?></span>
                    <span class="pfdef-stat-label"><?php _e('Threats Found', 'promptfluid-defense'); ?></span>
                </div>
                <div class="pfdef-stat">
                    <span class="pfdef-stat-value"><?php echo $malware_stats['avg_scan_time']; ?>s</span>
                    <span class="pfdef-stat-label"><?php _e('Avg Scan Time', 'promptfluid-defense'); ?></span>
                </div>
            </div>
            <?php if ($malware_stats['latest_scan']['threats_found'] > 0): ?>
            <div class="pfdef-alert pfdef-alert-danger">
                <?php printf(__('%d threats detected in last scan. Action required.', 'promptfluid-defense'), $malware_stats['latest_scan']['threats_found']); ?>
            </div>
            <?php endif; ?>
            <div class="pfdef-module-actions">
                <button class="button button-secondary" id="run-quick-scan"><?php _e('Run Quick Scan', 'promptfluid-defense'); ?></button>
                <button class="button button-primary" id="run-full-scan"><?php _e('Run Full Scan', 'promptfluid-defense'); ?></button>
            </div>
            <?php else: ?>
            <div class="pfdef-alert pfdef-alert-info">
                <?php _e('No scans performed yet. Run your first scan to establish a baseline.', 'promptfluid-defense'); ?>
            </div>
            <div class="pfdef-module-actions">
                <button class="button button-primary" id="run-first-scan"><?php _e('Initialize Malware Scanner', 'promptfluid-defense'); ?></button>
            </div>
            <?php endif; ?>
        </div>
        
        <!-- AI Learning Status -->
        <div class="pfdef-module-card pfdef-full-width">
            <div class="pfdef-module-header">
                <h2>🧠 <?php _e('AI Learning & Intelligence', 'promptfluid-defense'); ?></h2>
                <span class="pfdef-status-badge <?php echo $learning_stats['baseline_ready'] ? 'active' : 'learning'; ?>">
                    <?php echo $learning_stats['baseline_ready'] ? __('Active', 'promptfluid-defense') : __('Learning', 'promptfluid-defense'); ?>
                </span>
            </div>
            <div class="pfdef-learning-overview">
                <div class="pfdef-learning-stats">
                    <div class="pfdef-stat">
                        <span class="pfdef-stat-value"><?php echo number_format($learning_stats['total_patterns']); ?></span>
                        <span class="pfdef-stat-label"><?php _e('Patterns Learned', 'promptfluid-defense'); ?></span>
                    </div>
                    <div class="pfdef-stat">
                        <span class="pfdef-stat-value"><?php echo $learning_stats['accuracy']; ?>%</span>
                        <span class="pfdef-stat-label"><?php _e('Detection Accuracy', 'promptfluid-defense'); ?></span>
                    </div>
                    <div class="pfdef-stat">
                        <span class="pfdef-stat-value"><?php echo number_format($learning_stats['safe_patterns']); ?></span>
                        <span class="pfdef-stat-label"><?php _e('Safe Patterns', 'promptfluid-defense'); ?></span>
                    </div>
                    <div class="pfdef-stat">
                        <span class="pfdef-stat-value"><?php echo number_format($learning_stats['malicious_patterns']); ?></span>
                        <span class="pfdef-stat-label"><?php _e('Threat Patterns', 'promptfluid-defense'); ?></span>
                    </div>
                </div>
                
                <?php if (!$learning_stats['baseline_ready']): ?>
                <div class="pfdef-learning-progress">
                    <h4><?php _e('Building Baseline...', 'promptfluid-defense'); ?></h4>
                    <div class="pfdef-progress-bar">
                        <div class="pfdef-progress-fill" style="width: <?php echo min(100, $learning_stats['total_patterns']); ?>%"></div>
                    </div>
                    <p><?php printf(__('%d / 100 samples collected', 'promptfluid-defense'), $learning_stats['total_patterns']); ?></p>
                </div>
                <?php endif; ?>
                
                <div class="pfdef-ai-recommendations">
                    <h4>💡 <?php _e('AI Recommendations', 'promptfluid-defense'); ?></h4>
                    <ul>
                        <?php
                        $recommendations = array();
                        
                        if ($integrity_status['modified_files'] > 0) {
                            $recommendations[] = __('Review modified files detected by integrity monitor', 'promptfluid-defense');
                        }
                        
                        if ($firewall_stats['hits_24h'] > 50) {
                            $recommendations[] = __('High firewall activity detected - consider raising sensitivity', 'promptfluid-defense');
                        }
                        
                        if ($login_stats['failed_24h'] > 20) {
                            $recommendations[] = __('Unusual login activity - enable two-factor authentication', 'promptfluid-defense');
                        }
                        
                        if ($malware_stats['latest_scan'] && $malware_stats['latest_scan']['threats_found'] > 0) {
                            $recommendations[] = __('Malware detected - quarantine affected files immediately', 'promptfluid-defense');
                        }
                        
                        if ($learning_stats['accuracy'] < 90) {
                            $recommendations[] = __('Continue learning mode to improve detection accuracy', 'promptfluid-defense');
                        }
                        
                        if (empty($recommendations)) {
                            $recommendations[] = __('All systems operating normally. Continue monitoring.', 'promptfluid-defense');
                        }
                        
                        foreach ($recommendations as $recommendation): ?>
                        <li><?php echo esc_html($recommendation); ?></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Overall Security Score -->
    <div class="pfdef-security-score">
        <?php
        $overall_score = 100;
        $overall_score -= ($integrity_status['modified_files'] * 5);
        $overall_score -= (($firewall_stats['hits_24h'] > 50) ? 10 : 0);
        $overall_score -= (($login_stats['failed_24h'] > 20) ? 15 : 0);
        $overall_score -= (($malware_stats['latest_scan'] && $malware_stats['latest_scan']['threats_found'] > 0) ? 20 : 0);
        $overall_score = max(0, $overall_score);
        
        $score_class = $overall_score >= 90 ? 'excellent' : ($overall_score >= 70 ? 'good' : ($overall_score >= 50 ? 'warning' : 'critical'));
        ?>
        <h3><?php _e('Overall Security Score', 'promptfluid-defense'); ?></h3>
        <div class="pfdef-score-circle <?php echo esc_attr($score_class); ?>">
            <span class="pfdef-score-number"><?php echo $overall_score; ?></span>
            <span class="pfdef-score-max">/100</span>
        </div>
        <p class="pfdef-score-description">
            <?php
            if ($overall_score >= 90) {
                _e('Excellent security posture. All systems nominal.', 'promptfluid-defense');
            } elseif ($overall_score >= 70) {
                _e('Good security. Minor issues detected.', 'promptfluid-defense');
            } elseif ($overall_score >= 50) {
                _e('Warning: Security issues require attention.', 'promptfluid-defense');
            } else {
                _e('Critical: Immediate action required.', 'promptfluid-defense');
            }
            ?>
        </p>
    </div>
</div>

<style>
.pfdef-security-overview {
    margin: 20px 0;
}

.pfdef-security-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.pfdef-module-card {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.pfdef-full-width {
    grid-column: 1 / -1;
}

.pfdef-module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.pfdef-module-header h2 {
    margin: 0;
    font-size: 18px;
}

.pfdef-status-badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
}

.pfdef-status-badge.clean,
.pfdef-status-badge.idle,
.pfdef-status-badge.active {
    background: #d4edda;
    color: #155724;
}

.pfdef-status-badge.warning,
.pfdef-status-badge.learning {
    background: #fff3cd;
    color: #856404;
}

.pfdef-status-badge.critical {
    background: #f8d7da;
    color: #721c24;
}

.pfdef-module-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-bottom: 15px;
}

.pfdef-stat {
    text-align: center;
}

.pfdef-stat-value {
    display: block;
    font-size: 28px;
    font-weight: 700;
    color: #2271b1;
}

.pfdef-stat-label {
    display: block;
    font-size: 12px;
    color: #666;
    margin-top: 5px;
}

.pfdef-alert {
    padding: 12px;
    border-radius: 4px;
    margin-top: 15px;
    font-size: 14px;
}

.pfdef-alert-warning {
    background: #fff3cd;
    border-left: 4px solid #ffc107;
    color: #856404;
}

.pfdef-alert-danger {
    background: #f8d7da;
    border-left: 4px solid #dc3545;
    color: #721c24;
}

.pfdef-alert-info {
    background: #d1ecf1;
    border-left: 4px solid #17a2b8;
    color: #0c5460;
}

.pfdef-module-actions {
    margin-top: 15px;
    display: flex;
    gap: 10px;
}

.pfdef-security-score {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px;
    border-radius: 8px;
    text-align: center;
}

.pfdef-score-circle {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    margin: 20px auto;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    border: 4px solid rgba(255,255,255,0.5);
}

.pfdef-score-circle.excellent {
    border-color: #28a745;
    background: rgba(40,167,69,0.2);
}

.pfdef-score-circle.good {
    border-color: #17a2b8;
    background: rgba(23,162,184,0.2);
}

.pfdef-score-circle.warning {
    border-color: #ffc107;
    background: rgba(255,193,7,0.2);
}

.pfdef-score-circle.critical {
    border-color: #dc3545;
    background: rgba(220,53,69,0.2);
}

.pfdef-score-number {
    font-size: 48px;
    font-weight: 700;
    line-height: 1;
}

.pfdef-score-max {
    font-size: 18px;
    opacity: 0.8;
}

.pfdef-learning-overview {
    margin-top: 20px;
}

.pfdef-learning-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
    margin-bottom: 20px;
}

.pfdef-ai-recommendations ul {
    margin: 10px 0;
    padding-left: 20px;
}

.pfdef-ai-recommendations li {
    margin: 8px 0;
    line-height: 1.6;
}
</style>

<script>
jQuery(document).ready(function($) {
    $('#run-quick-scan, #run-full-scan, #run-first-scan').on('click', function() {
        const scanType = $(this).attr('id').includes('full') ? 'full' : 'quick';
        const $button = $(this);
        
        $button.prop('disabled', true).text('<?php _e('Scanning...', 'promptfluid-defense'); ?>');
        
        $.post(ajaxurl, {
            action: 'pfdef_run_malware_scan',
            scan_type: scanType,
            nonce: '<?php echo wp_create_nonce('pfdef-scan'); ?>'
        }, function(response) {
            if (response.success) {
                location.reload();
            } else {
                alert('Scan failed: ' + response.data);
                $button.prop('disabled', false).text('<?php _e('Run Scan', 'promptfluid-defense'); ?>');
            }
        });
    });
});
</script>
