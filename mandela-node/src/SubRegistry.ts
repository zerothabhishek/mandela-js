import { Subscription } from "./Subscription";

type SubRegistryDataType = { [key: string]: Subscription[] };

export class SubRegistry {
  data: SubRegistryDataType = {};

  get(key: string) {
    return this.data[key] || [];
  }

  set(key: string, values: Subscription[]) {
    this.data[key] = values;
  }

  add(sub: Subscription) {
    const key = sub.key();
    let values = this.get(key);
    values.push(sub);
    this.set(key, values);
  }

  remove(sub: Subscription) {
    const key = sub.key();
    let values = this.get(key);
    values = values.filter((val: Subscription) => val != sub);
    this.set(key, values);
  }
}
