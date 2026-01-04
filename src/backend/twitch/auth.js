const { RefreshingAuthProvider } = require('@twurple/auth')
const fs = require('fs').promises
const path = require('path')

/**
 * Twitch Authentication Handler
 *
 * Manages OAuth tokens using the RefreshingAuthProvider from @twurple
 * Automatically refreshes tokens when they expire
 */

const TOKEN_FILE = path.join(__dirname, '../../../.tokens.json')

class TwitchAuth {
  constructor () {
    this.authProvider = null
  }

  /**
   * Initialize auth provider with stored or new tokens
   */
  async initialize () {
    // Return existing auth provider if already initialized
    if (this.authProvider) {
      return this.authProvider
    }

    const clientId = process.env.TWITCH_CLIENT_ID
    const clientSecret = process.env.TWITCH_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error('Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET in environment variables')
    }

    // Try to load existing tokens
    let tokenData = await this.loadTokens()

    if (!tokenData) {
      // If no stored tokens, use tokens from .env
      const accessToken = process.env.TWITCH_ACCESS_TOKEN
      const refreshToken = process.env.TWITCH_REFRESH_TOKEN

      if (!accessToken) {
        throw new Error(
          'No tokens found. Please provide TWITCH_ACCESS_TOKEN in .env or run OAuth flow.\n' +
          'Visit: https://twitchtokengenerator.com/ to generate tokens easily.\n' +
          'Required scopes: channel:read:subscriptions channel:read:redemptions bits:read moderator:read:followers'
        )
      }

      tokenData = {
        accessToken,
        refreshToken,
        expiresIn: 0,
        obtainmentTimestamp: 0
      }
    }

    // Create refreshing auth provider
    this.authProvider = new RefreshingAuthProvider({
      clientId,
      clientSecret
    })

    // Add user with token data
    // Use scopes from token data if available, otherwise use default scopes
    const scopes = tokenData.scope || ['channel:read:subscriptions', 'channel:read:redemptions', 'bits:read', 'moderator:read:followers', 'chat:read']

    // Register the user with the auth provider
    // Use addUserForToken which works better with ChatClient
    await this.authProvider.addUserForToken(tokenData, ['chat'])

    // Set up token refresh callback to save new tokens
    this.authProvider.onRefresh(async (userId, newTokenData) => {
      await this.saveTokens(newTokenData)
      console.log('[Auth] Tokens refreshed and saved')
    })

    console.log('[Auth] Authentication initialized successfully')
    return this.authProvider
  }

  /**
   * Load tokens from file
   */
  async loadTokens () {
    try {
      const data = await fs.readFile(TOKEN_FILE, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      return null
    }
  }

  /**
   * Save tokens to file
   */
  async saveTokens (tokenData) {
    await fs.writeFile(TOKEN_FILE, JSON.stringify(tokenData, null, 2))
  }

  /**
   * Get the auth provider instance
   */
  getAuthProvider () {
    if (!this.authProvider) {
      throw new Error('Auth provider not initialized. Call initialize() first.')
    }
    return this.authProvider
  }
}

// Export singleton instance
module.exports = new TwitchAuth()
