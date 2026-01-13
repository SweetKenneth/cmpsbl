<?php
/**
 * Verification Status Widget for Dashboard
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Clarity_Verify_Widget {
    
    private $verifier;
    
    public function __construct() {
        $this->verifier = new PromptFluid_Clarity_Local_Verify();
        
        add_action('wp_ajax_pfclarity_run_verification', [$this, 'ajax_run_verification']);
        add_action('wp_ajax_pfclarity_get_verification_status', [$this, 'ajax_get_status']);
    }
    
    /**
     * Render verification widget on dashboard
     */
    public function render() {
        $status = $this->verifier->get_status_summary();
        ?>
        <div class="pfclarity-verify-widget" style="padding: 15px; background: #f9f9f9; border-left: 4px solid #4CAF50; margin: 15px 0;">
            <h3 style="margin-top: 0;">
                🧪 Local Verification Status
                <?php if (getenv('PF_LOCAL_VERIFY') === 'true'): ?>
                    <span style="background: #4CAF50; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; margin-left: 10px;">ENABLED</span>
                <?php endif; ?>
            </h3>
            
            <div id="pfclarity-verify-status">
                <?php if ($status['status'] === 'never_run'): ?>
                    <p style="color: #666;">No verification has been run yet.</p>
                <?php else: ?>
                    <div style="display: flex; gap: 20px; margin-bottom: 10px;">
                        <div>
                            <strong>Status:</strong>
                            <span style="color: <?php echo $status['status'] === 'verified' ? '#4CAF50' : '#f44336'; ?>">
                                <?php echo strtoupper($status['status']); ?>
                            </span>
                        </div>
                        <div>
                            <strong>Last Run:</strong> <?php echo $status['age_human']; ?> ago
                        </div>
                        <div>
                            <strong>Checks Passed:</strong> <?php echo $status['checks_passed']; ?>
                        </div>
                    </div>
                    
                    <?php if ($status['errors'] > 0): ?>
                        <div style="background: #fff3cd; padding: 10px; border-left: 3px solid #ffc107; margin-top: 10px;">
                            ⚠️ <strong><?php echo $status['errors']; ?> errors</strong> detected
                        </div>
                    <?php endif; ?>
                    
                    <?php if ($status['warnings'] > 0): ?>
                        <div style="background: #e3f2fd; padding: 10px; border-left: 3px solid #2196F3; margin-top: 10px;">
                            ℹ️ <strong><?php echo $status['warnings']; ?> warnings</strong> detected
                        </div>
                    <?php endif; ?>
                <?php endif; ?>
            </div>
            
            <button 
                type="button" 
                class="button button-primary" 
                id="pfclarity-run-verify"
                style="margin-top: 10px;"
            >
                🔄 Run Verification
            </button>
            
            <script>
            jQuery(document).ready(function($) {
                $('#pfclarity-run-verify').on('click', function() {
                    var $btn = $(this);
                    $btn.prop('disabled', true).text('⏳ Running...');
                    
                    $.ajax({
                        url: ajaxurl,
                        method: 'POST',
                        data: {
                            action: 'pfclarity_run_verification',
                            nonce: '<?php echo wp_create_nonce('pfclarity_verify'); ?>'
                        },
                        success: function(response) {
                            if (response.success) {
                                location.reload();
                            } else {
                                alert('Verification failed: ' + response.data);
                            }
                        },
                        error: function() {
                            alert('Verification request failed');
                            $btn.prop('disabled', false).text('🔄 Run Verification');
                        }
                    });
                });
            });
            </script>
        </div>
        <?php
    }
    
    /**
     * AJAX: Run verification
     */
    public function ajax_run_verification() {
        check_ajax_referer('pfclarity_verify', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
        }
        
        $results = $this->verifier->run_verification();
        
        if ($results['status'] === 'verified') {
            wp_send_json_success($results);
        } else {
            wp_send_json_error($results);
        }
    }
    
    /**
     * AJAX: Get verification status
     */
    public function ajax_get_status() {
        $status = $this->verifier->get_status_summary();
        wp_send_json_success($status);
    }
}
