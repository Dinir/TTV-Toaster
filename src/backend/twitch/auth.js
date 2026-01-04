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

// OAuth Proxy URL (optional - for Easy Mode)
const OAUTH_PROXY_URL = process.env.OAUTH_PROXY_URL || null

class TwitchAuth {
  constructor () {
    this.authProvider = null
  }

  /**
   * Get client credentials (either from env or proxy)
   */
  async getClientCredentials () {
    // Check if we have local credentials (self-hosted mode)
    if (process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET) {
      return {
        clientId: process.env.TWITCH_CLIENT_ID,
        clientSecret: process.env.TWITCH_CLIENT_SECRET
      }
    }

    // Try to get from proxy (easy mode)
    if (OAUTH_PROXY_URL) {
      try {
        const response = await fetch(`${OAUTH_PROXY_URL}/`)
        const data = await response.json()
        if (data.clientId) {
          // Note: In proxy mode, we don't have the client secret locally
          // The proxy handles token refresh, so we use a placeholder
          return {
            clientId: data.clientId,
            clientSecret: 'unused-in-proxy-mode'
          }
        }
      } catch (error) {
        console.error('[Auth] Failed to get credentials from proxy:', error.message)
      }
    }

    throw new Error('Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET in environment variables, and no OAuth proxy configured')
  }

  /**
   * Initialize auth provider with stored or new tokens
   */
  async initialize () {
    // Return existing auth provider if already initialized
    if (this.authProvider) {
      return this.authProvider
    }

    const { clientId, clientSecret } = await this.getClientCredentials()

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
    // In proxy mode, we need custom refresh logic
    if (OAUTH_PROXY_URL && clientSecret === 'unused-in-proxy-mode') {
      this.authProvider = new RefreshingAuthProvider({
        clientId,
        clientSecret: clientSecret,
        onRefresh: async (userId, tokenData) => {
          // Use proxy to refresh token
          try {
            const response = await fetch(`${OAUTH_PROXY_URL}/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken: tokenData.refreshToken })
            })

            if (!response.ok) {
              throw new Error('Token refresh failed')
            }

            const newTokenData = await response.json()
            await this.saveTokens({
              accessToken: newTokenData.accessToken,
              refreshToken: newTokenData.refreshToken,
              expiresIn: newTokenData.expiresIn,
              obtainmentTimestamp: Date.now(),
              scope: newTokenData.scope,
              userId: tokenData.userId,
              userLogin: tokenData.userLogin,
              userDisplayName: tokenData.userDisplayName
            })
            console.log('[Auth] Tokens refreshed via proxy and saved')
            return newTokenData
          } catch (error) {
            console.error('[Auth] Proxy token refresh failed:', error.message)
            throw error
          }
        }
      })
    } else {
      this.authProvider = new RefreshingAuthProvider({
        clientId,
        clientSecret
      })
    }

    // Add user with token data
    // Use scopes from token data if available, otherwise use default scopes
    const scopes = tokenData.scope || ['channel:read:subscriptions', 'channel:read:redemptions', 'bits:read', 'moderator:read:followers', 'chat:read']

    // Register the user with the auth provider
    // Use addUserForToken which works better with ChatClient
    await this.authProvider.addUserForToken(tokenData, ['chat'])

    // Set up token refresh callback to save new tokens (for self-hosted mode)
    if (!OAUTH_PROXY_URL || clientSecret !== 'unused-in-proxy-mode') {
      this.authProvider.onRefresh(async (userId, newTokenData) => {
        await this.saveTokens(newTokenData)
        console.log('[Auth] Tokens refreshed and saved')
      })
    }

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
