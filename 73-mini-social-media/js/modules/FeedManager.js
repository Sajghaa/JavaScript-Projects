export class FeedManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.currentFilter = 'for-you';
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('refresh-feed', () => {
            this.refreshFeed();
        });
    }

    renderHomeFeed() {
        const user = this.stateManager.get('currentUser');
        const posts = this.stateManager.getFeedPosts(user?.id);
        
        return `
            <div class="feed-container">
                <div class="feed-header">
                    <h2>Home</h2>
                    <div class="feed-tabs">
                        <button class="feed-tab ${this.currentFilter === 'for-you' ? 'active' : ''}" 
                                onclick="app.feedManager.setFilter('for-you')">
                            For You
                        </button>
                        <button class="feed-tab ${this.currentFilter === 'following' ? 'active' : ''}" 
                                onclick="app.feedManager.setFilter('following')">
                            Following
                        </button>
                    </div>
                </div>

                ${user ? this.renderCreatePostBox() : ''}

                <div class="posts-feed" id="postsFeed">
                    ${posts.length > 0 ? 
                        posts.map(post => app.postManager.renderPost(post)).join('') :
                        this.renderEmptyFeed()
                    }
                </div>
            </div>
        `;
    }

    renderExplore() {
        const posts = this.stateManager.get('posts');
        
        return `
            <div class="feed-container">
                <div class="feed-header">
                    <h2>Explore</h2>
                </div>

                <div class="trending-topics">
                    <h3>Trending</h3>
                    <div class="trends-list">
                        ${this.renderTrends()}
                    </div>
                </div>

                <div class="posts-feed">
                    ${posts.slice(0, 20).map(post => app.postManager.renderPost(post)).join('')}
                </div>
            </div>
        `;
    }

    renderBookmarks() {
        const user = this.stateManager.get('currentUser');
        if (!user) return this.renderLoginPrompt();

        const bookmarks = this.stateManager.get('bookmarks')
            .filter(b => b.userId === user.id)
            .map(b => this.stateManager.get('posts').find(p => p.id === b.postId))
            .filter(p => p);

        return `
            <div class="feed-container">
                <div class="feed-header">
                    <h2>Bookmarks</h2>
                </div>

                <div class="posts-feed">
                    ${bookmarks.length > 0 ?
                        bookmarks.map(post => app.postManager.renderPost(post)).join('') :
                        '<div class="empty-state">No bookmarks yet</div>'
                    }
                </div>
            </div>
        `;
    }

    renderCreatePostBox() {
        const user = this.stateManager.get('currentUser');
        
        return `
            <div class="create-post-box">
                <img src="${user.avatar}" alt="${user.name}" class="avatar">
                <div class="create-post-input">
                    <textarea placeholder="What's happening?" id="quickPost"></textarea>
                    <div class="post-actions">
                        <div class="post-tools">
                            <button class="tool-btn"><i class="fas fa-image"></i></button>
                            <button class="tool-btn"><i class="fas fa-gift"></i></button>
                            <button class="tool-btn"><i class="fas fa-chart-bar"></i></button>
                        </div>
                        <button class="btn btn-primary" onclick="app.feedManager.quickPost()">
                            Post
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderTrends() {
        const trends = this.stateManager.updateTrends();
        
        return trends.map(trend => `
            <div class="trend-item" onclick="app.feedManager.search('${trend.name}')">
                <div class="trend-category">Trending</div>
                <div class="trend-name">${trend.name}</div>
                <div class="trend-count">${trend.count} posts</div>
            </div>
        `).join('');
    }

    renderEmptyFeed() {
        return `
            <div class="empty-feed">
                <i class="fas fa-newspaper"></i>
                <h3>No posts yet</h3>
                <p>When people post, you'll see them here</p>
                <button class="btn btn-primary" onclick="app.feedManager.exploreMore()">
                    Explore
                </button>
            </div>
        `;
    }

    renderLoginPrompt() {
        return `
            <div class="login-prompt">
                <i class="fas fa-user"></i>
                <h3>Join the conversation</h3>
                <p>Login to see what's happening</p>
                <button class="btn btn-primary" onclick="app.showAuthModal()">
                    Login
                </button>
            </div>
        `;
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.refreshFeed();
    }

    refreshFeed() {
        const feedContainer = document.getElementById('postsFeed');
        if (!feedContainer) return;

        const user = this.stateManager.get('currentUser');
        let posts = this.stateManager.getFeedPosts(user?.id);

        if (this.currentFilter === 'following' && user) {
            const following = this.stateManager.getFollowing(user.id);
            posts = posts.filter(p => following.includes(p.userId));
        }

        feedContainer.innerHTML = posts.length > 0 ?
            posts.map(post => app.postManager.renderPost(post)).join('') :
            this.renderEmptyFeed();
    }

    quickPost() {
        const content = document.getElementById('quickPost').value;
        if (!content.trim()) return;

        const user = this.stateManager.get('currentUser');
        const post = {
            userId: user.id,
            content: content.trim(),
            image: null
        };

        this.stateManager.addPost(post);
        document.getElementById('quickPost').value = '';
        this.refreshFeed();

        this.eventBus.emit('notification', {
            message: 'Post created!',
            type: 'success'
        });
    }

    search(query) {
        if (!query) {
            this.refreshFeed();
            return;
        }

        const posts = this.stateManager.searchPosts(query);
        const users = this.stateManager.searchUsers(query);

        const feedContainer = document.getElementById('postsFeed');
        if (feedContainer) {
            feedContainer.innerHTML = `
                <div class="search-results-header">
                    <h3>Search results for "${query}"</h3>
                    ${users.length > 0 ? `
                        <div class="user-results">
                            <h4>People</h4>
                            ${users.map(user => `
                                <div class="user-result" onclick="app.userManager.viewProfile('${user.username}')">
                                    <img src="${user.avatar}" alt="${user.name}" class="avatar-small">
                                    <div>
                                        <div class="user-name">${user.name}</div>
                                        <div class="user-handle">@${user.username}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <h4>Posts</h4>
                </div>
                ${posts.length > 0 ?
                    posts.map(post => app.postManager.renderPost(post)).join('') :
                    '<div class="no-results">No posts found</div>'
                }
            `;
        }
    }

    exploreMore() {
        this.navigateTo('explore');
    }
}