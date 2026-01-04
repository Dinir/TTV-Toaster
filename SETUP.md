# Twitch Toaster Setup Guide

## First 4 Steps Completed

### Step 1: Project Dependencies ✓
**Installed packages:**
- `express` - Web server framework
- `socket.io` - Real-time WebSocket communication
- `dotenv` - Environment variable management
- `@twurple/api` - Twitch API client
- `@twurple/auth` - OAuth authentication with auto-refresh
- `@twurple/eventsub-ws` - WebSocket EventSub listener (no public URL needed!)

**Why these packages?**
- We use Twurple library because it's the official, modern Twitch library
- WebSocket EventSub means you don't need ngrok or public URLs for development
- Socket.io provides easy real-time communication to the scratch page

---

### Step 2: Backend Server with Socket.io ✓
**Created:** `src/backend/server.js`

**What it does:**
- Sets up Express HTTP server
- Initializes Socket.io for WebSocket connections
- Serves static files from `public/` directory
- Handles client connections/disconnections
- Starts the Twitch event listener on startup
- Graceful shutdown handling

**Key features:**
- Runs on port 3000 (configurable via .env)
- CORS enabled for all origins (adjust for production)
- Automatically initializes Twitch integration
- Error handling if Twitch setup fails

---

### Step 3: Twitch Authentication ✓
**Created:** `src/backend/twitch/auth.js`

**What it does:**
- Manages Twitch OAuth tokens using `RefreshingAuthProvider`
- Automatically refreshes expired tokens
- Saves tokens to `.tokens.json` file for persistence
- Supports both stored tokens and environment variable tokens

**How to get tokens:**
1. Visit https://twitchtokengenerator.com/
2. Select scopes:
   - `channel:read:subscriptions`
   - `channel:read:redemptions`
   - `bits:read`
   - `moderator:read:followers`
3. Copy Access Token and Refresh Token
4. Add to `.env` file (see below)

**Token management:**
- First run: Uses tokens from `.env`
- Subsequent runs: Uses saved `.tokens.json`
- Auto-refresh: When tokens expire, new ones are saved automatically

---

### Step 4: Twitch EventSub Connection ✓
**Created:** `src/backend/twitch/eventListener.js`

**What it does:**
- Connects to Twitch EventSub via WebSocket (no webhook URL needed!)
- Subscribes to 6 event types:
  1. **Raids** - Someone raids your channel
  2. **Follows** - New follower
  3. **Subscriptions** - New subscriber
  4. **Gift Subscriptions** - Gifted subs
  5. **Cheers/Bits** - Bits donations
  6. **Channel Points Redemptions** - Custom rewards redeemed

**How it works:**
- Uses `EventSubWsListener` for WebSocket connection
- Fetches your channel ID from channel name
- Normalizes each event type into standardized format
- Passes events to `eventBridge` for broadcasting

**Also created:** `src/backend/eventBridge.js`

**What it does:**
- Receives raw Twitch events from the listener
- Normalizes them into consistent format:
  ```javascript
  {
    type: 'raid',
    data: {
      username: 'raider123',
      displayName: 'Raider123',
      viewerCount: 32
    },
    timestamp: 1234567890
  }
  ```
- Broadcasts to all connected scratch pages via Socket.io

---

## Configuration Required

### 1. Create `.env` file
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 2. Fill in your Twitch details:
```env
PORT=3000

# Get from https://dev.twitch.tv/console/apps
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_CLIENT_SECRET=your_client_secret_here

# Your Twitch channel name
TWITCH_CHANNEL_NAME=your_channel_name

# Get from https://twitchtokengenerator.com/
TWITCH_ACCESS_TOKEN=your_access_token_here
TWITCH_REFRESH_TOKEN=your_refresh_token_here
```

### 3. Get Twitch App Credentials
1. Go to https://dev.twitch.tv/console/apps
2. Click "Register Your Application"
3. Name: "Twitch Toaster" (or whatever)
4. OAuth Redirect URLs: `http://localhost:3000` (for now)
5. Category: Chat Bot or other
6. Copy Client ID and generate Client Secret

### 4. Get Access Tokens
**Easy way:** Use https://twitchtokengenerator.com/
1. Paste your Client ID and Secret
2. Select required scopes (listed above)
3. Generate tokens
4. Copy both Access Token and Refresh Token to `.env`

---

## How to Run

```bash
npm start
```

You should see:
```
Twitch Toaster server running on http://localhost:3000
Waiting for Twitch events...
[Auth] Authentication initialized successfully
[EventSub] Listening to channel: YourChannel (ID: 123456789)
[EventSub] Subscribed to: Raids
[EventSub] Subscribed to: Follows
[EventSub] Subscribed to: Subscriptions
[EventSub] Subscribed to: Gift Subscriptions
[EventSub] Subscribed to: Cheers/Bits
[EventSub] Subscribed to: Channel Points Redemptions
Twitch integration ready!
```

---

## What Happens Next?

When Twitch events occur:
1. EventSub sends event to `eventListener.js`
2. Event is normalized and sent to `eventBridge.js`
3. EventBridge broadcasts to all connected Socket.io clients
4. Scratch page receives event via Socket.io
5. Custom DOM event is dispatched (next steps to implement)

---

## File Structure Created

```
twitch-toaster/
├── src/
│   └── backend/
│       ├── server.js              # Express + Socket.io server
│       ├── eventBridge.js         # Event normalization & broadcasting
│       └── twitch/
│           ├── auth.js            # OAuth token management
│           └── eventListener.js   # EventSub WebSocket listener
├── .env.example                   # Environment template
├── package.json                   # Dependencies & scripts
└── SETUP.md                       # This file
```

---

## Testing Without Real Events

To test if everything is working, you can manually trigger events by adding this to `server.js` after the server starts:

```javascript
// Test event after 5 seconds
setTimeout(() => {
  const eventBridge = require('./eventBridge');
  eventBridge.handleRaid({
    username: 'test_raider',
    displayName: 'Test Raider',
    viewerCount: 42
  });
}, 5000);
```

This will send a fake raid event 5 seconds after startup to test the event flow.

---

## Next Steps (Not Yet Implemented)

5. Create scratch page HTML with Socket.io client
6. Build event dispatcher that converts Socket.io messages to DOM events
7. Write documentation with event types and examples
8. Create sample implementations

---

## Troubleshooting

**Error: "Missing TWITCH_CLIENT_ID"**
- Make sure you created `.env` file and added your credentials

**Error: "Channel 'xyz' not found"**
- Check your TWITCH_CHANNEL_NAME is correct (case-sensitive)

**Error: "No tokens found"**
- Generate tokens at https://twitchtokengenerator.com/
- Add to .env file

**No events received**
- Events only fire when they actually happen on your channel
- Use test mode (above) to verify Socket.io is working
- Check console logs for subscription confirmations
