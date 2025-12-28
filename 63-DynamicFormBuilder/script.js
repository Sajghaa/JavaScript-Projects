const FormBuilder = (() => {
    // DOM Elements
    const elements = {
        // Sidebar
        categories: document.querySelectorAll('.category'),
        elementGroups: document.querySelectorAll('.elements-group'),
        formElements: document.querySelectorAll('.element'),
        searchElements: document.getElementById('searchElements'),
        
        // Workspace
        formCanvas: document.getElementById('formCanvas'),
        canvasPlaceholder: document.getElementById('canvasPlaceholder'),
        formTitle: document.getElementById('formTitle'),
        formDescription: document.getElementById('formDescription'),
        elementCount: document.getElementById('elementCount'),
        
        // Properties Panel
        propertiesContainer: document.getElementById('propertiesContainer'),
        selectedElementName: document.getElementById('selectedElementName'),
        
        // Buttons
        previewBtn: document.getElementById('previewBtn'),
        saveBtn: document.getElementById('saveBtn'),
        exportBtn: document.getElementById('exportBtn'),
        undoBtn: document.getElementById('undoBtn'),
        redoBtn: document.getElementById('redoBtn'),
        clearBtn: document.getElementById('clearBtn'),
        duplicateBtn: document.getElementById('duplicateBtn'),
        validateBtn: document.getElementById('validateBtn'),
        settingsBtn: document.getElementById('settingsBtn'),
        
        // Modals
        previewModal: document.getElementById('previewModal'),
        exportModal: document.getElementById('exportModal'),
        settingsModal: document.getElementById('settingsModal'),
        previewContainer: document.getElementById('previewContainer'),
        exportCode: document.getElementById('exportCode'),
        
        // Form Settings
        formTheme: document.getElementById('formTheme'),
        formWidthSlider: document.getElementById('formWidthSlider'),
        formWidthValue: document.getElementById('formWidthValue'),
        showLabels: document.getElementById('showLabels'),
        showPlaceholders: document.getElementById('showPlaceholders'),
        
        // Toast
        toastContainer: document.getElementById('toastContainer')
    };

    // Application State
    let state = {
        form: {
            title: 'Untitled Form',
            description: '',
            fields: [],
            settings: {
                theme: 'light',
                width: 800,
                showLabels: true,
                showPlaceholders: true,
                padding: 20,
                spacing: 15,
                borderRadius: 8,
                enableValidation: true,
                showErrors: true,
                requiredByDefault: false,
                submitAction: 'console',
                successMessage: 'Form submitted successfully!'
            }
        },
        selectedFieldId: null,
        history: [],
        historyIndex: -1,
        draggedElement: null
    };

    // Field Templates
    const fieldTemplates = {
        text: {
            type: 'text',
            label: 'Text Input',
            placeholder: 'Enter text...',
            required: false,
            defaultValue: '',
            description: '',
            validation: {
                minLength: 0,
                maxLength: 100,
                pattern: ''
            }
        },
        textarea: {
            type: 'textarea',
            label: 'Text Area',
            placeholder: 'Enter your message...',
            required: false,
            defaultValue: '',
            description: '',
            rows: 4,
            validation: {
                minLength: 0,
                maxLength: 500
            }
        },
        email: {
            type: 'email',
            label: 'Email Address',
            placeholder: 'your@email.com',
            required: false,
            defaultValue: '',
            description: 'Please enter a valid email address'
        },
        number: {
            type: 'number',
            label: 'Number',
            placeholder: 'Enter a number',
            required: false,
            defaultValue: '',
            description: '',
            validation: {
                min: null,
                max: null,
                step: 1
            }
        },
        select: {
            type: 'select',
            label: 'Dropdown',
            required: false,
            description: 'Select an option',
            options: [
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
                { value: 'option3', label: 'Option 3' }
            ]
        },
        checkbox: {
            type: 'checkbox',
            label: 'Checkbox Group',
            required: false,
            description: 'Select all that apply',
            options: [
                { value: 'option1', label: 'Option 1', checked: false },
                { value: 'option2', label: 'Option 2', checked: false },
                { value: 'option3', label: 'Option 3', checked: false }
            ]
        },
        radio: {
            type: 'radio',
            label: 'Radio Group',
            required: false,
            description: 'Select one option',
            options: [
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
                { value: 'option3', label: 'Option 3' }
            ]
        },
        date: {
            type: 'date',
            label: 'Date',
            required: false,
            description: 'Select a date'
        },
        file: {
            type: 'file',
            label: 'File Upload',
            required: false,
            description: 'Choose a file to upload',
            accept: '*/*',
            multiple: false
        },
        range: {
            type: 'range',
            label: 'Range Slider',
            required: false,
            description: 'Slide to select value',
            min: 0,
            max: 100,
            defaultValue: 50,
            step: 1
        },
        color: {
            type: 'color',
            label: 'Color Picker',
            required: false,
            description: 'Choose a color',
            defaultValue: '#6c63ff'
        },
        password: {
            type: 'password',
            label: 'Password',
            placeholder: 'Enter password',
            required: false,
            description: 'Minimum 8 characters'
        },
        phone: {
            type: 'tel',
            label: 'Phone Number',
            placeholder: '(123) 456-7890',
            required: false,
            description: 'Enter your phone number'
        },
        url: {
            type: 'url',
            label: 'Website URL',
            placeholder: 'https://example.com',
            required: false,
            description: 'Enter a valid URL'
        },
        section: {
            type: 'section',
            title: 'New Section',
            description: 'Section description',
            fields: []
        },
        columns: {
            type: 'columns',
            columns: 2,
            columnFields: [[], []]
        },
        divider: {
            type: 'divider'
        },
        spacer: {
            type: 'spacer',
            height: 40
        },
        heading: {
            type: 'heading',
            text: 'Heading Text',
            level: 2
        },
        paragraph: {
            type: 'paragraph',
            text: 'Paragraph text goes here. You can add any descriptive text or instructions.'
        }
    };

    // Initialize the application
    const init = () => {
        setupEventListeners();
        loadFromLocalStorage();
        updateElementCount();
        setupDragAndDrop();
        createParticles();
        showToast('Form Builder Pro loaded! 🚀', 'success');
    };

    // Setup all event listeners
    const setupEventListeners = () => {
        // Category switching
        elements.categories.forEach(category => {
            category.addEventListener('click', () => {
                const categoryName = category.dataset.category;
                switchCategory(categoryName);
            });
        });

        // Element search
        elements.searchElements.addEventListener('input', searchElements);

        // Form title and description
        elements.formTitle.addEventListener('input', (e) => {
            state.form.title = e.target.value;
            saveToLocalStorage();
        });

        elements.formDescription.addEventListener('input', (e) => {
            state.form.description = e.target.value;
            saveToLocalStorage();
        });

        // Form settings
        elements.formTheme.addEventListener('change', (e) => {
            state.form.settings.theme = e.target.value;
            updateFormPreview();
        });

        elements.formWidthSlider.addEventListener('input', (e) => {
            const width = e.target.value;
            elements.formWidthValue.textContent = `${width}px`;
            elements.formCanvas.style.maxWidth = `${width}px`;
            state.form.settings.width = parseInt(width);
        });

        elements.showLabels.addEventListener('change', (e) => {
            state.form.settings.showLabels = e.target.checked;
        });

        elements.showPlaceholders.addEventListener('change', (e) => {
            state.form.settings.showPlaceholders = e.target.checked;
        });

        // Action buttons
        elements.previewBtn.addEventListener('click', previewForm);
        elements.saveBtn.addEventListener('click', saveForm);
        elements.exportBtn.addEventListener('click', exportForm);
        elements.undoBtn.addEventListener('click', undo);
        elements.redoBtn.addEventListener('click', redo);
        elements.clearBtn.addEventListener('click', clearForm);
        elements.duplicateBtn.addEventListener('click', duplicateSelected);
        elements.validateBtn.addEventListener('click', validateForm);
        elements.settingsBtn.addEventListener('click', openSettings);

        // Modal buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', closeAllModals);
        });

        // Close modals on background click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeAllModals();
                }
            });
        });

        // Export modal
        document.querySelectorAll('.export-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.export-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                const format = option.dataset.format;
                updateExportPreview(format);
            });
        });

        document.getElementById('copyCodeBtn').addEventListener('click', copyExportCode);
        document.getElementById('downloadCodeBtn').addEventListener('click', downloadExportCode);
        document.getElementById('testSubmitBtn').addEventListener('click', testSubmitForm);
        document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);

        // Settings controls
        document.getElementById('formPadding').addEventListener('input', (e) => {
            document.getElementById('formPaddingValue').textContent = `${e.target.value}px`;
            state.form.settings.padding = parseInt(e.target.value);
        });

        document.getElementById('fieldSpacing').addEventListener('input', (e) => {
            document.getElementById('fieldSpacingValue').textContent = `${e.target.value}px`;
            state.form.settings.spacing = parseInt(e.target.value);
        });

        document.getElementById('borderRadius').addEventListener('input', (e) => {
            document.getElementById('borderRadiusValue').textContent = `${e.target.value}px`;
            state.form.settings.borderRadius = parseInt(e.target.value);
        });

        // Double-click to add elements
        elements.formElements.forEach(element => {
            element.addEventListener('dblclick', () => {
                const type = element.dataset.type;
                addField(type);
            });
        });
    };

    // Setup drag and drop
    const setupDragAndDrop = () => {
        // Drag start
        elements.formElements.forEach(element => {
            element.addEventListener('dragstart', (e) => {
                state.draggedElement = element;
                element.classList.add('dragging');
                
                // Set drag image
                setTimeout(() => {
                    element.style.opacity = '0.4';
                }, 0);
            });
            
            element.addEventListener('dragend', () => {
                element.classList.remove('dragging');
                element.style.opacity = '1';
                state.draggedElement = null;
                elements.formCanvas.classList.remove('drag-over');
            });
        });

        // Drag over canvas
        elements.formCanvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            elements.formCanvas.classList.add('drag-over');
        });

        // Drag leave canvas
        elements.formCanvas.addEventListener('dragleave', () => {
            elements.formCanvas.classList.remove('drag-over');
        });

        // Drop on canvas
        elements.formCanvas.addEventListener('drop', (e) => {
            e.preventDefault();
            elements.formCanvas.classList.remove('drag-over');
            
            if (state.draggedElement) {
                const type = state.draggedElement.dataset.type;
                addField(type);
            }
        });

        // Allow dropping elements between existing fields
        elements.formCanvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(e.clientY);
            const draggable = document.querySelector('.dragging');
            
            if (afterElement == null) {
                elements.formCanvas.appendChild(draggable);
            } else {
                elements.formCanvas.insertBefore(draggable, afterElement);
            }
        });
    };

    // Get element after which to insert dragged element
    const getDragAfterElement = (y) => {
        const draggableElements = [...elements.formCanvas.querySelectorAll('.form-field:not(.dragging), .form-section:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    };

    // Switch element category
    const switchCategory = (categoryName) => {
        // Update active category
        elements.categories.forEach(cat => cat.classList.remove('active'));
        document.querySelector(`.category[data-category="${categoryName}"]`).classList.add('active');
        
        // Show corresponding elements group
        elements.elementGroups.forEach(group => group.classList.remove('active'));
        document.getElementById(`${categoryName}Elements`).classList.add('active');
    };

    // Search elements
    const searchElements = () => {
        const searchTerm = elements.searchElements.value.toLowerCase();
        
        elements.formElements.forEach(element => {
            const title = element.querySelector('h4').textContent.toLowerCase();
            const description = element.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                element.style.display = 'flex';
            } else {
                element.style.display = 'none';
            }
        });
    };

    // Add a new field to the form
    const addField = (type, index = -1) => {
        saveToHistory();
        
        const field = {
            id: generateId(),
            ...JSON.parse(JSON.stringify(fieldTemplates[type]))
        };
        
        if (index === -1) {
            state.form.fields.push(field);
        } else {
            state.form.fields.splice(index, 0, field);
        }
        
        renderForm();
        updateElementCount();
        saveToLocalStorage();
        
        // Auto-select the new field
        selectField(field.id);
        
        showToast(`${field.label || field.type} added to form`, 'success');
    };

    // Remove a field from the form
    const removeField = (fieldId) => {
        saveToHistory();
        
        const fieldIndex = state.form.fields.findIndex(f => f.id === fieldId);
        if (fieldIndex === -1) return;
        
        const field = state.form.fields[fieldIndex];
        state.form.fields.splice(fieldIndex, 1);
        
        renderForm();
        updateElementCount();
        saveToLocalStorage();
        
        // Clear selection if the selected field was removed
        if (state.selectedFieldId === fieldId) {
            state.selectedFieldId = null;
            renderPropertiesPanel();
        }
        
        showToast(`${field.label || field.type} removed from form`, 'warning');
    };

    // Update field properties
    const updateField = (fieldId, updates) => {
        const fieldIndex = state.form.fields.findIndex(f => f.id === fieldId);
        if (fieldIndex === -1) return;
        
        state.form.fields[fieldIndex] = {
            ...state.form.fields[fieldIndex],
            ...updates
        };
        
        renderForm();
        selectField(fieldId); // Re-select to update properties panel
        saveToLocalStorage();
    };

    // Select a field
    const selectField = (fieldId) => {
        state.selectedFieldId = fieldId;
        
        // Update UI
        document.querySelectorAll('.form-field, .form-section').forEach(el => {
            el.classList.remove('selected');
        });
        
        const fieldElement = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (fieldElement) {
            fieldElement.classList.add('selected');
            fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        renderPropertiesPanel();
    };

    // Duplicate selected field
    const duplicateSelected = () => {
        if (!state.selectedFieldId) {
            showToast('Please select a field to duplicate', 'warning');
            return;
        }
        
        const fieldIndex = state.form.fields.findIndex(f => f.id === state.selectedFieldId);
        if (fieldIndex === -1) return;
        
        saveToHistory();
        
        const originalField = state.form.fields[fieldIndex];
        const duplicatedField = {
            ...JSON.parse(JSON.stringify(originalField)),
            id: generateId(),
            label: `${originalField.label} (Copy)`
        };
        
        state.form.fields.splice(fieldIndex + 1, 0, duplicatedField);
        
        renderForm();
        updateElementCount();
        selectField(duplicatedField.id);
        saveToLocalStorage();
        
        showToast('Field duplicated successfully', 'success');
    };

    // Render the form
    const renderForm = () => {
        elements.formCanvas.innerHTML = '';
        
        if (state.form.fields.length === 0) {
            elements.canvasPlaceholder.style.display = 'block';
            return;
        }
        
        elements.canvasPlaceholder.style.display = 'none';
        
        state.form.fields.forEach((field, index) => {
            const fieldElement = createFieldElement(field, index);
            elements.formCanvas.appendChild(fieldElement);
        });
    };

    // Create HTML element for a field
    const createFieldElement = (field, index) => {
        const element = document.createElement('div');
        element.className = `form-field ${field.type === 'section' ? 'form-section' : ''}`;
        element.dataset.fieldId = field.id;
        element.dataset.index = index;
        
        // Make draggable
        element.draggable = true;
        element.addEventListener('dragstart', (e) => {
            element.classList.add('dragging');
        });
        
        element.addEventListener('dragend', () => {
            element.classList.remove('dragging');
        });
        
        element.addEventListener('click', (e) => {
            if (!e.target.closest('.control-btn')) {
                selectField(field.id);
            }
        });
        
        // Field header
        const header = document.createElement('div');
        header.className = 'field-header';
        
        const title = document.createElement('div');
        title.className = 'field-title';
        title.textContent = field.label || field.title || field.text || field.type;
        
        const type = document.createElement('div');
        type.className = 'field-type';
        type.textContent = field.type.charAt(0).toUpperCase() + field.type.slice(1);
        
        header.appendChild(title);
        header.appendChild(type);
        
        // Field controls
        const controls = document.createElement('div');
        controls.className = 'field-controls';
        
        const moveUpBtn = createControlButton('fas fa-arrow-up', 'Move Up', () => moveField(field.id, 'up'));
        const moveDownBtn = createControlButton('fas fa-arrow-down', 'Move Down', () => moveField(field.id, 'down'));
        const deleteBtn = createControlButton('fas fa-trash', 'Delete', () => removeField(field.id), 'delete');
        
        if (index === 0) moveUpBtn.disabled = true;
        if (index === state.form.fields.length - 1) moveDownBtn.disabled = true;
        
        controls.appendChild(moveUpBtn);
        controls.appendChild(moveDownBtn);
        controls.appendChild(deleteBtn);
        
        // Field content
        const content = document.createElement('div');
        content.className = 'field-content';
        
        const preview = document.createElement('div');
        preview.className = 'field-preview';
        
        // Render field preview based on type
        switch(field.type) {
            case 'text':
            case 'email':
            case 'number':
            case 'password':
            case 'tel':
            case 'url':
            case 'date':
                const input = document.createElement('input');
                input.type = field.type;
                input.placeholder = field.placeholder || '';
                input.value = field.defaultValue || '';
                if (field.required) input.required = true;
                preview.appendChild(input);
                break;
                
            case 'textarea':
                const textarea = document.createElement('textarea');
                textarea.placeholder = field.placeholder || '';
                textarea.value = field.defaultValue || '';
                textarea.rows = field.rows || 4;
                if (field.required) textarea.required = true;
                preview.appendChild(textarea);
                break;
                
            case 'select':
                const select = document.createElement('select');
                if (field.required) select.required = true;
                field.options.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option.value;
                    optionElement.textContent = option.label;
                    select.appendChild(optionElement);
                });
                preview.appendChild(select);
                break;
                
            case 'checkbox':
                field.options.forEach(option => {
                    const label = document.createElement('label');
                    label.className = 'checkbox-option';
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.value = option.value;
                    checkbox.checked = option.checked || false;
                    
                    const span = document.createElement('span');
                    span.textContent = option.label;
                    
                    label.appendChild(checkbox);
                    label.appendChild(span);
                    preview.appendChild(label);
                });
                break;
                
            case 'radio':
                field.options.forEach(option => {
                    const label = document.createElement('label');
                    label.className = 'radio-option';
                    
                    const radio = document.createElement('input');
                    radio.type = 'radio';
                    radio.name = `radio_${field.id}`;
                    radio.value = option.value;
                    
                    const span = document.createElement('span');
                    span.textContent = option.label;
                    
                    label.appendChild(radio);
                    label.appendChild(span);
                    preview.appendChild(label);
                });
                break;
                
            case 'file':
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                if (field.multiple) fileInput.multiple = true;
                if (field.accept) fileInput.accept = field.accept;
                preview.appendChild(fileInput);
                break;
                
            case 'range':
                const rangeInput = document.createElement('input');
                rangeInput.type = 'range';
                rangeInput.min = field.min || 0;
                rangeInput.max = field.max || 100;
                rangeInput.value = field.defaultValue || 50;
                rangeInput.step = field.step || 1;
                preview.appendChild(rangeInput);
                break;
                
            case 'color':
                const colorInput = document.createElement('input');
                colorInput.type = 'color';
                colorInput.value = field.defaultValue || '#6c63ff';
                preview.appendChild(colorInput);
                break;
                
            case 'section':
                element.innerHTML = `
                    <div class="section-header">
                        <div>
                            <div class="section-title">
                                <i class="fas fa-square"></i>
                                ${field.title || 'New Section'}
                            </div>
                            ${field.description ? `<div class="section-description">${field.description}</div>` : ''}
                        </div>
                    </div>
                `;
                break;
                
            case 'columns':
                element.innerHTML = `
                    <div class="section-header">
                        <div class="section-title">
                            <i class="fas fa-columns"></i>
                            Columns Layout
                        </div>
                    </div>
                    <div class="columns-container">
                        ${Array.from({ length: field.columns || 2 }).map((_, i) => `
                            <div class="column" data-column="${i}">
                                <div class="column-placeholder">
                                    Drop elements here
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
                break;
                
            case 'divider':
                element.innerHTML = '<hr class="form-divider">';
                break;
                
            case 'spacer':
                element.innerHTML = `<div class="form-spacer" style="height: ${field.height || 40}px;"></div>`;
                break;
                
            case 'heading':
                const headingTag = `h${field.level || 2}`;
                element.innerHTML = `<${headingTag} class="form-heading">${field.text || 'Heading'}</${headingTag}>`;
                break;
                
            case 'paragraph':
                element.innerHTML = `<p class="form-paragraph">${field.text || 'Paragraph text'}</p>`;
                break;
        }
        
        // Field description
        if (field.description && !['section', 'heading', 'paragraph'].includes(field.type)) {
            const description = document.createElement('div');
            description.className = 'field-description';
            description.textContent = field.description;
            content.appendChild(description);
        }
        
        content.appendChild(preview);
        
        // Assemble element
        element.appendChild(header);
        element.appendChild(controls);
        element.appendChild(content);
        
        return element;
    };

    // Create a control button
    const createControlButton = (iconClass, title, onClick, extraClass = '') => {
        const button = document.createElement('button');
        button.className = `control-btn ${extraClass}`;
        button.title = title;
        button.innerHTML = `<i class="${iconClass}"></i>`;
        button.addEventListener('click', onClick);
        return button;
    };

    // Move field up or down
    const moveField = (fieldId, direction) => {
        saveToHistory();
        
        const fieldIndex = state.form.fields.findIndex(f => f.id === fieldId);
        if (fieldIndex === -1) return;
        
        const newIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;
        
        if (newIndex >= 0 && newIndex < state.form.fields.length) {
            const field = state.form.fields[fieldIndex];
            state.form.fields.splice(fieldIndex, 1);
            state.form.fields.splice(newIndex, 0, field);
            
            renderForm();
            selectField(fieldId);
            saveToLocalStorage();
        }
    };

    // Render properties panel
    const renderPropertiesPanel = () => {
        if (!state.selectedFieldId) {
            elements.selectedElementName.textContent = 'No element selected';
            elements.propertiesContainer.innerHTML = `
                <div class="empty-properties">
                    <i class="fas fa-mouse-pointer"></i>
                    <h3>Select an Element</h3>
                    <p>Click on any form element to edit its properties</p>
                </div>
            `;
            return;
        }
        
        const field = state.form.fields.find(f => f.id === state.selectedFieldId);
        if (!field) return;
        
        elements.selectedElementName.textContent = field.label || field.title || field.text || field.type;
        
        // Generate properties based on field type
        let propertiesHTML = '';
        
        switch(field.type) {
            case 'text':
            case 'email':
            case 'number':
            case 'password':
            case 'tel':
            case 'url':
            case 'date':
                propertiesHTML = `
                    <div class="property-group">
                        <h4><i class="fas fa-edit"></i> Basic Properties</h4>
                        <div class="property">
                            <label for="field-label">Label</label>
                            <input type="text" id="field-label" value="${field.label || ''}" 
                                   onchange="FormBuilder.updateFieldProperty('${field.id}', 'label', this.value)">
                        </div>
                        <div class="property">
                            <label for="field-placeholder">Placeholder</label>
                            <input type="text" id="field-placeholder" value="${field.placeholder || ''}" 
                                   onchange="FormBuilder.updateFieldProperty('${field.id}', 'placeholder', this.value)">
                        </div>
                        <div class="property">
                            <label for="field-default">Default Value</label>
                            <input type="text" id="field-default" value="${field.defaultValue || ''}" 
                                   onchange="FormBuilder.updateFieldProperty('${field.id}', 'defaultValue', this.value)">
                        </div>
                        <div class="property">
                            <label for="field-description">Description</label>
                            <textarea id="field-description" 
                                      onchange="FormBuilder.updateFieldProperty('${field.id}', 'description', this.value)">${field.description || ''}</textarea>
                        </div>
                        <div class="property-checkbox">
                            <input type="checkbox" id="field-required" ${field.required ? 'checked' : ''} 
                                   onchange="FormBuilder.updateFieldProperty('${field.id}', 'required', this.checked)">
                            <label for="field-required">Required Field</label>
                        </div>
                    </div>
                `;
                break;
                
            case 'textarea':
                propertiesHTML = `
                    <div class="property-group">
                        <h4><i class="fas fa-edit"></i> Basic Properties</h4>
                        <div class="property">
                            <label for="field-label">Label</label>
                            <input type="text" id="field-label" value="${field.label || ''}" 
                                   onchange="FormBuilder.updateFieldProperty('${field.id}', 'label', this.value)">
                        </div>
                        <div class="property">
                            <label for="field-placeholder">Placeholder</label>
                            <input type="text" id="field-placeholder" value="${field.placeholder || ''}" 
                                   onchange="FormBuilder.updateFieldProperty('${field.id}', 'placeholder', this.value)">
                        </div>
                        <div class="property">
                            <label for="field-rows">Rows</label>
                            <input type="number" id="field-rows" value="${field.rows || 4}" min="1" max="20" 
                                   onchange="FormBuilder.updateFieldProperty('${field.id}', 'rows', parseInt(this.value))">
                        </div>
                        <div class="property-checkbox">
                            <input type="checkbox" id="field-required" ${field.required ? 'checked' : ''} 
                                   onchange="FormBuilder.updateFieldProperty('${field.id}', 'required', this.checked)">
                            <label for="field-required">Required Field</label>
                        </div>
                    </div>
                `;
                break;
                
            case 'select':
            case 'checkbox':
            case 'radio':
                propertiesHTML = `
                    <div class="property-group">
                        <h4><i class="fas fa-edit"></i> Basic Properties</h4>
                        <div class="property">
                            <label for="field-label">Label</label>
                            <input type="text" id="field-label" value="${field.label || ''}" 
                                   onchange="FormBuilder.updateFieldProperty('${field.id}', 'label', this.value)">
                        </div>
                        <div class="property">
                            <label for="field-description">Description</label>
                            <textarea id="field-description" 
                                      onchange="FormBuilder.updateFieldProperty('${field.id}', 'description', this.value)">${field.description || ''}</textarea>
                        </div>
                        <div class="property-checkbox">
                            <input type="checkbox" id="field-required" ${field.required ? 'checked' : ''} 
                                   onchange="FormBuilder.updateFieldProperty('${field.id}', 'required', this.checked)">
                            <label for="field-required">Required Field</label>
                        </div>
                    </div>
                    <div class="property-group">
                        <h4><i class="fas fa-list"></i> Options</h4>
                        <div class="options-list" id="options-list-${field.id}">
                            ${field.options.map((option, index) => `
                                <div class="option-item">
                                    <input type="text" value="${option.label}" 
                                           onchange="FormBuilder.updateOption('${field.id}', ${index}, 'label', this.value)"
                                           placeholder="Option label">
                                    <input type="text" value="${option.value}" 
                                           onchange="FormBuilder.updateOption('${field.id}', ${index}, 'value', this.value)"
                                           placeholder="Option value">
                                    ${field.type === 'checkbox' ? `
                                        <input type="checkbox" ${option.checked ? 'checked' : ''}
                                               onchange="FormBuilder.updateOption('${field.id}', ${index}, 'checked', this.checked)">
                                    ` : ''}
                                    <button class="remove-option" onclick="FormBuilder.removeOption('${field.id}', ${index})">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                        <button class="add-option" onclick="FormBuilder.addOption('${field.id}')">
                            <i class="fas fa-plus"></i> Add Option
                        </button>
                    </div>
                `;
                break;
                
            case 'section':
                propertiesHTML = `
                    <div class="property-group">
                        <h4><i class="fas fa-edit"></i> Section Properties</h4>
                        <div class="property">
                            <label for="section-title">Title</label>
                            <input type="text" id="section-title" value="${field.title || ''}" 
                                   onchange="FormBuilder.updateFieldProperty('${field.id}', 'title', this.value)">
                        </div>
                        <div class="property">
                            <label for="section-description">Description</label>
                            <textarea id="section-description" 
                                      onchange="FormBuilder.updateFieldProperty('${field.id}', 'description', this.value)">${field.description || ''}</textarea>
                        </div>
                    </div>
                `;
                break;
                
            case 'heading':
                propertiesHTML = `
                    <div class="property-group">
                        <h4><i class="fas fa-edit"></i> Heading Properties</h4>
                        <div class="property">
                            <label for="heading-text">Text</label>
                            <input type="text" id="heading-text" value="${field.text || ''}" 
                                   onchange="FormBuilder.updateFieldProperty('${field.id}', 'text', this.value)">
                        </div>
                        <div class="property">
                            <label for="heading-level">Heading Level</label>
                            <select id="heading-level" onchange="FormBuilder.updateFieldProperty('${field.id}', 'level', parseInt(this.value))">
                                ${[1, 2, 3, 4, 5, 6].map(level => `
                                    <option value="${level}" ${field.level === level ? 'selected' : ''}>H${level}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                `;
                break;
                
            case 'paragraph':
                propertiesHTML = `
                    <div class="property-group">
                        <h4><i class="fas fa-edit"></i> Paragraph Properties</h4>
                        <div class="property">
                            <label for="paragraph-text">Text</label>
                            <textarea id="paragraph-text" rows="4" 
                                      onchange="FormBuilder.updateFieldProperty('${field.id}', 'text', this.value)">${field.text || ''}</textarea>
                        </div>
                    </div>
                `;
                break;
                
            case 'spacer':
                propertiesHTML = `
                    <div class="property-group">
                        <h4><i class="fas fa-edit"></i> Spacer Properties</h4>
                        <div class="property">
                            <label for="spacer-height">Height (px)</label>
                            <input type="number" id="spacer-height" value="${field.height || 40}" min="10" max="200" 
                                   onchange="FormBuilder.updateFieldProperty('${field.id}', 'height', parseInt(this.value))">
                        </div>
                    </div>
                `;
                break;
        }
        
        elements.propertiesContainer.innerHTML = propertiesHTML;
    };

    // Update field property (public method for inline event handlers)
    const updateFieldProperty = (fieldId, property, value) => {
        const updates = { [property]: value };
        updateField(fieldId, updates);
    };

    // Update option in field
    const updateOption = (fieldId, optionIndex, property, value) => {
        const field = state.form.fields.find(f => f.id === fieldId);
        if (!field || !field.options) return;
        
        field.options[optionIndex][property] = value;
        renderForm();
        selectField(fieldId);
        saveToLocalStorage();
    };

    // Add option to field
    const addOption = (fieldId) => {
        const field = state.form.fields.find(f => f.id === fieldId);
        if (!field || !field.options) return;
        
        const newOption = {
            value: `option${field.options.length + 1}`,
            label: `Option ${field.options.length + 1}`
        };
        
        if (field.type === 'checkbox') {
            newOption.checked = false;
        }
        
        field.options.push(newOption);
        renderForm();
        selectField(fieldId);
        saveToLocalStorage();
    };

    // Remove option from field
    const removeOption = (fieldId, optionIndex) => {
        const field = state.form.fields.find(f => f.id === fieldId);
        if (!field || !field.options || field.options.length <= 1) return;
        
        field.options.splice(optionIndex, 1);
        renderForm();
        selectField(fieldId);
        saveToLocalStorage();
    };

    // Preview form
    const previewForm = () => {
        const previewHTML = generatePreviewHTML();
        elements.previewContainer.innerHTML = previewHTML;
        elements.previewModal.classList.add('active');
    };

    // Generate preview HTML
    const generatePreviewHTML = () => {
        let html = `
            <h2 style="color: var(--primary); margin-bottom: 10px;">${state.form.title}</h2>
            ${state.form.description ? `<p style="color: var(--gray); margin-bottom: 30px;">${state.form.description}</p>` : ''}
            <form id="previewForm" style="display: flex; flex-direction: column; gap: ${state.form.settings.spacing}px;">
        `;
        
        state.form.fields.forEach(field => {
            if (['divider', 'spacer'].includes(field.type)) {
                // Skip layout elements for preview
                return;
            }
            
            let fieldHTML = '';
            
            switch(field.type) {
                case 'text':
                case 'email':
                case 'number':
                case 'password':
                case 'tel':
                case 'url':
                case 'date':
                    fieldHTML = `
                        <div class="form-group">
                            ${state.form.settings.showLabels ? `<label for="${field.id}">${field.label}</label>` : ''}
                            <input type="${field.type}" 
                                   id="${field.id}" 
                                   name="${field.id}"
                                   placeholder="${state.form.settings.showPlaceholders ? (field.placeholder || '') : ''}"
                                   value="${field.defaultValue || ''}"
                                   ${field.required ? 'required' : ''}
                                   style="width: 100%; padding: 12px; border: 2px solid rgba(0,0,0,0.1); border-radius: ${state.form.settings.borderRadius}px;">
                            ${field.description ? `<small style="color: var(--gray);">${field.description}</small>` : ''}
                        </div>
                    `;
                    break;
                    
                case 'textarea':
                    fieldHTML = `
                        <div class="form-group">
                            ${state.form.settings.showLabels ? `<label for="${field.id}">${field.label}</label>` : ''}
                            <textarea id="${field.id}" 
                                      name="${field.id}"
                                      placeholder="${state.form.settings.showPlaceholders ? (field.placeholder || '') : ''}"
                                      rows="${field.rows || 4}"
                                      ${field.required ? 'required' : ''}
                                      style="width: 100%; padding: 12px; border: 2px solid rgba(0,0,0,0.1); border-radius: ${state.form.settings.borderRadius}px;">${field.defaultValue || ''}</textarea>
                            ${field.description ? `<small style="color: var(--gray);">${field.description}</small>` : ''}
                        </div>
                    `;
                    break;
                    
                case 'select':
                    fieldHTML = `
                        <div class="form-group">
                            ${state.form.settings.showLabels ? `<label for="${field.id}">${field.label}</label>` : ''}
                            <select id="${field.id}" 
                                    name="${field.id}"
                                    ${field.required ? 'required' : ''}
                                    style="width: 100%; padding: 12px; border: 2px solid rgba(0,0,0,0.1); border-radius: ${state.form.settings.borderRadius}px;">
                                <option value="">Select an option</option>
                                ${field.options.map(option => `
                                    <option value="${option.value}">${option.label}</option>
                                `).join('')}
                            </select>
                            ${field.description ? `<small style="color: var(--gray);">${field.description}</small>` : ''}
                        </div>
                    `;
                    break;
                    
                case 'checkbox':
                    fieldHTML = `
                        <div class="form-group">
                            ${state.form.settings.showLabels ? `<label>${field.label}</label>` : ''}
                            ${field.options.map(option => `
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                                    <input type="checkbox" 
                                           id="${field.id}_${option.value}" 
                                           name="${field.id}[]" 
                                           value="${option.value}"
                                           ${option.checked ? 'checked' : ''}>
                                    <label for="${field.id}_${option.value}" style="margin: 0;">${option.label}</label>
                                </div>
                            `).join('')}
                            ${field.description ? `<small style="color: var(--gray);">${field.description}</small>` : ''}
                        </div>
                    `;
                    break;
                    
                case 'radio':
                    fieldHTML = `
                        <div class="form-group">
                            ${state.form.settings.showLabels ? `<label>${field.label}</label>` : ''}
                            ${field.options.map(option => `
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                                    <input type="radio" 
                                           id="${field.id}_${option.value}" 
                                           name="${field.id}" 
                                           value="${option.value}">
                                    <label for="${field.id}_${option.value}" style="margin: 0;">${option.label}</label>
                                </div>
                            `).join('')}
                            ${field.description ? `<small style="color: var(--gray);">${field.description}</small>` : ''}
                        </div>
                    `;
                    break;
                    
                case 'section':
                    fieldHTML = `
                        <div style="margin: 20px 0; padding: 20px; background: rgba(108, 99, 255, 0.05); border-radius: ${state.form.settings.borderRadius}px;">
                            <h3 style="color: var(--primary); margin-bottom: 10px;">${field.title || 'Section'}</h3>
                            ${field.description ? `<p style="color: var(--gray);">${field.description}</p>` : ''}
                        </div>
                    `;
                    break;
                    
                case 'heading':
                    fieldHTML = `<h${field.level || 2} style="margin: 20px 0;">${field.text || 'Heading'}</h${field.level || 2}>`;
                    break;
                    
                case 'paragraph':
                    fieldHTML = `<p style="margin: 20px 0; color: var(--gray);">${field.text || 'Paragraph'}</p>`;
                    break;
            }
            
            html += fieldHTML;
        });
        
        html += `
            <button type="submit" style="margin-top: 20px; padding: 15px 30px; background: var(--primary); color: white; border: none; border-radius: ${state.form.settings.borderRadius}px; font-size: 1rem; cursor: pointer;">
                Submit Form
            </button>
            </form>
        `;
        
        return html;
    };

    // Test form submission
    const testSubmitForm = () => {
        const form = document.getElementById('previewForm');
        if (!form) return;
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        
        switch(state.form.settings.submitAction) {
            case 'console':
                console.log('Form submitted:', data);
                alert('Form data logged to console! Check developer tools.');
                break;
            case 'alert':
                alert(JSON.stringify(data, null, 2));
                break;
            case 'redirect':
                // In a real app, this would redirect to a URL
                alert('Form would redirect to submission endpoint');
                break;
            default:
                alert(state.form.settings.successMessage);
        }
    };

    // Export form
    const exportForm = () => {
        updateExportPreview('html');
        elements.exportModal.classList.add('active');
    };

    // Update export preview
    const updateExportPreview = (format) => {
        let code = '';
        
        switch(format) {
            case 'html':
                code = generateHTMLExport();
                break;
            case 'json':
                code = generateJSONExport();
                break;
            case 'react':
                code = generateReactExport();
                break;
            case 'vue':
                code = generateVueExport();
                break;
        }
        
        elements.exportCode.textContent = code;
    };

    // Generate HTML export
    const generateHTMLExport = () => {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${state.form.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .form-container {
            background: white;
            border-radius: 20px;
            padding: ${state.form.settings.padding}px;
            width: 100%;
            max-width: ${state.form.settings.width}px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }
        
        .form-title {
            color: #6c63ff;
            margin-bottom: 10px;
            font-size: 2rem;
        }
        
        .form-description {
            color: #666;
            margin-bottom: 30px;
            line-height: 1.5;
        }
        
        .form-group {
            margin-bottom: ${state.form.settings.spacing}px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #333;
        }
        
        input, textarea, select {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e1e1e1;
            border-radius: ${state.form.settings.borderRadius}px;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        
        input:focus, textarea:focus, select:focus {
            outline: none;
            border-color: #6c63ff;
            box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.1);
        }
        
        textarea {
            min-height: 100px;
            resize: vertical;
        }
        
        button {
            padding: 15px 30px;
            background: linear-gradient(135deg, #6c63ff, #4a43d6);
            color: white;
            border: none;
            border-radius: ${state.form.settings.borderRadius}px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 20px;
        }
        
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(108, 99, 255, 0.3);
        }
        
        .checkbox-group, .radio-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .checkbox-option, .radio-option {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .section {
            background: rgba(108, 99, 255, 0.05);
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
        }
        
        .section-title {
            color: #6c63ff;
            font-size: 1.3rem;
            margin-bottom: 10px;
        }
        
        .section-description {
            color: #666;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="form-container">
        <h1 class="form-title">${state.form.title}</h1>
        ${state.form.description ? `<p class="form-description">${state.form.description}</p>` : ''}
        
        <form id="generatedForm">
            ${generateFormFieldsHTML()}
            
            <button type="submit">Submit Form</button>
        </form>
    </div>
    
    <script>
        document.getElementById('generatedForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            console.log('Form submitted:', data);
            alert('Form submitted successfully! Check console for data.');
        });
    </script>
</body>
</html>`;
    };

    // Generate form fields HTML for export
    const generateFormFieldsHTML = () => {
        let html = '';
        
        state.form.fields.forEach(field => {
            if (['divider', 'spacer'].includes(field.type)) {
                // Skip layout elements
                return;
            }
            
            let fieldHTML = '';
            
            switch(field.type) {
                case 'text':
                case 'email':
                case 'number':
                case 'password':
                case 'tel':
                case 'url':
                case 'date':
                    fieldHTML = `
                        <div class="form-group">
                            <label for="${field.id}">${field.label}</label>
                            <input type="${field.type}" 
                                   id="${field.id}" 
                                   name="${field.id}"
                                   placeholder="${field.placeholder || ''}"
                                   value="${field.defaultValue || ''}"
                                   ${field.required ? 'required' : ''}>
                            ${field.description ? `<small style="color: #666;">${field.description}</small>` : ''}
                        </div>
                    `;
                    break;
                    
                case 'textarea':
                    fieldHTML = `
                        <div class="form-group">
                            <label for="${field.id}">${field.label}</label>
                            <textarea id="${field.id}" 
                                      name="${field.id}"
                                      placeholder="${field.placeholder || ''}"
                                      rows="${field.rows || 4}"
                                      ${field.required ? 'required' : ''}>${field.defaultValue || ''}</textarea>
                            ${field.description ? `<small style="color: #666;">${field.description}</small>` : ''}
                        </div>
                    `;
                    break;
                    
                case 'select':
                    fieldHTML = `
                        <div class="form-group">
                            <label for="${field.id}">${field.label}</label>
                            <select id="${field.id}" 
                                    name="${field.id}"
                                    ${field.required ? 'required' : ''}>
                                <option value="">Select an option</option>
                                ${field.options.map(option => `
                                    <option value="${option.value}">${option.label}</option>
                                `).join('')}
                            </select>
                            ${field.description ? `<small style="color: #666;">${field.description}</small>` : ''}
                        </div>
                    `;
                    break;
                    
                case 'checkbox':
                    fieldHTML = `
                        <div class="form-group">
                            <label>${field.label}</label>
                            <div class="checkbox-group">
                                ${field.options.map(option => `
                                    <div class="checkbox-option">
                                        <input type="checkbox" 
                                               id="${field.id}_${option.value}" 
                                               name="${field.id}[]" 
                                               value="${option.value}"
                                               ${option.checked ? 'checked' : ''}>
                                        <label for="${field.id}_${option.value}">${option.label}</label>
                                    </div>
                                `).join('')}
                            </div>
                            ${field.description ? `<small style="color: #666;">${field.description}</small>` : ''}
                        </div>
                    `;
                    break;
                    
                case 'radio':
                    fieldHTML = `
                        <div class="form-group">
                            <label>${field.label}</label>
                            <div class="radio-group">
                                ${field.options.map(option => `
                                    <div class="radio-option">
                                        <input type="radio" 
                                               id="${field.id}_${option.value}" 
                                               name="${field.id}" 
                                               value="${option.value}">
                                        <label for="${field.id}_${option.value}">${option.label}</label>
                                    </div>
                                `).join('')}
                            </div>
                            ${field.description ? `<small style="color: #666;">${field.description}</small>` : ''}
                        </div>
                    `;
                    break;
                    
                case 'section':
                    fieldHTML = `
                        <div class="section">
                            <h3 class="section-title">${field.title || 'Section'}</h3>
                            ${field.description ? `<p class="section-description">${field.description}</p>` : ''}
                        </div>
                    `;
                    break;
                    
                case 'heading':
                    fieldHTML = `<h${field.level || 2}>${field.text || 'Heading'}</h${field.level || 2}>`;
                    break;
                    
                case 'paragraph':
                    fieldHTML = `<p>${field.text || 'Paragraph'}</p>`;
                    break;
            }
            
            html += fieldHTML;
        });
        
        return html;
    };

    // Generate JSON export
    const generateJSONExport = () => {
        return JSON.stringify({
            form: state.form,
            exportedAt: new Date().toISOString()
        }, null, 2);
    };

    // Generate React export
    const generateReactExport = () => {
        return `import React, { useState } from 'react';
import './Form.css';

const Form = () => {
    const [formData, setFormData] = useState({});
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            const currentValues = formData[name] || [];
            if (checked) {
                setFormData({ ...formData, [name]: [...currentValues, value] });
            } else {
                setFormData({ ...formData, [name]: currentValues.filter(v => v !== value) });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        alert('Form submitted! Check console for data.');
    };
    
    return (
        <div className="form-container">
            <h1 className="form-title">${state.form.title}</h1>
            ${state.form.description ? `<p className="form-description">${state.form.description}</p>` : ''}
            
            <form onSubmit={handleSubmit}>
                ${state.form.fields.map(field => {
                    if (['divider', 'spacer'].includes(field.type)) return '';
                    
                    switch(field.type) {
                        case 'text':
                        case 'email':
                        case 'number':
                        case 'password':
                        case 'tel':
                        case 'url':
                        case 'date':
                            return `
                                <div className="form-group">
                                    <label htmlFor="${field.id}">${field.label}</label>
                                    <input 
                                        type="${field.type}" 
                                        id="${field.id}" 
                                        name="${field.id}"
                                        placeholder="${field.placeholder || ''}"
                                        value={formData.${field.id} || '${field.defaultValue || ''}'}
                                        onChange={handleChange}
                                        ${field.required ? 'required' : ''}
                                    />
                                    ${field.description ? `<small>${field.description}</small>` : ''}
                                </div>
                            `;
                        // Other field types would be handled similarly
                        default:
                            return '';
                    }
                }).join('\n')}
                
                <button type="submit">Submit Form</button>
            </form>
        </div>
    );
};

export default Form;`;
    };

    // Generate Vue export
    const generateVueExport = () => {
        return `<template>
    <div class="form-container">
        <h1 class="form-title">${state.form.title}</h1>
        ${state.form.description ? `<p class="form-description">${state.form.description}</p>` : ''}
        
        <form @submit.prevent="handleSubmit">
            ${state.form.fields.map(field => {
                if (['divider', 'spacer'].includes(field.type)) return '';
                
                switch(field.type) {
                    case 'text':
                    case 'email':
                    case 'number':
                    case 'password':
                    case 'tel':
                    case 'url':
                    case 'date':
                        return `
                            <div class="form-group">
                                <label for="${field.id}">${field.label}</label>
                                <input 
                                    type="${field.type}" 
                                    id="${field.id}" 
                                    v-model="formData.${field.id}"
                                    placeholder="${field.placeholder || ''}"
                                    ${field.required ? 'required' : ''}
                                />
                                ${field.description ? `<small>${field.description}</small>` : ''}
                            </div>
                        `;
                    // Other field types would be handled similarly
                    default:
                        return '';
                }
            }).join('\n')}
            
            <button type="submit">Submit Form</button>
        </form>
    </div>
</template>

<script>
export default {
    name: 'Form',
    data() {
        return {
            formData: {
                ${state.form.fields.filter(f => !['divider', 'spacer', 'section', 'heading', 'paragraph'].includes(f.type))
                    .map(f => `${f.id}: '${f.defaultValue || ''}'`).join(',\n                ')}
            }
        };
    },
    methods: {
        handleSubmit() {
            console.log('Form submitted:', this.formData);
            alert('Form submitted! Check console for data.');
        }
    }
};
</script>

<style scoped>
.form-container {
    background: white;
    border-radius: 20px;
    padding: ${state.form.settings.padding}px;
    max-width: ${state.form.settings.width}px;
    margin: 0 auto;
}

.form-title {
    color: #6c63ff;
    margin-bottom: 10px;
}

.form-description {
    color: #666;
    margin-bottom: 30px;
}

.form-group {
    margin-bottom: ${state.form.settings.spacing}px;
}

label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
}

input, textarea, select {
    width: 100%;
    padding: 12px;
    border: 2px solid #e1e1e1;
    border-radius: ${state.form.settings.borderRadius}px;
}

button {
    padding: 15px 30px;
    background: #6c63ff;
    color: white;
    border: none;
    border-radius: ${state.form.settings.borderRadius}px;
    cursor: pointer;
}
</style>`;
    };

    // Copy export code to clipboard
    const copyExportCode = () => {
        const code = elements.exportCode.textContent;
        navigator.clipboard.writeText(code)
            .then(() => showToast('Code copied to clipboard! 📋', 'success'))
            .catch(() => showToast('Failed to copy code', 'error'));
    };

    // Download export code
    const downloadExportCode = () => {
        const format = document.querySelector('.export-option.active').dataset.format;
        const code = elements.exportCode.textContent;
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `form-${format}.${format === 'json' ? 'json' : format === 'html' ? 'html' : format === 'react' ? 'jsx' : 'vue'}`;
        a.click();
        URL.revokeObjectURL(url);
        
        showToast(`Form downloaded as ${format.toUpperCase()}! 💾`, 'success');
    };

    // Save form
    const saveForm = () => {
        saveToLocalStorage();
        showToast('Form saved successfully! 💾', 'success');
    };

    // Clear form
    const clearForm = () => {
        if (state.form.fields.length === 0) return;
        
        if (confirm('Are you sure you want to clear the entire form? This action cannot be undone.')) {
            saveToHistory();
            state.form.fields = [];
            renderForm();
            updateElementCount();
            state.selectedFieldId = null;
            renderPropertiesPanel();
            saveToLocalStorage();
            showToast('Form cleared', 'warning');
        }
    };

    // Validate form
    const validateForm = () => {
        if (state.form.fields.length === 0) {
            showToast('Form is empty. Add some fields first!', 'warning');
            return;
        }
        
        let errors = [];
        let warnings = [];
        
        // Check for form title
        if (!state.form.title.trim()) {
            warnings.push('Form title is empty');
        }
        
        // Check each field
        state.form.fields.forEach((field, index) => {
            if (field.type === 'text' || field.type === 'textarea') {
                if (!field.label && state.form.settings.showLabels) {
                    warnings.push(`Field ${index + 1} (${field.type}) has no label`);
                }
                
                if (field.validation) {
                    if (field.validation.maxLength && field.validation.maxLength > 1000) {
                        warnings.push(`Field ${index + 1} (${field.label}) has very large max length`);
                    }
                }
            }
            
            if (field.type === 'select' || field.type === 'checkbox' || field.type === 'radio') {
                if (!field.options || field.options.length < 2) {
                    errors.push(`Field ${index + 1} (${field.label}) needs at least 2 options`);
                }
            }
        });
        
        if (errors.length === 0 && warnings.length === 0) {
            showToast('Form validation passed! All checks OK ✅', 'success');
        } else {
            let message = '';
            if (errors.length > 0) {
                message += `Errors:\n${errors.join('\n')}\n\n`;
            }
            if (warnings.length > 0) {
                message += `Warnings:\n${warnings.join('\n')}`;
            }
            alert(message);
        }
    };

    // Open settings
    const openSettings = () => {
        // Populate settings values
        document.getElementById('formPadding').value = state.form.settings.padding;
        document.getElementById('formPaddingValue').textContent = `${state.form.settings.padding}px`;
        document.getElementById('fieldSpacing').value = state.form.settings.spacing;
        document.getElementById('fieldSpacingValue').textContent = `${state.form.settings.spacing}px`;
        document.getElementById('borderRadius').value = state.form.settings.borderRadius;
        document.getElementById('borderRadiusValue').textContent = `${state.form.settings.borderRadius}px`;
        document.getElementById('enableValidation').checked = state.form.settings.enableValidation;
        document.getElementById('showErrors').checked = state.form.settings.showErrors;
        document.getElementById('requiredByDefault').checked = state.form.settings.requiredByDefault;
        document.getElementById('submitAction').value = state.form.settings.submitAction;
        document.getElementById('successMessage').value = state.form.settings.successMessage;
        
        elements.settingsModal.classList.add('active');
    };

    // Save settings
    const saveSettings = () => {
        state.form.settings = {
            ...state.form.settings,
            padding: parseInt(document.getElementById('formPadding').value),
            spacing: parseInt(document.getElementById('fieldSpacing').value),
            borderRadius: parseInt(document.getElementById('borderRadius').value),
            enableValidation: document.getElementById('enableValidation').checked,
            showErrors: document.getElementById('showErrors').checked,
            requiredByDefault: document.getElementById('requiredByDefault').checked,
            submitAction: document.getElementById('submitAction').value,
            successMessage: document.getElementById('successMessage').value
        };
        
        closeAllModals();
        saveToLocalStorage();
        showToast('Settings saved successfully! ⚙️', 'success');
    };

    // History management
    const saveToHistory = () => {
        // Remove any redo history
        state.history = state.history.slice(0, state.historyIndex + 1);
        
        // Save current state
        state.history.push(JSON.stringify(state.form));
        state.historyIndex++;
        
        // Limit history size
        if (state.history.length > 50) {
            state.history.shift();
            state.historyIndex--;
        }
        
        updateUndoRedoButtons();
    };

    const undo = () => {
        if (state.historyIndex > 0) {
            state.historyIndex--;
            state.form = JSON.parse(state.history[state.historyIndex]);
            renderForm();
            updateElementCount();
            updateUndoRedoButtons();
            saveToLocalStorage();
            showToast('Undo successful', 'info');
        }
    };

    const redo = () => {
        if (state.historyIndex < state.history.length - 1) {
            state.historyIndex++;
            state.form = JSON.parse(state.history[state.historyIndex]);
            renderForm();
            updateElementCount();
            updateUndoRedoButtons();
            saveToLocalStorage();
            showToast('Redo successful', 'info');
        }
    };

    const updateUndoRedoButtons = () => {
        elements.undoBtn.disabled = state.historyIndex <= 0;
        elements.redoBtn.disabled = state.historyIndex >= state.history.length - 1;
    };

    // Update element count
    const updateElementCount = () => {
        const count = state.form.fields.length;
        elements.elementCount.textContent = count;
    };

    // Update form preview
    const updateFormPreview = () => {
        // This would update the canvas appearance based on theme
        const theme = state.form.settings.theme;
        // Add theme-specific styling if needed
    };

    // Load from localStorage
    const loadFromLocalStorage = () => {
        const savedForm = localStorage.getItem('formBuilderForm');
        if (savedForm) {
            const parsed = JSON.parse(savedForm);
            state.form = {
                ...state.form,
                ...parsed
            };
            
            // Update UI
            elements.formTitle.value = state.form.title;
            elements.formDescription.value = state.form.description;
            elements.formTheme.value = state.form.settings.theme;
            elements.formWidthSlider.value = state.form.settings.width;
            elements.formWidthValue.textContent = `${state.form.settings.width}px`;
            elements.showLabels.checked = state.form.settings.showLabels;
            elements.showPlaceholders.checked = state.form.settings.showPlaceholders;
            
            // Initialize history
            state.history = [JSON.stringify(state.form)];
            state.historyIndex = 0;
            
            renderForm();
        }
    };

    // Save to localStorage
    const saveToLocalStorage = () => {
        localStorage.setItem('formBuilderForm', JSON.stringify(state.form));
    };

    // Close all modals
    const closeAllModals = () => {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    };

    // Show toast notification
    const showToast = (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-exclamation-circle';
        if (type === 'warning') icon = 'fa-exclamation-triangle';
        
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        elements.toastContainer.appendChild(toast);
        
        // Remove toast after animation
        setTimeout(() => {
            toast.remove();
        }, 3000);
    };

    // Generate unique ID
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    // Create animated particles
    const createParticles = () => {
        const particlesContainer = document.getElementById('particles');
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 20 + 5;
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            const duration = Math.random() * 20 + 10;
            const delay = Math.random() * 5;
            
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                left: ${posX}%;
                top: ${posY}%;
                animation: float ${duration}s infinite ${delay}s linear;
            `;
            
            particlesContainer.appendChild(particle);
        }
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0% {
                    transform: translate(0, 0) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    };

    // Public API for inline event handlers
    window.FormBuilder = {
        updateFieldProperty,
        updateOption,
        addOption,
        removeOption
    };

    return {
        init,
        updateFieldProperty,
        updateOption,
        addOption,
        removeOption
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    FormBuilder.init();
});