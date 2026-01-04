# Twitch Event Reference

This document lists all available properties for each Twitch event type in your scratch.html page.

## Event: `twitch:raid`

Fired when another broadcaster raids your channel.

```javascript
document.addEventListener('twitch:raid', (event) => {
  const data = event.detail
  // Available properties:
  // data.username          - Raider's username (lowercase)
  // data.displayName       - Raider's display name
  // data.viewerCount       - Number of viewers in the raid
  // data.profileImageUrl   - Raider's profile picture URL
  // data.broadcasterType   - 'partner', 'affiliate', or '' (empty string)
  // data.description       - Raider's channel description
  // data.gameName          - Game/category the raider was streaming
  // data.gameId            - Twitch game/category ID
  // data.title             - Raider's stream title
})
```

## Event: `twitch:follow`

Fired when someone follows your channel.

```javascript
document.addEventListener('twitch:follow', (event) => {
  const data = event.detail
  // Available properties:
  // data.username          - Follower's username (lowercase)
  // data.displayName       - Follower's display name
  // data.profileImageUrl   - Follower's profile picture URL
  // data.createdAt         - Date when the follower's account was created
  // data.description       - Follower's profile description
})
```

## Event: `twitch:subscribe`

Fired when someone subscribes to your channel.

```javascript
document.addEventListener('twitch:subscribe', (event) => {
  const data = event.detail
  // Available properties:
  // data.username          - Subscriber's username (lowercase)
  // data.displayName       - Subscriber's display name
  // data.tier              - '1000' (Tier 1), '2000' (Tier 2), or '3000' (Tier 3)
  // data.isGift            - true if this sub was gifted, false otherwise
  // data.profileImageUrl   - Subscriber's profile picture URL
})
```

## Event: `twitch:gift`

Fired when someone gifts subscriptions.

```javascript
document.addEventListener('twitch:gift', (event) => {
  const data = event.detail
  // Available properties:
  // data.username          - Gifter's username (or 'Anonymous')
  // data.displayName       - Gifter's display name (or 'Anonymous')
  // data.amount            - Number of subs gifted
  // data.tier              - '1000' (Tier 1), '2000' (Tier 2), or '3000' (Tier 3)
  // data.isAnonymous       - true if the gift was anonymous
  // data.profileImageUrl   - Gifter's profile picture URL (if not anonymous)
  // data.cumulativeAmount  - Total gifts in current session
})
```

## Event: `twitch:cheer`

Fired when someone cheers bits.

```javascript
document.addEventListener('twitch:cheer', (event) => {
  const data = event.detail
  // Available properties:
  // data.username          - Cheerer's username
  // data.displayName       - Cheerer's display name
  // data.bits              - Number of bits cheered
  // data.message           - Message attached to the cheer
  // data.isAnonymous       - true if anonymous cheer
  // data.profileImageUrl   - Cheerer's profile picture URL
})
```

## Event: `twitch:redemption`

Fired when someone redeems channel points.

```javascript
document.addEventListener('twitch:redemption', (event) => {
  const data = event.detail
  // Available properties:
  // data.username          - Redeemer's username
  // data.displayName       - Redeemer's display name
  // data.rewardTitle       - Name of the channel point reward
  // data.rewardCost        - Cost in channel points
  // data.rewardPrompt      - Description/prompt for the reward
  // data.userInput         - Text input from the user (if reward requires input)
  // data.profileImageUrl   - Redeemer's profile picture URL
  // data.redeemedAt        - Date when the redemption occurred
})
```

## Event: `twitch:chat`

Fired when a chat message passes your filters.

```javascript
document.addEventListener('twitch:chat', (event) => {
  const data = event.detail
  // Available properties:
  // data.username          - Chatter's username (lowercase)
  // data.displayName       - Chatter's display name
  // data.message           - The chat message text
  // data.color             - Chatter's username color (hex code)
  // data.isMod             - true if the chatter is a moderator
  // data.isSubscriber      - true if the chatter is a subscriber
  // data.isVip             - true if the chatter is a VIP
  // data.badges            - Object containing badge information
})
```

## Notes

- **Profile Images**: All profile image URLs can be used directly in `<img>` tags
- **Broadcaster Type**: 'partner' = Twitch Partner, 'affiliate' = Twitch Affiliate, '' = neither
- **Tier Values**: Tier is represented as a string: '1000', '2000', or '3000'
- **Dates**: All date fields are JavaScript Date objects
- **Fallback Values**: If data can't be fetched, events will still fire with basic information

## Example: Showing Profile Pictures

```javascript
document.addEventListener('twitch:raid', (event) => {
  const { displayName, viewerCount, profileImageUrl } = event.detail

  // Create notification with profile picture
  const notification = document.createElement('div')
  notification.innerHTML = `
    <img src="${profileImageUrl}" alt="${displayName}" width="50" height="50">
    <p>${displayName} raided with ${viewerCount} viewers!</p>
  `
  document.body.appendChild(notification)
})
```

## Example: Filtering by Broadcaster Type

```javascript
document.addEventListener('twitch:raid', (event) => {
  const { displayName, broadcasterType, viewerCount } = event.detail

  // Special treatment for partner raids
  if (broadcasterType === 'partner') {
    console.log(`<‰ PARTNER RAID from ${displayName}!`)
    // Show special animation
  } else {
    console.log(`Raid from ${displayName}`)
  }
})
```
