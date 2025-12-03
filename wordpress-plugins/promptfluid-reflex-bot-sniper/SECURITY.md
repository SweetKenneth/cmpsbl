# Security Policy

## Reporting Security Issues

If you discover a security vulnerability in PromptFluid Clarity, please email us at:

**PromptFluid@gmail.com**

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Security Features

### Data Protection
- All API keys stored as hashed values
- WordPress nonces for AJAX request validation
- Capability checks on all admin actions
- SQL injection protection via `$wpdb->prepare()`
- Output escaping on all user-facing data

### API Communication
- HTTPS-only API endpoints
- API key authentication required
- Rate limiting enforced server-side
- Request timeout protection

### Database Security
- Prepared statements for all queries
- No direct user input in SQL
- Proper data sanitization
- WordPress options API for settings

### WordPress Integration
- Follows WordPress coding standards
- Leverages WordPress security APIs
- Compatible with security plugins
- No direct file system writes

## Supported Versions

| Version | Supported |
|---------|-----------|
| 3.0.x   | ✅ Yes    |
| < 3.0   | ❌ No     |

## Security Checklist

Before each release:
- [ ] All user inputs sanitized
- [ ] All outputs escaped
- [ ] SQL statements use prepared statements
- [ ] Nonce checks on all AJAX handlers
- [ ] Capability checks enforced
- [ ] API keys stored securely
- [ ] No sensitive data in logs
- [ ] Error messages don't reveal system info
- [ ] HTTPS enforced for API calls
- [ ] Dependencies updated to latest secure versions

## Responsible Disclosure

We follow a responsible disclosure policy:
1. Report received within 24 hours
2. Initial assessment within 48 hours
3. Fix developed and tested within 7 days
4. Security patch released within 14 days
5. Public disclosure 30 days after patch release
