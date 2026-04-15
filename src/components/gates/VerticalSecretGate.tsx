/**
 * VerticalSecretGate — Dual-layer access control for hidden vertical substrates
 * 
 * Layer 1: Secret URL parameter (e.g. ?1952=cmpsbl)
 * Layer 2: 6-digit PIN via PinGate
 * 
 * Both must pass before the child content renders.
 * Also injects noindex meta to prevent search engine discovery.
 */

import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PinGate } from './PinGate';

/** The secret URL param key and expected value */
const GATE_PARAM_KEY = '1952';
const GATE_PARAM_VALUE = 'cmpsbl';

/** PIN for all vertical substrate access — Kenneth's birth year reversed */
const VERTICAL_PIN = '259100';

/** Session key so the URL param isn't needed on every navigation */
const SESSION_KEY = 'v_gate_passed';

interface VerticalSecretGateProps {
  children: React.ReactNode;
  /** Override the default PIN if needed per-vertical */
  pin?: string;
  /** Unique storage key suffix for this vertical */
  verticalId?: string;
}

function hasUrlGateParam(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get(GATE_PARAM_KEY) === GATE_PARAM_VALUE;
  } catch {
    return false;
  }
}

function isSessionUnlocked(verticalId: string): boolean {
  return sessionStorage.getItem(`${SESSION_KEY}_${verticalId}`) === '1';
}

function markSessionUnlocked(verticalId: string): void {
  sessionStorage.setItem(`${SESSION_KEY}_${verticalId}`, '1');
}

export function VerticalSecretGate({ 
  children, 
  pin = VERTICAL_PIN, 
  verticalId = 'global' 
}: VerticalSecretGateProps) {
  const [searchParams] = useSearchParams();

  // Check if URL param gate is passed (or was passed in this session)
  const urlParamPassed = hasUrlGateParam() || isSessionUnlocked(verticalId);

  // If URL param present for first time, persist to session
  if (hasUrlGateParam() && !isSessionUnlocked(verticalId)) {
    markSessionUnlocked(verticalId);
  }

  // Layer 1: URL param gate — show nothing if not passed
  if (!urlParamPassed) {
    return null; // Renders blank — no hint that content exists
  }

  // Layer 2: PIN gate wraps the content
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <PinGate
        pin={pin}
        storageKey={`vertical_pin_${verticalId}`}
        debugBypassKey="evo_debug_bypass"
      >
        {children}
      </PinGate>
    </>
  );
}
