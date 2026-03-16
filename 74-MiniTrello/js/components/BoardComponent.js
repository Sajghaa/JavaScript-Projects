export class BoardComponent {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render(boardId) {
        const board = this.stateManager.getBoard(boardId);
        if (!board) return '';

        const lists = this.stateManager.getLists(boardId);

        return `
            <div class="board" data-board-id="${boardId}" style="background: ${board.color}20">
                <div class="board-header">
                    <h2>${board.title}</h2>
                    <div class="board-actions">
                        <button class="board-action-btn" onclick="app.boardManager.showBoardMenu('${boardId}')">
                            <i class="fas fa-ellipsis-h"></i>
                        </button>
                        <button class="board-action-btn" onclick="app.boardManager.exportBoard('${boardId}')">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </div>

                <div class="lists-container" id="lists-container">
                    ${lists.map(list => this.renderList(list)).join('')}
                    
                    <div class="add-list" onclick="app.listManager.showCreateListForm('${boardId}')">
                        <i class="fas fa-plus"></i> Add another list
                    </div>
                </div>
            </div>
        `;
    }

    renderList(list) {
        const cards = this.stateManager.getCards(list.id);
        const board = this.stateManager.getBoard(list.boardId);

        return `
            <div class="list" data-list-id="${list.id}" data-board-id="${list.boardId}">
                <div class="list-header" draggable="true" ondragstart="app.dragDropManager.handleListDragStart(event)">
                    <div class="list-title-wrapper">
                        <span class="list-title">${list.title}</span>
                        <span class="list-badge">${cards.length}</span>
                    </div>
                    <div class="list-actions">
                        <button class="list-action-btn" onclick="app.listManager.showListMenu('${list.id}')">
                            <i class="fas fa-ellipsis-h"></i>
                        </button>
                    </div>
                </div>

                <div class="cards-container" 
                     data-list-id="${list.id}"
                     ondragover="event.preventDefault()"
                     ondrop="app.dragDropManager.handleCardDrop(event)">
                    
                    ${cards.map(card => this.renderCard(card, board?.color)).join('')}
                    
                    <div class="add-card" onclick="app.cardManager.showCreateCardForm('${list.id}')">
                        <i class="fas fa-plus"></i> Add a card
                    </div>
                </div>
            </div>
        `;
    }

    renderCard(card, boardColor) {
        const labels = card.labels?.map(labelId => this.stateManager.getLabel(labelId)).filter(l => l);
        const hasDueDate = card.dueDate && new Date(card.dueDate) > new Date();
        const isOverdue = card.dueDate && new Date(card.dueDate) < new Date() && !card.completed;
        const checklistProgress = this.getChecklistProgress(card.checklist);
        const members = card.members?.map(memberId => this.stateManager.getUser(memberId)).filter(u => u);

        return `
            <div class="card" 
                 data-card-id="${card.id}" 
                 data-list-id="${card.listId}"
                 draggable="true"
                 ondragstart="app.dragDropManager.handleCardDragStart(event)"
                 ondragend="app.dragDropManager.handleCardDragEnd(event)">
                
                ${card.cover ? `<img src="${card.cover}" class="card-cover" alt="Card cover">` : ''}
                
                <div class="card-header">
                    <div class="card-labels">
                        ${labels?.map(label => `
                            <span class="card-label" style="background: ${label.color}" 
                                  title="${label.name}"></span>
                        `).join('')}
                    </div>
                    <div class="card-actions">
                        <button class="card-action-btn" onclick="app.cardManager.editCard('${card.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>

                <div class="card-title" onclick="app.cardManager.showCardDetails('${card.id}')">
                    ${card.title}
                </div>

                <div class="card-footer">
                    ${hasDueDate ? `
                        <span class="card-badge ${isOverdue ? 'due' : ''}" 
                              title="Due ${new Date(card.dueDate).toLocaleDateString()}">
                            <i class="far fa-clock"></i>
                            ${new Date(card.dueDate).toLocaleDateString()}
                        </span>
                    ` : ''}

                    ${checklistProgress.total > 0 ? `
                        <span class="card-badge" title="Checklist">
                            <i class="fas fa-check-circle"></i>
                            ${checklistProgress.completed}/${checklistProgress.total}
                        </span>
                    ` : ''}

                    ${card.attachments?.length ? `
                        <span class="card-badge" title="Attachments">
                            <i class="fas fa-paperclip"></i>
                            ${card.attachments.length}
                        </span>
                    ` : ''}

                    ${card.comments?.length ? `
                        <span class="card-badge" title="Comments">
                            <i class="far fa-comment"></i>
                            ${card.comments.length}
                        </span>
                    ` : ''}

                    ${members?.length ? `
                        <span class="card-badge member-avatars">
                            ${members.map(member => `
                                <span class="member-avatar" style="background: ${boardColor}40" 
                                      title="${member.name}">
                                    ${member.avatar}
                                </span>
                            `).join('')}
                        </span>
                    ` : ''}
                </div>
            </div>
        `;
    }

    getChecklistProgress(checklist) {
        if (!checklist || checklist.length === 0) {
            return { completed: 0, total: 0 };
        }
        
        const completed = checklist.filter(item => item.completed).length;
        return {
            completed,
            total: checklist.length,
            percentage: (completed / checklist.length) * 100
        };
    }
}