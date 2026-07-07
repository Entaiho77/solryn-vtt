import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'node:path';
import { RelayClient } from './relay-client';

// Linux/X11 (e.g. Bazzite) launch flags — must be set before the app is ready. X11 Ozone backend
// avoids the noisy Wayland/Vulkan warnings; disabling the GPU and the sandbox works around
// compositor/driver combos where the window never becomes visible. No-ops on Windows/macOS.
app.commandLine.appendSwitch('ozone-platform', 'x11');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-dev-shm-usage');

let mainWindow: BrowserWindow | null = null;
let relay: RelayClient | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1280,
    minHeight: 800,
    show: false, // shown on ready-to-show (and after load) to avoid a white flash
    frame: true,
    autoHideMenuBar: false,
    paintWhenInitiallyHidden: true,
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const reveal = (): void => {
    mainWindow?.show();
    mainWindow?.focus();
    mainWindow?.moveTop();
  };

  // Preferred trigger: the window content is ready to paint.
  mainWindow.once('ready-to-show', reveal);
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // electron-vite sets ELECTRON_RENDERER_URL to the Vite dev server in development; in production
  // we load the built renderer (the reused apps/web UI) from disk.
  const load = process.env.ELECTRON_RENDERER_URL
    ? mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
    : mainWindow.loadFile(join(__dirname, '../renderer/index.html'));

  // Fallback: some Linux/X11 compositors don't reliably emit ready-to-show, which leaves the
  // window created-but-hidden (the reported "tray icon but no window"). Force it visible once the
  // content has loaded. show()/focus() are idempotent, so pairing with ready-to-show is safe.
  void load.then(reveal);
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
