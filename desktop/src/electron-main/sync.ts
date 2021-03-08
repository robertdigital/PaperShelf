import { BrowserWindow, dialog } from 'electron';
import _syncGoogleDrive from '../utils/sync/google-drive/sync';

export const syncGoogleDrive = (mainWindow: BrowserWindow) => {
  const showMsgBox = (message: string) =>
    dialog.showMessageBox(mainWindow, {
      title: 'Sync',
      type: 'error',
      message,
    });
  _syncGoogleDrive(showMsgBox);
};

export const syncDropbox = () => {};
