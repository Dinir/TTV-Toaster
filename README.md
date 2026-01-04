# Twitch Toaster

A developer-friendly tool for receiving Twitch stream events in a scratch page environment. Perfect for building custom stream notifications, overlays, and interactive displays.

## Features

- **Easy OAuth Login** - No manual token generation needed
- **Real-time Events** - Receive raids, follows, subs, bits, and more instantly
- **Developer-Friendly** - Simple `document.addEventListener` API
- **Privacy-First** - All tokens stored locally on your machine
- **Zero Configuration** - Just double-click and go

## Quick Start

Twitch Toaster supports two modes - choose the one that fits your needs:

### Option 1: Easy Mode (Recommended)

No Twitch app creation required - uses our hosted OAuth proxy.

1. Download this project
2. Copy `.env.example` to `.env`
3. Uncomment the `OAUTH_PROXY_URL` line in `.env`
4. Run `npm install` and `npm start`
5. Login and you're done!

**Note**: In Easy Mode, your tokens are still stored locally on your computer. The proxy only handles the OAuth exchange.

### Option 2: Self-Hosted Mode (Maximum Privacy)

Your own Twitch app - tokens never leave your computer.

1. Download this project
2. Create a Twitch app at https://dev.twitch.tv/console/apps
   - **Name**: Twitch Toaster (or whatever you want)
   - **OAuth Redirect URLs**: `http://localhost:3000/auth/callback`
   - **Category**: Choose any (e.g., "Application Integration")
3. Copy `.env.example` to `.env`
4. Add your **Client ID** and **Client Secret** to `.env`
5. Run `npm install` and `npm start`
6. Login and you're done!

**Privacy**: Your Client Secret stays on your computer. No data is sent to any third party.

---

Both modes store tokens locally in `.tokens.json` - they never leave your machine!

## Scratch Page API

The scratch page receives Twitch events as standard DOM events. Just add event listeners:

### Available Events

#### `twitch:raid`
```javascript
document.addEventListener('twitch:raid', (event) => {
  const { displayName, username, viewerCount } = event.detail
  console.log(`${viewerCount} viewers raided from ${displayName}!`)
})
```

#### `twitch:follow`
```javascript
document.addEventListener('twitch:follow', (event) => {
  const { displayName, username } = event.detail
  console.log(`${displayName} followed!`)
})
```

#### `twitch:subscribe`
```javascript
document.addEventListener('twitch:subscribe', (event) => {
  const { displayName, username, tier } = event.detail
  // tier: '1000', '2000', or '3000'
  console.log(`${displayName} subscribed at tier ${tier}!`)
})
```

#### `twitch:gift`
```javascript
document.addEventListener('twitch:gift', (event) => {
  const { displayName, amount, tier, isAnonymous } = event.detail
  console.log(`${displayName} gifted ${amount} subscriptions!`)
})
```

#### `twitch:cheer`
```javascript
document.addEventListener('twitch:cheer', (event) => {
  const { displayName, bits, message } = event.detail
  console.log(`${displayName} cheered ${bits} bits: "${message}"`)
})
```

#### `twitch:redemption`
```javascript
document.addEventListener('twitch:redemption', (event) => {
  const { displayName, rewardTitle, userInput } = event.detail
  console.log(`${displayName} redeemed: ${rewardTitle}`)
})
```

#### `twitch:chat`
```javascript
document.addEventListener('twitch:chat', (event) => {
  const { displayName, message, color, isMod, isSubscriber, isVip, badges } = event.detail
  console.log(`${displayName}: ${message}`)
})
```

**Note:** Chat messages are filtered by default to prevent spam. See [Chat Filtering](#chat-filtering) below.

## Chat Filtering

To prevent spam in busy channels, chat messages are filtered before being emitted. By default, only messages starting with `!` (commands) are emitted.

### Default Filters

- **Prefix filter**: Only messages starting with `!` pass through
- **Rate limiting**: Maximum 10 messages per second
- All other messages are silently ignored

### Configuring Filters

Create a `.chat-filters.json` file in the root directory:

```json
{
  "enabled": true,
  "conditions": {
    "startsWithPrefix": "!",
    "mentionsBot": true,
    "containsKeywords": ["hello", "help"],
    "fromSpecificUsers": ["someuser", "anotheruser"],
    "minLength": 5,
    "maxLength": 500
  },
  "rateLimit": {
    "enabled": true,
    "maxMessagesPerSecond": 10
  }
}
```

**Filter Options:**

- `startsWithPrefix`: Only emit messages starting with this character (e.g., `"!"` for commands)
- `mentionsBot`: Emit messages that mention the broadcaster
- `containsKeywords`: Array of keywords - emit if message contains any
- `fromSpecificUsers`: Array of usernames - emit all messages from these users
- `minLength`/`maxLength`: Filter by message length (0 = disabled)
- `rateLimit.maxMessagesPerSecond`: Maximum messages to emit per second

**How it works:**
- If **any** condition matches, the message is emitted
- Rate limiting is applied after filtering
- Set `enabled: false` to disable all filtering (not recommended for big channels)

### API Endpoints

You can also configure filters programmatically:

```bash
# Get current filters
curl http://localhost:3000/api/chat/filters

# Update filters
curl -X POST http://localhost:3000/api/chat/filters \
  -H "Content-Type: application/json" \
  -d '{"conditions": {"startsWithPrefix": "?"}}'

# Reset to defaults
curl -X POST http://localhost:3000/api/chat/filters/reset
```

## Example: Custom Notification

```html
<script>
  document.addEventListener('twitch:raid', (event) => {
    const { displayName, viewerCount } = event.detail

    // Create notification element
    const notification = document.createElement('div')
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #9146FF;
      color: white;
      padding: 20px;
      border-radius: 10px;
      font-size: 24px;
      animation: slideIn 0.5s;
    `
    notification.textContent = `${viewerCount} viewers raided from ${displayName}!`

    document.body.appendChild(notification)

    // Remove after 5 seconds
    setTimeout(() => notification.remove(), 5000)
  })
</script>
```

## Using in OBS

1. Add a **Browser Source** in OBS
2. Set URL to: `http://localhost:3000/scratch.html`
3. Set width/height as needed
4. Customize the scratch page with your HTML/CSS/JS
5. Events will appear live in OBS!

## File Structure

```
twitch-toaster/
├── src/
│   └── backend/
│       ├── server.js           # Express server
│       ├── eventBridge.js      # Event normalization
│       ├── routes/
│       │   └── auth.js         # OAuth routes
│       └── twitch/
│           ├── auth.js         # Token management
│           └── eventListener.js # EventSub listener
├── public/
│   ├── index.html              # Landing page
│   └── scratch.html            # Developer scratch page
├── start.bat                   # Windows startup script
├── start.sh                    # Mac/Linux startup script
├── .env.example                # Environment template
└── package.json
```

## How It Works

1. **You log in** via Twitch OAuth
2. **Tokens are saved** locally to `.tokens.json`
3. **EventSub connection** is established to Twitch
4. **Events flow** from Twitch → Server → Browser (via Socket.io)
5. **DOM events** are dispatched for your code to handle

## Troubleshooting

### "No tokens found" error
- Make sure you've logged in via the web interface
- Check that `.tokens.json` exists (created after first login)

### Events not appearing
- Ensure you're logged in (check `http://localhost:3000`)
- Events only fire when they actually happen on your stream
- Check browser console for errors

### Port 3000 already in use
- Change the `PORT` in `.env` file
- Update the redirect URI in your Twitch app settings

## Development

```bash
# Install dependencies
npm install

# Run with auto-restart (if you have nodemon)
npm run dev

# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

## Deploying Your Own OAuth Proxy (Optional)

If you want to provide Easy Mode to others but don't trust our hosted proxy, you can deploy your own:

### Deploy to Railway

1. Go to [Railway](https://railway.app)
2. Create new project from the `oauth-proxy/` folder
3. Add environment variables:
   - `TWITCH_CLIENT_ID`
   - `TWITCH_CLIENT_SECRET`
4. Deploy and copy the URL
5. Share that URL with users (they add it as `OAUTH_PROXY_URL` in their `.env`)

### Deploy to Render

1. Go to [Render](https://render.com)
2. Create new Web Service
3. Set root directory to `oauth-proxy`
4. Add environment variables
5. Deploy

The OAuth proxy is a tiny Express server that only exposes `/exchange` and `/refresh` endpoints. The Client Secret stays secure on your server.

## Privacy & Security

### Self-Hosted Mode
- All tokens are stored **locally** on your computer (`.tokens.json`)
- Your Client Secret **never** leaves your computer
- The app only connects to **Twitch's official API**
- Your `.tokens.json` is in `.gitignore` - never committed to git

### Easy Mode (with OAuth Proxy)
- Tokens are still stored **locally** on your computer (`.tokens.json`)
- The proxy only handles OAuth code exchange (one-time operation)
- After login, all communication goes directly to **Twitch's official API**
- The proxy never stores or logs your tokens

## License

ISC

## Contributing

Contributions welcome! Feel free to open issues or pull requests.

---

**Made for streamers, by developers.**
