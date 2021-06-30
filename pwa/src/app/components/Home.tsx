import {
  Flex,
  Text,
  List,
  ListItemProps,
  SearchIcon,
  Divider,
  Grid,
  Card,
  CardHeader,
  Label,
  Box,
  Button,
  GalleryNewIcon,
} from "@fluentui/react-northstar";
import React, { useEffect, useState } from "react";
import { BiNews, BiRefresh } from "react-icons/bi";
import Collection from "../utils/collection";
import { showError } from "../utils/msgbox";
import Paper from "../utils/paper";
import { Arxiv } from "../utils/sources/arxiv";
import { HomeSection, settings } from "../utils/store";

require("format-unicorn");

type HomeProps = {
  allPapers: Paper[];
  allCollections: Collection[];
  top: number;
  setPaper: (p: Paper) => void;
};

type HomePaperListProps = {
  papers: Paper[];
  setPaper: (p: Paper) => void;
};

const HomePaperList = ({ papers, setPaper }: HomePaperListProps) => {
  return (
    <Grid
      style={{ width: "100%" }}
      columns={1}
      content={papers.slice(0, 5).map((p) => (
        <Card
          fluid
          onClick={() => {
            setPaper(p);
          }}
        >
          <CardHeader>
            <Flex gap="gap.small">
              <Flex column>
                <Text content={"{title}".formatUnicorn(p)} weight="bold" />
                <Text
                  content={"{authorFull} ({venueAndYear})".formatUnicorn(p)}
                  size="small"
                />
              </Flex>
            </Flex>
          </CardHeader>
          <Card.Body>
            <Box>
              {p.tags.map((t) => (
                <span key={t}>
                  <Label content={`#${t}`} />{" "}
                </span>
              ))}
            </Box>
          </Card.Body>
        </Card>
      ))}
    />
  );
};

const HomePaperList2 = ({ papers, setPaper }: HomePaperListProps) => {
  return (
    <List
      navigable
      truncateContent
      truncateHeader
      items={papers.map(
        (p) =>
          ({
            header: "{title}".formatUnicorn(p),
            content: "{authorFull} ({venueAndYear})".formatUnicorn(p),
            onClick: () => {
              setPaper(p);
            },
          } as ListItemProps)
      )}
    />
  );
};

type HomePaperSectionProps = {
  papers: Paper[];
  title: string;
  setPaper: (p: Paper) => void;
};

const HomePaperSection = ({
  papers,
  title,
  setPaper,
}: HomePaperSectionProps) => {
  return papers.length > 0 ? (
    <Flex column gap="gap.medium">
      <Text size="large" color="brand" content={title} />
      <HomePaperList papers={papers} setPaper={setPaper} />
    </Flex>
  ) : (
    <></>
  );
};

const Home = ({ allPapers, allCollections, top, setPaper }: HomeProps) => {
  const [sections, setSections] = useState<Record<string, HomeSection>>({});
  const [sectionPapers, setSectionPapers] = useState<Record<string, Paper[]>>(
    {}
  );
  const [lastRefreshed, setLastRefreshed] = useState<number>();

  useEffect(() => {
    setSections(settings.homeSections);
  }, []);

  useEffect(() => {
    const papers = Object.fromEntries(
      Object.entries(sections).map(([key, section]) => [
        key,
        execQuery(section.query, section.title),
      ])
    );
    console.log(papers);
    setSectionPapers(papers);
  }, [sections, lastRefreshed]);

  const utils = {
    fromRss(url: string) {
      return Arxiv.fetchRss(url);
    },
  };

  const execQuery: (query: string, sectionTitle: string) => Paper[] = (
    query,
    sectionTitle
  ) => {
    try {
      return eval(
        `(function (papers, collections, utils) {${query}})(allPapers, allCollections, utils)`
      );
    } catch (e) {
      showError(
        `Error while executing query for "${sectionTitle}": ${e.message}`
      );
      return [];
    }
  };

  const newsItems = [
    {
      header: <b>Upgraded to v0.1.4</b>,
      media: "07/01/2021",
      content: <div>
        Like this app? Star us on Github or Buy us a coffee!<br />
        <iframe src="https://ghbtns.com/github-btn.html?user=trungd&repo=PaperShelf&type=star&count=true" frameBorder="0" scrolling="0" width="150" height="20" title="GitHub"></iframe>
        </div>
    }
  ]

  return (
    <Flex
      fill
      column
      styles={{
        height: `calc(100vh - ${top}px)`,
        width: "100%",
        overflowY: "auto",
        paddingTop: "16px",
      }}
      gap="gap.medium"
    >
      <Flex gap="gap.medium" styles={{ paddingLeft: "16px" }}>
        <GalleryNewIcon size="larger" />
        <Text size="larger" content="News" />
      </Flex>
      <Divider />
      <Flex column padding="padding.medium" gap="gap.medium">
        <List items={newsItems} navigable />
      </Flex>
      <Flex gap="gap.medium" styles={{ paddingLeft: "16px" }}>
        <SearchIcon size="larger" />
        <Text size="larger" content="Explore" />
        <Button
          text
          icon={<BiRefresh />}
          iconOnly
          onClick={() => {
            setLastRefreshed(Date.now());
          }}
        />
      </Flex>
      <Divider />
      <Flex column padding="padding.medium" gap="gap.medium">
        {Object.entries(sections).map(([key, section]) => (
          <HomePaperSection
            key={key}
            title={section.title}
            papers={sectionPapers[key] || []}
            setPaper={setPaper}
          />
        ))}
      </Flex>
    </Flex>
  );
};

export default Home;
