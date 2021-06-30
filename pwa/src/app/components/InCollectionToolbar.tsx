import {
  ArrowSortIcon,
  MenuItemProps,
  Toolbar,
} from "@fluentui/react-northstar";
import React, { useState } from "react";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { GrCheckbox, GrCheckboxSelected } from "react-icons/gr";
import { popupMenu } from "../utils";
import { environment, SortType } from "../utils/store";

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

  const getSortMenu = () => [
    {
      type: "checkbox",
      label: "By Added Date",
      checked: sort === SortType.ByDateAdded,
      // icon: sort === SortType.ByDateAdded ? <AcceptIcon /> : null,
      click: () => onSort(SortType.ByDateAdded),
    },
    {
      type: "checkbox",
      label: "By Modified Date",
      checked: sort === SortType.ByDateModified,
      // icon: sort === SortType.ByDateModified ? <AcceptIcon /> : null,
      click: () => onSort(SortType.ByDateModified),
    },
    {
      type: "checkbox",
      label: "By Published Year",
      checked: sort === SortType.ByYear,
      // icon: sort === SortType.ByYear ? <AcceptIcon /> : null,
      click: () => onSort(SortType.ByYear),
    },
    {
      type: "checkbox",
      label: "By Citation",
      checked: sort === SortType.ByCitation,
      // icon: sort === SortType.ByCitation ? <AcceptIcon /> : null,
      click: () => onSort(SortType.ByCitation),
    },
    {
      type: "checkbox",
      label: "By Title",
      checked: sort === SortType.ByTitle,
      // icon: sort === SortType.ByTitle ? <AcceptIcon /> : null,
      click: () => onSort(SortType.ByTitle),
    },
  ];

  const menuMapFn = (it: any, idx: number) => {
    if (it.type === "separator") {
      return {
        key: `divider-${idx}`,
        kind: "divider",
      };
    } else {
      return it.visible === false
        ? undefined
        : ({
            key: it.label,
            content: it.label,
            onClick: () => {
              if (it.click) it.click();
            },
            on: "hover",
            icon:
              it.icon || it.checked === undefined ? undefined : it.checked ? (
                <GrCheckboxSelected />
              ) : (
                <GrCheckbox />
              ),
          } as MenuItemProps);
    }
  };

  return (
    <Toolbar
      items={[
        // { key: 'sync', icon: <SyncIcon />, onClick: () => syncGoogleDrive() },
        {
          key: "sort",
          icon: <ArrowSortIcon />,
          menu: getSortMenu().map(menuMapFn),
          menuOpen: sortMenuOpen,
          onMenuOpenChange: (_, p: any) => {
            setSortMenuOpen(p.menuOpen);
          },
          onClick: (e: React.SyntheticEvent) => {
            if (environment.isElectron) {
              const rect = e.currentTarget.getBoundingClientRect();
              popupMenu(getSortMenu(), {
                y: 36,
                x: rect.left,
              });
            } else {
            }
          },
        },
        // {
        //  key: 'source',
        //  icon: <AppsIcon />,
        // },
        {
          key: "expand",
          icon: expanded ? <FiMinimize2 /> : <FiMaximize2 />,
          onClick: () => onExpand(!expanded),
        },
      ]}
    />
  );
};

export default InCollectionToolbar;
