const { EventSubWsListener } = require('@twurple/eventsub-ws')
const { ApiClient } = require('@twurple/api')
const twitchAuth = require('./auth')
const eventBridge = require('../eventBridge')

/**
 * Twitch EventSub Listener
 *
 * Connects to Twitch EventSub via WebSocket and listens for channel events
 * No need for public webhook URL - uses WebSocket connection instead
 */

class TwitchEventListener {
  constructor () {
    this.listener = null
    this.apiClient = null
    this.channelId = null
  }

  /**
   * Initialize and start listening to Twitch events
   */
  async initialize () {
    try {
      // Initialize auth
      const authProvider = await twitchAuth.initialize()

      // Create API client
      this.apiClient = new ApiClient({ authProvider })

      // Get channel info from token file (has userId)
      const tokenData = await twitchAuth.loadTokens()
      if (!tokenData || !tokenData.userId) {
        throw new Error('Could not get user info from token file')
      }

      this.channelId = tokenData.userId
      console.log(`[EventSub] Listening to channel: ${tokenData.userDisplayName} (ID: ${this.channelId})`)

      // Create WebSocket listener (no public URL needed!)
      this.listener = new EventSubWsListener({ apiClient: this.apiClient })

      // Subscribe to events
      await this.subscribeToEvents()

      // Start listening
      this.listener.start()
      console.log('[EventSub] WebSocket listener started successfully')
    } catch (error) {
      console.error('[EventSub] Failed to initialize:', error.message)
      throw error
    }
  }

  /**
   * Subscribe to all supported Twitch events
   */
  async subscribeToEvents () {
    const userId = this.channelId

    // Subscribe to raids
    await this.listener.onChannelRaidTo(userId, (event) => {
      eventBridge.handleRaid({
        username: event.raidingBroadcasterName,
        displayName: event.raidingBroadcasterDisplayName,
        viewerCount: event.viewers
      })
    })
    console.log('[EventSub] Subscribed to: Raids')

    // Subscribe to follows
    await this.listener.onChannelFollow(userId, userId, (event) => {
      eventBridge.handleFollow({
        username: event.userName,
        displayName: event.userDisplayName
      })
    })
    console.log('[EventSub] Subscribed to: Follows')

    // Subscribe to subscriptions
    await this.listener.onChannelSubscription(userId, (event) => {
      eventBridge.handleSubscribe({
        username: event.userName,
        displayName: event.userDisplayName,
        tier: event.tier
      })
    })
    console.log('[EventSub] Subscribed to: Subscriptions')

    // Subscribe to gift subscriptions
    await this.listener.onChannelSubscriptionGift(userId, (event) => {
      eventBridge.handleGift({
        username: event.gifterName || 'Anonymous',
        displayName: event.gifterDisplayName || 'Anonymous',
        amount: event.amount,
        tier: event.tier,
        isAnonymous: event.isAnonymous
      })
    })
    console.log('[EventSub] Subscribed to: Gift Subscriptions')

    // Subscribe to cheers (bits)
    await this.listener.onChannelCheer(userId, (event) => {
      eventBridge.handleCheer({
        username: event.userName,
        displayName: event.userDisplayName,
        bits: event.bits,
        message: event.message
      })
    })
    console.log('[EventSub] Subscribed to: Cheers/Bits')

    // Subscribe to channel points redemptions
    await this.listener.onChannelRedemptionAdd(userId, (event) => {
      eventBridge.handleRedemption({
        username: event.userName,
        displayName: event.userDisplayName,
        rewardTitle: event.rewardTitle,
        userInput: event.input
      })
    })
    console.log('[EventSub] Subscribed to: Channel Points Redemptions')
  }

  /**
   * Stop listening and clean up
   */
  async stop () {
    if (this.listener) {
      await this.listener.stop()
      console.log('[EventSub] Listener stopped')
    }
  }
}

// Export singleton instance
module.exports = new TwitchEventListener()
