// ActivityManager.js - Manages activities and time blocks
class ActivityManager {
    constructor() {
        this.activities = [];
        this.currentFilter = 'all';
        this.loadActivities();
    }
    
    loadActivities() {
        this.activities = StorageManager.load('activities', []);
        this.sortActivities();
    }
    
    saveActivities() {
        StorageManager.save('activities', this.activities);
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
        this.trigger('activitiesUpdated', this.activities);
        
        return activity;
    }
    
    updateActivity(id, newName) {
        const index = this.activities.findIndex(a => a.id === id);
        if (index !== -1) {
            this.activities[index].name = newName;
            this.saveActivities();
            this.trigger('activitiesUpdated', this.activities);
            return true;
        }
        return false;
    }
    
    deleteActivity(id) {
        this.activities = this.activities.filter(a => a.id !== id);
        this.saveActivities();
        this.trigger('activitiesUpdated', this.activities);
    }
    
    deleteAllActivities() {
        this.activities = [];
        this.saveActivities();
        this.trigger('activitiesUpdated', this.activities);
    }
    
    sortActivities() {
        // Sort by duration descending
        this.activities.sort((a, b) => b.duration - a.duration);
    }
    
    getActivities(filter = 'all') {
        const now = new Date();
        let filtered = [...this.activities];
        
        switch(filter) {
            case 'today':
                filtered = filtered.filter(a => a.date === now.toLocaleDateString());
                break;
            case 'week':
                const weekAgo = new Date(now.setDate(now.getDate() - 7));
                filtered = filtered.filter(a => new Date(a.startTime) >= weekAgo);
                break;
            case 'month':
                const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
                filtered = filtered.filter(a => new Date(a.startTime) >= monthAgo);
                break;
        }
        
        // Sort by duration descending for "most time" first
        filtered.sort((a, b) => b.duration - a.duration);
        return filtered;
    }
    
    getTotalDuration(filter = 'all') {
        const activities = this.getActivities(filter);
        return activities.reduce((sum, a) => sum + a.duration, 0);
    }
    
    getAverageSessionDuration(filter = 'all') {
        const activities = this.getActivities(filter);
        if (activities.length === 0) return 0;
        const total = this.getTotalDuration(filter);
        return Math.round(total / activities.length);
    }
    
    getTodayTotal() {
        const today = new Date().toLocaleDateString();
        return this.activities
            .filter(a => a.date === today)
            .reduce((sum, a) => sum + a.duration, 0);
    }
    
    getActivityStats() {
        const activities = this.getActivities(this.currentFilter);
        const totalDuration = this.getTotalDuration(this.currentFilter);
        
        return activities.map(activity => ({
            ...activity,
            percentage: totalDuration > 0 ? (activity.duration / totalDuration) * 100 : 0,
            formattedDuration: this.formatDuration(activity.duration)
        }));
    }
    
    getTopActivities(limit = 5) {
        return this.getActivities().slice(0, limit);
    }
    
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }
    
    getChartData() {
        const activities = this.getActivities(this.currentFilter);
        const activityMap = new Map();
        
        activities.forEach(activity => {
            const existing = activityMap.get(activity.name);
            if (existing) {
                existing.duration += activity.duration;
            } else {
                activityMap.set(activity.name, {
                    name: activity.name,
                    duration: activity.duration
                });
            }
        });
        
        const aggregated = Array.from(activityMap.values());
        aggregated.sort((a, b) => b.duration - a.duration);
        
        // Take top 8 for chart, group rest as "Other"
        const topData = aggregated.slice(0, 7);
        const otherData = aggregated.slice(7);
        
        if (otherData.length > 0) {
            const otherDuration = otherData.reduce((sum, a) => sum + a.duration, 0);
            topData.push({ name: 'Other', duration: otherDuration });
        }
        
        return {
            labels: topData.map(d => d.name.length > 15 ? d.name.substring(0, 12) + '...' : d.name),
            data: topData.map(d => Math.round(d.duration / 60)) // Convert to minutes for chart
        };
    }
    
    getWeeklyTrend() {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyData = new Array(7).fill(0);
        
        this.activities.forEach(activity => {
            const date = new Date(activity.startTime);
            const dayIndex = date.getDay();
            weeklyData[dayIndex] += activity.duration;
        });
        
        return {
            labels: days,
            data: weeklyData.map(m => Math.round(m / 60)) // Convert to minutes
        };
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        this.trigger('filterChanged', filter);
        return this.getActivities(filter);
    }
    
    on(event, callback) {
        if (!this._callbacks) this._callbacks = {};
        if (!this._callbacks[event]) this._callbacks[event] = [];
        this._callbacks[event].push(callback);
    }
    
    trigger(event, data) {
        if (this._callbacks && this._callbacks[event]) {
            this._callbacks[event].forEach(cb => cb(data));
        }
    }
}

window.ActivityManager = ActivityManager;