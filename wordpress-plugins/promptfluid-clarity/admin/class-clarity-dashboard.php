<?php
/**
 * Dashboard Controller
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Clarity_Dashboard {
    
    /**
     * Render dashboard with React mount point
     */
    public function render() {
        global $wpdb;
        
        // Get stats
        $total_scans = $wpdb->get_var("SELECT COUNT(*) FROM " . PFCLARITY_TABLE_SCANS);
        $total_issues = $wpdb->get_var("SELECT COUNT(*) FROM " . PFCLARITY_TABLE_ISSUES);
        $fixed_issues = $wpdb->get_var("SELECT COUNT(*) FROM " . PFCLARITY_TABLE_ISSUES . " WHERE status = 'fixed'");
        $recent_scans = $wpdb->get_results("SELECT * FROM " . PFCLARITY_TABLE_SCANS . " ORDER BY scan_date DESC LIMIT 10");
        
        // Get license status
        $licensing = new PromptFluid_Clarity_Licensing();
        $license_status = $licensing->get_license_status();
        
        ?>
        <div class="wrap pfclarity-dashboard">
            <h1 class="pfclarity-title">
                <span class="pfclarity-logo">⚡</span>
                PromptFluid Clarity
                <span class="pfclarity-version">v<?php echo PFCLARITY_VERSION; ?></span>
            </h1>
            
            <div class="pfclarity-license-banner <?php echo $license_status['status'] === 'active' ? 'active' : 'inactive'; ?>">
                <strong>License:</strong> <?php echo ucfirst($license_status['status']); ?> 
                <?php if (isset($license_status['plan'])): ?>
                    (<?php echo ucfirst($license_status['plan']); ?>)
                <?php endif; ?>
            </div>
            
            <div class="pfclarity-stats-grid">
                <div class="pfclarity-stat-card">
                    <div class="stat-value"><?php echo $total_scans; ?></div>
                    <div class="stat-label">Total Scans</div>
                </div>
                <div class="pfclarity-stat-card">
                    <div class="stat-value"><?php echo $total_issues; ?></div>
                    <div class="stat-label">Issues Found</div>
                </div>
                <div class="pfclarity-stat-card">
                    <div class="stat-value"><?php echo $fixed_issues; ?></div>
                    <div class="stat-label">Fixed</div>
                </div>
                <div class="pfclarity-stat-card">
                    <div class="stat-value">
                        <?php echo $total_issues > 0 ? round(($fixed_issues / $total_issues) * 100) : 0; ?>%
                    </div>
                    <div class="stat-label">Compliance Rate</div>
                </div>
            </div>
            
            <div class="pfclarity-actions">
                <button id="pfclarity-new-scan" class="button button-primary button-hero">
                    🔍 New Scan
                </button>
                <button id="pfclarity-auto-fix-all" class="button button-secondary">
                    🤖 Auto-Fix All Issues
                </button>
            </div>
            
            <div class="pfclarity-recent-scans">
                <h2>Recent Scans</h2>
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th>URL</th>
                            <th>Date</th>
                            <th>Issues</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($recent_scans)): ?>
                            <tr>
                                <td colspan="5" style="text-align: center;">No scans yet. Click "New Scan" to get started.</td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($recent_scans as $scan): ?>
                                <tr>
                                    <td><?php echo esc_html($scan->url); ?></td>
                                    <td><?php echo esc_html($scan->scan_date); ?></td>
                                    <td><?php echo intval($scan->issue_count); ?></td>
                                    <td><span class="status-badge <?php echo esc_attr($scan->status); ?>">
                                        <?php echo esc_html(ucfirst($scan->status)); ?>
                                    </span></td>
                                    <td>
                                        <button class="button button-small pfclarity-view-scan" data-scan-id="<?php echo $scan->id; ?>">View</button>
                                        <button class="button button-small pfclarity-auto-fix" data-scan-id="<?php echo $scan->id; ?>">Auto-Fix</button>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
            
            <div id="pfclarity-react-root" style="margin-top: 30px;"></div>
        </div>
        <?php
    }
}
