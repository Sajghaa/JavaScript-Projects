class ActivityManager {
    constructor() {
        this.activities = [];
        this.currentFilter = 'all';
        this._callbacks = {};
        this.loadActivities();
    }
    
    loadActivities() {
        this.activities = StorageManager.load('activities', []);
        this.sortActivities();
    }
    
    saveActivities() {
        StorageManager.save('activities', this.activities);
        this.trigger('activitiesUpdated', this.activities);
    }
    
    addActivity(name, durationSeconds) {
        const activity = {
            id: Date.now(),
            name: name,
            duration: durationSeconds,
            startTime: new Date().toISOString(),
            date: new Date().toLocaleDateString()
        };
        this.activities.push(activity);
        this.sortActivities();
        this.saveActivities();
        return activity;
    }
    
    updateActivity(id, newName) {
        const index = this.activities.findIndex(a => a.id === id);
        if (index !== -1) {
            this.activities[index].name = newName;
            this.saveActivities();
            return true;
        }
        return false;
    }
    
    deleteActivity(id) {
        this.activities = this.activities.filter(a => a.id !== id);
        this.saveActivities();
    }
    
    deleteAllActivities() {
        this.activities = [];
        this.saveActivities();
        this.trigger('activitiesCleared');
    }
    
    sortActivities() {
        this.activities.sort((a, b) => b.duration - a.duration);
    }
    
    getActivities(filter = null) {
        const f = filter || this.currentFilter;
        const now = new Date();
        let filtered = [...this.activities];
        
        if (f === 'today') {
            filtered = filtered.filter(a => a.date === now.toLocaleDateString());
        } else if (f === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filtered = filtered.filter(a => new Date(a.startTime) >= weekAgo);
        } else if (f === 'month') {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            filtered = filtered.filter(a => new Date(a.startTime) >= monthAgo);
        }
        
        filtered.sort((a, b) => b.duration - a.duration);
        return filtered;
    }
    
    getTotalDuration(filter = null) {
        const acts = this.getActivities(filter);
        return acts.reduce((sum, a) => sum + a.duration, 0);
    }
    
    getAverageSessionDuration(filter = null) {
        const acts = this.getActivities(filter);
        if (acts.length === 0) return 0;
        return Math.round(this.getTotalDuration(filter) / acts.length);
    }
    
    getTodayTotal() {
        const today = new Date().toLocaleDateString();
        return this.activities
            .filter(a => a.date === today)
            .reduce((sum, a) => sum + a.duration, 0);
    }
    
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    }
    
    getChartData() {
        const acts = this.getActivities();
        const map = new Map();
        
        acts.forEach(act => {
            const existing = map.get(act.name);
            if (existing) {
                existing.duration += act.duration;
            } else {
                map.set(act.name, { name: act.name, duration: act.duration });
            }
        });
        
        const aggregated = Array.from(map.values());
        aggregated.sort((a, b) => b.duration - a.duration);
        
        const topData = aggregated.slice(0, 7);
        const otherData = aggregated.slice(7);
        
        if (otherData.length > 0) {
            const otherDuration = otherData.reduce((sum, a) => sum + a.duration, 0);
            topData.push({ name: 'Other', duration: otherDuration });
        }
        
        return {
            labels: topData.map(d => d.name.length > 15 ? d.name.substring(0, 12) + '...' : d.name),
            data: topData.map(d => Math.round(d.duration / 60))
        };
    }
    
    getWeeklyTrend() {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyData = new Array(7).fill(0);
        
        this.activities.forEach(activity => {
            const dayIndex = new Date(activity.startTime).getDay();
            weeklyData[dayIndex] += activity.duration;
        });
        
        return {
            labels: days,
            data: weeklyData.map(m => Math.round(m / 60))
        };
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        this.trigger('filterChanged', filter);
        return this.getActivities();
    }
    
    on(event, callback) {
        if (!this._callbacks[event]) this._callbacks[event] = [];
        this._callbacks[event].push(callback);
    }
    
    trigger(event, data) {
        if (this._callbacks[event]) {
            this._callbacks[event].forEach(cb => cb(data));
        }
    }
}

window.ActivityManager = ActivityManager;