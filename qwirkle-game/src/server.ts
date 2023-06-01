import { Server, Origins } from 'boardgame.io/server'
import { Qwirkle } from './Game';
import path from 'path';
import serve from 'koa-static';

const server = Server({
  // Provide the definitions for your game(s).
  games: [Qwirkle],

  // origins: [
  //   // Allow your game site to connect.
  //   'https://www.mygame.domain',
  //   // Allow localhost to connect, except when NODE_ENV is 'production'.
  //   Origins.LOCALHOST_IN_DEVELOPMENT
  // ],
});

const PORT = 8000 // process.env.PORT || 8000;

// Build path relative to the server.js file
const frontEndAppBuildPath = path.resolve(__dirname, '../build');
server.app.use(serve(frontEndAppBuildPath))

server.run(8000, () => {
  server.app.use(
    async (ctx, next) => await serve(frontEndAppBuildPath)(
      Object.assign(ctx, { path: 'index.html' }),
      next
    )
  )
});