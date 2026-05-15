const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios'); // Only declare ONCE
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

// Language configuration for code execution
const LANGUAGE_MAP = {
  javascript: { language: 'javascript', version: '18.15.0' },
  python: { language: 'python', version: '3.10.0' },
  java: { language: 'java', version: '15.0.2' },
  cpp: { language: 'cpp', version: '10.2.0' },
  html: { language: 'html', version: '5.0' },
  css: { language: 'css', version: '3.0' }
};

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

// Code execution endpoint
app.post('/api/execute', async (req, res) => {
  const { code, language } = req.body;
  
  try {
    const langConfig = LANGUAGE_MAP[language];
    if (!langConfig) {
      return res.json({ error: `Language ${language} not supported for execution` });
    }
    
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language: langConfig.language,
      version: langConfig.version,
      files: [{ content: code }]
    });
    
    const output = response.data.run.output;
    const error = response.data.run.stderr;
    
    res.json({
      success: true,
      output: output || (error ? `Error: ${error}` : 'No output'),
      executionTime: response.data.run.time
    });
  } catch (error) {
    console.error('Execution error:', error);
    res.json({ 
      success: false, 
      error: error.response?.data?.message || 'Execution failed. Please try again.' 
    });
  }
});

// Get supported languages
app.get('/api/languages', async (req, res) => {
  try {
    const response = await axios.get('https://emkc.org/api/v2/piston/runtimes');
    const languages = response.data.map(r => ({ language: r.language, version: r.version }));
    res.json(languages);
  } catch (error) {
    res.json(LANGUAGE_MAP);
  }
});

// AI Code Generation
async function generateAICode(prompt, language) {
  const codeTemplates = {
    javascript: `// Generated JavaScript code for: ${prompt}\n\nfunction solution() {\n  // Your code here\n  console.log("Hello World");\n}\n\nsolution();`,
    python: `# Generated Python code for: ${prompt}\n\ndef solution():\n    # Your code here\n    print("Hello World")\n\nif __name__ == "__main__":\n    solution()`,
    java: `// Generated Java code for: ${prompt}\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}`,
    cpp: `// Generated C++ code for: ${prompt}\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World" << endl;\n    return 0;\n}`
  };
  
  return codeTemplates[language] || codeTemplates.javascript;
}

async function explainCode(code) {
  return "This code defines a function that prints 'Hello World' to the console.";
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a room
  socket.on('join-room', ({ roomId, username, userId }) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        users: [],
        document: documents.get(roomId) || { content: '', language: 'javascript' }
      });
    }
    
    const room = rooms.get(roomId);
    room.users.push({ id: socket.id, userId, username });
    
    socket.emit('document-load', room.document);
    socket.to(roomId).emit('user-joined', { userId, username });
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
  
  // Handle code execution
  socket.on('execute-code', async ({ roomId, code, language }) => {
    try {
      const langConfig = LANGUAGE_MAP[language];
      if (!langConfig) {
        socket.emit('execution-result', { error: `Language ${language} not supported` });
        return;
      }
      
      const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
        language: langConfig.language,
        version: langConfig.version,
        files: [{ content: code }]
      });
      
      socket.emit('execution-result', {
        output: response.data.run.output || 'No output',
        error: response.data.run.stderr,
        executionTime: response.data.run.time
      });
    } catch (error) {
      socket.emit('execution-result', { error: 'Execution failed. Please try again.' });
    }
  });
  
  // Handle AI generation
  socket.on('ai-generate', async ({ prompt, language, roomId }) => {
    const generatedCode = await generateAICode(prompt, language);
    socket.emit('ai-response', { code: generatedCode });
  });
  
  // Handle AI explanation
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
      
      if (room.users.length === 0) {
        rooms.delete(roomId);
      }
    }
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});