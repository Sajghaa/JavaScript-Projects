class BoardManager {
    constructor(stateManager, eventBus, taskManager, taskCard) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.taskManager = taskManager;
        this.column = new Column(stateManager, eventBus, taskCard);
        this.activityLog = new ActivityLog(stateManager, eventBus);
        this.init();
    }

    init() {
        this.renderBoard();
        this.setupActivitySidebar();
        
        this.eventBus.on('board:refresh', () => this.renderBoard());
        this.eventBus.on('activity:refresh', () => this.renderActivityLog());
        
        document.getElementById('closeActivityBtn').onclick = () => this.closeActivitySidebar();
        this.renderActivityLog();
    }

    renderBoard() {
        const container = document.getElementById('columnsContainer');
        const columns = this.stateManager.get('columns');
        const tasks = this.stateManager.get('tasks');
        const activeUsers = this.stateManager.getActiveUsers();
        
        // Update UI counts
        document.getElementById('taskCount').textContent = `${tasks.length} tasks`;
        document.getElementById('activeUsersCount').textContent = activeUsers.length;
        
        container.innerHTML = columns.map(column => {
            const columnTasks = tasks.filter(t => t.columnId === column.id);
            return this.column.render(column, columnTasks);
        }).join('');
        
        // Attach column events and task drag events
        columns.forEach(column => {
            const columnElement = container.querySelector(`[data-column-id="${column.id}"]`);
            if (columnElement) {
                this.column.attachEvents(columnElement, column.id);
            }
        });
        
        // Setup drag events on new tasks
        this.setupTaskCardEvents();
    }

    setupTaskCardEvents() {
        const taskCards = document.querySelectorAll('.task-card');
        taskCards.forEach(card => {
            card.ondblclick = () => {
                const taskId = card.dataset.taskId;
                this.eventBus.emit('task:edit', taskId);
            };
        });
    }

    setupActivitySidebar() {
        const activityBtn = document.getElementById('userMenuBtn');
        if (activityBtn) {
            activityBtn.onclick = () => {
                const sidebar = document.getElementById('activitySidebar');
                sidebar.classList.toggle('open');
                this.renderActivityLog();
            };
        }
    }

    renderActivityLog() {
        const container = document.getElementById('activityList');
        const activities = this.stateManager.getRecentActivities();
        container.innerHTML = this.activityLog.render(activities);
    }

    closeActivitySidebar() {
        document.getElementById('activitySidebar').classList.remove('open');
    }
}

window.BoardManager = BoardManager;