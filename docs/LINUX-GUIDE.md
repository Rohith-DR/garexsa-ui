# Garexsa UI for Linux - Portable Full Version Guide

## Overview

This guide covers the **Garexsa UI Full Portable** version - a standalone unpacked directory that runs directly without installation.

**Package:** `garexsa-ui-full-linux-unpacked/` folder  
**Model Included:** Yes (Gemma 4 pre-bundled, ~3.45 GB)  
**Installation Required:** No (truly portable)

---

## System Requirements

### Minimum Requirements
- **OS:** Any Linux distribution (Ubuntu, Debian, Fedora, Arch, etc.)
- **RAM:** 8 GB minimum, 16 GB recommended
- **Disk Space:** 4-5 GB (includes model)
- **CPU:** x86_64 processor
- **Internet:** Required for first-time Python environment setup only

### Dependencies
Most Linux systems include these by default:
- `libnotify4`, `libxtst6`, `libnss3`
- `libgtk-3-0`, `libgbm1`, `libasound2`
- `python3` (for venv creation)

If missing on your system:
```bash
# Debian/Ubuntu
sudo apt-get install libgtk-3-0 libgbm1 libasound2 python3 python3-venv

# Fedora
sudo dnf install gtk3 mesa-libgbm alsa-lib python3

# Arch
sudo pacman -S gtk3 libgbm alsa-lib python3
```

### Optional (for GPU acceleration)
- **NVIDIA GPU:** CUDA drivers
- **AMD GPU:** ROCm drivers
- **Intel GPU:** Supported by default

---

## What's Included

The portable folder contains:
```
garexsa-ui-full-linux-unpacked/
├── garexsa-ui                     ← Main executable
├── resources/
│   ├── app.asar                   ← Application code
│   └── backend/
│       ├── python-embed/          ← Bundled Python
│       ├── wheels/                ← litert-lm packages
│       ├── setup_venv.py          ← Setup script
│       └── models/
│           └── gemma-4-E2B-it.litertlm/   ← PRE-BUNDLED MODEL ✅
│               └── model.litertlm (~3.4 GB)
├── locales/
├── resources.pak
└── (other Electron runtime files)
```

**Total size:** ~3.6 GB

---

## Installation (Extraction)

### Step 1: Download and Extract

Download the portable package and extract to your preferred location:

```bash
cd ~/Downloads
tar -xzf garexsa-ui-full-linux-unpacked.tar.gz
```

Or unzip if packaged as zip:
```bash
unzip garexsa-ui-full-linux-unpacked.zip
```

### Step 2: Move to Desired Location

Move the folder anywhere you like:

**Home directory:**
```bash
mv garexsa-ui-full-linux-unpacked ~/GarexsaUI
```

**Applications folder:**
```bash
sudo mv garexsa-ui-full-linux-unpacked /opt/GarexsaUI
```

**External drive:**
```bash
mv garexsa-ui-full-linux-unpacked /media/user/USB/GarexsaUI
```

**Network drive:**
```bash
mv garexsa-ui-full-linux-unpacked /mnt/nas/Apps/GarexsaUI
```

The application will work from **any location** - it's truly portable!

### Step 3: Make Executable (if needed)

Ensure the main executable has execute permissions:

```bash
cd ~/GarexsaUI  # or wherever you placed it
chmod +x garexsa-ui
```

---

## Usage

### Launching the Application

**From the folder:**
```bash
cd ~/GarexsaUI
./garexsa-ui
```

**Direct path:**
```bash
~/GarexsaUI/garexsa-ui
```

**Create a desktop shortcut (optional):**
Create `~/.local/share/applications/garexsa-ui.desktop`:
```ini
[Desktop Entry]
Name=Garexsa UI Full
Comment=Chat with Gemma 4 AI
Exec=/home/YOUR_USERNAME/GarexsaUI/garexsa-ui
Icon=/home/YOUR_USERNAME/GarexsaUI/icon.png
Terminal=false
Type=Application
Categories=Utility;AI;Chat;
```

Replace `YOUR_USERNAME` with your actual username.

### First Launch Setup (Automatic)

On first launch, you'll see a setup window:

```
╔════════════════════════════════════╗
║  Garexsa UI - First Time Setup     ║
╠════════════════════════════════════╣
║  Setting up Python environment...  ║
║                                    ║
║  ⏳ This may take 1-2 minutes      ║
╚════════════════════════════════════╝
```

The app automatically:
1. Creates Python virtual environment in `~/.local/share/garexsa-ui/backend/litert-lm-venv/`
2. Installs litert-lm and dependencies from bundled wheels
3. Detects bundled Gemma 4 model
4. Creates model symlinks to `~/.litert-lm/models/`
5. Starts the backend server

**This setup happens once.** Subsequent launches are instant.

**Note:** The Python venv is created in your home directory, but the model stays in the portable folder.

### Starting a Chat

1. Wait for the chat interface to load (backend initialization takes 10-30 seconds on first message)
2. The bundled Gemma 4 model is already loaded - no download needed! ✅
3. Type your message in the input box at the bottom
4. Press Enter or click Send
5. Gemma 4 will respond

### Chat Features

- **New Chat:** Click the "+" button in sidebar
- **Delete Chat:** Hover over chat → click trash icon
- **Rename Chat:** Click on chat title to edit
- **Chat History:** All chats saved in sidebar
- **Markdown Support:** Code blocks, lists, formatting supported

### Settings

Click the gear icon (⚙) to adjust:
- **Temperature:** Creativity level (0.0 = deterministic, 1.0 = creative)
- **Max Tokens:** Response length limit
- **Top P / Top K:** Advanced sampling parameters

---

## File Locations

### Portable Application Folder
```
~/GarexsaUI/                        ← Your chosen location
├── garexsa-ui                      ← Main executable
├── resources/
│   ├── app.asar                    ← Application code
│   └── backend/
│       ├── python-embed/           ← Bundled Python
│       ├── wheels/                 ← litert-lm packages
│       ├── setup_venv.py           ← Setup script
│       └── models/
│           └── gemma-4-E2B-it.litertlm/   ← MODEL STAYS HERE ✅
└── icon.png
```

### User Data (in home directory)
```
~/.local/share/garexsa-ui/          ← User data directory
├── backend/
│   └── litert-lm-venv/             ← Python virtual environment
├── garexsa.log                     ← Application logs
└── (chat history, settings, etc.)
```

### Model Symlinks
```
~/.litert-lm/models/                ← litert-lm default location
└── gemma-4-E2B-it.litertlm/       ← Symlink to ~/GarexsaUI/resources/backend/models/
```

---

## Portability

### Moving to Another Location

You can move the entire folder anywhere:

```bash
mv ~/GarexsaUI /media/usb/Apps/
```

The app will automatically:
- Detect the new location
- Update symlinks to point to new model path
- Continue working seamlessly ✅

### Transferring to Another Computer

1. Copy the entire `garexsa-ui-full-linux-unpacked/` folder
2. Place it anywhere on the new computer
3. Run `./garexsa-ui`
4. First launch will set up Python venv on new computer
5. Model symlinks created automatically

**Works perfectly!** ✅

### Running from External Drive

You can run directly from USB drive or network storage:

```bash
cd /media/user/USB/GarexsaUI
./garexsa-ui
```

**Notes:**
- Python venv still created in `~/.local/share/garexsa-ui/` (home directory)
- Model stays on external drive
- Performance depends on drive speed (USB 3.0+ recommended)

---

## Adding More Models

You can add multiple models to the portable folder:

### Step 1: Download Additional Models

Download any .litertlm model from Kaggle or other sources.

### Step 2: Place in Models Folder

```bash
cd ~/GarexsaUI/resources/backend/models/
cp -r ~/Downloads/phi-3-mini.litertlm .
```

### Step 3: Restart Application

The app will automatically:
- Detect all models in the folder
- Create symlinks for each one
- Make them available in the app

Example with multiple models:
```
~/GarexsaUI/resources/backend/models/
├── gemma-4-E2B-it.litertlm/        ← Pre-bundled
├── phi-3-mini.litertlm/            ← You added
└── mistral-7b.litertlm/            ← You added
```

All models will be available! ✅

---

## Troubleshooting

### Backend Won't Start

**Check logs:**
```bash
cat ~/.local/share/garexsa-ui/garexsa.log
```

**Common issues:**
- Missing dependencies → install libgtk-3-0, libgbm1, libasound2
- Python venv issue → delete `~/.local/share/garexsa-ui/backend/` and restart

### Model Not Detected

**Verify symlinks:**
```bash
ls -la ~/.litert-lm/models/
```

Should show symlink pointing to your portable folder.

**Force recreation:**
```bash
rm -rf ~/.litert-lm/models/*
```
Then restart the app.

### Permission Denied

**Make executable:**
```bash
chmod +x ~/GarexsaUI/garexsa-ui
```

**Check model permissions:**
```bash
chmod -R a+r ~/GarexsaUI/resources/backend/models/
```

### Slow Performance

- First message always slower (model loading)
- GPU not detected? Check drivers: `nvidia-smi` or `rocm-smi`
- Consider moving to internal SSD if running from slow USB drive

### Application Won't Launch

**Run from terminal to see errors:**
```bash
cd ~/GarexsaUI
./garexsa-ui
```

**Check dependencies:**
```bash
# Debian/Ubuntu
sudo apt-get install libgtk-3-0 libgbm1 libasound2

# Fedora
sudo dnf install gtk3 mesa-libgbm alsa-lib

# Arch
sudo pacman -S gtk3 libgbm alsa-lib
```

### Python Environment Issues

**Reset environment:**
```bash
rm -rf ~/.local/share/garexsa-ui/backend/litert-lm-venv/
```
Then restart the app to recreate it.

---

## Uninstallation / Cleanup

### Remove Application
Simply delete the folder:
```bash
rm -rf ~/GarexsaUI
```

### Remove User Data (Optional)
```bash
rm -rf ~/.local/share/garexsa-ui/
rm -rf ~/.litert-lm/
```

### Remove Desktop Shortcut (if created)
```bash
rm ~/.local/share/applications/garexsa-ui.desktop
```

That's it! No registry entries, no system files left behind.

---

## Technical Details

### Why Two Folders?

**Portable folder:** Contains the app and model (stays where you put it)  
**User data folder:** Contains venv, logs, chat history (in home directory)

This hybrid approach ensures:
- ✅ Application is portable (move folder anywhere)
- ✅ User data doesn't bloat the portable folder
- ✅ Multiple users on same system have separate data
- ✅ Model can be on external drive without issues

### Symlink Strategy

litert-lm hardcodes its model directory to `~/.litert-lm/models/`. Garexsa UI:

1. Scans `[Portable Folder]/resources/backend/models/` on startup
2. Creates directory symlinks to `~/.litert-lm/models/`
3. litert-lm loads models from its expected location (which are symlinks)

When you move the folder, symlinks are recreated automatically pointing to the new location.

### GPU Acceleration

litert-lm automatically detects and uses GPU if available:
- **NVIDIA:** Requires CUDA drivers
- **AMD:** Requires ROCm drivers  
- **Intel:** Uses integrated GPU by default
- **Fallback:** Uses CPU if no GPU detected

No configuration needed!

---

## Advantages of Portable Version

✅ **No installation required** - just extract and run  
✅ **Model pre-bundled** - works immediately  
✅ **Run from anywhere** - USB drive, network storage, external SSD  
✅ **Easy to move** - copy folder to new location  
✅ **Easy to transfer** - copy to another computer  
✅ **Easy to backup** - back up entire folder  
✅ **Easy to remove** - delete folder, done  
✅ **Multiple copies** - run different versions side-by-side  
✅ **No system pollution** - only user data in home directory  

---

## Getting Help

- **Logs:** `~/.local/share/garexsa-ui/garexsa.log`
- **Model Path:** `[Your Folder]/resources/backend/models/`
- **Symlinks:** `~/.litert-lm/models/`

For additional support, check the GitHub repository or documentation.

---

**Enjoy chatting with Gemma 4 AI! 🎉**
