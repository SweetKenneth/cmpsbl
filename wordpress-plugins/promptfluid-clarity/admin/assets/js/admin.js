// PromptFluid Clarity Admin JS

jQuery(document).ready(function($) {
    
    // New Scan Handler
    $('#pfclarity-new-scan, #pfclarity-new-scan-btn, #pfclarity-start-scan').on('click', function() {
        const url = prompt('Enter URL to scan:');
        if (!url) return;
        
        const wcagLevel = prompt('Enter WCAG level (A, AA, AAA):', 'AA');
        
        $(this).prop('disabled', true).text('Scanning...');
        
        $.ajax({
            url: pfclarityData.ajaxUrl,
            method: 'POST',
            data: {
                action: 'pfclarity_start_scan',
                nonce: pfclarityData.nonce,
                url: url,
                wcag_level: wcagLevel
            },
            success: function(response) {
                if (response.success) {
                    alert('Scan completed! Found ' + response.data.issues.length + ' issues.');
                    location.reload();
                } else {
                    alert('Scan failed: ' + response.data.message);
                }
            },
            error: function() {
                alert('Request failed. Please try again.');
            },
            complete: function() {
                $('#pfclarity-new-scan, #pfclarity-new-scan-btn, #pfclarity-start-scan').prop('disabled', false).text('New Scan');
            }
        });
    });
    
    // Auto-Fix Handler
    $('.pfclarity-auto-fix, #pfclarity-auto-fix-all').on('click', function() {
        const scanId = $(this).data('scan-id');
        const button = $(this);
        
        if (!confirm('Apply AI-powered fixes to all issues?')) return;
        
        button.prop('disabled', true).text('Fixing...');
        
        $.ajax({
            url: pfclarityData.ajaxUrl,
            method: 'POST',
            data: {
                action: 'pfclarity_auto_fix',
                nonce: pfclarityData.nonce,
                scan_id: scanId
            },
            success: function(response) {
                if (response.success) {
                    alert('Fixes applied successfully!');
                    location.reload();
                } else {
                    alert('Auto-fix failed: ' + response.data.message);
                }
            },
            error: function() {
                alert('Request failed. Please try again.');
            },
            complete: function() {
                button.prop('disabled', false).text('Auto-Fix');
            }
        });
    });
    
    // View Scan Handler
    $('.pfclarity-view-scan').on('click', function() {
        const scanId = $(this).data('scan-id');
        window.location.href = '?page=pfclarity-scans&scan_id=' + scanId;
    });
    
    // View Logs Handler
    $('#pfclarity-view-logs').on('click', function() {
        if (confirm('View system logs?')) {
            window.location.href = '?page=promptfluid-clarity-logs';
        }
    });
    
});
