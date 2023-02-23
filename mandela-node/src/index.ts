import { SetupProps } from "./types";
import {
  setupPubSubBackend,
  setupSubRegistry,
  setupServer,
  setupChannelRegistry,
} from "./Mandela";

// The Client API:
// This is the function to be called from the Node app

export function MandelaSetup(props: SetupProps) {
  console.log("setupPubSubBackend")
  setupPubSubBackend();

  console.log("setupSubRegistry")
  setupSubRegistry();

  console.log("setupChannelRegistry")
  setupChannelRegistry(props.channelConfigs);

  console.log("setupServer")
  setupServer(props);
}
