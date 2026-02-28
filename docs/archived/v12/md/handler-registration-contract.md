# Handler Registration Contract

All substrate nodes register their command handlers during the boot sequence through the Engine Bus.

## Registration API

```typescript
engineBus.register(
  namespace: string,      // Module namespace (e.g., "memory")
  action: string,         // Action name (e.g., "store")
  handler: CommandHandler, // Handler function
  options?: HandlerOptions
): void
```

## Handler Signature

```typescript
type CommandHandler = (
  args: Record<string, unknown>,
  context: ExecutionContext
) => Promise<CommandResult> | CommandResult;

interface ExecutionContext {
  traceId: string;
  userId?: string;
  sessionId?: string;
  source: 'terminal' | 'registry' | 'internal';
  governanceApproved: boolean;
}
```

## Handler Options

```typescript
interface HandlerOptions {
  /** Human-readable description for help/discovery */
  description?: string;

  /** Whether this handler requires governance evaluation */
  governed?: boolean; // default: true

  /** Timeout in milliseconds */
  timeout?: number; // default: 30000

  /** Whether this handler is idempotent */
  idempotent?: boolean; // default: false

  /** Required entitlement scopes */
  requiredScopes?: string[];
}
```

## Registration Rules

1. Handlers may only be registered under the module's own namespace
2. Duplicate registration replaces the existing handler (with audit log entry)
3. Registration is idempotent — re-registering with identical handler is a no-op
4. Handlers must return within the configured timeout or be killed
5. Registration order follows the boot sequence dependency graph

## Boot Sequence Registration Order

```
1. CORE         (establishes registry)
2. SYSTEM       (lifecycle utilities)
3. BRAIN        (cognition)
4. MEMORY       (storage)
5. DREAM        (synthesis)
6. RIPPLE       (event bus)
7. ACCESS       (entitlements)
8. IDENTITY     (auth)
9. RELAY        (webhooks)
10. AUDIT       (ledger)
11. Execution nodes (dependency-ordered)
12. Fields      (EVOLUTION → IMMUNITY → INTENT)
13. GOVERNANCE  (reads all handlers for policy)
14. DEFENSE     (wraps all outbound paths)
```
