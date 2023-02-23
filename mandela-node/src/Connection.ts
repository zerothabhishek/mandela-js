import { randomInt, randomUUID } from "crypto";
import * as Mandela from "./Mandela";
import WebSocket from "ws";
import { Subscription } from "./Subscription";
import { Channel } from "./Channel";
import { ConnectionRequestType, MandelaData } from "./types";

const PING_INTERVAL = 2000; // 2 seconds

// TODO: move these to types.ts file
enum MandelaMessageType {
  REQ = "req",
  DATA = "data",
}
enum MandelaWsRequest {
  SUB = "sub",
  UNSUB = "unsub",
  HERE_NOW = "here_now",
}

function findChannel(msgObj: MandelaData): Channel | null {
  const meta = msgObj.m
  const channelLabel = meta?.ch;
  const channelId = meta?.id;

  if (!channelLabel || !channelId) return null;

  return Channel.find(channelLabel, channelId);
}

function handleDataOnSub(msgObj: MandelaData, connection: Connection) {
  // find channel
  // Forward the msg to the channel
  const channel = findChannel(msgObj);
  if (!channel) {
    console.error("[Connection processMessage] Channel not found", msgObj);
    return;
  }
  channel.execute("onMessage", { data: msgObj, connection });
}

function handleSub(msgObj: MandelaData, connection: Connection) {
  const channel = findChannel(msgObj);
  if (!channel) {
    console.error("[Connection processMessage] Channel not found", msgObj);
    return;
  }
  Subscription.subscribe(channel, connection);
}

function handleUnSub(msgObj: MandelaData, connection: Connection) {
  const channel = findChannel(msgObj);
  if (!channel) {
    console.error("[Connection processMessage] Channel not found", msgObj);
    return;
  }
  Subscription.unsubscribe(channel, connection);
}

function processMessage(msg: string, connection: Connection) {
  const msgObj = JSON.parse(msg);
  const meta = msgObj.m ?? msgObj.meta;
  const data = msgObj.d ?? msgObj.data;

  const msgType = meta.t;
  if (msgType === MandelaMessageType.DATA) {
    handleDataOnSub(msgObj, connection);
    return;
  }

  if (msgType === MandelaMessageType.REQ) {
    switch (data) {
      case MandelaWsRequest.SUB:
        handleSub(msgObj, connection);
        break;

      case MandelaWsRequest.UNSUB:
        handleUnSub(msgObj, connection);
        break;

      case MandelaWsRequest.HERE_NOW:
        // handle here-now
        // TODO
        break;

      default:
        console.error("[Connection processMessage] Can't handle that request");
        break;
    }
  }
}

export class Connection {
  ws: any; // the raw connection
  id: string;
  session!: string;
  thePing!: ReturnType<typeof setInterval>;

  constructor(ws: WebSocket) {
    this.ws = ws;
    this.id = "c-" + randomInt(100, 1000000).toString(); // less than a million, more than 100
  }

  static async onConnect(ws: WebSocket, request: ConnectionRequestType): Promise<Connection> {
    console.log("[Connection.onConnect] Incoming connection ...");

    const connection = new Connection(ws);
    connection.setupHandlers();

    const session = await Mandela.authenticate(request);
    console.log("[Connection.onConnect] auth", session);

    if (!session) {
      ws.send("Not authenticated");
      ws.close(3001, "Unauthenticated"); // TODO: Check error codes
      return connection;
    }
    connection.session = session;

    connection.setupPings();

    console.log("[Connection.onConnect] Connected.", connection.id);
    return connection;
  }

  setupHandlers() {
    // Not using the function name directly here because *this* gets reassigned
    this.ws.on("message", (data: WebSocket.RawData, isBinary: boolean) =>
      this.onMessage(data, isBinary)
    );
    this.ws.on("close", (code: string, reason: string) =>
      this.onClose(code, reason)
    );
    this.ws.on("ping", (data: string) => this.onPing(data));
    this.ws.on("pong", (data: string) => this.onPong(data));
  }

  onMessage(data: WebSocket.RawData, isBinary: boolean) {
    if (isBinary) {
      console.error("[Connection onMessage] Can't handle binary data");
      return;
    }

    try {
      const dataS = data.toString();
      console.log("[Connection onMessage] ", dataS);
      processMessage(dataS, this);
    } catch (error) {
      console.error("[Connection onMessage] Can't process the incoming data");
      console.error(error);
      return;
    }
    return "ok";
  }

  onClose(code: string, reason: string) {
    console.log(
      `[Connection: onClose] [${this.id}] Code: ${code} Reason: ${reason}`
    );
    this.cleanup();
  }

  cleanup() {
    this.stopPing();
  }

  onPing(data: string) {}
  onPong(data: string) {}

  setupPings() {
    this.thePing = setInterval(() => {
      this.sendPing();
    }, PING_INTERVAL);
  }

  stopPing() {
    clearInterval(this.thePing);
  }

  async sendPing() {
    await this.publish({ d: "ping" });
  }

  async publish(msgObj: MandelaData) {
    console.log("[Connection publish] ", msgObj);
    const msg = JSON.stringify(msgObj);
    this.ws.send(msg);
  }
}
