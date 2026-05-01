class TaskManager {
    constructor(stateManager, eventBus, taskModal) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.taskModal = taskModal;
        this.init();
    }

    init() {
        this.eventBus.on('task:add', (colId) => this.taskModal.showAddTask(colId));
        this.eventBus.on('task:edit', (id) => this.taskModal.showEditTask(id));
        this.eventBus.on('task:create', (data) => this.createTask(data));
        this.eventBus.on('task:update', ({taskId, updates}) => this.updateTask(taskId, updates));
        this.eventBus.on('task:delete', (id) => this.deleteTask(id));
        document.getElementById('addTaskBtn').onclick = () => this.eventBus.emit('task:add', 'todo');
    }

    createTask(data) {
        const newTask = this.stateManager.addTask(data);
        this.eventBus.emit('toast', { message: 'Task created!', type: 'success' });
        this.eventBus.emit('board:refresh');
    }

    updateTask(id, updates) {
        this.stateManager.updateTask(id, updates);
        this.eventBus.emit('toast', { message: 'Task updated!', type: 'success' });
        this.eventBus.emit('board:refresh');
    }

    deleteTask(id) {
        if(confirm('Delete this task?')) { this.stateManager.deleteTask(id); this.eventBus.emit('toast', { message: 'Task deleted', type: 'info' }); this.eventBus.emit('board:refresh'); }
    }

    moveTask(id, newColId) {
        this.stateManager.updateTask(id, { columnId: newColId });
        this.eventBus.emit('board:refresh');
    }
}
window.TaskManager = TaskManager;