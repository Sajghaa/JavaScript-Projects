
document.addEventListener('DOMContentLoaded', function() {
 
    const vaultStatus = document.getElementById('vault-status');
    const vaultContent = document.getElementById('vault-content');
    const masterPasswordInput = document.getElementById('master-password');
    const unlockVaultBtn = document.getElementById('unlock-vault');
    const lockVaultBtn = document.getElementById('lock-vault');
    const changeMasterBtn = document.getElementById('change-master');
    const addPasswordBtn = document.getElementById('add-password');
    const passwordsList = document.getElementById('passwords-list');
    const passwordForm = document.getElementById('password-form');
    const emptyDetails = document.getElementById('empty-details');
    const searchPasswordsInput = document.getElementById('search-passwords');
    const categoryFilter = document.getElementById('category-filter');
    const exportPasswordsBtn = document.getElementById('export-passwords');
    const importPasswordsBtn = document.getElementById('import-passwords');
    const exportBackupBtn = document.getElementById('export-backup');
    const clearDataBtn = document.getElementById('clear-data');
    const runAuditBtn = document.getElementById('run-audit');
    
    // Password Generator Elements
    const generatedPasswordEl = document.getElementById('generated-password');
    const copyPasswordBtn = document.getElementById('copy-password');
    const refreshPasswordBtn = document.getElementById('refresh-password');
    const saveGeneratedBtn = document.getElementById('save-generated');
    const generatePasswordBtn = document.getElementById('generate-password');
    const passwordLengthInput = document.getElementById('password-length');
    const lengthValueEl = document.getElementById('length-value');
    const includeUppercase = document.getElementById('include-uppercase');
    const includeLowercase = document.getElementById('include-lowercase');
    const includeNumbers = document.getElementById('include-numbers');
    const includeSymbols = document.getElementById('include-symbols');
    const excludeSimilar = document.getElementById('exclude-similar');
    const excludeAmbiguous = document.getElementById('exclude-ambiguous');
    const strengthMeterBar = document.getElementById('strength-meter-bar');
    const strengthText = document.getElementById('strength-text');
    
    // Statistics Elements
    const totalPasswordsEl = document.getElementById('total-passwords');
    const securityScoreEl = document.getElementById('security-score');
    const lastUpdatedEl = document.getElementById('last-updated');
    const lastBackupEl = document.getElementById('last-backup');
    
    // Audit Elements
    const weakPasswordsEl = document.getElementById('weak-passwords');
    const reusedPasswordsEl = document.getElementById('reused-passwords');
    const expiringPasswordsEl = document.getElementById('expiring-passwords');
    const favoritePasswordsEl = document.getElementById('favorite-passwords');
    
    // Form Elements
    const passwordIdInput = document.getElementById('password-id');
    const passwordTitleInput = document.getElementById('password-title');
    const passwordCategoryInput = document.getElementById('password-category');
    const passwordUsernameInput = document.getElementById('password-username');
    const passwordUrlInput = document.getElementById('password-url');
    const passwordValueInput = document.getElementById('password-value');
    const passwordNotesInput = document.getElementById('password-notes');
    const passwordFavoriteInput = document.getElementById('password-favorite');
    const passwordExpiresInput = document.getElementById('password-expires');
    const expirationDateDiv = document.getElementById('expiration-date');
    const passwordExpirationInput = document.getElementById('password-expiration');
    const detailStrengthBar = document.getElementById('detail-strength-bar');
    const detailStrengthText = document.getElementById('detail-strength-text');
    const savePasswordBtn = document.getElementById('save-password');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const deletePasswordBtn = document.getElementById('delete-password');
    
    // Modals
    const setupModal = document.getElementById('setup-modal');
    const changeMasterModal = document.getElementById('change-master-modal');
    const importModal = document.getElementById('import-modal');
    const confirmModal = document.getElementById('confirm-modal');
    
    // Templates
    const passwordTemplate = document.getElementById('password-template');
    
    // Application State
    let passwords = [];
    let vaultLocked = true;
    let masterPassword = null;
    let currentPage = 1;
    const passwordsPerPage = 10;
    let selectedPasswordId = null;
    
    // Character sets for password generation
    const characterSets = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };
    
    // Similar and ambiguous characters to exclude
    const similarChars = 'il1Lo0';
    const ambiguousChars = '{}[]()/\\\'"`~,;:.<>';
    
    // Initialize the app
    function init() {
        console.log('Initializing SecurePass Manager...');
        
        // Check if master password is set
        checkMasterPassword();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize password generator
        initPasswordGenerator();
        
        // Set default expiration date to 90 days from now
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 90);
        passwordExpirationInput.min = new Date().toISOString().split('T')[0];
        passwordExpirationInput.value = futureDate.toISOString().split('T')[0];
        
        // Update statistics
        updateStats();
    }
    
    // Check if master password is set
    function checkMasterPassword() {
        const masterHash = localStorage.getItem('securepass_master_hash');
        const vaultData = localStorage.getItem('securepass_vault');
        
        if (!masterHash || !vaultData) {
            // First time setup needed
            showSetupModal();
        } else {
            // Vault exists but is locked
            lockVault();
        }
    }
    
    // Show setup modal for first-time users
    function showSetupModal() {
        setupModal.classList.add('active');
        
        // Setup form validation
        const newMasterInput = document.getElementById('new-master-password');
        const confirmMasterInput = document.getElementById('confirm-master-password');
        const saveMasterBtn = document.getElementById('save-master');
        
        const validateSetupForm = () => {
            const password = newMasterInput.value;
            const confirm = confirmMasterInput.value;
            
            // Validate password requirements
            const validations = {
                length: password.length >= 12,
                uppercase: /[A-Z]/.test(password),
                lowercase: /[a-z]/.test(password),
                number: /\d/.test(password),
                symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
                match: password === confirm && password.length > 0
            };
            
            // Update hints
            document.getElementById('length-hint').className = 
                `hint-item ${validations.length ? 'valid' : ''}`;
            document.getElementById('uppercase-hint').className = 
                `hint-item ${validations.uppercase ? 'valid' : ''}`;
            document.getElementById('lowercase-hint').className = 
                `hint-item ${validations.lowercase ? 'valid' : ''}`;
            document.getElementById('number-hint').className = 
                `hint-item ${validations.number ? 'valid' : ''}`;
            document.getElementById('symbol-hint').className = 
                `hint-item ${validations.symbol ? 'valid' : ''}`;
            document.getElementById('password-match').className = 
                `password-match ${validations.match ? 'valid' : ''}`;
            
            // Enable save button if all validations pass
            saveMasterBtn.disabled = !Object.values(validations).every(v => v);
        };
        
        newMasterInput.addEventListener('input', validateSetupForm);
        confirmMasterInput.addEventListener('input', validateSetupForm);
        
        // Toggle password visibility
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', function() {
                const targetId = this.dataset.target;
                const input = document.getElementById(targetId);
                const icon = this.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.className = 'fas fa-eye-slash';
                } else {
                    input.type = 'password';
                    icon.className = 'far fa-eye';
                }
            });
        });
        
        // Save master password
        saveMasterBtn.addEventListener('click', () => {
            const password = newMasterInput.value;
            const hint = document.getElementById('hint-question').value;
            
            // Create master password hash (in real app, use proper hashing like bcrypt)
            const masterHash = btoa(encodeURIComponent(password));
            
            // Save to localStorage
            localStorage.setItem('securepass_master_hash', masterHash);
            if (hint) {
                localStorage.setItem('securepass_master_hint', hint);
            }
            
            // Initialize empty vault
            localStorage.setItem('securepass_vault', JSON.stringify([]));
            localStorage.setItem('securepass_last_backup', new Date().toISOString());
            
            // Close modal and unlock vault
            setupModal.classList.remove('active');
            masterPassword = password;
            unlockVault();
            
            showNotification('Vault created successfully!', 'success');
        });
        
        // Validate on load
        validateSetupForm();
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Vault actions
        unlockVaultBtn.addEventListener('click', unlockVault);
        lockVaultBtn.addEventListener('click', lockVault);
        changeMasterBtn.addEventListener('click', showChangeMasterModal);
        
        // Toggle password visibility
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', function() {
                const targetId = this.dataset.target;
                const input = document.getElementById(targetId);
                const icon = this.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.className = 'fas fa-eye-slash';
                } else {
                    input.type = 'password';
                    icon.className = 'far fa-eye';
                }
            });
        });
        
        // Add password button
        addPasswordBtn.addEventListener('click', () => {
            showPasswordForm();
        });
        
        // Search and filter
        searchPasswordsInput.addEventListener('input', renderPasswordsList);
        categoryFilter.addEventListener('change', renderPasswordsList);
        
        // Export/Import
        exportPasswordsBtn.addEventListener('click', exportPasswords);
        importPasswordsBtn.addEventListener('click', showImportModal);
        exportBackupBtn.addEventListener('click', exportFullBackup);
        
        // Clear data
        clearDataBtn.addEventListener('click', () => {
            showConfirmation(
                'Clear All Data',
                'This will delete ALL passwords and reset the vault. This action cannot be undone!',
                clearAllData
            );
        });
        
        // Run audit
        runAuditBtn.addEventListener('click', runSecurityAudit);
        
        // Form events
        passwordForm.addEventListener('submit', savePassword);
        cancelEditBtn.addEventListener('click', cancelEdit);
        deletePasswordBtn.addEventListener('click', deleteSelectedPassword);
        
        // Password strength calculation
        passwordValueInput.addEventListener('input', updatePasswordStrength);
        
        // Expiration date toggle
        passwordExpiresInput.addEventListener('change', function() {
            expirationDateDiv.style.display = this.checked ? 'block' : 'none';
        });
        
        // Generate password from details
        document.querySelector('.generate-from-details').addEventListener('click', () => {
            const generated = generatePassword();
            passwordValueInput.value = generated;
            updatePasswordStrength();
        });
    }
    
    // Initialize password generator
    function initPasswordGenerator() {
        // Update length display
        passwordLengthInput.addEventListener('input', function() {
            lengthValueEl.textContent = this.value;
        });
        
        // Copy password to clipboard
        copyPasswordBtn.addEventListener('click', () => {
            const password = generatedPasswordEl.textContent;
            if (password && password !== 'Click Generate') {
                navigator.clipboard.writeText(password)
                    .then(() => showNotification('Password copied to clipboard!', 'success'))
                    .catch(() => showNotification('Failed to copy password', 'error'));
            }
        });
        
        // Refresh password
        refreshPasswordBtn.addEventListener('click', () => {
            const password = generatePassword();
            generatedPasswordEl.textContent = password;
            updatePasswordStrengthDisplay(password);
        });
        
        // Save generated password
        saveGeneratedBtn.addEventListener('click', () => {
            const password = generatedPasswordEl.textContent;
            if (password && password !== 'Click Generate') {
                passwordValueInput.value = password;
                updatePasswordStrength();
                showNotification('Password copied to form', 'success');
            }
        });
        
        // Generate password button
        generatePasswordBtn.addEventListener('click', () => {
            const password = generatePassword();
            generatedPasswordEl.textContent = password;
            updatePasswordStrengthDisplay(password);
        });
        
        // Initial generation
        const initialPassword = generatePassword();
        generatedPasswordEl.textContent = initialPassword;
        updatePasswordStrengthDisplay(initialPassword);
    }
    
    // Generate random password
    function generatePassword() {
        const length = parseInt(passwordLengthInput.value);
        let charset = '';
        
        // Build character set based on selections
        if (includeUppercase.checked) charset += characterSets.uppercase;
        if (includeLowercase.checked) charset += characterSets.lowercase;
        if (includeNumbers.checked) charset += characterSets.numbers;
        if (includeSymbols.checked) charset += characterSets.symbols;
        
        // Remove excluded characters
        if (excludeSimilar.checked) {
            charset = charset.split('').filter(char => !similarChars.includes(char)).join('');
        }
        
        if (excludeAmbiguous.checked) {
            charset = charset.split('').filter(char => !ambiguousChars.includes(char)).join('');
        }
        
        // Ensure at least one character set is selected
        if (charset.length === 0) {
            charset = characterSets.lowercase + characterSets.uppercase + characterSets.numbers;
        }
        
        // Generate password
        let password = '';
        const randomValues = new Uint32Array(length);
        crypto.getRandomValues(randomValues);
        
        for (let i = 0; i < length; i++) {
            password += charset[randomValues[i] % charset.length];
        }
        
        return password;
    }
    
    // Calculate password strength
    function calculatePasswordStrength(password) {
        if (!password) return { score: 0, text: 'Very Weak' };
        
        let score = 0;
        const length = password.length;
        
        // Length points
        if (length >= 8) score += 10;
        if (length >= 12) score += 10;
        if (length >= 16) score += 10;
        
        // Character variety points
        if (/[a-z]/.test(password)) score += 10;
        if (/[A-Z]/.test(password)) score += 10;
        if (/\d/.test(password)) score += 10;
        if (/[^a-zA-Z0-9]/.test(password)) score += 10;
        
        // Deductions for patterns
        if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
        if (/(abc|123|password|qwerty)/i.test(password)) score -= 20; // Common patterns
        
        // Cap score between 0 and 100
        score = Math.max(0, Math.min(100, score));
        
        // Determine strength text
        let text;
        if (score >= 80) text = 'Very Strong';
        else if (score >= 60) text = 'Strong';
        else if (score >= 40) text = 'Good';
        else if (score >= 20) text = 'Weak';
        else text = 'Very Weak';
        
        return { score, text };
    }
    
    // Update password strength display for generator
    function updatePasswordStrengthDisplay(password) {
        const { score, text } = calculatePasswordStrength(password);
        
        strengthMeterBar.style.width = `${score}%`;
        strengthText.textContent = text;
        
        // Update color based on strength
        if (score >= 80) {
            strengthMeterBar.style.background = '#06d6a0';
            strengthText.style.color = '#06d6a0';
        } else if (score >= 60) {
            strengthMeterBar.style.background = '#4cc9f0';
            strengthText.style.color = '#4cc9f0';
        } else if (score >= 40) {
            strengthMeterBar.style.background = '#ffd166';
            strengthText.style.color = '#ffd166';
        } else if (score >= 20) {
            strengthMeterBar.style.background = '#f8961e';
            strengthText.style.color = '#f8961e';
        } else {
            strengthMeterBar.style.background = '#ef476f';
            strengthText.style.color = '#ef476f';
        }
    }
    
    // Update password strength for form
    function updatePasswordStrength() {
        const password = passwordValueInput.value;
        const { score, text } = calculatePasswordStrength(password);
        
        detailStrengthBar.style.width = `${score}%`;
        detailStrengthText.textContent = text;
        
        // Update color based on strength
        if (score >= 80) {
            detailStrengthBar.style.background = '#06d6a0';
            detailStrengthText.style.color = '#06d6a0';
        } else if (score >= 60) {
            detailStrengthBar.style.background = '#4cc9f0';
            detailStrengthText.style.color = '#4cc9f0';
        } else if (score >= 40) {
            detailStrengthBar.style.background = '#ffd166';
            detailStrengthText.style.color = '#ffd166';
        } else if (score >= 20) {
            detailStrengthBar.style.background = '#f8961e';
            detailStrengthText.style.color = '#f8961e';
        } else {
            detailStrengthBar.style.background = '#ef476f';
            detailStrengthText.style.color = '#ef476f';
        }
    }
    
    // Unlock vault
    function unlockVault() {
        const inputPassword = masterPasswordInput.value;
        
        if (!vaultLocked) return;
        
        // Get stored hash
        const storedHash = localStorage.getItem('securepass_master_hash');
        const inputHash = btoa(encodeURIComponent(inputPassword));
        
        if (inputHash === storedHash) {
            // Success - unlock vault
            masterPassword = inputPassword;
            vaultLocked = false;
            
            // Update UI
            vaultStatus.style.display = 'none';
            vaultContent.style.display = 'block';
            
            // Update security header
            document.querySelector('.status-text').textContent = 'Vault Unlocked';
            document.querySelector('.status-indicator').className = 'status-indicator unlocked';
            
            // Clear password field
            masterPasswordInput.value = '';
            
            // Load passwords
            loadPasswords();
            
            showNotification('Vault unlocked successfully!', 'success');
        } else {
            showNotification('Incorrect master password', 'error');
            masterPasswordInput.value = '';
            masterPasswordInput.focus();
        }
    }
    
    // Lock vault
    function lockVault() {
        vaultLocked = true;
        masterPassword = null;
        
        // Update UI
        vaultStatus.style.display = 'block';
        vaultContent.style.display = 'none';
        
        // Update security header
        document.querySelector('.status-text').textContent = 'Vault Locked';
        document.querySelector('.status-indicator').className = 'status-indicator locked';
        
        // Clear password list
        passwordsList.innerHTML = '<div class="empty-state"><i class="fas fa-lock"></i><h3>No passwords saved</h3><p>Add your first password or unlock the vault</p></div>';
        
        // Hide password form
        passwordForm.style.display = 'none';
        emptyDetails.style.display = 'block';
        
        showNotification('Vault locked', 'info');
    }
    
    // Show change master password modal
    function showChangeMasterModal() {
        changeMasterModal.classList.add('active');
        
        // Setup modal event listeners
        const modalClose = changeMasterModal.querySelector('.modal-close');
        const modalCloseBtn = changeMasterModal.querySelector('.modal-close-btn');
        const confirmBtn = document.getElementById('confirm-change-master');
        
        const closeModal = () => {
            changeMasterModal.classList.remove('active');
            document.getElementById('change-master-form').reset();
        };
        
        modalClose.addEventListener('click', closeModal);
        modalCloseBtn.addEventListener('click', closeModal);
        
        confirmBtn.addEventListener('click', () => {
            const current = document.getElementById('current-master').value;
            const newPass = document.getElementById('new-master').value;
            const confirm = document.getElementById('confirm-new-master').value;
            
            // Validate current password
            const currentHash = btoa(encodeURIComponent(current));
            const storedHash = localStorage.getItem('securepass_master_hash');
            
            if (currentHash !== storedHash) {
                showNotification('Current password is incorrect', 'error');
                return;
            }
            
            // Validate new password
            if (newPass.length < 12) {
                showNotification('New password must be at least 12 characters', 'error');
                return;
            }
            
            if (newPass !== confirm) {
                showNotification('New passwords do not match', 'error');
                return;
            }
            
            // Update master password
            const newHash = btoa(encodeURIComponent(newPass));
            localStorage.setItem('securepass_master_hash', newHash);
            
            // Re-encrypt all passwords with new master key (simplified - in real app use proper encryption)
            const vaultData = JSON.parse(localStorage.getItem('securepass_vault') || '[]');
            localStorage.setItem('securepass_vault', JSON.stringify(vaultData));
            
            // Update current master password
            masterPassword = newPass;
            
            closeModal();
            showNotification('Master password changed successfully!', 'success');
        });
    }
    
    // Load passwords from localStorage
    function loadPasswords() {
        try {
            const vaultData = localStorage.getItem('securepass_vault');
            if (vaultData) {
                passwords = JSON.parse(vaultData);
                console.log(`Loaded ${passwords.length} passwords from vault`);
            }
        } catch (error) {
            console.error('Error loading passwords:', error);
            passwords = [];
        }
        
        renderPasswordsList();
        updateStats();
    }
    
    // Save passwords to localStorage
    function savePasswords() {
        try {
            localStorage.setItem('securepass_vault', JSON.stringify(passwords));
            localStorage.setItem('securepass_last_updated', new Date().toISOString());
            console.log(`Saved ${passwords.length} passwords to vault`);
        } catch (error) {
            console.error('Error saving passwords:', error);
            showNotification('Error saving passwords', 'error');
        }
        
        updateStats();
    }
    
    // Render passwords list
    function renderPasswordsList() {
        const searchTerm = searchPasswordsInput.value.toLowerCase();
        const category = categoryFilter.value;
        
        // Filter passwords
        let filteredPasswords = passwords.filter(password => {
            // Search filter
            const matchesSearch = searchTerm === '' || 
                password.title.toLowerCase().includes(searchTerm) ||
                password.username?.toLowerCase().includes(searchTerm) ||
                password.url?.toLowerCase().includes(searchTerm) ||
                password.notes?.toLowerCase().includes(searchTerm);
            
            // Category filter
            const matchesCategory = category === 'all' || password.category === category;
            
            return matchesSearch && matchesCategory;
        });
        
        // Sort by favorite then by date added
        filteredPasswords.sort((a, b) => {
            if (a.favorite && !b.favorite) return -1;
            if (!a.favorite && b.favorite) return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        // Pagination
        const totalPages = Math.ceil(filteredPasswords.length / passwordsPerPage);
        const startIndex = (currentPage - 1) * passwordsPerPage;
        const endIndex = startIndex + passwordsPerPage;
        const pagePasswords = filteredPasswords.slice(startIndex, endIndex);
        
        // Clear list
        passwordsList.innerHTML = '';
        
        if (pagePasswords.length === 0) {
            passwordsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-key"></i>
                    <h3>No passwords found</h3>
                    <p>${passwords.length === 0 ? 'Add your first password' : 'Try a different search or filter'}</p>
                </div>
            `;
            return;
        }
        
        // Render passwords
        pagePasswords.forEach(password => {
            const passwordElement = passwordTemplate.content.cloneNode(true);
            const passwordItem = passwordElement.querySelector('.password-item');
            
            // Set data
            passwordItem.dataset.id = password.id;
            if (password.id === selectedPasswordId) {
                passwordItem.classList.add('selected');
            }
            
            // Set icon based on category
            const icon = passwordItem.querySelector('.password-icon i');
            const categoryIcons = {
                social: 'fas fa-users',
                work: 'fas fa-briefcase',
                finance: 'fas fa-university',
                shopping: 'fas fa-shopping-cart',
                entertainment: 'fas fa-film',
                other: 'fas fa-key'
            };
            icon.className = categoryIcons[password.category] || 'fas fa-key';
            
            // Set content
            passwordItem.querySelector('.password-title').textContent = password.title;
            passwordItem.querySelector('.password-category').textContent = 
                password.category.charAt(0).toUpperCase() + password.category.slice(1);
            
            // Format date
            const date = new Date(password.createdAt);
            const now = new Date();
            const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
            
            let dateText;
            if (diffDays === 0) dateText = 'Added: Today';
            else if (diffDays === 1) dateText = 'Added: Yesterday';
            else if (diffDays < 7) dateText = `Added: ${diffDays} days ago`;
            else dateText = `Added: ${date.toLocaleDateString()}`;
            
            passwordItem.querySelector('.password-date').textContent = dateText;
            
            // Set username
            const usernameEl = passwordItem.querySelector('.username');
            if (password.username) {
                usernameEl.textContent = password.username;
            } else {
                usernameEl.textContent = 'No username';
                usernameEl.style.fontStyle = 'italic';
                usernameEl.style.color = '#6c757d';
            }
            
            // Set strength indicator
            const { score } = calculatePasswordStrength(password.value);
            const strengthDot = passwordItem.querySelector('.strength-dot');
            const strengthLabel = passwordItem.querySelector('.strength-label');
            
            if (score >= 80) {
                strengthDot.style.background = '#06d6a0';
                strengthLabel.textContent = 'Very Strong';
            } else if (score >= 60) {
                strengthDot.style.background = '#4cc9f0';
                strengthLabel.textContent = 'Strong';
            } else if (score >= 40) {
                strengthDot.style.background = '#ffd166';
                strengthLabel.textContent = 'Good';
            } else if (score >= 20) {
                strengthDot.style.background = '#f8961e';
                strengthLabel.textContent = 'Weak';
            } else {
                strengthDot.style.background = '#ef476f';
                strengthLabel.textContent = 'Very Weak';
            }
            
            // Set favorite button
            const favoriteBtn = passwordItem.querySelector('.btn-favorite');
            if (password.favorite) {
                favoriteBtn.classList.add('active');
                favoriteBtn.innerHTML = '<i class="fas fa-star"></i>';
            }
            
            // Add event listeners
            passwordItem.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-action')) {
                    selectPassword(password.id);
                }
            });
            
            favoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(password.id);
            });
            
            passwordItem.querySelector('.btn-view').addEventListener('click', (e) => {
                e.stopPropagation();
                viewPassword(password.id);
            });
            
            passwordItem.querySelector('.btn-copy').addEventListener('click', (e) => {
                e.stopPropagation();
                copyPassword(password.id);
            });
            
            passwordsList.appendChild(passwordElement);
        });
        
        // Render pagination
        renderPagination(filteredPasswords.length);
        
        // Update summary
        document.getElementById('showing-count').textContent = pagePasswords.length;
        document.getElementById('total-count').textContent = filteredPasswords.length;
    }
    
    // Render pagination
    function renderPagination(totalPasswords) {
        const pagination = document.getElementById('pagination');
        const totalPages = Math.ceil(totalPasswords / passwordsPerPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" 
                    onclick="window.passwordManager?.changePage(${currentPage - 1})" 
                    ${currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="page-btn ${i === currentPage ? 'active' : ''}" 
                        onclick="window.passwordManager?.changePage(${i})">
                    ${i}
                </button>
            `;
        }
        
        // Next button
        paginationHTML += `
            <button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                    onclick="window.passwordManager?.changePage(${currentPage + 1})" 
                    ${currentPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        pagination.innerHTML = paginationHTML;
    }
    
    // Change page
    function changePage(page) {
        currentPage = page;
        renderPasswordsList();
    }
    
    // Select password
    function selectPassword(id) {
        selectedPasswordId = id;
        const password = passwords.find(p => p.id === id);
        
        if (password) {
            showPasswordForm(password);
        }
        
        // Update selected state in list
        document.querySelectorAll('.password-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.id === id);
        });
    }
    
    // Show password form
    function showPasswordForm(password = null) {
        // Hide empty state, show form
        emptyDetails.style.display = 'none';
        passwordForm.style.display = 'block';
        
        // Show actions
        document.getElementById('details-actions').style.display = 'flex';
        
        if (password) {
            // Edit mode
            passwordIdInput.value = password.id;
            passwordTitleInput.value = password.title;
            passwordCategoryInput.value = password.category;
            passwordUsernameInput.value = password.username || '';
            passwordUrlInput.value = password.url || '';
            passwordValueInput.value = password.value;
            passwordNotesInput.value = password.notes || '';
            passwordFavoriteInput.checked = password.favorite || false;
            
            // Handle expiration
            if (password.expiresAt) {
                passwordExpiresInput.checked = true;
                expirationDateDiv.style.display = 'block';
                passwordExpirationInput.value = password.expiresAt.split('T')[0];
            } else {
                passwordExpiresInput.checked = false;
                expirationDateDiv.style.display = 'none';
            }
            
            // Update strength display
            updatePasswordStrength();
            
            // Update button text
            document.querySelector('#password-form button[type="submit"]').innerHTML = 
                '<i class="fas fa-save"></i> Save Changes';
        } else {
            // Add mode
            passwordIdInput.value = '';
            passwordForm.reset();
            expirationDateDiv.style.display = 'none';
            updatePasswordStrength();
            
            // Set default category
            passwordCategoryInput.value = 'other';
            
            // Update button text
            document.querySelector('#password-form button[type="submit"]').innerHTML = 
                '<i class="fas fa-plus"></i> Add Password';
        }
    }
    
    // Save password
    function savePassword(e) {
        e.preventDefault();
        
        const id = passwordIdInput.value || Date.now().toString();
        const passwordData = {
            id,
            title: passwordTitleInput.value,
            category: passwordCategoryInput.value,
            username: passwordUsernameInput.value || null,
            url: passwordUrlInput.value || null,
            value: passwordValueInput.value,
            notes: passwordNotesInput.value || null,
            favorite: passwordFavoriteInput.checked,
            expiresAt: passwordExpiresInput.checked ? passwordExpirationInput.value : null,
            createdAt: passwordIdInput.value 
                ? passwords.find(p => p.id === id)?.createdAt || new Date().toISOString()
                : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Validate required fields
        if (!passwordData.title || !passwordData.value) {
            showNotification('Title and password are required', 'error');
            return;
        }
        
        // Check if password is being updated or added
        const existingIndex = passwords.findIndex(p => p.id === id);
        
        if (existingIndex !== -1) {
            // Update existing password
            passwords[existingIndex] = passwordData;
            showNotification('Password updated successfully!', 'success');
        } else {
            // Add new password
            passwords.unshift(passwordData);
            showNotification('Password added successfully!', 'success');
        }
        
        // Save to localStorage
        savePasswords();
        
        // Update list
        renderPasswordsList();
        
        // Clear form if not editing existing
        if (!passwordIdInput.value) {
            passwordForm.reset();
            updatePasswordStrength();
        }
    }
    
    // Cancel edit
    function cancelEdit() {
        passwordForm.style.display = 'none';
        emptyDetails.style.display = 'block';
        document.getElementById('details-actions').style.display = 'none';
        selectedPasswordId = null;
        
        // Clear selection in list
        document.querySelectorAll('.password-item').forEach(item => {
            item.classList.remove('selected');
        });
    }
    
    // Delete selected password
    function deleteSelectedPassword() {
        if (!selectedPasswordId) return;
        
        showConfirmation(
            'Delete Password',
            'Are you sure you want to delete this password? This action cannot be undone.',
            () => {
                passwords = passwords.filter(p => p.id !== selectedPasswordId);
                savePasswords();
                renderPasswordsList();
                cancelEdit();
                showNotification('Password deleted', 'success');
            }
        );
    }
    
    // Toggle favorite
    function toggleFavorite(id) {
        const password = passwords.find(p => p.id === id);
        if (password) {
            password.favorite = !password.favorite;
            password.updatedAt = new Date().toISOString();
            savePasswords();
            renderPasswordsList();
            
            const action = password.favorite ? 'added to' : 'removed from';
            showNotification(`Password ${action} favorites`, 'success');
        }
    }
    
    // View password (show in plain text temporarily)
    function viewPassword(id) {
        const password = passwords.find(p => p.id === id);
        if (password) {
            // Show password in alert (in real app, use a secure modal)
            alert(`Password for "${password.title}":\n\n${password.value}\n\nThis message will self-destruct in 10 seconds.`);
            
            // Auto-clear after 10 seconds
            setTimeout(() => {
                // Password was displayed, log this action
                console.log(`Password viewed for: ${password.title}`);
            }, 10000);
        }
    }
    
    // Copy password to clipboard
    function copyPassword(id) {
        const password = passwords.find(p => p.id === id);
        if (password) {
            navigator.clipboard.writeText(password.value)
                .then(() => {
                    showNotification('Password copied to clipboard!', 'success');
                    
                    // Clear clipboard after 30 seconds for security
                    setTimeout(() => {
                        navigator.clipboard.writeText('')
                            .then(() => console.log('Clipboard cleared for security'))
                            .catch(() => console.log('Failed to clear clipboard'));
                    }, 30000);
                })
                .catch(() => {
                    showNotification('Failed to copy password', 'error');
                });
        }
    }
    
    // Show import modal
    function showImportModal() {
        importModal.classList.add('active');
        
        // Setup modal
        const modalClose = importModal.querySelector('.modal-close');
        const modalCloseBtn = importModal.querySelector('.modal-close-btn');
        const confirmBtn = document.getElementById('confirm-import');
        const optionCards = document.querySelectorAll('.option-card');
        
        let selectedType = null;
        
        const closeModal = () => {
            importModal.classList.remove('active');
            selectedType = null;
            document.getElementById('json-import').style.display = 'none';
            document.getElementById('csv-import').style.display = 'none';
            confirmBtn.disabled = true;
            optionCards.forEach(card => card.classList.remove('selected'));
        };
        
        modalClose.addEventListener('click', closeModal);
        modalCloseBtn.addEventListener('click', closeModal);
        
        // Option selection
        optionCards.forEach(card => {
            card.addEventListener('click', () => {
                optionCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedType = card.dataset.type;
                
                // Show appropriate form
                document.getElementById('json-import').style.display = 
                    selectedType === 'json' ? 'block' : 'none';
                document.getElementById('csv-import').style.display = 
                    selectedType === 'csv' ? 'block' : 'none';
                
                confirmBtn.disabled = false;
            });
        });
        
        // Import confirmation
        confirmBtn.addEventListener('click', () => {
            if (selectedType === 'json') {
                importJSON();
            } else if (selectedType === 'csv') {
                importCSV();
            }
            closeModal();
        });
    }
    
    // Import JSON
    function importJSON() {
        const fileInput = document.getElementById('import-file');
        const overwrite = document.getElementById('import-overwrite').checked;
        
        if (!fileInput.files[0]) {
            showNotification('Please select a file to import', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedPasswords = JSON.parse(e.target.result);
                
                if (!Array.isArray(importedPasswords)) {
                    throw new Error('Invalid file format');
                }
                
                if (overwrite) {
                    passwords = importedPasswords;
                } else {
                    passwords = [...importedPasswords, ...passwords];
                }
                
                savePasswords();
                renderPasswordsList();
                showNotification('Passwords imported successfully!', 'success');
            } catch (error) {
                showNotification('Error importing passwords. Invalid file format.', 'error');
            }
        };
        
        reader.readAsText(fileInput.files[0]);
    }
    
    // Import CSV
    function importCSV() {
        showNotification('CSV import is not implemented in this demo', 'info');
    }
    
    // Export passwords
    function exportPasswords() {
        if (passwords.length === 0) {
            showNotification('No passwords to export', 'warning');
            return;
        }
        
        const dataStr = JSON.stringify(passwords, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileName = `passwords-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();
        
        showNotification('Passwords exported successfully!', 'success');
        
        // Update last backup
        localStorage.setItem('securepass_last_backup', new Date().toISOString());
        updateStats();
    }
    
    // Export full backup
    function exportFullBackup() {
        const backupData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            passwords: passwords,
            metadata: {
                totalPasswords: passwords.length,
                securityScore: calculateSecurityScore(),
                vaultCreated: localStorage.getItem('securepass_vault_created') || 'Unknown'
            }
        };
        
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileName = `securepass-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();
        
        // Update last backup
        localStorage.setItem('securepass_last_backup', new Date().toISOString());
        updateStats();
        
        showNotification('Full backup exported successfully!', 'success');
    }
    
    // Clear all data
    function clearAllData() {
        localStorage.removeItem('securepass_master_hash');
        localStorage.removeItem('securepass_master_hint');
        localStorage.removeItem('securepass_vault');
        localStorage.removeItem('securepass_last_backup');
        localStorage.removeItem('securepass_last_updated');
        
        passwords = [];
        vaultLocked = true;
        masterPassword = null;
        
        // Reset UI
        lockVault();
        updateStats();
        
        showNotification('All data cleared successfully', 'success');
    }
    
    // Run security audit
    function runSecurityAudit() {
        if (passwords.length === 0) {
            showNotification('No passwords to audit', 'warning');
            return;
        }
        
        let weakCount = 0;
        let reusedCount = 0;
        let expiringCount = 0;
        let favoriteCount = 0;
        
        // Check for weak passwords
        passwords.forEach(password => {
            const { score } = calculatePasswordStrength(password.value);
            if (score < 40) weakCount++;
            
            if (password.favorite) favoriteCount++;
            
            // Check for expiration
            if (password.expiresAt) {
                const expireDate = new Date(password.expiresAt);
                const today = new Date();
                const daysUntilExpire = Math.ceil((expireDate - today) / (1000 * 60 * 60 * 24));
                
                if (daysUntilExpire <= 7 && daysUntilExpire >= 0) {
                    expiringCount++;
                }
            }
        });
        
        // Check for reused passwords
        const passwordValues = passwords.map(p => p.value);
        const uniquePasswords = [...new Set(passwordValues)];
        reusedCount = passwordValues.length - uniquePasswords.length;
        
        // Update audit display
        weakPasswordsEl.textContent = weakCount;
        reusedPasswordsEl.textContent = reusedCount;
        expiringPasswordsEl.textContent = expiringCount;
        favoritePasswordsEl.textContent = favoriteCount;
        
        // Generate report
        let report = `Security Audit Complete:\n`;
        report += `• Total Passwords: ${passwords.length}\n`;
        report += `• Weak Passwords: ${weakCount}\n`;
        report += `• Reused Passwords: ${reusedCount}\n`;
        report += `• Passwords Expiring Soon: ${expiringCount}\n`;
        report += `• Favorite Passwords: ${favoriteCount}`;
        
        showNotification('Security audit completed!', 'success');
        console.log(report);
    }
    
    // Calculate security score
    function calculateSecurityScore() {
        if (passwords.length === 0) return 0;
        
        let totalScore = 0;
        let counted = 0;
        
        passwords.forEach(password => {
            const { score } = calculatePasswordStrength(password.value);
            totalScore += score;
            counted++;
        });
        
        return Math.round(totalScore / counted);
    }
    
    // Update statistics
    function updateStats() {
        totalPasswordsEl.textContent = passwords.length;
        securityScoreEl.textContent = `${calculateSecurityScore()}%`;
        
        // Last updated
        const lastUpdated = localStorage.getItem('securepass_last_updated');
        if (lastUpdated) {
            const date = new Date(lastUpdated);
            lastUpdatedEl.textContent = date.toLocaleDateString();
        } else {
            lastUpdatedEl.textContent = '--';
        }
        
        // Last backup
        const lastBackup = localStorage.getItem('securepass_last_backup');
        if (lastBackup) {
            const date = new Date(lastBackup);
            const now = new Date();
            const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) {
                lastBackupEl.textContent = 'Today';
            } else if (diffDays === 1) {
                lastBackupEl.textContent = 'Yesterday';
            } else if (diffDays < 7) {
                lastBackupEl.textContent = `${diffDays} days ago`;
            } else {
                lastBackupEl.textContent = date.toLocaleDateString();
            }
        }
    }
    
    // Show confirmation dialog
    function showConfirmation(title, message, callback) {
        confirmModal.classList.add('active');
        
        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-message').textContent = message;
        
        const cancelBtn = document.getElementById('confirm-cancel');
        const okBtn = document.getElementById('confirm-ok');
        
        const closeModal = () => {
            confirmModal.classList.remove('active');
        };
        
        const handleConfirm = () => {
            closeModal();
            if (callback) callback();
        };
        
        cancelBtn.onclick = closeModal;
        okBtn.onclick = handleConfirm;
        
        // Remove previous listeners
        cancelBtn.replaceWith(cancelBtn.cloneNode(true));
        okBtn.replaceWith(okBtn.cloneNode(true));
    }
    
    // Show notification
    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = type === 'error' ? 'exclamation-circle' : 
                    type === 'warning' ? 'exclamation-triangle' : 
                    type === 'success' ? 'check-circle' : 'info-circle';
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Add close button event
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    // Add notification styles
    const notificationStyles = document.createElement('style');
    notificationStyles.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            background: white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 0.8rem;
            z-index: 3000;
            animation: slideInRight 0.3s ease;
            max-width: 350px;
        }
        
        .notification-success {
            border-left: 4px solid var(--success-color);
        }
        
        .notification-info {
            border-left: 4px solid var(--info-color);
        }
        
        .notification-warning {
            border-left: 4px solid var(--warning-color);
        }
        
        .notification-error {
            border-left: 4px solid var(--danger-color);
        }
        
        .notification i {
            font-size: 1.2rem;
        }
        
        .notification-success i {
            color: var(--success-color);
        }
        
        .notification-info i {
            color: var(--info-color);
        }
        
        .notification-warning i {
            color: var(--warning-color);
        }
        
        .notification-error i {
            color: var(--danger-color);
        }
        
        .notification span {
            flex: 1;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: var(--gray-color);
            cursor: pointer;
            font-size: 1rem;
            padding: 0;
            display: flex;
            align-items: center;
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(notificationStyles);
    
    window.passwordManager = {
        changePage
    };
    
    
    init();
});