import { Connection } from "./connection";
import { Subscription } from "./subscription";

declare global {
  interface Window {
    MC: Connection;
  }
}

export type MandelaData = {
  m: {
    ch: string;
    id: string;
    t: "info" | "data" | "ans";
  };
  d: string;
};

export type SubscribeParams = {
  url: string;
  ch: string;
  id: string;
  onMessage: (dataD: string, data?: MandelaData) => void;
};

export type UnSubscribeParams = {
  sub: Subscription;
  onUnSubscribe: Function;
};
