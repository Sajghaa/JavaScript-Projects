class StateManager {
    constructor() {
        this.state = {
            tasks: [],
            filters: {
                status: 'all',
                priority: 'all',
                category: 'all',
                sortBy: 'dueDate'
            },
            searchQuery: '',
            viewMode: 'list',
            selectedCategory: 'all',
            notificationEnabled: false,
            lastNotificationCheck: null
        };
        
        this.listeners = new Map();
        this.loadFromStorage();
        this.initializeSampleTasks();
    }

    initializeSampleTasks() {
        if (this.state.tasks.length === 0) {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const nextWeek = new Date(now);
            nextWeek.setDate(nextWeek.getDate() + 7);
            const twoHoursLater = new Date(now);
            twoHoursLater.setHours(twoHoursLater.getHours() + 2);
            
            this.state.tasks = [
                {
                    id: '1',
                    title: 'Complete project proposal',
                    description: 'Write and submit the Q4 project proposal to stakeholders',
                    priority: 'high',
                    category: 'work',
                    dueDate: tomorrow.toISOString(),
                    completed: false,
                    reminder: '60',
                    subtasks: [
                        { id: 's1', text: 'Research market trends', completed: false },
                        { id: 's2', text: 'Create budget estimate', completed: false }
                    ],
                    createdAt: new Date().toISOString()
                },
                {
                    id: '2',
                    title: 'Buy groceries',
                    description: 'Milk, eggs, bread, fruits, and vegetables',
                    priority: 'medium',
                    category: 'shopping',
                    dueDate: tomorrow.toISOString(),
                    completed: false,
                    reminder: '30',
                    subtasks: [],
                    createdAt: new Date().toISOString()
                },
                {
                    id: '3',
                    title: 'Morning workout',
                    description: '30 minutes cardio + 20 minutes strength training',
                    priority: 'high',
                    category: 'health',
                    dueDate: twoHoursLater.toISOString(),
                    completed: false,
                    reminder: '15',
                    subtasks: [],
                    createdAt: new Date().toISOString()
                },
                {
                    id: '4',
                    title: 'Learn React hooks',
                    description: 'Complete the advanced React course on hooks',
                    priority: 'medium',
                    category: 'education',
                    dueDate: nextWeek.toISOString(),
                    completed: false,
                    reminder: '120',
                    subtasks: [
                        { id: 's1', text: 'Watch video tutorials', completed: false },
                        { id: 's2', text: 'Build practice app', completed: false }
                    ],
                    createdAt: new Date().toISOString()
                }
            ];
            this.saveToStorage();
        }
    }

    get(path) {
        if (!path) return this.state;
        return path.split('.').reduce((obj, key) => obj?.[key], this.state);
    }

    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => obj[key], this.state);
        const oldValue = target[lastKey];
        
        target[lastKey] = value;
        this.notifyListeners(path, value, oldValue);
        this.saveToStorage();
        
        // Dispatch custom event for UI updates
        const event = new CustomEvent('stateChanged', { detail: { path, value } });
        document.dispatchEvent(event);
    }

    subscribe(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, new Set());
        }
        this.listeners.get(path).add(callback);
        return () => this.listeners.get(path)?.delete(callback);
    }

    notifyListeners(path, value, oldValue) {
        if (this.listeners.has(path)) {
            this.listeners.get(path).forEach(callback => callback(value, oldValue));
        }
    }

    addTask(task) {
        const newTask = {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            completed: false,
            ...task,
            subtasks: (task.subtasks || []).map(st => ({ 
                id: Date.now().toString() + Math.random(), 
                text: st.text, 
                completed: false 
            }))
        };
        this.state.tasks.unshift(newTask);
        this.notifyListeners('tasks', this.state.tasks);
        this.saveToStorage();
        return newTask;
    }

    updateTask(taskId, updates) {
        const index = this.state.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            this.state.tasks[index] = { ...this.state.tasks[index], ...updates };
            this.notifyListeners('tasks', this.state.tasks);
            this.saveToStorage();
            return true;
        }
        return false;
    }

    deleteTask(taskId) {
        this.state.tasks = this.state.tasks.filter(t => t.id !== taskId);
        this.notifyListeners('tasks', this.state.tasks);
        this.saveToStorage();
    }

    toggleComplete(taskId) {
        const task = this.state.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.notifyListeners('tasks', this.state.tasks);
            this.saveToStorage();
            return task.completed;
        }
        return false;
    }

    toggleSubtask(taskId, subtaskId) {
        const task = this.state.tasks.find(t => t.id === taskId);
        if (task && task.subtasks) {
            const subtask = task.subtasks.find(st => st.id === subtaskId);
            if (subtask) {
                subtask.completed = !subtask.completed;
                this.notifyListeners('tasks', this.state.tasks);
                this.saveToStorage();
                return true;
            }
        }
        return false;
    }

    getFilteredTasks() {
        let tasks = [...this.state.tasks];
        
        if (this.state.filters.status !== 'all') {
            tasks = tasks.filter(t => 
                this.state.filters.status === 'completed' ? t.completed : !t.completed
            );
        }
        
        if (this.state.filters.priority !== 'all') {
            tasks = tasks.filter(t => t.priority === this.state.filters.priority);
        }
        
        if (this.state.selectedCategory !== 'all') {
            tasks = tasks.filter(t => t.category === this.state.selectedCategory);
        }
        
        if (this.state.searchQuery) {
            const query = this.state.searchQuery.toLowerCase();
            tasks = tasks.filter(t => 
                t.title.toLowerCase().includes(query) ||
                (t.description && t.description.toLowerCase().includes(query))
            );
        }
        
        const sortBy = this.state.filters.sortBy;
        tasks.sort((a, b) => {
            switch(sortBy) {
                case 'dueDate':
                    return new Date(a.dueDate || '9999') - new Date(b.dueDate || '9999');
                case 'priority':
                    const priorityOrder = { high: 0, medium: 1, low: 2 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                case 'createdAt':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'title':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });
        
        return tasks;
    }

    getStats() {
        const tasks = this.state.tasks;
        const completed = tasks.filter(t => t.completed).length;
        return {
            total: tasks.length,
            completed: completed,
            pending: tasks.length - completed,
            highPriority: tasks.filter(t => t.priority === 'high' && !t.completed).length,
            overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed).length,
            completionRate: tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100)
        };
    }

    getTasksByDate(date) {
        const dateStr = date.toDateString();
        return this.state.tasks.filter(t => 
            t.dueDate && new Date(t.dueDate).toDateString() === dateStr && !t.completed
        );
    }

    saveToStorage() {
        try {
            localStorage.setItem('task_manager_state', JSON.stringify({
                tasks: this.state.tasks,
                filters: this.state.filters,
                notificationEnabled: this.state.notificationEnabled
            }));
        } catch (error) {
            console.error('Error saving:', error);
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('task_manager_state');
            if (saved) {
                const data = JSON.parse(saved);
                this.state.tasks = data.tasks || [];
                this.state.filters = data.filters || this.state.filters;
                this.state.notificationEnabled = data.notificationEnabled || false;
            }
        } catch (error) {
            console.error('Error loading:', error);
        }
    }
}

window.StateManager = StateManager;