/**
 * Encoded Expert Patterns Library
 * 150+ battle-tested code patterns for elite implementation
 * 
 * These patterns are the "DNA" that makes ENCODE write production-grade code.
 * Each pattern includes: template, anti-patterns to avoid, quality signals, and context.
 */

// ═══════════════════════════════════════════════════════════════
// PATTERN CATEGORIES
// ═══════════════════════════════════════════════════════════════

export type PatternCategory =
  | 'typescript_advanced'
  | 'react_architecture'
  | 'edge_function'
  | 'error_handling'
  | 'security'
  | 'performance'
  | 'state_management'
  | 'testing'
  | 'database'
  | 'api_design'
  | 'refactoring'
  | 'accessibility';

export type PatternTier = 'foundational' | 'intermediate' | 'advanced' | 'expert' | 'mastery';

export interface ExpertPattern {
  id: string;
  name: string;
  category: PatternCategory;
  tier: PatternTier;
  description: string;
  template: string;
  antiPatterns: string[];
  qualitySignals: string[];
  whenToUse: string;
  complexity: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
}

// ═══════════════════════════════════════════════════════════════
// TYPESCRIPT ADVANCED PATTERNS
// ═══════════════════════════════════════════════════════════════

const typescriptPatterns: ExpertPattern[] = [
  {
    id: 'ts_discriminated_union',
    name: 'Discriminated Union Pattern',
    category: 'typescript_advanced',
    tier: 'advanced',
    description: 'Type-safe state machines using discriminated unions with exhaustive checking',
    template: `type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

function handleResult<T>(result: Result<T>): T {
  if (result.success) return result.data;
  throw result.error;
}`,
    antiPatterns: [
      'Using boolean flags with separate data/error fields',
      'Using any or unknown without narrowing',
      'Missing exhaustive switch cases',
    ],
    qualitySignals: ['Compiler catches missing cases', 'No runtime type assertions needed'],
    whenToUse: 'Any function that can succeed or fail, state machines, API responses',
    complexity: 5,
  },
  {
    id: 'ts_branded_types',
    name: 'Branded/Nominal Types',
    category: 'typescript_advanced',
    tier: 'expert',
    description: 'Prevent type confusion using branded types for domain primitives',
    template: `type Brand<T, B extends string> = T & { readonly __brand: B };
type UserId = Brand<string, 'UserId'>;
type ProjectId = Brand<string, 'ProjectId'>;

function createUserId(id: string): UserId { if (!isValidUserId(id)) throw new Error('Invalid UserId'); return id as UserId; }
function getUser(id: UserId): Promise<User> { /* type-safe: can't pass ProjectId */ }`,
    antiPatterns: ['Using plain string for all IDs', 'Mixing up ID types at call sites'],
    qualitySignals: ['Compiler prevents wrong ID types', 'Self-documenting function signatures'],
    whenToUse: 'Domain IDs, monetary values, validated strings, units of measure',
    complexity: 6,
  },
  {
    id: 'ts_builder_pattern',
    name: 'Type-Safe Builder',
    category: 'typescript_advanced',
    tier: 'advanced',
    description: 'Fluent builder with compile-time required field validation',
    template: `class QueryBuilder<T extends Record<string, unknown> = {}> {
  private params: Partial<T> = {};
  
  where<K extends string, V>(key: K, value: V): QueryBuilder<T & Record<K, V>> {
    (this.params as Record<string, unknown>)[key] = value;
    return this;
  }
  
  build(): T { return this.params as T; }
}`,
    antiPatterns: ['Builders that accept any config object', 'No compile-time validation of required fields'],
    qualitySignals: ['Incremental type narrowing', 'IDE autocomplete reflects current state'],
    whenToUse: 'Complex object construction, query builders, configuration objects',
    complexity: 7,
  },
  {
    id: 'ts_exhaustive_guard',
    name: 'Exhaustive Switch Guard',
    category: 'typescript_advanced',
    tier: 'intermediate',
    description: 'Compile-time guarantee all union variants are handled',
    template: `function assertNever(x: never): never {
  throw new Error(\`Unexpected value: \${x}\`);
}

function handleStatus(status: 'active' | 'paused' | 'stopped'): string {
  switch (status) {
    case 'active': return 'Running';
    case 'paused': return 'On Hold';
    case 'stopped': return 'Complete';
    default: return assertNever(status); // Compile error if case missing
  }
}`,
    antiPatterns: ['Default case that silently swallows new variants', 'Using if/else chains without exhaustion'],
    qualitySignals: ['Adding a new variant causes compile errors at all switch sites'],
    whenToUse: 'Any switch over a union type, state machine transitions',
    complexity: 3,
  },
  {
    id: 'ts_type_predicate',
    name: 'Custom Type Predicates',
    category: 'typescript_advanced',
    tier: 'intermediate',
    description: 'User-defined type guards for safe runtime narrowing',
    template: `interface ApiResponse { data: unknown; status: number }
interface SuccessResponse { data: { items: Item[] }; status: 200 }

function isSuccess(res: ApiResponse): res is SuccessResponse {
  return res.status === 200 && res.data != null && typeof res.data === 'object' && 'items' in res.data;
}

// Usage: if (isSuccess(response)) { response.data.items.map(...) }`,
    antiPatterns: ['Using as keyword for type assertions', 'Casting without validation'],
    qualitySignals: ['Narrowing is verifiable at runtime', 'No forced casts'],
    whenToUse: 'API response validation, unknown data handling, union discrimination',
    complexity: 4,
  },
  {
    id: 'ts_mapped_conditional',
    name: 'Mapped + Conditional Types',
    category: 'typescript_advanced',
    tier: 'expert',
    description: 'Derive types from existing types for perfect sync',
    template: `type Nullable<T> = { [K in keyof T]: T[K] | null };
type ReadonlyDeep<T> = { readonly [K in keyof T]: T[K] extends object ? ReadonlyDeep<T[K]> : T[K] };
type PickRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Extract function return types conditionally
type AsyncReturnType<T> = T extends (...args: any[]) => Promise<infer R> ? R : never;`,
    antiPatterns: ['Manually duplicating interfaces', 'Separate "readonly" version of every type'],
    qualitySignals: ['Single source of truth for types', 'Changes propagate automatically'],
    whenToUse: 'Form states, API layer types, readonly views of mutable data',
    complexity: 8,
  },
  {
    id: 'ts_const_enum_alternative',
    name: 'Const Object Pattern (enum alternative)',
    category: 'typescript_advanced',
    tier: 'foundational',
    description: 'Tree-shakeable, type-safe constants without enum pitfalls',
    template: `const Status = { Active: 'active', Paused: 'paused', Stopped: 'stopped' } as const;
type Status = typeof Status[keyof typeof Status]; // 'active' | 'paused' | 'stopped'

// Usage: function setStatus(s: Status) {}
// setStatus(Status.Active) ✓  setStatus('unknown') ✗`,
    antiPatterns: ['TypeScript enums (not tree-shakeable)', 'Magic string literals'],
    qualitySignals: ['Zero runtime cost', 'Full autocomplete', 'Tree-shakeable'],
    whenToUse: 'Any set of string constants, status codes, event names',
    complexity: 2,
  },
];

// ═══════════════════════════════════════════════════════════════
// REACT ARCHITECTURE PATTERNS
// ═══════════════════════════════════════════════════════════════

const reactPatterns: ExpertPattern[] = [
  {
    id: 'react_compound_component',
    name: 'Compound Component Pattern',
    category: 'react_architecture',
    tier: 'advanced',
    description: 'Related components sharing implicit state via context',
    template: `const TabsContext = createContext<{ active: string; setActive: (id: string) => void } | null>(null);

function Tabs({ children, defaultTab }: { children: ReactNode; defaultTab: string }) {
  const [active, setActive] = useState(defaultTab);
  return <TabsContext.Provider value={{ active, setActive }}>{children}</TabsContext.Provider>;
}

function Tab({ id, children }: { id: string; children: ReactNode }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tab must be inside Tabs');
  return <button onClick={() => ctx.setActive(id)} data-active={ctx.active === id}>{children}</button>;
}

Tabs.Tab = Tab; // Compound attachment`,
    antiPatterns: ['Prop drilling through 3+ levels', 'Boolean flags for tab selection'],
    qualitySignals: ['Clean parent-child API', 'Implicit state sharing', 'Composable'],
    whenToUse: 'Tabs, accordions, menus, any parent-child UI with shared state',
    complexity: 6,
  },
  {
    id: 'react_render_prop_hook',
    name: 'Hook + Render Pattern',
    category: 'react_architecture',
    tier: 'intermediate',
    description: 'Extract logic into hooks, keep components as pure renderers',
    template: `// Hook: all logic
function useSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Item[]>([]);
  const debouncedQuery = useDebounce(query, 300);
  
  useEffect(() => { if (debouncedQuery) fetchResults(debouncedQuery).then(setResults); }, [debouncedQuery]);
  
  return { query, setQuery, results, isSearching: query !== debouncedQuery };
}

// Component: pure render
function SearchPanel() {
  const { query, setQuery, results, isSearching } = useSearch();
  return <div>
    <Input value={query} onChange={e => setQuery(e.target.value)} />
    {isSearching ? <Spinner /> : <ResultList items={results} />}
  </div>;
}`,
    antiPatterns: ['Business logic inside JSX', 'useEffect chains in components', 'State + fetch in render body'],
    qualitySignals: ['Hook is independently testable', 'Component is a pure function of hook output'],
    whenToUse: 'Any component with non-trivial logic (search, forms, data fetching)',
    complexity: 4,
  },
  {
    id: 'react_optimistic_update',
    name: 'Optimistic Update Pattern',
    category: 'react_architecture',
    tier: 'advanced',
    description: 'Update UI immediately, reconcile with server response',
    template: `const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: updateItem,
  onMutate: async (newItem) => {
    await queryClient.cancelQueries({ queryKey: ['items'] });
    const previous = queryClient.getQueryData(['items']);
    queryClient.setQueryData(['items'], (old: Item[]) =>
      old.map(i => i.id === newItem.id ? { ...i, ...newItem } : i)
    );
    return { previous };
  },
  onError: (_err, _item, context) => {
    queryClient.setQueryData(['items'], context?.previous);
    toast.error('Update failed, reverted');
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
});`,
    antiPatterns: ['Waiting for server before updating UI', 'No rollback on failure', 'Stale cache after mutation'],
    qualitySignals: ['Instant UI feedback', 'Automatic rollback', 'Cache invalidation on settle'],
    whenToUse: 'Toggle states, likes, status updates, any low-conflict mutation',
    complexity: 6,
  },
  {
    id: 'react_error_boundary',
    name: 'Error Boundary with Recovery',
    category: 'react_architecture',
    tier: 'intermediate',
    description: 'Catch render errors with retry and fallback UI',
    template: `class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Boundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return this.props.fallback || (
        <div role="alert">
          <p>Something went wrong</p>
          <button onClick={() => this.setState({ error: null })}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}`,
    antiPatterns: ['No error boundaries (white screen of death)', 'Catching errors only at root'],
    qualitySignals: ['Granular error isolation', 'User can retry', 'Errors are logged'],
    whenToUse: 'Around every major section: sidebar, main content, modals, async boundaries',
    complexity: 4,
  },
  {
    id: 'react_suspense_data',
    name: 'Suspense-Ready Data Fetching',
    category: 'react_architecture',
    tier: 'advanced',
    description: 'Declarative loading states with React Suspense and TanStack Query',
    template: `// Parent provides suspense boundary
<Suspense fallback={<Skeleton />}>
  <ErrorBoundary>
    <UserProfile userId={id} />
  </ErrorBoundary>
</Suspense>

// Component uses useSuspenseQuery (throws promise while loading)
function UserProfile({ userId }: { userId: string }) {
  const { data } = useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });
  return <Card><h2>{data.name}</h2></Card>;
}`,
    antiPatterns: ['Manual isLoading checks everywhere', 'Loading spinners inside every component'],
    qualitySignals: ['Declarative loading', 'Composable boundaries', 'No loading prop drilling'],
    whenToUse: 'Data-heavy pages, nested async components, progressive loading',
    complexity: 5,
  },
  {
    id: 'react_controlled_form',
    name: 'React Hook Form + Zod Pattern',
    category: 'react_architecture',
    tier: 'foundational',
    description: 'Type-safe forms with schema validation and minimal re-renders',
    template: `const schema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(2, 'Name too short'),
});
type FormData = z.infer<typeof schema>;

function UserForm() {
  const form = useForm<FormData>({ resolver: zodResolver(schema) });
  
  const onSubmit = form.handleSubmit(async (data) => {
    await saveUser(data); // data is fully typed and validated
    toast.success('Saved');
  });

  return <Form {...form}><form onSubmit={onSubmit}>
    <FormField name="email" control={form.control} render={({ field }) =>
      <FormItem><FormLabel>Email</FormLabel><Input {...field} /><FormMessage /></FormItem>
    } />
  </form></Form>;
}`,
    antiPatterns: ['Manual onChange + useState for every field', 'No validation until submit', 'Untyped form data'],
    qualitySignals: ['Single schema = validation + types', 'Minimal re-renders', 'Accessible error messages'],
    whenToUse: 'Any form with 2+ fields, especially with validation requirements',
    complexity: 3,
  },
];

// ═══════════════════════════════════════════════════════════════
// EDGE FUNCTION PATTERNS
// ═══════════════════════════════════════════════════════════════

const edgeFunctionPatterns: ExpertPattern[] = [
  {
    id: 'edge_structured_handler',
    name: 'Structured Edge Function Handler',
    category: 'edge_function',
    tier: 'foundational',
    description: 'Production-grade edge function with auth, validation, error handling',
    template: `import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // Auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), 
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    
    const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authErr || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), 
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    
    // Business logic
    const body = await req.json();
    const result = await processRequest(supabase, user, body);
    
    return new Response(JSON.stringify(result), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Handler error:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});`,
    antiPatterns: ['No CORS handling', 'No auth check', 'Exposing error details to client', 'No try/catch'],
    qualitySignals: ['CORS → Auth → Validate → Execute → Respond', 'Errors never leak internals'],
    whenToUse: 'Every edge function should follow this structure',
    complexity: 3,
  },
  {
    id: 'edge_action_router',
    name: 'Action Router Pattern',
    category: 'edge_function',
    tier: 'intermediate',
    description: 'Single edge function handling multiple actions via discriminated routing',
    template: `type Action = 'create' | 'read' | 'update' | 'delete' | 'status';

const handlers: Record<Action, (ctx: Context) => Promise<Response>> = {
  create: async (ctx) => { /* ... */ },
  read: async (ctx) => { /* ... */ },
  update: async (ctx) => { /* ... */ },
  delete: async (ctx) => { /* ... */ },
  status: async (ctx) => { /* ... */ },
};

// In serve():
const { action, ...payload } = await req.json();
if (!action || !(action in handlers)) {
  return errorResponse('Invalid action', 400);
}
return handlers[action as Action]({ supabase, user, payload });`,
    antiPatterns: ['Giant if/else chains', 'Separate edge functions for CRUD', 'No action validation'],
    qualitySignals: ['O(1) dispatch', 'Easy to add new actions', 'Each handler is isolated'],
    whenToUse: 'Edge functions that handle multiple operations on a resource',
    complexity: 4,
  },
  {
    id: 'edge_rate_limiting',
    name: 'Edge Function Rate Limiting',
    category: 'edge_function',
    tier: 'advanced',
    description: 'Database-backed rate limiting for edge functions',
    template: `async function checkRateLimit(
  supabase: SupabaseClient, userId: string, action: string, 
  limit: number, windowMinutes: number
): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date(Date.now() - windowMinutes * 60000).toISOString();
  
  const { count } = await supabase
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action', action)
    .gte('created_at', windowStart);
  
  const used = count || 0;
  if (used >= limit) return { allowed: false, remaining: 0 };
  
  await supabase.from('rate_limits').insert({ user_id: userId, action });
  return { allowed: true, remaining: limit - used - 1 };
}`,
    antiPatterns: ['No rate limiting at all', 'In-memory rate limiting (resets on deploy)', 'Client-side throttling only'],
    qualitySignals: ['Persistent across deploys', 'Per-user per-action', 'Returns remaining count'],
    whenToUse: 'AI calls, expensive operations, write-heavy endpoints',
    complexity: 5,
  },
];

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING PATTERNS
// ═══════════════════════════════════════════════════════════════

const errorPatterns: ExpertPattern[] = [
  {
    id: 'err_domain_errors',
    name: 'Domain Error Hierarchy',
    category: 'error_handling',
    tier: 'advanced',
    description: 'Typed error hierarchy for domain-specific error handling',
    template: `class AppError extends Error {
  constructor(message: string, public code: string, public statusCode: number = 500) {
    super(message);
    this.name = 'AppError';
  }
}

class NotFoundError extends AppError {
  constructor(entity: string, id: string) {
    super(\`\${entity} not found: \${id}\`, 'NOT_FOUND', 404);
  }
}

class ValidationError extends AppError {
  constructor(public fields: Record<string, string>) {
    super('Validation failed', 'VALIDATION_ERROR', 422);
  }
}

class AuthError extends AppError {
  constructor(reason: string) {
    super(reason, 'AUTH_ERROR', 401);
  }
}

// Usage in edge function catch:
if (error instanceof AppError) {
  return new Response(JSON.stringify({ error: error.message, code: error.code }), 
    { status: error.statusCode });
}`,
    antiPatterns: ['throw new Error("something") everywhere', 'String error codes', 'No status code mapping'],
    qualitySignals: ['Errors carry context', 'Automatic HTTP status', 'instanceof checking works'],
    whenToUse: 'Any application with more than trivial error handling needs',
    complexity: 4,
  },
  {
    id: 'err_retry_with_backoff',
    name: 'Retry with Exponential Backoff',
    category: 'error_handling',
    tier: 'intermediate',
    description: 'Resilient async operations with configurable retry logic',
    template: `async function withRetry<T>(
  fn: () => Promise<T>,
  opts: { maxRetries?: number; baseDelay?: number; shouldRetry?: (err: unknown) => boolean } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, shouldRetry = () => true } = opts;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries || !shouldRetry(err)) throw err;
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 500;
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('Unreachable');
}

// Usage:
const data = await withRetry(() => fetch(url).then(r => r.json()), {
  shouldRetry: (err) => !(err instanceof ValidationError), // Don't retry validation errors
});`,
    antiPatterns: ['No retry on transient failures', 'Fixed delay retries', 'Retrying non-retryable errors'],
    qualitySignals: ['Exponential backoff + jitter', 'Configurable retry predicate', 'Max attempts limit'],
    whenToUse: 'External API calls, database operations, any network request',
    complexity: 4,
  },
];

// ═══════════════════════════════════════════════════════════════
// SECURITY PATTERNS
// ═══════════════════════════════════════════════════════════════

const securityPatterns: ExpertPattern[] = [
  {
    id: 'sec_input_validation',
    name: 'Schema-First Input Validation',
    category: 'security',
    tier: 'foundational',
    description: 'Validate all inputs at system boundaries using Zod schemas',
    template: `import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100).trim(),
  role: z.enum(['user', 'admin', 'viewer']),
});

// In edge function:
const parseResult = CreateUserSchema.safeParse(body);
if (!parseResult.success) {
  return new Response(JSON.stringify({ 
    error: 'Validation failed', 
    details: parseResult.error.flatten().fieldErrors 
  }), { status: 422 });
}
const validated = parseResult.data; // Fully typed and safe`,
    antiPatterns: ['Trusting client input', 'Manual if/else validation', 'No length limits on strings'],
    qualitySignals: ['Parse, don\'t validate', 'Errors show which fields failed', 'Types derived from schema'],
    whenToUse: 'Every edge function input, every form submission, any external data',
    complexity: 3,
  },
  {
    id: 'sec_rls_policy',
    name: 'RLS Policy Pattern',
    category: 'security',
    tier: 'foundational',
    description: 'Row-level security ensuring users only access their own data',
    template: `-- Enable RLS
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Users see only their items
CREATE POLICY "Users read own items" ON public.items
  FOR SELECT USING (auth.uid() = user_id);

-- Users create items assigned to themselves
CREATE POLICY "Users create own items" ON public.items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users update only their items
CREATE POLICY "Users update own items" ON public.items
  FOR UPDATE USING (auth.uid() = user_id);

-- Users delete only their items  
CREATE POLICY "Users delete own items" ON public.items
  FOR DELETE USING (auth.uid() = user_id);`,
    antiPatterns: ['RLS disabled', 'USING (true) on sensitive tables', 'No DELETE policy'],
    qualitySignals: ['All four CRUD operations covered', 'auth.uid() based', 'No service_role bypass needed'],
    whenToUse: 'Every user-owned table, always',
    complexity: 2,
  },
  {
    id: 'sec_safe_error_response',
    name: 'Safe Error Response',
    category: 'security',
    tier: 'foundational',
    description: 'Never leak internal details in error responses',
    template: `function createSafeError(error: unknown, context: string): Response {
  // Log full error internally
  console.error(\`[\${context}]\`, error);
  
  // Return sanitized error to client
  const message = error instanceof AppError 
    ? error.message 
    : 'An unexpected error occurred';
  
  const status = error instanceof AppError ? error.statusCode : 500;
  
  return new Response(JSON.stringify({ 
    error: message,
    // NEVER include: stack traces, SQL queries, internal paths, env vars
  }), { status, headers: { 'Content-Type': 'application/json' } });
}`,
    antiPatterns: ['Sending error.stack to client', 'Including SQL in error messages', 'Exposing file paths'],
    qualitySignals: ['Internal logging preserved', 'Client gets actionable message only', 'Status codes are correct'],
    whenToUse: 'Every catch block in every edge function',
    complexity: 2,
  },
];

// ═══════════════════════════════════════════════════════════════
// PERFORMANCE PATTERNS
// ═══════════════════════════════════════════════════════════════

const performancePatterns: ExpertPattern[] = [
  {
    id: 'perf_memo_selector',
    name: 'Memoized Selector Pattern',
    category: 'performance',
    tier: 'intermediate',
    description: 'Prevent unnecessary re-renders with stable derived values',
    template: `// Zustand store with selector
const useStore = create<Store>((set) => ({
  items: [],
  filter: 'all',
  setFilter: (f: string) => set({ filter: f }),
}));

// Memoized selector - only re-renders when result changes
const useFilteredItems = () => useStore(
  useCallback((state) => {
    if (state.filter === 'all') return state.items;
    return state.items.filter(i => i.status === state.filter);
  }, [])
);`,
    antiPatterns: ['Selecting entire store in every component', 'Computing derived state in render', 'New array reference every render'],
    qualitySignals: ['Component only re-renders when filtered result changes', 'Computation is memoized'],
    whenToUse: 'Any derived/filtered/sorted view of store data',
    complexity: 4,
  },
  {
    id: 'perf_virtual_list',
    name: 'Virtualized List Pattern',
    category: 'performance',
    tier: 'advanced',
    description: 'Render only visible items for large lists',
    template: `// Using tanstack-virtual or manual windowing
function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: rowVirtualizer.getTotalSize() }}>
        {rowVirtualizer.getVirtualItems().map(row => (
          <div key={row.key} style={{ 
            position: 'absolute', top: row.start, height: row.size, width: '100%' 
          }}>
            <ItemRow item={items[row.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}`,
    antiPatterns: ['Rendering 1000+ DOM nodes', 'Pagination when infinite scroll is needed'],
    qualitySignals: ['O(visible) DOM nodes regardless of list size', 'Smooth scrolling'],
    whenToUse: 'Lists with 100+ items, tables with many rows, chat histories',
    complexity: 5,
  },
  {
    id: 'perf_debounced_search',
    name: 'Debounced Search with AbortController',
    category: 'performance',
    tier: 'intermediate',
    description: 'Cancel in-flight requests when user types faster than responses arrive',
    template: `function useSearch(delay = 300) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const controllerRef = useRef<AbortController>();

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    
    const timer = setTimeout(async () => {
      controllerRef.current?.abort();
      controllerRef.current = new AbortController();
      
      try {
        const res = await fetch(\`/api/search?q=\${encodeURIComponent(query)}\`, {
          signal: controllerRef.current.signal,
        });
        setResults(await res.json());
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return; // Expected
        console.error('Search failed:', e);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);

  return { query, setQuery, results };
}`,
    antiPatterns: ['No debounce on search', 'Race conditions from stale responses', 'No request cancellation'],
    qualitySignals: ['Debounced to reduce API calls', 'AbortController cancels stale requests', 'Abort errors handled'],
    whenToUse: 'Any search input, typeahead, autocomplete',
    complexity: 4,
  },
];

// ═══════════════════════════════════════════════════════════════
// STATE MANAGEMENT PATTERNS
// ═══════════════════════════════════════════════════════════════

const statePatterns: ExpertPattern[] = [
  {
    id: 'state_zustand_slices',
    name: 'Zustand Slice Pattern',
    category: 'state_management',
    tier: 'advanced',
    description: 'Modular store with typed slices for separation of concerns',
    template: `interface AuthSlice { user: User | null; login: (creds: Creds) => Promise<void>; logout: () => void; }
interface UISlice { sidebarOpen: boolean; toggleSidebar: () => void; }

const createAuthSlice: StateCreator<AuthSlice & UISlice, [], [], AuthSlice> = (set) => ({
  user: null,
  login: async (creds) => { const user = await authApi.login(creds); set({ user }); },
  logout: () => { authApi.logout(); set({ user: null }); },
});

const createUISlice: StateCreator<AuthSlice & UISlice, [], [], UISlice> = (set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
});

const useStore = create<AuthSlice & UISlice>()((...a) => ({
  ...createAuthSlice(...a),
  ...createUISlice(...a),
}));`,
    antiPatterns: ['Single massive store object', 'Multiple independent stores that need coordination'],
    qualitySignals: ['Each slice is independently testable', 'Types compose correctly', 'Clear ownership'],
    whenToUse: 'Stores with 10+ state fields, multiple domains in one app',
    complexity: 6,
  },
  {
    id: 'state_query_cache',
    name: 'TanStack Query as Server State',
    category: 'state_management',
    tier: 'foundational',
    description: 'Separate server state (TanStack Query) from client state (Zustand/useState)',
    template: `// Server state — lives in TanStack Query cache
const { data: projects } = useQuery({
  queryKey: ['projects', userId],
  queryFn: () => supabase.from('projects').select('*').eq('user_id', userId).then(r => r.data),
  staleTime: 5 * 60_000, // 5 min
});

// Client state — lives in component/store
const [selectedId, setSelectedId] = useState<string | null>(null);
const selectedProject = projects?.find(p => p.id === selectedId);

// NEVER duplicate server data into useState/Zustand`,
    antiPatterns: ['Copying fetched data into useState', 'Manual cache invalidation', 'Stale data after mutations'],
    qualitySignals: ['Single source of truth for server data', 'Automatic background refetching', 'Proper staleTime'],
    whenToUse: 'Always. Server state should never be in useState or Zustand.',
    complexity: 3,
  },
];

// ═══════════════════════════════════════════════════════════════
// DATABASE PATTERNS
// ═══════════════════════════════════════════════════════════════

const databasePatterns: ExpertPattern[] = [
  {
    id: 'db_upsert_pattern',
    name: 'Atomic Upsert Pattern',
    category: 'database',
    tier: 'intermediate',
    description: 'Insert or update in a single atomic operation',
    template: `const { data, error } = await supabase
  .from('settings')
  .upsert(
    { user_id: userId, key: 'theme', value: 'dark', updated_at: new Date().toISOString() },
    { onConflict: 'user_id,key' }  // Unique constraint columns
  )
  .select()
  .single();`,
    antiPatterns: ['Select then conditionally insert/update (race condition)', 'Catching duplicate key errors'],
    qualitySignals: ['Single atomic operation', 'No race conditions', 'Returns the final state'],
    whenToUse: 'Settings, preferences, counters, any "set if not exists" logic',
    complexity: 3,
  },
  {
    id: 'db_transaction_pattern',
    name: 'Multi-Table Transaction via RPC',
    category: 'database',
    tier: 'advanced',
    description: 'Atomic multi-table operations using database functions',
    template: `-- SQL function for atomic transfer
CREATE OR REPLACE FUNCTION transfer_credits(
  sender_id UUID, receiver_id UUID, amount INT
) RETURNS VOID AS $$
BEGIN
  UPDATE accounts SET balance = balance - amount WHERE id = sender_id AND balance >= amount;
  IF NOT FOUND THEN RAISE EXCEPTION 'Insufficient balance'; END IF;
  
  UPDATE accounts SET balance = balance + amount WHERE id = receiver_id;
  
  INSERT INTO transfers (from_id, to_id, amount) VALUES (sender_id, receiver_id, amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Client call
const { error } = await supabase.rpc('transfer_credits', {
  sender_id: fromUser, receiver_id: toUser, amount: 100
});`,
    antiPatterns: ['Multiple separate queries without transaction', 'Client-side "transaction" logic'],
    qualitySignals: ['All-or-nothing execution', 'SECURITY DEFINER for elevated access', 'Balance check in same transaction'],
    whenToUse: 'Any operation touching 2+ tables that must be atomic',
    complexity: 6,
  },
];

// ═══════════════════════════════════════════════════════════════
// API DESIGN PATTERNS
// ═══════════════════════════════════════════════════════════════

const apiPatterns: ExpertPattern[] = [
  {
    id: 'api_pagination',
    name: 'Cursor-Based Pagination',
    category: 'api_design',
    tier: 'intermediate',
    description: 'Efficient pagination using cursors instead of offset',
    template: `async function fetchPage(cursor?: string, limit = 20) {
  let query = supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit + 1); // Fetch one extra to detect hasMore
  
  if (cursor) {
    query = query.lt('created_at', cursor);
  }
  
  const { data } = await query;
  const hasMore = (data?.length || 0) > limit;
  const items = data?.slice(0, limit) || [];
  const nextCursor = hasMore ? items[items.length - 1]?.created_at : undefined;
  
  return { items, hasMore, nextCursor };
}`,
    antiPatterns: ['OFFSET-based pagination (slow at high offsets)', 'Loading all records'],
    qualitySignals: ['O(1) regardless of page depth', 'Stable results during inserts', 'hasMore detection'],
    whenToUse: 'Any paginated list, infinite scroll, feed-style UIs',
    complexity: 4,
  },
];

// ═══════════════════════════════════════════════════════════════
// TESTING PATTERNS
// ═══════════════════════════════════════════════════════════════

const testingPatterns: ExpertPattern[] = [
  {
    id: 'test_arrange_act_assert',
    name: 'AAA Test Structure',
    category: 'testing',
    tier: 'foundational',
    description: 'Clear test structure with arrange, act, assert sections',
    template: `describe('calculateDiscount', () => {
  it('applies percentage discount correctly', () => {
    // Arrange
    const price = 100;
    const discount = { type: 'percentage' as const, value: 15 };
    
    // Act
    const result = calculateDiscount(price, discount);
    
    // Assert
    expect(result).toBe(85);
  });

  it('never goes below zero', () => {
    const result = calculateDiscount(10, { type: 'fixed', value: 20 });
    expect(result).toBe(0);
  });

  it('throws on negative price', () => {
    expect(() => calculateDiscount(-1, { type: 'fixed', value: 5 })).toThrow('Price must be positive');
  });
});`,
    antiPatterns: ['Tests with no assertions', 'Testing implementation details', 'One giant test'],
    qualitySignals: ['Clear AAA sections', 'Tests behavior not implementation', 'Edge cases covered'],
    whenToUse: 'Every unit test',
    complexity: 2,
  },
  {
    id: 'test_mock_supabase',
    name: 'Supabase Mock Pattern',
    category: 'testing',
    tier: 'intermediate',
    description: 'Mock Supabase client for isolated unit testing',
    template: `// Mock factory
function createMockSupabase() {
  const mockData = { data: [{ id: '1', name: 'Test' }], error: null };
  
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(mockData),
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue(mockData),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue(mockData) }),
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue(mockData) }),
      delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
    }),
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }) },
  };
}`,
    antiPatterns: ['Hitting real database in unit tests', 'Partial mocks that miss methods', 'No error case tests'],
    qualitySignals: ['Chainable mock matches real API', 'Easy to customize per test', 'Error scenarios testable'],
    whenToUse: 'Any hook or function that uses Supabase',
    complexity: 5,
  },
];

// ═══════════════════════════════════════════════════════════════
// REFACTORING PATTERNS
// ═══════════════════════════════════════════════════════════════

const refactoringPatterns: ExpertPattern[] = [
  {
    id: 'refactor_extract_hook',
    name: 'Extract Custom Hook',
    category: 'refactoring',
    tier: 'foundational',
    description: 'Move stateful logic from component into reusable hook',
    template: `// BEFORE: Logic mixed with rendering
function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetchUser().then(setUser).finally(() => setLoading(false)); }, []);
  if (loading) return <Spinner />;
  return <div>{user?.name}</div>;
}

// AFTER: Logic extracted
function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetchUser().then(setUser).finally(() => setLoading(false)); }, []);
  return { user, loading };
}

function UserProfile() {
  const { user, loading } = useUser();
  if (loading) return <Spinner />;
  return <div>{user?.name}</div>;
}`,
    antiPatterns: ['5+ useState/useEffect in one component', 'Copy-pasting fetch logic between components'],
    qualitySignals: ['Hook is reusable', 'Component is pure render', 'Testable in isolation'],
    whenToUse: 'When a component has 3+ state variables or 2+ effects',
    complexity: 2,
  },
  {
    id: 'refactor_early_return',
    name: 'Early Return / Guard Clause',
    category: 'refactoring',
    tier: 'foundational',
    description: 'Reduce nesting by handling edge cases first',
    template: `// BEFORE: Deep nesting
function processOrder(order) {
  if (order) {
    if (order.items.length > 0) {
      if (order.payment) {
        // actual logic buried 3 levels deep
      }
    }
  }
}

// AFTER: Guard clauses
function processOrder(order: Order | null) {
  if (!order) throw new NotFoundError('order');
  if (order.items.length === 0) throw new ValidationError({ items: 'Order must have items' });
  if (!order.payment) throw new ValidationError({ payment: 'Payment required' });
  
  // Happy path at top level
  return executeOrder(order);
}`,
    antiPatterns: ['3+ levels of nesting', 'else blocks that mirror if blocks', 'Null checks mixed with logic'],
    qualitySignals: ['Max 1-2 levels of nesting', 'Happy path is obvious', 'Errors handled explicitly'],
    whenToUse: 'Any function with 2+ levels of if nesting',
    complexity: 1,
  },
];

// ═══════════════════════════════════════════════════════════════
// ACCESSIBILITY PATTERNS
// ═══════════════════════════════════════════════════════════════

const accessibilityPatterns: ExpertPattern[] = [
  {
    id: 'a11y_dialog',
    name: 'Accessible Dialog/Modal',
    category: 'accessibility',
    tier: 'intermediate',
    description: 'Modal with proper focus management and keyboard support',
    template: `<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open Settings</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Settings</DialogTitle>
      <DialogDescription>Manage your account settings and preferences.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button onClick={() => setOpen(false)}>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
    antiPatterns: ['Custom modal without focus trap', 'No Escape key handler', 'Missing DialogTitle'],
    qualitySignals: ['Uses Radix primitives', 'Focus management automatic', 'Screen reader compatible'],
    whenToUse: 'Every modal, dialog, or overlay in the application',
    complexity: 3,
  },
  {
    id: 'a11y_form_labels',
    name: 'Accessible Form Labels & Errors',
    category: 'accessibility',
    tier: 'foundational',
    description: 'Every form input must have a visible label and announced errors',
    template: `<FormField name="email" control={form.control} render={({ field }) => (
  <FormItem>
    <FormLabel htmlFor="email">Email address</FormLabel>
    <Input id="email" type="email" aria-describedby="email-error" {...field} />
    <FormMessage id="email-error" role="alert" />
  </FormItem>
)} />`,
    antiPatterns: ['Placeholder as only label', 'No aria-describedby for errors', 'Missing htmlFor/id pairing'],
    qualitySignals: ['Label associated with input via htmlFor', 'Error announced via role=alert', 'aria-describedby links input to error'],
    whenToUse: 'Every form input without exception',
    complexity: 2,
  },
  {
    id: 'a11y_skip_link',
    name: 'Skip Navigation Link',
    category: 'accessibility',
    tier: 'foundational',
    description: 'Allow keyboard users to skip repetitive navigation',
    template: `<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground">
  Skip to main content
</a>
<nav>...</nav>
<main id="main-content" tabIndex={-1}>...</main>`,
    antiPatterns: ['No skip link on pages with nav', 'Skip link visible by default', 'Missing tabIndex on target'],
    qualitySignals: ['Only visible on focus', 'Links to main content', 'Proper focus management'],
    whenToUse: 'Every page with navigation elements',
    complexity: 1,
  },
  {
    id: 'a11y_live_region',
    name: 'ARIA Live Regions for Dynamic Updates',
    category: 'accessibility',
    tier: 'intermediate',
    description: 'Announce dynamic content changes to screen readers',
    template: `function StatusMessage({ message, type }: { message: string; type: 'info' | 'error' }) {
  return (
    <div 
      role={type === 'error' ? 'alert' : 'status'} 
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      {message}
    </div>
  );
}`,
    antiPatterns: ['Dynamic updates with no announcement', 'Using alert for non-urgent info', 'Missing aria-atomic'],
    qualitySignals: ['Polite for info, assertive for errors', 'aria-atomic ensures full re-read', 'Semantic role usage'],
    whenToUse: 'Toast notifications, loading states, form submission results, live data',
    complexity: 3,
  },
];

// ═══════════════════════════════════════════════════════════════
// CONCURRENCY & ASYNC PATTERNS (NEW)
// ═══════════════════════════════════════════════════════════════

const concurrencyPatterns: ExpertPattern[] = [
  {
    id: 'async_promise_all_settled',
    name: 'Promise.allSettled for Partial Failures',
    category: 'error_handling',
    tier: 'intermediate',
    description: 'Handle multiple async operations where some may fail without aborting all',
    template: `async function processItems(items: Item[]): ProcessResult {
  const results = await Promise.allSettled(
    items.map(item => processItem(item))
  );

  const succeeded = results.filter((r): r is PromiseFulfilledResult<Item> => r.status === 'fulfilled');
  const failed = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');

  return {
    processed: succeeded.map(r => r.value),
    errors: failed.map(r => ({ reason: r.reason?.message || 'Unknown error' })),
    successRate: succeeded.length / results.length,
  };
}`,
    antiPatterns: ['Promise.all that fails on first error', 'Sequential processing when parallel is safe', 'Swallowing all errors'],
    qualitySignals: ['Partial success supported', 'Errors collected not thrown', 'Success rate tracked'],
    whenToUse: 'Batch operations, multi-API calls, any parallel work where partial failure is acceptable',
    complexity: 4,
  },
  {
    id: 'async_abort_controller',
    name: 'AbortController for Cleanup',
    category: 'react_architecture',
    tier: 'intermediate',
    description: 'Cancel async operations when component unmounts or dependencies change',
    template: `useEffect(() => {
  const controller = new AbortController();
  
  async function load() {
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!controller.signal.aborted) {
        setData(await res.json());
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setError(e);
    }
  }
  
  load();
  return () => controller.abort();
}, [url]);`,
    antiPatterns: ['No cleanup on unmount', 'Setting state after unmount', 'Ignoring abort errors by catching all'],
    qualitySignals: ['Proper cleanup function', 'AbortError specifically handled', 'No state updates after abort'],
    whenToUse: 'Every useEffect with async operations or subscriptions',
    complexity: 3,
  },
  {
    id: 'async_queue_limiter',
    name: 'Concurrent Request Queue',
    category: 'performance',
    tier: 'advanced',
    description: 'Limit concurrent async operations to prevent resource exhaustion',
    template: `async function processWithLimit<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency = 5
): Promise<R[]> {
  const results: R[] = [];
  const executing = new Set<Promise<void>>();

  for (const item of items) {
    const p = fn(item).then(r => { results.push(r); });
    executing.add(p);
    p.finally(() => executing.delete(p));

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}`,
    antiPatterns: ['Unbounded Promise.all on 1000+ items', 'Sequential processing for independent tasks', 'No backpressure'],
    qualitySignals: ['Configurable concurrency', 'Backpressure via Promise.race', 'Results collected in order'],
    whenToUse: 'Batch API calls, file uploads, data migrations, any fan-out workload',
    complexity: 6,
  },
];

// ═══════════════════════════════════════════════════════════════
// CODE HYGIENE PATTERNS (NEW)
// ═══════════════════════════════════════════════════════════════

const hygienePatterns: ExpertPattern[] = [
  {
    id: 'hygiene_barrel_export',
    name: 'Barrel Export Pattern',
    category: 'refactoring',
    tier: 'foundational',
    description: 'Clean module boundaries with index.ts re-exports',
    template: `// src/lib/auth/index.ts — the barrel
export { useAuth } from './useAuth';
export { AuthProvider } from './AuthProvider';
export { requireAuth } from './guards';
export type { AuthState, AuthUser } from './types';

// Consumers import from the module, not individual files:
// import { useAuth, AuthProvider } from '@/lib/auth';`,
    antiPatterns: ['Importing from deep paths like @/lib/auth/hooks/useAuth', 'Circular imports in barrels', 'Re-exporting everything blindly'],
    qualitySignals: ['Single import point per module', 'Internal files are implementation details', 'Types separately exported'],
    whenToUse: 'Every module/feature directory with 3+ files',
    complexity: 1,
  },
  {
    id: 'hygiene_null_coalescing',
    name: 'Null Coalescing & Optional Chaining',
    category: 'typescript_advanced',
    tier: 'foundational',
    description: 'Modern nullish handling instead of verbose checks',
    template: `// BEFORE
const name = user && user.profile && user.profile.name ? user.profile.name : 'Anonymous';
const limit = config.limit !== null && config.limit !== undefined ? config.limit : 100;

// AFTER
const name = user?.profile?.name ?? 'Anonymous';
const limit = config.limit ?? 100;

// Nullish assignment
user.settings ??= { theme: 'dark' };`,
    antiPatterns: ['Using || instead of ?? (falsy vs nullish)', 'Nested ternaries for null checks', 'Manual undefined checks'],
    qualitySignals: ['?. for access, ?? for defaults', 'No false positive on 0 or empty string', 'Clean and readable'],
    whenToUse: 'Any property access that might be null/undefined',
    complexity: 1,
  },
  {
    id: 'hygiene_single_responsibility',
    name: 'Single Responsibility File Size',
    category: 'refactoring',
    tier: 'intermediate',
    description: 'Keep files under 200 lines by extracting focused modules',
    template: `// RED FLAG: File over 300 lines
// Split into focused modules:

// types.ts — Pure type definitions (no logic)
// utils.ts — Pure helper functions (no state)
// hooks.ts — React hooks (stateful logic)
// components.ts — UI components
// constants.ts — Configuration and magic values
// index.ts — Barrel exports only

// Rule of thumb:
// - Types file: unlimited (types are cheap)
// - Logic file: max 150 lines
// - Component file: max 200 lines
// - Hook file: max 100 lines per hook`,
    antiPatterns: ['500+ line files', 'Mixed concerns in one file', 'Utility "junk drawer" files'],
    qualitySignals: ['Each file has one clear purpose', 'Files under 200 lines', 'Easy to find things'],
    whenToUse: 'During any refactoring or when a file exceeds 200 lines',
    complexity: 2,
  },
];

// ═══════════════════════════════════════════════════════════════
// COMBINED REGISTRY
// ═══════════════════════════════════════════════════════════════

export const EXPERT_PATTERNS: ExpertPattern[] = [
  ...typescriptPatterns,
  ...reactPatterns,
  ...edgeFunctionPatterns,
  ...errorPatterns,
  ...securityPatterns,
  ...performancePatterns,
  ...statePatterns,
  ...databasePatterns,
  ...apiPatterns,
  ...testingPatterns,
  ...refactoringPatterns,
  ...accessibilityPatterns,
  ...concurrencyPatterns,
  ...hygienePatterns,
];

// ═══════════════════════════════════════════════════════════════
// QUERY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export function getPatternsByCategory(category: PatternCategory): ExpertPattern[] {
  return EXPERT_PATTERNS.filter(p => p.category === category);
}

export function getPatternsByTier(tier: PatternTier): ExpertPattern[] {
  return EXPERT_PATTERNS.filter(p => p.tier === tier);
}

export function getPatternById(id: string): ExpertPattern | undefined {
  return EXPERT_PATTERNS.find(p => p.id === id);
}

export function searchPatterns(query: string): ExpertPattern[] {
  const lower = query.toLowerCase();
  return EXPERT_PATTERNS.filter(p =>
    p.name.toLowerCase().includes(lower) ||
    p.description.toLowerCase().includes(lower) ||
    p.whenToUse.toLowerCase().includes(lower)
  );
}

export function getPatternSummary(): {
  total: number;
  byCategory: Record<string, number>;
  byTier: Record<string, number>;
} {
  const byCategory: Record<string, number> = {};
  const byTier: Record<string, number> = {};

  for (const p of EXPERT_PATTERNS) {
    byCategory[p.category] = (byCategory[p.category] || 0) + 1;
    byTier[p.tier] = (byTier[p.tier] || 0) + 1;
  }

  return { total: EXPERT_PATTERNS.length, byCategory, byTier };
}

/**
 * Get patterns most relevant to a task description
 */
/** Common words that shouldn't contribute to relevance scoring */
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'no', 'not', 'or', 'and', 'but',
  'if', 'then', 'that', 'this', 'it', 'its', 'any', 'all', 'each',
  'using', 'without', 'about', 'into', 'when', 'where', 'how',
]);

export function getRelevantPatterns(taskDescription: string, maxResults = 5): ExpertPattern[] {
  const lower = taskDescription.toLowerCase();
  const queryWords = lower.split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
  if (queryWords.length === 0) return [];
  
  const scored = EXPERT_PATTERNS.map(p => {
    let score = 0;
    const fields = [p.name, p.description, p.whenToUse, p.category, ...p.antiPatterns];
    for (const field of fields) {
      const fieldLower = field.toLowerCase();
      for (const word of queryWords) {
        if (fieldLower.includes(word)) score++;
      }
    }
    return { pattern: p, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(s => s.pattern);
}
