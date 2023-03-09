import { Connection } from "./connection";

const WATCH_INTERVAL = 4000; // ms
const RECONNECT_WAIT_INTERVAL = 6000;
const ATTEMPT_LIMIT = 10;

let timer: ReturnType<typeof setInterval>;
let attempts: number = 0;

function isInActive(connection: Connection): boolean {
  if (!connection.lastPingAt) return false;

  const now = new Date();
  const last = connection.lastPingAt;
  if (!last) return false; // If we're unsure, we assume its active. So it doesn't overload with re-connections
  return now.valueOf() - last.valueOf() > RECONNECT_WAIT_INTERVAL;
}

function isActive(connection: Connection): boolean {
  return !isInActive(connection);
}

function tryReconnect(connection: Connection) {
  if (attempts > ATTEMPT_LIMIT) {
    console.log(
      "Connection inactive. Stopping attempts to reconnect,",
      attempts
    );
    return;
  }

  try {
    console.log("Connection inactive. Reconnecting ", attempts);
    attempts += 1;
    Connection.reconnect(connection);
  } catch (error) {
    const tryAfter = Math.pow(2, attempts) * 1000;
    console.log("tryConnect failed. Retrying after: ", tryAfter);

    setTimeout(() => {
      tryReconnect(connection);
    }, tryAfter);

    return;
  }
}

function checkAndReconnect(connection: Connection) {
  if (isActive(connection)) {
    return true;
  }

  clearTimeout(timer);
  tryReconnect(connection);
}

function watch(connection: Connection) {
  timer = setInterval(() => {
    checkAndReconnect(connection);
  }, WATCH_INTERVAL);
}

function unwatch(_connection: Connection) {
  clearTimeout(timer);
}

export default {
  watch,
  unwatch,
};
