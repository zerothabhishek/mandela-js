import { createClient, RedisClientType } from "redis";
import { InformFunctionType } from "../types";
import { PubSubChannel } from "./index";

export default class PubSubSubscriber {
  redisClient: RedisClientType;

  constructor() {
    // redis[s]://[[username][:password]@][host][:port][/db-number]
    const url = process.env.REDIS_URL
    this.redisClient = createClient({ url });
    this.redisClient.connect();
  }

  subscribe(handler: InformFunctionType) {
    this.redisClient.subscribe(PubSubChannel, (incomingData: string) => {
      console.log("[PubSubSubscriber subscribe] incomingdata", incomingData);

      handler(incomingData);
    });
  }
}
