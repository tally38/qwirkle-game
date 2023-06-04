import React, { useEffect, useState } from 'react';
import { State } from 'boardgame.io';
import { Client as PlainJSClient } from 'boardgame.io/client';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { MCTSBot, Step } from 'boardgame.io/ai';
import { Qwirkle } from './Game';
import { QwirkleBoard } from './Board';

const LocalApp = Client({
  game: Qwirkle,
  board: QwirkleBoard,
  debug: true,
  // Use Local transport for communication with bots.
  multiplayer: Local(),
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
  const [state, setState] = useState<State | null>(null)
  
  const { iterations, playoutDepth } = difficulties[difficulty];
  const [bot, setBot] = useState<MCTSBot>(new MCTSBot({
    game: Qwirkle,
    enumerate: Qwirkle.ai!.enumerate,
    iterations,
    playoutDepth,
  }))

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

  useEffect(() => {
    const { iterations, playoutDepth } = difficulties[difficulty];
    setBot(new MCTSBot({
      game: Qwirkle,
      enumerate: Qwirkle.ai!.enumerate,
      iterations,
      playoutDepth,
    }))
  }, [difficulty]);

  useEffect(() => {
    if (!client) return;
    client.subscribe((state: State) => {
      setState(state)
    });
  }, [client, difficulty]);

  useEffect(() => {
    if (state && state.ctx.currentPlayer === playerID) {
      Step(client, bot)
    }
  }, [state, bot, client, playerID]);


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

const AiApp = () => {
  return (
    <div>
      <LocalApp playerID="0" matchID="advanced-ai" />
      <BotControls playerID="1" matchID="advanced-ai" />
    </div>
  );
};

export default AiApp;