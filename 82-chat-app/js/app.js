document.addEventListener('DOMContentLoaded', function() {
    const stateManager = new StateManager();
    const eventBus = new EventBus();
    
    // Set default current user if none exists
    if (!stateManager.get('currentUser')) {
        stateManager.set('currentUser', stateManager.get('users')[0]);
    }
    
    // Initialize modules
    const userManager = new UserManager(stateManager, eventBus);
    const roomManager = new RoomManager(stateManager, eventBus);
    const messageManager = new MessageManager(stateManager, eventBus);
    const chatManager = new ChatManager(stateManager, eventBus);
    const notificationManager = new NotificationManager(stateManager, eventBus);
    const typingIndicator = new TypingIndicator(stateManager, eventBus);
    
    window.app = {
        stateManager,
        eventBus,
        userManager,
        roomManager,
        messageManager,
        chatManager,
        notificationManager
    };
    
    // Handle typing events
    eventBus.on('user:typing', ({ userId, roomId }) => {
        stateManager.addTypingUser(userId, roomId);
    });
    
    eventBus.on('user:stopTyping', ({ userId, roomId }) => {
        stateManager.removeTypingUser(userId, roomId);
    });
    
    // Initial load
    roomManager.updateRoomInfo();
    messageManager.renderMessages();
    messageManager.scrollToBottom();
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Theme toggle
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    document.getElementById('themeToggle')?.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
    
    console.log('Chat App Initialized!');
});

// Global close modal function
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
}

window.closeModal = closeModal;