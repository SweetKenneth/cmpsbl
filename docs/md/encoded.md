# ENCODED — Code Agent System

## Purpose
ENCODED is the intelligent code agent that combines ENCODE's generation capabilities with contextual understanding, learning, and governed autonomous coding behavior.

## Namespace
`encoded.*`

## Command Examples
```
encoded.discuss <topic>   # Discussion mode (no code changes)
encoded.implement <spec>  # Implement a feature
encoded.review <code>     # Code review
encoded.refactor <file>   # Suggest refactoring
encoded.learn <outcome>   # Feed learning signal from outcome
```

## Response Shape
```typescript
interface EncodedResult {
  success: boolean;
  mode: 'discussion' | 'implementation' | 'review';
  output: string;
  files?: FileChange[];
  learningGain?: number;
}
```

## Failure Modes
- **Context loss**: File context too large → windowed context with priority ranking
- **Skill gap**: Requested operation outside learned skill set → escalation
- **Policy violation**: Generated code violates governance policy → rejection with explanation

## Governance Implications
- ENCODED operates under strict policy constraints (anchor, guard, skills)
- All code changes are subject to governance review
- Learning signals are validated before integration
