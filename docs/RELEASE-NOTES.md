# Garexsa UI v1.0.0 - Release Notes

**Release Date:** October 15, 2026

## Overview

Garexsa UI is a desktop application for chatting with the Gemma 4 AI model locally. It provides a privacy-focused, offline-capable AI chat interface with professional features and cross-platform support.

---

## What's Included

### Windows Builds
1. **Setup Installer** - `GarexsaUI-Setup-1.0.0.exe` (123.5 MB)
   - Traditional installer with user-chosen installation directory
   - Model not included - users download separately
   
2. **Full Portable** - `Garexsa UI Full.exe` (3.8 GB)
   - No installation required - runs from anywhere
   - Gemma 4 model pre-bundled and ready to use

### Linux Builds
1. **.deb Package** - `garexsa-ui_1.0.0_amd64.deb` (137.5 MB)
   - System-wide installation
   - Model not included - users download separately
   
2. **Full Portable** - `garexsa-ui-full-linux-unpacked.tar.gz` (3.2 GB)
   - Extract and run from anywhere
   - Gemma 4 model pre-bundled and ready to use

---

## Key Features

### Privacy & Offline
- ✅ Runs completely offline after initial setup
- ✅ All data stays on your computer
- ✅ No internet connection required for inference
- ✅ Chat history stored locally

### AI Model
- ✅ Gemma 4 E2B-it model (~3.4 GB)
- ✅ Fast inference with LiteRT-LM
- ✅ GPU acceleration (automatic if available)
- ✅ CPU fallback (works on any system)

### User Interface
- ✅ Clean, modern desktop interface
- ✅ Multiple chat sessions
- ✅ Markdown rendering
- ✅ Chat history management
- ✅ Customizable settings (temperature, tokens, etc.)

### Technical
- ✅ Cross-platform (Windows & Linux)
- ✅ Self-contained Python environment
- ✅ Automatic backend setup
- ✅ Multi-model support
- ✅ Portable versions available

---

## System Requirements

### Minimum
- **OS:** Windows 10/11 or Ubuntu 20.04+/Debian 11+
- **RAM:** 8 GB
- **Disk Space:** 5 GB (including model)
- **CPU:** x86_64 processor
- **Internet:** Required for first-time setup only

### Recommended
- **RAM:** 16 GB
- **GPU:** NVIDIA with CUDA or AMD with ROCm (optional, for faster inference)
- **Disk Space:** 10 GB (for multiple models)

---

## Installation

### Windows Setup Installer
1. Download `GarexsaUI-Setup-1.0.0.exe`
2. Run the installer
3. Follow the setup wizard
4. Download Gemma 4 model from Kaggle
5. Place model in the models folder (shortcut created on desktop)
6. Launch Garexsa UI

### Windows Full Portable
1. Extract the zip file
2. Place folder anywhere (USB, external drive, etc.)
3. Run `Garexsa UI Full.exe`
4. Model is pre-bundled - ready immediately!

### Linux .deb Package
1. Download `garexsa-ui_1.0.0_amd64.deb`
2. Install: `sudo dpkg -i garexsa-ui_1.0.0_amd64.deb`
3. Download Gemma 4 model from Kaggle
4. Copy model to `/opt/garexsa-ui/resources/backend/models/`
5. Launch: `garexsa-ui` or from Applications menu

### Linux Full Portable
1. Extract: `tar -xzf garexsa-ui-full-linux-unpacked.tar.gz`
2. Make executable: `chmod +x linux-unpacked/garexsa-ui`
3. Run: `./linux-unpacked/garexsa-ui`
4. Model is pre-bundled - ready immediately!

---

## First Launch

On first launch, Garexsa UI will automatically:

1. Create a Python virtual environment (~30 seconds)
2. Install litert-lm and dependencies (~1-2 minutes)
3. Detect available models
4. Create model symlinks
5. Start the backend server
6. Open the chat interface

**This setup happens only once.** Subsequent launches are instant.

---

## Getting the AI Model

### For Non-Full Versions

1. Visit Kaggle: https://www.kaggle.com/models/google/gemma-4/tfLiteGemma4/gemma-4-e2b-it
2. Download the `gemma-4-E2B-it.litertlm` folder
3. Place in the models directory:
   - **Windows:** See README in installation folder or desktop shortcut
   - **Linux:** `/opt/garexsa-ui/resources/backend/models/`
4. Restart the application

### Model Details
- **Name:** gemma-4-E2B-it.litertlm
- **Size:** ~3.4 GB
- **Format:** LiteRT-LM model folder
- **License:** Check Kaggle page for terms

---

## Usage

### Starting a Chat
1. Type your message in the input box
2. Press Enter or click Send
3. Gemma 4 will respond
4. First response may take 10-30 seconds (model loading)

### Managing Chats
- **New Chat:** Click the "+" button
- **Delete Chat:** Hover over chat → trash icon
- **Rename Chat:** Click chat title to edit
- **Switch Chats:** Click on chat in sidebar

### Settings
Click the gear icon (⚙) to adjust:
- **Temperature:** Controls randomness (0.0-1.0)
- **Max Tokens:** Maximum response length
- **Top P / Top K:** Sampling parameters

---

## Multiple Models

You can use multiple models simultaneously:

1. Download additional `.litertlm` models
2. Place in the models folder
3. Restart Garexsa UI
4. All models will be detected and available

The app automatically creates symlinks for all models found.

---

## Troubleshooting

### Backend Won't Start
- Check logs: `%APPDATA%\garexsa-ui\garexsa.log` (Windows) or `~/.config/garexsa-ui/garexsa.log` (Linux)
- Verify model is in correct location
- Ensure models folder is readable

### Model Not Detected
- Restart the application
- Check folder name includes "litertlm"
- Verify model.litertlm file exists inside folder

### Slow Performance
- First message is always slower (model loading)
- Check if GPU is being used (logs show GPU status)
- Close other heavy applications
- Consider using smaller models

### Windows: Setup Failed
- Run as Administrator
- Disable antivirus temporarily during setup
- Check internet connection (first setup only)

### Linux: Permission Errors
- For system install: `sudo chmod -R a+r /opt/garexsa-ui/resources/backend/models/`
- For portable: Run from writable location

---

## File Locations

### User Data
- **Windows:** `%APPDATA%\garexsa-ui\`
- **Linux:** `~/.config/garexsa-ui/`

### Python Virtual Environment
- **Windows:** `%APPDATA%\garexsa-ui\backend\litert-lm-venv\`
- **Linux:** `~/.config/garexsa-ui/backend/litert-lm-venv\`

### Model Symlinks
- **Windows:** `%USERPROFILE%\.litert-lm\models\`
- **Linux:** `~/.litert-lm/models/`

### Logs
- **Windows:** `%APPDATA%\garexsa-ui\garexsa.log`
- **Linux:** `~/.config/garexsa-ui/garexsa.log`

---

## Uninstallation

### Windows Installer Version
1. Windows Settings → Apps → Garexsa UI → Uninstall
2. Optional: Delete user data folder `%APPDATA%\garexsa-ui\`

### Windows Portable
1. Delete the application folder
2. Optional: Delete user data folder `%APPDATA%\garexsa-ui\`

### Linux .deb
1. `sudo dpkg -r garexsa-ui`
2. Optional: `rm -rf ~/.config/garexsa-ui ~/.litert-lm`

### Linux Portable
1. Delete the application folder
2. Optional: `rm -rf ~/.config/garexsa-ui ~/.litert-lm`

---

## Technical Details

### Architecture
- **Frontend:** Electron + Vue.js
- **Backend:** Python + LiteRT-LM (litert-lm 0.18.0)
- **Model:** Gemma 4 E2B-it (LiteRT format)
- **API:** OpenAI-compatible REST API (port 9379)

### Stack
- Electron 28.3.3
- Python 3.11.6 (embedded)
- litert-lm 0.18.0
- Node.js runtime

### Portability
- Self-contained Python runtime
- Runtime venv creation (no system Python required)
- Automatic dependency installation
- Cross-platform path handling

---

## Known Issues

### WSL2 GPU Errors
GPU process errors in WSL2 are cosmetic and don't affect functionality. The app runs on CPU in WSL2 environment.

### First Launch Delay
Backend takes 10-30 seconds to fully start on first message (loading the model into memory). This is normal behavior for large language models.

### Antivirus False Positives
Some antivirus software may flag the portable Python runtime. This is a false positive. You can add an exception or use the installer version.

---

## Credits

### Based On
- **LiteRT-LM:** Google's AI Edge inference engine
- **Gemma:** Google's open AI model family
- **Electron:** Cross-platform desktop framework

### Frontend UI
- Modified and rebranded from AXERA Lite WebUI
- Translated to English
- Enhanced for desktop use

---

## License

See LICENSE.txt for details.

Model usage subject to Gemma model license terms.

---

## Support

For issues, questions, or contributions:
- Check logs at locations mentioned above
- Review troubleshooting section
- Consult user guides in the installation folder

---

## Changelog

### Version 1.0.0 (October 15, 2026)
- Initial release
- Windows support (installer & portable)
- Linux support (.deb & portable)
- Gemma 4 E2B-it model support
- Automatic Python environment setup
- Multi-model support
- GPU acceleration
- Offline operation
- Portable versions with bundled models

---

**Thank you for using Garexsa UI!**

Enjoy your privacy-focused, offline AI chat experience! 🎉
