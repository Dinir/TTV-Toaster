# TTV Toaster

A developer-friendly playground for building custom Twitch event displays. Self-hosted Node.js app that receives Twitch events (raids, follows, subs, gifts, cheers, redemptions, chat) via EventSub WebSocket and delivers them to a customizable `scratch.html` page for use in OBS Browser Sources.

## Features

- **Real-time Twitch Events** - Raids, follows, subs, gift subs, cheers, channel point redemptions, and chat
- **Rich Event Data** - Profile images, broadcaster types (partner/affiliate), account ages, stream info, and more
- **Two Setup Modes**:
  - **Easy Mode** - OAuth handled by hosted proxy (just download and run)
  - **Self-Hosted Mode** - Create your own Twitch app for maximum privacy
- **Privacy-First** - Tokens stored locally in `.tokens.json`, never leave your computer (except during OAuth exchange in Easy Mode)
- **OBS Browser Source Ready** - Use `scratch.html` directly in OBS to display custom notifications
- **Developer-Friendly** - Built for creative coders who want full control over their stream overlays

## Tech Stack

- **Backend**: Node.js, Express, Socket.io, [@twurple](https://twurple.js.org/) (auth, api, eventsub-ws, chat)
- **Frontend**: Vanilla JavaScript, CustomEvent API for event dispatching
- **Code Style**: JavaScript Standard (no semicolons, single quotes)

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A Twitch account
- Basic terminal/command line knowledge

## Quick Start

### 1. Download and Install

```bash
git clone https://github.com/dinir/ttv-toaster.git
cd ttv-toaster
npm install
```

### 2. Choose Your Setup Mode

#### Easy Mode (Recommended)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and uncomment the `OAUTH_PROXY_URL` line:
   ```env
   OAUTH_PROXY_URL=https://toaster.dinir.works
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open `http://localhost:3000` in your browser and click "Login with Twitch"

#### Self-Hosted Mode (Maximum Privacy)

1. Create a Twitch application:
   - Go to [Twitch Developer Console](https://dev.twitch.tv/console/apps)
   - Click "Register Your Application"
   - **Name**: Choose any name (e.g., "My TTV Toaster")
   - **OAuth Redirect URLs**: `http://localhost:3000/auth/callback`
   - **Category**: Choose "Application Integration"
   - Click "Create"
   - Copy your **Client ID** and generate a **Client Secret**

2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your credentials:
   ```env
   TWITCH_CLIENT_ID=your_client_id_here
   TWITCH_CLIENT_SECRET=your_client_secret_here
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open `http://localhost:3000` in your browser and click "Login with Twitch"

### 3. Test Events

Once authenticated, open `http://localhost:3000/scratch.html` to see events in real-time. Test by:
- Following your own channel from another account
- Sending chat messages starting with `!` (default filter)
- Triggering other events on your stream

### 4. Add to OBS

1. In OBS, add a new **Browser Source**
2. Set URL to: `http://localhost:3000/scratch.html`
3. Set Width/Height to your canvas size (e.g., 1920x1080)
4. Check "Shutdown source when not visible" for better performance
5. Customize `scratch.html` to create your own designs!

## Event Data Reference

All events are dispatched as CustomEvents on the `document` object. See [EVENT_DATA.md](./EVENT_DATA.md) for complete reference.

### Available Events

| Event Type | Trigger | Key Data |
|------------|---------|----------|
| `twitch:raid` | Someone raids your channel | `displayName`, `viewerCount`, `gameName`, `profileImageUrl` |
| `twitch:follow` | Someone follows | `displayName`, `createdAt`, `profileImageUrl` |
| `twitch:subscribe` | Someone subscribes | `displayName`, `tier`, `isGift`, `profileImageUrl` |
| `twitch:gift` | Someone gifts subs | `displayName`, `amount`, `tier`, `cumulativeAmount` |
| `twitch:cheer` | Someone cheers bits | `displayName`, `bits`, `message`, `profileImageUrl` |
| `twitch:redemption` | Channel points redeemed | `displayName`, `rewardTitle`, `rewardCost`, `userInput` |
| `twitch:chat` | Chat message (filtered) | `displayName`, `message`, `isMod`, `isSubscriber` |

### Example Usage

```javascript
document.addEventListener('twitch:raid', (event) => {
  const { displayName, viewerCount, gameName, profileImageUrl } = event.detail

  // Create your custom notification
  console.log(`${displayName} raided with ${viewerCount} viewers!`)
  console.log(`They were playing: ${gameName}`)

  // Display profile image
  const img = document.createElement('img')
  img.src = profileImageUrl
  document.body.appendChild(img)
})
```

See [EVENT_DATA.md](./EVENT_DATA.md) for complete examples and tips.

## Chat Filtering

By default, only chat messages starting with `!` are sent to `scratch.html` to prevent spam. Configure filters in `.chat-filters.json` or via the API:

```json
{
  "enabled": true,
  "prefixFilters": ["!"],
  "blockList": []
}
```

**API Endpoints:**
- `GET /api/chat/filters` - Get current filters
- `POST /api/chat/filters` - Update filters

## Project Structure

```
ttv-toaster/
├── src/
│   └── backend/
│       ├── server.js              # Main server
│       ├── twitch/
│       │   ├── auth.js            # OAuth & token management
│       │   ├── eventListener.js   # EventSub handlers
│       │   └── chatListener.js    # Chat handlers
│       └── bridges/
│           └── eventBridge.js     # Socket.io bridge
├── public/
│   ├── index.html                 # Setup/login page
│   └── scratch.html               # Event display page (customize this!)
├── .env                           # Your configuration
├── .tokens.json                   # Auth tokens (auto-generated)
├── .chat-filters.json             # Chat filters (optional)
└── EVENT_DATA.md                  # Event data reference
```

## Example Templates

Check out the `/examples` directory for ready-to-use templates:

### 📋 Event Log (`/examples/event-log.html`)
- Shows all events with profile pictures
- Partner/affiliate badges
- Account age warnings
- Perfect for testing and development

### 🎉 Raid Alert (`/examples/raid-alert.html`)
- Full-screen raid notifications
- Animated entrance/exit
- Shows game raider was streaming

### 🔔 Minimal Alerts (`/examples/minimal-alerts.html`)
- Clean bottom-right notifications
- Queue system for multiple events
- Works with all event types

**Try them:** Open `http://localhost:3000/examples/` in your browser or add to OBS as a Browser Source!

## Customizing Your Display

The `public/scratch.html` file is your blank canvas:
- Minimal boilerplate (just Socket.io + event dispatcher)
- Transparent background (OBS-ready)
- Comments showing available events
- One example handler to get you started

**Tips for customization:**
1. Start with an example template or build from scratch
2. Use `event.detail.profileImageUrl` for profile pictures
3. Add CSS animations for eye-catching transitions
4. Play sounds with `new Audio('sound.mp3').play()`
5. Filter events (e.g., raids with 10+ viewers only)
6. Show partner badges, account ages, game info, etc.

See [EVENT_DATA.md](./EVENT_DATA.md) for all available event properties!

## Troubleshooting

### "Failed to authenticate" or "Invalid client ID"

**Easy Mode:**
- Verify `.env` has `OAUTH_PROXY_URL` uncommented
- Check that the URL doesn't have a trailing slash
- Restart the server after editing `.env`

**Self-Hosted Mode:**
- Double-check your Client ID and Secret from [Twitch Developer Console](https://dev.twitch.tv/console/apps)
- Ensure redirect URI is exactly `http://localhost:3000/auth/callback`
- Make sure there are no extra spaces in your `.env` file

### Events not showing up

1. Check browser console at `http://localhost:3000/scratch.html` for errors
2. Verify server console shows "EventSub WebSocket connected"
3. Test with a simple event like chat (send a message starting with `!`)
4. Make sure you're testing on the authenticated Twitch account

### OBS Browser Source shows blank screen

1. Test the URL in a regular browser first
2. Right-click the Browser Source → Interact → Open DevTools to check for errors
3. Ensure OBS Browser Source has correct dimensions
4. Try toggling "Shutdown source when not visible" off temporarily

### Chat messages not appearing

- By default, only messages starting with `!` are sent
- Check `.chat-filters.json` or use `GET /api/chat/filters` to see current config
- Disable filtering: `POST /api/chat/filters` with `{"enabled": false}`

### Server won't start

```bash
Error: listen EADDRINUSE: address already in use :::3000
```
- Port 3000 is already in use
- Change `PORT=3000` in `.env` to another port (e.g., `PORT=3001`)
- Or stop the other process using port 3000

### Tokens expired / "401 Unauthorized"

- The app automatically refreshes tokens
- If refresh fails, click "Disconnect" at `http://localhost:3000` and re-authenticate
- In Self-Hosted Mode, verify your Client Secret is correct

## Development

### Code Style

This project uses [JavaScript Standard Style](https://standardjs.com/):

```bash
npm run lint        # Check for style issues
npm run lint:fix    # Auto-fix style issues
```

### File Watching

For development, consider using `nodemon`:

```bash
npm install -g nodemon
nodemon src/backend/server.js
```

## Privacy & Security

- **Easy Mode**: Tokens are exchanged via Railway-hosted proxy, then stored locally
- **Self-Hosted Mode**: All authentication happens locally, no third-party services
- Tokens are stored in `.tokens.json` (gitignored by default)
- Never commit `.env` or `.tokens.json` to version control
- Railway proxy source code is in `oauth-proxy/` for transparency

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow JavaScript Standard style (`npm run lint`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

ISC License - See [LICENSE](LICENSE) for details

## Credits

Built with [Twurple](https://twurple.js.org/) - The powerful Twitch API library for Node.js

## Support

- [GitHub Issues](https://github.com/dinir/ttv-toaster/issues) - Bug reports and feature requests
- [EVENT_DATA.md](./EVENT_DATA.md) - Complete event data reference
- [Twurple Documentation](https://twurple.js.org/) - API library docs
- [Twitch EventSub Reference](https://dev.twitch.tv/docs/eventsub/) - Official Twitch docs

---

**Happy streaming!** If you build something cool with TTV Toaster, share it with the community!
