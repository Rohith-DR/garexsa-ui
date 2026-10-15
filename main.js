const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const os = require('os');

// Disable GPU cache to avoid permission errors
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-gpu-program-cache');

// Disable sandbox on Linux to avoid namespace issues
if (process.platform === 'linux') {
  app.commandLine.appendSwitch('no-sandbox');
  console.log('[App] Running with --no-sandbox on Linux');
  
  // Disable GPU on Linux (causes crashes in WSL2 and some systems)
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('disable-software-rasterizer');
  console.log('[App] GPU disabled for Linux compatibility');
  
  // Fix for WSL2 /dev/shm issues
  app.commandLine.appendSwitch('disable-dev-shm-usage');
  console.log('[App] Using alternative to /dev/shm for shared memory');
}

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

// Show setup progress window
function showSetupWindow() {
  setupWindow = new BrowserWindow({
    width: 600,
    height: 400,
    resizable: false,
    frame: false,
    transparent: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  setupWindow.loadFile('setup.html');
  
  setupWindow.once('ready-to-show', () => {
    setupWindow.show();
  });
}

// Setup virtual environment for litert-lm
function setupBackendEnvironment() {
  return new Promise((resolve, reject) => {
    console.log('[Setup] Checking for existing venv...');
    
    const venvPath = path.join(app.getPath('userData'), 'backend', 'litert-lm-venv');
    const statusFile = path.join(venvPath, '.setup_complete');
    
    console.log('[Setup] Venv path:', venvPath);
    console.log('[Setup] Status file:', statusFile);
    
    // Check if venv already exists and is complete
    if (fs.existsSync(statusFile)) {
      console.log('[Setup] Virtual environment already configured');
      try {
        const status = JSON.parse(fs.readFileSync(statusFile, 'utf8'));
        console.log('[Setup] Version:', status.version);
        console.log('[Setup] Created:', status.created);
        resolve();
        return;
      } catch (err) {
        console.error('[Setup] Status file corrupted, recreating venv');
      }
    }
    
    console.log('[Setup] Setting up Python virtual environment...');
    console.log('[Setup] This is a one-time process and may take 1-2 minutes...');
    
    showSetupWindow();
    
    const resourcesPath = process.resourcesPath;
    const pythonEmbedDir = path.join(resourcesPath, 'backend', 'python-embed');
    const pythonExe = path.join(pythonEmbedDir, 'bin', 'python3');
    const setupScript = path.join(resourcesPath, 'backend', 'setup_venv.py');
    const wheelsDir = path.join(resourcesPath, 'backend', 'wheels');
    
    // Get appdata directory (parent of backend folder)
    const appdataPath = path.dirname(path.dirname(venvPath)); // venvPath is appdata/backend/litert-lm-venv, we need appdata
    
    console.log('[Setup] Python Exe:', pythonExe);
    console.log('[Setup] Python Dir:', pythonEmbedDir);
    console.log('[Setup] Script:', setupScript);
    console.log('[Setup] AppData:', appdataPath);
    console.log('[Setup] Wheels:', wheelsDir);
    
    const setupProcess = spawn(pythonExe, [
      setupScript,
      appdataPath,
      pythonEmbedDir,
      wheelsDir
    ], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    setupProcess.stdout.on('data', (data) => {
      const message = data.toString().trim();
      console.log('[Setup]', message);
      if (setupWindow && !setupWindow.isDestroyed()) {
        setupWindow.webContents.send('setup-progress', message);
      }
    });
    
    setupProcess.stderr.on('data', (data) => {
      console.error('[Setup Error]', data.toString().trim());
    });
    
    setupProcess.on('close', (code) => {
      if (setupWindow && !setupWindow.isDestroyed()) {
        setupWindow.close();
      }
      
      if (code === 0) {
        console.log('[Setup] Virtual environment created successfully');
        
        // Write status file
        const status = {
          version: '1.0.0',
          created: new Date().toISOString()
        };
        fs.writeFileSync(statusFile, JSON.stringify(status, null, 2));
        
        resolve();
      } else {
        console.error('[Setup] Setup failed with code:', code);
        reject(new Error(`Setup failed with exit code ${code}`));
      }
    });
  });
}

// Start the backend API server
function startBackend() {
  return new Promise(async (resolve, reject) => {
    console.log('[Backend] Starting LiteRT-LM API server...');
    
    try {
      // First ensure venv is set up
      await setupBackendEnvironment();
    } catch (err) {
      console.error('[Backend] Failed to setup environment:', err);
      reject(err);
      return;
    }
    
    const venvPath = path.join(app.getPath('userData'), 'backend', 'litert-lm-venv');
    const litertExe = path.join(venvPath, 'bin', 'litert-lm');
    
    console.log('[Backend] Using venv:', venvPath);
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
          console.log('[Backend] No bundled models found in:', modelPath);
          console.log('[Backend] The app will use models from ~/.litert-lm/models/');
          console.log('[Backend] Download Gemma 4 model and place in:', modelPath);
        }
      } catch (err) {
        console.error('[Backend] Error listing models:', err.message);
      }
    } else {
      console.log('[Backend] Models directory does not exist (Lite version)');
      console.log('[Backend] Download Gemma 4 model from Kaggle and place in:', modelPath);
      console.log('[Backend] Or the app will check ~/.litert-lm/models/ for existing models');
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
        
        // Create symlink (Linux uses 'dir' type for directory symlinks)
        console.log('[Backend] Creating symlink:', modelName);
        console.log('[Backend]   Source:', sourceModelPath);
        console.log('[Backend]   Target:', targetModelPath);
        fs.symlinkSync(sourceModelPath, targetModelPath, 'dir');
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
        reject(new Error(`Backend exited with code ${code}`));
      }
    });
    
    // Health check
    setTimeout(async () => {
      try {
        await checkBackendHealth();
        console.log('[Backend] API health check passed');
        resolve();
      } catch (err) {
        console.error('[Backend] Health check failed:', err.message);
        // Don't reject, backend might still be starting
      }
    }, 5000);
  });
}

// Check if backend is healthy
function checkBackendHealth() {
  return new Promise((resolve, reject) => {
    const req = http.get(`${API_URL}/v1/models`, (res) => {
      if (res.statusCode === 200) {
        resolve();
      } else {
        reject(new Error(`Health check failed: ${res.statusCode}`));
      }
    });
    
    req.on('error', reject);
    req.setTimeout(3000, () => {
      req.destroy();
      reject(new Error('Health check timeout'));
    });
  });
}

// Stop backend process
function stopBackend() {
  if (backendProcess) {
    console.log('[Backend] Terminating...');
    backendProcess.kill('SIGTERM');
    backendProcess = null;
  }
}

// Create main window
function createWindow() {
  const loadingWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    resizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  loadingWindow.loadFile('loading.html');
  loadingWindow.once('ready-to-show', () => {
    loadingWindow.show();
  });

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    }
  });

  const frontendPath = app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar', 'frontend', 'index.html')
    : path.join(__dirname, 'frontend', 'index.html');

  console.log('[Frontend] Loading from:', frontendPath);
  mainWindow.loadFile(frontendPath);

  mainWindow.once('ready-to-show', () => {
    console.log('[Frontend] Window ready to show');
    loadingWindow.close();
    mainWindow.show();
    console.log('[App] Garexsa UI ready!');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC handler for window refocus
ipcMain.on('request-window-focus', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.focus();
  }
});

// App lifecycle
app.on('ready', async () => {
  console.log('[App] Starting Garexsa UI...');
  console.log('[App] Is packaged:', app.isPackaged);
  console.log('[App] App path:', app.getAppPath());
  console.log('[App] UserData path:', app.getPath('userData'));
  
  console.log('[App] Starting backend in background...');
  const startTime = Date.now();
  
  try {
    await startBackend();
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('[App] Backend started in', elapsed, 'seconds');
  } catch (error) {
    console.error('[App] Backend failed:', error);
    app.quit();
    return;
  }

  createWindow();
});

app.on('window-all-closed', () => {
  console.log('[App] Shutting down...');
  stopBackend();
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  stopBackend();
});
