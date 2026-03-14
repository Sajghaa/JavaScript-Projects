import { StateManager } from './core/StateManager.js';
import { EventBus } from './core/EventBus.js';
import { StorageManager } from './core/StorageManager.js';
import { AuthManager } from './modules/AuthManager.js';
import { PostManager } from './modules/PostManager.js';
import { UserManager } from './modules/UserManager.js';
import { FeedManager } from './modules/FeedManager.js';
import { NotificationManager } from './modules/NotificationManager.js';

class SocialApp {
    constructor() {
        this.stateManager = new StateManager();
        this.eventBus = new EventBus();
        
        this.initializeModules();
        this.initializeUI();
        this.setupEventListeners();
        this.checkAuth();
    }

    initializeModules() {
        this.authManager = new AuthManager(this.stateManager, this.eventBus);
        this.postManager = new PostManager(this.stateManager, this.eventBus);
        this.userManager = new UserManager(this.stateManager, this.eventBus);
        this.feedManager = new FeedManager(this.stateManager, this.eventBus);
        this.notificationManager = new NotificationManager(this.stateManager, this.eventBus);
    }

    initializeUI() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.currentTarget.dataset.view;
                this.navigateTo(view);
            });
        });

        // Create post button
        document.getElementById('createPostBtn').addEventListener('click', () => {
            this.showCreatePostModal();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.authManager.logout();
        });

        // Close modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        // Click outside modal
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Search input
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.feedManager.search(e.target.value);
        });

        // Post modal submit
        document.getElementById('submitPost').addEventListener('click', () => {
            this.postManager.createPost();
        });

        // Post content input
        document.getElementById('postContent').addEventListener('input', (e) => {
            const count = e.target.value.length;
            document.getElementById('charCount').textContent = `${count}/280`;
            
            if (count > 280) {
                e.target.value = e.target.value.slice(0, 280);
            }
        });

        // Auth tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchAuthTab(tabName);
            });
        });

        // Login button
        document.getElementById('loginBtn').addEventListener('click', () => {
            this.authManager.login();
        });

        // Signup button
        document.getElementById('signupBtn').addEventListener('click', () => {
            this.authManager.signup();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N for new post
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.showCreatePostModal();
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
            
            // Ctrl/Cmd + / for shortcuts help
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.showShortcutsHelp();
            }
        });

        // Event listeners from modules
        this.eventBus.on('auth:login', (user) => {
            this.loadView('home');
            this.updateUI();
        });

        this.eventBus.on('auth:logout', () => {
            this.showAuthModal();
        });

        this.eventBus.on('post:created', () => {
            this.closeAllModals();
            this.loadView('home');
        });

        this.eventBus.on('notification', (data) => {
            this.showToast(data.message, data.type);
        });
    }

    setupEventListeners() {
        // Online/offline detection
        window.addEventListener('online', () => {
            this.showToast('You are back online!', 'success');
        });

        window.addEventListener('offline', () => {
            this.showToast('You are offline. Some features may be limited.', 'warning');
        });

        // Before unload
        window.addEventListener('beforeunload', () => {
            this.stateManager.saveToStorage();
        });
    }

    checkAuth() {
        const currentUser = this.stateManager.get('currentUser');
        if (!currentUser) {
            this.showAuthModal();
        } else {
            this.updateUI();
            this.loadView('home');
        }
    }

    navigateTo(view) {
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === view);
        });

        // Load view
        this.loadView(view);
    }

    loadView(view) {
        const mainContent = document.getElementById('mainContent');
        
        switch(view) {
            case 'home':
                mainContent.innerHTML = this.feedManager.renderHomeFeed();
                break;
            case 'explore':
                mainContent.innerHTML = this.feedManager.renderExplore();
                break;
            case 'notifications':
                mainContent.innerHTML = this.notificationManager.renderNotifications();
                break;
            case 'profile':
                mainContent.innerHTML = this.userManager.renderProfile();
                break;
            case 'messages':
                mainContent.innerHTML = this.renderMessages();
                break;
            case 'bookmarks':
                mainContent.innerHTML = this.feedManager.renderBookmarks();
                break;
        }
    }

    updateUI() {
        const user = this.stateManager.get('currentUser');
        if (user) {
            document.getElementById('sidebarUserName').textContent = user.name;
            document.getElementById('sidebarUserHandle').textContent = `@${user.username}`;
            
            const avatars = document.querySelectorAll('.user-profile-mini .avatar, #modalUserAvatar');
            avatars.forEach(img => {
                img.src = user.avatar || 'https://via.placeholder.com/40x40';
            });

            document.getElementById('modalUserName').textContent = user.name;
            document.getElementById('modalUserHandle').textContent = `@${user.username}`;
        }

        // Update notification badge
        const unreadCount = this.stateManager.get('notifications')
            .filter(n => !n.read).length;
        document.getElementById('notificationBadge').textContent = unreadCount;
        document.getElementById('notificationBadge').style.display = 
            unreadCount > 0 ? 'inline' : 'none';
    }

    showAuthModal() {
        document.getElementById('authModal').classList.add('active');
    }

    showCreatePostModal() {
        const user = this.stateManager.get('currentUser');
        if (!user) {
            this.showAuthModal();
            return;
        }
        document.getElementById('postModal').classList.add('active');
        document.getElementById('postContent').value = '';
        document.getElementById('charCount').textContent = '0/280';
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    switchAuthTab(tab) {
        document.querySelectorAll('.auth-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });
        
        document.getElementById('loginForm').classList.toggle('active', tab === 'login');
        document.getElementById('signupForm').classList.toggle('active', tab === 'signup');
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    showShortcutsHelp() {
        alert(`
Keyboard Shortcuts:
• Ctrl/Cmd + N - New Post
• Ctrl/Cmd + / - Show Shortcuts
• Escape - Close Modals
• Ctrl/Cmd + F - Focus Search
• Ctrl/Cmd + Enter - Submit Post
        `);
    }

    renderMessages() {
        return `
            <div class="messages-container">
                <div class="messages-header">
                    <h2>Messages</h2>
                </div>
                <div class="messages-list">
                    <div class="message-placeholder">
                        <i class="fas fa-envelope-open"></i>
                        <h3>Your messages</h3>
                        <p>Send private messages to your friends</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SocialApp();
});