# Twitch Toaster

A developer-friendly tool for receiving Twitch stream events in a scratch page environment. Perfect for building custom stream notifications, overlays, and interactive displays.

## Features

- **Easy OAuth Login** - No manual token generation needed
- **Real-time Events** - Receive raids, follows, subs, bits, and more instantly
- **Developer-Friendly** - Simple `document.addEventListener` API
- **Privacy-First** - All tokens stored locally on your machine
- **Zero Configuration** - Just double-click and go

## Quick Start

### 1. Download and Setup

1. Download this project
2. Copy `.env.example` to `.env`
3. Add your Twitch app credentials (see below)

### 2. Get Twitch App Credentials

1. Go to https://dev.twitch.tv/console/apps
2. Click "Register Your Application"
3. Fill in:
   - **Name**: Twitch Toaster (or whatever you want)
   - **OAuth Redirect URLs**: `http://localhost:3000/auth/callback`
   - **Category**: Choose any (e.g., "Application Integration")
4. Click "Create"
5. Copy your **Client ID** and **Client Secret** to `.env`

### 3. Run the App

**Windows:**
```bash
# Double-click start.bat
# OR
npm start
```

**Mac/Linux:**
```bash
chmod +x start.sh
./start.sh
# OR
npm start
```

The browser will open automatically to `http://localhost:3000`

### 4. Login with Twitch

1. Click "Login with Twitch"
2. Authorize the app
3. You're done! Events will start flowing

### 5. Build Your Display

Open `http://localhost:3000/scratch.html` and start coding!

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

## Privacy & Security

- All tokens are stored **locally** on your computer (`.tokens.json`)
- Tokens are **never** sent to any third-party server
- The app only connects to **Twitch's official API**
- Your `.tokens.json` is in `.gitignore` - never committed to git

## License

ISC

## Contributing

Contributions welcome! Feel free to open issues or pull requests.

---

**Made for streamers, by developers.**
