# OBS Integration Guide

Use TTV Toaster with OBS Studio to display custom stream alerts and overlays.

## Quick Start

1. **Start TTV Toaster** - Make sure the server is running on `http://localhost:3000`
2. **Authenticate** - Log in with your Twitch account
3. **Add Browser Source** - In OBS, add a new Browser source
4. **Configure** - Point it to your chosen page (scratch page or example)
5. **Customize** - Edit the HTML/CSS to match your stream branding

---

## Adding a Browser Source

### Step 1: Create Browser Source

1. In OBS, right-click in the **Sources** panel
2. Click **Add** → **Browser**
3. Name it (e.g., "TTV Toaster Alerts")
4. Click **OK**

### Step 2: Configure Browser Source

**For the Scratch Page (Custom Alerts):**
```
URL: http://localhost:3000/scratch.html
Width: 1920
Height: 1080
FPS: 60
```

**For Event History:**
```
URL: http://localhost:3000/examples/event-history.html
Width: 400
Height: 800
FPS: 30
```

**For Raid Alerts:**
```
URL: http://localhost:3000/examples/raid-alert.html
Width: 1920
Height: 1080
FPS: 60
```

**For Minimal Alerts:**
```
URL: http://localhost:3000/examples/minimal-alerts.html
Width: 1920
Height: 1080
FPS: 60
```

### Step 3: Browser Source Settings

**Recommended Settings:**
- ✅ **Shutdown source when not visible** - Saves resources
- ✅ **Refresh browser when scene becomes active** - Ensures fresh state
- ❌ **Control audio via OBS** - Only if you add sounds
- ✅ **Use custom frame rate** - Set to 60 for smooth animations

---

## Positioning & Sizing

### Full-Screen Overlay
For alerts that cover the entire screen:
- Width: 1920, Height: 1080
- Position: X: 0, Y: 0
- Use for: Raid alerts, full-screen notifications

### Corner Widget
For compact displays in screen corners:
- Width: 400, Height: 300
- Position examples:
  - Top-right: X: 1520, Y: 0
  - Bottom-right: X: 1520, Y: 780
  - Bottom-left: X: 0, Y: 780

### Sidebar Panel
For vertical event lists:
- Width: 350, Height: 1080
- Position: X: 1570, Y: 0 (right edge)
- Use for: Event history, recent followers

---

## Customizing Your Alerts

### Using the Scratch Page

The scratch page (`scratch.html`) is your blank canvas:

```html
<!-- Example: Custom raid alert -->
<script>
document.addEventListener('twitch:raid', (e) => {
  const { username, viewerCount } = e.detail

  // Create your custom alert
  const alert = document.createElement('div')
  alert.innerHTML = `
    <div style="font-size: 72px; color: gold; text-align: center;">
      ${username} raided with ${viewerCount} viewers!
    </div>
  `
  alert.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: fadeIn 0.5s;
  `

  document.body.appendChild(alert)

  // Remove after 5 seconds
  setTimeout(() => alert.remove(), 5000)
})
</script>
```

### Available Event Types

Listen to these events in your custom code:

- `twitch:raid` - Someone raided your channel
- `twitch:follow` - New follower
- `twitch:subscribe` - New subscription
- `twitch:gift` - Gifted subscriptions
- `twitch:cheer` - Bits/cheers
- `twitch:redemption` - Channel points redemption
- `twitch:chat` - Chat messages (filtered)

---

## Tips & Best Practices

### Performance

- **Use CSS animations** instead of JavaScript when possible
- **Remove old elements** to prevent memory leaks
- **Limit simultaneous alerts** - Queue them if needed
- **Lower FPS for static displays** (30 FPS is fine for event history)

### Transparency

Make backgrounds transparent for overlay effects:

```css
body {
  background: transparent;
}
```

In OBS, the browser source will automatically handle transparency.

### Testing

1. Use the **test buttons** on the main page (http://localhost:3000)
2. Open your OBS browser source in a separate browser tab for easier debugging
3. Use browser dev tools (F12) to debug your custom code

### Audio Alerts

Add sound effects to events:

```javascript
document.addEventListener('twitch:raid', (e) => {
  const audio = new Audio('/path/to/raid-sound.mp3')
  audio.volume = 0.5
  audio.play()

  // Show visual alert
  // ...
})
```

Place sound files in the `public/sounds/` directory.

---

## Common Issues

### Browser Source is Blank

- Check that TTV Toaster server is running
- Verify the URL is correct (http://localhost:3000/...)
- Check OBS logs for errors
- Try refreshing the browser source (right-click → Refresh)

### Alerts Not Appearing

- Verify you're authenticated (check main page)
- Test with mock events first
- Check browser console for JavaScript errors (right-click source → Interact → F12)

### Performance Issues

- Lower the FPS to 30
- Reduce simultaneous animations
- Use simpler CSS effects
- Enable "Shutdown source when not visible"

---

## Advanced: Multiple Scenes

Create different alert sets for different scenes:

**Scene 1: Gameplay**
- Minimal alerts in corner
- Event history sidebar

**Scene 2: Just Chatting**
- Full-screen raid alerts
- Larger chat message display

**Scene 3: BRB**
- Event history front and center
- Recent follower showcase

Simply add different browser sources with different URLs to each scene.

---

## Example Workflow

1. **During Stream Setup:**
   - Start TTV Toaster
   - Authenticate with Twitch
   - Add browser sources to OBS scenes

2. **While Streaming:**
   - Events appear automatically in OBS
   - Use test buttons to preview alerts
   - Adjust positioning on the fly

3. **After Stream:**
   - Review event history
   - Note which alerts worked well
   - Customize for next stream

---

## Need Help?

- Check the [main README](README.md) for general setup
- Open issues at [GitHub](https://github.com/dinir/TTV-Toaster/issues)
- Review the example templates for inspiration
