import { messageOnWebsocket } from "./messageOnWebsocket.js";
import { SubStore } from "./subStore.js";

const CONNECTION_TIMEOUT = 2000;

function setEventHandlers(conn) {
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

function setConnectionTimeout(conn) {
  return setTimeout(() => {
    if (!conn.isConnected()) {
      conn.onConnectionTimeout();
    }
  }, CONNECTION_TIMEOUT);
}

export class Connection {
  ws;
  url;
  subStore;
  lastPingAt;
  resolveFn;
  rejectFn;

  static build(url) {
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

  static async reconnect(oldConn) {
    console.log("Reconnecting: ", oldConn);
    oldConn.close();

    const conn = await Connection.build(oldConn.url);
    conn.resubscribeAll(oldConn.allSubs());
    return conn;
  }

  constructor(ws, url) {
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

  addSub(sub) {
    return this.subStore.add(sub);
  }

  removeSub(sub) {
    this.subStore.remove(sub);
    this.closeIfLonely();
  }

  findSub(channel) {
    return this.subStore.get(channel);
  }

  allSubs() {
    return this.subStore.all();
  }

  resubscribeAll(oldSubs) {
    const thisConn = this;
    oldSubs.forEach((sub) => {
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

  send(data) {
    this.ws.send(JSON.stringify(data));
  }
}
