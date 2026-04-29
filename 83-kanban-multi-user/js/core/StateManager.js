class StateManager {
    constructor() {
        this.state = {
            currentUser: null,
            users: [
                { id: 'user1', name: 'Alex Morgan', avatar: 'AM', role: 'Product Owner', color: '#6366f1' },
                { id: 'user2', name: 'Sarah Chen', avatar: 'SC', role: 'Lead Developer', color: '#10b981' },
                { id: 'user3', name: 'Mike Johnson', avatar: 'MJ', role: 'UI Designer', color: '#f59e0b' },
                { id: 'user4', name: 'Emma Watson', avatar: 'EW', role: 'QA Engineer', color: '#ef4444' }
            ],
            columns: [
                { id: 'todo', title: 'To Do', icon: '📝', color: '#6366f1' },
                { id: 'in-progress', title: 'In Progress', icon: '🔄', color: '#f59e0b' },
                { id: 'review', title: 'Review', icon: '👀', color: '#8b5cf6' },
                { id: 'done', title: 'Done', icon: '✅', color: '#10b981' }
            ],
            tasks: [],
            activities: [],
            activeUsers: []
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
            
            this.state.tasks = [
                {
                    id: 'task1',
                    title: 'Design new homepage',
                    description: 'Create wireframes and high-fidelity mockups for the new homepage design',
                    priority: 'high',
                    columnId: 'todo',
                    assignees: ['user3'],
                    dueDate: tomorrow.toISOString().split('T')[0],
                    tags: ['design', 'ui'],
                    createdAt: new Date().toISOString(),
                    comments: [],
                    attachments: []
                },
                {
                    id: 'task2',
                    title: 'Implement authentication API',
                    description: 'Set up JWT authentication and user session management',
                    priority: 'urgent',
                    columnId: 'in-progress',
                    assignees: ['user2'],
                    dueDate: tomorrow.toISOString().split('T')[0],
                    tags: ['backend', 'api'],
                    createdAt: new Date().toISOString(),
                    comments: [],
                    attachments: []
                },
                {
                    id: 'task3',
                    title: 'Write unit tests',
                    description: 'Add unit tests for all components',
                    priority: 'medium',
                    columnId: 'todo',
                    assignees: ['user4'],
                    dueDate: nextWeek.toISOString().split('T')[0],
                    tags: ['testing'],
                    createdAt: new Date().toISOString(),
                    comments: [],
                    attachments: []
                },
                {
                    id: 'task4',
                    title: 'Fix navigation bug',
                    description: 'Mobile menu not closing after navigation',
                    priority: 'high',
                    columnId: 'review',
                    assignees: ['user2', 'user4'],
                    dueDate: now.toISOString().split('T')[0],
                    tags: ['frontend', 'bug'],
                    createdAt: new Date().toISOString(),
                    comments: [],
                    attachments: []
                },
                {
                    id: 'task5',
                    title: 'Deploy to production',
                    description: 'Final deployment checklist and monitoring setup',
                    priority: 'high',
                    columnId: 'done',
                    assignees: ['user2'],
                    dueDate: now.toISOString().split('T')[0],
                    tags: ['devops'],
                    createdAt: new Date().toISOString(),
                    comments: [],
                    attachments: []
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
        target[lastKey] = value;
        this.notifyListeners(path, value);
        this.saveToStorage();
    }

    subscribe(path, callback) {
        if (!this.listeners.has(path)) this.listeners.set(path, new Set());
        this.listeners.get(path).add(callback);
        return () => this.listeners.get(path)?.delete(callback);
    }

    notifyListeners(path, value) {
        if (this.listeners.has(path)) {
            this.listeners.get(path).forEach(cb => cb(value));
        }
        if (this.listeners.has('*')) {
            this.listeners.get('*').forEach(cb => cb({ path, value }));
        }
    }

    // Task operations
    addTask(task) {
        const newTask = {
            id: 'task' + Date.now(),
            createdAt: new Date().toISOString(),
            comments: [],
            attachments: [],
            ...task
        };
        this.state.tasks.push(newTask);
        this.notifyListeners('tasks', this.state.tasks);
        this.saveToStorage();
        return newTask;
    }

    updateTask(taskId, updates) {
        const index = this.state.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            const oldTask = { ...this.state.tasks[index] };
            this.state.tasks[index] = { ...this.state.tasks[index], ...updates };
            this.notifyListeners('tasks', this.state.tasks);
            this.saveToStorage();
            return { old: oldTask, new: this.state.tasks[index] };
        }
        return null;
    }

    deleteTask(taskId) {
        const task = this.state.tasks.find(t => t.id === taskId);
        this.state.tasks = this.state.tasks.filter(t => t.id !== taskId);
        this.notifyListeners('tasks', this.state.tasks);
        this.saveToStorage();
        return task;
    }

    moveTask(taskId, newColumnId, newPosition) {
        const task = this.state.tasks.find(t => t.id === taskId);
        if (task) {
            task.columnId = newColumnId;
            this.notifyListeners('tasks', this.state.tasks);
            this.saveToStorage();
            return task;
        }
        return null;
    }

    getTasksByColumn(columnId) {
        return this.state.tasks.filter(t => t.columnId === columnId);
    }

    // Activity operations
    addActivity(activity) {
        const newActivity = {
            id: 'act' + Date.now(),
            timestamp: new Date().toISOString(),
            ...activity
        };
        this.state.activities.unshift(newActivity);
        if (this.state.activities.length > 100) this.state.activities.pop();
        this.notifyListeners('activities', this.state.activities);
        this.saveToStorage();
        return newActivity;
    }

    getRecentActivities(limit = 20) {
        return this.state.activities.slice(0, limit);
    }

    // User operations
    getCurrentUser() {
        return this.state.currentUser;
    }

    setCurrentUser(userId) {
        const user = this.state.users.find(u => u.id === userId);
        if (user) {
            this.state.currentUser = user;
            this.notifyListeners('currentUser', user);
            this.saveToStorage();
            
            // Add activity
            this.addActivity({
                userId: user.id,
                userName: user.name,
                type: 'user_switched',
                message: `${user.name} switched to this board`
            });
        }
    }

    getUser(userId) {
        return this.state.users.find(u => u.id === userId);
    }

    toggleActiveUser(userId, isActive) {
        if (isActive) {
            if (!this.state.activeUsers.includes(userId)) {
                this.state.activeUsers.push(userId);
            }
        } else {
            this.state.activeUsers = this.state.activeUsers.filter(id => id !== userId);
        }
        this.notifyListeners('activeUsers', this.state.activeUsers);
    }

    getActiveUsers() {
        return this.state.users.filter(u => this.state.activeUsers.includes(u.id));
    }

    saveToStorage() {
        try {
            localStorage.setItem('kanban_state', JSON.stringify({
                tasks: this.state.tasks,
                activities: this.state.activities,
                currentUser: this.state.currentUser
            }));
        } catch (e) { console.error(e); }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('kanban_state');
            if (saved) {
                const data = JSON.parse(saved);
                this.state.tasks = data.tasks || [];
                this.state.activities = data.activities || [];
                this.state.currentUser = data.currentUser || this.state.users[0];
            } else {
                this.state.currentUser = this.state.users[0];
            }
        } catch (e) { console.error(e); }
    }
}

window.StateManager = StateManager;