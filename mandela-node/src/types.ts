export type InformFunctionType = (data: string) => any;

export type SetupProps = {
  authenticateWith?: Function;
  channelConfigs: any[];
  server: any;
};

export type MandelaData = {
  m?: {
    ch: string, // channel label
    id: string, // channel id
    t: string,  // message type: MandelaMessageType
  },
  d: string  // the actual data
}

export type ConnectionRequestType = any; // TODO: refine
export type NodeServerType = any // TODO: refine