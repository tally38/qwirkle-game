import { Client } from 'boardgame.io/react';
import { Qwirkle } from './Game';
import { QwirkleBoard} from './Board';

const App = Client({ game: Qwirkle, board: QwirkleBoard });

export default App
