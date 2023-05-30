import React, { useState, useEffect } from 'react';
import { BoardProps } from 'boardgame.io/react';
import { QwirkleState, IPlayerHand, Tile, Position } from './Game';

interface PlayerHandProps {
    hand: IPlayerHand
    callback: (tile: Tile) => VoidFunction
    tilesToSwap: Tile[]
}

interface ScoreDisplayProps {
  scores: {
    [key: string]: number
  }
}

interface QwirkleProps extends BoardProps<QwirkleState> {}

const cellStyle = {
  border: '1px solid #555',
  width: '50px',
  height: '50px',
  lineHeight: '25px',
  textAlign: 'center' as 'center',
};

const ScoreDisplay = (props: ScoreDisplayProps) => {
  const scoreDisplays = []
  for (let playerId in props.scores) {
		scoreDisplays.push(
      <div key={playerId}>{"Player " + playerId + ": " + props.scores[playerId]}</div>
    )
	}

  return (
    <div>
      <b>Scores</b>
      {scoreDisplays}
    </div>
  )
}

const PlayerHand = (props: PlayerHandProps) => {
  var hand = []
  var tilesToSwap = []
  var tile
  for (let i = 0 ; i < props.hand.length ; i ++ ) {
    tile = props.hand[i]
    if (tile) {
      hand.push(<td key={i} style={cellStyle} onClick={props.callback(tile)} >{tile.color + " " + tile.shape}</td>)
    } else {
      hand.push(<td key={i} style={cellStyle} />)
    }
  }
  for (let i = 0 ; i < props.tilesToSwap.length ; i ++ ) {
    tile = props.tilesToSwap[i]
    tilesToSwap.push(<td key={i} style={cellStyle} onClick={props.callback(tile)} >{tile.color + " " + tile.shape}</td>)
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



export function QwirkleBoard({ ctx, G, moves, undo, events } : QwirkleProps) {
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
    function onClickTile() {;
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
            <div style={cellStyle}>{cellTile.color + " " + cellTile.shape}</div>
          ) : (
            <button style={cellStyle} onClick={() => onClickBoard({i, j})} />
          )}
        </td>
      );
    }
    tbody.push(<tr key={i}>{cells}</tr>);
  }

  var endTurn = events.endTurn ? events.endTurn : (() => {return});

  var {hand, tilesToSwap} = G.players[ctx.currentPlayer]!
  return (
    <div>
      <ScoreDisplay scores={G.scores} />
      {winner}
      <table id="board">
        <tbody>{tbody}</tbody>
      </table>
      <table id="player-dashboard">
        <tbody>
          <PlayerHand hand={hand} tilesToSwap={tilesToSwap} callback={onClickTileCallback} />
          <tr>
            <td key="action-header">
              <b>Actions</b>
            </td>
            <td key="undo">
              <button style={cellStyle} onClick={ () => undo() }> undo </button>
            </td>
            <td key="end-turn">
              <button style={cellStyle} onClick={() => endTurn()}>end turn</button>
            </td>
            <td key="swap">
              <button style={cellStyle} onClick={() => onClickSwap()}>swap</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
