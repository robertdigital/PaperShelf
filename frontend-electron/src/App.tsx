import React, { useState, Component } from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import PdfViewer from './components/PdfViewer';
import PaperList from './components/PaperList';
import Header from './components/Header';
import icon from '../assets/icon.svg';
import { Grid, Flex, Segment, Layout, Box, Toolbar, AddIcon, CloseIcon, ArrowSortIcon, QuoteIcon, LinkIcon, CodeSnippetIcon, Input, SearchIcon, Divider } from '@fluentui/react-northstar'
import {
  DownloadIcon, OpenOutsideIcon
} from '@fluentui/react-icons-northstar'
import './App.global.css';
const fs = require('fs');
const yaml = require('js-yaml');
import _ from 'lodash';
import throttle from "lodash/throttle";
import { downloadPaper, getPaperLocation } from './utils/paper'
import { shell } from 'electron';

import { store } from './utils/store';
import AddPaper from './views/addPaper';

type MainProps = {}
type MainState = {
  pdfWidth: number;
  treeWidth: number;
  selectedPaperId?: string;
  papers: Paper[];
  selectedPaper: Paper;
}

class Main extends Component<MainProps, MainState> {
  constructor(props: MainProps) {
    super(props)

    this.state = {
      treeWidth: 300,
      pdfWidth: 0,
      papers: [],
      selectedPaperId: undefined,
      selectedPaper: null
    }
  }

  componentDidMount() {
    this.setSize();
    this.loadPapers();
    window.addEventListener("resize", throttle(this.setSize, 500))
  }

  componentWillUnmount () {
    window.removeEventListener("resize", throttle(this.setSize, 500))
  }

  setSize = () => {
    this.setState({ pdfWidth: window.innerWidth - this.state.treeWidth });
  }

  loadPapers = () => {
    try {
      let fileContents = fs.readFileSync(store.get('dataLocation') + '/papers.yml', 'utf8');
      let data = yaml.load(fileContents);
      this.setState({
        papers: Object.fromEntries(
          Object.entries(data.papers).map(([key, paper], i) => [
            key, {
              ...paper,
              id: key
            }]
          )
        )
      });
    } catch (e) {
        console.log(e);
    }
  }

  onSelectedPaperIndexChange = ({ id }: Paper) => {
    this.setState({
      selectedPaperId: id,
      selectedPaper: this.state.papers[id]
    })
  }

  render = () => {
    const { selectedPaper } = this.state;

    return (
      <Flex column styles={{height: '100vh'}}>
        <Toolbar
          aria-label="Default"
          items={[
            {
              icon: (<OpenOutsideIcon {...{ outline: true }} />),
              key: 'open',
              title: 'Open',
              onClick: () => shell.openPath(getPaperLocation(selectedPaper)),
            },
            {
              icon: (<DownloadIcon {...{ outline: true }} />),
              key: 'download',
              title: 'Download',
              onClick: () => downloadPaper(selectedPaper),
            },
          ]}
        />
        <Flex.Item grow>
          <Flex row>
            <Flex column>
              <Toolbar
                aria-label="Default"
                items={[
                  {
                    icon: (<DownloadIcon {...{ outline: true }} />),
                    key: 'refresh',
                    title: 'Refresh',
                    onClick: () => this.loadPapers(),
                  },
                  {
                    icon: (
                      <AddIcon
                        {...{
                          outline: true,
                        }}
                      />
                    ),
                    key: 'add',
                    title: 'Add Paper',
                    // onClick: () => this.openAddPaperModal(),
                  },
                  {
                    icon: (
                      <CloseIcon
                        {...{
                          outline: true,
                        }}
                      />
                    ),
                    key: 'bold',
                    kind: 'toggle',
                    title: 'Toggle bold',
                  },
                  {
                    key: 'divider-1',
                    kind: 'divider',
                  },
                  {
                    icon: (
                      <ArrowSortIcon
                        {...{
                          outline: true,
                        }}
                      />
                    ),
                    key: 'more',
                    title: 'More',
                    menu: [
                      {
                        key: 'title',
                        content: 'By Title',
                        icon: <QuoteIcon />,
                      },
                      {
                        key: 'author',
                        content: 'By Author',
                        icon: <LinkIcon />,
                        // disabled: true,
                      },
                      {
                        key: 'year',
                        content: 'By Year',
                        icon: <CodeSnippetIcon />,
                      },
                    ],
                    // menuOpen: state.more,
                  },
                ]}
              />
              <PaperList
                width={this.state.treeWidth}
                onSelectedIndexChange={this.onSelectedPaperIndexChange}
              />
            </Flex>
            <Box width={this.state.pdfWidth}>
              <PdfViewer paper={selectedPaper} width={this.state.pdfWidth} />
            </Box>
          </Flex>
        </Flex.Item>
        <div>Footer</div>
      </Flex>
    );
  }
};

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/addPaper" component={AddPaper} />
        <Route path="/" component={Main} />
      </Switch>
    </Router>
  );
}
