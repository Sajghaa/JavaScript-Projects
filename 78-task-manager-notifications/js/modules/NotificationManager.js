class NotificationManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.permission = false;
        
        this.checkPermission();
    }

    checkPermission() {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                this.permission = true;
                this.stateManager.set('notificationEnabled', true);
                this.eventBus.emit('notification:permission', true);
            }
        }
    }

    requestPermission() {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.permission = true;
                    this.stateManager.set('notificationEnabled', true);
                    this.eventBus.emit('notification:permission', true);
                    this.showNotification('Notifications Enabled', 'Task Manager will now remind you of upcoming tasks!');
                }
            });
        } else {
            this.eventBus.emit('toast', { message: 'Notifications not supported in this browser', type: 'error' });
        }
    }

    showNotification(title, body) {
        if (!this.permission) return;
        
        const notification = new Notification(`📋 ${title}`, {
            body: body,
            icon: 'https://via.placeholder.com/64',
            silent: false
        });
        
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
        
        setTimeout(() => notification.close(), 5000);
    }

    checkUpcomingTasks() {
        const tasks = this.stateManager.get('tasks');
        const now = new Date();
        const lastCheck = this.stateManager.get('lastNotificationCheck');
        
        tasks.forEach(task => {
            if (!task.completed && task.reminder && task.reminder !== 'none' && task.dueDate) {
                const dueDate = new Date(task.dueDate);
                const reminderMinutes = parseInt(task.reminder);
                const reminderTime = new Date(dueDate.getTime() - reminderMinutes * 60000);
                
                if (reminderTime <= now && (!lastCheck || new Date(lastCheck) < reminderTime)) {
                    const timeUntilDue = Math.ceil((dueDate - now) / 60000);
                    let message = '';
                    
                    if (timeUntilDue <= 0) {
                        message = `Task "${task.title}" is due now!`;
                    } else if (timeUntilDue < 60) {
                        message = `Task "${task.title}" is due in ${timeUntilDue} minutes!`;
                    } else {
                        message = `Task "${task.title}" is due in ${Math.ceil(timeUntilDue / 60)} hours!`;
                    }
                    
                    this.showNotification('Task Reminder', message);
                }
            }
        });
        
        this.stateManager.set('lastNotificationCheck', now.toISOString());
    }
}

window.NotificationManager = NotificationManager;