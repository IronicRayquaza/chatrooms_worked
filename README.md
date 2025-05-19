# AOS Chatroom

A real-time chat application built with Node.js, Socket.IO, and AOS (Arweave Operating System). This application allows users to communicate in real-time through a web interface while leveraging the AOS messaging system.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm (Node Package Manager)
- AOS CLI (Arweave Operating System Command Line Interface)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chat_final
```

2. Install dependencies:
```bash
npm install
```

3. Install AOS globally (if not already installed):
```bash
npm install -g aos
```

## Configuration

1. Create a `.env` file in the root directory:
```bash
touch .env
```

2. Add the following environment variables to the `.env` file:
```
AOS_PROCESS_ID=your_aos_process_id
PORT=3000
```

Replace `your_aos_process_id` with your actual AOS process ID.

## Project Structure

```
chat_final/
├── public/
│   ├── index.html    # Main HTML file
│   ├── style.css     # CSS styles
│   └── app.js        # Client-side JavaScript
├── server.js         # Node.js server
├── chatroom_final.lua # AOS Lua script
├── package.json      # Project dependencies
└── .env             # Environment variables
```

## Running the Application

1. Start the AOS process:
```bash
aos
```

2. In the AOS terminal, load the chatroom script:
```
.load chatroom_final
```

3. In a new terminal, start the Node.js server:
```bash
node server.js
```

4. Open your web browser and navigate to:
```
http://localhost:3000
```

## Using the Chat

1. Enter your username in the input field and click "Join Chat"
2. Once joined, you can start sending messages
3. Open multiple browser windows to simulate different users
4. Messages will be broadcasted to all connected users in real-time

## Features

- Real-time messaging using Socket.IO
- User registration and presence
- System messages for user join/leave events
- Timestamp display for messages
- Modern and responsive UI
- Integration with AOS messaging system

## Troubleshooting

If you encounter any issues:

1. Check that AOS is running and the process ID is correct
2. Verify that the server is running on the correct port
3. Check the browser console (F12) for any client-side errors
4. Check the server terminal for any server-side errors
5. Ensure all dependencies are properly installed

Common issues:
- "AOS not found": Make sure AOS is installed globally
- "Cannot connect to server": Check if the server is running
- "Messages not appearing": Check browser console for errors

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License - see the LICENSE file for details. 