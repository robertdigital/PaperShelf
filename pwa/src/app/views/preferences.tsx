import { Flex, Button, Box } from "@fluentui/react-northstar";
// import { remote, shell } from 'electron';
import "../App.global.css";
import { useHistory } from "react-router";
import Preferences from "../components/Preferences";
import { useRef } from "react";

export default function PreferencesView() {
  const history = useHistory();
  const ref = useRef();
  return (
    <Box
      styles={{
        width: "100%",
        height: "100%",
        maxWidth: "1024px",
        minWidth: "1000px",
        minHeight: "600px",
      }}
    >
      <Flex column>
        <Preferences ref={ref} />

        <Flex padding="padding.medium" gap="gap.medium" hAlign="end">
          <Button content="Close" onClick={() => history.goBack()} />
          <Button primary content="Save" />
        </Flex>
      </Flex>
    </Box>
  );
}
