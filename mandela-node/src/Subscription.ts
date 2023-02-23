import { randomInt } from "crypto";
import { Channel } from "./Channel";
import { Connection } from "./Connection";
import * as Mandela from "./Mandela";
import { MandelaData } from "./types";

type ValidAnswers = "subscription-done" | "unsubscribe-done" | "unauthorized";
type ValidBroadcastInfos = "subscription-done" | "unsubscribe-done";

export class Subscription {
  channel: Channel;
  connection: Connection;
  id: string;

  constructor(channel: Channel, connection: Connection) {
    this.channel = channel;
    this.connection = connection;
    this.id = this.generateId();
  }

  get answerMeta() {
    return { t: "ans", ch: this.channel.label, id: this.channel.id };
  }

  get infoMeta() {
    return {
      t: "info",
      ch: this.channel.label,
      id: this.channel.id,
      sub: this.id,
    };
  }

  static async subscribe(channel: Channel, connection: Connection) {
    // construct
    // authorize
    // add to registery
    // send answer
    // broadcast

    const sub = new Subscription(channel, connection);

    const authz = await sub.authorize();
    if (!authz) return;

    Mandela.registerSub(sub);
    sub.publishAnswer("subscription-done");
    sub.broadcastInfo("subscription-done");

    return sub;
  }

  static async unsubscribe(channel: Channel, connection: Connection) {
    const subs = Mandela.findSubs(channel.label);
    const sub = subs.find((subX) => subX.connection.id == connection.id);
    if (!sub) return;

    Mandela.deRegisterSub(sub);

    sub.publishAnswer("unsubscribe-done");
    sub.broadcastInfo("unsubscribe-done");

    return "ok";
  }

  async authorize() {
    const result = await this.channel.execute("authorize", { sub: this });
    if (!result) {
      console.error("[Subscription.subscribe]: Sub request unauthorized");
      await this.publishAnswer("unauthorized");
    }
    return result;
  }

  generateId() {
    return "s-" + randomInt(100, 1000000).toString(); // less than a million, more than 100
  }

  key() {
    return this.channel.key();
  }

  async publishAnswer(msg: ValidAnswers) {
    await this.publish({ m: this.answerMeta, d: msg });
  }

  async publish(obj: MandelaData) {
    this.connection.publish(obj);
  }

  broadcastInfo(msg: ValidBroadcastInfos) {
    Mandela.broadcastOnPubSub({ m: this.infoMeta, d: msg });
  }
}
