export class UserManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    showLoginModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'loginModal';
        modal.innerHTML = this.renderLoginModal();
        
        document.body.appendChild(modal);
        
        // Close handlers
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    renderLoginModal() {
        return `
            <div class="modal-content small">
                <div class="modal-header">
                    <h2>Login / Register</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="auth-tabs">
                        <button class="auth-tab active" data-tab="login">Login</button>
                        <button class="auth-tab" data-tab="register">Register</button>
                    </div>
                    
                    <div id="loginForm" class="auth-form active">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="loginEmail" placeholder="your@email.com">
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" id="loginPassword" placeholder="••••••••">
                        </div>
                        <button class="btn btn-primary btn-block" onclick="app.userManager.login()">
                            Login
                        </button>
                    </div>
                    
                    <div id="registerForm" class="auth-form">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" id="registerName" placeholder="John Doe">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="registerEmail" placeholder="your@email.com">
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" id="registerPassword" placeholder="••••••••">
                        </div>
                        <div class="form-group">
                            <label>Confirm Password</label>
                            <input type="password" id="registerConfirm" placeholder="••••••••">
                        </div>
                        <button class="btn btn-primary btn-block" onclick="app.userManager.register()">
                            Register
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    login() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            this.eventBus.emit('notification', {
                message: 'Please fill in all fields',
                type: 'error'
            });
            return;
        }

        const user = this.stateManager.login(email, password);
        
        document.getElementById('loginModal')?.remove();
        
        this.eventBus.emit('notification', {
            message: `Welcome back, ${user.name}!`,
            type: 'success'
        });
        
        this.updateUserUI();
    }

    register() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirm = document.getElementById('registerConfirm').value;
        
        if (!name || !email || !password || !confirm) {
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

        // Simulate registration
        const user = {
            id: 'user_' + Date.now(),
            name,
            email,
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
        };
        
        this.stateManager.set('currentUser', user);
        
        document.getElementById('loginModal')?.remove();
        
        this.eventBus.emit('notification', {
            message: `Welcome, ${name}!`,
            type: 'success'
        });
        
        this.updateUserUI();
    }

    logout() {
        this.stateManager.logout();
        
        this.eventBus.emit('notification', {
            message: 'Logged out successfully',
            type: 'info'
        });
        
        this.updateUserUI();
    }

    updateUserUI() {
        const user = this.stateManager.get('currentUser');
        
        // Update any user-related UI elements
        const cartBtn = document.getElementById('cartBtn');
        
        if (user) {
            // Add user menu to header
            if (!document.getElementById('userMenu')) {
                const userMenu = document.createElement('div');
                userMenu.id = 'userMenu';
                userMenu.className = 'user-menu';
                userMenu.innerHTML = `
                    <img src="${user.avatar}" alt="${user.name}" class="user-avatar">
                    <span>${user.name}</span>
                    <button onclick="app.userManager.logout()">Logout</button>
                `;
                cartBtn.parentNode.insertBefore(userMenu, cartBtn);
            }
        } else {
            // Remove user menu
            document.getElementById('userMenu')?.remove();
        }
    }

    getOrderHistory() {
        const user = this.stateManager.get('currentUser');
        if (!user) return [];
        
        return this.stateManager.getUserOrders();
    }
}