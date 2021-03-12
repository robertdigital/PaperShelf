import React, {
  ElementRef,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';

import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';

import {
  Box,
  Flex,
  PopperRefHandle,
  Popup,
  Segment,
} from '@fluentui/react-northstar';
import { ipcRenderer, remote } from 'electron';

import PaperInfoPopup from './PaperInfoPopup';
import Paper from '../utils/paper';
import { Destination } from '../utils/analyze-pdf';

import { MenuId } from '../utils/broadcast';
import { store } from '../utils/store';

const { Menu } = remote;

type PdfViewerProps = {
  width: number;
  top: number;
  paper: Paper | null;
  addToLibrary: (paper: Paper) => void;
};

const stringToHighlight = 'deep';

// You might want to merge the items a little smarter than that

function highlightPattern(text: string) {
  const splitText = text.split(' ');

  if (splitText.length <= 1) {
    return text;
  }

  return text;
  // return splitText
  //   .map((t) => [
  //     <span className="word">{t}</span>,
  //     <span
  //       style={{
  //         // backgroundColor: 'rgba(100, 100, 100, 0.2)',
  //         height: '1em',
  //       }}
  //     >
  //       {' '}
  //     </span>,
  //   ])
  //   .flat()
  //   .slice(0, -1);
}

function PdfViewer({ width, top, paper = null, addToLibrary }: PdfViewerProps) {
  const padLeft = 8;
  const padRight = 0;
  const padTop = 8;

  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoomPercentage, setZoomPercentage] = useState<number>(100);

  const [viewWidth, setViewWidth] = useState(0);
  const [pageWidth, setPageWidth] = useState<number>();
  const [pageHeight, setPageHeight] = useState<string>();
  const [pageMarginLeft, setPageMarginLeft] = useState<number>(0);

  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [popupInfo, setPopupInfo] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
    href: string;
    dest?: Destination;
  }>();
  const container = useRef<ElementRef<'div'>>();
  const pageRef: Record<number, ElementRef<'div'> | null> = {};
  const canvasRef: Record<number, ElementRef<'canvas'> | null> = {};
  const [pageReady, setPageReady] = useState<Record<number, boolean>>({});
  const popperRef = useRef<PopperRefHandle>();
  const isDarkMode = store.get('theme') === 'dark';

  const zoom = (p: number) => {
    if (!paper) return;
    paper.zoomPercentage = p;
    paper.serialize();
    setZoomPercentage(p);
  };

  const zoomIn = () => {
    zoom(zoomPercentage + 10);
  };
  const zoomOut = () => {
    zoom(zoomPercentage - 10);
  };

  useEffect(() => {
    ipcRenderer.on(MenuId.VIEW_ZOOM_IN, zoomIn);
    ipcRenderer.on(MenuId.VIEW_ZOOM_OUT, zoomOut);
    return () => {
      ipcRenderer.removeListener(MenuId.VIEW_ZOOM_IN, zoomIn);
      ipcRenderer.removeListener(MenuId.VIEW_ZOOM_OUT, zoomOut);
    };
  }, []);

  const onDocumentLoadSuccess = ({ numPages: num }: { numPages: number }) => {
    setNumPages(num);
    zoom(paper?.zoomPercentage || 1);
    setPageReady({});
  };

  const onItemClick = ({ pageNumber }: { pageNumber: string }) => {
    // console.log(p);
  };

  const onRenderSuccess = async (pageIdx: number) => {
    if (!paper) return;
    zoom(paper?.zoomPercentage);
    const pageDom = pageRef[pageIdx]?.querySelector(
      'div.react-pdf__Page__textContent'
    ) as HTMLElement;

    if (pageDom) {
      setPageHeight(pageDom.style.height);
    }
    /*
    const text = Array.prototype.slice
      // eslint-disable-next-line react/no-find-dom-node
      .call(ReactDOM.findDOMNode(pageDom)?.childNodes)
      .map((n: Node) => ({
        text: n.textContent,
        fontSize: n.style['font-size'],
        top: n.style.top,
        left: n.style.left,
      }));
    */

    const canvas = canvasRef[pageIdx];
    if (canvas) {
      if (isDarkMode) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          let i: number;
          for (i = 0; i < imgData.data.length; i += 4) {
            imgData.data[i] = 255 - imgData.data[i];
            imgData.data[i + 1] = 255 - imgData.data[i + 1];
            imgData.data[i + 2] = 255 - imgData.data[i + 2];
            imgData.data[i + 3] = 255;
          }
          ctx.putImageData(imgData, 0, 0);
          setPageReady({ ...pageReady, [i]: true });
        }
      }
    }
    if (!paper.thumbnail) {
      const canvasFirst = canvasRef[0];
      if (canvasFirst) {
        const url = canvasFirst.toDataURL('image/jpg', 0.8);
        const base64Data = url.replace(/^data:image\/png;base64,/, '');
        const path = await ipcRenderer.invoke('save-thumbnail', {
          paper,
          data: base64Data,
        });
        paper.thumbnail = path;
        paper.serialize();
      }
    }
  };

  const onPageLoadSuccess = useCallback(async (page) => {
    const textContent = await page.getTextContent();
    setTextItems(textContent.items);
  }, []);

  const [textItems, setTextItems] = useState();

  const customTextRenderer = useCallback(
    (textItem) => {
      if (!textItems) return undefined;

      const matchInTextItem = textItem.str.match(stringToHighlight);

      return highlightPattern(textItem.str);
      if (matchInTextItem) {
        return highlightPattern(textItem.str);
      }
      return textItem.str;
    },
    [stringToHighlight, textItems]
  );

  useEffect(() => {
    if (!paper) return;
    setPageWidth(((viewWidth - padLeft - padRight) * zoomPercentage) / 100);
    setPageMarginLeft((1 - paper?.zoomPercentage / 100) / 2);
  }, [paper, zoomPercentage, viewWidth]);

  useEffect(() => {
    setViewWidth(width - 16);
  }, [width]);

  const adjustPopperPosition = (el: Element) => {
    const rect = el.getBoundingClientRect();
    const dest = el.getAttribute('href')?.slice(1);
    if (dest) {
      setPopupInfo({
        x: rect.x,
        y: rect.y,
        w: rect.width,
        h: rect.height,
        href: el.getAttribute('href') || undefined,
        dest: paper?.pdfInfo?.destinations[dest],
      });
    }
  };

  const onClick = () => {
    if (!showPopup) {
      let n = document.querySelector(':hover');
      let el: Element | undefined;
      while (n) {
        el = n;
        n = n.querySelector(':hover');
      }
      if (el?.nodeName === 'A') {
        setShowPopup(true);
        adjustPopperPosition(el);
      }
    }
  };

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (pageHeight) {
      const page = Math.floor(
        e.currentTarget.scrollTop /
          (parseInt(pageHeight.slice(0, -2), 10) + 2 * padTop)
      );
      setCurrentPage(page);
    }
    // TODO: allow scrolling
    // if (popupTarget) adjustPopperPosition(popupTarget);
    setShowPopup(false);
  };

  const onContextMenu = (e: React.UIEvent<HTMLDivElement>) => {
    e.preventDefault();
    const menu = Menu.buildFromTemplate([
      {
        role: 'copy',
      },
      {
        type: 'separator',
      },
      {
        label: 'Zoom In',
        click: zoomIn,
        enabled: !!paper,
      },
      {
        label: 'Zoom Out',
        click: zoomOut,
        enabled: !!paper,
      },
      {
        type: 'separator',
      },
      {
        label: 'Open in Default App',
        click() {
          paper?.openPdf();
        },
        enabled: !!paper,
      },
    ]);
    menu.popup({
      window: remote.getCurrentWindow(),
    });
  };

  return (
    <Flex column styles={{ width: '100%', height: `calc(100vh - ${top}px)` }}>
      <Box
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
          width: '100%',
          height: '100%',
          padding: `${padTop}px 0 0 ${padLeft}px`,
          backgroundColor: 'white',
        }}
        onScroll={onScroll}
        onClick={onClick}
        onKeyDown={onClick}
        onContextMenu={onContextMenu}
        ref={container}
      >
        {false && (
          <Segment
            style={{
              position: 'fixed',
              left: popupInfo?.x,
              top: popupInfo?.y,
              backgroundColor: isDarkMode ? 'black' : 'white',
              zIndex: 1000,
            }}
          >
            {popupInfo?.href}
          </Segment>
        )}
        <Popup
          open={showPopup}
          trigger={
            <div
              style={{
                position: 'fixed',
                left: popupInfo?.x,
                top: popupInfo?.y,
                width: popupInfo?.w,
                height: popupInfo?.h,
                zIndex: 1000,
                cursor: 'pointer',
                borderColor: 'red',
              }}
            />
          }
          content={{
            content: (
              <PaperInfoPopup
                paper={popupInfo?.dest?.paper || null}
                onLoaded={() => popperRef?.current?.updatePosition()}
                addToLibrary={addToLibrary}
              />
            ),
          }}
          onOpenChange={(_, p) => {
            setShowPopup(p?.value);
          }}
          align="center"
          pointing
          on="click"
          // mouseLeaveDelay={200}
          popperRef={popperRef}
        />
        {paper && (
          <Document
            file={paper.getLocalPath() || paper?.pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onItemClick={onItemClick}
            loading={<></>}
            noData={<></>}
          >
            <Flex column gap="gap.small">
              {Array.from(new Array(numPages), (_, i) => (
                <Box
                  key={i}
                  style={{
                    overflowX: 'hidden',
                    overflowY: 'hidden',
                    width: `calc(100% - ${padLeft + padRight})`,
                    height: pageHeight,
                    borderBottom: '1px solid gray',
                  }}
                >
                  <Box
                    style={{
                      position: 'relative',
                      left: (viewWidth - padLeft - padRight) * pageMarginLeft,
                      backgroundColor: isDarkMode ? 'black' : 'white',
                      width: pageWidth,
                    }}
                  >
                    <div
                      className="pdf-page"
                      ref={(el) => {
                        pageRef[i] = el;
                      }}
                    >
                      {currentPage - 1 <= i && i <= currentPage + 1 && (
                        <Page
                          width={pageWidth}
                          key={`page_${i + 1}`}
                          pageIndex={i}
                          onRenderSuccess={() => onRenderSuccess(i)}
                          customTextRenderer={customTextRenderer}
                          onLoadSuccess={onPageLoadSuccess}
                          noData={<Box style={{ height: pageHeight }} />}
                          loading={<Box style={{ height: pageHeight }} />}
                          canvasRef={(ref) => {
                            canvasRef[i] = ref;
                          }}
                        />
                      )}
                    </div>
                  </Box>
                </Box>
              ))}
            </Flex>
          </Document>
        )}
      </Box>
    </Flex>
  );
}

export default PdfViewer;
