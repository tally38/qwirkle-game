import { AiEnumerate, Ctx, Game, PlayerID } from 'boardgame.io';
import { MCTSBot } from 'boardgame.io/ai';


export class MyBot extends MCTSBot {

  constructor({
    enumerate,
    seed,
    objectives,
    game,
    iterations,
    playoutDepth,
  }: {
    enumerate?: (G: any, ctx: Ctx, playerID: string) => AiEnumerate;
    seed?: string | number;
    game: Game;
    objectives?: (G: any, ctx: Ctx, playerID?: PlayerID) => any;
    iterations?: number | ((G: any, ctx: Ctx, playerID?: PlayerID) => number);
    playoutDepth?: number | ((G: any, ctx: Ctx, playerID?: PlayerID) => number);
  }) {
    super({ enumerate, seed, game, objectives, iterations, playoutDepth });
    
    this.addOpt({
      key: 'iterations',
      initial: typeof iterations === 'number' ? iterations : 5,
      range: { min: 1, max: 2000 },
    });

    this.addOpt({
      key: 'playoutDepth',
      initial: typeof playoutDepth === 'number' ? playoutDepth : 5,
      range: { min: 1, max: 100 },
    });
  }
};