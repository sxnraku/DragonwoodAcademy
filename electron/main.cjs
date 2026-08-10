const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 700,
    title: 'Dragonwood Academy',
    icon: path.join(__dirname, '../public/icon.png'),
    backgroundColor: '#111827',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000';
    mainWindow.loadURL(devUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Open external links in default OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Custom Application Menu
  const template = [
    {
      label: 'Jogo',
      submenu: [
        { label: 'Recarregar', accelerator: 'CmdOrCtrl+R', click: () => mainWindow.reload() },
        { label: 'Tela Cheia', accelerator: 'F11', click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()) },
        { type: 'separator' },
        { label: 'Sair', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: 'Ajuda',
      submenu: [
        {
          label: 'Sobre Dragonwood Academy',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Dragonwood Academy',
              message: 'Dragonwood Academy - App de PC Nativo',
              detail: 'Versão 1.0.0\nConstruído com Electron & React.\nMonte, treine e evolua os seus dragões!'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
