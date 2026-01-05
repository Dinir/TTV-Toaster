# TTV Toaster OAuth Proxy

This is a minimal OAuth proxy server for TTV Toaster. It handles OAuth token exchange without exposing your Client Secret to end users.

## Purpose

- Keeps `TWITCH_CLIENT_SECRET` secure on the server
- Provides `/exchange` endpoint to convert OAuth codes into tokens
- Provides `/refresh` endpoint to refresh expired tokens
- Enables "Easy Mode" for TTV Toaster users who don't want to create their own Twitch app

## Deployment

### Deploy to Railway

1. Create a new Railway project
2. Add environment variables:
   - `TWITCH_CLIENT_ID`
   - `TWITCH_CLIENT_SECRET`
3. Deploy this directory
4. Note the deployed URL (e.g., `https://your-app.railway.app`)

### Deploy to Render

1. Create a new Web Service
2. Connect this repository
3. Set root directory to `oauth-proxy`
4. Add environment variables
5. Deploy

## API Endpoints

### POST /exchange

Exchange an OAuth authorization code for tokens.

**Request:**
```json
{
  "code": "oauth_code_here",
  "redirectUri": "http://localhost:3000/auth/callback"
}
```

**Response:**
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "expiresIn": 3600,
  "scope": ["channel:read:subscriptions", ...],
  "user": {
    "id": "123456",
    "login": "username",
    "displayName": "DisplayName"
  }
}
```

### POST /refresh

Refresh an expired access token.

**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:**
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "expiresIn": 3600,
  "scope": ["channel:read:subscriptions", ...]
}
```

## Local Development

```bash
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

The server will run on `http://localhost:8080` by default.

## Security

- Never expose `TWITCH_CLIENT_SECRET` to clients
- Always use HTTPS in production
- CORS is enabled for all origins (suitable for desktop apps)
- Consider rate limiting in production
