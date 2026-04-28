class ChatMessage {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render(message, currentUserId) {
        const user = this.stateManager.get('users').find(u => u.id === message.userId);
        if (!user) return '';
        
        const isOwn = message.userId === currentUserId;
        const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        return `
            <div class="message ${isOwn ? 'message-own' : ''}" data-message-id="${message.id}">
                <div class="message-avatar">
                    <img src="${user.avatar}" alt="${user.name}">
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-sender">${user.name}</span>
                        <span class="message-time">${time}</span>
                    </div>
                    <div class="message-bubble">
                        <div class="message-text">${this.escapeHtml(message.text)}</div>
                    </div>
                    ${this.renderReactions(message.reactions, user)}
                </div>
            </div>
        `;
    }

    renderReactions(reactions, currentUser) {
        if (!reactions || reactions.length === 0) return '';
        
        const grouped = reactions.reduce((acc, r) => {
            acc[r.emoji] = (acc[r.emoji] || 0) + 1;
            return acc;
        }, {});
        
        return `
            <div class="message-reactions">
                ${Object.entries(grouped).map(([emoji, count]) => `
                    <span class="reaction" data-emoji="${emoji}">${emoji} ${count}</span>
                `).join('')}
            </div>
        `;
    }

    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        }).replace(/\n/g, '<br>');
    }
}

window.ChatMessage = ChatMessage;