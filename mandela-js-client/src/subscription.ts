import { Channel } from "./channel";
import { Connection } from "./connection";
import { MandelaData } from "./types";

const SUB_TIMEOUT = 4000;

function setSubTimeout(sub: Subscription) {
  return setTimeout(() => {
    if (sub.isPending()) {
      sub.rejectFn("Subscription timed out");
    }
  }, SUB_TIMEOUT);
}

type SubscriptionStatus = null | "pending" | "active" | "closed";

export class Subscription {
  channel: Channel;
  connection: Connection;
  status: SubscriptionStatus;
  resolveFn: Function;
  rejectFn: Function;
  onMessageFn: Function;

  static async subscribe(
    channel: Channel,
    connection: Connection,
    { onMessage }: { onMessage: Function }
  ) {
    return new Promise((resolve, reject) => {
      const sub = new Subscription(channel, connection, "pending");
      sub.resolveFn = resolve;
      sub.rejectFn = reject;
      sub.onMessageFn = onMessage;

      connection.addSub(sub);
      sub.requestSub();
      setSubTimeout(sub);

      return sub;
    });
  }

  static async resubscribe(sub: Subscription, newConn: Connection) {
    return await Subscription.subscribe(sub.channel, newConn, {
      onMessage: sub.onMessageFn,
    });
  }

  constructor(
    channel: Channel,
    connection: Connection,
    status: SubscriptionStatus
  ) {
    this.channel = channel;
    this.connection = connection;
    this.status = status;
  }

  get channelMeta() {
    return { ch: this.channel.label, id: this.channel.id };
  }

  isPending(): boolean {
    return this.status === "pending";
  }

  requestSub() {
    const meta = { ...this.channelMeta, t: "req" };
    const subRequest = { m: meta, d: "sub" };
    this.connection.send(subRequest);
  }

  onSubscribe() {
    this.status = "active";
    this.resolveFn(this);
  }

  onMessage(data: MandelaData) {
    console.log("[Subscription onMessage]", data);
    this.onMessageFn(data.d, data);
  }

  // TODO: return a promise here that resolves when unsub is confirmed from server side
  requestUnSub() {
    const unSubRequest = {
      m: { ...this.channelMeta, t: "req" },
      d: "unsub",
    };
    this.connection.send(unSubRequest);
  }

  onUnSubscribe() {
    this.status = "closed";
    this.connection.removeSub(this);
  }

  sendMsg(str: string) {
    const payload = {
      m: { ...this.channelMeta, t: "data" },
      d: str,
    };
    this.connection.send(payload);
  }

  onAuthorizationFail() {
    console.error("Subscription unauthorized");
    this.connection.removeSub(this);
  }
}
