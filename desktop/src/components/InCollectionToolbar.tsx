import {
  AcceptIcon,
  ArrowSortIcon,
  ComponentEventHandler,
  Toolbar,
} from '@fluentui/react-northstar';
import React, { useState } from 'react';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import { remote } from 'electron';

const { Menu } = remote;

export enum SortType {
  ByTitle = 'title',
  ByYear = 'year',
  ByCitation = 'citation',
  ByDateAdded = 'dateAdded',
  ByDateModified = 'dateModified',
}

type InCollectionToolbarProps = {
  sort: SortType;
  onSort: (sort: SortType) => void;
  expanded: boolean;
  onExpand: (e: boolean) => void;
};

const InCollectionToolbar = ({
  sort,
  onSort,
  expanded,
  onExpand,
}: InCollectionToolbarProps) => {
  const [sortMenuOpen, setSortMenuOpen] = useState<boolean>(false);
  return (
    <Toolbar
      items={[
        // { key: 'sync', icon: <SyncIcon />, onClick: () => syncGoogleDrive() },
        {
          key: 'sort',
          icon: <ArrowSortIcon />,
          onClick: (e: React.SyntheticEvent) => {
            const menu = Menu.buildFromTemplate([
              {
                type: 'checkbox',
                label: 'By Added Date',
                checked: sort === SortType.ByDateAdded,
                // icon: sort === SortType.ByDateAdded ? <AcceptIcon /> : null,
                click: () => onSort(SortType.ByDateAdded),
              },
              {
                type: 'checkbox',
                label: 'By Modified Date',
                checked: sort === SortType.ByDateModified,
                // icon: sort === SortType.ByDateModified ? <AcceptIcon /> : null,
                click: () => onSort(SortType.ByDateModified),
              },
              {
                type: 'checkbox',
                label: 'By Published Year',
                checked: sort === SortType.ByYear,
                // icon: sort === SortType.ByYear ? <AcceptIcon /> : null,
                click: () => onSort(SortType.ByYear),
              },
              {
                type: 'checkbox',
                label: 'By Citation',
                checked: sort === SortType.ByCitation,
                // icon: sort === SortType.ByCitation ? <AcceptIcon /> : null,
                click: () => onSort(SortType.ByCitation),
              },
              {
                type: 'checkbox',
                label: 'By Title',
                checked: sort === SortType.ByTitle,
                // icon: sort === SortType.ByTitle ? <AcceptIcon /> : null,
                click: () => onSort(SortType.ByTitle),
              },
            ]);
            const rect = e.currentTarget.getBoundingClientRect();
            menu.popup({
              window: remote.getCurrentWindow(),
              y: 36,
              x: rect.left,
            });
          },
        },
        // {
        //  key: 'source',
        //  icon: <AppsIcon />,
        // },
        {
          key: 'expand',
          icon: expanded ? <FiMinimize2 /> : <FiMaximize2 />,
          onClick: () => onExpand(!expanded),
        },
      ]}
    />
  );
};

export default InCollectionToolbar;
