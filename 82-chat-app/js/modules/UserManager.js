class UserManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.userList = new UserList(stateManager, eventBus);
        this.init();
    }

    init() {
        this.renderUsers();
        document.getElementById('userMenuBtn').onclick = () => this.showSwitchUserModal();
        document.getElementById('switchUserBtn').onclick = () => this.showSwitchUserModal();
        this.eventBus.on('user:select', (userId) => this.openPrivateChat(userId));
    }

    renderUsers() {
        const container = document.getElementById('usersList');
        const users = this.stateManager.get('users');
        const currentUser = this.stateManager.get('currentUser');
        
        container.innerHTML = this.userList.render(users, currentUser?.id);
        this.userList.attachEvents(container);
    }

    updateCurrentUser(userId) {
        const user = this.stateManager.get('users').find(u => u.id === userId);
        if (user) {
            this.stateManager.set('currentUser', user);
            this.updateUI();
            this.eventBus.emit('user:changed', user);
        }
    }

    updateUI() {
        const user = this.stateManager.get('currentUser');
        if (user) {
            document.getElementById('currentUserName').textContent = user.name;
            const avatarImg = document.querySelector('#currentUserCard .user-avatar img');
            if (avatarImg) avatarImg.src = user.avatar;
        }
        this.renderUsers();
    }

    showSwitchUserModal() {
        const modal = document.getElementById('switchUserModal');
        const container = document.getElementById('userOptions');
        const users = this.stateManager.get('users');
        
        container.innerHTML = users.map(user => `
            <div class="user-option" data-user-id="${user.id}">
                <div class="user-option-avatar">
                    <img src="${user.avatar}" alt="${user.name}">
                </div>
                <div class="user-option-info">
                    <div class="user-option-name">${user.name}</div>
                    <div class="user-option-status">${user.status === 'online' ? 'Online' : 'Offline'}</div>
                </div>
            </div>
        `).join('');
        
        container.querySelectorAll('.user-option').forEach(opt => {
            opt.onclick = () => {
                const userId = opt.dataset.userId;
                this.updateCurrentUser(userId);
                modal.classList.remove('active');
                this.eventBus.emit('toast', { message: `Switched to ${opt.querySelector('.user-option-name').textContent}`, type: 'success' });
            };
        });
        
        modal.classList.add('active');
    }

    openPrivateChat(userId) {
        const currentUser = this.stateManager.get('currentUser');
        if (!currentUser) {
            this.eventBus.emit('toast', { message: 'Please select a user first', type: 'error' });
            return;
        }
        
        const user = this.stateManager.get('users').find(u => u.id === userId);
        if (user) {
            const privateRoomId = `dm_${[currentUser.id, userId].sort().join('_')}`;
            let room = this.stateManager.get('rooms').find(r => r.id === privateRoomId);
            
            if (!room) {
                room = this.stateManager.addRoom({
                    id: privateRoomId,
                    name: user.name,
                    description: `Direct message with ${user.name}`,
                    icon: '💬',
                    isPrivate: true,
                    members: [currentUser.id, userId]
                });
            }
            
            this.eventBus.emit('room:select', privateRoomId);
            this.eventBus.emit('toast', { message: `Started chat with ${user.name}`, type: 'success' });
        }
    }

    closeModal() {
        document.getElementById('switchUserModal').classList.remove('active');
    }
}

window.UserManager = UserManager;