class KanbanBoard {
    constructor() {
        this.boards = [];
        this.currentTask = null;
        this.currentBoard = null;
        this.currentColumn = null;
        this.draggedTask = null;
        this.dragSourceColumn = null;
        
        this.initializeApp();
        this.bindEvents();
        this.loadFromLocalStorage();
        this.initializeExampleData();
    }

    initializeApp() {
        this.boardsContainer = document.getElementById('boardsContainer');
        this.eventsList = document.getElementById('eventsList');
        
        // Modals
        this.taskModal = document.getElementById('taskModal');
        this.boardModal = document.getElementById('boardModal');
        
        // Forms
        this.taskForm = document.getElementById('taskForm');
        this.boardForm = document.getElementById('boardForm');
        
        // Buttons
        this.newBoardBtn = document.getElementById('newBoardBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.importBtn = document.getElementById('importBtn');
        this.clearEventsBtn = document.getElementById('clearEventsBtn');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close modals
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => this.closeModals());
        });

        document.getElementById('cancelTaskBtn').addEventListener('click', () => this.closeModals());
        document.getElementById('cancelBoardBtn').addEventListener('click', () => this.closeModals());

        // Form submissions
        this.taskForm.addEventListener('submit', (e) => this.handleTaskSubmit(e));
        this.boardForm.addEventListener('submit', (e) => this.handleBoardSubmit(e));

        // Button clicks
        this.newBoardBtn.addEventListener('click', () => this.showBoardModal());
        this.clearBtn.addEventListener('click', () => this.clearAllData());
        this.exportBtn.addEventListener('click', () => this.exportData());
        this.importBtn.addEventListener('click', () => this.importData());
        this.clearEventsBtn.addEventListener('click', () => this.clearEvents());

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.taskModal || e.target === this.boardModal) {
                this.closeModals();
            }
        });

        // Custom event listeners
        document.addEventListener('boardUpdated', (e) => this.logEvent('board-event', `Board updated: ${e.detail.board.name}`));
        document.addEventListener('taskUpdated', (e) => this.logEvent('task-event', `Task updated: ${e.detail.task.title}`));
        document.addEventListener('taskCreated', (e) => this.logEvent('task-event', `Task created: ${e.detail.task.title}`));
        document.addEventListener('taskDeleted', (e) => this.logEvent('task-event', `Task deleted: ${e.detail.task.title}`));
        document.addEventListener('taskMoved', (e) => this.logEvent('task-event', `Task moved: ${e.detail.task.title} to ${e.detail.column}`));
    }

    bindEvents() {
        // Drag and drop events
        document.addEventListener('dragstart', (e) => this.handleDragStart(e));
        document.addEventListener('dragover', (e) => this.handleDragOver(e));
        document.addEventListener('drop', (e) => this.handleDrop(e));
        document.addEventListener('dragend', (e) => this.handleDragEnd(e));
    }

    handleDragStart(e) {
        if (!e.target.classList.contains('task')) return;
        
        this.draggedTask = e.target;
        this.dragSourceColumn = e.target.closest('.column');
        
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', e.target.id);
        
        setTimeout(() => {
            e.target.classList.add('dragging');
        }, 0);
    }

    handleDragOver(e) {
        e.preventDefault();
        
        const column = e.target.closest('.column');
        if (column && !column.classList.contains('drop-zone')) {
            column.classList.add('drop-zone', 'active');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        
        const column = e.target.closest('.column');
        if (!column || !this.draggedTask) return;
        
        column.querySelector('.tasks-container').appendChild(this.draggedTask);
        
        // Update task data
        const taskId = this.draggedTask.dataset.taskId;
        const boardId = this.draggedTask.closest('.board').dataset.boardId;
        const newColumn = column.dataset.columnName;
        
        const board = this.boards.find(b => b.id === boardId);
        if (board) {
            const task = board.tasks.find(t => t.id === taskId);
            if (task) {
                task.column = newColumn;
                this.saveToLocalStorage();
                
                // Dispatch custom event
                const event = new CustomEvent('taskMoved', {
                    detail: { task, column: newColumn }
                });
                document.dispatchEvent(event);
            }
        }
        
        column.classList.remove('drop-zone', 'active');
    }

    handleDragEnd(e) {
        document.querySelectorAll('.column').forEach(col => {
            col.classList.remove('drop-zone', 'active');
        });
        
        if (this.draggedTask) {
            this.draggedTask.classList.remove('dragging');
            this.draggedTask = null;
            this.dragSourceColumn = null;
        }
    }

    showTaskModal(boardId, columnName, task = null) {
        this.currentBoard = boardId;
        this.currentColumn = columnName;
        this.currentTask = task;
        
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('taskForm');
        
        if (task) {
            modalTitle.textContent = 'Edit Task';
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskDueDate').value = task.dueDate || '';
            document.getElementById('taskLabels').value = task.labels?.join(', ') || '';
            document.getElementById('taskAssignee').value = task.assignee || '';
        } else {
            modalTitle.textContent = 'New Task';
            form.reset();
        }
        
        this.taskModal.style.display = 'block';
    }

    showBoardModal(board = null) {
        this.currentBoard = board;
        
        const modalTitle = document.getElementById('boardModalTitle');
        const form = document.getElementById('boardForm');
        
        if (board) {
            modalTitle.textContent = 'Edit Board';
            document.getElementById('boardName').value = board.name;
            document.getElementById('boardColor').value = board.color;
            document.getElementById('boardColumns').value = board.columns.join(', ');
        } else {
            modalTitle.textContent = 'New Board';
            form.reset();
        }
        
        this.boardModal.style.display = 'block';
    }

    closeModals() {
        this.taskModal.style.display = 'none';
        this.boardModal.style.display = 'none';
        this.currentTask = null;
        this.currentBoard = null;
        this.currentColumn = null;
    }

    handleTaskSubmit(e) {
        e.preventDefault();
        
        const taskData = {
            id: this.currentTask ? this.currentTask.id : this.generateId(),
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDueDate').value,
            labels: document.getElementById('taskLabels').value.split(',').map(l => l.trim()).filter(l => l),
            assignee: document.getElementById('taskAssignee').value,
            column: this.currentTask ? this.currentTask.column : this.currentColumn,
            createdAt: this.currentTask ? this.currentTask.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const board = this.boards.find(b => b.id === this.currentBoard);
        if (board) {
            if (this.currentTask) {
                // Update existing task
                const index = board.tasks.findIndex(t => t.id === this.currentTask.id);
                if (index !== -1) {
                    board.tasks[index] = taskData;
                    
                    // Dispatch custom event
                    const event = new CustomEvent('taskUpdated', {
                        detail: { task: taskData }
                    });
                    document.dispatchEvent(event);
                }
            } else {
                // Add new task
                board.tasks.push(taskData);
                
                // Dispatch custom event
                const event = new CustomEvent('taskCreated', {
                    detail: { task: taskData }
                });
                document.dispatchEvent(event);
            }
            
            this.saveToLocalStorage();
            this.renderBoards();
        }
        
        this.closeModals();
    }

    handleBoardSubmit(e) {
        e.preventDefault();
        
        const boardData = {
            id: this.currentBoard?.id || this.generateId(),
            name: document.getElementById('boardName').value,
            color: document.getElementById('boardColor').value,
            columns: document.getElementById('boardColumns').value.split(',').map(c => c.trim()).filter(c => c),
            tasks: this.currentBoard?.tasks || [],
            createdAt: this.currentBoard?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (this.currentBoard) {
            // Update existing board
            const index = this.boards.findIndex(b => b.id === this.currentBoard.id);
            if (index !== -1) {
                this.boards[index] = boardData;
            }
        } else {
            // Add new board
            this.boards.push(boardData);
        }
        
        this.saveToLocalStorage();
        this.renderBoards();
        
        // Dispatch custom event
        const event = new CustomEvent('boardUpdated', {
            detail: { board: boardData }
        });
        document.dispatchEvent(event);
        
        this.closeModals();
    }

    deleteBoard(boardId) {
        if (confirm('Are you sure you want to delete this board? All tasks will be lost.')) {
            this.boards = this.boards.filter(b => b.id !== boardId);
            this.saveToLocalStorage();
            this.renderBoards();
        }
    }

    deleteTask(boardId, taskId) {
        const board = this.boards.find(b => b.id === boardId);
        if (board) {
            const task = board.tasks.find(t => t.id === taskId);
            board.tasks = board.tasks.filter(t => t.id !== taskId);
            this.saveToLocalStorage();
            this.renderBoards();
            
            // Dispatch custom event
            const event = new CustomEvent('taskDeleted', {
                detail: { task }
            });
            document.dispatchEvent(event);
        }
    }

    renderBoards() {
        this.boardsContainer.innerHTML = '';
        
        if (this.boards.length === 0) {
            this.boardsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-columns fa-3x"></i>
                    <h3>No Boards Yet</h3>
                    <p>Create your first board to get started!</p>
                    <button id="createFirstBoard" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Create First Board
                    </button>
                </div>
            `;
            
            document.getElementById('createFirstBoard').addEventListener('click', () => this.showBoardModal());
            return;
        }
        
        this.boards.forEach(board => {
            const boardElement = document.createElement('div');
            boardElement.className = 'board';
            boardElement.dataset.boardId = board.id;
            boardElement.style.borderTop = `5px solid ${board.color}`;
            
            // Group tasks by column
            const tasksByColumn = {};
            board.columns.forEach(column => {
                tasksByColumn[column] = board.tasks.filter(task => task.column === column);
            });
            
            boardElement.innerHTML = `
                <div class="board-header" style="background-color: ${board.color}">
                    <h3 class="board-title">${board.name}</h3>
                    <div class="board-controls">
                        <button class="edit-board" title="Edit Board">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-board" title="Delete Board">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="board-content">
                    <div class="columns-container">
                        ${board.columns.map(column => `
                            <div class="column" data-column-name="${column}">
                                <div class="column-header">
                                    <span class="column-title">${column}</span>
                                    <span class="column-task-count">${tasksByColumn[column]?.length || 0}</span>
                                </div>
                                <div class="tasks-container" data-column="${column}">
                                    ${(tasksByColumn[column] || []).map(task => this.renderTask(task)).join('')}
                                </div>
                                <button class="btn btn-secondary btn-small add-task-btn" style="width: 100%; margin-top: 10px;">
                                    <i class="fas fa-plus"></i> Add Task
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            this.boardsContainer.appendChild(boardElement);
            
            // Add event listeners for this board
            boardElement.querySelector('.edit-board').addEventListener('click', () => this.showBoardModal(board));
            boardElement.querySelector('.delete-board').addEventListener('click', () => this.deleteBoard(board.id));
            
            // Add task buttons
            boardElement.querySelectorAll('.add-task-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const column = e.target.closest('.column').dataset.columnName;
                    this.showTaskModal(board.id, column);
                });
            });
            
            // Task action buttons
            boardElement.querySelectorAll('.edit-task').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const taskId = e.target.closest('.task').dataset.taskId;
                    const task = board.tasks.find(t => t.id === taskId);
                    if (task) {
                        this.showTaskModal(board.id, task.column, task);
                    }
                });
            });
            
            boardElement.querySelectorAll('.delete-task').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const taskId = e.target.closest('.task').dataset.taskId;
                    this.deleteTask(board.id, taskId);
                });
            });
        });
    }

    renderTask(task) {
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const isOverdue = dueDate && dueDate < new Date() && task.column !== 'Done';
        
        return `
            <div class="task ${task.priority}" id="task-${task.id}" data-task-id="${task.id}" draggable="true">
                <div class="task-header">
                    <div class="task-title">${task.title}</div>
                    <span class="task-priority ${task.priority}">${task.priority}</span>
                </div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                ${task.labels?.length > 0 ? `
                    <div class="task-labels">
                        ${task.labels.map(label => `<span class="task-label">${label}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="task-footer">
                    <div>
                        ${task.assignee ? `<span class="task-assignee">👤 ${task.assignee}</span>` : ''}
                        ${isOverdue ? `<span class="task-due-date">⚠️ Overdue</span>` : 
                          dueDate ? `<span class="task-due-date">📅 ${dueDate.toLocaleDateString()}</span>` : ''}
                    </div>
                    <div class="task-actions">
                        <button class="edit-task" title="Edit Task">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-task" title="Delete Task">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    logEvent(type, message) {
        const eventItem = document.createElement('div');
        eventItem.className = `event-item ${type}`;
        eventItem.innerHTML = `
            <div class="event-time">${new Date().toLocaleTimeString()}</div>
            <div class="event-message">${message}</div>
        `;
        
        this.eventsList.prepend(eventItem);
        
        // Remove empty message if present
        const emptyMsg = this.eventsList.querySelector('.empty-message');
        if (emptyMsg) {
            emptyMsg.remove();
        }
        
        // Limit events list to 20 items
        const events = this.eventsList.querySelectorAll('.event-item');
        if (events.length > 20) {
            events[events.length - 1].remove();
        }
    }

    clearEvents() {
        this.eventsList.innerHTML = '<p class="empty-message">Events will appear here...</p>';
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            localStorage.removeItem('kanbanBoards');
            this.boards = [];
            this.renderBoards();
            this.clearEvents();
        }
    }

    exportData() {
        const data = {
            boards: this.boards,
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kanban-board-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (data.boards && Array.isArray(data.boards)) {
                        this.boards = data.boards;
                        this.saveToLocalStorage();
                        this.renderBoards();
                        alert('Data imported successfully!');
                    } else {
                        throw new Error('Invalid data format');
                    }
                } catch (error) {
                    alert('Error importing data: ' + error.message);
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    saveToLocalStorage() {
        localStorage.setItem('kanbanBoards', JSON.stringify(this.boards));
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('kanbanBoards');
        if (saved) {
            try {
                this.boards = JSON.parse(saved);
                this.renderBoards();
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }
    }

    initializeExampleData() {
        if (this.boards.length === 0) {
            this.boards = [
                {
                    id: this.generateId(),
                    name: 'Project Alpha',
                    color: '#4a6fa5',
                    columns: ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'],
                    tasks: [
                        {
                            id: this.generateId(),
                            title: 'Design Homepage',
                            description: 'Create initial homepage design mockups',
                            priority: 'high',
                            column: 'In Progress',
                            labels: ['design', 'frontend'],
                            assignee: 'Alice',
                            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        },
                        {
                            id: this.generateId(),
                            title: 'Fix Login Bug',
                            description: 'Users cannot login with Google OAuth',
                            priority: 'critical',
                            column: 'Backlog',
                            labels: ['bug', 'backend'],
                            assignee: 'Bob',
                            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        },
                        {
                            id: this.generateId(),
                            title: 'Write Documentation',
                            description: 'API documentation for new endpoints',
                            priority: 'medium',
                            column: 'Done',
                            labels: ['documentation'],
                            assignee: 'Charlie',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        }
                    ],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    name: 'Marketing Campaign',
                    color: '#6b8cbc',
                    columns: ['Ideas', 'Planning', 'Execution', 'Analysis'],
                    tasks: [
                        {
                            id: this.generateId(),
                            title: 'Social Media Posts',
                            description: 'Create content calendar for Q4',
                            priority: 'medium',
                            column: 'Planning',
                            labels: ['social', 'content'],
                            assignee: 'Diana',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        }
                    ],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            this.saveToLocalStorage();
            this.renderBoards();
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new KanbanBoard();
});