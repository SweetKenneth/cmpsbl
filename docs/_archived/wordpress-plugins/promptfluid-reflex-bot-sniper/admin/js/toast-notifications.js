/**
 * Toast Notification System for WordPress Admin
 * 
 * @package PromptFluid_Reflex
 */

(function($) {
    'use strict';
    
    // Create toast container if it doesn't exist
    if ($('#pfdef-toast-container').length === 0) {
        $('body').append('<div id="pfdef-toast-container" class="pfdef-toast-container"></div>');
    }
    
    /**
     * Show toast notification
     * 
     * @param {string} message - The message to display
     * @param {string} type - success, error, warning, info
     * @param {number} duration - How long to show (ms), 0 = manual close
     */
    window.pfdefToast = function(message, type, duration) {
        type = type || 'info';
        duration = duration || 4000;
        
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        
        const icon = icons[type] || icons.info;
        
        const toast = $('<div class="pfdef-toast pfdef-toast-' + type + '">' +
            '<div class="pfdef-toast-icon">' + icon + '</div>' +
            '<div class="pfdef-toast-message">' + message + '</div>' +
            '<button class="pfdef-toast-close">×</button>' +
            '<div class="pfdef-toast-progress"></div>' +
            '</div>');
        
        $('#pfdef-toast-container').append(toast);
        
        // Trigger entrance animation
        setTimeout(function() {
            toast.addClass('pfdef-toast-show');
        }, 10);
        
        // Close button
        toast.find('.pfdef-toast-close').on('click', function() {
            closeToast(toast);
        });
        
        // Auto-close
        if (duration > 0) {
            const progress = toast.find('.pfdef-toast-progress');
            progress.css('transition', 'width ' + duration + 'ms linear');
            setTimeout(function() {
                progress.css('width', '0%');
            }, 10);
            
            setTimeout(function() {
                closeToast(toast);
            }, duration);
        }
    };
    
    function closeToast(toast) {
        toast.removeClass('pfdef-toast-show');
        setTimeout(function() {
            toast.remove();
        }, 300);
    }
    
    // Shorthand functions
    window.pfdefToast.success = function(message, duration) {
        window.pfdefToast(message, 'success', duration);
    };
    
    window.pfdefToast.error = function(message, duration) {
        window.pfdefToast(message, 'error', duration);
    };
    
    window.pfdefToast.warning = function(message, duration) {
        window.pfdefToast(message, 'warning', duration);
    };
    
    window.pfdefToast.info = function(message, duration) {
        window.pfdefToast(message, 'info', duration);
    };
    
})(jQuery);
