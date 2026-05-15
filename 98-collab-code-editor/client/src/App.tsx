import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import { Users, Send, Sparkles, Copy, Download, Moon, Sun } from 'lucide-react';
import './App.css';

const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [isJoined, setIsJoined] = useState(false);
  const [code, setCode] = useState<string>('// Welcome to Collaborative Code Editor\n// Start coding with your team!\n\nfunction hello() {\n  console.log("Hello, World!");\n}\n\nhello();');
  const [language, setLanguage] = useState<string>('javascript');
  const [users, setUsers] = useState<any[]>([]);
  const [cursors, setCursors] = useState<Map<string, any>>(new Map());
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Create a new room
  const createRoom = async () => {
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

  // Join a room
  const joinRoom = () => {
    if (!roomId || !username) return;
    
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    
    newSocket.emit('join-room', { roomId, username, userId: `user_${Date.now()}` });
    
    newSocket.on('document-load', (document: any) => {
      setCode(document.content);
      setLanguage(document.language);
    });
    
    newSocket.on('code-update', ({ content }: any) => {
      setCode(content);
    });
    
    newSocket.on('language-update', ({ language: newLang }: any) => {
      setLanguage(newLang);
    });
    
    newSocket.on('users-update', (usersList: any[]) => {
      setUsers(usersList);
    });
    
    newSocket.on('cursor-update', ({ userId, username, position }: any) => {
      setCursors(prev => new Map(prev).set(userId, { username, position }));
    });
    
    newSocket.on('user-joined', ({ username: joinedUser }) => {
      showToast(`${joinedUser} joined the room`);
    });
    
    newSocket.on('user-left', ({ userId }) => {
      setCursors(prev => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
      showToast(`A user left the room`);
    });
    
    newSocket.on('ai-response', ({ code: generatedCode }) => {
      setAiResponse(generatedCode);
      setIsLoading(false);
    });
    
    newSocket.on('ai-explanation', ({ explanation }) => {
      setAiResponse(explanation);
      setIsLoading(false);
    });
    
    setIsJoined(true);
  };

  // Handle code change
  const handleCodeChange = (value: string | undefined) => {
    if (value && socket) {
      setCode(value);
      socket.emit('code-change', { roomId, content: value, language });
    }
  };

  // Handle language change
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (socket) {
      socket.emit('language-change', { roomId, language: newLanguage });
    }
  };

  // Handle cursor movement
  const handleEditorMount = (editor: any) => {
    editor.onDidChangeCursorPosition((e: any) => {
      if (socket) {
        socket.emit('cursor-move', {
          roomId,
          position: { line: e.position.lineNumber, column: e.position.column },
          userId: `user_${username}`,
          username
        });
      }
    });
  };

  // AI Code Generation
  const handleAIGenerate = () => {
    if (!aiPrompt.trim() || !socket) return;
    setIsLoading(true);
    socket.emit('ai-generate', { prompt: aiPrompt, language, roomId });
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(aiResponse);
    showToast('Copied to clipboard!');
  };

  // Download code
  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Code downloaded!');
  };

  // Toast notification
  const showToast = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  if (!isJoined) {
    return (
      <div className="join-screen">
        <div className="join-card">
          <h1>🚀 Collaborative Code Editor</h1>
          <p>Code together in real-time with AI assistance</p>
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
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        
        <div className="users-section">
          <h3><Users size={16} /> Online ({users.length})</h3>
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
          <h3><Sparkles size={16} /> AI Assistant</h3>
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
                <button onClick={copyToClipboard}><Copy size={14} /></button>
              </div>
              <pre>{aiResponse}</pre>
            </div>
          )}
        </div>
        
        <div className="actions-section">
          <button onClick={downloadCode} className="download-btn">
            <Download size={16} /> Download Code
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
            <option value="json">JSON</option>
          </select>
          <div className="cursor-info">
            {Array.from(cursors.values()).map((cursor, idx) => (
              <div key={idx} className="cursor-badge">
                {cursor.username}: L{cursor.position.line}, C{cursor.position.column}
              </div>
            ))}
          </div>
        </div>
        
        <Editor
          height="calc(100vh - 60px)"
          language={language}
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorMount}
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
      </div>
    </div>
  );
};

export default App;