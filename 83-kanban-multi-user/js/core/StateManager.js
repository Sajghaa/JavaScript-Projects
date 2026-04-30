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
                { id: 'todo', title: 'To Do', icon: '📝' },
                { id: 'in-progress', title: 'In Progress', icon: '🔄' },
                { id: 'review', title: 'Review', icon: '👀' },
                { id: 'done', title: 'Done', icon: '✅' }
            ],
            tasks: [],
            activeUsers: []
        };
        this.listeners = new Map();
        this.loadFromStorage();
        this.initSampleTasks();
    }

    initSampleTasks() {
        if (this.state.tasks.length === 0) {
            const today = new Date().toISOString().split('T')[0];
            const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
            this.state.tasks = [
                { id: 't1', title: 'Design homepage', description: 'Create wireframes', priority: 'high', columnId: 'todo', assignees: ['user3'], dueDate: tomorrow, tags: ['design'] },
                { id: 't2', title: 'API Integration', description: 'Connect backend', priority: 'urgent', columnId: 'in-progress', assignees: ['user2'], dueDate: today, tags: ['backend'] },
                { id: 't3', title: 'Write tests', description: 'Unit tests', priority: 'medium', columnId: 'todo', assignees: ['user4'], dueDate: tomorrow, tags: ['testing'] },
                { id: 't4', title: 'Fix navigation bug', description: 'Mobile menu', priority: 'high', columnId: 'review', assignees: ['user2','user4'], dueDate: today, tags: ['bug'] },
                { id: 't5', title: 'Deploy to production', description: 'Final deploy', priority: 'high', columnId: 'done', assignees: ['user2'], dueDate: today, tags: ['devops'] }
            ];
            this.saveToStorage();
        }
    }

    get(path) { return path.split('.').reduce((o,k)=>o?.[k], this.state); }
    set(path, value) {
        const keys = path.split('.'), last = keys.pop(), target = keys.reduce((o,k)=>o[k], this.state);
        target[last] = value;
        this.notifyListeners(path, value);
        this.saveToStorage();
    }
    subscribe(path, cb) { if(!this.listeners.has(path)) this.listeners.set(path, new Set()); this.listeners.get(path).add(cb); return ()=>this.listeners.get(path)?.delete(cb); }
    notifyListeners(path, val) { if(this.listeners.has(path)) this.listeners.get(path).forEach(cb=>cb(val)); }

    addTask(task) { const newTask = { id: 't'+Date.now(), ...task }; this.state.tasks.push(newTask); this.notifyListeners('tasks', this.state.tasks); this.saveToStorage(); return newTask; }
    updateTask(id, updates) { const idx = this.state.tasks.findIndex(t=>t.id===id); if(idx!==-1) { this.state.tasks[idx] = {...this.state.tasks[idx], ...updates}; this.notifyListeners('tasks', this.state.tasks); this.saveToStorage(); return true; } return false; }
    deleteTask(id) { this.state.tasks = this.state.tasks.filter(t=>t.id!==id); this.notifyListeners('tasks', this.state.tasks); this.saveToStorage(); }
    getTasksByColumn(colId) { return this.state.tasks.filter(t=>t.columnId===colId); }

    setCurrentUser(userId) { this.state.currentUser = this.state.users.find(u=>u.id===userId); this.notifyListeners('currentUser', this.state.currentUser); this.saveToStorage(); }
    getCurrentUser() { return this.state.currentUser; }
    getUser(id) { return this.state.users.find(u=>u.id===id); }
    toggleActiveUser(id, active) { if(active && !this.state.activeUsers.includes(id)) this.state.activeUsers.push(id); else if(!active) this.state.activeUsers = this.state.activeUsers.filter(uid=>uid!==id); this.notifyListeners('activeUsers', this.state.activeUsers); }
    getActiveUsers() { return this.state.users.filter(u=>this.state.activeUsers.includes(u.id)); }

    saveToStorage() { try { localStorage.setItem('kanban_state', JSON.stringify({ tasks: this.state.tasks, currentUser: this.state.currentUser })); } catch(e){} }
    loadFromStorage() { try { const saved = localStorage.getItem('kanban_state'); if(saved) { const data = JSON.parse(saved); this.state.tasks = data.tasks || []; this.state.currentUser = data.currentUser || this.state.users[0]; } else { this.state.currentUser = this.state.users[0]; } } catch(e){} }
}
window.StateManager = StateManager;