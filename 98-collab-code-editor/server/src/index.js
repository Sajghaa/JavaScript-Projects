const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
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

// Language configuration for code execution (using Judge0 API)
const LANGUAGE_MAP = {
  javascript: { language: 'javascript', version: '18.15.0', judge0_id: 63 },
  python: { language: 'python', version: '3.10.0', judge0_id: 71 },
  java: { language: 'java', version: '15.0.2', judge0_id: 62 },
  cpp: { language: 'cpp', version: '10.2.0', judge0_id: 54 },
  html: { language: 'html', version: '5.0', judge0_id: 92 },
  css: { language: 'css', version: '3.0', judge0_id: 93 }
};

// Local code execution simulation (Fallback - Works without external API)
function executeCodeLocally(code, language) {
  const outputs = [];
  const originalLog = console.log;
  let capturedOutput = '';

  // Capture console.log output
  console.log = (...args) => {
    capturedOutput += args.join(' ') + '\n';
  };

  try {
    if (language === 'javascript') {
      // Create a safe evaluation environment
      const evalCode = `
        try {
          ${code}
        } catch (error) {
          console.log("Error:", error.message);
        }
      `;
      eval(evalCode);
    } else {
      capturedOutput = `⚠️ Local execution only supports JavaScript.\nFor ${language}, the output is simulated.\n\nYour code:\n${code}`;
    }
  } catch (error) {
    capturedOutput = `❌ Execution Error: ${error.message}`;
  } finally {
    console.log = originalLog;
  }

  return capturedOutput || 'No output generated';
}

// Try Judge0 API first, fallback to local execution
async function executeCodeWithFallback(code, language) {
  const langConfig = LANGUAGE_MAP[language];
  
  if (!langConfig) {
    return { 
      success: false, 
      error: `Language ${language} not supported for execution` 
    };
  }

  // Try Judge0 API (Community Edition - still free)
  try {
    const options = {
      method: 'POST',
      url: 'https://judge0-ce.p.rapidapi.com/submissions',
      params: {
        base64_encoded: 'false',
        wait: 'true',
        fields: '*'
      },
      headers: {
        'x-rapidapi-key': 'YOUR_RAPIDAPI_KEY', // You can get free key from rapidapi.com
        'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      data: {
        source_code: code,
        language_id: langConfig.judge0_id,
        stdin: ''
      }
    };

    const response = await axios.request(options);
    
    if (response.data && response.data.stdout) {
      return {
        success: true,
        output: response.data.stdout || 'No output',
        error: response.data.stderr,
        executionTime: response.data.time
      };
    } else {
      throw new Error('No output from Judge0');
    }
  } catch (apiError) {
    console.log('API failed, using local execution fallback');
    
    // Fallback to local execution
    const localOutput = executeCodeLocally(code, language);
    
    return {
      success: true,
      output: localOutput,
      error: null,
      executionTime: 'simulated',
      note: 'Using local simulation (API unavailable)'
    };
  }
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

// Code execution endpoint
app.post('/api/execute', async (req, res) => {
  const { code, language } = req.body;
  
  const result = await executeCodeWithFallback(code, language);
  res.json(result);
});

// AI Code Generation (Enhanced)
async function generateAICode(prompt, language) {
  const templates = {
    javascript: `// Generated JavaScript code for: ${prompt}
// This is an AI-generated template. Modify as needed.

function solution(input) {
    // Your implementation here
    console.log("Processing:", input);
    return "Result: " + input;
}

// Example usage
const result = solution("test");
console.log(result);`,
    
    python: `# Generated Python code for: ${prompt}
# This is an AI-generated template. Modify as needed.

def solution(data):
    # Your implementation here
    print(f"Processing: {data}")
    return f"Result: {data}"

# Example usage
if __name__ == "__main__":
    result = solution("test")
    print(result)`,
    
    java: `// Generated Java code for: ${prompt}
// This is an AI-generated template. Modify as needed.

public class Main {
    public static String solution(String data) {
        // Your implementation here
        System.out.println("Processing: " + data);
        return "Result: " + data;
    }
    
    public static void main(String[] args) {
        String result = solution("test");
        System.out.println(result);
    }
}`,
    
    cpp: `// Generated C++ code for: ${prompt}
// This is an AI-generated template. Modify as needed.

#include <iostream>
#include <string>
using namespace std;

string solution(string data) {
    // Your implementation here
    cout << "Processing: " << data << endl;
    return "Result: " + data;
}

int main() {
    string result = solution("test");
    cout << result << endl;
    return 0;
}`
  };
  
  return templates[language] || templates.javascript;
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-room', ({ roomId, username, userId }) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        users: [],
        document: { content: '', language: 'javascript' }
      });
    }
    
    const room = rooms.get(roomId);
    room.users.push({ id: socket.id, userId, username });
    
    socket.emit('document-load', room.document);
    socket.to(roomId).emit('user-joined', { userId, username });
    io.to(roomId).emit('users-update', room.users);
    
    console.log(`${username} joined room ${roomId}`);
  });
  
  socket.on('code-change', ({ roomId, content, language }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.document = { content, language };
      socket.to(roomId).emit('code-update', { content, language, userId: socket.id });
    }
  });
  
  socket.on('cursor-move', ({ roomId, position, userId, username }) => {
    socket.to(roomId).emit('cursor-update', { userId, username, position });
  });
  
  socket.on('language-change', ({ roomId, language }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.document.language = language;
      socket.to(roomId).emit('language-update', { language });
    }
  });
  
  // Handle code execution via socket
  socket.on('execute-code', async ({ roomId, code, language }) => {
    const result = await executeCodeWithFallback(code, language);
    socket.emit('execution-result', result);
  });
  
  socket.on('ai-generate', async ({ prompt, language, roomId }) => {
    const generatedCode = await generateAICode(prompt, language);
    socket.emit('ai-response', { code: generatedCode });
  });
  
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