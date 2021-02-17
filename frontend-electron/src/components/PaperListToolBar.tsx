import React, { useState } from 'react';
import { Toolbar } from '@fluentui/react-northstar'
import {
  AddIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  FontSizeIcon,
  RemoveFormatIcon,
  OutdentIcon,
  IndentIcon,
  MoreIcon,
  LinkIcon,
  CodeSnippetIcon,
  QuoteIcon,
  CloseIcon,
  ArrowSortIcon
} from '@fluentui/react-icons-northstar'

const stateReducer = (prevState, action) => ({ ...prevState, [action]: !prevState[action] })

export default () => {
  const [state, dispatch] = React.useReducer(stateReducer, {
    bold: false,
    italic: false,
    more: false,
    underline: false,
  })

  return (

  );
}
