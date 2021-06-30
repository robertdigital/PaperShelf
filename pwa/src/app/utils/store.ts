import { getPath } from ".";

// import Store from "electron-store";
import { Store } from ".";
import fs from "fs";
import yaml from "js-yaml";
import path from "path";

export type HomeSection = {
  key: string;
  title: string;
  query: string;
  visible: boolean;
};

export enum SortType {
  ByTitle = "title",
  ByYear = "year",
  ByCitation = "citation",
  ByDateAdded = "dateAdded",
  ByDateModified = "dateModified",
}

export type User = {
  uid: string | null;
};

export type Settings = {
  userDataPath: string;
  dataLocation: string;
  paperLocation: string;
  theme: string;
  useTab: boolean;
  autoDownload: boolean;
  paperList: {
    headerFormat: string;
    contentFormat: string;
    content2Format: string;
    expandedHeaderFormat: string;
    expandedContentFormat: string;
    actionButtons: string[];
  };
  paperTab: {
    max: number;
    headerFormat: string;
    contentFormat: string;
  };
  searchFields: string[];
  searchThreshold: number;
  defaultSortBy: SortType;
  view: {
    showSideBar: boolean;
  };
  homeSections: Record<string, HomeSection>;
  defaultTags: string[];
  fetchPaperSources: string[];
  searchPaperSources: string[];
  dateSynced: number;
  dateSaved: number;
};

const defaultSettings = {
  userDataPath: getPath("userData"),
  dataLocation: getPath("userData"),
  theme: "light",
  useTab: false,
  paperLocation: path.join(getPath("downloads") || ".", "PaperShelf"),
  offlineAccess: false,
  autoDownload: false,
  paperList: {
    headerFormat: "{title}",
    contentFormat: "{authorShort} ({venueAndYear})",
    content2Format: "Cited by {numCitations}",
    expandedHeaderFormat: "{title} ({authorShort}, {venueAndYear})",
    expandedContentFormat: "{abstract}",
    actionButtons: ["star", "add"],
  },
  paperTab: {
    max: 4,
    headerFormat: "{title}",
    contentFormat: "{authorShort} ({venueAndYear})",
  },
  paperSources: {
    "Microsoft Research": {
      primaryKey: null,
      secondaryKey: null,
    },
  },
  searchPaperSources: ["arXiv"],
  fetchPaperSources: ["arXiv", "Semantic Scholar"],
  searchFields: ["title", "tags", "authors", "abstract"],
  searchThreshold: 0.4,
  view: {
    showSideBar: true,
  },
  defaultTags: [],
  pdfViewerToolbar: ["info", "divider", "zoomIn", "zoomOut", "divider", "open"],
  defaultSortBy: SortType.ByDateAdded,
  sync: {
    method: "none",
    googleDrive: {
      code: null,
      lastUpdated: null,
      clientId: null,
      clientSecret: null,
    },
  },
  homeSections: {
    "recently-added": {
      key: "recently-added",
      title: "Recently Added",
      visible: true,
      query: `return papers.sort((a, b) => -a.dateAdded + b.dateAdded);`,
    },
    "to-read": {
      key: "to-read",
      title: "To Read",
      visible: true,
      query: `const c = collections.find(c => c.key === 'to-read); return papers.filter(p => c.has(p.id));`,
    },
    starred: {
      key: "starred",
      title: "Starred",
      visible: true,
      query: `return papers.filter(p => p.starred).sort((a, b) => -a.dateAdded + b.dateAdded);`,
    },
    "arxiv-ai": {
      key: "arxiv-ai",
      title: "AI (ArXiv)",
      visible: true,
      query: "https://export.arxiv.org/rss/cs.AI",
    },
  },
  dateSynced: 0,
  dateSaved: 0,
};

export const store = new Store({
  defaults: defaultSettings,
  fileExtension: "yaml",
  serialize: yaml.dump,
  deserialize: yaml.load,
});

export const environment = {
  enableOfflineAccess: false,
  enableSync: false,
  useLocalStorage: true,
  isElectron: false,
};

// store.clear();

export const defaultAppData = {
  papers: {
    welcome: {
      id: "welcome",
      inLibrary: true,
      starred: true,
      title: "Welcome",
      year: 2021,
      pdfUrl:
        "https://firebasestorage.googleapis.com/v0/b/paper-shelf.appspot.com/o/welcome.pdf?alt=media&token=42e8011e-405c-454a-9d60-3869f3d4c287",
    },
    he2015deep: {
      id: "he2015deep",
      title: "Deep Residual Learning for Image Recognition",
      inLibrary: true,
      pdfUrl: "https://arxiv.org/pdf/1512.03385.pdf",
      year: 2015,
      authors: ["Kaiming He", "Xiangyu Zhang", "Shaoqing Ren", "Jian Sun"],
    },
  },
  collections: {
    favorites: {
      name: "Favorites",
      icon: "star",
    },
    read: {
      name: "Read",
      icon: "read",
    },
    "to-read": {
      name: "To Read",
      icon: "unread",
    },
  },
  dateSynced: 0,
  dateSaved: 0,
};

export type AppData = {
  papers: Record<string, any>;
  collections: Record<string, any>;
  dateSynced: number;
  dateSaved: number;
};

export const dataStore = new Store({
  name: "data",
  defaults: defaultAppData,
  fileExtension: "yaml",
  serialize: yaml.dump,
  deserialize: yaml.load,
  cwd: store.get("dataLocation"),
});

function getDataFromLocalStorage() {
  const data = localStorage.getItem("data");
  return data ? yaml.load(data) : null;
}

function getSettingsFromLocalStorage() {
  const s = localStorage.getItem("settings");
  return s ? yaml.load(s) : null;
}

export const settings: Settings =
  store.store || getSettingsFromLocalStorage() || defaultSettings;
export const appData: AppData =
  dataStore.store || getDataFromLocalStorage() || defaultAppData;
// export const settings: Settings = defaultSettings;
// export const appData: AppData = defaultData;

export function changeDataStoreCwd(newPath?: string) {
  const root = newPath || settings.userDataPath;
  if (!environment.useLocalStorage) {
    fs.writeFile(`${root}/data.yaml`, yaml.dump(dataStore.store), () => {});
  }

  // TODO: require restart
}

export function saveAppData() {
  localStorage.setItem(
    "data",
    yaml.dump({
      ...appData,
      dateSaved: Date.now(),
    })
  );
}

export function saveSettings() {
  localStorage.setItem(
    "settings",
    yaml.dump({
      ...settings,
      dateSaved: Date.now(),
    })
  );
}
