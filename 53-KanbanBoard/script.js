document.addEventListener('DOMContentLoaded', function() {
  
    initKanbanBoard();
    
    document.getElementById('current-year').textContent = new Date().getFullYear();
});

let state = {
    columns: [],
    currentView: 'board',
    selectedTask: null,
    selectedColumnColor: '#3b82f6',
    draggedTask: null,
    draggedColumn: null,
    settings: {
        theme: 'dark',
        userName: 'You'
    },
    calendarMonth: null
};

// Label colors
const LABEL_COLORS = {
    bug: '#ef4444',
    feature: '#10b981',
    improvement: '#3b82f6',
    documentation: '#8b5cf6',
    design: '#ec4899'
};

// Initialize the application
function initKanbanBoard() {
    // Load data from localStorage
    loadData();
    
    // Set theme
    document.documentElement.setAttribute('data-theme', state.settings.theme);
    updateThemeButton();
    
    // Update user avatar
    updateUserAvatar();
    
    // Load initial data
    renderBoard();
    updateStats();
    setupEventListeners();
    
    // Initialize drag and drop
    initDragAndDrop();
}

// Load data from localStorage
function loadData() {
    // Load columns
    const savedColumns = localStorage.getItem('flowboardColumns');
    if (savedColumns) {
        state.columns = JSON.parse(savedColumns);
    } else {
        // Create default columns if none exist
        state.columns = [
            {
                id: 'col-1',
                title: 'To Do',
                color: '#3b82f6',
                wipLimit: 0,
                tasks: [
                    {
                        id: 'task-1',
                        title: 'Design homepage',
                        description: 'Create wireframes and mockups for the new homepage design',
                        priority: 'high',
                        labels: ['design', 'feature'],
                        assignee: 'me',
                        dueDate: getFutureDate(7),
                        createdAt: new Date().toISOString(),
                        columnId: 'col-1'
                    },
                    {
                        id: 'task-2',
                        title: 'Fix login bug',
                        description: 'Users are experiencing issues with the login form on mobile devices',
                        priority: 'high',
                        labels: ['bug'],
                        assignee: '',
                        dueDate: getFutureDate(3),
                        createdAt: new Date().toISOString(),
                        columnId: 'col-1'
                    }
                ]
            },
            {
                id: 'col-2',
                title: 'In Progress',
                color: '#f59e0b',
                wipLimit: 3,
                tasks: [
                    {
                        id: 'task-3',
                        title: 'Implement API endpoints',
                        description: 'Create REST API endpoints for user management',
                        priority: 'medium',
                        labels: ['feature', 'improvement'],
                        assignee: 'me',
                        dueDate: getFutureDate(14),
                        createdAt: new Date().toISOString(),
                        columnId: 'col-2'
                    }
                ]
            },
            {
                id: 'col-3',
                title: 'Review',
                color: '#8b5cf6',
                wipLimit: 0,
                tasks: [
                    {
                        id: 'task-4',
                        title: 'Update documentation',
                        description: 'Update API documentation with new endpoints',
                        priority: 'low',
                        labels: ['documentation'],
                        assignee: '',
                        dueDate: getFutureDate(21),
                        createdAt: new Date().toISOString(),
                        columnId: 'col-3'
                    }
                ]
            },
            {
                id: 'col-4',
                title: 'Done',
                color: '#10b981',
                wipLimit: 0,
                tasks: [
                    {
                        id: 'task-5',
                        title: 'Setup project repository',
                        description: 'Initialize Git repository and setup project structure',
                        priority: 'medium',
                        labels: [],
                        assignee: 'me',
                        dueDate: getPastDate(2),
                        createdAt: new Date().toISOString(),
                        columnId: 'col-4'
                    }
                ]
            }
        ];
    }
    
    // Load settings
    const savedSettings = localStorage.getItem('flowboardSettings');
    if (savedSettings) {
        state.settings = JSON.parse(savedSettings);
    }
}

// Helper function to get future date
function getFutureDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

// Helper function to get past date
function getPastDate(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
}

// Set up event listeners
function setupEventListeners() {
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Export board
    document.getElementById('export-board').addEventListener('click', exportBoard);
    
    // Import board
    document.getElementById('import-board').addEventListener('click', () => {
        // Create file input for import
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.addEventListener('change', handleImport);
        fileInput.click();
    });
    
    // Reset board
    document.getElementById('reset-board').addEventListener('click', resetBoard);
    
    // Add task buttons
    document.getElementById('add-task-global').addEventListener('click', () => openTaskForm());
    document.getElementById('add-task-quick').addEventListener('click', () => openTaskForm());
    document.getElementById('add-task-list').addEventListener('click', () => openTaskForm());
    
    // Add column buttons
    document.getElementById('add-column-quick').addEventListener('click', () => openColumnForm());
    document.getElementById('create-first-column').addEventListener('click', () => openColumnForm());
    
    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            switchView(this.dataset.view);
        });
    });
    
    // Search tasks
    document.getElementById('search-tasks').addEventListener('input', searchTasks);
    document.getElementById('clear-search').addEventListener('click', () => {
        document.getElementById('search-tasks').value = '';
        searchTasks();
    });
    
    // Filter tasks
    document.getElementById('filter-priority').addEventListener('change', filterTasks);
    document.getElementById('filter-assignee').addEventListener('change', filterTasks);
    
    // Calendar navigation
    document.getElementById('prev-month').addEventListener('click', navigateCalendarMonth);
    document.getElementById('next-month').addEventListener('click', navigateCalendarMonth);
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    
    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModals();
            }
        });
    });
    
    // Task form submission
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
        taskForm.addEventListener('submit', saveTask);
    }
    
    // Column form submission
    const columnForm = document.getElementById('column-form');
    if (columnForm) {
        columnForm.addEventListener('submit', saveColumn);
    }
    
    // Priority selector
    document.querySelectorAll('.priority-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.priority-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('task-priority').value = this.dataset.priority;
        });
    });
    
    // Label selector
    document.querySelectorAll('.label-option').forEach(option => {
        option.addEventListener('click', function() {
            this.classList.toggle('selected');
            updateSelectedLabels();
        });
    });
    
    // Color palette
    const colorOptions = document.querySelectorAll('.color-option');
    if (colorOptions.length > 0) {
        colorOptions.forEach(option => {
            option.addEventListener('click', function() {
                document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                const colorValue = this.dataset.color || '#3b82f6';
                document.getElementById('column-color').value = colorValue;
                state.selectedColumnColor = colorValue;
            });
        });
        
        // Set default selection
        const defaultColor = document.querySelector('.color-option[data-color="#3b82f6"]');
        if (defaultColor) {
            defaultColor.click();
        }
    }
    
    // Task card event delegation
    document.addEventListener('click', function(e) {
        // View task button
        if (e.target.closest('.view-task')) {
            const taskId = e.target.closest('.view-task').dataset.taskId;
            viewTaskDetails(taskId);
            return;
        }
        
        // Edit task button
        if (e.target.closest('.edit-task')) {
            const taskId = e.target.closest('.edit-task').dataset.taskId;
            editTask(taskId);
            return;
        }
        
        // Task card click (for opening details)
        if (e.target.closest('.task-card') && !e.target.closest('.task-action-btn')) {
            const taskId = e.target.closest('.task-card').dataset.taskId;
            viewTaskDetails(taskId);
            return;
        }
        
        // Add task to column button
        if (e.target.closest('.add-task-to-column')) {
            const columnId = e.target.closest('.add-task-to-column').dataset.columnId;
            openTaskForm(columnId);
            return;
        }
        
        // Edit column button
        if (e.target.closest('.edit-column')) {
            const columnId = e.target.closest('.edit-column').dataset.columnId;
            editColumn(columnId);
            return;
        }
        
        // Delete column button
        if (e.target.closest('.delete-column')) {
            const columnId = e.target.closest('.delete-column').dataset.columnId;
            deleteColumn(columnId);
            return;
        }
    });
}

// Initialize drag and drop
function initDragAndDrop() {
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);
    document.addEventListener('dragend', handleDragEnd);
}

// Render the kanban board
function renderBoard() {
    const board = document.getElementById('kanban-board');
    const emptyBoard = document.getElementById('empty-board');
    
    // Check if board is empty
    if (!state.columns || state.columns.length === 0) {
        board.innerHTML = '';
        emptyBoard.style.display = 'flex';
        board.appendChild(emptyBoard);
        return;
    }
    
    // Hide empty board message
    emptyBoard.style.display = 'none';
    
    // Clear board
    board.innerHTML = '';
    
    // Render each column
    state.columns.forEach(column => {
        const columnElement = createColumnElement(column);
        board.appendChild(columnElement);
    });
    
    // Update column select in task form
    updateColumnSelect();
    
    // Update list view if active
    if (state.currentView === 'list') {
        renderListView();
    }
    
    // Update calendar view if active
    if (state.currentView === 'calendar') {
        renderCalendarView();
    }
}

// Create column element
function createColumnElement(column) {
    const columnElement = document.createElement('div');
    columnElement.className = 'kanban-column glass';
    columnElement.dataset.columnId = column.id;
    columnElement.draggable = true;
    
    // Calculate task count
    const taskCount = column.tasks ? column.tasks.length : 0;
    
    columnElement.innerHTML = `
        <div class="column-header">
            <div class="column-title">
                <span class="column-color" style="background-color: ${column.color}"></span>
                <span>${column.title}</span>
            </div>
            <div class="column-stats">
                <span class="task-count">${taskCount}</span>
                ${column.wipLimit > 0 ? `<span class="wip-limit">WIP: ${taskCount}/${column.wipLimit}</span>` : ''}
            </div>
            <div class="column-actions">
                <button class="column-action-btn add-task-to-column" data-column-id="${column.id}">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="column-action-btn edit-column" data-column-id="${column.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="column-action-btn delete-column" data-column-id="${column.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="column-content">
            <div class="task-list" data-column-id="${column.id}">
                ${column.tasks ? column.tasks.map(task => createTaskElement(task)).join('') : ''}
            </div>
        </div>
        <div class="column-footer">
            <button class="add-task-btn" data-column-id="${column.id}">
                <i class="fas fa-plus"></i>
                Add Task
            </button>
        </div>
    `;
    
    // Add event listeners for column actions
    const addTaskBtn = columnElement.querySelector('.add-task-btn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => openTaskForm(column.id));
    }
    
    // Make column draggable
    columnElement.addEventListener('dragstart', (e) => {
        state.draggedColumn = column;
        e.dataTransfer.setData('text/plain', column.id);
        e.dataTransfer.effectAllowed = 'move';
        columnElement.classList.add('dragging');
    });
    
    columnElement.addEventListener('dragend', () => {
        columnElement.classList.remove('dragging');
        state.draggedColumn = null;
    });
    
    // Add drop zone for tasks
    const taskList = columnElement.querySelector('.task-list');
    if (taskList) {
        taskList.addEventListener('dragover', (e) => {
            e.preventDefault();
            taskList.classList.add('drop-zone');
        });
        
        taskList.addEventListener('dragleave', () => {
            taskList.classList.remove('drop-zone');
        });
        
        taskList.addEventListener('drop', (e) => {
            e.preventDefault();
            taskList.classList.remove('drop-zone');
            
            if (state.draggedTask) {
                moveTaskToColumn(state.draggedTask.id, column.id);
                state.draggedTask = null;
            }
        });
    }
    
    return columnElement;
}

// Create task element
function createTaskElement(task) {
    if (!task) return '';
    
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const isOverdue = dueDate && dueDate < new Date() && dueDate.toDateString() !== new Date().toDateString();
    
    const labelsHtml = task.labels ? task.labels.map(label => `
        <span class="task-label" style="background-color: ${LABEL_COLORS[label] || '#64748b'}">
            ${label}
        </span>
    `).join('') : '';
    
    const assigneeHtml = task.assignee === 'me' ? `
        <div class="task-assignee">
            <div class="assignee-avatar">
                <img src="https://ui-avatars.com/api/?name=${state.settings.userName}&background=7c3aed&color=fff" alt="Assignee">
            </div>
            <span>Me</span>
        </div>
    ` : '<div class="task-assignee">Unassigned</div>';
    
    const dueDateHtml = dueDate ? `
        <div class="task-due ${isOverdue ? 'overdue' : ''}">
            <i class="fas fa-calendar"></i>
            <span>${formatDate(dueDate)}</span>
        </div>
    ` : '';
    
    return `
        <div class="task-card glass" data-task-id="${task.id}" draggable="true">
            <div class="task-header">
                <div class="task-title">${task.title}</div>
                <div class="task-priority ${task.priority || 'medium'}"></div>
            </div>
            <div class="task-body">
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                ${labelsHtml ? `<div class="task-labels">${labelsHtml}</div>` : ''}
            </div>
            <div class="task-footer">
                <div class="task-meta">
                    ${assigneeHtml}
                    ${dueDateHtml}
                </div>
                <div class="task-actions">
                    <button class="task-action-btn view-task" data-task-id="${task.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="task-action-btn edit-task" data-task-id="${task.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Update column select in task form
function updateColumnSelect() {
    const columnSelect = document.getElementById('task-column');
    if (!columnSelect) return;
    
    columnSelect.innerHTML = '';
    
    state.columns.forEach(column => {
        const option = document.createElement('option');
        option.value = column.id;
        option.textContent = column.title;
        columnSelect.appendChild(option);
    });
}

// Open task form
function openTaskForm(columnId = null) {
    const form = document.getElementById('task-form');
    const modal = document.getElementById('task-form-modal');
    const title = document.getElementById('task-form-title');
    
    if (!form || !modal || !title) return;
    
    // Reset form
    form.reset();
    document.querySelectorAll('.priority-option').forEach(opt => opt.classList.remove('active'));
    const mediumPriority = document.querySelector('.priority-option[data-priority="medium"]');
    if (mediumPriority) {
        mediumPriority.classList.add('active');
    }
    document.getElementById('task-priority').value = 'medium';
    
    document.querySelectorAll('.label-option').forEach(opt => opt.classList.remove('selected'));
    const selectedLabels = document.getElementById('selected-labels');
    if (selectedLabels) {
        selectedLabels.innerHTML = '';
    }
    document.getElementById('task-labels').value = '';
    
    // Set column if provided
    if (columnId) {
        document.getElementById('task-column').value = columnId;
    }
    
    // Set default due date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDateInput = document.getElementById('task-due-date');
    if (dueDateInput) {
        dueDateInput.valueAsDate = tomorrow;
    }
    
    // Update form title
    title.innerHTML = '<i class="fas fa-plus"></i> Add New Task';
    
    // Clear editing task ID
    delete state.editingTaskId;
    
    // Show modal
    modal.classList.add('active');
    
    // Focus on title input
    const titleInput = document.getElementById('task-title');
    if (titleInput) {
        titleInput.focus();
    }
}

// Save task
function saveTask(e) {
    e.preventDefault();
    
    const title = document.getElementById('task-title').value.trim();
    const columnId = document.getElementById('task-column').value;
    const description = document.getElementById('task-description').value.trim();
    const priority = document.getElementById('task-priority').value;
    const assignee = document.getElementById('task-assignee').value;
    const dueDate = document.getElementById('task-due-date').value;
    const labels = document.getElementById('task-labels').value.split(',').filter(label => label.trim());
    
    // Validate inputs
    if (!title) {
        showToast('Please enter a task title', 'error');
        return;
    }
    
    if (!columnId) {
        showToast('Please select a column', 'error');
        return;
    }
    
    // Find column
    const column = state.columns.find(col => col.id === columnId);
    if (!column) {
        showToast('Selected column not found', 'error');
        return;
    }
    
    // Check WIP limit
    if (column.wipLimit > 0 && column.tasks.length >= column.wipLimit) {
        showToast(`WIP limit reached for "${column.title}" column (${column.wipLimit} tasks)`, 'warning');
        return;
    }
    
    if (state.editingTaskId) {
        // Update existing task
        let taskFound = false;
        for (const col of state.columns) {
            const taskIndex = col.tasks.findIndex(task => task.id === state.editingTaskId);
            if (taskIndex !== -1) {
                // Remove from old column
                const task = col.tasks.splice(taskIndex, 1)[0];
                
                // Update task properties
                task.title = title;
                task.description = description;
                task.priority = priority;
                task.labels = labels;
                task.assignee = assignee;
                task.dueDate = dueDate || null;
                task.columnId = columnId;
                
                // Add to new column
                column.tasks.push(task);
                taskFound = true;
                break;
            }
        }
        
        if (!taskFound) {
            showToast('Task not found for editing', 'error');
            return;
        }
        
        delete state.editingTaskId;
    } else {
        // Create new task object
        const task = {
            id: `task-${Date.now()}`,
            title,
            description,
            priority,
            labels,
            assignee,
            dueDate: dueDate || null,
            createdAt: new Date().toISOString(),
            columnId
        };
        
        // Add task to column
        column.tasks.push(task);
    }
    
    // Save and update UI
    saveData();
    renderBoard();
    updateStats();
    
    // Close modal and show success
    closeModals();
    showToast(`Task ${state.editingTaskId ? 'updated' : 'added'} successfully!`);
}

// Update selected labels display
function updateSelectedLabels() {
    const selectedLabels = Array.from(document.querySelectorAll('.label-option.selected'))
        .map(option => option.dataset.label);
    
    const selectedLabelsContainer = document.getElementById('selected-labels');
    const taskLabelsInput = document.getElementById('task-labels');
    
    if (!selectedLabelsContainer || !taskLabelsInput) return;
    
    selectedLabelsContainer.innerHTML = '';
    
    selectedLabels.forEach(label => {
        const labelElement = document.createElement('div');
        labelElement.className = 'task-label';
        labelElement.style.backgroundColor = LABEL_COLORS[label] || '#64748b';
        labelElement.textContent = label;
        selectedLabelsContainer.appendChild(labelElement);
    });
    
    taskLabelsInput.value = selectedLabels.join(',');
}

// Open column form
function openColumnForm(columnId = null) {
    const form = document.getElementById('column-form');
    const modal = document.getElementById('column-form-modal');
    
    if (!form || !modal) return;
    
    // Reset form
    form.reset();
    document.getElementById('column-wip').value = '';
    
    // Set default color
    document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
    const defaultColor = document.querySelector(`.color-option[data-color="${state.selectedColumnColor}"]`);
    if (defaultColor) {
        defaultColor.classList.add('selected');
    }
    document.getElementById('column-color').value = state.selectedColumnColor;
    
    // If editing existing column, populate data
    if (columnId) {
        const column = state.columns.find(col => col.id === columnId);
        if (column) {
            document.getElementById('column-title').value = column.title;
            document.getElementById('column-color').value = column.color;
            document.getElementById('column-wip').value = column.wipLimit || '';
            
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            const colorOption = document.querySelector(`.color-option[data-color="${column.color}"]`);
            if (colorOption) {
                colorOption.classList.add('selected');
            }
            
            // Store column ID for editing
            state.editingColumnId = columnId;
        }
    } else {
        // Clear editing column ID
        delete state.editingColumnId;
    }
    
    // Show modal
    modal.classList.add('active');
    document.getElementById('column-title').focus();
}

// Save column
function saveColumn(e) {
    e.preventDefault();
    
    const title = document.getElementById('column-title').value.trim();
    const color = document.getElementById('column-color').value;
    const wipLimit = parseInt(document.getElementById('column-wip').value) || 0;
    
    // Validate inputs
    if (!title) {
        showToast('Please enter a column title', 'error');
        return;
    }
    
    if (state.editingColumnId) {
        // Update existing column
        const columnIndex = state.columns.findIndex(col => col.id === state.editingColumnId);
        if (columnIndex !== -1) {
            // Check if name already exists (excluding current column)
            const existingColumn = state.columns.find(col => 
                col.id !== state.editingColumnId && 
                col.title.toLowerCase() === title.toLowerCase()
            );
            
            if (existingColumn) {
                showToast('A column with this name already exists', 'error');
                return;
            }
            
            state.columns[columnIndex].title = title;
            state.columns[columnIndex].color = color;
            state.columns[columnIndex].wipLimit = wipLimit;
            
            delete state.editingColumnId;
        } else {
            showToast('Column not found for editing', 'error');
            return;
        }
    } else {
        // Check if column name already exists
        const existingColumn = state.columns.find(col => 
            col.title.toLowerCase() === title.toLowerCase()
        );
        
        if (existingColumn) {
            showToast('A column with this name already exists', 'error');
            return;
        }
        
        // Create new column
        const column = {
            id: `col-${Date.now()}`,
            title,
            color,
            wipLimit,
            tasks: []
        };
        state.columns.push(column);
    }
    
    // Save and update UI
    saveData();
    renderBoard();
    updateStats();
    
    // Close modal and show success
    closeModals();
    showToast(`Column ${state.editingColumnId ? 'updated' : 'added'} successfully!`);
}

// Edit column
function editColumn(columnId) {
    openColumnForm(columnId);
}

// Delete column
function deleteColumn(columnId) {
    const column = state.columns.find(col => col.id === columnId);
    if (!column) return;
    
    // Check if column has tasks
    if (column.tasks.length > 0) {
        if (!confirm(`"${column.title}" has ${column.tasks.length} tasks. Delete anyway?`)) {
            return;
        }
    }
    
    // Remove column
    state.columns = state.columns.filter(col => col.id !== columnId);
    
    // Save and update UI
    saveData();
    renderBoard();
    updateStats();
    
    showToast('Column deleted successfully!');
}

// View task details
function viewTaskDetails(taskId) {
    const task = findTaskById(taskId);
    if (!task) {
        showToast('Task not found', 'error');
        return;
    }
    
    state.selectedTask = task;
    
    // Populate modal with task details
    document.getElementById('modal-task-title').textContent = task.title;
    document.getElementById('modal-task-description').textContent = 
        task.description || 'No description provided.';
    
    const column = state.columns.find(col => col.id === task.columnId);
    document.getElementById('modal-task-column').textContent = column ? column.title : 'Unknown';
    document.getElementById('modal-task-priority').textContent = 
        task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium';
    
    document.getElementById('modal-task-assignee').textContent = 
        task.assignee === 'me' ? state.settings.userName : 'Unassigned';
    
    document.getElementById('modal-task-due').textContent = 
        task.dueDate ? formatDate(new Date(task.dueDate)) : 'No due date';
    
    document.getElementById('modal-task-created').textContent = 
        task.createdAt ? formatDate(new Date(task.createdAt)) : 'Recently';
    
    // Update labels
    const labelsContainer = document.getElementById('modal-task-labels');
    if (labelsContainer) {
        labelsContainer.innerHTML = '';
        
        if (task.labels && task.labels.length > 0) {
            task.labels.forEach(label => {
                const labelElement = document.createElement('div');
                labelElement.className = 'task-label';
                labelElement.style.backgroundColor = LABEL_COLORS[label] || '#64748b';
                labelElement.textContent = label;
                labelsContainer.appendChild(labelElement);
            });
        } else {
            labelsContainer.innerHTML = '<span style="color: var(--text-secondary);">No labels</span>';
        }
    }
    
    // Load activity log
    loadActivityLog(taskId);
    
    // Set up action buttons
    const deleteBtn = document.getElementById('delete-task-btn');
    const editBtn = document.getElementById('edit-task-btn');
    
    if (deleteBtn) {
        deleteBtn.onclick = () => {
            if (confirm('Are you sure you want to delete this task?')) {
                deleteTask(taskId);
                closeModals();
            }
        };
    }
    
    if (editBtn) {
        editBtn.onclick = () => {
            editTask(taskId);
            closeModals();
        };
    }
    
    // Show modal
    document.getElementById('task-detail-modal').classList.add('active');
}

// Load activity log for a task
function loadActivityLog(taskId) {
    const activityLog = document.getElementById('modal-activity-log');
    if (!activityLog) return;
    
    activityLog.innerHTML = '';
    
    const task = findTaskById(taskId);
    if (!task) return;
    
    // Add some sample activities
    const activities = [
        {
            action: 'Task created',
            time: formatTimeAgo(new Date(task.createdAt))
        }
    ];
    
    if (task.assignee) {
        activities.push({
            action: `Assigned to ${task.assignee === 'me' ? state.settings.userName : 'Unassigned'}`,
            time: formatTimeAgo(new Date(task.createdAt))
        });
    }
    
    if (task.priority) {
        activities.push({
            action: `Priority set to ${task.priority}`,
            time: formatTimeAgo(new Date(task.createdAt))
        });
    }
    
    if (task.dueDate) {
        activities.push({
            action: `Due date set to ${formatDate(new Date(task.dueDate))}`,
            time: formatTimeAgo(new Date(task.createdAt))
        });
    }
    
    if (task.labels && task.labels.length > 0) {
        activities.push({
            action: `Labels added: ${task.labels.join(', ')}`,
            time: formatTimeAgo(new Date(task.createdAt))
        });
    }
    
    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        activityItem.innerHTML = `
            <span class="activity-action">${activity.action}</span>
            <span class="activity-time">${activity.time}</span>
        `;
        
        activityLog.appendChild(activityItem);
    });
}

// Edit task
function editTask(taskId) {
    const task = findTaskById(taskId);
    if (!task) {
        showToast('Task not found', 'error');
        return;
    }
    
    // Open task form with task data
    const form = document.getElementById('task-form');
    const modal = document.getElementById('task-form-modal');
    const title = document.getElementById('task-form-title');
    
    if (!form || !modal || !title) return;
    
    // Populate form with task data
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-column').value = task.columnId;
    document.getElementById('task-description').value = task.description || '';
    
    document.querySelectorAll('.priority-option').forEach(opt => opt.classList.remove('active'));
    const priorityOption = document.querySelector(`.priority-option[data-priority="${task.priority || 'medium'}"]`);
    if (priorityOption) {
        priorityOption.classList.add('active');
    }
    document.getElementById('task-priority').value = task.priority || 'medium';
    
    document.getElementById('task-assignee').value = task.assignee || '';
    
    const dueDateInput = document.getElementById('task-due-date');
    if (dueDateInput && task.dueDate) {
        dueDateInput.value = task.dueDate;
    }
    
    // Set labels
    document.querySelectorAll('.label-option').forEach(opt => {
        opt.classList.toggle('selected', task.labels && task.labels.includes(opt.dataset.label));
    });
    updateSelectedLabels();
    
    // Update form title
    title.innerHTML = '<i class="fas fa-edit"></i> Edit Task';
    
    // Store task ID for update
    state.editingTaskId = taskId;
    
    // Show modal
    modal.classList.add('active');
}

// Delete task
function deleteTask(taskId, showToast = true) {
    // Find task and its column
    for (const column of state.columns) {
        const taskIndex = column.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            column.tasks.splice(taskIndex, 1);
            break;
        }
    }
    
    // Save and update UI
    saveData();
    renderBoard();
    updateStats();
    
    if (showToast) {
        showToast('Task deleted successfully!');
    }
}

// Find task by ID
function findTaskById(taskId) {
    for (const column of state.columns) {
        const task = column.tasks.find(task => task.id === taskId);
        if (task) return task;
    }
    return null;
}

// Move task to different column
function moveTaskToColumn(taskId, columnId) {
    let task = null;
    let sourceColumnIndex = -1;
    let taskIndex = -1;
    
    // Find task and its current column
    for (let i = 0; i < state.columns.length; i++) {
        const column = state.columns[i];
        taskIndex = column.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            task = column.tasks[taskIndex];
            sourceColumnIndex = i;
            break;
        }
    }
    
    if (!task) return;
    
    // Find destination column
    const destColumn = state.columns.find(col => col.id === columnId);
    if (!destColumn) return;
    
    // Check WIP limit
    if (destColumn.wipLimit > 0 && destColumn.tasks.length >= destColumn.wipLimit) {
        showToast(`Cannot move task: WIP limit reached for "${destColumn.title}" column`, 'warning');
        return;
    }
    
    // Move task
    state.columns[sourceColumnIndex].tasks.splice(taskIndex, 1);
    task.columnId = columnId;
    destColumn.tasks.push(task);
    
    // Save and update UI
    saveData();
    renderBoard();
    updateStats();
    
    // Show activity message
    showToast(`Task moved to "${destColumn.title}"`);
}

// Drag and drop handlers
function handleDragStart(e) {
    if (!e.target.classList.contains('task-card')) return;
    
    const taskId = e.target.dataset.taskId;
    state.draggedTask = findTaskById(taskId);
    
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.target.classList.add('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    
    // Find drop target
    const taskList = e.target.closest('.task-list');
    if (taskList) {
        taskList.classList.add('drop-zone');
    }
    
    // Set drop effect
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    e.preventDefault();
    
    // Find drop target
    const taskList = e.target.closest('.task-list');
    if (taskList) {
        taskList.classList.remove('drop-zone');
        
        const columnId = taskList.dataset.columnId;
        const taskId = e.dataTransfer.getData('text/plain');
        
        moveTaskToColumn(taskId, columnId);
    }
}

function handleDragEnd(e) {
    // Remove dragging class from all elements
    document.querySelectorAll('.dragging').forEach(el => {
        el.classList.remove('dragging');
    });
    
    // Remove drop zone class
    document.querySelectorAll('.drop-zone').forEach(el => {
        el.classList.remove('drop-zone');
    });
    
    state.draggedTask = null;
}

// Switch between views
function switchView(view) {
    state.currentView = view;
    
    // Hide all views
    document.getElementById('kanban-board').style.display = 'none';
    document.getElementById('list-view').style.display = 'none';
    document.getElementById('calendar-view').style.display = 'none';
    
    // Show selected view
    if (view === 'board') {
        document.getElementById('kanban-board').style.display = 'flex';
        renderBoard();
    } else if (view === 'list') {
        document.getElementById('list-view').style.display = 'block';
        renderListView();
    } else if (view === 'calendar') {
        document.getElementById('calendar-view').style.display = 'block';
        renderCalendarView();
    }
}

// Render list view
function renderListView() {
    const listContent = document.getElementById('task-list');
    if (!listContent) return;
    
    listContent.innerHTML = '';
    
    // Collect all tasks
    const allTasks = [];
    state.columns.forEach(column => {
        if (column.tasks) {
            column.tasks.forEach(task => {
                allTasks.push({
                    ...task,
                    columnTitle: column.title,
                    columnColor: column.color
                });
            });
        }
    });
    
    if (allTasks.length === 0) {
        listContent.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                <i class="fas fa-tasks" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                <h4 style="margin-bottom: 0.5rem;">No tasks yet</h4>
                <p>Create your first task to get started</p>
            </div>
        `;
        return;
    }
    
    // Apply filters
    const priorityFilter = document.getElementById('filter-priority').value;
    const assigneeFilter = document.getElementById('filter-assignee').value;
    const searchTerm = document.getElementById('search-tasks').value.toLowerCase();
    
    let filteredTasks = allTasks;
    
    if (priorityFilter !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
    }
    
    if (assigneeFilter === 'me') {
        filteredTasks = filteredTasks.filter(task => task.assignee === 'me');
    } else if (assigneeFilter === 'unassigned') {
        filteredTasks = filteredTasks.filter(task => !task.assignee);
    }
    
    if (searchTerm) {
        filteredTasks = filteredTasks.filter(task => 
            task.title.toLowerCase().includes(searchTerm) ||
            (task.description && task.description.toLowerCase().includes(searchTerm))
        );
    }
    
    // Render tasks
    filteredTasks.forEach(task => {
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const isOverdue = dueDate && dueDate < new Date() && dueDate.toDateString() !== new Date().toDateString();
        
        const listItem = document.createElement('div');
        listItem.className = 'list-item glass';
        listItem.dataset.taskId = task.id;
        
        listItem.innerHTML = `
            <div class="list-item-content">
                <div class="list-item-title">${task.title}</div>
                <div class="list-item-meta">
                    <span class="task-priority ${task.priority || 'medium'}" style="display: inline-block; width: 8px; height: 8px; border-radius: 50%;"></span>
                    <span style="color: ${task.columnColor}">${task.columnTitle}</span>
                    ${dueDate ? `<span class="${isOverdue ? 'overdue' : ''}" style="color: ${isOverdue ? '#ef4444' : 'inherit'}">Due: ${formatDate(dueDate)}</span>` : ''}
                </div>
            </div>
            <div class="list-item-actions">
                <button class="task-action-btn view-task" data-task-id="${task.id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="task-action-btn edit-task" data-task-id="${task.id}">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
        
        listContent.appendChild(listItem);
    });
}

// Render calendar view
function renderCalendarView() {
    const calendarGrid = document.getElementById('calendar-grid');
    const currentMonthEl = document.getElementById('current-month');
    
    if (!calendarGrid || !currentMonthEl) return;
    
    // Set current month
    const today = new Date();
    const currentMonth = state.calendarMonth ? new Date(state.calendarMonth) : today;
    currentMonthEl.textContent = currentMonth.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
    });
    
    // Clear calendar
    calendarGrid.innerHTML = '';
    
    // Get first day of month and total days
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    // Create day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(dayName => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = dayName;
        calendarGrid.appendChild(dayHeader);
    });
    
    // Previous month days
    const prevMonthLastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();
    
    // Create calendar days
    for (let i = 0; i < 42; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day glass';
        
        let dayNumber;
        let date;
        let isOtherMonth = false;
        
        if (i < startingDay) {
            // Previous month
            dayNumber = prevMonthLastDay - startingDay + i + 1;
            date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, dayNumber);
            isOtherMonth = true;
        } else if (i >= startingDay + daysInMonth) {
            // Next month
            dayNumber = i - startingDay - daysInMonth + 1;
            date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, dayNumber);
            isOtherMonth = true;
        } else {
            // Current month
            dayNumber = i - startingDay + 1;
            date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNumber);
        }
        
        // Check if today
        const isToday = date.toDateString() === today.toDateString();
        
        // Get tasks for this day
        const tasksForDay = [];
        state.columns.forEach(column => {
            if (column.tasks) {
                column.tasks.forEach(task => {
                    if (task.dueDate) {
                        const taskDueDate = new Date(task.dueDate).toDateString();
                        if (taskDueDate === date.toDateString()) {
                            tasksForDay.push(task);
                        }
                    }
                });
            }
        });
        
        const dayHeaderClass = isToday ? 'calendar-day-header today' : 'calendar-day-header';
        
        dayElement.innerHTML = `
            <div class="${dayHeaderClass}">
                ${dayNumber}
            </div>
            <div class="calendar-day-content">
                ${tasksForDay.slice(0, 3).map(task => `
                    <div class="calendar-task" style="background-color: ${state.columns.find(col => col.id === task.columnId)?.color || '#3b82f6'}">
                        ${task.title}
                    </div>
                `).join('')}
                ${tasksForDay.length > 3 ? `<div class="calendar-task">+${tasksForDay.length - 3} more</div>` : ''}
            </div>
        `;
        
        // Add click event to view tasks
        if (tasksForDay.length > 0) {
            dayElement.style.cursor = 'pointer';
            dayElement.addEventListener('click', () => {
                showToast(`${tasksForDay.length} tasks due on ${formatDate(date)}`);
            });
        }
        
        if (isOtherMonth) {
            dayElement.style.opacity = '0.5';
        }
        
        calendarGrid.appendChild(dayElement);
    }
}

// Navigate calendar month
function navigateCalendarMonth(e) {
    if (!e.currentTarget) return;
    
    const currentMonth = state.calendarMonth ? new Date(state.calendarMonth) : new Date();
    
    if (e.currentTarget.id === 'prev-month') {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
    } else {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
    }
    
    state.calendarMonth = currentMonth.toISOString();
    renderCalendarView();
}

// Search tasks
function searchTasks() {
    if (state.currentView === 'board') {
        // For board view, we need to filter tasks visually
        const searchTerm = document.getElementById('search-tasks').value.toLowerCase();
        
        if (!searchTerm) {
            // Reset all tasks to visible
            document.querySelectorAll('.task-card').forEach(card => {
                card.style.display = 'block';
            });
            return;
        }
        
        // Hide/show tasks based on search
        document.querySelectorAll('.task-card').forEach(card => {
            const taskTitle = card.querySelector('.task-title').textContent.toLowerCase();
            const taskDescription = card.querySelector('.task-description')?.textContent.toLowerCase() || '';
            
            if (taskTitle.includes(searchTerm) || taskDescription.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    } else if (state.currentView === 'list') {
        renderListView();
    }
}

// Filter tasks
function filterTasks() {
    if (state.currentView === 'list') {
        renderListView();
    }
}

// Update statistics
function updateStats() {
    // Calculate total tasks
    let totalTasks = 0;
    state.columns.forEach(column => {
        totalTasks += column.tasks ? column.tasks.length : 0;
    });
    
    document.getElementById('total-tasks').textContent = totalTasks;
    document.getElementById('total-columns').textContent = state.columns.length;
    document.getElementById('storage-stats').textContent = `${totalTasks} tasks`;
}

// Update user avatar
function updateUserAvatar() {
    const avatar = document.querySelector('.user-avatar img');
    if (avatar) {
        avatar.src = `https://ui-avatars.com/api/?name=${state.settings.userName}&background=7c3aed&color=fff`;
    }
}

// Toggle theme
function toggleTheme() {
    state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.settings.theme);
    saveData();
    updateThemeButton();
}

// Update theme button
function updateThemeButton() {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;
    
    const icon = themeBtn.querySelector('i');
    const text = themeBtn.querySelector('span');
    
    if (state.settings.theme === 'dark') {
        icon.className = 'fas fa-moon';
        if (text) text.textContent = 'Dark';
    } else {
        icon.className = 'fas fa-sun';
        if (text) text.textContent = 'Light';
    }
}

// Export board data
function exportBoard() {
    const data = {
        columns: state.columns,
        settings: state.settings,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `flowboard-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast('Board exported successfully!');
}

// Handle import
function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Validate data structure
            if (!data.columns || !Array.isArray(data.columns)) {
                throw new Error('Invalid file format');
            }
            
            // Confirm import
            if (!confirm('Importing will replace your current board. Continue?')) {
                return;
            }
            
            // Import data
            state.columns = data.columns;
            if (data.settings) {
                state.settings = data.settings;
            }
            
            // Save and update UI
            saveData();
            renderBoard();
            updateStats();
            updateThemeButton();
            updateUserAvatar();
            
            showToast('Board imported successfully!');
        } catch (error) {
            showToast('Error importing board. Please check the file format.', 'error');
            console.error('Import error:', error);
        }
    };
    
    reader.readAsText(file);
}

// Reset board
function resetBoard() {
    if (!confirm('Are you sure you want to reset the entire board? This action cannot be undone.')) {
        return;
    }
    
    // Clear localStorage
    localStorage.removeItem('flowboardColumns');
    localStorage.removeItem('flowboardSettings');
    
    // Reload page to reset everything
    location.reload();
}

// Close all modals
function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    
    // Clear editing state
    delete state.editingColumnId;
    delete state.editingTaskId;
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('flowboardColumns', JSON.stringify(state.columns));
    localStorage.setItem('flowboardSettings', JSON.stringify(state.settings));
}

// Format date for display
function formatDate(date) {
    if (!date || !(date instanceof Date)) return 'N/A';
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }
}

// Format time ago
function formatTimeAgo(date) {
    if (!date || !(date instanceof Date)) return 'Recently';
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('i');
    
    if (!toastMessage || !toastIcon) return;
    
    // Set message and icon
    toastMessage.textContent = message;
    
    if (type === 'error') {
        toast.className = 'toast error show';
        toastIcon.className = 'fas fa-exclamation-circle';
    } else if (type === 'warning') {
        toast.className = 'toast warning show';
        toastIcon.className = 'fas fa-exclamation-triangle';
    } else {
        toast.className = 'toast show';
        toastIcon.className = 'fas fa-check-circle';
    }
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}