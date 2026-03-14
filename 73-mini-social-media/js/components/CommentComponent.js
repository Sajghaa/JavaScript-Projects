export class CommentComponent {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render(comment, options = {}) {
        const user = this.stateManager.getUser(comment.userId);
        const currentUser = this.stateManager.get('currentUser');
        const { nested = false, showReplies = true } = options;

        if (!user) return '';

        const timeAgo = this.getTimeAgo(comment.createdAt);
        const replies = this.stateManager.get('comments').filter(c => c.parentId === comment.id);
        const hasReplies = replies.length > 0;

        return `
            <div class="comment-item ${nested ? 'nested-comment' : ''}" data-comment-id="${comment.id}">
                <div class="comment-main">
                    <img src="${user.avatar}" alt="${user.name}" class="comment-avatar" 
                         onclick="app.userManager.viewProfile('${user.username}')">
                    
                    <div class="comment-content">
                        <div class="comment-header">
                            <span class="comment-author" 
                                  onclick="app.userManager.viewProfile('${user.username}')">
                                ${user.name}
                            </span>
                            ${user.verified ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
                            <span class="comment-handle">@${user.username}</span>
                            <span class="comment-time" title="${new Date(comment.createdAt).toLocaleString()}">
                                ${timeAgo}
                            </span>
                        </div>
                        
                        <div class="comment-text">${this.linkify(comment.content)}</div>
                        
                        <div class="comment-actions">
                            <button class="comment-action like-action ${comment.isLiked ? 'liked' : ''}" 
                                    onclick="app.commentManager.likeComment('${comment.id}')">
                                <i class="fas ${comment.isLiked ? 'fa-heart' : 'fa-heart'}"></i>
                                <span>${comment.likes || 0}</span>
                            </button>
                            
                            <button class="comment-action reply-action" 
                                    onclick="app.commentManager.showReplyForm('${comment.id}')">
                                <i class="fas fa-reply"></i>
                                <span>Reply</span>
                            </button>
                            
                            ${currentUser?.id === user.id ? `
                                <button class="comment-action delete-action" 
                                        onclick="app.commentManager.deleteComment('${comment.id}')">
                                    <i class="fas fa-trash"></i>
                                    <span>Delete</span>
                                </button>
                            ` : ''}
                            
                            <button class="comment-action share-action" 
                                    onclick="app.commentManager.shareComment('${comment.id}')">
                                <i class="fas fa-share"></i>
                                <span>Share</span>
                            </button>
                        </div>
                        
                        <div id="reply-form-${comment.id}" class="reply-form" style="display: none;">
                            <div class="reply-input-wrapper">
                                <img src="${currentUser?.avatar || ''}" alt="" class="mini-avatar">
                                <input type="text" id="reply-input-${comment.id}" 
                                       placeholder="Write a reply..." 
                                       onkeypress="if(event.key === 'Enter') app.commentManager.addReply('${comment.id}')">
                                <button onclick="app.commentManager.addReply('${comment.id}')">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                        
                        ${showReplies && hasReplies ? `
                            <div class="comment-replies">
                                <button class="show-replies-btn" 
                                        onclick="app.commentManager.toggleReplies('${comment.id}')">
                                    <i class="fas fa-chevron-down"></i>
                                    Show ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}
                                </button>
                                <div id="replies-${comment.id}" class="replies-container" style="display: none;">
                                    ${replies.map(reply => this.render(reply, { nested: true, showReplies: false })).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <button class="comment-menu-btn" onclick="app.commentManager.showCommentMenu('${comment.id}')">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderForm(postId, parentId = null) {
        const currentUser = this.stateManager.get('currentUser');
        if (!currentUser) return '';

        return `
            <div class="comment-form ${parentId ? 'reply-form' : ''}" data-post-id="${postId}" data-parent-id="${parentId || ''}">
                <img src="${currentUser.avatar}" alt="${currentUser.name}" class="avatar">
                <div class="comment-input-group">
                    <div class="input-wrapper">
                        <textarea 
                            id="comment-${postId}-${parentId || 'main'}" 
                            placeholder="${parentId ? 'Write a reply...' : 'Add a comment...'}" 
                            rows="1"
                            oninput="this.style.height = ''; this.style.height = this.scrollHeight + 'px'"
                        ></textarea>
                        
                        <div class="comment-tools">
                            <button class="tool-btn" title="Add emoji" 
                                    onclick="app.commentManager.openEmojiPicker('${postId}', '${parentId || ''}')">
                                <i class="far fa-smile"></i>
                            </button>
                            <button class="tool-btn" title="Attach image" 
                                    onclick="document.getElementById('comment-image-${postId}-${parentId || 'main'}').click()">
                                <i class="fas fa-image"></i>
                            </button>
                            <input type="file" id="comment-image-${postId}-${parentId || 'main'}" 
                                   accept="image/*" style="display: none;"
                                   onchange="app.commentManager.attachImage(event, '${postId}', '${parentId || ''}')">
                        </div>
                    </div>
                    
                    <div id="comment-preview-${postId}-${parentId || 'main'}" class="image-preview" style="display: none;"></div>
                    
                    <div class="comment-actions">
                        <button class="btn btn-primary" onclick="app.commentManager.submitComment('${postId}', '${parentId || ''}')">
                            <i class="fas fa-paper-plane"></i>
                            ${parentId ? 'Reply' : 'Comment'}
                        </button>
                        ${parentId ? `
                            <button class="btn btn-text" onclick="app.commentManager.cancelReply('${postId}')">
                                Cancel
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderSkeleton() {
        return `
            <div class="comment-item skeleton">
                <div class="skeleton-avatar"></div>
                <div class="skeleton-content">
                    <div class="skeleton-line" style="width: 150px;"></div>
                    <div class="skeleton-line" style="width: 200px;"></div>
                    <div class="skeleton-line" style="width: 100px;"></div>
                </div>
            </div>
        `;
    }

    renderEmpty(postId) {
        return `
            <div class="empty-comments">
                <i class="far fa-comment-dots"></i>
                <h4>No comments yet</h4>
                <p>Be the first to share your thoughts!</p>
                <button class="btn btn-primary" onclick="app.commentManager.focusCommentForm('${postId}')">
                    Add a comment
                </button>
            </div>
        `;
    }

    renderLoadMore(commentId, page) {
        return `
            <div class="load-more-replies">
                <button class="btn btn-text" onclick="app.commentManager.loadMoreReplies('${commentId}', ${page + 1})">
                    <i class="fas fa-sync-alt"></i>
                    Load more replies
                </button>
            </div>
        `;
    }

    linkify(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        text = text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');
        
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