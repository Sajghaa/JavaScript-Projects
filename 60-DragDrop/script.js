document.addEventListener('DOMContentLoaded', function() {

    const foldersGrid = document.getElementById('foldersGrid');
    const filesGrid = document.getElementById('filesGrid');
    const newFolderBtn = document.getElementById('newFolderBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const deleteBtn = document.getElementById('deleteBtn');
    const moveBtn = document.getElementById('moveBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const selectedCount = document.getElementById('selectedCount');
    const contextMenu = document.getElementById('contextMenu');
    const newFolderModal = document.getElementById('newFolderModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const createBtn = document.getElementById('createBtn');
    const folderNameInput = document.getElementById('folderName');
    const toastContainer = document.getElementById('toastContainer');
    
    // Sample data for folders and files
    let folders = [
        { id: 1, name: 'Documents', items: 12, date: '2023-10-15' },
        { id: 2, name: 'Images', items: 47, date: '2023-10-10' },
        { id: 3, name: 'Music', items: 23, date: '2023-10-05' },
        { id: 4, name: 'Videos', items: 8, date: '2023-09-28' },
        { id: 5, name: 'Projects', items: 5, date: '2023-09-20' },
        { id: 6, name: 'Downloads', items: 32, date: '2023-09-15' }
    ];
    
    let files = [
        { id: 1, name: 'Project Report.pdf', size: '2.4 MB', type: 'pdf', date: '2023-10-20' },
        { id: 2, name: 'Vacation Photos.zip', size: '45.2 MB', type: 'zip', date: '2023-10-18' },
        { id: 3, name: 'Budget.xlsx', size: '1.8 MB', type: 'excel', date: '2023-10-15' },
        { id: 4, name: 'Presentation.pptx', size: '5.3 MB', type: 'powerpoint', date: '2023-10-12' },
        { id: 5, name: 'Meeting Notes.docx', size: '0.8 MB', type: 'word', date: '2023-10-10' },
        { id: 6, name: 'Website Design.fig', size: '12.7 MB', type: 'figma', date: '2023-10-05' },
        { id: 7, name: 'Database.sql', size: '3.1 MB', type: 'database', date: '2023-10-01' },
        { id: 8, name: 'Logo.png', size: '0.9 MB', type: 'image', date: '2023-09-28' }
    ];
    
    let selectedItems = [];
    let dragItem = null;
    let contextMenuTarget = null;
    
    // Initialize the file manager
    function initFileManager() {
        renderFolders();
        renderFiles();
        setupEventListeners();
        setupDragAndDrop();
        showToast('File manager loaded successfully!', 'success');
    }
    
    // Render folders
    function renderFolders() {
        foldersGrid.innerHTML = '';
        
        folders.forEach(folder => {
            const folderElement = createFolderElement(folder);
            foldersGrid.appendChild(folderElement);
        });
    }
    
    // Render files
    function renderFiles() {
        filesGrid.innerHTML = '';
        
        files.forEach(file => {
            const fileElement = createFileElement(file);
            filesGrid.appendChild(fileElement);
        });
    }
    
    // Create folder element
    function createFolderElement(folder) {
        const div = document.createElement('div');
        div.className = 'item folder';
        div.draggable = true;
        div.dataset.id = folder.id;
        div.dataset.type = 'folder';
        
        div.innerHTML = `
            <i class="fas fa-folder"></i>
            <div class="item-name">${folder.name}</div>
            <div class="item-size">${folder.items} items</div>
            <div class="item-date">${formatDate(folder.date)}</div>
        `;
        
        return div;
    }
    
    // Create file element
    function createFileElement(file) {
        const div = document.createElement('div');
        div.className = 'item file';
        div.draggable = true;
        div.dataset.id = file.id;
        div.dataset.type = 'file';
        
        // Determine icon based on file type
        let iconClass = 'fa-file';
        if (file.type === 'pdf') iconClass = 'fa-file-pdf';
        if (file.type === 'zip') iconClass = 'fa-file-archive';
        if (file.type === 'excel') iconClass = 'fa-file-excel';
        if (file.type === 'powerpoint') iconClass = 'fa-file-powerpoint';
        if (file.type === 'word') iconClass = 'fa-file-word';
        if (file.type === 'figma') iconClass = 'fa-figma';
        if (file.type === 'database') iconClass = 'fa-database';
        if (file.type === 'image') iconClass = 'fa-file-image';
        
        div.innerHTML = `
            <i class="fas ${iconClass}"></i>
            <div class="item-name">${file.name}</div>
            <div class="item-size">${file.size}</div>
            <div class="item-date">${formatDate(file.date)}</div>
        `;
        
        return div;
    }
    
    // Format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // New folder button
        newFolderBtn.addEventListener('click', () => {
            newFolderModal.classList.add('active');
            folderNameInput.value = 'New Folder';
            folderNameInput.select();
        });
        
        // Cancel folder creation
        cancelBtn.addEventListener('click', () => {
            newFolderModal.classList.remove('active');
        });
        
        // Create folder
        createBtn.addEventListener('click', createNewFolder);
        folderNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') createNewFolder();
        });
        
        // Upload button
        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });
        
        // File input change
        fileInput.addEventListener('change', handleFileUpload);
        
        // Action buttons
        deleteBtn.addEventListener('click', deleteSelectedItems);
        moveBtn.addEventListener('click', moveSelectedItems);
        downloadBtn.addEventListener('click', downloadSelectedItems);
        
        // View toggle buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const view = this.dataset.view;
                const itemsGrids = document.querySelectorAll('.items-grid');
                
                itemsGrids.forEach(grid => {
                    if (view === 'list') {
                        grid.style.gridTemplateColumns = '1fr';
                        grid.classList.add('list-view');
                    } else {
                        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
                        grid.classList.remove('list-view');
                    }
                });
            });
        });
        
        // Close context menu on click elsewhere
        document.addEventListener('click', () => {
            contextMenu.style.display = 'none';
        });
        
        // Close modal on background click
        newFolderModal.addEventListener('click', (e) => {
            if (e.target === newFolderModal) {
                newFolderModal.classList.remove('active');
            }
        });
        
        // Navigation items
        document.querySelectorAll('.nav-list li').forEach(item => {
            item.addEventListener('click', function() {
                document.querySelectorAll('.nav-list li').forEach(li => li.classList.remove('active'));
                this.classList.add('active');
                
                // In a real app, this would load different folder contents
                showToast(`Navigated to ${this.textContent.trim()}`, 'info');
            });
        });
    }
    
    // Setup drag and drop
    function setupDragAndDrop() {
        // Drag start
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('item')) {
                dragItem = e.target;
                e.target.classList.add('dragging');
                
                // Set drag image
                setTimeout(() => {
                    e.target.style.opacity = '0.4';
                }, 0);
                
                // Show drop zone
                dropZone.classList.add('active');
            }
        });
        
        // Drag end
        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('item')) {
                e.target.classList.remove('dragging');
                e.target.style.opacity = '1';
                dragItem = null;
                
                // Hide drop zone
                dropZone.classList.remove('active');
                dropZone.classList.remove('drag-over');
            }
        });
        
        // Drag over
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            
            if (dragItem) {
                dropZone.classList.add('drag-over');
            }
        });
        
        // Drag leave
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });
        
        // Drop
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            dropZone.classList.remove('active');
            
            if (dragItem) {
                const type = dragItem.dataset.type;
                const name = dragItem.querySelector('.item-name').textContent;
                
                // In a real app, this would upload the file to a server
                showToast(`${name} ${type} dropped for upload`, 'success');
                
                // Reset drag item
                dragItem.classList.remove('dragging');
                dragItem.style.opacity = '1';
                dragItem = null;
            }
        });
        
        // Item click for selection
        document.addEventListener('click', (e) => {
            const item = e.target.closest('.item');
            
            if (item) {
                // Handle selection with Ctrl key for multi-select
                if (e.ctrlKey || e.metaKey) {
                    // Toggle selection
                    item.classList.toggle('selected');
                } else {
                    // Single selection - clear others first
                    if (!item.classList.contains('selected')) {
                        clearSelections();
                        item.classList.add('selected');
                    }
                }
                
                // Update selected items
                updateSelectedItems();
            } else {
                // Clicked outside items - clear selection
                clearSelections();
                updateSelectedItems();
            }
        });
        
        // Context menu
        document.addEventListener('contextmenu', (e) => {
            const item = e.target.closest('.item');
            
            if (item) {
                e.preventDefault();
                contextMenuTarget = item;
                
                // Position context menu
                contextMenu.style.left = `${e.pageX}px`;
                contextMenu.style.top = `${e.pageY}px`;
                contextMenu.style.display = 'block';
                
                // Ensure it stays within viewport
                const rect = contextMenu.getBoundingClientRect();
                if (rect.right > window.innerWidth) {
                    contextMenu.style.left = `${e.pageX - rect.width}px`;
                }
                if (rect.bottom > window.innerHeight) {
                    contextMenu.style.top = `${e.pageY - rect.height}px`;
                }
            } else {
                contextMenu.style.display = 'none';
            }
        });
        
        // Context menu actions
        contextMenu.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = e.target.dataset.action || e.target.closest('li').dataset.action;
                
                if (contextMenuTarget) {
                    handleContextMenuAction(action, contextMenuTarget);
                }
                
                contextMenu.style.display = 'none';
            });
        });
    }
    
    // Create new folder
    function createNewFolder() {
        const name = folderNameInput.value.trim();
        
        if (name) {
            // Generate new ID
            const newId = Math.max(...folders.map(f => f.id)) + 1;
            
            // Add new folder
            const newFolder = {
                id: newId,
                name: name,
                items: 0,
                date: new Date().toISOString().split('T')[0]
            };
            
            folders.push(newFolder);
            renderFolders();
            
            newFolderModal.classList.remove('active');
            showToast(`Folder "${name}" created successfully!`, 'success');
        } else {
            showToast('Please enter a folder name', 'error');
        }
    }
    
    // Handle file upload
    function handleFileUpload() {
        if (fileInput.files.length > 0) {
            const filesArray = Array.from(fileInput.files);
            
            filesArray.forEach((file, index) => {
                // Generate new ID
                const newId = Math.max(...files.map(f => f.id), 0) + index + 1;
                
                // Determine file type
                let fileType = 'file';
                if (file.type.includes('image')) fileType = 'image';
                if (file.type.includes('pdf')) fileType = 'pdf';
                if (file.type.includes('zip') || file.type.includes('compressed')) fileType = 'zip';
                if (file.type.includes('spreadsheet') || file.name.endsWith('.xlsx')) fileType = 'excel';
                if (file.type.includes('presentation') || file.name.endsWith('.pptx')) fileType = 'powerpoint';
                if (file.type.includes('document') || file.name.endsWith('.docx')) fileType = 'word';
                
                // Add new file
                const newFile = {
                    id: newId,
                    name: file.name,
                    size: formatFileSize(file.size),
                    type: fileType,
                    date: new Date().toISOString().split('T')[0]
                };
                
                files.push(newFile);
            });
            
            renderFiles();
            showToast(`${filesArray.length} file(s) uploaded successfully!`, 'success');
            
            // Reset file input
            fileInput.value = '';
        }
    }
    
    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    // Update selected items
    function updateSelectedItems() {
        selectedItems = Array.from(document.querySelectorAll('.item.selected'));
        selectedCount.textContent = `${selectedItems.length} item(s) selected`;
        
        // Enable/disable action buttons
        const hasSelection = selectedItems.length > 0;
        deleteBtn.disabled = !hasSelection;
        moveBtn.disabled = !hasSelection;
        downloadBtn.disabled = !hasSelection;
    }
    
    // Clear all selections
    function clearSelections() {
        document.querySelectorAll('.item.selected').forEach(item => {
            item.classList.remove('selected');
        });
    }
    
    // Delete selected items
    function deleteSelectedItems() {
        if (selectedItems.length === 0) return;
        
        // Confirm deletion
        if (confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)) {
            selectedItems.forEach(item => {
                const id = parseInt(item.dataset.id);
                const type = item.dataset.type;
                
                if (type === 'folder') {
                    folders = folders.filter(folder => folder.id !== id);
                } else {
                    files = files.filter(file => file.id !== id);
                }
                
                // Remove from DOM
                item.remove();
            });
            
            showToast(`${selectedItems.length} item(s) deleted successfully!`, 'success');
            
            // Reset selection
            selectedItems = [];
            updateSelectedItems();
        }
    }
    
    // Move selected items
    function moveSelectedItems() {
        if (selectedItems.length === 0) return;
        
        // In a real app, this would open a folder browser to select destination
        const itemNames = selectedItems.map(item => 
            item.querySelector('.item-name').textContent
        ).join(', ');
        
        showToast(`Moving items: ${itemNames}`, 'info');
        
        // For demo, just clear selection
        clearSelections();
        updateSelectedItems();
    }
    
    // Download selected items
    function downloadSelectedItems() {
        if (selectedItems.length === 0) return;
        
        // In a real app, this would trigger actual downloads
        const itemNames = selectedItems.map(item => 
            item.querySelector('.item-name').textContent
        ).join(', ');
        
        showToast(`Downloading items: ${itemNames}`, 'info');
        
        // Clear selection
        clearSelections();
        updateSelectedItems();
    }
    
    // Handle context menu actions
    function handleContextMenuAction(action, target) {
        const id = parseInt(target.dataset.id);
        const type = target.dataset.type;
        const name = target.querySelector('.item-name').textContent;
        
        switch(action) {
            case 'open':
                showToast(`Opening ${type}: ${name}`, 'info');
                break;
                
            case 'rename':
                const newName = prompt(`Rename ${type}:`, name);
                if (newName && newName.trim() !== name) {
                    // Update in data
                    if (type === 'folder') {
                        const folder = folders.find(f => f.id === id);
                        if (folder) folder.name = newName.trim();
                    } else {
                        const file = files.find(f => f.id === id);
                        if (file) file.name = newName.trim();
                    }
                    
                    // Update in DOM
                    target.querySelector('.item-name').textContent = newName.trim();
                    showToast(`${type} renamed to "${newName.trim()}"`, 'success');
                }
                break;
                
            case 'move':
                showToast(`Moving ${type}: ${name}`, 'info');
                break;
                
            case 'download':
                showToast(`Downloading ${type}: ${name}`, 'info');
                break;
                
            case 'delete':
                if (confirm(`Are you sure you want to delete "${name}"?`)) {
                    if (type === 'folder') {
                        folders = folders.filter(folder => folder.id !== id);
                    } else {
                        files = files.filter(file => file.id !== id);
                    }
                    
                    target.remove();
                    showToast(`"${name}" deleted successfully!`, 'success');
                }
                break;
        }
    }
    
    // Show toast notification
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-exclamation-circle';
        
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        // Remove toast after animation
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    

    initFileManager();
});