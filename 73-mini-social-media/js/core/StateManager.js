export class StateManager {
    constructor() {
        this.state = {
            currentUser: null,
            users: [],
            posts: [],
            comments: [],
            likes: [],
            follows: [],
            bookmarks: [],
            notifications: [],
            trends: [],
            ui: {
                currentView: 'home',
                activeModal: null,
                loading: false,
                error: null,
                searchQuery: '',
                theme: 'light'
            }
        };
        
        this.listeners = new Map();
        this.history = {
            past: [],
            future: []
        };
        
        this.loadFromStorage();
        this.initAutoSave();
    }

    // Get state with path support
    get(path) {
        if (!path) return this.state;
        return path.split('.').reduce((obj, key) => obj?.[key], this.state);
    }

    // Set state with history
    set(path, value, recordHistory = true) {
        const oldValue = this.get(path);
        
        if (recordHistory && !this.isBatchMode) {
            this.recordHistory();
        }
        
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => obj[key], this.state);
        target[lastKey] = value;
        
        if (!this.isBatchMode) {
            this.notifyListeners(path, value, oldValue);
            this.saveToStorage();
        } else {
            this.batchUpdates.push({ path, value, oldValue });
        }
    }

    // Batch multiple updates
    beginBatch() {
        this.isBatchMode = true;
        this.batchUpdates = [];
    }

    endBatch() {
        this.isBatchMode = false;
        this.recordHistory();
        this.batchUpdates.forEach(({ path, value, oldValue }) => {
            this.notifyListeners(path, value, oldValue);
        });
        this.saveToStorage();
        this.batchUpdates = [];
    }

    // Subscribe to changes
    subscribe(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, new Set());
        }
        this.listeners.get(path).add(callback);
        
        return () => {
            this.listeners.get(path)?.delete(callback);
        };
    }

    // Notify listeners
    notifyListeners(path, newValue, oldValue) {
        if (this.listeners.has(path)) {
            this.listeners.get(path).forEach(callback => {
                try {
                    callback(newValue, oldValue);
                } catch (error) {
                    console.error(`Error in listener for ${path}:`, error);
                }
            });
        }
        
        // Wildcard listeners
        if (this.listeners.has('*')) {
            this.listeners.get('*').forEach(callback => {
                try {
                    callback({ path, newValue, oldValue });
                } catch (error) {
                    console.error('Error in wildcard listener:', error);
                }
            });
        }
    }

    // History management
    recordHistory() {
        this.history.past.push(JSON.stringify(this.state));
        if (this.history.past.length > 50) {
            this.history.past.shift();
        }
        this.history.future = [];
    }

    undo() {
        if (this.history.past.length === 0) return false;
        
        const previous = JSON.parse(this.history.past.pop());
        this.history.future.push(JSON.stringify(this.state));
        this.state = previous;
        this.notifyListeners('*', null, null);
        this.saveToStorage();
        return true;
    }

    redo() {
        if (this.history.future.length === 0) return false;
        
        const next = JSON.parse(this.history.future.pop());
        this.history.past.push(JSON.stringify(this.state));
        this.state = next;
        this.notifyListeners('*', null, null);
        this.saveToStorage();
        return true;
    }

    // Storage operations
    saveToStorage() {
        try {
            const data = {
                version: '1.0.0',
                timestamp: Date.now(),
                state: {
                    currentUser: this.state.currentUser?.id,
                    users: this.state.users,
                    posts: this.state.posts,
                    comments: this.state.comments,
                    likes: this.state.likes,
                    follows: this.state.follows,
                    bookmarks: this.state.bookmarks,
                    notifications: this.state.notifications
                }
            };
            localStorage.setItem('social_state', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('social_state');
            if (saved) {
                const data = JSON.parse(saved);
                this.state = {
                    ...this.state,
                    ...data.state,
                    currentUser: data.state.currentUser ? 
                        data.state.users.find(u => u.id === data.state.currentUser) : null
                };
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }

    // Auto-save every 30 seconds
    initAutoSave() {
        setInterval(() => {
            if (this.state.currentUser) {
                this.saveToStorage();
            }
        }, 30000);
    }

    // User operations
    addUser(user) {
        const users = [...this.state.users];
        users.push({
            ...user,
            id: `user_${Date.now()}`,
            createdAt: new Date().toISOString(),
            followers: 0,
            following: 0,
            posts: 0
        });
        this.set('users', users);
        return users[users.length - 1];
    }

    updateUser(userId, updates) {
        const users = this.state.users.map(user =>
            user.id === userId ? { ...user, ...updates } : user
        );
        this.set('users', users);
        
        if (this.state.currentUser?.id === userId) {
            this.set('currentUser', { ...this.state.currentUser, ...updates });
        }
    }

    // Post operations
    addPost(post) {
        const posts = [...this.state.posts];
        const newPost = {
            id: `post_${Date.now()}`,
            ...post,
            createdAt: new Date().toISOString(),
            likes: 0,
            comments: 0,
            retweets: 0,
            isLiked: false,
            isRetweeted: false,
            isBookmarked: false
        };
        posts.unshift(newPost);
        this.set('posts', posts);
        
        // Update user post count
        this.updateUser(post.userId, { 
            posts: (this.state.users.find(u => u.id === post.userId)?.posts || 0) + 1 
        });
        
        return newPost;
    }

    deletePost(postId) {
        const posts = this.state.posts.filter(p => p.id !== postId);
        this.set('posts', posts);
        
        // Delete associated comments
        const comments = this.state.comments.filter(c => c.postId !== postId);
        this.set('comments', comments);
        
        // Delete associated likes
        const likes = this.state.likes.filter(l => l.postId !== postId);
        this.set('likes', likes);
    }

    // Like operations
    toggleLike(userId, postId) {
        const likes = [...this.state.likes];
        const existingLike = likes.find(l => l.userId === userId && l.postId === postId);
        
        if (existingLike) {
            // Unlike
            const newLikes = likes.filter(l => !(l.userId === userId && l.postId === postId));
            this.set('likes', newLikes);
            
            // Update post like count
            const posts = this.state.posts.map(p =>
                p.id === postId ? { ...p, likes: p.likes - 1, isLiked: false } : p
            );
            this.set('posts', posts);
            
            return false;
        } else {
            // Like
            likes.push({ userId, postId, createdAt: new Date().toISOString() });
            this.set('likes', likes);
            
            // Update post like count
            const posts = this.state.posts.map(p =>
                p.id === postId ? { ...p, likes: p.likes + 1, isLiked: true } : p
            );
            this.set('posts', posts);
            
            // Create notification
            this.addNotification({
                type: 'like',
                userId: this.state.posts.find(p => p.id === postId)?.userId,
                actorId: userId,
                postId,
                createdAt: new Date().toISOString()
            });
            
            return true;
        }
    }

    // Comment operations
    addComment(comment) {
        const comments = [...this.state.comments];
        const newComment = {
            id: `comment_${Date.now()}`,
            ...comment,
            createdAt: new Date().toISOString(),
            likes: 0,
            isLiked: false
        };
        comments.push(newComment);
        this.set('comments', comments);
        
        // Update post comment count
        const posts = this.state.posts.map(p =>
            p.id === comment.postId ? { ...p, comments: p.comments + 1 } : p
        );
        this.set('posts', posts);
        
        // Create notification
        this.addNotification({
            type: 'comment',
            userId: this.state.posts.find(p => p.id === comment.postId)?.userId,
            actorId: comment.userId,
            postId: comment.postId,
            commentId: newComment.id,
            createdAt: new Date().toISOString()
        });
        
        return newComment;
    }

    deleteComment(commentId) {
        const comment = this.state.comments.find(c => c.id === commentId);
        if (comment) {
            const comments = this.state.comments.filter(c => c.id !== commentId);
            this.set('comments', comments);
            
            // Update post comment count
            const posts = this.state.posts.map(p =>
                p.id === comment.postId ? { ...p, comments: p.comments - 1 } : p
            );
            this.set('posts', posts);
        }
    }

    // Follow operations
    toggleFollow(followerId, followingId) {
        const follows = [...this.state.follows];
        const existingFollow = follows.find(f => 
            f.followerId === followerId && f.followingId === followingId
        );
        
        if (existingFollow) {
            // Unfollow
            const newFollows = follows.filter(f => 
                !(f.followerId === followerId && f.followingId === followingId)
            );
            this.set('follows', newFollows);
            
            // Update follower counts
            const users = this.state.users.map(u => {
                if (u.id === followerId) {
                    return { ...u, following: u.following - 1 };
                }
                if (u.id === followingId) {
                    return { ...u, followers: u.followers - 1 };
                }
                return u;
            });
            this.set('users', users);
            
            return false;
        } else {
            // Follow
            follows.push({ followerId, followingId, createdAt: new Date().toISOString() });
            this.set('follows', follows);
            
            // Update follower counts
            const users = this.state.users.map(u => {
                if (u.id === followerId) {
                    return { ...u, following: u.following + 1 };
                }
                if (u.id === followingId) {
                    return { ...u, followers: u.followers + 1 };
                }
                return u;
            });
            this.set('users', users);
            
            // Create notification
            this.addNotification({
                type: 'follow',
                userId: followingId,
                actorId: followerId,
                createdAt: new Date().toISOString()
            });
            
            return true;
        }
    }

    // Bookmark operations
    toggleBookmark(userId, postId) {
        const bookmarks = [...this.state.bookmarks];
        const existingBookmark = bookmarks.find(b => b.userId === userId && b.postId === postId);
        
        if (existingBookmark) {
            const newBookmarks = bookmarks.filter(b => 
                !(b.userId === userId && b.postId === postId)
            );
            this.set('bookmarks', newBookmarks);
            
            // Update post bookmark status
            const posts = this.state.posts.map(p =>
                p.id === postId ? { ...p, isBookmarked: false } : p
            );
            this.set('posts', posts);
            
            return false;
        } else {
            bookmarks.push({ userId, postId, createdAt: new Date().toISOString() });
            this.set('bookmarks', bookmarks);
            
            // Update post bookmark status
            const posts = this.state.posts.map(p =>
                p.id === postId ? { ...p, isBookmarked: true } : p
            );
            this.set('posts', posts);
            
            return true;
        }
    }

    // Notification operations
    addNotification(notification) {
        const notifications = [...this.state.notifications];
        notifications.unshift({
            id: `notif_${Date.now()}`,
            read: false,
            ...notification
        });
        
        // Keep only last 50 notifications
        if (notifications.length > 50) {
            notifications.pop();
        }
        
        this.set('notifications', notifications);
    }

    markNotificationAsRead(notificationId) {
        const notifications = this.state.notifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
        );
        this.set('notifications', notifications);
    }

    markAllNotificationsAsRead() {
        const notifications = this.state.notifications.map(n => ({ ...n, read: true }));
        this.set('notifications', notifications);
    }

    // Get feed posts
    getFeedPosts(userId = null) {
        let posts = [...this.state.posts];
        
        if (userId) {
            // Get posts from followed users
            const followedUsers = this.state.follows
                .filter(f => f.followerId === userId)
                .map(f => f.followingId);
            
            posts = posts.filter(p => 
                p.userId === userId || followedUsers.includes(p.userId)
            );
        }
        
        // Sort by date
        return posts.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
    }

    // Get user posts
    getUserPosts(userId) {
        return this.state.posts
            .filter(p => p.userId === userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Get comments for post
    getPostComments(postId) {
        return this.state.comments
            .filter(c => c.postId === postId)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    // Get followers
    getFollowers(userId) {
        return this.state.follows
            .filter(f => f.followingId === userId)
            .map(f => f.followerId);
    }

    // Get following
    getFollowing(userId) {
        return this.state.follows
            .filter(f => f.followerId === userId)
            .map(f => f.followingId);
    }

    // Check if following
    isFollowing(followerId, followingId) {
        return this.state.follows.some(f => 
            f.followerId === followerId && f.followingId === followingId
        );
    }

    // Get user by ID
    getUser(userId) {
        return this.state.users.find(u => u.id === userId);
    }

    // Get multiple users by IDs
    getUsers(userIds) {
        return this.state.users.filter(u => userIds.includes(u.id));
    }

    // Search users
    searchUsers(query) {
        if (!query) return [];
        const lowercaseQuery = query.toLowerCase();
        return this.state.users.filter(user =>
            user.name.toLowerCase().includes(lowercaseQuery) ||
            user.username.toLowerCase().includes(lowercaseQuery)
        );
    }

    // Search posts
    searchPosts(query) {
        if (!query) return [];
        const lowercaseQuery = query.toLowerCase();
        return this.state.posts.filter(post =>
            post.content.toLowerCase().includes(lowercaseQuery)
        );
    }

    // Get trends
    updateTrends() {
        const words = this.state.posts
            .flatMap(p => p.content.toLowerCase().match(/#[a-z0-9_]+/g) || [])
            .reduce((acc, word) => {
                acc[word] = (acc[word] || 0) + 1;
                return acc;
            }, {});
        
        const trends = Object.entries(words)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        
        this.set('trends', trends);
        return trends;
    }

    // Reset all data
    reset() {
        if (confirm('Reset all data? This cannot be undone.')) {
            localStorage.removeItem('social_state');
            window.location.reload();
        }
    }

    // Export data
    exportData() {
        return JSON.stringify(this.state, null, 2);
    }

    // Import data
    importData(json) {
        try {
            const data = JSON.parse(json);
            this.state = data;
            this.saveToStorage();
            this.notifyListeners('*', null, null);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
}