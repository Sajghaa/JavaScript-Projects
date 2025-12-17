document.addEventListener('DOMContentLoaded', function() {
 
    initHabitTracker();

    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    updateTime();
    setInterval(updateTime, 1000);
});

const state = {
    habits: JSON.parse(localStorage.getItem('ascendHabits')) || [],
    completions: JSON.parse(localStorage.getItem('ascendCompletions')) || {},
    settings: JSON.parse(localStorage.getItem('ascendSettings')) || {
        userName: 'Striver',
        theme: 'dark',
        notifications: true
    },
    achievements: JSON.parse(localStorage.getItem('ascendAchievements')) || {},
    currentView: 'dashboard',
    selectedHabit: null,
    selectedColor: '#7c3aed'
};

// Achievement definitions
const ACHIEVEMENTS = [
    {
        id: 'first_habit',
        title: 'First Step',
        description: 'Create your first habit',
        icon: 'fas fa-seedling',
        requirement: { type: 'habit_count', value: 1 },
        points: 10
    },
    {
        id: 'streak_7',
        title: 'Weekly Warrior',
        description: 'Maintain a 7-day streak',
        icon: 'fas fa-fire',
        requirement: { type: 'streak', value: 7 },
        points: 25
    },
    {
        id: 'streak_30',
        title: 'Monthly Master',
        description: 'Maintain a 30-day streak',
        icon: 'fas fa-fire',
        requirement: { type: 'streak', value: 30 },
        points: 50
    },
    {
        id: 'perfect_week',
        title: 'Perfect Week',
        description: 'Complete all habits for 7 days straight',
        icon: 'fas fa-star',
        requirement: { type: 'perfect_days', value: 7 },
        points: 30
    },
    {
        id: 'habit_master',
        title: 'Habit Master',
        description: 'Create 10 different habits',
        icon: 'fas fa-crown',
        requirement: { type: 'habit_count', value: 10 },
        points: 40
    },
    {
        id: 'early_bird',
        title: 'Early Bird',
        description: 'Complete morning habits for 7 days',
        icon: 'fas fa-sun',
        requirement: { type: 'morning_completions', value: 7 },
        points: 20
    },
    {
        id: 'consistency',
        title: 'Consistency King',
        description: '80% success rate for 30 days',
        icon: 'fas fa-chart-line',
        requirement: { type: 'success_rate', value: 80 },
        points: 35
    },
    {
        id: 'variety',
        title: 'Well-Rounded',
        description: 'Have habits in 5 different categories',
        icon: 'fas fa-layer-group',
        requirement: { type: 'category_count', value: 5 },
        points: 25
    }
];

// Category colors
const CATEGORY_COLORS = {
    health: '#10b981',
    productivity: '#3b82f6',
    learning: '#8b5cf6',
    mindfulness: '#06b6d4',
    finance: '#f59e0b',
    social: '#ec4899',
    other: '#64748b'
};

// Motivation tips
const MOTIVATION_TIPS = [
    "Consistency is more important than perfection. Even small daily progress leads to significant results over time.",
    "Your habits today determine your success tomorrow. Make each day count!",
    "The only bad workout is the one that didn't happen. The same goes for habits!",
    "Small habits, when repeated consistently, lead to extraordinary results.",
    "Don't let perfect be the enemy of good. Showing up is 80% of the battle.",
    "Motivation gets you started, habit keeps you going. Build systems, not just goals.",
    "Every time you complete a habit, you're strengthening your identity as someone who follows through.",
    "The chains of habit are too light to be felt until they're too heavy to be broken. Choose good ones!",
    "You don't have to be great to start, but you have to start to be great.",
    "Your future self will thank you for the habits you build today."
];

// Initialize the application
function initHabitTracker() {
    // Set theme
    document.documentElement.setAttribute('data-theme', state.settings.theme);
    updateThemeButton();
    
    // Set user name
    document.getElementById('user-name').textContent = state.settings.userName;
    
    // Load initial data
    loadTodayHabits();
    loadAllHabits();
    updateStats();
    loadStreakCalendar();
    loadUpcomingHabits();
    loadAchievements();
    updateMotivationMeter();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize charts
    initCharts();
}

// Set up event listeners
function setupEventListeners() {
    // Navigation buttons
    document.querySelectorAll('.nav-btn, .mobile-nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.dataset.view) {
                switchView(this.dataset.view);
            }
        });
    });
    
    // Mobile add habit button
    document.getElementById('mobile-add-habit').addEventListener('click', function() {
        switchView('habits');
        document.querySelector('.add-habit-card').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Add habit form
    document.getElementById('add-habit-form').addEventListener('submit', saveHabit);
    document.getElementById('clear-form').addEventListener('click', clearHabitForm);
    document.getElementById('create-first-habit').addEventListener('click', function() {
        document.querySelector('.add-habit-card').scrollIntoView({ behavior: 'smooth' });
    });
    
    document.querySelectorAll('input[name="frequency"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const customFrequency = document.getElementById('custom-frequency');
            if (this.value === 'custom') {
                customFrequency.style.display = 'block';
            } else {
                customFrequency.style.display = 'none';
            }
        });
    });
    
    // Color palette
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            state.selectedColor = this.dataset.color;
        });
    });
    
    // Mark all today button
    document.getElementById('mark-all-today').addEventListener('click', markAllTodayHabits);
    
    // New tip button
    document.getElementById('new-tip').addEventListener('click', getNewTip);
    
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Export data
    document.getElementById('export-data').addEventListener('click', exportData);
    
    // Reset data
    document.getElementById('reset-data').addEventListener('click', resetAllData);
    
    // Search habits
    document.getElementById('search-habits').addEventListener('input', searchHabits);
    
    // Filter habits
    document.getElementById('habits-filter').addEventListener('change', filterHabits);
    
    // Analytics period change
    document.getElementById('analytics-period').addEventListener('change', updateAnalytics);
    
    // Chart controls
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
           
        });
    });
    
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateStreakDisplay(this.dataset.period);
        });
    });
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    // Close modal when clicking outside
    document.getElementById('habit-details-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    const dayString = now.toLocaleDateString('en-US', { weekday: 'long' });
    const dateString = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    document.getElementById('current-day').textContent = dayString;
    document.getElementById('current-date').textContent = dateString;
}

function switchView(view) {
    document.querySelectorAll('.nav-btn, .mobile-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === view) {
            btn.classList.add('active');
        }
    });
    
    document.querySelectorAll('.content-view').forEach(viewEl => {
        viewEl.classList.remove('active');
    });
    
    document.getElementById(`${view}-view`).classList.add('active');
    state.currentView = view;
    
    if (view === 'dashboard') {
        updateDashboard();
    } else if (view === 'analytics') {
        updateAnalytics();
    }
}

function updateDashboard() {
    loadTodayHabits();
    updateStats();
    loadStreakCalendar();
    loadUpcomingHabits();
    updateMotivationMeter();
}

function saveHabit(e) {
    e.preventDefault();
    
    const name = document.getElementById('habit-name').value.trim();
    const category = document.getElementById('habit-category').value;
    const frequency = document.querySelector('input[name="frequency"]:checked').value;
    const time = document.getElementById('habit-time').value;
    const notes = document.getElementById('habit-notes').value.trim();
    
    if (!name) {
        showToast('Please enter a habit name', 'error');
        return;
    }
    
    let customDays = [];
    if (frequency === 'custom') {
        customDays = Array.from(document.querySelectorAll('input[name="custom-days"]:checked'))
            .map(input => parseInt(input.value));
        if (customDays.length === 0) {
            showToast('Please select at least one day for custom frequency', 'error');
            return;
        }
    }
    
    const habit = {
        id: Date.now().toString(),
        name,
        category,
        frequency,
        customDays,
        time,
        notes,
        color: state.selectedColor,
        createdAt: new Date().toISOString(),
        isActive: true,
        streak: 0,
        bestStreak: 0,
        totalCompletions: 0,
        totalAttempts: 0
    };
    
    state.habits.push(habit);
    
    saveHabits();
    
    loadTodayHabits();
    loadAllHabits();
    updateStats();
    loadUpcomingHabits();
    loadAchievements();
    
    // Clear form and show success
    clearHabitForm();
    showToast('Habit created successfully!');
    
    // Check for achievements
    checkAchievements();
}

function clearHabitForm() {
    document.getElementById('add-habit-form').reset();
    document.getElementById('custom-frequency').style.display = 'none';
    document.querySelector('input[name="frequency"][value="daily"]').checked = true;
    document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
    document.querySelector('.color-option').classList.add('selected');
    state.selectedColor = '#7c3aed';
}

function loadTodayHabits() {
    const todayList = document.getElementById('today-habits-list');
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const todayHabits = state.habits.filter(habit => {
        if (!habit.isActive) return false;
        
        if (habit.frequency === 'daily') {
            return true;
        } else if (habit.frequency === 'weekly') {
            return dayOfWeek === 0 || dayOfWeek === 6; // Example: only weekends
        } else if (habit.frequency === 'custom') {
            return habit.customDays.includes(dayOfWeek);
        }
        return false;
    });
    
    const completedToday = getCompletedToday();
    const todayProgress = `${completedToday.length}/${todayHabits.length}`;
    document.getElementById('today-progress').textContent = todayProgress;
    
    if (todayHabits.length === 0) {
        todayList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h4>No habits scheduled for today</h4>
                <p>Add habits to start tracking your progress</p>
            </div>
        `;
        return;
    }
    
    todayList.innerHTML = '';
    
    todayHabits.forEach(habit => {
        const isCompleted = completedToday.includes(habit.id);
        
        const habitItem = document.createElement('div');
        habitItem.className = 'habit-item';
        habitItem.style.borderLeftColor = habit.color;
        habitItem.dataset.habitId = habit.id;
        
        habitItem.innerHTML = `
            <div class="habit-checkbox ${isCompleted ? 'checked' : ''}" data-habit-id="${habit.id}">
                ${isCompleted ? '✓' : ''}
            </div>
            <div class="habit-content">
                <div class="habit-name">${habit.name}</div>
                <div class="habit-meta">
                    <span class="habit-category" style="background-color: ${CATEGORY_COLORS[habit.category] || '#64748b'}">
                        ${habit.category.charAt(0).toUpperCase() + habit.category.slice(1)}
                    </span>
                    <span class="habit-time">
                        <i class="fas fa-clock"></i>
                        ${getTimeLabel(habit.time)}
                    </span>
                </div>
            </div>
        `;
        
        // Add click event to checkbox
        const checkbox = habitItem.querySelector('.habit-checkbox');
        checkbox.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleHabitCompletion(habit.id);
        });
        
        // Add click event to view details
        habitItem.addEventListener('click', function() {
            showHabitDetails(habit.id);
        });
        
        todayList.appendChild(habitItem);
    });
}

// Toggle habit completion
function toggleHabitCompletion(habitId) {
    const today = new Date().toDateString();
    const habit = state.habits.find(h => h.id === habitId);
    
    if (!habit) return;
    
    // Initialize completions for today if not exists
    if (!state.completions[today]) {
        state.completions[today] = {};
    }
    
    // Toggle completion
    if (state.completions[today][habitId]) {
        // Mark as incomplete
        delete state.completions[today][habitId];
        habit.totalCompletions--;
        habit.streak = calculateCurrentStreak(habit.id);
    } else {
        // Mark as complete
        state.completions[today][habitId] = {
            timestamp: new Date().toISOString(),
            time: new Date().getHours()
        };
        habit.totalCompletions++;
        habit.totalAttempts++;
        
        // Update streak
        const newStreak = calculateCurrentStreak(habit.id);
        habit.streak = newStreak;
        if (newStreak > habit.bestStreak) {
            habit.bestStreak = newStreak;
        }
    }
    
    // Save changes
    saveHabits();
    saveCompletions();
    
    // Update UI
    loadTodayHabits();
    updateStats();
    loadStreakCalendar();
    loadAllHabits();
    
    // Show toast
    const isNowCompleted = state.completions[today][habitId];
    showToast(isNowCompleted ? 'Habit completed! Great job!' : 'Habit marked as incomplete');
    
    // Check for achievements
    checkAchievements();
}

// Mark all today's habits as complete
function markAllTodayHabits() {
    const today = new Date().toDateString();
    const todayHabits = getTodayHabits();
    
    // Initialize completions for today if not exists
    if (!state.completions[today]) {
        state.completions[today] = {};
    }
    
    let markedCount = 0;
    
    todayHabits.forEach(habit => {
        if (!state.completions[today][habit.id]) {
            state.completions[today][habit.id] = {
                timestamp: new Date().toISOString(),
                time: new Date().getHours()
            };
            habit.totalCompletions++;
            habit.totalAttempts++;
            
            // Update streak
            const newStreak = calculateCurrentStreak(habit.id);
            habit.streak = newStreak;
            if (newStreak > habit.bestStreak) {
                habit.bestStreak = newStreak;
            }
            
            markedCount++;
        }
    });
    
    if (markedCount === 0) {
        showToast('All habits are already completed for today!', 'warning');
        return;
    }
    
    // Save changes
    saveHabits();
    saveCompletions();
    
    // Update UI
    loadTodayHabits();
    updateStats();
    loadStreakCalendar();
    
    showToast(`Marked ${markedCount} habits as complete!`);
    
    // Check for achievements
    checkAchievements();
}

// Get today's habits
function getTodayHabits() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    return state.habits.filter(habit => {
        if (!habit.isActive) return false;
        
        if (habit.frequency === 'daily') {
            return true;
        } else if (habit.frequency === 'weekly') {
            return dayOfWeek === 0 || dayOfWeek === 6; // Example: only weekends
        } else if (habit.frequency === 'custom') {
            return habit.customDays.includes(dayOfWeek);
        }
        return false;
    });
}

// Get completed habits for today
function getCompletedToday() {
    const today = new Date().toDateString();
    if (!state.completions[today]) return [];
    return Object.keys(state.completions[today]);
}

// Calculate current streak for a habit
function calculateCurrentStreak(habitId) {
    let streak = 0;
    const today = new Date();
    
    // Check consecutive days backwards from today
    for (let i = 0; i < 365; i++) { // Check up to a year
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toDateString();
        
        if (state.completions[dateString] && state.completions[dateString][habitId]) {
            streak++;
        } else {
            // If we're checking today and it's not completed, continue checking yesterday
            if (i === 0) {
                continue;
            } else {
                break;
            }
        }
    }
    
    return streak;
}

// Load all habits
function loadAllHabits() {
    const allHabitsList = document.getElementById('all-habits-list');
    const habitsCount = document.getElementById('habits-count');
    const searchTerm = document.getElementById('search-habits').value.toLowerCase();
    const filter = document.getElementById('habits-filter').value;
    
    // Filter habits
    let filteredHabits = state.habits;
    
    if (searchTerm) {
        filteredHabits = filteredHabits.filter(habit => 
            habit.name.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filter === 'active') {
        filteredHabits = filteredHabits.filter(habit => habit.isActive);
    } else if (filter === 'archived') {
        filteredHabits = filteredHabits.filter(habit => !habit.isActive);
    } else if (filter !== 'all') {
        filteredHabits = filteredHabits.filter(habit => habit.category === filter);
    }
    
    // Update count
    habitsCount.textContent = filteredHabits.length;
    
    if (filteredHabits.length === 0) {
        allHabitsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-seedling"></i>
                <h4>No habits found</h4>
                <p>${searchTerm ? 'Try a different search term' : 'Create your first habit to start tracking'}</p>
                ${!searchTerm ? `
                    <button class="btn btn-primary" id="create-first-habit">
                        <i class="fas fa-plus"></i>
                        Create First Habit
                    </button>
                ` : ''}
            </div>
        `;
        
        // Re-add event listener for create button
        const createBtn = document.getElementById('create-first-habit');
        if (createBtn) {
            createBtn.addEventListener('click', function() {
                document.querySelector('.add-habit-card').scrollIntoView({ behavior: 'smooth' });
            });
        }
        
        return;
    }
    
    allHabitsList.innerHTML = '';
    
    filteredHabits.forEach(habit => {
        const successRate = habit.totalAttempts > 0 ? 
            Math.round((habit.totalCompletions / habit.totalAttempts) * 100) : 0;
        
        const habitCard = document.createElement('div');
        habitCard.className = 'habit-card';
        habitCard.style.borderLeftColor = habit.color;
        habitCard.dataset.habitId = habit.id;
        
        habitCard.innerHTML = `
            <div class="habit-color" style="background-color: ${habit.color}"></div>
            <div class="habit-info">
                <div class="habit-header">
                    <div class="habit-title">${habit.name}</div>
                    <div class="habit-category-badge" style="background-color: ${CATEGORY_COLORS[habit.category] || '#64748b'}">
                        ${habit.category.charAt(0).toUpperCase() + habit.category.slice(1)}
                    </div>
                </div>
                <div class="habit-details">
                    <div class="habit-streak">
                        <i class="fas fa-fire"></i>
                        ${habit.streak} day streak
                    </div>
                    <div class="habit-frequency">
                        <i class="fas fa-calendar-alt"></i>
                        ${getFrequencyLabel(habit)}
                    </div>
                    <div class="habit-success">
                        <i class="fas fa-percentage"></i>
                        ${successRate}% success
                    </div>
                </div>
            </div>
            <div class="habit-actions">
                <button class="habit-action-btn toggle-active" data-habit-id="${habit.id}" title="${habit.isActive ? 'Archive' : 'Activate'}">
                    <i class="fas ${habit.isActive ? 'fa-archive' : 'fa-play'}"></i>
                </button>
                <button class="habit-action-btn edit-habit" data-habit-id="${habit.id}" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="habit-action-btn delete-habit" data-habit-id="${habit.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        habitCard.addEventListener('click', function(e) {
            if (!e.target.closest('.habit-actions')) {
                showHabitDetails(habit.id);
            }
        });
        
        // Toggle active button
        const toggleBtn = habitCard.querySelector('.toggle-active');
        toggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleHabitActive(habit.id);
        });
        
        // Edit button
        const editBtn = habitCard.querySelector('.edit-habit');
        editBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            editHabit(habit.id);
        });
        
        // Delete button
        const deleteBtn = habitCard.querySelector('.delete-habit');
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            deleteHabit(habit.id);
        });
        
        allHabitsList.appendChild(habitCard);
    });
}

// Toggle habit active status
function toggleHabitActive(habitId) {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;
    
    habit.isActive = !habit.isActive;
    saveHabits();
    
    // Update UI
    loadTodayHabits();
    loadAllHabits();
    updateStats();
    
    showToast(`Habit ${habit.isActive ? 'activated' : 'archived'} successfully!`);
}

// Edit a habit
function editHabit(habitId) {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;
    
    // Populate form with habit data
    document.getElementById('habit-name').value = habit.name;
    document.getElementById('habit-category').value = habit.category;
    document.querySelector(`input[name="frequency"][value="${habit.frequency}"]`).checked = true;
    document.getElementById('habit-time').value = habit.time;
    document.getElementById('habit-notes').value = habit.notes || '';
    
    // Set custom days if applicable
    if (habit.frequency === 'custom') {
        document.getElementById('custom-frequency').style.display = 'block';
        habit.customDays.forEach(day => {
            const checkbox = document.querySelector(`input[name="custom-days"][value="${day}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // Set color
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.dataset.color === habit.color) {
            opt.classList.add('selected');
        }
    });
    state.selectedColor = habit.color;
    
    // Remove the habit
    deleteHabit(habitId, false);
    
    // Scroll to form
    document.querySelector('.add-habit-card').scrollIntoView({ behavior: 'smooth' });
    showToast('Edit your habit below');
}

// Delete a habit
function deleteHabit(habitId, showConfirmation = true) {
    if (showConfirmation && !confirm('Are you sure you want to delete this habit?')) {
        return;
    }
    
    // Remove from state
    state.habits = state.habits.filter(habit => habit.id !== habitId);
    
    // Save and update UI
    saveHabits();
    loadTodayHabits();
    loadAllHabits();
    updateStats();
    loadAchievements();
    
    if (showConfirmation) {
        showToast('Habit deleted successfully!');
    }
}

// Show habit details in modal
function showHabitDetails(habitId) {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;
    
    state.selectedHabit = habit;
    
    // Populate modal with habit details
    document.getElementById('modal-habit-name').textContent = habit.name;
    document.getElementById('modal-habit-category').textContent = 
        habit.category.charAt(0).toUpperCase() + habit.category.slice(1);
    document.getElementById('modal-habit-frequency').textContent = getFrequencyLabel(habit);
    document.getElementById('modal-habit-streak').textContent = `${habit.streak} days`;
    
    const successRate = habit.totalAttempts > 0 ? 
        Math.round((habit.totalCompletions / habit.totalAttempts) * 100) : 0;
    document.getElementById('modal-habit-success').textContent = `${successRate}%`;
    document.getElementById('modal-habit-notes').textContent = habit.notes || 'No notes added.';
    
    // Load activity log
    loadActivityLog(habitId);
    
    // Set up action buttons
    const archiveBtn = document.getElementById('archive-habit-btn');
    archiveBtn.textContent = habit.isActive ? 'Archive' : 'Activate';
    archiveBtn.onclick = () => {
        toggleHabitActive(habitId);
        closeModal();
    };
    
    const editBtn = document.getElementById('edit-habit-btn');
    editBtn.onclick = () => {
        editHabit(habitId);
        closeModal();
    };
    
    // Show modal
    document.getElementById('habit-details-modal').classList.add('active');
}

// Load activity log for a habit
function loadActivityLog(habitId) {
    const activityLog = document.getElementById('modal-activity-log');
    activityLog.innerHTML = '';
    
    // Get last 7 days of activity
    const today = new Date();
    const activities = [];
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toDateString();
        const displayDate = date.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        
        const isCompleted = state.completions[dateString] && 
                           state.completions[dateString][habitId];
        
        activities.push({
            date: displayDate,
            completed: isCompleted
        });
    }
    
    if (activities.length === 0) {
        activityLog.innerHTML = '<div class="empty-state">No activity yet</div>';
        return;
    }
    
    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        activityItem.innerHTML = `
            <span class="activity-date">${activity.date}</span>
            <span class="activity-status">${activity.completed ? '✓ Completed' : '○ Missed'}</span>
        `;
        
        activityLog.appendChild(activityItem);
    });
}

// Update statistics
function updateStats() {
    const todayHabits = getTodayHabits();
    const completedToday = getCompletedToday();
    
    // Today's completion percentage
    const todayCompletion = todayHabits.length > 0 ? 
        Math.round((completedToday.length / todayHabits.length) * 100) : 0;
    document.getElementById('today-completion').textContent = `${todayCompletion}%`;
    
    // Week completion
    const weekCompletion = calculateWeekCompletion();
    document.getElementById('week-completion').textContent = `${weekCompletion}%`;
    
    // Active habits count
    const activeHabits = state.habits.filter(h => h.isActive).length;
    document.getElementById('active-habits').textContent = activeHabits;
    
    // Current streak (longest streak among active habits)
    const longestStreak = state.habits.reduce((max, habit) => 
        Math.max(max, habit.streak), 0);
    document.getElementById('current-streak-count').textContent = longestStreak;
    document.getElementById('current-streak').textContent = `${longestStreak} days`;
    document.getElementById('longest-streak').textContent = `${longestStreak} days`;
    
    // Success rate (overall)
    const totalCompletions = state.habits.reduce((sum, habit) => sum + habit.totalCompletions, 0);
    const totalAttempts = state.habits.reduce((sum, habit) => sum + habit.totalAttempts, 0);
    const overallSuccessRate = totalAttempts > 0 ? 
        Math.round((totalCompletions / totalAttempts) * 100) : 0;
    document.getElementById('success-rate').textContent = `${overallSuccessRate}%`;
    
    // Other stats
    document.getElementById('total-completions').textContent = totalCompletions;
    document.getElementById('avg-completion').textContent = `${overallSuccessRate}%`;
    
    // Calculate best day (simplified - would need more data in real app)
    const bestDay = calculateBestDay();
    document.getElementById('best-day').textContent = bestDay;
    
    // Calculate perfect days
    const perfectDays = calculatePerfectDays();
    document.getElementById('perfect-days').textContent = perfectDays;
    
    // Update storage info
    document.getElementById('storage-usage').textContent = `${state.habits.length} habits tracked`;
}

// Calculate week completion
function calculateWeekCompletion() {
    const today = new Date();
    let totalHabits = 0;
    let completedHabits = 0;
    
    // Look back 7 days
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toDateString();
        
        // For simplicity, we'll approximate week completion
        // In a real app, you'd track each day's habits
        if (state.completions[dateString]) {
            completedHabits += Object.keys(state.completions[dateString]).length;
        }
        
        totalHabits += state.habits.filter(h => h.isActive).length;
    }
    
    return totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
}

// Calculate best day (simplified)
function calculateBestDay() {
    // This is a simplified version
    // In a real app, you'd analyze completion data by day of week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    return days[today.getDay()];
}

// Calculate perfect days
function calculatePerfectDays() {
    let perfectDays = 0;
    
    // Check last 30 days
    const today = new Date();
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toDateString();
        
        // Count habits for that day (simplified)
        const dayHabits = getHabitsForDate(date);
        const completions = state.completions[dateString] ? 
            Object.keys(state.completions[dateString]).length : 0;
        
        if (dayHabits.length > 0 && completions === dayHabits.length) {
            perfectDays++;
        }
    }
    
    return perfectDays;
}

// Get habits for a specific date
function getHabitsForDate(date) {
    const dayOfWeek = date.getDay();
    
    return state.habits.filter(habit => {
        if (!habit.isActive) return false;
        
        if (habit.frequency === 'daily') {
            return true;
        } else if (habit.frequency === 'weekly') {
            return dayOfWeek === 0 || dayOfWeek === 6; // Example: only weekends
        } else if (habit.frequency === 'custom') {
            return habit.customDays.includes(dayOfWeek);
        }
        return false;
    });
}

// Load streak calendar
function loadStreakCalendar() {
    const streakCalendar = document.getElementById('streak-calendar');
    streakCalendar.innerHTML = '';
    
    const today = new Date();
    
    // Create 7x6 grid (6 weeks)
    for (let i = 0; i < 42; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (41 - i));
        
        const dayElement = document.createElement('div');
        dayElement.className = 'streak-day';
        
        // Check if this date has any completions
        const dateString = date.toDateString();
        const completions = state.completions[dateString] ? 
            Object.keys(state.completions[dateString]).length : 0;
        
        // Set color based on completions
        if (completions > 0) {
            const intensity = Math.min(completions, 5) / 5; // Normalize to 0-1
            const colorValue = Math.floor(100 + (155 * intensity)); // Dark to light green
            dayElement.style.backgroundColor = `rgb(16, 185, 129, ${0.3 + (intensity * 0.7)})`;
            dayElement.dataset.date = date.toLocaleDateString('en-US', { 
                month: 'short',
                day: 'numeric'
            });
            dayElement.dataset.value = completions;
        } else {
            dayElement.classList.add('empty');
        }
        
        // Add date label for first day of month
        if (date.getDate() === 1) {
            const monthLabel = document.createElement('div');
            monthLabel.className = 'month-label';
            monthLabel.textContent = date.toLocaleDateString('en-US', { month: 'short' });
            monthLabel.style.gridColumn = 'span 7';
            monthLabel.style.textAlign = 'center';
            monthLabel.style.color = 'var(--text-secondary)';
            monthLabel.style.fontSize = '0.8rem';
            monthLabel.style.marginTop = '0.5rem';
            // This would need more complex logic to position correctly
        }
        
        streakCalendar.appendChild(dayElement);
    }
}

// Load upcoming habits
function loadUpcomingHabits() {
    const upcomingList = document.getElementById('upcoming-habits-list');
    const filter = document.getElementById('upcoming-filter').value;
    
    const today = new Date();
    let daysToShow = 1;
    
    if (filter === 'week') daysToShow = 7;
    if (filter === 'month') daysToShow = 30;
    
    const upcomingHabits = [];
    
    // Check next days
    for (let i = 1; i <= daysToShow; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dayOfWeek = date.getDay();
        
        const dayHabits = state.habits.filter(habit => {
            if (!habit.isActive) return false;
            
            if (habit.frequency === 'daily') {
                return true;
            } else if (habit.frequency === 'weekly') {
                return dayOfWeek === 0 || dayOfWeek === 6; // Example: only weekends
            } else if (habit.frequency === 'custom') {
                return habit.customDays.includes(dayOfWeek);
            }
            return false;
        });
        
        if (dayHabits.length > 0) {
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            dayHabits.forEach(habit => {
                upcomingHabits.push({
                    date: { day: dayName, monthDay },
                    habit: habit
                });
            });
        }
    }
    
    if (upcomingHabits.length === 0) {
        upcomingList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar"></i>
                <h4>No upcoming habits</h4>
                <p>Add more habits to see upcoming schedule</p>
            </div>
        `;
        return;
    }
    
    // Sort by date and show only first 5
    upcomingHabits.sort((a, b) => new Date(a.date.monthDay) - new Date(b.date.monthDay));
    const displayHabits = upcomingHabits.slice(0, 5);
    
    upcomingList.innerHTML = '';
    
    displayHabits.forEach(item => {
        const upcomingItem = document.createElement('div');
        upcomingItem.className = 'upcoming-item';
        
        upcomingItem.innerHTML = `
            <div class="upcoming-date">
                <div class="upcoming-day">${item.date.day}</div>
                <div class="upcoming-month">${item.date.monthDay}</div>
            </div>
            <div class="upcoming-content">
                <div class="upcoming-habit-name">${item.habit.name}</div>
                <div class="upcoming-category">${item.habit.category.charAt(0).toUpperCase() + item.habit.category.slice(1)}</div>
            </div>
        `;
        
        upcomingList.appendChild(upcomingItem);
    });
}

// Update motivation meter
function updateMotivationMeter() {
    // Calculate motivation based on recent performance
    const weekCompletion = calculateWeekCompletion();
    const motivationLevel = Math.min(weekCompletion, 100);
    
    const meterFill = document.getElementById('motivation-meter');
    meterFill.style.width = `${motivationLevel}%`;
    
    // Update motivation text based on level
    const motivationText = document.getElementById('motivation-text');
    if (motivationLevel >= 80) {
        motivationText.textContent = "You're on fire! Your consistency is inspiring.";
    } else if (motivationLevel >= 60) {
        motivationText.textContent = "Great progress! You're building strong habits.";
    } else if (motivationLevel >= 40) {
        motivationText.textContent = "Keep going! Every small step counts toward big changes.";
    } else {
        motivationText.textContent = "Start small, stay consistent. You've got this!";
    }
}

// Get a new motivation tip
function getNewTip() {
    const randomIndex = Math.floor(Math.random() * MOTIVATION_TIPS.length);
    document.getElementById('daily-tip').textContent = MOTIVATION_TIPS[randomIndex];
    showToast('New tip loaded!');
}

// Update streak display based on period
function updateStreakDisplay(period) {
    // This would update the streak display based on the selected period
    // For now, we'll just update the text
    const streakValue = document.getElementById('current-streak');
    const currentStreak = parseInt(streakValue.textContent);
    
    if (period === 'week') {
        // Show weekly streak
        streakValue.textContent = `${Math.min(currentStreak, 7)} days`;
    } else if (period === 'month') {
        // Show monthly streak
        streakValue.textContent = `${Math.min(currentStreak, 30)} days`;
    } else {
        // Show all time
        streakValue.textContent = `${currentStreak} days`;
    }
}

// Search habits
function searchHabits() {
    loadAllHabits();
}

// Filter habits
function filterHabits() {
    loadAllHabits();
}

// Update analytics
function updateAnalytics() {
    const period = document.getElementById('analytics-period').value;
    
    // Update analytics metrics based on period
    // This is a simplified version
    document.getElementById('analytics-streak').textContent = 
        document.getElementById('current-streak-count').textContent;
    
    // Calculate success rate for the period
    let successRate = 0;
    if (period === 'week') {
        successRate = calculateWeekCompletion();
    } else {
        // For other periods, use overall success rate
        const totalCompletions = state.habits.reduce((sum, habit) => sum + habit.totalCompletions, 0);
        const totalAttempts = state.habits.reduce((sum, habit) => sum + habit.totalAttempts, 0);
        successRate = totalAttempts > 0 ? Math.round((totalCompletions / totalAttempts) * 100) : 0;
    }
    
    document.getElementById('analytics-success').textContent = `${successRate}%`;
    document.getElementById('analytics-perfect').textContent = 
        document.getElementById('perfect-days').textContent;
    
    // Best streak
    const bestStreak = state.habits.reduce((max, habit) => 
        Math.max(max, habit.bestStreak), 0);
    document.getElementById('analytics-best').textContent = bestStreak;
    
    // Update charts
    updateCharts(period);
}

// Initialize charts
function initCharts() {
    // Initialize Chart.js charts
    const completionCtx = document.getElementById('completion-chart').getContext('2d');
    const categoryCtx = document.getElementById('category-chart').getContext('2d');
    
    // Completion chart (line chart)
    window.completionChart = new Chart(completionCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Completion Rate',
                data: [65, 75, 70, 80, 85, 90, 95],
                borderColor: '#7c3aed',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
    
    // Category chart (doughnut chart)
    window.categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: ['Health', 'Productivity', 'Learning', 'Mindfulness', 'Finance', 'Social', 'Other'],
            datasets: [{
                data: [25, 20, 15, 15, 10, 10, 5],
                backgroundColor: [
                    '#10b981',
                    '#3b82f6',
                    '#8b5cf6',
                    '#06b6d4',
                    '#f59e0b',
                    '#ec4899',
                    '#64748b'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: 'var(--text-primary)'
                    }
                }
            }
        }
    });
}

// Update charts
function updateCharts(period) {
    // In a real app, you would update chart data based on the selected period
    // For this example, we'll just randomize the data
    if (window.completionChart) {
        const newData = Array.from({length: 7}, () => Math.floor(Math.random() * 30) + 70);
        window.completionChart.data.datasets[0].data = newData;
        window.completionChart.update();
    }
}

// Load achievements
function loadAchievements() {
    const achievementsGrid = document.querySelector('.achievements-grid');
    achievementsGrid.innerHTML = '';
    
    let earnedCount = 0;
    let totalPoints = 0;
    
    ACHIEVEMENTS.forEach(achievement => {
        const progress = calculateAchievementProgress(achievement);
        const isEarned = progress >= achievement.requirement.value;
        
        if (isEarned) {
            earnedCount++;
            totalPoints += achievement.points;
        }
        
        const achievementCard = document.createElement('div');
        achievementCard.className = `achievement-card ${isEarned ? '' : 'locked'}`;
        
        const progressPercent = Math.min((progress / achievement.requirement.value) * 100, 100);
        
        achievementCard.innerHTML = `
            <div class="achievement-icon">
                <i class="${achievement.icon}"></i>
            </div>
            <div class="achievement-content">
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
                <div class="achievement-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="progress-text">${progress}/${achievement.requirement.value}</div>
                </div>
            </div>
        `;
        
        achievementsGrid.appendChild(achievementCard);
    });
    
    // Update achievement summary
    document.getElementById('achievements-earned').textContent = earnedCount;
    document.getElementById('total-points').textContent = totalPoints;
    
    // Calculate level based on points
    let level = 'Beginner';
    if (totalPoints >= 200) level = 'Expert';
    else if (totalPoints >= 100) level = 'Advanced';
    else if (totalPoints >= 50) level = 'Intermediate';
    
    document.getElementById('achievement-level').textContent = level;
}

// Calculate achievement progress
function calculateAchievementProgress(achievement) {
    const req = achievement.requirement;
    
    switch (req.type) {
        case 'habit_count':
            return state.habits.length;
        
        case 'streak':
            return state.habits.reduce((max, habit) => Math.max(max, habit.streak), 0);
        
        case 'perfect_days':
            return calculatePerfectDays();
        
        case 'morning_completions':
            // Count morning completions (before 12 PM)
            let morningCompletions = 0;
            for (const date in state.completions) {
                for (const habitId in state.completions[date]) {
                    const completion = state.completions[date][habitId];
                    if (completion.time < 12) {
                        morningCompletions++;
                    }
                }
            }
            return morningCompletions;
        
        case 'success_rate':
            const totalCompletions = state.habits.reduce((sum, habit) => sum + habit.totalCompletions, 0);
            const totalAttempts = state.habits.reduce((sum, habit) => sum + habit.totalAttempts, 0);
            return totalAttempts > 0 ? Math.round((totalCompletions / totalAttempts) * 100) : 0;
        
        case 'category_count':
            const categories = new Set(state.habits.map(habit => habit.category));
            return categories.size;
        
        default:
            return 0;
    }
}

// Check for new achievements
function checkAchievements() {
    // This would check if any new achievements have been earned
    // For now, we'll just reload achievements
    loadAchievements();
}

// Theme toggle
function toggleTheme() {
    state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.settings.theme);
    localStorage.setItem('ascendSettings', JSON.stringify(state.settings));
    updateThemeButton();
}

// Update theme button
function updateThemeButton() {
    const themeBtn = document.getElementById('theme-toggle');
    const icon = themeBtn.querySelector('i');
    
    if (state.settings.theme === 'dark') {
        icon.className = 'fas fa-moon';
    } else {
        icon.className = 'fas fa-sun';
    }
}

// Export data
function exportData() {
    const data = {
        habits: state.habits,
        completions: state.completions,
        settings: state.settings,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `ascend-habits-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast('Data exported successfully!');
}

// Reset all data
function resetAllData() {
    if (confirm('Are you sure you want to reset ALL data? This action cannot be undone.')) {
        localStorage.removeItem('ascendHabits');
        localStorage.removeItem('ascendCompletions');
        localStorage.removeItem('ascendSettings');
        localStorage.removeItem('ascendAchievements');
        
        // Reload page
        location.reload();
    }
}

// Close modal
function closeModal() {
    document.getElementById('habit-details-modal').classList.remove('active');
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('i');
    
    // Set message and icon
    toastMessage.textContent = message;
    
    if (type === 'error') {
        toast.className = 'toast error show';
        toastIcon.className = 'fas fa-exclamation-circle';
    } else if (type === 'warning') {
        toast.className = 'toast warning show';
        toastIcon.className = 'fas fa-exclamation-triangle';
    } else {
        toast.className = 'toast show';
        toastIcon.className = 'fas fa-check-circle';
    }
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Helper functions
function getTimeLabel(time) {
    switch (time) {
        case 'morning': return 'Morning';
        case 'afternoon': return 'Afternoon';
        case 'evening': return 'Evening';
        case 'night': return 'Night';
        default: return 'Any Time';
    }
}

function getFrequencyLabel(habit) {
    switch (habit.frequency) {
        case 'daily': return 'Daily';
        case 'weekly': return 'Weekly';
        case 'custom': return `${habit.customDays.length} days/week`;
        default: return 'Custom';
    }
}

function saveHabits() {
    localStorage.setItem('ascendHabits', JSON.stringify(state.habits));
}

function saveCompletions() {
    localStorage.setItem('ascendCompletions', JSON.stringify(state.completions));
}