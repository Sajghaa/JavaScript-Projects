import React, { useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import { Play, Terminal, X, Loader } from 'lucide-react';
import './App.css';  

// Types
interface User {
  id: string;
  userId: string;
  username: string;
}

interface Document {
  content: string;
  language: string;
}

interface ExecutionResult {
  output?: string;
  error?: string;
  executionTime?: number;
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [code, setCode] = useState<string>(`// Welcome to Collaborative Code Editor
// Write your code and click RUN to execute!
// Support: JavaScript, Python, Java, C++

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci(10):", fibonacci(10));
console.log("Hello from Collaborative Editor!");`);
  
  const [language, setLanguage] = useState<string>('javascript');
  const [users, setUsers] = useState<User[]>([]);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [output, setOutput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [showOutput, setShowOutput] = useState<boolean>(false);

  // Language extensions for download
  const extensions: Record<string, string> = {
    javascript: 'js', python: 'py', java: 'java', cpp: 'cpp', html: 'html', css: 'css'
  };

  // Sample code templates
  const templates: Record<string, string> = {
    javascript: `// JavaScript Sample
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci(10):", fibonacci(10));
console.log("Hello from Collaborative Editor!");`,
    
    python: `# Python Sample
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(f"Fibonacci(10): {fibonacci(10)}")
print("Hello from Collaborative Editor!")`,
    
    java: `// Java Sample
public class Main {
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n-1) + fibonacci(n-2);
    }
    
    public static void main(String[] args) {
        System.out.println("Fibonacci(10): " + fibonacci(10));
        System.out.println("Hello from Collaborative Editor!");
    }
}`,
    
    cpp: `// C++ Sample
#include <iostream>
using namespace std;

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);
}

int main() {
    cout << "Fibonacci(10): " << fibonacci(10) << endl;
    cout << "Hello from Collaborative Editor!" << endl;
    return 0;
}`
  };

  // Create room
  const createRoom = async (): Promise<void> => {
    try {
      const response = await fetch('http://localhost:5000/api/rooms/create', {
        method: 'POST',
      });
      const data = await response.json();
      setRoomId(data.roomId);
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  // Join room
  const joinRoom = (): void => {
    if (!roomId || !username) return;
    
    const newSocket: Socket = io('http://localhost:5000');
    setSocket(newSocket);
    
    newSocket.emit('join-room', { roomId, username, userId: `user_${Date.now()}` });
    
    newSocket.on('document-load', (document: Document) => {
      setCode(document.content);
      setLanguage(document.language);
    });
    
    newSocket.on('code-update', ({ content }: { content: string }) => {
      setCode(content);
    });
    
    newSocket.on('users-update', (usersList: User[]) => {
      setUsers(usersList);
    });
    
    newSocket.on('ai-response', ({ code: generatedCode }: { code: string }) => {
      setAiResponse(generatedCode);
      setIsLoading(false);
    });
    
    newSocket.on('execution-result', (result: ExecutionResult) => {
      if (result.error) {
        setOutput(`❌ Error:\n${result.error}`);
      } else {
        let outputText = '';
        if (result.output) outputText += `📤 Output:\n${result.output}\n`;
        if (result.error) outputText += `⚠️ Error:\n${result.error}\n`;
        if (result.executionTime) outputText += `\n⏱️ Execution time: ${result.executionTime}s`;
        setOutput(outputText);
      }
      setIsExecuting(false);
      setShowOutput(true);
    });
    
    setIsJoined(true);
  };

  // Handle code change
  const handleCodeChange = (value: string | undefined): void => {
    if (value && socket) {
      setCode(value);
      socket.emit('code-change', { roomId, content: value, language });
    }
  };

  // Handle language change
  const handleLanguageChange = (newLanguage: string): void => {
    setLanguage(newLanguage);
    if (socket) {
      socket.emit('language-change', { roomId, language: newLanguage });
    }
    setOutput('');
    setShowOutput(false);
  };

  // Execute code
  const executeCode = async (): Promise<void> => {
    setIsExecuting(true);
    setOutput('🚀 Executing code...');
    setShowOutput(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });
      const result = await response.json();
      
      if (result.success) {
        let outputText = '';
        if (result.output) outputText += `📤 Output:\n${result.output}\n`;
        if (result.error) outputText += `⚠️ Error:\n${result.error}\n`;
        if (result.executionTime) outputText += `\n⏱️ Execution time: ${result.executionTime}s`;
        setOutput(outputText);
      } else {
        setOutput(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      if (socket) {
        socket.emit('execute-code', { roomId, code, language });
      } else {
        setOutput('❌ Connection error. Please check if server is running.');
      }
    } finally {
      setIsExecuting(false);
    }
  };

  // AI Code Generation
  const handleAIGenerate = (): void => {
    if (!aiPrompt.trim() || !socket) return;
    setIsLoading(true);
    socket.emit('ai-generate', { prompt: aiPrompt, language, roomId });
  };

  // Copy to clipboard
  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  };

  // Download code
  const downloadCode = (): void => {
    const ext = extensions[language] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Code downloaded!');
  };

  // Show toast notification
  const showToast = (message: string): void => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  // Insert sample code
  const insertSampleCode = (): void => {
    const sampleCode = templates[language] || templates.javascript;
    setCode(sampleCode);
    if (socket) {
      socket.emit('code-change', { roomId, content: sampleCode, language });
    }
    showToast('Sample code inserted!');
  };

  if (!isJoined) {
    return (
      <div className="join-screen">
        <div className="join-card">
          <h1>🚀 Collaborative Code Editor</h1>
          <p>Code together in real-time with AI assistance & Code Execution</p>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Room ID (or leave empty to create new)"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <div className="join-buttons">
            <button onClick={createRoom}>Create New Room</button>
            <button onClick={joinRoom} disabled={!username}>
              Join Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>💬 Room: {roomId}</h2>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="theme-toggle">
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
        
        <div className="users-section">
          <h3>👥 Online ({users.length})</h3>
          <div className="users-list">
            {users.map((user, idx) => (
              <div key={idx} className="user-item">
                <div className="user-avatar">{user.username?.[0]?.toUpperCase() || '?'}</div>
                <span>{user.username}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="ai-section">
          <h3>🤖 AI Assistant</h3>
          <textarea
            placeholder="Describe what code you want to generate..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={3}
          />
          <button onClick={handleAIGenerate} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Code'}
          </button>
          
          {aiResponse && (
            <div className="ai-response">
              <div className="ai-response-header">
                <span>AI Response</span>
                <button onClick={() => copyToClipboard(aiResponse)}>📋 Copy</button>
              </div>
              <pre>{aiResponse}</pre>
            </div>
          )}
        </div>
        
        <div className="actions-section">
          <button onClick={insertSampleCode} className="sample-btn">
            📝 Insert Sample
          </button>
          <button onClick={downloadCode} className="download-btn">
            💾 Download Code
          </button>
        </div>
      </div>
      
      <div className="editor-container">
        <div className="editor-toolbar">
          <select value={language} onChange={(e) => handleLanguageChange(e.target.value)}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>
          <button onClick={executeCode} className="run-btn" disabled={isExecuting}>
            {isExecuting ? <Loader size={16} className="spin" /> : <Play size={16} />}
            {isExecuting ? 'Running...' : 'Run Code'}
          </button>
        </div>
        
        <Editor
          height={showOutput ? "calc(100vh - 300px)" : "calc(100vh - 60px)"}
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme={isDarkMode ? 'vs-dark' : 'light'}
          options={{
            fontSize: 14,
            fontFamily: 'Fira Code, monospace',
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
          }}
        />
        
        {showOutput && (
          <div className="output-panel">
            <div className="output-header">
              <Terminal size={16} />
              <span>Execution Output</span>
              <button onClick={() => setShowOutput(false)} className="close-output">
                <X size={14} />
              </button>
            </div>
            <pre className="output-content">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;