import React, { Component } from 'react';
import _ from 'lodash';
import { Input, Form, Button, Flex, Divider, SearchIcon, Header, Box } from '@fluentui/react-northstar';
import { Paper } from '../types';


type AddPaperProps = {}
type AddPaperState = {
  paper: Paper;
}

const fields = [
  {
    label: 'Title',
    name: 'title',
    id: 'title',
    key: 'title',
    required: true,
    control: {
      as: Input,
      showSuccessIndicator: false,
      fluid: true
    },
  },
  {
    label: 'URL',
    name: 'url',
    id: 'url',
    key: 'url',
    required: true,
    control: {
      as: Input,
      showSuccessIndicator: false,
      fluid: true
    },
  },
  {
    label: 'Authors',
    name: 'authors',
    id: 'authors',
    key: 'authors',
    message: 'Separated by ;',
    required: true,
    control: {
      as: Input,
      showSuccessIndicator: false,
      fluid: true
    },
  },
  {
    label: 'I agree to the Terms and Conditions',
    control: {
      as: 'input',
    },
    type: 'checkbox',
    id: 'conditions-inline-shorthand',
    key: 'conditions',
  }
]


export default class AddPaper extends Component<AddPaperProps, AddPaperState> {
  constructor(props: AddPaperProps) {
    super(props)

    this.state = {
      paper: {}
    }
  }

  render = () => {
    return (
      <Flex fill column padding="padding.medium" styles={{height: "100vh"}}>
        <Header content="Add Paper" />

        <Divider />
        <Flex.Item grow>
          <Form fields={fields} />
        </Flex.Item>
        <Flex.Item>
          <Flex gap="gap.smaller">
            <Button content="Primary" primary />
            <Button content="Secondary" secondary />
          </Flex>
        </Flex.Item>
      </Flex>
    );
  }
};

