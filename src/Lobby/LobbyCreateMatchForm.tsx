/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Box, Button, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import { Game } from 'boardgame.io';
import { GameComponent } from 'boardgame.io/dist/types/src/lobby/connection';
import React, { useState } from 'react';

type CreateMatchProps = {
  games: GameComponent[];
  createMatch: (gameName: string, numPlayers: number) => Promise<void>;
};

const LobbyCreateMatchForm : React.FC<CreateMatchProps> = (props) => {
  const [numPlayers, setNumPlayers] = useState<number>(2)
  
  for (const game of props.games) {
    const matchDetails = game.game;
    if (!matchDetails.minPlayers) {
      matchDetails.minPlayers = 1;
    }
    if (!matchDetails.maxPlayers) {
      matchDetails.maxPlayers = 4;
    }
    console.assert(matchDetails.maxPlayers >= matchDetails.minPlayers);
  }
  const selectedGame = props.games[0] // assume only one game option (qwirkle)

  const _createNumPlayersOption = (idx: number) => {
    return (
      <MenuItem key={'num-option-' + idx} value={idx}>
        {idx}
      </MenuItem>
    );
  };

  const _createNumPlayersRange = (game: Game) => {
    return Array.from({ length: (game.maxPlayers || 2) + 1 })
      .map((_, i) => i)
      .slice(game.minPlayers);
  };

  const onChangeNumPlayers = (event: SelectChangeEvent<number>) => {
    setNumPlayers(Number.parseInt(event.target.value as string))
  };

  const onClickCreate = () => {
    props.createMatch(selectedGame.game.name!, numPlayers)
  };

  return (
    <Box>
      <Typography component='span' >Players: </Typography>
      <Select
        size='small'
        value={numPlayers}
        onChange={onChangeNumPlayers}
      >
        {_createNumPlayersRange(
          selectedGame.game
        ).map((number) => _createNumPlayersOption(number))}
      </Select>
      <Button sx={{marginLeft: '8px'}} onClick={onClickCreate}>Create</Button>
    </Box>
  );
}

export default LobbyCreateMatchForm;