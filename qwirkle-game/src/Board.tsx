import React, { useState, useEffect } from 'react';
import { BoardProps } from 'boardgame.io/react';
import { QwirkleState, IPlayerHand, Tile, Position } from './Game';

interface PlayerHandProps {
    hand: IPlayerHand
    callback: (tile: Tile) => VoidFunction
}

interface ScoreDisplayProps {
  scores: {
    [key: string]: number
  }
}

interface QwirkleProps extends BoardProps<QwirkleState> {}

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
  var tiles = []
  if (!props.hand) {
    return (<div>"no hand"</div>)
  }
  var tile
  for (let i = 0 ; i < props.hand.length ; i ++ ) {
    tile = props.hand[i]
    if (tile) {
      tiles.push(<div key={i} onClick={props.callback(tile)} >{tile.color + " " + tile.shape}</div>)
    } else {
      tiles.push(<div key={i} >empty</div>)
    }
  }
  return (
    <div>
      {tiles}
    </div>
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

  const cellStyle = {
    border: '1px solid #555',
    width: '50px',
    height: '50px',
    lineHeight: '25px',
    textAlign: 'center' as 'center',
  };

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

  return (
    <div>
      <ScoreDisplay scores={G.scores} />
      <table id="board">
        <tbody>{tbody}</tbody>
      </table>
      <PlayerHand hand={G.players[ctx.currentPlayer]!.hand} callback={onClickTileCallback} />
      <button style={cellStyle} onClick={ () => undo() }> undo </button>
      <button style={cellStyle} onClick={() => endTurn()}>end turn</button>
      {winner}
    </div>
  );
}
