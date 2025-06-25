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
let isScrolledToBottom = true;
let hasJoinedChat = false; // Track if user has joined

// Check if user is scrolled to bottom
function checkScrollPosition() {
    const { scrollTop, scrollHeight, clientHeight } = messagesDiv;
    isScrolledToBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
}

// Scroll to bottom smoothly
function scrollToBottom() {
    messagesDiv.scrollTo({
        top: messagesDiv.scrollHeight,
        behavior: 'smooth'
    });
}

// Scroll to bottom immediately (for new messages)
function scrollToBottomImmediate() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Handle username submission
usernameForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  if (username) {
    currentUsername = username;
    socket.emit('register', username);
    usernameContainer.style.display = 'none';
    chatContainer.style.display = 'block';
    messageInput.disabled = false;
    messageInput.focus();
    hasJoinedChat = true;
    // Show connected message only after joining
    addMessageToChat({
      username: 'System',
      text: 'Connected to chat server',
      timestamp: new Date().toISOString()
    });
  }
});

// Handle message submission
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (message && currentUsername) {
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
    messageInput.focus();
  }
});

// Handle incoming messages
socket.on('message', (message) => {
  addMessageToChat(message);
});

// Handle connection status
socket.on('connect', () => {
  // Only show system message if user has joined
  if (hasJoinedChat) {
    addMessageToChat({
      username: 'System',
      text: 'Connected to chat server',
      timestamp: new Date().toISOString()
    });
  }
});

socket.on('disconnect', () => {
  addMessageToChat({
    username: 'System',
    text: 'Disconnected from chat server',
    timestamp: new Date().toISOString()
  });
});

// Add message to chat
function addMessageToChat(message) {
  // Check scroll position before adding message
  checkScrollPosition();
  
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  
  const timestamp = new Date(message.timestamp).toLocaleTimeString();
  const isSystemMessage = message.username === 'System';
  
  // Sanitize message text to prevent XSS
  const sanitizedText = escapeHtml(message.text);
  
  messageElement.innerHTML = `
    <div class="message-header">
      <span class="username ${isSystemMessage ? 'system' : ''}">${escapeHtml(message.username)}</span>
      <span class="timestamp">${timestamp}</span>
    </div>
    <div class="message-content ${isSystemMessage ? 'system' : ''}">${sanitizedText}</div>
  `;
  
  messagesDiv.appendChild(messageElement);
  
  // Scroll to bottom if user was already at bottom, or if it's their own message
  if (isScrolledToBottom || message.username === currentUsername) {
    scrollToBottomImmediate();
  }
  
  // Limit number of messages to prevent memory issues (keep last 100 messages)
  const messages = messagesDiv.querySelectorAll('.message');
  if (messages.length > 100) {
    messages[0].remove();
  }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Handle scroll events
messagesDiv.addEventListener('scroll', checkScrollPosition);

// Handle Enter key in message input
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    messageForm.dispatchEvent(new Event('submit'));
  }
});

// Auto-resize text input for long messages
messageInput.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 100) + 'px';
});

// Focus management
document.addEventListener('click', (e) => {
  if (e.target.closest('#chat-container') && !e.target.closest('#message-form')) {
    messageInput.focus();
  }
});

// Handle window resize
window.addEventListener('resize', () => {
  if (isScrolledToBottom) {
    scrollToBottomImmediate();
  }
}); 