import { BaseChannelConfig, ChannelConfigType } from "./ChannelConfig";

export class ChannelConfigRegistry {
  data: { [key: string]: ChannelConfigType };

  constructor() {
    this.data = {};
  }

  static setup(channelCfgs: ChannelConfigType[]) {
    const chr = new ChannelConfigRegistry();
    chr.addMultiple(channelCfgs);
    return chr;
  }

  add(channelCfg: ChannelConfigType) {
    if (!channelCfg.label) throw "ChannelConfig label can't be null/undefined";

    this.data[channelCfg.label] = channelCfg;
  }

  addMultiple(channelCfgs: ChannelConfigType[]) {
    for (let index = 0; index < channelCfgs.length; index++) {
      const givenCfg = channelCfgs[index];

      // TODO: move this step to ChannelConfig file
      const finalCfg = { ...BaseChannelConfig, ...givenCfg };

      this.add(finalCfg);
    }
  }

  get(label: string) {
    return this.data[label];
  }
}
