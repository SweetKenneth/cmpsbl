# @cmpsbl/sdk — Changelog

> SDK — Authenticated substrate client
> © CMPSBL® · PromptFluid™

## [2.3.0] — 2026-04-14

### Added
- **Retry with exponential backoff** — transient 429/5xx errors auto-retry (configurable `RetryConfig`)
- **Request timeout** — configurable per-call timeout with `AbortController` (default 30s)
- **Request deduplication** — identical in-flight calls collapse to a single request
- **X-SDK-Version header** — every request includes SDK version for telemetry
- **X-Request-Id header** — unique request ID for distributed tracing
- **`engine.stream()`** — SSE streaming for real-time engine responses
- **`engine.batch()`** — parallel multi-call execution with per-entry error handling
- **`engine.healthCheck()`** — substrate latency and status probe (no quota cost)
- **`engine.whoami()`** — authenticated user profile, tier, and quota inspection
- **`engine.inflightCount`** — observe active deduplicated requests
- Standardized LICENSE (Apache-2.0) with patent notices

### Changed
- `EngineCallOptions` extended with `retries`, `timeoutMs`, and `stream` fields
- Engine constructor accepts optional `RetryConfig`

## [2.2.0] — 2026-04-13

### Added
- CMPSBL® branded ASCII headers
- Full system introspection API
- Middleware chain with before/after events
- SDKResponse wrapper with toJSON() and toMarkdown()

---

<p align="center">
  <strong>CMPSBL®</strong> · Governed Cognitive Infrastructure<br>
  <a href="https://cmpsbl.com">cmpsbl.com</a> · <code>npm i @cmpsbl/cli</code>
</p>
