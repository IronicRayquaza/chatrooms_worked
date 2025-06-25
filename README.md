# AOS Chatroom

A real-time web-based chatroom application that integrates with AOS (Arweave Operating System).

## Features

- Real-time messaging using Socket.IO
- User registration and management
- Integration with AOS process
- Modern, responsive UI
- Production-ready deployment configuration

## Local Development

### Prerequisites

- Node.js (version 16 or higher)
- AOS CLI installed globally: `npm install -g aos`

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set environment variables:
   ```bash
   # Windows
   set AOS_PROCESS_ID=your_process_id
   
   # Linux/Mac
   export AOS_PROCESS_ID=your_process_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Deployment

### Option 1: Render (Recommended - Free Tier)

1. **Fork/Clone** this repository to your GitHub account
2. **Sign up** for a free account at [render.com](https://render.com)
3. **Create a new Web Service** and connect your GitHub repository
4. **Configure the service**:
   - **Name**: `aos-chatroom` (or any name you prefer)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. **Set Environment Variables**:
   - `AOS_PROCESS_ID`: Generate a unique process ID (e.g., `chatroom-${Date.now()}`)
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render will override this)

6. **Deploy** - Render will automatically deploy your app and provide a URL

### Option 2: Heroku

1. **Install Heroku CLI** and login
2. **Create a new Heroku app**:
   ```bash
   heroku create your-app-name
   ```

3. **Set environment variables**:
   ```bash
   heroku config:set AOS_PROCESS_ID=your_process_id
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**:
   ```bash
   git push heroku main
   ```

### Option 3: Railway

1. **Sign up** at [railway.app](https://railway.app)
2. **Connect your GitHub repository**
3. **Set environment variables** in the Railway dashboard:
   - `AOS_PROCESS_ID`: Your unique process ID
   - `NODE_ENV`: `production`

4. **Deploy** - Railway will automatically deploy your app

### Option 4: DigitalOcean App Platform

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

## Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `AOS_PROCESS_ID` | Unique identifier for the AOS process | Yes | `chatroom-12345` |
| `NODE_ENV` | Environment mode | No | `production` |
| `PORT` | Server port (set by hosting platform) | No | `3000` |

## Important Notes for Deployment

### AOS Dependency
Your application depends on the AOS CLI being available in the deployment environment. Most cloud platforms don't have AOS pre-installed, so you'll need to:

1. **Install AOS during build** by adding to your `package.json`:
   ```json
   {
     "scripts": {
       "postinstall": "npm install -g aos"
     }
   }
   ```

2. **Or use a custom Dockerfile** (see Docker deployment section below)

### Process ID Management
- Generate a unique `AOS_PROCESS_ID` for each deployment
- Consider using environment-specific IDs (e.g., `chatroom-prod`, `chatroom-staging`)
- The process ID should be consistent across deployments of the same environment

## Docker Deployment

If you prefer Docker deployment, create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

# Install AOS globally
RUN npm install -g aos

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

## Troubleshooting

### Common Issues

1. **AOS not found**: Ensure AOS is installed globally in your deployment environment
2. **Process ID conflicts**: Use unique process IDs for different deployments
3. **Port binding**: Most platforms set their own PORT environment variable
4. **WebSocket issues**: Ensure your hosting platform supports WebSocket connections

### Health Check
Your app includes a health check endpoint at `/health` that returns:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## License

MIT License 