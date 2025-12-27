const PollApp = (() => {

    const elements = {
        navItems: document.querySelectorAll('.nav-item'),
        views: document.querySelectorAll('.view'),
        
        totalPolls: document.getElementById('totalPolls'),
        totalVotes: document.getElementById('totalVotes'),
        activeUsers: document.getElementById('activeUsers'),
        activePollsCount: document.getElementById('activePollsCount'),
        dashboardVotesCount: document.getElementById('dashboardVotesCount'),
        recentPollsGrid: document.getElementById('recentPollsGrid'),
        quickPollBtn: document.getElementById('quickPollBtn'),
        
        // Create Poll
        pollTitle: document.getElementById('pollTitle'),
        pollDescription: document.getElementById('pollDescription'),
        optionsContainer: document.getElementById('optionsContainer'),
        addOptionBtn: document.getElementById('addOptionBtn'),
        clearFormBtn: document.getElementById('clearFormBtn'),
        createPollBtn: document.getElementById('createPollBtn'),
        previewPollBtn: document.getElementById('previewPollBtn'),
        titleCharCount: document.getElementById('titleCharCount'),
        
        // Active Polls
        searchPolls: document.getElementById('searchPolls'),
        sortPolls: document.getElementById('sortPolls'),
        activePollsContainer: document.getElementById('activePollsContainer'),
        
        // Results
        resultsContainer: document.getElementById('resultsContainer'),
        exportResultsBtn: document.getElementById('exportResultsBtn'),
        
        // Modals
        pollPreviewModal: document.getElementById('pollPreviewModal'),
        pollVoteModal: document.getElementById('pollVoteModal'),
        resultsModal: document.getElementById('resultsModal'),
        pollPreviewBody: document.getElementById('pollPreviewBody'),
        voteModalBody: document.getElementById('voteModalBody'),
        voteModalTitle: document.getElementById('voteModalTitle'),
        resultsModalBody: document.getElementById('resultsModalBody'),
        resultsModalTitle: document.getElementById('resultsModalTitle'),
        submitVoteBtn: document.getElementById('submitVoteBtn'),
        shareResultsBtn: document.getElementById('shareResultsBtn'),
        
        // FAB
        fabBtn: document.getElementById('fabBtn'),
        
        // Toast
        toastContainer: document.getElementById('toastContainer')
    };

    // Application State
    let state = {
        currentView: 'dashboard',
        polls: [],
        votes: {},
        currentPollId: null,
        selectedOptions: new Set(),
        themes: {
            blue: { primary: '#667eea', secondary: '#764ba2' },
            red: { primary: '#f093fb', secondary: '#f5576c' },
            green: { primary: '#43e97b', secondary: '#38f9d7' },
            purple: { primary: '#a18cd1', secondary: '#fbc2eb' }
        },
        currentTheme: 'blue'
    };

    // Initialize the application
    const init = () => {
        loadFromLocalStorage();
        setupEventListeners();
        updateStats();
        renderDashboard();
        showToast('Poll application ready! 🚀', 'success');
        
        // Simulate active users
        simulateActiveUsers();
    };

    const loadFromLocalStorage = () => {
        const savedPolls = localStorage.getItem('polls');
        const savedVotes = localStorage.getItem('votes');
        
        if (savedPolls) {
            state.polls = JSON.parse(savedPolls);
        } else {
          
            loadSamplePolls();
        }
        
        if (savedVotes) {
            state.votes = JSON.parse(savedVotes);
        }
    };

    const loadSamplePolls = () => {
        state.polls = [
            {
                id: generateId(),
                title: "What's your favorite programming language?",
                description: "Choose the language you enjoy working with the most",
                options: [
                    { id: 1, text: "JavaScript", votes: 42, color: "#f7df1e" },
                    { id: 2, text: "Python", votes: 38, color: "#306998" },
                    { id: 3, text: "Java", votes: 25, color: "#007396" },
                    { id: 4, text: "C++", votes: 18, color: "#00599c" },
                    { id: 5, text: "TypeScript", votes: 32, color: "#007acc" }
                ],
                totalVotes: 155,
                createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                endsAt: null,
                allowMultiple: true,
                showResults: true,
                anonymous: false,
                theme: 'blue',
                status: 'active'
            },
            {
                id: generateId(),
                title: "Which frontend framework do you prefer?",
                description: "Select your preferred framework for web development",
                options: [
                    { id: 1, text: "React", votes: 58, color: "#61dafb" },
                    { id: 2, text: "Vue.js", votes: 32, color: "#42b883" },
                    { id: 3, text: "Angular", votes: 24, color: "#dd0031" },
                    { id: 4, text: "Svelte", votes: 16, color: "#ff3e00" }
                ],
                totalVotes: 130,
                createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                endsAt: null,
                allowMultiple: false,
                showResults: true,
                anonymous: true,
                theme: 'purple',
                status: 'active'
            },
            {
                id: generateId(),
                title: "Best mobile app development approach",
                description: "What's your preferred method for building mobile apps?",
                options: [
                    { id: 1, text: "Native (Swift/Kotlin)", votes: 28, color: "#007aff" },
                    { id: 2, text: "React Native", votes: 45, color: "#61dafb" },
                    { id: 3, text: "Flutter", votes: 36, color: "#02569b" },
                    { id: 4, text: "Ionic", votes: 12, color: "#3880ff" }
                ],
                totalVotes: 121,
                createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
                endsAt: new Date(Date.now() + 86400000).toISOString(), // Ends tomorrow
                allowMultiple: false,
                showResults: true,
                anonymous: false,
                theme: 'green',
                status: 'active'
            },
            {
                id: generateId(),
                title: "Favorite database technology",
                description: "Which database do you enjoy working with?",
                options: [
                    { id: 1, text: "MongoDB", votes: 35, color: "#47a248" },
                    { id: 2, text: "PostgreSQL", votes: 42, color: "#336791" },
                    { id: 3, text: "MySQL", votes: 38, color: "#00758f" },
                    { id: 4, text: "Redis", votes: 22, color: "#d82c20" },
                    { id: 5, text: "SQLite", votes: 18, color: "#003b57" }
                ],
                totalVotes: 155,
                createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
                endsAt: new Date(Date.now() - 86400000).toISOString(), // Ended yesterday
                allowMultiple: true,
                showResults: true,
                anonymous: false,
                theme: 'red',
                status: 'ended'
            }
        ];
        
        saveToLocalStorage();
    };

    // Setup all event listeners
    const setupEventListeners = () => {
        // Navigation
        elements.navItems.forEach(item => {
            item.addEventListener('click', () => switchView(item.dataset.view));
        });

        // Dashboard
        elements.quickPollBtn.addEventListener('click', () => {
            switchView('create');
            showToast('Quick poll mode activated!', 'info');
        });

        // Create Poll
        elements.pollTitle.addEventListener('input', updateCharCount);
        elements.addOptionBtn.addEventListener('click', addOption);
        elements.clearFormBtn.addEventListener('click', clearForm);
        elements.createPollBtn.addEventListener('click', createPoll);
        elements.previewPollBtn.addEventListener('click', previewPoll);
        
        // Theme selection
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                state.currentTheme = option.dataset.theme;
            });
        });

        elements.searchPolls.addEventListener('input', filterPolls);
        elements.sortPolls.addEventListener('change', sortPolls);

        elements.exportResultsBtn.addEventListener('click', exportResults);

        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                closeAllModals();
            });
        });

        // Vote submission
        elements.submitVoteBtn.addEventListener('click', submitVote);

        // Share results
        elements.shareResultsBtn.addEventListener('click', shareResults);

        // FAB
        elements.fabBtn.addEventListener('click', () => {
            switchView('create');
            showToast('Create a new poll!', 'info');
        });

        // Close modals on background click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeAllModals();
                }
            });
        });
    };

    // Switch between views
    const switchView = (viewName) => {
        // Update navigation
        elements.navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewName);
        });

        elements.views.forEach(view => {
            view.classList.toggle('active', view.id === `${viewName}View`);
        });

        state.currentView = viewName;

        switch(viewName) {
            case 'dashboard':
                renderDashboard();
                break;
            case 'active':
                renderActivePolls();
                break;
            case 'results':
                renderResults();
                break;
            case 'create':
                // Nothing extra needed
                break;
        }

        showToast(`Switched to ${viewName} view`, 'info');
    };

    const updateCharCount = () => {
        const length = elements.pollTitle.value.length;
        elements.titleCharCount.textContent = length;
        
        if (length > 90) {
            elements.titleCharCount.style.color = '#f5576c';
        } else if (length > 75) {
            elements.titleCharCount.style.color = '#fbb034';
        } else {
            elements.titleCharCount.style.color = '#43e97b';
        }
    };

    // Add new option input
    const addOption = () => {
        const options = elements.optionsContainer.querySelectorAll('.option-input');
        if (options.length >= 6) {
            showToast('Maximum 6 options allowed', 'error');
            return;
        }

        const newOption = document.createElement('div');
        newOption.className = 'option-input';
        newOption.innerHTML = `
            <input type="text" class="poll-option" placeholder="Option ${options.length + 1}" maxlength="60">
            <button class="remove-option"><i class="fas fa-times"></i></button>
        `;

        elements.optionsContainer.appendChild(newOption);

        // Add event listener to remove button
        newOption.querySelector('.remove-option').addEventListener('click', (e) => {
            if (elements.optionsContainer.querySelectorAll('.option-input').length > 2) {
                newOption.remove();
                updateRemoveButtons();
            }
        });

        updateRemoveButtons();
    };

    const updateRemoveButtons = () => {
        const options = elements.optionsContainer.querySelectorAll('.option-input');
        options.forEach((option, index) => {
            const removeBtn = option.querySelector('.remove-option');
            removeBtn.disabled = options.length <= 2;
        });
    };

    const clearForm = () => {
        elements.pollTitle.value = '';
        elements.pollDescription.value = '';
        
        elements.optionsContainer.innerHTML = `
            <div class="option-input">
                <input type="text" class="poll-option" placeholder="Option 1" maxlength="60">
                <button class="remove-option" disabled><i class="fas fa-times"></i></button>
            </div>
            <div class="option-input">
                <input type="text" class="poll-option" placeholder="Option 2" maxlength="60">
                <button class="remove-option" disabled><i class="fas fa-times"></i></button>
            </div>
        `;
        
        // Reset theme
        document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
        document.querySelector('.theme-option[data-theme="blue"]').classList.add('active');
        state.currentTheme = 'blue';
        
        // Reset checkboxes
        document.getElementById('multipleVotes').checked = true;
        document.getElementById('showResults').checked = true;
        document.getElementById('anonymousVote').checked = false;
        document.getElementById('endDateToggle').checked = false;
        
        updateCharCount();
        updateRemoveButtons();
        showToast('Form cleared', 'info');
    };

    const createPoll = () => {
        const title = elements.pollTitle.value.trim();
        const description = elements.pollDescription.value.trim();
        const options = Array.from(elements.optionsContainer.querySelectorAll('.poll-option'))
            .map(input => input.value.trim())
            .filter(text => text.length > 0);

        if (!title) {
            showToast('Please enter a poll question', 'error');
            return;
        }

        if (options.length < 2) {
            showToast('Please add at least 2 options', 'error');
            return;
        }

        // Create poll object
        const newPoll = {
            id: generateId(),
            title,
            description,
            options: options.map((text, index) => ({
                id: index + 1,
                text,
                votes: 0,
                color: getOptionColor(index)
            })),
            totalVotes: 0,
            createdAt: new Date().toISOString(),
            endsAt: document.getElementById('endDateToggle').checked ? 
                new Date(Date.now() + 7 * 86400000).toISOString() : null,
            allowMultiple: document.getElementById('multipleVotes').checked,
            showResults: document.getElementById('showResults').checked,
            anonymous: document.getElementById('anonymousVote').checked,
            theme: state.currentTheme,
            status: 'active'
        };

        // Add to polls
        state.polls.unshift(newPoll);
        saveToLocalStorage();
        updateStats();

        // Clear form and switch to active polls
        clearForm();
        switchView('active');
        showToast('Poll created successfully! 🎉', 'success');
    };

    // Preview poll
    const previewPoll = () => {
        const title = elements.pollTitle.value.trim() || "Sample Poll Question";
        const description = elements.pollDescription.value.trim() || "Sample description for the poll";
        const options = Array.from(elements.optionsContainer.querySelectorAll('.poll-option'))
            .map(input => input.value.trim())
            .filter(text => text.length > 0);

        if (options.length < 2) {
            options.push("Option 1", "Option 2", "Option 3");
        }

        const theme = state.themes[state.currentTheme];

        elements.pollPreviewBody.innerHTML = `
            <div class="poll-card" style="border-top: 5px solid ${theme.primary};">
                <div class="poll-header">
                    <h3 class="poll-title">${title}</h3>
                    <span class="poll-tag">Preview</span>
                </div>
                <p class="poll-description">${description}</p>
                <div class="vote-options">
                    ${options.map((option, index) => `
                        <div class="vote-option">
                            <div class="vote-checkbox">
                                <i class="fas fa-check"></i>
                            </div>
                            <div class="option-text">${option || `Option ${index + 1}`}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="poll-stats">
                    <div class="poll-stat">
                        <i class="fas fa-check-circle"></i>
                        <span>${options.length} options</span>
                    </div>
                    <div class="poll-stat">
                        <i class="fas fa-users"></i>
                        <span>Multiple votes: ${document.getElementById('multipleVotes').checked ? 'Yes' : 'No'}</span>
                    </div>
                </div>
            </div>
        `;

        elements.pollPreviewModal.classList.add('active');
    };

    // Render dashboard
    const renderDashboard = () => {
        // Update stats
        updateStats();

        // Render recent polls
        const recentPolls = state.polls.slice(0, 4);
        elements.recentPollsGrid.innerHTML = recentPolls.map(poll => createPollCard(poll, true)).join('');

        // Add event listeners to poll cards
        document.querySelectorAll('.poll-card').forEach(card => {
            card.addEventListener('click', () => {
                const pollId = card.dataset.pollId;
                const poll = state.polls.find(p => p.id === pollId);
                if (poll) {
                    if (poll.status === 'active') {
                        openVoteModal(poll);
                    } else {
                        openResultsModal(poll);
                    }
                }
            });
        });
    };

    // Render active polls
    const renderActivePolls = () => {
        const activePolls = state.polls.filter(poll => poll.status === 'active');
        elements.activePollsContainer.innerHTML = activePolls.map(poll => createPollCard(poll, false)).join('');

        // Add event listeners
        document.querySelectorAll('.poll-card').forEach(card => {
            card.addEventListener('click', () => {
                const pollId = card.dataset.pollId;
                const poll = state.polls.find(p => p.id === pollId);
                if (poll) {
                    openVoteModal(poll);
                }
            });
        });
    };

    // Render results
    const renderResults = () => {
        const endedPolls = state.polls.filter(poll => poll.status === 'ended' || poll.totalVotes > 0);
        elements.resultsContainer.innerHTML = endedPolls.map(poll => createResultCard(poll)).join('');

        // Add event listeners
        document.querySelectorAll('.result-card').forEach(card => {
            card.addEventListener('click', () => {
                const pollId = card.dataset.pollId;
                const poll = state.polls.find(p => p.id === pollId);
                if (poll) {
                    openResultsModal(poll);
                }
            });
        });
    };

    // Create poll card HTML
    const createPollCard = (poll, isDashboard = false) => {
        const theme = state.themes[poll.theme];
        const timeAgo = getTimeAgo(poll.createdAt);
        const endsAt = poll.endsAt ? `Ends ${getTimeAgo(poll.endsAt, true)}` : 'No end date';
        const tagClass = poll.status === 'active' ? 'active' : 'ended';

        return `
            <div class="poll-card" data-poll-id="${poll.id}" style="border-top: 5px solid ${theme.primary};">
                <div class="poll-header">
                    <h3 class="poll-title">${poll.title}</h3>
                    <span class="poll-tag ${tagClass}">${poll.status === 'active' ? 'Active' : 'Ended'}</span>
                </div>
                <p class="poll-description">${poll.description}</p>
                <div class="poll-stats">
                    <div class="poll-stat">
                        <i class="fas fa-chart-bar"></i>
                        <span>${poll.totalVotes} votes</span>
                    </div>
                    <div class="poll-stat">
                        <i class="fas fa-clock"></i>
                        <span>${timeAgo}</span>
                    </div>
                    ${!isDashboard ? `
                        <div class="poll-stat">
                            <i class="fas fa-hourglass-end"></i>
                            <span>${endsAt}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="poll-actions">
                    <button class="btn btn-outline vote-btn" style="border-color: ${theme.primary}; color: ${theme.primary};">
                        <i class="fas fa-vote-yea"></i> Vote Now
                    </button>
                    <button class="btn btn-secondary results-btn">
                        <i class="fas fa-chart-pie"></i> Results
                    </button>
                </div>
            </div>
        `;
    };

    // Create result card HTML
    const createResultCard = (poll) => {
        const theme = state.themes[poll.theme];
        const topOption = poll.options.reduce((prev, current) => 
            prev.votes > current.votes ? prev : current
        );

        return `
            <div class="result-card" data-poll-id="${poll.id}">
                <div class="result-header">
                    <h3 class="result-title">${poll.title}</h3>
                    <p class="result-description">${poll.description}</p>
                </div>
                <div class="result-stats">
                    <div class="result-stat">
                        <div class="result-value">${poll.totalVotes}</div>
                        <div class="result-label">Total Votes</div>
                    </div>
                    <div class="result-stat">
                        <div class="result-value">${poll.options.length}</div>
                        <div class="result-label">Options</div>
                    </div>
                    <div class="result-stat">
                        <div class="result-value">${Math.round((topOption.votes / poll.totalVotes) * 100) || 0}%</div>
                        <div class="result-label">Top Choice</div>
                    </div>
                </div>
                <div class="result-options">
                    ${poll.options.slice(0, 3).map(option => {
                        const percentage = poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0;
                        return `
                            <div class="result-option">
                                <div class="option-header">
                                    <span class="option-name">${option.text}</span>
                                    <span class="option-percentage">${Math.round(percentage)}%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${percentage}%; background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <button class="btn btn-primary" style="background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary}); width: 100%; margin-top: 20px;">
                    <i class="fas fa-chart-pie"></i> View Full Results
                </button>
            </div>
        `;
    };

    // Open vote modal
    const openVoteModal = (poll) => {
        state.currentPollId = poll.id;
        state.selectedOptions.clear();

        const theme = state.themes[poll.theme];

        elements.voteModalTitle.textContent = poll.title;
        elements.voteModalBody.innerHTML = `
            <p class="poll-description" style="margin-bottom: 25px;">${poll.description}</p>
            <div class="vote-options">
                ${poll.options.map(option => `
                    <div class="vote-option" data-option-id="${option.id}">
                        <div class="vote-checkbox">
                            <i class="fas fa-check"></i>
                        </div>
                        <div class="option-text">${option.text}</div>
                    </div>
                `).join('')}
            </div>
            ${poll.allowMultiple ? 
                '<p style="margin-top: 15px; color: #667eea; font-size: 0.9rem;"><i class="fas fa-info-circle"></i> You can select multiple options</p>' : 
                ''
            }
        `;

        // Add event listeners to vote options
        elements.voteModalBody.querySelectorAll('.vote-option').forEach(option => {
            option.addEventListener('click', () => {
                const optionId = parseInt(option.dataset.optionId);
                
                if (poll.allowMultiple) {
                    option.classList.toggle('selected');
                    if (state.selectedOptions.has(optionId)) {
                        state.selectedOptions.delete(optionId);
                    } else {
                        state.selectedOptions.add(optionId);
                    }
                } else {
                    // Single selection - clear others
                    elements.voteModalBody.querySelectorAll('.vote-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    option.classList.add('selected');
                    state.selectedOptions.clear();
                    state.selectedOptions.add(optionId);
                }
            });
        });

        elements.pollVoteModal.classList.add('active');
    };

    // Submit vote
    const submitVote = () => {
        if (!state.currentPollId || state.selectedOptions.size === 0) {
            showToast('Please select at least one option', 'error');
            return;
        }

        const poll = state.polls.find(p => p.id === state.currentPollId);
        if (!poll) return;

        // Update vote counts
        state.selectedOptions.forEach(optionId => {
            const option = poll.options.find(o => o.id === optionId);
            if (option) {
                option.votes++;
            }
        });

        poll.totalVotes += state.selectedOptions.size;

        // Save vote
        if (!state.votes[poll.id]) {
            state.votes[poll.id] = [];
        }
        state.votes[poll.id].push({
            options: Array.from(state.selectedOptions),
            timestamp: new Date().toISOString(),
            anonymous: poll.anonymous
        });

        // Save to localStorage
        saveToLocalStorage();
        updateStats();

        // Close modal and show results
        closeAllModals();
        
        if (poll.showResults) {
            setTimeout(() => {
                openResultsModal(poll);
            }, 300);
        } else {
            showToast('Vote submitted successfully! ✅', 'success');
        }
    };

    // Open results modal
    const openResultsModal = (poll) => {
        const theme = state.themes[poll.theme];

        elements.resultsModalTitle.textContent = poll.title;
        elements.resultsModalBody.innerHTML = `
            <div class="poll-description" style="margin-bottom: 25px;">${poll.description}</div>
            
            <div class="result-stats" style="margin-bottom: 30px;">
                <div class="result-stat">
                    <div class="result-value">${poll.totalVotes}</div>
                    <div class="result-label">Total Votes</div>
                </div>
                <div class="result-stat">
                    <div class="result-value">${poll.options.length}</div>
                    <div class="result-label">Options</div>
                </div>
                <div class="result-stat">
                    <div class="result-value">${poll.status === 'active' ? 'Active' : 'Ended'}</div>
                    <div class="result-label">Status</div>
                </div>
            </div>
            
            <h4 style="margin-bottom: 20px; color: ${theme.primary};">Results</h4>
            <div class="result-options">
                ${poll.options.map(option => {
                    const percentage = poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0;
                    const width = percentage > 0 ? Math.max(percentage, 5) : 0;
                    
                    return `
                        <div class="result-option" style="margin-bottom: 25px;">
                            <div class="option-header" style="margin-bottom: 10px;">
                                <span class="option-name" style="font-weight: 600;">${option.text}</span>
                                <span class="option-percentage" style="font-size: 1.2rem; font-weight: 700; color: ${theme.primary};">${Math.round(percentage)}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${width}%; background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});"></div>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                                <span style="font-size: 0.9rem; color: #666;">${option.votes} votes</span>
                                <span style="font-size: 0.9rem; color: #666;">${percentage.toFixed(1)}%</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            ${poll.totalVotes > 0 ? `
                <div style="margin-top: 30px; padding: 20px; background: rgba(102, 126, 234, 0.1); border-radius: 15px;">
                    <h4 style="color: ${theme.primary}; margin-bottom: 10px;"><i class="fas fa-chart-line"></i> Insights</h4>
                    <p>The most popular option is "<strong>${poll.options.reduce((a, b) => a.votes > b.votes ? a : b).text}</strong>" 
                    with ${Math.round(poll.options.reduce((a, b) => a.votes > b.votes ? a : b).votes / poll.totalVotes * 100)}% of the votes.</p>
                </div>
            ` : ''}
        `;

        elements.resultsModal.classList.add('active');
    };

    // Share results
    const shareResults = () => {
        const poll = state.polls.find(p => p.id === state.currentPollId);
        if (!poll) return;

        const shareText = `Check out the poll results for "${poll.title}":\n`;
        
        if (navigator.share) {
            navigator.share({
                title: poll.title,
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback to clipboard
            const resultsText = poll.options.map(option => {
                const percentage = poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0;
                return `${option.text}: ${option.votes} votes (${Math.round(percentage)}%)`;
            }).join('\n');
            
            navigator.clipboard.writeText(`${shareText}\n${resultsText}`);
            showToast('Results copied to clipboard!', 'success');
        }
    };

    // Filter polls
    const filterPolls = () => {
        const searchTerm = elements.searchPolls.value.toLowerCase();
        const polls = state.polls.filter(poll => 
            poll.status === 'active' && 
            (poll.title.toLowerCase().includes(searchTerm) || 
             poll.description.toLowerCase().includes(searchTerm))
        );
        
        elements.activePollsContainer.innerHTML = polls.map(poll => createPollCard(poll, false)).join('');
    };

    // Sort polls
    const sortPolls = () => {
        const sortBy = elements.sortPolls.value;
        let sortedPolls = [...state.polls.filter(poll => poll.status === 'active')];
        
        switch(sortBy) {
            case 'newest':
                sortedPolls.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                sortedPolls.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'popular':
                sortedPolls.sort((a, b) => b.totalVotes - a.totalVotes);
                break;
        }
        
        elements.activePollsContainer.innerHTML = sortedPolls.map(poll => createPollCard(poll, false)).join('');
    };

    // Export results
    const exportResults = () => {
        const data = state.polls.filter(poll => poll.totalVotes > 0).map(poll => ({
            title: poll.title,
            totalVotes: poll.totalVotes,
            options: poll.options.map(option => ({
                text: option.text,
                votes: option.votes,
                percentage: poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0
            }))
        }));
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'poll-results.json';
        a.click();
        
        showToast('Results exported successfully!', 'success');
    };

    // Update statistics
    const updateStats = () => {
        const totalPolls = state.polls.length;
        const totalVotes = state.polls.reduce((sum, poll) => sum + poll.totalVotes, 0);
        const activePolls = state.polls.filter(poll => poll.status === 'active').length;
        
        elements.totalPolls.textContent = totalPolls;
        elements.totalVotes.textContent = totalVotes.toLocaleString();
        elements.activePollsCount.textContent = activePolls;
        elements.dashboardVotesCount.textContent = totalVotes.toLocaleString();
        
        // Update localStorage
        saveToLocalStorage();
    };

    // Save to localStorage
    const saveToLocalStorage = () => {
        localStorage.setItem('polls', JSON.stringify(state.polls));
        localStorage.setItem('votes', JSON.stringify(state.votes));
    };

    // Close all modals
    const closeAllModals = () => {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        state.selectedOptions.clear();
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

    // Utility functions
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    const getTimeAgo = (dateString, future = false) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = future ? date - now : now - date;
        
        if (future && diff < 0) return 'Ended';
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    };

    const getOptionColor = (index) => {
        const colors = [
            '#667eea', '#f5576c', '#43e97b', '#fbb034', 
            '#a18cd1', '#4facfe', '#00f2fe', '#ff6b6b'
        ];
        return colors[index % colors.length];
    };

    const simulateActiveUsers = () => {
        // Simulate random active users
        const randomUsers = Math.floor(Math.random() * 20) + 30;
        elements.activeUsers.textContent = randomUsers;
        
        // Update every 30 seconds
        setInterval(() => {
            const change = Math.floor(Math.random() * 5) - 2;
            const current = parseInt(elements.activeUsers.textContent);
            const newValue = Math.max(10, current + change);
            elements.activeUsers.textContent = newValue;
        }, 30000);
    };

    // Public API
    return {
        init,
        showToast
    };
})();

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    PollApp.init();
});