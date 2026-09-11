const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('zmob', {
  version: () => ipcRenderer.invoke('app-version'),
  driveStatus: () => ipcRenderer.invoke('drive-status'),
  driveAuth: (clientId, clientSecret) => ipcRenderer.invoke('drive-auth', { clientId, clientSecret }),
  driveSync: (payload) => ipcRenderer.invoke('drive-sync', payload),
  driveSignout: () => ipcRenderer.invoke('drive-signout')
});
