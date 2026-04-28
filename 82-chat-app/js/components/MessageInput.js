class MessageInput {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.typingTimeout = null;
        this.init();
    }

    init() {
        const input = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        if (input) {
            input.addEventListener('input', () => this.onTyping());
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        if (sendBtn) sendBtn.onclick = () => this.sendMessage();
    }

    onTyping() {
        const roomId = this.stateManager.get('currentRoom');
        const userId = this.stateManager.get('currentUser')?.id;
        
        if (userId && roomId) {
            this.eventBus.emit('user:typing', { userId, roomId });
            
            if (this.typingTimeout) clearTimeout(this.typingTimeout);
            this.typingTimeout = setTimeout(() => {
                this.eventBus.emit('user:stopTyping', { userId, roomId });
            }, 1000);
        }
    }

    sendMessage() {
        const input = document.getElementById('messageInput');
        if (!input) return;
        
        const text = input.value.trim();
        if (!text) return;
        
        const roomId = this.stateManager.get('currentRoom');
        const userId = this.stateManager.get('currentUser')?.id;
        
        if (userId && roomId) {
            this.eventBus.emit('message:send', { roomId, userId, text });
            input.value = '';
            input.style.height = 'auto';
        }
    }

    clear() {
        const input = document.getElementById('messageInput');
        if (input) input.value = '';
    }
}

window.MessageInput = MessageInput;