import React from 'react';
import ReactDOM from 'react-dom';
import {
  Provider,
  teamsDarkTheme,
  teamsTheme,
  ThemePrepared,
} from '@fluentui/react-northstar';

import App from './App';
import { store } from './utils/store';

const themes: Record<string, ThemePrepared<any>> = {
  dark: teamsDarkTheme,
  light: teamsTheme,
};

const theme = themes[store.get('theme')] || teamsTheme;

ReactDOM.render(
  <Provider theme={theme}>
    <App />
  </Provider>,
  document.getElementById('root')
);
