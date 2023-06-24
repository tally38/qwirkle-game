/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Box, Button, TextField, Typography } from '@mui/material';
import React from 'react';

type LoginFormProps = {
  playerName?: string;
  onEnter: (playerName: string) => void;
};

type LoginFormState = {
  playerName?: string;
  nameErrorMsg: string;
};

class LobbyLoginForm extends React.Component<LoginFormProps, LoginFormState> {
  static defaultProps = {
    playerName: '',
  };

  state = {
    playerName: this.props.playerName,
    nameErrorMsg: '',
  };

  render() {
    return (
      <Box>
        <Typography>Choose a player name: </Typography>
        <TextField
          size="small"
          type="text"
          value={this.state.playerName}
          onChange={this.onChangePlayerName}
          onKeyPress={this.onKeyPress}
        />
        <Button sx={{marginLeft: '8px'}} onClick={this.onClickEnter}>
          Enter
        </Button>
        <br />
        <Typography>
          {this.state.nameErrorMsg}
          <br />
        </Typography>
      </Box>
    )
  }

  onClickEnter = () => {
    if (this.state.playerName === '') {
      this.setState({
        ...this.state,
        nameErrorMsg: 'Player name cannot be empty.',
      })
    }
    this.props.onEnter(this.state.playerName!);
  };

  onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      this.onClickEnter();
    }
  };

  onChangePlayerName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value.trim();
    this.setState({
      playerName: name,
      nameErrorMsg: name.length > 0 ? '' : 'Player name cannot be empty.',
    });
  };
}

export default LobbyLoginForm;