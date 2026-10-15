# Garexsa UI - Quick Start Guide

Get up and running with Garexsa UI in 5 minutes!

---

## Choose Your Version

### Option 1: Installer (Recommended for most users)
- **Windows:** `GarexsaUI-Setup-1.0.0.exe` (123.5 MB)
- **Linux:** `garexsa-ui_1.0.0_amd64.deb` (137.5 MB)
- ⚠️ Model not included - download separately

### Option 2: Portable with Model (Ready to use)
- **Windows:** `Garexsa UI Full.exe` (3.8 GB)
- **Linux:** `garexsa-ui-full-linux-unpacked.tar.gz` (3.2 GB)
- ✅ Model included - works immediately

---

## Installation Steps

### Windows Installer

```
1. Run GarexsaUI-Setup-1.0.0.exe
2. Follow setup wizard → Choose install location
3. Click "Garexsa Models Folder" shortcut on desktop
4. Download Gemma 4 model from Kaggle
5. Paste model folder into the opened folder
6. Launch "Garexsa UI" from desktop or Start menu
```

### Windows Portable

```
1. Extract zip file
2. Place folder anywhere (desktop, USB, external drive)
3. Double-click "Garexsa UI Full.exe"
4. Wait 1-2 minutes for first-time setup
5. Start chatting!
```

### Linux .deb

```bash
# Install
sudo dpkg -i garexsa-ui_1.0.0_amd64.deb

# Download model from Kaggle
# Place in: /opt/garexsa-ui/resources/backend/models/

# Launch
garexsa-ui
```

### Linux Portable

```bash
# Extract
tar -xzf garexsa-ui-full-linux-unpacked.tar.gz

# Make executable
cd linux-unpacked
chmod +x garexsa-ui

# Run
./garexsa-ui
```

---

## Getting the Model (Non-Portable Versions)

### Step 1: Visit Kaggle
https://www.kaggle.com/models/google/gemma-4/tfLiteGemma4/gemma-4-e2b-it

### Step 2: Download
- Click "Download" button
- Save `gemma-4-E2B-it.litertlm` folder (~3.4 GB)

### Step 3: Place Model

**Windows:**
- Use "Garexsa Models Folder" desktop shortcut
- Or navigate to: `C:\Users\YourName\AppData\Local\Programs\garexsa-ui\resources\backend\models\`
- Paste the entire `gemma-4-E2B-it.litertlm` folder

**Linux:**
```bash
sudo cp -r ~/Downloads/gemma-4-E2B-it.litertlm /opt/garexsa-ui/resources/backend/models/
sudo chmod -R a+r /opt/garexsa-ui/resources/backend/models/
```

---

## First Launch

### What Happens Automatically

1. **Setup Window Appears** (1-2 minutes)
   - Creating Python environment
   - Installing dependencies
   - This happens only once!

2. **Backend Starts**
   - litert-lm server initializes
   - Model loads into memory (10-30 sec)
   - "Backend started" message appears

3. **Chat Interface Opens**
   - Ready to chat!
   - Type your first message

### First Launch Tips
- ☕ Be patient - first launch takes 1-2 minutes
- 📶 Internet required for setup only
- 💾 After setup, works completely offline
- 🚀 Subsequent launches are instant

---

## Using the Chat

### Send a Message
1. Type in the input box at bottom
2. Press Enter or click Send button
3. Wait for Gemma 4 to respond (10-30 sec first time)

### Example First Messages
```
"Hello! Introduce yourself."
"Explain quantum computing in simple terms."
"Write a Python function to reverse a string."
"What are the benefits of meditation?"
```

### Chat Features
- **New Chat:** Click "+" button in sidebar
- **Switch Chats:** Click chat title in sidebar
- **Delete Chat:** Hover → trash icon
- **Rename:** Click chat title to edit

---

## Settings

Click ⚙️ (gear icon) to adjust:

- **Temperature:** 0.0-1.0 (lower = more focused, higher = more creative)
- **Max Tokens:** Response length limit
- **Top P / Top K:** Advanced sampling (leave default)

---

## Troubleshooting

### "Backend won't start"
✅ Check model is in correct folder  
✅ Look at logs: `%APPDATA%\garexsa-ui\garexsa.log`  
✅ Restart application

### "No models found"
✅ Verify folder name includes "litertlm"  
✅ Check model.litertlm file exists inside  
✅ Restart after placing model

### "Slow responses"
✅ First message is always slower (loading model)  
✅ Subsequent messages are faster  
✅ GPU automatically used if available

### "Setup failed"
✅ Check internet connection (first setup only)  
✅ Run as Administrator (Windows)  
✅ Disable antivirus temporarily

---

## System Requirements

### Minimum
- 8 GB RAM
- 5 GB disk space
- Windows 10/11 or Ubuntu 20.04+

### Recommended
- 16 GB RAM
- NVIDIA GPU with CUDA (optional)
- 10 GB disk space

---

## Tips & Tricks

### Multiple Models
1. Download more .litertlm models
2. Place in models folder
3. Restart app
4. All models auto-detected!

### GPU Acceleration
- Automatically used if available
- No configuration needed
- Logs show GPU status

### Offline Use
- After first setup, no internet needed
- All inference runs locally
- Complete privacy

### Portable Use
- Copy portable version to USB
- Run on any compatible PC
- Settings and chats stay with the app

---

## Next Steps

✅ **Installed?** Great! Start chatting!  
✅ **Need help?** Check RELEASE-NOTES.md for full details  
✅ **Advanced?** See platform-specific guides:
- Windows: User guides in installation folder
- Linux: LINUX-DEB-GUIDE.md & LINUX-FULL-GUIDE.md

---

## Support

**Logs Location:**
- Windows: `%APPDATA%\garexsa-ui\garexsa.log`
- Linux: `~/.config/garexsa-ui/garexsa.log`

**Model Path:**
- Check logs or README in installation folder

---

**Happy chatting with Gemma 4! 🎉**
