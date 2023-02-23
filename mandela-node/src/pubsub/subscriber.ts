import { createClient, RedisClientType } from "redis";
import { InformFunctionType } from "../types";
import { PubSubChannel } from "./index";

export default class PubSubSubscriber {
  redisClient: RedisClientType;

  constructor() {
    this.redisClient = createClient();
    this.redisClient.connect();
  }

  subscribe(handler: InformFunctionType) {
    this.redisClient.subscribe(PubSubChannel, (incomingData: string) => {
      console.log("[PubSubSubscriber subscribe] incomingdata", incomingData);

      handler(incomingData);
    });
  }
}
