import { Channel } from "./channel";
import { Connection } from "./connection";
import { MandelaData } from "./types";

function findSub(data: MandelaData, connection: Connection) {
  const meta = data.m;
  const channel = new Channel(meta.ch, meta.id);
  const sub = connection.findSub(channel);

  if (!sub) {
    // We're not subscribed. Unexpected
    console.log(channel);
    console.log(connection.subStore);
    throw "[handleMessage__data]: Subscription object not found";
  }
  return sub;
}

async function handleMessage__info(data: MandelaData) {
  console.log("info:", data.d);
}

async function handleMessage__ans(data: MandelaData, connection: Connection) {
  const sub = findSub(data, connection);

  switch (data.d) {
    case "subscription-done":
      sub.onSubscribe();
      break;

    case "unsubscribe-done":
      sub.onUnSubscribe();
      break;

    case "unauthorized":
      sub.onAuthorizationFail();

    default:
      break;
  }
}

function handleMessage__ping(_data: MandelaData, connection: Connection) {
  // Update the last-seen-at flag
  console.log("Got ping");
  connection.onPing();
}

async function handleMessage__d(data: MandelaData, connection: Connection) {
  const sub = findSub(data, connection);
  return sub.onMessage(data);
}

export function messageOnWebsocket(dataS: string, connection: Connection) {
  const data = JSON.parse(dataS);

  if (data.d === "ping") {
    handleMessage__ping(data, connection);
    return;
  }

  const meta = data.m;
  if (!meta) return; // Malformed data

  const dataType = meta.t;
  switch (dataType) {
    case "info":
      handleMessage__info(data);
      break;

    case "ans":
      handleMessage__ans(data, connection);
      break;

    case "data":
      handleMessage__d(data, connection);
      break;

    default: // We dont know the message. Ignore
      console.error("donno");
      break;
  }
}
