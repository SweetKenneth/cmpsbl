<?php
/**
 * Web Application Firewall
 * 
 * Filters malicious requests before they reach WordPress
 *
 * @package PromptFluid_Defense
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Defense_Firewall {
    
    private $table_name;
    private $blocked_patterns = array();
    
    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'pfdef_firewall_rules';
        $this->load_rules();
    }
    
    /**
     * Create firewall rules table
     */
    public static function create_table() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'pfdef_firewall_rules';
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE IF NOT EXISTS {$table_name} (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            rule_name varchar(100) NOT NULL,
            rule_type varchar(50) NOT NULL,
            pattern text NOT NULL,
            action varchar(20) DEFAULT 'block',
            severity varchar(20) DEFAULT 'medium',
            is_active tinyint(1) DEFAULT 1,
            hit_count int DEFAULT 0,
            last_triggered datetime,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY rule_type (rule_type),
            KEY is_active (is_active)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
        
        // Insert default rules
        self::insert_default_rules();
    }
    
    /**
     * Insert default firewall rules
     */
    private static function insert_default_rules() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'pfdef_firewall_rules';
        
        $default_rules = array(
            array(
                'rule_name' => 'SQL Injection - UNION',
                'rule_type' => 'sql_injection',
                'pattern' => '/union.*select/i',
                'action' => 'block',
                'severity' => 'critical'
            ),
            array(
                'rule_name' => 'SQL Injection - DROP TABLE',
                'rule_type' => 'sql_injection',
                'pattern' => '/drop.*table/i',
                'action' => 'block',
                'severity' => 'critical'
            ),
            array(
                'rule_name' => 'XSS - Script Tags',
                'rule_type' => 'xss',
                'pattern' => '/<script[^>]*>.*?<\/script>/i',
                'action' => 'block',
                'severity' => 'high'
            ),
            array(
                'rule_name' => 'XSS - Event Handlers',
                'rule_type' => 'xss',
                'pattern' => '/on(load|error|click|mouseover)=/i',
                'action' => 'block',
                'severity' => 'high'
            ),
            array(
                'rule_name' => 'Path Traversal',
                'rule_type' => 'path_traversal',
                'pattern' => '/\.\.\/|\.\.\\\/i',
                'action' => 'block',
                'severity' => 'high'
            ),
            array(
                'rule_name' => 'RCE - eval()',
                'rule_type' => 'rce',
                'pattern' => '/eval\s*\(/i',
                'action' => 'block',
                'severity' => 'critical'
            ),
            array(
                'rule_name' => 'RCE - shell_exec',
                'rule_type' => 'rce',
                'pattern' => '/shell_exec|passthru|system|exec/i',
                'action' => 'block',
                'severity' => 'critical'
            ),
            array(
                'rule_name' => 'LFI - File Inclusion',
                'rule_type' => 'lfi',
                'pattern' => '/\/(etc\/passwd|proc\/self)/i',
                'action' => 'block',
                'severity' => 'critical'
            )
        );
        
        foreach ($default_rules as $rule) {
            $exists = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM {$table_name} WHERE rule_name = %s",
                $rule['rule_name']
            ));
            
            if (!$exists) {
                $wpdb->insert($table_name, $rule);
            }
        }
    }
    
    /**
     * Load firewall rules from database
     */
    private function load_rules() {
        global $wpdb;
        
        $rules = $wpdb->get_results("
            SELECT * FROM {$this->table_name}
            WHERE is_active = 1
            ORDER BY severity DESC
        ");
        
        foreach ($rules as $rule) {
            $this->blocked_patterns[] = array(
                'id' => $rule->id,
                'name' => $rule->rule_name,
                'pattern' => $rule->pattern,
                'type' => $rule->rule_type,
                'action' => $rule->action,
                'severity' => $rule->severity
            );
        }
    }
    
    /**
     * Check request against firewall rules
     */
    public function check_request() {
        $request_data = $this->get_request_data();
        $threats_detected = array();
        
        foreach ($request_data as $key => $value) {
            foreach ($this->blocked_patterns as $pattern) {
                if (preg_match($pattern['pattern'], $value)) {
                    $threats_detected[] = array(
                        'rule_id' => $pattern['id'],
                        'rule_name' => $pattern['name'],
                        'rule_type' => $pattern['type'],
                        'severity' => $pattern['severity'],
                        'matched_value' => substr($value, 0, 100),
                        'parameter' => $key
                    );
                    
                    // Update hit count
                    $this->record_hit($pattern['id']);
                    
                    // Log to Brain
                    $this->log_to_brain($pattern['type'], $pattern['name']);
                    
                    if ($pattern['action'] === 'block') {
                        $this->block_request($pattern['name'], $pattern['severity']);
                    }
                }
            }
        }
        
        return array(
            'passed' => count($threats_detected) === 0,
            'threats' => $threats_detected
        );
    }
    
    /**
     * Get all request data
     */
    private function get_request_data() {
        $data = array();
        
        // GET parameters
        foreach ($_GET as $key => $value) {
            $data['GET[' . $key . ']'] = is_array($value) ? implode(' ', $value) : $value;
        }
        
        // POST parameters
        foreach ($_POST as $key => $value) {
            $data['POST[' . $key . ']'] = is_array($value) ? implode(' ', $value) : $value;
        }
        
        // Headers
        $data['USER_AGENT'] = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $data['REFERER'] = $_SERVER['HTTP_REFERER'] ?? '';
        $data['REQUEST_URI'] = $_SERVER['REQUEST_URI'] ?? '';
        
        // Cookies
        foreach ($_COOKIE as $key => $value) {
            $data['COOKIE[' . $key . ']'] = $value;
        }
        
        return $data;
    }
    
    /**
     * Record rule hit
     */
    private function record_hit($rule_id) {
        global $wpdb;
        
        $wpdb->query($wpdb->prepare("
            UPDATE {$this->table_name}
            SET hit_count = hit_count + 1,
                last_triggered = %s
            WHERE id = %d
        ", current_time('mysql'), $rule_id));
    }
    
    /**
     * Block request
     */
    private function block_request($rule_name, $severity) {
        // Log blocked request
        require_once PFDEF_PLUGIN_DIR . 'includes/class-logger.php';
        PromptFluid_Defense_Logger::log_event(array(
            'type' => 'firewall_block',
            'severity' => $severity,
            'rule' => $rule_name,
            'ip' => $this->get_client_ip(),
            'url' => $_SERVER['REQUEST_URI'] ?? '',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
        ));
        
        // Send 403 response
        status_header(403);
        die('PromptFluid Defense: Request blocked by firewall');
    }
    
    /**
     * Get client IP
     */
    private function get_client_ip() {
        $ip_keys = array('HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED', 'HTTP_X_CLUSTER_CLIENT_IP', 'HTTP_FORWARDED_FOR', 'HTTP_FORWARDED', 'REMOTE_ADDR');
        
        foreach ($ip_keys as $key) {
            if (array_key_exists($key, $_SERVER) === true) {
                foreach (explode(',', $_SERVER[$key]) as $ip) {
                    $ip = trim($ip);
                    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                        return $ip;
                    }
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }
    
    /**
     * Log to Brain
     */
    private function log_to_brain($threat_type, $rule_name) {
        do_action('pfdef_security_event', array(
            'type' => 'firewall_trigger',
            'module' => 'firewall',
            'severity' => 'high',
            'details' => array(
                'threat_type' => $threat_type,
                'rule' => $rule_name,
                'ip' => $this->get_client_ip(),
                'timestamp' => current_time('mysql')
            )
        ));
    }
    
    /**
     * Get firewall statistics
     */
    public function get_stats() {
        global $wpdb;
        
        $total_rules = $wpdb->get_var("SELECT COUNT(*) FROM {$this->table_name}");
        $active_rules = $wpdb->get_var("SELECT COUNT(*) FROM {$this->table_name} WHERE is_active = 1");
        $total_hits = $wpdb->get_var("SELECT SUM(hit_count) FROM {$this->table_name}");
        
        $hits_24h = $wpdb->get_var("
            SELECT COUNT(*) FROM {$this->table_name}
            WHERE last_triggered >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ");
        
        $top_triggered = $wpdb->get_results("
            SELECT rule_name, rule_type, hit_count
            FROM {$this->table_name}
            WHERE hit_count > 0
            ORDER BY hit_count DESC
            LIMIT 5
        ", ARRAY_A);
        
        return array(
            'total_rules' => intval($total_rules),
            'active_rules' => intval($active_rules),
            'total_hits' => intval($total_hits),
            'hits_24h' => intval($hits_24h),
            'top_triggered' => $top_triggered,
            'status' => $hits_24h > 0 ? 'active' : 'idle'
        );
    }
}
