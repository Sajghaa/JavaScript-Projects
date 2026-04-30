class TaskCard {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.userAvatar = new UserAvatar(stateManager, eventBus);
    }

    render(task) {
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const isOverdue = dueDate && dueDate < new Date() && task.columnId !== 'done';
        const users = this.stateManager.get('users');
        const assignees = users.filter(u => task.assignees?.includes(u.id));
        
        return `
            <div class="task-card" data-task-id="${task.id}" draggable="true">
                <div class="task-header">
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    <span class="task-priority priority-${task.priority}">${task.priority}</span>
                </div>
                ${task.description ? `<div class="task-description">${this.escapeHtml(task.description.substring(0, 80))}${task.description.length > 80 ? '...' : ''}</div>` : ''}
                ${task.tags?.length ? `<div class="task-tags">${task.tags.map(tag => `<span class="task-tag">${this.escapeHtml(tag)}</span>`).join('')}</div>` : ''}
                <div class="task-meta">
                    <div class="task-due-date ${isOverdue ? 'overdue' : ''}">
                        <i class="far fa-calendar"></i> 
                        ${dueDate ? dueDate.toLocaleDateString() : 'No date'}
                    </div>
                    <div class="task-assignees">
                        ${assignees.map(user => this.userAvatar.renderAssignee(user)).join('')}
                    </div>
                </div>
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
        });
    }
}

window.TaskCard = TaskCard;