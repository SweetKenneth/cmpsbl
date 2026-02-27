# ENCODE — Code Generation Pipeline Node

## Purpose
ENCODE handles code generation, orchestration pipelines, error pattern detection, escalation telemetry, and sandbox execution coordination.

## Namespace
`encode.*`

## Command Examples
```
encode.generate <spec>    # Generate code from specification
encode.pipeline <input>   # Run code through generation pipeline
encode.errors             # Recent error patterns
encode.sandbox <code>     # Execute code in sandbox
encode.escalate <issue>   # Escalate code generation issue
```

## Response Shape
```typescript
interface EncodeResult {
  success: boolean;
  code: string;
  language: string;
  confidence: number;
  warnings: string[];
  sandboxResult?: SandboxExecution;
}
```

## Failure Modes
- **Generation failure**: Specification too ambiguous → clarification request
- **Sandbox timeout**: Execution exceeds time budget → killed with error report
- **Pattern loop**: Same error pattern detected repeatedly → escalation to CORTEX

## Governance Implications
- Generated code is validated before output (no arbitrary code emission)
- Sandbox execution is isolated — no access to substrate state or external resources
- Code generation requests are metered through ACCESS
