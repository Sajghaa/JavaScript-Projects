class UserManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.userAvatar = new UserAvatar(stateManager, eventBus);
        this.init();
    }

    init() {
        this.renderActiveUsers();
        document.getElementById('userMenuBtn').onclick = () => this.showUserModal();
        this.eventBus.on('board:refresh', () => this.renderActiveUsers());
    }

    renderActiveUsers() {
        const container = document.getElementById('activeUsersList');
        const users = this.stateManager.get('users');
        const activeUsers = this.stateManager.getActiveUsers();
        const currentUser = this.stateManager.getCurrentUser();
        
        container.innerHTML = users.map(user => 
            this.userAvatar.render(user, activeUsers.includes(user.id), currentUser?.id === user.id)
        ).join('');
        
        container.querySelectorAll('.user-chip').forEach(chip => {
            chip.onclick = () => {
                const userId = chip.dataset.userId;
                this.switchUser(userId);
            };
        });
    }

    switchUser(userId) {
        const oldUser = this.stateManager.getCurrentUser();
        this.stateManager.setCurrentUser(userId);
        
        if (oldUser?.id !== userId) {
            this.eventBus.emit('toast', { 
                message: `Switched to ${this.stateManager.getCurrentUser().name}`, 
                type: 'success' 
            });
            this.renderActiveUsers();
            this.eventBus.emit('board:refresh');
        }
        
        this.closeModal();
    }

    showUserModal() {
        const modal = document.getElementById('userModal');
        const container = document.getElementById('userList');
        const users = this.stateManager.get('users');
        const currentUser = this.stateManager.getCurrentUser();
        
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
            };
        });
        
        modal.classList.add('active');
    }

    closeModal() {
        document.getElementById('userModal').classList.remove('active');
    }
}

window.UserManager = UserManager;