<?php
/**
 * Accessibility Fixer
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Clarity_Fixer {
    
    private $api_client;
    
    public function __construct() {
        $this->api_client = new PromptFluid_Clarity_API_Client();
    }
    
    /**
     * Apply fixes via Nexus AI
     */
    public function apply_fixes($issue_id, $options = []) {
        global $wpdb;
        
        $issue = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM " . PFCLARITY_TABLE_ISSUES . " WHERE id = %d",
            $issue_id
        ));
        
        if (!$issue) {
            return ['success' => false, 'error' => 'Issue not found'];
        }
        
        $context = json_decode($issue->context, true);
        
        // Request AI fix from Nexus
        $fix_prompt = $this->build_fix_prompt($issue, $context);
        $nexus_result = $this->api_client->request_nexus(
            $fix_prompt,
            "You are an accessibility remediation expert. Generate specific HTML/CSS fixes for WCAG compliance.",
            ['issue' => $issue, 'context' => $context]
        );
        
        if (!$nexus_result['success']) {
            return ['success' => false, 'error' => 'AI fix generation failed'];
        }
        
        // Apply the fix
        $fix_applied = $this->execute_fix($issue, $nexus_result['content']);
        
        // Log fix
        $wpdb->insert(PFCLARITY_TABLE_FIXES, [
            'issue_id' => $issue_id,
            'fix_type' => $this->get_fix_type($issue->wcag_criterion),
            'fix_code' => $nexus_result['content'],
            'status' => $fix_applied ? 'applied' : 'failed',
            'applied_date' => current_time('mysql')
        ]);
        
        // Update issue status
        if ($fix_applied) {
            $wpdb->update(
                PFCLARITY_TABLE_ISSUES,
                ['status' => 'fixed'],
                ['id' => $issue_id]
            );
        }
        
        // Send to Brain
        $this->api_client->send_to_brain('fix_applied', [
            'issue_id' => $issue_id,
            'wcag_criterion' => $issue->wcag_criterion,
            'success' => $fix_applied
        ]);
        
        return [
            'success' => $fix_applied,
            'fix_code' => $nexus_result['content']
        ];
    }
    
    private function build_fix_prompt($issue, $context) {
        return sprintf(
            "Generate a fix for WCAG %s violation: %s\nElement: %s\nContext: %s",
            $issue->wcag_criterion,
            $issue->description,
            $issue->element,
            json_encode($context)
        );
    }
    
    private function execute_fix($issue, $fix_code) {
        // Store fix code in custom CSS/JS injection system
        $fixes = get_option('pfclarity_active_fixes', []);
        $fixes[$issue->id] = [
            'code' => $fix_code,
            'wcag' => $issue->wcag_criterion,
            'timestamp' => time()
        ];
        update_option('pfclarity_active_fixes', $fixes);
        return true;
    }
    
    private function get_fix_type($wcag_criterion) {
        $types = [
            '1.1.1' => 'alt_text',
            '2.4.6' => 'heading_fix',
            '3.1.1' => 'lang_attribute',
            '4.1.2' => 'form_label'
        ];
        return $types[$wcag_criterion] ?? 'other';
    }
    
    /**
     * Auto-fix all issues for a scan
     */
    public function auto_fix_scan($scan_id) {
        global $wpdb;
        
        $issues = $wpdb->get_results($wpdb->prepare(
            "SELECT id FROM " . PFCLARITY_TABLE_ISSUES . " WHERE scan_id = %d AND status = 'open'",
            $scan_id
        ));
        
        $results = [];
        foreach ($issues as $issue) {
            $results[] = $this->apply_fixes($issue->id);
        }
        
        return $results;
    }
    
    /**
     * Get fix details
     */
    public function get_fix($fix_id) {
        global $wpdb;
        
        return $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM " . PFCLARITY_TABLE_FIXES . " WHERE id = %d", $fix_id)
        );
    }
    
    /**
     * Revert a fix
     */
    public function revert_fix($fix_id) {
        global $wpdb;
        
        $fix = $this->get_fix($fix_id);
        if (!$fix) {
            return false;
        }
        
        // Remove from active fixes
        $fixes = get_option('pfclarity_active_fixes', []);
        unset($fixes[$fix->issue_id]);
        update_option('pfclarity_active_fixes', $fixes);
        
        // Update issue status
        $wpdb->update(
            PFCLARITY_TABLE_ISSUES,
            ['status' => 'open'],
            ['id' => $fix->issue_id]
        );
        
        PromptFluid_Clarity_Logger::log("Fix {$fix_id} reverted", 'info');
        
        return true;
    }
}
