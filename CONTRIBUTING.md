# Contributing to TTV Toaster

Thank you for your interest in contributing to TTV Toaster! This document provides guidelines and information for contributors.

## Code of Conduct

Be respectful, constructive, and helpful. This is a community project built for streamers and developers.

## How Can I Contribute?

### Reporting Bugs

Before submitting a bug report:
1. Check the [existing issues](https://github.com/dinir/ttv-toaster/issues) to avoid duplicates
2. Test with the latest version of TTV Toaster
3. Try both Easy Mode and Self-Hosted Mode to isolate the issue

When submitting a bug report, include:
- **Clear title**: "Chat events not firing" not "It doesn't work"
- **Steps to reproduce**: Numbered list of exact steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: Node.js version, OS, Easy/Self-Hosted mode
- **Logs**: Relevant console output (server and browser)

### Suggesting Features

Feature requests are welcome! Include:
- **Use case**: Why is this useful? Who benefits?
- **Proposed solution**: How would it work?
- **Alternatives considered**: What other approaches did you think about?
- **Examples**: Screenshots, mockups, or code examples if applicable

### Pull Requests

1. **Fork the repository** and create a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Follow the code style**:
   - JavaScript Standard Style (run `npm run lint`)
   - No semicolons, single quotes
   - Descriptive variable names
   - Comments for complex logic

3. **Test your changes**:
   - Test both Easy Mode and Self-Hosted Mode
   - Test all affected event types
   - Check browser console for errors
   - Verify OBS Browser Source compatibility

4. **Commit with clear messages**:
   ```bash
   git commit -m "Add gameName to raid events"
   ```
   - Use present tense ("Add feature" not "Added feature")
   - First line under 72 characters
   - Reference issues: "Fix #123: Handle null profile images"

5. **Push and create PR**:
   ```bash
   git push origin feature/amazing-feature
   ```
   - Clear title describing the change
   - Detailed description of what and why
   - Link related issues
   - Add screenshots/GIFs for UI changes

## Development Setup

### Prerequisites

- Node.js v18 or higher
- Git
- A Twitch account for testing

### Local Development

1. Clone your fork:
   ```bash
   git clone https://github.com/dinir/ttv-toaster.git
   cd ttv-toaster
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment (choose one):

   **Easy Mode**:
   ```bash
   cp .env.example .env
   # Uncomment OAUTH_PROXY_URL line
   ```

   **Self-Hosted Mode**:
   ```bash
   cp .env.example .env
   # Add your TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. For auto-restart during development:
   ```bash
   npm install -g nodemon
   nodemon src/backend/server.js
   ```

### Testing Changes

1. **Server-side changes**:
   - Check server console for errors
   - Verify EventSub WebSocket connects
   - Test event handlers with real Twitch events

2. **Client-side changes** (`scratch.html`):
   - Open `http://localhost:3000/scratch.html`
   - Check browser console for errors
   - Test in OBS Browser Source

3. **Event data changes**:
   - Update `EVENT_DATA.md` if you add/modify event fields
   - Update example code in `scratch.html`
   - Test with real events, not just mock data

## Code Style

### JavaScript Standard

We use [JavaScript Standard Style](https://standardjs.com/):

```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
```

**Key rules:**
- No semicolons
- Single quotes for strings
- 2-space indentation
- Space after keywords: `if (condition)`
- Space before blocks: `function foo () {`

### File Organization

```
src/backend/
├── server.js              # Main Express server
├── twitch/
│   ├── auth.js            # OAuth & token management
│   ├── eventListener.js   # EventSub event handlers
│   └── chatListener.js    # Chat event handlers
└── bridges/
    └── eventBridge.js     # Socket.io event delivery
```

### Naming Conventions

- **Files**: camelCase (`eventListener.js`)
- **Variables**: camelCase (`const userName = ...`)
- **Constants**: UPPER_SNAKE_CASE (`const DEFAULT_PORT = 3000`)
- **Functions**: camelCase (`function handleRaid () { }`)
- **Event names**: `twitch:eventname` (all lowercase, colon separator)

## Event Data Guidelines

When adding or modifying event data:

1. **Keep it rich**: Include useful metadata (profile images, account ages, etc.)
2. **Handle errors gracefully**: Use try-catch, provide fallback values
3. **Document everything**: Update `EVENT_DATA.md` with:
   - Field name and type
   - Description of what it contains
   - Example usage code
4. **Maintain backwards compatibility**: Don't remove existing fields without discussion

### Example: Adding a New Field

```javascript
// eventListener.js
await this.listener.onChannelRaidFrom(userId, async (event) => {
  try {
    const raider = await event.getRaidingBroadcaster()
    const user = await raider.getUser()

    // Existing fields
    const eventData = {
      username: raider.userName,
      displayName: raider.displayName,
      viewerCount: event.viewers,
      // ...
    }

    // New field (with fallback)
    try {
      eventData.accountCreationDate = user.creationDate
    } catch (err) {
      console.warn('[EventSub] Could not fetch account creation date:', err.message)
      eventData.accountCreationDate = null
    }

    eventBridge.handleEvent({
      type: 'raid',
      data: eventData
    })
  } catch (error) {
    // Fallback to basic data
    eventBridge.handleEvent({
      type: 'raid',
      data: { username: 'Unknown', viewerCount: 0 }
    })
  }
})
```

## Documentation

When making changes, update:

- **README.md**: User-facing features, setup instructions, troubleshooting
- **EVENT_DATA.md**: Event data structures, examples, tips
- **CONTRIBUTING.md** (this file): Developer guidelines, code style
- **Code comments**: Complex logic, non-obvious decisions

## Common Pitfalls

### Circular Dependencies

The auth provider is a singleton shared between EventSub and Chat. Use lazy loading in `eventBridge.js`:

```javascript
function getAuthProvider () {
  if (!authProvider) {
    const { getAuthProvider: importedProvider } = require('../twitch/auth')
    authProvider = importedProvider()
  }
  return authProvider
}
```

### Token Refresh

Never modify token refresh logic without thorough testing:
- Easy Mode uses proxy `/refresh` endpoint
- Self-Hosted Mode uses local refresh with client secret
- Both modes must handle refresh failures gracefully

### Event Filtering

Chat filtering is enabled by default. When testing chat events:
- Send messages starting with `!` (default filter)
- Or disable filtering via API: `POST /api/chat/filters` with `{"enabled": false}`

## Questions?

- Open an issue for questions about contributing
- Check existing issues and PRs for similar discussions
- Read the [Twurple documentation](https://twurple.js.org/) for API questions

## License

By contributing, you agree that your contributions will be licensed under the ISC License.

---

**Thank you for contributing to TTV Toaster!**
