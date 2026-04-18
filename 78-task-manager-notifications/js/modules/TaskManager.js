class TaskManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
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
            form.onsubmit = (e) => {
                e.preventDefault();
                this.saveTask();
            };
        }
    }

    setupSubtaskListener() {
        const addBtn = document.getElementById('addSubtaskBtn');
        if (addBtn) {
            addBtn.onclick = () => this.addSubtaskField();
        }
    }

    showAddTaskModal() {
        this.currentEditId = null;
        document.getElementById('modalTitle').textContent = 'Add New Task';
        this.resetForm();
        document.getElementById('taskModal').classList.add('active');
    }

    showEditTaskModal(taskId) {
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
        
        const subtaskInputs = document.querySelectorAll('.subtask-input');
        taskData.subtasks = Array.from(subtaskInputs)
            .map(input => ({ text: input.value, completed: false }))
            .filter(st => st.text.trim());
        
        if (!taskData.title.trim()) {
            this.showToast('Please enter a task title', 'error');
            return;
        }
        
        if (this.currentEditId) {
            this.stateManager.updateTask(this.currentEditId, taskData);
            this.showToast('Task updated successfully!', 'success');
        } else {
            this.stateManager.addTask(taskData);
            this.showToast('Task added successfully!', 'success');
        }
        
        this.closeModal();
        this.eventBus.emit('tasks:updated');
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.stateManager.deleteTask(taskId);
            this.showToast('Task deleted', 'info');
            this.eventBus.emit('tasks:updated');
        }
    }

    toggleComplete(taskId) {
        const completed = this.stateManager.toggleComplete(taskId);
        this.showToast(completed ? 'Task completed! Great job!' : 'Task marked as pending', 'success');
        this.eventBus.emit('tasks:updated');
    }

    toggleSubtask(taskId, subtaskId) {
        this.stateManager.toggleSubtask(taskId, subtaskId);
        this.eventBus.emit('tasks:updated');
    }

    renderTasks() {
        const container = document.getElementById('tasksContainer');
        const tasks = this.stateManager.getFilteredTasks();
        const emptyState = document.getElementById('emptyState');
        const taskCountSpan = document.getElementById('taskCountNumber');
        
        taskCountSpan.textContent = tasks.length;
        
        if (tasks.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }
        
        emptyState.classList.add('hidden');
        container.innerHTML = tasks.map(task => this.renderTaskCard(task)).join('');
        
        // Attach event listeners
        container.querySelectorAll('.task-checkbox').forEach(cb => {
            cb.onclick = (e) => {
                e.stopPropagation();
                this.toggleComplete(cb.dataset.id);
            };
        });
        
        container.querySelectorAll('.edit-task').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                this.showEditTaskModal(btn.dataset.id);
            };
        });
        
        container.querySelectorAll('.delete-task').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                this.deleteTask(btn.dataset.id);
            };
        });
        
        container.querySelectorAll('.subtask-checkbox').forEach(cb => {
            cb.onchange = (e) => {
                e.stopPropagation();
                this.toggleSubtask(cb.dataset.taskId, cb.dataset.subtaskId);
            };
        });
    }

    renderTaskCard(task) {
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const isOverdue = dueDate && dueDate < new Date() && !task.completed;
        const priorityClass = `priority-${task.priority}`;
        
        return `
            <div class="task-card ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-header">
                    <div class="task-checkbox ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                        ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                    </div>
                    <div class="task-info">
                        <div class="task-title">${this.escapeHtml(task.title)}</div>
                        ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                        <div class="task-meta">
                            <span class="meta-item ${priorityClass}">
                                <i class="fas fa-flag"></i> ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                            <span class="meta-item">
                                <i class="fas fa-tag"></i> ${task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                            </span>
                            ${dueDate ? `
                                <span class="meta-item ${isOverdue ? 'priority-high' : ''}">
                                    <i class="fas fa-calendar"></i> ${dueDate.toLocaleDateString()}
                                    ${isOverdue ? '<span style="color: var(--danger)"> (Overdue)</span>' : ''}
                                </span>
                            ` : ''}
                        </div>
                        ${this.renderSubtasksList(task)}
                    </div>
                    <div class="task-actions">
                        <button class="task-action-btn edit-task" data-id="${task.id}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="task-action-btn delete-task" data-id="${task.id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderSubtasksList(task) {
        if (!task.subtasks || task.subtasks.length === 0) return '';
        
        return `
            <div class="subtasks-list">
                ${task.subtasks.map(st => `
                    <div class="subtask-item ${st.completed ? 'completed' : ''}">
                        <input type="checkbox" class="subtask-checkbox" 
                               data-task-id="${task.id}" data-subtask-id="${st.id}" 
                               ${st.completed ? 'checked' : ''}>
                        <span>${this.escapeHtml(st.text)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    closeModal() {
        document.getElementById('taskModal').classList.remove('active');
        this.currentEditId = null;
    }

    showToast(message, type) {
        this.eventBus.emit('toast', { message, type });
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

window.TaskManager = TaskManager;