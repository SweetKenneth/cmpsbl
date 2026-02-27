<?php
/**
 * Behavioral Tracking System
 * 
 * Tracks and analyzes user behavioral patterns in real-time
 *
 * @package PromptFluid_Defense
 */

if (!defined('ABSPATH')) {
    exit;
}

class PromptFluid_Defense_Behavioral_Tracking {
    
    /**
     * Initialize behavioral tracking
     */
    public static function init() {
        add_action('wp_footer', array(__CLASS__, 'inject_tracking_script'), 999);
        add_action('rest_api_init', array(__CLASS__, 'register_tracking_endpoint'));
    }
    
    /**
     * Register tracking endpoint
     */
    public static function register_tracking_endpoint() {
        register_rest_route('pfdef/v1', '/track-behavior', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'handle_tracking_data'),
            'permission_callback' => '__return_true' // Public endpoint
        ));
    }
    
    /**
     * Handle incoming tracking data
     */
    public static function handle_tracking_data($request) {
        $data = $request->get_json_params();
        
        if (!isset($data['behavioral'])) {
            return new WP_Error('missing_data', 'Behavioral data required', array('status' => 400));
        }
        
        $behavioral = $data['behavioral'];
        $score = self::calculate_behavior_score($behavioral);
        
        // If learning mode enabled, record this
        $learning_mode = get_option('pfdef_learning_mode');
        if ($learning_mode && $learning_mode['enabled']) {
            require_once PFDEF_PLUGIN_DIR . 'includes/class-smart-learning.php';
            $learning = new PromptFluid_Defense_Smart_Learning();
            $learning->record_learning(
                self::get_client_ip(),
                $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
                null,
                $behavioral,
                $score
            );
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'score' => $score
        ));
    }
    
    /**
     * Calculate behavior score from tracking data
     */
    private static function calculate_behavior_score($behavioral) {
        $score = 50; // Neutral baseline
        
        // Mouse movement analysis
        if (isset($behavioral['mouse_movements'])) {
            $movements = count($behavioral['mouse_movements']);
            if ($movements < 5) {
                $score -= 20;
            } elseif ($movements > 20) {
                $score += 15;
            }
        }
        
        // Keyboard activity
        if (isset($behavioral['keyboard_events']) && count($behavioral['keyboard_events']) > 0) {
            $score += 10;
        }
        
        // Scroll behavior
        if (isset($behavioral['scroll_events']) && count($behavioral['scroll_events']) > 0) {
            $score += 5;
        }
        
        // Time on page
        if (isset($behavioral['time_on_page'])) {
            $time = $behavioral['time_on_page'];
            if ($time < 1000) {
                $score -= 15;
            } elseif ($time > 3000) {
                $score += 10;
            }
        }
        
        return max(0, min(100, $score));
    }
    
    /**
     * Get client IP
     */
    private static function get_client_ip() {
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
     * Inject behavioral tracking JavaScript
     */
    public static function inject_tracking_script() {
        if (is_admin() || !get_option('pfdef_settings')['enabled']) {
            return;
        }
        
        $rest_url = esc_url(rest_url('pfdef/v1/track-behavior'));
        ?>
        <script id="pfdef-behavioral-tracking">
        (function() {
            const behavioral = {
                mouse_movements: [],
                keyboard_events: [],
                scroll_events: [],
                click_events: [],
                time_on_page: 0,
                page_visibility_changes: 0
            };

            const startTime = Date.now();

            // Mouse movement tracking (throttled)
            let mouseMoveTimeout;
            document.addEventListener('mousemove', function(e) {
                clearTimeout(mouseMoveTimeout);
                mouseMoveTimeout = setTimeout(() => {
                    behavioral.mouse_movements.push({
                        x: e.clientX,
                        y: e.clientY,
                        time: Date.now() - startTime
                    });
                    if (behavioral.mouse_movements.length > 100) {
                        behavioral.mouse_movements.shift();
                    }
                }, 50);
            });

            // Keyboard tracking
            document.addEventListener('keydown', function(e) {
                behavioral.keyboard_events.push({
                    key: e.key.length === 1 ? 'char' : e.key,
                    time: Date.now() - startTime
                });
                if (behavioral.keyboard_events.length > 50) {
                    behavioral.keyboard_events.shift();
                }
            });

            // Scroll tracking
            let scrollTimeout;
            window.addEventListener('scroll', function() {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    behavioral.scroll_events.push({
                        y: window.scrollY,
                        time: Date.now() - startTime
                    });
                    if (behavioral.scroll_events.length > 50) {
                        behavioral.scroll_events.shift();
                    }
                }, 100);
            });

            // Click tracking
            document.addEventListener('click', function(e) {
                behavioral.click_events.push({
                    x: e.clientX,
                    y: e.clientY,
                    time: Date.now() - startTime
                });
                if (behavioral.click_events.length > 50) {
                    behavioral.click_events.shift();
                }
            });

            // Visibility tracking
            document.addEventListener('visibilitychange', function() {
                behavioral.page_visibility_changes++;
            });

            // Send data before unload
            window.addEventListener('beforeunload', function() {
                behavioral.time_on_page = Date.now() - startTime;
                navigator.sendBeacon('<?php echo $rest_url; ?>', JSON.stringify({ behavioral: behavioral }));
            });
        })();
        </script>
        <?php
    }
}
