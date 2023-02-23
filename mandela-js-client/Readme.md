## Mandela-js client

A browser client for [Mandela-node](https://github.com/zerothabhishek/mandela-js/tree/main/mandela-node)

## How to use

Find the channel (label, id) and the host url.

```javascript
const url = "ws://myserver.com/_mandela";
const channel = { ch: "#general", id: "042" };
```

Define the message handler, and subscribe:

```javascript
import Mandela from "mandela-js-client";

function onMessage(msg) {
  // msg is a string
  // Display the message in ul.messages
  const el = document.getElementById("ul.messages");
  el.innerHTML = (el.innerHTML || "") + `<li>${msg}</li>`;
}

const sub = await Mandela.subscribe(url, channel.ch, channel.id, { onMessage });
```

Send a message to the channel:

```javascript
const msg = "Hola !";
sub.sendMsg(msg);
```

Unsubscribe when done:

```javascript
const onUnSubscribe = () => {
  console.log("UnSubscribe done");
};
Mandela.unsubscribe(sub, { onUnSubscribe });
```

## Project status

In development. Don't use in production

## License

MIT
