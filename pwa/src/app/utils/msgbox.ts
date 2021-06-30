import { remote } from ".";

const { dialog } = remote;

export function showError(msg: string) {
  dialog.showMessageBox(remote.getCurrentWindow(), {
    message: msg,
  });
}

export function showMessage(msg: string) {
  dialog.showMessageBox(remote.getCurrentWindow(), {
    message: msg,
  });
}
