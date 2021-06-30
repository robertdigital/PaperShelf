import { Box } from "@fluentui/react-northstar";
import React, { useEffect } from "react";
import { MenuId } from "../utils/broadcast";
import "firebase/auth";
import firebase from "firebase/app";
import { useHistory } from "react-router";
// var firebaseui = require("firebaseui");

const Login = () => {
  const history = useHistory();

  return <div id="firebaseui-auth-container"></div>;
};

export default Login;
