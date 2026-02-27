<?php
/**
 * Bot detection engine.
 *
 * @package PromptFluid_Defense
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Defense_Bot_Detector {
    
    /**
     * Known bot signatures.
     */
    private $bot_signatures = array(
        'bot', 'crawl', 'spider', 'scrape', 'curl', 'wget', 'python',
        'java', 'perl', 'ruby', 'scrapy', 'httpclient', 'okhttp',
        'axios', 'fetch', 'phantom', 'headless', 'selenium', 'puppeteer'
    );
    
    /**
     * Check if the current request is from a bot.
     *
     * @return array Detection result with 'is_bot' and 'confidence' score
     */
    public function detect() {
        $confidence = 0;
        $threat_type = 'unknown';
        $details = array();
        
        // Check User-Agent
        $ua_result = $this->check_user_agent();
        $confidence += $ua_result['confidence'];
        if ($ua_result['is_bot']) {
            $threat_type = 'user_agent_signature';
            $details[] = $ua_result['detail'];
        }
        
        // Check request velocity
        $velocity_result = $this->check_request_velocity();
        $confidence += $velocity_result['confidence'];
        if ($velocity_result['is_suspicious']) {
            $threat_type = $velocity_result['type'];
            $details[] = $velocity_result['detail'];
        }
        
        // Check for headless browser patterns
        $headless_result = $this->check_headless_patterns();
        $confidence += $headless_result['confidence'];
        if ($headless_result['is_headless']) {
            $threat_type = 'headless_browser';
            $details[] = $headless_result['detail'];
        }
        
        // Determine if bot based on confidence threshold
        $settings = get_option('promptfluid_defense_settings');
        $sensitivity = isset($settings['sensitivity']) ? $settings['sensitivity'] : 'medium';
        
        $threshold = 50; // medium
        if ($sensitivity === 'low') {
            $threshold = 70;
        } elseif ($sensitivity === 'high') {
            $threshold = 30;
        }
        
        $is_bot = $confidence >= $threshold;
        
        return array(
            'is_bot' => $is_bot,
            'confidence' => $confidence,
            'threat_type' => $threat_type,
            'details' => implode('; ', $details)
        );
    }
    
    /**
     * Check User-Agent for bot signatures.
     */
    private function check_user_agent() {
        $user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
        $user_agent_lower = strtolower($user_agent);
        
        // Empty User-Agent is suspicious
        if (empty($user_agent)) {
            return array(
                'is_bot' => true,
                'confidence' => 80,
                'detail' => 'Empty User-Agent'
            );
        }
        
        // Check for bot signatures
        foreach ($this->bot_signatures as $signature) {
            if (strpos($user_agent_lower, $signature) !== false) {
                return array(
                    'is_bot' => true,
                    'confidence' => 90,
                    'detail' => 'Bot signature detected: ' . $signature
                );
            }
        }
        
        // Check for suspicious patterns
        if (strlen($user_agent) < 20 || strlen($user_agent) > 500) {
            return array(
                'is_bot' => true,
                'confidence' => 50,
                'detail' => 'Unusual User-Agent length'
            );
        }
        
        return array(
            'is_bot' => false,
            'confidence' => 0,
            'detail' => ''
        );
    }
    
    /**
     * Check request velocity for the current IP.
     */
    private function check_request_velocity() {
        $ip = $this->get_client_ip();
        $transient_key = 'pf_defense_velocity_' . md5($ip);
        
        $requests = get_transient($transient_key);
        
        if ($requests === false) {
            $requests = array('count' => 1, 'first_request' => time());
        } else {
            $requests['count']++;
        }
        
        $time_window = 60; // 1 minute
        $elapsed = time() - $requests['first_request'];
        
        // Calculate requests per minute
        $rpm = $elapsed > 0 ? ($requests['count'] / $elapsed) * 60 : $requests['count'];
        
        // Save updated count (expires in 1 minute)
        set_transient($transient_key, $requests, 60);
        
        // Flag if too many requests
        if ($rpm > 30) {
            return array(
                'is_suspicious' => true,
                'confidence' => 70,
                'type' => 'high_velocity',
                'detail' => sprintf('High request velocity: %.1f RPM', $rpm)
            );
        } elseif ($rpm > 15) {
            return array(
                'is_suspicious' => true,
                'confidence' => 40,
                'type' => 'elevated_velocity',
                'detail' => sprintf('Elevated request velocity: %.1f RPM', $rpm)
            );
        }
        
        return array(
            'is_suspicious' => false,
            'confidence' => 0,
            'type' => 'normal_velocity',
            'detail' => ''
        );
    }
    
    /**
     * Check for headless browser patterns.
     */
    private function check_headless_patterns() {
        $user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
        
        // Check for common headless browser indicators
        $headless_patterns = array('HeadlessChrome', 'PhantomJS', 'SlimerJS');
        
        foreach ($headless_patterns as $pattern) {
            if (stripos($user_agent, $pattern) !== false) {
                return array(
                    'is_headless' => true,
                    'confidence' => 85,
                    'detail' => 'Headless browser detected: ' . $pattern
                );
            }
        }
        
        // Check for missing common headers
        $required_headers = array('HTTP_ACCEPT', 'HTTP_ACCEPT_LANGUAGE');
        $missing_headers = 0;
        
        foreach ($required_headers as $header) {
            if (!isset($_SERVER[$header]) || empty($_SERVER[$header])) {
                $missing_headers++;
            }
        }
        
        if ($missing_headers >= 2) {
            return array(
                'is_headless' => true,
                'confidence' => 60,
                'detail' => 'Missing common browser headers'
            );
        }
        
        return array(
            'is_headless' => false,
            'confidence' => 0,
            'detail' => ''
        );
    }
    
    /**
     * Get the client's IP address.
     */
    private function get_client_ip() {
        $ip_keys = array(
            'HTTP_CF_CONNECTING_IP', // Cloudflare
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'REMOTE_ADDR'
        );
        
        foreach ($ip_keys as $key) {
            if (isset($_SERVER[$key]) && filter_var($_SERVER[$key], FILTER_VALIDATE_IP)) {
                return $_SERVER[$key];
            }
        }
        
        return '0.0.0.0';
    }
    
    /**
     * Check if IP is whitelisted.
     */
    public function is_whitelisted($ip) {
        $settings = get_option('promptfluid_defense_settings');
        $whitelist = isset($settings['whitelist_ips']) ? $settings['whitelist_ips'] : '';
        
        if (empty($whitelist)) {
            return false;
        }
        
        $whitelist_ips = array_map('trim', explode("\n", $whitelist));
        
        return in_array($ip, $whitelist_ips);
    }
}
