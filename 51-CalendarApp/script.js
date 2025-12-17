document.addEventListener('DOMContentLoaded', function() {
  
    initCalendar();
    
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    updateTime();
    setInterval(updateTime, 1000);
});

// App state
const state = {
    currentDate: new Date(),
    selectedDate: new Date(),
    events: JSON.parse(localStorage.getItem('chronosEvents')) || [],
    categories: {
        meeting: { name: 'Meeting', color: '#7c3aed' },
        personal: { name: 'Personal', color: '#06b6d4' },
        work: { name: 'Work', color: '#f59e0b' },
        birthday: { name: 'Birthday', color: '#ef4444' },
        holiday: { name: 'Holiday', color: '#10b981' },
        other: { name: 'Other', color: '#8b5cf6' }
    },
    currentTheme: localStorage.getItem('chronosTheme') || 'dark'
};

function initCalendar() {
    // Set theme
    document.documentElement.setAttribute('data-theme', state.currentTheme);
    updateThemeButton();
    
    renderCalendar();
    renderMiniCalendar();
    updateDisplayDate();
    updateEventCounts();
    loadUpcomingEvents();
    updateStorageInfo();
    
    document.getElementById('event-date').valueAsDate = new Date();
    updateCategoryColorPreview();
    
    setupEventListeners();
}

function setupEventListeners() {

    document.getElementById('prev-year').addEventListener('click', () => navigateYear(-1));
    document.getElementById('prev-month').addEventListener('click', () => navigateMonth(-1));
    document.getElementById('next-month').addEventListener('click', () => navigateMonth(1));
    document.getElementById('next-year').addEventListener('click', () => navigateYear(1));
    document.getElementById('today-btn').addEventListener('click', goToToday);
    
    document.getElementById('mini-prev-month').addEventListener('click', () => navigateMiniMonth(-1));
    document.getElementById('mini-next-month').addEventListener('click', () => navigateMiniMonth(1));
    
    document.getElementById('event-form').addEventListener('submit', saveEvent);
    document.getElementById('clear-event-form').addEventListener('click', clearEventForm);
    document.getElementById('event-category').addEventListener('change', updateCategoryColorPreview);
    
    document.getElementById('add-today-event').addEventListener('click', addEventForToday);
    document.getElementById('add-tomorrow-event').addEventListener('click', addEventForTomorrow);
    document.getElementById('view-all-events').addEventListener('click', showAllEvents);
    document.getElementById('clear-old-events').addEventListener('click', clearOldEvents);
    
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    document.getElementById('export-calendar').addEventListener('click', exportCalendar);
    
    document.getElementById('clear-all-events').addEventListener('click', clearAllEvents);
    
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModals();
            }
        });
    });
    
    document.getElementById('event-date').addEventListener('change', function() {
        updateCategoryColorPreview();
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
    
    document.getElementById('current-time').textContent = timeString;
    
    const dayString = now.toLocaleDateString('en-US', { weekday: 'long' });
    const dateString = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    document.getElementById('current-day').textContent = dayString;
    document.getElementById('current-date').textContent = dateString;
}

function renderCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    calendarGrid.innerHTML = '';
    
    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();
    
    const monthYearString = state.currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
    });
    document.getElementById('display-month-year').textContent = monthYearString;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    for (let i = 0; i < 42; i++) { // 6 weeks
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        let dayNumber;
        let date;
        let isOtherMonth = false;
        
        if (i < startingDay) {
            // Previous month
            dayNumber = prevMonthLastDay - startingDay + i + 1;
            date = new Date(year, month - 1, dayNumber);
            isOtherMonth = true;
        } else if (i >= startingDay + daysInMonth) {
            // Next month
            dayNumber = i - startingDay - daysInMonth + 1;
            date = new Date(year, month + 1, dayNumber);
            isOtherMonth = true;
        } else {
            // Current month
            dayNumber = i - startingDay + 1;
            date = new Date(year, month, dayNumber);
        }
        
        const today = new Date();
        const isToday = date.getDate() === today.getDate() &&
                       date.getMonth() === today.getMonth() &&
                       date.getFullYear() === today.getFullYear();
        
        const isSelected = date.getDate() === state.selectedDate.getDate() &&
                          date.getMonth() === state.selectedDate.getMonth() &&
                          date.getFullYear() === state.selectedDate.getFullYear();
        
        if (isOtherMonth) dayElement.classList.add('other-month');
        if (isToday) dayElement.classList.add('today');
        if (isSelected) dayElement.classList.add('selected');
        
        const dayNumberElement = document.createElement('div');
        dayNumberElement.className = 'day-number';
        dayNumberElement.textContent = dayNumber;
        
        const dayEvents = getEventsForDate(date);
        const dayEventsElement = document.createElement('div');
        dayEventsElement.className = 'day-events';
        
        const eventsToShow = dayEvents.slice(0, 3);
        eventsToShow.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'day-event';
            eventElement.textContent = event.title;
            eventElement.style.backgroundColor = state.categories[event.category].color;
            eventElement.dataset.eventId = event.id;
            
            eventElement.addEventListener('click', (e) => {
                e.stopPropagation();
                showEventDetails(event.id);
            });
            
            dayEventsElement.appendChild(eventElement);
        });
        
        if (dayEvents.length > 3) {
            const moreElement = document.createElement('div');
            moreElement.className = 'event-more';
            moreElement.textContent = `+${dayEvents.length - 3} more`;
            dayEventsElement.appendChild(moreElement);
        }
        
        dayElement.appendChild(dayNumberElement);
        dayElement.appendChild(dayEventsElement);
        
        dayElement.addEventListener('click', () => {
            state.selectedDate = date;
            renderCalendar();
            renderMiniCalendar();
            loadDayEvents();
        });
        
        calendarGrid.appendChild(dayElement);
    }
    
    
    loadDayEvents();
}

function renderMiniCalendar() {
    const miniGrid = document.getElementById('mini-calendar-grid');
    miniGrid.innerHTML = '';
    
    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();
    
    // Update mini calendar header
    const miniMonthYear = state.currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
    });
    document.getElementById('mini-month-year').textContent = miniMonthYear;
    
    // Get first day of month and total days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    // Create mini calendar days
    for (let i = 0; i < 42; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'mini-day';
        
        let dayNumber;
        let date;
        let isOtherMonth = false;
        
        if (i < startingDay) {
            // Previous month
            dayNumber = prevMonthLastDay - startingDay + i + 1;
            date = new Date(year, month - 1, dayNumber);
            isOtherMonth = true;
        } else if (i >= startingDay + daysInMonth) {
            // Next month
            dayNumber = i - startingDay - daysInMonth + 1;
            date = new Date(year, month + 1, dayNumber);
            isOtherMonth = true;
        } else {
            // Current month
            dayNumber = i - startingDay + 1;
            date = new Date(year, month, dayNumber);
        }
        
        // Check if today
        const today = new Date();
        const isToday = date.getDate() === today.getDate() &&
                       date.getMonth() === today.getMonth() &&
                       date.getFullYear() === today.getFullYear();
        
        // Check if selected
        const isSelected = date.getDate() === state.selectedDate.getDate() &&
                          date.getMonth() === state.selectedDate.getMonth() &&
                          date.getFullYear() === state.selectedDate.getFullYear();
        
        // Check if has events
        const hasEvents = getEventsForDate(date).length > 0;
        
        dayElement.textContent = dayNumber;
        
        if (isOtherMonth) dayElement.classList.add('other-month');
        if (isToday) dayElement.classList.add('today');
        if (isSelected) dayElement.classList.add('selected');
        if (hasEvents) dayElement.classList.add('has-events');
        
        // Click event to select date
        dayElement.addEventListener('click', () => {
            state.selectedDate = date;
            state.currentDate = new Date(date.getFullYear(), date.getMonth(), 1);
            renderCalendar();
            renderMiniCalendar();
            loadDayEvents();
            
            // Update event form date
            document.getElementById('event-date').valueAsDate = date;
        });
        
        miniGrid.appendChild(dayElement);
    }
}

// Get events for a specific date
function getEventsForDate(date) {
    const dateString = date.toISOString().split('T')[0];
    return state.events.filter(event => {
        const eventDate = new Date(event.date).toISOString().split('T')[0];
        return eventDate === dateString;
    }).sort((a, b) => {
        // Sort by time if available
        if (a.time && b.time) {
            return a.time.localeCompare(b.time);
        }
        // All-day events first
        if (!a.time && b.time) return -1;
        if (a.time && !b.time) return 1;
        return 0;
    });
}

// Load events for selected day
function loadDayEvents() {
    const dayEventsList = document.getElementById('day-events-list');
    const selectedDateDisplay = document.getElementById('selected-date-display');
    
    // Update selected date display
    selectedDateDisplay.textContent = state.selectedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
    
    const events = getEventsForDate(state.selectedDate);
    
    if (events.length === 0) {
        dayEventsList.innerHTML = `
            <div class="empty-day-events">
                <i class="fas fa-calendar-plus"></i>
                <p>No events for this day</p>
                <p class="hint">Click on a day to view or add events</p>
            </div>
        `;
        return;
    }
    
    dayEventsList.innerHTML = '';
    
    events.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'day-event-item';
        eventElement.style.borderLeftColor = state.categories[event.category].color;
        eventElement.dataset.eventId = event.id;
        
        const timeString = event.time ? 
            new Date(`2000-01-01T${event.time}`).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            }) : 'All day';
        
        eventElement.innerHTML = `
            <div class="event-time">${timeString}</div>
            <div class="event-title">${event.title}</div>
            <div>
                <span class="event-category-badge" style="background-color: ${state.categories[event.category].color}">
                    ${state.categories[event.category].name}
                </span>
            </div>
        `;
        
        eventElement.addEventListener('click', () => {
            showEventDetails(event.id);
        });
        
        dayEventsList.appendChild(eventElement);
    });
}

// Load upcoming events (next 7 days)
function loadUpcomingEvents() {
    const upcomingList = document.getElementById('upcoming-events');
    const upcomingCount = document.getElementById('upcoming-count');
    
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const upcomingEvents = state.events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= nextWeek;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    upcomingCount.textContent = upcomingEvents.length;
    
    if (upcomingEvents.length === 0) {
        upcomingList.innerHTML = `
            <div class="empty-upcoming">
                <i class="fas fa-calendar-check"></i>
                <p>No upcoming events</p>
            </div>
        `;
        return;
    }
    
    upcomingList.innerHTML = '';
    
    upcomingEvents.slice(0, 5).forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'upcoming-event';
        eventElement.style.borderLeftColor = state.categories[event.category].color;
        eventElement.dataset.eventId = event.id;
        
        const eventDate = new Date(event.date);
        const dateString = eventDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            weekday: 'short'
        });
        
        eventElement.innerHTML = `
            <div class="event-date">${dateString}</div>
            <div class="event-title">${event.title}</div>
            <div>
                <span class="event-category" style="background-color: ${state.categories[event.category].color}">
                    ${state.categories[event.category].name}
                </span>
            </div>
        `;
        
        eventElement.addEventListener('click', () => {
            state.selectedDate = eventDate;
            state.currentDate = new Date(eventDate.getFullYear(), eventDate.getMonth(), 1);
            renderCalendar();
            renderMiniCalendar();
            loadDayEvents();
            showEventDetails(event.id);
        });
        
        upcomingList.appendChild(eventElement);
    });
}

// Save a new event
function saveEvent(e) {
    e.preventDefault();
    
    const title = document.getElementById('event-title').value.trim();
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;
    const category = document.getElementById('event-category').value;
    const description = document.getElementById('event-description').value.trim();
    
    // Validate inputs
    if (!title || !date) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // Create event object
    const event = {
        id: Date.now().toString(),
        title,
        date,
        time: time || null,
        category,
        description: description || null,
        createdAt: new Date().toISOString()
    };
    
    // Add to events array
    state.events.push(event);
    
    // Save to localStorage
    saveEvents();
    
    // Update UI
    renderCalendar();
    renderMiniCalendar();
    loadUpcomingEvents();
    updateEventCounts();
    updateStorageInfo();
    
    // Clear form and show success
    clearEventForm();
    showToast('Event added successfully!');
}

// Clear event form
function clearEventForm() {
    document.getElementById('event-form').reset();
    document.getElementById('event-date').valueAsDate = new Date();
    updateCategoryColorPreview();
}

// Update category color preview
function updateCategoryColorPreview() {
    const category = document.getElementById('event-category').value;
    const colorPreview = document.getElementById('category-color-preview');
    colorPreview.style.backgroundColor = state.categories[category].color;
}

// Show event details in modal
function showEventDetails(eventId) {
    const event = state.events.find(e => e.id === eventId);
    if (!event) return;
    
    // Populate modal with event details
    document.getElementById('modal-event-title').textContent = event.title;
    
    const eventDate = new Date(event.date);
    document.getElementById('modal-event-date').textContent = eventDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
    
    const timeString = event.time ? 
        new Date(`2000-01-01T${event.time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }) : 'All day';
    document.getElementById('modal-event-time').textContent = timeString;
    
    const categoryBadge = document.getElementById('modal-event-category');
    categoryBadge.textContent = state.categories[event.category].name;
    categoryBadge.style.backgroundColor = state.categories[event.category].color;
    
    document.getElementById('modal-event-description').textContent = 
        event.description || 'No description provided.';
    
    // Set up delete button
    const deleteBtn = document.getElementById('delete-event-btn');
    deleteBtn.onclick = () => {
        if (confirm('Are you sure you want to delete this event?')) {
            deleteEvent(eventId);
            closeModals();
        }
    };
    
    // Set up edit button
    const editBtn = document.getElementById('edit-event-btn');
    editBtn.onclick = () => {
        editEvent(eventId);
        closeModals();
    };
    
    // Show modal
    document.getElementById('event-details-modal').classList.add('active');
}

// Delete an event
function deleteEvent(eventId) {
    state.events = state.events.filter(event => event.id !== eventId);
    saveEvents();
    renderCalendar();
    renderMiniCalendar();
    loadUpcomingEvents();
    updateEventCounts();
    updateStorageInfo();
    showToast('Event deleted successfully!');
}

// Edit an event
function editEvent(eventId) {
    const event = state.events.find(e => e.id === eventId);
    if (!event) return;
    
    // Populate form with event data
    document.getElementById('event-title').value = event.title;
    document.getElementById('event-date').value = event.date;
    document.getElementById('event-time').value = event.time || '';
    document.getElementById('event-category').value = event.category;
    document.getElementById('event-description').value = event.description || '';
    
    updateCategoryColorPreview();
    
    // Remove the event from the list
    deleteEvent(eventId);
    
    // Scroll to form
    document.querySelector('.event-form').scrollIntoView({ behavior: 'smooth' });
}

// Show all events in modal
function showAllEvents() {
    const allEventsList = document.getElementById('all-events-list');
    allEventsList.innerHTML = '';
    
    // Sort events by date
    const sortedEvents = [...state.events].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (sortedEvents.length === 0) {
        allEventsList.innerHTML = `
            <div class="empty-upcoming">
                <i class="fas fa-calendar-check"></i>
                <p>No events yet</p>
            </div>
        `;
    } else {
        sortedEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'all-event-item';
            eventElement.style.borderLeftColor = state.categories[event.category].color;
            
            const eventDate = new Date(event.date);
            const dateString = eventDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                weekday: 'short'
            });
            
            const timeString = event.time ? 
                new Date(`2000-01-01T${event.time}`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }) : 'All day';
            
            eventElement.innerHTML = `
                <div class="event-info">
                    <div class="event-title">${event.title}</div>
                    <div class="event-date">${dateString} • ${timeString}</div>
                    <div>
                        <span class="event-category-badge" style="background-color: ${state.categories[event.category].color}">
                            ${state.categories[event.category].name}
                        </span>
                    </div>
                </div>
                <div class="event-actions">
                    <button class="action-btn" onclick="showEventDetails('${event.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn" onclick="editEvent('${event.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            `;
            
            allEventsList.appendChild(eventElement);
        });
    }
    
    // Set up filter functionality
    document.getElementById('events-search').addEventListener('input', filterAllEvents);
    document.getElementById('events-category-filter').addEventListener('change', filterAllEvents);
    
    // Show modal
    document.getElementById('all-events-modal').classList.add('active');
}

// Filter events in all events modal
function filterAllEvents() {
    const searchTerm = document.getElementById('events-search').value.toLowerCase();
    const categoryFilter = document.getElementById('events-category-filter').value;
    
    const eventItems = document.querySelectorAll('.all-event-item');
    
    eventItems.forEach(item => {
        const title = item.querySelector('.event-title').textContent.toLowerCase();
        const category = item.querySelector('.event-category-badge').textContent.toLowerCase();
        
        const matchesSearch = title.includes(searchTerm);
        const matchesCategory = categoryFilter === 'all' || 
                               category === categoryFilter.toLowerCase();
        
        item.style.display = matchesSearch && matchesCategory ? 'flex' : 'none';
    });
}

// Navigation functions
function navigateMonth(direction) {
    state.currentDate.setMonth(state.currentDate.getMonth() + direction);
    renderCalendar();
    renderMiniCalendar();
}

function navigateYear(direction) {
    state.currentDate.setFullYear(state.currentDate.getFullYear() + direction);
    renderCalendar();
    renderMiniCalendar();
}

function navigateMiniMonth(direction) {
    const tempDate = new Date(state.currentDate);
    tempDate.setMonth(tempDate.getMonth() + direction);
    state.currentDate = tempDate;
    renderCalendar();
    renderMiniCalendar();
}

function goToToday() {
    state.currentDate = new Date();
    state.selectedDate = new Date();
    renderCalendar();
    renderMiniCalendar();
    loadDayEvents();
    updateDisplayDate();
}

function updateDisplayDate() {
    const selectedDateDisplay = document.getElementById('selected-date-display');
    selectedDateDisplay.textContent = state.selectedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

// Quick action functions
function addEventForToday() {
    const today = new Date();
    state.selectedDate = today;
    document.getElementById('event-date').valueAsDate = today;
    updateCategoryColorPreview();
    
    // Scroll to form
    document.querySelector('.event-form').scrollIntoView({ behavior: 'smooth' });
}

function addEventForTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    state.selectedDate = tomorrow;
    document.getElementById('event-date').valueAsDate = tomorrow;
    updateCategoryColorPreview();
    
    // Scroll to form
    document.querySelector('.event-form').scrollIntoView({ behavior: 'smooth' });
}

function clearOldEvents() {
    const today = new Date();
    const oldEvents = state.events.filter(event => new Date(event.date) < today);
    
    if (oldEvents.length === 0) {
        showToast('No old events to clear', 'warning');
        return;
    }
    
    if (confirm(`Clear ${oldEvents.length} past events?`)) {
        state.events = state.events.filter(event => new Date(event.date) >= today);
        saveEvents();
        renderCalendar();
        renderMiniCalendar();
        loadUpcomingEvents();
        updateEventCounts();
        updateStorageInfo();
        showToast(`Cleared ${oldEvents.length} past events`);
    }
}

// Theme functions
function toggleTheme() {
    state.currentTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.currentTheme);
    localStorage.setItem('chronosTheme', state.currentTheme);
    updateThemeButton();
}

function updateThemeButton() {
    const themeBtn = document.getElementById('theme-toggle');
    const icon = themeBtn.querySelector('i');
    const text = themeBtn.querySelector('span');
    
    if (state.currentTheme === 'dark') {
        icon.className = 'fas fa-moon';
        text.textContent = 'Dark Mode';
    } else {
        icon.className = 'fas fa-sun';
        text.textContent = 'Light Mode';
    }
}

// Export calendar data
function exportCalendar() {
    const dataStr = JSON.stringify({
        events: state.events,
        exportDate: new Date().toISOString()
    }, null, 2);
    
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `chronos-calendar-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast('Calendar exported successfully!');
}

// Clear all events
function clearAllEvents() {
    if (state.events.length === 0) {
        showToast('No events to clear', 'warning');
        return;
    }
    
    if (confirm('Are you sure you want to delete ALL events? This action cannot be undone.')) {
        state.events = [];
        saveEvents();
        renderCalendar();
        renderMiniCalendar();
        loadUpcomingEvents();
        updateEventCounts();
        updateStorageInfo();
        showToast('All events have been deleted');
    }
}

// Update event counts
function updateEventCounts() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const todayEvents = state.events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === today.toDateString();
    }).length;
    
    const weekEvents = state.events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= startOfWeek && eventDate <= endOfWeek;
    }).length;
    
    const monthEvents = state.events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= startOfMonth && eventDate <= endOfMonth;
    }).length;
    
    document.getElementById('total-events').textContent = state.events.length;
    document.getElementById('today-events').textContent = todayEvents;
    document.getElementById('week-events').textContent = weekEvents;
    document.getElementById('month-events').textContent = monthEvents;
}

// Update storage info
function updateStorageInfo() {
    const storageInfo = document.getElementById('storage-usage');
    storageInfo.textContent = `${state.events.length} events stored`;
}

// Save events to localStorage
function saveEvents() {
    localStorage.setItem('chronosEvents', JSON.stringify(state.events));
}

// Close all modals
function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
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
    
   
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}