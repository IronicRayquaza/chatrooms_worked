require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { spawn } = require('child_process');
const path = require('path');

// Security headers for production
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Add debugging middleware (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    next();
  });
}

// Check for required environment variables
if (!process.env.AOS_PROCESS_ID) {
  process.exit(1);
}

// Serve static files with debugging
app.use(express.static('public', {
  dotfiles: 'allow',
  etag: true,
  index: 'index.html',
  lastModified: true
}));

// Add a test route
app.get('/test', (req, res) => {
  res.send('Server is running!');
});

// Health check endpoint for deployment platforms
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Store connected users and their socket IDs
const connectedUsers = new Map();
const userSockets = new Map();

// Get the aos executable path
const aosPath = process.platform === 'win32' 
  ? path.join(process.env.APPDATA, 'npm', 'aos.cmd')
  : 'aos';

// Start aos process
const aos = spawn(aosPath, ['--process', process.env.AOS_PROCESS_ID], {
  shell: true,
  stdio: ['pipe', 'pipe', 'pipe']
});

aos.stdout.on('data', (data) => {
  const output = data.toString();
  try {
    // Try to parse the output as JSON
    const message = JSON.parse(output);
    // Handle different types of messages
    if (message.Action === "Broadcast" && message.From && message.Data) {
      // Broadcast to all clients except the sender
      const senderSocket = userSockets.get(message.From);
      io.sockets.sockets.forEach((socket) => {
        if (socket !== senderSocket) {
          const messageToSend = {
            username: message.From,
            text: message.Data,
            timestamp: new Date().toISOString()
          };
          socket.emit('message', messageToSend);
        }
      });
    }
  } catch (error) {
    // If it's not JSON, it might be a regular output message
  }
});

aos.stderr.on('data', (data) => {
  // No error logging
});

aos.on('error', (error) => {
  // No error logging
});

aos.on('close', (code) => {
  // No exit logging
});

// Load the chatroom script
aos.stdin.write('.load chatroom_final\n');

// Handle WebSocket connections from web clients
io.on('connection', (socket) => {
  // Handle user registration
  socket.on('register', (userId) => {
    connectedUsers.set(socket.id, userId);
    userSockets.set(userId, socket);
    // Register with aos process
    const registerMessage = {
      Target: process.env.AOS_PROCESS_ID,
      Action: "Register",
      From: userId
    };
    aos.stdin.write(JSON.stringify(registerMessage) + '\n');
    // Notify all clients about new user
    io.emit('message', {
      username: 'System',
      text: `${userId} has joined the chat`,
      timestamp: new Date().toISOString()
    });
  });

  // Handle chat messages
  socket.on('message', (message) => {
    const userId = connectedUsers.get(socket.id);
    // Send message to aos process
    const broadcastMessage = {
      Target: process.env.AOS_PROCESS_ID,
      Action: "Broadcast",
      From: userId,
      Data: message.text
    };
    aos.stdin.write(JSON.stringify(broadcastMessage) + '\n');
    // Also broadcast directly to other clients
    const senderSocket = userSockets.get(userId);
    io.sockets.sockets.forEach((clientSocket) => {
      if (clientSocket !== senderSocket) {
        clientSocket.emit('message', {
          username: userId,
          text: message.text,
          timestamp: new Date().toISOString()
        });
      }
    });
  });

  socket.on('disconnect', () => {
    const userId = connectedUsers.get(socket.id);
    if (userId) {
      connectedUsers.delete(socket.id);
      userSockets.delete(userId);
      // Notify all clients about user leaving
      io.emit('message', {
        username: 'System',
        text: `${userId} has left the chat`,
        timestamp: new Date().toISOString()
      });
      // Notify aos about disconnection
      const disconnectMessage = {
        Target: process.env.AOS_PROCESS_ID,
        Action: "handleDisconnect",
        From: userId
      };
      aos.stdin.write(JSON.stringify(disconnectMessage) + '\n');
    }
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT); 