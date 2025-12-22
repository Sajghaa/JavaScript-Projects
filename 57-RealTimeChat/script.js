class ChatSimulator {
    constructor() {
        // Application state
        this.state = {
            currentChat: null,
            chats: [],
            messages: [],
            messageQueue: [],
            isQueueProcessing: false,
            queueDelay: 1000,
            autoProcessQueue: true,
            autoReply: true,
            totalMessages: 0,
            processedMessages: 0,
            failedMessages: 0,
            isQueuePaused: false,
            theme: 'auto',
            messageAnimation: true
        };
        
        // Demo data
        this.demoChats = [
            { id: 1, name: 'Chat Bot', avatar: 'CB', lastMessage: 'Hello! How can I assist you today?', unread: 0, type: 'bot' },
            { id: 2, name: 'Support Team', avatar: 'ST', lastMessage: 'Your issue has been resolved', unread: 2, type: 'support' },
            { id: 3, name: 'John Doe', avatar: 'JD', lastMessage: 'See you tomorrow!', unread: 0, type: 'user' },
            { id: 4, name: 'Alice Smith', avatar: 'AS', lastMessage: 'Thanks for your help!', unread: 1, type: 'user' },
            { id: 5, name: 'Tech Updates', avatar: 'TU', lastMessage: 'New features available', unread: 0, type: 'channel' }
        ];
        
        // Bot responses
        this.botResponses = [
            "Hello! How can I help you today?",
            "That's interesting. Tell me more about it.",
            "I understand. Is there anything specific you'd like to know?",
            "Thanks for sharing that with me.",
            "I'm processing your request. Please wait a moment.",
            "That's a great question! Let me check that for you.",
            "I'm here to help with anything you need.",
            "Could you please provide more details?",
            "I've noted your request and will get back to you shortly.",
            "Is there anything else I can assist you with?"
        ];
        
        // Initialize the application
        this.init();
    }
    
    // Initialize the chat simulator
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.loadInitialData();
        this.setupCustomEvents();
        this.applyTheme();
        this.updateUI();
        
        console.log('Chat Simulator initialized');
    }
    
    // Cache DOM elements for better performance
    cacheElements() {
        this.elements = {
            // Buttons
            newChatBtn: document.getElementById('new-chat-btn'),
            sendBtn: document.getElementById('send-btn'),
            clearChatBtn: document.getElementById('clear-chat-btn'),
            queueSettingsBtn: document.getElementById('queue-settings-btn'),
            processQueueBtn: document.getElementById('process-queue-btn'),
            clearQueueBtn: document.getElementById('clear-queue-btn'),
            startDemoBtn: document.getElementById('start-demo-btn'),
            settingsBtn: document.getElementById('settings-btn'),
            closeSettingsBtn: document.getElementById('close-settings-btn'),
            loadHistoryBtn: document.getElementById('load-history-btn'),
            
            // Modals
            closeQueueModal: document.getElementById('close-queue-modal'),
            processAllBtn: document.getElementById('process-all-btn'),
            pauseQueueBtn: document.getElementById('pause-queue-btn'),
            clearAllQueueBtn: document.getElementById('clear-all-queue-btn'),
            
            // Inputs
            messageInput: document.getElementById('message-input'),
            chatSearch: document.getElementById('chat-search'),
            
            // Containers
            chatsList: document.getElementById('chats-list'),
            messages: document.getElementById('messages'),
            messagesContainer: document.getElementById('messages-container'),
            messageInputContainer: document.getElementById('message-input-container'),
            welcomeScreen: document.getElementById('welcome-screen'),
            chatHeader: document.getElementById('chat-header'),
            activityList: document.getElementById('activity-list'),
            
            // Settings
            settingsPanel: document.getElementById('settings-panel'),
            queueModal: document.getElementById('queue-modal'),
            queueDelay: document.getElementById('queue-delay'),
            delayValue: document.getElementById('delay-value'),
            autoProcess: document.getElementById('auto-process'),
            autoReply: document.getElementById('auto-reply'),
            simulationSpeed: document.getElementById('simulation-speed'),
            themeSelect: document.getElementById('theme-select'),
            messageAnimation: document.getElementById('message-animation'),
            
            // Status displays
            queueStatus: document.getElementById('queue-status'),
            queueInfo: document.getElementById('queue-info'),
            queueCount: document.getElementById('queue-count'),
            connectionStatus: document.getElementById('connection-status'),
            settingsQueueSize: document.getElementById('settings-queue-size'),
            totalMessages: document.getElementById('total-messages'),
            activeChats: document.getElementById('active-chats'),
            modalQueueSize: document.getElementById('modal-queue-size'),
            modalProcessed: document.getElementById('modal-processed'),
            modalFailed: document.getElementById('modal-failed')
        };
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Message sending
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        this.elements.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Chat management
        this.elements.newChatBtn.addEventListener('click', () => this.createNewChat());
        this.elements.clearChatBtn.addEventListener('click', () => this.clearCurrentChat());
        this.elements.startDemoBtn.addEventListener('click', () => this.startDemo());
        
        // Queue management
        this.elements.processQueueBtn.addEventListener('click', () => this.processQueue());
        this.elements.clearQueueBtn.addEventListener('click', () => this.clearQueue());
        this.elements.queueSettingsBtn.addEventListener('click', () => this.showQueueModal());
        
        // Settings
        this.elements.settingsBtn.addEventListener('click', () => this.toggleSettingsPanel());
        this.elements.closeSettingsBtn.addEventListener('click', () => this.toggleSettingsPanel());
        this.elements.loadHistoryBtn.addEventListener('click', () => this.loadDemoHistory());
        
        // Modal controls
        this.elements.closeQueueModal.addEventListener('click', () => this.hideQueueModal());
        this.elements.processAllBtn.addEventListener('click', () => this.processQueue(true));
        this.elements.pauseQueueBtn.addEventListener('click', () => this.toggleQueuePause());
        this.elements.clearAllQueueBtn.addEventListener('click', () => this.clearQueue(true));
        
        // Settings inputs
        this.elements.queueDelay.addEventListener('input', (e) => this.updateQueueDelay(e.target.value));
        this.elements.autoProcess.addEventListener('change', (e) => this.toggleAutoProcess(e.target.checked));
        this.elements.autoReply.addEventListener('change', (e) => this.toggleAutoReply(e.target.checked));
        this.elements.themeSelect.addEventListener('change', (e) => this.changeTheme(e.target.value));
        this.elements.messageAnimation.addEventListener('change', (e) => this.toggleMessageAnimation(e.target.checked));
        
        // Search
        this.elements.chatSearch.addEventListener('input', (e) => this.filterChats(e.target.value));
        
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target === this.elements.queueModal) {
                this.hideQueueModal();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + / to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.elements.chatSearch.focus();
            }
            
            // Esc to close modals
            if (e.key === 'Escape') {
                this.hideQueueModal();
                if (this.elements.settingsPanel.classList.contains('active')) {
                    this.toggleSettingsPanel();
                }
            }
        });
    }
    
    // Setup custom events for message updates
    setupCustomEvents() {
        // Create custom events
        this.events = {
            messageSent: new CustomEvent('messageSent', { 
                detail: { simulator: this }
            }),
            messageReceived: new CustomEvent('messageReceived', {
                detail: { simulator: this }
            }),
            queueUpdated: new CustomEvent('queueUpdated', {
                detail: { simulator: this }
            }),
            chatUpdated: new CustomEvent('chatUpdated', {
                detail: { simulator: this }
            })
        };
        
        // Listen for custom events
        document.addEventListener('messageSent', (e) => {
            this.updateQueueStatus();
            this.updateActivityLog('Message sent to queue');
        });
        
        document.addEventListener('messageReceived', (e) => {
            this.updateQueueStatus();
            this.updateActivityLog('Message processed from queue');
        });
        
        document.addEventListener('queueUpdated', (e) => {
            this.updateAllQueueDisplays();
            this.updateActivityLog('Queue updated');
        });
        
        document.addEventListener('chatUpdated', (e) => {
            this.updateChatList();
            this.updateActivityLog('Chat list updated');
        });
    }
    
    // Load initial demo data
    loadInitialData() {
        // Load chats
        this.state.chats = [...this.demoChats];
        this.state.currentChat = this.state.chats[0];
        
        // Load saved settings from localStorage
        this.loadSettings();
        
        // Set initial connection status
        this.elements.connectionStatus.className = 'status-indicator online';
        
        // Update all UI components
        this.updateChatList();
        this.updateActivityLog('System initialized');
    }
    
    // Load settings from localStorage
    loadSettings() {
        const savedTheme = localStorage.getItem('chat-theme');
        if (savedTheme) {
            this.state.theme = savedTheme;
            this.elements.themeSelect.value = savedTheme;
        }
        
        const savedDelay = localStorage.getItem('queue-delay');
        if (savedDelay) {
            this.state.queueDelay = parseInt(savedDelay);
            this.elements.queueDelay.value = savedDelay;
            this.elements.delayValue.textContent = `${savedDelay}ms`;
        }
        
        const savedAutoProcess = localStorage.getItem('auto-process');
        if (savedAutoProcess !== null) {
            this.state.autoProcessQueue = savedAutoProcess === 'true';
            this.elements.autoProcess.checked = this.state.autoProcessQueue;
        }
        
        const savedAutoReply = localStorage.getItem('auto-reply');
        if (savedAutoReply !== null) {
            this.state.autoReply = savedAutoReply === 'true';
            this.elements.autoReply.checked = this.state.autoReply;
        }
    }
    
    // Apply theme based on selection
    applyTheme() {
        const theme = this.state.theme;
        
        if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        
        localStorage.setItem('chat-theme', theme);
    }
    
    // Update all UI components
    updateUI() {
        this.updateChatHeader();
        this.updateQueueStatus();
        this.updateAllQueueDisplays();
        this.updateActivityLog('UI updated');
    }
    
    // Send a new message
    sendMessage() {
        const messageText = this.elements.messageInput.value.trim();
        
        if (!messageText || !this.state.currentChat) return;
        
        // Create message object
        const message = {
            id: Date.now(),
            text: messageText,
            sender: 'You',
            timestamp: new Date(),
            status: 'pending',
            chatId: this.state.currentChat.id
        };
        
        // Add to messages array
        this.state.messages.push(message);
        
        // Clear input
        this.elements.messageInput.value = '';
        
        // Add to message queue
        this.addToQueue(message);
        
        // Trigger custom event
        document.dispatchEvent(this.events.messageSent);
        
        // Render message
        this.renderMessage(message);
        
        // Auto-reply if enabled
        if (this.state.autoReply && this.state.currentChat.type === 'bot') {
            setTimeout(() => this.generateAutoReply(), 1500);
        }
        
        // Auto-process queue if enabled
        if (this.state.autoProcessQueue && !this.state.isQueueProcessing && !this.state.isQueuePaused) {
            this.processQueue();
        }
    }
    
    // Add message to processing queue
    addToQueue(message) {
        this.state.messageQueue.push(message);
        this.state.totalMessages++;
        
        // Update UI
        this.updateQueueStatus();
        
        // Trigger custom event
        document.dispatchEvent(this.events.queueUpdated);
    }
    
    // Process messages in the queue
    async processQueue(processAll = false) {
        if (this.state.isQueueProcessing || this.state.messageQueue.length === 0) return;
        
        this.state.isQueueProcessing = true;
        this.updateQueueStatus();
        
        // Process messages with delay
        while (this.state.messageQueue.length > 0 && !this.state.isQueuePaused) {
            const message = this.state.messageQueue.shift();
            
            // Simulate processing delay
            await this.sleep(this.state.queueDelay);
            
            // Update message status
            message.status = 'sent';
            message.timestamp = new Date();
            this.state.processedMessages++;
            
            // Update UI
            this.updateMessageStatus(message.id, 'sent');
            
            // Trigger custom event
            document.dispatchEvent(this.events.messageReceived);
            
            // If not processing all, break after one
            if (!processAll) break;
        }
        
        this.state.isQueueProcessing = false;
        this.updateQueueStatus();
    }
    
    // Clear the message queue
    clearQueue(clearAll = false) {
        if (clearAll) {
            this.state.failedMessages += this.state.messageQueue.length;
            this.state.messageQueue = [];
        } else {
            // Only clear pending messages for current chat
            const currentChatId = this.state.currentChat?.id;
            if (currentChatId) {
                this.state.messageQueue = this.state.messageQueue.filter(msg => 
                    msg.chatId !== currentChatId
                );
            }
        }
        
        // Trigger custom event
        document.dispatchEvent(this.events.queueUpdated);
        
        this.updateActivityLog(clearAll ? 'Entire queue cleared' : 'Queue cleared for current chat');
    }
    
    // Generate auto-reply from bot
    generateAutoReply() {
        if (!this.state.currentChat || this.state.currentChat.type !== 'bot') return;
        
        const randomResponse = this.botResponses[Math.floor(Math.random() * this.botResponses.length)];
        
        const reply = {
            id: Date.now(),
            text: randomResponse,
            sender: this.state.currentChat.name,
            timestamp: new Date(),
            status: 'sent',
            chatId: this.state.currentChat.id
        };
        
        // Add to messages
        this.state.messages.push(reply);
        
        // Render message
        this.renderMessage(reply);
        
        this.updateActivityLog('Auto-reply generated');
    }
    
    // Render a message in the chat
    renderMessage(message) {
        if (!this.state.currentChat || message.chatId !== this.state.currentChat.id) return;
        
        // Hide welcome screen if visible
        if (this.elements.welcomeScreen.style.display !== 'none') {
            this.elements.welcomeScreen.style.display = 'none';
            this.elements.messagesContainer.style.overflowY = 'auto';
        }
        
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message ${message.sender === 'You' ? 'sent' : 'received'}`;
        messageEl.dataset.id = message.id;
        
        if (this.state.messageAnimation) {
            messageEl.style.animation = 'messageAppear 0.3s ease-out';
        }
        
        const timeString = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageEl.innerHTML = `
            <div class="message-content">${this.escapeHtml(message.text)}</div>
            <div class="message-info">
                <span class="message-time">${timeString}</span>
                ${message.sender === 'You' ? `<span class="message-status ${message.status}">${message.status}</span>` : ''}
            </div>
        `;
        
        this.elements.messages.appendChild(messageEl);
        
        // Scroll to bottom
        this.scrollToBottom();
    }
    
    // Update message status
    updateMessageStatus(messageId, status) {
        const messageEl = document.querySelector(`.message[data-id="${messageId}"]`);
        if (messageEl) {
            const statusEl = messageEl.querySelector('.message-status');
            if (statusEl) {
                statusEl.textContent = status;
                statusEl.className = `message-status ${status}`;
            }
        }
    }
    
    // Create a new chat
    createNewChat() {
        const chatId = this.state.chats.length + 1;
        const newChat = {
            id: chatId,
            name: `New Chat ${chatId}`,
            avatar: 'NC',
            lastMessage: 'Say hello!',
            unread: 0,
            type: 'user'
        };
        
        this.state.chats.unshift(newChat);
        this.state.currentChat = newChat;
        
        // Clear current messages
        this.clearCurrentChat();
        
        // Trigger custom event
        document.dispatchEvent(this.events.chatUpdated);
        
        this.updateActivityLog('New chat created');
    }
    
    // Start demo with sample chat
    startDemo() {
        this.state.currentChat = this.state.chats[0];
        this.clearCurrentChat();
        
        // Add welcome message
        const welcomeMessage = {
            id: Date.now(),
            text: "Hello! I'm your chat assistant. Send a message to see how the async queue simulation works!",
            sender: this.state.currentChat.name,
            timestamp: new Date(),
            status: 'sent',
            chatId: this.state.currentChat.id
        };
        
        this.state.messages.push(welcomeMessage);
        this.renderMessage(welcomeMessage);
        
        // Enable input
        this.elements.messageInput.disabled = false;
        this.elements.sendBtn.disabled = false;
        
        this.updateActivityLog('Demo started');
    }
    
    // Clear current chat messages
    clearCurrentChat() {
        this.state.messages = this.state.messages.filter(
            msg => msg.chatId !== this.state.currentChat?.id
        );
        
        this.elements.messages.innerHTML = '';
        
        if (this.state.currentChat) {
            this.updateActivityLog(`Chat cleared: ${this.state.currentChat.name}`);
        }
    }
    
    // Load demo message history
    loadDemoHistory() {
        if (!this.state.currentChat) return;
        
        const demoMessages = [
            { id: 1, text: "Welcome to the chat simulator!", sender: this.state.currentChat.name, timestamp: new Date(Date.now() - 3600000), status: 'sent', chatId: this.state.currentChat.id },
            { id: 2, text: "This demonstrates async message queue simulation.", sender: this.state.currentChat.name, timestamp: new Date(Date.now() - 3000000), status: 'sent', chatId: this.state.currentChat.id },
            { id: 3, text: "Messages are processed with configurable delays.", sender: 'You', timestamp: new Date(Date.now() - 2400000), status: 'sent', chatId: this.state.currentChat.id },
            { id: 4, text: "You can adjust queue settings in the panel.", sender: this.state.currentChat.name, timestamp: new Date(Date.now() - 1800000), status: 'sent', chatId: this.state.currentChat.id },
            { id: 5, text: "Try sending messages to see the queue in action!", sender: 'You', timestamp: new Date(Date.now() - 1200000), status: 'sent', chatId: this.state.currentChat.id }
        ];
        
        // Add to messages
        this.state.messages.push(...demoMessages);
        
        // Render all messages
        demoMessages.forEach(msg => this.renderMessage(msg));
        
        this.updateActivityLog('Demo history loaded');
    }
    
    // Update chat list in sidebar
    updateChatList() {
        if (!this.elements.chatsList) return;
        
        this.elements.chatsList.innerHTML = '';
        
        this.state.chats.forEach(chat => {
            const chatEl = document.createElement('div');
            chatEl.className = `chat-item ${this.state.currentChat?.id === chat.id ? 'active' : ''}`;
            chatEl.dataset.chatId = chat.id;
            
            chatEl.innerHTML = `
                <div class="chat-item-avatar">
                    <img src="https://ui-avatars.com/api/?name=${chat.avatar}&background=${this.getAvatarColor(chat.type)}&color=fff" alt="${chat.name}" class="avatar">
                </div>
                <div class="chat-item-info">
                    <h4>${chat.name}</h4>
                    <p>${chat.lastMessage}</p>
                </div>
                <div class="chat-item-meta">
                    <span class="chat-item-time">${this.formatTime(new Date())}</span>
                    ${chat.unread > 0 ? `<span class="chat-item-unread">${chat.unread}</span>` : ''}
                </div>
            `;
            
            chatEl.addEventListener('click', () => this.switchChat(chat.id));
            this.elements.chatsList.appendChild(chatEl);
        });
        
        // Update active chats count
        this.elements.activeChats.textContent = this.state.chats.length;
    }
    
    // Switch to a different chat
    switchChat(chatId) {
        const chat = this.state.chats.find(c => c.id === chatId);
        if (!chat) return;
        
        this.state.currentChat = chat;
        
        // Filter messages for this chat
        const chatMessages = this.state.messages.filter(msg => msg.chatId === chatId);
        
        // Clear and render messages
        this.elements.messages.innerHTML = '';
        chatMessages.forEach(msg => this.renderMessage(msg));
        
        // Show/hide welcome screen
        if (chatMessages.length === 0 && chat.type === 'bot') {
            this.elements.welcomeScreen.style.display = 'flex';
            this.elements.messagesContainer.style.overflowY = 'hidden';
        } else {
            this.elements.welcomeScreen.style.display = 'none';
            this.elements.messagesContainer.style.overflowY = 'auto';
        }
        
        // Enable/disable input based on chat type
        const isInputDisabled = chat.type === 'channel';
        this.elements.messageInput.disabled = isInputDisabled;
        this.elements.sendBtn.disabled = isInputDisabled;
        this.elements.messageInput.placeholder = isInputDisabled ? 'Cannot send to channel' : 'Type a message...';
        
        // Update UI
        this.updateChatHeader();
        this.updateChatList();
        
        this.updateActivityLog(`Switched to chat: ${chat.name}`);
    }
    
    // Update chat header
    updateChatHeader() {
        if (!this.state.currentChat) return;
        
        const chatHeader = this.elements.chatHeader.querySelector('.chat-info');
        chatHeader.innerHTML = `
            <div class="chat-avatar">
                <img src="https://ui-avatars.com/api/?name=${this.state.currentChat.avatar}&background=${this.getAvatarColor(this.state.currentChat.type)}&color=fff" alt="${this.state.currentChat.name}" class="avatar">
                <div class="status-indicator online"></div>
            </div>
            <div>
                <h3>${this.state.currentChat.name}</h3>
                <p class="chat-status">${this.getChatStatus()}</p>
            </div>
        `;
    }
    
    // Get chat status text
    getChatStatus() {
        if (!this.state.currentChat) return 'Select a chat to start messaging';
        
        switch (this.state.currentChat.type) {
            case 'bot': return 'AI Assistant • Online';
            case 'support': return 'Support • Typically replies within 5 minutes';
            case 'channel': return 'Channel • Read only';
            default: return 'Online';
        }
    }
    
    // Get avatar color based on chat type
    getAvatarColor(type) {
        switch (type) {
            case 'bot': return '10b981';
            case 'support': return 'f59e0b';
            case 'channel': return '8b5cf6';
            default: return '4f46e5';
        }
    }
    
    // Update queue status display
    updateQueueStatus() {
        const queueSize = this.state.messageQueue.length;
        const isProcessing = this.state.isQueueProcessing;
        const isPaused = this.state.isQueuePaused;
        
        this.elements.queueStatus.textContent = `Queue: ${queueSize} message${queueSize !== 1 ? 's' : ''}`;
        this.elements.queueCount.textContent = `${queueSize} message${queueSize !== 1 ? 's' : ''} in queue`;
        
        // Update connection status
        if (isPaused) {
            this.elements.connectionStatus.className = 'status-indicator offline';
        } else if (isProcessing) {
            this.elements.connectionStatus.className = 'status-indicator online';
        } else {
            this.elements.connectionStatus.className = 'status-indicator online';
        }
        
        // Show/hide queue info
        this.elements.queueInfo.style.display = queueSize > 0 ? 'flex' : 'none';
    }
    
    // Update all queue displays
    updateAllQueueDisplays() {
        const queueSize = this.state.messageQueue.length;
        
        this.elements.settingsQueueSize.textContent = queueSize;
        this.elements.totalMessages.textContent = this.state.totalMessages;
        this.elements.modalQueueSize.textContent = queueSize;
        this.elements.modalProcessed.textContent = this.state.processedMessages;
        this.elements.modalFailed.textContent = this.state.failedMessages;
    }
    
    // Update activity log
    updateActivityLog(activity) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const activityEl = document.createElement('div');
        activityEl.className = 'activity-item';
        activityEl.innerHTML = `
            <div class="activity-time">${time}</div>
            <div class="activity-message">
                <span>${activity}</span>
                <span>Queue: ${this.state.messageQueue.length}</span>
            </div>
        `;
        
        this.elements.activityList.prepend(activityEl);
        
        // Keep only last 10 activities
        const activities = this.elements.activityList.querySelectorAll('.activity-item');
        if (activities.length > 10) {
            activities[activities.length - 1].remove();
        }
    }
    
    // Filter chats based on search input
    filterChats(searchTerm) {
        const chatItems = this.elements.chatsList.querySelectorAll('.chat-item');
        
        chatItems.forEach(item => {
            const chatName = item.querySelector('h4').textContent.toLowerCase();
            const isVisible = chatName.includes(searchTerm.toLowerCase());
            item.style.display = isVisible ? 'flex' : 'none';
        });
    }
    
    // Toggle settings panel
    toggleSettingsPanel() {
        this.elements.settingsPanel.classList.toggle('active');
    }
    
    // Show queue modal
    showQueueModal() {
        this.elements.queueModal.classList.add('active');
        this.updateAllQueueDisplays();
    }
    
    // Hide queue modal
    hideQueueModal() {
        this.elements.queueModal.classList.remove('active');
    }
    
    // Toggle queue pause state
    toggleQueuePause() {
        this.state.isQueuePaused = !this.state.isQueuePaused;
        
        const pauseBtn = this.elements.pauseQueueBtn;
        if (this.state.isQueuePaused) {
            pauseBtn.innerHTML = '<i class="fas fa-play-circle"></i> Resume Processing';
            pauseBtn.classList.remove('btn-secondary');
            pauseBtn.classList.add('btn-primary');
        } else {
            pauseBtn.innerHTML = '<i class="fas fa-pause-circle"></i> Pause Processing';
            pauseBtn.classList.remove('btn-primary');
            pauseBtn.classList.add('btn-secondary');
            
            // Resume processing if auto-process is enabled
            if (this.state.autoProcessQueue && this.state.messageQueue.length > 0) {
                this.processQueue();
            }
        }
        
        this.updateQueueStatus();
        this.updateActivityLog(`Queue processing ${this.state.isQueuePaused ? 'paused' : 'resumed'}`);
    }
    
    // Update queue delay
    updateQueueDelay(delay) {
        this.state.queueDelay = parseInt(delay);
        this.elements.delayValue.textContent = `${delay}ms`;
        localStorage.setItem('queue-delay', delay);
        
        this.updateActivityLog(`Queue delay updated to ${delay}ms`);
    }
    
    // Toggle auto-process queue
    toggleAutoProcess(enabled) {
        this.state.autoProcessQueue = enabled;
        localStorage.setItem('auto-process', enabled);
        
        this.updateActivityLog(`Auto-process queue ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    // Toggle auto-reply
    toggleAutoReply(enabled) {
        this.state.autoReply = enabled;
        localStorage.setItem('auto-reply', enabled);
        
        this.updateActivityLog(`Auto-reply ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    // Change theme
    changeTheme(theme) {
        this.state.theme = theme;
        this.applyTheme();
        
        this.updateActivityLog(`Theme changed to ${theme}`);
    }
    
    // Toggle message animation
    toggleMessageAnimation(enabled) {
        this.state.messageAnimation = enabled;
        
        this.updateActivityLog(`Message animation ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    // Utility function to sleep/delay
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Utility to escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Format time for display
    formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Scroll to bottom of messages
    scrollToBottom() {
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.chatSimulator = new ChatSimulator();
});