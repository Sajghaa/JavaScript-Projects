class DragDropManager {
    constructor(stateManager, eventBus, taskManager) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.taskManager = taskManager;
        this.draggedTaskId = null;
        this.init();
    }

    init() {
        this.setupGlobalDragEvents();
        this.eventBus.on('board:refresh', () => this.setupTaskDragEvents());
    }

    setupGlobalDragEvents() {
        document.addEventListener('dragstart', (e) => {
            const taskCard = e.target.closest('.task-card');
            if (taskCard) {
                this.draggedTaskId = taskCard.dataset.taskId;
                taskCard.classList.add('dragging');
                e.dataTransfer.setData('text/plain', this.draggedTaskId);
                e.dataTransfer.effectAllowed = 'move';
            }
        });

        document.addEventListener('dragend', (e) => {
            const taskCard = e.target.closest('.task-card');
            if (taskCard) {
                taskCard.classList.remove('dragging');
            }
            this.draggedTaskId = null;
            this.removeDragOverlays();
        });
    }

    setupTaskDragEvents() {
        const containers = document.querySelectorAll('.tasks-container');
        
        containers.forEach(container => {
            container.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                container.classList.add('drag-over');
            });

            container.addEventListener('dragleave', () => {
                container.classList.remove('drag-over');
            });

            container.addEventListener('drop', (e) => {
                e.preventDefault();
                container.classList.remove('drag-over');
                
                const targetColumnId = container.dataset.columnId;
                if (this.draggedTaskId) {
                    const task = this.stateManager.get('tasks').find(t => t.id === this.draggedTaskId);
                    if (task && task.columnId !== targetColumnId) {
                        this.taskManager.moveTask(this.draggedTaskId, targetColumnId);
                        this.eventBus.emit('toast', { 
                            message: 'Task moved!', 
                            type: 'success' 
                        });
                    }
                }
            });
        });
    }

    removeDragOverlays() {
        document.querySelectorAll('.tasks-container').forEach(container => {
            container.classList.remove('drag-over');
        });
    }
}

window.DragDropManager = DragDropManager;