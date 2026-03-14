export class PostManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    createPost() {
        const user = this.stateManager.get('currentUser');
        if (!user) {
            this.eventBus.emit('notification', {
                message: 'Please login to post',
                type: 'error'
            });
            return;
        }

        const content = document.getElementById('postContent').value;
        
        if (!content.trim()) {
            this.eventBus.emit('notification', {
                message: 'Post cannot be empty',
                type: 'error'
            });
            return;
        }

        if (content.length > 280) {
            this.eventBus.emit('notification', {
                message: 'Post is too long (max 280 characters)',
                type: 'error'
            });
            return;
        }

        const post = {
            userId: user.id,
            content: content.trim(),
            image: null // Could add image upload
        };

        this.stateManager.addPost(post);
        
        this.eventBus.emit('post:created', post);
        
        this.eventBus.emit('notification', {
            message: 'Post created successfully!',
            type: 'success'
        });

        // Clear input
        document.getElementById('postContent').value = '';
    }

    likePost(postId) {
        const user = this.stateManager.get('currentUser');
        if (!user) {
            this.eventBus.emit('notification', {
                message: 'Please login to like posts',
                type: 'error'
            });
            return;
        }

        const isLiked = this.stateManager.toggleLike(user.id, postId);
        
        this.eventBus.emit('post:liked', { postId, isLiked });
        
        // Update UI
        const likeBtn = document.querySelector(`[data-post-id="${postId}"] .like-btn`);
        if (likeBtn) {
            likeBtn.classList.toggle('liked', isLiked);
            const countSpan = likeBtn.querySelector('.count');
            const currentCount = parseInt(countSpan.textContent);
            countSpan.textContent = isLiked ? currentCount + 1 : currentCount - 1;
        }
    }

    bookmarkPost(postId) {
        const user = this.stateManager.get('currentUser');
        if (!user) {
            this.eventBus.emit('notification', {
                message: 'Please login to bookmark posts',
                type: 'error'
            });
            return;
        }

        const isBookmarked = this.stateManager.toggleBookmark(user.id, postId);
        
        this.eventBus.emit('post:bookmarked', { postId, isBookmarked });
        
        // Update UI
        const bookmarkBtn = document.querySelector(`[data-post-id="${postId}"] .bookmark-btn`);
        if (bookmarkBtn) {
            bookmarkBtn.classList.toggle('active', isBookmarked);
        }
    }

    deletePost(postId) {
        const user = this.stateManager.get('currentUser');
        const post = this.stateManager.get('posts').find(p => p.id === postId);

        if (!user || post.userId !== user.id) {
            this.eventBus.emit('notification', {
                message: 'You can only delete your own posts',
                type: 'error'
            });
            return;
        }

        if (confirm('Delete this post?')) {
            this.stateManager.deletePost(postId);
            
            this.eventBus.emit('post:deleted', postId);
            
            this.eventBus.emit('notification', {
                message: 'Post deleted',
                type: 'info'
            });

            // Refresh feed
            document.dispatchEvent(new CustomEvent('refresh-feed'));
        }
    }

    renderPost(post) {
        const user = this.stateManager.getUser(post.userId);
        const currentUser = this.stateManager.get('currentUser');
        
        if (!user) return '';

        const timeAgo = this.getTimeAgo(post.createdAt);
        
        return `
            <div class="post-card" data-post-id="${post.id}">
                <div class="post-header">
                    <img src="${user.avatar}" alt="${user.name}" class="post-avatar">
                    <div class="post-user-info">
                        <div>
                            <span class="post-user-name">${user.name}</span>
                            ${user.verified ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
                            <span class="post-user-handle">@${user.username}</span>
                        </div>
                        <div class="post-time">${timeAgo}</div>
                    </div>
                    ${currentUser?.id === user.id ? `
                        <div class="post-menu">
                            <button class="icon-btn" onclick="app.postManager.deletePost('${post.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                <div class="post-content">
                    <div class="post-text">${this.linkify(post.content)}</div>
                    ${post.image ? `
                        <div class="post-media">
                            <img src="${post.image}" alt="Post media">
                        </div>
                    ` : ''}
                </div>
                
                <div class="post-stats">
                    <span class="stat-item">
                        <span class="stat-number">${post.likes}</span>
                        <span>Likes</span>
                    </span>
                    <span class="stat-item">
                        <span class="stat-number">${post.comments}</span>
                        <span>Comments</span>
                    </span>
                    <span class="stat-item">
                        <span class="stat-number">${post.retweets || 0}</span>
                        <span>Retweets</span>
                    </span>
                </div>
                
                <div class="post-actions">
                    <button class="action-btn like-btn ${post.isLiked ? 'liked' : ''}" 
                            onclick="app.postManager.likePost('${post.id}')">
                        <i class="fas ${post.isLiked ? 'fa-heart' : 'fa-heart'}"></i>
                        <span class="count">${post.likes}</span>
                    </button>
                    
                    <button class="action-btn comment-btn" 
                            onclick="app.commentManager.showComments('${post.id}')">
                        <i class="fas fa-comment"></i>
                        <span class="count">${post.comments}</span>
                    </button>
                    
                    <button class="action-btn retweet-btn" 
                            onclick="app.postManager.retweet('${post.id}')">
                        <i class="fas fa-retweet"></i>
                        <span class="count">${post.retweets || 0}</span>
                    </button>
                    
                    <button class="action-btn bookmark-btn ${post.isBookmarked ? 'active' : ''}" 
                            onclick="app.postManager.bookmarkPost('${post.id}')">
                        <i class="fas fa-bookmark"></i>
                    </button>
                </div>
                
                <div id="comments-${post.id}" class="comments-section" style="display: none;">
                    <!-- Comments will be loaded here -->
                </div>
            </div>
        `;
    }

    linkify(text) {
        // Replace URLs with links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        text = text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');
        
        // Replace hashtags with links
        const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
        text = text.replace(hashtagRegex, '<a href="#" onclick="app.feedManager.search(\'#$1\')">#$1</a>');
        
        // Replace mentions with links
        const mentionRegex = /@([a-zA-Z0-9_]+)/g;
        text = text.replace(mentionRegex, '<a href="#" onclick="app.userManager.viewProfile(\'$1\')">@$1</a>');
        
        return text;
    }

    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'just now';
        
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d`;
        
        const weeks = Math.floor(days / 7);
        if (weeks < 4) return `${weeks}w`;
        
        const months = Math.floor(days / 30);
        if (months < 12) return `${months}mo`;
        
        const years = Math.floor(days / 365);
        return `${years}y`;
    }
}