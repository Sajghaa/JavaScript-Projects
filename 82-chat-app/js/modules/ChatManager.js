// ChatManager.js - Main chat orchestrator (FIXED)
class ChatManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupEmojiPicker();
        this.setupSidebarClose();
    }

    setupEventListeners() {
        const roomInfoBtn = document.getElementById('roomInfoBtn');
        const closeSidebarBtn = document.getElementById('closeSidebarBtn');
        
        if (roomInfoBtn) {
            roomInfoBtn.onclick = () => this.showRoomDetails();
        }
        
        if (closeSidebarBtn) {
            closeSidebarBtn.onclick = () => this.closeSidebar();
        }
        
        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('rightSidebar');
            const roomInfoBtn = document.getElementById('roomInfoBtn');
            
            if (sidebar && sidebar.classList.contains('open')) {
                if (!sidebar.contains(e.target) && e.target !== roomInfoBtn && !roomInfoBtn?.contains(e.target)) {
                    this.closeSidebar();
                }
            }
        });
        
        // Emoji button
        const emojiBtn = document.getElementById('emojiBtn');
        if (emojiBtn) {
            emojiBtn.onclick = (e) => this.toggleEmojiPicker(e);
        }
        
        // Close emoji picker on outside click
        document.addEventListener('click', (e) => {
            const picker = document.getElementById('emojiPicker');
            const emojiBtn = document.getElementById('emojiBtn');
            if (picker && emojiBtn) {
                if (!picker.contains(e.target) && e.target !== emojiBtn && !emojiBtn.contains(e.target)) {
                    picker.style.display = 'none';
                }
            }
        });
    }

    setupSidebarClose() {
        // Add overlay for better UX
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
            overlay.onclick = () => this.closeSidebar();
        }
    }

    setupEmojiPicker() {
        const picker = document.getElementById('emojiPicker');
        if (!picker) return;
        
        const emojis = picker.querySelectorAll('.emoji-list span');
        emojis.forEach(emoji => {
            emoji.onclick = () => {
                const input = document.getElementById('messageInput');
                if (input) {
                    input.value += emoji.textContent;
                    input.focus();
                    picker.style.display = 'none';
                }
            };
        });
    }

    toggleEmojiPicker(e) {
        e.stopPropagation();
        const picker = document.getElementById('emojiPicker');
        if (picker) {
            picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
        }
    }

    showRoomDetails() {
        const roomId = this.stateManager.get('currentRoom');
        const room = this.stateManager.get('rooms').find(r => r.id === roomId);
        const users = this.stateManager.get('users');
        const currentUser = this.stateManager.get('currentUser');
        
        // Get members with their details
        const members = users.filter(u => room?.members.includes(u.id));
        
        const details = document.getElementById('roomDetails');
        if (details) {
            details.innerHTML = `
                <div class="room-info-card">
                    <div class="room-icon-large">${room?.icon || '#'}</div>
                    <h4># ${room?.name}</h4>
                    <p class="room-description">${room?.description || 'No description provided'}</p>
                    <div class="room-meta">
                        <span><i class="fas fa-calendar"></i> Created: ${new Date(room?.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div class="member-list">
                        <strong><i class="fas fa-users"></i> Members (${members.length})</strong>
                        ${members.map(m => `
                            <div class="member-item" data-user-id="${m.id}">
                                <img src="${m.avatar}" alt="${m.name}" class="member-avatar">
                                <div class="member-info">
                                    <div class="member-name">${m.name}</div>
                                    <div class="member-status ${m.status}">${m.status === 'online' ? 'Online' : 'Offline'}</div>
                                </div>
                                ${currentUser?.id !== m.id ? `<button class="dm-btn" data-user-id="${m.id}"><i class="fas fa-comment"></i></button>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            // Add DM button functionality
            details.querySelectorAll('.dm-btn').forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    const userId = btn.dataset.userId;
                    this.eventBus.emit('user:select', userId);
                    this.closeSidebar();
                };
            });
        }
        
        const sidebar = document.getElementById('rightSidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.add('active');
    }

    closeSidebar() {
        const sidebar = document.getElementById('rightSidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
    }
}

window.ChatManager = ChatManager;