const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('zmob', {
  version: () => ipcRenderer.invoke('app-version')
});
