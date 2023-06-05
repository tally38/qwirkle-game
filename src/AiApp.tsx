import React from 'react';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { MyBot } from './MyBot';
import { Qwirkle } from './Game';
import { QwirkleBoard } from './Board';

const LocalApp = Client({
  game: Qwirkle,
  board: QwirkleBoard,
  debug: true,
  // Use Local transport for communication with bots.
  multiplayer: Local( { bots: {'1': MyBot }} ),
});

const AiApp = () => {
  return (
    <div>
      <LocalApp playerID="0" matchID="advanced-ai" />
    </div>
  );
};

export default AiApp;