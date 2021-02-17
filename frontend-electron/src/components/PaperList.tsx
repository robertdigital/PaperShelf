import React, { useState, Component, useCallback, useEffect, useRef } from 'react';
import { ButtonGroup, Divider, DownloadIcon, Flex, Input, Label, List, ListItemProps, SearchIcon, Text } from '@fluentui/react-northstar';
import {getAuthorShort, getLocalPapers, searchArxiv} from '../utils/paper';
import {Paper} from '../types';
import {store} from '../utils/store';
require('format-unicorn')
import _ from 'lodash';

enum Mode { Regular, HashTagSearch };

type PaperListProps = {
  width: number;
  onSelectedIndexChange: Any;
}

const Tag = ({ tag }) => (
  <Label content={<Text size="small" content={tag.split(':').slice(-1)[0]} />}
    color="brand" />)

export default ({ width, onSelectedIndexChange }: PaperListProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [mode, setMode] = useState(Mode.Regular);
  const [localPapers, setLocalPapers] = useState<Paper[]>([]);

  const [listLocalItems, setListLocalItems] = useState<ListItemProps[]>([]);
  const [listSearchItems, setListSearchItems] = useState<ListItemProps[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>('')

  const getHeader = ({ title }: Paper) => (
    store.get('paperList.titleFormat').formatUnicorn({
      title: title
    }));

  const getContent = ({ authors, year }: Paper) => (
    store.get('paperList.descFormat').formatUnicorn({
      authorShort: getAuthorShort(authors),
      year: year
    }));

  const getEndMedia = ({ downloaded }: Paper) => (
    <ButtonGroup buttons={[
      {
        icon: <DownloadIcon />,
        iconOnly: true,
        text: true,
        title: "Download",
        key: "download"
      }
    ]} />);

  const loadLocalPapers = () => {
    setLocalPapers(getLocalPapers());
  }

  const refreshList = () => {
    if (searchQuery == '') {
      setListLocalItems(localPapers.map(it => ({
        key: it.id,
        header: getHeader(it),
        content: getContent(it),
        endMedia: getEndMedia(it)
      })));
    } else if (searchQuery[0] == '#') {
      const hashTags = searchQuery.split(' ').map(s => s.length > 0 ? s.substring(1) : '').filter(s => s != '')
      console.log(hashTags);
      setListLocalItems(localPapers
        .filter(it => {
          // console.log(it.tags.join(' '), hashTags)
          return hashTags.every(tag => it.tags.join(' ').indexOf(tag) >= 0)
        })
        .map(it => ({
          key: it.id,
          header: getHeader(it),
          content: (<Flex row gap="gap.smaller">
            {it.tags.map((tag) => (<Tag key={tag} tag={tag} />))}
          </Flex>)
        })))
    } else {
      setListSearchItems([])
      searchArxiv(searchQuery).then((items) => setListSearchItems([...items.map(it => ({
        key: it.id,
        header: getHeader(it),
        content: getContent(it),
        headerMedia: 'arvix',
        endMedia: getEndMedia(it)
      }))]));
    }
  }

  useEffect(() => loadLocalPapers(), []);
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshList()
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, localPapers])

  return (
    <Flex fill column>
        <Input fluid
          icon={<SearchIcon />}
          value={searchQuery}
          placeholder="Input paper title or URL..."
          onChange={(e, props) => setSearchQuery(props.value)} />

      <div style={{ overflow: 'auto', height: 'calc(100vh - 120px)', width: width }}>
        <List selectable defaultSelectedIndex={0}
          items={[
            ...listLocalItems,
            <Divider />,
            ...listSearchItems
          ]}
          selectedIndex={selectedIndex}
          onSelectedIndexChange={(e, newProps) => {
            setSelectedIndex(newProps!.selectedIndex!)
            onSelectedIndexChange(localPapers[newProps!.selectedIndex!]) }
          }
          truncateHeader={true}
        />
      </div>
    </Flex>
  );
}
