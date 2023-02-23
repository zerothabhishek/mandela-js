import * as Mandela from "./Mandela";
import { ChannelActions, ChannelConfigType } from "./ChannelConfig";

export class Channel {
  label: string;
  id: string;
  channelConfig: ChannelConfigType;

  constructor(label: string, id: string | number) {
    this.id = id + "";
    this.label = label;
    this.channelConfig = Mandela.getChannelConfig(label);
  }

  static find(label: string, id: string | number): Channel | null {
    const ch = new Channel(label, id);
    if (!ch.channelConfig) return null;
    return ch;
  }

  key() {
    return `${this.label}-${this.id}`;
  }

  // TODO: fix the type of args
  async execute(action: ChannelActions, args: Record<string, any>) {
    const fn = this.channelConfig[action];
    if (!fn) {
      throw `Action ${action} not defined on channel ${this.label}`;
    }
    return await fn(args);
  }
}
