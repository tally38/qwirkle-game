import React, { useState, useEffect, useRef } from 'react';
import { BoardProps } from 'boardgame.io/react';
import { FilteredMetadata } from 'boardgame.io';
import { QwirkleState, Tile, Position, TileColor, TileShape, TurnRecord } from './Game';
import { Star, FilterVintage, ChangeHistory, Stop, Lens, Favorite } from '@material-ui/icons';
import { Avatar, Box, Button, Card, CardContent, CardHeader, Container, Divider, Paper, Typography } from '@mui/material';
import { getCellSize, playNotificationSound, useSettings } from './SettingsContext';

interface QwirkleProps extends BoardProps<QwirkleState> {}

interface QwirkleTileProps {
  color: TileColor,
  shape: TileShape,
  size?: number,
}

const PLAYER_COLORS : {[key: string]: string} = {
  '0': 'green',
  '1': 'blue',
  '2': 'red',
  '3': 'orange',
}

const QwirkleTile = ( props: QwirkleTileProps) => {
  const {color, shape, size = 40} = props

  const shapes = {
    'circle': <Lens style={{fontSize: `${size}px`}}/>,
    'heart': <Favorite style={{fontSize: `${size}px`}}/>,
    'star': <Star style={{fontSize: `${size}px`}}/>,
    'square': <Stop style={{fontSize: `${size}px`}}/>,
    'diamond': <ChangeHistory style={{fontSize: `${size}px`}}/>,
    'flower': <FilterVintage style={{fontSize: `${size}px`}}/>,
  }

  const tileStyles = {
    display: 'inline-block',
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: 'black',
    color: color,
    borderRadius: '5px',
    textAlign: 'center' as 'center',
    fontSize: `${size}px`,
    fontWeight: 'bold',
    verticalAlign: 'middle',
    lineHeight: `${size}px`
  };

  return <Box sx={tileStyles}>{shapes[shape]}</Box>;
};



function findPlayerName(matchData: FilteredMetadata | undefined, playerID: string) : string {
  var playerName = "Player " + playerID;
  if (matchData) {
    matchData.forEach((p) => {
      if (p['id'] === parseInt(playerID)) {
        playerName = p['name'] || playerName
      }
    })
  }
  return playerName
}

const PlayerCard = ({playerName, score, isCurrentPlayer, isClientPlayer, isWinner, color, remainingTiles} : {playerName: string, score: number, isCurrentPlayer: Boolean, isClientPlayer: Boolean, isWinner: Boolean, color: string, remainingTiles?: number}) => {
  // TODO: show number of remaining tiles for each player
  // TODO: show player color (that corresponds with colors on board when placing tiles)
  const border = isWinner ? '1px solid green' : isCurrentPlayer ? '1px solid blue' : 'none';
  return (
    <Card sx={{
      border,
    }}>
      <CardContent sx={{ minWidth: 128, padding: '4px', ":last-child": {paddingBottom: '4px'}}}>
        <CardHeader
          avatar={<>
            <Avatar sx={{ bgcolor: color, width: 24, height: 24 }} variant='rounded' />
            {remainingTiles !== undefined && <Avatar sx={{ bgcolor: 'black', marginLeft: '4px', width: 24, height: 24 }} variant='rounded'>{remainingTiles}</Avatar>}
          </>}
          title={playerName}
          subheader={<><strong>Score: </strong>{score}</>}
          sx={{padding: "4px"}}
        />
        <Box sx={{
          minHeight: 32,
          padding: '4px',
        }}>
          {isCurrentPlayer && !isWinner && (
            <Typography color='blue' variant='overline' >
              {isClientPlayer ? "It's your turn" : "Now Playing"}
            </Typography>
          )}
          {isWinner && (
            <Typography color='green' variant='overline' >
              Winner!
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

interface PlayersDisplayProps {
  scores: {
    [key: string]: number
  },
  matchData?: FilteredMetadata,
  currentPlayer: string,
  clientPlayerID: string | null,
  gameover?: {
    winners: string[]
  },
  remainingTiles?: {
    [key: string]: number
  },
}

const PlayersDisplay = (props: PlayersDisplayProps) => {
  const {scores, matchData, currentPlayer, clientPlayerID, gameover, remainingTiles } = props
  const winners : string[] = !!gameover ? gameover.winners : [];
  const playerCards = []
  for (let playerID in scores) {
		playerCards.push(
      <PlayerCard
        key={playerID}
        playerName={findPlayerName(matchData, playerID)}
        score={props.scores[playerID]}
        isCurrentPlayer={!gameover && playerID === currentPlayer}
        isClientPlayer={playerID === clientPlayerID}
        isWinner={winners.includes(playerID)}
        color={PLAYER_COLORS[playerID]}
        remainingTiles={remainingTiles ? remainingTiles[playerID] : undefined }
      />
    )
	}

  return (
    <Container disableGutters >
      <Typography variant='h6' color="text.secondary">
        Players
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignContent: 'stretch',
          p: 1,
          m: 1,
          bgcolor: 'background.paper',
          maxWidth: 'md',
          //height: 100,
          borderRadius: 1,
          margin: 0,
          padding: "8px 0",
        }}
      >
      {playerCards}
      </Box>
    </Container>
  )
}

interface TileSetProps {
  tiles: (Tile | null)[]
  callback?: (clickedTileIndex: number) => VoidFunction
  isActive: boolean
  index?: number | null // index within tileset ; used for rendering
  name: string
  alignRight?: boolean
  highlightColor?: string
  tileSize?: number
  cellSize?: number
}

const TileSet = (props: TileSetProps) => {
  const { tiles, callback, isActive, index, name, alignRight = false, highlightColor = 'blue', tileSize = 40, cellSize = 50 } = props
  var displayTiles = []
  var tile
  for (let i = 0 ; i < tiles.length ; i ++ ) {
    tile = tiles[i]
    if (tile) {
      displayTiles.push(
        <Box key={i} onClick={(isActive && !!callback) ? callback(i) : () => null} sx={
          {
            width: `${cellSize}px`,
            height: `${cellSize}px`,
            lineHeight: `${tileSize}px`,
            textAlign: 'center' as 'center',
            borderRadius: '5px',
            padding: `${(cellSize - tileSize) / 2}px`,
            backgroundColor: index === i ? highlightColor : 'white',
          }
        }>
          <QwirkleTile color={tile.color} shape={tile.shape} size={tileSize} />
        </Box>
      )
    }
  }
  return (
    <Box sx={{ alignContent: alignRight ? 'right' : 'left' }} >
      <Typography variant='h6' align={alignRight ? 'right' : 'left'} >
        {name}
      </Typography>
      <Container  disableGutters sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1px',
        justifyContent: alignRight ? 'flex-end' : 'flex-start',
        bgcolor: 'background.paper',
        minHeight: `${cellSize}px`,
      }}>
        {displayTiles}
      </Container>
    </Box>
  );
};



interface BoardCellsProps {
  G: QwirkleState;
  currentPlayer: string;
  onClickCell: (boardPosition: Position) => void;
  isActive: boolean;
  tileSize?: number;
  cellSize?: number;
}

const BoardCells = ({G, currentPlayer, onClickCell, isActive, tileSize = 40, cellSize = 50} : BoardCellsProps) => {
  const padding = (cellSize - tileSize) / 2;
  const cellStyle = {
    border: '1px solid #555',
    width: `${cellSize}px`,
    height: `${cellSize}px`,
    lineHeight: `${cellSize / 2}px`,
    textAlign: 'center' as 'center',
    minWidth: `${cellSize}px`,
    borderRadius: '0px',
    padding: `${padding}px`,
    margin: '1px',
  };

  const positionColors: { [key: number]: {[key: number]: string}} = {}
  for (let playerID in G.previousMoves) {
    if (currentPlayer !== playerID ) {
      G.previousMoves[playerID].forEach(p => {
        if (!positionColors[p.i]) {
          positionColors[p.i] = {}
        }
        positionColors[p.i][p.j] = PLAYER_COLORS[playerID]
      })
    }
    G.turnPositions.forEach(p => {
      if (!positionColors[p.i]) {
        positionColors[p.i] = {}
      }
      positionColors[p.i][p.j] = PLAYER_COLORS[currentPlayer]
    })
  }

  let rows = [];
  var cellTile
  let cellColor : string
  for (let i = 0; i < G.cells.length ; i++) {
    let rowCells = [];
    for (let j = 0; j < G.cells[0].length ; j++) {
      const id = i + '-' + j;
      cellTile = G.cells[i][j]!
      if (!!cellTile) {
        cellColor = !!positionColors[i] && positionColors[i][j]
        rowCells.push(<Box key={id} sx={{...cellStyle, background: cellColor}}><QwirkleTile color={cellTile.color} shape={cellTile.shape} size={tileSize} /></Box>)
      } else {
        rowCells.push(<Button variant='text' key={id} disabled={!isActive} sx={cellStyle} onClick={() => onClickCell({i, j})} />)
      }
    }
    rows.push((
      <Box
        key={i}
        sx={{
          display: 'flex',
          flexWrap: 'nowrap',
          gap: '0px',
          alignContent: 'left',
          bgcolor: 'background.paper',
          maxWidth: 'md',
        }}
      >
        {rowCells}
      </Box>
    ));
  }
  return (
    <Box>
      <Typography variant='h6'>
        Board
      </Typography>
      <Paper elevation={4} sx={{
        maxHeight: '60vh',
        overflow: 'auto',
        padding: "4px",
        marginBotton: '8px',
        display: 'inline-block',
        maxWidth: '100%'
      }}>
        {rows}
      </Paper>
    </Box>
  )
}


function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

const TurnTimer = ({ turnStartTime, isGameOver }: { turnStartTime: number; isGameOver: boolean }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setElapsed(Date.now() - turnStartTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [turnStartTime, isGameOver]);

  if (isGameOver) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <Typography variant="body2" color="text.secondary">
        Turn time: <strong>{formatDuration(elapsed)}</strong>
      </Typography>
    </Box>
  );
};

interface GameStatsProps {
  turnHistory: TurnRecord[];
  matchData?: FilteredMetadata;
  scores: { [key: string]: number };
}

const GameStats = ({ turnHistory, matchData, scores }: GameStatsProps) => {
  if (!turnHistory.length) return null;

  const playerIDs = [...new Set(turnHistory.map(t => t.playerID))];

  const playerStats = playerIDs.map(pid => {
    const turns = turnHistory.filter(t => t.playerID === pid);
    const totalTime = turns.reduce((sum, t) => sum + t.duration, 0);
    const avgTime = totalTime / turns.length;
    const longestTurn = turns.reduce((max, t) => t.duration > max.duration ? t : max, turns[0]);
    const shortestTurn = turns.reduce((min, t) => t.duration < min.duration ? t : min, turns[0]);
    const bestTurn = turns.reduce((max, t) => t.scoreEarned > max.scoreEarned ? t : max, turns[0]);
    const totalTilesPlaced = turns.reduce((sum, t) => sum + t.tilesPlaced, 0);

    return {
      playerID: pid,
      playerName: findPlayerName(matchData, pid),
      totalTurns: turns.length,
      totalTime,
      avgTime,
      longestTurn,
      shortestTurn,
      bestTurn,
      totalTilesPlaced,
      score: scores[pid],
    };
  });

  const overallLongest = turnHistory.reduce((max, t) => t.duration > max.duration ? t : max, turnHistory[0]);
  const overallShortest = turnHistory.reduce((min, t) => t.duration < min.duration ? t : min, turnHistory[0]);
  const overallBestTurn = turnHistory.reduce((max, t) => t.scoreEarned > max.scoreEarned ? t : max, turnHistory[0]);

  return (
    <Paper elevation={3} sx={{ padding: '16px', marginTop: '16px', maxWidth: '600px' }}>
      <Typography variant="h6" gutterBottom>
        Game Stats
      </Typography>

      <Box sx={{ marginBottom: '12px' }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Highlights
        </Typography>
        <Typography variant="body2">
          Longest turn: <strong>{formatDuration(overallLongest.duration)}</strong> by {findPlayerName(matchData, overallLongest.playerID)} (turn {overallLongest.turnNumber})
        </Typography>
        <Typography variant="body2">
          Shortest turn: <strong>{formatDuration(overallShortest.duration)}</strong> by {findPlayerName(matchData, overallShortest.playerID)} (turn {overallShortest.turnNumber})
        </Typography>
        <Typography variant="body2">
          Best turn: <strong>{overallBestTurn.scoreEarned} pts</strong> by {findPlayerName(matchData, overallBestTurn.playerID)} ({overallBestTurn.tilesPlaced} tiles, turn {overallBestTurn.turnNumber})
        </Typography>
      </Box>

      <Divider sx={{ marginBottom: '12px' }} />

      {playerStats.map(ps => (
        <Box key={ps.playerID} sx={{ marginBottom: '12px' }}>
          <Typography variant="subtitle2" sx={{ color: PLAYER_COLORS[ps.playerID] }}>
            {ps.playerName} — {ps.score} pts
          </Typography>
          <Box sx={{ paddingLeft: '8px' }}>
            <Typography variant="body2">Turns: {ps.totalTurns}</Typography>
            <Typography variant="body2">Total time: {formatDuration(ps.totalTime)}</Typography>
            <Typography variant="body2">Avg turn time: {formatDuration(ps.avgTime)}</Typography>
            <Typography variant="body2">Longest turn: {formatDuration(ps.longestTurn.duration)}</Typography>
            <Typography variant="body2">Shortest turn: {formatDuration(ps.shortestTurn.duration)}</Typography>
            <Typography variant="body2">Best turn: {ps.bestTurn.scoreEarned} pts ({ps.bestTurn.tilesPlaced} tiles)</Typography>
            <Typography variant="body2">Total tiles placed: {ps.totalTilesPlaced}</Typography>
          </Box>
        </Box>
      ))}
    </Paper>
  );
};

export function QwirkleBoard({ ctx, G, moves, undo, playerID, matchData, isActive } : QwirkleProps) {
  const [position, setPosition] = useState<Position | null>(null);
  const [handIndex, setHandIndex] = useState<number | null>(null);
  const wasActive = useRef(isActive);
  const { settings } = useSettings();

  // Play notification sound when it becomes the player's turn
  useEffect(() => {
    if (isActive && !wasActive.current) {
      playNotificationSound(settings.notificationSound, settings.volume);
    }
    wasActive.current = isActive;
  }, [isActive, settings.notificationSound, settings.volume]);

  useEffect(() => {
    if (position && handIndex !== null) {
      moves.placeTile(position, handIndex)
      setPosition(null)
      setHandIndex(null)
    }
  }, [position, handIndex, setPosition, setHandIndex, moves]);
  
  function onClickSwap() {
    if (handIndex !== null) {
      moves.selectTileToSwap(handIndex)
      setHandIndex(null)
    }
  }

  function onClickCell(boardPosition : Position) {
    setPosition(boardPosition)
  }

  function onClickTileCallback(clickedTileIndex: number) {
    function onClickTile() {
      setHandIndex(clickedTileIndex)
    }
    return onClickTile
  }

  return (
    <Container disableGutters sx={{minWidth: "300px", margin: "16px 0px" }} >
      <PlayersDisplay
        scores={G.scores}
        matchData={matchData}
        currentPlayer={ctx.currentPlayer}
        clientPlayerID={playerID}
        gameover={ctx.gameover}
        remainingTiles={G.bagIndex < 0 ? G.remainingTiles: undefined}
      />
      <TurnTimer turnStartTime={G.turnStartTime} isGameOver={!!ctx.gameover} />
      {ctx.gameover && (
        <GameStats turnHistory={G.turnHistory} matchData={matchData} scores={G.scores} />
      )}
      <BoardCells G={G} currentPlayer={ctx.currentPlayer} onClickCell={onClickCell} isActive={isActive} tileSize={settings.tileSize} cellSize={getCellSize(settings.tileSize)} />
      { playerID && (
        <Box sx={{
          maxWidth: "sm",
          alignContent: "left",
          gap: "8px",
          display: 'flex',
          flexDirection: 'column',
        }} >
          <Box sx={{ alignContent: "left" }} >
            <Typography variant='h6'>
              Actions
            </Typography>
            <Container  disableGutters sx={{
              display: 'flex',
              flexWrap: 'nowrap',
              gap: '8px',
              alignContent: 'left',
              bgcolor: 'background.paper',
              minHeight: '50px',
            }}>
                <Button size="small" variant="contained" disabled={!isActive} onClick={() => onClickSwap()}>Swap</Button>
                <Button size="small" variant="contained" disabled={!isActive} onClick={() => undo()}> Undo </Button>
                <Button size="small" variant="contained" disabled={!isActive} onClick={() => moves.endTurn()}>End Turn</Button>
                <Box sx={{display: 'flex', alignItems: 'center', maxWidth: '105px'}} >
                  <Typography variant='body1' align="left" >
                    {G.bagIndex + 1} Tiles Remaining
                  </Typography>
                </Box>
            </Container>
          </Box>
          <TileSet isActive={isActive} tiles={G.players[playerID!].hand} callback={onClickTileCallback} index={handIndex} highlightColor={PLAYER_COLORS[playerID]} name="Your Tiles" tileSize={settings.tileSize} cellSize={getCellSize(settings.tileSize)} />
          <TileSet isActive={isActive} tiles={G.players[playerID!].tilesToSwap} name="Tiles to Swap" tileSize={settings.tileSize} cellSize={getCellSize(settings.tileSize)} />
        </Box>
      )}
    </Container>
  );
}
