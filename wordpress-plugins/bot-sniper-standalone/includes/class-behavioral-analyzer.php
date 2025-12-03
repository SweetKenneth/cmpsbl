<?php
/**
 * Behavioral Pattern Analyzer
 * 
 * Advanced analysis of user behavioral patterns to distinguish humans from bots
 *
 * @package BotSniper
 */

namespace BotSniper;

if (!defined('ABSPATH')) exit;

class BehavioralAnalyzer {
    
    /**
     * Analyze behavioral data
     */
    public function analyze($behavioral_data) {
        $result = array(
            'is_human' => true,
            'confidence' => 0.5,
            'risk_score' => 50,
            'anomalies' => array()
        );
        
        if (empty($behavioral_data)) {
            return $result;
        }
        
        $score = 50;
        
        // Mouse movement analysis
        if (isset($behavioral_data['mouse_movements'])) {
            $movements = count($behavioral_data['mouse_movements']);
            
            if ($movements < 5) {
                $score -= 20;
                $result['anomalies'][] = 'insufficient_mouse_activity';
            } elseif ($movements > 20) {
                $score += 15;
                
                // Check for natural movement
                if ($this->has_natural_movement($behavioral_data['mouse_movements'])) {
                    $score += 10;
                } else {
                    $result['anomalies'][] = 'unnatural_mouse_pattern';
                }
            }
        }
        
        // Keyboard activity
        if (isset($behavioral_data['keyboard_events'])) {
            $keystrokes = count($behavioral_data['keyboard_events']);
            if ($keystrokes > 0) {
                $score += 10;
                
                if ($this->has_natural_typing($behavioral_data['keyboard_events'])) {
                    $score += 5;
                }
            }
        }
        
        // Time on page
        if (isset($behavioral_data['time_on_page'])) {
            $time = $behavioral_data['time_on_page'];
            
            if ($time < 1000) {
                $score -= 15;
                $result['anomalies'][] = 'suspiciously_fast';
            } elseif ($time > 3000) {
                $score += 10;
            }
        }
        
        $result['risk_score'] = max(0, min(100, $score));
        $result['is_human'] = $score >= 50;
        $result['confidence'] = $this->calculate_confidence($behavioral_data);
        
        return $result;
    }
    
    /**
     * Check for natural mouse movement
     */
    private function has_natural_movement($movements) {
        if (count($movements) < 10) {
            return false;
        }
        
        $direction_changes = 0;
        
        for ($i = 2; $i < count($movements); $i++) {
            $dx = $movements[$i]['x'] - $movements[$i - 1]['x'];
            $dy = $movements[$i]['y'] - $movements[$i - 1]['y'];
            $prev_dx = $movements[$i - 1]['x'] - $movements[$i - 2]['x'];
            $prev_dy = $movements[$i - 1]['y'] - $movements[$i - 2]['y'];
            
            if (($dx * $prev_dx < 0) || ($dy * $prev_dy < 0)) {
                $direction_changes++;
            }
        }
        
        return $direction_changes > 3;
    }
    
    /**
     * Check for natural typing rhythm
     */
    private function has_natural_typing($keystrokes) {
        if (count($keystrokes) < 5) {
            return false;
        }
        
        $intervals = array();
        for ($i = 1; $i < count($keystrokes); $i++) {
            $intervals[] = $keystrokes[$i]['time'] - $keystrokes[$i - 1]['time'];
        }
        
        $avg = array_sum($intervals) / count($intervals);
        $variance = 0;
        
        foreach ($intervals as $interval) {
            $variance += pow($interval - $avg, 2);
        }
        
        $variance = $variance / count($intervals);
        
        return ($variance > 100 && $avg > 50 && $avg < 500);
    }
    
    /**
     * Calculate confidence level
     */
    private function calculate_confidence($behavioral_data) {
        $confidence = 0;
        
        if (isset($behavioral_data['mouse_movements']) && count($behavioral_data['mouse_movements']) > 10) {
            $confidence += 0.3;
        }
        if (isset($behavioral_data['keyboard_events']) && count($behavioral_data['keyboard_events']) > 5) {
            $confidence += 0.2;
        }
        if (isset($behavioral_data['scroll_events']) && count($behavioral_data['scroll_events']) > 0) {
            $confidence += 0.2;
        }
        if (isset($behavioral_data['click_events']) && count($behavioral_data['click_events']) > 0) {
            $confidence += 0.15;
        }
        if (isset($behavioral_data['time_on_page']) && $behavioral_data['time_on_page'] > 1000) {
            $confidence += 0.15;
        }
        
        return $confidence;
    }
}
