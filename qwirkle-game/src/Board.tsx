import React, { useState, useEffect } from 'react';
import { BoardProps } from 'boardgame.io/react';
import { QwirkleState, IPlayerHand, Tile } from './Game';

interface PlayerHandProps {
    hand: IPlayerHand
    callback: (tile: Tile) => VoidFunction
}

interface QwirkleProps extends BoardProps<QwirkleState> {}

interface Position {
  i: number,
  j: number, 
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
      tiles.push(<div key={i} onClick={props.callback(tile)} >{tile.color + tile.shape}</div>)
    } else {
      tiles.push(<div>empty</div>)
    }
  }
  return (
    <div>
      {tiles}
    </div>
  );
};



export function QwirkleBoard({ ctx, G, moves } : QwirkleProps) {
  const [position, setPosition] = useState<Position | null>(null);
  const [tile, setTile] = useState<Tile | null>(null);

  useEffect(() => {
    if (position && tile) {
      moves.placeTile(position.i, position.j, tile)
      setPosition(null)
      setTile(null)
    }
  }, [position, tile, setPosition, setTile, moves]);
  
  function onClickBoard(boardPosition : Position) {
    if (position) {
      if (position.i === boardPosition.i && position.j === boardPosition.j) {
        setPosition(null)
        return
      }
    }
    setPosition(boardPosition)
  }

  function onClickTileCallback(clickedTile: Tile) {
    function onClickTile() {;
      if (tile === clickedTile) {
        setTile(null)
      } else {
        setTile(clickedTile)
      }
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
    lineHeight: '50px',
    textAlign: 'center' as 'center',
  };

  let tbody = [];
  for (let i = 0; i < G.cells.length ; i++) {
    let cells = [];
    for (let j = 0; j < G.cells[0].length ; j++) {
      const id = i + '-' + j;
      cells.push(
        <td key={id}>
          {G.cells[i][j] ? (
            <div style={cellStyle}>{G.cells[i][j]!.color + G.cells[i][j]!.shape}</div>
          ) : (
            <button style={cellStyle} onClick={() => onClickBoard({i, j})} />
          )}
        </td>
      );
    }
    tbody.push(<tr key={i}>{cells}</tr>);
  }

  return (
    <div>
      <table id="board">
        <tbody>{tbody}</tbody>
      </table>
      <PlayerHand hand={G.players[ctx.currentPlayer]!.hand} callback={onClickTileCallback} />
      {winner}
    </div>
  );
}
