# PromptFluid Defense - React Admin Dashboard

Modern single-page admin interface for PromptFluid Defense WordPress plugin.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development mode (hot reload)
npm run dev

# Production build
npm run build
```

## 📦 Build Output

Production build generates:
- `../dist/pfdef-admin.js` - Compiled React application
- `../dist/pfdef-admin.css` - Compiled styles

These files are automatically loaded by WordPress.

## 🏗️ Architecture

- **React 18** - UI library
- **Vite** - Build tool
- **Lucide React** - Icon system
- **WordPress REST API** - Backend communication

## 🎨 Features

- **SPA Navigation** - No page reloads
- **Real-time Stats** - Live threat monitoring
- **Modern Design** - Gradient cards with animations
- **Setup Wizard** - First-time onboarding
- **REST API Integration** - Secure WordPress communication

## 📂 Structure

```
src/
  ├── App.jsx          # Main application component
  ├── main.jsx         # Entry point
  └── index.css        # Design system styles
```

## 🔌 WordPress Integration

The React app receives configuration via `window.pfdefConfig`:

```javascript
{
  apiUrl: '/wp-json/pfdef/v1',  // REST API base
  nonce: 'abc123...'             // WordPress nonce
}
```

## 🔒 Security

- All API requests include `X-WP-Nonce` header
- WordPress capability checks on backend
- Sanitized inputs and outputs
