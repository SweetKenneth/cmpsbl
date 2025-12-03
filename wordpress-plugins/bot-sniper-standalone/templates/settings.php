<?php 
if (!defined('ABSPATH')) exit;

$settings = get_option('bot_sniper_settings', [
    'detection_enabled' => true,
    'auto_block' => false,
    'threat_threshold' => 70,
    'log_retention_days' => 30
]);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['bot_sniper_settings_nonce'])) {
    check_admin_referer('bot_sniper_settings', 'bot_sniper_settings_nonce');
    
    $settings = [
        'detection_enabled' => isset($_POST['detection_enabled']),
        'auto_block' => isset($_POST['auto_block']),
        'threat_threshold' => intval($_POST['threat_threshold']),
        'log_retention_days' => intval($_POST['log_retention_days'])
    ];
    
    update_option('bot_sniper_settings', $settings);
    echo '<div class="notice notice-success"><p>Settings saved successfully!</p></div>';
}
?>

<div class="wrap">
    <h1>⚙️ Bot Sniper Settings</h1>
    
    <form method="post" action="">
        <?php wp_nonce_field('bot_sniper_settings', 'bot_sniper_settings_nonce'); ?>
        
        <table class="form-table">
            <tr>
                <th scope="row">API Key</th>
                <td>
                    <input type="text" 
                           name="bot_sniper_api_key" 
                           value="<?php echo esc_attr(get_option('bot_sniper_api_key')); ?>" 
                           class="regular-text" 
                           readonly>
                    <p class="description">Contact support to change your API key.</p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">Detection Enabled</th>
                <td>
                    <label>
                        <input type="checkbox" 
                               name="detection_enabled" 
                               <?php checked($settings['detection_enabled']); ?>>
                        Enable bot detection on your site
                    </label>
                </td>
            </tr>
            
            <tr>
                <th scope="row">Auto-Block Threats</th>
                <td>
                    <label>
                        <input type="checkbox" 
                               name="auto_block" 
                               <?php checked($settings['auto_block']); ?>>
                        Automatically block high-threat requests
                    </label>
                    <p class="description">When enabled, requests above the threat threshold will be blocked immediately.</p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">Threat Threshold</th>
                <td>
                    <input type="number" 
                           name="threat_threshold" 
                           value="<?php echo esc_attr($settings['threat_threshold']); ?>" 
                           min="1" 
                           max="100" 
                           class="small-text">
                    <p class="description">Block requests with threat scores above this value (1-100). Recommended: 70</p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">Log Retention</th>
                <td>
                    <input type="number" 
                           name="log_retention_days" 
                           value="<?php echo esc_attr($settings['log_retention_days']); ?>" 
                           min="1" 
                           max="365" 
                           class="small-text"> days
                    <p class="description">How long to keep detection logs. Older logs are automatically deleted.</p>
                </td>
            </tr>
        </table>
        
        <?php submit_button(); ?>
    </form>
</div>
