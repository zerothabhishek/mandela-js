import { Connection } from "./connection.js";
import { Subscription } from "./subscription.js";
import { Channel } from "./channel.js";
import ConnectionWatcher from "./ConnectionWatcher";

let MandelaConnection = null;

async function connect(url) {
  if (MandelaConnection) {
    return MandelaConnection;
  }

  MandelaConnection = await Connection.build(url);

  ConnectionWatcher.watch(MandelaConnection);
  return MandelaConnection;
}

export async function subscribe(url, ch, id, { onMessage }) {
  const channel = new Channel(ch, id);
  const conn = await connect(url);
  window.MC = MandelaConnection;

  return await Subscription.subscribe(channel, conn, { onMessage });
}

export function unSubscribe(sub, { onUnSubscribe }) {
  if (sub.connection.isEmpty()) {
    ConnectionWatcher.unwatch(sub.connection);
  }
  sub.requestUnSub();
  onUnSubscribe();
}

export function debug() {
  return {
    Connection,
    Subscription,
    Channel,
  };
}
