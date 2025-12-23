const UI = (function() {
   
    let elements = {};

    const init = () => {
        cacheElements();
        setupEventListeners();
        applyTheme();
        console.log('UI initialized');
    };

    const cacheElements = () => {
        elements = {

            themeToggle: document.getElementById('themeToggle'),
            
            postsContainer: document.getElementById('postsContainer'),
            loadingSpinner: document.getElementById('loadingSpinner'),
            
            createPostBtn: document.getElementById('createPostBtn'),
            quickPost: document.getElementById('quickPost'),
            quickPostBtn: document.getElementById('quickPostBtn'),
            postModal: document.getElementById('postModal'),
            closeModal: document.getElementById('closeModal'),
            cancelPost: document.getElementById('cancelPost'),
            submitPost: document.getElementById('submitPost'),
            postInput: document.getElementById('postInput'),

            toastContainer: document.getElementById('toastContainer'),
            
            filterBtns: document.querySelectorAll('.filter-btn')
        };
    };

    const setupEventListeners = () => {
        // Theme toggle
        elements.themeToggle?.addEventListener('click', () => {
            const newTheme = State.toggleTheme();
            showToast(`Switched to ${newTheme} mode`, 'success');
        });

        // Post creation
        elements.createPostBtn?.addEventListener('click', () => {
            elements.postModal.classList.add('active');
            elements.postInput.focus();
        });

        elements.closeModal?.addEventListener('click', () => {
            elements.postModal.classList.remove('active');
            elements.postInput.value = '';
            elements.submitPost.disabled = true;
        });

        elements.cancelPost?.addEventListener('click', () => {
            elements.postModal.classList.remove('active');
            elements.postInput.value = '';
            elements.submitPost.disabled = true;
        });

        elements.postInput?.addEventListener('input', (e) => {
            elements.submitPost.disabled = e.target.value.trim().length === 0;
        });

        elements.submitPost?.addEventListener('click', () => {
            createPost();
        });

        elements.quickPostBtn?.addEventListener('click', () => {
            createQuickPost();
        });

        elements.quickPost?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                createQuickPost();
            }
        });

        // Feed filters
        elements.filterBtns?.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                // In a real app, this would filter the feed
                showToast(`Showing ${btn.textContent} feed`, 'info');
            });
        });

        // Infinite scroll
        window.addEventListener('scroll', handleInfiniteScroll);
    };

    // Apply theme from state
    const applyTheme = () => {
        const theme = State.get('theme');
        document.documentElement.setAttribute('data-theme', theme);
    };

    // Create post from modal
    const createPost = () => {
        const content = elements.postInput.value.trim();
        if (!content) return;

        const post = {
            content,
            tags: extractTags(content),
            user: State.get('user')
        };

        State.addPost(post);
        
        elements.postModal.classList.remove('active');
        elements.postInput.value = '';
        elements.submitPost.disabled = true;
        
        showToast('Post created successfully!', 'success');
    };

    // Create quick post
    const createQuickPost = () => {
        const content = elements.quickPost.value.trim();
        if (!content) return;

        const post = {
            content,
            tags: extractTags(content),
            user: State.get('user')
        };

        State.addPost(post);
        
        elements.quickPost.value = '';
        showToast('Post created successfully!', 'success');
    };

    // Extract hashtags from content
    const extractTags = (content) => {
        const tags = content.match(/#[\w]+/g) || [];
        return [...new Set(tags)].slice(0, 3); // Max 3 unique tags
    };

    // Render posts
    const renderPosts = (posts) => {
        if (!posts || posts.length === 0) {
            elements.postsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comment-slash"></i>
                    <h3>No posts yet</h3>
                    <p>Be the first to share something!</p>
                </div>
            `;
            return;
        }

        elements.postsContainer.innerHTML = posts.map(post => createPostHTML(post)).join('');
        
        // Re-attach event listeners to new posts
        attachPostEventListeners();
    };

    // Create post HTML
    const createPostHTML = (post) => {
        const timeAgo = getTimeAgo(post.createdAt);
        const isCurrentUser = post.userId === State.get('user.id');
        
        return `
            <div class="post-card" data-post-id="${post.id}">
                <div class="post-header">
                    <img src="${post.userAvatar}" alt="${post.userName}" class="post-avatar">
                    <div class="post-user-info">
                        <h4>${post.userName}</h4>
                        <p>${post.userHandle}</p>
                        <div class="post-meta">
                            <span>${timeAgo}</span>
                            <i class="fas fa-circle"></i>
                            <span><i class="fas fa-globe-americas"></i> Public</span>
                        </div>
                    </div>
                    <div class="post-actions-top">
                        ${isCurrentUser ? `
                            <button class="post-action-btn edit-post" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="post-action-btn delete-post" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : `
                            <button class="post-action-btn" title="More options">
                                <i class="fas fa-ellipsis-h"></i>
                            </button>
                        `}
                    </div>
                </div>
                
                <div class="post-content">
                    <p class="post-text">${formatPostContent(post.content)}</p>
                    
                    ${post.tags && post.tags.length > 0 ? `
                        <div class="post-tags">
                            ${post.tags.map(tag => `
                                <span class="post-tag">${tag}</span>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    ${post.image ? `
                        <div class="post-image">
                            <img src="${post.image}" alt="Post image">
                        </div>
                    ` : ''}
                </div>
                
                <div class="post-stats">
                    <div class="stat-item">
                        <i class="fas fa-heart"></i>
                        <span>${formatNumber(post.likes)} likes</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-comment"></i>
                        <span>${formatNumber(post.comments?.length || 0)} comments</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-share"></i>
                        <span>${formatNumber(post.shares || 0)} shares</span>
                    </div>
                </div>
                
                <div class="post-actions-bottom">
                    <button class="post-action like ${post.isLiked ? 'active' : ''}" data-action="like">
                        <i class="fas fa-heart"></i>
                        <span>Like</span>
                    </button>
                    <button class="post-action comment" data-action="comment">
                        <i class="fas fa-comment"></i>
                        <span>Comment</span>
                    </button>
                    <button class="post-action share" data-action="share">
                        <i class="fas fa-share"></i>
                        <span>Share</span>
                    </button>
                    <button class="post-action save ${post.isBookmarked ? 'active' : ''}" data-action="save">
                        <i class="fas fa-bookmark"></i>
                        <span>Save</span>
                    </button>
                </div>
                
                <div class="comments-section" style="display: none;">
                    <div class="comment-input-container">
                        <img src="${State.get('user.avatar')}" alt="Your avatar" class="comment-avatar">
                        <input type="text" class="comment-input" placeholder="Write a comment...">
                        <button class="comment-btn">Post</button>
                    </div>
                    <div class="comments-list">
                        ${post.comments?.map(comment => createCommentHTML(comment)).join('') || ''}
                    </div>
                </div>
            </div>
        `;
    };

    // Create comment HTML
    const createCommentHTML = (comment) => {
        const timeAgo = getTimeAgo(comment.createdAt);
        
        return `
            <div class="comment-item" data-comment-id="${comment.id}">
                <img src="${comment.userAvatar}" alt="${comment.userName}" class="comment-avatar">
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">${comment.userName}</span>
                        <span class="comment-time">${timeAgo}</span>
                    </div>
                    <p class="comment-text">${comment.content}</p>
                    <div class="comment-actions">
                        <span class="comment-action like-comment">
                            <i class="fas fa-heart"></i>
                            <span>${comment.likes}</span>
                        </span>
                        <span class="comment-action reply-comment">Reply</span>
                    </div>
                </div>
            </div>
        `;
    };

    // Format post content
    const formatPostContent = (content) => {
        // Convert URLs to links
        content = content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
        
        // Convert hashtags to spans
        content = content.replace(/#([\w]+)/g, '<span class="hashtag">#$1</span>');
        
        // Convert mentions
        content = content.replace(/@([\w]+)/g, '<span class="mention">@$1</span>');
        
        return content;
    };

    // Format numbers (1k, 1m, etc.)
    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    // Get time ago
    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return Math.floor(seconds / 60) + 'm';
        if (seconds < 86400) return Math.floor(seconds / 3600) + 'h';
        if (seconds < 604800) return Math.floor(seconds / 86400) + 'd';
        if (seconds < 2592000) return Math.floor(seconds / 604800) + 'w';
        if (seconds < 31536000) return Math.floor(seconds / 2592000) + 'mo';
        return Math.floor(seconds / 31536000) + 'y';
    };

    // Attach event listeners to posts
    const attachPostEventListeners = () => {
        // Like buttons
        document.querySelectorAll('.post-action.like').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = parseInt(e.target.closest('.post-card').dataset.postId);
                const post = State.toggleLike(postId);
                
                if (post) {
                    const likeBtn = e.currentTarget;
                    const likeCount = likeBtn.closest('.post-card').querySelector('.stat-item .fa-heart').parentElement;
                    
                    likeBtn.classList.toggle('active');
                    likeBtn.innerHTML = `
                        <i class="fas fa-heart"></i>
                        <span>${post.isLiked ? 'Liked' : 'Like'}</span>
                    `;
                    
                    likeCount.innerHTML = `
                        <i class="fas fa-heart"></i>
                        <span>${formatNumber(post.likes)} likes</span>
                    `;
                    
                    showToast(post.isLiked ? 'Post liked!' : 'Post unliked', 'success');
                }
            });
        });

        // Save buttons
        document.querySelectorAll('.post-action.save').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = parseInt(e.target.closest('.post-card').dataset.postId);
                const post = State.toggleBookmark(postId);
                
                if (post) {
                    const saveBtn = e.currentTarget;
                    saveBtn.classList.toggle('active');
                    saveBtn.innerHTML = `
                        <i class="fas fa-bookmark"></i>
                        <span>${post.isBookmarked ? 'Saved' : 'Save'}</span>
                    `;
                    
                    showToast(post.isBookmarked ? 'Post saved!' : 'Post unsaved', 'success');
                }
            });
        });

        // Comment buttons
        document.querySelectorAll('.post-action.comment').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postCard = e.target.closest('.post-card');
                const commentsSection = postCard.querySelector('.comments-section');
                const commentInput = postCard.querySelector('.comment-input');
                
                commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
                
                if (commentsSection.style.display === 'block') {
                    commentInput.focus();
                }
            });
        });

        // Share buttons
        document.querySelectorAll('.post-action.share').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = parseInt(e.target.closest('.post-card').dataset.postId);
                // In a real app, this would open a share dialog
                showToast('Share feature coming soon!', 'info');
            });
        });

        // Comment submission
        document.querySelectorAll('.comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postCard = e.target.closest('.post-card');
                const postId = parseInt(postCard.dataset.postId);
                const commentInput = postCard.querySelector('.comment-input');
                const content = commentInput.value.trim();
                
                if (content) {
                    const comment = {
                        content,
                        user: State.get('user')
                    };
                    
                    State.addComment(postId, comment);
                    commentInput.value = '';
                    
                    // Refresh comments
                    const post = State.get('posts').find(p => p.id === postId);
                    if (post) {
                        const commentsList = postCard.querySelector('.comments-list');
                        commentsList.innerHTML = post.comments?.map(c => createCommentHTML(c)).join('') || '';
                    }
                    
                    showToast('Comment added!', 'success');
                }
            });
        });

        // Delete post buttons
        document.querySelectorAll('.delete-post').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postCard = e.target.closest('.post-card');
                const postId = parseInt(postCard.dataset.postId);
                
                if (confirm('Are you sure you want to delete this post?')) {
                    State.deletePost(postId);
                    postCard.style.animation = 'fadeOut 0.3s ease';
                    setTimeout(() => postCard.remove(), 300);
                    showToast('Post deleted', 'success');
                }
            });
        });
    };

    // Handle infinite scroll
    const handleInfiniteScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            loadMorePosts();
        }
    };

    // Load more posts
    const loadMorePosts = async () => {
        if (State.get('isLoading') || !State.get('hasMorePosts')) return;
        
        elements.loadingSpinner.classList.add('active');
        
        await State.loadMorePosts();
        
        elements.loadingSpinner.classList.remove('active');
    };

    // Show toast notification
    const showToast = (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' :
                     type === 'error' ? 'fa-exclamation-circle' :
                     'fa-info-circle';
        
        toast.innerHTML = `
            <div class="toast-icon ${type}">
                <i class="fas ${icon}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;
        
        elements.toastContainer.appendChild(toast);
        
        // Remove toast after animation
        setTimeout(() => {
            toast.remove();
        }, 3000);
    };

    // Update UI based on state changes
    const updateUI = () => {
        const posts = State.get('posts');
        renderPosts(posts);
    };

    // Subscribe to state changes
    const subscribeToState = () => {
        State.subscribe('stateChange', (event) => {
            const { key, value } = event.detail;
            
            if (key === 'posts') {
                updateUI();
            }
        });
        
        State.subscribe('postAdded', () => {
            updateUI();
        });
        
        State.subscribe('postUpdated', () => {
            updateUI();
        });
        
        State.subscribe('postsLoaded', () => {
            updateUI();
        });
    };

    return {
        init,
        renderPosts,
        updateUI,
        showToast,
        subscribeToState
    };
})();