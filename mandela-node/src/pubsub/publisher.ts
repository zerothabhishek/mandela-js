import { createClient, RedisClientType } from "redis";
import { PubSubChannel } from "./index";

export default class PubSubPublisher {
  redisclient: RedisClientType;

  constructor() {
    this.redisclient = createClient();
    this.redisclient.connect();
  }

  publish(data: string) {
    console.log("[PubSubPublisher publish]", data);

    this.redisclient.publish(PubSubChannel, data);
  }
}
