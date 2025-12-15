// Pomodoro Timer Application
class PomodoroTimer {
    constructor() {
        this.timer = null;
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.isRunning = false;
        this.isPaused = false;
        this.currentMode = 'focus'; // 'focus', 'shortBreak', 'longBreak'
        this.sessionCount = 0;
        this.totalSessions = 4;
        this.settings = this.loadSettings();
        this.sessions = this.loadSessions();
        this.goals = this.loadGoals();
        this.achievements = this.loadAchievements();
        this.currentTask = null;
        
        this.init();
    }

    init() {
        this.initializeElements();
        this.setupEventListeners();
        this.updateTimerDisplay();
        this.updateStats();
        this.renderSessions();
        this.renderGoals();
        this.renderAchievements();
        this.setupChart();
        
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        // Check for achievements
        this.checkAchievements();
    }

    initializeElements() {
        // Timer elements
        this.minutesEl = document.getElementById('minutes');
        this.secondsEl = document.getElementById('seconds');
        this.timerModeEl = document.getElementById('timer-mode');
        this.sessionNumberEl = document.getElementById('session-number');
        this.totalSessionsEl = document.getElementById('total-sessions');
        this.timerProgress = document.querySelector('.timer-progress');
        
        // Control buttons
        this.startBtn = document.getElementById('start-timer');
        this.pauseBtn = document.getElementById('pause-timer');
        this.resetBtn = document.getElementById('reset-timer');
        this.skipBtn = document.getElementById('skip-timer');
        
        // Task elements
        this.taskInput = document.getElementById('task-input');
        this.addTaskBtn = document.getElementById('add-task');
        this.clearTaskBtn = document.getElementById('clear-task');
        this.currentTaskEl = document.getElementById('current-task');
        
        // Settings elements
        this.focusTimeInput = document.getElementById('focus-time');
        this.shortBreakInput = document.getElementById('short-break');
        this.longBreakInput = document.getElementById('long-break');
        this.sessionsBeforeLongBreakInput = document.getElementById('sessions-before-long-break');
        this.applySettingsBtn = document.getElementById('apply-settings');
        this.resetSettingsBtn = document.getElementById('reset-settings');
        
        // Sessions elements
        this.sessionsList = document.getElementById('sessions-list');
        this.exportSessionsBtn = document.getElementById('export-sessions');
        this.clearTodaySessionsBtn = document.getElementById('clear-today-sessions');
        
        // Stats elements
        this.todaySessionsEl = document.getElementById('today-sessions');
        this.totalFocusTimeEl = document.getElementById('total-focus-time');
        this.currentStreakEl = document.getElementById('current-streak');
        this.productivityScoreEl = document.getElementById('productivity-score');
        this.weeklySessionsEl = document.getElementById('weekly-sessions');
        this.weeklyFocusTimeEl = document.getElementById('weekly-focus-time');
        this.completionRateEl = document.getElementById('completion-rate');
        this.productivityTrendEl = document.getElementById('productivity-trend');
        
        // Goals elements
        this.goalsList = document.getElementById('goals-list');
        this.addGoalBtn = document.getElementById('add-goal');
        this.goalModal = document.getElementById('goal-modal');
        this.saveGoalBtn = document.getElementById('save-goal');
        
        // Footer elements
        this.toggleNotificationsBtn = document.getElementById('toggle-notifications');
        this.toggleSoundBtn = document.getElementById('toggle-sound');
        
        // Templates
        this.sessionTemplate = document.getElementById('session-template');
        this.goalTemplate = document.getElementById('goal-template');
        this.achievementTemplate = document.getElementById('achievement-template');
        
        // Chart
        this.focusChart = null;
        
        // Sounds
        this.startSound = document.getElementById('start-sound');
        this.endSound = document.getElementById('end-sound');
        this.tickSound = document.getElementById('tick-sound');
        
        // Initialize settings
        this.updateSettingsInputs();
    }

    setupEventListeners() {
        // Timer controls
        this.startBtn.addEventListener('click', () => this.startTimer());
        this.pauseBtn.addEventListener('click', () => this.pauseTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        this.skipBtn.addEventListener('click', () => this.skipTimer());
        
        // Task management
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.clearTaskBtn.addEventListener('click', () => this.clearTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        
        // Settings
        this.applySettingsBtn.addEventListener('click', () => this.applySettings());
        this.resetSettingsBtn.addEventListener('click', () => this.resetSettings());
        
        // Sessions
        this.exportSessionsBtn.addEventListener('click', () => this.exportSessions());
        this.clearTodaySessionsBtn.addEventListener('click', () => this.clearTodaySessions());
        
        // Goals
        this.addGoalBtn.addEventListener('click', () => this.openGoalModal());
        this.saveGoalBtn.addEventListener('click', () => this.saveGoal());
        
        // Modals
        document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });
        
        // Footer actions
        this.toggleNotificationsBtn.addEventListener('click', () => this.toggleNotifications());
        this.toggleSoundBtn.addEventListener('click', () => this.toggleSound());
        
        // Window events
        window.addEventListener('beforeunload', () => this.saveState());
        
        // Audio events
        this.startSound.addEventListener('loadeddata', () => {
            console.log('Start sound loaded');
        });
        
        this.endSound.addEventListener('loadeddata', () => {
            console.log('End sound loaded');
        });
    }

    // Timer Methods
    startTimer() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.startBtn.innerHTML = '<i class="fas fa-play"></i> Running...';
        
        // Update timer circle
        this.updateTimerCircle();
        
        // Play start sound if enabled
        if (this.settings.soundEnabled) {
            this.playSound('start');
        }
        
        // Show notification
        if (this.settings.notificationsEnabled) {
            this.showNotification('Timer Started', `${this.currentMode === 'focus' ? 'Focus time!' : 'Break time!'}`);
        }
        
        // Start the timer
        this.timer = setInterval(() => this.updateTimer(), 1000);
        
        // Add pulse animation
        document.querySelector('.timer-circle').classList.add('pulse');
    }

    pauseTimer() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        this.isPaused = true;
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.startBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        
        clearInterval(this.timer);
        
        // Remove pulse animation
        document.querySelector('.timer-circle').classList.remove('pulse');
        
        // Show notification
        if (this.settings.notificationsEnabled) {
            this.showNotification('Timer Paused', 'Take a moment...');
        }
    }

    resetTimer() {
        this.isRunning = false;
        this.isPaused = false;
        
        clearInterval(this.timer);
        
        // Reset to current mode's time
        this.timeLeft = this.getModeDuration(this.currentMode) * 60;
        
        this.updateTimerDisplay();
        this.updateTimerCircle();
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
        
        // Remove pulse animation
        document.querySelector('.timer-circle').classList.remove('pulse');
        
        // Reset timer mode display
        this.updateTimerModeDisplay();
    }

    skipTimer() {
        // Save current session if focus mode was completed
        if (this.currentMode === 'focus' && this.timeLeft <= 0) {
            this.saveSession();
        }
        
        // Switch to next mode
        this.switchToNextMode();
        
        // Reset timer for new mode
        this.resetTimer();
        
        // Show notification
        if (this.settings.notificationsEnabled) {
            const nextMode = this.currentMode === 'focus' ? 'Focus' : 
                           this.currentMode === 'shortBreak' ? 'Short Break' : 'Long Break';
            this.showNotification('Mode Changed', `Switched to ${nextMode} mode`);
        }
    }

    updateTimer() {
        this.timeLeft--;
        
        if (this.timeLeft <= 0) {
            this.timerComplete();
            return;
        }
        
        this.updateTimerDisplay();
        this.updateTimerCircle();
        
        // Play tick sound every minute
        if (this.settings.soundEnabled && this.timeLeft % 60 === 0) {
            this.playSound('tick');
        }
    }

    timerComplete() {
        clearInterval(this.timer);
        this.isRunning = false;
        
        // Play end sound
        if (this.settings.soundEnabled) {
            this.playSound('end');
        }
        
        // Handle completion based on mode
        if (this.currentMode === 'focus') {
            this.handleFocusComplete();
        } else {
            this.handleBreakComplete();
        }
        
        // Update UI
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
        
        // Remove pulse animation
        document.querySelector('.timer-circle').classList.remove('pulse');
        
        // Switch to next mode automatically
        setTimeout(() => {
            this.switchToNextMode();
            this.resetTimer();
        }, 1000);
    }

    handleFocusComplete() {
        // Save session
        this.saveSession();
        
        // Update session count
        this.sessionCount++;
        
        // Update goals
        this.updateGoals();
        
        // Check achievements
        this.checkAchievements();
        
        // Show completion notification
        if (this.settings.notificationsEnabled) {
            this.showNotification('Focus Session Complete!', 'Great job! Time for a break.');
        }
        
        // Show toast
        toastr.success('Focus session completed! Time for a break.');
    }

    handleBreakComplete() {
        const breakType = this.currentMode === 'shortBreak' ? 'Short break' : 'Long break';
        
        if (this.settings.notificationsEnabled) {
            this.showNotification(`${breakType} Complete!`, 'Ready for another focus session?');
        }
        
        toastr.info(`${breakType} completed! Ready to focus again?`);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        this.minutesEl.textContent = minutes.toString().padStart(2, '0');
        this.secondsEl.textContent = seconds.toString().padStart(2, '0');
    }

    updateTimerCircle() {
        const totalDuration = this.getModeDuration(this.currentMode) * 60;
        const progress = 1 - (this.timeLeft / totalDuration);
        const circumference = 2 * Math.PI * 130;
        const offset = circumference * progress;
        
        this.timerProgress.style.strokeDashoffset = offset;
    }

    updateTimerModeDisplay() {
        const modeText = this.currentMode === 'focus' ? 'Focus Time' :
                        this.currentMode === 'shortBreak' ? 'Short Break' : 'Long Break';
        
        this.timerModeEl.textContent = modeText;
        this.sessionNumberEl.textContent = this.sessionCount + 1;
        this.totalSessionsEl.textContent = this.settings.sessionsBeforeLongBreak;
        
        // Update circle color based on mode
        const color = this.currentMode === 'focus' ? 'var(--focus-color)' :
                     this.currentMode === 'shortBreak' ? 'var(--short-break-color)' : 'var(--long-break-color)';
        
        this.timerProgress.style.stroke = color;
        
        // Update timer circle class
        const timerCircle = document.querySelector('.timer-circle');
        timerCircle.classList.remove('timer-focus', 'timer-short-break', 'timer-long-break');
        
        if (this.currentMode === 'focus') {
            timerCircle.classList.add('timer-focus');
        } else if (this.currentMode === 'shortBreak') {
            timerCircle.classList.add('timer-short-break');
        } else {
            timerCircle.classList.add('timer-long-break');
        }
    }

    switchToNextMode() {
        if (this.currentMode === 'focus') {
            this.sessionCount++;
            
            if (this.sessionCount % this.settings.sessionsBeforeLongBreak === 0) {
                this.currentMode = 'longBreak';
            } else {
                this.currentMode = 'shortBreak';
            }
        } else {
            this.currentMode = 'focus';
        }
        
        this.timeLeft = this.getModeDuration(this.currentMode) * 60;
        this.updateTimerModeDisplay();
    }

    getModeDuration(mode) {
        switch (mode) {
            case 'focus':
                return this.settings.focusDuration;
            case 'shortBreak':
                return this.settings.shortBreakDuration;
            case 'longBreak':
                return this.settings.longBreakDuration;
            default:
                return 25;
        }
    }

    // Session Management
    saveSession() {
        const session = {
            id: Date.now(),
            date: new Date().toISOString(),
            duration: this.settings.focusDuration,
            task: this.currentTask || 'Unnamed Task',
            mode: 'focus',
            completed: true
        };
        
        this.sessions.push(session);
        this.saveSessions();
        this.renderSessions();
        this.updateStats();
        this.updateChart();
        
        // Check for daily streak
        this.updateStreak();
    }

    renderSessions() {
        this.sessionsList.innerHTML = '';
        
        // Get today's sessions
        const today = new Date().toDateString();
        const todaySessions = this.sessions.filter(session => {
            const sessionDate = new Date(session.date).toDateString();
            return sessionDate === today;
        });
        
        if (todaySessions.length === 0) {
            this.sessionsList.innerHTML = `
                <div class="empty-sessions">
                    <i class="fas fa-clock"></i>
                    <p>No sessions completed today. Start your first Pomodoro!</p>
                </div>
            `;
            return;
        }
        
        // Sort by date (newest first)
        todaySessions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        todaySessions.forEach(session => {
            const template = this.sessionTemplate.content.cloneNode(true);
            const sessionItem = template.querySelector('.session-item');
            
            // Format time
            const date = new Date(session.date);
            const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            template.querySelector('.session-start').textContent = timeString;
            template.querySelector('.session-duration').textContent = `${session.duration} min`;
            template.querySelector('.session-task').textContent = session.task;
            template.querySelector('.session-type').textContent = session.mode === 'focus' ? 'Focus' : 
                                                                session.mode === 'shortBreak' ? 'Short Break' : 'Long Break';
            
            // Format date relative to today
            const today = new Date();
            const sessionDate = new Date(session.date);
            const diffTime = today - sessionDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            let dateText = 'Today';
            if (diffDays === 1) dateText = 'Yesterday';
            else if (diffDays > 1) dateText = `${diffDays} days ago`;
            
            template.querySelector('.session-date').textContent = dateText;
            
            // Add delete functionality
            const deleteBtn = template.querySelector('.btn-delete');
            deleteBtn.addEventListener('click', () => {
                this.deleteSession(session.id);
            });
            
            this.sessionsList.appendChild(sessionItem);
        });
    }

    deleteSession(id) {
        this.sessions = this.sessions.filter(session => session.id !== id);
        this.saveSessions();
        this.renderSessions();
        this.updateStats();
        this.updateChart();
        
        toastr.info('Session deleted');
    }

    clearTodaySessions() {
        const today = new Date().toDateString();
        const filteredSessions = this.sessions.filter(session => {
            const sessionDate = new Date(session.date).toDateString();
            return sessionDate !== today;
        });
        
        if (filteredSessions.length === this.sessions.length) {
            toastr.info('No sessions to delete from today');
            return;
        }
        
        this.sessions = filteredSessions;
        this.saveSessions();
        this.renderSessions();
        this.updateStats();
        this.updateChart();
        
        toastr.success('Today\'s sessions cleared');
    }

    exportSessions() {
        const data = {
            sessions: this.sessions,
            exportDate: new Date().toISOString(),
            totalFocusTime: this.calculateTotalFocusTime(),
            totalSessions: this.sessions.length
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `pomodoro-sessions-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        toastr.success('Sessions exported successfully');
    }

    // Task Management
    addTask() {
        const taskText = this.taskInput.value.trim();
        if (!taskText) {
            toastr.error('Please enter a task');
            return;
        }
        
        this.currentTask = taskText;
        this.renderCurrentTask();
        this.taskInput.value = '';
        
        toastr.success('Task added');
    }

    clearTask() {
        this.currentTask = null;
        this.renderCurrentTask();
        toastr.info('Task cleared');
    }

    renderCurrentTask() {
        if (!this.currentTask) {
            this.currentTaskEl.innerHTML = `
                <div class="empty-task">
                    <i class="fas fa-lightbulb"></i>
                    <p>No task set. Add a task to track your focus session.</p>
                </div>
            `;
            return;
        }
        
        this.currentTaskEl.innerHTML = `
            <div class="task-item">
                <div class="task-checkbox">
                    <input type="checkbox" id="current-task-check">
                    <div class="custom-checkbox"></div>
                </div>
                <div class="task-content">
                    <div class="task-text">${this.currentTask}</div>
                    <div class="task-meta">
                        <span class="task-status">In progress</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Settings Management
    loadSettings() {
        const defaultSettings = {
            focusDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            sessionsBeforeLongBreak: 4,
            soundEnabled: true,
            notificationsEnabled: true,
            autoStartBreaks: false,
            autoStartPomodoros: false
        };
        
        const savedSettings = localStorage.getItem('pomodoroSettings');
        return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
    }

    saveSettings() {
        localStorage.setItem('pomodoroSettings', JSON.stringify(this.settings));
    }

    updateSettingsInputs() {
        this.focusTimeInput.value = this.settings.focusDuration;
        this.shortBreakInput.value = this.settings.shortBreakDuration;
        this.longBreakInput.value = this.settings.longBreakDuration;
        this.sessionsBeforeLongBreakInput.value = this.settings.sessionsBeforeLongBreak;
    }

    applySettings() {
        // Validate inputs
        const focusDuration = parseInt(this.focusTimeInput.value) || 25;
        const shortBreakDuration = parseInt(this.shortBreakInput.value) || 5;
        const longBreakDuration = parseInt(this.longBreakInput.value) || 15;
        const sessionsBeforeLongBreak = parseInt(this.sessionsBeforeLongBreakInput.value) || 4;
        
        if (focusDuration < 1 || focusDuration > 60) {
            toastr.error('Focus duration must be between 1 and 60 minutes');
            return;
        }
        
        if (shortBreakDuration < 1 || shortBreakDuration > 30) {
            toastr.error('Short break must be between 1 and 30 minutes');
            return;
        }
        
        if (longBreakDuration < 1 || longBreakDuration > 60) {
            toastr.error('Long break must be between 1 and 60 minutes');
            return;
        }
        
        if (sessionsBeforeLongBreak < 1 || sessionsBeforeLongBreak > 10) {
            toastr.error('Sessions before long break must be between 1 and 10');
            return;
        }
        
        // Update settings
        this.settings.focusDuration = focusDuration;
        this.settings.shortBreakDuration = shortBreakDuration;
        this.settings.longBreakDuration = longBreakDuration;
        this.settings.sessionsBeforeLongBreak = sessionsBeforeLongBreak;
        
        this.saveSettings();
        
        // Reset timer with new settings
        this.resetTimer();
        
        toastr.success('Settings applied successfully');
    }

    resetSettings() {
        const defaultSettings = {
            focusDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            sessionsBeforeLongBreak: 4,
            soundEnabled: true,
            notificationsEnabled: true,
            autoStartBreaks: false,
            autoStartPomodoros: false
        };
        
        this.settings = defaultSettings;
        this.saveSettings();
        this.updateSettingsInputs();
        this.resetTimer();
        
        toastr.success('Settings reset to default');
    }

    toggleNotifications() {
        this.settings.notificationsEnabled = !this.settings.notificationsEnabled;
        this.saveSettings();
        
        const btn = this.toggleNotificationsBtn;
        if (this.settings.notificationsEnabled) {
            btn.innerHTML = '<i class="fas fa-bell"></i> Notifications ON';
            btn.classList.remove('btn-outline');
            btn.classList.add('btn-primary');
            toastr.success('Notifications enabled');
        } else {
            btn.innerHTML = '<i class="fas fa-bell-slash"></i> Notifications OFF';
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-outline');
            toastr.info('Notifications disabled');
        }
        
        // Request permission if enabling
        if (this.settings.notificationsEnabled && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    toggleSound() {
        this.settings.soundEnabled = !this.settings.soundEnabled;
        this.saveSettings();
        
        const btn = this.toggleSoundBtn;
        if (this.settings.soundEnabled) {
            btn.innerHTML = '<i class="fas fa-volume-up"></i> Sound ON';
            btn.classList.remove('btn-outline');
            btn.classList.add('btn-primary');
            toastr.success('Sound enabled');
        } else {
            btn.innerHTML = '<i class="fas fa-volume-mute"></i> Sound OFF';
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-outline');
            toastr.info('Sound disabled');
        }
    }

    // Stats & Analytics
    updateStats() {
        // Today's sessions
        const today = new Date().toDateString();
        const todaySessions = this.sessions.filter(session => {
            const sessionDate = new Date(session.date).toDateString();
            return sessionDate === today;
        });
        
        this.todaySessionsEl.textContent = todaySessions.length;
        
        // Total focus time
        const totalMinutes = this.sessions.reduce((total, session) => {
            return total + (session.mode === 'focus' ? session.duration : 0);
        }, 0);
        
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        this.totalFocusTimeEl.textContent = `${hours}h ${minutes}m`;
        
        // Current streak
        const streak = this.calculateStreak();
        this.currentStreakEl.textContent = `${streak} ${streak === 1 ? 'day' : 'days'}`;
        
        // Productivity score
        const productivity = this.calculateProductivity();
        this.productivityScoreEl.textContent = `${productivity}%`;
        
        // Weekly stats
        this.updateWeeklyStats();
    }

    calculateStreak() {
        if (this.sessions.length === 0) return 0;
        
        let streak = 0;
        const today = new Date();
        let currentDate = new Date(today);
        
        // Sort sessions by date
        const sortedSessions = [...this.sessions].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Check consecutive days
        for (let i = 0; i < sortedSessions.length; i++) {
            const sessionDate = new Date(sortedSessions[i].date);
            const sessionDateStr = sessionDate.toDateString();
            const checkDateStr = currentDate.toDateString();
            
            if (sessionDateStr === checkDateStr) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else if (sessionDate < currentDate) {
                break;
            }
        }
        
        return streak;
    }

    calculateProductivity() {
        if (this.sessions.length === 0) return 0;
        
        const focusSessions = this.sessions.filter(s => s.mode === 'focus');
        const completedSessions = focusSessions.filter(s => s.completed);
        
        return Math.round((completedSessions.length / focusSessions.length) * 100);
    }

    updateWeeklyStats() {
        // Get this week's sessions
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const weeklySessions = this.sessions.filter(session => {
            return new Date(session.date) >= oneWeekAgo;
        });
        
        const weeklyFocusSessions = weeklySessions.filter(s => s.mode === 'focus');
        const weeklyFocusTime = weeklyFocusSessions.reduce((total, session) => total + session.duration, 0);
        
        this.weeklySessionsEl.textContent = weeklyFocusSessions.length;
        
        const hours = Math.floor(weeklyFocusTime / 60);
        const minutes = weeklyFocusTime % 60;
        this.weeklyFocusTimeEl.textContent = `${hours}h ${minutes}m`;
        
        // Completion rate
        const completedSessions = weeklyFocusSessions.filter(s => s.completed);
        const completionRate = weeklyFocusSessions.length > 0 ? 
            Math.round((completedSessions.length / weeklyFocusSessions.length) * 100) : 0;
        this.completionRateEl.textContent = `${completionRate}%`;
        
        // Productivity trend (simplified)
        this.productivityTrendEl.textContent = completionRate >= 80 ? '+10%' : 
                                              completionRate >= 60 ? '+5%' : 
                                              completionRate >= 40 ? '0%' : '-5%';
    }

    calculateTotalFocusTime() {
        return this.sessions.reduce((total, session) => {
            return total + (session.mode === 'focus' ? session.duration : 0);
        }, 0);
    }

    // Chart Setup
    setupChart() {
        const ctx = document.getElementById('focus-chart').getContext('2d');
        
        // Get last 7 days of data
        const last7Days = this.getLast7DaysData();
        
        this.focusChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days.labels,
                datasets: [{
                    label: 'Focus Sessions',
                    data: last7Days.data,
                    borderColor: 'rgb(67, 97, 238)',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y} sessions`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            precision: 0
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                }
            }
        });
    }

    getLast7DaysData() {
        const labels = [];
        const data = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const dateString = date.toLocaleDateString('en-US', { weekday: 'short' });
            labels.push(dateString);
            
            // Count sessions for this day
            const daySessions = this.sessions.filter(session => {
                const sessionDate = new Date(session.date);
                return sessionDate.toDateString() === date.toDateString();
            });
            
            data.push(daySessions.length);
        }
        
        return { labels, data };
    }

    updateChart() {
        if (!this.focusChart) return;
        
        const last7Days = this.getLast7DaysData();
        this.focusChart.data.labels = last7Days.labels;
        this.focusChart.data.datasets[0].data = last7Days.data;
        this.focusChart.update();
    }

    // Goals Management
    loadGoals() {
        const savedGoals = localStorage.getItem('pomodoroGoals');
        return savedGoals ? JSON.parse(savedGoals) : [];
    }

    saveGoals() {
        localStorage.setItem('pomodoroGoals', JSON.stringify(this.goals));
    }

    renderGoals() {
        this.goalsList.innerHTML = '';
        
        if (this.goals.length === 0) {
            this.goalsList.innerHTML = `
                <div class="empty-goals">
                    <i class="fas fa-flag"></i>
                    <p>No goals set. Add a goal to track your progress.</p>
                </div>
            `;
            return;
        }
        
        this.goals.forEach((goal, index) => {
            const template = this.goalTemplate.content.cloneNode(true);
            const goalItem = template.querySelector('.goal-item');
            
            // Calculate progress
            const completedSessions = this.sessions.filter(s => 
                s.mode === 'focus' && 
                new Date(s.date) >= new Date(goal.createdAt)
            ).length;
            
            const progress = Math.min((completedSessions / goal.targetSessions) * 100, 100);
            
            template.querySelector('.goal-title').textContent = goal.title;
            template.querySelector('.progress-fill').style.width = `${progress}%`;
            template.querySelector('.goal-stats').textContent = `${completedSessions}/${goal.targetSessions} sessions`;
            
            // Set checkbox state
            const checkbox = template.querySelector('.goal-check');
            checkbox.checked = completedSessions >= goal.targetSessions;
            checkbox.addEventListener('change', () => {
                this.toggleGoalCompletion(index);
            });
            
            // Edit button
            const editBtn = template.querySelector('.btn-edit');
            editBtn.addEventListener('click', () => {
                this.editGoal(index);
            });
            
            this.goalsList.appendChild(goalItem);
        });
    }

    openGoalModal() {
        this.goalModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    saveGoal() {
        const title = document.getElementById('goal-title').value.trim();
        const targetSessions = parseInt(document.getElementById('goal-sessions').value) || 4;
        const deadline = document.getElementById('goal-deadline').value;
        
        if (!title) {
            toastr.error('Please enter a goal title');
            return;
        }
        
        const goal = {
            id: Date.now(),
            title,
            targetSessions,
            deadline: deadline || null,
            createdAt: new Date().toISOString(),
            completed: false
        };
        
        this.goals.push(goal);
        this.saveGoals();
        this.renderGoals();
        this.closeModal();
        
        toastr.success('Goal added successfully');
    }

    editGoal(index) {
        const goal = this.goals[index];
        
        document.getElementById('goal-title').value = goal.title;
        document.getElementById('goal-sessions').value = goal.targetSessions;
        document.getElementById('goal-deadline').value = goal.deadline || '';
        
        this.openGoalModal();
        
        // Update save button to edit mode
        const saveBtn = document.getElementById('save-goal');
        saveBtn.textContent = 'Update Goal';
        saveBtn.onclick = () => this.updateGoal(index);
    }

    updateGoal(index) {
        const title = document.getElementById('goal-title').value.trim();
        const targetSessions = parseInt(document.getElementById('goal-sessions').value) || 4;
        const deadline = document.getElementById('goal-deadline').value;
        
        if (!title) {
            toastr.error('Please enter a goal title');
            return;
        }
        
        this.goals[index] = {
            ...this.goals[index],
            title,
            targetSessions,
            deadline: deadline || null
        };
        
        this.saveGoals();
        this.renderGoals();
        this.closeModal();
        
        toastr.success('Goal updated successfully');
    }

    toggleGoalCompletion(index) {
        this.goals[index].completed = !this.goals[index].completed;
        this.saveGoals();
        this.renderGoals();
    }

    updateGoals() {
        // This method is called when a focus session is completed
        // It updates all goals based on the new session
        this.renderGoals();
    }

    // Achievements
    loadAchievements() {
        const defaultAchievements = [
            {
                id: 1,
                title: 'First Session',
                description: 'Complete your first Pomodoro',
                icon: 'play',
                unlocked: false,
                requirement: { type: 'sessions', count: 1 }
            },
            {
                id: 2,
                title: '3-Day Streak',
                description: 'Use Pomodoro for 3 consecutive days',
                icon: 'fire',
                unlocked: false,
                requirement: { type: 'streak', count: 3 }
            },
            {
                id: 3,
                title: 'Focus Master',
                description: 'Complete 10 focus sessions',
                icon: 'brain',
                unlocked: false,
                requirement: { type: 'sessions', count: 10 }
            },
            {
                id: 4,
                title: 'Marathon Runner',
                description: 'Complete 50 focus sessions',
                icon: 'running',
                unlocked: false,
                requirement: { type: 'sessions', count: 50 }
            },
            {
                id: 5,
                title: 'Early Bird',
                description: 'Complete a session before 8 AM',
                icon: 'sun',
                unlocked: false,
                requirement: { type: 'earlySession', count: 1 }
            }
        ];
        
        const savedAchievements = localStorage.getItem('pomodoroAchievements');
        return savedAchievements ? JSON.parse(savedAchievements) : defaultAchievements;
    }

    saveAchievements() {
        localStorage.setItem('pomodoroAchievements', JSON.stringify(this.achievements));
    }

    renderAchievements() {
        const grid = document.getElementById('achievements-grid');
        grid.innerHTML = '';
        
        this.achievements.forEach(achievement => {
            const template = this.achievementTemplate.content.cloneNode(true);
            const achievementEl = template.querySelector('.achievement');
            
            if (!achievement.unlocked) {
                achievementEl.classList.add('locked');
            }
            
            template.querySelector('.achievement-icon i').className = `fas fa-${achievement.icon}`;
            template.querySelector('.achievement-title').textContent = achievement.title;
            template.querySelector('.achievement-desc').textContent = achievement.description;
            
            grid.appendChild(achievementEl);
        });
    }

    checkAchievements() {
        let newAchievements = false;
        
        this.achievements.forEach(achievement => {
            if (achievement.unlocked) return;
            
            let unlocked = false;
            
            switch (achievement.requirement.type) {
                case 'sessions':
                    const focusSessions = this.sessions.filter(s => s.mode === 'focus');
                    unlocked = focusSessions.length >= achievement.requirement.count;
                    break;
                    
                case 'streak':
                    const streak = this.calculateStreak();
                    unlocked = streak >= achievement.requirement.count;
                    break;
                    
                case 'earlySession':
                    // Check if any session was completed before 8 AM
                    const earlySession = this.sessions.find(session => {
                        const sessionHour = new Date(session.date).getHours();
                        return sessionHour < 8;
                    });
                    unlocked = !!earlySession;
                    break;
            }
            
            if (unlocked) {
                achievement.unlocked = true;
                newAchievements = true;
                
                // Show achievement notification
                this.showAchievementNotification(achievement);
            }
        });
        
        if (newAchievements) {
            this.saveAchievements();
            this.renderAchievements();
        }
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-notification-content">
                <div class="achievement-notification-icon">
                    <i class="fas fa-${achievement.icon}"></i>
                </div>
                <div class="achievement-notification-text">
                    <div class="achievement-notification-title">Achievement Unlocked!</div>
                    <div class="achievement-notification-desc">${achievement.title}</div>
                </div>
            </div>
        `;
        
        // Add styles if not already added
        if (!document.querySelector('#achievement-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'achievement-notification-styles';
            styles.textContent = `
                .achievement-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #4361ee, #7209b7);
                    color: white;
                    border-radius: var(--radius-md);
                    padding: var(--spacing-md) var(--spacing-lg);
                    box-shadow: var(--shadow-lg);
                    z-index: 9999;
                    animation: slideInRight 0.3s ease, slideOutRight 0.3s ease 3s forwards;
                }
                .achievement-notification-content {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-md);
                }
                .achievement-notification-icon {
                    font-size: 1.5rem;
                    color: gold;
                }
                .achievement-notification-text {
                    flex: 1;
                }
                .achievement-notification-title {
                    font-weight: 600;
                    font-size: 0.875rem;
                }
                .achievement-notification-desc {
                    font-size: 0.75rem;
                    opacity: 0.9;
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Auto-remove after animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3500);
    }

    // Utility Methods
    playSound(type) {
        if (!this.settings.soundEnabled) return;
        
        let sound;
        switch (type) {
            case 'start':
                sound = this.startSound;
                break;
            case 'end':
                sound = this.endSound;
                break;
            case 'tick':
                sound = this.tickSound;
                break;
            default:
                return;
        }
        
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Audio play failed:', e));
    }

    showNotification(title, body) {
        if (!this.settings.notificationsEnabled || !('Notification' in window)) return;
        
        if (Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/favicon.ico' });
        }
    }

    openModal() {
        // Generic modal open (can be expanded for different modals)
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
        
        // Reset goal form
        const saveBtn = document.getElementById('save-goal');
        saveBtn.textContent = 'Save Goal';
        saveBtn.onclick = () => this.saveGoal();
        
        document.getElementById('goal-title').value = '';
        document.getElementById('goal-sessions').value = '4';
        document.getElementById('goal-deadline').value = '';
    }

    saveState() {
        // Save current timer state
        const timerState = {
            timeLeft: this.timeLeft,
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            currentMode: this.currentMode,
            sessionCount: this.sessionCount,
            currentTask: this.currentTask
        };
        
        localStorage.setItem('pomodoroTimerState', JSON.stringify(timerState));
    }

    loadState() {
        const savedState = localStorage.getItem('pomodoroTimerState');
        if (savedState) {
            const state = JSON.parse(savedState);
            
            this.timeLeft = state.timeLeft || this.timeLeft;
            this.isRunning = state.isRunning || false;
            this.isPaused = state.isPaused || false;
            this.currentMode = state.currentMode || 'focus';
            this.sessionCount = state.sessionCount || 0;
            this.currentTask = state.currentTask || null;
            
            if (this.isRunning && !this.isPaused) {
                this.startTimer();
            } else if (this.isPaused) {
                this.pauseTimer();
            }
        }
    }

    loadSessions() {
        const savedSessions = localStorage.getItem('pomodoroSessions');
        return savedSessions ? JSON.parse(savedSessions) : [];
    }

    saveSessions() {
        localStorage.setItem('pomodoroSessions', JSON.stringify(this.sessions));
    }

    // Initialize the application
    static init() {
        // Configure toastr
        toastr.options = {
            closeButton: true,
            debug: false,
            newestOnTop: true,
            progressBar: true,
            positionClass: 'toast-top-right',
            preventDuplicates: false,
            onclick: null,
            showDuration: 300,
            hideDuration: 1000,
            timeOut: 3000,
            extendedTimeOut: 1000,
            showEasing: 'swing',
            hideEasing: 'linear',
            showMethod: 'fadeIn',
            hideMethod: 'fadeOut'
        };
        
        // Create and return the PomodoroTimer instance
        return new PomodoroTimer();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pomodoroTimer = PomodoroTimer.init();
    
    // Add some sample data for demo purposes
    setTimeout(() => {
        if (window.pomodoroTimer.sessions.length === 0) {
            toastr.info('Welcome to Pomodoro Timer! Add a task and start your first focus session.');
        }
    }, 1000);
});