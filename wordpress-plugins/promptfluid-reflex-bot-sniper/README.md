# PromptFluid Clarity - AI Accessibility Scanner

AI-powered WCAG 2.2 accessibility scanner for WordPress with automated fixes powered by PromptFluid Brain.

## 🚀 Quick Start

### Build React Admin Dashboard
```bash
cd admin/react-admin
npm install
npm run build
cd ../..
```

### Create Distribution Package
```bash
chmod +x create-clarity-package.sh
./create-clarity-package.sh
```

This creates `promptfluid-clarity.zip` in the root directory.

## 📁 File Structure

```
wordpress-plugin/
├── promptfluid-clarity.php       # Main plugin file
├── config.php                     # Configuration management
├── includes/                      # Modular PHP classes
│   ├── class-scanner.php         # Accessibility scanner
│   ├── class-api-client.php      # Backend API communication
│   ├── class-subscription.php    # Stripe subscription management
│   └── class-admin.php           # Admin interface & AJAX
├── admin/
│   └── react-admin/              # React dashboard
│       ├── src/                  # Source files
│       ├── dist/                 # Built assets (after npm run build)
│       └── package.json
└── create-clarity-package.sh     # Packaging script
```

## 🔌 Backend Integration

### Edge Functions (Supabase)
- **pf-clarity-scan**: Performs WCAG 2.2 accessibility scans
- **pf-clarity-fix**: Automated issue remediation using AI
- **pf-clarity-plugin-info**: Plugin update information

All functions are registered in `supabase/config.toml` with `verify_jwt = false` for public access.

## 🎯 Features

- ✅ AI-powered WCAG 2.2 scanning
- ✅ Automated fix suggestions
- ✅ Modern React admin dashboard
- ✅ Compliance scoring (0-100%)
- ✅ Stripe subscription integration
- ✅ 7-day free trial
- ✅ Scheduled scans via WordPress Cron
- ✅ Detailed remediation guidance

## 🧪 Testing

1. Install on a clean WordPress site
2. Activate the plugin
3. Navigate to **Clarity** in the admin menu
4. Run your first scan
5. Review accessibility issues
6. Apply automated fixes

## 📦 Distribution

The package excludes:
- Source files (React src/)
- Development dependencies (node_modules)
- Build configuration
- Documentation files
- Git metadata

Only production-ready files are included in the ZIP.

## 🔧 Development

### Modify React Dashboard
```bash
cd admin/react-admin
npm run dev  # Start development server
```

### Rebuild for Distribution
```bash
npm run build
cd ../..
./create-clarity-package.sh
```

## 📊 Version History

**v3.0.0** - Current Release
- Modular PHP architecture
- React admin dashboard
- AI-powered scanning and fixes
- Stripe subscription management

## 🌐 PromptFluid Ecosystem

PromptFluid Clarity integrates with:
- **PromptFluid Brain**: AI learning and optimization
- **PromptFluid Nexus**: Multi-model AI routing
- **PromptFluid Vision**: Unified admin dashboard

## 📝 License

GPL v2 or later

## 🆘 Support

For issues or questions:
- WordPress.org Support Forum
- https://www.promptfluid.com/clarity
