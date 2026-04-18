class TaskForm {
    constructor(stateManager, eventBus, taskManager) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.taskManager = taskManager;
        this.currentEditId = null;
        
        this.init();
    }

    init() {
        this.setupFormListener();
        this.setupSubtaskListener();
    }

    setupFormListener() {
        const form = document.getElementById('taskForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveTask();
            });
        }
    }

    setupSubtaskListener() {
        const addBtn = document.getElementById('addSubtaskBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.addSubtaskField();
            });
        }
    }

    showAddModal() {
        this.currentEditId = null;
        document.getElementById('modalTitle').textContent = 'Add New Task';
        this.resetForm();
        document.getElementById('taskModal').classList.add('active');
    }

    showEditModal(taskId) {
        const task = this.stateManager.get('tasks').find(t => t.id === taskId);
        if (!task) return;
        
        this.currentEditId = taskId;
        document.getElementById('modalTitle').textContent = 'Edit Task';
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskCategory').value = task.category;
        document.getElementById('taskDueDate').value = task.dueDate ? task.dueDate.slice(0, 16) : '';
        document.getElementById('taskReminder').value = task.reminder || 'none';
        
        // Render subtasks
        this.renderSubtasks(task.subtasks || []);
        
        document.getElementById('taskModal').classList.add('active');
    }

    resetForm() {
        document.getElementById('taskForm').reset();
        document.getElementById('taskDueDate').value = '';
        document.getElementById('taskReminder').value = 'none';
        this.renderSubtasks([]);
    }

    renderSubtasks(subtasks) {
        const container = document.getElementById('subtasksContainer');
        container.innerHTML = '';
        
        if (subtasks.length > 0) {
            subtasks.forEach(subtask => {
                this.addSubtaskField(subtask.text);
            });
        } else {
            this.addSubtaskField();
        }
    }

    addSubtaskField(value = '') {
        const container = document.getElementById('subtasksContainer');
        const div = document.createElement('div');
        div.className = 'subtask-item';
        div.innerHTML = `
            <input type="text" class="subtask-input" placeholder="Add a subtask..." value="${this.escapeHtml(value)}">
            <button type="button" class="remove-subtask" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(div);
    }

    saveTask() {
        const taskData = {
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value,
            category: document.getElementById('taskCategory').value,
            dueDate: document.getElementById('taskDueDate').value || null,
            reminder: document.getElementById('taskReminder').value
        };
        
        // Get subtasks
        const subtaskInputs = document.querySelectorAll('.subtask-input');
        taskData.subtasks = Array.from(subtaskInputs)
            .map(input => ({ text: input.value, completed: false }))
            .filter(st => st.text.trim());
        
        if (!taskData.title.trim()) {
            this.eventBus.emit('toast', { message: 'Please enter a task title', type: 'error' });
            return;
        }
        
        if (this.currentEditId) {
            this.stateManager.updateTask(this.currentEditId, taskData);
            this.eventBus.emit('toast', { message: 'Task updated successfully!', type: 'success' });
        } else {
            this.stateManager.addTask(taskData);
            this.eventBus.emit('toast', { message: 'Task added successfully!', type: 'success' });
        }
        
        this.close();
        this.eventBus.emit('tasks:updated');
    }

    close() {
        document.getElementById('taskModal').classList.remove('active');
        this.currentEditId = null;
    }

    escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}

window.TaskForm = TaskForm;