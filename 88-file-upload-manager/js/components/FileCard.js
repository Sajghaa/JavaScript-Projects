class FileCard {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render(file, isSelected) {
        const icon = this.getFileIcon(file.typeCategory);
        const size = (file.size / 1024).toFixed(1);
        return `
            <div class="file-card ${isSelected ? 'selected' : ''}" data-id="${file.id}">
                <input type="checkbox" class="file-checkbox" data-id="${file.id}" ${isSelected ? 'checked' : ''}>
                <div class="file-preview">
                    ${this.getPreviewHtml(file)}
                </div>
                <div class="file-info">
                    <div class="file-name" title="${file.name}">${this.truncate(file.name, 20)}</div>
                    <div class="file-meta">${size} KB • ${file.uploadDate.split('T')[0]}</div>
                    ${file.tags && file.tags.length ? `<div class="file-tags">${file.tags.slice(0,2).map(t=>`<span class="file-tag">${t}</span>`).join('')}</div>` : ''}
                </div>
                <div class="file-actions">
                    <button class="file-action edit-metadata" data-id="${file.id}" title="Edit Info"><i class="fas fa-edit"></i></button>
                    <button class="file-action delete-file" data-id="${file.id}" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    }

    getPreviewHtml(file) {
        if(file.typeCategory === 'image') return `<img src="${file.data}" alt="${file.name}" style="width:100%;height:100%;object-fit:cover;">`;
        return `<i class="${this.getFileIcon(file.typeCategory)}"></i>`;
    }

    getFileIcon(type) { const icons = { image: 'fas fa-image', video: 'fas fa-video', audio: 'fas fa-music', document: 'fas fa-file-alt' }; return icons[type] || 'fas fa-file'; }
    truncate(str, len) { return str.length > len ? str.substring(0, len) + '...' : str; }
}
window.FileCard = FileCard;