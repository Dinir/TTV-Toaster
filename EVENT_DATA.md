# Event Data Reference

This document lists all available data fields for each Twitch event type in TTV Toaster.

## Event Types

### `twitch:raid`

Triggered when another broadcaster raids your channel.

**Available Data:**
```javascript
{
  username: string,              // Raider's username (lowercase)
  displayName: string,           // Raider's display name
  viewerCount: number,           // Number of viewers in the raid
  profileImageUrl: string,       // Raider's profile picture URL
  broadcasterType: string,       // 'partner', 'affiliate', or '' (empty)
  description: string,           // Raider's channel description
  gameName: string,              // What they were streaming (or 'Unknown')
  gameId: string | null,         // Twitch game/category ID
  title: string                  // Their stream title
}
```

**Example:**
```javascript
document.addEventListener('twitch:raid', (event) => {
  const { displayName, viewerCount, gameName, broadcasterType } = event.detail
  const badge = broadcasterType === 'partner' ? '' : ''
  console.log(`${badge} ${displayName} raided with ${viewerCount} viewers!`)
  console.log(`They were playing: ${gameName}`)
})
```

---

### `twitch:follow`

Triggered when someone follows your channel.

**Available Data:**
```javascript
{
  username: string,              // Follower's username (lowercase)
  displayName: string,           // Follower's display name
  profileImageUrl: string,       // Follower's profile picture URL
  createdAt: Date,               // When the follower's account was created
  description: string            // Follower's profile description
}
```

**Example:**
```javascript
document.addEventListener('twitch:follow', (event) => {
  const { displayName, createdAt } = event.detail
  const accountAge = Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24))
  console.log(`${displayName} followed! Account is ${accountAge} days old.`)
})
```

---

### `twitch:subscribe`

Triggered when someone subscribes to your channel.

**Available Data:**
```javascript
{
  username: string,              // Subscriber's username (lowercase)
  displayName: string,           // Subscriber's display name
  tier: string,                  // '1000' (Tier 1), '2000' (Tier 2), '3000' (Tier 3)
  isGift: boolean,               // Whether this is a gifted sub
  profileImageUrl: string        // Subscriber's profile picture URL
}
```

**Example:**
```javascript
document.addEventListener('twitch:subscribe', (event) => {
  const { displayName, tier, isGift } = event.detail
  const tierNames = { '1000': 'Tier 1', '2000': 'Tier 2', '3000': 'Tier 3' }
  const giftText = isGift ? ' (Gift)' : ''
  console.log(`${displayName} subscribed at ${tierNames[tier]}!${giftText}`)
})
```

---

### `twitch:gift`

Triggered when someone gifts subscriptions.

**Available Data:**
```javascript
{
  username: string,              // Gifter's username (or 'Anonymous')
  displayName: string,           // Gifter's display name (or 'Anonymous')
  amount: number,                // Number of subs gifted
  tier: string,                  // '1000', '2000', or '3000'
  isAnonymous: boolean,          // Whether the gift is anonymous
  profileImageUrl: string,       // Gifter's profile picture (if not anonymous)
  cumulativeAmount: number       // Total gifts in current gifting session
}
```

**Example:**
```javascript
document.addEventListener('twitch:gift', (event) => {
  const { displayName, amount, cumulativeAmount, isAnonymous } = event.detail
  if (isAnonymous) {
    console.log(`Anonymous gifted ${amount} subs!`)
  } else {
    console.log(`${displayName} gifted ${amount} subs! (${cumulativeAmount} total this session)`)
  }
})
```

---

### `twitch:cheer`

Triggered when someone cheers with bits.

**Available Data:**
```javascript
{
  username: string,              // Cheerer's username
  displayName: string,           // Cheerer's display name
  bits: number,                  // Number of bits cheered
  message: string,               // Message included with the cheer
  isAnonymous: boolean,          // Whether the cheer is anonymous
  profileImageUrl: string        // Cheerer's profile picture URL
}
```

**Example:**
```javascript
document.addEventListener('twitch:cheer', (event) => {
  const { displayName, bits, message } = event.detail
  console.log(`${displayName} cheered ${bits} bits: "${message}"`)
})
```

---

### `twitch:redemption`

Triggered when someone redeems channel points.

**Available Data:**
```javascript
{
  username: string,              // Redeemer's username
  displayName: string,           // Redeemer's display name
  rewardTitle: string,           // Name of the channel point reward
  rewardCost: number,            // Point cost of the reward
  rewardPrompt: string,          // Description/prompt for the reward
  userInput: string,             // Text input from user (if reward requires input)
  profileImageUrl: string,       // Redeemer's profile picture URL
  redeemedAt: Date               // When the redemption occurred
}
```

**Example:**
```javascript
document.addEventListener('twitch:redemption', (event) => {
  const { displayName, rewardTitle, rewardCost, userInput } = event.detail
  console.log(`${displayName} redeemed "${rewardTitle}" (${rewardCost} points)`)
  if (userInput) {
    console.log(`Their message: ${userInput}`)
  }
})
```

---

### `twitch:chat`

Triggered when a chat message passes the configured filters.

**Available Data:**
```javascript
{
  username: string,              // Chatter's username (lowercase)
  displayName: string,           // Chatter's display name
  message: string,               // The chat message
  color: string,                 // Chatter's username color (hex)
  isMod: boolean,                // Whether chatter is a moderator
  isSubscriber: boolean,         // Whether chatter is a subscriber
  isVip: boolean,                // Whether chatter is a VIP
  badges: object                 // Badge information
}
```

**Example:**
```javascript
document.addEventListener('twitch:chat', (event) => {
  const { displayName, message, isMod, isSubscriber } = event.detail
  const badges = []
  if (isMod) badges.push('=�')
  if (isSubscriber) badges.push('P')
  console.log(`${badges.join('')} ${displayName}: ${message}`)
})
```

**Note:** Chat filtering is enabled by default. Only messages starting with `!` are emitted to prevent spam. Configure filters in `.chat-filters.json` or via `/api/chat/filters`.

---

## Tips

### Displaying Profile Images

All user events now include `profileImageUrl`. You can use this to show avatars:

```javascript
document.addEventListener('twitch:raid', (event) => {
  const { displayName, profileImageUrl, viewerCount } = event.detail

  const img = document.createElement('img')
  img.src = profileImageUrl
  img.style.width = '50px'
  img.style.borderRadius = '50%'

  // Show the image with your custom notification
})
```

### Detecting Partners/Affiliates

Use `broadcasterType` to show special badges:

```javascript
const getBadge = (broadcasterType) => {
  if (broadcasterType === 'partner') return ''
  if (broadcasterType === 'affiliate') return '�'
  return ''
}
```

### Account Age Detection

Useful for follow events to detect potential bot accounts:

```javascript
document.addEventListener('twitch:follow', (event) => {
  const { displayName, createdAt } = event.detail
  const daysSinceCreation = (Date.now() - createdAt) / (1000 * 60 * 60 * 24)

  if (daysSinceCreation < 7) {
    console.log(`� New account! ${displayName} account is only ${Math.floor(daysSinceCreation)} days old`)
  }
})
```

### Filtering by Game/Category

For raids, you can react differently based on what game they were playing:

```javascript
document.addEventListener('twitch:raid', (event) => {
  const { displayName, gameName, viewerCount } = event.detail

  if (gameName === 'Just Chatting') {
    console.log(`${displayName} came from a Just Chatting stream!`)
  } else if (gameName === 'Minecraft') {
    console.log(`Fellow Minecrafter ${displayName} raided!`)
  }
})
```
