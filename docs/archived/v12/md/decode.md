# DECODE — Epistemic Interpreter Node

## Purpose
DECODE is the natural language interpretation layer. It handles intent resolution, personality-adapted responses, context window optimization, ambiguity resolution, and epistemic discipline enforcement.

## Namespace
`decode.*`

## Command Examples
```
decode.interpret <input>   # Interpret natural language input
decode.intent <input>      # Extract intent without execution
decode.personality         # Current personality profile
decode.context             # Context window state
decode.voices              # Available voice profiles
```

## Response Shape
```typescript
interface DecodeInterpretation {
  success: boolean;
  intent: DetectedIntent;
  personality: PersonalityProfile;
  resolvedCommand?: string;
  confidence: number;
  ambiguities?: string[];
}
```

## Failure Modes
- **Ambiguity deadlock**: Multiple equally likely intents → disambiguation prompt returned
- **Context overflow**: Context window exceeds capacity → oldest context evicted
- **Personality conflict**: Requested personality incompatible with governance guardrails → default fallback

## Governance Implications
- All DECODE outputs pass through epistemic validation (provenance tagging)
- Voice guardrails enforce tone and claim boundaries
- DECODE responses that make unsupported claims are rejected by the response policy engine
