import React, { useState, useEffect } from 'react';
import { BoardProps } from 'boardgame.io/react';
import { FilteredMetadata } from 'boardgame.io';
import { QwirkleState, IPlayerHand, Tile, Position, TileColor, TileShape } from './Game';
import { Star, FilterVintage, ChangeHistory, Stop, Lens, Favorite } from '@material-ui/icons';
import { TableContainer } from '@mui/material';


interface PlayerHandProps {
    hand: IPlayerHand
    callback: (clickedTileIndex: number) => VoidFunction
    tilesToSwap: Tile[]
    isActive: boolean
    handIndex: number | null
}

interface ScoreDisplayProps {
  scores: {
    [key: string]: number
  },
  matchData?: FilteredMetadata

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

const ScoreDisplay = (props: ScoreDisplayProps) => {
  const {scores, matchData } = props
  const scoreDisplays = []
  for (let playerID in scores) {
		scoreDisplays.push(
      <div key={playerID}>{findPlayerName(matchData, playerID) + ": " + props.scores[playerID]}</div>
    )
	}

  return (
    <div>
      <b>Scores</b>
      {scoreDisplays}
    </div>
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
    if (position && handIndex) {
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

  let winner = <div></div>;
  if (ctx.gameover) {
    winner =
      ctx.gameover.winner !== undefined ? (
        <div id="winner">Winner: {findPlayerName(matchData, ctx.gameover.winner)}</div>
      ) : (
        <div id="winner">Draw!</div>
      );
  }

  return (
    <div>
      <span><b>Current Player: </b>{findPlayerName(matchData, ctx.currentPlayer)}</span>
      <ScoreDisplay scores={G.scores} matchData={matchData} />
      {winner}
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
