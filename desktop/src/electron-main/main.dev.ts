/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./src/electron-main/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import Store from 'electron-store';
import electronDl, { download } from 'electron-dl';
import fs from 'fs';
import { IpcMainEvent, IpcMainInvokeEvent } from 'electron/main';
import MenuBuilder from './menu';
import initContextMenu from './contextMenu';
import Paper from '../utils/paper';

electronDl();
Store.initRenderer();

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    title: 'PaperShelf',
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/../index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(createWindow)
  .then(() => initContextMenu(mainWindow!))
  .catch(console.log);

ipcMain.on('modal-edit-paper', (_, p?: Paper) => {
  const win = new BrowserWindow({
    title: p ? 'Edit Paper' : 'New Paper',
    width: 500,
    height: 600,
    minWidth: 500,
    minHeight: 600,
    minimizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    parent: mainWindow || undefined,
    modal: false,
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    show: false,
  });

  win.loadURL(`file://${__dirname}/#/addPaper?id=${p?.id || ''}`);
  win.once('ready-to-show', () => {
    win.show();
  });
});

ipcMain.on('download', (_, { url, directory, filename }) => {
  download(mainWindow!, url, {
    filename,
    directory,
    showBadge: false,
  }).catch(() => {});
});

ipcMain.handle(
  'save-thumbnail',
  async (
    event: IpcMainInvokeEvent,
    { paper, data }: { paper: Paper; data: string }
  ) => {
    fs.mkdir(
      `${app.getPath('userData')}/thumbnails`,
      { recursive: true },
      (err) => {
        if (err) throw err;
      }
    );
    const thumbnail = `${app.getPath('userData')}/thumbnails/${paper.id}.png`;
    fs.writeFile(thumbnail, data, 'base64', function (err) {
      if (err) console.log(err);
    });
    return thumbnail;
  }
);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

ipcMain.on('context', (_, { itemType, itemId }) => {
  console.log('main-context-menu', itemType, itemId);
});
