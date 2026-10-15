# Changelog

All notable changes to Garexsa UI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-15

### Added
- Initial release of Garexsa UI
- Windows support (installer and portable versions)
- Linux support (.deb package and portable versions)
- Gemma 4 E2B-it model support
- Offline-capable chat interface
- Automatic Python virtual environment setup
- GPU acceleration (NVIDIA CUDA, AMD ROCm)
- Multi-model support
- Chat history management
- Markdown rendering in chat
- Customizable settings (temperature, tokens, etc.)
- System tray integration
- Desktop shortcuts and application menu entries
- Comprehensive documentation
- Cross-platform model symlink management

### Technical
- Electron 28.3.3 desktop framework
- Python 3.11.6 portable runtime
- LiteRT-LM 0.18.0 inference engine
- Vue.js frontend
- OpenAI-compatible API (port 9379)
- Self-contained dependency management
- Runtime virtual environment creation

### Documentation
- Quick Start Guide
- User Guide
- Linux Installation Guide
- Build instructions
- Contributing guidelines
- Troubleshooting guide

---

## [Unreleased]

### Planned Features
- macOS support
- More model support (Phi-3, Mistral, Llama)
- Auto-update mechanism
- Plugin system
- Voice input/output
- Custom model fine-tuning interface
- Multiple language UI support
- Cloud sync (optional)

---

## Release Notes

### v1.0.0 - First Stable Release

This is the first stable release of Garexsa UI, a desktop application for chatting with AI models locally.

**Highlights:**
- Complete privacy - all inference runs locally
- Cross-platform support (Windows & Linux)
- Easy installation with automatic setup
- GPU acceleration for faster inference
- Professional chat interface

**Known Limitations:**
- macOS not yet supported (planned for future release)
- Only Gemma 4 model tested (other .litertlm models should work)
- First message has cold-start delay (model loading)

**System Requirements:**
- RAM: 8 GB minimum, 16 GB recommended
- Disk: 5 GB (including model)
- GPU: Optional but recommended for performance

---

For detailed release notes, see [docs/RELEASE-NOTES.md](docs/RELEASE-NOTES.md)
