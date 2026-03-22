/**
 * SubstrateVoice - Unique toast notification system that feels like the substrate is speaking
 * Features floating icons, animated waveforms, and audio feedback
 */

import { toast } from 'sonner';
import { useCallback } from 'react';
import { useSoundEffects, SoundType } from '@/components/agency/features/SoundEffects';

// ============================================================================
// SUBSTRATE VOICE TYPES
// ============================================================================
type VoiceType = 'info' | 'success' | 'warning' | 'error' | 'system' | 'cortex';

interface SubstrateVoiceOptions {
  title: string;
  message?: string;
  type?: VoiceType;
  duration?: number;
  module?: string;
}

// ============================================================================
// VOICE CONFIGURATIONS
// ============================================================================
const VOICE_CONFIGS: Record<VoiceType, { icon: string; gradient: string; sound: SoundType }> = {
  info: {
    icon: '◉',
    gradient: 'from-neon-cyan to-neon-blue',
    sound: 'notification',
  },
  success: {
    icon: '◈',
    gradient: 'from-neon-green to-neon-green',
    sound: 'task_complete',
  },
  warning: {
    icon: '◇',
    gradient: 'from-neon-amber to-orange-600',
    sound: 'notification',
  },
  error: {
    icon: '◆',
    gradient: 'from-destructive to-neon-magenta',
    sound: 'task_error',
  },
  system: {
    icon: '⬡',
    gradient: 'from-neon-magenta to-neon-purple',
    sound: 'level_up',
  },
  cortex: {
    icon: '⬢',
    gradient: 'from-neon-purple to-primary',
    sound: 'achievement',
  },
};

// ============================================================================
// SUBSTRATE VOICE TOAST COMPONENT
// ============================================================================
function SubstrateVoiceToast({ 
  title, 
  message, 
  type = 'info', 
  module 
}: SubstrateVoiceOptions) {
  const config = VOICE_CONFIGS[type];
  
  return (
    <div className="flex items-start gap-3 min-w-[300px] max-w-[420px]">
      {/* Animated Voice Icon */}
      <div className={`
        relative flex-shrink-0 w-12 h-12 rounded-xl 
        bg-gradient-to-br ${config.gradient}
        flex items-center justify-center
        shadow-lg shadow-${type === 'success' ? 'emerald' : type === 'error' ? 'red' : 'cyan'}-500/30
      `}>
        {/* Pulsing ring */}
        <div className={`
          absolute inset-0 rounded-xl bg-gradient-to-br ${config.gradient}
          animate-ping opacity-30
        `} />
        
        {/* Voice waveform bars */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5 h-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-0.5 bg-white/80 rounded-full"
              style={{
                animation: `voiceBar 0.5s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
                height: '100%',
              }}
            />
          ))}
        </div>
        
        {/* Icon */}
        <span className="text-white text-xl font-bold relative z-10">
          {config.icon}
        </span>
      </div>
      
      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {module && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
              {module}
            </span>
          )}
          <span className="text-[10px] font-mono text-muted-foreground/60">
            SUBSTRATE
          </span>
        </div>
        
        <h4 className="font-semibold text-foreground text-sm leading-tight">
          {title}
        </h4>
        
        {message && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {message}
          </p>
        )}
        
        {/* Animated data stream */}
        <div className="mt-2 h-1 bg-muted/30 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${config.gradient} rounded-full`}
            style={{
              animation: 'dataStream 2s ease-out forwards',
              width: '0%',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUBSTRATE VOICE HOOK
// ============================================================================
export function useSubstrateVoice() {
  const { play, enabled } = useSoundEffects();
  
  const speak = useCallback((options: SubstrateVoiceOptions) => {
    const type = options.type || 'info';
    const config = VOICE_CONFIGS[type];
    
    // Play sound if enabled
    if (enabled) {
      play(config.sound);
    }
    
    // Show toast with custom component
    toast.custom(
      (t) => <SubstrateVoiceToast {...options} />,
      {
        duration: options.duration || 6000,
        className: 'substrate-voice-toast',
      }
    );
  }, [play, enabled]);
  
  // Convenience methods
  const info = useCallback((title: string, message?: string, module?: string) => {
    speak({ title, message, type: 'info', module });
  }, [speak]);
  
  const success = useCallback((title: string, message?: string, module?: string) => {
    speak({ title, message, type: 'success', module });
  }, [speak]);
  
  const warning = useCallback((title: string, message?: string, module?: string) => {
    speak({ title, message, type: 'warning', module });
  }, [speak]);
  
  const error = useCallback((title: string, message?: string, module?: string) => {
    speak({ title, message, type: 'error', module });
  }, [speak]);
  
  const system = useCallback((title: string, message?: string, module?: string) => {
    speak({ title, message, type: 'system', module, duration: 8000 });
  }, [speak]);
  
  const cortex = useCallback((title: string, message?: string) => {
    speak({ title, message, type: 'cortex', module: 'CORTEX', duration: 10000 });
  }, [speak]);
  
  return {
    speak,
    info,
    success,
    warning,
    error,
    system,
    cortex,
  };
}

// ============================================================================
// CSS KEYFRAMES (add to index.css)
// ============================================================================
export const substrateVoiceStyles = `
@keyframes voiceBar {
  0%, 100% { transform: scaleY(0.3); }
  50% { transform: scaleY(1); }
}

@keyframes dataStream {
  0% { width: 0%; }
  100% { width: 100%; }
}

.substrate-voice-toast {
  background: linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card) / 0.9) 100%) !important;
  border: 1px solid hsl(var(--border) / 0.5) !important;
  border-radius: 1rem !important;
  box-shadow: 
    0 10px 40px -10px hsl(var(--primary) / 0.3),
    0 0 0 1px hsl(var(--primary) / 0.1) !important;
  padding: 1rem !important;
  backdrop-filter: blur(12px);
}
`;
