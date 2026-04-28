class RoomList {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render(rooms, currentRoomId) {
        if (!rooms || rooms.length === 0) return '<div class="empty-state">No rooms available</div>';
        
        return rooms.map(room => `
            <div class="room-item ${room.id === currentRoomId ? 'active' : ''}" data-room-id="${room.id}">
                <div class="room-icon">${room.icon || '#'}</div>
                <div class="room-info">
                    <div class="room-name"># ${room.name}</div>
                    <div class="room-preview">${room.members.length} members</div>
                </div>
            </div>
        `).join('');
    }

    attachEvents(container) {
        container.querySelectorAll('.room-item').forEach(item => {
            item.onclick = () => {
                const roomId = item.dataset.roomId;
                this.eventBus.emit('room:select', roomId);
            };
        });
    }
}

window.RoomList = RoomList;