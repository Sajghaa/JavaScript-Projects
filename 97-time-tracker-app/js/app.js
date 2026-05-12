// Main Application - Time Tracker
document.addEventListener('DOMContentLoaded', () => {
    // Initialize modules
    const timer = new Timer();
    const activityManager = new ActivityManager();
    const chartManager = new ChartManager(activityManager);
    
    // DOM Elements
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const activityNameInput = document.getElementById('activityName');
    const currentActivitySpan = document.getElementById('currentActivityName');
    const currentActivityDiv = document.getElementById('currentActivity');
    const activitiesList = document.getElementById('activitiesList');
    const emptyState = document.getElementById('emptyState');
    const timeFilter = document.getElementById('timeFilter');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const themeToggle = document.getElementById('themeToggle');
    
    let currentActivity = null;
    
    // Update stats displays
    function updateStats() {
        const totalDuration = activityManager.getTotalDuration(activityManager.currentFilter);
        const avgSession = activityManager.getAverageSessionDuration(activityManager.currentFilter);
        const todayTotal = activityManager.getTodayTotal();
        const totalActivities = activityManager.getActivities(activityManager.currentFilter).length;
        
        document.getElementById('totalActivities').textContent = totalActivities;
        document.getElementById('totalTime').textContent = activityManager.formatDuration(totalDuration);
        document.getElementById('avgSession').textContent = activityManager.formatDuration(avgSession);
        document.getElementById('todayTotal').textContent = activityManager.formatDuration(todayTotal);
    }
    
    // Render activities list
    function renderActivities() {
        const filter = activityManager.currentFilter;
        const activities = activityManager.getActivities(filter);
        const totalDuration = activityManager.getTotalDuration(filter);
        
        if (activities.length === 0) {
            activitiesList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        activitiesList.style.display = 'flex';
        emptyState.style.display = 'none';
        
        activitiesList.innerHTML = activities.map(activity => {
            const percentage = totalDuration > 0 ? (activity.duration / totalDuration) * 100 : 0;
            const durationFormatted = activityManager.formatDuration(activity.duration);
            
            return `
                <div class="activity-item" data-id="${activity.id}">
                    <div class="activity-info">
                        <div class="activity-name">${escapeHtml(activity.name)}</div>
                        <div class="activity-duration">
                            ${durationFormatted}
                            <span class="activity-date">${activity.date}</span>
                        </div>
                    </div>
                    <div class="activity-time">
                        <div class="activity-hours">${durationFormatted}</div>
                        <div class="activity-percent">${percentage.toFixed(1)}%</div>
                    </div>
                    <div class="activity-actions">
                        <button class="edit-activity" data-id="${activity.id}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-activity" data-id="${activity.id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Attach event listeners
        document.querySelectorAll('.edit-activity').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                editActivity(id);
            });
        });
        
        document.querySelectorAll('.delete-activity').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                deleteActivity(id);
            });
        });
    }
    
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
    }
    
    function editActivity(id) {
        const activity = activityManager.activities.find(a => a.id === id);
        if (!activity) return;
        
        document.getElementById('editActivityName').value = activity.name;
        const modal = document.getElementById('editModal');
        modal.classList.add('active');
        modal.dataset.editId = id;
    }
    
    function deleteActivity(id) {
        if (confirm('Delete this activity?')) {
            activityManager.deleteActivity(id);
            renderActivities();
            updateStats();
            showToast('Activity deleted', 'info');
        }
    }
    
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
    
    // Timer event handlers
    timer.on('tick', (seconds) => {
        // Update current activity display
        if (currentActivity) {
            const time = timer.getFormattedTime();
            currentActivitySpan.textContent = `${currentActivity.name} - ${time.hours}:${time.minutes}:${time.seconds}`;
        }
    });
    
    timer.on('stop', (duration) => {
        if (currentActivity) {
            activityManager.addActivity(currentActivity.name, duration);
            renderActivities();
            updateStats();
            showToast(`Saved ${currentActivity.name} - ${activityManager.formatDuration(duration)}`, 'success');
            
            currentActivity = null;
            currentActivityDiv.style.display = 'none';
            activityNameInput.value = '';
        }
        
        // Reset button states
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        stopBtn.disabled = true;
    });
    
    timer.on('pause', () => {
        pauseBtn.disabled = true;
        startBtn.disabled = false;
        stopBtn.disabled = false;
    });
    
    timer.on('start', () => {
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        stopBtn.disabled = false;
    });
    
    // Button click handlers
    startBtn.addEventListener('click', () => {
        const activityName = activityNameInput.value.trim();
        if (!activityName) {
            showToast('Please enter an activity name', 'error');
            return;
        }
        
        currentActivity = { name: activityName };
        currentActivitySpan.textContent = activityName;
        currentActivityDiv.style.display = 'inline-flex';
        timer.start();
    });
    
    pauseBtn.addEventListener('click', () => {
        timer.pause();
    });
    
    stopBtn.addEventListener('click', () => {
        timer.stop();
    });
    
    // Filter change
    timeFilter.addEventListener('change', () => {
        activityManager.setFilter(timeFilter.value);
        renderActivities();
        updateStats();
    });
    
    // Clear all activities
    clearAllBtn.addEventListener('click', () => {
        if (confirm('Delete all activities? This cannot be undone.')) {
            activityManager.deleteAllActivities();
            renderActivities();
            updateStats();
            showToast('All activities cleared', 'info');
        }
    });
    
    // Save edit
    document.getElementById('saveEditBtn').addEventListener('click', () => {
        const modal = document.getElementById('editModal');
        const id = parseInt(modal.dataset.editId);
        const newName = document.getElementById('editActivityName').value.trim();
        
        if (newName) {
            activityManager.updateActivity(id, newName);
            renderActivities();
            updateStats();
            showToast('Activity updated', 'success');
        }
        
        modal.classList.remove('active');
    });
    
    // Theme toggle
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        const icon = themeToggle.querySelector('i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });
    
    // Update date display
    function updateDateDisplay() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('dateDisplay').textContent = now.toLocaleDateString(undefined, options);
    }
    
    // Initial load
    updateDateDisplay();
    renderActivities();
    updateStats();
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const icon = themeToggle.querySelector('i');
    icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    
    console.log('Time Tracker App Ready!');
});

window.closeModal = function() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
};