
const PASSCODE = "abc123"

export function isPasscodeValid(request) {
  const url = new URL(request.url, `http://${request.headers.host}`)
  const passcode = url.searchParams.get('passcode')
  if (passcode !== PASSCODE)
    return null

  const session = { user_id: url.searchParams.get('user_id') }
  return session
}

export const CollabChannel = {
  label: 'collab'

  ,recur: { action: () => { 'repeat' }, every: 2000 }
  
  ,beforeSubscribe: async ({ subscription }) => { '' }

  // ,onmessage: async ({ data, subscription}) => {}

  // TODO: api should give the session object as parameter
  // Add a more practical, real-world way of authorizing
  //
  ,authorize: async ({ sub }) => {
    const subscription = sub;
    if (!subscription) return null;

    console.log("----> [CollabChannel: authorize] session", subscription.connection.session)
    const session = subscription.connection.session
    const channel = subscription.channel

    if (session.user_id === '455' && channel.id === '123')
      return 'ok'
    
    return null
  }

  ,getUserIdForSub: async ({ subscription }) => {
    return `u-${subscription.connection.session.user_id}`
  }
}


