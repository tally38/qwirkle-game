import { Game, Ctx, AiEnumerate } from 'boardgame.io';
import { INVALID_MOVE, PlayerView } from 'boardgame.io/core';

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
  previousScores: {
    [key: string]: number
  },
  previousMoves: {
    [key: string]: Position[]
  },
  remainingTiles: {
    [key: string]: number
  },
}

function shuffle(array: any[], lastIndex: number) {
	if (lastIndex >= array.length || lastIndex < 0) {
		throw new Error("Last index " + lastIndex + " is out of bounds for array of length " + array.length + ".")
	}

  let currentIndex = lastIndex,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];

    currentIndex--;
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
    G.turnPositions.forEach(p => {
      p.i++
    })
  }
  if ( pos.i === G.cells.length - 1 ) {
    G.cells.push(Array(G.cells[0].length).fill(null))
  }
  if ( pos.j === 0 ) {
    for (let i = 0 ; i < G.cells.length ; i++) {
      G.cells[i].unshift(null)
    }
    G.turnPositions.forEach(p => {
      p.j++
    })
    for (let playerID in G.previousMoves) {
      G.previousMoves[playerID].forEach(p => {
        p.j++
      })
    }
  }
  if ( pos.j === G.cells[0].length - 1) {
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


const subsetsOfHand = [[0],[1],[2],[3],[4],[5],[0,1],[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5],[2,3],[2,4],[2,5],[3,4],[3,5],[4,5],[0,1,2],[0,1,3],[0,1,4],[0,1,5],[0,2,3],[0,2,4],[0,2,5],[0,3,4],[0,3,5],[0,4,5],[1,2,3],[1,2,4],[1,2,5],[1,3,4],[1,3,5],[1,4,5],[2,3,4],[2,3,5],[2,4,5],[3,4,5],[0,1,2,3],[0,1,2,4],[0,1,2,5],[0,1,3,4],[0,1,3,5],[0,1,4,5],[0,2,3,4],[0,2,3,5],[0,2,4,5],[0,3,4,5],[1,2,3,4],[1,2,3,5],[1,2,4,5],[1,3,4,5],[2,3,4,5],[0,1,2,3,4],[0,1,2,3,5],[0,1,2,4,5],[0,1,3,4,5],[0,2,3,4,5],[1,2,3,4,5],[0,1,2,3,4,5]]
function findValidOpeningMoves(hand: Tile[]) : Tile[][] {
  if (hand.length !== 6) {
    throw new Error('Invalid hand passed to findValidOpeningMoves')
  }
	// Initialize validOpeningMoves to size-1 moves
	var validOpeningMoves = subsetsOfHand.filter(s => s.length === 1).map(s => {
    return s.map(i => hand[i])
  })
	subsetsOfHand.filter(s => s.length > 1 ).forEach(s => {
		var selectedTiles = s.map(i => hand[i])
		if (tilesAreCompatible(selectedTiles)) {
			if ( selectedTiles.length > validOpeningMoves[0].length ) {
        validOpeningMoves = [selectedTiles]
			} else if ( selectedTiles.length === validOpeningMoves[0].length ) {
        validOpeningMoves.push(selectedTiles)
      }
		}
	})
	return validOpeningMoves
}

function findOpener(G: QwirkleState, ctx: Ctx ) {
	var overallBiggestMoveLength = 0
	var playerBiggestMoveLength
  var validOpeningMoves
	var possibleOpeners : number[] = []
	for (let i = 0 ; i < ctx.numPlayers ; i ++) {
		validOpeningMoves = findValidOpeningMoves(G.players[String(i)]!.hand as Tile[])
    playerBiggestMoveLength = validOpeningMoves[0].length
		if (playerBiggestMoveLength > overallBiggestMoveLength) {
			possibleOpeners = [i]
			overallBiggestMoveLength = playerBiggestMoveLength
		} else if (playerBiggestMoveLength === overallBiggestMoveLength) {
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

function tilesEqual(t1: Tile, t2: Tile) : boolean {
  return t1.color === t2.color && t1.shape === t2.shape
}


function removeTileFromHand(G: QwirkleState, playerID: string, handIndex: number) {
  var hand = G.players[playerID]?.hand
  if (!hand) {
    throw new Error("Invalid playerID passed to removeTileFromHand")
  }
  if (handIndex < 0 || handIndex >= 6) {
    throw new Error("Hand index must bebetween 0 and 5; recieved: " + handIndex)
  }
  var handTile : Tile | null = hand[handIndex]
  if (!handTile) {
    throw new Error("Tile not found in player's hand")
  }
  hand[handIndex] = null
  return handTile
}

function validTilePlacement(ctx: Ctx, G: QwirkleState, playerID: string, pos: Position, handIndex: number) {
  var rowTiles = findRowTiles(G, pos)
  var colTiles = findColumnTiles(G, pos)
  var isTouchingAnotherTile = rowTiles.length > 0 || colTiles.length > 0

  if (handIndex < 0 || handIndex > 5 ) {
    return false
  }
  var tile = G.players[playerID].hand[handIndex]
  if (!tile) {
    return false
  }
  if (G.cells[pos.i][pos.j]) {
    return false
  }
  if (isTouchingAnotherTile) {
    rowTiles.push(tile)
    if (!tilesAreCompatible(rowTiles)) {
      return false
    }
    colTiles.push(tile)
    if (!tilesAreCompatible(colTiles)) {
      return false
    }
  } else if (ctx.turn !== 1) {
    return false
  }
  if (!G.turnPositions.length && ctx.turn === 1) {
    var validOpeningMoves = findValidOpeningMoves(G.players[playerID].hand as Tile[])
    if (validOpeningMoves.every( move => !move.some(t => tilesEqual(t, tile as Tile)))) {
      return false
    }
  }
  if (G.turnPositions.some(turnPos => !areLocationsContinuous(G, turnPos, pos))) {
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
  if (!G.players[playerID].tilesToSwap.length) {
    return
  }
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
  name: 'qwirkle',
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
    var previousScores : {
      [key: string]: number
    } = {}
    var previousMoves : {
      [key: string]: Position[]
    } = {}
    var remainingTiles : {
      [key: string]: number
    } = {}
    for (i = 0 ; i < ctx.numPlayers ; i++) {
      players[String(i)] = {
        hand: Array(6).fill(null),
        tilesToSwap: []
      }
      scores[String(i)] = 0
      previousScores[String(i)] = 0
      remainingTiles[String(i)] = 6
    }
    var initialBoardSize = 5
    var cells = Array(initialBoardSize).fill(Array(initialBoardSize).fill(null))

    var G : QwirkleState = {secret: {bag}, bagIndex, players, cells, scores, turnPositions: [], previousScores, previousMoves, remainingTiles}
    fillAllHands(G)
    return G
  },
  moves: {
    // placeholder move as I work through tutorial
    placeTile: ({ ctx, G, playerID }, pos: Position, handIndex: number) => {
      const posCopy = {...pos}
      if (G.players[playerID].tilesToSwap.length ) {
        return INVALID_MOVE
      }
      if (!validTilePlacement(ctx, G, playerID, posCopy, handIndex)) {
        return INVALID_MOVE
      }
      G.turnPositions.push(posCopy)
      var tile = removeTileFromHand(G, playerID, handIndex)
      G.cells[posCopy.i][posCopy.j] = tile
      extendBoardIfNeeded(G, posCopy) // this needs to be calld after pushing pos on turnPositions
    },
    selectTileToSwap: ({ ctx, G, playerID }, handIndex: number) => {
      // Only allow swapping pieces if no tiles placed on this turn
      if ( ctx.turn === 1 ) {
        return INVALID_MOVE
      }
      if (G.turnPositions.length || G.bagIndex < 0 ) {
        return INVALID_MOVE
      }
      var tile = removeTileFromHand(G, playerID, handIndex)
      G.players[playerID].tilesToSwap.push(tile)
    },
    endTurn: {
      move: ({ G, ctx, events, playerID } ) => {
        if (ctx.currentPlayer !== playerID) {
          return INVALID_MOVE
        }
        if (ctx.turn === 1 && G.players[playerID].tilesToSwap.length) {
          return INVALID_MOVE
        }
        if (ctx.turn === 1) {
          var allTiles : Tile[] = G.turnPositions.map(pos => G.cells[pos.i][pos.j] as Tile)
          allTiles.push(...G.players[playerID].hand.filter( t => !!t ) as Tile[])
          if (G.turnPositions.length !== findValidOpeningMoves(allTiles)[0].length ) {
            return INVALID_MOVE
          }
        }
        if (G.players[playerID].tilesToSwap.length && G.turnPositions.length) {
          throw new Error("Player swapped and placed tiles within same turn.")
        }
        updateScore(G, playerID)
        swapSelectedTiles(G, playerID)
        if (G.players[playerID].hand.every((val) => val === null)) {
          G.scores[playerID] += 6
        }
        G.previousMoves[playerID] = [...G.turnPositions]
        G.turnPositions = []
        fillHand(G, playerID)
        events.endTurn()
        G.remainingTiles[playerID] = G.players[playerID].hand.filter(t => t !== null).length
      },
      client: false,
    }
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
        return { winners: winners }
      } else {
        // player still has tiles, so game is not over
        return
      }
    }
  },
  turn: {
    order: {
      first: ({ G, ctx }) => findOpener(G, ctx),
      next: ({ ctx }) => (ctx.playOrderPos + 1) % ctx.numPlayers,
      playOrder: ({ ctx }) => [...Array(ctx.numPlayers).keys()].map(k => String(k)),
    },
    onBegin: ({ G }) => {
      G.previousScores = {...G.scores}
    }
  },
  ai: {
    enumerate: (G, ctx, playerID) => {
      let moves : AiEnumerate = [];
      if (ctx.currentPlayer !== playerID) {
        return moves
      }
      if (!G.players[playerID].tilesToSwap.length) {
        for (let i = 0; i < G.cells.length ; i++) {
          for (let j = 0; j < G.cells[0].length ; j++) {
            G.players[playerID].hand.forEach((tile, index) => {
              if (tile) {
                var pos = {i, j}
                if (validTilePlacement(ctx, G, playerID, pos, index)) {
                  moves.push({ move: 'placeTile', args: [pos, index] });
                }
              }
            })
          }
        }
      }
      if (!moves.length) {
        moves.push({'move': 'endTurn'})
      }
      if (!G.turnPositions.length) {
        G.players[playerID].hand.forEach((tile, index) => {
          if (tile && G.bagIndex >= 0) {
            moves.push({ move: 'selectTileToSwap', args: [index] });
          }
        })
      }      
      return moves;
    },
  },
  events: {
    endGame: false,
    endTurn: false,
  },
  playerView: PlayerView.STRIP_SECRETS,
  minPlayers: 2,
  maxPlayers: 4,
};
// TODO: detect when there are no valid turns end game
