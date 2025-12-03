# WordPress.org Submission Checklist

## Pre-Submission Requirements

### ✅ Code Quality
- [x] Follows WordPress Coding Standards
- [x] All text strings internationalized (`__()`, `_e()`, `esc_html__()`)
- [x] Text domain matches plugin slug: `promptfluid-clarity`
- [x] Proper escaping for all output (`esc_html`, `esc_attr`, `esc_url`)
- [x] Sanitization for all input (`sanitize_text_field`, `sanitize_email`)
- [x] Nonce verification on all AJAX requests
- [x] Capability checks (`current_user_can('manage_options')`)

### ✅ Security
- [x] No SQL injection vulnerabilities (`$wpdb->prepare()` used)
- [x] No XSS vulnerabilities (all output escaped)
- [x] No CSRF vulnerabilities (nonces on all forms)
- [x] API keys stored securely (hashed, not plain text)
- [x] External API calls use `wp_remote_request()`
- [x] No direct file system access
- [x] No `eval()` or similar dangerous functions

### ✅ Functionality
- [x] Plugin activates without errors
- [x] Plugin deactivates cleanly
- [x] Uninstall removes all data (if `uninstall.php` provided)
- [x] No PHP errors or warnings
- [x] Works with latest WordPress version (6.4+)
- [x] Compatible with PHP 7.4+
- [x] Responsive admin interface

### ✅ Documentation
- [x] `readme.txt` follows WordPress format
- [x] Clear plugin description
- [x] Installation instructions provided
- [x] FAQ section included
- [x] Changelog documented
- [x] Screenshots described (when uploaded)
- [x] License specified (GPL-2.0-or-later)

### ✅ Legal & Licensing
- [x] GPL-compatible license (GPL-2.0-or-later)
- [x] LICENSE.txt file included
- [x] No trademark violations
- [x] No proprietary code without permission
- [x] Third-party libraries properly licensed

### ✅ Assets
- [x] Banner images (772x250 and 1544x500)
- [x] Plugin icons (128x128 and 256x256)
- [x] Assets placed in `.wordpress-org/` directory
- [ ] Screenshots (upload during submission)

---

## Submission Process

### Step 1: Build Plugin Package
```bash
cd wordpress-plugin
chmod +x create-clarity-package.sh
./create-clarity-package.sh
```

This creates `promptfluid-clarity.zip`

### Step 2: Test on Clean WordPress Install
1. Install fresh WordPress 6.4+
2. Upload and activate plugin
3. Complete setup wizard
4. Run accessibility scan
5. Verify no PHP errors
6. Check browser console for JS errors
7. Test on PHP 7.4, 8.0, 8.1, 8.2

### Step 3: Submit to WordPress.org
1. Go to https://wordpress.org/plugins/developers/add/
2. Upload `promptfluid-clarity.zip`
3. Fill out submission form:
   - Plugin name: **PromptFluid Clarity**
   - Short description: **AI-powered WCAG 2.2 accessibility scanner**
   - Plugin tags: `accessibility, wcag, ada, compliance, a11y`
   - Category: **SEO & Accessibility**

### Step 4: SVN Setup (After Approval)
```bash
svn co https://plugins.svn.wordpress.org/promptfluid-clarity
cd promptfluid-clarity

# Copy files to trunk
cp -r /path/to/plugin/* trunk/

# Copy assets
cp -r /path/to/.wordpress-org/* assets/

# Commit to SVN
svn add trunk/*
svn add assets/*
svn ci -m "Initial commit of PromptFluid Clarity v3.0.0"

# Tag release
svn cp trunk tags/3.0.0
svn ci -m "Tagging version 3.0.0"
```

---

## Post-Submission

### Review Process Timeline
- **Automated checks:** < 1 hour
- **Manual review:** 1-7 days (average 3 days)
- **Approval notification:** Email from plugins@wordpress.org

### After Approval
1. Set up SVN repository
2. Upload plugin files to `trunk/`
3. Upload assets to `assets/`
4. Create version tag
5. Plugin goes live within 15 minutes

### Marketing
1. Announce on PromptFluid blog
2. Share on social media
3. Add to WordPress.org favorites
4. Request reviews from beta users
5. Submit to accessibility blogs/newsletters

---

## Common Rejection Reasons

### ❌ Avoid These
- [ ] Obfuscated code
- [ ] Phone home without explicit user consent
- [ ] Undisclosed external API calls
- [ ] Trademark violations
- [ ] Including library files already in WordPress
- [ ] Poor security practices
- [ ] Incomplete readme.txt

### ✅ Ensure These
- [x] All code readable and documented
- [x] API calls disclosed in readme
- [x] User consent for data transmission
- [x] Proper licensing
- [x] Security best practices followed
- [x] Complete documentation

---

## Support Channels

After plugin is live:
- WordPress.org support forum (monitored daily)
- Email: support@promptfluid.com
- Documentation: https://www.promptfluid.com/clarity/docs

---

## Update Process

For future updates:
1. Increment version in `promptfluid-clarity.php`
2. Update `readme.txt` changelog
3. Update `Stable tag` in `readme.txt`
4. Build new package
5. Test thoroughly
6. Commit to SVN trunk
7. Create new tag (`svn cp trunk tags/X.X.X`)
8. Auto-update triggers for all users

---

## Monitoring

Track plugin success:
- Active installations
- 5-star reviews
- Support ticket volume
- Upgrade conversion rate (Free → Pro)
- WordPress.org search rankings

**Target Metrics (90 days post-launch):**
- 1,000+ active installations
- 4.5+ star rating
- <5% support ticket rate
- 10%+ upgrade rate
