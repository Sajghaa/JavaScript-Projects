class TaskCard {
    constructor(stateManager, eventBus, taskManager) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.taskManager = taskManager;
    }

    render(task) {
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
                            ${task.reminder && task.reminder !== 'none' ? `
                                <span class="meta-item">
                                    <i class="fas fa-bell"></i> Reminder: ${this.getReminderText(task.reminder)}
                                </span>
                            ` : ''}
                        </div>
                        ${this.renderSubtasks(task)}
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

    renderSubtasks(task) {
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

    getReminderText(minutes) {
        const mins = parseInt(minutes);
        if (mins < 60) return `${mins} minutes before`;
        if (mins === 60) return '1 hour before';
        if (mins < 1440) return `${mins / 60} hours before`;
        return '1 day before';
    }

    attachEvents(cardElement, taskId) {
        // Checkbox toggle
        const checkbox = cardElement.querySelector('.task-checkbox');
        if (checkbox) {
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                this.taskManager.toggleComplete(taskId);
            });
        }
        
        // Edit button
        const editBtn = cardElement.querySelector('.edit-task');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.taskManager.showEditTaskModal(taskId);
            });
        }
        
        // Delete button
        const deleteBtn = cardElement.querySelector('.delete-task');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.taskManager.deleteTask(taskId);
            });
        }
        
        // Subtask checkboxes
        const subtaskCheckboxes = cardElement.querySelectorAll('.subtask-checkbox');
        subtaskCheckboxes.forEach(cb => {
            cb.addEventListener('change', (e) => {
                e.stopPropagation();
                const taskId = cb.dataset.taskId;
                const subtaskId = cb.dataset.subtaskId;
                this.taskManager.toggleSubtask(taskId, subtaskId);
            });
        });
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

window.TaskCard = TaskCard;