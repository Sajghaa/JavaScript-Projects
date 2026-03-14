export class FeedComponent {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.page = 1;
        this.hasMore = true;
        this.isLoading = false;
        this.currentFilter = 'for-you';
    }

    renderFeed(posts, options = {}) {
        const {
            title = 'Home',
            showTabs = true,
            showCreatePost = true,
            emptyMessage = 'No posts yet',
            emptyAction = null
        } = options;

        const currentUser = this.stateManager.get('currentUser');

        return `
            <div class="feed-container" id="mainFeed">
                <div class="feed-header">
                    <h2>${title}</h2>
                    ${showTabs ? this.renderTabs() : ''}
                </div>

                ${showCreatePost && currentUser ? this.renderCreatePostBox() : ''}

                <div class="posts-feed" id="postsFeed">
                    ${posts.length > 0 ? 
                        posts.map(post => app.postComponent.render(post)).join('') :
                        this.renderEmptyFeed(emptyMessage, emptyAction)
                    }
                </div>

                <div class="feed-loader" id="feedLoader" style="display: none;">
                    <div class="spinner"></div>
                    <span>Loading more posts...</span>
                </div>

                <div class="feed-end" id="feedEnd" style="display: none;">
                    <i class="fas fa-check-circle"></i>
                    <span>You're all caught up!</span>
                </div>
            </div>
        `;
    }

    renderTabs() {
        return `
            <div class="feed-tabs">
                <button class="feed-tab ${this.currentFilter === 'for-you' ? 'active' : ''}" 
                        onclick="app.feedComponent.switchTab('for-you')">
                    <i class="fas fa-fire"></i>
                    For You
                </button>
                <button class="feed-tab ${this.currentFilter === 'following' ? 'active' : ''}" 
                        onclick="app.feedComponent.switchTab('following')">
                    <i class="fas fa-users"></i>
                    Following
                </button>
                <button class="feed-tab ${this.currentFilter === 'trending' ? 'active' : ''}" 
                        onclick="app.feedComponent.switchTab('trending')">
                    <i class="fas fa-chart-line"></i>
                    Trending
                </button>
                <button class="feed-tab ${this.currentFilter === 'latest' ? 'active' : ''}" 
                        onclick="app.feedComponent.switchTab('latest')">
                    <i class="fas fa-clock"></i>
                    Latest
                </button>
            </div>
        `;
    }

    renderCreatePostBox() {
        const user = this.stateManager.get('currentUser');
        
        return `
            <div class="create-post-box">
                <img src="${user.avatar}" alt="${user.name}" class="avatar" 
                     onclick="app.userManager.viewProfile('${user.username}')">
                <div class="create-post-input">
                    <textarea 
                        id="quickPostText" 
                        placeholder="What's happening?" 
                        maxlength="280"
                        oninput="app.feedComponent.updateQuickPostCount()"
                    ></textarea>
                    
                    <div class="post-preview" id="quickPostPreview" style="display: none;"></div>
                    
                    <div class="post-actions-bar">
                        <div class="post-tools">
                            <button class="tool-btn" title="Add image" 
                                    onclick="document.getElementById('quickPostImage').click()">
                                <i class="fas fa-image"></i>
                            </button>
                            <input type="file" id="quickPostImage" accept="image/*" style="display: none;"
                                   onchange="app.feedComponent.previewImage(event)">
                            
                            <button class="tool-btn" title="Add GIF" 
                                    onclick="app.feedComponent.openGifPicker()">
                                <i class="fas fa-gift"></i>
                            </button>
                            
                            <button class="tool-btn" title="Add poll" 
                                    onclick="app.feedComponent.togglePollCreator()">
                                <i class="fas fa-chart-bar"></i>
                            </button>
                            
                            <button class="tool-btn" title="Add emoji" 
                                    onclick="app.feedComponent.openEmojiPicker()">
                                <i class="far fa-smile"></i>
                            </button>
                            
                            <button class="tool-btn" title="Add location" 
                                    onclick="app.feedComponent.addLocation()">
                                <i class="fas fa-map-marker-alt"></i>
                            </button>
                        </div>
                        
                        <div class="post-submit">
                            <span class="char-count" id="quickPostCount">0/280</span>
                            <button class="btn btn-primary" onclick="app.feedComponent.quickPost()">
                                <i class="fas fa-feather"></i>
                                Post
                            </button>
                        </div>
                    </div>
                    
                    <div id="pollCreator" class="poll-creator" style="display: none;">
                        <div class="poll-options">
                            <input type="text" class="poll-option-input" placeholder="Option 1">
                            <input type="text" class="poll-option-input" placeholder="Option 2">
                            <button class="add-poll-option" onclick="app.feedComponent.addPollOption()">
                                <i class="fas fa-plus"></i> Add option
                            </button>
                        </div>
                        <div class="poll-settings">
                            <select id="pollDuration">
                                <option value="3600000">1 hour</option>
                                <option value="86400000">24 hours</option>
                                <option value="604800000">7 days</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderEmptyFeed(message, action) {
        return `
            <div class="empty-feed">
                <i class="fas fa-newspaper"></i>
                <h3>${message}</h3>
                <p>When people post, you'll see them here</p>
                ${action ? `
                    <button class="btn btn-primary" onclick="${action}">
                        Explore
                    </button>
                ` : ''}
            </div>
        `;
    }

    renderLoading() {
        return `
            <div class="feed-loading">
                <div class="spinner"></div>
                <p>Loading your feed...</p>
            </div>
        `;
    }

    renderError(error) {
        return `
            <div class="feed-error">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Something went wrong</h3>
                <p>${error}</p>
                <button class="btn btn-primary" onclick="app.feedComponent.retryLoad()">
                    Try Again
                </button>
            </div>
        `;
    }

    renderStories() {
        const users = this.stateManager.get('users').slice(0, 10);
        
        return `
            <div class="stories-container">
                <button class="stories-prev" onclick="app.feedComponent.scrollStories('prev')">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div class="stories-list">
                    ${users.map(user => `
                        <div class="story-item" onclick="app.userManager.viewStory('${user.id}')">
                            <div class="story-ring">
                                <img src="${user.avatar}" alt="${user.name}" class="story-avatar">
                            </div>
                            <span class="story-name">${user.name.split(' ')[0]}</span>
                        </div>
                    `).join('')}
                </div>
                <button class="stories-next" onclick="app.feedComponent.scrollStories('next')">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
    }

    renderTrendingTopics() {
        const trends = this.stateManager.updateTrends();
        
        return `
            <div class="trending-sidebar">
                <h3>Trending Topics</h3>
                <div class="trending-list">
                    ${trends.map(trend => `
                        <div class="trending-item" onclick="app.feedComponent.searchTrend('${trend.name}')">
                            <span class="trend-name">${trend.name}</span>
                            <span class="trend-count">${trend.count} posts</span>
                        </div>
                    `).join('')}
                </div>
                <a href="#" class="show-more" onclick="app.feedComponent.showMoreTrends()">
                    Show more
                </a>
            </div>
        `;
    }

    renderWhoToFollow() {
        const currentUser = this.stateManager.get('currentUser');
        if (!currentUser) return '';

        const users = this.stateManager.get('users')
            .filter(u => u.id !== currentUser.id)
            .slice(0, 5);

        return `
            <div class="who-to-follow">
                <h3>Who to follow</h3>
                <div class="suggestions-list">
                    ${users.map(user => `
                        <div class="suggestion-item">
                            <img src="${user.avatar}" alt="${user.name}" class="suggestion-avatar">
                            <div class="suggestion-info">
                                <div class="suggestion-name">${user.name}</div>
                                <div class="suggestion-handle">@${user.username}</div>
                            </div>
                            <button class="follow-btn" onclick="app.userManager.followUser('${user.id}')">
                                Follow
                            </button>
                        </div>
                    `).join('')}
                </div>
                <a href="#" class="show-more" onclick="app.userManager.showSuggestions()">
                    Show more
                </a>
            </div>
        `;
    }

    renderBirthdays() {
        const today = new Date();
        const users = this.stateManager.get('users').filter(user => {
            if (!user.birthday) return false;
            const birthday = new Date(user.birthday);
            return birthday.getMonth() === today.getMonth() && 
                   birthday.getDate() === today.getDate();
        });

        if (users.length === 0) return '';

        return `
            <div class="birthdays-sidebar">
                <h3><i class="fas fa-birthday-cake"></i> Birthdays</h3>
                <div class="birthdays-list">
                    ${users.map(user => `
                        <div class="birthday-item">
                            <img src="${user.avatar}" alt="${user.name}" class="birthday-avatar">
                            <span>${user.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    switchTab(tab) {
        this.currentFilter = tab;
        this.page = 1;
        this.hasMore = true;
        
        // Update UI
        document.querySelectorAll('.feed-tab').forEach(t => {
            t.classList.toggle('active', t.textContent.toLowerCase().includes(tab));
        });
        
        // Load new feed
        this.loadFeed();
    }

    async loadFeed() {
        if (this.isLoading || !this.hasMore) return;

        this.isLoading = true;
        document.getElementById('feedLoader').style.display = 'block';

        // Simulate API call
        setTimeout(() => {
            const currentUser = this.stateManager.get('currentUser');
            let posts = this.stateManager.getFeedPosts(currentUser?.id);
            
            // Apply filters
            switch(this.currentFilter) {
                case 'following':
                    const following = this.stateManager.getFollowing(currentUser?.id);
                    posts = posts.filter(p => following.includes(p.userId));
                    break;
                case 'trending':
                    posts = posts.sort((a, b) => b.likes - a.likes);
                    break;
                case 'latest':
                    posts = posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
            }

            // Paginate
            const start = (this.page - 1) * 10;
            const end = start + 10;
            const newPosts = posts.slice(start, end);

            if (newPosts.length < 10) {
                this.hasMore = false;
                document.getElementById('feedEnd').style.display = 'block';
            }

            if (this.page === 1) {
                document.getElementById('postsFeed').innerHTML = newPosts.map(p => app.postComponent.render(p)).join('');
            } else {
                document.getElementById('postsFeed').innerHTML += newPosts.map(p => app.postComponent.render(p)).join('');
            }

            this.page++;
            this.isLoading = false;
            document.getElementById('feedLoader').style.display = 'none';
        }, 1000);
    }

    quickPost() {
        const content = document.getElementById('quickPostText').value;
        if (!content.trim()) return;

        const user = this.stateManager.get('currentUser');
        const post = {
            userId: user.id,
            content: content.trim(),
            image: this.quickPostImage,
            createdAt: new Date().toISOString(),
            likes: 0,
            comments: 0,
            retweets: 0
        };

        this.stateManager.addPost(post);
        
        // Clear form
        document.getElementById('quickPostText').value = '';
        document.getElementById('quickPostPreview').style.display = 'none';
        document.getElementById('quickPostPreview').innerHTML = '';
        this.quickPostImage = null;
        
        // Refresh feed
        this.page = 1;
        this.hasMore = true;
        this.loadFeed();

        this.eventBus.emit('notification', {
            message: 'Post created!',
            type: 'success'
        });
    }

    updateQuickPostCount() {
        const textarea = document.getElementById('quickPostText');
        const count = textarea.value.length;
        document.getElementById('quickPostCount').textContent = `${count}/280`;
        
        if (count > 280) {
            textarea.value = textarea.value.slice(0, 280);
        }
    }

    previewImage(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.quickPostImage = e.target.result;
                const preview = document.getElementById('quickPostPreview');
                preview.innerHTML = `
                    <div class="image-preview">
                        <img src="${e.target.result}" alt="Preview">
                        <button class="remove-image" onclick="app.feedComponent.removeImage()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }

    removeImage() {
        this.quickPostImage = null;
        document.getElementById('quickPostPreview').style.display = 'none';
        document.getElementById('quickPostImage').value = '';
    }

    setupInfiniteScroll() {
        const options = {
            root: null,
            rootMargin: '100px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && this.hasMore && !this.isLoading) {
                    this.loadFeed();
                }
            });
        }, options);

        const sentinel = document.getElementById('feedEnd');
        if (sentinel) observer.observe(sentinel);
    }
}