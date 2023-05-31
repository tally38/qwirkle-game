import React, { useEffect, useState } from 'react';
import { Client as PlainJSClient } from 'boardgame.io/client';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { MCTSBot, Step } from 'boardgame.io/ai';
import { Qwirkle } from './Game';
import { QwirkleBoard } from './Board';

const AiApp = Client({
  game: Qwirkle,
  board: QwirkleBoard,
  debug: true,
  // Use Local transport for communication with bots.
  multiplayer: Local(),
});

const SoloApp = Client({
    game: Qwirkle,
    board: QwirkleBoard,
    debug: true,
    multiplayer: undefined,
  });
  

/**
 * Component that controls and runs a custom bot instance.
 */
interface BotControlsProps {
    playerID: string,
    matchID: string
}

const difficulties = {
    easy: {
      iterations: 1,
      playoutDepth: 1,
    },
    hard: {
      iterations: 1000,
      playoutDepth: 50,
    },
  };

const BotControls = (props : BotControlsProps) => {
  var {playerID, matchID} = props
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy');
  const [client, setClient] = useState<any>();

  // Create a plain Javascript boardgame.io client on mount.
  useEffect(() => {
    const newClient = PlainJSClient({
      game: Qwirkle,
      debug: false,
      multiplayer: Local(),
      matchID,
      playerID,
    });
    newClient.start();
    setClient(newClient);
    // Clean up client on unmount.
    return () => newClient.stop();
  }, [matchID, playerID]);

  // Update the client subscription when bot difficulty changes.
  useEffect(() => {
    if (!client) return;
    // Subscribe to the client with a function that will run AI on a bot
    // player’s turn.
    return client.subscribe((state: any) => {
      if (!state) return;
      console.log(state)
      if (state.ctx.currentPlayer === playerID) {
        const { iterations, playoutDepth } = difficulties[difficulty];
        const bot = new MCTSBot({
          game: Qwirkle,
          enumerate: Qwirkle.ai!.enumerate,
          iterations,
          playoutDepth,
        });
        setTimeout(() => Step(client, bot), 0);
      }
    });
  }, [client, difficulty, playerID]);

  // Render AI difficulty toggle buttons.
  return (
    <p>
      AI Difficulty:{' '}
      <button
        onClick={() => setDifficulty('easy')}
        disabled={difficulty === 'easy'}
      >
        Easy
      </button>
      <button
        onClick={() => setDifficulty('hard')}
        disabled={difficulty === 'hard'}
      >
        Hard
      </button>
    </p>
  );
};

const AdvancedAI = () => {
  const [playAgainstAI, setPlayAgainstAI] = useState<boolean>(true);
  return (
    <div>
      <h1>Qwirkle</h1>
      {playAgainstAI ? <AiApp playerID="0" matchID="advanced-ai" /> : <SoloApp />}
      <button
        onClick={() => setPlayAgainstAI(!playAgainstAI)}
      >
        Play Against AI
        {playAgainstAI ? ' (on)' : ' (off)'}
      </button>
      {playAgainstAI ? <BotControls playerID="1" matchID="advanced-ai" /> : null}
    </div>
  );
};

export default AdvancedAI;