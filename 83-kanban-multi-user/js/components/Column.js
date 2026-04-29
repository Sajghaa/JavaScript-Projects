class Column {
    constructor(stateManager, eventBus, taskCard) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.taskCard = taskCard;
    }

    render(column, tasks) {
        return `
            <div class="column" data-column-id="${column.id}">
                <div class="column-header">
                    <div class="column-title">
                        <span>${column.icon}</span>
                        <h3>${column.title}</h3>
                        <span class="column-badge">${tasks.length}</span>
                    </div>
                    <div class="column-actions">
                        <button class="column-action add-task-btn" title="Add task">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="column-action" title="More options">
                            <i class="fas fa-ellipsis-h"></i>
                        </button>
                    </div>
                </div>
                <div class="tasks-container" data-column-id="${column.id}">
                    ${tasks.map(task => this.taskCard.render(task)).join('')}
                </div>
            </div>
        `;
    }

    attachEvents(element, columnId) {
        const addBtn = element.querySelector('.add-task-btn');
        if (addBtn) {
            addBtn.onclick = () => {
                this.eventBus.emit('task:add', columnId);
            };
        }
    }
}

window.Column = Column;