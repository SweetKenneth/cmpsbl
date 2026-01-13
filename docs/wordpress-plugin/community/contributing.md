# Contributing to PromptFluid Defense

Thank you for considering contributing to PromptFluid Defense! This document provides guidelines for contributing to the project.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

* **Clear title and description**
* **Steps to reproduce** the behavior
* **Expected behavior** vs actual behavior
* **Screenshots** if applicable
* **WordPress version**, PHP version, and plugin version
* **Error messages** from debug log if available

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

* **Clear title and description**
* **Detailed explanation** of the proposed feature
* **Use cases** - why would this be useful?
* **Examples** from other plugins/products if applicable

### Code Contributions

1. **Fork the repository** and create your branch from `main`
2. **Follow WordPress Coding Standards** for PHP, HTML, CSS, and JavaScript
3. **Write clear commit messages** explaining what changed and why
4. **Test thoroughly** - ensure your changes don't break existing functionality
5. **Update documentation** if needed
6. **Submit a pull request** with a clear description

## Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/promptfluid-defense.git
cd promptfluid-defense

# Install development dependencies (if any)
composer install --dev

# Create a new branch
git checkout -b feature/your-feature-name
```

## Coding Standards

### PHP

* Follow [WordPress PHP Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/php/)
* Use meaningful variable and function names
* Add PHPDoc blocks for all functions and classes
* Sanitize all user inputs
* Escape all outputs
* Use WordPress functions instead of PHP equivalents when available

### JavaScript

* Follow [WordPress JavaScript Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/javascript/)
* Use modern ES6+ syntax where appropriate
* Comment complex logic
* Keep functions focused and testable

### CSS

* Follow [WordPress CSS Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/css/)
* Use semantic class names
* Keep specificity low
* Mobile-first responsive design

## Security

* **Never** commit API keys, passwords, or sensitive data
* Always sanitize user inputs and validate data
* Use WordPress nonces for forms
* Follow WordPress security best practices
* Report security vulnerabilities privately to promptfluid@gmail.com

## Testing

Before submitting:

1. Test on a clean WordPress installation
2. Test with common plugins (caching, security, etc.)
3. Test with different PHP versions (7.4+)
4. Test with different WordPress versions (5.8+)
5. Check for PHP errors and warnings
6. Validate HTML/CSS
7. Test JavaScript console for errors

## Pull Request Process

1. Update README.md and documentation with details of changes
2. Update CHANGELOG.md with your changes
3. The PR will be merged once it receives approval from maintainers
4. Ensure all automated tests pass
5. Be responsive to feedback and questions

## Community

* Be respectful and professional
* Follow our [Code of Conduct](CODE_OF_CONDUCT.md)
* Help others when you can
* Share knowledge and best practices

## License

By contributing, you agree that your contributions will be licensed under the same GPL v2 or later license that covers the project.

## Questions?

Feel free to reach out:

* **Email**: promptfluid@gmail.com
* **Website**: https://www.promptfluid.com/products/defense
* **Issues**: Create an issue on GitHub

Thank you for contributing to PromptFluid Defense! 🛡️
