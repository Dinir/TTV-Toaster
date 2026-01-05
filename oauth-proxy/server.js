const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 8080

// CORS - allow requests from localhost apps
app.use(cors({
  origin: true,
  credentials: true
}))

app.use(express.json())

// Health check endpoint with public client ID
app.get('/', (req, res) => {
  res.json({
    service: 'TTV Toaster OAuth Proxy',
    status: 'running',
    version: '1.0.0',
    clientId: process.env.TWITCH_CLIENT_ID // Public - safe to expose
  })
})

// Health check for hosting platforms
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' })
})

/**
 * POST /exchange
 * Exchange OAuth code for tokens
 *
 * Body: { code, redirectUri }
 * Returns: { accessToken, refreshToken, expiresIn, scope }
 */
app.post('/exchange', async (req, res) => {
  const { code, redirectUri } = req.body

  if (!code || !redirectUri) {
    return res.status(400).json({
      error: 'Missing required fields: code, redirectUri'
    })
  }

  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error('Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET')
    return res.status(500).json({
      error: 'Server configuration error'
    })
  }

  try {
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
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed:', errorText)
      return res.status(tokenResponse.status).json({
        error: 'Failed to exchange code for token',
        details: errorText
      })
    }

    const tokenData = await tokenResponse.json()

    // Get user info
    const userResponse = await fetch('https://api.twitch.tv/helix/users', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Client-Id': clientId
      }
    })

    if (!userResponse.ok) {
      console.error('Failed to get user info')
      return res.status(500).json({
        error: 'Failed to get user information'
      })
    }

    const userData = await userResponse.json()
    const user = userData.data[0]

    // Return tokens and user info to client
    res.json({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      scope: tokenData.scope,
      user: {
        id: user.id,
        login: user.login,
        displayName: user.display_name
      }
    })

    console.log(`[OAuth] Successfully authenticated user: ${user.display_name}`)
  } catch (error) {
    console.error('OAuth exchange error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
})

/**
 * POST /refresh
 * Refresh an expired access token
 *
 * Body: { refreshToken }
 * Returns: { accessToken, refreshToken, expiresIn }
 */
app.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.status(400).json({
      error: 'Missing required field: refreshToken'
    })
  }

  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return res.status(500).json({
      error: 'Server configuration error'
    })
  }

  try {
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token refresh failed:', errorText)
      return res.status(tokenResponse.status).json({
        error: 'Failed to refresh token',
        details: errorText
      })
    }

    const tokenData = await tokenResponse.json()

    res.json({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      scope: tokenData.scope
    })

    console.log('[OAuth] Successfully refreshed token')
  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`OAuth Proxy running on port ${PORT}`)
  console.log('Ready to handle OAuth requests')
})
