class TypingIndicator {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.updateInterval = null;
        this.init();
    }

    init() {
        setInterval(() => this.update(), 500);
    }

    update() {
        const roomId = this.stateManager.get('currentRoom');
        const typingUsers = this.stateManager.getTypingForRoom(roomId);
        const currentUserId = this.stateManager.get('currentUser')?.id;
        
        const typingOthers = typingUsers.filter(u => u.userId !== currentUserId);
        
        const indicator = document.getElementById('typingIndicator');
        if (!indicator) return;
        
        if (typingOthers.length > 0) {
            const names = typingOthers.map(u => {
                const user = this.stateManager.get('users').find(usr => usr.id === u.userId);
                return user?.name.split(' ')[0] || 'Someone';
            });
            
            let text = '';
            if (names.length === 1) text = `${names[0]} is typing...`;
            else if (names.length === 2) text = `${names[0]} and ${names[1]} are typing...`;
            else text = 'Several people are typing...';
            
            indicator.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div><span>${text}</span>`;
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    }
}

window.TypingIndicator = TypingIndicator;