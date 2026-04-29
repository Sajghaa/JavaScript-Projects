class TaskManager {
    constructor(stateManager, eventBus, taskModal) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.taskModal = taskModal;
        this.taskCard = new TaskCard(stateManager, eventBus);
        this.init();
    }

    init() {
        this.eventBus.on('task:add', (columnId) => this.taskModal.showAddTask(columnId));
        this.eventBus.on('task:edit', (taskId) => this.taskModal.showEditTask(taskId));
        this.eventBus.on('task:create', (taskData) => this.createTask(taskData));
        this.eventBus.on('task:update', ({ taskId, updates }) => this.updateTask(taskId, updates));
        this.eventBus.on('task:delete', (taskId) => this.deleteTask(taskId));
    }

    createTask(taskData) {
        const currentUser = this.stateManager.getCurrentUser();
        const newTask = this.stateManager.addTask(taskData);
        
        this.eventBus.emit('toast', { message: 'Task created successfully!', type: 'success' });
        this.eventBus.emit('board:refresh');
        
        this.stateManager.addActivity({
            userId: currentUser.id,
            userName: currentUser.name,
            type: 'task_created',
            taskId: newTask.id,
            message: `${currentUser.name} created task "${newTask.title}"`
        });
    }

    updateTask(taskId, updates) {
        const currentUser = this.stateManager.getCurrentUser();
        const result = this.stateManager.updateTask(taskId, updates);
        
        if (result) {
            this.eventBus.emit('toast', { message: 'Task updated successfully!', type: 'success' });
            this.eventBus.emit('board:refresh');
            
            this.stateManager.addActivity({
                userId: currentUser.id,
                userName: currentUser.name,
                type: 'task_updated',
                taskId: taskId,
                message: `${currentUser.name} updated task "${result.new.title}"`
            });
        }
    }

    deleteTask(taskId) {
        const currentUser = this.stateManager.getCurrentUser();
        const task = this.stateManager.deleteTask(taskId);
        
        if (task) {
            this.eventBus.emit('toast', { message: 'Task deleted!', type: 'info' });
            this.eventBus.emit('board:refresh');
            
            this.stateManager.addActivity({
                userId: currentUser.id,
                userName: currentUser.name,
                type: 'task_deleted',
                taskId: taskId,
                message: `${currentUser.name} deleted task "${task.title}"`
            });
        }
    }

    moveTask(taskId, newColumnId) {
        const currentUser = this.stateManager.getCurrentUser();
        const task = this.stateManager.moveTask(taskId, newColumnId);
        const column = this.stateManager.get('columns').find(c => c.id === newColumnId);
        
        if (task) {
            this.eventBus.emit('board:refresh');
            
            this.stateManager.addActivity({
                userId: currentUser.id,
                userName: currentUser.name,
                type: 'task_moved',
                taskId: taskId,
                message: `${currentUser.name} moved task "${task.title}" to ${column?.title || newColumnId}`
            });
        }
    }
}

window.TaskManager = TaskManager;