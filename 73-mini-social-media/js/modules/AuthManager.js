export class AuthManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    login() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        if (!username || !password) {
            this.eventBus.emit('notification', {
                message: 'Please fill in all fields',
                type: 'error'
            });
            return;
        }

        // Find user
        const users = this.stateManager.get('users');
        const user = users.find(u => 
            u.username === username || u.email === username
        );

        if (!user) {
            this.eventBus.emit('notification', {
                message: 'User not found',
                type: 'error'
            });
            return;
        }

        // In real app, verify password hash
        // For demo, we'll just check if password matches
        if (user.password !== password) {
            this.eventBus.emit('notification', {
                message: 'Invalid password',
                type: 'error'
            });
            return;
        }

        // Set current user
        this.stateManager.set('currentUser', user);
        
        // Close modal
        document.getElementById('authModal').classList.remove('active');
        
        // Emit event
        this.eventBus.emit('auth:login', user);
        
        this.eventBus.emit('notification', {
            message: `Welcome back, ${user.name}!`,
            type: 'success'
        });
    }

    signup() {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const username = document.getElementById('signupUsername').value;
        const password = document.getElementById('signupPassword').value;
        const confirm = document.getElementById('signupConfirm').value;

        // Validate
        if (!name || !email || !username || !password || !confirm) {
            this.eventBus.emit('notification', {
                message: 'Please fill in all fields',
                type: 'error'
            });
            return;
        }

        if (password !== confirm) {
            this.eventBus.emit('notification', {
                message: 'Passwords do not match',
                type: 'error'
            });
            return;
        }

        if (password.length < 6) {
            this.eventBus.emit('notification', {
                message: 'Password must be at least 6 characters',
                type: 'error'
            });
            return;
        }

        // Check if username exists
        const users = this.stateManager.get('users');
        if (users.some(u => u.username === username)) {
            this.eventBus.emit('notification', {
                message: 'Username already taken',
                type: 'error'
            });
            return;
        }

        if (users.some(u => u.email === email)) {
            this.eventBus.emit('notification', {
                message: 'Email already registered',
                type: 'error'
            });
            return;
        }

        // Create new user
        const newUser = {
            id: `user_${Date.now()}`,
            name,
            email,
            username,
            password, // In real app, hash this!
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200`,
            bio: '',
            location: '',
            website: '',
            followers: 0,
            following: 0,
            posts: 0,
            verified: false,
            createdAt: new Date().toISOString()
        };

        // Add to users
        this.stateManager.addUser(newUser);

        // Set as current user
        this.stateManager.set('currentUser', newUser);

        // Close modal
        document.getElementById('authModal').classList.remove('active');

        // Emit event
        this.eventBus.emit('auth:login', newUser);

        this.eventBus.emit('notification', {
            message: `Welcome to MiniSocial, ${name}!`,
            type: 'success'
        });
    }

    logout() {
        this.stateManager.set('currentUser', null);
        this.eventBus.emit('auth:logout');
        this.eventBus.emit('notification', {
            message: 'Logged out successfully',
            type: 'info'
        });
    }

    updateProfile(updates) {
        const user = this.stateManager.get('currentUser');
        if (!user) return;

        this.stateManager.updateUser(user.id, updates);
        
        this.eventBus.emit('notification', {
            message: 'Profile updated successfully',
            type: 'success'
        });
    }

    changePassword(oldPassword, newPassword) {
        const user = this.stateManager.get('currentUser');
        if (!user) return;

        if (user.password !== oldPassword) {
            this.eventBus.emit('notification', {
                message: 'Current password is incorrect',
                type: 'error'
            });
            return;
        }

        this.stateManager.updateUser(user.id, { password: newPassword });
        
        this.eventBus.emit('notification', {
            message: 'Password changed successfully',
            type: 'success'
        });
    }
}