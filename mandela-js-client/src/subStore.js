export class SubStore {
  data;

  constructor() {
    this.data = {};
  }

  add(sub) {
    this.data[sub.channel.key()] = sub;
  }

  remove(sub) {
    this.data[sub.channel.key()] = undefined;
  }

  get(channel) {
    return this.data[channel.key()];
  }

  isEmpty() {
    return Object.keys(this.data).length === 0;
  }

  all() {
    return Object.values(this.data);
  }
}
