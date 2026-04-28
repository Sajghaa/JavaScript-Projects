class StateManager {
    constructor() {
        this.state = {
            currentUser: null,
            users: [
                { id: 'user1', name: 'Alex Morgan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', status: 'online', lastSeen: new Date() },
                { id: 'user2', name: 'Sarah Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', status: 'online', lastSeen: new Date() },
                { id: 'user3', name: 'Mike Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', status: 'online', lastSeen: new Date() },
                { id: 'user4', name: 'Emma Watson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', status: 'online', lastSeen: new Date() }
            ],
            rooms: [
                { id: 'room1', name: 'general', description: 'General discussion', icon: '💬', members: ['user1', 'user2', 'user3', 'user4'], createdAt: new Date() },
                { id: 'room2', name: 'random', description: 'Random stuff', icon: '🎲', members: ['user1', 'user2'], createdAt: new Date() },
                { id: 'room3', name: 'tech', description: 'Technology talk', icon: '💻', members: ['user1', 'user3', 'user4'], createdAt: new Date() }
            ],
            messages: [],
            currentRoom: 'room1',
            typingUsers: []
        };
        
        this.listeners = new Map();
        this.loadFromStorage();
        this.initializeSampleMessages();
    }

    initializeSampleMessages() {
        if (this.state.messages.length === 0) {
            const now = new Date().getTime();
            this.state.messages = [
                { id: 'msg1', roomId: 'room1', userId: 'user1', text: 'Hello everyone! 👋', timestamp: new Date(now - 3600000), reactions: [] },
                { id: 'msg2', roomId: 'room1', userId: 'user2', text: 'Hey Alex! How are you?', timestamp: new Date(now - 3500000), reactions: [] },
                { id: 'msg3', roomId: 'room1', userId: 'user3', text: 'Welcome to the chat!', timestamp: new Date(now - 3400000), reactions: [] },
                { id: 'msg4', roomId: 'room2', userId: 'user1', text: 'Anyone up for a game? 🎮', timestamp: new Date(now - 3000000), reactions: [] },
                { id: 'msg5', roomId: 'room3', userId: 'user3', text: 'Check out this new framework!', timestamp: new Date(now - 2000000), reactions: [] }
            ];
            this.saveToStorage();
        }
    }

    get(path) {
        if (!path) return this.state;
        return path.split('.').reduce((obj, key) => obj?.[key], this.state);
    }

    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => obj[key], this.state);
        target[lastKey] = value;
        this.notifyListeners(path, value);
        this.saveToStorage();
    }

    subscribe(path, callback) {
        if (!this.listeners.has(path)) this.listeners.set(path, new Set());
        this.listeners.get(path).add(callback);
        return () => this.listeners.get(path)?.delete(callback);
    }

    notifyListeners(path, value) {
        if (this.listeners.has(path)) {
            this.listeners.get(path).forEach(cb => cb(value));
        }
    }

    addMessage(message) {
        const newMessage = { id: Date.now().toString(), ...message, timestamp: new Date(), reactions: [] };
        this.state.messages.push(newMessage);
        this.notifyListeners('messages', this.state.messages);
        this.saveToStorage();
        return newMessage;
    }

    getRoomMessages(roomId) {
        return this.state.messages.filter(m => m.roomId === roomId).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    addTypingUser(userId, roomId) {
        if (!this.state.typingUsers.find(u => u.userId === userId && u.roomId === roomId)) {
            this.state.typingUsers.push({ userId, roomId, timestamp: Date.now() });
            this.notifyListeners('typingUsers', this.state.typingUsers);
        }
    }

    removeTypingUser(userId, roomId) {
        this.state.typingUsers = this.state.typingUsers.filter(u => !(u.userId === userId && u.roomId === roomId));
        this.notifyListeners('typingUsers', this.state.typingUsers);
    }

    getTypingForRoom(roomId) {
        const now = Date.now();
        return this.state.typingUsers.filter(u => u.roomId === roomId && (now - u.timestamp) < 3000);
    }

    addReaction(messageId, userId, emoji) {
        const message = this.state.messages.find(m => m.id === messageId);
        if (message) {
            const existing = message.reactions.find(r => r.userId === userId && r.emoji === emoji);
            if (existing) {
                message.reactions = message.reactions.filter(r => !(r.userId === userId && r.emoji === emoji));
            } else {
                message.reactions.push({ userId, emoji });
            }
            this.notifyListeners('messages', this.state.messages);
            this.saveToStorage();
        }
    }

    addRoom(room) {
        const newRoom = { id: 'room_' + Date.now(), members: [this.state.currentUser?.id].filter(Boolean), createdAt: new Date(), ...room };
        this.state.rooms.push(newRoom);
        this.notifyListeners('rooms', this.state.rooms);
        this.saveToStorage();
        return newRoom;
    }

    updateRoomMembers(roomId, memberId, add) {
        const room = this.state.rooms.find(r => r.id === roomId);
        if (room) {
            if (add && !room.members.includes(memberId)) {
                room.members.push(memberId);
            } else if (!add) {
                room.members = room.members.filter(m => m !== memberId);
            }
            this.notifyListeners('rooms', this.state.rooms);
            this.saveToStorage();
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('chat_app_state', JSON.stringify({
                messages: this.state.messages,
                currentUser: this.state.currentUser,
                rooms: this.state.rooms
            }));
        } catch (e) { console.error(e); }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('chat_app_state');
            if (saved) {
                const data = JSON.parse(saved);
                this.state.messages = data.messages || [];
                this.state.currentUser = data.currentUser || null;
                if (data.rooms) {
                    this.state.rooms = data.rooms;
                }
            }
        } catch (e) { console.error(e); }
    }
}

window.StateManager = StateManager;