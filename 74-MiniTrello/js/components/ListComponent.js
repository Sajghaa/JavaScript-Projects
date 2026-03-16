export class ListComponent {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    renderCreateForm(boardId) {
        return `
            <div class="add-list-form">
                <input type="text" id="new-list-title" placeholder="Enter list title..." autofocus>
                <div class="form-actions">
                    <button class="btn btn-primary" onclick="app.listManager.createList('${boardId}')">
                        Add List
                    </button>
                    <button class="icon-btn" onclick="app.listManager.cancelCreateList()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderEditForm(listId) {
        const list = this.stateManager.getList(listId);
        if (!list) return '';

        return `
            <div class="list-edit-form">
                <input type="text" id="edit-list-title" value="${list.title}" autofocus>
                <div class="form-actions">
                    <button class="btn btn-primary" onclick="app.listManager.updateList('${listId}')">
                        Save
                    </button>
                    <button class="btn btn-secondary" onclick="app.listManager.cancelEdit()">
                        Cancel
                    </button>
                </div>
            </div>
        `;
    }

    renderListMenu(listId) {
        const list = this.stateManager.getList(listId);
        
        return `
            <div class="list-menu">
                <div class="list-menu-header">
                    <h4>List Actions</h4>
                    <button class="close-btn" onclick="app.listManager.closeMenu()">
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
            </div>
        `;
    }

    renderMoveListModal(listId) {
        const boards = this.stateManager.get('boards');
        const list = this.stateManager.getList(listId);
        
        return `
            <div class="move-list-modal">
                <h3>Move List "${list.title}"</h3>
                
                <div class="form-group">
                    <label>Select Board</label>
                    <select id="move-list-board">
                        ${boards.map(board => `
                            <option value="${board.id}" ${board.id === list.boardId ? 'selected' : ''}>
                                ${board.title}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Position</label>
                    <select id="move-list-position">
                        ${this.getPositionOptions(list.boardId, list.id)}
                    </select>
                </div>
                
                <div class="form-actions">
                    <button class="btn btn-primary" onclick="app.listManager.moveListToBoard('${listId}')">
                        Move
                    </button>
                    <button class="btn btn-secondary" onclick="app.listManager.closeModal()">
                        Cancel
                    </button>
                </div>
            </div>
        `;
    }

    renderSortOptions(listId) {
        return `
            <div class="sort-menu">
                <h4>Sort Cards</h4>
                
                <button class="menu-item" onclick="app.listManager.sortByDate('${listId}', 'asc')">
                    <i class="fas fa-calendar-alt"></i> Oldest first
                </button>
                
                <button class="menu-item" onclick="app.listManager.sortByDate('${listId}', 'desc')">
                    <i class="fas fa-calendar-alt"></i> Newest first
                </button>
                
                <button class="menu-item" onclick="app.listManager.sortByName('${listId}', 'asc')">
                    <i class="fas fa-sort-alpha-down"></i> Name (A-Z)
                </button>
                
                <button class="menu-item" onclick="app.listManager.sortByName('${listId}', 'desc')">
                    <i class="fas fa-sort-alpha-up"></i> Name (Z-A)
                </button>
                
                <button class="menu-item" onclick="app.listManager.sortByDueDate('${listId}')">
                    <i class="far fa-clock"></i> Due date
                </button>
                
                <button class="menu-item" onclick="app.listManager.sortByPriority('${listId}')">
                    <i class="fas fa-flag"></i> Priority
                </button>
            </div>
        `;
    }

    getPositionOptions(boardId, currentListId) {
        const lists = this.stateManager.getLists(boardId);
        let options = '';
        
        for (let i = 0; i < lists.length; i++) {
            if (lists[i].id !== currentListId) {
                options += `<option value="${i}">After ${lists[i].title}</option>`;
            }
        }
        
        options += `<option value="${lists.length}">At the end</option>`;
        
        return options;
    }
}