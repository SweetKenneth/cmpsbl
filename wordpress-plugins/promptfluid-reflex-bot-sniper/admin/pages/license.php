<?php
/**
 * License Management Page
 *
 * @package PromptFluid_Reflex
 */

if (!defined('ABSPATH')) {
    exit;
}

require_once PFDEF_PLUGIN_DIR . 'includes/class-licensing.php';

$current_tier = PromptFluid_Defense_Licensing::get_current_tier();
$tier_info = PromptFluid_Defense_Licensing::get_tier_info();
$license_data = get_option('pfdef_license_data', array());

// Handle form submissions
if (isset($_POST['pfdef_license_action'])) {
    check_admin_referer('pfdef_license_action');
    
    if ($_POST['pfdef_license_action'] === 'activate') {
        $result = PromptFluid_Defense_Licensing::activate_license(
            sanitize_text_field($_POST['license_key']),
            sanitize_email($_POST['license_email'])
        );
        
        if ($result['success']) {
            echo '<div class="notice notice-success is-dismissible"><p>' . esc_html($result['message']) . '</p></div>';
            $license_data = get_option('pfdef_license_data');
        } else {
            echo '<div class="notice notice-error is-dismissible"><p>' . esc_html($result['message']) . '</p></div>';
        }
    } elseif ($_POST['pfdef_license_action'] === 'deactivate') {
        $result = PromptFluid_Defense_Licensing::deactivate_license();
        
        if ($result['success']) {
            echo '<div class="notice notice-success is-dismissible"><p>' . esc_html($result['message']) . '</p></div>';
            $license_data = get_option('pfdef_license_data');
        } else {
            echo '<div class="notice notice-error is-dismissible"><p>' . esc_html($result['message']) . '</p></div>';
        }
    }
}

?>

<div class="wrap pfdef-license-page">
    <h1><?php _e('PromptFluid Reflex - License', 'promptfluid-reflex'); ?></h1>
    
    <div class="pfdef-license-status-card">
        <div class="pfdef-license-header">
            <div class="pfdef-license-tier-badge pfdef-tier-<?php echo esc_attr($current_tier); ?>">
                <?php echo esc_html($tier_info['name']); ?>
            </div>
            <div class="pfdef-license-info">
                <h2><?php _e('Current License Status', 'promptfluid-reflex'); ?></h2>
                <p>
                    <?php if ($current_tier === 'lite'): ?>
                        <?php _e('You are using the free Lite edition.', 'promptfluid-reflex'); ?>
                        <a href="<?php echo admin_url('admin.php?page=promptfluid-reflex-upgrade'); ?>"><?php _e('Upgrade to unlock premium features', 'promptfluid-reflex'); ?></a>
                    <?php else: ?>
                        <?php _e('Thank you for being a premium customer!', 'promptfluid-reflex'); ?>
                    <?php endif; ?>
                </p>
            </div>
        </div>
        
        <?php if (!empty($license_data['key'])): ?>
        <div class="pfdef-license-details">
            <table class="widefat">
                <tr>
                    <th><?php _e('License Key:', 'promptfluid-reflex'); ?></th>
                    <td><code><?php echo esc_html(substr($license_data['key'], 0, 20) . '...'); ?></code></td>
                </tr>
                <tr>
                    <th><?php _e('Email:', 'promptfluid-reflex'); ?></th>
                    <td><?php echo esc_html($license_data['email'] ?? 'N/A'); ?></td>
                </tr>
                <tr>
                    <th><?php _e('Edition:', 'promptfluid-reflex'); ?></th>
                    <td><strong><?php echo esc_html($tier_info['name']); ?></strong></td>
                </tr>
                <tr>
                    <th><?php _e('Status:', 'promptfluid-reflex'); ?></th>
                    <td>
                        <?php 
                        $status = $license_data['status'] ?? 'unknown';
                        $status_class = $status === 'active' ? 'pfdef-status-active' : 'pfdef-status-inactive';
                        ?>
                        <span class="pfdef-license-status <?php echo esc_attr($status_class); ?>">
                            <?php echo esc_html(ucfirst($status)); ?>
                        </span>
                    </td>
                </tr>
                <?php if (!empty($license_data['expires'])): ?>
                <tr>
                    <th><?php _e('Expires:', 'promptfluid-reflex'); ?></th>
                    <td><?php echo esc_html(date_i18n(get_option('date_format'), strtotime($license_data['expires']))); ?></td>
                </tr>
                <?php endif; ?>
                <?php if (!empty($license_data['activated_at'])): ?>
                <tr>
                    <th><?php _e('Activated:', 'promptfluid-reflex'); ?></th>
                    <td><?php echo esc_html(date_i18n(get_option('date_format'), strtotime($license_data['activated_at']))); ?></td>
                </tr>
                <?php endif; ?>
            </table>
        </div>
        <?php endif; ?>
    </div>
    
    <?php if ($current_tier === 'lite' || empty($license_data['key'])): ?>
    <!-- Activate License Form -->
    <div class="pfdef-license-form-card">
        <h2><?php _e('Activate Your License', 'promptfluid-reflex'); ?></h2>
        <p><?php _e('Enter your license key to unlock premium features. Don\'t have a license?', 'promptfluid-reflex'); ?> 
        <a href="<?php echo admin_url('admin.php?page=promptfluid-reflex-upgrade'); ?>"><?php _e('Upgrade now', 'promptfluid-reflex'); ?></a></p>
        
        <form method="post" action="">
            <?php wp_nonce_field('pfdef_license_action'); ?>
            <input type="hidden" name="pfdef_license_action" value="activate">
            
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="license_key"><?php _e('License Key', 'promptfluid-reflex'); ?></label>
                    </th>
                    <td>
                        <input type="text" 
                               id="license_key" 
                               name="license_key" 
                               class="regular-text" 
                               placeholder="pfdef_xxxxxxxxxxxxxxxx"
                               required>
                        <p class="description"><?php _e('Enter your PromptFluid Reflex license key', 'promptfluid-reflex'); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="license_email"><?php _e('Email Address', 'promptfluid-reflex'); ?></label>
                    </th>
                    <td>
                        <input type="email" 
                               id="license_email" 
                               name="license_email" 
                               class="regular-text" 
                               placeholder="your@email.com"
                               required>
                        <p class="description"><?php _e('Email address used during purchase', 'promptfluid-reflex'); ?></p>
                    </td>
                </tr>
            </table>
            
            <p class="submit">
                <button type="submit" class="button button-primary button-hero">
                    <?php _e('Activate License', 'promptfluid-reflex'); ?>
                </button>
            </p>
        </form>
    </div>
    <?php else: ?>
    <!-- Deactivate License Form -->
    <div class="pfdef-license-form-card">
        <h2><?php _e('Deactivate License', 'promptfluid-reflex'); ?></h2>
        <p><?php _e('Deactivating your license will downgrade this site to the free Lite edition. Your license key can be used on another site.', 'promptfluid-reflex'); ?></p>
        
        <form method="post" action="" onsubmit="return confirm('<?php _e('Are you sure you want to deactivate your license?', 'promptfluid-reflex'); ?>');">
            <?php wp_nonce_field('pfdef_license_action'); ?>
            <input type="hidden" name="pfdef_license_action" value="deactivate">
            
            <p class="submit">
                <button type="submit" class="button button-secondary">
                    <?php _e('Deactivate License', 'promptfluid-reflex'); ?>
                </button>
            </p>
        </form>
    </div>
    <?php endif; ?>
    
</div>

<style>
.pfdef-license-page {
    max-width: 900px;
}

.pfdef-license-status-card,
.pfdef-license-form-card {
    background: white;
    border: 1px solid #ccd0d4;
    border-radius: 8px;
    padding: 30px;
    margin-bottom: 30px;
}

.pfdef-license-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 30px;
}

.pfdef-license-tier-badge {
    padding: 15px 30px;
    border-radius: 8px;
    font-size: 20px;
    font-weight: bold;
    text-transform: uppercase;
    color: white;
}

.pfdef-license-tier-badge.pfdef-tier-lite {
    background: #95a5a6;
}

.pfdef-license-tier-badge.pfdef-tier-pro {
    background: linear-gradient(135deg, #7A5FFF, #9b7fff);
}

.pfdef-license-tier-badge.pfdef-tier-complete {
    background: linear-gradient(135deg, #7A5FFF, #01C9E8);
}

.pfdef-license-tier-badge.pfdef-tier-sentinel {
    background: linear-gradient(135deg, #0A0B10, #7A5FFF);
}

.pfdef-license-info h2 {
    margin: 0 0 10px 0;
}

.pfdef-license-info p {
    margin: 0;
    color: #666;
}

.pfdef-license-details {
    margin-top: 20px;
}

.pfdef-license-details table {
    margin-top: 0;
}

.pfdef-license-details th {
    width: 200px;
    font-weight: 600;
}

.pfdef-license-status {
    display: inline-block;
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
}

.pfdef-license-status.pfdef-status-active {
    background: #d4edda;
    color: #155724;
}

.pfdef-license-status.pfdef-status-inactive {
    background: #f8d7da;
    color: #721c24;
}

.pfdef-license-form-card h2 {
    margin-top: 0;
}
</style>
