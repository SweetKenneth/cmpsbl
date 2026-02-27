# PromptFluid Clarity - React Admin Dashboard

Modern React-based admin interface for the PromptFluid Clarity WordPress plugin.

## Development

```bash
npm install
npm run dev
```

## Build for Production

```bash
npm run build
```

This creates optimized assets in the `dist/` folder that WordPress will load.

## Integration

The built files are automatically enqueued by the WordPress plugin's `class-admin.php` file.

## Stack

- React 18
- Vite
- Lucide Icons
- Tailwind-style inline CSS
