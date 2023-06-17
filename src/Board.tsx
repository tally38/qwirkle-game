import React, { useState, useEffect } from 'react';
import { BoardProps } from 'boardgame.io/react';
import { FilteredMetadata } from 'boardgame.io';
import { QwirkleState, IPlayerHand, Tile, Position, TileColor, TileShape } from './Game';
import { Star, FilterVintage, ChangeHistory, Stop, Lens, Favorite } from '@material-ui/icons';
import { Box, Card, CardContent, Container, TableContainer, Typography } from '@mui/material';


interface PlayerHandProps {
    hand: IPlayerHand
    callback: (clickedTileIndex: number) => VoidFunction
    tilesToSwap: Tile[]
    isActive: boolean
    handIndex: number | null
}

interface QwirkleProps extends BoardProps<QwirkleState> {}

const cellStyle = {
  border: '1px solid #555',
  width: '50px',
  height: '50px',
  lineHeight: '25px',
  textAlign: 'center' as 'center',
};

interface QwirkleTileProps {
  color: TileColor,
  shape: TileShape,
}

const QwirkleTile = ( props: QwirkleTileProps) => {
  const {color, shape} = props

  const shapes = {
    'circle': <Lens style={{fontSize: '40px'}}/>,
    'heart': <Favorite style={{fontSize: '40px'}}/>,
    'star': <Star style={{fontSize: '40px'}}/>,
    'square': <Stop style={{fontSize: '40px'}}/>,
    'diamond': <ChangeHistory style={{fontSize: '40px'}}/>,
    'flower': <FilterVintage style={{fontSize: '40px'}}/>,
  }

  const tileStyles = {
    display: 'inline-block',
    width: '40px',
    height: '40px',
    backgroundColor: 'black',
    color: color,
    border: '1px solid black',
    borderRadius: '5px',
    margin: '5px',
    textAlign: 'center' as 'center',
    fontSize: '40px',
    fontWeight: 'bold',
    verticalAlign: 'middle',
  };



  return <div style={tileStyles}>{shapes[shape]}</div>;
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

const PlayerCard = ({playerName, score, isCurrentPlayer, isClientPlayer, isWinner} : {playerName: string, score: number, isCurrentPlayer: Boolean, isClientPlayer: Boolean, isWinner: Boolean}) => {
  const border = isWinner ? '1px solid green' : isCurrentPlayer ? '1px solid blue' : 'none';
  return (
    <Card sx={{
      border,
    }}>
      <CardContent sx={{ minWidth: 128, padding: '4px', ":last-child": {paddingBottom: '4px'}}}>
        <Typography variant='body2' color="text.secondary" gutterBottom>
          <strong>Name: </strong>{playerName}
        </Typography>
        <Typography variant='body2' color="text.secondary" gutterBottom>
          <strong>Score: </strong>{score}
        </Typography>
        <Box sx={{ minHeight: 32 }}>
          {isCurrentPlayer && !isWinner && (
            <Typography color='blue' variant='overline' gutterBottom>
              {isClientPlayer ? "It's your turn" : "Now Playing"}
            </Typography>
          )}
          {isWinner && (
            <Typography color='green' variant='overline' gutterBottom>
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
  }
}

const PlayersDisplay = (props: PlayersDisplayProps) => {
  const {scores, matchData, currentPlayer, clientPlayerID, gameover } = props
  const winners : string[] = !!gameover ? gameover.winners : [];
  const playerCards = []
  for (let playerID in scores) {
		playerCards.push(
      <PlayerCard
        playerName={findPlayerName(matchData, playerID)}
        score={props.scores[playerID]}
        isCurrentPlayer={playerID === currentPlayer}
        isClientPlayer={playerID === clientPlayerID}
        isWinner={winners.includes(playerID)}
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

const doNothing = () => null;

const PlayerHand = (props: PlayerHandProps) => {
  var hand = []
  var tilesToSwap = []
  var tile
  for (let i = 0 ; i < props.hand.length ; i ++ ) {
    tile = props.hand[i]
    if (tile) {
      hand.push(<td key={i} style={cellStyle} onClick={props.isActive ? props.callback(i) : doNothing} ><QwirkleTile color={tile.color} shape={tile.shape} /></td>)
    } else {
      hand.push(<td key={i} style={cellStyle} />)
    }
  }
  for (let i = 0 ; i < props.tilesToSwap.length ; i ++ ) {
    tile = props.tilesToSwap[i]
    tilesToSwap.push(<td key={i} style={cellStyle} ><QwirkleTile color={tile.color} shape={tile.shape} /></td>)
  }
  return (
    <>
      <tr key="player-hand">
        <td key={'player-hand'}><b>Player Hand</b></td>
        {hand}
      </tr>
      <tr key="player-tiles-to-swap" style={{height: '50px'}}>
        <td key={'tiles-to-swap'}><b>Tiles to Swap</b></td>
        {tilesToSwap}
      </tr>
    </>
  );
};

const BoardCells = ({G, onClickCell, isActive} : {G: QwirkleState, onClickCell: (boardPosition: Position) => void, isActive: boolean}) => {
  let rows = [];
  var cellTile
  for (let i = 0; i < G.cells.length ; i++) {
    let cells = [];
    for (let j = 0; j < G.cells[0].length ; j++) {
      const id = i + '-' + j;
      cellTile = G.cells[i][j]!
      cells.push(
        <td key={id}>
          {G.cells[i][j] ? (
            <div style={cellStyle}><QwirkleTile color={cellTile.color} shape={cellTile.shape} /></div>
          ) : (
            <button disabled={!isActive} style={cellStyle} onClick={() => onClickCell({i, j})} />
          )}
        </td>
      );
    }
    rows.push(<tr key={i}>{cells}</tr>);
  }
  return (
    <TableContainer>
      <table aria-label="qwirkle-board-cells">
        <tbody>
          {rows}
        </tbody>
      </table>
    </TableContainer>
  )
}


export function QwirkleBoard({ ctx, G, moves, undo, playerID, matchData, isActive } : QwirkleProps) {
  const [position, setPosition] = useState<Position | null>(null);
  const [handIndex, setHandIndex] = useState<number | null>(null);

  useEffect(() => {
    if (position && handIndex !== null) {
      moves.placeTile(position, handIndex)
      setPosition(null)
      setHandIndex(null)
    }
  }, [position, handIndex, setPosition, setHandIndex, moves]);
  
  function onClickSwap() {
    if (handIndex) {
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
    <div>
      <PlayersDisplay
        scores={G.scores}
        matchData={matchData}
        currentPlayer={ctx.currentPlayer}
        clientPlayerID={playerID}
        gameover={ctx.gameover}
      />
      <BoardCells G={G} onClickCell={onClickCell} isActive={isActive} />
      <table id="player-dashboard">
        <tbody>
          <tr>
            <td key="tiles-remaining">
              <b>Tiles Remaining:</b>
            </td>
            <td key="undo">
              {G.bagIndex + 1}
            </td>
          </tr>
          {playerID ? <PlayerHand isActive={isActive} hand={G.players[playerID!].hand} tilesToSwap={G.players[playerID!].tilesToSwap} callback={onClickTileCallback} handIndex={handIndex} /> : null }
          <tr>
            <td key="action-header">
              <b>Actions</b>
            </td>
            <td key="undo">
              <button disabled={!isActive} style={cellStyle} onClick={ () => undo() }> undo </button>
            </td>
            <td key="end-turn">
              <button disabled={!isActive} style={cellStyle} onClick={() => moves.endTurn()}>end turn</button>
            </td>
            <td key="swap">
              <button disabled={!isActive} style={cellStyle} onClick={() => onClickSwap()}>swap</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
