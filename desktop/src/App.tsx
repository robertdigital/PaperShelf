import { throttle } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { Flex, Box } from '@fluentui/react-northstar';
import { ipcRenderer, remote } from 'electron';
import PdfViewer from './components/PdfViewer';
import PaperList from './components/PaperList';
import './App.global.css';

import PaperInfo from './components/PaperInfo';
import Home from './components/Home';
import Paper, { getLocalPapers } from './utils/paper';
import PaperTabBar from './components/PaperTabBar';
import { store } from './utils/store';
import About from './views/about';
import Preferences from './views/preferences';
import { MenuId, rebuildApplicationMenu } from './utils/broadcast';
import Collection, { getCollections } from './utils/collection';

const { Menu } = remote;

enum View {
  Regular,
  SideBarOnly,
  PdfViewerOnly,
  DistractionFree,
}

const Main = () => {
  const [height, setHeight] = useState<number>(0);
  const [sideBarWidth, setSideBarWidth] = useState<number>(300);
  const [pdfWidth, setPdfWidth] = useState<number>(0);

  const [showPaperInfo, setShowPaperInfo] = useState<boolean>(false);
  const [view, setView] = useState<View>(View.Regular);

  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [allPapers, setAllPapers] = useState<Paper[]>([]);
  const [allCollections, setAllCollections] = useState<Collection[]>([]);

  const listRef = useRef();

  const refreshList = (reload = false) => {
    if (listRef) listRef.current.refresh(reload);
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
        checked: p?.id && c.has(p?.id),
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
  const onAddToCollection = (_, { key }: { key: string }) => {
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

  useEffect(() => {
    /*
    onToggleDistractionFreeMode(() => {
      if (isDistractionFree) {
        setIsDistractionFree(false);
        setShowSideBar(true);
        setSideBarWidth(store.get('view.sideBarWidth'));
      } else {
        setIsDistractionFree(true);
        setShowSideBar(false);
        setSideBarWidth(0);
      }
    });
    */
    ipcRenderer.on(MenuId.VIEW_SHOW_INFO, onViewShowInfo);
    ipcRenderer.on(MenuId.VIEW_SHOW_PAPER_LIST, onViewShowPaperList);
    ipcRenderer.on(MenuId.EDIT_ADD_TO_FAVORITES, onEditAddToFavorites);
    ipcRenderer.on(MenuId.EDIT_DOWNLOAD, onEditDownload);
    ipcRenderer.on(MenuId.EDIT_REMOVE, onEditRemove);
    ipcRenderer.on(MenuId.EDIT_FETCH, onEditFetch);
    ipcRenderer.on(MenuId.EDIT_ADD_TO_COLLECTION, onAddToCollection);

    return () => {
      ipcRenderer.removeListener(MenuId.VIEW_SHOW_INFO, onViewShowInfo);
      ipcRenderer.removeListener(
        MenuId.VIEW_SHOW_PAPER_LIST,
        onViewShowPaperList
      );
      ipcRenderer.removeListener(
        MenuId.EDIT_ADD_TO_FAVORITES,
        onEditAddToFavorites
      );
      ipcRenderer.removeListener(MenuId.EDIT_DOWNLOAD, onEditDownload);
      ipcRenderer.removeListener(MenuId.EDIT_REMOVE, onEditRemove);
      ipcRenderer.removeListener(MenuId.EDIT_FETCH, onEditFetch);
      ipcRenderer.removeListener(
        MenuId.EDIT_ADD_TO_COLLECTION,
        onAddToCollection
      );
    };
  });

  const getListContextMenu = (p: Paper) =>
    Menu.buildFromTemplate([
      {
        label: 'Add to Library',
        visible: !p.inLibrary,
        click() {
          addToLibrary(p);
        },
      },
      {
        label: 'Add to Collection',
        submenu: allCollections.map((c) => ({
          type: 'checkbox',
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
        label: p.starred ? 'Remove from Favorites' : 'Add to Favorites',
        click() {
          p.toggleStar();
          refreshList();
        },
      },
      {
        label: 'Refresh Paper Details',
        enabled: p.inLibrary,
        click() {
          fetch(p);
        },
      },
      {
        label: 'Download PDF',
        enabled: p.inLibrary && !p.localPath,
        click() {
          p.download();
        },
      },
      {
        label: 'Show Details',
        click() {
          refreshList();
          setShowPaperInfo(true);
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Open URL',
        enabled: !!p,
        click() {
          p?.openUrl();
        },
      },
      {
        label: 'Open in Default App',
        enabled: !!p.getLocalPath(),
        click() {
          p.openPdf();
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Remove from Library',
        click() {
          removePaper(p);
        },
        visible: p.inLibrary,
      },
    ]);

  const changeView = (v: View) => {
    setView(v);
    switch (v) {
      case View.Regular:
        setSideBarWidth(store.get('view.sideBarWidth'));
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
    setSideBarWidth(store.get('view.sideBarWidth'));
    setView(store.get('view.showSideBar') ? View.Regular : View.PdfViewerOnly);
  }, []);

  useEffect(() => {
    const setSize = () => {
      setHeight(window.innerHeight);
      setPdfWidth(window.innerWidth - sideBarWidth);
    };

    loadPapers();
    loadCollections();

    setSize();
    window.addEventListener('resize', throttle(setSize, 500));

    return () => {
      window.removeEventListener('resize', throttle(setSize, 500));
    };
  }, [sideBarWidth]);

  const removePaper = (p: Paper) => {
    p.remove();
    setShowPaperInfo(false);
    setSelectedPaper(null);
    setAllPapers(allPapers.filter((paper) => paper.id !== p.id));
  };

  return (
    <Flex column styles={{ height: '100vh', width: '100vw' }}>
      <Flex.Item grow>
        <Flex>
          {(view === View.Regular || view === View.SideBarOnly) && (
            <Box
              style={{
                width: view === View.Regular ? `${sideBarWidth}px` : '100vw',
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
                  top={42}
                  onClose={() => setShowPaperInfo(false)}
                />
              ) : (
                <Flex column>
                  <PaperTabBar
                    paper={selectedPaper}
                    setPaper={setSelectedPaper}
                    height={42}
                  />
                  {selectedPaper ? (
                    <PdfViewer
                      paper={selectedPaper}
                      width={pdfWidth}
                      top={42}
                      addToLibrary={addToLibrary}
                    />
                  ) : (
                    <Home top={42} allPapers={allPapers} />
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
        <Route path="/" component={Main} />
      </Switch>
    </Router>
  );
}
