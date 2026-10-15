const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const os = require('os');

// Disable GPU cache to avoid permission errors
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-gpu-program-cache');

let mainWindow = null;
let setupWindow = null;
let tray = null;
let backendProcess = null;
const API_PORT = 9379;
const API_URL = `http://127.0.0.1:${API_PORT}`;

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Show setup window during first-launch venv creation
function showSetupWindow(message) {
  if (setupWindow) return;
  
  setupWindow = new BrowserWindow({
    width: 600,
    height: 400,
    resizable: false,
    frame: false,
    transparent: false,
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const setupPath = path.join(__dirname, 'setup.html');
  setupWindow.loadFile(setupPath);
  setupWindow.show();
  
  if (message) {
    setupWindow.webContents.once('did-finish-load', () => {
      setupWindow.webContents.send('setup-status', message);
    });
  }
}

function updateSetupWindow(message) {
  if (setupWindow && !setupWindow.isDestroyed()) {
    setupWindow.webContents.send('setup-status', message);
  }
}

function closeSetupWindow() {
  if (setupWindow && !setupWindow.isDestroyed()) {
    setupWindow.close();
    setupWindow = null;
  }
}

// Setup virtual environment on first launch
async function ensureVenvExists() {
  return new Promise((resolve, reject) => {
    const resourcesPath = app.isPackaged ? process.resourcesPath : __dirname;
    const pythonEmbedPath = path.join(resourcesPath, 'backend', 'python-embed');
    const wheelsPath = path.join(resourcesPath, 'backend', 'wheels');
    const appDataPath = app.getPath('userData');
    
    // Venv will be in AppData
    const venvPath = path.join(appDataPath, 'backend', 'litert-lm-venv');
    const statusFile = path.join(venvPath, '.setup_complete');
    
    console.log('[Setup] Checking for existing venv...');
    console.log('[Setup] Venv path:', venvPath);
    console.log('[Setup] Status file:', statusFile);
    
    // Check if setup already complete
    if (fs.existsSync(statusFile)) {
      console.log('[Setup] Virtual environment already configured');
      try {
        const status = JSON.parse(fs.readFileSync(statusFile, 'utf8'));
        console.log('[Setup] Version:', status.version);
        console.log('[Setup] Created:', status.created);
      } catch (e) {
        console.log('[Setup] Could not read status file:', e.message);
      }
      resolve(venvPath);
      return;
    }
    
    console.log('[Setup] First launch detected - creating virtual environment');
    
    // Show setup window
    showSetupWindow('Preparing backend environment...');
    
    // Run setup script
    const setupScript = path.join(resourcesPath, 'backend', 'setup_venv.py');
    const pythonExe = path.join(pythonEmbedPath, 'python.exe');
    
    console.log('[Setup] Python:', pythonExe);
    console.log('[Setup] Setup script:', setupScript);
    console.log('[Setup] Wheels:', wheelsPath);
    
    if (!fs.existsSync(pythonExe)) {
      const error = `Python executable not found: ${pythonExe}`;
      console.error('[Setup] ERROR:', error);
      closeSetupWindow();
      reject(new Error(error));
      return;
    }
    
    if (!fs.existsSync(setupScript)) {
      const error = `Setup script not found: ${setupScript}`;
      console.error('[Setup] ERROR:', error);
      closeSetupWindow();
      reject(new Error(error));
      return;
    }
    
    updateSetupWindow('Creating virtual environment...');
    
    const setupProcess = spawn(
      pythonExe,
      [setupScript, appDataPath, pythonEmbedPath, wheelsPath],
      {
        windowsHide: true,
        stdio: 'pipe'
      }
    );
    
    let setupOutput = '';
    
    setupProcess.stdout.on('data', (data) => {
      const message = data.toString().trim();
      console.log('[Setup]', message);
      setupOutput += message + '\n';
      
      // Update setup window with progress
      if (message.includes('[Setup]')) {
        updateSetupWindow(message.replace('[Setup] ', ''));
      }
    });
    
    setupProcess.stderr.on('data', (data) => {
      const message = data.toString().trim();
      console.error('[Setup Error]', message);
      setupOutput += message + '\n';
    });
    
    setupProcess.on('error', (error) => {
      console.error('[Setup] Process error:', error);
      closeSetupWindow();
      reject(error);
    });
    
    setupProcess.on('exit', (code) => {
      console.log('[Setup] Process exited with code:', code);
      
      if (code === 0) {
        console.log('[Setup] Setup completed successfully');
        
        // Check for SUCCESS message
        if (setupOutput.includes('SUCCESS:')) {
          const match = setupOutput.match(/SUCCESS:(.+)/);
          if (match) {
            console.log('[Setup] Venv created at:', match[1].trim());
          }
        }
        
        closeSetupWindow();
        resolve(venvPath);
      } else {
        console.error('[Setup] Setup failed with code:', code);
        console.error('[Setup] Output:', setupOutput);
        
        closeSetupWindow();
        
        // Show error dialog
        const { dialog } = require('electron');
        dialog.showErrorBox(
          'Setup Failed',
          `Failed to set up backend environment (exit code: ${code}).\n\n` +
          `This might be due to:\n` +
          `1. Insufficient disk space\n` +
          `2. Antivirus blocking Python\n` +
          `3. File permissions issues\n\n` +
          `Try:\n` +
          `- Free up disk space (need ~500MB)\n` +
          `- Run as Administrator\n` +
          `- Temporarily disable antivirus\n\n` +
          `Log: ${path.join(appDataPath, 'garexsa.log')}`
        );
        
        reject(new Error(`Setup failed with code ${code}`));
      }
    });
  });
}

// Start the backend API server
async function startBackend() {
  return new Promise(async (resolve, reject) => {
    console.log('[Backend] Starting LiteRT-LM API server...');
    
    try {
      // Ensure venv exists (creates on first launch)
      const venvPath = await ensureVenvExists();
      console.log('[Backend] Using venv:', venvPath);
      
      // Backend executable is in the venv
      const litertExe = path.join(venvPath, 'Scripts', 'litert-lm.exe');
      
      if (!fs.existsSync(litertExe)) {
        throw new Error(`Backend executable not found: ${litertExe}`);
      }
      
      console.log('[Backend] Backend executable:', litertExe);
      
      // Determine model path - ALWAYS use resources/backend/models
      let modelPath;
      
      if (app.isPackaged) {
        // Production: models folder is in resources/backend/models
        modelPath = path.join(process.resourcesPath, 'backend', 'models');
        console.log('[Backend] Models path:', modelPath);
      } else {
        // Development mode
        modelPath = path.join(__dirname, 'backend', 'models');
        console.log('[Backend] Development mode, models path:', modelPath);
      }
      
      // Ensure models folder exists
      if (!fs.existsSync(modelPath)) {
        console.log('[Backend] Creating models folder:', modelPath);
        fs.mkdirSync(modelPath, { recursive: true });
      }
      
      // List available models
      // litert-lm ONLY loads models from ~/.litert-lm/models/ (hardcoded)
      // So we need to symlink our models to that location
      const litertModelsDir = path.join(os.homedir(), '.litert-lm', 'models');
      
      // Ensure litert-lm models directory exists
      if (!fs.existsSync(litertModelsDir)) {
        console.log('[Backend] Creating litert-lm models directory:', litertModelsDir);
        fs.mkdirSync(litertModelsDir, { recursive: true });
      }
      
      // List available models in our app's models folder
      let models = [];
      if (fs.existsSync(modelPath)) {
        try {
          models = fs.readdirSync(modelPath, { withFileTypes: true })
            .filter(d => d.isDirectory() && d.name.includes('litertlm'))
            .map(d => d.name);
          
          if (models.length > 0) {
            console.log('[Backend] Found', models.length, 'model(s) in app folder:', models.join(', '));
          } else {
            console.log('[Backend] WARNING: No models found in:', modelPath);
            console.log('[Backend] Place litert-lm models in this folder to use them');
          }
        } catch (err) {
          console.error('[Backend] Error listing models:', err.message);
        }
      } else {
        console.log('[Backend] Models directory does not exist yet:', modelPath);
      }
      
      // Symlink each model from our app folder to litert-lm's expected location
      for (const modelName of models) {
        const sourceModelPath = path.join(modelPath, modelName);
        const targetModelPath = path.join(litertModelsDir, modelName);
        
        try {
          // Check if symlink already exists
          if (fs.existsSync(targetModelPath)) {
            // Check if it's a valid symlink pointing to our model
            try {
              const linkTarget = fs.readlinkSync(targetModelPath);
              if (linkTarget === sourceModelPath) {
                console.log('[Backend] Symlink already exists for:', modelName);
                continue;
              } else {
                // Points to different location, remove it
                console.log('[Backend] Removing old symlink:', modelName);
                fs.rmSync(targetModelPath, { recursive: true, force: true });
              }
            } catch (err) {
              // Not a symlink, it's a real directory - remove it
              console.log('[Backend] Removing existing directory:', modelName);
              fs.rmSync(targetModelPath, { recursive: true, force: true });
            }
          }
          
          // Create junction (directory symlink) - works without admin rights on Windows
          console.log('[Backend] Creating symlink:', modelName);
          console.log('[Backend]   Source:', sourceModelPath);
          console.log('[Backend]   Target:', targetModelPath);
          fs.symlinkSync(sourceModelPath, targetModelPath, 'junction');
          console.log('[Backend] Symlink created successfully');
        } catch (err) {
          console.error('[Backend] Failed to create symlink for', modelName, ':', err.message);
        }
      }
      
      // Start backend process - litert-lm will load models from its default ~/.litert-lm/models/
      const args = [
        'serve',
        '--host', '127.0.0.1',
        '--port', API_PORT.toString()
      ];
      
      console.log('[Backend] Starting backend with args:', args);
      console.log('[Backend] litert-lm will load models from:', litertModelsDir);
      
      backendProcess = spawn(litertExe, args, {
        windowsHide: true,
        detached: false,
        stdio: 'pipe'
      });
      
      let startupOutput = '';
      
      backendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        startupOutput += output;
        console.log('[Backend]', output.trim());
        
        if (output.includes('Uvicorn running') || output.includes('Application startup complete')) {
          console.log('[Backend] API server ready!');
          resolve();
        }
      });
      
      backendProcess.stderr.on('data', (data) => {
        const output = data.toString().trim();
        if (output.includes(' 200 -') || output.includes(' 201 -')) {
          console.log('[Backend]', output);
        } else {
          console.error('[Backend Error]', output);
        }
      });
      
      backendProcess.on('error', (error) => {
        console.error('[Backend] Failed to start:', error);
        reject(error);
      });
      
      backendProcess.on('exit', (code, signal) => {
        console.log('[Backend] Process exited with code:', code, 'signal:', signal);
        if (code !== 0 && code !== null) {
          const { dialog } = require('electron');
          dialog.showErrorBox(
            'Backend Error',
            `The AI backend process exited unexpectedly (code: ${code}).\n\n` +
            `Check log: ${path.join(app.getPath('userData'), 'garexsa.log')}`
          );
          reject(new Error(`Backend exited with code ${code}`));
        }
      });
      
      // Timeout fallback
      setTimeout(async () => {
        const isReady = await checkAPIHealth();
        if (isReady) {
          console.log('[Backend] API health check passed');
          resolve();
        } else {
          setTimeout(async () => {
            const isReadyRetry = await checkAPIHealth();
            if (isReadyRetry) {
              resolve();
            } else {
              reject(new Error('Backend failed to start within timeout'));
            }
          }, 3000);
        }
      }, 5000);
      
    } catch (error) {
      console.error('[Backend] Setup or start error:', error);
      reject(error);
    }
  });
}

// Check if API is responding
function checkAPIHealth() {
  return new Promise((resolve) => {
    const req = http.get(`${API_URL}/v1/models`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Create the main application window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    backgroundColor: '#1a1a2e',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const frontendPath = app.isPackaged
    ? path.join(__dirname, 'frontend', 'index.html')
    : path.join(__dirname, '..', 'lite_webui', 'dist', 'index.html');
  
  console.log('[Frontend] Loading from:', frontendPath);
  mainWindow.loadFile(frontendPath);

  mainWindow.once('ready-to-show', () => {
    console.log('[Frontend] Window ready to show');
    mainWindow.show();
    mainWindow.focus();
    mainWindow.moveTop();
  });
  
  setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.focus();
      mainWindow.setAlwaysOnTop(true);
      setTimeout(() => mainWindow.setAlwaysOnTop(false), 1000);
    }
  }, 2000);

  mainWindow.on('close', () => {
    app.isQuitting = true;
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (!app.isQuitting) {
      app.quit();
    }
  });
}

// Create system tray icon
function createTray() {
  const iconPath = path.join(__dirname, 'icon.ico');
  
  if (!fs.existsSync(iconPath)) {
    console.log('[Tray] Icon not found, skipping tray');
    return;
  }
  
  try {
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open Garexsa UI',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.isQuitting = true;
          if (backendProcess && !backendProcess.killed) {
            backendProcess.kill('SIGTERM');
            setTimeout(() => {
              if (backendProcess && !backendProcess.killed) {
                backendProcess.kill('SIGKILL');
              }
            }, 1000);
          }
          setTimeout(() => app.quit(), 500);
        }
      }
    ]);

    tray.setToolTip('Garexsa UI');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });
  } catch (error) {
    console.error('[Tray] Failed to create tray:', error.message);
  }
}

// Application startup
app.whenReady().then(async () => {
  console.log('[App] Starting Garexsa UI...');
  console.log('[App] Is packaged:', app.isPackaged);
  console.log('[App] App path:', app.getAppPath());
  console.log('[App] UserData path:', app.getPath('userData'));
  
  // Setup logging
  if (app.isPackaged) {
    const logPath = path.join(app.getPath('userData'), 'garexsa.log');
    const logStream = fs.createWriteStream(logPath, { flags: 'w' });
    
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    
    console.log = (...args) => {
      const message = args.join(' ') + '\n';
      logStream.write('[LOG] ' + message);
      originalConsoleLog(...args);
    };
    
    console.error = (...args) => {
      const message = args.join(' ') + '\n';
      logStream.write('[ERROR] ' + message);
      originalConsoleError(...args);
    };
    
    console.log('[App] Logging to:', logPath);
  }
  
  const startTime = Date.now();
  console.log('[App] Startup at', new Date().toLocaleTimeString());

  try {
    createWindow();
    
    console.log('[App] Starting backend in background...');
    startBackend().then(() => {
      const backendTime = Date.now();
      console.log('[App] Backend started in', ((backendTime - startTime) / 1000).toFixed(1), 'seconds');
    }).catch(backendError => {
      console.error('[App] Backend failed:', backendError);
    });

    createTray();

    console.log('[App] Garexsa UI ready!');

  } catch (error) {
    console.error('[App] Failed to start:', error);
    
    const { dialog } = require('electron');
    const logPath = app.isPackaged ? path.join(app.getPath('userData'), 'garexsa.log') : '';
    
    let errorMsg = `Failed to start Garexsa UI:\n\n${error.message}`;
    if (logPath) {
      errorMsg += `\n\nLog: ${logPath}`;
    }
    
    dialog.showErrorBox('Startup Error', errorMsg);
    setTimeout(() => app.quit(), 1000);
  }
});

// Cleanup on quit
app.on('before-quit', () => {
  console.log('[App] Shutting down...');
  app.isQuitting = true;
  
  if (backendProcess && !backendProcess.killed) {
    console.log('[Backend] Terminating...');
    try {
      backendProcess.kill('SIGTERM');
    } catch (err) {
      console.error('[Backend] Error terminating:', err.message);
    }
    
    setTimeout(() => {
      if (backendProcess && !backendProcess.killed) {
        try {
          backendProcess.kill('SIGKILL');
        } catch (err) {
          console.error('[Backend] Error force killing:', err.message);
        }
      }
    }, 2000);
  }
});

app.on('will-quit', () => {
  if (backendProcess && !backendProcess.killed) {
    try {
      backendProcess.kill('SIGKILL');
    } catch (err) {
      console.error('[Backend] Final kill error:', err.message);
    }
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('get-api-url', () => {
  return API_URL;
});

ipcMain.handle('refocus-window', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.blur();
    setTimeout(() => {
      mainWindow.focus();
    }, 50);
  }
  return true;
});
