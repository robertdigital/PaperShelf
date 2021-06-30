import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import {
  AddIcon,
  Box,
  ButtonGroup,
  ButtonProps,
  Divider,
  Flex,
  Image,
  Input,
  List,
  ListItemProps,
  Loader,
  MenuButton,
  MenuItemProps,
  PopperRefHandle,
  SearchIcon,
  Text,
} from "@fluentui/react-northstar";
import {
  AiFillCloud,
  AiFillDelete,
  AiFillInfoCircle,
  AiFillStar,
  AiOutlineStar,
} from "react-icons/ai";
import { GrCheckbox, GrCheckboxSelected } from "react-icons/gr";
import { BsStarFill, BsStar } from "react-icons/bs";
import Fuse from "fuse.js";
import Paper, { searchPaper } from "../utils/paper";
import { environment, settings, SortType } from "../utils/store";
import Collection from "../utils/collection";
import CollectionToolbar from "./CollectionToolbar";
import InCollectionToolbar from "./InCollectionToolbar";
import { MenuId } from "../utils/broadcast";

import { ipcRenderer, popupMenu } from "../utils";

type PaperListProps = {
  expanded: boolean;
  onChange: (paper?: Paper) => void;
  // eslint-disable-next-line react/require-default-props
  allPapers: Paper[];
  addToLibrary: (paper: Paper) => void;
  onExpand: (val: boolean) => void;
  allCollections: Collection[];
  setAllCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
  getContextMenu: (p: Paper) => any;
};

type PaperListItemProps = ListItemProps & {
  paper: Paper;
};

export type PaperListHandle = {
  refresh: (reload: boolean) => void;
};

const PaperList = forwardRef(
  (
    {
      expanded,
      onChange,
      allPapers,
      addToLibrary,
      onExpand,
      allCollections,
      setAllCollections,
      getContextMenu,
    }: PaperListProps,
    ref
  ) => {
    const [selectedIndex, setSelectedIndex] = useState<number>();
    const [collection, setCollection] = useState<Collection>();
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [papers, setPapers] = useState<Paper[]>([]);
    const [searchMode, setSearchMode] = useState<boolean>(true);
    const [sortType, setSortType] = useState<SortType>(SortType.ByDateAdded);
    const [listItems, setListItems] = useState<PaperListItemProps[]>([]);
    const [contextMenuItems, setContextMenuItems] = useState<MenuItemProps[]>(
      []
    );
    const [
      contextMenuSelectedPaper,
      setContextMenuSelectedPaper,
    ] = useState<Paper>();

    const popperRef = useRef<PopperRefHandle>(null);

    useEffect(() => {
      setSortType(settings.defaultSortBy);
    }, []);

    useEffect(() => {
      popperRef?.current?.updatePosition();
    }, [popperRef]);

    useImperativeHandle(ref, () => ({
      refresh(reload = false) {
        if (reload) {
          refreshList(searchQuery, searchMode);
        } else setPapers([...papers]);
      },
      select(id: string) {
        selectPaper(id);
      },
    }));

    useEffect(() => {
      refreshListItems();
    }, [
      papers,
      selectedIndex,
      collection,
      searchMode,
      sortType,
      expanded,
      contextMenuSelectedPaper,
    ]);

    const selectPaperByIndex = (idx?: number) => {
      const paper: Paper | undefined =
        idx !== undefined ? listItems[idx].paper : undefined;
      if (paper) {
        paper.loadCache();
        if (paper.inLibrary) {
          if (!paper.read) {
            paper.read = true;
            if (!paper.dateFetched) paper.fetch();
            else paper.serialize();
          }
        }
      }
      onChange(paper);
    };

    const sort = (paperList: Paper[]) => {
      if (searchMode) return paperList;
      switch (sortType) {
        case SortType.ByDateAdded:
          return paperList.sort((a: Paper, b: Paper) =>
            a.dateAdded && b.dateAdded ? -a.dateAdded + b.dateAdded : 1
          );
        case SortType.ByDateModified:
          return paperList.sort((a: Paper, b: Paper) =>
            a.dateModified && b.dateModified
              ? -a.dateModified + b.dateModified
              : 1
          );
        case SortType.ByYear:
          console.log(paperList.map(p => p.year))
          return paperList.sort((a: Paper, b: Paper) =>
            a.year && b.year ? -a.year.toString().localeCompare(b.year) : 1
          );
        case SortType.ByCitation:
          return paperList.sort((a: Paper, b: Paper) =>
            a.numCitations && b.numCitations
              ? -a.numCitations + b.numCitations
              : 1
          );
        case SortType.ByTitle:
          return paperList.sort((a: Paper, b: Paper) =>
            a.title && b.title ? a.title.localeCompare(b.title) : 1
          );
        default:
          return paperList;
      }
    };

    const refreshListItems = () => {
      const getInCollectionItems = () => {
        if (searchMode) return [];
        const inCollectionPapers = sort(
          papers.filter((p) => p.inCollection(collection))
        );

        return [
          ...(searchQuery
            ? [
                {
                  header: <Divider content="Press Enter to search online..." />,
                  styles: {
                    minHeight: 0,
                  },
                  selectable: false,
                } as PaperListItemProps,
              ]
            : []),
          ...(collection && searchQuery
            ? [
                {
                  header: (
                    <Divider
                      content={`In Collection (${inCollectionPapers.length})`}
                    />
                  ),
                  styles: {
                    minHeight: 0,
                  },
                  selectable: false,
                } as PaperListItemProps,
              ]
            : []),
          ...inCollectionPapers.map((p) => mapFn(p)),
        ];
      };

      const getOutCollectionItems = () => {
        if (!collection || searchMode || !searchQuery) return [];

        const outCollectionPapers = sort(
          papers.filter((p) => !p.inCollection(collection))
        );
        return [
          {
            header: (
              <Divider content={`In Library (${outCollectionPapers.length})`} />
            ),
            styles: {
              minHeight: 0,
            },
            selectable: false,
          } as PaperListItemProps,
          ...outCollectionPapers.map((p) => mapFn(p)),
        ];
      };

      const getWebSearchItems = () => {
        if (!searchMode) return [];
        const sources = settings.searchPaperSources;
        return sources
          .map((source) => {
            const webSearchPapers = sort(
              papers.filter((p) => !p.inLibrary && p.sources[source])
            );
            return [
              {
                header: (
                  <Divider content={`${source} (${webSearchPapers.length})`} />
                ),
                styles: {
                  minHeight: 0,
                },
                selectable: false,
              } as PaperListItemProps,
              ...webSearchPapers.map((p) => mapFn(p)),
              // {
              //   header: (
              //     <Flex>
              //       <Button
              //         size="small"
              //         text
              //         content={`More from ${source}...`}
              //         fluid
              //       />
              //     </Flex>
              //   ),
              //   styles: {
              //     minHeight: 0,
              //   },
              //   selectable: false,
              // },
            ];
          })
          .flat(1);
      };

      const items = [
        ...getInCollectionItems(),
        ...getOutCollectionItems(),
        ...getWebSearchItems(),
      ].map((it, idx) => ({
        ...it,
        selected: it.selected || idx === selectedIndex,
      }));
      setListItems(items);
    };

    const selectPaper = (id: string) => {
      listItems.some((it, idx) => {
        if (it.paper.id === id) {
          setSelectedIndex(idx);
          selectPaperByIndex(idx);
          return true;
        }
        return false;
      });
    };

    const getHeader = (p: Paper) => (
      <Flex>
        <Text>
          {p.getString(
            expanded
              ? settings.paperList.expandedHeaderFormat
              : settings.paperList.headerFormat
          )}
        </Text>
      </Flex>
    );

    const getContent = (p: Paper) => (
      <Flex column>
        <Text>
          {p.getString(
            expanded
              ? settings.paperList.expandedContentFormat
              : settings.paperList.contentFormat
          )}
        </Text>
        <Text>{p.getString(settings.paperList.content2Format)}</Text>
      </Flex>
    );

    const getEndMedia = (p: Paper) => {
      const btns = (settings.paperList.actionButtons as string[]) || [];
      const availBtns: Record<string, ButtonProps> = {};

      if (!p.inLibrary || !p.inCollection(collection)) {
        availBtns.add = {
          icon: p.starred ? <AddIcon /> : <AiOutlineStar />,
          iconOnly: true,
          text: true,
          onClick: () => {
            if (!p.inLibrary) {
              addToLibrary(p);
            }
            if (collection && !p.inCollection(collection)) {
              p.addToCollection(collection);
            }
          },
        };
      }

      if (p.inLibrary && !searchMode) {
        availBtns.star = {
          icon: p.starred ? <BsStarFill /> : <BsStar />,
          iconOnly: true,
          text: true,
          onClick: () => {
            p.toggleStar();
            setPapers([...papers]);
          },
        };

        availBtns.info = {
          icon: <AiFillInfoCircle />,
          iconOnly: true,
          text: true,
          onClick: () => ipcRenderer.send(MenuId.VIEW_SHOW_INFO),
        };
      }
      return (
        <ButtonGroup
          buttons={btns?.map((key) => availBtns[key]).filter((b) => b)}
        />
      );
    };

    const getHeaderMedia = (p: Paper) => {
      return (
        <Flex>
          {p.removed && <AiFillDelete />}
          {p.starred && <AiFillStar />}
          {environment.enableOfflineAccess && !p.localPath && <AiFillCloud />}
        </Flex>
      );
    };

    const getContentMedia = (p: Paper) => {
      return (
        <Flex>
          {p.inLibrary && !p.read && <Text content="New!" color="red" />}
        </Flex>
      );
    };

    const mapFn = (p: Paper) =>
      ({
        key: p.id,
        selected: p.id === contextMenuSelectedPaper?.id,
        paper: p,
        header: getHeader(p),
        headerMedia: getHeaderMedia(p),
        content: getContent(p),
        endMedia: getEndMedia(p),
        // important: p.starred,
        contentMedia: getContentMedia(p),
        media: expanded ? (
          <Image src={p.thumbnail} styles={{ height: "200px" }} />
        ) : (
          p.isFetching && <Loader size="smallest" />
        ),
        onContextMenu: (e: any) => {
          e.preventDefault();
          if (environment.isElectron) {
            popupMenu(getContextMenu(p));
          } else {
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
                      menu: it.submenu?.map(menuMapFn),
                      content: it.label,
                      onClick: () => {
                        if (it.click) it.click();
                        setContextMenuItems(getContextMenu(p).map(menuMapFn));
                      },
                      on: "hover",
                      icon:
                        it.icon ||
                        it.checked === undefined ? undefined : it.checked ? (
                          <GrCheckboxSelected />
                        ) : (
                          <GrCheckbox />
                        ),
                    } as MenuItemProps);
              }
            };
            setContextMenuItems(getContextMenu(p).map(menuMapFn));
            setContextMenuSelectedPaper(p);
          }
        },
        styles: {
          paddingTop: "8px",
          paddingBottom: "8px",
          // backgroundColor: p.inLibrary && !p.read ? 'gray' : 'white',
        },
      } as PaperListItemProps);

    /* const mapFn = {
      content: (<Flex gap="gap.smaller">
        {p.tags.map((tag) => (
        <Tag key={tag} tag={tag} />
        ))}
      </Flex>),
    } as ListItemProps),
  } */

    const refreshList = (currentQuery: string, search = false) => {
      // const papersInCollection = collection
      //   ? allPapers.filter((p) => collection.papers.includes(p.id!))
      //   : allPapers;
      if (currentQuery === "") {
        setPapers(allPapers);
        setSearchMode(false);
      } else if (currentQuery[0] === "#") {
        const hashTags = searchQuery
          .split(" ")
          .map((s) => (s.length > 0 ? s.substring(1) : ""))
          .filter((s) => s !== "");
        setPapers(
          allPapers.filter((it) =>
            hashTags.every((tag) => [...it.tags].join(" ").indexOf(tag) >= 0)
          )
        );
        setSearchMode(false);
      } else if (search) {
        const searchResults: Paper[] = [];
        const updateResults = (resPapers: Paper[]) => {
          searchResults.push(
            ...resPapers.filter(
              (p) => !searchResults.map((rp) => rp.id).includes(p.id)
            )
          );
          setPapers(searchResults);
        };
        setSearchMode(true);
        searchPaper(currentQuery, updateResults);
      } else {
        setSearchMode(false);
        const fuse = new Fuse(allPapers, {
          keys: settings.searchFields,
          threshold: settings.searchThreshold,
        });
        setPapers(fuse.search(currentQuery).map((e) => e.item));
      }
    };

    const onSearchQueryChange = (query: string) => {
      setSearchQuery(query);
      refreshList(query);
    };

    useEffect(() => refreshList(searchQuery), [collection, allPapers]);

    return (
      <Box styles={{ padding: 0, height: "100vh" }}>
        <Flex fill column styles={{ userSelect: "none" }}>
          <Flex>
            <Flex.Item grow>
              <CollectionToolbar
                onChangeCollection={(c) => setCollection(c)}
                allCollections={allCollections}
                setAllCollections={setAllCollections}
              />
            </Flex.Item>
            <Flex.Item>
              <InCollectionToolbar
                expanded={expanded}
                onExpand={onExpand}
                sort={sortType}
                onSort={setSortType}
              />
            </Flex.Item>
          </Flex>
          <Flex>
            <Flex.Item grow>
              <Input
                fluid
                icon={<SearchIcon />}
                value={searchQuery}
                placeholder="Input paper title or URL..."
                onChange={(_, props) => onSearchQueryChange(props!.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") refreshList(searchQuery, true);
                }}
                clearable
              />
            </Flex.Item>
          </Flex>

          <Box
            styles={{
              overflow: "auto",
              width: `100%`,
              position: "relative",
              height: `calc(100% - 64px)`,
            }}
          >
            <MenuButton
              contextMenu={true}
              // mountNode={listRef}
              // target={document.body}
              trigger={
                <List
                  selectable
                  truncateHeader
                  truncateContent={!expanded}
                  defaultSelectedIndex={-1}
                  items={listItems}
                  selectedIndex={selectedIndex}
                  onSelectedIndexChange={(_, p) => {
                    setSelectedIndex(p?.selectedIndex);
                    selectPaperByIndex(p?.selectedIndex);
                  }}
                />
              }
              menu={contextMenuItems}
              onOpenChange={(_, p) => {
                if (!p?.open) setContextMenuSelectedPaper(undefined);
              }}
              popperRef={popperRef}
            />
          </Box>
        </Flex>
      </Box>
    );
  }
);

export default PaperList;
