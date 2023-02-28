'use strict';

import express from 'express';
import { createServer } from 'http';
import { MandelaSetup } from './node_modules/mandela-node/dist/index.js';
import { CollabChannel, isPasscodeValid } from './src/CollabChannel.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.static("public"))

const server = createServer(app);

console.log("Starting Mandelasetup")
MandelaSetup({ 
  authenticateWith: isPasscodeValid,
  channelConfigs: [CollabChannel],
  server: server,
})

server.listen(9090, () => {
  console.log("Starting server on 9090")
})
