class UserList {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render(users, currentUserId = null) {
        if (!users || users.length === 0) return '<div class="empty-state">No users online</div>';
        
        return users.filter(u => u.id !== currentUserId).map(user => `
            <div class="user-item" data-user-id="${user.id}">
                <div class="user-avatar">
                    <img src="${user.avatar}" alt="${user.name}">
                    <div class="user-status ${user.status}"></div>
                </div>
                <div class="user-info">
                    <div class="user-name">${user.name}</div>
                    <div class="user-status-text">${user.status === 'online' ? 'Online' : 'Offline'}</div>
                </div>
            </div>
        `).join('');
    }

    attachEvents(container) {
        container.querySelectorAll('.user-item').forEach(item => {
            item.onclick = () => {
                const userId = item.dataset.userId;
                this.eventBus.emit('user:select', userId);
            };
        });
    }
}

window.UserList = UserList;