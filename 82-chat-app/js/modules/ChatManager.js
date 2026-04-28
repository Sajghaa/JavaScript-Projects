class ChatManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupEmojiPicker();
        this.setupSidebar();
    }

    setupEventListeners() {
        document.getElementById('roomInfoBtn').onclick = () => this.showRoomDetails();
        document.getElementById('closeSidebarBtn').onclick = () => this.closeSidebar();
        document.getElementById('emojiBtn').onclick = (e) => this.toggleEmojiPicker(e);
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#emojiBtn') && !e.target.closest('.emoji-picker')) {
                document.getElementById('emojiPicker').style.display = 'none';
            }
        });
    }

    setupEmojiPicker() {
        const picker = document.getElementById('emojiPicker');
        const emojis = picker.querySelectorAll('.emoji-list span');
        emojis.forEach(emoji => {
            emoji.onclick = () => {
                const input = document.getElementById('messageInput');
                input.value += emoji.textContent;
                input.focus();
                picker.style.display = 'none';
            };
        });
    }

    toggleEmojiPicker(e) {
        e.stopPropagation();
        const picker = document.getElementById('emojiPicker');
        picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
    }

    showRoomDetails() {
        const roomId = this.stateManager.get('currentRoom');
        const room = this.stateManager.get('rooms').find(r => r.id === roomId);
        document.getElementById('roomInfoBtn').click();
    }

    closeSidebar() {
        document.getElementById('rightSidebar').classList.remove('open');
    }

    setupSidebar() {
        const sidebar = document.getElementById('rightSidebar');
        if (sidebar) {
            sidebar.classList.remove('open');
        }
    }
}

window.ChatManager = ChatManager;