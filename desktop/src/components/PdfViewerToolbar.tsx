import React, { useState, useEffect } from 'react';
import {
  BulletsIcon,
  InfoIcon,
  OpenOutsideIcon,
  ShareGenericIcon,
  Toolbar,
  ToolbarItemProps,
  ZoomInIcon,
  ZoomOutIcon,
} from '@fluentui/react-northstar';
import Paper from '../utils/paper';
import { store } from '../utils/store';

type PdfViewerToolbarProps = {
  zoomPercentage: number;
  zoom: (zoomPercentage: number) => void;
  paper: Paper | null;
  showInfo: () => void;
};

const PdfViewerToolbar = ({
  zoomPercentage,
  zoom,
  paper,
  showInfo,
}: PdfViewerToolbarProps) => {
  const [toolBarItems, setToolBarItems] = useState<string[]>([]);
  const [outlineMenuOpen, setOutlineMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    setToolBarItems(store.get('pdfViewerToolbar'));
  }, []);

  const allToolBarItems = {
    divider: {
      key: 'divider',
      kind: 'divider',
    },
    info: {
      icon: <InfoIcon />,
      key: 'info',
      title: 'Show Info',
      onClick: showInfo,
      disabled: !paper,
    },
    zoomIn: {
      icon: <ZoomInIcon />,
      key: 'zoom-in',
      title: 'Zoom In',
      onClick: () => {
        zoom(zoomPercentage + 10);
      },
      disabled: !paper,
    },
    zoomOut: {
      icon: <ZoomOutIcon />,
      key: 'zoom-out',
      title: 'Zoom Out',
      onClick: () => {
        zoom(zoomPercentage - 10);
      },
      disabled: !paper,
    },
    open: {
      icon: <OpenOutsideIcon />,
      key: 'open-default',
      title: 'Open in Default App',
      onClick: () => paper?.openPdf(),
      disabled: !paper,
    },
    share: {
      icon: <ShareGenericIcon />,
      key: 'share',
      title: 'Share',
      disabled: !paper,
    },
    outline: {
      icon: <BulletsIcon />,
      key: 'outline',
      disabled: !paper || !paper?.pdfInfo?.outline,
      menu: paper?.pdfInfo?.outline?.map(({ name }) => ({
        key: name,
        text: true,
        content: name,
      })),
      menuOpen: outlineMenuOpen,
      onMenuOpenChange: (_, { menuOpen }) => setOutlineMenuOpen(menuOpen),
    },
  } as Record<string, ToolbarItemProps>;

  return (
    <Toolbar
      aria-label="Default"
      items={toolBarItems.map((name) => allToolBarItems[name])}
    />
  );
};

export default PdfViewerToolbar;
