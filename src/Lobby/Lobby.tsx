import React from 'react';
import { Qwirkle } from '../Game';
import { QwirkleBoard } from '../Board';
import { Lobby as BoardgameLobby, Client } from 'boardgame.io/react';

import { GameComponent } from 'boardgame.io/dist/types/src/lobby/connection';
import { LobbyAPI } from 'boardgame.io';
import LobbyLoginForm from './LobbyLoginForm';
import LobbyCreateMatchForm from './LobbyCreateMatchForm';
import LobbyMatchInstance, { MatchOpts } from './MatchInstance';
import { Box, Button, Container, Paper, Table, TableBody, TableContainer, Typography } from '@mui/material';

const { protocol, hostname } = window.location;
var { port } = window.location;
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  port = '8000'
}
const server = `${protocol}//${hostname}:${port}`;
const qwirkleComponent = { game: Qwirkle, board: QwirkleBoard }
const importedGames = [qwirkleComponent];

enum LobbyPhases {
  ENTER = 'enter',
  PLAY = 'play',
  LIST = 'list',
}

type RunningMatch = {
  app: ReturnType<typeof Client>;
  matchID: string;
  playerID: string;
  credentials?: string;
};

interface LobbyComponentProps {
    errorMsg: string;
    gameComponents: GameComponent[];
    matches: LobbyAPI.MatchList['matches'];
    phase: LobbyPhases;
    playerName: string;
    runningMatch?: RunningMatch;
    handleEnterLobby: (playerName: string) => void;
    handleExitLobby: () => Promise<void>;
    handleCreateMatch: (gameName: string, numPlayers: number) => Promise<void>;
    handleJoinMatch: (
      gameName: string,
      matchID: string,
      playerID: string
    ) => Promise<void>;
    handleLeaveMatch: (gameName: string, matchID: string) => Promise<void>;
    handleExitMatch: () => void;
    handleRefreshMatches: () => Promise<void>;
    handleStartMatch: (gameName: string, matchOpts: MatchOpts) => void
}

const LobbyComponent : React.FC<LobbyComponentProps> = (props) => {
  const { 
    errorMsg,
    gameComponents,
    matches,
    phase,
    playerName,
    runningMatch,
    handleEnterLobby,
    handleExitLobby,
    handleCreateMatch,
    handleJoinMatch,
    handleLeaveMatch,
    handleExitMatch,
    handleRefreshMatches,
    handleStartMatch,
  } = props

  const handleExitLobbyWithReset = () => {
    // Sometimes exiting the lobby fails because a player with the same name is already a part of a match, and this player
    // lacks the credentials to leave the match. In this case, we allow the player to exit the lobby and select a new name.
    handleExitLobby().catch(() => {
      handleEnterLobby('')
    })
  }

  const renderMatches = (
    matches: LobbyAPI.MatchList['matches'],
    playerName: string
  ) => {
    return matches.map((match) => {
      const { matchID, gameName, players } = match;
      return (
        <LobbyMatchInstance
          key={'instance-' + matchID}
          match={{ matchID, gameName, players: Object.values(players) }}
          playerName={playerName}
          onClickJoin={handleJoinMatch}
          onClickLeave={handleLeaveMatch}
          onClickPlay={handleStartMatch}
        />
      );
    });
  };

  return (
    <Container sx={{marginTop: "16px"}} id="lobby-view">
      {(phase === LobbyPhases.ENTER || playerName === '') && (
        <div>
          <LobbyLoginForm
            key={playerName}
            playerName={playerName}
            onEnter={handleEnterLobby}
          />
        </div>
      )}
      {(phase === LobbyPhases.LIST && playerName !== '') && (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: '32px'}} >
          <Typography variant='h4' >Welcome, {playerName}</Typography>
          <div id="match-creation">
            <Typography variant='h6' ><strong>Create a match</strong></Typography>
            <LobbyCreateMatchForm
              games={gameComponents}
              createMatch={handleCreateMatch}
            />
          </div>
          <div id="join-matches">
            <Typography variant='h6' ><strong>Join a match</strong></Typography>
            <Button sx={{margin: "4px 0px" }} onClick={handleRefreshMatches}>
              Refresh Matches
            </Button>
            <TableContainer sx={{margin: '8px 0px'}} component={Paper}>
              <Table size='small' >
                <TableBody>
                  {renderMatches(matches, playerName)}
                </TableBody>
              </Table>
            </TableContainer>
            <span>
              {errorMsg}
              <br />
            </span>
            <p>
              Matches that become empty are automatically deleted.
            </p>
          </div>
          <div id="lobby-exit">
            <Button onClick={handleExitLobbyWithReset}>Exit lobby</Button>
          </div>
        </Box>
      )}
      {phase === LobbyPhases.PLAY && 
        <div>
          {runningMatch && (
            <runningMatch.app
              matchID={runningMatch.matchID}
              playerID={runningMatch.playerID}
              credentials={runningMatch.credentials}
            />
          )}
          <div id="match-exit">
            <Button onClick={handleExitMatch}>Exit match</Button>
          </div>
        </div>
      }
    </Container>
  );
}

const Lobby = () => {
  return (
    <BoardgameLobby 
    renderer={({
      errorMsg,
      gameComponents,
      matches,
      phase,
      playerName,
      runningMatch,
      handleEnterLobby,
      handleExitLobby,
      handleCreateMatch,
      handleJoinMatch,
      handleLeaveMatch,
      handleExitMatch,
      handleRefreshMatches,
      handleStartMatch,
    }) => (
      <LobbyComponent
        errorMsg={errorMsg}
        gameComponents={gameComponents}
        matches={matches}
        phase={phase}
        playerName={playerName}
        runningMatch={runningMatch}
        handleEnterLobby={handleEnterLobby}
        handleExitLobby={handleExitLobby}
        handleCreateMatch={handleCreateMatch}
        handleJoinMatch={handleJoinMatch}
        handleLeaveMatch={handleLeaveMatch}
        handleExitMatch={handleExitMatch}
        handleRefreshMatches={handleRefreshMatches}
        handleStartMatch={handleStartMatch}
      />
    )} 
      gameServer={server}
      lobbyServer={server}
      gameComponents={importedGames}
    />
  )
};

export default Lobby