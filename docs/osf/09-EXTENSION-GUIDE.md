# PromptFluid Extension Guide

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | PF-EXT-001 |
| Version | 1.0.0 |
| Last Updated | 2026-01-13 |
| Status | STABLE |

---

## Introduction

PromptFluid is designed as an extensible substrate. This guide explains how developers can build on top of the ecosystem, create new modules, extend existing functionality, and integrate external systems.

---

## Extension Architecture

### Extension Points

```
┌─────────────────────────────────────────────────────┐
│                  PromptFluid Core                    │
├─────────────────────────────────────────────────────┤
│  Extension Points:                                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ Brain Hooks │ │ Nexus Hooks │ │Defense Hooks│   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ Dream Hooks │ │Vision Hooks │ │ Event Hooks │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
├─────────────────────────────────────────────────────┤
│                 Your Extensions                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ Custom Mods │ │  Plugins    │ │Integrations │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## Creating Edge Functions

### Basic Structure

```typescript
// supabase/functions/my-extension/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();
    
    // Your logic here
    const result = await processAction(action, payload);
    
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### Using Shared Utilities

```typescript
// Import shared modules
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CascadeReporting } from "../_shared/cascade-reporting.ts";
import { FreeTierRouter } from "../_shared/free-tier-router.ts";

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);
```

---

## Extending Brain Memory

### Custom Memory Types

```typescript
// Define custom memory type
interface CustomMemory {
  content: string;
  memory_type: 'custom_analysis' | 'custom_insight';
  source: 'my-extension';
  metadata: {
    extension_version: string;
    custom_fields: Record<string, any>;
  };
}

// Store custom memory
async function storeCustomMemory(memory: CustomMemory) {
  const { data, error } = await supabase
    .from('brain_memories')
    .insert({
      content: memory.content,
      memory_type: memory.memory_type,
      source: memory.source,
      metadata: memory.metadata,
      confidence: 0.8
    });
    
  return data;
}
```

### Custom Graph Edges

```typescript
// Create custom relationship types
async function createCustomEdge(
  sourceId: string,
  targetId: string,
  relation: string
) {
  const { data, error } = await supabase
    .from('brain_graph_edges')
    .insert({
      source_id: sourceId,
      target_id: targetId,
      relation: `ext:${relation}`, // Prefix with ext:
      weight: 1.0,
      metadata: { extension: 'my-extension' }
    });
    
  return data;
}
```

---

## Extending Nexus Routing

### Custom Provider Integration

```typescript
// supabase/functions/_shared/custom-provider.ts
export interface CustomProvider {
  name: string;
  models: string[];
  route: (prompt: string, options: any) => Promise<any>;
}

export const myCustomProvider: CustomProvider = {
  name: 'my-provider',
  models: ['model-a', 'model-b'],
  
  async route(prompt: string, options: any) {
    const response = await fetch('https://api.myprovider.com/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('MY_PROVIDER_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt, ...options })
    });
    
    return response.json();
  }
};
```

### Custom Task Classifiers

```typescript
// Add custom task classification
export function classifyCustomTask(prompt: string): string {
  const patterns = {
    'custom-analysis': /analyze my custom|custom report/i,
    'custom-generation': /generate custom|create custom/i,
  };
  
  for (const [task, pattern] of Object.entries(patterns)) {
    if (pattern.test(prompt)) return task;
  }
  
  return 'general';
}
```

---

## Extending Defense Intelligence

### Custom Detection Rules

```typescript
// Add custom bot detection signals
interface CustomSignal {
  name: string;
  weight: number;
  detect: (request: Request) => Promise<number>;
}

export const customSignals: CustomSignal[] = [
  {
    name: 'custom-header-check',
    weight: 15,
    async detect(request: Request) {
      const customHeader = request.headers.get('x-custom-header');
      if (!customHeader) return 10; // Suspicious
      return 0;
    }
  },
  {
    name: 'custom-pattern-check',
    weight: 20,
    async detect(request: Request) {
      // Your custom detection logic
      return 0;
    }
  }
];
```

### Custom Response Actions

```typescript
// Define custom actions for detected threats
type CustomAction = 'custom-challenge' | 'custom-redirect' | 'custom-delay';

async function handleCustomAction(
  action: CustomAction,
  request: Request
): Promise<Response> {
  switch (action) {
    case 'custom-challenge':
      return new Response(
        JSON.stringify({ challenge: 'custom-captcha' }),
        { status: 403 }
      );
    case 'custom-redirect':
      return Response.redirect('https://example.com/blocked');
    case 'custom-delay':
      await new Promise(r => setTimeout(r, 5000));
      return new Response('Delayed response');
    default:
      return new Response('Blocked', { status: 403 });
  }
}
```

---

## Extending Dream Cycles

### Custom Dream Types

```typescript
// Define custom dream cycle
interface CustomDreamCycle {
  type: string;
  probability: number;
  duration: 'short' | 'medium' | 'long';
  generator: () => Promise<string>;
}

export const customDreamCycles: CustomDreamCycle[] = [
  {
    type: 'strategic-dream',
    probability: 0.1,
    duration: 'long',
    async generator() {
      // Generate strategic insights
      const memories = await fetchRecentMemories();
      return generateStrategicDream(memories);
    }
  }
];
```

### Dream Output Handlers

```typescript
// Custom handler for dream outputs
async function handleCustomDreamOutput(dream: any) {
  // Post to external system
  await fetch('https://your-system.com/dreams', {
    method: 'POST',
    body: JSON.stringify(dream)
  });
  
  // Store in custom table
  await supabase
    .from('custom_dream_outputs')
    .insert({ dream_id: dream.id, processed: true });
}
```

---

## Creating React Components

### Custom Dashboard Widget

```tsx
// src/components/extensions/CustomWidget.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function CustomWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ['custom-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_table')
        .select('*')
        .limit(10);
      if (error) throw error;
      return data;
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Extension</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <ul>
            {data?.map(item => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
```

### Custom Hooks

```tsx
// src/hooks/useCustomExtension.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCustomExtension() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['custom-extension'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('my-extension', {
        body: { action: 'status' }
      });
      if (error) throw error;
      return data;
    }
  });

  const triggerAction = useMutation({
    mutationFn: async (action: string) => {
      const { data, error } = await supabase.functions.invoke('my-extension', {
        body: { action }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-extension'] });
    }
  });

  return { data, isLoading, error, triggerAction };
}
```

---

## Database Extensions

### Custom Tables

```sql
-- Migration: Create custom extension table
CREATE TABLE public.ext_custom_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extension_name VARCHAR NOT NULL,
  data JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ext_custom_data ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Service role access"
  ON public.ext_custom_data FOR ALL
  TO service_role
  USING (true);

-- Create index
CREATE INDEX idx_ext_custom_data_extension 
  ON public.ext_custom_data(extension_name);

-- Add to realtime
ALTER PUBLICATION supabase_realtime 
  ADD TABLE public.ext_custom_data;
```

### Custom Functions

```sql
-- Create custom database function
CREATE OR REPLACE FUNCTION ext_process_custom_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Your custom processing logic
  NEW.processed = true;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER ext_custom_data_process
  BEFORE UPDATE ON public.ext_custom_data
  FOR EACH ROW
  EXECUTE FUNCTION ext_process_custom_data();
```

---

## Event System Integration

### Publishing Events

```typescript
// Publish custom events to ecosystem
async function publishEvent(
  eventType: string,
  payload: any,
  impactScore: number = 0.5
) {
  await supabase
    .from('ecosystem_memory')
    .insert({
      source_system: 'my-extension',
      event_type: eventType,
      payload,
      impact_score: impactScore
    });
}

// Usage
await publishEvent('custom.analysis.complete', {
  result: analysisResult,
  timestamp: new Date().toISOString()
}, 0.7);
```

### Subscribing to Events

```typescript
// Subscribe to ecosystem events
const channel = supabase
  .channel('ecosystem-events')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'ecosystem_memory',
      filter: 'source_system=eq.brain'
    },
    (payload) => {
      handleBrainEvent(payload.new);
    }
  )
  .subscribe();
```

---

## WordPress Plugin Extensions

### Filter Hooks

```php
<?php
// Add custom bot detection signal
add_filter('pf_defense_signals', function($signals, $request) {
    $signals['custom_check'] = my_custom_check($request);
    return $signals;
}, 10, 2);

// Modify risk score calculation
add_filter('pf_risk_score', function($score, $signals) {
    if ($signals['custom_check'] > 50) {
        $score += 20;
    }
    return $score;
}, 10, 2);
```

### Action Hooks

```php
<?php
// Hook into bot detection
add_action('pf_bot_detected', function($event) {
    // Log to custom system
    my_custom_logger($event);
});

// Hook into challenge completion
add_action('pf_challenge_passed', function($session) {
    // Custom handling
    update_user_trust($session['ip']);
});
```

---

## Best Practices

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Edge Functions | `pf-{module}-{action}` | `pf-brain-custom` |
| Tables | `ext_{name}` | `ext_custom_data` |
| Events | `{extension}.{entity}.{action}` | `myext.item.created` |
| Hooks | `ext_{action}` | `ext_process_data` |

### Error Handling

```typescript
// Always use structured error responses
class ExtensionError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}

// Usage
throw new ExtensionError(
  'Custom validation failed',
  'EXT_VALIDATION_ERROR',
  400
);
```

### Logging

```typescript
// Use consistent logging format
function log(level: string, message: string, data?: any) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    extension: 'my-extension',
    level,
    message,
    data
  }));
}

// Usage
log('info', 'Processing started', { itemId: '123' });
log('error', 'Processing failed', { error: err.message });
```

---

## Extension Registry

To register your extension with the ecosystem:

1. Create a manifest file:

```json
{
  "name": "my-extension",
  "version": "1.0.0",
  "description": "My custom extension",
  "author": "Developer Name",
  "hooks": ["brain", "defense"],
  "tables": ["ext_custom_data"],
  "functions": ["pf-my-extension"]
}
```

2. Submit via pull request to the extensions registry.

---

**See Also:**
- [API Reference](./08-API-REFERENCE.md)
- [Database Schema](./07-DATABASE-SCHEMA.md)
- [Contribution Guidelines](./15-CONTRIBUTION.md)
