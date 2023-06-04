import React from 'react';
import { Qwirkle } from './Game';
import { QwirkleBoard } from './Board';
import { Lobby as BoardgameLobby } from 'boardgame.io/react';

const { protocol, hostname } = window.location;
var { port } = window.location;
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  port = '8000'
}
const server = `${protocol}//${hostname}:${port}`;
const importedGames = [{ game: Qwirkle, board: QwirkleBoard }];

const Lobby = () => {
  return (
    <BoardgameLobby gameServer={server} lobbyServer={server} gameComponents={importedGames} />
  )
};

export default Lobby