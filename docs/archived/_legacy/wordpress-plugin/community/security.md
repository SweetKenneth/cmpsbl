# Security Policy

## Supported Versions

We release security patches for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of PromptFluid Defense seriously. If you discover a security vulnerability, please follow these guidelines:

### Do NOT:

* Open a public GitHub issue
* Disclose the vulnerability publicly before it's been addressed
* Exploit the vulnerability beyond what's necessary to demonstrate it

### Do:

1. **Email us privately** at PromptFluid@gmail.com
2. **Include detailed information**:
   * Description of the vulnerability
   * Steps to reproduce
   * Potential impact
   * Affected versions
   * Any suggested fixes

3. **Allow reasonable time** for us to address the issue before public disclosure (typically 90 days)

### What to Expect

* **Acknowledgment**: We'll acknowledge your report within 48 hours
* **Updates**: We'll keep you informed of our progress
* **Credit**: We'll credit you in the security advisory (unless you prefer to remain anonymous)
* **Patch**: We'll release a security patch as soon as possible

### Security Best Practices for Users

When using PromptFluid Defense:

1. **Keep Updated**: Always use the latest version
2. **Secure Your API Keys**: Never share your PromptFluid API key
3. **Use Strong Passwords**: For your WordPress admin account
4. **Regular Backups**: Maintain regular site backups
5. **Monitor Logs**: Check security logs regularly in the dashboard
6. **Whitelist Carefully**: Only whitelist trusted IP addresses
7. **Test Updates**: Test plugin updates on staging before production

### Security Features

PromptFluid Defense includes:

* **Input Sanitization**: All user inputs are sanitized
* **Output Escaping**: All outputs are properly escaped
* **Nonce Verification**: All forms use WordPress nonces
* **Capability Checks**: Admin functions require proper permissions
* **SQL Injection Protection**: Prepared statements for all queries
* **XSS Prevention**: Content Security Policy headers
* **CSRF Protection**: Token-based form validation
* **Path Traversal Prevention**: Strict file access controls

### Third-Party Dependencies

We regularly review and update third-party dependencies for security issues. Current dependencies:

* WordPress Core (5.8+)
* PHP (7.4+)

### Security Audits

* Internal security review before each release
* Automated vulnerability scanning
* Code review process for all changes
* Penetration testing for major releases

### Compliance

PromptFluid Defense is designed to comply with:

* GDPR (General Data Protection Regulation)
* CCPA (California Consumer Privacy Act)
* WordPress Plugin Guidelines
* OWASP Top 10 Security Risks

### Bug Bounty

We currently do not have a formal bug bounty program, but we appreciate responsible disclosure and will credit security researchers who help us improve the plugin's security.

## Contact

* **Security Issues**: PromptFluid@gmail.com
* **General Support**: PromptFluid@gmail.com
* **Website**: https://www.promptfluid.com/products/defense

Thank you for helping keep PromptFluid Defense and its users safe! 🛡️
