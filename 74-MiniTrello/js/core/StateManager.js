export class StateManager {
    constructor() {
        this.state = {
            boards: [],
            currentBoard: null,
            lists: [],
            cards: [],
            activities: [],
            labels: [
                { id: 'label1', color: '#61bd4f', name: 'Green' },
                { id: 'label2', color: '#f2d600', name: 'Yellow' },
                { id: 'label3', color: '#ff9f1a', name: 'Orange' },
                { id: 'label4', color: '#eb5a46', name: 'Red' },
                { id: 'label5', color: '#c377e0', name: 'Purple' },
                { id: 'label6', color: '#0079bf', name: 'Blue' }
            ],
            users: [
                {
                    id: 'user1',
                    name: 'John Doe',
                    avatar: 'JD',
                    email: 'john@example.com'
                },
                {
                    id: 'user2',
                    name: 'Jane Smith',
                    avatar: 'JS',
                    email: 'jane@example.com'
                }
            ],
            ui: {
                theme: 'light',
                sidebarOpen: true,
                currentModal: null
            }
        };

        this.listeners = new Map();
        this.history = {
            past: [],
            future: []
        };

        this.loadFromStorage();
        this.initializeSampleData();
    }

    // Initialize sample data for demo
    initializeSampleData() {
        if (this.state.boards.length === 0) {
            // Create sample board
            const boardId = this.generateId();
            const board = {
                id: boardId,
                title: 'Project Management',
                color: '#0079bf',
                createdAt: new Date().toISOString(),
                members: ['user1', 'user2']
            };
            this.state.boards.push(board);

            // Create sample lists
            const lists = [
                { id: this.generateId(), boardId, title: 'To Do', position: 0 },
                { id: this.generateId(), boardId, title: 'In Progress', position: 1 },
                { id: this.generateId(), boardId, title: 'Done', position: 2 }
            ];
            this.state.lists.push(...lists);

            // Create sample cards
            const cards = [
                {
                    id: this.generateId(),
                    listId: lists[0].id,
                    title: 'Design homepage',
                    description: 'Create wireframes and mockups for the new homepage',
                    position: 0,
                    labels: ['label1', 'label6'],
                    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
                    checklist: [
                        { id: this.generateId(), text: 'Create wireframes', completed: true },
                        { id: this.generateId(), text: 'Design mobile version', completed: false },
                        { id: this.generateId(), text: 'Get feedback', completed: false }
                    ],
                    attachments: [],
                    members: ['user1'],
                    createdAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    listId: lists[0].id,
                    title: 'Implement authentication',
                    description: 'Set up JWT authentication for the API',
                    position: 1,
                    labels: ['label3'],
                    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
                    checklist: [
                        { id: this.generateId(), text: 'Set up JWT', completed: false },
                        { id: this.generateId(), text: 'Create login page', completed: false }
                    ],
                    attachments: [],
                    members: ['user2'],
                    createdAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    listId: lists[1].id,
                    title: 'API Integration',
                    description: 'Connect frontend with backend APIs',
                    position: 0,
                    labels: ['label2'],
                    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
                    checklist: [
                        { id: this.generateId(), text: 'Create API client', completed: true },
                        { id: this.generateId(), text: 'Test endpoints', completed: false }
                    ],
                    attachments: [],
                    members: ['user1', 'user2'],
                    createdAt: new Date().toISOString()
                }
            ];
            this.state.cards.push(...cards);

            // Set current board
            this.state.currentBoard = boardId;

            // Add sample activities
            this.addActivity({
                userId: 'user1',
                type: 'board_created',
                boardId: boardId,
                text: 'created this board'
            });
        }
    }

    // Get state
    get(path) {
        if (!path) return this.state;
        return path.split('.').reduce((obj, key) => obj?.[key], this.state);
    }

    // Set state
    set(path, value, recordHistory = true) {
        const oldValue = this.get(path);
        
        if (recordHistory) {
            this.recordHistory();
        }
        
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => obj[key], this.state);
        target[lastKey] = value;
        
        this.notifyListeners(path, value, oldValue);
        this.saveToStorage();
    }

    // Subscribe to changes
    subscribe(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, new Set());
        }
        this.listeners.get(path).add(callback);
        
        return () => {
            this.listeners.get(path)?.delete(callback);
        };
    }

    // Notify listeners
    notifyListeners(path, newValue, oldValue) {
        if (this.listeners.has(path)) {
            this.listeners.get(path).forEach(callback => {
                callback(newValue, oldValue);
            });
        }
        
        if (this.listeners.has('*')) {
            this.listeners.get('*').forEach(callback => {
                callback({ path, newValue, oldValue });
            });
        }
    }

    // Record history for undo/redo
    recordHistory() {
        this.history.past.push(JSON.stringify(this.state));
        if (this.history.past.length > 50) {
            this.history.past.shift();
        }
        this.history.future = [];
    }

    undo() {
        if (this.history.past.length === 0) return false;
        
        const previous = JSON.parse(this.history.past.pop());
        this.history.future.push(JSON.stringify(this.state));
        this.state = previous;
        this.notifyListeners('*', null, null);
        this.saveToStorage();
        return true;
    }

    redo() {
        if (this.history.future.length === 0) return false;
        
        const next = JSON.parse(this.history.future.pop());
        this.history.past.push(JSON.stringify(this.state));
        this.state = next;
        this.notifyListeners('*', null, null);
        this.saveToStorage();
        return true;
    }

    // Board operations
    createBoard(board) {
        const newBoard = {
            id: this.generateId(),
            createdAt: new Date().toISOString(),
            lists: [],
            members: [this.state.currentUser?.id || 'user1'],
            ...board
        };
        
        this.state.boards.push(newBoard);
        this.saveToStorage();
        this.notifyListeners('boards', this.state.boards);
        
        this.addActivity({
            userId: this.state.currentUser?.id || 'user1',
            type: 'board_created',
            boardId: newBoard.id,
            text: `created board "${board.title}"`
        });
        
        return newBoard;
    }

    updateBoard(boardId, updates) {
        const index = this.state.boards.findIndex(b => b.id === boardId);
        if (index !== -1) {
            this.state.boards[index] = { ...this.state.boards[index], ...updates };
            this.saveToStorage();
            this.notifyListeners('boards', this.state.boards);
            
            this.addActivity({
                userId: this.state.currentUser?.id || 'user1',
                type: 'board_updated',
                boardId: boardId,
                text: `updated board`
            });
        }
    }

    deleteBoard(boardId) {
        // Delete all lists and cards in the board
        this.state.lists = this.state.lists.filter(l => l.boardId !== boardId);
        this.state.cards = this.state.cards.filter(c => {
            const list = this.state.lists.find(l => l.id === c.listId);
            return list?.boardId !== boardId;
        });
        
        // Delete the board
        this.state.boards = this.state.boards.filter(b => b.id !== boardId);
        
        if (this.state.currentBoard === boardId) {
            this.state.currentBoard = this.state.boards[0]?.id || null;
        }
        
        this.saveToStorage();
        this.notifyListeners('boards', this.state.boards);
        
        this.addActivity({
            userId: this.state.currentUser?.id || 'user1',
            type: 'board_deleted',
            text: `deleted board`
        });
    }

    // List operations
    createList(list) {
        const newList = {
            id: this.generateId(),
            position: this.getLists(list.boardId).length,
            cards: [],
            ...list
        };
        
        this.state.lists.push(newList);
        this.saveToStorage();
        this.notifyListeners('lists', this.state.lists);
        
        this.addActivity({
            userId: this.state.currentUser?.id || 'user1',
            type: 'list_created',
            boardId: list.boardId,
            listId: newList.id,
            text: `created list "${list.title}"`
        });
        
        return newList;
    }

    updateList(listId, updates) {
        const index = this.state.lists.findIndex(l => l.id === listId);
        if (index !== -1) {
            this.state.lists[index] = { ...this.state.lists[index], ...updates };
            this.saveToStorage();
            this.notifyListeners('lists', this.state.lists);
            
            this.addActivity({
                userId: this.state.currentUser?.id || 'user1',
                type: 'list_updated',
                listId: listId,
                text: `updated list`
            });
        }
    }

    deleteList(listId) {
        // Delete all cards in the list
        this.state.cards = this.state.cards.filter(c => c.listId !== listId);
        
        // Delete the list
        this.state.lists = this.state.lists.filter(l => l.id !== listId);
        
        // Reorder remaining lists
        this.reorderLists();
        
        this.saveToStorage();
        this.notifyListeners('lists', this.state.lists);
        
        this.addActivity({
            userId: this.state.currentUser?.id || 'user1',
            type: 'list_deleted',
            text: `deleted list`
        });
    }

    // Card operations
    createCard(card) {
        const newCard = {
            id: this.generateId(),
            position: this.getCards(card.listId).length,
            createdAt: new Date().toISOString(),
            comments: [],
            ...card
        };
        
        this.state.cards.push(newCard);
        this.saveToStorage();
        this.notifyListeners('cards', this.state.cards);
        
        this.addActivity({
            userId: this.state.currentUser?.id || 'user1',
            type: 'card_created',
            listId: card.listId,
            cardId: newCard.id,
            text: `created card "${card.title}"`
        });
        
        return newCard;
    }

    updateCard(cardId, updates) {
        const index = this.state.cards.findIndex(c => c.id === cardId);
        if (index !== -1) {
            this.state.cards[index] = { ...this.state.cards[index], ...updates };
            this.saveToStorage();
            this.notifyListeners('cards', this.state.cards);
            
            this.addActivity({
                userId: this.state.currentUser?.id || 'user1',
                type: 'card_updated',
                cardId: cardId,
                text: `updated card`
            });
        }
    }

    deleteCard(cardId) {
        const card = this.getCard(cardId);
        this.state.cards = this.state.cards.filter(c => c.id !== cardId);
        
        // Reorder remaining cards in the list
        if (card) {
            this.reorderCards(card.listId);
        }
        
        this.saveToStorage();
        this.notifyListeners('cards', this.state.cards);
        
        this.addActivity({
            userId: this.state.currentUser?.id || 'user1',
            type: 'card_deleted',
            text: `deleted card`
        });
    }

    // Move card between lists
    moveCard(cardId, sourceListId, targetListId, newPosition) {
        const card = this.getCard(cardId);
        if (!card) return;

        // Remove from source list
        const sourceCards = this.getCards(sourceListId).filter(c => c.id !== cardId);
        
        // Add to target list
        card.listId = targetListId;
        card.position = newPosition;
        
        // Update positions in target list
        const targetCards = this.getCards(targetListId);
        targetCards.splice(newPosition, 0, card);
        
        // Reorder both lists
        targetCards.forEach((c, index) => {
            c.position = index;
        });
        
        sourceCards.forEach((c, index) => {
            c.position = index;
        });
        
        this.saveToStorage();
        this.notifyListeners('cards', this.state.cards);
        
        this.addActivity({
            userId: this.state.currentUser?.id || 'user1',
            type: 'card_moved',
            cardId: cardId,
            text: `moved card "${card.title}"`
        });
    }

    // Copy card
    copyCard(cardId) {
        const original = this.getCard(cardId);
        if (!original) return;

        const copy = {
            ...original,
            id: this.generateId(),
            title: `${original.title} (Copy)`,
            position: this.getCards(original.listId).length,
            createdAt: new Date().toISOString(),
            comments: []
        };

        this.state.cards.push(copy);
        this.saveToStorage();
        this.notifyListeners('cards', this.state.cards);
        
        this.addActivity({
            userId: this.state.currentUser?.id || 'user1',
            type: 'card_copied',
            cardId: copy.id,
            text: `copied card "${copy.title}"`
        });

        return copy;
    }

    // Checklist operations
    addChecklistItem(cardId, item) {
        const card = this.getCard(cardId);
        if (!card) return;

        if (!card.checklist) card.checklist = [];
        
        const newItem = {
            id: this.generateId(),
            text: item.text,
            completed: false
        };
        
        card.checklist.push(newItem);
        this.updateCard(cardId, { checklist: card.checklist });
        
        return newItem;
    }

    updateChecklistItem(cardId, itemId, updates) {
        const card = this.getCard(cardId);
        if (!card || !card.checklist) return;

        const index = card.checklist.findIndex(i => i.id === itemId);
        if (index !== -1) {
            card.checklist[index] = { ...card.checklist[index], ...updates };
            this.updateCard(cardId, { checklist: card.checklist });
        }
    }

    deleteChecklistItem(cardId, itemId) {
        const card = this.getCard(cardId);
        if (!card || !card.checklist) return;

        card.checklist = card.checklist.filter(i => i.id !== itemId);
        this.updateCard(cardId, { checklist: card.checklist });
    }

    // Label operations
    addLabelToCard(cardId, labelId) {
        const card = this.getCard(cardId);
        if (!card) return;

        if (!card.labels) card.labels = [];
        if (!card.labels.includes(labelId)) {
            card.labels.push(labelId);
            this.updateCard(cardId, { labels: card.labels });
        }
    }

    removeLabelFromCard(cardId, labelId) {
        const card = this.getCard(cardId);
        if (!card || !card.labels) return;

        card.labels = card.labels.filter(l => l !== labelId);
        this.updateCard(cardId, { labels: card.labels });
    }

    // Attachment operations
    addAttachment(cardId, file) {
        const card = this.getCard(cardId);
        if (!card) return;

        if (!card.attachments) card.attachments = [];
        
        const attachment = {
            id: this.generateId(),
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file),
            uploadedAt: new Date().toISOString()
        };
        
        card.attachments.push(attachment);
        this.updateCard(cardId, { attachments: card.attachments });
        
        return attachment;
    }

    removeAttachment(cardId, attachmentId) {
        const card = this.getCard(cardId);
        if (!card || !card.attachments) return;

        card.attachments = card.attachments.filter(a => a.id !== attachmentId);
        this.updateCard(cardId, { attachments: card.attachments });
    }

    // Comment operations
    addComment(cardId, userId, text) {
        const card = this.getCard(cardId);
        if (!card) return;

        if (!card.comments) card.comments = [];
        
        const comment = {
            id: this.generateId(),
            userId: userId,
            text: text,
            createdAt: new Date().toISOString()
        };
        
        card.comments.push(comment);
        this.updateCard(cardId, { comments: card.comments });
        
        this.addActivity({
            userId: userId,
            type: 'comment_added',
            cardId: cardId,
            text: `commented on card`
        });
        
        return comment;
    }

    deleteComment(cardId, commentId) {
        const card = this.getCard(cardId);
        if (!card || !card.comments) return;

        card.comments = card.comments.filter(c => c.id !== commentId);
        this.updateCard(cardId, { comments: card.comments });
    }

    // Activity operations
    addActivity(activity) {
        const newActivity = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            ...activity
        };
        
        this.state.activities.unshift(newActivity);
        
        // Keep only last 50 activities
        if (this.state.activities.length > 50) {
            this.state.activities.pop();
        }
        
        this.notifyListeners('activities', this.state.activities);
        this.saveToStorage();
        
        return newActivity;
    }

    getBoardActivities(boardId) {
        return this.state.activities.filter(a => a.boardId === boardId);
    }

    getCardActivities(cardId) {
        return this.state.activities.filter(a => a.cardId === cardId);
    }

    // Helper methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getBoard(boardId) {
        return this.state.boards.find(b => b.id === boardId);
    }

    getLists(boardId) {
        return this.state.lists
            .filter(l => l.boardId === boardId)
            .sort((a, b) => a.position - b.position);
    }

    getList(listId) {
        return this.state.lists.find(l => l.id === listId);
    }

    getCards(listId) {
        return this.state.cards
            .filter(c => c.listId === listId)
            .sort((a, b) => a.position - b.position);
    }

    getCard(cardId) {
        return this.state.cards.find(c => c.id === cardId);
    }

    getUser(userId) {
        return this.state.users.find(u => u.id === userId);
    }

    getLabel(labelId) {
        return this.state.labels.find(l => l.id === labelId);
    }

    reorderLists() {
        const boardIds = [...new Set(this.state.lists.map(l => l.boardId))];
        boardIds.forEach(boardId => {
            const boardLists = this.state.lists
                .filter(l => l.boardId === boardId)
                .sort((a, b) => a.position - b.position);
            
            boardLists.forEach((list, index) => {
                list.position = index;
            });
        });
    }

    reorderCards(listId) {
        const cards = this.getCards(listId);
        cards.forEach((card, index) => {
            card.position = index;
        });
    }

    // Save to localStorage
    saveToStorage() {
        try {
            const data = {
                boards: this.state.boards,
                lists: this.state.lists,
                cards: this.state.cards,
                activities: this.state.activities,
                currentBoard: this.state.currentBoard
            };
            localStorage.setItem('trello_state', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    // Load from localStorage
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('trello_state');
            if (saved) {
                const data = JSON.parse(saved);
                this.state.boards = data.boards || [];
                this.state.lists = data.lists || [];
                this.state.cards = data.cards || [];
                this.state.activities = data.activities || [];
                this.state.currentBoard = data.currentBoard || null;
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }

    // Export board data
    exportBoard(boardId) {
        const board = this.getBoard(boardId);
        const lists = this.getLists(boardId);
        const cards = lists.flatMap(list => this.getCards(list.id));
        
        const exportData = {
            board,
            lists,
            cards,
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${board.title.replace(/\s+/g, '-').toLowerCase()}-backup.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Import board data
    importBoard(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Generate new IDs for imported data
            const newBoardId = this.generateId();
            const listIdMap = {};
            const cardIdMap = {};

            // Import board
            const newBoard = {
                ...data.board,
                id: newBoardId,
                createdAt: new Date().toISOString()
            };
            this.state.boards.push(newBoard);

            // Import lists
            data.lists.forEach(list => {
                const newListId = this.generateId();
                listIdMap[list.id] = newListId;
                
                this.state.lists.push({
                    ...list,
                    id: newListId,
                    boardId: newBoardId,
                    position: list.position
                });
            });

            // Import cards
            data.cards.forEach(card => {
                const newCardId = this.generateId();
                cardIdMap[card.id] = newCardId;
                
                this.state.cards.push({
                    ...card,
                    id: newCardId,
                    listId: listIdMap[card.listId],
                    position: card.position,
                    importedAt: new Date().toISOString()
                });
            });

            this.saveToStorage();
            this.notifyListeners('boards', this.state.boards);
            
            this.addActivity({
                userId: this.state.currentUser?.id || 'user1',
                type: 'board_imported',
                boardId: newBoardId,
                text: `imported board "${newBoard.title}"`
            });

            return newBoardId;
        } catch (error) {
            console.error('Error importing board:', error);
            return null;
        }
    }
}