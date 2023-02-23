'use strict';

import express from 'express';
import { createServer } from 'http';
// import Mandela from 'mandela-js';
import { MandelaSetup } from './node_modules/mandela-node/dist/index.js';
import { CollabChannel, isPasscodeValid } from './src/CollabChannel.js';

const app = express();
app.use(express.static("public"))

const server = createServer(app);

// Mandela.setup({ authenticateWith: isPasscodeValid })
// Mandela.registerChannel(CollabChannel)
// Mandela.listenWith(server)

// server.listen(9090, function () {
//   console.log('Listening on http://localhost:9090');
// });

console.log("Starting Mandelasetup")
MandelaSetup({ 
  authenticateWith: isPasscodeValid,
  channelConfigs: [CollabChannel],
  server: server,
})

server.listen(9090, () => {
  console.log("Starting server on 9090")
})
