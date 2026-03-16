export class ModalManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.currentModal = null;
    }

    showCreateBoardModal() {
        const modal = document.getElementById('boardModal');
        const saveBtn = document.getElementById('saveBoardBtn');
        
        // Reset form
        document.getElementById('boardTitle').value = '';
        document.querySelectorAll('.color-option').forEach(opt => {
            opt.classList.remove('active');
        });
        document.querySelector('.color-option').classList.add('active');
        
        saveBtn.onclick = () => this.createBoard();
        
        modal.classList.add('active');
        this.currentModal = 'board';
    }

    createBoard() {
        const title = document.getElementById('boardTitle').value;
        const selectedColor = document.querySelector('.color-option.active')?.dataset.color;
        
        app.boardManager.createBoard(title, selectedColor);
        this.closeAllModals();
    }

    showCreateListModal(boardId) {
        const modal = document.getElementById('listModal');
        const saveBtn = document.getElementById('saveListBtn');
        
        document.getElementById('listTitle').value = '';
        
        saveBtn.onclick = () => this.createList(boardId);
        
        modal.classList.add('active');
        this.currentModal = 'list';
    }

    createList(boardId) {
        const title = document.getElementById('listTitle').value;
        
        app.listManager.createList(boardId, title);
        this.closeAllModals();
    }

    showCreateCardModal(listId) {
        const modal = document.getElementById('cardModal');
        const title = document.getElementById('cardModalTitle');
        const saveBtn = document.getElementById('saveCardBtn');
        
        title.textContent = 'Create Card';
        saveBtn.onclick = () => this.createCard(listId);
        
        // Reset form
        document.getElementById('cardTitle').value = '';
        document.getElementById('cardDescription').value = '';
        document.getElementById('cardDueDate').value = '';
        document.querySelectorAll('.label-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        document.getElementById('selectedLabels').innerHTML = '';
        
        modal.classList.add('active');
        this.currentModal = 'card';
    }

    createCard(listId) {
        const title = document.getElementById('cardTitle').value;
        const description = document.getElementById('cardDescription').value;
        const dueDate = document.getElementById('cardDueDate').value;
        
        // Get selected labels
        const labels = [];
        document.querySelectorAll('.label-option.selected').forEach(option => {
            const color = option.dataset.color;
            const label = this.stateManager.get('labels').find(l => l.color === color);
            if (label) labels.push(label.id);
        });

        if (!title.trim()) {
            this.eventBus.emit('error', { message: 'Card title is required' });
            return;
        }

        this.stateManager.createCard({
            listId,
            title: title.trim(),
            description: description?.trim(),
            dueDate: dueDate || null,
            labels
        });

        this.closeAllModals();
        
        this.eventBus.emit('notification', {
            message: 'Card created successfully',
            type: 'success'
        });
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        this.currentModal = null;
    }

    // Label selection
    toggleLabel(option) {
        option.classList.toggle('selected');
        this.updateSelectedLabels();
    }

    updateSelectedLabels() {
        const container = document.getElementById('selectedLabels');
        const selected = [];
        
        document.querySelectorAll('.label-option.selected').forEach(option => {
            const color = option.dataset.color;
            const name = option.textContent.trim();
            selected.push({ color, name });
        });
        
        container.innerHTML = selected.map(label => `
            <span class="selected-label" style="background: ${label.color}">
                ${label.name}
                <i class="fas fa-times" onclick="this.parentElement.remove(); app.modalManager.updateSelectedLabels()"></i>
            </span>
        `).join('');
    }

    // File attachment
    setupFileUpload() {
        const area = document.getElementById('attachmentArea');
        const input = document.getElementById('fileInput');
        
        area.addEventListener('click', () => {
            input.click();
        });
        
        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.style.borderColor = 'var(--primary)';
            area.style.background = 'var(--surface-hover)';
        });
        
        area.addEventListener('dragleave', () => {
            area.style.borderColor = 'var(--border)';
            area.style.background = 'transparent';
        });
        
        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.style.borderColor = 'var(--border)';
            area.style.background = 'transparent';
            
            const files = e.dataTransfer.files;
            this.handleFiles(files);
        });
        
        input.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
    }

    handleFiles(files) {
        const list = document.getElementById('attachmentsList');
        
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const item = document.createElement('div');
                item.className = 'attachment-item';
                item.innerHTML = `
                    ${file.type.startsWith('image/') ? 
                        `<img src="${e.target.result}" alt="${file.name}">` :
                        `<i class="fas fa-file"></i>`
                    }
                    <div class="attachment-info">
                        <div class="attachment-name">${file.name}</div>
                        <div class="attachment-size">${this.formatBytes(file.size)}</div>
                    </div>
                    <i class="fas fa-trash" onclick="this.parentElement.remove()"></i>
                `;
                list.appendChild(item);
            };
            reader.readAsDataURL(file);
        });
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}