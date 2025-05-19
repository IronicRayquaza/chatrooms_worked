// Connect to the server
const socket = io();

// DOM elements
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messagesDiv = document.getElementById('messages');
const usernameForm = document.getElementById('username-form');
const usernameInput = document.getElementById('username-input');
const chatContainer = document.getElementById('chat-container');
const usernameContainer = document.getElementById('username-container');

let currentUsername = '';

// Handle username submission
usernameForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  if (username) {
    console.log('Registering username:', username);
    currentUsername = username;
    socket.emit('register', username);
    usernameContainer.style.display = 'none';
    chatContainer.style.display = 'block';
    messageInput.disabled = false;
  }
});

// Handle message submission
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (message && currentUsername) {
    console.log('Sending message:', message);
    const messageData = {
      username: currentUsername,
      text: message,
      timestamp: new Date().toISOString()
    };
    
    // Add message to chat immediately
    addMessageToChat(messageData);
    
    // Send to server
    socket.emit('message', messageData);
    messageInput.value = '';
  }
});

// Handle incoming messages
socket.on('message', (message) => {
  console.log('Received message:', message);
  addMessageToChat(message);
});

// Handle connection status
socket.on('connect', () => {
  console.log('Connected to server');
  addMessageToChat({
    username: 'System',
    text: 'Connected to chat server',
    timestamp: new Date().toISOString()
  });
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
  addMessageToChat({
    username: 'System',
    text: 'Disconnected from chat server',
    timestamp: new Date().toISOString()
  });
});

// Add message to chat
function addMessageToChat(message) {
  console.log('Adding message to chat:', message);
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  
  const timestamp = new Date(message.timestamp).toLocaleTimeString();
  const isSystemMessage = message.username === 'System';
  
  messageElement.innerHTML = `
    <div class="message-header">
      <span class="username ${isSystemMessage ? 'system' : ''}">${message.username}</span>
      <span class="timestamp">${timestamp}</span>
    </div>
    <div class="message-content ${isSystemMessage ? 'system' : ''}">${message.text}</div>
  `;
  
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Handle Enter key in message input
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    messageForm.dispatchEvent(new Event('submit'));
  }
}); 