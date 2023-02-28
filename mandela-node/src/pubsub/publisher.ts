import { createClient, RedisClientType } from "redis";
import { PubSubChannel } from "./index";

export default class PubSubPublisher {
  redisclient: RedisClientType;

  constructor() {
    // redis[s]://[[username][:password]@][host][:port][/db-number]
    const url = process.env.REDIS_URL
    this.redisclient = createClient({ url });
    this.redisclient.connect();
  }

  publish(data: string) {
    console.log("[PubSubPublisher publish]", data);

    this.redisclient.publish(PubSubChannel, data);
  }
}
