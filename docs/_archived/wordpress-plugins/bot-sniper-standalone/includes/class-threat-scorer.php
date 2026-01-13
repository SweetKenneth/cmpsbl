<?php
/**
 * Comprehensive Threat Scoring Engine
 * 
 * Aggregates signals from multiple detection modules to calculate overall threat score
 *
 * @package BotSniper
 */

namespace BotSniper;

if (!defined('ABSPATH')) exit;

class ThreatScorer {
    
    private $bot_detector;
    private $behavioral_analyzer;
    private $logger;
    private $fingerprinting;
    private $smart_learning;
    
    public function __construct() {
        $this->bot_detector = new BotDetector();
        $this->behavioral_analyzer = new BehavioralAnalyzer();
        $this->logger = new Logger();
        $this->fingerprinting = new Fingerprinting();
        $this->smart_learning = new SmartLearning();
    }
    
    /**
     * Calculate comprehensive threat score
     */
    public function calculate_threat_score() {
        $ip = $this->get_client_ip();
        
        // Check whitelist first
        if ($this->is_whitelisted($ip)) {
            return array(
                'threat_score' => 0,
                'action' => 'allow',
                'reason' => 'IP is whitelisted',
                'details' => array('whitelisted' => true)
            );
        }
        
        $threat_score = 0;
        $indicators = array();
        
        // Device fingerprinting
        $fingerprint = $this->fingerprinting->generate_fingerprint();
        $fp_analysis = $this->fingerprinting->analyze_fingerprint($fingerprint);
        
        if ($fp_analysis['is_suspicious']) {
            $threat_score += $fp_analysis['score'];
            $indicators[] = array(
                'type' => 'fingerprint_anomaly',
                'score' => $fp_analysis['score'],
                'details' => implode('; ', $fp_analysis['indicators'])
            );
        }
        
        // Check fingerprint reputation
        $fp_reputation = $this->fingerprinting->get_fingerprint_reputation($fingerprint['hash']);
        if ($fp_reputation['known'] && $fp_reputation['reputation'] === 'malicious') {
            $threat_score += 40;
            $indicators[] = array(
                'type' => 'known_malicious_fingerprint',
                'score' => 40,
                'details' => sprintf('Known malicious device (avg score: %.1f)', $fp_reputation['avg_threat_score'])
            );
        }
        
        // Bot detection signals
        $bot_result = $this->bot_detector->detect();
        if ($bot_result['is_bot']) {
            $threat_score += $bot_result['confidence'];
            $indicators[] = array(
                'type' => 'bot_signature',
                'score' => $bot_result['confidence'],
                'details' => $bot_result['details']
            );
        }
        
        // Behavioral analysis
        $behavioral_data = $this->collect_behavioral_data();
        $behavior_result = $this->behavioral_analyzer->analyze($behavioral_data);
        
        if (!$behavior_result['is_human']) {
            $behavior_score = 100 - $behavior_result['risk_score'];
            $threat_score += $behavior_score;
            $indicators[] = array(
                'type' => 'behavioral_anomaly',
                'score' => $behavior_score,
                'details' => implode(', ', $behavior_result['anomalies'])
            );
        }
        
        // IP reputation check
        $ip_reputation = $this->check_ip_reputation($ip);
        if ($ip_reputation['is_threat']) {
            $threat_score += $ip_reputation['score'];
            $indicators[] = array(
                'type' => 'ip_reputation',
                'score' => $ip_reputation['score'],
                'details' => $ip_reputation['reason']
            );
        }
        
        // Check learned patterns
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $pattern_check = $this->smart_learning->is_known_pattern('user_agent', array('ua' => $user_agent));
        
        if ($pattern_check['is_known'] && $pattern_check['threat_level'] === 'high') {
            $threat_score += 30;
            $indicators[] = array(
                'type' => 'learned_threat_pattern',
                'score' => 30,
                'details' => sprintf('Known threat pattern (seen %d times)', $pattern_check['occurrences'])
            );
        }
        
        // Normalize threat score (0-100)
        $threat_score = min(100, $threat_score);
        
        // Get adaptive thresholds if learning is complete
        $adaptive_thresholds = $this->smart_learning->get_adaptive_thresholds();
        
        // Determine action using adaptive thresholds
        $action = $this->determine_action($threat_score, $adaptive_thresholds);
        $reason = $this->get_action_reason($threat_score, $indicators);
        
        // Record pattern for learning
        $this->smart_learning->record_pattern(array(
            'session_id' => session_id() ?: uniqid('bs_', true),
            'ip' => $ip,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'fingerprint' => $fingerprint,
            'threat_score' => $threat_score,
            'action' => $action,
            'confidence' => 0.8
        ));
        
        // Track fingerprint
        $this->fingerprinting->track_fingerprint($fingerprint, $threat_score);
        
        // Record behavioral pattern if threat detected
        if ($threat_score >= 70) {
            $this->smart_learning->record_behavioral_pattern(
                'user_agent',
                array('ua' => $_SERVER['HTTP_USER_AGENT'] ?? ''),
                'high'
            );
        }
        
        // Log significant threats
        if ($threat_score >= 40) {
            $this->logger->log(array(
                'threat_type' => 'comprehensive_analysis',
                'threat_score' => $threat_score,
                'action' => $action,
                'blocked' => ($action === 'block') ? 1 : 0,
                'details' => json_encode(array(
                    'reason' => $reason,
                    'indicators' => $indicators,
                    'fingerprint_hash' => $fingerprint['hash']
                ))
            ));
        }
        
        return array(
            'threat_score' => $threat_score,
            'action' => $action,
            'reason' => $reason,
            'details' => $indicators,
            'fingerprint' => $fingerprint['hash']
        );
    }
    
    /**
     * Determine action based on threat score with adaptive thresholds
     */
    private function determine_action($threat_score, $adaptive_thresholds = null) {
        $settings = get_option('bot_sniper_settings', array(
            'detection_enabled' => true,
            'auto_block' => false,
            'threat_threshold' => 70,
            'log_retention_days' => 30
        ));
        
        // Use adaptive thresholds if available, otherwise use settings
        if ($adaptive_thresholds && isset($adaptive_thresholds['block_threshold'])) {
            $block_threshold = $adaptive_thresholds['block_threshold'];
            $challenge_threshold = $adaptive_thresholds['challenge_threshold'];
        } else {
            $sensitivity = isset($settings['sensitivity']) ? $settings['sensitivity'] : 'medium';
            
            // Define thresholds based on sensitivity
            $block_threshold = 70;
            $challenge_threshold = 50;
            
            if ($sensitivity === 'low') {
                $block_threshold = 85;
                $challenge_threshold = 65;
            } elseif ($sensitivity === 'high') {
                $block_threshold = 55;
                $challenge_threshold = 35;
            }
        }
        
        if ($threat_score >= $block_threshold) {
            return 'block';
        } elseif ($threat_score >= $challenge_threshold) {
            return 'challenge';
        }
        
        return 'allow';
    }
    
    /**
     * Get human-readable reason for action
     */
    private function get_action_reason($threat_score, $indicators) {
        if (empty($indicators)) {
            return 'No threats detected';
        }
        
        $primary_indicator = $indicators[0];
        $type_labels = array(
            'bot_signature' => 'Bot signature detected',
            'behavioral_anomaly' => 'Suspicious behavioral pattern',
            'ip_reputation' => 'Known threat IP address',
            'high_velocity' => 'Excessive request rate',
            'fingerprint_anomaly' => 'Suspicious device fingerprint',
            'known_malicious_fingerprint' => 'Known malicious device',
            'learned_threat_pattern' => 'Known threat pattern'
        );
        
        $label = isset($type_labels[$primary_indicator['type']]) 
            ? $type_labels[$primary_indicator['type']] 
            : 'Security threat detected';
        
        return $label . ' (score: ' . $threat_score . ')';
    }
    
    /**
     * Check IP reputation
     */
    private function check_ip_reputation($ip) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'bot_sniper_logs';
        
        // Check recent history for this IP
        $recent_threats = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$table_name} 
            WHERE ip_address = %s 
            AND detected_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
            AND threat_score >= 60",
            $ip
        ));
        
        if ($recent_threats > 3) {
            return array(
                'is_threat' => true,
                'score' => 40,
                'reason' => 'Multiple recent threat detections'
            );
        }
        
        return array(
            'is_threat' => false,
            'score' => 0,
            'reason' => 'Clean IP history'
        );
    }
    
    /**
     * Collect behavioral data
     */
    private function collect_behavioral_data() {
        // Check if we have stored behavioral data from client-side tracking
        $session_id = $_COOKIE['bot_sniper_session'] ?? null;
        
        if ($session_id) {
            require_once BOT_SNIPER_PLUGIN_DIR . 'includes/class-behavior-tracker.php';
            $tracker = new \BotSniper\BehaviorTracker();
            $stored_analysis = $tracker->get_session_analysis($session_id);
            
            if ($stored_analysis) {
                // Use the stored behavioral analysis
                return $stored_analysis;
            }
        }
        
        // Fallback to basic request patterns if no stored data
        return array(
            'time_on_page' => isset($_SERVER['REQUEST_TIME_FLOAT']) 
                ? (microtime(true) - $_SERVER['REQUEST_TIME_FLOAT']) * 1000 
                : 0
        );
    }
    
    /**
     * Check if IP is whitelisted
     */
    private function is_whitelisted($ip) {
        $settings = get_option('bot_sniper_settings');
        $whitelist = isset($settings['whitelist_ips']) ? $settings['whitelist_ips'] : '';
        
        if (empty($whitelist)) {
            return false;
        }
        
        $whitelist_ips = array_map('trim', explode("\n", $whitelist));
        return in_array($ip, $whitelist_ips);
    }
    
    /**
     * Get client IP address securely
     * Only trusts proxy headers when request comes from validated CDN.
     */
    private function get_client_ip() {
        $remote_addr = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        
        if (!filter_var($remote_addr, FILTER_VALIDATE_IP)) {
            return '0.0.0.0';
        }
        
        // Only trust CF-Connecting-IP if request is from Cloudflare
        if (isset($_SERVER['HTTP_CF_CONNECTING_IP'])) {
            // Verify request comes from Cloudflare IP range
            if ($this->is_cloudflare_ip($remote_addr)) {
                $cf_ip = trim(explode(',', $_SERVER['HTTP_CF_CONNECTING_IP'])[0]);
                if (filter_var($cf_ip, FILTER_VALIDATE_IP)) {
                    return $cf_ip;
                }
            }
        }
        
        // Default: only trust REMOTE_ADDR to prevent spoofing
        return $remote_addr;
    }
    
    /**
     * Check if IP is from Cloudflare
     */
    private function is_cloudflare_ip($ip) {
        $cf_ranges = array(
            '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22',
            '103.31.4.0/22', '141.101.64.0/18', '108.162.192.0/18',
            '190.93.240.0/20', '188.114.96.0/20', '197.234.240.0/22',
            '198.41.128.0/17', '162.158.0.0/15', '104.16.0.0/13',
            '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22'
        );
        
        foreach ($cf_ranges as $range) {
            if ($this->ip_in_cidr($ip, $range)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Check if IP is in CIDR range
     */
    private function ip_in_cidr($ip, $cidr) {
        list($subnet, $bits) = explode('/', $cidr);
        $ip_long = ip2long($ip);
        $subnet_long = ip2long($subnet);
        $mask = -1 << (32 - $bits);
        return ($ip_long & $mask) === ($subnet_long & $mask);
    }
}
