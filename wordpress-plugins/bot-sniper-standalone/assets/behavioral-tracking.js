/**
 * Bot Sniper Behavioral Tracking
 * 
 * Captures real user behavioral data to distinguish humans from bots
 */

(function() {
    'use strict';
    
    const BotSniperTracking = {
        data: {
            mouse_movements: [],
            keyboard_events: [],
            scroll_events: [],
            click_events: [],
            touch_events: [],
            focus_events: [],
            time_on_page: 0,
            page_loads: 0,
            visibility_changes: 0
        },
        
        config: {
            maxMouseEvents: 50,
            maxKeyboardEvents: 30,
            maxScrollEvents: 20,
            samplingRate: 10, // Capture every Nth mouse movement
            sendInterval: 30000, // Send data every 30 seconds
            sessionKey: 'bot_sniper_session_' + Date.now()
        },
        
        mouseEventCount: 0,
        startTime: Date.now(),
        lastActivityTime: Date.now(),
        sessionId: null,
        
        init: function() {
            this.sessionId = this.generateSessionId();
            this.setupEventListeners();
            this.startTimeTracking();
            this.scheduleDataSend();
            
            // Mark page load
            this.data.page_loads = 1;
        },
        
        generateSessionId: function() {
            return 'bs_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },
        
        setupEventListeners: function() {
            // Mouse movement tracking
            document.addEventListener('mousemove', this.handleMouseMove.bind(this), { passive: true });
            
            // Keyboard tracking
            document.addEventListener('keydown', this.handleKeyDown.bind(this), { passive: true });
            document.addEventListener('keyup', this.handleKeyUp.bind(this), { passive: true });
            
            // Scroll tracking
            window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
            
            // Click tracking
            document.addEventListener('click', this.handleClick.bind(this), { passive: true });
            
            // Touch tracking (mobile)
            document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
            document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
            document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
            
            // Focus tracking
            window.addEventListener('focus', this.handleFocus.bind(this), { passive: true });
            window.addEventListener('blur', this.handleBlur.bind(this), { passive: true });
            
            // Visibility tracking
            document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this), { passive: true });
            
            // Before unload - send final data
            window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        },
        
        handleMouseMove: function(e) {
            this.lastActivityTime = Date.now();
            this.mouseEventCount++;
            
            // Sample mouse movements to avoid too much data
            if (this.mouseEventCount % this.config.samplingRate !== 0) {
                return;
            }
            
            if (this.data.mouse_movements.length < this.config.maxMouseEvents) {
                this.data.mouse_movements.push({
                    x: e.clientX,
                    y: e.clientY,
                    time: Date.now() - this.startTime,
                    buttons: e.buttons
                });
            }
        },
        
        handleKeyDown: function(e) {
            this.lastActivityTime = Date.now();
            
            if (this.data.keyboard_events.length < this.config.maxKeyboardEvents) {
                this.data.keyboard_events.push({
                    type: 'keydown',
                    key: e.key.length === 1 ? 'char' : e.key, // Anonymize actual characters
                    time: Date.now() - this.startTime,
                    ctrlKey: e.ctrlKey,
                    shiftKey: e.shiftKey,
                    altKey: e.altKey
                });
            }
        },
        
        handleKeyUp: function(e) {
            this.lastActivityTime = Date.now();
            
            if (this.data.keyboard_events.length < this.config.maxKeyboardEvents) {
                this.data.keyboard_events.push({
                    type: 'keyup',
                    key: e.key.length === 1 ? 'char' : e.key,
                    time: Date.now() - this.startTime
                });
            }
        },
        
        handleScroll: function(e) {
            this.lastActivityTime = Date.now();
            
            if (this.data.scroll_events.length < this.config.maxScrollEvents) {
                this.data.scroll_events.push({
                    scrollY: window.scrollY,
                    scrollX: window.scrollX,
                    time: Date.now() - this.startTime
                });
            }
        },
        
        handleClick: function(e) {
            this.lastActivityTime = Date.now();
            
            this.data.click_events.push({
                x: e.clientX,
                y: e.clientY,
                button: e.button,
                time: Date.now() - this.startTime,
                target: e.target.tagName
            });
        },
        
        handleTouchStart: function(e) {
            this.lastActivityTime = Date.now();
            
            if (e.touches.length > 0) {
                this.data.touch_events.push({
                    type: 'start',
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY,
                    time: Date.now() - this.startTime,
                    touches: e.touches.length
                });
            }
        },
        
        handleTouchMove: function(e) {
            this.lastActivityTime = Date.now();
            
            if (e.touches.length > 0 && this.data.touch_events.length < this.config.maxMouseEvents) {
                this.data.touch_events.push({
                    type: 'move',
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY,
                    time: Date.now() - this.startTime
                });
            }
        },
        
        handleTouchEnd: function(e) {
            this.lastActivityTime = Date.now();
            
            this.data.touch_events.push({
                type: 'end',
                time: Date.now() - this.startTime
            });
        },
        
        handleFocus: function() {
            this.data.focus_events.push({
                type: 'focus',
                time: Date.now() - this.startTime
            });
        },
        
        handleBlur: function() {
            this.data.focus_events.push({
                type: 'blur',
                time: Date.now() - this.startTime
            });
        },
        
        handleVisibilityChange: function() {
            this.data.visibility_changes++;
            
            if (document.hidden) {
                this.data.focus_events.push({
                    type: 'hidden',
                    time: Date.now() - this.startTime
                });
            } else {
                this.data.focus_events.push({
                    type: 'visible',
                    time: Date.now() - this.startTime
                });
            }
        },
        
        handleBeforeUnload: function() {
            // Send final data synchronously
            this.sendDataSync();
        },
        
        startTimeTracking: function() {
            setInterval(function() {
                this.data.time_on_page = Date.now() - this.startTime;
            }.bind(this), 1000);
        },
        
        scheduleDataSend: function() {
            // Send data periodically
            setInterval(function() {
                this.sendData();
            }.bind(this), this.config.sendInterval);
        },
        
        sendData: function() {
            if (!window.botSniperData || !window.botSniperData.ajaxUrl) {
                return;
            }
            
            const payload = {
                action: 'bot_sniper_track_behavior',
                nonce: window.botSniperData.nonce || '',
                session_id: this.sessionId,
                data: JSON.stringify(this.data),
                page_url: window.location.href,
                referrer: document.referrer
            };
            
            // Use sendBeacon if available (non-blocking)
            if (navigator.sendBeacon) {
                const formData = new FormData();
                for (const key in payload) {
                    formData.append(key, payload[key]);
                }
                navigator.sendBeacon(window.botSniperData.ajaxUrl, formData);
            } else {
                // Fallback to fetch
                fetch(window.botSniperData.ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams(payload),
                    keepalive: true
                }).catch(function(error) {
                    console.error('Bot Sniper tracking error:', error);
                });
            }
        },
        
        sendDataSync: function() {
            if (!window.botSniperData || !window.botSniperData.ajaxUrl) {
                return;
            }
            
            const payload = {
                action: 'bot_sniper_track_behavior',
                nonce: window.botSniperData.nonce || '',
                session_id: this.sessionId,
                data: JSON.stringify(this.data),
                page_url: window.location.href,
                referrer: document.referrer
            };
            
            // Use sendBeacon for synchronous send
            if (navigator.sendBeacon) {
                const formData = new FormData();
                for (const key in payload) {
                    formData.append(key, payload[key]);
                }
                navigator.sendBeacon(window.botSniperData.ajaxUrl, formData);
            }
        },
        
        getAnalytics: function() {
            return {
                total_mouse_movements: this.data.mouse_movements.length,
                total_keyboard_events: this.data.keyboard_events.length,
                total_scroll_events: this.data.scroll_events.length,
                total_click_events: this.data.click_events.length,
                total_touch_events: this.data.touch_events.length,
                time_on_page: this.data.time_on_page,
                has_mouse_activity: this.data.mouse_movements.length > 0,
                has_keyboard_activity: this.data.keyboard_events.length > 0,
                has_scroll_activity: this.data.scroll_events.length > 0,
                is_mobile: this.data.touch_events.length > 0,
                visibility_changes: this.data.visibility_changes
            };
        }
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            BotSniperTracking.init();
        });
    } else {
        BotSniperTracking.init();
    }
    
    // Expose to window for debugging
    window.BotSniperTracking = BotSniperTracking;
})();
