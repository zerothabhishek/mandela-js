const SUB_TIMEOUT = 4000;

function setSubTimeout(sub) {
  return setTimeout(() => {
    if (sub.isPending()) {
      sub.rejectFn("Subscription timed out");
    }
  }, SUB_TIMEOUT);
}

export class Subscription {
  channel;
  connection;
  status; // null, pending, active, closed
  resolveFn;
  rejectFn;
  onMessageFn;

  static async subscribe(channel, connection, { onMessage }) {
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

  static async resubscibe(sub, newConn) {
    return await Subscription.subscribe(sub.channel, newConn, {
      onMessage: sub.onMessageFn,
    });
  }

  constructor(channel, connection, status) {
    this.channel = channel;
    this.connection = connection;
    this.status = status;
  }

  get channelMeta() {
    return { ch: this.channel.label, id: this.channel.id };
  }

  isPending() {
    this.status === "pending";
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

  onMessage(data) {
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

  sendMsg(str) {
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
