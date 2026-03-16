export class BoardManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    createBoard(title, color) {
        if (!title.trim()) {
            this.eventBus.emit('error', { message: 'Board title is required' });
            return;
        }

        const board = this.stateManager.createBoard({
            title: title.trim(),
            color: color || '#0079bf'
        });

        this.eventBus.emit('board:created', board);
        return board;
    }

    updateBoard(boardId, updates) {
        this.stateManager.updateBoard(boardId, updates);
        this.eventBus.emit('board:updated', { boardId, updates });
    }

    deleteBoard(boardId) {
        if (confirm('Are you sure you want to delete this board? All lists and cards will be lost.')) {
            this.stateManager.deleteBoard(boardId);
            this.eventBus.emit('board:deleted', boardId);
        }
    }

    showBoardMenu(boardId) {
        const board = this.stateManager.getBoard(boardId);
        // Implement board menu
    }

    exportBoard(boardId) {
        this.stateManager.exportBoard(boardId);
        this.eventBus.emit('notification', {
            message: 'Board exported successfully',
            type: 'success'
        });
    }

    importBoard(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const boardId = this.stateManager.importBoard(e.target.result);
            if (boardId) {
                this.eventBus.emit('board:imported', boardId);
                this.eventBus.emit('notification', {
                    message: 'Board imported successfully',
                    type: 'success'
                });
            }
        };
        reader.readAsText(file);
    }

    duplicateBoard(boardId) {
        const board = this.stateManager.getBoard(boardId);
        const lists = this.stateManager.getLists(boardId);
        const cards = lists.flatMap(list => this.stateManager.getCards(list.id));

        const newBoard = this.stateManager.createBoard({
            title: `${board.title} (Copy)`,
            color: board.color
        });

        // Create lists with new IDs
        const listIdMap = {};
        lists.forEach(list => {
            const newList = this.stateManager.createList({
                boardId: newBoard.id,
                title: list.title,
                position: list.position
            });
            listIdMap[list.id] = newList.id;
        });

        // Create cards
        cards.forEach(card => {
            this.stateManager.createCard({
                listId: listIdMap[card.listId],
                title: card.title,
                description: card.description,
                labels: card.labels,
                dueDate: card.dueDate,
                checklist: card.checklist ? JSON.parse(JSON.stringify(card.checklist)) : []
            });
        });

        this.eventBus.emit('board:duplicated', newBoard);
        this.eventBus.emit('notification', {
            message: 'Board duplicated successfully',
            type: 'success'
        });

        return newBoard;
    }

    archiveBoard(boardId) {
        // Implement archive functionality
    }

    addMember(boardId, userId) {
        const board = this.stateManager.getBoard(boardId);
        if (!board.members) board.members = [];
        
        if (!board.members.includes(userId)) {
            board.members.push(userId);
            this.stateManager.updateBoard(boardId, { members: board.members });
            
            this.eventBus.emit('board:member_added', { boardId, userId });
        }
    }

    removeMember(boardId, userId) {
        const board = this.stateManager.getBoard(boardId);
        if (board.members) {
            board.members = board.members.filter(id => id !== userId);
            this.stateManager.updateBoard(boardId, { members: board.members });
            
            this.eventBus.emit('board:member_removed', { boardId, userId });
        }
    }
}