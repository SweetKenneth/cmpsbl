# EVOLUTION & Shadow Training — CMPSBL v11.1

## EVOLUTION Lifecycle

The EVOLUTION overlay (formerly labeled "Modernizer") operates as one of the five protective mesh overlays. It continuously improves system behavior through autonomous scanning, proposal generation, and governed execution.

### Lifecycle Phases

1. **Scan**: EVOLUTION inspects all Matrix Nodes for optimization opportunities
2. **Propose**: Improvement proposals are generated with risk assessment
3. **Govern**: Proposals pass through GOVERNANCE and INTENT overlays for approval
4. **Execute**: Approved changes are applied in shadow mode first
5. **Verify**: Post-execution validation confirms improvement

## Shadow Training

The IMMUNITY overlay provides shadow training capabilities where:
- New behaviors are tested against real system gaps in shadow mode
- Shadow executions do not affect production state
- Results are compared against baseline to measure improvement
- Successful shadow runs promote to production automatically

## Observability

The VISION execution node provides unified observability across all EVOLUTION and shadow operations:
- Health attribution for evolution-driven changes
- Audit trails for all proposal lifecycles
- Real-time telemetry during shadow execution

## Access

EVOLUTION and shadow mode are fully accessible through:
- Dashboard: Infrastructure → EVOLUTION Lifecycle / Shadow Mode
- Terminal: `modernizer.*`, `evolution.*` commands (legacy aliases preserved)
- API: Via substrate invoke with `module: 'evolution'` or `module: 'modernizer'`

---

© 2025–2026 PromptFluid®. All rights reserved.
