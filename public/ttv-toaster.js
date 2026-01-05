/**
 * TTV Toaster Event Dispatcher
 * Connects to the server via Socket.io and dispatches Twitch events as CustomEvents
 */

const socket = io()

// Log connection status to console
socket.on('connect', () => console.log('[TTV Toaster] Connected'))
socket.on('disconnect', () => console.log('[TTV Toaster] Disconnected'))

// Receive events from server and dispatch as CustomEvents
socket.on('twitch-event', (event) => {
  const customEvent = new CustomEvent(`twitch:${event.type}`, {
    detail: event.data,
    bubbles: true
  })
  document.dispatchEvent(customEvent)
})
