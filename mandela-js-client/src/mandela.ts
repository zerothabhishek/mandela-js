import { Connection } from "./connection";
import { Subscription } from "./subscription";
import { Channel } from "./channel";
import ConnectionWatcher from "./ConnectionWatcher";
import { SubscribeParams, UnSubscribeParams } from "./types";

let MandelaConnection: Connection | null = null;

async function connect(url: string) {
  if (MandelaConnection) {
    return MandelaConnection;
  }

  MandelaConnection = await Connection.build(url);

  ConnectionWatcher.watch(MandelaConnection);
  return MandelaConnection;
}

export async function subscribe({ url, ch, id, onMessage }: SubscribeParams) {
  const channel = new Channel(ch, id);
  const conn = await connect(url);
  window.MC = MandelaConnection as Connection;

  return await Subscription.subscribe(channel, conn, { onMessage });
}

export function unSubscribe({ sub, onUnSubscribe }: UnSubscribeParams) {
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
