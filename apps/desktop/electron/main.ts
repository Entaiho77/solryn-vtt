import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'node:path';
import { RelayClient } from './relay-client';

let mainWindow: BrowserWindow | null = null;
let relay: RelayClient | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1280,
    minHeight: 800,
    show: false,
    backgroundColor: '#1a1d24',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow?.show());
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // electron-vite sets ELECTRON_RENDERER_URL to the Vite dev server in development; in production
  // we load the built renderer (the reused apps/web UI) from disk.
  if (process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

/** Wire the renderer↔relay IPC. The relay socket lives here in the main process. */
function registerIpc(): void {
  ipcMain.handle('app:getVersion', () => app.getVersion());

  ipcMain.handle('relay:connect', async (_event, url: string) => {
    relay?.close();
    relay = new RelayClient(url, (message) => mainWindow?.webContents.send('relay:message', message));
    await relay.connect();
    return { connected: true };
  });

  ipcMain.handle('relay:disconnect', () => {
    relay?.close();
    relay = null;
    return { connected: false };
  });

  ipcMain.handle('relay:send', (_event, message: unknown) => {
    relay?.send(message);
  });
}

void app.whenReady().then(() => {
  registerIpc();
  createWindow();

  // macOS: re-open a window when the dock icon is clicked and none are open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  relay?.close();
  relay = null;
  // macOS apps typically stay active until Cmd+Q.
  if (process.platform !== 'darwin') app.quit();
});
