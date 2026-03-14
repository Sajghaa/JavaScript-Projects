export class UserProfile {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.currentTab = 'posts';
    }

    render(user, isOwnProfile = false) {
        if (!user) return this.renderNotFound();

        const posts = this.stateManager.getUserPosts(user.id);
        const followers = this.stateManager.getFollowers(user.id);
        const following = this.stateManager.getFollowing(user.id);
        const isFollowing = this.stateManager.get('currentUser') ? 
            this.stateManager.isFollowing(this.stateManager.get('currentUser').id, user.id) : false;

        return `
            <div class="profile-container">
                ${this.renderCover(user)}
                
                <div class="profile-info-section">
                    ${this.renderAvatar(user)}
                    ${this.renderActions(user, isOwnProfile, isFollowing)}
                    ${this.renderDetails(user)}
                    ${this.renderStats(user, followers.length, following.length, posts.length)}
                </div>
                
                ${this.renderTabs()}
                
                <div class="profile-content">
                    <div id="profileTabContent" class="tab-content">
                        ${this.renderTabContent(user)}
                    </div>
                </div>
            </div>
        `;
    }

    renderCover(user) {
        return `
            <div class="profile-cover">
                ${user.coverImage ? `
                    <img src="${user.coverImage}" alt="Cover" class="cover-image">
                ` : `
                    <div class="cover-placeholder"></div>
                `}
            </div>
        `;
    }

    renderAvatar(user) {
        return `
            <div class="profile-avatar-container">
                <img src="${user.avatar}" alt="${user.name}" class="profile-avatar">
                <div class="avatar-badge ${user.verified ? 'verified' : ''}">
                    ${user.verified ? '<i class="fas fa-check-circle"></i>' : ''}
                </div>
            </div>
        `;
    }

    renderActions(user, isOwnProfile, isFollowing) {
        return `
            <div class="profile-actions">
                ${isOwnProfile ? `
                    <button class="edit-profile-btn" onclick="app.userProfile.showEditProfile()">
                        <i class="fas fa-edit"></i>
                        Edit Profile
                    </button>
                    <button class="profile-menu-btn" onclick="app.userProfile.showProfileMenu()">
                        <i class="fas fa-cog"></i>
                    </button>
                ` : `
                    <button class="follow-btn ${isFollowing ? 'following' : ''}" 
                            onclick="app.userManager.toggleFollow('${user.id}')">
                        ${isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <button class="message-btn" onclick="app.userManager.sendMessage('${user.id}')">
                        <i class="fas fa-envelope"></i>
                    </button>
                    <button class="profile-menu-btn" onclick="app.userProfile.showUserMenu('${user.id}')">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                `}
            </div>
        `;
    }

    renderDetails(user) {
        return `
            <div class="profile-details">
                <h1 class="profile-name">${user.name}</h1>
                <div class="profile-handle">@${user.username}</div>
                
                <div class="profile-bio">${user.bio || 'No bio yet.'}</div>
                
                <div class="profile-meta">
                    ${user.location ? `
                        <span class="meta-item">
                            <i class="fas fa-map-marker-alt"></i>
                            ${user.location}
                        </span>
                    ` : ''}
                    
                    ${user.website ? `
                        <span class="meta-item">
                            <i class="fas fa-link"></i>
                            <a href="${user.website}" target="_blank" rel="noopener">
                                ${user.website.replace(/^https?:\/\//, '')}
                            </a>
                        </span>
                    ` : ''}
                    
                    <span class="meta-item">
                        <i class="far fa-calendar"></i>
                        Joined ${new Date(user.createdAt).toLocaleDateString('en-US', { 
                            month: 'long', 
                            year: 'numeric' 
                        })}
                    </span>
                    
                    ${user.birthday ? `
                        <span class="meta-item">
                            <i class="fas fa-birthday-cake"></i>
                            Born ${new Date(user.birthday).toLocaleDateString('en-US', { 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </span>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderStats(user, followersCount, followingCount, postsCount) {
        return `
            <div class="profile-stats">
                <div class="stat-item" onclick="app.userProfile.showFollowers('${user.id}')">
                    <span class="stat-number">${followersCount}</span>
                    <span class="stat-label">Followers</span>
                </div>
                
                <div class="stat-item" onclick="app.userProfile.showFollowing('${user.id}')">
                    <span class="stat-number">${followingCount}</span>
                    <span class="stat-label">Following</span>
                </div>
                
                <div class="stat-item">
                    <span class="stat-number">${postsCount}</span>
                    <span class="stat-label">Posts</span>
                </div>
                
                <div class="stat-item" onclick="app.userProfile.showLikes('${user.id}')">
                    <span class="stat-number">${user.totalLikes || 0}</span>
                    <span class="stat-label">Likes</span>
                </div>
            </div>
        `;
    }

    renderTabs() {
        return `
            <div class="profile-tabs">
                <button class="profile-tab ${this.currentTab === 'posts' ? 'active' : ''}" 
                        onclick="app.userProfile.switchTab('posts')">
                    <i class="fas fa-list-ul"></i>
                    Posts
                </button>
                
                <button class="profile-tab ${this.currentTab === 'replies' ? 'active' : ''}" 
                        onclick="app.userProfile.switchTab('replies')">
                    <i class="fas fa-reply"></i>
                    Replies
                </button>
                
                <button class="profile-tab ${this.currentTab === 'media' ? 'active' : ''}" 
                        onclick="app.userProfile.switchTab('media')">
                    <i class="fas fa-image"></i>
                    Media
                </button>
                
                <button class="profile-tab ${this.currentTab === 'likes' ? 'active' : ''}" 
                        onclick="app.userProfile.switchTab('likes')">
                    <i class="fas fa-heart"></i>
                    Likes
                </button>
                
                <button class="profile-tab ${this.currentTab === 'highlights' ? 'active' : ''}" 
                        onclick="app.userProfile.switchTab('highlights')">
                    <i class="fas fa-star"></i>
                    Highlights
                </button>
            </div>
        `;
    }

    renderTabContent(user) {
        switch(this.currentTab) {
            case 'posts':
                return this.renderPostsTab(user);
            case 'replies':
                return this.renderRepliesTab(user);
            case 'media':
                return this.renderMediaTab(user);
            case 'likes':
                return this.renderLikesTab(user);
            case 'highlights':
                return this.renderHighlightsTab(user);
            default:
                return this.renderPostsTab(user);
        }
    }

    renderPostsTab(user) {
        const posts = this.stateManager.getUserPosts(user.id);
        
        return `
            <div class="posts-grid">
                ${posts.length > 0 ? 
                    posts.map(post => app.postComponent.render(post, { compact: true })).join('') :
                    this.renderEmptyState('No posts yet', 'When you post, they\'ll appear here.')
                }
            </div>
        `;
    }

    renderRepliesTab(user) {
        const replies = this.stateManager.get('comments')
            .filter(c => c.userId === user.id);
        
        return `
            <div class="replies-list">
                ${replies.length > 0 ?
                    replies.map(reply => app.commentComponent.render(reply)).join('') :
                    this.renderEmptyState('No replies yet', 'Replies to posts will appear here.')
                }
            </div>
        `;
    }

    renderMediaTab(user) {
        const mediaPosts = this.stateManager.getUserPosts(user.id)
            .filter(p => p.image);
        
        return `
            <div class="media-grid">
                ${mediaPosts.length > 0 ?
                    mediaPosts.map(post => `
                        <div class="media-item" onclick="app.postManager.viewPost('${post.id}')">
                            <img src="${post.image}" alt="Post media" loading="lazy">
                        </div>
                    `).join('') :
                    this.renderEmptyState('No media yet', 'Photos and videos will appear here.')
                }
            </div>
        `;
    }

    renderLikesTab(user) {
        const likedPostIds = this.stateManager.get('likes')
            .filter(l => l.userId === user.id)
            .map(l => l.postId);
        const likedPosts = this.stateManager.get('posts')
            .filter(p => likedPostIds.includes(p.id));
        
        return `
            <div class="likes-grid">
                ${likedPosts.length > 0 ?
                    likedPosts.map(post => app.postComponent.render(post, { compact: true })).join('') :
                    this.renderEmptyState('No likes yet', 'Posts you like will appear here.')
                }
            </div>
        `;
    }

    renderHighlightsTab(user) {
        const highlights = user.highlights || [];
        
        return `
            <div class="highlights-grid">
                ${highlights.length > 0 ?
                    highlights.map(highlight => `
                        <div class="highlight-item" onclick="app.userProfile.viewHighlight('${highlight.id}')">
                            <img src="${highlight.coverImage}" alt="${highlight.title}" class="highlight-cover">
                            <div class="highlight-info">
                                <h4>${highlight.title}</h4>
                                <span>${highlight.posts.length} posts</span>
                            </div>
                        </div>
                    `).join('') :
                    this.renderEmptyState('No highlights yet', 'Your best moments will appear here.')
                }
            </div>
        `;
    }

    renderEmptyState(title, message) {
        return `
            <div class="empty-state">
                <i class="far fa-folder-open"></i>
                <h3>${title}</h3>
                <p>${message}</p>
            </div>
        `;
    }

    renderNotFound() {
        return `
            <div class="not-found-container">
                <i class="fas fa-user-slash"></i>
                <h2>User not found</h2>
                <p>The profile you're looking for doesn't exist or has been removed.</p>
                <button class="btn btn-primary" onclick="app.navigateTo('home')">
                    Go Home
                </button>
            </div>
        `;
    }

    renderEditProfileForm(user) {
        return `
            <div class="edit-profile-form">
                <h3>Edit Profile</h3>
                
                <div class="form-group">
                    <label>Profile Photo</label>
                    <div class="avatar-upload">
                        <img src="${user.avatar}" alt="Current avatar" id="avatarPreview">
                        <input type="file" id="avatarUpload" accept="image/*" 
                               onchange="app.userProfile.previewAvatar(event)">
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Cover Photo</label>
                    <div class="cover-upload">
                        <div id="coverPreview" class="cover-preview" 
                             style="background-image: url('${user.coverImage || ''}')"></div>
                        <input type="file" id="coverUpload" accept="image/*" 
                               onchange="app.userProfile.previewCover(event)">
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" id="editName" value="${user.name}" maxlength="50">
                </div>
                
                <div class="form-group">
                    <label>Bio</label>
                    <textarea id="editBio" rows="3" maxlength="160">${user.bio || ''}</textarea>
                    <span class="char-count" id="bioCount">${(user.bio || '').length}/160</span>
                </div>
                
                <div class="form-group">
                    <label>Location</label>
                    <input type="text" id="editLocation" value="${user.location || ''}" maxlength="30">
                </div>
                
                <div class="form-group">
                    <label>Website</label>
                    <input type="url" id="editWebsite" value="${user.website || ''}" 
                           placeholder="https://...">
                </div>
                
                <div class="form-group">
                    <label>Birthday</label>
                    <input type="date" id="editBirthday" value="${user.birthday || ''}">
                </div>
                
                <div class="form-actions">
                    <button class="btn btn-secondary" onclick="app.userProfile.cancelEdit()">
                        Cancel
                    </button>
                    <button class="btn btn-primary" onclick="app.userProfile.saveProfile()">
                        Save Changes
                    </button>
                </div>
            </div>
        `;
    }

    renderFollowersList(userId) {
        const followerIds = this.stateManager.getFollowers(userId);
        const followers = this.stateManager.getUsers(followerIds);
        
        return this.renderUserList(followers, 'Followers');
    }

    renderFollowingList(userId) {
        const followingIds = this.stateManager.getFollowing(userId);
        const following = this.stateManager.getUsers(followingIds);
        
        return this.renderUserList(following, 'Following');
    }

    renderUserList(users, title) {
        return `
            <div class="user-list-modal">
                <h3>${title}</h3>
                <div class="user-list">
                    ${users.length > 0 ? 
                        users.map(user => `
                            <div class="user-list-item" onclick="app.userManager.viewProfile('${user.username}')">
                                <img src="${user.avatar}" alt="${user.name}" class="user-list-avatar">
                                <div class="user-list-info">
                                    <div class="user-list-name">${user.name}</div>
                                    <div class="user-list-handle">@${user.username}</div>
                                </div>
                                ${this.stateManager.get('currentUser')?.id !== user.id ? `
                                    <button class="follow-btn ${this.stateManager.isFollowing(
                                        this.stateManager.get('currentUser')?.id, user.id) ? 'following' : ''}" 
                                            onclick="event.stopPropagation(); app.userManager.toggleFollow('${user.id}')">
                                        ${this.stateManager.isFollowing(
                                            this.stateManager.get('currentUser')?.id, user.id) ? 'Following' : 'Follow'}
                                    </button>
                                ` : ''}
                            </div>
                        `).join('') :
                        `<div class="empty-list">No users to show</div>`
                    }
                </div>
            </div>
        `;
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.profile-tab').forEach(t => {
            t.classList.toggle('active', t.textContent.toLowerCase().includes(tab));
        });
        
        // Update content
        const user = this.stateManager.get('currentUser');
        document.getElementById('profileTabContent').innerHTML = this.renderTabContent(user);
    }

    showEditProfile() {
        const user = this.stateManager.get('currentUser');
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'editProfileModal';
        modal.innerHTML = this.renderEditProfileForm(user);
        
        document.body.appendChild(modal);
        
        // Add bio counter
        document.getElementById('editBio').addEventListener('input', (e) => {
            document.getElementById('bioCount').textContent = `${e.target.value.length}/160`;
        });
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    saveProfile() {
        const updates = {
            name: document.getElementById('editName').value,
            bio: document.getElementById('editBio').value,
            location: document.getElementById('editLocation').value,
            website: document.getElementById('editWebsite').value,
            birthday: document.getElementById('editBirthday').value,
            avatar: this.newAvatar || document.getElementById('avatarPreview').src,
            coverImage: this.newCover || document.getElementById('coverPreview').style.backgroundImage.slice(5, -2)
        };

        this.stateManager.updateUser(this.stateManager.get('currentUser').id, updates);
        
        document.getElementById('editProfileModal').remove();
        
        this.eventBus.emit('notification', {
            message: 'Profile updated successfully!',
            type: 'success'
        });

        // Refresh profile view
        this.render(this.stateManager.get('currentUser'), true);
    }

    previewAvatar(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('avatarPreview').src = e.target.result;
                this.newAvatar = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    previewCover(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('coverPreview').style.backgroundImage = `url('${e.target.result}')`;
                this.newCover = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    cancelEdit() {
        document.getElementById('editProfileModal').remove();
    }

    showFollowers(userId) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3>Followers</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    ${this.renderFollowersList(userId)}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
    }

    showFollowing(userId) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3>Following</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    ${this.renderFollowingList(userId)}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
    }

    showLikes(userId) {
        // Implement likes modal
    }

    showProfileMenu() {
        // Implement profile settings menu
    }

    showUserMenu(userId) {
        // Implement user actions menu
    }

    viewHighlight(highlightId) {
        // Implement highlight viewer
    }
}