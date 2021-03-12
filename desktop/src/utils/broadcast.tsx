import { BrowserWindow, ipcMain, ipcRenderer } from 'electron';
import Paper from './paper';

export const MenuId = {
  VIEW_ZOOM_IN: 'view-zoom-in',
  VIEW_ZOOM_OUT: 'view-zoom-out',
  VIEW_SHOW_INFO: 'view-show-info',
  VIEW_SHOW_PAPER_LIST: 'view-show-paper-list',
  EDIT_ADD_TO_FAVORITES: 'edit-add-to-favorites',
  EDIT_REMOVE: 'edit-remove',
  EDIT_DOWNLOAD: 'edit-download',
  EDIT_FETCH: 'edit-fetch',
  EDIT_ADD_TO_COLLECTION: 'edit-add-to-collection',
};

export function openModalEditPaper(p?: Paper) {
  ipcRenderer.send('modal-edit-paper', p);
}

export function openModalAbout() {
  ipcRenderer.send('modal-about');
}

export function toggleDistractionFreeMode(win: BrowserWindow) {
  win.webContents.send('toggle-distraction-free');
}

export function onToggleDistractionFreeMode(fn: () => void) {
  ipcRenderer.on('toggle-distraction-free', () => fn());
}

export function rebuildApplicationMenu(
  paper?: Paper,
  collections?: { name: string; key: string; checked: boolean }[]
) {
  ipcRenderer.send('rebuild-menu', { paper, collections });
}

export function onRebuildApplicationMenu(
  fn: (
    paper?: Paper,
    collections?: { name: string; key: string; checked: boolean }[]
  ) => void
) {
  ipcMain.on('rebuild-menu', (_, { paper, collections }) =>
    fn(paper, collections)
  );
}
