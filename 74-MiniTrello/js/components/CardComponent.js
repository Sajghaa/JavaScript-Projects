export class CardComponent {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    renderCreateForm(listId) {
        return `
            <div class="add-card-form">
                <textarea id="new-card-title" placeholder="Enter a title for this card..." rows="2" autofocus></textarea>
                <div class="form-actions">
                    <button class="btn btn-primary" onclick="app.cardManager.createCard('${listId}')">
                        Add Card
                    </button>
                    <button class="icon-btn" onclick="app.cardManager.cancelCreateCard()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderDetails(cardId) {
        const card = this.stateManager.getCard(cardId);
        if (!card) return '';

        const list = this.stateManager.getList(card.listId);
        const board = this.stateManager.getBoard(list?.boardId);
        const labels = card.labels?.map(labelId => this.stateManager.getLabel(labelId)).filter(l => l);
        const members = card.members?.map(memberId => this.stateManager.getUser(memberId)).filter(u => u);
        const activities = this.stateManager.getCardActivities(cardId);

        return `
            <div class="card-details" data-card-id="${cardId}">
                <div class="details-section">
                    <h3><i class="fas fa-tag"></i> Title</h3>
                    <div class="details-title">
                        <h2>${card.title}</h2>
                        <div class="title-actions">
                            <button class="btn btn-secondary" onclick="app.cardManager.editCard('${cardId}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-secondary" onclick="app.cardManager.copyCard('${cardId}')">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                            <button class="btn btn-secondary" onclick="app.cardManager.archiveCard('${cardId}')">
                                <i class="fas fa-archive"></i> Archive
                            </button>
                        </div>
                    </div>
                    <div class="details-meta">
                        <span><i class="fas fa-list"></i> in list <strong>${list?.title}</strong></span>
                        <span><i class="far fa-clock"></i> Created ${new Date(card.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                ${labels?.length ? `
                    <div class="details-section">
                        <h3><i class="fas fa-tags"></i> Labels</h3>
                        <div class="details-labels">
                            ${labels.map(label => `
                                <span class="selected-label" style="background: ${label.color}">
                                    ${label.name}
                                    <i class="fas fa-times" onclick="app.cardManager.removeLabel('${cardId}', '${label.id}')"></i>
                                </span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${card.description ? `
                    <div class="details-section">
                        <h3><i class="fas fa-align-left"></i> Description</h3>
                        <div class="details-description">
                            ${card.description}
                        </div>
                    </div>
                ` : ''}

                ${card.dueDate ? `
                    <div class="details-section">
                        <h3><i class="far fa-clock"></i> Due Date</h3>
                        <div class="details-due ${new Date(card.dueDate) < new Date() ? 'overdue' : ''}">
                            <i class="far fa-calendar"></i>
                            ${new Date(card.dueDate).toLocaleString()}
                            <button class="btn btn-text" onclick="app.cardManager.removeDueDate('${cardId}')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                ` : ''}

                ${members?.length ? `
                    <div class="details-section">
                        <h3><i class="fas fa-users"></i> Members</h3>
                        <div class="details-members">
                            ${members.map(member => `
                                <div class="member-item">
                                    <span class="member-avatar" style="background: ${board?.color}40">
                                        ${member.avatar}
                                    </span>
                                    <span>${member.name}</span>
                                    <i class="fas fa-times" onclick="app.cardManager.removeMember('${cardId}', '${member.id}')"></i>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${card.checklist?.length ? `
                    <div class="details-section">
                        <h3><i class="fas fa-check-square"></i> Checklist</h3>
                        <div class="details-checklist">
                            <div class="checklist-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${this.getChecklistProgress(card.checklist).percentage}%"></div>
                                </div>
                                <span>${this.getChecklistProgress(card.checklist).completed}/${card.checklist.length}</span>
                            </div>
                            
                            ${card.checklist.map(item => `
                                <div class="checklist-item ${item.completed ? 'completed' : ''}">
                                    <input type="checkbox" 
                                           ${item.completed ? 'checked' : ''} 
                                           onchange="app.cardManager.toggleChecklistItem('${cardId}', '${item.id}')">
                                    <span class="checklist-text">${item.text}</span>
                                    <i class="fas fa-trash" onclick="app.cardManager.deleteChecklistItem('${cardId}', '${item.id}')"></i>
                                </div>
                            `).join('')}
                            
                            <div class="add-checklist-item">
                                <input type="text" id="new-checklist-item" placeholder="Add an item...">
                                <button class="btn btn-primary" onclick="app.cardManager.addChecklistItemFromDetails('${cardId}')">
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                ` : ''}

                ${card.attachments?.length ? `
                    <div class="details-section">
                        <h3><i class="fas fa-paperclip"></i> Attachments</h3>
                        <div class="details-attachments">
                            ${card.attachments.map(att => `
                                <div class="attachment-item">
                                    ${att.type.startsWith('image/') ? 
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
                                        <i class="fas fa-trash" onclick="app.cardManager.removeAttachment('${cardId}', '${att.id}')"></i>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div class="details-section">
                    <h3><i class="fas fa-comment"></i> Comments</h3>
                    <div class="details-comments">
                        <div class="add-comment">
                            <textarea id="new-comment" placeholder="Write a comment..." rows="2"></textarea>
                            <button class="btn btn-primary" onclick="app.cardManager.addComment('${cardId}')">
                                Comment
                            </button>
                        </div>
                        
                        <div class="comments-list">
                            ${card.comments?.map(comment => {
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
                                                <button class="btn-text" onclick="app.cardManager.editComment('${cardId}', '${comment.id}')">
                                                    Edit
                                                </button>
                                                <button class="btn-text" onclick="app.cardManager.deleteComment('${cardId}', '${comment.id}')">
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

                <div class="details-section">
                    <h3><i class="fas fa-history"></i> Activity</h3>
                    <div class="details-activity">
                        ${activities.map(activity => {
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
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderEditForm(cardId) {
        const card = this.stateManager.getCard(cardId);
        if (!card) return '';

        return `
            <div class="edit-card-form">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" id="edit-card-title" value="${card.title}" autofocus>
                </div>
                
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="edit-card-description" rows="4">${card.description || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label>Due Date</label>
                    <input type="datetime-local" id="edit-card-due" 
                           value="${card.dueDate ? new Date(card.dueDate).toISOString().slice(0,16) : ''}">
                </div>
                
                <div class="form-group">
                    <label>Cover Image URL</label>
                    <input type="url" id="edit-card-cover" value="${card.cover || ''}">
                </div>
                
                <div class="form-actions">
                    <button class="btn btn-primary" onclick="app.cardManager.saveCard('${cardId}')">
                        Save Changes
                    </button>
                    <button class="btn btn-secondary" onclick="app.cardManager.cancelEdit()">
                        Cancel
                    </button>
                </div>
            </div>
        `;
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