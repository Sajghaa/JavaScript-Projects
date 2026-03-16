export class DragDropManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.draggedItem = null;
        this.draggedType = null;
    }

    initialize() {
        this.setupListDragDrop();
        this.setupCardDragDrop();
    }

    setupListDragDrop() {
        const lists = document.querySelectorAll('.list');
        
        lists.forEach(list => {
            // Make lists droppable
            list.addEventListener('dragover', (e) => {
                e.preventDefault();
                list.classList.add('drag-over');
            });

            list.addEventListener('dragleave', () => {
                list.classList.remove('drag-over');
            });

            list.addEventListener('drop', (e) => {
                e.preventDefault();
                list.classList.remove('drag-over');
                
                if (this.draggedType === 'list') {
                    this.handleListDrop(e);
                }
            });
        });
    }

    setupCardDragDrop() {
        const containers = document.querySelectorAll('.cards-container');
        
        containers.forEach(container => {
            container.addEventListener('dragover', (e) => {
                e.preventDefault();
                container.classList.add('drag-over');
            });

            container.addEventListener('dragleave', () => {
                container.classList.remove('drag-over');
            });

            container.addEventListener('drop', (e) => {
                e.preventDefault();
                container.classList.remove('drag-over');
                
                if (this.draggedType === 'card') {
                    this.handleCardDrop(e);
                }
            });
        });
    }

    handleListDragStart(e) {
        this.draggedType = 'list';
        this.draggedItem = e.target.closest('.list');
        
        const listId = this.draggedItem.dataset.listId;
        e.dataTransfer.setData('text/plain', listId);
        e.dataTransfer.effectAllowed = 'move';
        
        this.draggedItem.classList.add('dragging');
    }

    handleListDragEnd(e) {
        const list = e.target.closest('.list');
        if (list) {
            list.classList.remove('dragging');
        }
        
        this.draggedItem = null;
        this.draggedType = null;
    }

    handleListDrop(e) {
        const targetList = e.target.closest('.list');
        if (!targetList || !this.draggedItem) return;

        const draggedListId = this.draggedItem.dataset.listId;
        const targetListId = targetList.dataset.listId;
        
        if (draggedListId === targetListId) return;

        // Get all lists in the board
        const boardId = targetList.dataset.boardId;
        const lists = [...document.querySelectorAll(`[data-board-id="${boardId}"] .list`)];
        
        const draggedIndex = lists.indexOf(this.draggedItem);
        const targetIndex = lists.indexOf(targetList);

        // Update positions in state
        const stateLists = this.stateManager.getLists(boardId);
        const [movedList] = stateLists.splice(draggedIndex, 1);
        stateLists.splice(targetIndex, 0, movedList);
        
        // Update positions
        stateLists.forEach((list, index) => {
            this.stateManager.updateList(list.id, { position: index });
        });

        // Update DOM
        const container = document.getElementById('lists-container');
        if (draggedIndex < targetIndex) {
            container.insertBefore(this.draggedItem, targetList.nextSibling);
        } else {
            container.insertBefore(this.draggedItem, targetList);
        }

        this.eventBus.emit('list:moved', {
            listId: draggedListId,
            fromIndex: draggedIndex,
            toIndex: targetIndex
        });
    }

    handleCardDragStart(e) {
        this.draggedType = 'card';
        this.draggedItem = e.target.closest('.card');
        
        const cardId = this.draggedItem.dataset.cardId;
        const listId = this.draggedItem.dataset.listId;
        
        e.dataTransfer.setData('text/plain', JSON.stringify({
            cardId,
            sourceListId: listId
        }));
        e.dataTransfer.effectAllowed = 'move';
        
        this.draggedItem.classList.add('dragging');
    }

    handleCardDragEnd(e) {
        const card = e.target.closest('.card');
        if (card) {
            card.classList.remove('dragging');
        }
        
        this.draggedItem = null;
        this.draggedType = null;
    }

    handleCardDrop(e) {
        const targetContainer = e.target.closest('.cards-container');
        if (!targetContainer || !this.draggedItem) return;

        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        const { cardId, sourceListId } = data;
        
        const targetListId = targetContainer.dataset.listId;
        
        // Get all cards in target container
        const cards = [...targetContainer.querySelectorAll('.card:not(.dragging)')];
        
        // Calculate new position based on mouse position
        const mouseY = e.clientY;
        let newPosition = cards.length;
        
        for (let i = 0; i < cards.length; i++) {
            const rect = cards[i].getBoundingClientRect();
            if (mouseY < rect.top + rect.height / 2) {
                newPosition = i;
                break;
            }
        }

        // Move card in state
        this.stateManager.moveCard(cardId, sourceListId, targetListId, newPosition);

        // Update DOM
        if (sourceListId === targetListId) {
            // Same list - reorder
            const sourceContainer = document.querySelector(`[data-list-id="${sourceListId}"] .cards-container`);
            const cardsInList = [...sourceContainer.querySelectorAll('.card')];
            
            const currentIndex = cardsInList.indexOf(this.draggedItem);
            cardsInList.splice(currentIndex, 1);
            cardsInList.splice(newPosition, 0, this.draggedItem);
            
            sourceContainer.innerHTML = '';
            cardsInList.forEach(card => sourceContainer.appendChild(card));
            
            // Re-add add-card button
            const addCardBtn = document.createElement('div');
            addCardBtn.className = 'add-card';
            addCardBtn.innerHTML = '<i class="fas fa-plus"></i> Add a card';
            addCardBtn.setAttribute('onclick', `app.cardManager.showCreateCardForm('${targetListId}')`);
            sourceContainer.appendChild(addCardBtn);
        } else {
            // Different list - move
            const sourceContainer = document.querySelector(`[data-list-id="${sourceListId}"] .cards-container`);
            const targetContainer = document.querySelector(`[data-list-id="${targetListId}"] .cards-container`);
            
            // Remove from source
            this.draggedItem.remove();
            
            // Insert at new position
            const cardsInTarget = [...targetContainer.querySelectorAll('.card')];
            if (newPosition < cardsInTarget.length) {
                targetContainer.insertBefore(this.draggedItem, cardsInTarget[newPosition]);
            } else {
                targetContainer.insertBefore(this.draggedItem, targetContainer.querySelector('.add-card'));
            }
            
            // Update add card button in source
            if (sourceContainer.querySelectorAll('.card').length === 0) {
                // No cards left, ensure add button is there
                if (!sourceContainer.querySelector('.add-card')) {
                    const addCardBtn = document.createElement('div');
                    addCardBtn.className = 'add-card';
                    addCardBtn.innerHTML = '<i class="fas fa-plus"></i> Add a card';
                    addCardBtn.setAttribute('onclick', `app.cardManager.showCreateCardForm('${sourceListId}')`);
                    sourceContainer.appendChild(addCardBtn);
                }
            }
        }

        this.draggedItem.classList.remove('dragging');
        
        this.eventBus.emit('card:moved', {
            cardId,
            fromList: sourceListId,
            toList: targetListId,
            position: newPosition
        });
    }
}