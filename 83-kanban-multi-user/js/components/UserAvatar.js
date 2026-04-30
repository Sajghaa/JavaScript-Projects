class UserAvatar {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render(user, isActive = false, isCurrent = false) {
        return `
            <div class="user-chip ${isCurrent ? 'active' : ''}" data-user-id="${user.id}">
                <div class="user-chip-avatar" style="background: ${user.color};">
                    ${user.avatar}
                </div>
                <span class="user-chip-name">${user.name.split(' ')[0]}</span>
                ${isActive ? '<span class="online-dot" title="Online"></span>' : ''}
            </div>
        `;
    }

    renderAssignee(user) {
        return `
            <div class="assignee-avatar" style="background: ${user.color};" title="${user.name}">
                ${user.avatar}
            </div>
        `;
    }
}

window.UserAvatar = UserAvatar;