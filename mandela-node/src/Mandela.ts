import { ChannelConfigType } from "./ChannelConfig";
import { ChannelConfigRegistry } from "./ChannelConfigRegistry";
import inform from "./inform";
import MandelaServer from "./MandelaServer";
import { PubSubBackend, setupPubSub } from "./pubsub";
import { SubRegistry } from "./SubRegistry";
import { Subscription } from "./Subscription";
import { ConnectionRequestType, SetupProps } from "./types";

// -- Global-ish data structures ------------------------------------

let mServer: MandelaServer;
let channelCfgRegistry: ChannelConfigRegistry;
let pubSub: PubSubBackend;
let subRegistry: SubRegistry;

// -- Pub Sub Backend  -----------------------------------------

export function setupPubSubBackend() {
  pubSub = PubSubBackend.setup(inform);
  return pubSub;
}

export function broadcastOnPubSub(obj: any) { // any serializable object
  const data = JSON.stringify(obj);
  pubSub.publish(data);
}

// -- Subscriber registry  -----------------------------------------

export function setupSubRegistry() {
  subRegistry = new SubRegistry();
  return subRegistry;
}

export function registerSub(sub: Subscription) {
  subRegistry.add(sub);
}

export function deRegisterSub(sub: Subscription) {
  subRegistry.remove(sub);
}

export function findSubs(key: string): Subscription[] {
  return subRegistry.get(key);
}

export function inspectRegistry() {
  console.debug(subRegistry);
}

// -- Channel-config registry --------------------------------------

export function setupChannelRegistry(channelCfgs: ChannelConfigType[]) {
  channelCfgRegistry = ChannelConfigRegistry.setup(channelCfgs);
  return channelCfgRegistry;
}

export function getChannelConfig(label: string) {
  return channelCfgRegistry?.get(label);
}

// -- Debug --------------------------------------------------------

export function debug() {
  return {
    pubSub,
    channelCfgRegistry,
    subRegistry,
    mServer,
  };
}

// -- Mandela Server -----------------------------------------------

export function setupServer(props: SetupProps) {
  mServer = new MandelaServer(
    props.server,
    props.channelConfigs,
    props.authenticateWith
  );
  mServer.listen();
}

// TODO: move to MandelaServer
export async function authenticate(request: ConnectionRequestType): Promise<any> {
  if (!mServer) return null;
  if (!mServer.authenticateWith) return null;

  return await mServer?.authenticateWith(request);
}
