const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  getApiUrl: () => ipcRenderer.invoke('get-api-url'),
  refocusWindow: () => ipcRenderer.invoke('refocus-window'),
  onSetupStatus: (callback) => ipcRenderer.on('setup-status', (event, message) => callback(message))
});

// Garexsa: Force NEW chat on every app start
window.addEventListener('DOMContentLoaded', () => {
  console.log('[Garexsa Preload] Preparing to force new chat on startup');
  
  // Set a flag that the frontend will check
  setTimeout(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        // Set a flag indicating fresh startup
        sessionStorage.setItem('garexsa_force_new_chat', 'true');
        console.log('[Garexsa] Set force new chat flag');
      }
    } catch (err) {
      console.error('[Garexsa] Error in preload:', err);
    }
  }, 100);
});
