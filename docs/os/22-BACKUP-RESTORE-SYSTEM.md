# 22: Backup, Restore & Installation — The Package System

**How to Clone, Sell, and Deploy the Substrate**

---

## The Big Picture

The Substrate isn't just software you run — it's software you can **package, sell, and deploy anywhere**. Think of it like:

- A franchise kit for AI systems
- A "save game" you can restore anytime
- A product you can white-label and resell

**Plain English:** You can take everything the system knows, pack it in a box, and set it up somewhere else — with or without writing a single line of code.

---

## The Backup System

### What Gets Backed Up

Every backup captures the entire substrate state:

| Category | What's Included | Example |
|----------|-----------------|---------|
| **Memory** | All brain memories (hot, warm, cold) | Every conversation, learning, insight |
| **Graph** | Relationship networks | Who knows what, what connects to what |
| **Config** | Module settings | Defense rules, Nexus routes, Dream schedules |
| **Events** | Activity history | What happened and when |
| **Orchestrator** | Current system state | Active processes, queued tasks |

### Backup Types

```
┌─────────────────────────────────────────────────┐
│           BACKUP OPTIONS                        │
├─────────────────────────────────────────────────┤
│                                                 │
│  🕐 DAILY AUTOMATIC                             │
│     Runs every night at 2am                     │
│     Keeps last 3 days                           │
│     No action required                          │
│                                                 │
│  👆 MANUAL TRIGGER                              │
│     Create anytime from Terminal or OS          │
│     Good before risky changes                   │
│     Labeled with your custom name               │
│                                                 │
│  ⭐ PERMANENT FAILSAFE                          │
│     Protected from auto-cleanup                 │
│     Your "golden master" restore point          │
│     One per project (overwrite to update)       │
│                                                 │
│  📦 EXPORT PACKAGE                              │
│     Downloadable ZIP file                       │
│     Can include or exclude secrets              │
│     Ready for migration or sale                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Creating Backups

**From Terminal:**
```
substrate:// system.backup

Creating backup...
├── Capturing brain memories: 12,456 records
├── Capturing graph nodes: 3,234 nodes
├── Capturing events: 45,678 events
├── Capturing config: 8 modules
└── Complete

✅ Backup created: backup_20260124_1430
   Path: /backups/daily/backup_20260124_1430.json
   Size: 24.5 MB
   Expires: 2026-01-27 (3 days)
```

**From OS Dashboard:**
1. Navigate to Admin → Backups
2. Click "Create Manual Backup"
3. (Optional) Check "Make Permanent Failsafe"
4. Click Create

---

## The Restore System

### When to Restore

You might restore a backup when:
- Something broke and you need to roll back
- You want to undo an experiment
- Setting up a new environment with existing data
- Recovering from data corruption

### How Restoration Works

```
substrate:// system.restore backup_20260124_1430

Restoring from backup...

WARNING: This will replace current data!
Proceed? (y/n): y

Creating safety backup first...
├── Current state saved as: backup_restore_safety_1430
└── Complete

Restoring backup_20260124_1430...
├── Clearing existing data
├── Restoring brain_memories: 12,456 records
├── Restoring brain_graph_nodes: 3,234 nodes
├── Restoring brain_events: 45,678 events
├── Restoring module configs: 8 modules
├── Validating data integrity
└── Complete

✅ Restore complete
   Records restored: 61,368
   Time elapsed: 45 seconds
   
The system is now at the state from 2026-01-24 14:30
```

### Dry Run Mode

Not sure what you'll get? Preview first:

```
substrate:// system.restore backup_20260124_1430 --dry-run

DRY RUN: Previewing restore (no changes will be made)

Would restore:
├── brain_memories: 12,456 records
├── brain_graph_nodes: 3,234 nodes
├── brain_events: 45,678 events
├── module configs: 8 modules

Differences from current state:
├── +234 memories (new in backup)
├── -45 memories (exist now, not in backup)
├── ~12 config changes
└── Events: backup is 6 hours older

Proceed with actual restore? Use without --dry-run
```

---

## The Export Package System

### What Is an Export Package?

An export package is a **portable, installable version** of the substrate that can be:

- Downloaded as a ZIP file
- Migrated to another project
- Sold as a white-labeled product
- Set up by non-technical users

### Package Types

| Type | Includes Secrets? | Best For |
|------|-------------------|----------|
| **Full** | Yes (encrypted manifest) | Personal backup, same-team migration |
| **Portable** | No | Selling, sharing, new deployments |
| **Sellable** | No + Install Wizard | Commercial distribution |

### Creating an Export Package

```
substrate:// system.export --type=sellable

Creating export package...

Package Options:
├── Type: Sellable (wizard-enabled)
├── Include secrets: NO (buyer adds their own)
├── Tables: 16 core tables
├── Records: 61,368 total
└── Size: 24.5 MB

Generating package...
├── Serializing brain data
├── Serializing config data
├── Adding restore instructions
├── Creating _secrets_manifest (required keys list)
├── Generating install wizard config
├── Compressing to ZIP
└── Complete

✅ Export package created

Download: /exports/substrate_sellable_20260124.zip
Size: 8.7 MB (compressed)
Expires: 7 days

To import elsewhere:
1. Upload to new project
2. Call pf-backup-import function
3. Or use Install Wizard for guided setup
```

---

## The Install Wizard

### What Is the Install Wizard?

When someone receives a substrate package, they don't need to be a developer to set it up. The **Install Wizard** walks them through everything:

```
┌─────────────────────────────────────────────────┐
│        SUBSTRATE INSTALL WIZARD                 │
│        "Get running in 10 minutes"              │
├─────────────────────────────────────────────────┤
│                                                 │
│  Step 1 of 6                                    │
│  ─────────────────────────────────────          │
│                                                 │
│  🏢 WHO ARE YOU?                                │
│                                                 │
│  What industry is this substrate for?           │
│                                                 │
│  ○ Gaming / Interactive Entertainment           │
│  ○ Software / Developer Tools                   │
│  ○ Enterprise Business                          │
│  ○ Healthcare / Life Sciences                   │
│  ○ Legal / Professional Services                │
│  ○ Education / EdTech                           │
│  ○ Other (Custom Setup)                         │
│                                                 │
│                        [Continue →]             │
│                                                 │
└─────────────────────────────────────────────────┘
```

### The 6 Wizard Steps

#### Step 1: Industry Selection

Choose your vertical. This auto-configures which modules are enabled:

| Industry | Auto-Enabled Modules |
|----------|---------------------|
| Gaming | Brain, Decode, Dream, Nexus |
| Software | Brain, Decode, Nexus, Vision |
| Enterprise | Brain, Vision, Nexus, Modernizer, Integration |
| Healthcare | Brain, Defense, Vision, Nexus |
| Legal | Brain, Decode, Defense, Dream |
| Education | Brain, Decode, Dream, Nexus |

#### Step 2: White Labeling

```
┌─────────────────────────────────────────────────┐
│  Step 2 of 6: BRANDING                          │
├─────────────────────────────────────────────────┤
│                                                 │
│  🎨 MAKE IT YOURS                               │
│                                                 │
│  Company Name: [________________]               │
│                                                 │
│  Primary Color: [#00D4FF ▼]                     │
│                                                 │
│  Logo: [Upload Logo]                            │
│                                                 │
│  Tagline: [________________]                    │
│                                                 │
│  Theme:                                         │
│  ○ Dark Mode (default)                          │
│  ○ Light Mode                                   │
│  ○ Match System                                 │
│                                                 │
│              [← Back]  [Continue →]             │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Step 3: Layout Selection

```
┌─────────────────────────────────────────────────┐
│  Step 3 of 6: LAYOUT                            │
├─────────────────────────────────────────────────┤
│                                                 │
│  📐 CHOOSE YOUR SETUP                           │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ FULL     │  │ DASHBOARD│  │ EMBEDDED │       │
│  │          │  │   ONLY   │  │   API    │       │
│  │ Marketing│  │          │  │          │       │
│  │ + OS     │  │ OS Only  │  │ Headless │       │
│  │ Dashboard│  │ No Public│  │ No UI    │       │
│  └──────────┘  └──────────┘  └──────────┘       │
│       ●             ○             ○             │
│                                                 │
│              [← Back]  [Continue →]             │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Step 4: Module Activation

```
┌─────────────────────────────────────────────────┐
│  Step 4 of 6: MODULES                           │
├─────────────────────────────────────────────────┤
│                                                 │
│  ⚡ ACTIVATE CAPABILITIES                        │
│                                                 │
│  Pre-selected based on Enterprise:              │
│                                                 │
│  KERNEL LAYER                                   │
│  [✓] Core (Required)                            │
│  [✓] Ripple (Required)                          │
│  [✓] Access (Required)                          │
│                                                 │
│  COGNITIVE LAYER                                │
│  [✓] Brain — Memory & Learning                  │
│  [ ] Decode — Natural Language Interface        │
│  [ ] Dream — Evolution & Self-Improvement       │
│                                                 │
│  OPERATIONAL LAYER                              │
│  [✓] Defense — Security & Protection            │
│  [✓] Nexus — AI Routing                         │
│  [✓] Vision — Monitoring                        │
│  [✓] Integration — Enterprise Connectivity      │
│                                                 │
│  ADMIN LAYER                                    │
│  [✓] System — Operations                        │
│  [✓] Modernizer — Self-Upgrade                  │
│                                                 │
│              [← Back]  [Continue →]             │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Step 5: AI Provider Setup

```
┌─────────────────────────────────────────────────┐
│  Step 5 of 6: AI PROVIDERS                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  🤖 CONNECT YOUR AI                             │
│                                                 │
│  The substrate routes to multiple providers.    │
│  Add at least one API key:                      │
│                                                 │
│  Free Tier (Recommended):                       │
│  [✓] Groq       [Enter Key →]                   │
│  [✓] Cerebras   [Enter Key →]                   │
│  [ ] Together   [Enter Key →]                   │
│                                                 │
│  Premium (Optional):                            │
│  [ ] OpenAI     [Enter Key →]                   │
│  [ ] Anthropic  [Enter Key →]                   │
│  [ ] Google     [Enter Key →]                   │
│                                                 │
│  ℹ️ Free tiers provide ~16,000 calls/day        │
│                                                 │
│              [← Back]  [Continue →]             │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Step 6: Storage & Quotas

```
┌─────────────────────────────────────────────────┐
│  Step 6 of 6: RESOURCES                         │
├─────────────────────────────────────────────────┤
│                                                 │
│  💾 SET YOUR LIMITS                             │
│                                                 │
│  Memory Retention:                              │
│  ○ 30 days (minimal)                            │
│  ● 90 days (recommended)                        │
│  ○ 365 days (archival)                          │
│  ○ Forever (no cleanup)                         │
│                                                 │
│  Backup Frequency:                              │
│  ● Daily (recommended)                          │
│  ○ Weekly                                       │
│  ○ Manual only                                  │
│                                                 │
│  Storage Budget:                                │
│  [ 10 ] GB (backups auto-rotate at limit)       │
│                                                 │
│              [← Back]  [🚀 Install]             │
│                                                 │
└─────────────────────────────────────────────────┘
```

### After the Wizard

```
┌─────────────────────────────────────────────────┐
│  ✅ INSTALLATION COMPLETE                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  Your substrate is ready!                       │
│                                                 │
│  ✓ 8 modules activated                          │
│  ✓ Enterprise profile configured                │
│  ✓ 2 AI providers connected                     │
│  ✓ 90-day retention policy set                  │
│  ✓ Daily backups enabled                        │
│                                                 │
│  📊 Health Score: 100%                          │
│  🧠 Memory: 0 records (ready to learn)          │
│  🔌 Status: All systems operational             │
│                                                 │
│  NEXT STEPS:                                    │
│                                                 │
│  → Access OS Dashboard: /os                     │
│  → Run first command: brain.store               │
│  → Read documentation: /docs                    │
│                                                 │
│              [Open Dashboard →]                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Duplicating Without Code

### The No-Code Path

You don't need Lovable (or any code editor) to deploy a substrate:

```
SELLER (You)                    BUYER (Customer)
─────────────                   ─────────────────

1. Export package               1. Receives ZIP file
   from your project      →     
                                2. Uploads to their
2. Share download link             hosting platform
                          →     
                                3. Runs Install Wizard
3. (Optional) Provide              (no code required)
   onboarding support     →     
                                4. Uses substrate
                                   immediately
```

### What Gets Cloned

When someone installs your package:

| Included | Not Included |
|----------|--------------|
| ✅ All module code | ❌ Your API keys |
| ✅ Database schema | ❌ Your data |
| ✅ UI components | ❌ Your backups |
| ✅ Wizard config | ❌ Your analytics |
| ✅ Documentation | ❌ Your users |

They get a **fresh substrate** with your structure but their own data.

---

## Templates for Different Industries

### Pre-Built Configurations

The package system supports templates — pre-configured setups for specific use cases:

```
Available Templates:
═══════════════════════════════════════════════════

🎮 GAMING STUDIO
   Modules: Brain, Decode, Dream, Nexus
   Features: NPC memory, world state, player history
   Retention: 365 days (long-term narrative)
   
💼 ENTERPRISE OPERATIONS  
   Modules: Brain, Vision, Nexus, Modernizer, Integration
   Features: Process automation, monitoring, self-improvement
   Retention: 90 days (compliance-friendly)
   
🏥 HEALTHCARE AI
   Modules: Brain, Defense, Vision, Nexus
   Features: Secure memory, audit trails, HIPAA-ready
   Retention: 7 years (regulatory requirement)
   
⚖️ LEGAL PRACTICE
   Modules: Brain, Decode, Defense, Dream
   Features: Case memory, document analysis, learning
   Retention: Forever (case archive)
   
📚 EDUCATION PLATFORM
   Modules: Brain, Decode, Dream, Nexus
   Features: Student progress, adaptive learning
   Retention: Per semester (configurable)
```

### Creating Custom Templates

```
substrate:// system.template_create

Template Builder
═══════════════════════════════════════════════════

Template Name: [My Custom Template]

Base Template: ○ Blank  ● Enterprise  ○ Gaming

Module Overrides:
├── Add: [ ] Decode
├── Remove: [ ] Modernizer
└── Custom Config: [Edit →]

Default Secrets Required:
├── GROQ_API_KEY (required)
├── OPENAI_API_KEY (optional)
└── [+ Add Secret →]

Export as:
● Wizard Template (6-step install)
○ Quick Deploy (2-step install)
○ Headless (API-only)

[Create Template →]
```

---

## Emergency Recovery

### If Everything Breaks

Even if the OS dashboard is down, you can recover:

```
EMERGENCY RESTORE (Last Resort)
═══════════════════════════════════════════════════

Option 1: Automatic Recovery
────────────────────────────
If health drops below 40%, the system auto-triggers:
1. Emergency heal attempt
2. If heal fails → Restore from last daily backup
3. Notifies admin via configured channels

Option 2: Manual Database Restore
────────────────────────────────
Direct database access (if available):
1. Find backup in daily_backups table
2. Download backup_path file
3. Run pf-backup-import function manually

Option 3: Support Recovery
────────────────────────────
Contact support with:
- Project ID
- Last known working date
- Error messages (if any)
```

---

## Best Practices

### Backup Strategy

1. **Daily Automatic:** Let the system handle it
2. **Before Changes:** Manual backup before big updates
3. **Permanent Failsafe:** Keep one "golden" backup
4. **Weekly Export:** Download a portable copy

### Restoration Guidelines

1. **Always Preview:** Use `--dry-run` first
2. **Safety First:** The system creates a safety backup before restore
3. **Test After:** Verify functionality after restoration
4. **Document:** Note why you restored (for future reference)

### Package Distribution

1. **Never Include Secrets:** Always use "Sellable" type for sharing
2. **Test Wizard:** Run through the wizard yourself first
3. **Document Requirements:** Tell buyers what API keys they need
4. **Support Path:** Provide a way to get help

---

## Summary

| Feature | What It Does | When to Use |
|---------|--------------|-------------|
| **Daily Backup** | Automatic snapshots | Always (default) |
| **Manual Backup** | On-demand snapshots | Before changes |
| **Failsafe Backup** | Protected master copy | Emergency recovery |
| **Export Package** | Downloadable ZIP | Migration, selling |
| **Install Wizard** | Guided setup | New deployments |
| **Templates** | Pre-configured setups | Quick starts |

---

## Next Document

→ [23-VERSATILITY-AND-USE-CASES.md](./23-VERSATILITY-AND-USE-CASES.md) — How one substrate serves many industries
