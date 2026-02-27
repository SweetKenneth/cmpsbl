<?php
/**
 * Login Guard
 * 
 * Protects against brute force login attacks
 *
 * @package PromptFluid_Defense
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Defense_Login_Guard {
    
    private $table_name;
    private $max_attempts = 5;
    private $lockout_duration = 900; // 15 minutes
    
    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'pfdef_login_attempts';
        
        add_filter('authenticate', array($this, 'check_login_attempt'), 30, 3);
        add_action('wp_login_failed', array($this, 'log_failed_login'));
        add_action('wp_login', array($this, 'log_successful_login'), 10, 2);
    }
    
    /**
     * Create login attempts table
     */
    public static function create_table() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'pfdef_login_attempts';
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE IF NOT EXISTS {$table_name} (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            ip_address varchar(45) NOT NULL,
            username varchar(200) NOT NULL,
            attempt_result varchar(20) NOT NULL,
            user_agent text,
            country_code varchar(2),
            attempted_at datetime DEFAULT CURRENT_TIMESTAMP,
            lockout_until datetime,
            PRIMARY KEY (id),
            KEY ip_address (ip_address),
            KEY username (username),
            KEY attempted_at (attempted_at),
            KEY lockout_until (lockout_until)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * Check if IP is locked out
     */
    private function is_locked_out($ip) {
        global $wpdb;
        
        $lockout = $wpdb->get_var($wpdb->prepare("
            SELECT lockout_until FROM {$this->table_name}
            WHERE ip_address = %s
            AND lockout_until > NOW()
            ORDER BY lockout_until DESC
            LIMIT 1
        ", $ip));
        
        return $lockout !== null;
    }
    
    /**
     * Get failed attempt count
     */
    private function get_failed_attempts($ip) {
        global $wpdb;
        
        $count = $wpdb->get_var($wpdb->prepare("
            SELECT COUNT(*) FROM {$this->table_name}
            WHERE ip_address = %s
            AND attempt_result = 'failed'
            AND attempted_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)
        ", $ip));
        
        return intval($count);
    }
    
    /**
     * Check login attempt before authentication
     */
    public function check_login_attempt($user, $username, $password) {
        $ip = $this->get_client_ip();
        
        // Check if locked out
        if ($this->is_locked_out($ip)) {
            $lockout_time = $this->get_lockout_time($ip);
            
            return new WP_Error(
                'pfdef_locked_out',
                sprintf(
                    __('Too many failed login attempts. Please try again in %s minutes.', 'promptfluid-defense'),
                    ceil($lockout_time / 60)
                )
            );
        }
        
        // Check failed attempts
        $failed_attempts = $this->get_failed_attempts($ip);
        if ($failed_attempts >= $this->max_attempts) {
            $this->apply_lockout($ip);
            
            // Log to Brain
            $this->log_to_brain('brute_force_detected', $ip);
            
            return new WP_Error(
                'pfdef_max_attempts',
                __('Maximum login attempts exceeded. Account temporarily locked.', 'promptfluid-defense')
            );
        }
        
        return $user;
    }
    
    /**
     * Log failed login attempt
     */
    public function log_failed_login($username) {
        global $wpdb;
        
        $ip = $this->get_client_ip();
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        
        $wpdb->insert($this->table_name, array(
            'ip_address' => $ip,
            'username' => sanitize_user($username),
            'attempt_result' => 'failed',
            'user_agent' => substr($user_agent, 0, 500)
        ));
        
        // Check if this triggers lockout
        $failed_attempts = $this->get_failed_attempts($ip);
        if ($failed_attempts >= $this->max_attempts - 1) {
            $this->log_to_brain('approaching_lockout', $ip);
        }
    }
    
    /**
     * Log successful login
     */
    public function log_successful_login($username, $user) {
        global $wpdb;
        
        $ip = $this->get_client_ip();
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        
        $wpdb->insert($this->table_name, array(
            'ip_address' => $ip,
            'username' => $username,
            'attempt_result' => 'success',
            'user_agent' => substr($user_agent, 0, 500)
        ));
        
        // Clear previous failed attempts
        $wpdb->query($wpdb->prepare("
            DELETE FROM {$this->table_name}
            WHERE ip_address = %s
            AND attempt_result = 'failed'
            AND attempted_at < DATE_SUB(NOW(), INTERVAL 1 HOUR)
        ", $ip));
    }
    
    /**
     * Apply lockout to IP
     */
    private function apply_lockout($ip) {
        global $wpdb;
        
        $lockout_until = date('Y-m-d H:i:s', time() + $this->lockout_duration);
        
        $wpdb->insert($this->table_name, array(
            'ip_address' => $ip,
            'username' => 'system',
            'attempt_result' => 'locked',
            'lockout_until' => $lockout_until
        ));
        
        // Send email alert to admin
        $this->send_lockout_alert($ip);
    }
    
    /**
     * Get remaining lockout time in seconds
     */
    private function get_lockout_time($ip) {
        global $wpdb;
        
        $lockout = $wpdb->get_var($wpdb->prepare("
            SELECT TIMESTAMPDIFF(SECOND, NOW(), lockout_until)
            FROM {$this->table_name}
            WHERE ip_address = %s
            AND lockout_until > NOW()
            ORDER BY lockout_until DESC
            LIMIT 1
        ", $ip));
        
        return max(0, intval($lockout));
    }
    
    /**
     * Send lockout alert email
     */
    private function send_lockout_alert($ip) {
        $admin_email = get_option('admin_email');
        $site_name = get_bloginfo('name');
        
        $subject = sprintf('[%s] Login Lockout Alert', $site_name);
        $message = sprintf(
            "PromptFluid Defense has locked out IP address %s due to multiple failed login attempts.\n\nTime: %s\nFailed Attempts: %d\nLockout Duration: %d minutes",
            $ip,
            current_time('mysql'),
            $this->max_attempts,
            $this->lockout_duration / 60
        );
        
        wp_mail($admin_email, $subject, $message);
    }
    
    /**
     * Get client IP securely
     * Uses the IP Validator to prevent header spoofing.
     */
    private function get_client_ip() {
        if (class_exists('PromptFluid_Defense_IP_Validator')) {
            return \PromptFluid_Defense_IP_Validator::get_client_ip();
        }
        
        // Fallback: only trust REMOTE_ADDR
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '0.0.0.0';
    }
    
    /**
     * Log to Brain
     */
    private function log_to_brain($event_type, $ip) {
        do_action('pfdef_security_event', array(
            'type' => $event_type,
            'module' => 'login_guard',
            'severity' => 'high',
            'details' => array(
                'ip' => $ip,
                'timestamp' => current_time('mysql')
            )
        ));
    }
    
    /**
     * Get login statistics
     */
    public function get_stats() {
        global $wpdb;
        
        $total_attempts = $wpdb->get_var("SELECT COUNT(*) FROM {$this->table_name}");
        $failed_attempts = $wpdb->get_var("SELECT COUNT(*) FROM {$this->table_name} WHERE attempt_result = 'failed'");
        $successful_attempts = $wpdb->get_var("SELECT COUNT(*) FROM {$this->table_name} WHERE attempt_result = 'success'");
        $current_lockouts = $wpdb->get_var("SELECT COUNT(DISTINCT ip_address) FROM {$this->table_name} WHERE lockout_until > NOW()");
        
        $attempts_24h = $wpdb->get_var("
            SELECT COUNT(*) FROM {$this->table_name}
            WHERE attempted_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ");
        
        $failed_24h = $wpdb->get_var("
            SELECT COUNT(*) FROM {$this->table_name}
            WHERE attempt_result = 'failed'
            AND attempted_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ");
        
        $top_ips = $wpdb->get_results("
            SELECT ip_address, COUNT(*) as attempt_count
            FROM {$this->table_name}
            WHERE attempt_result = 'failed'
            AND attempted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY ip_address
            ORDER BY attempt_count DESC
            LIMIT 10
        ", ARRAY_A);
        
        return array(
            'total_attempts' => intval($total_attempts),
            'failed_attempts' => intval($failed_attempts),
            'successful_attempts' => intval($successful_attempts),
            'current_lockouts' => intval($current_lockouts),
            'attempts_24h' => intval($attempts_24h),
            'failed_24h' => intval($failed_24h),
            'top_attacking_ips' => $top_ips,
            'success_rate' => $total_attempts > 0 ? round(($successful_attempts / $total_attempts) * 100, 2) : 100
        );
    }
}
