/**
 * 12-Language Export Pipeline Test
 * Verifies Layer 1 embedding + Layer 2 generation across all major languages.
 * © CMPSBL® — All rights reserved.
 */
import { describe, it, expect } from 'vitest';
import { generateUnifiedCapabilityFile } from '@/lib/export/unified-capability-file';
import { isLanguageShipping } from '@/lib/export/language-parity-tiers';

const CAPS = [
  { id: '1', name: 'Auto_Defense', cjpiScore: 90, tier: 'apex', chain: ['DEFENSE', 'BRAIN'], fingerprint: 'fp_def_test123456', moatSignature: 'moat_1', capabilityType: 'ascended' },
  { id: '2', name: 'Smart_Memory', cjpiScore: 88, tier: 'mythic', chain: ['MEMORY', 'CORTEX'], fingerprint: 'fp_mem_test123456', moatSignature: 'moat_2', capabilityType: 'ascended' },
];

interface SourceDef {
  name: string;
  ext: string;
  lang: string;
  content: string;
  /** A unique line from the source to verify verbatim embedding */
  uniqueSignature: string;
}

const SOURCES: Record<string, SourceDef> = {
  TypeScript: {
    name: 'task-queue.ts', ext: '.ts', lang: 'typescript',
    uniqueSignature: 'private processing = false;',
    content: `export class TaskQueue<T> {
  private queue: T[] = [];
  private processing = false;

  enqueue(item: T): void {
    this.queue.push(item);
  }

  dequeue(): T | undefined {
    return this.queue.shift();
  }

  async process(handler: (item: T) => Promise<void>): Promise<void> {
    if (this.processing) return;
    this.processing = true;
    while (this.queue.length > 0) {
      const item = this.dequeue()!;
      await handler(item);
    }
    this.processing = false;
  }

  get size(): number { return this.queue.length; }
}
`,
  },
  Python: {
    name: 'lru_cache.py', ext: '.py', lang: 'python',
    uniqueSignature: 'self._cache: OrderedDict = OrderedDict()',
    content: `"""Thread-safe LRU Cache implementation."""
from collections import OrderedDict
import threading


class LRUCache:
    """Least Recently Used cache with thread safety."""

    def __init__(self, capacity: int = 128):
        self._capacity = capacity
        self._cache: OrderedDict = OrderedDict()
        self._lock = threading.Lock()
        self._hits = 0
        self._misses = 0

    def get(self, key: str, default=None):
        with self._lock:
            if key in self._cache:
                self._cache.move_to_end(key)
                self._hits += 1
                return self._cache[key]
            self._misses += 1
            return default

    def put(self, key: str, value) -> None:
        with self._lock:
            if key in self._cache:
                self._cache.move_to_end(key)
            self._cache[key] = value
            if len(self._cache) > self._capacity:
                self._cache.popitem(last=False)

    def clear(self) -> None:
        with self._lock:
            self._cache.clear()

    @property
    def hit_rate(self) -> float:
        total = self._hits + self._misses
        return self._hits / total if total > 0 else 0.0

    def __len__(self) -> int:
        return len(self._cache)

    def __contains__(self, key: str) -> bool:
        return key in self._cache
`,
  },
  PHP: {
    name: 'Router.php', ext: '.php', lang: 'php',
    uniqueSignature: "private array $routes = [];",
    content: `<?php
declare(strict_types=1);

class Router
{
    private array $routes = [];
    private array $middleware = [];

    public function get(string $path, callable $handler): self
    {
        $this->routes['GET'][$path] = $handler;
        return $this;
    }

    public function post(string $path, callable $handler): self
    {
        $this->routes['POST'][$path] = $handler;
        return $this;
    }

    public function dispatch(string $method, string $uri): mixed
    {
        $handler = $this->routes[$method][$uri] ?? null;
        if ($handler === null) {
            throw new \\RuntimeException("Route not found: $method $uri", 404);
        }
        return $handler(['method' => $method, 'uri' => $uri]);
    }
}
`,
  },
  Rust: {
    name: 'ring_buffer.rs', ext: '.rs', lang: 'rust',
    uniqueSignature: 'pub struct RingBuffer<T> {',
    content: `/// A fixed-size ring buffer.
pub struct RingBuffer<T> {
    buffer: Vec<Option<T>>,
    head: usize,
    tail: usize,
    size: usize,
    capacity: usize,
}

impl<T> RingBuffer<T> {
    pub fn new(capacity: usize) -> Self {
        let mut buffer = Vec::with_capacity(capacity);
        for _ in 0..capacity {
            buffer.push(None);
        }
        Self { buffer, head: 0, tail: 0, size: 0, capacity }
    }

    pub fn push(&mut self, item: T) -> Option<T> {
        let evicted = self.buffer[self.tail].take();
        self.buffer[self.tail] = Some(item);
        self.tail = (self.tail + 1) % self.capacity;
        if self.size == self.capacity {
            self.head = (self.head + 1) % self.capacity;
        } else {
            self.size += 1;
        }
        evicted
    }

    pub fn pop(&mut self) -> Option<T> {
        if self.size == 0 { return None; }
        let item = self.buffer[self.head].take();
        self.head = (self.head + 1) % self.capacity;
        self.size -= 1;
        item
    }

    pub fn len(&self) -> usize { self.size }
    pub fn is_empty(&self) -> bool { self.size == 0 }
}
`,
  },
  Go: {
    name: 'rate_limiter.go', ext: '.go', lang: 'go',
    uniqueSignature: 'type RateLimiter struct {',
    content: `package ratelimiter

import (
\t"sync"
\t"time"
)

// RateLimiter implements a token bucket rate limiter.
type RateLimiter struct {
\tmu       sync.Mutex
\ttokens   float64
\tmax      float64
\trate     float64
\tlastTime time.Time
}

func New(maxTokens float64, refillRate float64) *RateLimiter {
\treturn &RateLimiter{
\t\ttokens:   maxTokens,
\t\tmax:      maxTokens,
\t\trate:     refillRate,
\t\tlastTime: time.Now(),
\t}
}

func (rl *RateLimiter) Allow() bool {
\trl.mu.Lock()
\tdefer rl.mu.Unlock()
\trl.refill()
\tif rl.tokens >= 1 {
\t\trl.tokens--
\t\treturn true
\t}
\treturn false
}

func (rl *RateLimiter) refill() {
\tnow := time.Now()
\telapsed := now.Sub(rl.lastTime).Seconds()
\trl.tokens += elapsed * rl.rate
\tif rl.tokens > rl.max {
\t\trl.tokens = rl.max
\t}
\trl.lastTime = now
}
`,
  },
  Java: {
    name: 'EventBus.java', ext: '.java', lang: 'java',
    uniqueSignature: 'private final Map<Class<?>, List<Consumer<?>>> listeners',
    content: `import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.function.Consumer;

public class EventBus {
    private final Map<Class<?>, List<Consumer<?>>> listeners = new ConcurrentHashMap<>();

    public <T> void subscribe(Class<T> eventType, Consumer<T> handler) {
        listeners.computeIfAbsent(eventType, k -> new CopyOnWriteArrayList<>()).add(handler);
    }

    @SuppressWarnings("unchecked")
    public <T> void publish(T event) {
        List<Consumer<?>> handlers = listeners.get(event.getClass());
        if (handlers != null) {
            for (Consumer<?> handler : handlers) {
                ((Consumer<T>) handler).accept(event);
            }
        }
    }

    public int listenerCount() {
        return listeners.values().stream().mapToInt(List::size).sum();
    }
}
`,
  },
  Ruby: {
    name: 'middleware_chain.rb', ext: '.rb', lang: 'ruby',
    uniqueSignature: 'class MiddlewareChain',
    content: `# frozen_string_literal: true

class MiddlewareChain
  def initialize
    @middlewares = []
  end

  def use(middleware, &block)
    @middlewares << (block || middleware)
    self
  end

  def call(env)
    chain = @middlewares.reverse.reduce(-> (e) { e }) do |next_mw, mw|
      if mw.respond_to?(:call)
        -> (e) { mw.call(e, next_mw) }
      else
        -> (e) { mw.new.call(e, next_mw) }
      end
    end
    chain.call(env)
  end

  def size
    @middlewares.length
  end
end
`,
  },
  Swift: {
    name: 'Observable.swift', ext: '.swift', lang: 'swift',
    uniqueSignature: 'private var observers: [(T) -> Void] = []',
    content: `import Foundation

class Observable<T> {
    private var observers: [(T) -> Void] = []
    private var value: T

    init(_ initialValue: T) {
        self.value = initialValue
    }

    func subscribe(_ observer: @escaping (T) -> Void) {
        observers.append(observer)
        observer(value)
    }

    func update(_ newValue: T) {
        value = newValue
        for observer in observers {
            observer(newValue)
        }
    }

    var current: T { return value }
}
`,
  },
  Kotlin: {
    name: 'Result.kt', ext: '.kt', lang: 'kotlin',
    uniqueSignature: 'sealed class Result<out T>',
    content: `sealed class Result<out T> {
    data class Success<T>(val value: T) : Result<T>()
    data class Failure(val error: Throwable) : Result<Nothing>()

    fun <R> map(transform: (T) -> R): Result<R> = when (this) {
        is Success -> Success(transform(value))
        is Failure -> this
    }

    fun getOrElse(default: @UnsafeVariance T): T = when (this) {
        is Success -> value
        is Failure -> default
    }

    companion object {
        fun <T> of(block: () -> T): Result<T> = try {
            Success(block())
        } catch (e: Throwable) {
            Failure(e)
        }
    }
}
`,
  },
  CSharp: {
    name: 'RetryPolicy.cs', ext: '.cs', lang: 'csharp',
    uniqueSignature: 'public class RetryPolicy',
    content: `using System;
using System.Threading.Tasks;

public class RetryPolicy
{
    private readonly int _maxRetries;
    private readonly TimeSpan _baseDelay;

    public RetryPolicy(int maxRetries = 3, TimeSpan? baseDelay = null)
    {
        _maxRetries = maxRetries;
        _baseDelay = baseDelay ?? TimeSpan.FromMilliseconds(100);
    }

    public async Task<T> ExecuteAsync<T>(Func<Task<T>> action)
    {
        Exception lastException = null;
        for (int attempt = 0; attempt <= _maxRetries; attempt++)
        {
            try
            {
                return await action();
            }
            catch (Exception ex)
            {
                lastException = ex;
                if (attempt < _maxRetries)
                {
                    var delay = TimeSpan.FromTicks(_baseDelay.Ticks * (long)Math.Pow(2, attempt));
                    await Task.Delay(delay);
                }
            }
        }
        throw lastException!;
    }
}
`,
  },
  Lua: {
    name: 'state_machine.lua', ext: '.lua', lang: 'lua',
    uniqueSignature: 'local StateMachine = {}',
    content: `--- Simple finite state machine.
-- @module StateMachine

local StateMachine = {}
StateMachine.__index = StateMachine

function StateMachine.new(initial_state)
    local self = setmetatable({}, StateMachine)
    self.state = initial_state
    self.transitions = {}
    self.callbacks = {}
    return self
end

function StateMachine:add_transition(from, event, to, callback)
    if not self.transitions[from] then
        self.transitions[from] = {}
    end
    self.transitions[from][event] = to
    if callback then
        local key = from .. ":" .. event
        self.callbacks[key] = callback
    end
end

function StateMachine:trigger(event, ...)
    local current = self.state
    local next_state = self.transitions[current] and self.transitions[current][event]
    if not next_state then
        error(string.format("No transition from '%s' on event '%s'", current, event))
    end
    local key = current .. ":" .. event
    if self.callbacks[key] then
        self.callbacks[key](self, ...)
    end
    self.state = next_state
    return self.state
end

function StateMachine:get_state()
    return self.state
end

return StateMachine
`,
  },
  Dart: {
    name: 'event_emitter.dart', ext: '.dart', lang: 'dart',
    uniqueSignature: 'class EventEmitter<T>',
    content: `typedef EventHandler<T> = void Function(T event);

class EventEmitter<T> {
  final Map<String, List<EventHandler<T>>> _listeners = {};

  void on(String event, EventHandler<T> handler) {
    _listeners.putIfAbsent(event, () => []);
    _listeners[event]!.add(handler);
  }

  void off(String event, EventHandler<T> handler) {
    _listeners[event]?.remove(handler);
  }

  void emit(String event, T data) {
    final handlers = _listeners[event];
    if (handlers != null) {
      for (final handler in handlers) {
        handler(data);
      }
    }
  }

  int listenerCount(String event) => _listeners[event]?.length ?? 0;
}
`,
  },
};

describe('12-Language Export Pipeline', () => {
  for (const [langName, src] of Object.entries(SOURCES)) {
    // Parity gate: only run full pipeline assertions for SHIPPING languages.
    // COMING_SOON languages are intentionally blocked from emitting artifacts.
    const block = isLanguageShipping(src.lang) ? describe : describe.skip;
    block(langName, () => {
      let output: string;

      it('generates without throwing', () => {
        const files = [{ name: src.name, extension: src.ext, language: src.lang, content: src.content }];
        const lang = src.lang.toLowerCase();
        output = generateUnifiedCapabilityFile(CAPS, `cmpsbl-ascended-${src.name.replace(/\.[^.]+$/, '')}`, lang, files);
        expect(output).toBeTruthy();
        expect(output.length).toBeGreaterThan(src.content.length);
      });

      it('contains Layer 1 markers', () => {
        const hasLayer1 = output.includes('LAYER 1') || output.includes('ORIGINAL SOURCE');
        expect(hasLayer1).toBe(true);
      });

      it('embeds original source verbatim', () => {
        expect(output).toContain(src.uniqueSignature);
      });

      it('contains Layer 2 capability metadata', () => {
        const hasLayer2 = output.includes('Capability') || output.includes('capability') || output.includes('CJPI') || output.includes('cjpi');
        expect(hasLayer2).toBe(true);
      });

      it('no smart quotes or markdown corruption', () => {
        expect(output).not.toContain('\u201C');
        expect(output).not.toContain('\u201D');
        expect(output).not.toContain('\u2018');
        expect(output).not.toContain('\u2019');
        expect(output).not.toMatch(/^```/m);
      });

      it('contains capability names', () => {
        expect(output).toContain('Auto_Defense');
        expect(output).toContain('Smart_Memory');
      });
    });
  }
});
