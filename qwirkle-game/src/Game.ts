import { Game, Ctx, AiEnumerate } from 'boardgame.io';
import { INVALID_MOVE } from 'boardgame.io/core';

export enum TileColor {
  red = "red",
  orange = "orange",
  yellow = "yellow",
  green = "green",
  blue = "blue",
  purple = "purple",
}
export enum TileShape {
  circle = "circle",
  square = "square",
  diamond = "diamond",
  star = "star",
  flower = "flower",
  heart = "heart",
}

export interface Tile {
    color: TileColor,
    shape: TileShape,
}

export type IPlayerHand = (null | Tile)[]

export interface Player {
  hand: IPlayerHand
  tilesToSwap: Tile[]
}

export interface Position {
  i: number,
  j: number
}

export interface QwirkleState {
  cells: (null | Tile)[][];
  secret: {
    bag: (null | Tile)[]
  }
  bagIndex: number, // one less than the number of remaining tiles
  players: {
    [key: string]: Player
  },
  scores: {
    [key: string]: number
  },
  turnPositions: Position[],
}

function shuffle(array: any[], lastIndex: number) {
	if (lastIndex >= array.length) {
		throw new Error("Last index " + lastIndex + " is out of bounds for array of length " + array.length + ".")
	}

  let currentIndex = lastIndex,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function areLocationsContinuous(G: QwirkleState, pos1: Position, pos2: Position) {
  // Check if row indices are the same
  if (pos1.i === pos2.i) {
    // Determine the start and end column indices
    const startCol = Math.min(pos1.j, pos2.j);
    const endCol = Math.max(pos1.j, pos2.j);

    // Iterate over column indices between start and end
    for (let col = startCol + 1; col < endCol; col++) {
      if (G.cells[pos1.i][col] === null) {
        return false; // Empty location found, not continuous
      }
    }
    return true; // No empty locations found, continuous in the same row
  }

  // Check if column indices are the same
  else if (pos1.j === pos2.j) {
    // Determine the start and end row indices
    const startRow = Math.min(pos1.i, pos2.i);
    const endRow = Math.max(pos1.i, pos2.i);

    // Iterate over row indices between start and end
    for (let row = startRow + 1; row < endRow; row++) {
      if (G.cells[row][pos1.j] === null) {
        return false; // Empty location found, not continuous
      }
    }
    return true; // No empty locations found, continuous in the same column
  }

  // If neither row nor column indices are the same, not continuous
  return false;
}

function extendBoardIfNeeded(G: QwirkleState, pos: Position) {
  // extends the board if the position is on the edge of the board
  // update all active turnPositions to be consistent with the new board
  if ( pos.i === 0 ) {
    G.cells.unshift(Array(G.cells[0].length).fill(null))
    G.turnPositions.forEach(pos => {
      pos.i++
    })
  } else if ( pos.i === G.cells.length - 1 ) {
    G.cells.push(Array(G.cells[0].length).fill(null))
  }
  if ( pos.j === 0 ) {
    for (let i = 0 ; i < G.cells.length ; i++) {
      G.cells[i].unshift(null)
    }
    G.turnPositions.forEach(pos => {
      pos.j++
    })
  } else if ( pos.j === G.cells[0].length - 1) {
    for (let i = 0 ; i < G.cells.length ; i++) {
      G.cells[i].push(null)
    }
  }

}

function drawTile(G: QwirkleState) {
	var tile = G.secret.bag[G.bagIndex]
	G.secret.bag[G.bagIndex] = null
	G.bagIndex--
	return tile
}

function fillHand(G: QwirkleState, playerID: string) {
  if (!G.players[playerID]) {
    throw new Error("Invalid playerID passed to fillHand" + playerID)
  }
	var playerHand = G.players[playerID].hand
	for (var i = 0 ; i < playerHand.length ; i++ ) {
		if ( playerHand[i] === null && G.bagIndex >= 0 ) {
			playerHand[i] = drawTile(G)
		}
	}
}

function fillAllHands(G: QwirkleState) {
	for (let playerID in G.players) {
		fillHand(G, playerID)
	}
  return G
}

function tilesAreCompatible(tiles: Tile[]) {
	if (tiles.length === 1) {
		return true
	}
	var colors = new Set<TileColor>()
	var shapes = new Set<TileShape>()

	tiles.forEach(tile => {
		colors.add(tile.color)
		shapes.add(tile.shape)
	})

	if (colors.size === tiles.length ) {
		if (shapes.size === 1) {
			return true
		}
	}

	if (shapes.size === tiles.length) {
		if (colors.size === 1) {
			return true
		}
	}

	return false
}


const subsetsOfHand = [[],[0],[1],[2],[3],[4],[5],[0,1],[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5],[2,3],[2,4],[2,5],[3,4],[3,5],[4,5],[0,1,2],[0,1,3],[0,1,4],[0,1,5],[0,2,3],[0,2,4],[0,2,5],[0,3,4],[0,3,5],[0,4,5],[1,2,3],[1,2,4],[1,2,5],[1,3,4],[1,3,5],[1,4,5],[2,3,4],[2,3,5],[2,4,5],[3,4,5],[0,1,2,3],[0,1,2,4],[0,1,2,5],[0,1,3,4],[0,1,3,5],[0,1,4,5],[0,2,3,4],[0,2,3,5],[0,2,4,5],[0,3,4,5],[1,2,3,4],[1,2,3,5],[1,2,4,5],[1,3,4,5],[2,3,4,5],[0,1,2,3,4],[0,1,2,3,5],[0,1,2,4,5],[0,1,3,4,5],[0,2,3,4,5],[1,2,3,4,5],[0,1,2,3,4,5]]

function findBiggestOpeningMove(hand: Tile[]) : number {
	// assumes all pieces in hand are not null
	var biggestMoveLength = 0
	subsetsOfHand.forEach(move => {
		var selectedTiles = move.map(i => hand[i])
		if (tilesAreCompatible(selectedTiles)) {
			if (move.length > biggestMoveLength) {
				biggestMoveLength = move.length
			}
		}
	})
	return biggestMoveLength
}

function findOpener(G: QwirkleState, ctx: Ctx ) {
	var overallBiggestMove = 0
	var playerBiggestMove
	var possibleOpeners : number[] = []
	for (let i = 0 ; i < ctx.numPlayers ; i ++) {
		playerBiggestMove = findBiggestOpeningMove(G.players[String(i)]!.hand as Tile[])
		if (playerBiggestMove > overallBiggestMove) {
			possibleOpeners = [i]
			overallBiggestMove = playerBiggestMove
		} else if (playerBiggestMove === overallBiggestMove) {
			possibleOpeners.push(i)
		}
	}

	// Randomly choose starting player from possible players
	return possibleOpeners[Math.floor(Math.random()*possibleOpeners.length)]
}

function findColumnTiles(G: QwirkleState, pos: Position) : Tile[] {
  var colTiles : Tile[] = []
  const m = G.cells.length

  var tileAtPos = G.cells[pos.i][pos.j]
  if (tileAtPos) {
    colTiles.push(tileAtPos)
  }

  var i = pos.i + 1
  while (i < m && G.cells[i][pos.j]) {
    colTiles.push(G.cells[i][pos.j]!)
    i++
  }
  i = pos.i - 1
  while (i >= 0 && G.cells[i][pos.j]) {
    colTiles.push(G.cells[i][pos.j]!)
    i--
  }
  return colTiles
}

function findRowTiles(G: QwirkleState, pos: Position) : Tile[] {
  var rowTiles : Tile[] = []
  const n = G.cells[0].length

  var tileAtPos = G.cells[pos.i][pos.j]
  if (tileAtPos) {
    rowTiles.push(tileAtPos)
  }

  var j = pos.j + 1
  while (j < n && G.cells[pos.i][j]) {
    rowTiles.push(G.cells[pos.i][j]!)
    j++
  }
  j = pos.j - 1
  while (j >= 0 && G.cells[pos.i][j]) {
    rowTiles.push(G.cells[pos.i][j]!)
    j--
  }
  return rowTiles
}

function removeTileFromHand(G: QwirkleState, playerID: string, tile: Tile) {
  var hand = G.players[playerID]?.hand
  if (!hand) {
    throw new Error("Invalid playerID passed to removeTileFromHand")
  }
  var handTile : Tile | null
  var removeIndex : null | number = null
  for (let i = 0 ; i < hand.length ; i++ ) {
    handTile = hand[i]
    if (handTile && handTile.color === tile.color && handTile.shape === tile.shape ) {
      removeIndex = i
    }
  }
  if ( removeIndex !== null ) {
    hand[removeIndex] = null
  } else {
    throw new Error("Tile not found in player's hand")
  }
}

function validTilePlacement(G: QwirkleState, playerID: String, pos: Position, tile: Tile, debug: boolean) {
  const isStartPosition = pos.i === Math.floor(G.cells.length/2) && pos.j === Math.floor(G.cells[0].length/2)
  var rowTiles = findRowTiles(G, pos)
  var colTiles = findColumnTiles(G, pos)
  var isTouchingAnotherTile = rowTiles.length > 0 || colTiles.length > 0

  if (G.cells[pos.i][pos.j]) {
    debug ?? console.log('Board position already filled.')
    return false
  }
  if (isTouchingAnotherTile) {
    rowTiles.push(tile)
    if (!tilesAreCompatible(rowTiles)) {
      debug ?? console.log('Invalid row.')
      return false
    }
    colTiles.push(tile)
    if (!tilesAreCompatible(colTiles)) {
      debug ?? console.log('Invalid column.')
      return false
    }
  } else if (!isStartPosition) {
    debug ?? console.log('Tile is not touching another tile nor is this the start position.')
    return false
  }
  if (G.turnPositions.length && !areLocationsContinuous(G, G.turnPositions[0], pos)) {
    debug ?? console.log('Tile is not in same row/col as other placed tile.')
    return false
  }
  return true
}

function updateScore(G: QwirkleState, playerID: string) {
  var turnScore = 0
  var pointArray : number[] = []
  var tilesInRow = G.turnPositions.every( (val, _, arr) => val.i === arr[0].i )
  if ( G.turnPositions.length === 0 ) {
    return
  }
  var firstPos = G.turnPositions[0]

  if (tilesInRow) {
    G.turnPositions.forEach(pos => {
      pointArray.push(findColumnTiles(G, pos).length)
    })
    pointArray.push(findRowTiles(G, firstPos).length)
  } else {
    G.turnPositions.forEach(pos => {
      pointArray.push(findRowTiles(G, pos).length)
    })
    pointArray.push(findColumnTiles(G, firstPos).length)
  }

  pointArray.forEach(p => {
    if (p === 6) {
      turnScore += 12
    } else if ( p > 1 ) {
      turnScore += p
    }
  })
  G.scores[playerID] += turnScore
}

function swapSelectedTiles(G: QwirkleState, playerID: string) {
  // Only allow swapping pieces if no tiles placed on this turn
  var tile
  for (let i = 0 ; i < G.players[playerID].tilesToSwap.length ; i++ ) {
    tile = G.players[playerID].tilesToSwap[i]
    G.bagIndex++
    G.secret.bag[G.bagIndex] = tile
  }
  shuffle(G.secret.bag, G.bagIndex)
  fillHand(G, playerID)
  G.players[playerID].tilesToSwap = []
}

export const Qwirkle : Game<QwirkleState>= {
  setup: ({ ctx }) : QwirkleState => {
    var bag = Array(108)
    var bagIndex = 107
    var i = 0
    for (var k = 0; k < 3; k++) {
      for (let color in TileColor) {
        for (let shape in TileShape ) {
          bag[i] = {color, shape};
          i++
        }
      }
    }
    shuffle(bag, bagIndex)
  
    var players : {
      [key: string]: Player
    } = {}
    var scores : {
      [key: string]: number
    } = {}
    for (i = 0 ; i < ctx.numPlayers ; i++) {
      players[String(i)] = {
        hand: Array(6).fill(null),
        tilesToSwap: []
      }
      scores[String(i)] = 0
    }
    var initialBoardSize = 3
    var cells = Array(initialBoardSize).fill(Array(initialBoardSize).fill(null))

    var G : QwirkleState = {secret: {bag}, bagIndex, players, cells, scores, turnPositions: []}
    fillAllHands(G)
    return G
  },
  moves: {
    // placeholder move as I work through tutorial
    placeTile: ({ G, playerID }, pos: Position, tile: Tile) => {
      if (G.cells[pos.i][pos.j] || G.players[playerID].tilesToSwap.length ) {
        return INVALID_MOVE
      }
      if (!validTilePlacement(G, playerID, pos, tile, true)) {
        return INVALID_MOVE
      }
      G.turnPositions.push(pos)
      G.cells[pos.i][pos.j] = tile
      removeTileFromHand(G, playerID, tile)
      extendBoardIfNeeded(G, pos) // this needs to be calld after pushing pos on turnPositions
      return G
    },
    selectTileToSwap: ({ G, playerID }, tile: Tile) => {
      // Only allow swapping pieces if no tiles placed on this turn
      if (G.turnPositions.length || G.bagIndex < 0 ) {
        return INVALID_MOVE
      }
      removeTileFromHand(G, playerID, tile)
      G.players[playerID].tilesToSwap.push(tile)
      return G
    },
  },
  endIf: ({ G }) => {
    var hand
    var winners : String[] = []
    var maxScore = 0

    for (let playerID in G.players) {
      hand = G.players[playerID].hand
      if (hand.every( (val) => val === null ) && G.bagIndex === -1 && !G.turnPositions.length) {
        for (let playerID in G.scores) {
          if (G.scores[playerID] > maxScore) {
            maxScore = G.scores[playerID]
            winners = [playerID]
          } else if (G.scores[playerID] === maxScore) {
            winners.push(playerID)
          }
        }
        return winners.length > 1 ? { draw: true } : { winner: winners[0] }
      }
    }
  },
  turn: {
    order: {
      first: ({ G, ctx }) => findOpener(G, ctx),
      next: ({ ctx }) => (ctx.playOrderPos + 1) % ctx.numPlayers,
      playOrder: ({ ctx }) => [...Array(ctx.numPlayers).keys()].map(k => String(k)),
    },
    onEnd: ({ G, ctx }) => {
      if (G.players[ctx.currentPlayer].tilesToSwap.length && G.turnPositions.length) {
        throw new Error("Player swapped and placed tiles within same turn.")
      }
      updateScore(G, ctx.currentPlayer)
      swapSelectedTiles(G, ctx.currentPlayer)
      if (G.players[ctx.currentPlayer].hand.every((val) => val === null)) {
        G.scores[ctx.currentPlayer] += 6
      }
      G.turnPositions = []
      return fillAllHands(G)
    },
  },
  ai: {
    enumerate: (G, ctx, playerID) => {
      let moves : AiEnumerate = [];
      if (ctx.currentPlayer !== playerID) {
        return moves
      }
      moves.push({'event': 'endTurn'})
      if (!G.players[playerID].tilesToSwap.length) {
        for (let i = 0; i < G.cells.length ; i++) {
          for (let j = 0; j < G.cells[0].length ; j++) {
            G.players[playerID].hand.forEach(tile => {
              if (tile) {
                var pos = {i, j}
                if (validTilePlacement(G, playerID, pos, tile, false)) {
                  moves.push({ move: 'placeTile', args: [pos, tile] });
                }
              }
            })
          }
        }
      }
      if (!G.turnPositions.length) {
        G.players[playerID].hand.forEach(tile => {
          if (tile) {
            moves.push({ move: 'selectTileToSwap', args: [tile] });
          }
        })
      }      
      return moves;
    },
  },
};
// TODO: detect when there are no valid turns end game
