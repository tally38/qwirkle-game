import React, { useState, useEffect } from 'react';
import { BoardProps } from 'boardgame.io/react';
import { FilteredMetadata } from 'boardgame.io';
import { QwirkleState, IPlayerHand, Tile, Position, TileColor, TileShape } from './Game';
import { Star, FilterVintage, ChangeHistory, Stop, Lens, Favorite } from '@material-ui/icons';
import { Box, Button, Card, CardContent, Container, TableContainer, Typography } from '@mui/material';

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
    borderRadius: '5px',
    textAlign: 'center' as 'center',
    fontSize: '40px',
    fontWeight: 'bold',
    verticalAlign: 'middle',
    lineHeight: "40px"
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

const PlayerCard = ({playerName, score, isCurrentPlayer, isClientPlayer, isWinner} : {playerName: string, score: number, isCurrentPlayer: Boolean, isClientPlayer: Boolean, isWinner: Boolean}) => {
  const border = isWinner ? '1px solid green' : isCurrentPlayer ? '1px solid blue' : 'none';
  return (
    <Card sx={{
      border,
    }}>
      <CardContent sx={{ minWidth: 128, padding: '4px', ":last-child": {paddingBottom: '4px'}}}>
        <Typography variant='body2' color="text.secondary" >
          <strong>Name: </strong>{playerName}
        </Typography>
        <Typography variant='body2' color="text.secondary" >
          <strong>Score: </strong>{score}
        </Typography>
        <Box sx={{ minHeight: 32 }}>
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
  }
}

const PlayersDisplay = (props: PlayersDisplayProps) => {
  const {scores, matchData, currentPlayer, clientPlayerID, gameover } = props
  const winners : string[] = !!gameover ? gameover.winners : [];
  const playerCards = []
  for (let playerID in scores) {
		playerCards.push(
      <PlayerCard
        key={playerID}
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

interface TileSetProps {
  tiles: (Tile | null)[]
  callback?: (clickedTileIndex: number) => VoidFunction
  isActive: boolean
  index?: number | null // index within tileset ; used for rendering
  name: string
}

const TileSet = (props: TileSetProps) => {
  const { tiles, callback, isActive, index, name } = props
  var displayTiles = []
  var tile
  for (let i = 0 ; i < tiles.length ; i ++ ) {
    tile = tiles[i]
    if (tile) {
      displayTiles.push(
        <Box key={i} onClick={(isActive && !!callback) ? callback(i) : () => null} sx={
          {
            width: '50px',
            height: '50px',
            lineHeight: '40px',
            textAlign: 'center' as 'center',
            borderRadius: '5px',
            padding: '3px',
            backgroundColor: index === i ? 'blue' : 'white',
          }
        }>
          <QwirkleTile color={tile.color} shape={tile.shape} />
        </Box>
      )
    }
  }
  return (
    <Container disableGutters >
      <Typography variant='h6' >
        {name}
      </Typography>
      <Container  disableGutters sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1px',
        alignContent: 'left',
        bgcolor: 'background.paper',
        minHeight: '50px',
      }}>
        {displayTiles}
      </Container>
    </Container>
  );
};


const BoardCells = ({G, onClickCell, isActive} : {G: QwirkleState, onClickCell: (boardPosition: Position) => void, isActive: boolean}) => {
  const cellStyle = {
    border: '1px solid #555',
    width: '50px',
    height: '50px',
    lineHeight: '25px',
    textAlign: 'center' as 'center',
    minWidth: '50px',
    borderRadius: '0px',
    padding: '4px',
    margin: '1px',
  };
  let rows = [];
  var cellTile
  for (let i = 0; i < G.cells.length ; i++) {
    let rowCells = [];
    for (let j = 0; j < G.cells[0].length ; j++) {
      const id = i + '-' + j;
      cellTile = G.cells[i][j]!
      if (!!cellTile) {
        rowCells.push(<Box key={id} style={cellStyle}><QwirkleTile color={cellTile.color} shape={cellTile.shape} /></Box>)
      } else {
        rowCells.push(<Button key={id} disabled={!isActive} sx={cellStyle} onClick={() => onClickCell({i, j})} />)
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
      <Box sx={{
        maxHeight: '50vh',
        overflow: 'auto',
        padding: "4px",
        border: '1px solid #555',
        maxWidth: "sm",
      }}>
        <Box >
          {rows}
        </Box>
      </Box>
    </Box>
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
    <div>
      <PlayersDisplay
        scores={G.scores}
        matchData={matchData}
        currentPlayer={ctx.currentPlayer}
        clientPlayerID={playerID}
        gameover={ctx.gameover}
      />
      <BoardCells G={G} onClickCell={onClickCell} isActive={isActive} />
      { playerID && (
        <Box sx={{
          maxWidth: "sm",
          alignContent: "left",
          gap: "8px",
          display: 'flex',
          flexDirection: 'column',
        }} >
          <Container  disableGutters sx={{
            display: 'flex',
            flexWrap: 'nowrap',
            gap: '8px',
            bgcolor: 'background.paper',
            minHeight: '50px',
            justifyContent: "space-between",
          }}>
            <Box sx={{ alignContent: "left" }} >
              <Typography variant='h6'>
                Actions
              </Typography>
              <Container  disableGutters sx={{
                display: 'flex',
                flexWrap: 'nowrap',
                gap: '4px',
                alignContent: 'left',
                bgcolor: 'background.paper',
                minHeight: '50px',
              }}>
                  <Button size="small" variant="contained" disabled={!isActive} onClick={() => undo()}> Undo </Button>
                  <Button size="small" variant="contained" disabled={!isActive} onClick={() => moves.endTurn()}>End Turn</Button>
                  <Button size="small" variant="contained" disabled={!isActive} onClick={() => onClickSwap()}>Swap</Button>
              </Container>
            </Box>
            <Box >
              <Typography variant='h6' align="right" >
                Tiles Remaining
              </Typography>
              <Typography variant='body1' align="right" >
                {G.bagIndex + 1}
              </Typography>
            </Box>
          </Container>
          <TileSet isActive={isActive} tiles={G.players[playerID!].hand} callback={onClickTileCallback} index={handIndex} name="Your Tiles" />
          <TileSet isActive={isActive} tiles={G.players[playerID!].tilesToSwap} name="Tiles to Swap" />
        </Box>
      )}
    </div>
  );
}
