export class UserManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    renderProfile(username = null) {
        const currentUser = this.stateManager.get('currentUser');
        const user = username ? 
            this.stateManager.get('users').find(u => u.username === username) : 
            currentUser;

        if (!user) {
            return this.renderNotFound();
        }

        const isOwnProfile = currentUser?.id === user.id;
        const isFollowing = currentUser ? 
            this.stateManager.isFollowing(currentUser.id, user.id) : false;

        const posts = this.stateManager.getUserPosts(user.id);
        const followers = this.stateManager.getFollowers(user.id);
        const following = this.stateManager.getFollowing(user.id);

        return `
            <div class="profile-container">
                <div class="profile-header">
                    <div class="profile-cover"></div>
                    
                    <div class="profile-info">
                        <div class="profile-avatar-container">
                            <img src="${user.avatar}" alt="${user.name}" class="profile-avatar">
                        </div>
                        
                        <div class="profile-actions">
                            ${isOwnProfile ? `
                                <button class="edit-profile-btn" onclick="app.userManager.editProfile()">
                                    <i class="fas fa-edit"></i> Edit Profile
                                </button>
                            ` : `
                                <button class="follow-btn ${isFollowing ? 'following' : ''}" 
                                        onclick="app.userManager.toggleFollow('${user.id}')">
                                    ${isFollowing ? 'Following' : 'Follow'}
                                </button>
                            `}
                            <button class="profile-menu-btn">
                                <i class="fas fa-ellipsis-h"></i>
                            </button>
                        </div>

                        <div class="profile-details">
                            <h1 class="profile-name">${user.name}</h1>
                            <div class="profile-handle">@${user.username}</div>
                            
                            <div class="profile-bio">${user.bio || 'No bio yet.'}</div>
                            
                            <div class="profile-meta">
                                ${user.location ? `
                                    <span><i class="fas fa-map-marker-alt"></i> ${user.location}</span>
                                ` : ''}
                                ${user.website ? `
                                    <span><i class="fas fa-link"></i> 
                                        <a href="${user.website}" target="_blank">${user.website}</a>
                                    </span>
                                ` : ''}
                                <span><i class="far fa-calendar"></i> 
                                    Joined ${new Date(user.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div class="profile-stats">
                            <a href="#" class="stat-link" onclick="app.userManager.showFollowers('${user.id}')">
                                <span class="stat-number">${user.followers}</span>
                                <span class="stat-label">Followers</span>
                            </a>
                            <a href="#" class="stat-link" onclick="app.userManager.showFollowing('${user.id}')">
                                <span class="stat-number">${user.following}</span>
                                <span class="stat-label">Following</span>
                            </a>
                            <span class="stat-item">
                                <span class="stat-number">${user.posts}</span>
                                <span class="stat-label">Posts</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div class="profile-tabs">
                    <button class="profile-tab active" data-tab="posts">Posts</button>
                    <button class="profile-tab" data-tab="replies">Replies</button>
                    <button class="profile-tab" data-tab="media">Media</button>
                    ${isOwnProfile ? `
                        <button class="profile-tab" data-tab="likes">Likes</button>
                    ` : ''}
                </div>

                <div class="profile-content">
                    <div class="posts-feed">
                        ${posts.length > 0 ?
                            posts.map(post => app.postManager.renderPost(post)).join('') :
                            '<div class="empty-state">No posts yet</div>'
                        }
                    </div>
                </div>
            </div>
        `;
    }

    viewProfile(username) {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = this.renderProfile(username);
        
        // Update URL without page reload
        history.pushState({}, '', `/profile/${username}`);
    }

    toggleFollow(userId) {
        const currentUser = this.stateManager.get('currentUser');
        if (!currentUser) {
            this.eventBus.emit('notification', {
                message: 'Please login to follow users',
                type: 'error'
            });
            return;
        }

        const isFollowing = this.stateManager.toggleFollow(currentUser.id, userId);
        
        // Update follow button
        const followBtn = document.querySelector('.follow-btn');
        if (followBtn) {
            followBtn.textContent = isFollowing ? 'Following' : 'Follow';
            followBtn.classList.toggle('following', isFollowing);
        }

        this.eventBus.emit('notification', {
            message: isFollowing ? 'User followed' : 'User unfollowed',
            type: 'success'
        });
    }

    editProfile() {
        const user = this.stateManager.get('currentUser');
        if (!user) return;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'editProfileModal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Edit Profile</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" id="editName" value="${user.name}">
                    </div>
                    <div class="form-group">
                        <label>Bio</label>
                        <textarea id="editBio" rows="3">${user.bio || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Location</label>
                        <input type="text" id="editLocation" value="${user.location || ''}">
                    </div>
                    <div class="form-group">
                        <label>Website</label>
                        <input type="url" id="editWebsite" value="${user.website || ''}">
                    </div>
                    <div class="form-group">
                        <label>Avatar URL</label>
                        <input type="url" id="editAvatar" value="${user.avatar || ''}">
                    </div>
                    <button class="btn btn-primary" onclick="app.userManager.saveProfile()">
                        Save Changes
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
    }

    saveProfile() {
        const updates = {
            name: document.getElementById('editName').value,
            bio: document.getElementById('editBio').value,
            location: document.getElementById('editLocation').value,
            website: document.getElementById('editWebsite').value,
            avatar: document.getElementById('editAvatar').value
        };

        this.stateManager.updateUser(this.stateManager.get('currentUser').id, updates);
        
        document.getElementById('editProfileModal').remove();
        
        this.eventBus.emit('notification', {
            message: 'Profile updated successfully',
            type: 'success'
        });

        // Refresh profile
        this.viewProfile();
    }

    showFollowers(userId) {
        const followers = this.stateManager.getFollowers(userId);
        const users = this.stateManager.getUsers(followers);
        
        this.showUserList(users, 'Followers');
    }

    showFollowing(userId) {
        const following = this.stateManager.getFollowing(userId);
        const users = this.stateManager.getUsers(following);
        
        this.showUserList(users, 'Following');
    }

    showUserList(users, title) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    ${users.length > 0 ? users.map(user => `
                        <div class="suggestion-item" onclick="app.userManager.viewProfile('${user.username}')">
                            <img src="${user.avatar}" alt="${user.name}" class="suggestion-avatar">
                            <div class="suggestion-info">
                                <div class="suggestion-name">${user.name}</div>
                                <div class="suggestion-handle">@${user.username}</div>
                            </div>
                        </div>
                    `).join('') : '<p class="empty-state">No users found</p>'}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
    }

    renderNotFound() {
        return `
            <div class="not-found">
                <i class="fas fa-user-slash"></i>
                <h2>User not found</h2>
                <p>The profile you're looking for doesn't exist.</p>
                <button class="btn btn-primary" onclick="app.navigateTo('home')">
                    Go Home
                </button>
            </div>
        `;
    }
}