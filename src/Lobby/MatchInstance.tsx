/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Box, Button, TableCell, TableRow } from '@mui/material';
import { LobbyAPI } from 'boardgame.io';
import React from 'react';

export type MatchOpts = {
  numPlayers: number;
  matchID: string;
  playerID?: string;
};

type Match = {
  gameName: string;
  matchID: string;
  players: LobbyAPI.Match['players'];
};

type MatchInstanceProps = {
  match: Match;
  playerName: string;
  onClickJoin: (gameName: string, matchID: string, playerID: string) => void;
  onClickLeave: (gameName: string, matchID: string) => void;
  onClickPlay: (gameName: string, matchOpts: MatchOpts) => void;
};

class LobbyMatchInstance extends React.Component<MatchInstanceProps> {
  _createSeat = (player: { name?: string }) => {
    return player.name || '[free]';
  };

  _createButtonJoin = (inst: Match, seatId: number) => (
    <Button
      key={'button-join-' + inst.matchID}
      onClick={() =>
        this.props.onClickJoin(inst.gameName, inst.matchID, '' + seatId)
      }
    >
      Join
    </Button>
  );

  _createButtonLeave = (inst: Match) => (
    <Button
      key={'button-leave-' + inst.matchID}
      onClick={() => this.props.onClickLeave(inst.gameName, inst.matchID)}
    >
      Leave
    </Button>
  );

  _createButtonPlay = (inst: Match, seatId: number) => (
    <Button
      key={'button-play-' + inst.matchID}
      onClick={() =>
        this.props.onClickPlay(inst.gameName, {
          matchID: inst.matchID,
          playerID: '' + seatId,
          numPlayers: inst.players.length,
        })
      }
    >
      Play
    </Button>
  );

  _createButtonSpectate = (inst: Match) => (
    <Button
      key={'button-spectate-' + inst.matchID}
      onClick={() =>
        this.props.onClickPlay(inst.gameName, {
          matchID: inst.matchID,
          numPlayers: inst.players.length,
        })
      }
    >
      Spectate
    </Button>
  );

  _createInstanceButtons = (inst: Match) => {
    const playerSeat = inst.players.find(
      (player) => player.name === this.props.playerName
    );
    const freeSeat = inst.players.find((player) => !player.name);
    if (playerSeat && freeSeat) {
      // already seated: waiting for match to start
      return this._createButtonLeave(inst);
    }
    if (freeSeat) {
      // at least 1 seat is available
      return this._createButtonJoin(inst, freeSeat.id);
    }
    // match is full
    if (playerSeat) {
      return (
        <Box sx={{display: 'flex', gap: '4px', flexWrap: 'wrap' }} >
          {[
            this._createButtonPlay(inst, playerSeat.id),
            this._createButtonLeave(inst),
          ]}
        </Box>
      );
    }
    // allow spectating
    return this._createButtonSpectate(inst);
  };

  render() {
    const match = this.props.match;
    let status = 'OPEN';
    if (!match.players.some((player) => !player.name)) {
      status = 'RUNNING';
    }
    return (
      <TableRow key={'line-' + match.matchID}>
        <TableCell key={'cell-status-' + match.matchID}>{status}</TableCell>
        <TableCell key={'cell-seats-' + match.matchID}>
          {match.players.map((player) => this._createSeat(player)).join(', ')}
        </TableCell>
        <TableCell key={'cell-buttons-' + match.matchID}>
          {this._createInstanceButtons(match)}
        </TableCell>
      </TableRow>
    );
  }
}

export default LobbyMatchInstance;