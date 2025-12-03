<?php
/**
 * Upgrade Page
 *
 * @package PromptFluid_Reflex
 */

if (!defined('ABSPATH')) {
    exit;
}

require_once PFDEF_PLUGIN_DIR . 'includes/class-licensing.php';

$current_tier = PromptFluid_Defense_Licensing::get_current_tier();
$tier_info = PromptFluid_Defense_Licensing::get_tier_info();
$trial_status = PromptFluid_Defense_Licensing::get_trial_status();

?>

<div class="wrap pfdef-upgrade-page">
    <h1><?php _e('PromptFluid Reflex - Upgrade', 'promptfluid-reflex'); ?></h1>
    
    <div class="pfdef-current-tier-banner">
        <div class="pfdef-tier-badge pfdef-tier-<?php echo esc_attr($current_tier); ?>">
            <?php echo esc_html($tier_info['name']); ?>
        </div>
        <div class="pfdef-tier-info">
            <h2><?php _e('Current Plan:', 'promptfluid-defense'); ?> <strong><?php echo esc_html($tier_info['name']); ?></strong></h2>
            <?php if ($current_tier === 'lite'): ?>
                <p><?php _e('You\'re using the free version with basic AI-powered bot protection.', 'promptfluid-defense'); ?></p>
            <?php else: ?>
                <p><?php _e('Thank you for being a premium PromptFluid Reflex customer!', 'promptfluid-reflex'); ?></p>
            <?php endif; ?>
        </div>
    </div>
    
    <?php if ($trial_status['active']): ?>
    <div class="notice notice-info">
        <p><strong><?php _e('Trial Active:', 'promptfluid-defense'); ?></strong> 
        <?php printf(__('You have %d days remaining in your %s trial.', 'promptfluid-defense'), 
            $trial_status['days_remaining'], 
            ucfirst($trial_status['tier'])
        ); ?>
        </p>
    </div>
    <?php endif; ?>
    
    <div class="pfdef-pricing-tiers">
        
        <!-- Lite (Free) -->
        <div class="pfdef-tier-card <?php echo $current_tier === 'lite' ? 'pfdef-tier-current' : ''; ?>">
            <div class="pfdef-tier-header">
                <h3>Lite</h3>
                <div class="pfdef-tier-price">
                    <span class="pfdef-price-amount">$0</span>
                    <span class="pfdef-price-period"><?php _e('Forever Free', 'promptfluid-defense'); ?></span>
                </div>
            </div>
            <div class="pfdef-tier-features">
                <ul>
                    <li><span class="dashicons dashicons-yes"></span> <?php _e('Behavioral Bot Detection', 'promptfluid-defense'); ?></li>
                    <li><span class="dashicons dashicons-yes"></span> <?php _e('Device Fingerprinting', 'promptfluid-defense'); ?></li>
                    <li><span class="dashicons dashicons-yes"></span> <?php _e('Basic AI Learning', 'promptfluid-defense'); ?></li>
                    <li><span class="dashicons dashicons-yes"></span> <?php _e('Analytics Dashboard', 'promptfluid-defense'); ?></li>
                    <li><span class="dashicons dashicons-yes"></span> <?php _e('Heatmap & Honeypot Traps', 'promptfluid-defense'); ?></li>
                    <li><span class="dashicons dashicons-yes"></span> <?php _e('Compatible with All Security Plugins', 'promptfluid-defense'); ?></li>
                </ul>
            </div>
            <?php if ($current_tier === 'lite'): ?>
                <div class="pfdef-tier-action">
                    <button class="button button-primary" disabled><?php _e('Current Plan', 'promptfluid-defense'); ?></button>
                </div>
            <?php endif; ?>
        </div>
        
        <!-- Pro -->
        <div class="pfdef-tier-card pfdef-tier-featured <?php echo $current_tier === 'pro' ? 'pfdef-tier-current' : ''; ?>">
            <div class="pfdef-tier-badge-featured"><?php _e('Most Popular', 'promptfluid-defense'); ?></div>
            <div class="pfdef-tier-header">
                <h3>Pro</h3>
                <div class="pfdef-tier-price">
                    <span class="pfdef-price-amount">$19</span>
                    <span class="pfdef-price-period"><?php _e('per month', 'promptfluid-defense'); ?></span>
                </div>
                <div class="pfdef-annual-price"><?php _e('or $149/year (save $79)', 'promptfluid-defense'); ?></div>
            </div>
            <div class="pfdef-tier-features">
                <p><strong><?php _e('Everything in Lite, plus:', 'promptfluid-defense'); ?></strong></p>
                <ul>
                    <li><span class="dashicons dashicons-yes"></span> <?php _e('Real-time Blocking', 'promptfluid-defense'); ?></li>
                    <li><span class="dashicons dashicons-yes"></span> <?php _e('Web Application Firewall', 'promptfluid-defense'); ?></li>
                    <li><span class="dashicons dashicons-yes"></span> <?php _e('Login Protection & Rate Limiting', 'promptfluid-defense'); ?></li>
                    <li><span class="dashicons dashicons-yes"></span> <?php _e('Geo-Blocking', 'promptfluid-defense'); ?></li>
                    <li><span class="dashicons dashicons-yes"></span> <?php _e('File Integrity Monitoring', 'promptfluid-defense'); ?></li>
                    <li><span class="dashicons dashicons-yes"></span> <?php _e('Weekly Malware Scans', 'promptfluid-defense'); ?></li>
                    <li><span class="dashicons dashicons-yes"></span> <?php _e('PromptFluid Brain Integration', 'promptfluid-defense'); ?></li>
                </ul>
            </div>
            <div class="pfdef-tier-action">
                <?php if ($current_tier === 'lite'): ?>
                    <button class="button button-primary button-hero pfdef-stripe-checkout" 
                            data-tier="pro" 
                            data-interval="month"
                            data-price-id="price_1SOLX7Q7FtTiAL4aanJsV9Gf">
                        <?php _e('Upgrade to Pro - $19/mo', 'promptfluid-defense'); ?>
                    </button>
                    <button class="button button-primary pfdef-stripe-checkout" 
                            data-tier="pro" 
                            data-interval="year"
                            data-price-id="price_1SOLX7Q7FtTiAL4aMm0ZYDrN">
                        <?php _e('Upgrade to Pro - $149/yr (Save 30%)', 'promptfluid-defense'); ?>
                    </button>
                <?php elseif ($current_tier === 'pro'): ?>
                    <button class="button button-primary" disabled><?php _e('Current Plan', 'promptfluid-defense'); ?></button>
                    <button class="button pfdef-manage-subscription"><?php _e('Manage Subscription', 'promptfluid-defense'); ?></button>
                <?php else: ?>
                    <button class="button" disabled><?php _e('Contact Sales', 'promptfluid-defense'); ?></button>
                <?php endif; ?>
            </div>
        </div>
        
        <!-- Complete -->
        <div class="pfdef-tier-card <?php echo $current_tier === 'complete' ? 'pfdef-tier-current' : ''; ?>">
            <div class="pfdef-tier-header">
                <h3>Complete</h3>
                <div class="pfdef-tier-price">
                    <span class="pfdef-price-amount">$39</span>
                    <span class="pfdef-price-period"><?php _e('per month', 'promptfluid-defense'); ?></span>
                </div>
                <div class="pfdef-annual-price"><?php _e('or $349/year (save $119)', 'promptfluid-defense'); ?></div>
            </div>
            <div class="pfdef-tier-features">
                <p><strong><?php _e('Everything in Pro, plus:', 'promptfluid-defense'); ?></strong></p>
                <ul>
                    <li><span class="dashicons dashicons-yes"></span> <?php _e('Auto-Remediation', 'promptfluid-defense'); ?></li>
                    <li><span class="dashicons dashicons-yes"></span> <?php _e('Red Team Simulator', 'promptfluid-defense'); ?></li>
                    <li><span class="dashicons dashicons-yes"></span> <?php _e('Brain Rule Reflection', 'promptfluid-defense'); ?></li>
                    <li><span class="dashicons dashicons-yes"></span> <?php _e('Full Stealth Layer', 'promptfluid-defense'); ?></li>
                    <li><span class="dashicons dashicons-yes"></span> <?php _e('AI Config Auto-Tuning', 'promptfluid-defense'); ?></li>
                    <li><span class="dashicons dashicons-yes"></span> <?php _e('Daily Malware Scans', 'promptfluid-defense'); ?></li>
                </ul>
            </div>
            <div class="pfdef-tier-action">
                <?php if (in_array($current_tier, array('lite', 'pro'))): ?>
                    <button class="button button-primary pfdef-stripe-checkout" 
                            data-tier="complete" 
                            data-interval="month"
                            data-price-id="price_1SOLZOQ7FtTiAL4a0fGOQ8Ai">
                        <?php _e('Upgrade to Complete - $39/mo', 'promptfluid-defense'); ?>
                    </button>
                    <button class="button button-primary pfdef-stripe-checkout" 
                            data-tier="complete" 
                            data-interval="year"
                            data-price-id="price_1SOLZOQ7FtTiAL4abccQwFyQ">
                        <?php _e('Upgrade to Complete - $349/yr (Save 30%)', 'promptfluid-defense'); ?>
                    </button>
                <?php elseif ($current_tier === 'complete'): ?>
                    <button class="button button-primary" disabled><?php _e('Current Plan', 'promptfluid-defense'); ?></button>
                    <button class="button pfdef-manage-subscription"><?php _e('Manage Subscription', 'promptfluid-defense'); ?></button>
                <?php else: ?>
                    <button class="button" disabled><?php _e('Contact Sales', 'promptfluid-defense'); ?></button>
                <?php endif; ?>
            </div>
        </div>
        
        <!-- Sentinel (Managed) -->
        <div class="pfdef-tier-card pfdef-tier-enterprise <?php echo $current_tier === 'sentinel' ? 'pfdef-tier-current' : ''; ?>">
            <div class="pfdef-tier-header">
                <h3>Sentinel</h3>
                <div class="pfdef-tier-price">
                    <span class="pfdef-price-amount">$79+</span>
                    <span class="pfdef-price-period"><?php _e('per month', 'promptfluid-defense'); ?></span>
                </div>
                <div class="pfdef-annual-price"><?php _e('Managed Security Service', 'promptfluid-defense'); ?></div>
            </div>
            <div class="pfdef-tier-features">
                <p><strong><?php _e('Everything in Complete, plus:', 'promptfluid-defense'); ?></strong></p>
                <ul>
                    <li><span class="dashicons dashicons-yes"></span> <?php _e('Managed Service with Priority Support', 'promptfluid-defense'); ?></li>
                    <li><span class="dashicons dashicons-yes"></span> <?php _e('Dedicated Red Team Access', 'promptfluid-defense'); ?></li>
                    <li><span class="dashicons dashicons-yes"></span> <?php _e('Priority Security Updates', 'promptfluid-defense'); ?></li>
                    <li><span class="dashicons dashicons-yes"></span> <?php _e('Multi-Site Network Support', 'promptfluid-defense'); ?></li>
                    <li><span class="dashicons dashicons-yes"></span> <?php _e('White-Label Options', 'promptfluid-defense'); ?></li>
                </ul>
            </div>
            <div class="pfdef-tier-action">
                <?php if ($current_tier !== 'sentinel'): ?>
                    <button class="button button-primary pfdef-stripe-checkout" 
                            data-tier="sentinel" 
                            data-interval="month"
                            data-price-id="price_1SOMBzQ7FtTiAL4aEJbFnL5b">
                        <?php _e('Upgrade to Sentinel - $79/mo', 'promptfluid-defense'); ?>
                    </button>
                    <button class="button button-primary pfdef-stripe-checkout" 
                            data-tier="sentinel" 
                            data-interval="year"
                            data-price-id="price_1SOMBzQ7FtTiAL4aGf0eVISx">
                        <?php _e('Upgrade to Sentinel - $663.60/yr (Save 30%)', 'promptfluid-defense'); ?>
                    </button>
                <?php else: ?>
                    <button class="button button-primary" disabled><?php _e('Current Plan', 'promptfluid-defense'); ?></button>
                    <button class="button pfdef-manage-subscription"><?php _e('Manage Subscription', 'promptfluid-defense'); ?></button>
                <?php endif; ?>
            </div>
        </div>
        
    </div>
    
    <div class="pfdef-upgrade-features">
        <h2><?php _e('Why Upgrade to PromptFluid Reflex Premium?', 'promptfluid-reflex'); ?></h2>
        <div class="pfdef-feature-grid">
            <div class="pfdef-feature-item">
                <span class="dashicons dashicons-shield-alt"></span>
                <h3><?php _e('AI-Driven Intelligence', 'promptfluid-reflex'); ?></h3>
                <p><?php _e('Unlike traditional security plugins, PromptFluid Reflex uses self-learning AI to adapt to evolving threats in real-time.', 'promptfluid-reflex'); ?></p>
            </div>
            <div class="pfdef-feature-item">
                <span class="dashicons dashicons-performance"></span>
                <h3><?php _e('Lightweight & Fast', 'promptfluid-defense'); ?></h3>
                <p><?php _e('Less than 50ms overhead per request. Works seamlessly alongside other security plugins without conflicts.', 'promptfluid-defense'); ?></p>
            </div>
            <div class="pfdef-feature-item">
                <span class="dashicons dashicons-chart-line"></span>
                <h3><?php _e('Advanced Analytics', 'promptfluid-defense'); ?></h3>
                <p><?php _e('Deep insights into attack patterns, behavioral analytics, and threat intelligence powered by PromptFluid Brain.', 'promptfluid-defense'); ?></p>
            </div>
            <div class="pfdef-feature-item">
                <span class="dashicons dashicons-admin-tools"></span>
                <h3><?php _e('Auto-Remediation', 'promptfluid-defense'); ?></h3>
                <p><?php _e('Premium tiers include automatic threat response and self-healing capabilities to neutralize attacks instantly.', 'promptfluid-defense'); ?></p>
            </div>
        </div>
    </div>
    
    <div class="pfdef-upgrade-faq">
        <h2><?php _e('Frequently Asked Questions', 'promptfluid-defense'); ?></h2>
        <div class="pfdef-faq-item">
            <h4><?php _e('Can I try premium features before purchasing?', 'promptfluid-defense'); ?></h4>
            <p><?php _e('Yes! All paid tiers include a 3-day free trial with full access to all features.', 'promptfluid-defense'); ?></p>
        </div>
        <div class="pfdef-faq-item">
            <h4><?php _e('What happens if I don\'t renew?', 'promptfluid-defense'); ?></h4>
            <p><?php _e('Your site automatically downgrades to the free Lite tier. All core protection features remain active, but premium features will be locked.', 'promptfluid-defense'); ?></p>
        </div>
        <div class="pfdef-faq-item">
            <h4><?php _e('Is PromptFluid Reflex compatible with other security plugins?', 'promptfluid-reflex'); ?></h4>
            <p><?php _e('Absolutely! PromptFluid Reflex is designed to work alongside Wordfence, Sucuri, and other security solutions without conflicts.', 'promptfluid-reflex'); ?></p>
        </div>
        <div class="pfdef-faq-item">
            <h4><?php _e('Do you offer refunds?', 'promptfluid-defense'); ?></h4>
            <p><?php _e('Yes, we offer a 30-day money-back guarantee if you\'re not satisfied with your purchase.', 'promptfluid-defense'); ?></p>
        </div>
        <div class="pfdef-faq-item">
            <h4><?php _e('How do I get support?', 'promptfluid-defense'); ?></h4>
            <p><?php printf(__('Contact us at %s or call %s for assistance.', 'promptfluid-defense'), 
                '<a href="mailto:PromptFluid@gmail.com">PromptFluid@gmail.com</a>', 
                '<a href="tel:+17603584324">(760) 358-4324</a>'); ?></p>
        </div>
    </div>
    
</div>

<script>
jQuery(document).ready(function($) {
    // Handle Stripe checkout
    $('.pfdef-stripe-checkout').on('click', function(e) {
        e.preventDefault();
        
        const $btn = $(this);
        const priceId = $btn.data('price-id');
        const tier = $btn.data('tier');
        const interval = $btn.data('interval');
        
        $btn.prop('disabled', true).text('<?php _e('Processing...', 'promptfluid-defense'); ?>');
        
        // Call WordPress REST API endpoint to create Stripe checkout
        $.ajax({
            url: ajaxurl,
            method: 'POST',
            data: {
                action: 'pfdef_create_checkout',
                price_id: priceId,
                tier: tier,
                interval: interval,
                nonce: '<?php echo wp_create_nonce('pfdef_stripe_checkout'); ?>'
            },
            success: function(response) {
                if (response.success && response.data.url) {
                    window.open(response.data.url, '_blank');
                    $btn.prop('disabled', false).text($btn.data('original-text') || '<?php _e('Upgrade', 'promptfluid-defense'); ?>');
                } else {
                    alert('<?php _e('Error creating checkout session. Please try again.', 'promptfluid-defense'); ?>');
                    $btn.prop('disabled', false).text($btn.data('original-text') || '<?php _e('Upgrade', 'promptfluid-defense'); ?>');
                }
            },
            error: function() {
                alert('<?php _e('Error connecting to payment system. Please try again.', 'promptfluid-defense'); ?>');
                $btn.prop('disabled', false).text($btn.data('original-text') || '<?php _e('Upgrade', 'promptfluid-defense'); ?>');
            }
        });
    });
    
    // Handle manage subscription
    $('.pfdef-manage-subscription').on('click', function(e) {
        e.preventDefault();
        
        const $btn = $(this);
        $btn.prop('disabled', true).text('<?php _e('Loading...', 'promptfluid-defense'); ?>');
        
        $.ajax({
            url: ajaxurl,
            method: 'POST',
            data: {
                action: 'pfdef_customer_portal',
                nonce: '<?php echo wp_create_nonce('pfdef_customer_portal'); ?>'
            },
            success: function(response) {
                if (response.success && response.data.url) {
                    window.open(response.data.url, '_blank');
                    $btn.prop('disabled', false).text('<?php _e('Manage Subscription', 'promptfluid-defense'); ?>');
                } else {
                    alert('<?php _e('Error opening customer portal. Please try again.', 'promptfluid-defense'); ?>');
                    $btn.prop('disabled', false).text('<?php _e('Manage Subscription', 'promptfluid-defense'); ?>');
                }
            },
            error: function() {
                alert('<?php _e('Error connecting to payment system. Please try again.', 'promptfluid-defense'); ?>');
                $btn.prop('disabled', false).text('<?php _e('Manage Subscription', 'promptfluid-defense'); ?>');
            }
        });
    });
});
</script>

<style>
.pfdef-upgrade-page {
    max-width: 1400px;
    margin: 20px auto;
}

.pfdef-current-tier-banner {
    background: linear-gradient(135deg, #7A5FFF 0%, #01C9E8 100%);
    color: white;
    padding: 30px;
    border-radius: 12px;
    margin-bottom: 30px;
    display: flex;
    align-items: center;
    gap: 20px;
}

.pfdef-tier-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 15px 30px;
    border-radius: 8px;
    font-size: 24px;
    font-weight: bold;
    text-transform: uppercase;
}

.pfdef-tier-info h2 {
    color: white;
    margin: 0 0 10px 0;
}

.pfdef-tier-info p {
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
}

.pfdef-pricing-tiers {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 50px;
}

.pfdef-tier-card {
    background: white;
    border: 2px solid #e5e5e5;
    border-radius: 12px;
    padding: 30px;
    position: relative;
    transition: all 0.3s ease;
}

.pfdef-tier-card:hover {
    border-color: #7A5FFF;
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(122, 95, 255, 0.1);
}

.pfdef-tier-featured {
    border-color: #7A5FFF;
    box-shadow: 0 10px 40px rgba(122, 95, 255, 0.15);
}

.pfdef-tier-current {
    border-color: #01C9E8;
    background: linear-gradient(to bottom, #f8fcff 0%, white 100%);
}

.pfdef-tier-badge-featured {
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    background: #7A5FFF;
    color: white;
    padding: 8px 20px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
}

.pfdef-tier-header h3 {
    font-size: 28px;
    margin: 0 0 15px 0;
    color: #0A0B10;
}

.pfdef-tier-price {
    margin-bottom: 10px;
}

.pfdef-price-amount {
    font-size: 48px;
    font-weight: bold;
    color: #7A5FFF;
}

.pfdef-price-period {
    font-size: 16px;
    color: #666;
    margin-left: 5px;
}

.pfdef-annual-price {
    font-size: 14px;
    color: #01C9E8;
    font-weight: 600;
}

.pfdef-tier-features {
    margin: 30px 0;
    min-height: 300px;
}

.pfdef-tier-features ul {
    list-style: none;
    padding: 0;
    margin: 15px 0 0 0;
}

.pfdef-tier-features li {
    padding: 8px 0;
    color: #444;
    display: flex;
    align-items: flex-start;
    gap: 10px;
}

.pfdef-tier-features .dashicons-yes {
    color: #01C9E8;
    margin-top: 2px;
    flex-shrink: 0;
}

.pfdef-tier-action {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.pfdef-tier-action .button-hero {
    padding: 15px 30px;
    height: auto;
    font-size: 16px;
}

.pfdef-start-trial {
    background: transparent;
    border: 2px solid #7A5FFF;
    color: #7A5FFF;
}

.pfdef-start-trial:hover {
    background: #7A5FFF;
    color: white;
}

.pfdef-upgrade-features,
.pfdef-upgrade-faq {
    background: white;
    padding: 40px;
    border-radius: 12px;
    margin-top: 40px;
}

.pfdef-upgrade-features h2,
.pfdef-upgrade-faq h2 {
    text-align: center;
    margin-bottom: 40px;
    color: #0A0B10;
}

.pfdef-feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
}

.pfdef-feature-item {
    text-align: center;
}

.pfdef-feature-item .dashicons {
    font-size: 48px;
    width: 48px;
    height: 48px;
    color: #7A5FFF;
    margin-bottom: 15px;
}

.pfdef-feature-item h3 {
    margin: 15px 0 10px 0;
    color: #0A0B10;
}

.pfdef-feature-item p {
    color: #666;
    line-height: 1.6;
}

.pfdef-faq-item {
    margin-bottom: 30px;
    padding-bottom: 30px;
    border-bottom: 1px solid #e5e5e5;
}

.pfdef-faq-item:last-child {
    border-bottom: none;
}

.pfdef-faq-item h4 {
    color: #0A0B10;
    margin-bottom: 10px;
}

.pfdef-faq-item p {
    color: #666;
    line-height: 1.6;
    margin: 0;
}
</style>

<script>
jQuery(document).ready(function($) {
    $('.pfdef-start-trial').on('click', function() {
        const tier = $(this).data('tier');
        
        if (!confirm('<?php _e('Start a 3-day free trial? You will not be charged until the trial ends.', 'promptfluid-defense'); ?>')) {
            return;
        }
        
        $.post(ajaxurl, {
            action: 'pfdef_start_trial',
            tier: tier,
            nonce: '<?php echo wp_create_nonce('pfdef_trial'); ?>'
        }, function(response) {
            if (response.success) {
                location.reload();
            } else {
                alert(response.data.message || '<?php _e('Could not start trial. Please try again.', 'promptfluid-defense'); ?>');
            }
        });
    });
});
</script>
