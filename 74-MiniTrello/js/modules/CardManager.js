export class CardManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.currentCardId = null;
    }

    showCreateCardForm(listId) {
        const container = document.querySelector(`[data-list-id="${listId}"] .cards-container`);
        
        const form = document.createElement('div');
        form.className = 'add-card-form-container';
        form.innerHTML = `
            <div class="add-card-form">
                <textarea id="new-card-title" placeholder="Enter a title for this card..." rows="2" autofocus></textarea>
                <div class="form-actions">
                    <button class="btn btn-primary" onclick="app.cardManager.createCard('${listId}')">
                        Add Card
                    </button>
                    <button class="icon-btn" onclick="this.closest('.add-card-form-container').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        
        const addCardBtn = container.querySelector('.add-card');
        container.insertBefore(form, addCardBtn);
    }

    createCard(listId) {
        const title = document.getElementById('new-card-title')?.value;
        
        if (!title?.trim()) {
            this.eventBus.emit('error', { message: 'Card title is required' });
            return;
        }

        const card = this.stateManager.createCard({
            listId,
            title: title.trim()
        });

        // Remove the form
        const form = document.querySelector('.add-card-form-container');
        if (form) form.remove();

        this.eventBus.emit('card:created', card);
        return card;
    }

    cancelCreateCard() {
        const form = document.querySelector('.add-card-form-container');
        if (form) form.remove();
    }

    showCardDetails(cardId) {
        this.currentCardId = cardId;
        const card = this.stateManager.getCard(cardId);
        
        const modal = document.getElementById('cardDetailsModal');
        const body = document.getElementById('cardDetailsBody');
        const title = document.getElementById('detailsCardTitle');
        
        title.textContent = card.title;
        body.innerHTML = app.cardComponent.renderDetails(cardId);
        
        modal.classList.add('active');
    }

    editCard(cardId) {
        this.currentCardId = cardId;
        
        const modal = document.getElementById('cardModal');
        const title = document.getElementById('cardModalTitle');
        const saveBtn = document.getElementById('saveCardBtn');
        
        title.textContent = 'Edit Card';
        saveBtn.onclick = () => this.saveCard(cardId);
        
        // Fill form with card data
        const card = this.stateManager.getCard(cardId);
        document.getElementById('cardTitle').value = card.title || '';
        document.getElementById('cardDescription').value = card.description || '';
        document.getElementById('cardDueDate').value = card.dueDate ? new Date(card.dueDate).toISOString().slice(0,16) : '';
        
        // Load labels
        if (card.labels) {
            card.labels.forEach(labelId => {
                const labelOption = document.querySelector(`.label-option[data-color="${this.stateManager.getLabel(labelId)?.color}"]`);
                if (labelOption) {
                    labelOption.classList.add('selected');
                }
            });
        }
        
        modal.classList.add('active');
    }

    saveCard(cardId) {
        const title = document.getElementById('cardTitle')?.value;
        const description = document.getElementById('cardDescription')?.value;
        const dueDate = document.getElementById('cardDueDate')?.value;
        
        if (!title?.trim()) {
            this.eventBus.emit('error', { message: 'Card title is required' });
            return;
        }

        // Get selected labels
        const labels = [];
        document.querySelectorAll('.label-option.selected').forEach(option => {
            const color = option.dataset.color;
            const label = this.stateManager.get('labels').find(l => l.color === color);
            if (label) labels.push(label.id);
        });

        this.stateManager.updateCard(cardId, {
            title: title.trim(),
            description: description?.trim(),
            dueDate: dueDate || null,
            labels
        });

        this.closeModal();
        
        this.eventBus.emit('card:updated', cardId);
        this.eventBus.emit('notification', {
            message: 'Card updated successfully',
            type: 'success'
        });
    }

    deleteCard(cardId) {
        if (confirm('Are you sure you want to delete this card?')) {
            this.stateManager.deleteCard(cardId);
            
            // Remove card element
            const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
            if (cardElement) cardElement.remove();
            
            this.eventBus.emit('card:deleted', cardId);
        }
    }

    copyCard(cardId) {
        const copy = this.stateManager.copyCard(cardId);
        this.eventBus.emit('card:copied', copy);
    }

    addChecklistItem(text) {
        if (!this.currentCardId) return;
        
        this.stateManager.addChecklistItem(this.currentCardId, { text });
        this.refreshCardDetails();
    }

    addChecklistItemFromDetails(cardId) {
        const input = document.getElementById('new-checklist-item');
        const text = input.value.trim();
        
        if (text) {
            this.stateManager.addChecklistItem(cardId, { text });
            input.value = '';
            this.refreshCardDetails();
        }
    }

    toggleChecklistItem(cardId, itemId) {
        const card = this.stateManager.getCard(cardId);
        const item = card.checklist?.find(i => i.id === itemId);
        
        if (item) {
            item.completed = !item.completed;
            this.stateManager.updateCard(cardId, { checklist: card.checklist });
            this.refreshCardDetails();
        }
    }

    deleteChecklistItem(cardId, itemId) {
        this.stateManager.deleteChecklistItem(cardId, itemId);
        this.refreshCardDetails();
    }

    addLabel(cardId, labelId) {
        this.stateManager.addLabelToCard(cardId, labelId);
        this.refreshCardDetails();
    }

    removeLabel(cardId, labelId) {
        this.stateManager.removeLabelFromCard(cardId, labelId);
        this.refreshCardDetails();
    }

    addComment(cardId) {
        const input = document.getElementById('new-comment');
        const text = input.value.trim();
        
        if (text) {
            const user = this.stateManager.get('currentUser') || this.stateManager.get('users')[0];
            this.stateManager.addComment(cardId, user.id, text);
            input.value = '';
            this.refreshCardDetails();
        }
    }

    deleteComment(cardId, commentId) {
        if (confirm('Delete this comment?')) {
            this.stateManager.deleteComment(cardId, commentId);
            this.refreshCardDetails();
        }
    }

    removeDueDate(cardId) {
        this.stateManager.updateCard(cardId, { dueDate: null });
        this.refreshCardDetails();
    }

    addAttachment(cardId, file) {
        this.stateManager.addAttachment(cardId, file);
        this.refreshCardDetails();
    }

    removeAttachment(cardId, attachmentId) {
        this.stateManager.removeAttachment(cardId, attachmentId);
        this.refreshCardDetails();
    }

    refreshCardDetails() {
        if (this.currentCardId) {
            const body = document.getElementById('cardDetailsBody');
            body.innerHTML = app.cardComponent.renderDetails(this.currentCardId);
        }
    }

    closeModal() {
        document.getElementById('cardModal').classList.remove('active');
        document.getElementById('cardDetailsModal').classList.remove('active');
        this.currentCardId = null;
    }
}