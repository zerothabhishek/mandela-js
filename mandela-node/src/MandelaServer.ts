import { IncomingMessage } from "http";
import internal from "stream";
import { WebSocketServer, WebSocket } from "ws";
import { ChannelConfigType } from "./ChannelConfig";
import { ChannelConfigRegistry } from "./ChannelConfigRegistry";
import { Connection } from "./Connection";
import { NodeServerType } from "./types";
import { parse } from "url";

export default class MandelaServer {
  wss: WebSocketServer;
  nodeServer: any;
  authenticateWith?: Function;
  channelCfgRegistry?: ChannelConfigRegistry;

  constructor(
    nodeServer: NodeServerType,
    channels: ChannelConfigType[],
    authenticateWith?: Function
  ) {
    this.nodeServer = nodeServer;
    this.authenticateWith = authenticateWith;

    // this.registerChannels(channels);
    this.wss = new WebSocketServer({ noServer: true });
  }

  listen() {
    this.setupUpgradeHandler();
    this.setupConnectHandler();
  }

  setupUpgradeHandler() {
    this.nodeServer.on(
      "upgrade",
      (request: IncomingMessage, socket: internal.Duplex, head: Buffer) => {
        console.log("Upgrade request");
        const { pathname } = parse(request.url as string);

        if (pathname === "/_mandela") {
          this.wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
            this.wss.emit("connection", ws, request);
          });
        }
      }
    );
  }

  setupConnectHandler() {
    this.wss.on(
      "connection",
      async (ws: WebSocket, request: IncomingMessage) => {
        console.log("Connection request");
        Connection.onConnect(ws, request);
      }
    );
  }

  // registerChannels(channelCfgs: ChannelConfigType[]) {}
}
