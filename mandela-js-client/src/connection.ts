import { Channel } from "./channel";
import { messageOnWebsocket } from "./messageOnWebsocket";
import { Subscription } from "./subscription";
import { SubStore } from "./subStore";

const CONNECTION_TIMEOUT = 2000;

function setEventHandlers(conn: Connection) {
  conn.ws.addEventListener("open", () => {
    conn.onOpen();
  });

  conn.ws.addEventListener("message", (event) => {
    messageOnWebsocket(event.data, conn);
  });

  conn.ws.addEventListener("error", (event) => {
    console.error("WebSocket error: ", event);
  });

  conn.ws.addEventListener("close", (_event) => {
    console.log("Connection closed");
    conn.onClose();
  });
}

function setConnectionTimeout(conn: Connection) {
  return setTimeout(() => {
    if (!conn.isConnected()) {
      conn.onConnectionTimeout();
    }
  }, CONNECTION_TIMEOUT);
}

export class Connection {
  ws: WebSocket;
  url: string;
  subStore: SubStore;
  lastPingAt: Date;
  resolveFn: Function;
  rejectFn: Function;

  static build(url: string): Promise<Connection> {
    return new Promise((resolve, reject) => {
      let ws = new WebSocket(url);
      let conn = new Connection(ws, url);
      conn.subStore = new SubStore();
      conn.resolveFn = resolve;
      conn.rejectFn = reject;

      setEventHandlers(conn);
      setConnectionTimeout(conn);
      return conn;
    });
  }

  static async reconnect(oldConn: Connection) {
    console.log("Reconnecting: ", oldConn);
    oldConn.close();

    const conn = await Connection.build(oldConn.url);
    conn.resubscribeAll(oldConn.allSubs());
    return conn;
  }

  constructor(ws: WebSocket, url: string) {
    this.ws = ws;
    this.url = url;
  }

  onOpen() {
    this.resolveFn(this);
  }

  onConnectionTimeout() {
    console.log("Connection timed out. closing");
    this.close();
    this.rejectFn("Websocket connection timed out");
  }

  isConnected() {
    return this.ws.readyState === 1;
  }

  addSub(sub: Subscription) {
    return this.subStore.add(sub);
  }

  removeSub(sub: Subscription) {
    this.subStore.remove(sub);
    this.closeIfLonely();
  }

  findSub(channel: Channel) {
    return this.subStore.get(channel);
  }

  allSubs() {
    return this.subStore.all();
  }

  resubscribeAll(oldSubs) {
    const thisConn = this;
    oldSubs.forEach((sub: Subscription) => {
      Subscription.resubscribe(sub, thisConn);
    });
  }

  closeIfLonely() {
    if (this.subStore.isEmpty()) {
      this.close();
    }
  }

  isEmpty() {
    return this.subStore.isEmpty();
  }

  onPing() {
    this.lastPingAt = new Date();
  }

  close() {
    this.ws.close();
  }

  onClose() {
    // If it has been closed externally, don't clear the timer
  }

  send(data: object) {
    this.ws.send(JSON.stringify(data));
  }
}
