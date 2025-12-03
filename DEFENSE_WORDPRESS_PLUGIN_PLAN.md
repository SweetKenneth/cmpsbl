# ⚔️ PromptFluid Defense - WordPress Plugin Development Plan

## Executive Summary

Build a production-ready WordPress security plugin using modern JavaScript/TypeScript with a minimal PHP wrapper. The plugin will leverage PromptFluid's existing Defense ecosystem while providing WordPress-specific bot protection.

---

## Technical Architecture

### Core Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend Bridge**: Minimal PHP for WordPress hooks + REST API registration
- **Data Layer**: WordPress REST API → PromptFluid Defense API
- **Build**: Vite bundled assets compiled to `dist/` and loaded via PHP

### File Structure
```
promptfluid-defense-wp/
├── promptfluid-defense.php          # Main plugin file
├── includes/
│   ├── class-pfdef-activator.php    # Activation hooks
│   ├── class-pfdef-api.php          # REST API registration
│   └── class-pfdef-protection.php   # Core protection logic
├── admin/
│   ├── index.php                    # Admin page loader
│   └── dist/                        # Compiled React app
│       ├── assets/
│       ├── index.js
│       └── index.css
├── src/                             # React source (TypeScript)
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── App.tsx
├── assets/
│   ├── js/
│   │   └── frontend-protection.js   # Invisible JS trap
│   └── css/
│       └── challenge-ui.css
└── package.json
```

---

## Phase-by-Phase Implementation

### Phase 1: Foundation Setup (Week 1)
**Goal**: Create plugin skeleton with activation/deactivation

**Tasks**:
1. Create main plugin file with proper headers
2. Register activation/deactivation hooks
3. Create database tables via dbDelta:
   - `pfdef_detections` - Bot detection logs
   - `pfdef_ip_reputation` - IP reputation cache
   - `pfdef_config` - Plugin settings
4. Add uninstall.php for clean removal
5. Test activation on WordPress 6.0+

**Validation**:
- ✅ Plugin activates without errors
- ✅ Tables created in database
- ✅ Plugin appears in WordPress admin

---

### Phase 2: React Admin Dashboard (Week 2)
**Goal**: Build modern SPA admin interface

**Tasks**:
1. Setup Vite + React + TypeScript build pipeline
2. Create build script that outputs to `admin/dist/`
3. Register admin menu page in WordPress
4. Enqueue compiled JS/CSS assets
5. Build core dashboard components:
   - **Overview**: Real-time stats, threat level
   - **Detections**: Recent bot events log
   - **Settings**: API key, thresholds, actions
   - **Analytics**: Charts with Recharts

**Technical Notes**:
```php
// admin/index.php
function pfdef_enqueue_admin_assets() {
    wp_enqueue_script('pfdef-admin', 
        plugins_url('admin/dist/index.js'), 
        [], PFDEF_VERSION, true);
    
    wp_localize_script('pfdef-admin', 'pfdefConfig', [
        'apiUrl' => rest_url('pfdef/v1/'),
        'nonce' => wp_create_nonce('wp_rest'),
    ]);
}
```

**Validation**:
- ✅ Admin page loads React SPA
- ✅ No console errors
- ✅ WordPress REST API accessible from React

---

### Phase 3: REST API Bridge (Week 3)
**Goal**: Connect WordPress to PromptFluid Defense backend

**Tasks**:
1. Register custom REST API namespace: `/pfdef/v1/`
2. Create endpoints:
   - `GET /pfdef/v1/stats` - Dashboard statistics
   - `GET /pfdef/v1/detections` - Recent detections
   - `POST /pfdef/v1/check-request` - Validate incoming request
   - `POST /pfdef/v1/settings` - Save plugin config
3. Implement proxy to PromptFluid Defense API
4. Add JWT authentication for API calls
5. Cache responses in WordPress transients

**API Structure**:
```php
register_rest_route('pfdef/v1', '/check-request', [
    'methods' => 'POST',
    'callback' => 'pfdef_check_request',
    'permission_callback' => 'pfdef_verify_request',
]);

function pfdef_check_request($request) {
    // Extract fingerprint from request
    // Call PromptFluid Defense API
    // Return allow/challenge/block decision
}
```

**Validation**:
- ✅ REST endpoints return valid JSON
- ✅ Authentication works correctly
- ✅ PromptFluid Defense API connected

---

### Phase 4: Frontend Protection Layer (Week 4)
**Goal**: Add invisible protection to WordPress frontend

**Tasks**:
1. Enqueue `frontend-protection.js` on `wp_footer` hook
2. Implement fingerprinting:
   - Canvas fingerprint
   - WebGL renderer
   - Browser features
   - Mouse/keyboard tracking
3. Send fingerprint + behavioral data to REST API
4. Handle responses:
   - **Allow**: Continue normally
   - **Challenge**: Show CAPTCHA modal
   - **Block**: Display block page
5. Build challenge UI components

**Frontend JS**:
```javascript
// Collect fingerprint asynchronously
const fingerprint = await collectFingerprint();
const behavioral = trackBehavior();

// Send to plugin REST API
const response = await fetch('/wp-json/pfdef/v1/check-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fingerprint, behavioral })
});

const result = await response.json();
if (result.action === 'challenge') {
    showCaptcha(result.challenge);
}
```

**Validation**:
- ✅ Fingerprint collected without blocking page load
- ✅ Bots detected and challenged/blocked
- ✅ Real users experience no friction

---

### Phase 5: Analytics & Reporting (Week 5)
**Goal**: Provide insights and threat intelligence

**Tasks**:
1. Create analytics aggregation functions
2. Build chart components:
   - Detection trends (24h, 7d, 30d)
   - Top threat IPs
   - Action distribution pie chart
   - Risk level heatmap
3. Add CSV export functionality
4. Implement email digest via WordPress cron:
   - Daily/weekly threat summary
   - Top blocked IPs
   - Anomaly alerts
5. Connect to PromptFluid Brain for AI insights

**WordPress Cron**:
```php
// Schedule daily report
add_action('pfdef_daily_report', 'pfdef_send_daily_email');
if (!wp_next_scheduled('pfdef_daily_report')) {
    wp_schedule_event(time(), 'daily', 'pfdef_daily_report');
}
```

**Validation**:
- ✅ Charts display accurate data
- ✅ CSV export works
- ✅ Email reports delivered

---

### Phase 6: Smart Learning Integration (Week 6)
**Goal**: Adaptive AI-powered threat detection

**Tasks**:
1. Connect to PromptFluid Brain learning API
2. Implement local learning layer:
   - Track safe vs malicious patterns
   - Build behavioral baselines per site
   - Adjust thresholds automatically
3. Create "Learning Mode" for training:
   - Monitor traffic without blocking (7 days)
   - Build site-specific profile
   - Auto-tune detection thresholds
4. Add feedback loop:
   - False positive reporting
   - Manual IP whitelist/blacklist
   - Pattern refinement

**Brain Integration**:
```javascript
// Send learning data to PromptFluid Brain
await fetch(PROMPTFLUID_BRAIN_API + '/learn', {
    method: 'POST',
    body: JSON.stringify({
        site_id: siteHash,
        detection_data: events,
        user_feedback: corrections
    })
});
```

**Validation**:
- ✅ Detection accuracy improves over time
- ✅ False positives decrease
- ✅ Brain API integration working

---

### Phase 7: Production Release (Week 7)
**Goal**: Polish, test, and prepare for WordPress.org submission

**Tasks**:
1. Complete rebrand from AetherionShield → PromptFluid Defense
2. Create `readme.txt` for WordPress Plugin Directory
3. Generate plugin banner and icon assets (772×250px, 256×256px)
4. Add internationalization (i18n):
   - Load text domain: `promptfluid-defense`
   - Translate all strings: `__('Text', 'promptfluid-defense')`
5. Security audit:
   - Sanitize all inputs
   - Escape all outputs
   - Verify nonces on forms
   - Check SQL injection prevention
6. Performance optimization:
   - Minify assets
   - Implement caching
   - Lazy load admin scripts
7. Write documentation:
   - Installation guide
   - Configuration tutorial
   - Troubleshooting FAQ

**WordPress.org Requirements**:
```
=== PromptFluid Defense ===
Contributors: kennethreilly
Tags: security, bot-protection, ai, firewall, defense
Requires at least: 5.8
Tested up to: 6.4
Stable tag: 1.0.0
Requires PHP: 7.4
License: GPLv2 or later

AI-powered bot protection and threat intelligence for WordPress.
```

**Validation**:
- ✅ Passes WordPress Plugin Check
- ✅ No PHP errors/warnings
- ✅ GPL-compliant code
- ✅ All strings translatable
- ✅ Works on PHP 7.4+

---

## Integration with PromptFluid Ecosystem

### Connection Points

1. **PromptFluid Brain**:
   - Learning patterns fed back to central Brain
   - AI model improvements benefit all deployments

2. **PromptFluid Defense API**:
   - Centralized threat intelligence
   - Shared IP reputation database
   - Cross-site attack correlation

3. **PromptFluid Vision**:
   - WordPress sites show up in Vision dashboard
   - Aggregate analytics across all properties
   - Unified security monitoring

### Data Flow
```
WordPress Site → Plugin Frontend JS → Plugin REST API
      ↓                                      ↓
  PromptFluid Defense API ← PromptFluid Brain
      ↓                                      ↓
  PromptFluid Vision Dashboard ← Learning Patterns
```

---

## Pricing & Licensing

### Freemium Model

**Free Tier**:
- Local bot detection (no Brain connection)
- Basic analytics (7-day retention)
- Manual IP whitelist/blacklist
- Community support

**Pro Tier** ($19/mo):
- PromptFluid Brain integration
- Advanced behavioral analysis
- 90-day analytics retention
- Email threat reports
- Priority support

**Enterprise** (Custom):
- Multi-site management
- White-label option
- Custom detection rules
- API access
- Dedicated support

---

## Success Metrics

1. **Adoption**: 10,000 active installs in first 6 months
2. **Detection Accuracy**: >95% bot detection rate, <2% false positives
3. **Performance**: <50ms overhead on page load
4. **User Satisfaction**: 4.5+ star rating on WordPress.org

---

## Risk Mitigation

### Technical Risks
- **Risk**: WordPress compatibility issues
  - **Mitigation**: Test on WordPress 5.8-6.4, multiple PHP versions

- **Risk**: Performance impact
  - **Mitigation**: Async fingerprinting, aggressive caching, lazy loading

- **Risk**: False positives blocking real users
  - **Mitigation**: Learning mode, feedback system, manual overrides

### Business Risks
- **Risk**: WordPress.org rejection
  - **Mitigation**: Follow all guidelines, GPL license, security audit

- **Risk**: Low adoption
  - **Mitigation**: Strong marketing, free tier, excellent docs

---

## Next Steps

1. **Immediate**: Create plugin skeleton and test activation
2. **Week 1-2**: Build React admin dashboard + REST API
3. **Week 3-4**: Implement frontend protection layer
4. **Week 5-6**: Add analytics, learning, Brain integration
5. **Week 7**: Polish, test, submit to WordPress.org

---

## References

- WordPress Plugin Handbook: https://developer.wordpress.org/plugins/
- REST API Reference: https://developer.wordpress.org/rest-api/
- React + WordPress: https://github.com/devowlio/wp-react-starter
- Headless WordPress: https://github.com/10up/headstartwp

---

**Status**: 📋 Planning Complete - Ready for Development
**Owner**: Kenneth Reilly
**Last Updated**: 2025-01-31
