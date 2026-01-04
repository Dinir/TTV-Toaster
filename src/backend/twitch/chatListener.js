const { ChatClient } = require('@twurple/chat')
const twitchAuth = require('./auth')
const eventBridge = require('../eventBridge')
const fs = require('fs').promises
const path = require('path')

/**
 * Twitch Chat Listener
 *
 * Connects to Twitch chat with user-configurable filters to prevent spam
 * Filters can be set via chat-filters.json or API
 */

const FILTERS_FILE = path.join(__dirname, '../../../.chat-filters.json')

// Default filters (safe for big channels)
const DEFAULT_FILTERS = {
  enabled: true,
  // Only emit messages that match at least one condition
  conditions: {
    startsWithPrefix: '!', // Messages starting with ! (commands)
    mentionsBot: false, // Mentions the broadcaster (set dynamically)
    containsKeywords: [], // Custom keywords like ['hello', 'test']
    fromSpecificUsers: [], // Specific usernames
    minLength: 0, // Minimum message length (0 = disabled)
    maxLength: 0 // Maximum message length (0 = disabled)
  },
  // Rate limiting to prevent spam
  rateLimit: {
    enabled: true,
    maxMessagesPerSecond: 10 // Max messages to emit per second
  }
}

class TwitchChatListener {
  constructor () {
    this.chatClient = null
    this.channelName = null
    this.filters = { ...DEFAULT_FILTERS }
    this.messageQueue = []
    this.lastEmitTime = 0
  }

  /**
   * Load filters from file
   */
  async loadFilters () {
    try {
      const data = await fs.readFile(FILTERS_FILE, 'utf8')
      this.filters = { ...DEFAULT_FILTERS, ...JSON.parse(data) }
      console.log('[Chat] Loaded custom filters')
    } catch (error) {
      // No custom filters, use defaults
      this.filters = { ...DEFAULT_FILTERS }
      console.log('[Chat] Using default filters')
    }
  }

  /**
   * Save filters to file
   */
  async saveFilters (newFilters) {
    this.filters = { ...this.filters, ...newFilters }
    await fs.writeFile(FILTERS_FILE, JSON.stringify(this.filters, null, 2))
    console.log('[Chat] Filters updated and saved')
  }

  /**
   * Check if a message passes the filters
   */
  messagePassesFilters (username, message) {
    if (!this.filters.enabled) {
      return true // Filters disabled, allow all
    }

    const conditions = this.filters.conditions

    // Check prefix
    if (conditions.startsWithPrefix && message.startsWith(conditions.startsWithPrefix)) {
      return true
    }

    // Check if mentions broadcaster
    if (conditions.mentionsBot && message.toLowerCase().includes(`@${this.channelName.toLowerCase()}`)) {
      return true
    }

    // Check keywords
    if (conditions.containsKeywords && conditions.containsKeywords.length > 0) {
      const lowerMessage = message.toLowerCase()
      if (conditions.containsKeywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
        return true
      }
    }

    // Check specific users
    if (conditions.fromSpecificUsers && conditions.fromSpecificUsers.length > 0) {
      if (conditions.fromSpecificUsers.includes(username.toLowerCase())) {
        return true
      }
    }

    // Check message length
    if (conditions.minLength > 0 && message.length < conditions.minLength) {
      return false
    }

    if (conditions.maxLength > 0 && message.length > conditions.maxLength) {
      return false
    }

    // If no conditions matched and we have conditions set, reject
    const hasAnyCondition = conditions.startsWithPrefix ||
                           conditions.mentionsBot ||
                           (conditions.containsKeywords && conditions.containsKeywords.length > 0) ||
                           (conditions.fromSpecificUsers && conditions.fromSpecificUsers.length > 0)

    return !hasAnyCondition // If no conditions set, allow all
  }

  /**
   * Apply rate limiting
   */
  shouldEmitMessage () {
    if (!this.filters.rateLimit.enabled) {
      return true
    }

    const now = Date.now()
    const timeSinceLastEmit = now - this.lastEmitTime
    const minInterval = 1000 / this.filters.rateLimit.maxMessagesPerSecond

    if (timeSinceLastEmit >= minInterval) {
      this.lastEmitTime = now
      return true
    }

    return false
  }

  /**
   * Initialize and start listening to chat
   */
  async initialize () {
    try {
      // Load filters
      await this.loadFilters()

      // Initialize auth
      const authProvider = await twitchAuth.initialize()

      // Get channel name from token file
      const tokenData = await twitchAuth.loadTokens()
      if (!tokenData || !tokenData.userLogin) {
        throw new Error('Could not get user info from token file')
      }

      this.channelName = tokenData.userLogin

      console.log(`[Chat] Connecting to channel: ${tokenData.userDisplayName}`)

      // Create chat client
      this.chatClient = new ChatClient({
        authProvider,
        channels: [this.channelName]
      })

      // Listen to messages
      this.chatClient.onMessage((channel, user, message, msg) => {
        // Apply filters
        if (!this.messagePassesFilters(user, message)) {
          return // Filtered out
        }

        // Apply rate limiting
        if (!this.shouldEmitMessage()) {
          return // Rate limited
        }

        // Emit the message
        eventBridge.handleChatMessage({
          username: user,
          displayName: msg.userInfo.displayName,
          message,
          color: msg.userInfo.color,
          isMod: msg.userInfo.isMod,
          isSubscriber: msg.userInfo.isSubscriber,
          isVip: msg.userInfo.isVip,
          badges: msg.userInfo.badges
        })
      })

      // Connect
      await this.chatClient.connect()
      console.log('[Chat] Connected successfully')
      console.log('[Chat] Filters:', JSON.stringify(this.filters, null, 2))
    } catch (error) {
      console.error('[Chat] Failed to initialize:', error.message)
      throw error
    }
  }

  /**
   * Stop listening and clean up
   */
  async stop () {
    if (this.chatClient) {
      await this.chatClient.quit()
      console.log('[Chat] Disconnected')
    }
  }

  /**
   * Get current filters
   */
  getFilters () {
    return this.filters
  }
}

// Export singleton instance
module.exports = new TwitchChatListener()
