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
        
        if (room) {
            document.getElementById('roomName').textContent = room.name;
            document.getElementById('roomMemberCount').textContent = `${room.members.length} members`;
            document.getElementById('roomIcon').className = room.icon || 'fas fa-hashtag';
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

    showRoomDetails() {
        const roomId = this.stateManager.get('currentRoom');
        const room = this.stateManager.get('rooms').find(r => r.id === roomId);
        const users = this.stateManager.get('users');
        const members = users.filter(u => room?.members.includes(u.id));
        
        const sidebar = document.getElementById('rightSidebar');
        const details = document.getElementById('roomDetails');
        
        details.innerHTML = `
            <h4># ${room?.name}</h4>
            <p>${room?.description || 'No description'}</p>
            <div class="member-list">
                <strong>Members (${members.length})</strong>
                ${members.map(m => `
                    <div class="user-item">
                        <div class="user-avatar"><img src="${m.avatar}" alt="${m.name}"></div>
                        <div class="user-info">
                            <div class="user-name">${m.name}</div>
                            <div class="user-status-text">${m.status}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        sidebar.classList.add('open');
    }

    closeSidebar() {
        document.getElementById('rightSidebar').classList.remove('open');
    }

    closeModal() {
        document.getElementById('createRoomModal').classList.remove('active');
    }
}

window.RoomManager = RoomManager;