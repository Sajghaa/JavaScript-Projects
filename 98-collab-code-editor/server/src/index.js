const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Store active rooms and documents
const rooms = new Map();
const documents = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a room
  socket.on('join-room', ({ roomId, username, userId }) => {
    socket.join(roomId);
    
    // Initialize room if not exists
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        users: [],
        document: documents.get(roomId) || { content: '', language: 'javascript' }
      });
    }
    
    const room = rooms.get(roomId);
    room.users.push({ id: socket.id, userId, username });
    
    // Send current document to the user
    socket.emit('document-load', room.document);
    
    // Notify other users
    socket.to(roomId).emit('user-joined', { userId, username });
    
    // Send updated user list to everyone
    io.to(roomId).emit('users-update', room.users);
    
    console.log(`${username} joined room ${roomId}`);
  });
  
  // Handle code changes
  socket.on('code-change', ({ roomId, content, language }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.document = { content, language };
      socket.to(roomId).emit('code-update', { content, language, userId: socket.id });
    }
  });
  
  // Handle cursor movement
  socket.on('cursor-move', ({ roomId, position, userId, username }) => {
    socket.to(roomId).emit('cursor-update', { userId, username, position });
  });
  
  // Handle language change
  socket.on('language-change', ({ roomId, language }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.document.language = language;
      socket.to(roomId).emit('language-update', { language });
    }
  });
  
  // Handle AI code generation request
  socket.on('ai-generate', async ({ prompt, language, roomId }) => {
    // AI response simulation (will connect to real AI later)
    const generatedCode = await generateAICode(prompt, language);
    socket.emit('ai-response', { code: generatedCode });
  });
  
  // Handle AI explanation request
  socket.on('ai-explain', async ({ code, roomId }) => {
    const explanation = await explainCode(code);
    socket.emit('ai-explanation', { explanation });
  });
  
  // Leave room
  socket.on('leave-room', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (room) {
      const user = room.users.find(u => u.id === socket.id);
      room.users = room.users.filter(u => u.id !== socket.id);
      socket.leave(roomId);
      io.to(roomId).emit('users-update', room.users);
      if (user) {
        io.to(roomId).emit('user-left', { userId: user.userId });
      }
      
      // Delete room if empty
      if (room.users.length === 0) {
        rooms.delete(roomId);
      }
    }
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Remove user from all rooms
    for (const [roomId, room] of rooms) {
      const user = room.users.find(u => u.id === socket.id);
      if (user) {
        room.users = room.users.filter(u => u.id !== socket.id);
        io.to(roomId).emit('users-update', room.users);
        io.to(roomId).emit('user-left', { userId: user.userId });
        
        if (room.users.length === 0) {
          rooms.delete(roomId);
        }
      }
    }
  });
});

// AI Code Generation Simulation (will integrate real AI)
async function generateAICode(prompt, language) {
  // This is a placeholder - we'll integrate OpenAI/Gemini later
  const codeTemplates = {
    javascript: `// Generated JavaScript code for: ${prompt}\n\nfunction solution() {\n  // Your code here\n  console.log("Hello World");\n}\n\nsolution();`,
    python: `# Generated Python code for: ${prompt}\n\ndef solution():\n    # Your code here\n    print("Hello World")\n\nif __name__ == "__main__":\n    solution()`,
    java: `// Generated Java code for: ${prompt}\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}`,
    cpp: `// Generated C++ code for: ${prompt}\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World" << endl;\n    return 0;\n}`
  };
  
  return codeTemplates[language] || codeTemplates.javascript;
}

async function explainCode(code) {
  // Placeholder for AI explanation
  return "This code defines a function that prints 'Hello World' to the console.";
}

// API Routes
app.post('/api/rooms/create', (req, res) => {
  const roomId = uuidv4().slice(0, 8);
  res.json({ roomId });
});

app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  if (room) {
    res.json({ exists: true, users: room.users.length });
  } else {
    res.json({ exists: false });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});