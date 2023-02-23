import { Connection } from "./Connection";
import * as Mandela from "./Mandela";
import { Subscription } from "./Subscription";
import { MandelaData } from "./types";

export type RecurType = {
  action: Function | null;
  every: number | null;
};

export type ChannelConfigType = {
  label?: string | null;
  recur?: RecurType | null;

  afterInitialize?: Function | null;
  beforeSubscribe?: Function | null;
  beforeBroadcast?: Function | null;
  onSubscribe?: Function | null;
  onUnSubscribe?: Function | null;
  afterBroadcast?: Function | null;

  onMessage: Function | null;
  authorize: Function | null;
};

enum ExecutableActions {
  afterInitialize,
  beforeSubscribe,
  beforeBroadcast,
  onSubscribe,
  onUnSubscribe,
  afterBroadcast,
  onMessage,
  authorize,
}

// Gives us a union type of the enum elements as strings:
//  'afterInitialize' | 'beforeSubsribe' | ...
export type ChannelActions = keyof typeof ExecutableActions;

// -----------------------------------------------------------------------

export const BaseChannelConfig: ChannelConfigType = {
  label: null,
  recur: { action: null, every: 0 },

  // Lifecycle hooks: to be defined by the Channel Config
  afterInitialize: null, // To call after the channel instance is constructed
  beforeSubscribe: null, // Things to do before confirming the subscription. throw to cancel
  beforeBroadcast: null, // Things to do before broadcasting (Mandela.broadcast). throw to cancel
  onSubscribe: null, // Things to do after confirming the subscription
  onUnSubscribe: null, // Things to do after unsubscribe
  afterBroadcast: null, // Things to do after broadcast is initiated

  // Things to do when a data arrives
  // Default behavior is to broadcast the data to the channel
  // Can be overloaded by the Channel
  // data: a json object
  // The Connection object is also provided along with the data.
  // So if the Channel wants, it can just send an answer/info to the channel
  // instead of broadcasting
  onMessage: async (args: { data: MandelaData; connection: Connection }) => {
    const data = args.data;
    console.log("[Channel onMessage]", data);
    Mandela.broadcastOnPubSub(data);
  },

  authorize: async (args: { sub: Subscription }) => {
    return "ok";
  }, // override in channel config

  // ,findChannel: (connection) => {}

  // ,getUserIdForSub: null // Should be defined in the channel config
};
