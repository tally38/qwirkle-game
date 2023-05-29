import React from 'react';

const DELIM = "-"

const PlayerHand = (props) => {
  var pieces = []
  if (!props.hand) {
    return "no hand"
  }
  var piece
  for (let i = 0 ; i < props.hand.length ; i ++ ) {
    piece = props.hand[i]
    pieces.push(<div key={i}>{piece ? piece.color + piece.shape : "null"}</div>)
  }
  return (
    <div>
      {pieces}
    </div>
  );
};

export function QwirkleBoard({ ctx, G, moves }) {
  function onClick(i, j) {
    moves.clickCell(i, j)
  }

  let winner = '';
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
    textAlign: 'center',
  };

  let tbody = [];
  for (let i = 0; i < G.board.length ; i++) {
    let cells = [];
    for (let j = 0; j < G.board[0].length ; j++) {
      const id = i + DELIM + j;
      cells.push(
        <td key={id}>
          {G.board[i][j] ? (
            <div style={cellStyle}>{G.board[i][j]}</div>
          ) : (
            <button style={cellStyle} onClick={() => onClick(i, j)} />
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
      <PlayerHand hand={G.players[ctx.currentPlayer].hand} />
      {winner}
    </div>
  );
}
