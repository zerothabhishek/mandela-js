import { Connection } from "./connection";

const WATCH_INTERVAL = 4000; // ms
const RECONNECT_WAIT_INTERVAL = 6000;
const ATTEMPT_LIMIT = 10;

let timer = null;
let attempts = 0;

function isInActive(connection) {
  if (!connection.lastPingAt) return false;

  const now = new Date();
  return now - connection.lastPingAt > RECONNECT_WAIT_INTERVAL;
}

function isActive(connection) {
  return !isInActive(connection);
}

function tryReconnect(connection) {
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

function checkAndReconnect(connection) {
  if (isActive(connection)) {
    return true;
  }

  clearTimeout(timer);
  tryReconnect(connection);
}

function watch(connection) {
  timer = setInterval(() => {
    checkAndReconnect(connection);
  }, WATCH_INTERVAL);
}

function unwatch(_connection) {
  clearTimeout(timer);
}

export default {
  watch,
  unwatch,
};
