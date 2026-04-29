class TaskModal {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.currentTaskId = null;
        this.currentColumnId = null;
        this.init();
    }

    init() {
        document.getElementById('saveTaskBtn').onclick = () => this.saveTask();
        document.getElementById('deleteTaskBtn').onclick = () => this.deleteTask();
    }

    showAddTask(columnId) {
        this.currentTaskId = null;
        this.currentColumnId = columnId;
        document.getElementById('taskModalTitle').textContent = 'Add New Task';
        document.getElementById('deleteTaskBtn').style.display = 'none';
        this.resetForm();
        this.populateUsers();
        document.getElementById('taskModal').classList.add('active');
    }

    showEditTask(taskId) {
        const task = this.stateManager.get('tasks').find(t => t.id === taskId);
        if (!task) return;
        
        this.currentTaskId = taskId;
        this.currentColumnId = task.columnId;
        document.getElementById('taskModalTitle').textContent = 'Edit Task';
        document.getElementById('deleteTaskBtn').style.display = 'flex';
        
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskDueDate').value = task.dueDate || '';
        document.getElementById('taskTags').value = (task.tags || []).join(', ');
        
        this.populateUsers(task.assignees || []);
        document.getElementById('taskModal').classList.add('active');
    }

    populateUsers(selectedAssignees = []) {
        const users = this.stateManager.get('users');
        const select = document.getElementById('taskAssignee');
        select.innerHTML = '<option value="">Unassigned</option>' + 
            users.map(u => `<option value="${u.id}" ${selectedAssignees.includes(u.id) ? 'selected' : ''}>${u.name}</option>`).join('');
    }

    saveTask() {
        const taskData = {
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDueDate').value,
            tags: document.getElementById('taskTags').value.split(',').map(t => t.trim()).filter(t => t),
            assignees: document.getElementById('taskAssignee').value ? [document.getElementById('taskAssignee').value] : []
        };
        
        if (!taskData.title.trim()) {
            this.eventBus.emit('toast', { message: 'Please enter a task title', type: 'error' });
            return;
        }
        
        if (this.currentTaskId) {
            this.eventBus.emit('task:update', { taskId: this.currentTaskId, updates: taskData });
        } else {
            this.eventBus.emit('task:create', { ...taskData, columnId: this.currentColumnId });
        }
        
        this.close();
    }

    deleteTask() {
        if (confirm('Are you sure you want to delete this task?')) {
            this.eventBus.emit('task:delete', this.currentTaskId);
            this.close();
        }
    }

    resetForm() {
        document.getElementById('taskForm').reset();
        document.getElementById('taskDueDate').value = '';
        document.getElementById('taskTags').value = '';
    }

    close() {
        document.getElementById('taskModal').classList.remove('active');
        this.currentTaskId = null;
        this.currentColumnId = null;
    }
}

window.TaskModal = TaskModal;