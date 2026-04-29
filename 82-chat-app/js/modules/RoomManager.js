class RoomManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.roomList = new RoomList(stateManager, eventBus);
        this.init();
    }

    init() {
        this.renderRooms();
        document.getElementById('createRoomBtn').onclick = () => this.showCreateRoomModal();
        this.eventBus.on('room:select', (roomId) => this.switchRoom(roomId));
        this.setupModalClose();
    }

    renderRooms() {
        const container = document.getElementById('roomsList');
        const rooms = this.stateManager.get('rooms');
        const currentRoom = this.stateManager.get('currentRoom');
        
        container.innerHTML = this.roomList.render(rooms, currentRoom);
        this.roomList.attachEvents(container);
    }

    switchRoom(roomId) {
        this.stateManager.set('currentRoom', roomId);
        this.renderRooms();
        this.eventBus.emit('room:changed', roomId);
        this.updateRoomInfo();
    }

    updateRoomInfo() {
        const roomId = this.stateManager.get('currentRoom');
        const room = this.stateManager.get('rooms').find(r => r.id === roomId);
        const iconEl = document.getElementById('roomIcon');
        
        if (room && iconEl) {
            document.getElementById('roomName').textContent = room.name;
            document.getElementById('roomMemberCount').textContent = `${room.members.length} members`;
            // Use textContent for emoji icons, className for FontAwesome icons
            if (room.icon && room.icon.length <= 2) {
                iconEl.className = '';
                iconEl.textContent = room.icon;
            } else {
                iconEl.className = room.icon || 'fas fa-hashtag';
                iconEl.textContent = '';
            }
        }
    }

    showCreateRoomModal() {
        const modal = document.getElementById('createRoomModal');
        document.getElementById('roomNameInput').value = '';
        document.getElementById('roomDescription').value = '';
        modal.classList.add('active');
        
        document.getElementById('confirmCreateRoomBtn').onclick = () => this.createRoom();
    }

    createRoom() {
        const name = document.getElementById('roomNameInput').value.trim();
        const description = document.getElementById('roomDescription').value;
        
        if (!name) {
            this.eventBus.emit('toast', { message: 'Please enter a room name', type: 'error' });
            return;
        }
        
        const newRoom = this.stateManager.addRoom({
            name: name.toLowerCase(),
            description: description,
            icon: '💬',
            members: [this.stateManager.get('currentUser')?.id]
        });
        
        this.renderRooms();
        this.switchRoom(newRoom.id);
        this.closeModal();
        this.eventBus.emit('toast', { message: `Channel #${name} created!`, type: 'success' });
    }

    closeModal() {
        const modal = document.getElementById('createRoomModal');
        if (modal) modal.classList.remove('active');
    }
     setupModalClose() {
        const modal = document.getElementById('createRoomModal');
        if (modal) {
            const closeBtn = modal.querySelector('.close-modal');
            if (closeBtn) {
                closeBtn.onclick = () => this.closeModal();
            }
            // Click outside to close
            modal.onclick = (e) => {
                if (e.target === modal) this.closeModal();
            };
        }
        
        const userModal = document.getElementById('switchUserModal');
        if (userModal) {
            const closeBtn = userModal.querySelector('.close-modal');
            if (closeBtn) {
                closeBtn.onclick = () => userModal.classList.remove('active');
            }
            userModal.onclick = (e) => {
                if (e.target === userModal) userModal.classList.remove('active');
            };
        }
    }
    
}

window.RoomManager = RoomManager;