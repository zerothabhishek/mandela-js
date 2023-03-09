import { Channel } from "./channel";
import { Subscription } from "./subscription";

export class SubStore {
  data: Record<string, Subscription | undefined>;

  constructor() {
    this.data = {};
  }

  add(sub: Subscription) {
    this.data[sub.channel.key()] = sub;
  }

  remove(sub: Subscription) {
    this.data[sub.channel.key()] = undefined;
  }

  get(channel: Channel) {
    return this.data[channel.key()];
  }

  isEmpty() {
    return Object.keys(this.data).length === 0;
  }

  all() {
    return Object.values(this.data);
  }
}
