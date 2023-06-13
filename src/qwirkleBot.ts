import { AiEnumerate, Ctx, Game, PlayerID } from 'boardgame.io';
import { MCTSBot } from 'boardgame.io/ai';
import { QwirkleState } from './Game';

// copied from boardgame.io/src/ai/mcts-bot.ts
interface Objective {
  checker: (G: QwirkleState, ctx: Ctx) => boolean;
  weight: number;
}
type Objectives = Record<string, Objective>;

const MAX_TURN_SCORE = 25

export function createQwirkleBot({game, enumerate, seed}: {game: Game, enumerate: (G: any, ctx: Ctx, playerID: string) => AiEnumerate, seed?: string | number}) {

  function getObjectives(G: QwirkleState, ctx: Ctx, playerID: PlayerID | undefined) : Objectives {
    let objectives : Objectives = {}
    if (!playerID) {
      return objectives
    }
    for (let i = 1; i <= MAX_TURN_SCORE ; i++) {
      objectives["scorePoints-" + i] = {
        checker: (G) => {
          return G.scores[playerID] - G.previousScores[playerID] === i
        },
        weight: i/MAX_TURN_SCORE
      }
    }
    objectives['scoredLotsOfPoints'] = {
      checker: (G) => {
        return G.scores[playerID] - G.previousScores[playerID] > MAX_TURN_SCORE
      },
      weight: 1
    }
    objectives['placedTile'] = {
      checker: (G, ctx) => {
        return ctx.currentPlayer === playerID && !!G.turnPositions.length
      },
      weight: .04
    }
    return objectives
  }

  return new MCTSBot({
    game,
    enumerate,
    seed,
    iterations: 200,
    playoutDepth: 6,
    objectives: getObjectives
  })
};