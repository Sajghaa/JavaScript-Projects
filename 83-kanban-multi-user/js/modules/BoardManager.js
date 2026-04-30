class BoardManager {
    constructor(stateManager, eventBus, taskManager, taskCard) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.taskManager = taskManager;
        this.column = new Column(stateManager, eventBus, taskCard);
        this.init();
        this.eventBus.on('board:refresh', () => this.renderBoard());
    }

    init() { this.renderBoard(); }

    renderBoard() {
        const container = document.getElementById('columnsContainer');
        const columns = this.stateManager.get('columns');
        const tasks = this.stateManager.get('tasks');
        const activeUsers = this.stateManager.getActiveUsers();
        document.getElementById('taskCount').textContent = `${tasks.length} tasks`;
        document.getElementById('activeUsersCount').textContent = activeUsers.length;
        container.innerHTML = columns.map(col => this.column.render(col, tasks.filter(t=>t.columnId===col.id))).join('');
        columns.forEach(col => { const el = container.querySelector(`[data-column-id="${col.id}"]`); if(el) this.column.attachEvents(el, col.id); });
        this.setupDragEvents();
    }

    setupDragEvents() {
        document.querySelectorAll('.task-card').forEach(card => {
            card.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', card.dataset.taskId); card.classList.add('dragging'); });
            card.addEventListener('dragend', (e) => { card.classList.remove('dragging'); });
        });
        document.querySelectorAll('.tasks-container').forEach(container => {
            container.addEventListener('dragover', (e) => { e.preventDefault(); container.classList.add('drag-over'); });
            container.addEventListener('dragleave', () => { container.classList.remove('drag-over'); });
            container.addEventListener('drop', (e) => {
                e.preventDefault(); container.classList.remove('drag-over');
                const taskId = e.dataTransfer.getData('text/plain');
                const newColId = container.dataset.columnId;
                const task = this.stateManager.get('tasks').find(t=>t.id===taskId);
                if(task && task.columnId !== newColId) { this.taskManager.moveTask(taskId, newColId); this.eventBus.emit('toast', { message: 'Task moved!', type: 'success' }); }
            });
        });
    }
}
window.BoardManager = BoardManager;