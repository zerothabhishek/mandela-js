## mandela-js

Mandela-js is a Websocket + Redis based pub-sub library for Node.js web applications. Websocket is used for two way network communications, and Redis is responsible for the subscriptions and broadcasts. Inspired by Actioncable.

Mandela.js is based around the concept of channels (or rooms). Subscriptions and publications (pub-sub) are scoped to channels, i.e, any data written to a channel (pub) is broadcasted to everyone who has subscribed (sub) to the channel.

The broadcasts are visible across multiple processes, thanks to Redis. Which means if you have a dozen instances of your application, a publish in one gets broadcasted to all. Horizontal scalability.

The behaviour of a channel is described in the Node.js application. We can control things such as who gets to subscribe to a channel. Or add additional things to do along with broadcast (like broadcasts).

Eg: Perform some analytics before broadcasting a message

```javascript
const RandomChannel = {
  label: "#random",

  onMessage({ data }) {
    // describe what should be done if there is `data` on the #random channel
    // default behavior is to broadcast it back on the channel

    Analytics.record(data);
    Mandela.broadcastOnPubSub(data);
  },
};
```

Eg: Allow subscriptions to only a certain kind of users

```javascript
const AnnouncementChannel = {
  label: "#announcement",

  authorize({ sub }) {
    const session = sub.connection.session;
    return session.user_role === "admin";
  },
};
```

Eg: Recurring actions (future feature)

```javascript
const RemindersChannel = {
  label: "#reminders",

  recur: {
    every: 60, // seconds
    action: () => {
      Mandela.broadcastOnPubSub({ ...someThing });
    },
  },
};
```

## How to use:

After installing the package,

- Add Redis URL to process.env.REDIS_URL
- Define the channel configs somewhere (perhaps in src/channels) (similar to above examples)
- Define an auth function, that gets executed when client makes first contact (example below)
- Get a handle at the node server object (Mandela starts a websocketserver to listen on certain endpoints)

```javascript
  function auth(request) { // request: IncomingRequest
    // auth logic here: check the session cookies or token
    // or whatever the application is already using

    const url = new URL(request.url, `http://${request.headers.host}`)
    const passcode = url.searchParams.get('passcode')
    if (passcode !== processs.env.PASSCODE)
      return null

    const session { user_id: getUserIdFromDb(request) }
    return session
  }
```

```javascript
MandelaSetup({
  channelConfigs: [RandomChannel, AnnouncementChannel],
  authenticateWith: auth,
  server: server,
});
```

Mandela starts a separate server for handling the websocket connections, and connects to the given Redis too.

## The client:

Please check the [docs for the client package](https://github.com/zerothabhishek/mandela-js/blob/main/mandela-js-client/Readme.md)

## A note on channel definition

Channel instances in Mandela are defined by the label-id pairs, eg: `(#random, 456)`. The idea being, several instances of a certain channel kind (like `#random`) can exist, and they can be differentiated using the `id`. For example, the `#random` channel for one company is different from `#random` in another one. They behave the same, but should be identified differently - using the ids.

These ids can be backed in the database, perhaps as the primary key of the table that stores the room data.  
