import React, {
  forwardRef,
  ReactElement,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import {
  Flex,
  Header,
  Button,
  FormInput,
  FormDropdown,
  Box,
  Divider,
  Text,
  RadioGroup,
  List,
  FormCheckbox,
  Form,
  TextArea,
  Toolbar,
  ToolbarItemProps,
  AddIcon,
  TrashCanIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ListItem,
  FormFieldCustom,
  FormField,
  ArrowDownIcon,
} from "@fluentui/react-northstar";
// import { remote, shell } from 'electron';
import {
  environment,
  saveSettings,
  settings,
  Settings,
  appData,
} from "../utils/store";
import { Sources } from "../utils/sources";
import "../App.global.css";
import { closeWindow } from "../utils";
import { syncAll } from "../utils/sync";
import { cloneDeep } from "lodash";
import { CollectionProps, icons } from "../utils/collection";
import Paper from "../utils/paper";

const Section = ({
  title,
  items,
  content,
  desc,
}: {
  title: string;
  items?: any[];
  content?: ReactElement;
  desc?: string;
}) => (
  <Box>
    <Header as="h3" content={title} />
    {items ? (
      <Flex column gap="gap.small">
        {desc && <Text temporary content={desc} size="small" />}
        {items}
      </Flex>
    ) : (
      content
    )}
  </Box>
);

Section.defaultProps = {
  items: undefined,
  content: undefined,
  desc: undefined,
};

type PreferencesProps = {};

export type PreferencesHandle = {
  save: () => void;
};

const Preferences = forwardRef(({}: PreferencesProps, ref) => {
  const [conf, setConf] = useState<Settings>(settings);
  const [collections, setCollections] = useState<CollectionProps[]>([]);
  const [reload, setReload] = useState<boolean>(false);

  useEffect(() => {
    setConf(cloneDeep(settings));
    setCollections(Object.values(cloneDeep(appData.collections)));
    console.log(appData.collections);
  }, []);

  const [sync, setSync] = useState<{
    method: string;
    googleDrive?: {
      code: string;
      clientId: string;
      clientSecret: string;
    };
  }>({
    method: "none",
  });
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [selectedHomeSection, setSelectedHomeSection] = useState<string>();
  const [selectedCollection, setSelectedCollection] = useState<number>(0);

  useEffect(() => {
    /* @ts-ignore */
    // fields.forEach(([key, _, setFn]) => setFn(settings[key]));
  }, []);

  useImperativeHandle(ref, () => ({
    save: async () => {
      //if (dataLocation !== settings.dataLocation) {
      //  changeDataStoreCwd(dataLocation);
      //}
      if (environment.useLocalStorage) {
        //fields.forEach(([key, val, _]) =>
        /* @ts-ignore */
        //  val ? (settings[key] = val) : store.delete(key)
        //);
        Object.assign(settings, conf);
        Object.assign(
          appData.collections,
          Object.fromEntries(collections.map((c) => [c.key, c]))
        );
        saveSettings();
      }
      await syncAll();
      if (reload) window.location.reload();
    },
  }));

  const sectionGeneral = {
    key: "general",
    title: "General",
    sections: [
      {
        key: "appearance",
        content: (
          <Section
            title="Appearance"
            items={[
              <FormDropdown
                label="Theme"
                key="dark"
                fluid
                value={conf.theme}
                items={["light", "dark"]}
                onChange={(_, p: any) => {
                  setReload(true);
                  setConf({ ...conf, theme: p?.value });
                }}
              />,
            ]}
          />
        ),
      },
      ...(environment.enableOfflineAccess
        ? [
            {
              key: "download",
              content: (
                <Section
                  title="Download"
                  items={[
                    <FormInput
                      key="paper-location"
                      label="Paper Location"
                      fluid
                      value={conf.paperLocation}
                      onChange={(_, p) => {
                        setConf({ ...conf, paperLocation: p?.value || "" });
                      }}
                    />,
                  ]}
                />
              ),
            },
          ]
        : []),
      {
        key: "sources",
        content: (
          <Section
            title="Sources"
            items={[
              <FormDropdown
                key="search"
                search
                multiple
                value={conf.searchPaperSources}
                onChange={(_, p: any) => {
                  setConf({ ...conf, searchPaperSources: p?.value });
                }}
                fluid
                items={Object.keys(Sources)}
                noResultsMessage="We couldn't find any matches."
                a11ySelectedItemsMessage="Press Delete or Backspace to remove"
                label="Search Sources"
              />,
              <FormDropdown
                key="fetch"
                search
                multiple
                value={conf.fetchPaperSources}
                onChange={(_, p: any) => {
                  setConf({ ...conf, fetchPaperSources: p?.value });
                }}
                fluid
                items={Object.keys(Sources)}
                noResultsMessage="We couldn't find any matches."
                a11ySelectedItemsMessage="Press Delete or Backspace to remove"
                label="Fetch Sources"
              />,
            ]}
          />
        ),
      },
      ...(environment.enableSync
        ? [
            {
              key: "sync",
              content: (
                <Section
                  title="Sync (Experimental)"
                  content={
                    <Box>
                      <RadioGroup
                        checkedValue={sync.method}
                        items={[
                          {
                            name: "sync",
                            key: "none",
                            label: "None",
                            value: "none",
                          },
                          {
                            name: "sync",
                            key: "own",
                            label: "Your Cloud Sync App",
                            value: "own",
                          },
                          {
                            name: "sync",
                            key: "googleDrive",
                            label: "Google Drive",
                            value: "googleDrive",
                            disabled: true,
                          },
                        ]}
                        onCheckedValueChange={(_, p: any) => {
                          setSync({ ...sync, method: p?.value });
                        }}
                        style={{ paddingBottom: "16px" }}
                      />
                      {/* sync.method === "googleDrive" && (
                    <Flex column gap="gap.small">
                      <Text
                        temporary
                        size="small"
                        content="You need to create your own OAuth client id and secret. Google Drive Sync is experimental and only works one-way."
                      />
                      <FormInput
                        label="Client ID"
                        fluid
                        value={sync.googleDrive.clientId}
                        showSuccessIndicator={false}
                        onChange={(_, p) => {
                          setSyncGoogleDriveClientId(p?.value);
                        }}
                      />
                      <FormInput
                        label="Client Secret"
                        fluid
                        value={sync.googleDrive.clientSecret}
                        showSuccessIndicator={false}
                        onChange={(_, p) => {
                          setSyncGoogleDriveClientSecret(p?.value);
                        }}
                      />
                      <FormInput
                        label="Code"
                        fluid
                        value={syncGoogleDriveCode}
                        showSuccessIndicator={false}
                        onChange={(_, p) => {
                          setSyncGoogleDriveCode(p?.value);
                        }}
                      />
                      <Button
                        content="Get code"
                        onClick={() => openExternal(getAuthUrl())}
                      />
                    </Flex>
                  ) */}
                      {sync.method === "own" && (
                        <Flex column gap="gap.small">
                          <Text
                            temporary
                            size="small"
                            content="Specify a location to store application's data. You need to set up your cloud service's app to sync this folder."
                          />
                          <FormInput
                            label="Sync Location"
                            fluid
                            value={conf.dataLocation}
                            showSuccessIndicator={false}
                            onChange={(_, p) => {
                              setConf({
                                ...conf,
                                dataLocation: p?.value || "",
                              });
                            }}
                          />
                        </Flex>
                      )}
                    </Box>
                  }
                />
              ),
            },
          ]
        : []),
    ],
  };

  const paperSample = new Paper({
    title: "Paper Example",
    authors: ["First Author", "Second Author", "Third Author"],
    year: 2021,
    venue: "Some Venue",
    numCitations: 100,
  });
  const sectionPapers = {
    key: "papers",
    title: "Papers",
    sections: [
      {
        key: "papers",
        content: (
          <Flex column gap="gap.medium">
            <Section
              title="Paper List"
              desc="Specify how items appear in the list. Supported fields: {title}, {authorShort}, {venue}, {year}, {venueAndYear}, {abstract}"
              items={[
                <FormField
                  key="preview"
                  label="Preview"
                  control={
                    <Flex hAlign="center">
                      <ListItem
                        index={0}
                        header={paperSample.getString(
                          conf.paperList.headerFormat
                        )}
                        content={
                          <Flex column>
                            <Text>
                              {paperSample.getString(
                                conf.paperList.contentFormat
                              )}
                            </Text>
                            <Text>
                              {paperSample.getString(
                                conf.paperList.content2Format
                              )}
                            </Text>
                          </Flex>
                        }
                        selectable
                        selected={true}
                        styles={{
                          paddingTop: "8px",
                          paddingBottom: "8px",
                          width: "300px",
                        }}
                      />
                    </Flex>
                  }
                />,
                <FormInput
                  key="header"
                  label="Header"
                  fluid
                  value={conf.paperList.headerFormat}
                  showSuccessIndicator={false}
                  onChange={(_, p) => {
                    setConf({
                      ...conf,
                      paperList: {
                        ...conf.paperList,
                        headerFormat: p?.value || "",
                      },
                    });
                  }}
                />,
                <FormInput
                  key="content"
                  label="Content"
                  fluid
                  value={conf.paperList.contentFormat}
                  showSuccessIndicator={false}
                  onChange={(_, p) => {
                    setConf({
                      ...conf,
                      paperList: {
                        ...conf.paperList,
                        contentFormat: p?.value || "",
                      },
                    });
                  }}
                />,
                <FormInput
                  key="content"
                  label="Content (Second Line)"
                  fluid
                  value={conf.paperList.content2Format}
                  showSuccessIndicator={false}
                  onChange={(_, p) => {
                    setConf({
                      ...conf,
                      paperList: {
                        ...conf.paperList,
                        content2Format: p?.value || "",
                      },
                    });
                  }}
                />,
                <FormInput
                  key="header-expanded"
                  label="Header (Expanded Mode)"
                  fluid
                  value={conf.paperList.expandedHeaderFormat}
                  showSuccessIndicator={false}
                  onChange={(_, p) => {
                    setConf({
                      ...conf,
                      paperList: {
                        ...conf.paperList,
                        expandedHeaderFormat: p?.value || "",
                      },
                    });
                  }}
                />,
                <FormInput
                  key="content-expanded"
                  label="Content (Expanded Mode)"
                  fluid
                  value={conf.paperList.expandedContentFormat}
                  showSuccessIndicator={false}
                  onChange={(_, p: any) => {
                    setConf({
                      ...conf,
                      paperList: {
                        ...conf.paperList,
                        expandedContentFormat: p?.value || "",
                      },
                    });
                  }}
                />,
                <FormDropdown
                  key="action-buttons"
                  fluid
                  multiple
                  value={conf.paperList.actionButtons}
                  onChange={(_, p: any) => {
                    setConf({
                      ...conf,
                      paperList: {
                        ...conf.paperList,
                        actionButtons: p?.value || [],
                      },
                    });
                  }}
                  items={["star", "info", "add"].sort()}
                  noResultsMessage="We couldn't find any matches."
                  a11ySelectedItemsMessage="Press Delete or Backspace to remove"
                  label="Action Buttons"
                />,
              ]}
            />
            <Section title="Pdf Viewer" />
          </Flex>
        ),
      },
    ],
  };

  const sectionCollections = {
    key: "collections",
    title: "Collections",
    sections: [
      {
        key: "collections",
        content: (
          <Section
            title="Collections"
            content={
              <Flex gap="gap.medium">
                <Flex.Item styles={{ minHeight: "200px", width: "200px" }}>
                  <Flex column>
                    <Toolbar
                      items={
                        [
                          {
                            icon: <AddIcon />,
                            onClick: () => {
                              setSelectedCollection(collections.length);
                              setCollections([
                                ...collections,
                                {
                                  key: "new-collection",
                                  name: "New Collection",
                                  papers: [],
                                  icon: "default",
                                  show: true,
                                },
                              ]);
                            },
                          },
                          {
                            icon: <TrashCanIcon />,
                            onClick: () => {
                              setCollections([
                                ...collections.filter(
                                  (c, index) => index !== selectedCollection
                                ),
                              ]);
                            },
                          },
                          {
                            kind: "divider",
                          },
                          {
                            icon: <ArrowUpIcon />,
                            disabled: selectedCollection === 0,
                            onClick: () => {
                              const tmp = collections[selectedCollection];
                              collections[selectedCollection] =
                                collections[selectedCollection - 1];
                              collections[selectedCollection - 1] = tmp;
                              setSelectedCollection(selectedCollection - 1);
                              setCollections([...collections]);
                            },
                          },
                          {
                            icon: <ArrowDownIcon />,
                            disabled:
                              selectedCollection === collections.length - 1,
                            onClick: () => {
                              const tmp = collections[selectedCollection];
                              collections[selectedCollection] =
                                collections[selectedCollection + 1];
                              collections[selectedCollection + 1] = tmp;
                              setSelectedCollection(selectedCollection + 1);
                              setCollections([...collections]);
                            },
                          },
                        ] as ToolbarItemProps[]
                      }
                    />
                    <List
                      truncateHeader
                      key="collections"
                      selectable
                      selectedIndex={selectedCollection}
                      onSelectedIndexChange={(_, p: any) => {
                        setSelectedCollection(p?.selectedIndex);
                      }}
                      items={collections.map((c) => ({
                        key: c.key,
                        collection: c,
                        header: `${c.name} (${c.papers?.length})`,
                        media: icons[c.icon],
                      }))}
                    />
                  </Flex>
                </Flex.Item>
                <Flex.Item grow>
                  <Form>
                    <FormInput
                      label="Title"
                      fluid
                      value={collections[selectedCollection]?.name}
                    />
                    <FormDropdown
                      label="Icon"
                      items={Object.keys(icons)}
                      value={collections[selectedCollection]?.icon || "default"}
                      onChange={(_, p) => {
                        if (collections[selectedCollection]) {
                          collections[selectedCollection].icon =
                            (p?.value as string) || "default";
                          setCollections([...collections]);
                        }
                      }}
                    />
                  </Form>
                </Flex.Item>
              </Flex>
            }
          />
        ),
      },
    ],
  };

  const sectionFeed = {
    key: "feed",
    title: "Feed",
    sections: [
      {
        key: "sections",
        content: (
          <Section
            title="Sections"
            content={
              <Flex>
                <Flex.Item styles={{ minHeight: "200px" }}>
                  <List
                    truncateHeader
                    key="sections"
                    selectable
                    onSelectedIndexChange={(_, p: any) => {
                      setSelectedHomeSection(
                        p?.items[p?.selectedIndex].section.key
                      );
                    }}
                    items={Object.entries(conf.homeSections).map(
                      ([key, val]) => ({
                        key,
                        section: val,
                        header: val.title,
                      })
                    )}
                  />
                </Flex.Item>
                <Divider fitted vertical />
                <Form>
                  <FormInput
                    label="Title"
                    fluid
                    value={
                      selectedHomeSection &&
                      conf.homeSections[selectedHomeSection]?.title
                    }
                  />
                  <FormCheckbox label="Show in feed" />
                  <Text
                    style={{ fontFamily: "monospace", marginBottom: "0px" }}
                    content={`(function(papers, collections, utils) {`}
                  />
                  <TextArea
                    style={{
                      fontFamily: "monospace",
                      minHeight: "200px",
                      marginBottom: "0px",
                    }}
                    fluid
                    value={
                      selectedHomeSection
                        ? conf.homeSections[selectedHomeSection]?.query
                        : ""
                    }
                    disabled={!selectedHomeSection}
                    onChange={(_, p) => {
                      if (selectedHomeSection) {
                        setConf({
                          ...conf,
                          homeSections: {
                            ...conf.homeSections!,
                            [selectedHomeSection]: {
                              ...conf.homeSections[selectedHomeSection],
                              query: p?.value || `return [];`,
                            },
                          },
                        });
                      }
                    }}
                  />
                  <Text
                    style={{ fontFamily: "monospace", marginTop: "0px" }}
                    content="})"
                  />
                </Form>
              </Flex>
            }
          />
        ),
      },
    ],
  };

  const items = [
    sectionGeneral,
    sectionPapers,
    sectionCollections,
    sectionFeed,
  ];

  return (
    <Box
      styles={{
        width: "100%",
        height: "100%",
        maxWidth: "1024px",
      }}
    >
      <Flex styles={{ width: "100%" }} gap="gap.medium">
        <Flex.Item styles={{ minWidth: "150px" }}>
          <List
            selectable
            selectedIndex={selectedIndex}
            onSelectedIndexChange={(_, p) =>
              setSelectedIndex(p?.selectedIndex || 0)
            }
            items={items.map((it) => ({ header: it.title }))}
          />
        </Flex.Item>
        <Flex.Item grow>
          <Flex column>
            <Flex
              column
              styles={{
                height: "600px",
                width: "100%",
                overflowY: "auto",
              }}
              padding="padding.medium"
              gap="gap.medium"
            >
              {items.map((it, tabidx) =>
                it.sections.map(
                  (sec, idx) =>
                    tabidx === selectedIndex && (
                      <Box key={`${it.key}-${sec.key}`}>{sec.content}</Box>
                    )
                )
              )}
            </Flex>
          </Flex>
        </Flex.Item>
      </Flex>
    </Box>
  );
});

export default Preferences;
