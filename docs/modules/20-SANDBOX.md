<div align="center">

# Module 20 — SANDBOX

### Safe Code Execution, Isolation, and Snapshots

Layer 6 — Infrastructure

v10.5.1 ARCHITECT Epoch

</div>

---

## Purpose

SANDBOX provides isolated execution environments for untrusted or dynamically generated code. When the substrate needs to run user-provided scripts, evaluate generated code, or test evolution proposals, SANDBOX ensures that execution cannot affect the rest of the system. Now with enforced resource limits and state snapshot/restore capabilities.

---

## Capabilities

| Capability | Description | Tier |
|-----------|-------------|------|
| Isolated Execution | Run code in a sandboxed environment with no system access | Free |
| Timeout Enforcement | Kill executions that exceed configured time limits | Free |
| Memory Limits | Restrict memory consumption per execution | Free |
| Resource Limit Enforcement (v10.5.1) | CPU, memory, execution time, and concurrency caps with hard enforcement | Free |
| Output Capture | Capture stdout, stderr, and return values | Pro |
| Resource Metering | Track CPU, memory, and I/O consumption per execution | Pro |
| Snapshot/Restore (v10.5.1) | Save and restore sandbox state (max 5 snapshots per sandbox) | Pro |
| Multi-Language Support | Execute JavaScript, TypeScript, and Python | Enterprise |
| Persistent Sandboxes | Sandboxes that maintain state across multiple executions | Enterprise |
| Network Isolation | Allow or deny network access per sandbox | CMPSBL |

---

## Resource Limit Enforcement (v10.5.1)

SANDBOX now enforces hard resource limits on every execution:

| Resource | Default | Maximum | Enforcement |
|----------|---------|---------|-------------|
| CPU time | 5s | 30s | Kill on exceed |
| Memory | 128 MB | 512 MB | OOM kill |
| Execution time | 30s | 5 min | Timeout kill |
| Concurrency | 5 | 10 | Queue overflow rejection |
| Output size | 1 MB | 10 MB | Truncation |

When a resource limit is hit, the execution is terminated immediately and the event is logged to AUDIT with the specific limit that was exceeded.

---

## Snapshot/Restore System (v10.5.1)

Sandbox state can be captured and restored for debugging and iterative testing:

```
Execute → Snapshot → Modify → Execute → Fail → Restore → Retry
```

| Feature | Detail |
|---------|--------|
| Max snapshots per sandbox | 5 |
| Snapshot includes | Variables, function definitions, execution context |
| Snapshot size limit | 10 MB |
| Auto-cleanup | Oldest snapshot removed when limit reached |

---

## Execution Model

```
Code Submission
       │
       ▼
┌────────────────┐
│  Validation     │  Syntax check, size limits, banned patterns
└───────┬────────┘
        │
        ▼
┌────────────────┐
│  Resource       │  Apply CPU, memory, time, concurrency limits (v10.5.1)
│  Allocation     │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│  Sandbox        │  Create isolated environment
│  Provisioning   │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│  Execution      │  Run code with no access to host system
│                 │  Capture output and errors
└───────┬────────┘
        │
        ├─ Completed → Return results, optionally snapshot state
        │
        ├─ Timeout → Kill process, return timeout error
        │
        └─ Resource limit → Kill process, log to AUDIT, return limit error
```

---

## Use Cases Within the Substrate

| Use Case | Description |
|----------|-------------|
| Evolution Testing | MODERNIZER tests proposed code changes before applying |
| Data Transformation | INTEGRATION runs user-defined data mapping scripts |
| Agency Task Execution | Agency agents execute generated code for research tasks |
| Dream Experiments | DREAM tests hypotheses generated during creative synthesis |
| Custom Logic | Users provide custom processing logic via the API |
| CLM Topic Study | CLM Engine runs sandboxed analysis during learning cycles |

---

## Integration with Other Modules

| Module | Integration |
|--------|------------|
| MODERNIZER | Tests evolution proposals in sandbox before applying |
| INTEGRATION | Runs data transformation scripts |
| DREAM | Executes experimental code from dream cycles |
| ECONOMY | Tracks compute costs for sandbox executions |
| AUDIT | Logs all sandbox executions with input, output, resource usage, and limit violations |
| DEFENSE | Scans submitted code for malicious patterns |
| BRAIN | Receives execution safety heuristics via Brain Transfer |
| RIPPLE | Emits `sandbox.execution_started`, `sandbox.execution_complete`, `sandbox.resource_limit_hit` |

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `sandbox_executions` | Execution history with input, output, and resource metrics |
| `sandbox_configs` | Per-use-case sandbox configuration profiles |
| `sandbox_snapshots` | Saved sandbox state snapshots (v10.5.1) |

---

<div align="center">

CMPSBL OS Substrate v10.5.1 — ARCHITECT Epoch

Kenneth E Sweet Jr · PromptFluid

ORCID: XXXX-XXXX-XXXX-XXXX · DOI: 10.5281/zenodo.XXXXXXX

© 2025–2026 PromptFluid. All rights reserved.

</div>
