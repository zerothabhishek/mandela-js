## Mandela node

A channel config describes how a channel behaves. Things like handling received messages, authorizing subscription requests etc.  

eg:  

```
const GeneralChannel {
  label: '#general',

  onMessage: ({ data }) => {
    if (!data.processed) {
      data.processed = true;
      Mandela.broadcastOnPubSub(data)
    }
  },

  authorize: ({ sub }) => {
    // some logic that decides whether the client's subscription request should be allowed
    return sub.connection.session.team_id === correct_team_id
  }
}
```

A channel instance is where the channel definition becomes a room. We identify a channel instance using the label and and id (#general, 123). A #general (007) for my team is different from the #general in your team (042), but follows the same template when it comes to behavior.  


## Usage

Write a function to authenticate. This is executed at the very start of the websocket connection from the client.  

```
function auth(request) {
  // auth logic here
}
```

Initialize Mandela using the defined channels, authentication function and the node server:  

```
MandelaSetup({
  channelConfigs: [GeneralChannel],
  authenticateWith: auth,
  server: server,
})
```

Take a look at the [sample-app](https://github.com/zerothabhishek/mandela-js/tree/main/mandela-sample)  


## Project status:
In development. Please don't use for production  

## License:
MIT  


