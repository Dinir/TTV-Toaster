const crypto = require('crypto')
const fs = require('fs').promises
const path = require('path')

/**
 * OAuth Authentication Routes
 *
 * Handles Twitch OAuth flow for user authentication
 */

const TOKEN_FILE = path.join(__dirname, '../../../.tokens.json')
const STATE_FILE = path.join(__dirname, '../../../.oauth-state.json')

// Required OAuth scopes
const SCOPES = [
  'channel:read:subscriptions',
  'channel:read:redemptions',
  'bits:read',
  'moderator:read:followers'
].join(' ')

/**
 * Setup OAuth routes
 */
function setupAuthRoutes (app) {
  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET
  const redirectUri = process.env.REDIRECT_URI || 'http://localhost:3000/auth/callback'

  if (!clientId || !clientSecret) {
    console.warn('[Auth Routes] Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET - OAuth will not work')
    return
  }

  /**
   * GET /auth/twitch
   * Initiates OAuth flow by redirecting to Twitch
   */
  app.get('/auth/twitch', async (req, res) => {
    // Generate random state for CSRF protection
    const state = crypto.randomBytes(16).toString('hex')

    // Save state temporarily
    await fs.writeFile(STATE_FILE, JSON.stringify({ state, timestamp: Date.now() }))

    // Build Twitch OAuth URL
    const authUrl = new URL('https://id.twitch.tv/oauth2/authorize')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', SCOPES)
    authUrl.searchParams.set('state', state)

    res.redirect(authUrl.toString())
  })

  /**
   * GET /auth/callback
   * Handles OAuth callback from Twitch
   */
  app.get('/auth/callback', async (req, res) => {
    const { code, state } = req.query

    try {
      // Verify state to prevent CSRF
      const savedState = await fs.readFile(STATE_FILE, 'utf8').then(JSON.parse).catch(() => null)
      if (!savedState || savedState.state !== state) {
        return res.status(400).send('Invalid state parameter - possible CSRF attack')
      }

      // Delete used state
      await fs.unlink(STATE_FILE).catch(() => {})

      // Exchange code for tokens
      const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri
        })
      })

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text()
        console.error('[Auth] Token exchange failed:', error)
        return res.status(500).send('Failed to exchange code for token')
      }

      const tokenData = await tokenResponse.json()

      // Get user info
      const userResponse = await fetch('https://api.twitch.tv/helix/users', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'Client-Id': clientId
        }
      })

      const userData = await userResponse.json()
      const user = userData.data[0]

      // Save tokens to file
      const tokensToSave = {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        obtainmentTimestamp: Date.now(),
        scope: tokenData.scope,
        userId: user.id,
        userLogin: user.login,
        userDisplayName: user.display_name
      }

      await fs.writeFile(TOKEN_FILE, JSON.stringify(tokensToSave, null, 2))

      console.log(`[Auth] Successfully authenticated user: ${user.display_name} (${user.login})`)

      // Redirect to success page
      res.redirect('/?auth=success')
    } catch (error) {
      console.error('[Auth] OAuth callback error:', error)
      res.status(500).send('Authentication failed: ' + error.message)
    }
  })

  /**
   * GET /auth/status
   * Check if user is authenticated
   */
  app.get('/auth/status', async (req, res) => {
    try {
      const tokenData = await fs.readFile(TOKEN_FILE, 'utf8').then(JSON.parse).catch(() => null)

      if (!tokenData) {
        return res.json({ authenticated: false })
      }

      res.json({
        authenticated: true,
        user: {
          id: tokenData.userId,
          login: tokenData.userLogin,
          displayName: tokenData.userDisplayName
        }
      })
    } catch (error) {
      res.json({ authenticated: false })
    }
  })

  /**
   * POST /auth/logout
   * Clear saved tokens
   */
  app.post('/auth/logout', async (req, res) => {
    try {
      await fs.unlink(TOKEN_FILE).catch(() => {})
      res.json({ success: true })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  })
}

module.exports = { setupAuthRoutes }
