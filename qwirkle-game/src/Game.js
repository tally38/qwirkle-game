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
	for (i = 0 ; i < ctx.numPlayers ; i++) {
		players[i] = {
			score: 0,
			hand: [],
		}
	}

	var board = Array(11).fill(Array(11).fill(null))

	return {bag, bagIndex, players, board}
}

export const Qwirkle = {
  setup: setup,
  moves: {
    // placeholder move as I work through tutorial
    clickCell: ({ G, playerID }, i, j) => {
      G.board[i][j] = playerID;
    },
  },
};
