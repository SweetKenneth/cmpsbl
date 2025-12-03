# Changelog

All notable changes to PromptFluid Reflex will be documented in this file.

## [1.5.3] - 2025-11-01

### Added
- **Premium Dashboard Experience**: Complete UX overhaul with modern, fluid design inspired by 2026-era software
- **Installation Wizard**: 5-step animated setup guide for first-time users
  - Welcome screen with plugin overview
  - Sensitivity selection (Balanced/Strict/Custom)
  - Live malware scan with progress animation
  - Email alert configuration
  - Success screen with next steps
- **Toast Notification System**: Real-time feedback for all user actions
  - Success, error, warning, and info toast types
  - Auto-dismiss with progress indicators
  - Smooth animations and transitions
- **Live Module Toggles**: Interactive enable/disable switches for all protection layers
  - Instant visual feedback
  - Loading states during activation
  - Success confirmation toasts
- **Activity Feed**: Real-time threat monitoring with live updates
- **Enhanced Security Score**: Animated protection status indicator
- **Masked API Keys**: Secure credential display with show/hide toggle
- **Smart Onboarding**: First-install detection with automatic wizard redirect

### Improved
- Dashboard now provides immediate "protected" feeling with live status indicators
- License activation provides celebratory feedback and instant dashboard updates
- Stripe upgrade flow includes success modals and automatic feature unlocking
- All AJAX actions now provide real-time feedback via toast notifications
- Module states persist instantly with visual confirmation

### Technical Details
- Created new wizard UI at `/admin/pages/wizard.php`
- Implemented toast notification system (`toast-notifications.js`, `toast-notifications.css`)
- Added dashboard enhancements module (`dashboard-enhancements.js`)
- Extended AJAX handlers for real-time module toggling and dashboard actions
- Added automatic wizard redirect on first activation via `pfdef_activation_redirect` option

## [1.5.2] - 2025-11-01

### Fixed
- **Critical**: Stripe checkout integration - upgrade buttons now properly redirect to secure Stripe checkout pages
- **Critical**: Hardcoded Supabase API configuration for reliable payment processing across all WordPress installations
- Enhanced error logging for payment system debugging
- Improved error messages when checkout fails
- All admin page references updated to use 'promptfluid-reflex' naming convention

### Technical Details
- Fixed AJAX handler `pfdef_create_checkout` to use correct payload structure (`priceId`, `billingInterval` instead of legacy `price_id`)
- Added comprehensive error logging to WordPress error log for debugging payment issues
- Embedded Supabase URL and anon key directly in plugin for consistent API access
- Updated success/cancel URLs to match new admin page slug (`promptfluid-reflex-upgrade`)
- Added plugin version to checkout metadata for better tracking

## [1.5.1] - 2025-10-31

### Changed
- Enhanced plugin description showcasing full enterprise security suite
- Updated readme.txt to properly describe all protection layers
- Improved tier breakdown and feature descriptions

## [1.5.0] - 2025-10-31

### Changed
- **Major Backend Refactor**: Consolidated 110+ individual edge functions into 5 unified gateway functions
  - `pf-core`: System management and configuration
  - `pf-brain`: AI learning and intelligence
  - `pf-reflex`: Security and threat detection
  - `pf-access`: Accessibility and compliance
  - `pf-marketing`: Marketing automation and analytics
- **Improved Architecture**: Cleaner, more maintainable codebase with reduced technical debt
- **Enhanced Error Handling**: Fixed TypeScript error handling across 18+ edge functions
- **Optimized Configuration**: Reduced config.toml from 450+ entries to 24 essential functions
- **Performance Improvements**: Streamlined function calls and reduced overhead

### Fixed
- TypeScript error handling in checkout, subscription, and ML functions
- Error message extraction consistency across all edge functions
- Type safety improvements in research and quota management functions

### Removed
- 110+ deprecated individual function folders (consolidated into gateways)
- Redundant configuration entries
- Legacy function references

## [1.0.0] - 2025-10-31

### Added
- **Initial Release** of PromptFluid Reflex
- **AI-Powered Bot Detection** with behavioral analysis engine
- **Smart Learning System** with adaptive thresholds
- **File Integrity Monitoring** for 1000+ WordPress core files
- **Web Application Firewall** with 8 default security rules
- **Login Guard** with brute force protection (5-attempt lockout)
- **Malware Scanner** with 13 threat signatures
- **Real-Time Threat Analytics** dashboard
- **Security Overview** with system health monitoring
- **Automated Cron Jobs** for nightly security scans
- **GDPR-Compliant Logging** with IP anonymization
- **Complete REST API** for remote management
- **Licensing System** with tiered feature access (Lite/Pro/Complete/Sentinel)
- **Email Digest Reports** (weekly/monthly)
- **Analytics** with CSV export
- **Challenge UI** for suspicious traffic
- **Frontend and REST API Protection**
- **Auto-Remediation Capabilities** (Complete tier)
- **Red Team Simulator** (Complete tier)

### Security
- Behavioral analysis detects human vs. bot patterns
- SQL injection protection
- XSS (Cross-Site Scripting) prevention
- RCE (Remote Code Execution) blocking
- File upload validation
- Path traversal protection
- Command injection prevention
- LDAP injection blocking

### Performance
- Lightweight architecture with <50ms overhead
- Compatible with all major caching plugins
- Optimized database queries
- Efficient behavioral tracking
- Minimal memory footprint

### Compliance
- GDPR compliant data handling
- Optional IP anonymization
- Automatic log deletion (30-day default)
- Data export/deletion hooks
- Privacy-focused architecture

---

## Milestone Summary

**v1.5.0**: Backend consolidation and optimization milestone
**v1.0.0**: Initial public release with full security suite
