export class PostComponent {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render(post, options = {}) {
        const user = this.stateManager.getUser(post.userId);
        const currentUser = this.stateManager.get('currentUser');
        const { showActions = true, showStats = true, compact = false } = options;

        if (!user) return '';

        const timeAgo = this.getTimeAgo(post.createdAt);
        
        return `
            <div class="post-card ${compact ? 'post-card-compact' : ''}" data-post-id="${post.id}">
                ${this.renderHeader(post, user, currentUser)}
                
                <div class="post-content">
                    <div class="post-text">${this.linkify(post.content)}</div>
                    ${post.image ? this.renderImage(post.image) : ''}
                    ${post.poll ? this.renderPoll(post.poll) : ''}
                </div>
                
                ${showStats ? this.renderStats(post) : ''}
                ${showActions ? this.renderActions(post, currentUser) : ''}
                
                <div id="comments-${post.id}" class="comments-section" style="display: none;"></div>
            </div>
        `;
    }

    renderHeader(post, user, currentUser) {
        return `
            <div class="post-header">
                <img src="${user.avatar}" alt="${user.name}" class="post-avatar" 
                     onclick="app.userManager.viewProfile('${user.username}')">
                <div class="post-user-info">
                    <div>
                        <span class="post-user-name" 
                              onclick="app.userManager.viewProfile('${user.username}')">
                            ${user.name}
                        </span>
                        ${user.verified ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
                        <span class="post-user-handle">@${user.username}</span>
                    </div>
                    <div class="post-time" title="${new Date(post.createdAt).toLocaleString()}">
                        ${timeAgo}
                    </div>
                </div>
                
                ${this.renderPostMenu(post, currentUser)}
            </div>
        `;
    }

    renderPostMenu(post, currentUser) {
        if (!currentUser) return '';

        return `
            <div class="post-menu dropdown">
                <button class="icon-btn" onclick="event.stopPropagation()">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="dropdown-content">
                    ${currentUser.id === post.userId ? `
                        <a href="#" onclick="app.postManager.deletePost('${post.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </a>
                        <a href="#" onclick="app.postManager.editPost('${post.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </a>
                        <a href="#" onclick="app.postManager.pinPost('${post.id}')">
                            <i class="fas fa-thumbtack"></i> Pin to profile
                        </a>
                    ` : `
                        <a href="#" onclick="app.userManager.reportPost('${post.id}')">
                            <i class="fas fa-flag"></i> Report
                        </a>
                        <a href="#" onclick="app.userManager.muteUser('${post.userId}')">
                            <i class="fas fa-volume-mute"></i> Mute user
                        </a>
                        <a href="#" onclick="app.userManager.blockUser('${post.userId}')">
                            <i class="fas fa-ban"></i> Block user
                        </a>
                    `}
                    <a href="#" onclick="app.postManager.sharePost('${post.id}')">
                        <i class="fas fa-share-alt"></i> Share
                    </a>
                    <a href="#" onclick="app.postManager.copyLink('${post.id}')">
                        <i class="fas fa-link"></i> Copy link
                    </a>
                    ${currentUser.id === post.userId ? '' : `
                        <a href="#" onclick="app.userManager.followUser('${post.userId}')">
                            <i class="fas fa-user-plus"></i> Follow @${user.username}
                        </a>
                    `}
                </div>
            </div>
        `;
    }

    renderImage(imageUrl) {
        return `
            <div class="post-media" onclick="app.postManager.openImage('${imageUrl}')">
                <img src="${imageUrl}" alt="Post media" loading="lazy">
            </div>
        `;
    }

    renderPoll(poll) {
        const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
        
        return `
            <div class="post-poll">
                ${poll.options.map(option => {
                    const percentage = totalVotes > 0 ? (option.votes / totalVotes * 100).toFixed(0) : 0;
                    return `
                        <div class="poll-option" onclick="app.postManager.votePoll('${poll.id}', '${option.id}')">
                            <div class="poll-option-text">${option.text}</div>
                            <div class="poll-option-bar" style="width: ${percentage}%"></div>
                            <div class="poll-option-stats">
                                <span>${option.votes} votes</span>
                                <span>${percentage}%</span>
                            </div>
                        </div>
                    `;
                }).join('')}
                <div class="poll-info">
                    <span>${totalVotes} votes</span>
                    <span>${this.getTimeRemaining(poll.expiresAt)}</span>
                </div>
            </div>
        `;
    }

    renderStats(post) {
        return `
            <div class="post-stats">
                <span class="stat-item" onclick="app.postManager.showLikes('${post.id}')">
                    <span class="stat-number">${post.likes || 0}</span>
                    <span>Likes</span>
                </span>
                <span class="stat-item" onclick="app.commentManager.showComments('${post.id}')">
                    <span class="stat-number">${post.comments || 0}</span>
                    <span>Comments</span>
                </span>
                <span class="stat-item" onclick="app.postManager.showRetweets('${post.id}')">
                    <span class="stat-number">${post.retweets || 0}</span>
                    <span>Retweets</span>
                </span>
                <span class="stat-item" onclick="app.postManager.showViews('${post.id}')">
                    <span class="stat-number">${post.views || 0}</span>
                    <span>Views</span>
                </span>
            </div>
        `;
    }

    renderActions(post, currentUser) {
        return `
            <div class="post-actions">
                <button class="action-btn like-btn ${post.isLiked ? 'liked' : ''}" 
                        onclick="app.postManager.likePost('${post.id}')"
                        title="${post.isLiked ? 'Unlike' : 'Like'}">
                    <i class="fas ${post.isLiked ? 'fa-heart' : 'fa-heart'}"></i>
                    <span class="count">${post.likes || 0}</span>
                </button>
                
                <button class="action-btn comment-btn" 
                        onclick="app.commentManager.showComments('${post.id}')"
                        title="Comment">
                    <i class="fas fa-comment"></i>
                    <span class="count">${post.comments || 0}</span>
                </button>
                
                <button class="action-btn retweet-btn ${post.isRetweeted ? 'retweeted' : ''}" 
                        onclick="app.postManager.retweet('${post.id}')"
                        title="${post.isRetweeted ? 'Undo retweet' : 'Retweet'}">
                    <i class="fas fa-retweet"></i>
                    <span class="count">${post.retweets || 0}</span>
                </button>
                
                <button class="action-btn bookmark-btn ${post.isBookmarked ? 'active' : ''}" 
                        onclick="app.postManager.bookmarkPost('${post.id}')"
                        title="${post.isBookmarked ? 'Remove bookmark' : 'Bookmark'}">
                    <i class="fas fa-bookmark"></i>
                </button>
                
                <button class="action-btn share-btn" 
                        onclick="app.postManager.sharePost('${post.id}')"
                        title="Share">
                    <i class="fas fa-share-alt"></i>
                </button>
            </div>
        `;
    }

    renderSkeleton() {
        return `
            <div class="post-card skeleton">
                <div class="post-header">
                    <div class="skeleton-avatar"></div>
                    <div class="skeleton-info">
                        <div class="skeleton-line" style="width: 120px;"></div>
                        <div class="skeleton-line" style="width: 80px;"></div>
                    </div>
                </div>
                <div class="skeleton-content">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line" style="width: 70%;"></div>
                </div>
                <div class="skeleton-actions">
                    <div class="skeleton-action"></div>
                    <div class="skeleton-action"></div>
                    <div class="skeleton-action"></div>
                    <div class="skeleton-action"></div>
                </div>
            </div>
        `;
    }

    linkify(text) {
        // Replace URLs with links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        text = text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener" class="post-link">$1</a>');
        
        // Replace hashtags with links
        const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
        text = text.replace(hashtagRegex, '<a href="#" onclick="app.feedManager.search(\'#$1\')" class="hashtag">#$1</a>');
        
        // Replace mentions with links
        const mentionRegex = /@([a-zA-Z0-9_]+)/g;
        text = text.replace(mentionRegex, '<a href="#" onclick="app.userManager.viewProfile(\'$1\')" class="mention">@$1</a>');
        
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

    getTimeRemaining(expiresAt) {
        const expiry = new Date(expiresAt);
        const now = new Date();
        const hours = Math.floor((expiry - now) / (1000 * 60 * 60));
        
        if (hours < 1) return 'Ending soon';
        if (hours < 24) return `${hours} hours remaining`;
        const days = Math.floor(hours / 24);
        return `${days} days remaining`;
    }
}