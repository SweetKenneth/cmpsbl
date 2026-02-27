<?php
/**
 * Scans page view
 */

if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap">
    <h1>Clarity Scans</h1>
    
    <div class="tablenav top">
        <button class="button button-primary" id="pfclarity-new-scan-btn">New Scan</button>
    </div>
    
    <table class="wp-list-table widefat fixed striped">
        <thead>
            <tr>
                <th>ID</th>
                <th>URL</th>
                <th>Date</th>
                <th>Issues</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($scans)): ?>
                <tr>
                    <td colspan="6">No scans found.</td>
                </tr>
            <?php else: ?>
                <?php foreach ($scans as $scan): ?>
                    <tr>
                        <td><?php echo intval($scan->id); ?></td>
                        <td><?php echo esc_html($scan->url); ?></td>
                        <td><?php echo esc_html($scan->scan_date); ?></td>
                        <td><?php echo intval($scan->issue_count); ?></td>
                        <td><span class="status-badge <?php echo esc_attr($scan->status); ?>">
                            <?php echo esc_html(ucfirst($scan->status)); ?>
                        </span></td>
                        <td>
                            <a href="?page=pfclarity-scan-details&scan_id=<?php echo $scan->id; ?>" class="button button-small">View Details</a>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </tbody>
    </table>
</div>
