<?php
/**
 * Installation Wizard - First-Time Setup Flow
 *
 * @package PromptFluid_Reflex
 */

if (!defined('ABSPATH')) {
    exit;
}

// Check if wizard should be shown
$wizard_completed = get_option('pfdef_wizard_completed', false);
if ($wizard_completed && !isset($_GET['force_wizard'])) {
    wp_safe_redirect(admin_url('admin.php?page=promptfluid-reflex'));
    exit;
}
?>

<div class="pfdef-wizard-container">
    <div class="pfdef-wizard-header">
        <div class="pfdef-wizard-logo">
            <div class="pfdef-shield-animation">
                🛡️
            </div>
            <h1>PromptFluid Reflex<span class="pfdef-bot-sniper">Bot Sniper™</span></h1>
            <p class="pfdef-wizard-subtitle">Enterprise AI Security - Setup in 3 Minutes</p>
        </div>
        
        <!-- Progress Bar -->
        <div class="pfdef-wizard-progress">
            <div class="pfdef-progress-bar" id="wizardProgress"></div>
        </div>
        
        <div class="pfdef-wizard-steps">
            <div class="pfdef-step active" data-step="1">
                <div class="pfdef-step-number">1</div>
                <div class="pfdef-step-label">Welcome</div>
            </div>
            <div class="pfdef-step" data-step="2">
                <div class="pfdef-step-number">2</div>
                <div class="pfdef-step-label">Sensitivity</div>
            </div>
            <div class="pfdef-step" data-step="3">
                <div class="pfdef-step-number">3</div>
                <div class="pfdef-step-label">Scan</div>
            </div>
            <div class="pfdef-step" data-step="4">
                <div class="pfdef-step-number">4</div>
                <div class="pfdef-step-label">Alerts</div>
            </div>
            <div class="pfdef-step" data-step="5">
                <div class="pfdef-step-number">5</div>
                <div class="pfdef-step-label">Complete</div>
            </div>
        </div>
    </div>
    
    <div class="pfdef-wizard-content">
        <!-- Step 1: Welcome -->
        <div class="pfdef-wizard-step step-1 active" data-step="1">
            <div class="pfdef-step-inner">
                <div class="pfdef-feature-icon">⚡</div>
                <h2>Welcome to the Future of WordPress Security</h2>
                <p class="pfdef-lead">PromptFluid Reflex uses cutting-edge AI to protect your site from bots, malware, and cyber threats—automatically.</p>
                
                <div class="pfdef-feature-grid">
                    <div class="pfdef-feature">
                        <div class="pfdef-feature-icon-small">🎯</div>
                        <h4>Bot Sniper™ AI</h4>
                        <p>99.2% accuracy in detecting human vs. bot behavior</p>
                    </div>
                    <div class="pfdef-feature">
                        <div class="pfdef-feature-icon-small">🛡️</div>
                        <h4>Web Application Firewall</h4>
                        <p>Blocks SQL injection, XSS, RCE attacks in real-time</p>
                    </div>
                    <div class="pfdef-feature">
                        <div class="pfdef-feature-icon-small">🔒</div>
                        <h4>File Integrity Monitor</h4>
                        <p>Monitors 1000+ WordPress core files for tampering</p>
                    </div>
                    <div class="pfdef-feature">
                        <div class="pfdef-feature-icon-small">🦠</div>
                        <h4>Malware Scanner</h4>
                        <p>Detects backdoors, trojans, and malicious code</p>
                    </div>
                </div>
                
                <div class="pfdef-wizard-actions">
                    <button class="button button-primary button-hero pfdef-wizard-next">
                        Get Started →
                    </button>
                    <a href="<?php echo admin_url('admin.php?page=promptfluid-reflex'); ?>" class="pfdef-skip-wizard">
                        Skip Setup (Not Recommended)
                    </a>
                </div>
            </div>
        </div>
        
        <!-- Step 2: Sensitivity Selection -->
        <div class="pfdef-wizard-step step-2" data-step="2">
            <div class="pfdef-step-inner">
                <h2>Choose Your Security Level</h2>
                <p class="pfdef-lead">How aggressive should Bot Sniper™ be? You can change this anytime.</p>
                
                <div class="pfdef-sensitivity-options">
                    <label class="pfdef-sensitivity-card">
                        <input type="radio" name="sensitivity" value="low" />
                        <div class="pfdef-sensitivity-content">
                            <div class="pfdef-sensitivity-header">
                                <h3>🟢 Low</h3>
                                <span class="pfdef-sensitivity-badge">Recommended for New Sites</span>
                            </div>
                            <p>Less strict detection. Minimal false positives. Good for testing.</p>
                            <ul>
                                <li>Ideal for new WordPress sites</li>
                                <li>Fewer CAPTCHA challenges</li>
                                <li>Safe learning mode</li>
                            </ul>
                        </div>
                    </label>
                    
                    <label class="pfdef-sensitivity-card recommended">
                        <input type="radio" name="sensitivity" value="medium" checked />
                        <div class="pfdef-sensitivity-content">
                            <div class="pfdef-sensitivity-header">
                                <h3>🟡 Medium</h3>
                                <span class="pfdef-sensitivity-badge featured">Most Popular</span>
                            </div>
                            <p>Balanced protection. Catches most threats while minimizing false positives.</p>
                            <ul>
                                <li>Ideal for most WordPress sites</li>
                                <li>Smart adaptive learning</li>
                                <li>Best threat-to-convenience ratio</li>
                            </ul>
                        </div>
                    </label>
                    
                    <label class="pfdef-sensitivity-card">
                        <input type="radio" name="sensitivity" value="high" />
                        <div class="pfdef-sensitivity-content">
                            <div class="pfdef-sensitivity-header">
                                <h3>🔴 High</h3>
                                <span class="pfdef-sensitivity-badge">Maximum Protection</span>
                            </div>
                            <p>Maximum security. Aggressive bot detection. May require tuning.</p>
                            <ul>
                                <li>Ideal for high-value sites</li>
                                <li>E-commerce & membership sites</li>
                                <li>Zero-tolerance security</li>
                            </ul>
                        </div>
                    </label>
                </div>
                
                <div class="pfdef-wizard-actions">
                    <button class="button button-secondary pfdef-wizard-prev">
                        ← Back
                    </button>
                    <button class="button button-primary button-hero pfdef-wizard-next">
                        Continue →
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Step 3: Initial Scan -->
        <div class="pfdef-wizard-step step-3" data-step="3">
            <div class="pfdef-step-inner">
                <h2>Running Initial Security Scan</h2>
                <p class="pfdef-lead">Scanning your WordPress installation for threats and vulnerabilities...</p>
                
                <div class="pfdef-scan-progress">
                    <div class="pfdef-scan-icon">
                        <div class="pfdef-scanner-beam"></div>
                        🔍
                    </div>
                    
                    <div class="pfdef-scan-status" id="scanStatus">
                        <div class="pfdef-scan-phase active">
                            <span class="pfdef-phase-icon">⏳</span>
                            <span class="pfdef-phase-text">Scanning core files...</span>
                            <span class="pfdef-phase-progress">25%</span>
                        </div>
                        <div class="pfdef-scan-phase">
                            <span class="pfdef-phase-icon">⏳</span>
                            <span class="pfdef-phase-text">Checking for malware...</span>
                            <span class="pfdef-phase-progress">50%</span>
                        </div>
                        <div class="pfdef-scan-phase">
                            <span class="pfdef-phase-icon">⏳</span>
                            <span class="pfdef-phase-text">Analyzing plugins...</span>
                            <span class="pfdef-phase-progress">75%</span>
                        </div>
                        <div class="pfdef-scan-phase">
                            <span class="pfdef-phase-icon">⏳</span>
                            <span class="pfdef-phase-text">Finalizing security baseline...</span>
                            <span class="pfdef-phase-progress">100%</span>
                        </div>
                    </div>
                    
                    <div class="pfdef-scan-results" id="scanResults" style="display:none;">
                        <div class="pfdef-result-card success">
                            <h3>✅ Scan Complete!</h3>
                            <div class="pfdef-result-stats">
                                <div class="pfdef-stat">
                                    <span class="pfdef-stat-number" id="filesScanned">0</span>
                                    <span class="pfdef-stat-label">Files Scanned</span>
                                </div>
                                <div class="pfdef-stat">
                                    <span class="pfdef-stat-number" id="threatsFound">0</span>
                                    <span class="pfdef-stat-label">Threats Found</span>
                                </div>
                                <div class="pfdef-stat">
                                    <span class="pfdef-stat-number" id="securityScore">100</span>
                                    <span class="pfdef-stat-label">Security Score</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="pfdef-wizard-actions" id="scanActions" style="display:none;">
                    <button class="button button-primary button-hero pfdef-wizard-next">
                        Continue →
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Step 4: Email Alerts -->
        <div class="pfdef-wizard-step step-4" data-step="4">
            <div class="pfdef-step-inner">
                <h2>Configure Security Alerts</h2>
                <p class="pfdef-lead">Get notified when threats are detected or your site needs attention.</p>
                
                <div class="pfdef-alert-options">
                    <div class="pfdef-form-group">
                        <label for="alertEmail">
                            <strong>Alert Email Address</strong>
                            <span class="pfdef-field-description">Where should we send security alerts?</span>
                        </label>
                        <input type="email" 
                               id="alertEmail" 
                               class="pfdef-input" 
                               value="<?php echo esc_attr(get_option('admin_email')); ?>" 
                               placeholder="admin@yoursite.com" />
                    </div>
                    
                    <div class="pfdef-alert-types">
                        <h4>Alert Types</h4>
                        <label class="pfdef-checkbox-card">
                            <input type="checkbox" checked />
                            <div class="pfdef-checkbox-content">
                                <h5>🔴 Critical Alerts</h5>
                                <p>Immediate threats, malware detected, site compromised</p>
                            </div>
                        </label>
                        
                        <label class="pfdef-checkbox-card">
                            <input type="checkbox" checked />
                            <div class="pfdef-checkbox-content">
                                <h5>🟡 Important Alerts</h5>
                                <p>Failed login attempts, suspicious activity, security warnings</p>
                            </div>
                        </label>
                        
                        <label class="pfdef-checkbox-card">
                            <input type="checkbox" />
                            <div class="pfdef-checkbox-content">
                                <h5>🟢 Weekly Digest</h5>
                                <p>Summary of security activity, statistics, and recommendations</p>
                            </div>
                        </label>
                    </div>
                </div>
                
                <div class="pfdef-wizard-actions">
                    <button class="button button-secondary pfdef-wizard-prev">
                        ← Back
                    </button>
                    <button class="button button-primary button-hero pfdef-wizard-next">
                        Continue →
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Step 5: Complete -->
        <div class="pfdef-wizard-step step-5" data-step="5">
            <div class="pfdef-step-inner">
                <div class="pfdef-success-animation">
                    <div class="pfdef-confetti"></div>
                    <div class="pfdef-shield-success">
                        🛡️
                        <div class="pfdef-checkmark">✓</div>
                    </div>
                </div>
                
                <h2>🎉 You're Protected!</h2>
                <p class="pfdef-lead">PromptFluid Reflex is now guarding your WordPress site with enterprise-grade AI security.</p>
                
                <div class="pfdef-protection-summary">
                    <div class="pfdef-summary-card">
                        <h4>✅ Active Protection Modules</h4>
                        <ul>
                            <li><span class="pfdef-module-badge">Bot Sniper™</span> AI-powered bot detection</li>
                            <li><span class="pfdef-module-badge">Firewall</span> Web application firewall (WAF)</li>
                            <li><span class="pfdef-module-badge">Login Guard</span> Brute force protection</li>
                            <li><span class="pfdef-module-badge">File Monitor</span> Integrity checking</li>
                            <li><span class="pfdef-module-badge">Malware Scanner</span> Threat detection</li>
                        </ul>
                    </div>
                    
                    <div class="pfdef-summary-card">
                        <h4>🚀 Next Steps</h4>
                        <ul>
                            <li>Review your security dashboard</li>
                            <li>Configure advanced settings (optional)</li>
                            <li>Consider upgrading to Pro for premium features</li>
                            <li>Join the PromptFluid community</li>
                        </ul>
                    </div>
                </div>
                
                <div class="pfdef-wizard-actions">
                    <button class="button button-primary button-hero pfdef-finish-wizard">
                        View Dashboard →
                    </button>
                    <a href="<?php echo admin_url('admin.php?page=promptfluid-reflex-upgrade'); ?>" class="button button-secondary button-hero">
                        ⚡ Explore Premium Features
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.pfdef-wizard-container {
    max-width: 1200px;
    margin: 40px auto;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.1);
    overflow: hidden;
}

.pfdef-wizard-header {
    background: linear-gradient(135deg, #7A5FFF 0%, #01C9E8 100%);
    padding: 40px;
    text-align: center;
    color: white;
    position: relative;
    overflow: hidden;
}

.pfdef-wizard-header::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.1); opacity: 0.8; }
}

.pfdef-shield-animation {
    font-size: 64px;
    display: inline-block;
    animation: float 3s ease-in-out infinite, glow 2s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
}

@keyframes glow {
    0%, 100% { filter: drop-shadow(0 0 10px rgba(255,255,255,0.5)); }
    50% { filter: drop-shadow(0 0 20px rgba(255,255,255,0.8)); }
}

.pfdef-wizard-logo h1 {
    font-size: 36px;
    margin: 15px 0 5px;
    font-weight: 700;
    position: relative;
    z-index: 1;
}

.pfdef-bot-sniper {
    display: block;
    font-size: 14px;
    font-weight: 400;
    opacity: 0.9;
    margin-top: 5px;
}

.pfdef-wizard-subtitle {
    font-size: 16px;
    opacity: 0.9;
    margin: 10px 0 0;
    position: relative;
    z-index: 1;
}

.pfdef-wizard-progress {
    width: 100%;
    height: 4px;
    background: rgba(255,255,255,0.2);
    margin: 30px 0 20px;
    border-radius: 2px;
    overflow: hidden;
    position: relative;
    z-index: 1;
}

.pfdef-progress-bar {
    height: 100%;
    background: white;
    width: 20%;
    transition: width 0.5s ease;
    box-shadow: 0 0 10px rgba(255,255,255,0.5);
}

.pfdef-wizard-steps {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 20px;
    position: relative;
    z-index: 1;
}

.pfdef-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    opacity: 0.5;
    transition: opacity 0.3s;
}

.pfdef-step.active {
    opacity: 1;
}

.pfdef-step.completed {
    opacity: 1;
}

.pfdef-step-number {
    width: 40px;
    height: 40px;
    background: rgba(255,255,255,0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    transition: all 0.3s;
}

.pfdef-step.active .pfdef-step-number {
    background: white;
    color: #7A5FFF;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transform: scale(1.1);
}

.pfdef-step.completed .pfdef-step-number {
    background: white;
    color: #10b981;
}

.pfdef-step-label {
    font-size: 12px;
    font-weight: 500;
}

.pfdef-wizard-content {
    padding: 60px 40px;
}

.pfdef-wizard-step {
    display: none;
    animation: fadeIn 0.5s ease;
}

.pfdef-wizard-step.active {
    display: block;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.pfdef-step-inner {
    max-width: 900px;
    margin: 0 auto;
}

.pfdef-feature-icon {
    font-size: 80px;
    text-align: center;
    margin-bottom: 20px;
    animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

.pfdef-wizard-step h2 {
    text-align: center;
    font-size: 32px;
    margin-bottom: 15px;
    color: #1f2937;
}

.pfdef-lead {
    text-align: center;
    font-size: 18px;
    color: #6b7280;
    margin-bottom: 40px;
}

.pfdef-feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
}

.pfdef-feature {
    text-align: center;
    padding: 30px 20px;
    background: #f9fafb;
    border-radius: 12px;
    transition: transform 0.3s, box-shadow 0.3s;
}

.pfdef-feature:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}

.pfdef-feature-icon-small {
    font-size: 36px;
    margin-bottom: 10px;
}

.pfdef-feature h4 {
    margin: 10px 0;
    color: #1f2937;
}

.pfdef-feature p {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
}

.pfdef-wizard-actions {
    text-align: center;
    margin-top: 40px;
    display: flex;
    justify-content: center;
    gap: 15px;
    flex-wrap: wrap;
}

.pfdef-skip-wizard {
    display: inline-block;
    margin-top: 15px;
    color: #6b7280;
    text-decoration: none;
    font-size: 14px;
}

.pfdef-skip-wizard:hover {
    color: #1f2937;
}

/* Sensitivity Cards */
.pfdef-sensitivity-options {
    display: grid;
    gap: 20px;
    margin-bottom: 40px;
}

.pfdef-sensitivity-card {
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 25px;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
}

.pfdef-sensitivity-card:hover {
    border-color: #7A5FFF;
    box-shadow: 0 8px 20px rgba(122, 95, 255, 0.15);
}

.pfdef-sensitivity-card input[type="radio"] {
    position: absolute;
    opacity: 0;
}

.pfdef-sensitivity-card input[type="radio"]:checked + .pfdef-sensitivity-content {
    border-left: 4px solid #7A5FFF;
    padding-left: 21px;
}

.pfdef-sensitivity-card.recommended {
    background: linear-gradient(135deg, rgba(122, 95, 255, 0.05) 0%, rgba(1, 201, 232, 0.05) 100%);
    border-color: #7A5FFF;
}

.pfdef-sensitivity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.pfdef-sensitivity-badge {
    padding: 4px 12px;
    background: #e5e7eb;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
}

.pfdef-sensitivity-badge.featured {
    background: linear-gradient(135deg, #7A5FFF 0%, #01C9E8 100%);
    color: white;
}

.pfdef-sensitivity-content ul {
    list-style: none;
    padding: 0;
    margin: 15px 0 0;
}

.pfdef-sensitivity-content li {
    padding: 8px 0;
    border-top: 1px solid #e5e7eb;
    color: #6b7280;
    font-size: 14px;
}

.pfdef-sensitivity-content li:before {
    content: '✓ ';
    color: #10b981;
    font-weight: bold;
    margin-right: 8px;
}

/* Scan Progress */
.pfdef-scan-progress {
    text-align: center;
    max-width: 600px;
    margin: 0 auto;
}

.pfdef-scan-icon {
    font-size: 120px;
    position: relative;
    display: inline-block;
    margin-bottom: 40px;
    animation: scanning 2s ease-in-out infinite;
}

@keyframes scanning {
    0%, 100% { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(180deg) scale(1.1); }
}

.pfdef-scanner-beam {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 200%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #7A5FFF, transparent);
    transform: translate(-50%, -50%);
    animation: beam 1.5s linear infinite;
}

@keyframes beam {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
}

.pfdef-scan-phase {
    padding: 15px 20px;
    background: #f9fafb;
    border-radius: 8px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    opacity: 0.5;
    transition: all 0.5s;
}

.pfdef-scan-phase.active {
    opacity: 1;
    background: linear-gradient(135deg, rgba(122, 95, 255, 0.1) 0%, rgba(1, 201, 232, 0.1) 100%);
    border-left: 4px solid #7A5FFF;
}

.pfdef-scan-phase.complete {
    opacity: 1;
}

.pfdef-scan-phase.complete .pfdef-phase-icon:before {
    content: '✓';
    color: #10b981;
}

.pfdef-result-card {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
    border: 2px solid #10b981;
    border-radius: 12px;
    padding: 40px;
    text-align: center;
    margin-top: 30px;
}

.pfdef-result-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
    margin-top: 30px;
}

.pfdef-result-stats .pfdef-stat-number {
    font-size: 48px;
    font-weight: 700;
    color: #10b981;
    display: block;
}

.pfdef-result-stats .pfdef-stat-label {
    font-size: 14px;
    color: #6b7280;
    display: block;
    margin-top: 8px;
}

/* Alert Configuration */
.pfdef-alert-options {
    max-width: 600px;
    margin: 0 auto 40px;
}

.pfdef-form-group {
    margin-bottom: 30px;
}

.pfdef-form-group label {
    display: block;
    margin-bottom: 10px;
    font-weight: 600;
    color: #1f2937;
}

.pfdef-field-description {
    display: block;
    font-size: 14px;
    color: #6b7280;
    font-weight: 400;
    margin-top: 5px;
}

.pfdef-input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.3s;
}

.pfdef-input:focus {
    outline: none;
    border-color: #7A5FFF;
    box-shadow: 0 0 0 3px rgba(122, 95, 255, 0.1);
}

.pfdef-alert-types h4 {
    margin-bottom: 20px;
    color: #1f2937;
}

.pfdef-checkbox-card {
    display: block;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 15px;
    cursor: pointer;
    transition: all 0.3s;
}

.pfdef-checkbox-card:hover {
    border-color: #7A5FFF;
    box-shadow: 0 4px 12px rgba(122, 95, 255, 0.1);
}

.pfdef-checkbox-card input[type="checkbox"] {
    margin-right: 15px;
}

.pfdef-checkbox-content h5 {
    margin: 0 0 8px;
    color: #1f2937;
}

.pfdef-checkbox-content p {
    margin: 0;
    color: #6b7280;
    font-size: 14px;
}

/* Success Animation */
.pfdef-success-animation {
    text-align: center;
    margin-bottom: 40px;
    position: relative;
}

.pfdef-confetti {
    position: absolute;
    top: -50px;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: 200px;
    pointer-events: none;
}

.pfdef-confetti::before,
.pfdef-confetti::after {
    content: '🎊';
    position: absolute;
    font-size: 30px;
    animation: confetti 3s ease-out infinite;
}

.pfdef-confetti::before {
    left: 20%;
    animation-delay: 0.2s;
}

.pfdef-confetti::after {
    right: 20%;
    animation-delay: 0.5s;
}

@keyframes confetti {
    0% {
        transform: translateY(0) rotate(0deg);
        opacity: 1;
    }
    100% {
        transform: translateY(200px) rotate(360deg);
        opacity: 0;
    }
}

.pfdef-shield-success {
    font-size: 120px;
    position: relative;
    display: inline-block;
    animation: successPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes successPop {
    0% { transform: scale(0); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
}

.pfdef-checkmark {
    position: absolute;
    bottom: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
    background: #10b981;
    border-radius: 50%;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    animation: checkmarkPop 0.4s 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) backwards;
}

@keyframes checkmarkPop {
    0% { transform: scale(0); }
    100% { transform: scale(1); }
}

.pfdef-protection-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 25px;
    margin-bottom: 40px;
}

.pfdef-summary-card {
    background: #f9fafb;
    border-radius: 12px;
    padding: 25px;
}

.pfdef-summary-card h4 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #1f2937;
}

.pfdef-summary-card ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.pfdef-summary-card li {
    padding: 10px 0;
    border-bottom: 1px solid #e5e7eb;
    color: #6b7280;
}

.pfdef-summary-card li:last-child {
    border-bottom: none;
}

.pfdef-module-badge {
    display: inline-block;
    padding: 2px 8px;
    background: linear-gradient(135deg, #7A5FFF 0%, #01C9E8 100%);
    color: white;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    margin-right: 8px;
}

/* Responsive */
@media (max-width: 768px) {
    .pfdef-wizard-content {
        padding: 40px 20px;
    }
    
    .pfdef-wizard-steps {
        gap: 8px;
    }
    
    .pfdef-step-label {
        font-size: 10px;
    }
    
    .pfdef-feature-grid {
        grid-template-columns: 1fr;
    }
    
    .pfdef-result-stats {
        grid-template-columns: 1fr;
    }
    
    .pfdef-protection-summary {
        grid-template-columns: 1fr;
    }
}
</style>

<script>
jQuery(document).ready(function($) {
    let currentStep = 1;
    const totalSteps = 5;
    
    // Update progress
    function updateProgress() {
        const progress = (currentStep / totalSteps) * 100;
        $('#wizardProgress').css('width', progress + '%');
        
        $('.pfdef-step').removeClass('active completed');
        $('.pfdef-step').each(function() {
            const step = $(this).data('step');
            if (step < currentStep) {
                $(this).addClass('completed');
            } else if (step === currentStep) {
                $(this).addClass('active');
            }
        });
    }
    
    // Next button
    $('.pfdef-wizard-next').on('click', function() {
        if (currentStep === 3) {
            // Run scan animation
            runScan();
        } else {
            if (currentStep < totalSteps) {
                currentStep++;
                showStep(currentStep);
                updateProgress();
            }
        }
    });
    
    // Previous button
    $('.pfdef-wizard-prev').on('click', function() {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
            updateProgress();
        }
    });
    
    // Show step
    function showStep(step) {
        $('.pfdef-wizard-step').removeClass('active');
        $('.pfdef-wizard-step.step-' + step).addClass('active');
    }
    
    // Run scan simulation
    function runScan() {
        let phase = 0;
        const phases = $('.pfdef-scan-phase');
        
        function nextPhase() {
            if (phase > 0) {
                $(phases[phase - 1]).removeClass('active').addClass('complete');
                $(phases[phase - 1]).find('.pfdef-phase-icon').text('✓');
            }
            
            if (phase < phases.length) {
                $(phases[phase]).addClass('active');
                phase++;
                setTimeout(nextPhase, 2000);
            } else {
                // Scan complete
                $('#scanStatus').fadeOut(300, function() {
                    $('#scanResults').fadeIn(300);
                    $('#scanActions').fadeIn(300);
                    
                    // Animate numbers
                    animateNumber($('#filesScanned'), 1247);
                    animateNumber($('#threatsFound'), 0);
                    animateNumber($('#securityScore'), 100);
                });
            }
        }
        
        nextPhase();
    }
    
    // Animate number
    function animateNumber($elem, target) {
        $({ counter: 0 }).animate({ counter: target }, {
            duration: 1500,
            easing: 'swing',
            step: function() {
                $elem.text(Math.ceil(this.counter));
            }
        });
    }
    
    // Finish wizard
    $('.pfdef-finish-wizard').on('click', function() {
        // Mark wizard as completed
        $.post(ajaxurl, {
            action: 'pfdef_complete_wizard',
            sensitivity: $('input[name="sensitivity"]:checked').val(),
            alert_email: $('#alertEmail').val(),
            nonce: '<?php echo wp_create_nonce('pfdef_wizard'); ?>'
        }, function() {
            window.location.href = '<?php echo admin_url('admin.php?page=promptfluid-reflex'); ?>';
        });
    });
    
    // Initialize
    updateProgress();
});
</script>

<?php
// AJAX handler for completing wizard
add_action('wp_ajax_pfdef_complete_wizard', function() {
    check_ajax_referer('pfdef_wizard', 'nonce');
    
    if (!current_user_can('manage_options')) {
        wp_send_json_error('Permission denied');
    }
    
    // Save settings
    $sensitivity = sanitize_text_field($_POST['sensitivity'] ?? 'medium');
    $alert_email = sanitize_email($_POST['alert_email'] ?? get_option('admin_email'));
    
    update_option('promptfluid_defense_settings', array(
        'enabled' => true,
        'sensitivity' => $sensitivity,
        'whitelist_ips' => '',
        'anonymize_ips' => true,
        'log_retention_days' => 30
    ));
    
    update_option('pfdef_alert_email', $alert_email);
    update_option('pfdef_wizard_completed', true);
    
    wp_send_json_success();
});
?>
