export class ModalComponent {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    // Render create board modal
    renderCreateBoardModal() {
        return `
            <div id="boardModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas fa-plus-circle"></i> Create Board</h2>
                        <button class="close-modal" onclick="app.modalManager.closeAllModals()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Board Title</label>
                            <input type="text" id="boardTitle" placeholder="e.g., Project Management, Sprint 2024" autofocus>
                        </div>
                        <div class="form-group">
                            <label>Background Color</label>
                            <div class="color-picker" id="boardColorPicker">
                                <div class="color-option" data-color="#0079bf" style="background: #0079bf" title="Blue"></div>
                                <div class="color-option" data-color="#d29034" style="background: #d29034" title="Yellow"></div>
                                <div class="color-option" data-color="#519839" style="background: #519839" title="Green"></div>
                                <div class="color-option" data-color="#b04632" style="background: #b04632" title="Red"></div>
                                <div class="color-option" data-color="#89609e" style="background: #89609e" title="Purple"></div>
                                <div class="color-option" data-color="#cd5a91" style="background: #cd5a91" title="Pink"></div>
                                <div class="color-option" data-color="#4bbf6b" style="background: #4bbf6b" title="Light Green"></div>
                                <div class="color-option" data-color="#ff9f1a" style="background: #ff9f1a" title="Orange"></div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Board Template (Optional)</label>
                            <select id="boardTemplate" class="template-select">
                                <option value="">Blank Board</option>
                                <option value="project">Project Management</option>
                                <option value="sprint">Sprint Planning</option>
                                <option value="todo">To-Do List</option>
                                <option value="ideas">Ideas & Inspiration</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="app.modalManager.closeAllModals()">Cancel</button>
                        <button class="btn btn-primary" id="saveBoardBtn" onclick="app.boardManager.createBoard()">
                            <i class="fas fa-check"></i> Create Board
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Render create list modal
    renderCreateListModal() {
        return `
            <div id="listModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas fa-plus-circle"></i> Create List</h2>
                        <button class="close-modal" onclick="app.modalManager.closeAllModals()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>List Title</label>
                            <input type="text" id="listTitle" placeholder="e.g., To Do, In Progress, Done" autofocus>
                        </div>
                        <div class="form-group">
                            <label>Position</label>
                            <select id="listPosition" class="position-select">
                                <option value="end">At the end</option>
                                <option value="start">At the beginning</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="app.modalManager.closeAllModals()">Cancel</button>
                        <button class="btn btn-primary" id="saveListBtn" onclick="app.listManager.createList()">
                            <i class="fas fa-check"></i> Create List
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Render create/edit card modal
    renderCardModal(card = null) {
        const isEdit = !!card;
        const labels = this.stateManager.get('labels');
        const users = this.stateManager.get('users');

        return `
            <div id="cardModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas ${isEdit ? 'fa-edit' : 'fa-plus-circle'}"></i> 
                            ${isEdit ? 'Edit Card' : 'Create Card'}</h2>
                        <button class="close-modal" onclick="app.modalManager.closeAllModals()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Card Title <span class="required">*</span></label>
                            <input type="text" id="cardTitle" placeholder="e.g., Design homepage" 
                                   value="${card?.title || ''}" autofocus>
                        </div>
                        
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="cardDescription" rows="4" 
                                      placeholder="Add a more detailed description...">${card?.description || ''}</textarea>
                        </div>

                        <div class="form-row">
                            <div class="form-group half">
                                <label>Due Date</label>
                                <input type="datetime-local" id="cardDueDate" 
                                       value="${card?.dueDate ? new Date(card.dueDate).toISOString().slice(0,16) : ''}">
                            </div>
                            
                            <div class="form-group half">
                                <label>Priority</label>
                                <select id="cardPriority">
                                    <option value="low" ${card?.priority === 'low' ? 'selected' : ''}>Low</option>
                                    <option value="medium" ${card?.priority === 'medium' || !card ? 'selected' : ''}>Medium</option>
                                    <option value="high" ${card?.priority === 'high' ? 'selected' : ''}>High</option>
                                    <option value="urgent" ${card?.priority === 'urgent' ? 'selected' : ''}>Urgent</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Labels</label>
                            <div class="labels-container" id="labelsContainer">
                                ${labels.map(label => `
                                    <div class="label-option ${card?.labels?.includes(label.id) ? 'selected' : ''}" 
                                         data-id="${label.id}" 
                                         data-color="${label.color}"
                                         onclick="app.modalManager.toggleLabel(this)">
                                        <span style="background: ${label.color}"></span>
                                        ${label.name}
                                    </div>
                                `).join('')}
                            </div>
                            <div id="selectedLabels" class="selected-labels">
                                ${card?.labels?.map(labelId => {
                                    const label = labels.find(l => l.id === labelId);
                                    return label ? `
                                        <span class="selected-label" style="background: ${label.color}" data-id="${label.id}">
                                            ${label.name}
                                            <i class="fas fa-times" onclick="app.modalManager.removeLabel('${label.id}')"></i>
                                        </span>
                                    ` : '';
                                }).join('')}
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Members</label>
                            <div class="members-container" id="membersContainer">
                                ${users.map(user => `
                                    <div class="member-option ${card?.members?.includes(user.id) ? 'selected' : ''}" 
                                         data-id="${user.id}"
                                         onclick="app.modalManager.toggleMember(this)">
                                        <span class="member-avatar" style="background: #0079bf40">
                                            ${user.avatar}
                                        </span>
                                        <span>${user.name}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        ${!isEdit ? `
                            <div class="form-group">
                                <label>Checklist (Optional)</label>
                                <div id="checklistContainer">
                                    <div class="checklist-item">
                                        <input type="text" class="checklist-input" placeholder="Add an item">
                                        <button class="add-checklist-btn" onclick="app.modalManager.addChecklistItem(this)">
                                            <i class="fas fa-plus"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Cover Image URL (Optional)</label>
                                <input type="url" id="cardCover" placeholder="https://example.com/image.jpg">
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="app.modalManager.closeAllModals()">Cancel</button>
                        <button class="btn btn-primary" id="saveCardBtn" 
                                onclick="${isEdit ? `app.cardManager.saveCard('${card.id}')` : 'app.cardManager.createCard()'}">
                            <i class="fas fa-check"></i> ${isEdit ? 'Save Changes' : 'Create Card'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Render card details modal
    renderCardDetailsModal(card) {
        const list = this.stateManager.getList(card.listId);
        const board = this.stateManager.getBoard(list?.boardId);
        const labels = card.labels?.map(id => this.stateManager.getLabel(id)).filter(l => l);
        const members = card.members?.map(id => this.stateManager.getUser(id)).filter(u => u);
        const activities = this.stateManager.getCardActivities(card.id);
        const comments = card.comments || [];
        const checklist = card.checklist || [];
        const checklistProgress = this.getChecklistProgress(checklist);
        const attachments = card.attachments || [];

        return `
            <div id="cardDetailsModal" class="modal">
                <div class="modal-content large">
                    <div class="modal-header">
                        <h2 id="detailsCardTitle">
                            <i class="fas fa-window-maximize"></i> 
                            ${card.title}
                        </h2>
                        <button class="close-modal" onclick="app.modalManager.closeAllModals()">&times;</button>
                    </div>
                    <div class="modal-body" id="cardDetailsBody">
                        <div class="card-details" data-card-id="${card.id}">
                            <!-- Header Actions -->
                            <div class="details-actions-bar">
                                <span class="badge"><i class="fas fa-list"></i> in list: ${list?.title || 'Unknown'}</span>
                                <span class="badge"><i class="far fa-clock"></i> Created: ${new Date(card.createdAt).toLocaleDateString()}</span>
                                <div class="action-buttons">
                                    <button class="btn btn-secondary btn-sm" onclick="app.cardManager.editCard('${card.id}')">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                    <button class="btn btn-secondary btn-sm" onclick="app.cardManager.copyCard('${card.id}')">
                                        <i class="fas fa-copy"></i> Copy
                                    </button>
                                    <button class="btn btn-danger btn-sm" onclick="app.cardManager.deleteCard('${card.id}')">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            </div>

                            <!-- Labels Section -->
                            ${labels?.length ? `
                                <div class="details-section">
                                    <h3><i class="fas fa-tags"></i> Labels</h3>
                                    <div class="details-labels">
                                        ${labels.map(label => `
                                            <span class="selected-label" style="background: ${label.color}">
                                                ${label.name}
                                                <i class="fas fa-times" onclick="app.cardManager.removeLabel('${card.id}', '${label.id}')"></i>
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}

                            <!-- Members Section -->
                            ${members?.length ? `
                                <div class="details-section">
                                    <h3><i class="fas fa-users"></i> Members</h3>
                                    <div class="details-members">
                                        ${members.map(member => `
                                            <div class="member-chip" style="background: ${board?.color}20">
                                                <span class="member-avatar">${member.avatar}</span>
                                                <span>${member.name}</span>
                                                <i class="fas fa-times" onclick="app.cardManager.removeMember('${card.id}', '${member.id}')"></i>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}

                            <!-- Description Section -->
                            ${card.description ? `
                                <div class="details-section">
                                    <h3><i class="fas fa-align-left"></i> Description</h3>
                                    <div class="details-description">
                                        ${card.description.replace(/\n/g, '<br>')}
                                    </div>
                                </div>
                            ` : ''}

                            <!-- Priority & Due Date Section -->
                            <div class="details-row">
                                ${card.priority ? `
                                    <div class="details-section half">
                                        <h3><i class="fas fa-flag"></i> Priority</h3>
                                        <div class="priority-badge priority-${card.priority}">
                                            ${card.priority.charAt(0).toUpperCase() + card.priority.slice(1)}
                                        </div>
                                    </div>
                                ` : ''}

                                ${card.dueDate ? `
                                    <div class="details-section half">
                                        <h3><i class="far fa-clock"></i> Due Date</h3>
                                        <div class="due-date ${new Date(card.dueDate) < new Date() ? 'overdue' : ''}">
                                            <i class="far fa-calendar"></i>
                                            ${new Date(card.dueDate).toLocaleString()}
                                            <button class="btn-text" onclick="app.cardManager.removeDueDate('${card.id}')">
                                                <i class="fas fa-times"></i>
                                            </button>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>

                            <!-- Checklist Section -->
                            ${checklist.length > 0 ? `
                                <div class="details-section">
                                    <h3><i class="fas fa-check-square"></i> Checklist</h3>
                                    <div class="details-checklist">
                                        <div class="checklist-progress">
                                            <div class="progress-bar">
                                                <div class="progress-fill" style="width: ${checklistProgress.percentage}%"></div>
                                            </div>
                                            <span>${checklistProgress.completed}/${checklist.length} completed</span>
                                        </div>
                                        
                                        ${checklist.map(item => `
                                            <div class="checklist-item ${item.completed ? 'completed' : ''}">
                                                <input type="checkbox" 
                                                       ${item.completed ? 'checked' : ''} 
                                                       onchange="app.cardManager.toggleChecklistItem('${card.id}', '${item.id}')">
                                                <span class="checklist-text">${item.text}</span>
                                                <i class="fas fa-trash" onclick="app.cardManager.deleteChecklistItem('${card.id}', '${item.id}')"></i>
                                            </div>
                                        `).join('')}
                                        
                                        <div class="add-checklist-item">
                                            <input type="text" id="new-checklist-item-${card.id}" placeholder="Add an item...">
                                            <button class="btn btn-primary btn-sm" onclick="app.cardManager.addChecklistItemFromDetails('${card.id}')">
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ` : ''}

                            <!-- Attachments Section -->
                            ${attachments.length > 0 ? `
                                <div class="details-section">
                                    <h3><i class="fas fa-paperclip"></i> Attachments (${attachments.length})</h3>
                                    <div class="details-attachments">
                                        ${attachments.map(att => `
                                            <div class="attachment-item">
                                                ${att.type?.startsWith('image/') ? 
                                                    `<img src="${att.url}" alt="${att.name}">` :
                                                    `<i class="fas fa-file"></i>`
                                                }
                                                <div class="attachment-info">
                                                    <div class="attachment-name">${att.name}</div>
                                                    <div class="attachment-size">${this.formatBytes(att.size)}</div>
                                                </div>
                                                <div class="attachment-actions">
                                                    <a href="${att.url}" download="${att.name}" class="icon-btn">
                                                        <i class="fas fa-download"></i>
                                                    </a>
                                                    <i class="fas fa-trash" onclick="app.cardManager.removeAttachment('${card.id}', '${att.id}')"></i>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}

                            <!-- Comments Section -->
                            <div class="details-section">
                                <h3><i class="fas fa-comment"></i> Comments (${comments.length})</h3>
                                <div class="details-comments">
                                    <div class="add-comment">
                                        <textarea id="new-comment-${card.id}" placeholder="Write a comment..." rows="2"></textarea>
                                        <button class="btn btn-primary" onclick="app.cardManager.addComment('${card.id}')">
                                            <i class="fas fa-paper-plane"></i> Comment
                                        </button>
                                    </div>
                                    
                                    <div class="comments-list">
                                        ${comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(comment => {
                                            const user = this.stateManager.getUser(comment.userId);
                                            return `
                                                <div class="comment-item">
                                                    <div class="comment-avatar" style="background: ${board?.color}40">
                                                        ${user?.avatar || 'U'}
                                                    </div>
                                                    <div class="comment-content">
                                                        <div class="comment-header">
                                                            <strong>${user?.name || 'Unknown'}</strong>
                                                            <span>${new Date(comment.createdAt).toLocaleString()}</span>
                                                        </div>
                                                        <div class="comment-text">${comment.text}</div>
                                                        <div class="comment-actions">
                                                            <button class="btn-text" onclick="app.cardManager.deleteComment('${card.id}', '${comment.id}')">
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>
                            </div>

                            <!-- Activity Section -->
                            <div class="details-section">
                                <h3><i class="fas fa-history"></i> Activity</h3>
                                <div class="details-activity">
                                    ${activities.length > 0 ? activities.map(activity => {
                                        const user = this.stateManager.getUser(activity.userId);
                                        return `
                                            <div class="activity-item">
                                                <div class="activity-avatar" style="background: ${board?.color}40">
                                                    ${user?.avatar || 'U'}
                                                </div>
                                                <div class="activity-content">
                                                    <div class="activity-text">
                                                        <strong>${user?.name || 'Unknown'}</strong> ${activity.text}
                                                    </div>
                                                    <div class="activity-time">
                                                        ${new Date(activity.timestamp).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        `;
                                    }).join('') : `
                                        <div class="empty-state small">
                                            <i class="fas fa-history"></i>
                                            <p>No activity yet</p>
                                        </div>
                                    `}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Render move card modal
    renderMoveCardModal(cardId) {
        const card = this.stateManager.getCard(cardId);
        const boards = this.stateManager.get('boards');
        const currentBoard = this.stateManager.getBoard(this.stateManager.get('currentBoard'));
        
        return `
            <div id="moveCardModal" class="modal">
                <div class="modal-content small">
                    <div class="modal-header">
                        <h2><i class="fas fa-arrow-right"></i> Move Card</h2>
                        <button class="close-modal" onclick="app.modalManager.closeAllModals()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>Moving: <strong>${card.title}</strong></p>
                        
                        <div class="form-group">
                            <label>Destination Board</label>
                            <select id="moveCardBoard" onchange="app.modalManager.updateBoardLists()">
                                ${boards.map(board => `
                                    <option value="${board.id}" ${board.id === currentBoard?.id ? 'selected' : ''}>
                                        ${board.title}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Destination List</label>
                            <select id="moveCardList">
                                ${this.getBoardListOptions(currentBoard?.id)}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Position</label>
                            <select id="moveCardPosition">
                                <option value="end">At the end</option>
                                <option value="start">At the beginning</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="app.modalManager.closeAllModals()">Cancel</button>
                        <button class="btn btn-primary" onclick="app.cardManager.moveCard('${cardId}')">
                            Move Card
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Render export/import modal
    renderExportImportModal() {
        return `
            <div id="exportModal" class="modal">
                <div class="modal-content small">
                    <div class="modal-header">
                        <h2><i class="fas fa-download"></i> Export/Import</h2>
                        <button class="close-modal" onclick="app.modalManager.closeAllModals()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="export-section">
                            <h3>Export Board</h3>
                            <p>Download this board as a JSON file</p>
                            <button class="btn btn-primary" onclick="app.boardManager.exportBoard(app.stateManager.get('currentBoard'))">
                                <i class="fas fa-download"></i> Export Board
                            </button>
                        </div>
                        
                        <div class="divider">or</div>
                        
                        <div class="import-section">
                            <h3>Import Board</h3>
                            <p>Upload a previously exported board</p>
                            <div class="file-upload">
                                <input type="file" id="importFile" accept=".json" style="display: none;">
                                <button class="btn btn-secondary" onclick="document.getElementById('importFile').click()">
                                    <i class="fas fa-upload"></i> Choose File
                                </button>
                                <button class="btn btn-primary" onclick="app.boardManager.importBoard()">
                                    Import
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Render keyboard shortcuts modal
    renderShortcutsModal() {
        return `
            <div id="shortcutsModal" class="modal">
                <div class="modal-content small">
                    <div class="modal-header">
                        <h2><i class="fas fa-keyboard"></i> Keyboard Shortcuts</h2>
                        <button class="close-modal" onclick="app.modalManager.closeAllModals()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="shortcuts-grid">
                            <div class="shortcut-item">
                                <span class="key">N</span>
                                <span class="description">New Board</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="key">Ctrl/Cmd + N</span>
                                <span class="description">New Card</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="key">Ctrl/Cmd + Z</span>
                                <span class="description">Undo</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="key">Ctrl/Cmd + Shift + Z</span>
                                <span class="description">Redo</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="key">Escape</span>
                                <span class="description">Close Modal</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="key">/</span>
                                <span class="description">Focus Search</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="key">?</span>
                                <span class="description">Show Shortcuts</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="key">D</span>
                                <span class="description">Toggle Dark Mode</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Helper methods
    getBoardListOptions(boardId) {
        const lists = this.stateManager.getLists(boardId);
        return lists.map(list => `
            <option value="${list.id}">${list.title}</option>
        `).join('');
    }

    updateBoardLists() {
        const boardSelect = document.getElementById('moveCardBoard');
        const listSelect = document.getElementById('moveCardList');
        
        if (boardSelect && listSelect) {
            const boardId = boardSelect.value;
            listSelect.innerHTML = this.getBoardListOptions(boardId);
        }
    }

    toggleLabel(element) {
        element.classList.toggle('selected');
        this.updateSelectedLabels();
    }

    toggleMember(element) {
        element.classList.toggle('selected');
    }

    updateSelectedLabels() {
        const container = document.getElementById('selectedLabels');
        if (!container) return;
        
        const selected = [];
        document.querySelectorAll('.label-option.selected').forEach(option => {
            const id = option.dataset.id;
            const color = option.dataset.color;
            const name = option.textContent.trim();
            selected.push({ id, color, name });
        });
        
        container.innerHTML = selected.map(label => `
            <span class="selected-label" style="background: ${label.color}" data-id="${label.id}">
                ${label.name}
                <i class="fas fa-times" onclick="app.modalManager.removeLabel('${label.id}')"></i>
            </span>
        `).join('');
    }

    removeLabel(labelId) {
        const option = document.querySelector(`.label-option[data-id="${labelId}"]`);
        if (option) {
            option.classList.remove('selected');
        }
        this.updateSelectedLabels();
    }

    addChecklistItem(btn) {
        const container = btn.closest('.checklist-item');
        const input = container.querySelector('.checklist-input');
        
        if (input.value.trim()) {
            const newItem = document.createElement('div');
            newItem.className = 'checklist-item';
            newItem.innerHTML = `
                <input type="checkbox">
                <span class="checklist-text">${input.value.trim()}</span>
                <i class="fas fa-trash" onclick="this.parentElement.remove()"></i>
            `;
            
            container.parentNode.insertBefore(newItem, container);
            input.value = '';
        }
    }

    getChecklistProgress(checklist) {
        if (!checklist || checklist.length === 0) {
            return { completed: 0, total: 0, percentage: 0 };
        }
        const completed = checklist.filter(item => item.completed).length;
        return {
            completed,
            total: checklist.length,
            percentage: (completed / checklist.length) * 100
        };
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}