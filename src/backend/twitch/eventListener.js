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
    await this.listener.onChannelRaidTo(userId, async (event) => {
      // Get additional raider information
      try {
        const raider = await event.getRaidingBroadcaster()
        const raiderChannel = await this.apiClient.channels.getChannelInfoById(event.raidingBroadcasterId)

        eventBridge.handleRaid({
          username: event.raidingBroadcasterName,
          displayName: event.raidingBroadcasterDisplayName,
          viewerCount: event.viewers,
          // Additional raider info
          profileImageUrl: raider.profilePictureUrl,
          broadcasterType: raider.broadcasterType, // 'partner', 'affiliate', or empty string
          description: raider.description,
          // Current stream category
          gameName: raiderChannel?.gameName || 'Unknown',
          gameId: raiderChannel?.gameId || null,
          title: raiderChannel?.title || ''
        })
      } catch (error) {
        console.error('[EventSub] Error fetching raid details:', error.message)
        // Fallback to basic data
        eventBridge.handleRaid({
          username: event.raidingBroadcasterName,
          displayName: event.raidingBroadcasterDisplayName,
          viewerCount: event.viewers
        })
      }
    })
    console.log('[EventSub] Subscribed to: Raids')

    // Subscribe to follows
    await this.listener.onChannelFollow(userId, userId, async (event) => {
      try {
        const user = await event.getUser()
        eventBridge.handleFollow({
          username: event.userName,
          displayName: event.userDisplayName,
          profileImageUrl: user.profilePictureUrl,
          createdAt: user.creationDate,
          description: user.description
        })
      } catch (error) {
        console.error('[EventSub] Error fetching follow details:', error.message)
        eventBridge.handleFollow({
          username: event.userName,
          displayName: event.userDisplayName
        })
      }
    })
    console.log('[EventSub] Subscribed to: Follows')

    // Subscribe to subscriptions
    await this.listener.onChannelSubscription(userId, async (event) => {
      try {
        const user = await event.getUser()
        eventBridge.handleSubscribe({
          username: event.userName,
          displayName: event.userDisplayName,
          tier: event.tier,
          isGift: event.isGift,
          profileImageUrl: user.profilePictureUrl
        })
      } catch (error) {
        console.error('[EventSub] Error fetching sub details:', error.message)
        eventBridge.handleSubscribe({
          username: event.userName,
          displayName: event.userDisplayName,
          tier: event.tier,
          isGift: event.isGift
        })
      }
    })
    console.log('[EventSub] Subscribed to: Subscriptions')

    // Subscribe to gift subscriptions
    await this.listener.onChannelSubscriptionGift(userId, async (event) => {
      try {
        // Anonymous gifts won't have a gifter
        if (!event.isAnonymous && event.gifterUserId) {
          const gifter = await event.getGifter()
          eventBridge.handleGift({
            username: event.gifterName || 'Anonymous',
            displayName: event.gifterDisplayName || 'Anonymous',
            amount: event.amount,
            tier: event.tier,
            isAnonymous: event.isAnonymous,
            profileImageUrl: gifter?.profilePictureUrl,
            cumulativeAmount: event.cumulativeAmount // Total gifts in current session
          })
        } else {
          eventBridge.handleGift({
            username: 'Anonymous',
            displayName: 'Anonymous',
            amount: event.amount,
            tier: event.tier,
            isAnonymous: true,
            cumulativeAmount: event.cumulativeAmount
          })
        }
      } catch (error) {
        console.error('[EventSub] Error fetching gift details:', error.message)
        eventBridge.handleGift({
          username: event.gifterName || 'Anonymous',
          displayName: event.gifterDisplayName || 'Anonymous',
          amount: event.amount,
          tier: event.tier,
          isAnonymous: event.isAnonymous
        })
      }
    })
    console.log('[EventSub] Subscribed to: Gift Subscriptions')

    // Subscribe to cheers (bits)
    await this.listener.onChannelCheer(userId, async (event) => {
      try {
        const user = await event.getUser()
        eventBridge.handleCheer({
          username: event.userName,
          displayName: event.userDisplayName,
          bits: event.bits,
          message: event.message,
          isAnonymous: event.isAnonymous,
          profileImageUrl: user?.profilePictureUrl
        })
      } catch (error) {
        console.error('[EventSub] Error fetching cheer details:', error.message)
        eventBridge.handleCheer({
          username: event.userName,
          displayName: event.userDisplayName,
          bits: event.bits,
          message: event.message,
          isAnonymous: event.isAnonymous
        })
      }
    })
    console.log('[EventSub] Subscribed to: Cheers/Bits')

    // Subscribe to channel points redemptions
    await this.listener.onChannelRedemptionAdd(userId, async (event) => {
      try {
        const user = await event.getUser()
        eventBridge.handleRedemption({
          username: event.userName,
          displayName: event.userDisplayName,
          rewardTitle: event.rewardTitle,
          rewardCost: event.rewardCost,
          rewardPrompt: event.rewardPrompt,
          userInput: event.input,
          profileImageUrl: user.profilePictureUrl,
          redeemedAt: event.redemptionDate
        })
      } catch (error) {
        console.error('[EventSub] Error fetching redemption details:', error.message)
        eventBridge.handleRedemption({
          username: event.userName,
          displayName: event.userDisplayName,
          rewardTitle: event.rewardTitle,
          rewardCost: event.rewardCost,
          userInput: event.input
        })
      }
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
