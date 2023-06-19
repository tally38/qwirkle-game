import React from 'react';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { createQwirkleBot } from './qwirkleBot';
import { Qwirkle } from './Game';
import { QwirkleBoard } from './Board';
import { Container } from '@mui/material';

const LocalApp = Client({
  game: Qwirkle,
  board: QwirkleBoard,
  debug: true,
  // Use Local transport for communication with bots.
  multiplayer: Local( { bots: {'1': createQwirkleBot }} ),
});

const AiApp = () => {
  return (
    <Container>
      <LocalApp playerID="0" matchID="advanced-ai" />
    </Container>
  );
};

export default AiApp;