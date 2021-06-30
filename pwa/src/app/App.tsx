import { throttle } from "lodash";
import { useEffect, useRef, useState } from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import {
  Flex,
  Box,
  Divider,
  Button,
  MenuButton,
  MoreIcon,
  AddIcon,
  DownloadIcon,
  Dialog,
  SettingsIcon,
} from "@fluentui/react-northstar";
import PdfViewer from "./components/PdfViewer";
import PaperList, { PaperListHandle } from "./components/PaperList";
import "./App.global.css";

import PaperInfo from "./components/PaperInfo";
import Home from "./components/Home";
import Paper, { getLocalPapers, getPapersFromObject } from "./utils/paper";
import PaperTabBar from "./components/PaperTabBar";
import { appData, saveAppData, settings } from "./utils/store";
import About from "./views/about";
import Login from "./views/login";
import Preferences, { PreferencesHandle } from "./components/Preferences";
import { MenuId, rebuildApplicationMenu } from "./utils/broadcast";
import Collection, {
  getCollections,
  getCollectionsFromObject,
} from "./utils/collection";
import { ipcRenderer } from "./utils";
import { syncAll } from "./utils/sync";
import SyncStatusButton from "./components/SyncStatusButton";
import firebase from "firebase";
import "firebase/auth";

enum View {
  Regular,
  SideBarOnly,
  PdfViewerOnly,
  DistractionFree,
}

const Main = () => {
  const defaultSideBarWidth = 300;
  const prefRef = useRef<PreferencesHandle>();
  const [height, setHeight] = useState<number>(0);
  const [sideBarWidth, setSideBarWidth] = useState<number>(300);
  const [pdfWidth, setPdfWidth] = useState<number>(0);

  const [showPaperInfo, setShowPaperInfo] = useState<boolean>(false);
  const [view, setView] = useState<View>(View.Regular);

  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [allPapers, setAllPapers] = useState<Paper[]>([]);
  const [allCollections, setAllCollections] = useState<Collection[]>([]);

  const [isLogin, setIsLogin] = useState<boolean>(false);

  const listRef = useRef<PaperListHandle>();

  const refreshList = (reload = false) => {
    if (listRef && listRef.current) listRef.current?.refresh(reload);
  };
  const loadPapers = () => setAllPapers(getLocalPapers());
  const loadCollections = () => {
    const cs = getCollections();
    setAllCollections(cs);
    refreshApplicationMenu(undefined, cs);
  };

  const addToLibrary = (paper: Paper) => {
    if (!allPapers.map((p) => p.id).includes(paper.id)) {
      paper.addToLibrary();
      paper.serialize();
      setAllPapers([...allPapers, paper]);
    }
  };

  const refreshApplicationMenu = (
    paper?: Paper,
    collections?: Collection[]
  ) => {
    const p = paper || selectedPaper || undefined;
    const cs = collections || allCollections;
    rebuildApplicationMenu(
      p,
      cs.map((c) => ({
        name: c.name,
        key: c.key,
        checked: !!p?.id && c.has(p.id),
      }))
    );
  };

  const fetch = (paper: Paper) => {
    paper.isFetching = true;
    refreshList();
    paper
      .fetch()
      .then(() => {
        refreshList();
        return true;
      })
      .catch(() => {});
  };

  // Handle menu items
  const onViewShowInfo = () => setShowPaperInfo(!showPaperInfo);
  const onViewShowPaperList = () =>
    changeView(view === View.Regular ? View.PdfViewerOnly : View.Regular);
  const onEditAddToFavorites = () => selectedPaper?.toggleStar();
  const onEditDownload = () => selectedPaper?.download();
  const onEditRemove = () => {
    if (selectedPaper) removePaper(selectedPaper);
  };
  const onEditFetch = () => {
    if (selectedPaper) fetch(selectedPaper);
  };
  const onAddToCollection = (_: any, { key }: { key: string }) => {
    if (selectedPaper) {
      allCollections.some((c) => {
        if (c.key === key) {
          if (selectedPaper.id) c.toggle(selectedPaper.id);
          refreshList(true);
          return true;
        }
        return false;
      });
    }
  };

  const sync = async () => {
    await syncAll();
    console.log(appData);
    setAllPapers(appData.papers ? getPapersFromObject(appData.papers) : []);
    setAllCollections(
      appData.collections ? getCollectionsFromObject(appData.collections) : []
    );
    saveAppData();
  };

  useEffect(() => {
    firebase.auth().onAuthStateChanged(function (user) {
      setIsLogin(!!user);
      sync();
    });

    if (ipcRenderer !== undefined) {
      ipcRenderer?.on(MenuId.VIEW_SHOW_INFO, onViewShowInfo);
      ipcRenderer?.on(MenuId.VIEW_SHOW_PAPER_LIST, onViewShowPaperList);
      ipcRenderer?.on(MenuId.EDIT_ADD_TO_FAVORITES, onEditAddToFavorites);
      ipcRenderer?.on(MenuId.EDIT_DOWNLOAD, onEditDownload);
      ipcRenderer?.on(MenuId.EDIT_REMOVE, onEditRemove);
      ipcRenderer?.on(MenuId.EDIT_FETCH, onEditFetch);
      ipcRenderer?.on(MenuId.EDIT_ADD_TO_COLLECTION, onAddToCollection);
    }

    return () => {
      if (ipcRenderer !== undefined) {
        ipcRenderer?.removeListener(MenuId.VIEW_SHOW_INFO, onViewShowInfo);
        ipcRenderer?.removeListener(
          MenuId.VIEW_SHOW_PAPER_LIST,
          onViewShowPaperList
        );
        ipcRenderer?.removeListener(
          MenuId.EDIT_ADD_TO_FAVORITES,
          onEditAddToFavorites
        );
        ipcRenderer?.removeListener(MenuId.EDIT_DOWNLOAD, onEditDownload);
        ipcRenderer?.removeListener(MenuId.EDIT_REMOVE, onEditRemove);
        ipcRenderer?.removeListener(MenuId.EDIT_FETCH, onEditFetch);
        ipcRenderer?.removeListener(
          MenuId.EDIT_ADD_TO_COLLECTION,
          onAddToCollection
        );
      }
    };
  }, []);

  const getListContextMenu = (p: Paper) => [
    {
      label: "Add to Library",
      visible: !p.inLibrary,
      click() {
        addToLibrary(p);
      },
      icon: <AddIcon />,
    },
    {
      label: "Add to Collection",
      submenu: allCollections.map((c) => ({
        type: "checkbox",
        label: c.name,
        checked: p.inCollection(c),
        click: () => {
          c.toggle(p.id!);
          refreshList(true);
        },
      })),
      visible: p.inLibrary,
    },
    {
      label: p.starred ? "Remove from Favorites" : "Add to Favorites",
      click() {
        p.toggleStar();
        refreshList();
      },
    },
    {
      label: "Refresh Paper Details",
      enabled: p.inLibrary,
      click() {
        fetch(p);
      },
    },
    {
      label: "Download PDF",
      enabled: p.inLibrary && !p.localPath,
      click() {
        p.download();
      },
      icon: <DownloadIcon />,
    },
    {
      label: "Show Details",
      click() {
        refreshList();
        setShowPaperInfo(true);
      },
    },
    ...(p.openPdf
      ? [
          {
            type: "separator",
          },
          {
            label: "Open URL",
            enabled: !!p,
            click() {
              p?.openUrl();
            },
          },
          {
            label: "Open in Default App",
            enabled: !!p.getLocalPath(),
            click() {
              p.openPdf && p.openPdf();
            },
          },
        ]
      : []),
    {
      type: "separator",
    },
    {
      label: "Remove from Library",
      click() {
        removePaper(p);
      },
      visible: p.inLibrary,
    },
  ];

  const changeView = (v: View) => {
    setView(v);
    switch (v) {
      case View.Regular:
        setSideBarWidth(defaultSideBarWidth);
        break;
      case View.PdfViewerOnly:
        setPdfWidth(window.innerWidth);
        setSideBarWidth(0);
        break;
      case View.SideBarOnly:
        setSideBarWidth(window.innerWidth);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    setSideBarWidth(defaultSideBarWidth);
    setView(settings.view.showSideBar ? View.Regular : View.PdfViewerOnly);
  }, []);

  useEffect(() => {
    const setSize = () => {
      setHeight(window.innerHeight);
      setPdfWidth(window.innerWidth - sideBarWidth);
    };

    loadPapers();
    loadCollections();

    setSize();
    window.addEventListener("resize", throttle(setSize, 500));

    return () => {
      window.removeEventListener("resize", throttle(setSize, 500));
    };
  }, [sideBarWidth]);

  const removePaper = (p: Paper) => {
    p.remove();
    setShowPaperInfo(false);
    setSelectedPaper(null);
    setAllPapers(allPapers.filter((paper) => paper.id !== p.id));
  };

  return (
    <Flex
      column
      styles={{ height: "100vh", width: "100vw", overflow: "hidden" }}
    >
      <Flex.Item grow>
        <Flex>
          {(view === View.Regular || view === View.SideBarOnly) && (
            <Box
              style={{
                width: view === View.Regular ? `${sideBarWidth}px` : "100vw",
                height: `${height}px`,
              }}
            >
              <PaperList
                expanded={view === View.SideBarOnly}
                allPapers={allPapers}
                allCollections={allCollections}
                setAllCollections={setAllCollections}
                addToLibrary={addToLibrary}
                getContextMenu={getListContextMenu}
                onChange={(p) => {
                  setSelectedPaper(p || null);
                  refreshApplicationMenu(p);
                }}
                onExpand={(val: boolean) =>
                  setView(val ? View.SideBarOnly : View.Regular)
                }
                ref={listRef}
              />
            </Box>
          )}
          <Divider fitted vertical />
          {(view === View.Regular || view === View.PdfViewerOnly) && (
            <Box
              style={{
                width: `calc(100vw - ${sideBarWidth}px`,
                height: `${height}px`,
              }}
            >
              {showPaperInfo ? (
                <PaperInfo
                  paper={selectedPaper}
                  top={44}
                  onClose={() => setShowPaperInfo(false)}
                />
              ) : (
                <Flex column>
                  <Flex space="between">
                    <PaperTabBar
                      paper={selectedPaper}
                      setPaper={setSelectedPaper}
                      height={44}
                    />
                    <Flex>
                      <SyncStatusButton isLogin={isLogin} />
                      <Dialog
                        header="Settings"
                        cancelButton="Close"
                        confirmButton="Save"
                        trigger={
                          <Button
                            text
                            iconOnly
                            icon={<SettingsIcon />}
                            styles={{ margin: "6px" }}
                          />
                        }
                        style={{
                          height: "calc(100vh - 50px)",
                          width: "calc(100vw - 50px)",
                          maxWidth: "800px",
                        }}
                        onConfirm={() => {
                          if (prefRef.current) prefRef.current.save();
                        }}
                        onCancel={() => {}}
                        content={<Preferences ref={prefRef} />}
                      />
                      <MenuButton
                        trigger={
                          <Button
                            text
                            iconOnly
                            size="medium"
                            icon={<MoreIcon />}
                          />
                        }
                        menu={[
                          {
                            content: "About...",
                            onClick: () =>
                              window.open(
                                "https://trungd.github.io/PaperShelf/",
                                "_blank"
                              ),
                          },
                          {
                            content: "Feedback",
                            onClick: () =>
                              window.open(
                                "https://github.com/trungd/PaperShelf/issues",
                                "_blank"
                              ),
                          },
                          {
                            content: "Report Issue",
                            onClick: () =>
                              window.open(
                                "https://github.com/trungd/PaperShelf/issues",
                                "_blank"
                              ),
                          }
                        ]}
                        styles={{ margin: "6px" }}
                      />
                    </Flex>
                  </Flex>
                  <Divider fitted />
                  {selectedPaper ? (
                    <PdfViewer
                      paper={selectedPaper}
                      width={pdfWidth}
                      top={42}
                      addToLibrary={addToLibrary}
                    />
                  ) : (
                    <Home
                      top={44}
                      allPapers={allPapers}
                      allCollections={allCollections}
                      setPaper={setSelectedPaper}
                    />
                  )}
                </Flex>
              )}
            </Box>
          )}
        </Flex>
      </Flex.Item>
    </Flex>
  );
};

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/about" component={About} />
        <Route path="/preferences" component={Preferences} />
        <Route path="/login" component={Login} />
        <Route path="/" component={Main} />
      </Switch>
    </Router>
  );
}
