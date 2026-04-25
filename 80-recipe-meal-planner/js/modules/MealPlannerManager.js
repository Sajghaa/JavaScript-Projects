// MealPlannerManager.js - Manages meal planning
class MealPlannerManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.currentWeek = new Date();
        
        this.init();
    }

    init() {
        this.renderMealPlan();
        
        document.getElementById('prevWeekBtn').onclick = () => this.changeWeek(-1);
        document.getElementById('nextWeekBtn').onclick = () => this.changeWeek(1);
    }

    showPanel() {
        const panel = document.getElementById('mealPlannerPanel');
        panel.classList.add('open');
        this.renderMealPlan();
    }

    closePanel() {
        document.getElementById('mealPlannerPanel').classList.remove('open');
    }

    changeWeek(delta) {
        this.currentWeek.setDate(this.currentWeek.getDate() + (delta * 7));
        this.renderMealPlan();
    }

    renderMealPlan() {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
        const mealLabels = { breakfast: '🍳 Breakfast', lunch: '🥗 Lunch', dinner: '🍽️ Dinner', snack: '🍎 Snack' };
        
        const weekRange = this.getWeekRange();
        document.getElementById('weekRange').textContent = `${weekRange.start} - ${weekRange.end}`;
        
        const container = document.getElementById('mealPlanGrid');
        container.innerHTML = days.map(day => `
            <div class="meal-day-card">
                <div class="meal-day-title">${day}</div>
                ${mealTypes.map(type => {
                    const meal = this.stateManager.getMealForDay(day, type);
                    return `
                        <div class="meal-slot">
                            <div class="meal-slot-label">${mealLabels[type]}</div>
                            <div class="meal-slot-recipe" data-day="${day}" data-type="${type}">
                                ${meal ? `
                                    <span>${meal.title}</span>
                                    <button class="remove-meal" data-day="${day}" data-type="${type}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                ` : `
                                    <span style="color: var(--text-secondary);">+ Add meal</span>
                                `}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `).join('');
        
        // Add click handlers
        container.querySelectorAll('.meal-slot-recipe').forEach(slot => {
            slot.onclick = (e) => {
                if (!e.target.closest('.remove-meal')) {
                    const day = slot.dataset.day;
                    const type = slot.dataset.type;
                    this.eventBus.emit('mealplan:add', { day, type });
                }
            };
        });
        
        container.querySelectorAll('.remove-meal').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const day = btn.dataset.day;
                const type = btn.dataset.type;
                this.stateManager.removeFromMealPlan(day, type);
                this.renderMealPlan();
                this.eventBus.emit('toast', { message: 'Meal removed from plan', type: 'info' });
            };
        });
    }

    getWeekRange() {
        const start = new Date(this.currentWeek);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(start.setDate(diff));
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        
        return {
            start: monday.toLocaleDateString(),
            end: sunday.toLocaleDateString()
        };
    }

    addToMealPlan(recipe, day, type) {
        this.stateManager.addToMealPlan(recipe, day, type);
        this.renderMealPlan();
        this.eventBus.emit('toast', { message: `Added to ${day} ${type}`, type: 'success' });
    }
}

window.MealPlannerManager = MealPlannerManager;