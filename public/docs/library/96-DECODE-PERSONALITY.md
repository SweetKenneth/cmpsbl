# CMPSBL OS Substrate — DECODE Personality Profiles

**Version 7.1.0 | Interpretive Lens Specification**

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Document ID** | CMPSBL-LIB-096 |
| **Module** | DECODE |
| **Subsystem** | Personality |
| **Version** | v7.1.0 |

---

```
┌─────────────────────────────────────────────────────────────────┐
│                    CMPSBL OS SUBSTRATE                          │
├─────────────────────────────────────────────────────────────────┤
│  Created By:        Kenneth E Sweet Jr                          │
│  Organization:      PromptFluid®                                │
├─────────────────────────────────────────────────────────────────┤
│  For licensing or acquisition inquiries:                        │
│  Email: Dev@CMPSBL.com | Phone: (760) FLUID-AI           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Overview

The DECODE Personality subsystem provides **interpretive filters** that adjust how user input is understood. Personality profiles are cognitive lenses—they affect interpretation, not execution.

### Critical Constraint

Personality profiles **DO NOT** affect:
- Execution of commands
- Permission levels
- Memory writes (never persisted to brain.hot)
- Response authority

Personality profiles **DO** affect:
- Intent weighting
- Ambiguity tolerance
- Confidence calibration
- Escalation thresholds

---

## 2. Personality Profiles

| Profile | Description |
|---------|-------------|
| **neutral** | Balanced interpretation, no bias |
| **technical** | Precise, detail-oriented, favors structured queries |
| **frustrated** | User experiencing difficulty, prioritizes support |
| **exploratory** | Curious, learning-oriented, favors discovery |
| **adversarial** | Challenging, testing boundaries, strict interpretation |
| **playful** | Lighthearted, creative, more interpretive latitude |
| **urgent** | Time-sensitive, action-oriented, fast resolution |

---

## 3. Terminal Commands

| Command | Description |
|---------|-------------|
| `decode.personality.list` | List all available profiles |
| `decode.personality.get` | Get current personality state |
| `decode.personality.set <profile>` | Set specific profile |
| `decode.personality.auto` | Enable context-driven inference |
| `decode.personality.lock` | Prevent auto-switching |
| `decode.personality.unlock` | Allow auto-switching |
| `decode.personality.detect <text>` | Detect personality from text |
| `decode.personality.interpret <text>` | Interpret with personality lens |
| `decode.personality.reset` | Reset to neutral |

---

## 4. Auto-Detection

When auto-detection is enabled (default), the system analyzes:

- **Language markers**: Technical terms, frustration indicators, curiosity signals
- **Pacing**: Short urgent commands vs. exploratory questions
- **Repetition**: Repeated phrases indicate frustration
- **Sentiment**: Positive/negative emotional tone

Auto-switching requires **confidence ≥ 60%**. Falls back to neutral on ambiguity.

---

## 5. Interpretation Output

The `interpret` command enriches output with:

```typescript
{
  primaryIntent: string;      // Main detected intent
  secondaryIntent: string;    // Alternate interpretation
  confidence: number;         // 0-1 confidence score
  detectedPersonality: string;// Which profile was detected
  ambiguityFlags: string[];   // competing_intents, short_input, etc.
  shouldEscalate: boolean;    // Whether human review is recommended
}
```

---

## 6. Safety Rails

1. **Session-scoped**: Personality resets after session unless locked
2. **Never persisted**: Not stored in brain.hot or any memory tier
3. **Transient context**: Stored only in decode session state
4. **Rollback**: `decode.personality.reset` restores neutral instantly

---

## 7. Validation Guarantees

Same command phrased differently → Same intent, different confidence:

```
Input (angry): "Why the hell doesn't this work?!"
→ Intent: feedback, Personality: frustrated, Confidence: 0.7

Input (calm): "Could you explain why this isn't working?"
→ Intent: query, Personality: exploratory, Confidence: 0.85
```

Adversarial tone does **NOT** escalate permissions:
- Personality affects interpretation lens only
- Execution authority unchanged regardless of detected tone

---

## 8. Usage Example

```typescript
import { personalityEngine } from '@/lib/substrate/decode';

// Set technical profile for developer context
personalityEngine.set('technical');

// Interpret with current profile
const result = personalityEngine.interpret("Why is the API returning 500?");
// → primaryIntent: 'query', confidence: 0.8, detectedPersonality: 'technical'

// Enable auto-detection for general users
personalityEngine.enableAuto();

// Detect from input
const detection = personalityEngine.detect("This is broken again!");
// → profile: 'frustrated', confidence: 0.75, applied: true
```

---

## 9. React Hook

```typescript
import { useDecodePersonality } from '@/lib/substrate/decode';

function MyComponent() {
  const { 
    state,           // Current personality state
    activeProfile,   // Current profile config
    profiles,        // All available profiles
    setProfile,      // Set specific profile
    detect,          // Detect from text
    interpret,       // Interpret with lens
    isLocked,        // Lock status
  } = useDecodePersonality();

  return <div>Current: {state.active}</div>;
}
```

---

*CMPSBL OS Substrate v7.1.0 — Human Compatibility Era*
*© 2025-2026 PromptFluid®. All rights reserved.*
