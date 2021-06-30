import { Box, Divider, List, ListItemProps } from "@fluentui/react-northstar";
import React, { useEffect, useState } from "react";
import { AiFillHome } from "react-icons/ai";
import Paper from "../utils/paper";
import { settings } from "../utils/store";

require("format-unicorn");

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
      [paper, ...paperHistory.filter((p) => p.id !== paper.id)].slice(
        0,
        settings.useTab ? 10 : 1
      )
    );
  }, [paper]);

  const style = {
    height: height - 1,
    paddingTop: "5px",
    paddingBottom: "5px",
    minHeight: height - 1,
  };

  return (
    <Box style={{ overflow: "hidden", height }}>
      <List
        horizontal
        selectable
        selectedIndex={paper ? 1 : 0}
        truncateHeader
        truncateContent
        items={[
          {
            media: <AiFillHome />,
            style,
            onClick: () => {
              setPaper(null);
            },
          },
          ...paperHistory.map(
            (p, idx) =>
              ({
                navigable: true,
                header: settings.paperTab.headerFormat.formatUnicorn(p),
                content: settings.paperTab.contentFormat.formatUnicorn(p),
                onClick: () => {
                  setPaper(p);
                },
                style: {
                  ...style,
                  maxWidth: settings.useTab
                    ? idx === 0
                      ? "300px"
                      : "200px"
                    : "100%",
                },
              } as ListItemProps)
          ),
        ]}
      />
      <Divider fitted />
    </Box>
  );
};

export default PaperTabBar;
