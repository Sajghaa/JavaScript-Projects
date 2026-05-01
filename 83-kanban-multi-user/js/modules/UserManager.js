class UserManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.userAvatar = new UserAvatar(stateManager, eventBus);
        this.init();
        // Make current user active
        const currentUser = this.stateManager.getCurrentUser();
        if (currentUser) {
            this.stateManager.toggleActiveUser(currentUser.id, true);
        }
    }

    init() {
        this.renderUsers();
        document.getElementById('userMenuBtn').onclick = () => this.showUserModal();
        this.eventBus.on('board:refresh', () => this.renderUsers());
        
        // Simulate random users coming online/offline
        setInterval(() => {
            const users = this.stateManager.get('users');
            const currentUser = this.stateManager.getCurrentUser();
            const otherUsers = users.filter(u => u.id !== currentUser?.id);
            
            if (otherUsers.length > 0 && Math.random() > 0.7) {
                const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
                const isActive = this.stateManager.getActiveUsers().includes(randomUser.id);
                
                if (!isActive) {
                    this.stateManager.toggleActiveUser(randomUser.id, true);
                    this.renderUsers();
                    
                    setTimeout(() => {
                        this.stateManager.toggleActiveUser(randomUser.id, false);
                        this.renderUsers();
                    }, 15000);
                }
            }
        }, 20000);
    }

    renderUsers() {
        const container = document.getElementById('activeUsersList');
        if (!container) return;
        
        const users = this.stateManager.get('users');
        const activeUsers = this.stateManager.getActiveUsers();
        const currentUser = this.stateManager.getCurrentUser();
        
        container.innerHTML = users.map(user => {
            const isActive = activeUsers.includes(user.id);
            const isCurrent = currentUser?.id === user.id;
            return this.userAvatar.render(user, isActive, isCurrent);
        }).join('');
        
        // Add click handlers
        container.querySelectorAll('.user-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.stopPropagation();
                const userId = chip.dataset.userId;
                this.switchUser(userId);
            });
        });
    }

    switchUser(userId) {
        const currentUser = this.stateManager.getCurrentUser();
        const newUser = this.stateManager.getUser(userId);
        
        if (currentUser?.id === userId) return;
        
        this.stateManager.setCurrentUser(userId);
        this.stateManager.toggleActiveUser(userId, true);
        
        this.renderUsers();
        this.eventBus.emit('toast', { 
            message: `Switched to ${newUser?.name}`, 
            type: 'success' 
        });
        this.eventBus.emit('board:refresh');
        this.closeModal();
    }

    showUserModal() {
        const modal = document.getElementById('userModal');
        const container = document.getElementById('userList');
        const users = this.stateManager.get('users');
        const currentUser = this.stateManager.getCurrentUser();
        
        if (!container) return;
        
        container.innerHTML = users.map(user => `
            <div class="user-card ${currentUser?.id === user.id ? 'active' : ''}" data-user-id="${user.id}">
                <div class="user-avatar-large" style="background: ${user.color}">
                    ${user.avatar}
                </div>
                <div class="user-info">
                    <h4>${user.name}</h4>
                    <p>${user.role}</p>
                </div>
            </div>
        `).join('');
        
        container.querySelectorAll('.user-card').forEach(card => {
            card.onclick = () => {
                const userId = card.dataset.userId;
                this.switchUser(userId);
                this.closeModal();
            };
        });
        
        modal.classList.add('active');
    }

    closeModal() {
        const modal = document.getElementById('userModal');
        if (modal) modal.classList.remove('active');
    }
}

window.UserManager = UserManager;