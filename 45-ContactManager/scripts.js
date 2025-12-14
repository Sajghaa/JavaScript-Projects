class ContactManager {
    constructor() {
        this.contacts = JSON.parse(localStorage.getItem('contacts')) || [];
        this.currentContactId = null;
        this.isEditing = false;
        this.currentView = 'grid';
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.selectedContacts = new Set();
        
        this.init();
    }

    init() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadContacts();
        this.updateStats();
        this.renderCategories();
        this.renderBirthdays();
    }

    initializeElements() {
        // Form elements
        this.contactForm = document.getElementById('contact-form');
        this.firstNameInput = document.getElementById('first-name');
        this.lastNameInput = document.getElementById('last-name');
        this.emailInput = document.getElementById('email');
        this.phoneInput = document.getElementById('phone');
        this.phoneTypeInput = document.getElementById('phone-type');
        this.companyInput = document.getElementById('company');
        this.jobTitleInput = document.getElementById('job-title');
        this.birthdayInput = document.getElementById('birthday');
        this.categoryInput = document.getElementById('category');
        this.addressInput = document.getElementById('address');
        this.notesInput = document.getElementById('notes');
        this.favoriteInput = document.getElementById('favorite');
        this.emergencyInput = document.getElementById('emergency');
        this.avatarPreview = document.getElementById('avatar-preview');
        this.avatarInput = document.getElementById('avatar-input');
        this.uploadAvatarBtn = document.getElementById('upload-avatar');

        // Buttons
        this.clearFormBtn = document.getElementById('clear-form');
        this.cancelEditBtn = document.getElementById('cancel-edit');
        this.saveContactBtn = document.querySelector('button[type="submit"]');

        // Search and filter
        this.searchInput = document.getElementById('search-contacts');
        this.clearSearchBtn = document.getElementById('clear-search');
        this.filterCategory = document.getElementById('filter-category');
        this.sortBy = document.getElementById('sort-by');
        this.filterFavorites = document.getElementById('filter-favorites');
        this.clearFiltersBtn = document.getElementById('clear-filters');

        // View controls
        this.viewButtons = document.querySelectorAll('.view-btn');
        this.contactsGrid = document.getElementById('contacts-grid');
        this.contactsTable = document.getElementById('contacts-table');
        this.contactsTableBody = document.getElementById('contacts-table-body');

        // Bulk actions
        this.bulkDeleteBtn = document.getElementById('bulk-delete');
        this.selectAllBtn = document.getElementById('select-all');
        this.selectAllTable = document.getElementById('select-all-table');

        // Statistics
        this.totalContactsEl = document.getElementById('total-contacts');
        this.favoriteContactsEl = document.getElementById('favorite-contacts');
        this.upcomingBirthdaysEl = document.getElementById('upcoming-birthdays');
        this.recentContactsEl = document.getElementById('recent-contacts');
        this.showingCountEl = document.getElementById('showing-count');
        this.totalCountEl = document.getElementById('total-count');

        // Quick actions
        this.exportBtn = document.getElementById('export-contacts');
        this.importBtn = document.getElementById('import-contacts');
        this.birthdayRemindersBtn = document.getElementById('birthday-reminders');
        this.duplicateCheckBtn = document.getElementById('duplicate-check');

        // Categories and birthdays
        this.categoriesList = document.getElementById('categories-list');
        this.birthdaysList = document.getElementById('birthdays-list');
        this.viewAllBirthdaysBtn = document.getElementById('view-all-birthdays');

        // Footer actions
        this.backupDataBtn = document.getElementById('backup-data');
        this.restoreDataBtn = document.getElementById('restore-data');

        // Templates
        this.contactTemplate = document.getElementById('contact-template');
        this.birthdayTemplate = document.getElementById('birthday-template');
        this.categoryTemplate = document.getElementById('category-template');

        // Modals
        this.importModal = document.getElementById('import-modal');
        this.birthdayModal = document.getElementById('birthday-modal');
        this.confirmModal = document.getElementById('confirm-modal');
        this.contactModal = document.getElementById('contact-modal');

        // Pagination
        this.paginationEl = document.getElementById('pagination');
    }

    setupEventListeners() {
        // Form submission
        this.contactForm.addEventListener('submit', (e) => this.handleSubmit(e));

        // Form buttons
        this.clearFormBtn.addEventListener('click', () => this.clearForm());
        this.cancelEditBtn.addEventListener('click', () => this.cancelEdit());

        // Avatar upload
        this.uploadAvatarBtn.addEventListener('click', () => this.avatarInput.click());
        this.avatarInput.addEventListener('change', (e) => this.handleAvatarUpload(e));
        this.avatarPreview.addEventListener('click', () => this.avatarInput.click());

        // Search and filters
        this.searchInput.addEventListener('input', () => this.filterContacts());
        this.clearSearchBtn.addEventListener('click', () => {
            this.searchInput.value = '';
            this.filterContacts();
        });
        this.filterCategory.addEventListener('change', () => this.filterContacts());
        this.sortBy.addEventListener('change', () => this.filterContacts());
        this.filterFavorites.addEventListener('change', () => this.filterContacts());
        this.clearFiltersBtn.addEventListener('click', () => this.clearFilters());

        // View controls
        this.viewButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
        });

        // Bulk actions
        this.bulkDeleteBtn.addEventListener('click', () => this.deleteSelectedContacts());
        this.selectAllBtn.addEventListener('click', () => this.toggleSelectAll());
        this.selectAllTable.addEventListener('change', (e) => this.toggleSelectAllTable(e.target.checked));

        // Quick actions
        this.exportBtn.addEventListener('click', () => this.exportContacts());
        this.importBtn.addEventListener('click', () => this.openImportModal());
        this.birthdayRemindersBtn.addEventListener('click', () => this.openBirthdayModal());
        this.duplicateCheckBtn.addEventListener('click', () => this.findDuplicates());

        // Birthday modal
        this.viewAllBirthdaysBtn.addEventListener('click', () => this.openBirthdayModal());

        // Footer actions
        this.backupDataBtn.addEventListener('click', () => this.backupData());
        this.restoreDataBtn.addEventListener('click', () => this.restoreData());

        // Modal close buttons
        document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });

        // Import options
        document.querySelectorAll('.option-card').forEach(card => {
            card.addEventListener('click', (e) => this.selectImportOption(e.currentTarget.dataset.type));
        });

        // Confirmation modal
        document.getElementById('confirm-cancel').addEventListener('click', () => this.closeAllModals());
        document.getElementById('confirm-ok').addEventListener('click', () => this.handleConfirm());

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Prevent form submission on Enter in search
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') e.preventDefault();
        });
    }

    // Contact CRUD Operations
    addContact(contactData) {
        const contact = {
            id: Date.now().toString(),
            ...contactData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            avatar: contactData.avatar || null
        };

        this.contacts.unshift(contact);
        this.saveToLocalStorage();
        this.renderContacts();
        this.updateStats();
        this.renderCategories();
        this.renderBirthdays();
        
        this.showNotification('Contact added successfully!', 'success');
    }

    updateContact(id, contactData) {
        const index = this.contacts.findIndex(contact => contact.id === id);
        if (index !== -1) {
            this.contacts[index] = {
                ...this.contacts[index],
                ...contactData,
                updatedAt: new Date().toISOString()
            };
            this.saveToLocalStorage();
            this.renderContacts();
            this.updateStats();
            this.renderCategories();
            this.renderBirthdays();
            
            this.showNotification('Contact updated successfully!', 'success');
        }
    }

    deleteContact(id) {
        this.contacts = this.contacts.filter(contact => contact.id !== id);
        this.selectedContacts.delete(id);
        this.saveToLocalStorage();
        this.renderContacts();
        this.updateStats();
        this.renderCategories();
        this.renderBirthdays();
        
        this.showNotification('Contact deleted successfully!', 'success');
    }

    getContact(id) {
        return this.contacts.find(contact => contact.id === id);
    }

    // Form Handling
    handleSubmit(e) {
        e.preventDefault();
        
        if (!this.firstNameInput.value || !this.lastNameInput.value || !this.phoneInput.value) {
            this.showNotification('Please fill in all required fields (First Name, Last Name, Phone)', 'error');
            return;
        }

        const contactData = {
            firstName: this.firstNameInput.value.trim(),
            lastName: this.lastNameInput.value.trim(),
            email: this.emailInput.value.trim(),
            phone: this.phoneInput.value.trim(),
            phoneType: this.phoneTypeInput.value,
            company: this.companyInput.value.trim(),
            jobTitle: this.jobTitleInput.value.trim(),
            birthday: this.birthdayInput.value,
            category: this.categoryInput.value,
            address: this.addressInput.value.trim(),
            notes: this.notesInput.value.trim(),
            isFavorite: this.favoriteInput.checked,
            isEmergency: this.emergencyInput.checked,
            avatar: this.avatarPreview.dataset.avatar || null
        };

        if (this.isEditing && this.currentContactId) {
            this.updateContact(this.currentContactId, contactData);
        } else {
            this.addContact(contactData);
        }

        this.clearForm();
    }

    clearForm() {
        this.contactForm.reset();
        this.avatarPreview.innerHTML = '<i class="fas fa-user"></i>';
        this.avatarPreview.dataset.avatar = '';
        this.avatarPreview.style.backgroundImage = '';
        this.isEditing = false;
        this.currentContactId = null;
        this.cancelEditBtn.style.display = 'none';
        this.saveContactBtn.innerHTML = '<i class="fas fa-save"></i> Save Contact';
    }

    editContact(id) {
        const contact = this.getContact(id);
        if (!contact) return;

        this.isEditing = true;
        this.currentContactId = id;

        // Populate form fields
        this.firstNameInput.value = contact.firstName;
        this.lastNameInput.value = contact.lastName;
        this.emailInput.value = contact.email || '';
        this.phoneInput.value = contact.phone;
        this.phoneTypeInput.value = contact.phoneType || 'mobile';
        this.companyInput.value = contact.company || '';
        this.jobTitleInput.value = contact.jobTitle || '';
        this.birthdayInput.value = contact.birthday || '';
        this.categoryInput.value = contact.category || 'work';
        this.addressInput.value = contact.address || '';
        this.notesInput.value = contact.notes || '';
        this.favoriteInput.checked = contact.isFavorite || false;
        this.emergencyInput.checked = contact.isEmergency || false;

        // Set avatar
        if (contact.avatar) {
            this.avatarPreview.innerHTML = '';
            this.avatarPreview.style.backgroundImage = `url(${contact.avatar})`;
            this.avatarPreview.dataset.avatar = contact.avatar;
        } else {
            this.avatarPreview.innerHTML = '<i class="fas fa-user"></i>';
            this.avatarPreview.style.backgroundImage = '';
        }

        this.cancelEditBtn.style.display = 'inline-flex';
        this.saveContactBtn.innerHTML = '<i class="fas fa-save"></i> Update Contact';
        
        // Scroll to form
        document.querySelector('.contact-form-section').scrollIntoView({ behavior: 'smooth' });
    }

    cancelEdit() {
        this.clearForm();
    }

    handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select an image file', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            this.showNotification('Image size should be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            this.avatarPreview.innerHTML = '';
            this.avatarPreview.style.backgroundImage = `url(${event.target.result})`;
            this.avatarPreview.dataset.avatar = event.target.result;
            this.avatarPreview.style.backgroundSize = 'cover';
            this.avatarPreview.style.backgroundPosition = 'center';
        };
        reader.readAsDataURL(file);
    }

    // Search and Filtering
    filterContacts() {
        let filteredContacts = [...this.contacts];

        // Search
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filteredContacts = filteredContacts.filter(contact => {
                const searchString = `
                    ${contact.firstName} ${contact.lastName}
                    ${contact.email || ''}
                    ${contact.phone || ''}
                    ${contact.company || ''}
                    ${contact.jobTitle || ''}
                `.toLowerCase();
                return searchString.includes(searchTerm);
            });
        }

        // Filter by category
        const category = this.filterCategory.value;
        if (category !== 'all') {
            filteredContacts = filteredContacts.filter(contact => contact.category === category);
        }

        // Filter favorites
        if (this.filterFavorites.checked) {
            filteredContacts = filteredContacts.filter(contact => contact.isFavorite);
        }

        // Sort
        const sortBy = this.sortBy.value;
        filteredContacts.sort((a, b) => {
            switch (sortBy) {
                case 'name-asc':
                    return (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName);
                case 'name-desc':
                    return (b.firstName + b.lastName).localeCompare(a.firstName + a.lastName);
                case 'recent':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'company':
                    return (a.company || '').localeCompare(b.company || '');
                default:
                    return 0;
            }
        });

        this.renderContacts(filteredContacts);
    }

    clearFilters() {
        this.searchInput.value = '';
        this.filterCategory.value = 'all';
        this.sortBy.value = 'name-asc';
        this.filterFavorites.checked = false;
        this.filterContacts();
    }

    // Rendering
    renderContacts(filteredContacts = null) {
        const contactsToRender = filteredContacts || this.contacts;
        const totalPages = Math.ceil(contactsToRender.length / this.itemsPerPage);
        
        // Paginate
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const paginatedContacts = contactsToRender.slice(startIndex, startIndex + this.itemsPerPage);

        if (this.currentView === 'grid') {
            this.renderGridView(paginatedContacts);
        } else {
            this.renderTableView(paginatedContacts);
        }

        this.updatePagination(totalPages);
        this.updateShowingCount(paginatedContacts.length, contactsToRender.length);
    }

    renderGridView(contacts) {
        this.contactsGrid.innerHTML = '';
        this.contactsGrid.style.display = 'grid';
        this.contactsTable.style.display = 'none';

        if (contacts.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <i class="fas fa-address-book"></i>
                <h3>No contacts found</h3>
                <p>${this.contacts.length === 0 ? 'Add your first contact using the form on the left' : 'Try adjusting your search or filters'}</p>
            `;
            this.contactsGrid.appendChild(emptyState);
            return;
        }

        contacts.forEach(contact => {
            const card = this.createContactCard(contact);
            this.contactsGrid.appendChild(card);
        });
    }

    renderTableView(contacts) {
        this.contactsGrid.style.display = 'none';
        this.contactsTable.style.display = 'block';
        this.contactsTableBody.innerHTML = '';

        if (contacts.length === 0) {
            return;
        }

        contacts.forEach(contact => {
            const row = this.createTableRow(contact);
            this.contactsTableBody.appendChild(row);
        });
    }

    createContactCard(contact) {
        const template = this.contactTemplate.content.cloneNode(true);
        const card = template.querySelector('.contact-card');
        card.dataset.id = contact.id;

        // Set avatar
        const avatar = template.querySelector('.contact-avatar');
        if (contact.avatar) {
            avatar.innerHTML = '';
            avatar.style.backgroundImage = `url(${contact.avatar})`;
            avatar.style.backgroundSize = 'cover';
            avatar.style.backgroundPosition = 'center';
        }

        // Set name
        template.querySelector('.contact-name').textContent = `${contact.firstName} ${contact.lastName}`;

        // Set badges
        if (contact.isFavorite) {
            template.querySelector('.badge.favorite').style.display = 'inline-flex';
        }
        if (contact.isEmergency) {
            template.querySelector('.badge.emergency').style.display = 'inline-flex';
        }

        // Set details
        template.querySelector('.phone').textContent = contact.phone;
        template.querySelector('.detail-type').textContent = contact.phoneType;
        template.querySelector('.email').textContent = contact.email || 'No email';
        template.querySelector('.company').textContent = contact.company || 'No company';
        template.querySelector('.contact-category').textContent = contact.category;
        template.querySelector('.contact-category').className = `contact-category category-${contact.category}`;
        
        // Format date
        const addedDate = new Date(contact.createdAt);
        const today = new Date();
        const diffTime = Math.abs(today - addedDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let dateText = '';
        if (diffDays === 0) {
            dateText = 'Added: Today';
        } else if (diffDays === 1) {
            dateText = 'Added: Yesterday';
        } else if (diffDays < 7) {
            dateText = `Added: ${diffDays} days ago`;
        } else {
            dateText = `Added: ${addedDate.toLocaleDateString()}`;
        }
        template.querySelector('.contact-date').textContent = dateText;

        // Set checkbox state
        const checkbox = template.querySelector('.contact-select');
        checkbox.checked = this.selectedContacts.has(contact.id);
        checkbox.addEventListener('change', (e) => this.toggleContactSelection(contact.id, e.target.checked));

        // Add event listeners to action buttons
        const callBtn = template.querySelector('.btn-call');
        const emailBtn = template.querySelector('.btn-email');
        const editBtn = template.querySelector('.btn-edit');
        const deleteBtn = template.querySelector('.btn-delete');

        callBtn.addEventListener('click', () => this.callContact(contact.phone));
        emailBtn.addEventListener('click', () => this.emailContact(contact.email));
        editBtn.addEventListener('click', () => this.editContact(contact.id));
        deleteBtn.addEventListener('click', () => this.confirmDelete(contact.id));

        // Make whole card clickable for details
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.contact-checkbox') && 
                !e.target.closest('.btn-action') &&
                !e.target.closest('.contact-select')) {
                this.showContactDetails(contact.id);
            }
        });

        return card;
    }

    createTableRow(contact) {
        const row = document.createElement('tr');
        row.dataset.id = contact.id;

        row.innerHTML = `
            <td><input type="checkbox" class="contact-select-table" ${this.selectedContacts.has(contact.id) ? 'checked' : ''}></td>
            <td>${contact.firstName} ${contact.lastName} ${contact.isFavorite ? '<i class="fas fa-star" style="color: gold; margin-left: 5px;"></i>' : ''}</td>
            <td>${contact.phone}</td>
            <td>${contact.email || '—'}</td>
            <td>${contact.company || '—'}</td>
            <td><span class="contact-category category-${contact.category}">${contact.category}</span></td>
            <td>
                <button class="btn-action btn-call" title="Call"><i class="fas fa-phone"></i></button>
                <button class="btn-action btn-email" title="Email"><i class="fas fa-envelope"></i></button>
                <button class="btn-action btn-edit" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn-action btn-delete" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        `;

        // Add event listeners
        const checkbox = row.querySelector('.contact-select-table');
        checkbox.addEventListener('change', (e) => this.toggleContactSelection(contact.id, e.target.checked));

        const callBtn = row.querySelector('.btn-call');
        const emailBtn = row.querySelector('.btn-email');
        const editBtn = row.querySelector('.btn-edit');
        const deleteBtn = row.querySelector('.btn-delete');

        callBtn.addEventListener('click', () => this.callContact(contact.phone));
        emailBtn.addEventListener('click', () => this.emailContact(contact.email));
        editBtn.addEventListener('click', () => this.editContact(contact.id));
        deleteBtn.addEventListener('click', () => this.confirmDelete(contact.id));

        return row;
    }

    updatePagination(totalPages) {
        this.paginationEl.innerHTML = '';

        if (totalPages <= 1) return;

        // Previous button
        if (this.currentPage > 1) {
            const prevBtn = document.createElement('button');
            prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
            prevBtn.addEventListener('click', () => {
                this.currentPage--;
                this.filterContacts();
            });
            this.paginationEl.appendChild(prevBtn);
        }

        // Page buttons
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                const pageBtn = document.createElement('button');
                pageBtn.textContent = i;
                pageBtn.className = i === this.currentPage ? 'active' : '';
                pageBtn.addEventListener('click', () => {
                    this.currentPage = i;
                    this.filterContacts();
                });
                this.paginationEl.appendChild(pageBtn);
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.style.padding = 'var(--spacing-sm) var(--spacing-md)';
                this.paginationEl.appendChild(ellipsis);
            }
        }

        // Next button
        if (this.currentPage < totalPages) {
            const nextBtn = document.createElement('button');
            nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
            nextBtn.addEventListener('click', () => {
                this.currentPage++;
                this.filterContacts();
            });
            this.paginationEl.appendChild(nextBtn);
        }
    }

    renderCategories() {
        this.categoriesList.innerHTML = '';

        const categories = {
            family: { count: 0, color: '#7209b7' },
            friends: { count: 0, color: '#4cc9f0' },
            work: { count: 0, color: '#4361ee' },
            services: { count: 0, color: '#f8961e' },
            other: { count: 0, color: '#6c757d' }
        };

        // Count contacts per category
        this.contacts.forEach(contact => {
            if (categories[contact.category]) {
                categories[contact.category].count++;
            }
        });

        // Create category items
        Object.entries(categories).forEach(([name, data]) => {
            const template = this.categoryTemplate.content.cloneNode(true);
            const categoryItem = template.querySelector('.category-item');
            
            categoryItem.querySelector('.category-color').style.backgroundColor = data.color;
            categoryItem.querySelector('.category-name').textContent = name.charAt(0).toUpperCase() + name.slice(1);
            categoryItem.querySelector('.category-count').textContent = data.count;
            
            categoryItem.addEventListener('click', () => {
                this.filterCategory.value = name;
                this.filterContacts();
            });

            this.categoriesList.appendChild(categoryItem);
        });
    }

    renderBirthdays() {
        this.birthdaysList.innerHTML = '';

        const today = new Date();
        const upcomingBirthdays = this.contacts
            .filter(contact => contact.birthday)
            .map(contact => {
                const birthDate = new Date(contact.birthday);
                const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
                
                if (nextBirthday < today) {
                    nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
                }

                const daysUntil = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
                const age = today.getFullYear() - birthDate.getFullYear();

                return {
                    ...contact,
                    nextBirthday,
                    daysUntil,
                    age: age + (nextBirthday.getFullYear() === today.getFullYear() ? 0 : 1)
                };
            })
            .filter(contact => contact.daysUntil <= 30) // Show birthdays within next 30 days
            .sort((a, b) => a.daysUntil - b.daysUntil)
            .slice(0, 5); // Show only 5 upcoming birthdays

        // Update stats
        this.upcomingBirthdaysEl.textContent = upcomingBirthdays.length;

        if (upcomingBirthdays.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state small';
            emptyState.innerHTML = `
                <i class="fas fa-birthday-cake"></i>
                <p>No upcoming birthdays</p>
            `;
            this.birthdaysList.appendChild(emptyState);
            return;
        }

        upcomingBirthdays.forEach(contact => {
            const template = this.birthdayTemplate.content.cloneNode(true);
            const birthdayItem = template.querySelector('.birthday-item');
            
            const birthDate = new Date(contact.birthday);
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            birthdayItem.querySelector('.birthday-day').textContent = birthDate.getDate();
            birthdayItem.querySelector('.birthday-month').textContent = monthNames[birthDate.getMonth()];
            birthdayItem.querySelector('.birthday-name').textContent = `${contact.firstName} ${contact.lastName}`;
            birthdayItem.querySelector('.birthday-age').textContent = `Turning ${contact.age}`;
            
            const callBtn = birthdayItem.querySelector('.btn-call');
            const messageBtn = birthdayItem.querySelector('.btn-message');
            
            callBtn.addEventListener('click', () => this.callContact(contact.phone));
            messageBtn.addEventListener('click', () => this.sendBirthdayMessage(contact));
            
            this.birthdaysList.appendChild(birthdayItem);
        });
    }

    // Stats and Updates
    updateStats() {
        const totalContacts = this.contacts.length;
        const favoriteContacts = this.contacts.filter(c => c.isFavorite).length;
        
        const recentContacts = this.contacts.filter(contact => {
            const createdDate = new Date(contact.createdAt);
            const today = new Date();
            const diffTime = today - createdDate;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            return diffDays <= 7; // Contacts added in last 7 days
        }).length;

        this.totalContactsEl.textContent = totalContacts;
        this.favoriteContactsEl.textContent = favoriteContacts;
        this.recentContactsEl.textContent = recentContacts;
        this.totalCountEl.textContent = totalContacts;
    }

    updateShowingCount(showing, total) {
        this.showingCountEl.textContent = showing;
        this.totalCountEl.textContent = total;
    }

    // View Management
    switchView(view) {
        this.currentView = view;
        this.currentPage = 1; // Reset to first page when switching views
        
        // Update active button
        this.viewButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        this.renderContacts();
    }

    // Contact Selection
    toggleContactSelection(id, checked) {
        if (checked) {
            this.selectedContacts.add(id);
        } else {
            this.selectedContacts.delete(id);
        }
        
        this.updateBulkDeleteButton();
    }

    toggleSelectAll() {
        const allCheckboxes = document.querySelectorAll('.contact-select, .contact-select-table');
        const allIds = this.contacts.map(contact => contact.id);
        
        if (this.selectedContacts.size === allIds.length) {
            // Deselect all
            this.selectedContacts.clear();
            allCheckboxes.forEach(cb => cb.checked = false);
        } else {
            // Select all
            allIds.forEach(id => this.selectedContacts.add(id));
            allCheckboxes.forEach(cb => cb.checked = true);
        }
        
        this.updateBulkDeleteButton();
    }

    toggleSelectAllTable(checked) {
        const tableCheckboxes = document.querySelectorAll('.contact-select-table');
        const tableRows = document.querySelectorAll('#contacts-table-body tr');
        
        if (checked) {
            tableRows.forEach(row => {
                const id = row.dataset.id;
                this.selectedContacts.add(id);
            });
        } else {
            tableRows.forEach(row => {
                const id = row.dataset.id;
                this.selectedContacts.delete(id);
            });
        }
        
        tableCheckboxes.forEach(cb => cb.checked = checked);
        this.updateBulkDeleteButton();
    }

    updateBulkDeleteButton() {
        const count = this.selectedContacts.size;
        this.bulkDeleteBtn.disabled = count === 0;
        this.bulkDeleteBtn.innerHTML = `<i class="fas fa-trash"></i> Delete Selected (${count})`;
    }

    deleteSelectedContacts() {
        if (this.selectedContacts.size === 0) return;

        this.showConfirmModal(
            'Delete Selected Contacts',
            `Are you sure you want to delete ${this.selectedContacts.size} contact(s)? This action cannot be undone.`,
            () => {
                this.selectedContacts.forEach(id => {
                    this.contacts = this.contacts.filter(contact => contact.id !== id);
                });
                
                this.selectedContacts.clear();
                this.saveToLocalStorage();
                this.renderContacts();
                this.updateStats();
                this.renderCategories();
                this.renderBirthdays();
                
                this.showNotification(`${this.selectedContacts.size} contact(s) deleted successfully!`, 'success');
                this.selectedContacts.clear();
                this.updateBulkDeleteButton();
            }
        );
    }

    // Contact Actions
    callContact(phoneNumber) {
        if (!phoneNumber) {
            this.showNotification('No phone number available', 'error');
            return;
        }
        
        // In a real app, this would initiate a phone call
        // For web, we'll show a confirmation
        this.showConfirmModal(
            'Call Contact',
            `Call ${phoneNumber}?`,
            () => {
                window.open(`tel:${phoneNumber}`, '_blank');
                this.showNotification(`Calling ${phoneNumber}...`, 'info');
            }
        );
    }

    emailContact(email) {
        if (!email) {
            this.showNotification('No email address available', 'error');
            return;
        }
        
        window.open(`mailto:${email}`, '_blank');
    }

    sendBirthdayMessage(contact) {
        const message = `Happy Birthday ${contact.firstName}! 🎉🎂 Wishing you all the best on your special day!`;
        
        // For SMS
        if (contact.phone) {
            window.open(`sms:${contact.phone}?body=${encodeURIComponent(message)}`, '_blank');
        }
        // For email
        else if (contact.email) {
            window.open(`mailto:${contact.email}?subject=Happy Birthday!&body=${encodeURIComponent(message)}`, '_blank');
        } else {
            this.showNotification('No contact method available for birthday message', 'error');
        }
    }

    showContactDetails(id) {
        const contact = this.getContact(id);
        if (!contact) return;

        // Populate modal
        document.getElementById('modal-contact-name').textContent = `${contact.firstName} ${contact.lastName}`;
        document.getElementById('modal-full-name').textContent = `${contact.firstName} ${contact.lastName}`;
        
        // Avatar
        const modalAvatar = document.getElementById('modal-avatar');
        if (contact.avatar) {
            modalAvatar.innerHTML = '';
            modalAvatar.style.backgroundImage = `url(${contact.avatar})`;
            modalAvatar.style.backgroundSize = 'cover';
            modalAvatar.style.backgroundPosition = 'center';
        } else {
            modalAvatar.innerHTML = '<i class="fas fa-user"></i>';
            modalAvatar.style.backgroundImage = '';
        }

        // Badges
        const badgesEl = document.getElementById('modal-badges');
        badgesEl.innerHTML = '';
        if (contact.isFavorite) {
            badgesEl.innerHTML += '<span class="badge favorite"><i class="fas fa-star"></i> Favorite</span>';
        }
        if (contact.isEmergency) {
            badgesEl.innerHTML += '<span class="badge emergency"><i class="fas fa-exclamation-circle"></i> Emergency</span>';
        }

        // Job and company
        document.getElementById('modal-job-title').textContent = contact.jobTitle || 'No job title';
        document.getElementById('modal-company').textContent = contact.company || 'No company';

        // Contact info
        const contactInfoEl = document.getElementById('modal-contact-info');
        contactInfoEl.innerHTML = `
            <div class="detail-grid-item">
                <div class="detail-label">Phone</div>
                <div class="detail-value">${contact.phone} (${contact.phoneType})</div>
            </div>
            <div class="detail-grid-item">
                <div class="detail-label">Email</div>
                <div class="detail-value">${contact.email || 'No email'}</div>
            </div>
            <div class="detail-grid-item">
                <div class="detail-label">Address</div>
                <div class="detail-value">${contact.address || 'No address'}</div>
            </div>
        `;

        // Additional info
        const additionalInfoEl = document.getElementById('modal-additional-info');
        additionalInfoEl.innerHTML = `
            <div class="detail-grid-item">
                <div class="detail-label">Category</div>
                <div class="detail-value">${contact.category}</div>
            </div>
            <div class="detail-grid-item">
                <div class="detail-label">Birthday</div>
                <div class="detail-value">${contact.birthday ? new Date(contact.birthday).toLocaleDateString() : 'Not set'}</div>
            </div>
            <div class="detail-grid-item">
                <div class="detail-label">Added</div>
                <div class="detail-value">${new Date(contact.createdAt).toLocaleDateString()}</div>
            </div>
            <div class="detail-grid-item">
                <div class="detail-label">Last Updated</div>
                <div class="detail-value">${new Date(contact.updatedAt).toLocaleDateString()}</div>
            </div>
        `;

        // Notes
        document.getElementById('modal-notes').textContent = contact.notes || 'No notes available';

        // Modal button actions
        document.getElementById('modal-edit').onclick = () => {
            this.closeAllModals();
            this.editContact(id);
        };
        
        document.getElementById('modal-call').onclick = () => this.callContact(contact.phone);
        document.getElementById('modal-email').onclick = () => this.emailContact(contact.email);

        // Open modal
        this.openModal('contact-modal');
    }

    confirmDelete(id) {
        const contact = this.getContact(id);
        if (!contact) return;

        this.showConfirmModal(
            'Delete Contact',
            `Are you sure you want to delete ${contact.firstName} ${contact.lastName}? This action cannot be undone.`,
            () => this.deleteContact(id)
        );
    }

    // Import/Export
    exportContacts() {
        const dataStr = JSON.stringify(this.contacts, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `contacts-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showNotification('Contacts exported successfully!', 'success');
    }

    openImportModal() {
        this.openModal('import-modal');
    }

    selectImportOption(type) {
        document.querySelectorAll('.option-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`[data-type="${type}"]`);
        selectedCard.classList.add('selected');
        
        // Show appropriate import form
        document.querySelectorAll('.import-form').forEach(form => {
            form.style.display = 'none';
        });
        
        document.getElementById(`${type}-import`).style.display = 'block';
        
        // Enable import button
        document.getElementById('confirm-import').disabled = false;
    }

    importContacts() {
        // This is a simplified import function
        // In a real app, you would handle file parsing based on the format
        const fileInput = document.querySelector('.import-form:not([style*="display: none"]) input[type="file"]');
        
        if (!fileInput.files.length) {
            this.showNotification('Please select a file to import', 'error');
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const importedContacts = JSON.parse(e.target.result);
                
                if (!Array.isArray(importedContacts)) {
                    throw new Error('Invalid file format');
                }
                
                const overwrite = document.getElementById('csv-overwrite')?.checked || false;
                
                if (overwrite) {
                    this.contacts = importedContacts;
                } else {
                    this.contacts = [...importedContacts, ...this.contacts];
                }
                
                this.saveToLocalStorage();
                this.loadContacts();
                this.updateStats();
                this.renderCategories();
                this.renderBirthdays();
                
                this.closeAllModals();
                this.showNotification(`${importedContacts.length} contacts imported successfully!`, 'success');
            } catch (error) {
                this.showNotification('Error importing contacts: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
    }

    findDuplicates() {
        const duplicates = [];
        const seen = new Map(); // phone -> contact
        
        this.contacts.forEach(contact => {
            if (seen.has(contact.phone)) {
                duplicates.push({
                    contact1: seen.get(contact.phone),
                    contact2: contact
                });
            } else {
                seen.set(contact.phone, contact);
            }
        });
        
        if (duplicates.length === 0) {
            this.showNotification('No duplicate contacts found!', 'success');
            return;
        }
        
        // Show duplicates in a modal or alert
        const duplicateList = duplicates.map((dup, i) => 
            `${i + 1}. ${dup.contact1.firstName} ${dup.contact1.lastName} & ${dup.contact2.firstName} ${dup.contact2.lastName} (same phone: ${dup.contact1.phone})`
        ).join('\n');
        
        this.showConfirmModal(
            'Duplicate Contacts Found',
            `Found ${duplicates.length} potential duplicate(s):\n\n${duplicateList}\n\nWould you like to merge duplicates?`,
            () => {
                // Merge duplicates logic
                duplicates.forEach(({ contact1, contact2 }) => {
                    // Keep contact1, remove contact2
                    this.contacts = this.contacts.filter(c => c.id !== contact2.id);
                });
                
                this.saveToLocalStorage();
                this.loadContacts();
                this.showNotification(`${duplicates.length} duplicates merged successfully!`, 'success');
            }
        );
    }

    // Backup/Restore
    backupData() {
        const backup = {
            contacts: this.contacts,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(backup, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `contact-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showNotification('Backup created successfully!', 'success');
    }

    restoreData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const backup = JSON.parse(e.target.result);
                    
                    if (!backup.contacts || !Array.isArray(backup.contacts)) {
                        throw new Error('Invalid backup file');
                    }
                    
                    this.showConfirmModal(
                        'Restore Backup',
                        `This will replace all current contacts with ${backup.contacts.length} contacts from the backup. This action cannot be undone.`,
                        () => {
                            this.contacts = backup.contacts;
                            this.saveToLocalStorage();
                            this.loadContacts();
                            this.updateStats();
                            this.renderCategories();
                            this.renderBirthdays();
                            
                            this.showNotification('Backup restored successfully!', 'success');
                        }
                    );
                } catch (error) {
                    this.showNotification('Error restoring backup: ' + error.message, 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    // Modals
    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = ''; // Restore scrolling
    }

    showConfirmModal(title, message, onConfirm) {
        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-message').textContent = message;
        
        const confirmBtn = document.getElementById('confirm-ok');
        confirmBtn.onclick = () => {
            onConfirm();
            this.closeAllModals();
        };
        
        this.openModal('confirm-modal');
    }

    openBirthdayModal() {
        // This would show a calendar view of all birthdays
        // For now, we'll just show a simple list
        const calendarEl = document.getElementById('birthday-calendar');
        calendarEl.innerHTML = '<p>Birthday calendar view would go here...</p>';
        
        this.openModal('birthday-modal');
    }

    // Utilities
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        // Add styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: var(--radius-md);
                    padding: var(--spacing-md) var(--spacing-lg);
                    box-shadow: var(--shadow-lg);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: var(--spacing-md);
                    z-index: 9999;
                    animation: slideInRight 0.3s ease;
                    max-width: 400px;
                }
                .notification-success {
                    border-left: 4px solid #4cc9f0;
                }
                .notification-error {
                    border-left: 4px solid #f72585;
                }
                .notification-info {
                    border-left: 4px solid #4361ee;
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                }
                .notification-content i {
                    font-size: 1.25rem;
                }
                .notification-success .notification-content i { color: #4cc9f0; }
                .notification-error .notification-content i { color: #f72585; }
                .notification-info .notification-content i { color: #4361ee; }
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 1.25rem;
                    cursor: pointer;
                    color: var(--text-light);
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Add close functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Add animation for removal
        if (!document.querySelector('#notification-animations')) {
            const animStyles = document.createElement('style');
            animStyles.id = 'notification-animations';
            animStyles.textContent = `
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(animStyles);
        }
        
        // Add to document
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    saveToLocalStorage() {
        localStorage.setItem('contacts', JSON.stringify(this.contacts));
    }

    loadContacts() {
        this.contacts = JSON.parse(localStorage.getItem('contacts')) || [];
        this.renderContacts();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.contactManager = new ContactManager();
    
    // Setup import button
    document.getElementById('confirm-import').addEventListener('click', () => {
        window.contactManager.importContacts();
    });
    
    // Setup sample data button (for testing)
    const sampleDataBtn = document.createElement('button');
    sampleDataBtn.className = 'btn btn-outline';
    sampleDataBtn.style.position = 'fixed';
    sampleDataBtn.style.bottom = '20px';
    sampleDataBtn.style.right = '20px';
    sampleDataBtn.style.zIndex = '1000';
    sampleDataBtn.innerHTML = '<i class="fas fa-magic"></i> Add Sample Data';
    sampleDataBtn.addEventListener('click', () => addSampleData());
    document.body.appendChild(sampleDataBtn);
    
    function addSampleData() {
        const sampleContacts = [
            {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '+1 (555) 123-4567',
                phoneType: 'mobile',
                company: 'Tech Corp',
                jobTitle: 'Software Engineer',
                birthday: '1990-05-15',
                category: 'work',
                address: '123 Main St, San Francisco, CA 94107',
                notes: 'Met at conference last year',
                isFavorite: true,
                isEmergency: false,
                createdAt: '2024-01-15T10:30:00.000Z',
                updatedAt: '2024-01-15T10:30:00.000Z'
            },
            {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com',
                phone: '+1 (555) 987-6543',
                phoneType: 'home',
                company: 'Design Studio',
                jobTitle: 'UI/UX Designer',
                birthday: '1988-08-22',
                category: 'friends',
                address: '456 Oak Ave, New York, NY 10001',
                notes: 'College friend',
                isFavorite: true,
                isEmergency: true,
                createdAt: '2024-01-20T14:45:00.000Z',
                updatedAt: '2024-01-20T14:45:00.000Z'
            },
            {
                firstName: 'Robert',
                lastName: 'Johnson',
                email: 'robert.j@example.com',
                phone: '+1 (555) 456-7890',
                phoneType: 'work',
                company: 'Business Inc',
                jobTitle: 'Project Manager',
                birthday: '1985-12-10',
                category: 'work',
                address: '789 Pine St, Chicago, IL 60601',
                notes: 'Client from Q3 project',
                isFavorite: false,
                isEmergency: false,
                createdAt: '2024-02-01T09:15:00.000Z',
                updatedAt: '2024-02-01T09:15:00.000Z'
            },
            {
                firstName: 'Sarah',
                lastName: 'Williams',
                email: 'sarah.w@example.com',
                phone: '+1 (555) 321-6547',
                phoneType: 'mobile',
                company: 'Health Plus',
                jobTitle: 'Doctor',
                birthday: '1992-03-30',
                category: 'family',
                address: '321 Elm St, Boston, MA 02101',
                notes: 'Family physician',
                isFavorite: false,
                isEmergency: true,
                createdAt: '2024-02-05T16:20:00.000Z',
                updatedAt: '2024-02-05T16:20:00.000Z'
            },
            {
                firstName: 'Michael',
                lastName: 'Brown',
                email: 'michael.b@example.com',
                phone: '+1 (555) 654-3210',
                phoneType: 'other',
                company: 'Auto Care',
                jobTitle: 'Mechanic',
                birthday: '1978-07-18',
                category: 'services',
                address: '654 Maple Dr, Houston, TX 77001',
                notes: 'Car repair service',
                isFavorite: false,
                isEmergency: false,
                createdAt: '2024-02-10T11:00:00.000Z',
                updatedAt: '2024-02-10T11:00:00.000Z'
            }
        ];
        
        // Only add sample data if no contacts exist
        if (window.contactManager.contacts.length === 0) {
            sampleContacts.forEach(contact => {
                window.contactManager.addContact(contact);
            });
            window.contactManager.showNotification('Sample data added successfully!', 'success');
        } else {
            window.contactManager.showNotification('You already have contacts. Sample data not added.', 'info');
        }
    }
});