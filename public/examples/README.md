# TTV Toaster Examples

Ready-to-use templates showcasing different features and use cases.

## How to Use

1. Start TTV Toaster: `npm start`
2. Open any example in your browser or OBS
3. Copy code to `scratch.html` or customize further

## Available Examples

### 📋 Event Log
**File:** `event-log.html`
**URL:** `http://localhost:3000/examples/event-log.html`

**Features:**
- Shows all event types in a scrolling log
- Displays profile pictures for all events
- Partner/affiliate badges for raids
- Account age warnings for new follows
- Cumulative gift amounts
- Reward costs for redemptions

**Best for:** Testing events, debugging, development

---

### 🎉 Raid Alert
**File:** `raid-alert.html`
**URL:** `http://localhost:3000/examples/raid-alert.html`

**Features:**
- Full-screen raid notification
- Animated entrance/exit
- Shows raider's profile picture
- Displays game they were streaming
- Partner/affiliate badge
- Transparent background (OBS-ready)
- Auto-dismisses after 8 seconds

**Best for:** OBS Browser Source, stream overlays

---

### 🔔 Minimal Alerts
**File:** `minimal-alerts.html`
**URL:** `http://localhost:3000/examples/minimal-alerts.html`

**Features:**
- Clean, modern notification design
- Bottom-right corner placement
- Queue system (one notification at a time)
- Profile pictures for all events
- Transparent background (OBS-ready)
- Supports all event types
- Auto-dismisses after 5 seconds

**Best for:** OBS Browser Source, minimalist overlays

---

## Customization Tips

### Change Colors

Replace `#9146FF` (Twitch purple) with your brand color:

```css
border-left: 5px solid #YOUR_COLOR;
```

### Adjust Duration

Change how long alerts stay on screen:

```javascript
setTimeout(() => {
  // Hide notification
}, 5000) // 5000ms = 5 seconds
```

### Add Sound Effects

```javascript
document.addEventListener('twitch:raid', (event) => {
  const audio = new Audio('/sounds/raid.mp3')
  audio.play()
  // ... rest of your code
})
```

### Filter Events

Only show raids with 10+ viewers:

```javascript
document.addEventListener('twitch:raid', (event) => {
  const { viewerCount } = event.detail
  if (viewerCount < 10) return // Ignore small raids
  // ... show notification
})
```

### Multiple Alerts

Run multiple example pages simultaneously in different OBS Browser Sources:
- Raids in one source
- Follows in another
- Subs in a third

---

## Event Data Reference

All examples use data from `event.detail`. See [EVENT_DATA.md](../EVENT_DATA.md) for complete field reference.

**Common fields:**
- `displayName` - User's display name
- `profileImageUrl` - Profile picture URL
- `broadcasterType` - 'partner', 'affiliate', or ''

**Raid-specific:**
- `viewerCount` - Number of viewers
- `gameName` - Game they were streaming

**Follow-specific:**
- `createdAt` - Account creation date

**Sub/Gift-specific:**
- `tier` - '1000', '2000', or '3000'
- `amount` - Number of subs (gifts only)

---

## Building Your Own

Start with `scratch.html` (blank canvas) or copy an example and modify:

1. Copy example HTML
2. Customize styles (colors, sizes, positions)
3. Modify event handlers
4. Add your own animations
5. Test in browser, then add to OBS

---

**Need help?** Check [EVENT_DATA.md](../EVENT_DATA.md) for all available event properties, or see [README.md](../README.md) for setup and troubleshooting.
