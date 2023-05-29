import React from 'react';

const DELIM = "-"

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
      {winner}
    </div>
  );
}
