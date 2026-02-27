<?php if (!defined('ABSPATH')) exit; ?>

<div class="wrap bot-sniper-setup">
    <h1>🎯 Welcome to Bot Sniper</h1>
    <p class="lead">AI-powered bot detection for your WordPress site. Start your 7-day free trial now!</p>
    
    <div class="bs-setup-card">
        <h2>🚀 Get Started in 3 Steps</h2>
        
        <div class="bs-steps">
            <div class="bs-step">
                <div class="bs-step-number">1</div>
                <div class="bs-step-content">
                    <h3>Create Your Account</h3>
                    <p>Click the button below to create your PromptFluid account and get your API key.</p>
                    <a href="https://www.promptfluid.com/bot-sniper/signup?trial=7day&source=wordpress" 
                       class="button button-primary button-hero" 
                       target="_blank">
                        Create Free Account →
                    </a>
                </div>
            </div>
            
            <div class="bs-step">
                <div class="bs-step-number">2</div>
                <div class="bs-step-content">
                    <h3>Enter Your API Key</h3>
                    <p>Copy your API key from the dashboard and paste it below.</p>
                    <form method="post" action="options.php" id="bot-sniper-setup-form">
                        <?php settings_fields('bot_sniper_settings'); ?>
                        <table class="form-table">
                            <tr>
                                <th scope="row">
                                    <label for="bot_sniper_api_key">API Key</label>
                                </th>
                                <td>
                                    <input type="text" 
                                           id="bot_sniper_api_key" 
                                           name="bot_sniper_api_key" 
                                           class="regular-text" 
                                           placeholder="pfbs_..." 
                                           required>
                                    <p class="description">Your API key starts with "pfbs_"</p>
                                </td>
                            </tr>
                        </table>
                        <?php submit_button('Save API Key & Continue', 'primary', 'submit', false); ?>
                    </form>
                </div>
            </div>
            
            <div class="bs-step">
                <div class="bs-step-number">3</div>
                <div class="bs-step-content">
                    <h3>You're Protected! 🛡️</h3>
                    <p>Bot Sniper is now actively protecting your site from malicious bots.</p>
                </div>
            </div>
        </div>
    </div>
    
    <div class="bs-info-grid">
        <div class="bs-info-card">
            <h3>✨ What You Get</h3>
            <ul>
                <li>7-day free trial (no credit card required)</li>
                <li>AI-powered bot detection</li>
                <li>Real-time threat blocking</li>
                <li>Detailed analytics dashboard</li>
                <li>Up to 10,000 requests/month on trial</li>
            </ul>
        </div>
        
        <div class="bs-info-card">
            <h3>💰 Pricing After Trial</h3>
            <ul>
                <li><strong>$1 for first month</strong> (special launch pricing)</li>
                <li>Then $9/month after that</li>
                <li>Up to 50,000 requests/month</li>
                <li>Cancel anytime, no questions asked</li>
            </ul>
        </div>
        
        <div class="bs-info-card">
            <h3>🚀 Need More Power?</h3>
            <p>Upgrade to <strong>PromptFluid Reflex</strong> for:</p>
            <ul>
                <li>Full WAF (Web Application Firewall)</li>
                <li>Malware scanning</li>
                <li>Advanced behavioral analysis</li>
                <li>Unlimited requests</li>
            </ul>
            <p><strong>$39/month</strong> or $9/month base + $30 upgrade</p>
        </div>
    </div>
</div>

<style>
.bot-sniper-setup {
    max-width: 1200px;
}

.lead {
    font-size: 1.2em;
    color: #666;
    margin-bottom: 30px;
}

.bs-setup-card {
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 30px;
    margin-bottom: 30px;
}

.bs-steps {
    margin-top: 30px;
}

.bs-step {
    display: flex;
    gap: 20px;
    margin-bottom: 40px;
    padding-bottom: 40px;
    border-bottom: 1px solid #eee;
}

.bs-step:last-child {
    border-bottom: none;
}

.bs-step-number {
    width: 50px;
    height: 50px;
    background: #2271b1;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
    flex-shrink: 0;
}

.bs-step-content {
    flex: 1;
}

.bs-step-content h3 {
    margin-top: 0;
    font-size: 1.4em;
}

.bs-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}

.bs-info-card {
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
}

.bs-info-card h3 {
    margin-top: 0;
}

.bs-info-card ul {
    margin: 15px 0;
    padding-left: 20px;
}

.bs-info-card li {
    margin-bottom: 8px;
}

.button-hero {
    font-size: 1.1em !important;
    padding: 12px 30px !important;
    height: auto !important;
}
</style>
