# Dev Task Registry

## Purpose

The dev task registry tracks development work items within the Clockless substrate. It is not a project management tool — it is an internal registry for tracking substrate-level development tasks.

## Task Structure

```typescript
interface DevTask {
  id: string;
  title: string;           // ≤6 words, verb-led
  description: string;     // One sentence
  status: 'todo' | 'in_progress' | 'done';
  priority: 'critical' | 'high' | 'medium' | 'low';
  module?: string;         // Target substrate module
  notes: string[];         // Discovery and decision notes
  created: string;
  updated: string;
}
```

## Task Conventions

1. **Titles** are verb-led and ≤6 words (e.g., "Add handler parity check")
2. **Descriptions** are one sentence explaining the work
3. At most one task is `in_progress` at a time
4. Notes capture discoveries and decisions as they occur
5. Tasks are atomic — one task = one deliverable

## Task Categories

| Category | Description |
|----------|-------------|
| **Node Work** | Changes to specific substrate nodes |
| **Governance** | Policy, veto, compliance changes |
| **Infrastructure** | Engine Bus, RIPPLE, telemetry |
| **Capability** | New or modified capability packs |
| **Diligence** | Test battery, verification harness |
| **Documentation** | Spec updates, reference docs |

## Terminal Commands

```
dev.tasks              # List all tasks
dev.task.create <title> # Create a new task
dev.task.status <id>    # Update task status
dev.task.note <id>      # Add note to task
```
