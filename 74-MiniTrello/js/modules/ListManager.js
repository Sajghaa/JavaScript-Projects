export class ListManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    showCreateListForm(boardId) {
        const container = document.getElementById('lists-container');
        const form = document.createElement('div');
        form.className = 'add-list-form-container';
        form.innerHTML = `
            <div class="add-list-form">
                <input type="text" id="new-list-title" placeholder="Enter list title..." autofocus>
                <div class="form-actions">
                    <button class="btn btn-primary" onclick="app.listManager.createList('${boardId}')">
                        Add List
                    </button>
                    <button class="icon-btn" onclick="this.closest('.add-list-form-container').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        
        const addListBtn = container.querySelector('.add-list');
        container.insertBefore(form, addListBtn);
    }

    createList(boardId) {
        const title = document.getElementById('new-list-title')?.value;
        
        if (!title?.trim()) {
            this.eventBus.emit('error', { message: 'List title is required' });
            return;
        }

        const list = this.stateManager.createList({
            boardId,
            title: title.trim()
        });

        // Remove the form
        const form = document.querySelector('.add-list-form-container');
        if (form) form.remove();

        this.eventBus.emit('list:created', list);
        return list;
    }

    cancelCreateList() {
        const form = document.querySelector('.add-list-form-container');
        if (form) form.remove();
    }

    showListMenu(listId) {
        const list = this.stateManager.getList(listId);
        const listElement = document.querySelector(`[data-list-id="${listId}"]`);
        
        const menu = document.createElement('div');
        menu.className = 'list-menu';
        menu.innerHTML = `
            <div class="list-menu-header">
                <h4>List Actions</h4>
                <button class="close-btn" onclick="this.closest('.list-menu').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="list-menu-items">
                <button class="menu-item" onclick="app.listManager.showEditForm('${listId}')">
                    <i class="fas fa-edit"></i> Rename List
                </button>
                
                <button class="menu-item" onclick="app.listManager.copyList('${listId}')">
                    <i class="fas fa-copy"></i> Copy List
                </button>
                
                <button class="menu-item" onclick="app.listManager.moveList('${listId}')">
                    <i class="fas fa-arrow-right"></i> Move List
                </button>
                
                <button class="menu-item" onclick="app.listManager.sortList('${listId}')">
                    <i class="fas fa-sort-amount-down"></i> Sort Cards
                </button>
                
                <hr>
                
                <button class="menu-item" onclick="app.listManager.archiveAllCards('${listId}')">
                    <i class="fas fa-archive"></i> Archive All Cards
                </button>
                
                <button class="menu-item delete" onclick="app.listManager.deleteList('${listId}')">
                    <i class="fas fa-trash"></i> Delete List
                </button>
            </div>
        `;
        
        listElement.appendChild(menu);
    }

    showEditForm(listId) {
        const list = this.stateManager.getList(listId);
        const listHeader = document.querySelector(`[data-list-id="${listId}"] .list-header`);
        
        const form = document.createElement('div');
        form.className = 'list-edit-form';
        form.innerHTML = `
            <input type="text" id="edit-list-title" value="${list.title}" autofocus>
            <div class="form-actions">
                <button class="btn btn-primary" onclick="app.listManager.updateList('${listId}')">
                    Save
                </button>
                <button class="btn btn-secondary" onclick="this.closest('.list-edit-form').remove()">
                    Cancel
                </button>
            </div>
        `;
        
        listHeader.style.display = 'none';
        listHeader.parentNode.insertBefore(form, listHeader.nextSibling);
    }

    updateList(listId) {
        const title = document.getElementById('edit-list-title')?.value;
        
        if (!title?.trim()) {
            this.eventBus.emit('error', { message: 'List title is required' });
            return;
        }

        this.stateManager.updateList(listId, { title: title.trim() });
        
        // Remove edit form
        const form = document.querySelector('.list-edit-form');
        if (form) form.remove();
        
        // Show header
        const listHeader = document.querySelector(`[data-list-id="${listId}"] .list-header`);
        if (listHeader) listHeader.style.display = 'flex';
        
        this.eventBus.emit('list:updated', listId);
    }

    deleteList(listId) {
        if (confirm('Are you sure you want to delete this list? All cards will be lost.')) {
            this.stateManager.deleteList(listId);
            
            // Remove list element
            const listElement = document.querySelector(`[data-list-id="${listId}"]`);
            if (listElement) listElement.remove();
            
            this.eventBus.emit('list:deleted', listId);
        }
    }

    copyList(listId) {
        const list = this.stateManager.getList(listId);
        const cards = this.stateManager.getCards(listId);

        const newList = this.stateManager.createList({
            boardId: list.boardId,
            title: `${list.title} (Copy)`,
            position: list.position + 1
        });

        // Copy cards
        cards.forEach(card => {
            this.stateManager.createCard({
                listId: newList.id,
                title: card.title,
                description: card.description,
                labels: card.labels ? [...card.labels] : [],
                dueDate: card.dueDate,
                checklist: card.checklist ? JSON.parse(JSON.stringify(card.checklist)) : []
            });
        });

        this.eventBus.emit('list:copied', newList);
        this.eventBus.emit('notification', {
            message: 'List copied successfully',
            type: 'success'
        });
    }

    moveList(listId) {
        // Implement move list functionality
    }

    sortList(listId) {
        // Implement sort options
    }

    archiveAllCards(listId) {
        if (confirm('Are you sure you want to archive all cards in this list?')) {
            const cards = this.stateManager.getCards(listId);
            cards.forEach(card => {
                this.stateManager.deleteCard(card.id);
            });
            
            this.eventBus.emit('list:cards_archived', listId);
            this.eventBus.emit('notification', {
                message: 'All cards archived',
                type: 'success'
            });
        }
    }

    sortByDate(listId, order) {
        const cards = this.stateManager.getCards(listId);
        cards.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return order === 'asc' ? dateA - dateB : dateB - dateA;
        });
        
        cards.forEach((card, index) => {
            card.position = index;
        });
        
        this.stateManager.notifyListeners('cards', this.stateManager.get('cards'));
        this.eventBus.emit('list:sorted', listId);
    }

    sortByName(listId, order) {
        const cards = this.stateManager.getCards(listId);
        cards.sort((a, b) => {
            const comparison = a.title.localeCompare(b.title);
            return order === 'asc' ? comparison : -comparison;
        });
        
        cards.forEach((card, index) => {
            card.position = index;
        });
        
        this.stateManager.notifyListeners('cards', this.stateManager.get('cards'));
        this.eventBus.emit('list:sorted', listId);
    }

    sortByDueDate(listId) {
        const cards = this.stateManager.getCards(listId);
        cards.sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
        
        cards.forEach((card, index) => {
            card.position = index;
        });
        
        this.stateManager.notifyListeners('cards', this.stateManager.get('cards'));
        this.eventBus.emit('list:sorted', listId);
    }

    sortByPriority(listId) {
        // Implement priority sorting
    }
}