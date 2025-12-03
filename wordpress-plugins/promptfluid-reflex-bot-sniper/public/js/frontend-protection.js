/**
 * PromptFluid Defense - Frontend Protection Layer
 * Invisible bot detection and behavioral analysis
 */

(function() {
    'use strict';

    const PFDefense = {
        config: {
            apiUrl: window.pfdefConfig?.apiUrl || '/wp-json/pfdef/v1/',
            nonce: window.pfdefConfig?.nonce || '',
            checkInterval: 5000, // Check every 5 seconds
            sessionId: null
        },

        behavioral: {
            mouseMovements: 0,
            clicks: 0,
            keystrokes: 0,
            scrolls: 0,
            timeOnPage: 0,
            focusChanges: 0,
            startTime: Date.now()
        },

        fingerprint: {},

        /**
         * Initialize protection
         */
        init: function() {
            this.config.sessionId = this.generateSessionId();
            this.collectFingerprint();
            this.trackBehavior();
            this.performCheck();
        },

        /**
         * Generate unique session ID
         */
        generateSessionId: function() {
            return 'pf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },

        /**
         * Collect device fingerprint
         */
        collectFingerprint: async function() {
            const fp = {
                userAgent: navigator.userAgent,
                language: navigator.language,
                languages: navigator.languages?.join(',') || '',
                platform: navigator.platform,
                hardwareConcurrency: navigator.hardwareConcurrency || 0,
                deviceMemory: navigator.deviceMemory || 0,
                screen: {
                    width: screen.width,
                    height: screen.height,
                    colorDepth: screen.colorDepth,
                    pixelRatio: window.devicePixelRatio || 1
                },
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                canvas: await this.getCanvasFingerprint(),
                webgl: this.getWebGLFingerprint(),
                plugins: this.getPlugins(),
                fonts: await this.detectFonts()
            };

            this.fingerprint = fp;
            return fp;
        },

        /**
         * Canvas fingerprinting
         */
        getCanvasFingerprint: function() {
            return new Promise((resolve) => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    if (!ctx) {
                        resolve('unsupported');
                        return;
                    }

                    canvas.width = 200;
                    canvas.height = 50;
                    
                    ctx.textBaseline = 'top';
                    ctx.font = '14px Arial';
                    ctx.fillStyle = '#f60';
                    ctx.fillRect(125, 1, 62, 20);
                    ctx.fillStyle = '#069';
                    ctx.fillText('PromptFluid Defense', 2, 15);
                    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
                    ctx.fillText('Canvas Fingerprint', 4, 17);

                    const dataUrl = canvas.toDataURL();
                    const hash = this.simpleHash(dataUrl);
                    resolve(hash);
                } catch (e) {
                    resolve('error');
                }
            });
        },

        /**
         * WebGL fingerprinting
         */
        getWebGLFingerprint: function() {
            try {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                
                if (!gl) return 'unsupported';

                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown';
                const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';

                return this.simpleHash(vendor + '|' + renderer);
            } catch (e) {
                return 'error';
            }
        },

        /**
         * Get installed plugins
         */
        getPlugins: function() {
            if (!navigator.plugins || navigator.plugins.length === 0) {
                return 'none';
            }
            
            const plugins = [];
            for (let i = 0; i < Math.min(navigator.plugins.length, 5); i++) {
                plugins.push(navigator.plugins[i].name);
            }
            return this.simpleHash(plugins.join('|'));
        },

        /**
         * Font detection
         */
        detectFonts: function() {
            return new Promise((resolve) => {
                const baseFonts = ['monospace', 'sans-serif', 'serif'];
                const testString = 'mmmmmmmmmmlli';
                const testSize = '72px';
                const h = document.getElementsByTagName('body')[0];

                const s = document.createElement('span');
                s.style.fontSize = testSize;
                s.innerHTML = testString;
                const defaultWidths = {};
                const defaultHeights = {};

                for (const baseFont of baseFonts) {
                    s.style.fontFamily = baseFont;
                    h.appendChild(s);
                    defaultWidths[baseFont] = s.offsetWidth;
                    defaultHeights[baseFont] = s.offsetHeight;
                    h.removeChild(s);
                }

                const detect = function(font) {
                    for (const baseFont of baseFonts) {
                        s.style.fontFamily = font + ',' + baseFont;
                        h.appendChild(s);
                        const matched = s.offsetWidth !== defaultWidths[baseFont] || 
                                      s.offsetHeight !== defaultHeights[baseFont];
                        h.removeChild(s);
                        if (matched) return true;
                    }
                    return false;
                };

                const testFonts = [
                    'Arial', 'Verdana', 'Times New Roman', 'Courier New',
                    'Georgia', 'Palatino', 'Garamond', 'Bookman'
                ];

                const detectedFonts = testFonts.filter(font => detect(font));
                resolve(this.simpleHash(detectedFonts.join('|')));
            });
        },

        /**
         * Track behavioral patterns
         */
        trackBehavior: function() {
            // Mouse movements
            document.addEventListener('mousemove', () => {
                this.behavioral.mouseMovements++;
            }, { passive: true });

            // Clicks
            document.addEventListener('click', () => {
                this.behavioral.clicks++;
            }, { passive: true });

            // Keystrokes
            document.addEventListener('keydown', () => {
                this.behavioral.keystrokes++;
            }, { passive: true });

            // Scrolling
            document.addEventListener('scroll', () => {
                this.behavioral.scrolls++;
            }, { passive: true });

            // Focus changes
            window.addEventListener('focus', () => {
                this.behavioral.focusChanges++;
            });

            // Update time on page
            setInterval(() => {
                this.behavioral.timeOnPage = Date.now() - this.behavioral.startTime;
            }, 1000);
        },

        /**
         * Perform protection check
         */
        performCheck: async function() {
            try {
                const data = {
                    sessionId: this.config.sessionId,
                    fingerprint: this.fingerprint,
                    behavioral: {
                        mouseMovements: this.behavioral.mouseMovements,
                        clicks: this.behavioral.clicks,
                        keystrokes: this.behavioral.keystrokes,
                        scrolls: this.behavioral.scrolls,
                        timeOnPage: this.behavioral.timeOnPage,
                        focusChanges: this.behavioral.focusChanges
                    },
                    page: {
                        url: window.location.href,
                        referrer: document.referrer
                    }
                };

                const response = await fetch(this.config.apiUrl + 'check-request', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': this.config.nonce
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                this.handleResponse(result);

            } catch (error) {
                console.error('PFDefense check failed:', error);
            }
        },

        /**
         * Handle API response
         */
        handleResponse: function(result) {
            if (!result || !result.action) return;

            switch (result.action) {
                case 'allow':
                    // Continue normally
                    break;

                case 'challenge':
                    this.showChallenge(result.challengeType || 'captcha');
                    break;

                case 'block':
                    this.showBlockPage(result.message || 'Access denied');
                    break;
            }
        },

        /**
         * Show challenge modal
         */
        showChallenge: function(type) {
            const modal = document.createElement('div');
            modal.id = 'pfdef-challenge-modal';
            modal.innerHTML = `
                <div class="pfdef-challenge-overlay">
                    <div class="pfdef-challenge-container">
                        <div class="pfdef-challenge-header">
                            <h3>Security Verification</h3>
                            <p>Please verify you are human to continue</p>
                        </div>
                        <div class="pfdef-challenge-content">
                            <div class="pfdef-spinner"></div>
                            <p>Loading verification...</p>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            
            // In a real implementation, this would load CAPTCHA or other challenge
            setTimeout(() => {
                this.closeChallenge();
            }, 3000);
        },

        /**
         * Close challenge modal
         */
        closeChallenge: function() {
            const modal = document.getElementById('pfdef-challenge-modal');
            if (modal) {
                modal.remove();
            }
        },

        /**
         * Show block page
         */
        showBlockPage: function(message) {
            document.body.innerHTML = `
                <div class="pfdef-block-page">
                    <div class="pfdef-block-container">
                        <div class="pfdef-block-icon">⚠️</div>
                        <h1>Access Denied</h1>
                        <p>${message}</p>
                        <p class="pfdef-block-details">
                            Your request has been identified as potentially automated or malicious.
                            If you believe this is an error, please contact the site administrator.
                        </p>
                        <p class="pfdef-block-footer">
                            Protected by <strong>PromptFluid Defense</strong>
                        </p>
                    </div>
                </div>
            `;
        },

        /**
         * Simple hash function
         */
        simpleHash: function(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return hash.toString(36);
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => PFDefense.init());
    } else {
        PFDefense.init();
    }

    // Make available globally for debugging
    window.PFDefense = PFDefense;

})();
