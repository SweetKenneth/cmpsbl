<?php if (!defined('ABSPATH')) exit; ?>

<div class="wrap bot-sniper-dashboard">
    <h1>🛡️ Bot Sniper Dashboard</h1>
    
    <div class="bs-stats-grid">
        <div class="bs-stat-card">
            <div class="bs-stat-icon">🎯</div>
            <div class="bs-stat-content">
                <div class="bs-stat-label">Today's Detections</div>
                <div class="bs-stat-value" id="today-detections">-</div>
            </div>
        </div>
        
        <div class="bs-stat-card">
            <div class="bs-stat-icon">🚫</div>
            <div class="bs-stat-content">
                <div class="bs-stat-label">Threats Blocked</div>
                <div class="bs-stat-value" id="today-blocks">-</div>
            </div>
        </div>
        
        <div class="bs-stat-card">
            <div class="bs-stat-icon">📊</div>
            <div class="bs-stat-content">
                <div class="bs-stat-label">Total Detections</div>
                <div class="bs-stat-value" id="total-detections">-</div>
            </div>
        </div>
        
        <div class="bs-stat-card">
            <div class="bs-stat-icon">✅</div>
            <div class="bs-stat-content">
                <div class="bs-stat-label">Protection Status</div>
                <div class="bs-stat-value status-active">Active</div>
            </div>
        </div>
    </div>
    
    <div class="bs-content-grid">
        <div class="bs-card bs-recent-activity">
            <h2>Recent Activity</h2>
            <div id="recent-logs">
                <p class="loading">Loading recent detections...</p>
            </div>
        </div>
        
        <div class="bs-card bs-upgrade-cta">
            <h2>🚀 Upgrade to Full Defense</h2>
            <p>Get advanced protection with PromptFluid Reflex:</p>
            <ul>
                <li>✅ Web Application Firewall (WAF)</li>
                <li>✅ Real-time malware scanning</li>
                <li>✅ Advanced behavioral analysis</li>
                <li>✅ Unlimited request volume</li>
                <li>✅ Priority support</li>
            </ul>
            <p><strong>$39/month</strong> (or add $30 to your current plan)</p>
            <a href="<?php echo admin_url('admin.php?page=bot-sniper-upgrade'); ?>" 
               class="button button-primary button-large">
                Learn More →
            </a>
        </div>
    </div>
</div>

<style>
.bs-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin: 30px 0;
}

.bs-stat-card {
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 15px;
}

.bs-stat-icon {
    font-size: 36px;
}

.bs-stat-label {
    color: #666;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 5px;
}

.bs-stat-value {
    font-size: 32px;
    font-weight: bold;
    color: #2271b1;
}

.status-active {
    color: #00a32a;
}

.bs-content-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
}

.bs-card {
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
}

.bs-card h2 {
    margin-top: 0;
}

.bs-upgrade-cta {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
}

.bs-upgrade-cta h2,
.bs-upgrade-cta p {
    color: white;
}

.bs-upgrade-cta ul {
    margin: 20px 0;
    padding-left: 0;
    list-style: none;
}

.bs-upgrade-cta li {
    margin-bottom: 10px;
}

.log-entry {
    padding: 10px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.log-entry:last-child {
    border-bottom: none;
}

.log-ip {
    font-family: monospace;
    font-weight: bold;
}

.log-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
}

.log-badge.human {
    background: #00a32a;
    color: white;
}

.log-badge.low {
    background: #f0b849;
    color: white;
}

.log-badge.medium {
    background: #ff922b;
    color: white;
}

.log-badge.high {
    background: #d63638;
    color: white;
}
</style>

<script>
jQuery(document).ready(function($) {
    function loadStats() {
        $.ajax({
            url: ajaxurl,
            method: 'POST',
            data: {
                action: 'bot_sniper_stats',
                nonce: botSniperData.nonce
            },
            success: function(response) {
                if (response.success) {
                    $('#today-detections').text(response.data.today_detections);
                    $('#today-blocks').text(response.data.today_blocks);
                    $('#total-detections').text(response.data.total_detections);
                }
            }
        });
    }
    
    function loadRecentLogs() {
        $.ajax({
            url: ajaxurl,
            method: 'POST',
            data: {
                action: 'bot_sniper_recent_logs',
                nonce: botSniperData.nonce
            },
            success: function(response) {
                if (response.success && response.data.logs) {
                    var html = '';
                    response.data.logs.forEach(function(log) {
                        html += '<div class="log-entry">';
                        html += '<div>';
                        html += '<span class="log-ip">' + log.ip_address + '</span><br>';
                        html += '<small>' + log.detected_at + '</small>';
                        html += '</div>';
                        html += '<span class="log-badge ' + log.risk_level + '">' + 
                                log.risk_level.toUpperCase() + '</span>';
                        html += '</div>';
                    });
                    $('#recent-logs').html(html || '<p>No detections yet.</p>');
                }
            }
        });
    }
    
    loadStats();
    loadRecentLogs();
    
    // Refresh every 30 seconds
    setInterval(function() {
        loadStats();
        loadRecentLogs();
    }, 30000);
});
</script>
