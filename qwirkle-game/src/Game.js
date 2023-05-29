function shuffle(array, lastIndex) {
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

function drawPiece(G) {
	var piece = G.secret.bag[G.bagIndex]
	G.secret.bag[G.bagIndex] = null
	G.bagIndex--
	return piece
}

function fillHand(G, playerId) {
	var playerHand = G.players[playerId].hand
	for (var i = 0 ; i < playerHand.length ; i++ ) {
		if ( playerHand[i] == null ) {
			playerHand[i] = drawPiece(G)
		}
	}
}

function fillAllHands(G) {
	for (let playerId in G.players) {
		fillHand(G, playerId)
	}
}

function piecesAreCompatible(pieces) {
	if (pieces.length === 1) {
		return true
	}
	var colors = new Set()
	var shapes = new Set()

	pieces.forEach(piece => {
		colors.add(piece.color)
		shapes.add(piece.shape)
	})

	if (colors.size === pieces.length ) {
		if (shapes.size === 1) {
			return true
		}
	}

	if (shapes.size === pieces.length) {
		if (colors.size === 1) {
			return true
		}
	}

	return false
}


const possibleOpeningMoves = [[],[0],[1],[2],[3],[4],[5],[0,1],[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5],[2,3],[2,4],[2,5],[3,4],[3,5],[4,5],[0,1,2],[0,1,3],[0,1,4],[0,1,5],[0,2,3],[0,2,4],[0,2,5],[0,3,4],[0,3,5],[0,4,5],[1,2,3],[1,2,4],[1,2,5],[1,3,4],[1,3,5],[1,4,5],[2,3,4],[2,3,5],[2,4,5],[3,4,5],[0,1,2,3],[0,1,2,4],[0,1,2,5],[0,1,3,4],[0,1,3,5],[0,1,4,5],[0,2,3,4],[0,2,3,5],[0,2,4,5],[0,3,4,5],[1,2,3,4],[1,2,3,5],[1,2,4,5],[1,3,4,5],[2,3,4,5],[0,1,2,3,4],[0,1,2,3,5],[0,1,2,4,5],[0,1,3,4,5],[0,2,3,4,5],[1,2,3,4,5],[0,1,2,3,4,5]]

function findBiggestOpeningMove(hand) {
	// assumes all pieces in hand are not null
	var biggestMoveLength = 0
	possibleOpeningMoves.forEach(move => {
		var selectedPieces = move.map(i => hand[i])
		if (piecesAreCompatible(selectedPieces)) {
			if (move.length > biggestMoveLength) {
				biggestMoveLength = move.length
			}
		}
	})
	return biggestMoveLength
}

function findOpener(G, ctx) {
	var overallBiggestMove = 0
	var playerBiggestMove
	var possibleOpeners = []
	for (let i = 0 ; i < ctx.numPlayers ; i ++) {
		playerBiggestMove = findBiggestOpeningMove(G.players[String(i)].hand)
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



function setup({ ctx }) {
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

	var players = {}
	var scores = {}
	for (i = 0 ; i < ctx.numPlayers ; i++) {
		players[String(i)] = {
			hand: Array(6).fill(null),
		}
		scores[String(i)] = 0
	}

	var board = Array(11).fill(Array(11).fill(null))

	return {secret: {bag}, bagIndex, players, board, scores}
}

export const Qwirkle = {
  setup: setup,
  moves: {
    // placeholder move as I work through tutorial
    placePiece: ({ G }, i, j, piece) => {
      G.board[i][j] = piece;
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
