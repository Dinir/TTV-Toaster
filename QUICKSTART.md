# Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Node.js installed (v16 or higher)
- A Twitch account

## Setup Steps

### 1. Create Twitch App (2 minutes)

1. Visit https://dev.twitch.tv/console/apps
2. Click "Register Your Application"
3. Fill in:
   - **Name**: `Twitch Toaster`
   - **OAuth Redirect URLs**: `http://localhost:3000/auth/callback`
   - **Category**: Application Integration
4. Click "Create"
5. Copy your **Client ID** and click "New Secret" to get **Client Secret**

### 2. Configure the App (1 minute)

1. Copy `.env.example` to `.env`
2. Open `.env` and paste your credentials:
   ```
   TWITCH_CLIENT_ID=paste_your_client_id_here
   TWITCH_CLIENT_SECRET=paste_your_client_secret_here
   ```
3. Save and close

### 3. Start the App (1 minute)

**Windows**: Double-click `start.bat`

**Mac/Linux**:
```bash
chmod +x start.sh
./start.sh
```

The browser will open automatically!

### 4. Login (30 seconds)

1. Click "Login with Twitch"
2. Click "Authorize"
3. Done!

### 5. Build Your Display (∞ minutes)

Open http://localhost:3000/scratch.html and start coding!

```javascript
document.addEventListener('twitch:raid', (event) => {
  const { displayName, viewerCount } = event.detail
  alert(`${viewerCount} viewers raided from ${displayName}!`)
})
```

## What's Next?

- Check out the [full README](README.md) for all available events
- Customize `public/scratch.html` to build your display
- Add it to OBS as a Browser Source!

## Troubleshooting

**"Client ID not found" error:**
- Make sure you created `.env` (not `.env.example`)
- Check that your Client ID is correct (no quotes needed)

**Events not showing:**
- Make sure you're logged in (visit http://localhost:3000)
- Events only happen when they occur on your stream
- Try the test button in the scratch page

**Can't access http://localhost:3000:**
- Make sure the server started (check the console window)
- Try a different port by changing `PORT=3000` in `.env`

---

Need more help? Check the [full README](README.md)!
