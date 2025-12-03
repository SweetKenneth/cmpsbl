# AI Orchestrator Architecture Guide
**Building Multi-Step AI Workflows That Actually Work**

Version: 1.0  
Last Updated: 2025-01-31

---

## 🎯 What Is an Orchestrator?

An **orchestrator** is a specialized edge function that coordinates multiple AI operations, edge functions, or external API calls into a coherent workflow. Think of it as a conductor leading an orchestra—it doesn't play all the instruments, but it ensures they play together in harmony.

### Core Purpose
- **Sequence complex operations** that must happen in specific order
- **Manage state** across multiple async operations
- **Handle failures gracefully** with rollback/retry logic
- **Aggregate results** from multiple sources
- **Enforce business rules** across distributed operations

---

## 🏗️ Anatomy of an Orchestrator

### Essential Components

```typescript
// supabase/functions/my-orchestrator/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // 1. CORS handling (always first)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 2. Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 3. Parse and validate input
    const { task, mode, flags } = await req.json();
    
    if (!task) {
      throw new Error('Missing required parameter: task');
    }

    console.log(`🎬 Orchestrator started: ${task}`);

    // 4. Initialize workflow state
    const workflowState = {
      startTime: Date.now(),
      task,
      mode: mode || 'default',
      results: {},
      errors: [],
    };

    // 5. Execute workflow phases
    const result = await executeWorkflow(supabaseClient, workflowState, flags);

    // 6. Log completion
    await supabaseClient.from('brain_events').insert({
      module: 'orchestrator',
      event_type: 'workflow_completed',
      data: {
        task,
        duration_ms: Date.now() - workflowState.startTime,
        phases_completed: Object.keys(result).length,
      },
      outcome: 'success',
    });

    // 7. Return aggregated results
    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // 8. Error handling and logging
    console.error('❌ Orchestrator error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function executeWorkflow(
  supabase: any, 
  state: any, 
  flags: any
) {
  const results: any = {};

  // Phase 1: Preparation
  if (flags?.prepare !== false) {
    console.log('📋 Phase 1: Preparation');
    results.preparation = await runPreparation(supabase, state);
  }

  // Phase 2: Main Execution
  console.log('⚙️ Phase 2: Execution');
  results.execution = await runExecution(supabase, state, results.preparation);

  // Phase 3: Post-Processing
  if (flags?.postProcess !== false) {
    console.log('🔄 Phase 3: Post-Processing');
    results.postProcessing = await runPostProcessing(supabase, state, results);
  }

  // Phase 4: Finalization
  console.log('✅ Phase 4: Finalization');
  results.finalization = await runFinalization(supabase, state, results);

  return results;
}
```

---

## 🔑 Key Architectural Patterns

### 1. **Sequential Phase Execution**

Phases must execute in order, with each building on previous results:

```typescript
// ✅ CORRECT: Sequential with dependencies
const phase1Result = await executePhase1(input);
const phase2Result = await executePhase2(phase1Result); // Uses phase1 output
const phase3Result = await executePhase3(phase2Result); // Uses phase2 output

// ❌ WRONG: Parallel when order matters
const [phase1, phase2, phase3] = await Promise.all([
  executePhase1(input),
  executePhase2(input), // Missing phase1 data!
  executePhase3(input), // Missing phase1 & phase2 data!
]);
```

### 2. **Conditional Phase Execution**

Use flags to skip optional phases:

```typescript
async function executeWorkflow(supabase: any, state: any, flags: any) {
  const results: any = {};

  // Always run core phases
  results.core = await runCoreLogic(supabase, state);

  // Optional enhancement phases
  if (flags?.enhance) {
    results.enhancement = await runEnhancement(supabase, results.core);
  }

  if (flags?.validate) {
    results.validation = await runValidation(supabase, results.core);
  }

  // Only run expensive operations if explicitly requested
  if (flags?.deepAnalysis) {
    results.deepAnalysis = await runDeepAnalysis(supabase, results);
  }

  return results;
}
```

### 3. **Error Handling with Partial Success**

Don't let one phase failure destroy the whole workflow:

```typescript
async function executeWorkflow(supabase: any, state: any, flags: any) {
  const results: any = { success: true, errors: [] };

  // Phase 1: Critical (must succeed)
  try {
    results.phase1 = await runCriticalPhase(supabase, state);
  } catch (error) {
    console.error('❌ Critical phase failed:', error);
    results.success = false;
    results.errors.push({ phase: 'phase1', error: error.message });
    return results; // Early exit on critical failure
  }

  // Phase 2: Important (log error but continue)
  try {
    results.phase2 = await runImportantPhase(supabase, results.phase1);
  } catch (error) {
    console.warn('⚠️ Important phase failed:', error);
    results.errors.push({ phase: 'phase2', error: error.message });
    results.phase2 = null; // Mark as failed but continue
  }

  // Phase 3: Optional (silent failure)
  try {
    results.phase3 = await runOptionalPhase(supabase, results);
  } catch (error) {
    console.log('ℹ️ Optional phase skipped:', error.message);
    results.phase3 = null;
  }

  return results;
}
```

### 4. **State Accumulation Pattern**

Build up context as you progress:

```typescript
async function executeWorkflow(supabase: any, initialState: any) {
  // Start with initial state
  let workflowContext = {
    ...initialState,
    startTime: Date.now(),
    phaseResults: [],
  };

  // Phase 1: Add analysis to context
  const analysis = await analyzeInput(supabase, workflowContext.task);
  workflowContext = { 
    ...workflowContext, 
    analysis,
    phaseResults: [...workflowContext.phaseResults, 'analysis'],
  };

  // Phase 2: Use accumulated context
  const plan = await createPlan(supabase, workflowContext);
  workflowContext = { 
    ...workflowContext, 
    plan,
    phaseResults: [...workflowContext.phaseResults, 'planning'],
  };

  // Phase 3: Full context available
  const execution = await executeWithContext(supabase, workflowContext);
  workflowContext = { 
    ...workflowContext, 
    execution,
    phaseResults: [...workflowContext.phaseResults, 'execution'],
    endTime: Date.now(),
  };

  return workflowContext;
}
```

### 5. **Function Invocation Pattern**

Call other edge functions from the orchestrator:

```typescript
async function callEdgeFunction(
  supabase: any, 
  functionName: string, 
  payload: any
) {
  console.log(`📞 Calling: ${functionName}`);
  
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
  });

  if (error) {
    console.error(`❌ ${functionName} failed:`, error);
    throw new Error(`${functionName} invocation failed: ${error.message}`);
  }

  console.log(`✅ ${functionName} completed`);
  return data;
}

// Usage in workflow
async function executeWorkflow(supabase: any, state: any) {
  // Phase 1: Call planning function
  const planResult = await callEdgeFunction(
    supabase,
    'pf-brain-reflexive-plan',
    { task: state.task }
  );

  // Phase 2: Call execution function with plan
  const execResult = await callEdgeFunction(
    supabase,
    'pf-brain-execute',
    { plan: planResult.plan, context: state }
  );

  // Phase 3: Call validation function
  const validationResult = await callEdgeFunction(
    supabase,
    'pf-brain-validate',
    { output: execResult.output }
  );

  return { planResult, execResult, validationResult };
}
```

### 6. **External API Integration Pattern**

Call external APIs with proper error handling:

```typescript
async function callExternalAPI(
  endpoint: string, 
  apiKey: string, 
  payload: any,
  retries: number = 3
) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🌐 API call attempt ${attempt}/${retries}: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ API call succeeded`);
      return data;

    } catch (error) {
      console.warn(`⚠️ API attempt ${attempt} failed:`, error);
      
      if (attempt === retries) {
        throw new Error(`API call failed after ${retries} attempts: ${error.message}`);
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
}

// Usage
async function runPhaseWithExternalAPI(supabase: any, state: any) {
  const apiKey = Deno.env.get('EXTERNAL_API_KEY');
  if (!apiKey) {
    throw new Error('EXTERNAL_API_KEY not configured');
  }

  const result = await callExternalAPI(
    'https://api.example.com/process',
    apiKey,
    { input: state.task }
  );

  return result;
}
```

---

## 📊 Workflow State Management

### Persistent State Pattern

Store workflow progress in database for long-running operations:

```typescript
async function executeWorkflow(supabase: any, state: any) {
  // Create workflow record
  const { data: workflow, error } = await supabase
    .from('orchestrator_workflows')
    .insert({
      task: state.task,
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  try {
    // Phase 1
    await updateWorkflowStatus(supabase, workflow.id, 'phase1_running');
    const phase1Result = await runPhase1(supabase, state);
    await updateWorkflowStatus(supabase, workflow.id, 'phase1_completed', { phase1Result });

    // Phase 2
    await updateWorkflowStatus(supabase, workflow.id, 'phase2_running');
    const phase2Result = await runPhase2(supabase, phase1Result);
    await updateWorkflowStatus(supabase, workflow.id, 'phase2_completed', { phase2Result });

    // Mark complete
    await updateWorkflowStatus(supabase, workflow.id, 'completed', {
      phase1Result,
      phase2Result,
      completed_at: new Date().toISOString(),
    });

    return { phase1Result, phase2Result };

  } catch (error) {
    // Mark failed
    await updateWorkflowStatus(supabase, workflow.id, 'failed', {
      error: error.message,
      failed_at: new Date().toISOString(),
    });
    throw error;
  }
}

async function updateWorkflowStatus(
  supabase: any,
  workflowId: string,
  status: string,
  data?: any
) {
  await supabase
    .from('orchestrator_workflows')
    .update({
      status,
      updated_at: new Date().toISOString(),
      ...(data && { data }),
    })
    .eq('id', workflowId);
}
```

---

## 🛡️ Critical Best Practices

### 1. **Always Log Phase Transitions**

```typescript
console.log('🎬 Starting Phase 1: Analysis');
const analysis = await runAnalysis(supabase, state);
console.log('✅ Phase 1 complete:', { keysFound: Object.keys(analysis).length });

console.log('🎬 Starting Phase 2: Planning');
const plan = await runPlanning(supabase, analysis);
console.log('✅ Phase 2 complete:', { stepsGenerated: plan.steps.length });
```

### 2. **Validate Inputs Early**

```typescript
async function executeWorkflow(supabase: any, state: any, flags: any) {
  // Validate at the start
  if (!state.task || typeof state.task !== 'string') {
    throw new Error('Invalid input: task must be a non-empty string');
  }

  if (flags?.mode && !['fast', 'thorough', 'creative'].includes(flags.mode)) {
    throw new Error('Invalid mode: must be fast, thorough, or creative');
  }

  // Continue with workflow...
}
```

### 3. **Use Timeouts for Long Operations**

```typescript
async function runPhaseWithTimeout(
  operation: () => Promise<any>,
  timeoutMs: number = 30000
) {
  return Promise.race([
    operation(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    ),
  ]);
}

// Usage
const result = await runPhaseWithTimeout(
  () => runExpensivePhase(supabase, state),
  60000 // 60 second timeout
);
```

### 4. **Track Performance Metrics**

```typescript
async function executeWorkflow(supabase: any, state: any) {
  const metrics = {
    startTime: Date.now(),
    phases: {},
  };

  // Phase 1
  const phase1Start = Date.now();
  const phase1Result = await runPhase1(supabase, state);
  metrics.phases.phase1 = Date.now() - phase1Start;

  // Phase 2
  const phase2Start = Date.now();
  const phase2Result = await runPhase2(supabase, phase1Result);
  metrics.phases.phase2 = Date.now() - phase2Start;

  metrics.totalDuration = Date.now() - metrics.startTime;

  // Log metrics
  console.log('📊 Workflow metrics:', metrics);

  await supabase.from('orchestrator_metrics').insert({
    workflow_type: state.task,
    metrics,
    timestamp: new Date().toISOString(),
  });

  return { phase1Result, phase2Result, metrics };
}
```

### 5. **Implement Circuit Breakers**

```typescript
const circuitBreakers = new Map();

async function callWithCircuitBreaker(
  serviceName: string,
  operation: () => Promise<any>,
  threshold: number = 5
) {
  const breaker = circuitBreakers.get(serviceName) || { failures: 0, lastFailure: 0 };

  // Check if circuit is open
  if (breaker.failures >= threshold) {
    const timeSinceLastFailure = Date.now() - breaker.lastFailure;
    if (timeSinceLastFailure < 60000) { // 1 minute cooldown
      throw new Error(`Circuit breaker open for ${serviceName}`);
    } else {
      // Reset after cooldown
      breaker.failures = 0;
    }
  }

  try {
    const result = await operation();
    breaker.failures = 0; // Reset on success
    circuitBreakers.set(serviceName, breaker);
    return result;
  } catch (error) {
    breaker.failures++;
    breaker.lastFailure = Date.now();
    circuitBreakers.set(serviceName, breaker);
    throw error;
  }
}

// Usage
const result = await callWithCircuitBreaker(
  'external-api',
  () => callExternalAPI(endpoint, apiKey, payload)
);
```

---

## 🎯 Real-World Example: Complete Orchestrator

```typescript
// supabase/functions/pf-content-pipeline/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { topic, audience, tone } = await req.json();

    console.log('🎬 Content Pipeline Started:', { topic, audience, tone });

    const startTime = Date.now();
    const results: any = { success: true, errors: [] };

    // Phase 1: Research
    console.log('📚 Phase 1: Research');
    try {
      const { data: researchData } = await supabase.functions.invoke(
        'pf-research-topic',
        { body: { topic, depth: 'moderate' } }
      );
      results.research = researchData;
    } catch (error) {
      results.errors.push({ phase: 'research', error: error.message });
      results.research = null;
    }

    // Phase 2: Outline Generation
    console.log('📝 Phase 2: Outline Generation');
    const { data: outlineData } = await supabase.functions.invoke(
      'pf-generate-outline',
      { body: { topic, research: results.research, audience, tone } }
    );
    results.outline = outlineData;

    // Phase 3: Content Generation
    console.log('✍️ Phase 3: Content Generation');
    const { data: contentData } = await supabase.functions.invoke(
      'pf-generate-content',
      { body: { outline: results.outline, tone } }
    );
    results.content = contentData;

    // Phase 4: SEO Optimization
    console.log('🔍 Phase 4: SEO Optimization');
    const { data: seoData } = await supabase.functions.invoke(
      'pf-optimize-seo',
      { body: { content: results.content, topic } }
    );
    results.seo = seoData;

    // Phase 5: Save to Database
    console.log('💾 Phase 5: Save to Database');
    const { data: savedContent } = await supabase
      .from('generated_content')
      .insert({
        topic,
        audience,
        tone,
        content: results.content,
        seo_metadata: results.seo,
        research_sources: results.research?.sources || [],
      })
      .select()
      .single();

    results.contentId = savedContent.id;
    results.duration = Date.now() - startTime;

    console.log('✅ Content Pipeline Complete:', {
      contentId: results.contentId,
      duration: results.duration,
    });

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Content Pipeline Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## 📋 Orchestrator Checklist

When building a new orchestrator, ensure you have:

✅ **CORS handling** for OPTIONS requests  
✅ **Input validation** at the start  
✅ **Clear phase logging** for debugging  
✅ **Error handling** per phase (critical vs optional)  
✅ **State accumulation** across phases  
✅ **Performance metrics** tracking  
✅ **Database logging** of workflow events  
✅ **Proper secret management** (environment variables)  
✅ **Timeout protection** for long operations  
✅ **Retry logic** for external APIs  
✅ **Circuit breakers** for unreliable services  
✅ **Status persistence** for long-running workflows  

---

## 🚀 When to Use an Orchestrator

### ✅ Good Use Cases
- Multi-step AI pipelines (research → plan → execute → validate)
- Content generation workflows (outline → draft → edit → publish)
- Data processing pipelines (extract → transform → load → verify)
- Complex approval flows (submit → review → approve → execute)

### ❌ Bad Use Cases
- Single AI calls (just call the model directly)
- Simple CRUD operations (use direct database calls)
- Real-time chat (use streaming instead)
- Parallel independent tasks (use Promise.all instead)

---

## 🎓 Key Takeaways

1. **Orchestrators coordinate, they don't do everything themselves**
2. **Sequential phases with clear dependencies**
3. **Partial success is better than total failure**
4. **Log everything for debugging**
5. **Validate early, fail fast**
6. **Track metrics to optimize performance**
7. **Use circuit breakers for external dependencies**
8. **Persist state for long-running workflows**

---

**End of Guide**

For questions or examples, reference existing orchestrators:
- `pf-brain-cognitive-cycle` - Multi-phase AI reasoning
- `pf-modernizer-orchestrator` - Website rebuild pipeline
- `pf-brain-operational-suite` - Capability routing system
