<?php
/**
 * Accessibility Scanner
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Clarity_Scanner {
    
    private $api_client;
    
    public function __construct() {
        $this->api_client = new PromptFluid_Clarity_API_Client();
    }
    
    /**
     * Perform accessibility scan via Nexus
     */
    public function perform_scan($url, $options = []) {
        $wcag_level = isset($options['wcag_level']) ? $options['wcag_level'] : 'AA';
        $max_pages = isset($options['max_pages']) ? $options['max_pages'] : PFCLARITY_MAX_PAGES_PER_SCAN;
        
        // Fetch page content
        $response = wp_remote_get($url, ['timeout' => 30]);
        if (is_wp_error($response)) {
            return ['success' => false, 'error' => $response->get_error_message()];
        }
        
        $html = wp_remote_retrieve_body($response);
        
        // Perform local scan
        $issues = $this->analyze_html($html, $wcag_level);
        
        // Send to Nexus for AI-enhanced analysis
        $nexus_result = $this->api_client->request_nexus(
            "Analyze accessibility issues and suggest fixes for WCAG {$wcag_level}",
            "You are an accessibility expert. Analyze the following issues and provide actionable remediation steps.",
            ['issues' => $issues, 'url' => $url]
        );
        
        // Save scan results
        $scan_id = $this->save_scan_results($url, $issues, $nexus_result);
        
        // Send learning data to Brain
        $this->api_client->send_to_brain('scan_completed', [
            'scan_id' => $scan_id,
            'url' => $url,
            'issue_count' => count($issues),
            'wcag_level' => $wcag_level
        ]);
        
        return [
            'success' => true,
            'scan_id' => $scan_id,
            'issues' => $issues,
            'ai_suggestions' => $nexus_result['content'] ?? null
        ];
    }
    
    /**
     * Analyze HTML for WCAG violations
     */
    private function analyze_html($html, $wcag_level) {
        $issues = [];
        $dom = new DOMDocument();
        @$dom->loadHTML($html);
        
        // Check 1.1.1 - Images without alt text
        $images = $dom->getElementsByTagName('img');
        foreach ($images as $img) {
            if (!$img->hasAttribute('alt')) {
                $issues[] = [
                    'wcag_criterion' => '1.1.1',
                    'severity' => 'critical',
                    'element' => 'img',
                    'description' => 'Image missing alt attribute',
                    'line' => $this->get_element_html($img)
                ];
            }
        }
        
        // Check 2.4.6 - Multiple H1 tags
        $h1_tags = $dom->getElementsByTagName('h1');
        if ($h1_tags->length > 1) {
            $issues[] = [
                'wcag_criterion' => '2.4.6',
                'severity' => 'warning',
                'element' => 'h1',
                'description' => 'Multiple H1 tags detected',
                'count' => $h1_tags->length
            ];
        }
        
        // Check 3.1.1 - Missing language attribute
        $html_tags = $dom->getElementsByTagName('html');
        if ($html_tags->length > 0 && !$html_tags->item(0)->hasAttribute('lang')) {
            $issues[] = [
                'wcag_criterion' => '3.1.1',
                'severity' => 'critical',
                'element' => 'html',
                'description' => 'Missing language attribute on HTML tag'
            ];
        }
        
        // Check 4.1.2 - Form inputs without labels
        $inputs = $dom->getElementsByTagName('input');
        foreach ($inputs as $input) {
            $type = $input->getAttribute('type');
            if (!in_array($type, ['hidden', 'submit', 'button'])) {
                $id = $input->getAttribute('id');
                if (!$id || !$this->has_label_for($dom, $id)) {
                    $issues[] = [
                        'wcag_criterion' => '4.1.2',
                        'severity' => 'critical',
                        'element' => 'input',
                        'description' => 'Form input without associated label',
                        'line' => $this->get_element_html($input)
                    ];
                }
            }
        }
        
        return $issues;
    }
    
    private function has_label_for($dom, $id) {
        $labels = $dom->getElementsByTagName('label');
        foreach ($labels as $label) {
            if ($label->getAttribute('for') === $id) {
                return true;
            }
        }
        return false;
    }
    
    private function get_element_html($element) {
        return $element->ownerDocument->saveHTML($element);
    }
    
    private function save_scan_results($url, $issues, $nexus_result) {
        global $wpdb;
        
        $wpdb->insert(PFCLARITY_TABLE_SCANS, [
            'url' => $url,
            'status' => 'completed',
            'issue_count' => count($issues),
            'ai_suggestions' => wp_json_encode($nexus_result),
            'scan_date' => current_time('mysql')
        ]);
        
        $scan_id = $wpdb->insert_id;
        
        // Save individual issues
        foreach ($issues as $issue) {
            $wpdb->insert(PFCLARITY_TABLE_ISSUES, [
                'scan_id' => $scan_id,
                'wcag_criterion' => $issue['wcag_criterion'],
                'severity' => $issue['severity'],
                'element' => $issue['element'],
                'description' => $issue['description'],
                'context' => wp_json_encode($issue),
                'status' => 'open'
            ]);
        }
        
        return $scan_id;
    }
    
    /**
     * Get scan results
     */
    public function get_scan($scan_id) {
        global $wpdb;
        
        return $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM " . PFCLARITY_TABLE_SCANS . " WHERE id = %d", $scan_id)
        );
    }
    
    /**
     * Get scan issues
     */
    public function get_scan_issues($scan_id) {
        global $wpdb;
        
        return $wpdb->get_results(
            $wpdb->prepare("SELECT * FROM " . PFCLARITY_TABLE_ISSUES . " WHERE scan_id = %d ORDER BY severity DESC", $scan_id)
        );
    }
}
