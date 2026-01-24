# CodeAgent v3 Roadmap

## User-Selected Features

### Autonomy Level
- [x] **PR-Style Review Queue**: Generate patches that queue for approval before applying
- [x] **Live Deployment Pipeline**: Auto-deploy to edge functions after validation passes

### Code Intelligence
- [x] **AST-Level Analysis**: Parse code into abstract syntax trees for precise modifications
- [x] **Type-Safe Refactoring**: Understand TypeScript types to prevent breaking changes
- [x] **Dependency Graph Visualization**: Visual map of component relationships and imports
- [x] **Test Coverage Integration**: Generate tests alongside code and track coverage

### Learning System
- [x] **Multi-Project Knowledge**: Learn patterns across all projects (Cascade, SimNap, etc.)
- [x] **Error Pattern Database**: Track and learn from every error to prevent recurrence
- [x] **Style Guide Enforcement**: Learn and enforce coding style automatically
- [x] **Performance Heuristics**: Learn what makes code fast and optimize accordingly

### UX & Collaboration
- [x] **Split-Diff Viewer**: Side-by-side view of before/after code changes
- [x] **Inline Code Annotations**: Explain what each code block does in natural language
- [x] **Voice Command Mode**: Speak requests instead of typing

---

## Implementation Phases

### Phase 1: Code Intelligence Foundation
1. AST Parser integration (TypeScript AST)
2. Type-safe modification engine
3. Dependency graph builder + visualization component
4. Test generation templates

### Phase 2: Learning Enhancements
1. Multi-project knowledge sync via brain_memories table
2. Error pattern tracking (brain_error_patterns table)
3. Style guide extraction from existing codebase
4. Performance metric collection and optimization

### Phase 3: Review & Deploy Pipeline
1. PR-style queue UI (similar to GitHub PRs)
2. Diff viewer component (split/unified modes)
3. Edge function auto-deploy after validation
4. Rollback safety nets

### Phase 4: Voice & UX
1. ElevenLabs STT integration (scribe_v2_realtime)
2. Voice command parser
3. Inline code annotation generator
4. Real-time transcript → command pipeline

---

## Architecture Notes

### AST Analysis
```typescript
interface ASTAnalysis {
  imports: ImportStatement[];
  exports: ExportStatement[];
  functions: FunctionDeclaration[];
  types: TypeDefinition[];
  dependencies: string[];
  cyclomaticComplexity: number;
}
```

### PR Queue Schema
```sql
CREATE TABLE codeagent_pr_queue (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  diff TEXT NOT NULL,
  files_changed TEXT[],
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, deployed
  created_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  deployed_at TIMESTAMPTZ,
  rollback_id TEXT
);
```

### Multi-Project Knowledge
- Share patterns via brain_memories with project_id tag
- Cross-project learning with confidence weighting
- Privacy controls per-project

---

## Dependencies
- TypeScript AST: `@babel/parser` or `typescript` compiler API
- Voice: ElevenLabs `scribe_v2_realtime` + `@elevenlabs/react`
- Diff: `diff` or `diff2html` packages
- Testing: Vitest integration

---

*Last updated: 2026-01-24*
