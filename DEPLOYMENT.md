# Deployment Guide

This guide will help you deploy your AOS Chatroom application to various hosting platforms.

## Quick Start - Render (Recommended)

Render offers a free tier and is the easiest platform to deploy on.

### Step 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

### Step 2: Deploy on Render

1. **Sign up** at [render.com](https://render.com)
2. **Click "New +"** and select **"Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service**:
   - **Name**: `aos-chatroom` (or any name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. **Set Environment Variables**:
   - Click on **"Environment"** tab
   - Add these variables:
     - `AOS_PROCESS_ID`: `chatroom-${Date.now()}` (e.g., `chatroom-1704067200000`)
     - `NODE_ENV`: `production`

6. **Deploy**: Click **"Create Web Service"**

7. **Wait for deployment** - Render will build and deploy your app

8. **Access your app** - Render will provide a URL like `https://your-app-name.onrender.com`

## Alternative Platforms

### Heroku

1. **Install Heroku CLI**:
   ```bash
   # Windows
   winget install --id=Heroku.HerokuCLI
   
   # macOS
   brew tap heroku/brew && brew install heroku
   ```

2. **Login to Heroku**:
   ```bash
   heroku login
   ```

3. **Create Heroku app**:
   ```bash
   heroku create your-app-name
   ```

4. **Set environment variables**:
   ```bash
   heroku config:set AOS_PROCESS_ID=chatroom-$(date +%s)
   heroku config:set NODE_ENV=production
   ```

5. **Deploy**:
   ```bash
   git push heroku main
   ```

6. **Open your app**:
   ```bash
   heroku open
   ```

### Railway

1. **Sign up** at [railway.app](https://railway.app)
2. **Connect your GitHub repository**
3. **Create a new service** from your repository
4. **Set environment variables** in the Railway dashboard:
   - `AOS_PROCESS_ID`: `chatroom-${Date.now()}`
   - `NODE_ENV`: `production`
5. **Deploy** - Railway will automatically deploy your app

### DigitalOcean App Platform

1. **Sign up** for DigitalOcean
2. **Create a new app** and connect your GitHub repository
3. **Configure**:
   - **Source**: GitHub repository
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Run Command**: `npm start`
4. **Set environment variables**:
   - `AOS_PROCESS_ID`: Your unique process ID
   - `NODE_ENV`: `production`
5. **Deploy** - DigitalOcean will build and deploy your app

## Docker Deployment

If you prefer containerized deployment:

### Build and Run Locally

```bash
# Build the Docker image
docker build -t aos-chatroom .

# Run the container
docker run -p 3000:3000 -e AOS_PROCESS_ID=chatroom-123 -e NODE_ENV=production aos-chatroom
```

### Deploy to Docker Platforms

#### Docker Hub + Any VPS

1. **Build and push to Docker Hub**:
   ```bash
   docker build -t yourusername/aos-chatroom .
   docker push yourusername/aos-chatroom
   ```

2. **Deploy on any VPS**:
   ```bash
   docker pull yourusername/aos-chatroom
   docker run -d -p 3000:3000 -e AOS_PROCESS_ID=chatroom-123 aos-chatroom
   ```

#### Google Cloud Run

1. **Enable Cloud Run API**
2. **Deploy**:
   ```bash
   gcloud run deploy aos-chatroom \
     --image gcr.io/your-project/aos-chatroom \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars AOS_PROCESS_ID=chatroom-123,NODE_ENV=production
   ```

## Environment Variables

All platforms require these environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `AOS_PROCESS_ID` | Unique identifier for AOS process | `chatroom-1704067200000` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (auto-set by platform) | `3000` |

## Troubleshooting

### Common Issues

1. **AOS not found error**:
   - The `postinstall` script in `package.json` should install AOS globally
   - If it fails, the app will continue but AOS features won't work
   - Check the build logs for AOS installation errors

2. **Process ID conflicts**:
   - Use unique process IDs for each deployment
   - Consider using timestamps: `chatroom-${Date.now()}`

3. **WebSocket connection issues**:
   - Most platforms support WebSocket connections
   - If you see connection errors, check if your platform supports WebSockets

4. **Port binding errors**:
   - Most platforms set their own PORT environment variable
   - Your app should use `process.env.PORT || 3000`

### Health Check

Your app includes a health check endpoint at `/health`. You can test it:

```bash
curl https://your-app-url.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Monitoring

- **Render**: Built-in logs and metrics
- **Heroku**: `heroku logs --tail`
- **Railway**: Built-in logging dashboard
- **DigitalOcean**: App platform monitoring

## Cost Considerations

- **Render**: Free tier available, $7/month for paid plans
- **Heroku**: Free tier discontinued, $7/month minimum
- **Railway**: $5/month minimum
- **DigitalOcean**: $5/month minimum
- **Google Cloud Run**: Pay per use, very cheap for low traffic

## Security Notes

- Your app includes basic security headers
- Consider adding HTTPS redirects for production
- The AOS process ID should be kept private
- Consider rate limiting for production use

## Next Steps

After deployment:

1. **Test the application** thoroughly
2. **Set up monitoring** and alerts
3. **Configure custom domain** (optional)
4. **Set up CI/CD** for automatic deployments
5. **Add SSL certificate** if not provided by platform 