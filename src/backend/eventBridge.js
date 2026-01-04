const { io } = require('./server')

/**
 * Event Bridge - Normalizes Twitch events and emits them to connected clients
 *
 * This module receives raw Twitch events, transforms them into a standardized
 * format, and broadcasts them to all connected scratch pages via Socket.io
 */

class EventBridge {
  constructor (socketIo) {
    this.io = socketIo
  }

  /**
   * Emit a normalized event to all connected clients
   * @param {string} eventType - Type of event (e.g., 'raid', 'follow', 'subscribe')
   * @param {object} eventData - Event payload data
   */
  emit (eventType, eventData) {
    const normalizedEvent = {
      type: eventType,
      data: eventData,
      timestamp: Date.now()
    }

    console.log(`[EventBridge] Emitting event: twitch:${eventType}`, normalizedEvent.data)

    // Emit to all connected clients
    this.io.emit('twitch-event', normalizedEvent)
  }

  /**
   * Handle raid event
   * @param {object} raidData - { username, viewerCount, displayName }
   */
  handleRaid (raidData) {
    this.emit('raid', {
      username: raidData.username,
      displayName: raidData.displayName || raidData.username,
      viewerCount: raidData.viewerCount
    })
  }

  /**
   * Handle follow event
   * @param {object} followData - { username, displayName }
   */
  handleFollow (followData) {
    this.emit('follow', {
      username: followData.username,
      displayName: followData.displayName || followData.username
    })
  }

  /**
   * Handle subscription event
   * @param {object} subData - { username, displayName, tier }
   */
  handleSubscribe (subData) {
    this.emit('subscribe', {
      username: subData.username,
      displayName: subData.displayName || subData.username,
      tier: subData.tier || '1000' // 1000, 2000, 3000 (Tier 1, 2, 3)
    })
  }

  /**
   * Handle gift subscription event
   * @param {object} giftData - { username, displayName, amount, tier, isAnonymous }
   */
  handleGift (giftData) {
    this.emit('gift', {
      username: giftData.username,
      displayName: giftData.displayName || giftData.username,
      amount: giftData.amount,
      tier: giftData.tier || '1000',
      isAnonymous: giftData.isAnonymous || false
    })
  }

  /**
   * Handle cheer/bits event
   * @param {object} cheerData - { username, displayName, bits, message }
   */
  handleCheer (cheerData) {
    this.emit('cheer', {
      username: cheerData.username,
      displayName: cheerData.displayName || cheerData.username,
      bits: cheerData.bits,
      message: cheerData.message || ''
    })
  }

  /**
   * Handle channel points redemption event
   * @param {object} redemptionData - { username, displayName, rewardTitle, userInput }
   */
  handleRedemption (redemptionData) {
    this.emit('redemption', {
      username: redemptionData.username,
      displayName: redemptionData.displayName || redemptionData.username,
      rewardTitle: redemptionData.rewardTitle,
      userInput: redemptionData.userInput || ''
    })
  }
}

// Create singleton instance
const eventBridge = new EventBridge(io)

module.exports = eventBridge
