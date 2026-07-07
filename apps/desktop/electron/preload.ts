import { contextBridge, ipcRenderer } from 'electron';

/**
 * Secure bridge (contextIsolation on): the renderer never touches Node/Electron directly. It gets
 * a small, explicit `window.relay` API plus `window.app` for metadata. All calls go over IPC to
 * the main process, which owns the actual relay socket.
 */
contextBridge.exposeInMainWorld('relay', {
  connect: (url: string) => ipcRenderer.invoke('relay:connect', url),
  disconnect: () => ipcRenderer.invoke('relay:disconnect'),
  send: (message: unknown) => ipcRenderer.invoke('relay:send', message),
  onMessage: (callback: (message: unknown) => void) => {
    ipcRenderer.on('relay:message', (_event, message) => callback(message));
  },
  removeAllListeners: () => ipcRenderer.removeAllListeners('relay:message'),
});

contextBridge.exposeInMainWorld('app', {
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
});
