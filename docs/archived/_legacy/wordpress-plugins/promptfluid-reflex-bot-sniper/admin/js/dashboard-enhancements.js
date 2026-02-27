/**
 * Dashboard Enhancements - Interactive Controls & Feedback
 * 
 * @package PromptFluid_Reflex
 */

(function($) {
    'use strict';
    
    $(document).ready(function() {
        // Module Toggle Handler
        $('.pfdef-module-toggle').on('change', function() {
            const $toggle = $(this);
            const module = $toggle.data('module');
            const enabled = $toggle.prop('checked');
            const $card = $toggle.closest('.pfdef-module-card');
            
            // Disable toggle during request
            $toggle.prop('disabled', true);
            
            // Visual feedback
            $card.addClass('pfdef-updating');
            
            $.ajax({
                url: ajaxurl,
                method: 'POST',
                data: {
                    action: 'pfdef_toggle_module',
                    module: module,
                    enabled: enabled ? 1 : 0,
                    nonce: pfdefDashboard.nonce
                },
                success: function(response) {
                    if (response.success) {
                        // Update card state
                        if (enabled) {
                            $card.removeClass('disabled').addClass('enabled');
                            pfdefToast.success(response.data.message || 'Module enabled successfully!');
                        } else {
                            $card.removeClass('enabled').addClass('disabled');
                            pfdefToast.warning(response.data.message || 'Module disabled');
                        }
                    } else {
                        // Revert toggle
                        $toggle.prop('checked', !enabled);
                        pfdefToast.error(response.data.message || 'Failed to toggle module');
                    }
                },
                error: function() {
                    // Revert toggle
                    $toggle.prop('checked', !enabled);
                    pfdefToast.error('Network error. Please try again.');
                },
                complete: function() {
                    $toggle.prop('disabled', false);
                    $card.removeClass('pfdef-updating');
                }
            });
        });
        
        // Run Scan Button
        $('#pfdef-run-scan').on('click', function() {
            const $btn = $(this);
            const originalText = $btn.text();
            
            $btn.prop('disabled', true)
                .html('<span class="dashicons dashicons-update spin"></span> Scanning...');
            
            $.ajax({
                url: ajaxurl,
                method: 'POST',
                data: {
                    action: 'pfdef_run_scan',
                    nonce: pfdefDashboard.nonce
                },
                success: function(response) {
                    if (response.success) {
                        pfdefToast.success('Security scan complete! ' + response.data.message);
                        
                        // Reload page after 2 seconds
                        setTimeout(function() {
                            location.reload();
                        }, 2000);
                    } else {
                        pfdefToast.error(response.data.message || 'Scan failed');
                        $btn.prop('disabled', false).html(originalText);
                    }
                },
                error: function() {
                    pfdefToast.error('Network error. Please try again.');
                    $btn.prop('disabled', false).html(originalText);
                }
            });
        });
        
        // Review Threats Button
        $('#pfdef-review-threats').on('click', function() {
            window.location.href = pfdefDashboard.analyticsUrl;
        });
        
        // Settings Button
        $('#pfdef-settings').on('click', function() {
            window.location.href = pfdefDashboard.settingsUrl;
        });
        
        // Export Report Button
        $('#pfdef-export-report').on('click', function() {
            const $btn = $(this);
            const originalText = $btn.text();
            
            $btn.prop('disabled', true)
                .html('<span class="dashicons dashicons-update spin"></span> Generating...');
            
            pfdefToast.info('Generating security report...');
            
            $.ajax({
                url: ajaxurl,
                method: 'POST',
                data: {
                    action: 'pfdef_export_report',
                    nonce: pfdefDashboard.nonce
                },
                xhrFields: {
                    responseType: 'blob'
                },
                success: function(blob) {
                    // Create download link
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = 'promptfluid-reflex-report-' + Date.now() + '.pdf';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    
                    pfdefToast.success('Report downloaded successfully!');
                },
                error: function() {
                    pfdefToast.error('Failed to generate report');
                },
                complete: function() {
                    $btn.prop('disabled', false).html(originalText);
                }
            });
        });
        
        // Refresh Activity Feed
        $('.pfdef-refresh-activity').on('click', function() {
            const $btn = $(this);
            const $feed = $('#pfdef-activity-feed');
            
            $btn.find('.dashicons').addClass('spin');
            $btn.prop('disabled', true);
            
            $.ajax({
                url: ajaxurl,
                method: 'POST',
                data: {
                    action: 'pfdef_refresh_activity',
                    nonce: pfdefDashboard.nonce
                },
                success: function(response) {
                    if (response.success) {
                        $feed.html(response.data.html);
                        pfdefToast.success('Activity feed refreshed');
                    } else {
                        pfdefToast.error('Failed to refresh activity feed');
                    }
                },
                error: function() {
                    pfdefToast.error('Network error');
                },
                complete: function() {
                    $btn.find('.dashicons').removeClass('spin');
                    $btn.prop('disabled', false);
                }
            });
        });
        
        // Auto-refresh activity feed every 30 seconds
        if ($('#pfdef-activity-feed').length) {
            setInterval(function() {
                $('.pfdef-refresh-activity').trigger('click');
            }, 30000);
        }
        
        // Module Settings Button
        $('.pfdef-module-settings').on('click', function() {
            const module = $(this).data('module');
            window.location.href = pfdefDashboard.settingsUrl + '&module=' + module;
        });
        
        // Module Details Button
        $('.pfdef-module-details').on('click', function() {
            const module = $(this).data('module');
            window.location.href = pfdefDashboard.analyticsUrl + '&module=' + module;
        });
        
        // Add spinning animation to dashicons
        const style = $('<style>.dashicons.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }</style>');
        $('head').append(style);
    });
    
})(jQuery);
