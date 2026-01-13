<?php
/**
 * Settings page view
 */

if (!defined('ABSPATH')) {
    exit;
}

$api_key = get_option('pfclarity_api_key', '');
$auto_fix_enabled = get_option('pfclarity_auto_fix_enabled', false);
$scheduled_scans_enabled = get_option('pfclarity_scheduled_scans_enabled', false);
?>

<div class="wrap">
    <h1>Clarity Settings</h1>
    
    <form method="post" action="">
        <?php wp_nonce_field('pfclarity_settings'); ?>
        
        <table class="form-table">
            <tr>
                <th scope="row">
                    <label for="api_key">API Key</label>
                </th>
                <td>
                    <input type="text" 
                           id="api_key" 
                           name="api_key" 
                           value="<?php echo esc_attr($api_key); ?>" 
                           class="regular-text" 
                           placeholder="Enter your PromptFluid API key">
                    <p class="description">Get your API key from <a href="https://www.promptfluid.com" target="_blank">promptfluid.com</a></p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">Auto-Fix</th>
                <td>
                    <label>
                        <input type="checkbox" 
                               name="auto_fix_enabled" 
                               value="1" 
                               <?php checked($auto_fix_enabled); ?>>
                        Enable automatic fixing of accessibility issues
                    </label>
                </td>
            </tr>
            
            <tr>
                <th scope="row">Scheduled Scans</th>
                <td>
                    <label>
                        <input type="checkbox" 
                               name="scheduled_scans_enabled" 
                               value="1" 
                               <?php checked($scheduled_scans_enabled); ?>>
                        Enable automatic scheduled scans
                    </label>
                </td>
            </tr>
            
            <tr>
                <th scope="row">Nexus Endpoint</th>
                <td>
                    <code><?php echo esc_html(PF_NEXUS_ROUTER); ?></code>
                    <p class="description">Nexus API routing endpoint (configured via environment)</p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">Environment</th>
                <td>
                    <code><?php echo esc_html(PF_ENV); ?></code>
                </td>
            </tr>
        </table>
        
        <p class="submit">
            <input type="submit" 
                   name="pfclarity_save_settings" 
                   class="button button-primary" 
                   value="Save Settings">
        </p>
    </form>
</div>
