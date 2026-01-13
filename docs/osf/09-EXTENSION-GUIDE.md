# promptfluid® extension guide

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | PF-EXT-001 |
| Version | v2026.01 |
| Last Updated | 2026-01-13 |
| Status | STABLE |
| Type | Cognitive Orchestration Substrate |

---

## Introduction

promptfluid® is a cognitive orchestration substrate that provides routing, memory, learning cycles, observability, defense, and execution coordination for AI systems. It is model-agnostic, provider-agnostic, and runs on commodity cloud.

This guide explains how developers can build on top of the ecosystem, create new modules, extend existing functionality, and integrate external systems.

---

## Extension Architecture

### Extension Points

```
┌─────────────────────────────────────────────────────┐
│                  promptfluid core                    │
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();
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

---

## Extending Brain Memory

### Custom Memory Types

```typescript
interface CustomMemory {
  content: string;
  memory_type: 'custom_analysis' | 'custom_insight';
  source: 'my-extension';
  metadata: {
    extension_version: string;
    custom_fields: Record<string, any>;
  };
}

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

---

## Extending Nexus Routing

### Custom Provider Integration

```typescript
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

---

## Extending Defense Intelligence

### Custom Detection Rules

```typescript
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
  }
];
```

---

## Event System Integration

### Publishing Events

```typescript
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
```

### Subscribing to Events

```typescript
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

## Contact & Licensing

**Founder:** Kenneth E Sweet Jr  
**Email:** promptfluid@gmail.com  
**Phone:** (760) FLUID-AI  
**Website:** https://promptfluid.com

For licensing inquiries regarding the promptfluid® substrate, contact promptfluid@gmail.com.

---

**promptfluid® — Cognitive Orchestration Substrate**  
**Copyright © 2025-2026 promptfluid. All rights reserved.**
