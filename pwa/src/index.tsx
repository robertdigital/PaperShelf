import React from "react";
import ReactDOM from "react-dom";
import {
  Provider,
  teamsDarkTheme,
  teamsTheme,
  ThemePrepared,
} from "@fluentui/react-northstar";

import App from "./app/App";
import { settings } from "./app/utils/store";
import reportWebVitals from "./reportWebVitals";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import firebase from "firebase/app";

firebase.initializeApp({
  apiKey: "AIzaSyBwpP4KSpb7ADdfAKx3o1Mta-RO4NT6ho0",
  authDomain: "paper-shelf.firebaseapp.com",
  projectId: "paper-shelf",
  storageBucket: "paper-shelf.appspot.com",
  messagingSenderId: "466907878500",
  appId: "1:466907878500:web:2dba227d81a7b3e656fb71",
  measurementId: "G-7X2K30YBG3",
  databaseURL: "https://paper-shelf-default-rtdb.firebaseio.com/",
});

firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);

const themes: Record<string, ThemePrepared<any>> = {
  dark: teamsDarkTheme,
  light: teamsTheme,
};

const theme = themes[settings.theme] || teamsTheme;

ReactDOM.render(
  <Provider theme={theme}>
    <App />
  </Provider>,
  document.getElementById("root")
);

serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
