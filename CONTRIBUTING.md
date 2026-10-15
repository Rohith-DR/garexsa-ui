# Contributing to Garexsa UI

Thank you for your interest in contributing to Garexsa UI! This document provides guidelines for contributing to the project.

## Code of Conduct

Be respectful, inclusive, and professional. We welcome contributions from everyone.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](../../issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - System information (OS, version, etc.)
   - Relevant logs from `%APPDATA%\garexsa-ui\garexsa.log` (Windows) or `~/.config/garexsa-ui/garexsa.log` (Linux)

### Suggesting Features

1. Check if the feature has been suggested in [Issues](../../issues) or [Discussions](../../discussions)
2. Create a new issue or discussion with:
   - Clear description of the feature
   - Use case and benefits
   - Possible implementation approach (optional)

### Submitting Pull Requests

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/garexsa-ui.git
   cd garexsa-ui
   ```

3. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes:**
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

5. **Test your changes:**
   ```bash
   npm start  # Test in development mode
   npm run build-lite  # Test build
   ```

6. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Add: brief description of changes"
   ```

   Commit message format:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Update:` for updates to existing features
   - `Docs:` for documentation changes
   - `Refactor:` for code refactoring

7. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Create Pull Request:**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template with:
     - Description of changes
     - Related issue number (if any)
     - Testing done
     - Screenshots (if UI changes)

## Development Setup

### Prerequisites
- Node.js 18+
- npm 9+
- Python 3.11 (for downloading backend dependencies)
- Git

### Setup
```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/garexsa-ui.git
cd garexsa-ui

# Install dependencies
npm install

# Download backend dependencies (see README.md)

# Run in development mode
npm start
```

## Code Style

### JavaScript
- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Add comments for complex logic
- Follow existing code patterns

### Python
- Follow PEP 8
- Use 4 spaces for indentation
- Add docstrings for functions
- Use type hints where appropriate

### Vue.js
- Follow Vue.js style guide
- Use composition API where possible
- Keep components focused and reusable

## Project Structure

```
garexsa-ui/
├── frontend/          # Vue.js frontend
│   ├── index.html
│   ├── sidebar.js
│   └── ...
├── backend/           # Python backend setup
│   └── setup_venv.py
├── build/             # Build scripts and resources
│   ├── installer.nsh
│   └── README.txt
├── docs/              # Documentation
├── main.js            # Electron main process
├── preload.js         # Electron preload script
├── package.json       # Node.js dependencies
├── package-lite.json  # Lite build config
└── package-full.json  # Full build config
```

## Testing

### Manual Testing Checklist
- [ ] App launches without errors
- [ ] Backend starts successfully
- [ ] Model is detected
- [ ] Chat functionality works
- [ ] Settings are saved
- [ ] Logs are written correctly
- [ ] App closes cleanly

### Test on Multiple Platforms
- [ ] Windows 10
- [ ] Windows 11
- [ ] Ubuntu 20.04+
- [ ] Debian 11+

## Documentation

When adding features or changing behavior:
- Update README.md if user-facing
- Add/update docs in `docs/` folder
- Update inline code comments
- Add examples if applicable

## Release Process

(For maintainers)

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create release notes
4. Build all versions
5. Test all builds
6. Create GitHub release with binaries
7. Update documentation

## Questions?

- Open a [Discussion](../../discussions)
- Check existing [Issues](../../issues)
- Review [Documentation](docs/)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Garexsa UI! 🎉**
