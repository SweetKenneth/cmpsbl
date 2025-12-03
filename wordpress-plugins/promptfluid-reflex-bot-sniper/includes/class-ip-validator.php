<?php
/**
 * Secure IP Address Validator
 * 
 * Validates proxy headers against known CDN IP ranges to prevent spoofing.
 *
 * @package PromptFluid_Defense
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Defense_IP_Validator {
    
    /**
     * Known Cloudflare IPv4 ranges
     * @see https://www.cloudflare.com/ips-v4
     */
    private static $cloudflare_ipv4 = array(
        '173.245.48.0/20',
        '103.21.244.0/22',
        '103.22.200.0/22',
        '103.31.4.0/22',
        '141.101.64.0/18',
        '108.162.192.0/18',
        '190.93.240.0/20',
        '188.114.96.0/20',
        '197.234.240.0/22',
        '198.41.128.0/17',
        '162.158.0.0/15',
        '104.16.0.0/13',
        '104.24.0.0/14',
        '172.64.0.0/13',
        '131.0.72.0/22'
    );
    
    /**
     * Known Cloudflare IPv6 ranges
     * @see https://www.cloudflare.com/ips-v6
     */
    private static $cloudflare_ipv6 = array(
        '2400:cb00::/32',
        '2606:4700::/32',
        '2803:f800::/32',
        '2405:b500::/32',
        '2405:8100::/32',
        '2a06:98c0::/29',
        '2c0f:f248::/32'
    );
    
    /**
     * Cache for CDN validation results
     */
    private static $cdn_cache = array();
    
    /**
     * Get the true client IP address securely
     * 
     * Only trusts proxy headers when the request comes from a validated CDN.
     *
     * @return string The client IP address
     */
    public static function get_client_ip() {
        $remote_addr = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        
        // Validate IP format
        if (!filter_var($remote_addr, FILTER_VALIDATE_IP)) {
            return '0.0.0.0';
        }
        
        // Check if request is from Cloudflare
        if (self::is_cloudflare_ip($remote_addr)) {
            // Safe to trust CF-Connecting-IP header
            if (isset($_SERVER['HTTP_CF_CONNECTING_IP'])) {
                $cf_ip = self::extract_first_ip($_SERVER['HTTP_CF_CONNECTING_IP']);
                if (filter_var($cf_ip, FILTER_VALIDATE_IP)) {
                    return $cf_ip;
                }
            }
        }
        
        // Check for trusted reverse proxy (configured by admin)
        $trusted_proxies = self::get_trusted_proxies();
        if (!empty($trusted_proxies) && self::is_trusted_proxy($remote_addr, $trusted_proxies)) {
            // Trust X-Forwarded-For only from known proxies
            if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
                $forwarded_ip = self::extract_first_ip($_SERVER['HTTP_X_FORWARDED_FOR']);
                if (filter_var($forwarded_ip, FILTER_VALIDATE_IP)) {
                    return $forwarded_ip;
                }
            }
            
            if (isset($_SERVER['HTTP_X_REAL_IP'])) {
                $real_ip = trim($_SERVER['HTTP_X_REAL_IP']);
                if (filter_var($real_ip, FILTER_VALIDATE_IP)) {
                    return $real_ip;
                }
            }
        }
        
        // Default: only trust REMOTE_ADDR
        return $remote_addr;
    }
    
    /**
     * Extract the first IP from a potentially comma-separated list
     *
     * @param string $header The header value
     * @return string The first IP address
     */
    private static function extract_first_ip($header) {
        $ips = explode(',', $header);
        return trim($ips[0]);
    }
    
    /**
     * Check if an IP is within Cloudflare's IP ranges
     *
     * @param string $ip The IP to check
     * @return bool True if the IP is from Cloudflare
     */
    public static function is_cloudflare_ip($ip) {
        // Check cache first
        if (isset(self::$cdn_cache[$ip])) {
            return self::$cdn_cache[$ip];
        }
        
        $result = false;
        
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            foreach (self::$cloudflare_ipv4 as $range) {
                if (self::ip_in_range($ip, $range)) {
                    $result = true;
                    break;
                }
            }
        } elseif (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
            foreach (self::$cloudflare_ipv6 as $range) {
                if (self::ipv6_in_range($ip, $range)) {
                    $result = true;
                    break;
                }
            }
        }
        
        // Cache result
        self::$cdn_cache[$ip] = $result;
        
        return $result;
    }
    
    /**
     * Check if IPv4 is within a CIDR range
     *
     * @param string $ip The IP address
     * @param string $range The CIDR range
     * @return bool
     */
    private static function ip_in_range($ip, $range) {
        list($subnet, $bits) = explode('/', $range);
        
        $ip_long = ip2long($ip);
        $subnet_long = ip2long($subnet);
        $mask = -1 << (32 - $bits);
        
        $subnet_long &= $mask;
        
        return ($ip_long & $mask) === $subnet_long;
    }
    
    /**
     * Check if IPv6 is within a CIDR range
     *
     * @param string $ip The IPv6 address
     * @param string $range The CIDR range
     * @return bool
     */
    private static function ipv6_in_range($ip, $range) {
        list($subnet, $bits) = explode('/', $range);
        
        $ip_bin = inet_pton($ip);
        $subnet_bin = inet_pton($subnet);
        
        if ($ip_bin === false || $subnet_bin === false) {
            return false;
        }
        
        $mask = str_repeat('f', intval($bits / 4));
        $remainder = $bits % 4;
        if ($remainder) {
            $mask .= dechex(0xf << (4 - $remainder));
        }
        $mask = str_pad($mask, 32, '0');
        $mask = pack('H*', $mask);
        
        return ($ip_bin & $mask) === ($subnet_bin & $mask);
    }
    
    /**
     * Get list of admin-configured trusted proxy IPs
     *
     * @return array List of trusted proxy IPs/ranges
     */
    private static function get_trusted_proxies() {
        $settings = get_option('promptfluid_defense_settings', array());
        $proxies_raw = isset($settings['trusted_proxies']) ? $settings['trusted_proxies'] : '';
        
        if (empty($proxies_raw)) {
            return array();
        }
        
        return array_filter(array_map('trim', explode("\n", $proxies_raw)));
    }
    
    /**
     * Check if IP is in trusted proxy list
     *
     * @param string $ip The IP to check
     * @param array $trusted_proxies List of trusted IPs/ranges
     * @return bool
     */
    private static function is_trusted_proxy($ip, $trusted_proxies) {
        foreach ($trusted_proxies as $proxy) {
            if (strpos($proxy, '/') !== false) {
                // CIDR range
                if (self::ip_in_range($ip, $proxy)) {
                    return true;
                }
            } else {
                // Exact match
                if ($ip === $proxy) {
                    return true;
                }
            }
        }
        
        return false;
    }
}
