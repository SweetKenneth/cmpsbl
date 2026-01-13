# Cascade Coder

**Version:** 1.0  
**Status:** Labs / Experimental

## What is Cascade Coder?

Cascade Coder is a new mode for Cascade that generates **structured code patches** for different projects. Instead of chatting or dreaming, Coder Mode focuses on producing precise, copy-paste-ready specifications that tell you (or an AI assistant) exactly what files to create/modify and what code to write.

Think of it as having a senior architect sketch out a feature before you start coding.

## How to Use It

### 1. Open Cascade Coder

Navigate to `/cascade/coder` in your app, or click **Cascade Coder (Labs)** in the navigation menu.

### 2. Select a Target Project

Use the dropdown to pick which project you want to generate code for:
- **PromptFluid Core** — Main ecosystem app
- **SimNap / Dream-Eater** — AI consciousness system
- **CLPSBL Portfolio** — Creative portfolio site
- **Bot Sniper WordPress Plugin** — PHP bot detection plugin
- **Clarity Browser Extension** — Accessibility scanner
- **Cascade Standalone** — Portable orchestrator

Each project has its tech stack pre-configured, so Cascade knows what conventions to follow.

### 3. Describe Your Change

In the text area, explain what you want to build or fix. Be specific:

**Good examples:**
- \"Create a new /about page that explains PromptFluid's mission and lists the core products with icons.\"
- \"Add a dark mode toggle to the header that persists the user's preference in localStorage.\"
- \"Fix the bug where the sidebar doesn't close on mobile after clicking a link.\"

**Less helpful:**
- \"Make it better\"
- \"Add some features\"

### 4. Add File Hints (Optional)

If you know which files or directories are relevant, add hints:
- `src/pages/`
- `Focus on Header.tsx and Sidebar.tsx`
- `The auth logic is in src/contexts/AuthContext.tsx`

### 5. Generate the Patch

Click **Ask Cascade to design a patch**. After a few seconds, you'll see a structured output with:
- **Patch Title** — What this change accomplishes
- **Summary** — Quick overview
- **Files** — Each file that needs changes, with:
  - Path
  - Intent (why this file is changing)
  - Operations (create, modify, delete)
  - Code blocks
- **Notes** — Warnings, manual steps, or things to consider

### 6. Copy and Apply

- Use **Copy Full Patch** to grab the entire YAML spec
- Use the copy button on individual code blocks
- Apply changes manually or feed the patch into your automation pipeline

---

## Adding a New Project

Projects are defined in `src/lib/cascade/projects.ts`. To add a new one:

### Step 1: Open the file

```typescript
// src/lib/cascade/projects.ts
```

### Step 2: Add your project to the array

```typescript
export const cascadeProjects: CascadeProject[] = [
  // ... existing projects ...
  
  {
    id: 'my-new-project',              // Unique slug (lowercase, hyphens)
    name: 'My New Project',            // Human-readable name
    description: 'A brief description of what this project does and its purpose.',
    stack: 'React + Node.js + MongoDB', // Tech stack (be specific!)
    notes: 'Any constraints: read-only, experimental, no auto-migrations, etc.'
  }
];
```

### Step 3: Update the edge function (optional)

If you want server-side validation, also add the project to `supabase/functions/pf-cascade-coder/index.ts`:

```typescript
const VALID_PROJECTS: Record<string, { name: string; stack: string; description: string }> = {
  // ... existing projects ...
  
  'my-new-project': {
    name: 'My New Project',
    stack: 'React + Node.js + MongoDB',
    description: 'A brief description...'
  }
};
```

### Tips for Good Project Entries

- **Be specific about the stack** — \"React + TypeScript + Tailwind\" is better than \"JavaScript\"
- **Describe the purpose** — Helps Cascade understand context
- **Add constraints in notes** — \"No migrations\", \"WordPress coding standards\", etc.

---

## How the API Works

### Endpoint

```
POST /functions/v1/pf-cascade-coder
```

### Request Body

```json
{
  "projectId": "promptfluid-core",
  "request": "Create a new settings page with user preferences",
  "fileHints": "src/pages/, src/components/ui/"
}
```

### Response

```json
{
  "success": true,
  "projectId": "promptfluid-core",
  "yaml": "patch_title: \"Add User Settings Page\"
...",
  "parseSuccess": true
}
```

### Error Responses

- `400` — Invalid projectId or missing request
- `402` — Out of AI credits
- `429` — Rate limited
- `500` — Server error

---

## Current Limitations

1. **Patches are suggestions only** — Review before applying
2. **No auto-apply yet** — Manual copy/paste required
3. **No file system access** — Cascade doesn't know your actual file contents
4. **YAML parsing is basic** — Complex patches may need manual formatting

---

## Future Plans

- [ ] Auto-apply patches via GitHub PR
- [ ] Connect to actual repos for context-aware generation
- [ ] Job queue for batch patch generation
- [ ] Version control for generated patches
- [ ] Integration with Lovable's editor

---

## Troubleshooting

### \"Invalid projectId\" error
Make sure the project ID matches exactly what's in `cascadeProjects.ts`.

### Patches look incomplete
Try being more specific in your request. Include file paths if you know them.

### Rate limit errors
Wait a minute and try again. Consider breaking large requests into smaller patches.

### Parsing fails (raw YAML shown)
The generated YAML may have formatting issues. Copy it anyway and manually fix indentation if needed.

---

## Questions?

This is an experimental feature. If something's broken or confusing, file an issue or ping Kenneth.
