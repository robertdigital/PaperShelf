import {
  Button,
  Dialog,
  Flex,
  FlexItem,
  Tooltip,
  Text,
  Box,
} from "@fluentui/react-northstar";
import firebase from "firebase";
import React, { useEffect, useState } from "react";
import { MdSync, MdSyncDisabled } from "react-icons/md";
import "firebase/auth";
import { uid } from "../utils/sync";
import { MenuId } from "../utils/broadcast";
import { StyledFirebaseAuth } from "react-firebaseui";

const SyncStatusButton = ({ isLogin }: { isLogin: boolean }) => {
  const [dlgOpen, setDlgOpen] = useState<boolean>(false);

  const uiConfig = {
    signInFlow: "popup",
    signInOptions: [
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.GithubAuthProvider.PROVIDER_ID,
    ],
    // Other config options...
    callbacks: {
      signInSuccessWithAuthResult: function (
        authResult: any,
        redirectUrl: string
      ) {
        return false;
      },
    },
  };

  return (
    <Box>
      {isLogin ? (
        <Tooltip
          content="Sync On."
          trigger={
            <Button
              icon={<MdSync />}
              text
              iconOnly
              onClick={() => {
                setDlgOpen(true);
              }}
              styles={{ margin: "6px" }}
            />
          }
        />
      ) : (
        <Tooltip
          content="Sync Off"
          trigger={
            <Button
              icon={<MdSyncDisabled />}
              text
              iconOnly
              onClick={() => {
                setDlgOpen(true);
              }}
              styles={{ margin: "6px" }}
            />
          }
        />
      )}
      <Dialog
        header="Sync"
        styles={{ minWidth: "700px" }}
        content={
          <Flex gap="gap.medium">
            <Flex.Item size="size.half">
              <Box>
                <Text content="You need an account to enable sync. You can access your library in other browsers and devices." />
                <p>Note when sync is off:</p>
                <ul>
                  <li>
                    No user data is stored on the cloud. Existing data is
                    deleted.
                  </li>
                  <li>
                    Your data will be saved on localStorage persistent to your
                    browser. If you use a different browser or device, you will
                    not see it. Your data may be cleared upon user request or
                    browser update.
                  </li>
                </ul>
              </Box>
            </Flex.Item>
            <Flex.Item size="size.half">
              {isLogin ? (
                <Flex column gap="gap.medium" hAlign="center" vAlign="center">
                  <Text important content="Sync is On." />
                  <Button
                    primary
                    content="Turn Off"
                    onClick={() => {
                      firebase
                        .auth()
                        .signOut()
                        .then(() => {});
                    }}
                  />
                </Flex>
              ) : (
                <Box>
                  <StyledFirebaseAuth
                    uiConfig={uiConfig}
                    firebaseAuth={firebase.auth()}
                  />
                </Box>
              )}
            </Flex.Item>
          </Flex>
        }
        open={dlgOpen}
        onOpen={() => {}}
        onCancel={() => {
          setDlgOpen(false);
        }}
        onConfirm={() => {
          setDlgOpen(false);
        }}
      />
    </Box>
  );
};

export default SyncStatusButton;
