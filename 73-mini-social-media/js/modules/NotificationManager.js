export class NotificationManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    renderNotifications() {
        const user = this.stateManager.get('currentUser');
        if (!user) return app.feedManager.renderLoginPrompt();

        const notifications = this.stateManager.get('notifications')
            .filter(n => n.userId === user.id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return `
            <div class="notifications-container">
                <div class="notifications-header">
                    <h2>Notifications</h2>
                    <button class="btn btn-secondary" onclick="app.notificationManager.markAllAsRead()">
                        Mark all as read
                    </button>
                </div>

                <div class="notifications-list">
                    ${notifications.length > 0 ?
                        notifications.map(notif => this.renderNotification(notif)).join('') :
                        '<div class="empty-state">No notifications yet</div>'
                    }
                </div>
            </div>
        `;
    }

    renderNotification(notification) {
        const actor = this.stateManager.getUser(notification.actorId);
        if (!actor) return '';

        const timeAgo = app.postManager.getTimeAgo(notification.createdAt);
        
        let content = '';
        switch(notification.type) {
            case 'like':
                content = 'liked your post';
                break;
            case 'comment':
                content = 'commented on your post';
                break;
            case 'follow':
                content = 'started following you';
                break;
            case 'retweet':
                content = 'retweeted your post';
                break;
        }

        return `
            <div class="notification-item ${notification.read ? '' : 'unread'}" 
                 data-id="${notification.id}"
                 onclick="app.notificationManager.markAsRead('${notification.id}')">
                <img src="${actor.avatar}" alt="${actor.name}" class="notification-avatar">
                <div class="notification-content">
                    <div class="notification-text">
                        <strong>${actor.name}</strong> @${actor.username} ${content}
                    </div>
                    <div class="notification-time">${timeAgo}</div>
                </div>
                ${notification.postId ? `
                    <button class="view-post-btn" onclick="app.feedManager.viewPost('${notification.postId}')">
                        View
                    </button>
                ` : ''}
            </div>
        `;
    }

    markAsRead(notificationId) {
        this.stateManager.markNotificationAsRead(notificationId);
        
        const element = document.querySelector(`[data-id="${notificationId}"]`);
        if (element) {
            element.classList.remove('unread');
        }

        this.updateBadge();
    }

    markAllAsRead() {
        this.stateManager.markAllNotificationsAsRead();
        
        document.querySelectorAll('.notification-item').forEach(el => {
            el.classList.remove('unread');
        });

        this.updateBadge();
        
        this.eventBus.emit('notification', {
            message: 'All notifications marked as read',
            type: 'success'
        });
    }

    updateBadge() {
        const unreadCount = this.stateManager.get('notifications')
            .filter(n => !n.read).length;
        
        const badge = document.getElementById('notificationBadge');
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'inline' : 'none';
    }
}