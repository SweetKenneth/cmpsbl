# 19: RIPPLE Deep Dive — The Message Bus

**Pub/Sub, Event Queues, and Async Communication**

---

## What is Ripple?

Think of Ripple as the **nervous system** of the substrate. When something happens anywhere in the system, the news "ripples" out to anyone who needs to know.

**Plain English:** Ripple is how modules talk to each other without being directly connected.

---

## Why a Message Bus?

### Without Ripple (Tight Coupling)

```
User signs up
     │
     ├──→ Send welcome email
     ├──→ Create user profile
     ├──→ Log to analytics
     ├──→ Notify admin
     └──→ Add to newsletter
```

**Problem:** The signup code has to know about ALL these other systems. Add a new feature? Change the signup code. Something breaks? The whole signup fails.

### With Ripple (Loose Coupling)

```
User signs up
     │
     └──→ RIPPLE: "user.signup" event
              │
              ├──→ Email service (subscribed)
              ├──→ Profile service (subscribed)
              ├──→ Analytics service (subscribed)
              ├──→ Admin notifier (subscribed)
              └──→ Newsletter service (subscribed)
```

**Solution:** Signup just publishes one event. Each service subscribes to what it cares about. Add a feature? Just subscribe. Something breaks? Other services keep working.

---

## Core Concepts

### Topics

A topic is a "channel" for related events. Examples:
- `user.signup` — When users create accounts
- `brain.memory` — When memories are stored
- `system.health` — Health status changes
- `dream.complete` — Dream cycles finish

### Publishers

Modules that **send** events to topics.

### Subscribers

Modules that **listen** for events on topics.

### Queues

For events that need to be processed **exactly once** (like sending emails), Ripple uses queues instead of pub/sub.

---

## Key Actions

### `publish`

Send an event to a topic.

```typescript
await substrate.ripple.publish('user.signup', {
  user_id: 'usr_123',
  email: 'new@user.com',
  plan: 'pro'
});
```

All subscribers to `user.signup` will receive this event.

---

### `subscribe`

Listen for events on a topic.

```typescript
await substrate.ripple.subscribe('user.signup', {
  handler: 'email-welcome',  // Edge function to call
  filter: { plan: 'pro' }    // Only pro signups (optional)
});
```

---

### `queue`

Add a job to a processing queue.

```typescript
await substrate.ripple.queue('email-queue', {
  to: 'user@example.com',
  template: 'welcome',
  data: { name: 'User' }
});
```

Unlike pub/sub, queued items are processed **one at a time** and **exactly once**.

---

### `dequeue`

Get the next item from a queue (for workers).

```typescript
const job = await substrate.ripple.dequeue('email-queue');
// Process the job...
await substrate.ripple.ack(job.id);  // Mark as done
```

---

### `ack`

Acknowledge that a message was processed successfully.

```typescript
await substrate.ripple.ack(message.id);
```

If you don't ack within the timeout, the message goes back to the queue for retry.

---

### `events`

Get recent events for debugging.

```typescript
const recent = await substrate.ripple.events({ 
  topic: 'brain.memory',
  limit: 10 
});
```

---

## Real-World Examples

### Example 1: Learning from User Feedback

```
User clicks "helpful" on an answer
         │
         ▼
RIPPLE: publish('feedback.positive', { answer_id, rating: 5 })
         │
         ├──→ Brain (subscribed): reinforce this memory
         ├──→ Vision (subscribed): log success metric
         └──→ Dream (subscribed): add to dream input pool
```

### Example 2: Processing Expensive Tasks

```
User uploads document
         │
         ▼
RIPPLE: queue('document-processing', { doc_id, user_id })
         │
         ▼ (Worker picks it up later)
Worker: dequeue → process → ack
```

### Example 3: Health Degradation Response

```
Vision detects high latency
         │
         ▼
RIPPLE: publish('system.degraded', { module: 'nexus', latency: 2000 })
         │
         ├──→ Core: open circuit breaker
         ├──→ System: trigger heal
         └──→ Admin: send alert
```

---

## Message Guarantees

| Pattern | Guarantee | Use Case |
|---------|-----------|----------|
| **Pub/Sub** | At-least-once | Notifications, logging |
| **Queue** | Exactly-once | Email sending, payments |

**At-least-once:** You might get the same message twice. Design handlers to be idempotent (safe to run twice).

**Exactly-once:** Each message processed exactly once. If the handler crashes, it retries. If it acks, it's done.

---

## Database Tables

### `ripple_events`
Stores all published events for replay and debugging.

| Column | Purpose |
|--------|---------|
| `id` | Event ID |
| `topic` | Topic name |
| `payload` | Event data |
| `published_at` | When it was published |
| `publisher` | Which module sent it |

### `ripple_jobs`
Stores queued jobs waiting for processing.

| Column | Purpose |
|--------|---------|
| `id` | Job ID |
| `queue` | Queue name |
| `payload` | Job data |
| `status` | pending/processing/done/failed |
| `locked_until` | Processing timeout |
| `attempts` | Retry count |

---

## Terminal Commands

```bash
# Publish an event
ripple.publish user.signup {"user_id": "123"}

# List recent events
ripple.events

# Queue a job
ripple.queue email-queue {"to": "user@example.com"}

# Check queue status
ripple.queue_status email-queue
```

---

## Best Practices

1. **Use descriptive topic names** — `user.signup.completed` is better than `event1`
2. **Keep payloads small** — Just include IDs, not full objects
3. **Design handlers to be idempotent** — Safe to run multiple times
4. **Always ack processed messages** — Otherwise they'll retry forever
5. **Use queues for important tasks** — Pub/sub for nice-to-have notifications

---

## Next Document

→ [20-ACCESS-DEEP-DIVE.md](./20-ACCESS-DEEP-DIVE.md) — Identity & Billing
