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
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });
}

// Check for required environment variables
if (!process.env.AOS_PROCESS_ID) {
  console.error('Error: AOS_PROCESS_ID is not set in environment variables');
  console.error('Please set it using:');
  console.error('Windows: set AOS_PROCESS_ID=your_process_id');
  console.error('Linux/Mac: export AOS_PROCESS_ID=your_process_id');
  console.error('For deployment, set this in your hosting platform\'s environment variables');
  process.exit(1);
}

console.log('Starting aos process...');
console.log('AOS Process ID:', process.env.AOS_PROCESS_ID);

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

console.log('Using aos path:', aosPath);

// Start aos process
const aos = spawn(aosPath, ['--process', process.env.AOS_PROCESS_ID], {
  shell: true,
  stdio: ['pipe', 'pipe', 'pipe']
});

aos.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('Raw AOS output:', output);
  
  try {
    // Try to parse the output as JSON
    const message = JSON.parse(output);
    console.log('Parsed AOS message:', message);
    
    // Handle different types of messages
    if (message.Action === "Broadcast" && message.From && message.Data) {
      console.log('Broadcasting message:', {
        from: message.From,
        data: message.Data,
        connectedUsers: Array.from(connectedUsers.values()),
        userSockets: Array.from(userSockets.keys())
      });

      // Broadcast to all clients except the sender
      const senderSocket = userSockets.get(message.From);
      let broadcastCount = 0;

      io.sockets.sockets.forEach((socket) => {
        if (socket !== senderSocket) {
          const messageToSend = {
            username: message.From,
            text: message.Data,
            timestamp: new Date().toISOString()
          };
          console.log('Sending to socket:', socket.id, messageToSend);
          socket.emit('message', messageToSend);
          broadcastCount++;
        }
      });

      console.log(`Broadcasted message to ${broadcastCount} clients`);
    }
  } catch (error) {
    console.log('Error parsing AOS output:', error);
    // If it's not JSON, it might be a regular output message
    if (output.includes('Registered') || output.includes('Broadcasted')) {
      console.log('AOS status message:', output);
    }
  }
});

aos.stderr.on('data', (data) => {
  console.error('AOS error:', data.toString());
});

aos.on('error', (error) => {
  console.error('Failed to start aos process:', error);
  console.log('Please make sure aos is installed and available in your PATH');
  console.log('You can install it using: npm install -g aos');
});

aos.on('close', (code) => {
  console.log('AOS process exited with code:', code);
});

// Load the chatroom script
aos.stdin.write('.load chatroom_final\n');

// Handle WebSocket connections from web clients
io.on('connection', (socket) => {
  console.log('Web client connected');

  // Handle user registration
  socket.on('register', (userId) => {
    console.log('User registering:', userId);
    connectedUsers.set(socket.id, userId);
    userSockets.set(userId, socket);
    
    // Register with aos process
    const registerMessage = {
      Target: process.env.AOS_PROCESS_ID,
      Action: "Register",
      From: userId
    };
    console.log('Sending register message:', registerMessage);
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
    console.log('Received chat message from client:', message);
    const userId = connectedUsers.get(socket.id);
    console.log('User ID for socket:', socket.id, 'is:', userId);
    
    // Send message to aos process
    const broadcastMessage = {
      Target: process.env.AOS_PROCESS_ID,
      Action: "Broadcast",
      From: userId,
      Data: message.text
    };
    console.log('Sending broadcast message to AOS:', broadcastMessage);
    
    // Send the message to aos
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
      console.log('User disconnecting:', userId);
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
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`AOS Process ID: ${process.env.AOS_PROCESS_ID}`);
  console.log(`Static files being served from: ${path.join(__dirname, 'public')}`);
}); 