import { Game, Ctx } from 'boardgame.io';
// import { INVALID_MOVE } from 'boardgame.io/core';

enum TileColor {
  red = "red",
  orange = "orange",
  yellow = "yellow",
  green = "green",
  blue = "blue",
  purple = "purple",
}
enum TileShape {
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

function drawTile(G: QwirkleState) {
	var piece = G.secret.bag[G.bagIndex]
	G.secret.bag[G.bagIndex] = null
	G.bagIndex--
	return piece
}

function fillHand(G: QwirkleState, playerId: string) {
  if (!G.players[playerId]) {
    throw new Error("Invalid playerId passed to fillHand" + playerId)
  }
	var playerHand = G.players[playerId].hand
	for (var i = 0 ; i < playerHand.length ; i++ ) {
		if ( playerHand[i] == null ) {
			playerHand[i] = drawTile(G)
		}
	}
}

function fillAllHands(G: QwirkleState) {
	for (let playerId in G.players) {
		fillHand(G, playerId)
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


const possibleOpeningMoves = [[],[0],[1],[2],[3],[4],[5],[0,1],[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5],[2,3],[2,4],[2,5],[3,4],[3,5],[4,5],[0,1,2],[0,1,3],[0,1,4],[0,1,5],[0,2,3],[0,2,4],[0,2,5],[0,3,4],[0,3,5],[0,4,5],[1,2,3],[1,2,4],[1,2,5],[1,3,4],[1,3,5],[1,4,5],[2,3,4],[2,3,5],[2,4,5],[3,4,5],[0,1,2,3],[0,1,2,4],[0,1,2,5],[0,1,3,4],[0,1,3,5],[0,1,4,5],[0,2,3,4],[0,2,3,5],[0,2,4,5],[0,3,4,5],[1,2,3,4],[1,2,3,5],[1,2,4,5],[1,3,4,5],[2,3,4,5],[0,1,2,3,4],[0,1,2,3,5],[0,1,2,4,5],[0,1,3,4,5],[0,2,3,4,5],[1,2,3,4,5],[0,1,2,3,4,5]]

function findBiggestOpeningMove(hand: Tile[]) : number {
	// assumes all pieces in hand are not null
	var biggestMoveLength = 0
	possibleOpeningMoves.forEach(move => {
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

export const Qwirkle : Game<QwirkleState>= {
  setup: ({ ctx }) : QwirkleState => {
    const colors = ["red", "orange", "yellow", "green", "blue", "purple"];
    const shapes = ["circle", "square", "diamond", "star", "flower", "heart"];
  
    var bag = Array(108)
      var bagIndex = 107
    for (var i = 0; i < colors.length; i++) {
      for (var j = 0; j < shapes.length; j++) {
        for (var k = 0; k < 3; k++) {
          var piece = {
            color: colors[i],
            shape: shapes[j]
          };
          bag[18*i + 3*j + k] = piece;
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
      }
      scores[String(i)] = 0
    }
  
    var cells = Array(11).fill(Array(11).fill(null))
  
    return {secret: {bag}, bagIndex, players, cells, scores}
  },
  moves: {
    // placeholder move as I work through tutorial
    placeTile: ({ G }, i, j, piece) => {
      G.cells[i][j] = piece;
    },
  },
  phases: {
	game: {
	  start: true,
	  onBegin: ({ G }) => {
		fillAllHands(G)
	  },
	},
  },
  turn: {
	order: {
	  first: ({ G, ctx }) => findOpener(G, ctx),
	  next: ({ ctx }) => (ctx.playOrderPos + 1) % ctx.numPlayers,
	  playOrder: ({ ctx }) => [...Array(ctx.numPlayers).keys()].map(k => String(k)),
	}
  }
};
