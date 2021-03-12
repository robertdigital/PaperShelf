import { Flex, Header, List, ListItemProps } from '@fluentui/react-northstar';
import React from 'react';
import Paper from '../utils/paper';

type HomeProps = {
  allPapers: Paper[];
  top: number;
};

type HomePaperListProps = {
  papers: Paper[];
};

const HomePaperList = ({ papers }: HomePaperListProps) => {
  return (
    <List
      navigable
      items={papers.map(
        (p) =>
          ({
            header: p.title,
          } as ListItemProps)
      )}
    />
  );
};

const Home = ({ allPapers, top }: HomeProps) => {
  return (
    <Flex
      fill
      column
      styles={{
        height: `calc(100vh - ${top}px)`,
        width: '100%',
        overflowY: 'auto',
      }}
      padding="padding.medium"
      gap="gap.medium"
    >
      <Header as="h2">Explore</Header>
      <Header as="h3">Newly Added</Header>
      <HomePaperList
        papers={allPapers
          .sort((a, b) => a.dateAdded?.getTime() - b.dateAdded?.getTime())
          .slice(0, 5)}
      />
    </Flex>
  );
};

export default Home;
