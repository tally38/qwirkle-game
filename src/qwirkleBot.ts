import { AiEnumerate, Ctx, Game, PlayerID } from 'boardgame.io';
import { MCTSBot } from 'boardgame.io/ai';

export function createQwirkleBot({game, enumerate, seed}: {game: Game, enumerate: (G: any, ctx: Ctx, playerID: string) => AiEnumerate, seed?: string | number}) {
  return new MCTSBot({
    game,
    enumerate,
    seed,
    iterations: 5,
    playoutDepth: 5,
  })
};