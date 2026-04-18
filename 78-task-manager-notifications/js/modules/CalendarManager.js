class CalendarManager {
    constructor(stateManager, eventBus, taskManager) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.taskManager = taskManager;
        this.currentMonth = new Date();
        
        this.renderCalendar();
    }

    renderCalendar() {
        const container = document.getElementById('calendarView');
        if (!container) return;
        
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();
        
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        let html = `
            <div class="calendar-header">
                <button id="calendarPrevBtn" class="btn btn-secondary"><i class="fas fa-chevron-left"></i></button>
                <h2>${monthNames[month]} ${year}</h2>
                <button id="calendarNextBtn" class="btn btn-secondary"><i class="fas fa-chevron-right"></i></button>
            </div>
            <div class="calendar-grid">
                ${dayNames.map(day => `<div class="calendar-day-header">${day}</div>`).join('')}
        `;
        
        for (let i = 0; i < startDayOfWeek; i++) {
            html += `<div class="calendar-day empty"></div>`;
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const isToday = currentDate.toDateString() === today.toDateString();
            const tasks = this.stateManager.getTasksByDate(currentDate);
            
            html += `
                <div class="calendar-day ${isToday ? 'today' : ''}" data-date="${currentDate.toISOString()}">
                    <div class="calendar-day-number">${day}</div>
                    <div class="calendar-tasks">
                        ${tasks.map(task => `
                            <div class="calendar-task ${task.priority}" data-task-id="${task.id}" title="${this.escapeHtml(task.title)}">
                                <span class="task-dot ${task.priority}"></span>
                                ${task.title.length > 25 ? task.title.substring(0, 25) + '...' : task.title}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        html += `</div>`;
        container.innerHTML = html;
        
        this.attachEvents();
    }

    attachEvents() {
        const prevBtn = document.getElementById('calendarPrevBtn');
        const nextBtn = document.getElementById('calendarNextBtn');
        
        if (prevBtn) {
            prevBtn.onclick = () => {
                this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
                this.renderCalendar();
            };
        }
        
        if (nextBtn) {
            nextBtn.onclick = () => {
                this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
                this.renderCalendar();
            };
        }
        
        const calendarTasks = document.querySelectorAll('.calendar-task');
        calendarTasks.forEach(taskEl => {
            taskEl.onclick = () => {
                const taskId = taskEl.dataset.taskId;
                if (this.taskManager) {
                    this.taskManager.showEditTaskModal(taskId);
                }
            };
        });
    }

    escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}

window.CalendarManager = CalendarManager;