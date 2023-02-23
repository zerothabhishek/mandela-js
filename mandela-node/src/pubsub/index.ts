import PubSubPublisher from "./publisher";
import PubSubSubscriber from "./subscriber";
import { InformFunctionType } from "../types";

export const PubSubChannel = "__mandela-pubsub";

export function setupPubSub(informFn: InformFunctionType) {
  const publisher = new PubSubPublisher();
  const subscriber = new PubSubSubscriber();

  subscriber.subscribe(informFn);

  return { publisher, subscriber };
}

export class PubSubBackend {
  publisher: PubSubPublisher;
  subscriber: PubSubSubscriber;

  constructor() {
    this.publisher = new PubSubPublisher();
    this.subscriber = new PubSubSubscriber();
  }

  static setup(informFn: InformFunctionType) {
    const psb = new PubSubBackend();

    psb.subscriber.subscribe(informFn);

    return psb;
  }

  publish(data: string) {
    this.publisher.publish(data);
  }
}
