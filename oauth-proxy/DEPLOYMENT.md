# Deploying the OAuth Proxy

This guide shows how to deploy the OAuth proxy to various hosting platforms.

## Why Deploy This?

The OAuth proxy allows users to run TTV Toaster in "Easy Mode" without creating their own Twitch app. It keeps the Client Secret secure on the server while still allowing users to authenticate.

## Prerequisites

1. Create a Twitch app at https://dev.twitch.tv/console/apps
2. Set OAuth Redirect URL to: `http://localhost:3000/auth/callback`
3. Save your Client ID and Client Secret

## Deploy to Railway (Free Tier Available)

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Deploy from GitHub**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose this repository
   - Set root directory to `oauth-proxy`

3. **Add Environment Variables**
   - Click on your service
   - Go to "Variables" tab
   - Add:
     ```
     TWITCH_CLIENT_ID=your_client_id
     TWITCH_CLIENT_SECRET=your_client_secret
     PORT=8080
     ```

4. **Deploy**
   - Railway will auto-deploy
   - Copy the public URL (e.g., `https://twitch-toaster-proxy.railway.app`)

5. **Share with Users**
   - Users add this to their `.env`:
     ```
     OAUTH_PROXY_URL=https://twitch-toaster-proxy.railway.app
     ```

## Deploy to Render (Free Tier Available)

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New +"
   - Select "Web Service"
   - Connect your GitHub repository

3. **Configure Service**
   - **Name**: twitch-toaster-oauth-proxy
   - **Root Directory**: `oauth-proxy`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Add Environment Variables**
   - Scroll to "Environment Variables"
   - Add:
     ```
     TWITCH_CLIENT_ID=your_client_id
     TWITCH_CLIENT_SECRET=your_client_secret
     ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment
   - Copy the public URL (e.g., `https://twitch-toaster-proxy.onrender.com`)

## Deploy to Fly.io (Free Tier Available)

1. **Install flyctl**
   ```bash
   # macOS
   brew install flyctl

   # Windows
   iwr https://fly.io/install.ps1 -useb | iex

   # Linux
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login to Fly.io**
   ```bash
   flyctl auth login
   ```

3. **Navigate to oauth-proxy directory**
   ```bash
   cd oauth-proxy
   ```

4. **Initialize Fly app**
   ```bash
   flyctl launch
   # Follow prompts, say yes to defaults
   ```

5. **Set Environment Variables**
   ```bash
   flyctl secrets set TWITCH_CLIENT_ID=your_client_id
   flyctl secrets set TWITCH_CLIENT_SECRET=your_client_secret
   ```

6. **Deploy**
   ```bash
   flyctl deploy
   ```

7. **Get URL**
   ```bash
   flyctl status
   # Copy the URL
   ```

## Verify Deployment

Test your deployed proxy:

```bash
curl https://your-proxy-url.com/health
# Should return: {"status":"healthy"}

curl https://your-proxy-url.com/
# Should return service info with your client ID
```

## Security Best Practices

1. **Use HTTPS**: All platforms provide free SSL certificates
2. **Monitor Logs**: Check for suspicious activity
3. **Rate Limiting**: Consider adding rate limiting in production
4. **Environment Variables**: Never commit secrets to git
5. **Update Dependencies**: Run `npm update` regularly

## Cost Estimates

| Platform | Free Tier | Paid (if needed) |
|----------|-----------|------------------|
| Railway  | 500 hrs/month | ~$5/month |
| Render   | 750 hrs/month | ~$7/month |
| Fly.io   | 3 VMs free | ~$2/month |

For a small OAuth proxy, the free tier is usually sufficient.

## Troubleshooting

### "Cannot find module 'express'"
- Make sure `npm install` runs in build command
- Check that `package.json` is in the root directory

### "Missing TWITCH_CLIENT_ID"
- Verify environment variables are set
- Restart the service after adding variables

### CORS errors
- The proxy has CORS enabled for all origins
- Check browser console for specific error messages

### 502 Bad Gateway
- Service may be starting up (wait 30 seconds)
- Check logs for errors
- Verify PORT environment variable

## Updating the Proxy

When you push changes to GitHub:

- **Railway**: Auto-deploys from main branch
- **Render**: Auto-deploys from main branch
- **Fly.io**: Run `flyctl deploy` manually

## Support

If you run into issues, check:
1. Service logs on your hosting platform
2. Health endpoint: `https://your-url.com/health`
3. Environment variables are set correctly
