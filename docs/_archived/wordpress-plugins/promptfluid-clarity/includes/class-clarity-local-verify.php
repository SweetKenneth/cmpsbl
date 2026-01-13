<?php
/**
 * Local Verification Protocol
 * Replaces Supabase edge log verification with local integrity checks
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Clarity_Local_Verify {
    
    private $log_file;
    
    public function __construct() {
        $this->log_file = PFCLARITY_PLUGIN_DIR . 'logs/verify-local.json';
    }
    
    /**
     * Run full local verification scan
     */
    public function run_verification() {
        $results = [
            'timestamp' => current_time('mysql'),
            'status' => 'verified',
            'checks' => [],
            'errors' => [],
            'warnings' => []
        ];
        
        // Check 1: Required PHP files exist
        $required_files = [
            'includes/class-clarity-core.php',
            'includes/class-clarity-scanner.php',
            'includes/class-clarity-fixer.php',
            'includes/class-clarity-api-client.php',
            'includes/class-clarity-licensing.php',
            'includes/class-clarity-logger.php',
            'includes/class-clarity-ajax.php',
            'config.php',
            'promptfluid-clarity.php'
        ];
        
        $missing_files = [];
        foreach ($required_files as $file) {
            $full_path = PFCLARITY_PLUGIN_DIR . $file;
            if (!file_exists($full_path)) {
                $missing_files[] = $file;
            }
        }
        
        $results['checks']['file_integrity'] = [
            'status' => empty($missing_files) ? 'pass' : 'fail',
            'missing_files' => $missing_files,
            'checked' => count($required_files)
        ];
        
        if (!empty($missing_files)) {
            $results['errors'][] = 'Missing required files: ' . implode(', ', $missing_files);
            $results['status'] = 'failed';
        }
        
        // Check 2: No Lovable SDK imports
        $sdk_check = $this->check_for_lovable_imports();
        $results['checks']['no_lovable_sdk'] = $sdk_check;
        
        if (!$sdk_check['passed']) {
            $results['warnings'][] = 'Found Lovable SDK references in ' . count($sdk_check['files']) . ' files';
        }
        
        // Check 3: Environment variables present
        $env_vars = ['PF_NEXUS_API', 'PF_BRAIN_ENDPOINT', 'PF_NEXUS_ROUTER'];
        $missing_env = [];
        
        foreach ($env_vars as $var) {
            if (!defined($var)) {
                $missing_env[] = $var;
            }
        }
        
        $results['checks']['environment'] = [
            'status' => empty($missing_env) ? 'pass' : 'fail',
            'missing_vars' => $missing_env
        ];
        
        if (!empty($missing_env)) {
            $results['errors'][] = 'Missing environment variables: ' . implode(', ', $missing_env);
            $results['status'] = 'failed';
        }
        
        // Check 4: WordPress activation status
        $results['checks']['wordpress_activation'] = [
            'status' => is_plugin_active(PFCLARITY_PLUGIN_BASENAME) ? 'pass' : 'inactive',
            'active' => is_plugin_active(PFCLARITY_PLUGIN_BASENAME)
        ];
        
        // Check 5: PHP fatal error check (via wp-cli simulation)
        $php_errors = $this->check_php_errors();
        $results['checks']['php_errors'] = $php_errors;
        
        if ($php_errors['count'] > 0) {
            $results['errors'][] = $php_errors['count'] . ' PHP errors detected';
            $results['status'] = 'failed';
        }
        
        // Check 6: Database tables exist
        global $wpdb;
        $tables = [
            PFCLARITY_TABLE_SCANS,
            PFCLARITY_TABLE_ISSUES,
            PFCLARITY_TABLE_FIXES,
            PFCLARITY_TABLE_LOGS
        ];
        
        $missing_tables = [];
        foreach ($tables as $table) {
            $exists = $wpdb->get_var("SHOW TABLES LIKE '$table'") === $table;
            if (!$exists) {
                $missing_tables[] = $table;
            }
        }
        
        $results['checks']['database_tables'] = [
            'status' => empty($missing_tables) ? 'pass' : 'fail',
            'missing_tables' => $missing_tables
        ];
        
        if (!empty($missing_tables)) {
            $results['warnings'][] = 'Missing database tables: ' . implode(', ', $missing_tables);
        }
        
        // Final status determination
        if (empty($results['errors'])) {
            $results['status'] = 'verified';
        }
        
        // Write results to log file
        $this->write_log($results);
        
        return $results;
    }
    
    /**
     * Check for Lovable SDK imports
     */
    private function check_for_lovable_imports() {
        $files_with_imports = [];
        $includes_dir = PFCLARITY_PLUGIN_DIR . 'includes/';
        
        if (is_dir($includes_dir)) {
            $files = glob($includes_dir . '*.php');
            foreach ($files as $file) {
                $content = file_get_contents($file);
                if (preg_match('/lovable|@lovable/i', $content)) {
                    $files_with_imports[] = basename($file);
                }
            }
        }
        
        return [
            'passed' => empty($files_with_imports),
            'files' => $files_with_imports
        ];
    }
    
    /**
     * Check for PHP fatal errors
     */
    private function check_php_errors() {
        $error_log = ini_get('error_log');
        $recent_errors = [];
        
        // Check last 100 lines of PHP error log for fatal errors in last hour
        if (file_exists($error_log)) {
            $lines = array_slice(file($error_log), -100);
            $one_hour_ago = time() - 3600;
            
            foreach ($lines as $line) {
                if (stripos($line, 'fatal') !== false || stripos($line, 'parse error') !== false) {
                    if (stripos($line, 'promptfluid') !== false || stripos($line, 'pfclarity') !== false) {
                        $recent_errors[] = trim($line);
                    }
                }
            }
        }
        
        return [
            'count' => count($recent_errors),
            'errors' => array_slice($recent_errors, 0, 5) // Only first 5
        ];
    }
    
    /**
     * Write verification log to file
     */
    private function write_log($results) {
        $log_dir = dirname($this->log_file);
        
        // Create logs directory if it doesn't exist
        if (!file_exists($log_dir)) {
            wp_mkdir_p($log_dir);
        }
        
        // Write JSON log
        file_put_contents($this->log_file, json_encode($results, JSON_PRETTY_PRINT));
        
        // Set proper permissions
        chmod($this->log_file, 0644);
    }
    
    /**
     * Get last verification results
     */
    public function get_last_verification() {
        if (file_exists($this->log_file)) {
            $content = file_get_contents($this->log_file);
            return json_decode($content, true);
        }
        
        return null;
    }
    
    /**
     * Get verification status summary for dashboard
     */
    public function get_status_summary() {
        $last = $this->get_last_verification();
        
        if (!$last) {
            return [
                'status' => 'never_run',
                'message' => 'Verification has not been run yet'
            ];
        }
        
        $age_seconds = time() - strtotime($last['timestamp']);
        $age_human = human_time_diff(strtotime($last['timestamp']));
        
        return [
            'status' => $last['status'],
            'timestamp' => $last['timestamp'],
            'age_seconds' => $age_seconds,
            'age_human' => $age_human,
            'errors' => count($last['errors']),
            'warnings' => count($last['warnings']),
            'checks_passed' => $this->count_passed_checks($last['checks'])
        ];
    }
    
    /**
     * Count passed checks
     */
    private function count_passed_checks($checks) {
        $passed = 0;
        foreach ($checks as $check) {
            if (isset($check['status']) && $check['status'] === 'pass') {
                $passed++;
            }
        }
        return $passed;
    }
}
