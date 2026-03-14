export class CommentManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    showComments(postId) {
        const commentsSection = document.getElementById(`comments-${postId}`);
        const isVisible = commentsSection.style.display !== 'none';
        
        if (isVisible) {
            commentsSection.style.display = 'none';
        } else {
            commentsSection.style.display = 'block';
            this.loadComments(postId);
        }
    }

    loadComments(postId) {
        const comments = this.stateManager.getPostComments(postId);
        const user = this.stateManager.get('currentUser');
        
        const commentsSection = document.getElementById(`comments-${postId}`);
        
        commentsSection.innerHTML = `
            ${user ? `
                <div class="comment-form">
                    <img src="${user.avatar}" alt="${user.name}" class="avatar">
                    <div class="comment-input-wrapper">
                        <input type="text" id="comment-${postId}" placeholder="Add a comment...">
                        <button onclick="app.commentManager.addComment('${postId}')">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            ` : ''}
            
            <div class="comments-list">
                ${comments.map(comment => this.renderComment(comment)).join('')}
            </div>
        `;
    }

    renderComment(comment) {
        const user = this.stateManager.getUser(comment.userId);
        const timeAgo = app.postManager.getTimeAgo(comment.createdAt);
        const currentUser = this.stateManager.get('currentUser');

        return `
            <div class="comment-item" data-id="${comment.id}">
                <img src="${user.avatar}" alt="${user.name}" class="comment-avatar">
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">${user.name}</span>
                        <span class="comment-handle">@${user.username}</span>
                        <span class="comment-time">${timeAgo}</span>
                    </div>
                    <div class="comment-text">${comment.content}</div>
                    <div class="comment-actions">
                        <button class="comment-action" onclick="app.commentManager.likeComment('${comment.id}')">
                            <i class="fas fa-heart ${comment.isLiked ? 'liked' : ''}"></i>
                            ${comment.likes > 0 ? comment.likes : ''}
                        </button>
                        <button class="comment-action" onclick="app.commentManager.replyToComment('${comment.id}')">
                            <i class="fas fa-reply"></i>
                        </button>
                        ${currentUser?.id === user.id ? `
                            <button class="comment-action" onclick="app.commentManager.deleteComment('${comment.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    addComment(postId) {
        const user = this.stateManager.get('currentUser');
        if (!user) {
            this.eventBus.emit('notification', {
                message: 'Please login to comment',
                type: 'error'
            });
            return;
        }

        const input = document.getElementById(`comment-${postId}`);
        const content = input.value.trim();

        if (!content) return;

        const comment = {
            userId: user.id,
            postId: postId,
            content: content
        };

        this.stateManager.addComment(comment);
        
        input.value = '';
        this.loadComments(postId);

        this.eventBus.emit('notification', {
            message: 'Comment added',
            type: 'success'
        });
    }

    deleteComment(commentId) {
        if (confirm('Delete this comment?')) {
            this.stateManager.deleteComment(commentId);
            
            this.eventBus.emit('notification', {
                message: 'Comment deleted',
                type: 'success'
            });
        }
    }

    likeComment(commentId) {
        // Implement comment likes
    }

    replyToComment(commentId) {
        // Implement comment replies
    }
}