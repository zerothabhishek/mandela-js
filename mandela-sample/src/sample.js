import {
  subscribe,
  unSubscribe,
  debug,
} from "../node_modules/mandela-js-client/dist/index.js";

window.M = debug();

export async function wsDemo() {

  console.log("wsDemo !!!")

  const connectButton = document.getElementById("connect");
  const connectionStatusEl = document.getElementById("connection-status");
  const sendMsgButton = document.getElementById("send-msg");
  const dataEl = document.getElementById("data");
  const unSubscribeButton = document.getElementById("unsubscribe");

  const ch = "collab";
  const id = 123;
  const host = "localhost:9090"
  const url = `ws://${host}?user_id=455&passcode=abc123`;

  function onSubscribe(sub) {
    connectionStatusEl.innerText = "🟢";

    sendMsgButton.removeAttribute("disabled");
    sendMsgButton.addEventListener("click", (event) => {
      event.preventDefault();
      const inputEl = document.getElementById("msg-to-send");
      const msgToSend = inputEl.value;
      sub.sendMsg(msgToSend);
      inputEl.value = ""
    });

    unSubscribeButton.removeAttribute("disabled");
    unSubscribeButton.addEventListener("click", (event) => {
      event.preventDefault();
      unSubscribe(sub, { onUnSubscribe });
    });
  }

  function onUnSubscribe() {
    connectionStatusEl.innerText = "⚪️";
    sendMsgButton.setAttribute("disabled", true);
    unSubscribeButton.setAttribute("disabled", true);
  }

  function onMessage(msg) { // its the data.d here
    console.log(msg)
    dataEl.innerHTML = (dataEl.innerHTML || "") + msg + "<br>";
  }

  connectButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const sub = await subscribe(url, ch, id, { onMessage });
    onSubscribe(sub);
  });
}

wsDemo();
