# Per-Language Governance Attachment — Progress & Next Steps

**Principle (non-negotiable):** Layer 2 governance attaches at framework boundaries via real middleware. We never fabricate shadow symbols of user code. When no framework is detected, we emit nothing — the kernel ships in the artifact and the developer wires `cmpsbl_chain` at their own boundary.

Status legend: ✅ done · 🟡 in progress · ⬜ queued

---

## 1. Swift — ✅ DONE

- **Frameworks supported:** Vapor
- **Detector signals (≥2 required):** `import Vapor`, `RouteCollection`, `req: Request`, `app.middleware.use`, `app.routes.get/post/...`
- **Emission:** `CmpsblTraceMiddleware: AsyncMiddleware` + `CmpsblConfigure(_ app:)` helper
- **Registration hint:** one line in `configure(_:)` — `try CmpsblConfigure(app)`
- **Harness:** `CmpsblTraceMiddleware|CmpsblConfigure` recognized as active call-site
- **Smoke test:** Vapor source → emits middleware; plain Swift → emits nothing ✅
- **Next:** wait for the next framework on user request (e.g. Hummingbird) — do not preemptively add.

---

## 2. TypeScript — ⬜ NEXT

- **Frameworks to support (priority order):** Express, Fastify, Hono
- **Detector signals to require:**
  - Express: `import express` / `require('express')` + `app.use(...)` + `app.get/post/...`
  - Fastify: `import Fastify` + `fastify.register(...)` + `fastify.get/post/...`
  - Hono: `import { Hono }` + `app.get/post/...` + `c.req` / `c.json`
- **Emission shape:**
  - Express: `function cmpsblTrace(req, res, next) { CmpsblIsolatedExecutor.execute(...) }`
  - Fastify: a `fastify-plugin` exporting `cmpsblTrace` with `addHook('onRequest', ...)`
  - Hono: `app.use('*', cmpsblTrace())`
- **Registration hint (Express):** `app.use(cmpsblTrace);` directly above the first route.
- **Harness update:** add `cmpsblTrace` symbol to `hasActiveCallSite` regex.
- **Note:** TS already wraps top-level callables in-process; this middleware is *additive* HTTP-boundary governance.

---

## 3. JavaScript — ⬜

Same emitters as TypeScript minus types. Likely a single shared template family with a "ts vs js" toggle. Defer until TS is in.

---

## 4. Python — ⬜

- **Frameworks:** FastAPI, Flask, Django
- **Detector signals:**
  - FastAPI: `from fastapi import FastAPI` + `@app.get/post/...` + `app = FastAPI(...)`
  - Flask: `from flask import Flask` + `app = Flask(__name__)` + `@app.route(...)`
  - Django: `from django` + `urlpatterns =` + `path(...)`
- **Emission shape:**
  - FastAPI: ASGI middleware class with `async def __call__`
  - Flask: `@app.before_request` decorated function paired with `@app.after_request`
  - Django: middleware class implementing `__call__(self, request)`
- **Registration hint:**
  - FastAPI: `app.add_middleware(CmpsblTraceMiddleware)`
  - Flask: `cmpsbl_install(app)`
  - Django: append `'cmpsbl.middleware.CmpsblTraceMiddleware'` to `MIDDLEWARE`
- **Harness update:** add `CmpsblTraceMiddleware|cmpsbl_install` to active-call-site regex.

---

## 5. Go — ⬜

- **Frameworks:** Gin, Echo, plain `net/http`
- **Detector signals:**
  - Gin: `import "github.com/gin-gonic/gin"` + `gin.Default()` + `r.GET/POST(...)`
  - Echo: `import "github.com/labstack/echo/v4"` + `echo.New()` + `e.GET/POST(...)`
  - net/http: `http.HandleFunc` + `http.ListenAndServe`
- **Emission shape:**
  - Gin: `func CmpsblTrace() gin.HandlerFunc { return func(c *gin.Context) { CmpsblExecute(...) ; c.Next() } }`
  - Echo: `func CmpsblTrace(next echo.HandlerFunc) echo.HandlerFunc`
  - net/http: `func CmpsblTrace(next http.Handler) http.Handler`
- **Registration hint (Gin):** `r.Use(CmpsblTrace())`
- **Harness update:** add `CmpsblTrace` (capital C) to recognized symbols (already partially matches).

---

## 6. Rust — ⬜

- **Frameworks:** Axum, Actix-web
- **Detector signals:**
  - Axum: `use axum::` + `Router::new()` + `.route(...)`
  - Actix-web: `use actix_web::` + `HttpServer::new(...)` + `App::new()`
- **Emission shape:**
  - Axum: a `tower::Layer` implementation `CmpsblTraceLayer`
  - Actix-web: a `Transform`-implementing struct with `wrap(...)`
- **Registration hint (Axum):** `let app = Router::new().route(...).layer(CmpsblTraceLayer);`

---

## 7. Java — ⬜

- **Framework:** Spring (Servlet `Filter` or `HandlerInterceptor`)
- **Detector signals:** `import org.springframework` + `@RestController` / `@Controller` + `@RequestMapping`
- **Emission shape:** a `@Component` Filter with `doFilter` calling `CmpsblIsolatedExecutor.execute(...)`
- **Registration hint:** auto-registered by `@Component`; no developer action needed.

---

## 8. Kotlin — ⬜

- **Frameworks:** Ktor, Spring
- **Ktor signals:** `import io.ktor` + `embeddedServer(...)` + `routing { get(...) }`
- **Emission shape:** `Plugin` definition installable with `install(CmpsblTrace)`
- **Spring path:** identical to Java emission, Kotlin syntax.

---

## 9. C# — ⬜

- **Framework:** ASP.NET Core (`IMiddleware`)
- **Detector signals:** `using Microsoft.AspNetCore` + `WebApplication.CreateBuilder` + `app.MapGet/MapPost(...)`
- **Emission shape:** `public sealed class CmpsblTraceMiddleware : IMiddleware { ... }`
- **Registration hint:** `app.UseMiddleware<CmpsblTraceMiddleware>();`

---

## Per-language "perfection" checklist

For each language, ship when ALL are true:

1. ☐ Conservative detector (≥2 idiomatic signals)
2. ☐ Real middleware emission at the framework boundary
3. ☐ Two-line developer registration hint
4. ☐ Zero user-source mutation
5. ☐ Harness `hasActiveCallSite` recognizes the new symbols
6. ☐ Smoke test: framework source → emits, plain source → emits nothing
7. ☐ `USER-GUIDE.md` registration section in the export

## Removed (drift, do not reintroduce)

- ❌ Generic per-symbol "Rebound" stubs — deleted 2026-04-21. They fabricated shadow symbols of user code, which is mutation by impersonation. Never re-add per-symbol stub generation in any language.

## Working files

- `src/lib/export/framework-middleware.ts` — detectors + emitters
- `src/lib/export/polyglot-templates.ts` — `NATIVE_LANGS` assembler hook (bottom of file)
- `src/lib/ascension-v2/pre-export-harness.ts` — `hasActiveCallSite` regex
- `mem://architecture/export/governance-attachment-progress.md` — short tracker (always in context when relevant)
