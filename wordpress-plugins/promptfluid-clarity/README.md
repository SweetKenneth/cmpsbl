# PromptFluid Clarity v3.0.0

AI-powered WCAG 2.2 accessibility scanner for WordPress with intelligent remediation via PromptFluid Nexus.

## Features

- 🤖 AI-powered accessibility scanning via Nexus router (no Lovable AI dependencies)
- ♿ WCAG 2.2 Level AA & AAA compliance checking
- 🔧 Automated fix suggestions and application
- 📊 Comprehensive reporting and analytics
- 🧠 Learning system via PromptFluid Brain
- 🚀 Fast, modular, PSR-4 compliant architecture

## Architecture

```
promptfluid-clarity/
├── promptfluid-clarity.php    # Main plugin file
├── config.php                  # Nexus-only configuration
├── composer.json               # PSR-4 autoloading
├── uninstall.php              # Clean uninstall
├── includes/                   # Core classes
│   ├── class-clarity-core.php
│   ├── class-clarity-loader.php
│   ├── class-clarity-scanner.php
│   ├── class-clarity-fixer.php
│   ├── class-clarity-api-client.php
│   ├── class-clarity-licensing.php
│   └── class-clarity-logger.php
├── admin/                      # Admin interface
│   ├── class-clarity-admin.php
│   ├── class-clarity-dashboard.php
│   └── assets/
│       ├── css/
│       └── js/
└── public/                     # Frontend components
    └── class-clarity-frontend.php
```

## Installation

1. Upload to `/wp-content/plugins/promptfluid-clarity/`
2. Run `composer install` (optional, has fallback autoloader)
3. Activate via WordPress admin
4. Configure API keys in Settings

## Configuration

Copy `.env.example` to `.env` and configure:

```env
PF_NEXUS_API=https://your-nexus-api.com/v1
PF_BRAIN_ENDPOINT=https://your-brain.com/v1/pf-brain-learn
PF_NEXUS_ROUTER=https://your-nexus.com/v1/pf-nexus-router
PFCLARITY_SERVICE_KEY=your_service_key
```

## Development Status

**Phase 1: ✅ Scaffold Complete**
- Modular architecture established
- PSR-4 autoloading configured
- Nexus-only routing implemented
- Database tables created
- Admin interface skeleton ready

**Phase 2: 🚧 Coming Next**
- Actual scanning logic via Nexus
- AI-powered fix generation
- Real-time issue detection
- Automated fix application

**Phase 3: 📋 Planned**
- Frontend accessibility widget
- Real-time fix injection
- Advanced reporting dashboard
- Multi-site support

## License

GPL-2.0-or-later

## Support

https://www.promptfluid.com/support
