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

// OAuth Proxy URL (optional - for Easy Mode)
const OAUTH_PROXY_URL = process.env.OAUTH_PROXY_URL || null

// Required OAuth scopes
const SCOPES = [
  'channel:read:subscriptions',
  'channel:read:redemptions',
  'bits:read',
  'moderator:read:followers'
].join(' ')

// Check if we're in proxy mode or self-hosted mode
const isProxyMode = !process.env.TWITCH_CLIENT_ID && OAUTH_PROXY_URL
const isSelfHosted = !!(process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET)

/**
 * Setup OAuth routes
 */
function setupAuthRoutes (app) {
  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET
  const redirectUri = process.env.REDIRECT_URI || 'http://localhost:3000/auth/callback'

  // Determine mode
  if (isProxyMode) {
    console.log('[Auth Routes] Running in PROXY MODE - using OAuth proxy:', OAUTH_PROXY_URL)
    setupProxyModeRoutes(app, redirectUri)
  } else if (isSelfHosted) {
    console.log('[Auth Routes] Running in SELF-HOSTED MODE')
    setupSelfHostedRoutes(app, clientId, clientSecret, redirectUri)
  } else {
    console.warn('[Auth Routes] No OAuth configuration found')
    console.warn('  Option 1 (Easy): Set OAUTH_PROXY_URL in .env')
    console.warn('  Option 2 (Privacy): Set TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET in .env')
    return
  }
}

/**
 * Setup routes for PROXY MODE
 * Uses external OAuth proxy to handle token exchange
 */
function setupProxyModeRoutes (app, redirectUri) {
  // Get proxy's public client ID
  const getProxyClientId = async () => {
    try {
      const response = await fetch(`${OAUTH_PROXY_URL}/`)
      const data = await response.json()
      return data.clientId
    } catch (error) {
      console.error('[Auth] Failed to get proxy client ID:', error)
      return null
    }
  }

  app.get('/auth/twitch', async (req, res) => {
    const clientId = await getProxyClientId()
    if (!clientId) {
      return res.status(500).send('OAuth proxy unavailable')
    }

    const state = crypto.randomBytes(16).toString('hex')
    await fs.writeFile(STATE_FILE, JSON.stringify({ state, timestamp: Date.now() }))

    const authUrl = new URL('https://id.twitch.tv/oauth2/authorize')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', SCOPES)
    authUrl.searchParams.set('state', state)

    res.redirect(authUrl.toString())
  })

  app.get('/auth/callback', async (req, res) => {
    const { code, state } = req.query

    try {
      const savedState = await fs.readFile(STATE_FILE, 'utf8').then(JSON.parse).catch(() => null)
      if (!savedState || savedState.state !== state) {
        return res.status(400).send('Invalid state parameter')
      }

      await fs.unlink(STATE_FILE).catch(() => {})

      // Use proxy to exchange code for tokens
      const response = await fetch(`${OAUTH_PROXY_URL}/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirectUri })
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('[Auth] Proxy exchange failed:', error)
        return res.status(500).send('Failed to exchange code for token')
      }

      const data = await response.json()

      // Save tokens to file
      const tokensToSave = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
        obtainmentTimestamp: Date.now(),
        scope: data.scope,
        userId: data.user.id,
        userLogin: data.user.login,
        userDisplayName: data.user.displayName
      }

      await fs.writeFile(TOKEN_FILE, JSON.stringify(tokensToSave, null, 2))

      console.log(`[Auth] Successfully authenticated user: ${data.user.displayName} (${data.user.login})`)

      res.redirect('/?auth=success')
    } catch (error) {
      console.error('[Auth] OAuth callback error:', error)
      res.status(500).send('Authentication failed: ' + error.message)
    }
  })

  setupCommonRoutes(app)
}

/**
 * Setup routes for SELF-HOSTED MODE
 * Handles OAuth directly without proxy
 */
function setupSelfHostedRoutes (app, clientId, clientSecret, redirectUri) {
  app.get('/auth/twitch', async (req, res) => {
    const state = crypto.randomBytes(16).toString('hex')
    await fs.writeFile(STATE_FILE, JSON.stringify({ state, timestamp: Date.now() }))

    const authUrl = new URL('https://id.twitch.tv/oauth2/authorize')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', SCOPES)
    authUrl.searchParams.set('state', state)

    res.redirect(authUrl.toString())
  })

  app.get('/auth/callback', async (req, res) => {
    const { code, state } = req.query

    try {
      const savedState = await fs.readFile(STATE_FILE, 'utf8').then(JSON.parse).catch(() => null)
      if (!savedState || savedState.state !== state) {
        return res.status(400).send('Invalid state parameter')
      }

      await fs.unlink(STATE_FILE).catch(() => {})

      // Exchange code for tokens directly
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

      res.redirect('/?auth=success')
    } catch (error) {
      console.error('[Auth] OAuth callback error:', error)
      res.status(500).send('Authentication failed: ' + error.message)
    }
  })

  setupCommonRoutes(app)
}

/**
 * Setup routes common to both modes
 */
function setupCommonRoutes (app) {
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
