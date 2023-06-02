import React, { useState, useEffect } from 'react';
import { BoardProps } from 'boardgame.io/react';
import { FilteredMetadata } from 'boardgame.io';
import { QwirkleState, IPlayerHand, Tile, Position, TileColor, TileShape } from './Game';
import { Star, FilterVintage, ChangeHistory, Stop, Lens, Favorite } from '@material-ui/icons';


interface PlayerHandProps {
    hand: IPlayerHand
    callback: (tile: Tile) => VoidFunction
    tilesToSwap: Tile[]
    isActive: boolean
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
      hand.push(<td key={i} style={cellStyle} onClick={props.isActive ? props.callback(tile) : doNothing} ><QwirkleTile color={tile.color} shape={tile.shape} /></td>)
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



export function QwirkleBoard({ ctx, G, moves, undo, events, playerID, matchData, isActive } : QwirkleProps) {
  const [position, setPosition] = useState<Position | null>(null);
  const [tile, setTile] = useState<Tile | null>(null);

  useEffect(() => {
    if (position && tile) {
      moves.placeTile(position, tile)
      setPosition(null)
      setTile(null)
    }
  }, [position, tile, setPosition, setTile, moves]);
  
  function onClickSwap() {
    if (tile) {
      moves.selectTileToSwap(tile)
      setTile(null)
    }
  }

  function onClickBoard(boardPosition : Position) {
    setPosition(boardPosition)
  }

  function onClickTileCallback(clickedTile: Tile) {
    function onClickTile() {
      setTile(clickedTile)
    }
    return onClickTile
  }

  let winner = <div></div>;
  if (ctx.gameover) {
    winner =
      ctx.gameover.winner !== undefined ? (
        <div id="winner">Winner: {ctx.gameover.winner}</div>
      ) : (
        <div id="winner">Draw!</div>
      );
  }

  let tbody = [];
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
            <button disabled={!isActive} style={cellStyle} onClick={() => onClickBoard({i, j})} />
          )}
        </td>
      );
    }
    tbody.push(<tr key={i}>{cells}</tr>);
  }

  var endTurn = events.endTurn ? events.endTurn : (() => {return});
  return (
    <div>
      <span><b>Current Player: </b>{findPlayerName(matchData, ctx.currentPlayer)}</span>
      <ScoreDisplay scores={G.scores} matchData={matchData} />
      {winner}
      <table id="board">
        <tbody>{tbody}</tbody>
      </table>
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
          {playerID ? <PlayerHand isActive={isActive} hand={G.players[playerID!].hand} tilesToSwap={G.players[playerID!].tilesToSwap} callback={onClickTileCallback} /> : null }
          <tr>
            <td key="action-header">
              <b>Actions</b>
            </td>
            <td key="undo">
              <button disabled={!isActive} style={cellStyle} onClick={ () => undo() }> undo </button>
            </td>
            <td key="end-turn">
              <button disabled={!isActive} style={cellStyle} onClick={() => endTurn()}>end turn</button>
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
