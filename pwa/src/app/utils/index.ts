import { environment, settings } from "./store";
import yaml from "js-yaml";
import fs from "fs";

const isElectron = process.env.IS_ELECTRON;

export const electron = undefined;
export const ipcRenderer = {
  on: (msg: string, data: any) => {},
  removeListener: (msg: string, fn: any) => {},
  send: (msg: string, data: any = {}) => {},
  invoke: (msg: string, data: any = {}) => {
    return undefined;
  },
};
export const Menu = {
  buildFromTemplate(template: any) {
    return { popup: (options: any) => {} };
  },
};
export const remote = {
  getCurrentWindow() {
    return undefined;
  },
  dialog: {
    showMessageBox: (win: any, options: any) => {},
  },
};
export const app = {
  getPath: (path: string) => "",
};
export const ipcMain = {
  on: (msg: string, data: any) => {},
};
export class Store {
  constructor(options: any) {}
  get(key: string) {
    return undefined;
  }
  delete(key: string) {}
  set(key: string, val: any) {}
  store: any;
}

export function openPath(loc: string) {
  // shell.openPath(loc);
}

export function openExternal(url: string) {
  // shell.openExternal(url);
}

function openInNewTab(url: string) {
  const win = window.open(url, "_blank");
  win?.focus();
}

export function downloadPaper(url: string, filename: string) {
  if (isElectron) {
    ipcRenderer.send("download", {
      url,
      directory: settings.paperLocation,
      filename,
    });
  } else {
    var link = document.createElement("a");
    link.target = "_blank";
    link.href = url;
    link.download = filename;
    link.dispatchEvent(new MouseEvent("click"));
  }
}

export function getPath(path: string) {
  return app?.getPath(path);
}

export function popupMenu(template: any, options = {}) {
  const menu = Menu.buildFromTemplate(template);
  menu.popup({
    window: remote.getCurrentWindow(),
    ...options,
  });
}

export function closeWindow() {
  // const window = remote.getCurrentWindow();
  // window.close();
}

function savePaperCache(paperId: string, content: any) {
  if (isElectron) {
    const cachePath = `${settings.dataLocation}/cache/${paperId}.yaml`;
    const fs: any = undefined;
    if (fs) {
      fs.mkdir(
        `${settings.dataLocation}/cache`,
        { recursive: true },
        (err: any) => {
          if (err) throw err;
        }
      );
      fs.writeFileSync(cachePath, content);
    }
  } else {
    localStorage.setItem(`paper:${paperId}`, yaml.dump(content));
  }
}

function loadPaperCache(paperId: string) {
  if (isElectron) {
    const cachePath = `${settings.dataLocation}/cache/${paperId}.yaml`;
    try {
      const data = fs.readFileSync(cachePath);
      return yaml.load(data.toString());
    } catch (e) {
      // empty
    }
  } else {
    const data = localStorage.getItem(`paper:${paperId}`);
    return data && yaml.load(data);
  }
}

const utils = {
  openExternal: isElectron ? openExternal : undefined,
  openUrl: isElectron ? openExternal : openInNewTab,
  openPath: isElectron ? openPath : undefined,
  downloadPaper,
  savePaperCache,
  loadPaperCache,
};

export default utils;
