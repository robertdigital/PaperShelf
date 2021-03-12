import {
  app,
  Menu,
  shell,
  BrowserWindow,
  MenuItemConstructorOptions,
} from 'electron';
import { dataStore, store } from '../utils/store';
import {
  MenuId,
  viewShowInfo,
  viewShowPaperList,
  viewZoomIn,
  viewZoomOut,
} from '../utils/broadcast';
import { showPreferences } from './modal';
import Paper from '../utils/paper';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

const setupDevelopmentEnvironment = (mainWindow: BrowserWindow) => {
  mainWindow.webContents.on('context-menu', (_, props) => {
    const { x, y } = props;

    Menu.buildFromTemplate([
      {
        label: 'Inspect element',
        click: () => {
          mainWindow.webContents.inspectElement(x, y);
        },
      },
    ]).popup({ window: mainWindow });
  });
};

export default (
  mainWindow: BrowserWindow,
  paper?: Paper,
  collections?: { name: string; key: string; checked: boolean }[]
) => {
  const isDarwin = process.platform === 'darwin';
  console.log('id: ', paper?.id);

  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    setupDevelopmentEnvironment(mainWindow);
  }

  const subMenuEdit:
    | MenuItemConstructorOptions
    | DarwinMenuItemConstructorOptions = {
    label: 'Paper',
    submenu: [
      // { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
      // { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
      // { type: 'separator' },
      { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
      { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
      { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
      { type: 'separator' },
      {
        label: 'Add to Collection',
        submenu: collections?.map((c) => ({
          type: 'checkbox',
          label: c.name,
          enabled: !!paper,
          checked: c.checked,
          click() {
            mainWindow.webContents.send(MenuId.EDIT_ADD_TO_COLLECTION, {
              key: c.key,
            });
          },
        })),
      },
      {
        label: !paper?.starred ? 'Add to Favorites' : 'Remove from Favorites',
        enabled: !!paper,
        click() {
          mainWindow.webContents.send(MenuId.EDIT_ADD_TO_FAVORITES);
        },
      },
      {
        label: 'Refresh Paper Details',
        enabled: !!paper && paper.inLibrary,
        click() {
          mainWindow.webContents.send(MenuId.EDIT_FETCH);
        },
      },
      {
        label: 'Download PDF',
        enabled: !!paper && paper.inLibrary && !paper.localPath,
        click() {
          mainWindow.webContents.send(MenuId.EDIT_DOWNLOAD);
        },
      },
      {
        label: 'Remove from Library',
        enabled: !!paper && paper.inLibrary,
        click() {
          mainWindow.webContents.send(MenuId.EDIT_REMOVE);
        },
      },
      // { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
    ],
  };

  const subMenuViewProd: MenuItemConstructorOptions = {
    label: 'View',
    submenu: [
      {
        label: 'Zoom In',
        click: () => {
          mainWindow.webContents.send(MenuId.VIEW_ZOOM_IN);
        },
      },
      {
        label: 'Zoom Out',
        click: () => {
          mainWindow.webContents.send(MenuId.VIEW_ZOOM_OUT);
        },
      },
      { type: 'separator' },
      {
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Command+F',
        click: () => {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        },
      },
      {
        label: 'Toggle Paper List',
        click: () => {
          mainWindow.webContents.send(MenuId.VIEW_SHOW_PAPER_LIST);
        },
      },
      {
        label: 'Toggle Details',
        click: () => {
          mainWindow.webContents.send(MenuId.VIEW_SHOW_INFO);
        },
      },
    ],
  };

  const subMenuViewDev: MenuItemConstructorOptions = {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'Command+R',
        click: () => {
          mainWindow.webContents.reload();
        },
      },
      {
        type: 'separator',
      },
      ...subMenuViewProd.submenu!,
    ],
  };

  const subMenuWindow: DarwinMenuItemConstructorOptions | null =
    process.platform === 'darwin'
      ? {
          label: 'Window',
          submenu: [
            {
              label: 'Minimize',
              accelerator: 'Command+M',
              selector: 'performMiniaturize:',
            },
            {
              label: 'Close',
              accelerator: 'Command+W',
              selector: 'performClose:',
            },
            { type: 'separator' },
            { label: 'Bring All to Front', selector: 'arrangeInFront:' },
          ],
        }
      : null;

  const subMenuAbout:
    | DarwinMenuItemConstructorOptions
    | MenuItemConstructorOptions = isDarwin
    ? {
        label: 'PaperShelf',
        submenu: [
          {
            label: 'About PaperShelf',
            selector: 'orderFrontStandardAboutPanel:',
          },
          { type: 'separator' },
          {
            label: 'Preferences',
            submenu: [
              {
                label: 'Open Preferences',
                click: () => showPreferences(mainWindow),
              },
              { type: 'separator' },
              {
                label: 'Edit general settings (config.yaml)',
                click: () => store.openInEditor(),
              },
              {
                label: 'Edit saved data (data.yaml)',
                click: () => dataStore.openInEditor(),
              },
              { type: 'separator' },
              {
                label: 'Reset',
                click: () => store.reset(),
              },
            ],
          },
          // {
          //  label: 'Sync',
          //  click: () => syncGoogleDrive(mainWindow),
          // },
          { type: 'separator' },
          {
            label: 'Hide PaperShelf',
            accelerator: 'Command+H',
            selector: 'hide:',
          },
          {
            label: 'Hide Others',
            accelerator: 'Command+Shift+H',
            selector: 'hideOtherApplications:',
          },
          { label: 'Show All', selector: 'unhideAllApplications:' },
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: 'Command+Q',
            click: () => {
              app.quit();
            },
          },
        ],
      }
    : {
        label: '&File',
        submenu: [
          {
            label: 'Preferences',
            submenu: [
              {
                label: 'Open Preferences',
                click: () => showPreferences(mainWindow),
              },
              { type: 'separator' },
              {
                label: 'Edit General Settings (config.yaml)',
                click: () => store.openInEditor(),
              },
              {
                label: 'Edit Data (data.yaml)',
                click: () => dataStore.openInEditor(),
              },
              { type: 'separator' },
              {
                label: 'Reset',
                click: () => store.reset(),
              },
            ],
          },
          // {
          //  label: 'Sync',
          //  click: () => syncGoogleDrive(mainWindow),
          // },
          {
            label: '&Close',
            accelerator: 'Ctrl+W',
            click: () => {
              mainWindow.close();
            },
          },
        ],
      };

  const subMenuHelp: MenuItemConstructorOptions = {
    label: 'Help',
    submenu: [
      {
        label: 'Home Page',
        click() {
          shell.openExternal('https://trungd.github.io/PaperShelf');
        },
      },
      {
        label: 'Preferences',
        click() {
          shell.openExternal('https://trungd.github.io/PaperShelf/preferences');
        },
      },
      {
        label: 'Issues and Feature Requests',
        click() {
          shell.openExternal('https://github.com/trungd/PaperShelf/issues');
        },
      },
    ],
  };

  const subMenuView =
    process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true'
      ? subMenuViewDev
      : subMenuViewProd;

  const template = [
    subMenuAbout,
    subMenuEdit,
    subMenuView,
    subMenuWindow,
    subMenuHelp,
  ].filter((it) => !!it);

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  return menu;
};
