import {
  Box,
  Button,
  CloseIcon,
  Flex,
  List,
  ListItemProps,
  Text,
} from '@fluentui/react-northstar';
import React, { useEffect, useState } from 'react';
import Paper from '../utils/paper';
import { store } from '../utils/store';

require('format-unicorn');

type PaperTabBarType = {
  paper: Paper | null;
  setPaper: (p: Paper | null) => void;
  height: number;
};

const PaperTabBar = ({ height, paper, setPaper }: PaperTabBarType) => {
  const [paperHistory, setPaperHistory] = useState<Paper[]>([]);

  useEffect(() => {
    if (!paper) return;
    setPaperHistory(
      [paper, ...paperHistory.filter((p) => p.id !== paper.id)].slice(0, 10)
    );
  }, [paper]);

  return (
    <Box style={{ overflow: 'hidden', height }}>
      <List
        horizontal
        selectable
        selectedIndex={0}
        truncateHeader
        truncateContent
        items={[
          ...(!paper ? [{ header: 'Welcome' }] : []),
          ...paperHistory.map(
            (p, idx) =>
              ({
                header: (store.get(
                  'paperTab.headerFormat'
                ) as string).formatUnicorn(p),
                content: (store.get(
                  'paperTab.contentFormat'
                ) as string).formatUnicorn(p),
                onClick: () => {
                  setPaper(p);
                },
                styles: {
                  height,
                  paddingTop: '5px',
                  paddingBottom: '5px',
                  minHeight: height,
                  maxWidth: idx === 0 ? '300px' : '200px',
                },
              } as ListItemProps)
          ),
        ]}
      />
    </Box>
  );
};

export default PaperTabBar;
