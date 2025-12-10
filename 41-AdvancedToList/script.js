// app.js - SIMPLIFIED AND WORKING VERSION
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskForm = document.getElementById('task-form');
    const taskTitleInput = document.getElementById('task-title');
    const taskDescriptionInput = document.getElementById('task-description');
    const taskCategoryInput = document.getElementById('task-category');
    const taskPriorityInput = document.getElementById('task-priority');
    const taskDueDateInput = document.getElementById('task-due-date');
    const taskTimeInput = document.getElementById('task-time');
    const taskTagsInput = document.getElementById('task-tags');
    const tasksList = document.getElementById('tasks-list');
    const searchTasksInput = document.getElementById('search-tasks');
    const filterStatusInput = document.getElementById('filter-status');
    const filterCategoryInput = document.getElementById('filter-category');
    const filterPriorityInput = document.getElementById('filter-priority');
    const filterDateInput = document.getElementById('filter-date');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const clearCompletedBtn = document.getElementById('clear-completed');
    
    // Statistics elements
    const totalTasksElement = document.getElementById('total-tasks');
    const pendingTasksElement = document.getElementById('pending-tasks');
    const completedTasksElement = document.getElementById('completed-tasks');
    const overdueTasksElement = document.getElementById('overdue-tasks');
    const todayTasksElement = document.getElementById('today-tasks');
    const upcomingTasksElement = document.getElementById('upcoming-tasks');
    const highPriorityTasksElement = document.getElementById('high-priority-tasks');
    
    // Templates
    const taskTemplate = document.getElementById('task-template');
    const upcomingTemplate = document.getElementById('upcoming-template');
    const categoryTemplate = document.getElementById('category-template');
    
    // Application state
    let tasks = [];
    let categories = [
        { id: 'work', name: 'Work', color: '#4f46e5' },
        { id: 'personal', name: 'Personal', color: '#10b981' },
        { id: 'shopping', name: 'Shopping', color: '#8b5cf6' },
        { id: 'health', name: 'Health', color: '#ef4444' },
        { id: 'education', name: 'Education', color: '#06b6d4' },
        { id: 'other', name: 'Other', color: '#64748b' }
    ];
    let currentFilters = {
        status: 'all',
        category: 'all',
        priority: 'all',
        date: 'all',
        search: ''
    };
    
    // Initialize the app
    function init() {
        console.log('Initializing Advanced Todo List...');
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        taskDueDateInput.value = today;
        taskDueDateInput.min = today;
        
        // Load data from localStorage
        loadTasks();
        loadCategories();
        
        // Setup event listeners
        setupEventListeners();
        
        // Render UI
        renderUI();
    }
    
    // Load tasks from localStorage
    function loadTasks() {
        try {
            const tasksJson = localStorage.getItem('advancedTodoTasks');
            console.log('Loading tasks from localStorage...');
            
            if (tasksJson) {
                tasks = JSON.parse(tasksJson);
                console.log(`Loaded ${tasks.length} tasks from localStorage`);
            } else {
                console.log('No tasks found in localStorage, starting fresh');
                tasks = [];
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            tasks = [];
        }
    }
    
    // Save tasks to localStorage - FIXED VERSION
    function saveTasks() {
        try {
            console.log('Saving tasks to localStorage:', tasks);
            localStorage.setItem('advancedTodoTasks', JSON.stringify(tasks));
            console.log(`Saved ${tasks.length} tasks to localStorage`);
        } catch (error) {
            console.error('Error saving tasks:', error);
            alert('Error saving tasks. Please try again.');
        }
    }
    
    // Load categories from localStorage
    function loadCategories() {
        try {
            const categoriesJson = localStorage.getItem('advancedTodoCategories');
            if (categoriesJson) {
                const savedCategories = JSON.parse(categoriesJson);
                // Merge with default categories
                savedCategories.forEach(savedCat => {
                    if (!categories.find(cat => cat.id === savedCat.id)) {
                        categories.push(savedCat);
                    }
                });
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }
    
    // Save categories to localStorage
    function saveCategories() {
        try {
            localStorage.setItem('advancedTodoCategories', JSON.stringify(categories));
        } catch (error) {
            console.error('Error saving categories:', error);
        }
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Form submission
        taskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!taskTitleInput.value.trim()) {
                alert('Please enter a task title');
                return;
            }
            
            const taskData = {
                id: Date.now().toString(),
                title: taskTitleInput.value.trim(),
                description: taskDescriptionInput.value.trim(),
                category: taskCategoryInput.value,
                priority: taskPriorityInput.value,
                tags: taskTagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag),
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Handle due date and time
            if (taskDueDateInput.value) {
                taskData.dueDate = taskDueDateInput.value;
                if (taskTimeInput.value) {
                    taskData.dueTime = taskTimeInput.value;
                    taskData.hasTime = true;
                }
            }
            
            // Add task
            tasks.unshift(taskData);
            
            // Save to localStorage
            saveTasks();
            
            // Reset form
            taskForm.reset();
            const today = new Date().toISOString().split('T')[0];
            taskDueDateInput.value = today;
            
            // Update UI
            renderUI();
            
            // Show notification
            alert('Task added successfully!');
        });
        
        // Clear form button
        document.getElementById('clear-form').addEventListener('click', function() {
            taskForm.reset();
            const today = new Date().toISOString().split('T')[0];
            taskDueDateInput.value = today;
        });
        
        // Add category button
        document.getElementById('add-category-btn').addEventListener('click', function() {
            const categoryName = prompt('Enter new category name:');
            if (categoryName && categoryName.trim()) {
                const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-');
                
                if (!categories.find(cat => cat.id === categoryId)) {
                    categories.push({
                        id: categoryId,
                        name: categoryName.trim(),
                        color: '#4f46e5'
                    });
                    saveCategories();
                    updateCategorySelects();
                    renderUI();
                    alert('Category added successfully!');
                } else {
                    alert('Category already exists!');
                }
            }
        });
        
        // Search input
        searchTasksInput.addEventListener('input', function() {
            currentFilters.search = this.value.trim();
            renderUI();
        });
        
        // Filter changes
        filterStatusInput.addEventListener('change', function() {
            currentFilters.status = this.value;
            renderUI();
        });
        
        filterCategoryInput.addEventListener('change', function() {
            currentFilters.category = this.value;
            renderUI();
        });
        
        filterPriorityInput.addEventListener('change', function() {
            currentFilters.priority = this.value;
            renderUI();
        });
        
        filterDateInput.addEventListener('change', function() {
            currentFilters.date = this.value;
            renderUI();
        });
        
        // Clear filters button
        clearFiltersBtn.addEventListener('click', function() {
            searchTasksInput.value = '';
            filterStatusInput.value = 'all';
            filterCategoryInput.value = 'all';
            filterPriorityInput.value = 'all';
            filterDateInput.value = 'all';
            
            currentFilters = {
                status: 'all',
                category: 'all',
                priority: 'all',
                date: 'all',
                search: ''
            };
            
            renderUI();
        });
        
        // Clear completed tasks button
        clearCompletedBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete all completed tasks?')) {
                const completedCount = tasks.filter(task => task.status === 'completed').length;
                tasks = tasks.filter(task => task.status !== 'completed');
                saveTasks();
                renderUI();
                alert(`Deleted ${completedCount} completed tasks!`);
            }
        });
        
        // Export tasks button
        document.getElementById('export-tasks').addEventListener('click', function() {
            const dataStr = JSON.stringify(tasks, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const exportFileDefaultName = `todo-tasks-${new Date().toISOString().split('T')[0]}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        });
        
        // Import tasks button - simplified
        document.getElementById('import-tasks').addEventListener('click', function() {
            alert('Import feature: Save your tasks as JSON and replace the localStorage data manually for now.');
        });
        
        // Bulk actions
        document.getElementById('bulk-complete').addEventListener('click', function() {
            const checkboxes = document.querySelectorAll('.task-select:checked');
            if (checkboxes.length === 0) {
                alert('No tasks selected');
                return;
            }
            
            checkboxes.forEach(checkbox => {
                const taskId = checkbox.closest('.task-item').dataset.id;
                const task = tasks.find(t => t.id === taskId);
                if (task) {
                    task.status = 'completed';
                    task.updatedAt = new Date().toISOString();
                }
            });
            
            saveTasks();
            renderUI();
            alert(`Marked ${checkboxes.length} tasks as complete!`);
        });
        
        document.getElementById('bulk-delete').addEventListener('click', function() {
            const checkboxes = document.querySelectorAll('.task-select:checked');
            if (checkboxes.length === 0) {
                alert('No tasks selected');
                return;
            }
            
            if (confirm(`Are you sure you want to delete ${checkboxes.length} tasks?`)) {
                checkboxes.forEach(checkbox => {
                    const taskId = checkbox.closest('.task-item').dataset.id;
                    tasks = tasks.filter(t => t.id !== taskId);
                });
                
                saveTasks();
                renderUI();
                alert(`Deleted ${checkboxes.length} tasks!`);
            }
        });
        
        document.getElementById('select-all').addEventListener('click', function() {
            const checkboxes = document.querySelectorAll('.task-select');
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            
            checkboxes.forEach(checkbox => {
                checkbox.checked = !allChecked;
            });
        });
    }
    
    // Update category select inputs
    function updateCategorySelects() {
        // Update task form category select
        taskCategoryInput.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            taskCategoryInput.appendChild(option);
        });
        
        // Update filter category select
        filterCategoryInput.innerHTML = '<option value="all">All Categories</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            filterCategoryInput.appendChild(option);
        });
    }
    
    // Get filtered tasks based on current filters
    function getFilteredTasks() {
        let filteredTasks = [...tasks];
        
        // Filter by status
        if (currentFilters.status !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.status === currentFilters.status);
        }
        
        // Filter by category
        if (currentFilters.category !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.category === currentFilters.category);
        }
        
        // Filter by priority
        if (currentFilters.priority !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.priority === currentFilters.priority);
        }
        
        // Filter by date
        if (currentFilters.date !== 'all') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            filteredTasks = filteredTasks.filter(task => {
                if (!task.dueDate) {
                    return currentFilters.date === 'no-date';
                }
                
                const dueDate = new Date(task.dueDate);
                
                switch (currentFilters.date) {
                    case 'today':
                        return dueDate.toDateString() === today.toDateString();
                    case 'tomorrow':
                        const tomorrow = new Date(today);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        return dueDate.toDateString() === tomorrow.toDateString();
                    case 'week':
                        const endOfWeek = new Date(today);
                        endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
                        return dueDate >= today && dueDate <= endOfWeek;
                    case 'month':
                        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                        return dueDate >= today && dueDate <= endOfMonth;
                    case 'overdue':
                        return dueDate < today && task.status !== 'completed';
                    case 'future':
                        return dueDate > today;
                    default:
                        return true;
                }
            });
        }
        
        // Filter by search
        if (currentFilters.search) {
            const searchTerm = currentFilters.search.toLowerCase();
            filteredTasks = filteredTasks.filter(task => 
                task.title.toLowerCase().includes(searchTerm) ||
                (task.description && task.description.toLowerCase().includes(searchTerm)) ||
                (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
        }
        
        return filteredTasks;
    }
    
    // Toggle task status
    function toggleTaskStatus(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.status = task.status === 'pending' ? 'completed' : 'pending';
            task.updatedAt = new Date().toISOString();
            saveTasks();
            renderUI();
        }
    }
    
    // Delete task
    function deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasks();
            renderUI();
        }
    }
    
    // Edit task
    function editTask(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // Populate form with task data
        taskTitleInput.value = task.title;
        taskDescriptionInput.value = task.description || '';
        taskCategoryInput.value = task.category;
        taskPriorityInput.value = task.priority;
        taskTagsInput.value = task.tags ? task.tags.join(', ') : '';
        
        if (task.dueDate) {
            taskDueDateInput.value = task.dueDate;
            if (task.dueTime) {
                taskTimeInput.value = task.dueTime;
            }
        }
        
        // Remove the task
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        
        alert('Task loaded for editing. Update the fields and click "Add Task" to save.');
    }
    
    // Calculate task statistics
    function calculateStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const stats = {
            total: tasks.length,
            pending: 0,
            completed: 0,
            overdue: 0,
            today: 0,
            upcoming: 0,
            highPriority: 0
        };
        
        tasks.forEach(task => {
            // Count by status
            if (task.status === 'pending') {
                stats.pending++;
            } else {
                stats.completed++;
            }
            
            // Count high priority tasks
            if (task.priority === 'urgent' || task.priority === 'high') {
                stats.highPriority++;
            }
            
            // Date-based stats
            if (task.dueDate) {
                const dueDate = new Date(task.dueDate);
                
                if (dueDate.toDateString() === today.toDateString()) {
                    stats.today++;
                }
                
                if (dueDate > today) {
                    stats.upcoming++;
                }
                
                if (dueDate < today && task.status === 'pending') {
                    stats.overdue++;
                }
            }
        });
        
        return stats;
    }
    
    // Format date for display
    function formatDate(dateString, hasTime = false, timeString = '') {
        if (!dateString) return 'No due date';
        
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) {
            return hasTime ? `Today at ${timeString}` : 'Today';
        }
        
        if (date.toDateString() === tomorrow.toDateString()) {
            return hasTime ? `Tomorrow at ${timeString}` : 'Tomorrow';
        }
        
        // Check if overdue
        if (date < today) {
            const daysAgo = Math.floor((today - date) / (1000 * 60 * 60 * 24));
            return `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago (Overdue)`;
        }
        
        // Format future date
        const options = { month: 'short', day: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-US', options);
        
        return hasTime ? `${formattedDate} at ${timeString}` : formattedDate;
    }
    
    // Render tasks list
    function renderTasksList() {
        const filteredTasks = getFilteredTasks();
        
        tasksList.innerHTML = '';
        
        if (filteredTasks.length === 0) {
            tasksList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>No tasks found</h3>
                    <p>${tasks.length === 0 ? 'Add your first task using the form on the left' : 'Try changing your filters or search term'}</p>
                </div>
            `;
            return;
        }
        
        // Render tasks
        filteredTasks.forEach(task => {
            const taskElement = taskTemplate.content.cloneNode(true);
            const taskItem = taskElement.querySelector('.task-item');
            
            // Set data attributes
            taskItem.dataset.id = task.id;
            if (task.status === 'completed') {
                taskItem.classList.add('completed');
            }
            
            // Set task content
            taskItem.querySelector('.task-title').textContent = task.title;
            taskItem.querySelector('.task-description').textContent = task.description || 'No description';
            
            // Set priority
            const priorityElement = taskItem.querySelector('.task-priority');
            priorityElement.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
            priorityElement.className = `task-priority priority-${task.priority}`;
            
            // Set category
            const category = categories.find(cat => cat.id === task.category) || categories.find(cat => cat.id === 'other');
            const categoryElement = taskItem.querySelector('.task-category');
            categoryElement.textContent = category.name;
            categoryElement.className = `task-category category-${category.id}`;
            
            // Set due date
            const dateElement = taskItem.querySelector('.task-date');
            dateElement.textContent = formatDate(task.dueDate, task.hasTime, task.dueTime);
            
            if (task.dueDate) {
                const dueDate = new Date(task.dueDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (dueDate.toDateString() === today.toDateString()) {
                    dateElement.classList.add('today');
                } else if (dueDate < today) {
                    dateElement.classList.add('overdue');
                }
            }
            
            // Set tags
            const tagsContainer = taskItem.querySelector('.task-tags');
            if (task.tags && task.tags.length > 0) {
                task.tags.forEach(tag => {
                    const tagElement = document.createElement('span');
                    tagElement.className = 'task-tag';
                    tagElement.textContent = tag;
                    tagsContainer.appendChild(tagElement);
                });
            } else {
                tagsContainer.innerHTML = '<span class="task-tag">No tags</span>';
            }
            
            // Set status badge
            const statusElement = taskItem.querySelector('.status-badge');
            statusElement.textContent = task.status === 'pending' ? 'Pending' : 'Completed';
            statusElement.className = `status-badge status-${task.status}`;
            
            // Add event listeners
            taskItem.querySelector('.btn-toggle-status').addEventListener('click', () => toggleTaskStatus(task.id));
            taskItem.querySelector('.btn-edit').addEventListener('click', () => editTask(task.id));
            taskItem.querySelector('.btn-delete').addEventListener('click', () => deleteTask(task.id));
            
            tasksList.appendChild(taskElement);
        });
    }
    
    // Render categories list
    function renderCategoriesList() {
        const categoriesListElement = document.getElementById('categories-list');
        categoriesListElement.innerHTML = '';
        
        // Count tasks per category
        const categoryCounts = {};
        tasks.forEach(task => {
            categoryCounts[task.category] = (categoryCounts[task.category] || 0) + 1;
        });
        
        // Render each category
        categories.forEach(category => {
            const categoryElement = categoryTemplate.content.cloneNode(true);
            const categoryItem = categoryElement.querySelector('.category-item');
            
            // Set category data
            categoryItem.querySelector('.category-color').style.backgroundColor = category.color;
            categoryItem.querySelector('.category-name').textContent = category.name;
            categoryItem.querySelector('.category-count').textContent = categoryCounts[category.id] || 0;
            
            // Add click event to filter by category
            categoryItem.addEventListener('click', () => {
                filterCategoryInput.value = category.id;
                currentFilters.category = category.id;
                renderUI();
            });
            
            categoriesListElement.appendChild(categoryElement);
        });
    }
    
    // Render upcoming tasks
    function renderUpcomingTasks() {
        const upcomingListElement = document.getElementById('upcoming-list');
        upcomingListElement.innerHTML = '';
        
        // Get upcoming tasks (due in next 7 days)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        const upcomingTasks = tasks
            .filter(task => task.status === 'pending' && task.dueDate)
            .filter(task => {
                const dueDate = new Date(task.dueDate);
                return dueDate >= today && dueDate <= nextWeek;
            })
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5);
        
        if (upcomingTasks.length === 0) {
            upcomingListElement.innerHTML = `
                <div class="empty-state small">
                    <i class="fas fa-calendar-times"></i>
                    <p>No upcoming deadlines</p>
                </div>
            `;
            return;
        }
        
        // Render upcoming tasks
        upcomingTasks.forEach(task => {
            const upcomingElement = upcomingTemplate.content.cloneNode(true);
            const upcomingItem = upcomingElement.querySelector('.upcoming-item');
            
            // Set date
            const dueDate = new Date(task.dueDate);
            upcomingItem.querySelector('.upcoming-day').textContent = dueDate.getDate();
            upcomingItem.querySelector('.upcoming-month').textContent = dueDate.toLocaleDateString('en-US', { month: 'short' });
            
            // Set content
            upcomingItem.querySelector('.upcoming-title').textContent = task.title;
            
            // Set category and priority
            const category = categories.find(cat => cat.id === task.category) || categories.find(cat => cat.id === 'other');
            upcomingItem.querySelector('.upcoming-category').textContent = category.name;
            
            const priorityElement = upcomingItem.querySelector('.upcoming-priority');
            priorityElement.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
            priorityElement.className = `upcoming-priority priority-${task.priority}`;
            
            upcomingListElement.appendChild(upcomingElement);
        });
    }
    
    // Update statistics display
    function updateStatistics() {
        const stats = calculateStats();
        
        totalTasksElement.textContent = stats.total;
        pendingTasksElement.textContent = stats.pending;
        completedTasksElement.textContent = stats.completed;
        overdueTasksElement.textContent = stats.overdue;
        todayTasksElement.textContent = stats.today;
        upcomingTasksElement.textContent = stats.upcoming;
        highPriorityTasksElement.textContent = stats.highPriority;
    }
    
    // Render the entire UI
    function renderUI() {
        updateStatistics();
        updateCategorySelects();
        renderCategoriesList();
        renderTasksList();
        renderUpcomingTasks();
    }
    
    // Initialize the application
    init();
});