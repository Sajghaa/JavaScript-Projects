class MessageManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.chatMessage = new ChatMessage(stateManager, eventBus);
        this.messageInput = new MessageInput(stateManager, eventBus);
        this.init();
    }

    init() {
        this.eventBus.on('message:send', ({ roomId, userId, text }) => this.sendMessage(roomId, userId, text));
        this.eventBus.on('room:changed', () => this.renderMessages());
    }

    sendMessage(roomId, userId, text) {
        const message = this.stateManager.addMessage({ roomId, userId, text });
        this.renderMessages();
        this.scrollToBottom();
        this.eventBus.emit('message:sent', message);
    }

    renderMessages() {
        const container = document.getElementById('messagesContainer');
        if (!container) return;
        
        const roomId = this.stateManager.get('currentRoom');
        const messages = this.stateManager.getRoomMessages(roomId);
        const currentUser = this.stateManager.get('currentUser');
        
        if (messages.length === 0) {
            container.innerHTML = '<div class="empty-state">No messages yet. Start the conversation!</div>';
            return;
        }
        
        container.innerHTML = messages.map(msg => this.chatMessage.render(msg, currentUser?.id)).join('');
        this.attachReactionListeners();
    }

    attachReactionListeners() {
        document.querySelectorAll('.reaction').forEach(reaction => {
            reaction.onclick = (e) => {
                e.stopPropagation();
                const messageDiv = reaction.closest('.message');
                const messageId = messageDiv.dataset.messageId;
                const emoji = reaction.dataset.emoji;
                const currentUser = this.stateManager.get('currentUser');
                if (currentUser) {
                    this.stateManager.addReaction(messageId, currentUser.id, emoji);
                    this.renderMessages();
                }
            };
        });
    }

    scrollToBottom() {
        const container = document.getElementById('messagesContainer');
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
    }
}

window.MessageManager = MessageManager;