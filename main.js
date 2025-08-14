/**
 * MGrow Launch Tracker - Main JavaScript
 * Interactive Trello-style project management board
 */

window.MGrowTracker = class MGrowTracker {
    constructor() {
        this.tasks = [];
        this.currentEditingTask = null;
        this.sortables = {};
        this.useLocalStorage = false;
        this.localStorage = new LocalStorageManager();
        
        this.init();
    }

    async init() {
        console.log('Initializing MGrow Launch Tracker...');
        
        // Initialize event listeners
        this.bindEvents();
        
        // Initialize drag and drop
        this.initializeDragAndDrop();
        
        // Initialize countdown timer
        this.initializeCountdown();
        
        // Load initial data
        await this.loadTasks();
        
        // Ensure we have tasks - if still none after loading, force create them
        if (this.tasks.length === 0) {
            console.log('No tasks found after initialization - force creating sample data...');
            await this.createSampleData();
            await this.loadTasks(); // Reload after forcing sample data creation
        }
        
        // Update progress
        this.updateProgress();
        
        // Hide loading
        this.hideLoading();
        
        console.log('MGrow Launch Tracker initialized successfully');
    }

    bindEvents() {
        // Modal events
        document.getElementById('addTaskBtn').addEventListener('click', () => this.showAddTaskModal());
        document.getElementById('viewStatsBtn').addEventListener('click', () => this.showStatsModal());
        document.getElementById('forceCreateTasksBtn').addEventListener('click', () => this.forceCreateTasks());
        document.getElementById('debugBtn').addEventListener('click', () => this.showDebugModal());
        document.getElementById('closeModal').addEventListener('click', () => this.hideTaskModal());
        document.getElementById('closeStatsModal').addEventListener('click', () => this.hideStatsModal());
        document.getElementById('closeDebugModal').addEventListener('click', () => this.hideDebugModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.hideTaskModal());
        
        // Debug events
        document.getElementById('testApiBtn').addEventListener('click', () => this.testApi());
        document.getElementById('createTestTaskBtn').addEventListener('click', () => this.createTestTask());
        document.getElementById('clearAllTasksBtn').addEventListener('click', () => this.clearAllTasks());
        
        // Form events
        document.getElementById('taskForm').addEventListener('submit', (e) => this.handleTaskSubmit(e));
        document.getElementById('deleteTaskBtn').addEventListener('click', () => this.deleteTask());
        
        // Close modals when clicking outside
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('taskModal')) {
                this.hideTaskModal();
            }
        });
        
        document.getElementById('statsModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('statsModal')) {
                this.hideStatsModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideTaskModal();
                this.hideStatsModal();
            }
        });
    }

    initializeDragAndDrop() {
        const columns = document.querySelectorAll('.column-content');
        
        columns.forEach(column => {
            this.sortables[column.dataset.column] = new Sortable(column, {
                group: 'tasks',
                animation: 150,
                ghostClass: 'sortable-ghost',
                chosenClass: 'sortable-chosen',
                dragClass: 'sortable-drag',
                
                onStart: (evt) => {
                    evt.item.classList.add('dragging');
                },
                
                onEnd: (evt) => {
                    evt.item.classList.remove('dragging');
                    this.handleTaskMove(evt);
                }
            });
        });
    }

    initializeCountdown() {
        // Launch date: September 10, 2024 at 9:00 AM
        // For demo purposes, let's simulate that today is August 14, 2024
        this.launchDate = new Date(2024, 8, 10, 9, 0, 0, 0).getTime(); // September 10, 2024 9:00 AM
        
        // Update countdown immediately
        this.updateCountdown();
        
        // Update countdown every second
        this.countdownInterval = setInterval(() => {
            this.updateCountdown();
        }, 1000);
    }

    updateCountdown() {
        // For demo purposes, simulate today is August 14, 2024
        // TODO: In production, replace with: const now = new Date().getTime();
        const simulatedToday = new Date(2024, 7, 14, 12, 0, 0, 0).getTime(); // August 14, 2024 12:00 PM
        const now = simulatedToday;
        const distance = this.launchDate - now;
        
        const countdownElement = document.getElementById('countdownTimer');
        

        
        if (distance > 0) {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            // Format countdown display based on time remaining
            if (days > 0) {
                if (days === 1) {
                    countdownElement.textContent = `1 day, ${hours}h ${minutes}m`;
                } else {
                    countdownElement.textContent = `${days} days, ${hours}h`;
                }
            } else if (hours > 0) {
                countdownElement.textContent = `${hours}h ${minutes}m ${seconds}s`;
            } else if (minutes > 0) {
                countdownElement.textContent = `${minutes}m ${seconds}s`;
            } else {
                countdownElement.textContent = `${seconds}s`;
            }
            
            // Change color based on urgency
            const countdownContainer = countdownElement.parentElement;
            
            // Remove any existing urgent class
            countdownContainer.classList.remove('urgent');
            
            if (days <= 1) {
                countdownContainer.style.background = 'rgba(244, 67, 54, 0.1)';
                countdownContainer.style.borderColor = 'rgba(244, 67, 54, 0.3)';
                countdownContainer.style.color = '#f44336';
                countdownElement.style.color = '#f44336';
                countdownContainer.querySelector('i').style.color = '#f44336';
                
                // Add urgent animation for final day
                countdownContainer.classList.add('urgent');
                
            } else if (days <= 7) {
                countdownContainer.style.background = 'rgba(255, 152, 0, 0.1)';
                countdownContainer.style.borderColor = 'rgba(255, 152, 0, 0.3)';
                countdownContainer.style.color = '#ff9800';
                countdownElement.style.color = '#ff9800';
                countdownContainer.querySelector('i').style.color = '#ff9800';
            }
            
        } else {
            countdownElement.textContent = '🚀 LAUNCHED!';
            countdownElement.parentElement.style.background = 'rgba(76, 175, 80, 0.1)';
            countdownElement.parentElement.style.borderColor = 'rgba(76, 175, 80, 0.3)';
            countdownElement.parentElement.style.color = '#4CAF50';
            
            // Clear the interval
            if (this.countdownInterval) {
                clearInterval(this.countdownInterval);
            }
        }
    }

    async handleTaskMove(evt) {
        const taskId = evt.item.dataset.taskId;
        const newStatus = evt.to.dataset.column;
        const newIndex = evt.newIndex;
        
        if (!taskId || !newStatus) return;
        
        try {
            // Update task status in database
            await this.updateTaskStatus(taskId, newStatus, newIndex);
            
            // Update local tasks array
            const taskIndex = this.tasks.findIndex(task => task.id === taskId);
            if (taskIndex !== -1) {
                this.tasks[taskIndex].status = newStatus;
                this.tasks[taskIndex].order = newIndex;
                
                // Mark as completed if moved to completed column
                if (newStatus === 'completed') {
                    this.tasks[taskIndex].completed = true;
                }
            }
            
            // Update UI
            this.updateTaskCounts();
            this.updateProgress();
            
        } catch (error) {
            console.error('Error updating task:', error);
            // Revert the move if there's an error
            evt.item.remove();
            this.renderTasks();
        }
    }

    async updateTaskStatus(taskId, status, order = 0) {
        const updateData = {
            status: status,
            order: order,
            completed: status === 'completed'
        };

        if (this.useLocalStorage) {
            return await this.localStorage.updateTask(taskId, updateData);
        }

        const response = await fetch(`tables/tasks/${taskId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            throw new Error('Failed to update task status');
        }

        return await response.json();
    }

    showAddTaskModal() {
        this.currentEditingTask = null;
        document.getElementById('modalTitle').textContent = 'Add New Task';
        document.getElementById('taskForm').reset();
        document.getElementById('deleteTaskBtn').style.display = 'none';
        document.getElementById('taskModal').classList.add('active');
        document.getElementById('taskTitle').focus();
    }

    showEditTaskModal(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        this.currentEditingTask = task;
        document.getElementById('modalTitle').textContent = 'Edit Task';
        
        // Populate form with task data
        document.getElementById('taskTitle').value = task.title || '';
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskStatus').value = task.status || 'backlog';
        document.getElementById('taskPriority').value = task.priority || 'medium';
        document.getElementById('taskAssignee').value = task.assignee || '';

        document.getElementById('taskTags').value = Array.isArray(task.tags) ? task.tags.join(', ') : '';
        
        if (task.due_date) {
            const date = new Date(task.due_date);
            document.getElementById('taskDueDate').value = date.toISOString().split('T')[0];
        }
        
        document.getElementById('deleteTaskBtn').style.display = 'inline-flex';
        document.getElementById('taskModal').classList.add('active');
        document.getElementById('taskTitle').focus();
    }

    hideTaskModal() {
        document.getElementById('taskModal').classList.remove('active');
        this.currentEditingTask = null;
    }

    showStatsModal() {
        this.updateStats();
        document.getElementById('statsModal').classList.add('active');
    }

    hideStatsModal() {
        document.getElementById('statsModal').classList.remove('active');
    }

    showDebugModal() {
        this.updateDebugInfo();
        document.getElementById('debugModal').classList.add('active');
    }

    hideDebugModal() {
        document.getElementById('debugModal').classList.remove('active');
    }

    updateDebugInfo() {
        document.getElementById('currentUrl').textContent = window.location.href;
        document.getElementById('tasksInMemory').textContent = this.tasks.length;
        document.getElementById('lastApiCall').textContent = this.lastApiCall || 'None';
    }

    debugLog(message) {
        const debugLogElement = document.getElementById('debugLog');
        const timestamp = new Date().toLocaleTimeString();
        debugLogElement.textContent += `[${timestamp}] ${message}\n`;
        debugLogElement.scrollTop = debugLogElement.scrollHeight;
        console.log(message);
    }

    async testApi() {
        this.debugLog('🧪 Testing API connection...');
        
        try {
            const response = await fetch('tables/tasks?limit=1');
            this.lastApiCall = `GET tables/tasks?limit=1 -> ${response.status}`;
            
            if (response.ok) {
                const data = await response.json();
                this.debugLog(`✅ API working! Status: ${response.status}`);
                this.debugLog(`📊 Response: ${JSON.stringify(data, null, 2)}`);
            } else {
                this.debugLog(`❌ API failed! Status: ${response.status} ${response.statusText}`);
                const errorText = await response.text();
                this.debugLog(`Error details: ${errorText}`);
            }
        } catch (error) {
            this.debugLog(`💥 API error: ${error.message}`);
            this.debugLog(`Error stack: ${error.stack}`);
        }
        
        this.updateDebugInfo();
    }

    async createTestTask() {
        this.debugLog('🧪 Creating test task...');
        
        const testTask = {
            title: "🧪 Test Task " + Date.now(),
            description: "This is a test task created for debugging",
            status: "backlog",
            priority: "medium",
            assignee: "Debug User",
            tags: ["test", "debug"],
            completed: false,
            week: 0,
            order: 999
        };
        
        try {
            const response = await fetch('tables/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testTask)
            });
            
            this.lastApiCall = `POST tables/tasks -> ${response.status}`;
            
            if (response.ok) {
                const result = await response.json();
                this.debugLog(`✅ Test task created! ID: ${result.id}`);
                this.debugLog(`📄 Task data: ${JSON.stringify(result, null, 2)}`);
                
                // Reload tasks to show the new one
                await this.loadTasks();
            } else {
                const errorText = await response.text();
                this.debugLog(`❌ Failed to create test task: ${response.status} ${response.statusText}`);
                this.debugLog(`Error details: ${errorText}`);
            }
        } catch (error) {
            this.debugLog(`💥 Create task error: ${error.message}`);
        }
        
        this.updateDebugInfo();
    }

    async clearAllTasks() {
        if (!confirm('Are you sure you want to delete ALL tasks? This cannot be undone!')) {
            return;
        }
        
        this.debugLog('🗑️ Clearing all tasks...');
        
        try {
            if (this.useLocalStorage) {
                await this.localStorage.clearAllTasks();
                this.debugLog('✅ All tasks cleared from localStorage');
            } else {
                // Get all tasks first
                const response = await fetch('tables/tasks?limit=1000');
                if (response.ok) {
                    const data = await response.json();
                    const tasks = data.data || [];
                    
                    this.debugLog(`Found ${tasks.length} tasks to delete`);
                    
                    // Delete each task
                    let deletedCount = 0;
                    for (const task of tasks) {
                        try {
                            const deleteResponse = await fetch(`tables/tasks/${task.id}`, {
                                method: 'DELETE'
                            });
                            
                            if (deleteResponse.ok) {
                                deletedCount++;
                            }
                        } catch (error) {
                            this.debugLog(`Error deleting task ${task.id}: ${error.message}`);
                        }
                    }
                    
                    this.debugLog(`✅ Deleted ${deletedCount}/${tasks.length} tasks`);
                } else {
                    this.debugLog('❌ Could not fetch tasks to delete');
                }
            }
            
            // Reload the board
            await this.loadTasks();
        } catch (error) {
            this.debugLog(`💥 Clear tasks error: ${error.message}`);
        }
        
        this.updateDebugInfo();
    }

    async handleTaskSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const taskData = {
            title: formData.get('title'),
            description: formData.get('description'),
            status: formData.get('status'),
            priority: formData.get('priority'),
            assignee: formData.get('assignee'),

            tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag),
            due_date: formData.get('due_date') ? new Date(formData.get('due_date')).getTime() : null,
            completed: false,
            week: this.getWeekFromStatus(formData.get('status')),
            order: 0
        };

        try {
            this.showLoading();

            if (this.currentEditingTask) {
                // Update existing task
                await this.updateTask(this.currentEditingTask.id, taskData);
            } else {
                // Create new task
                await this.createTask(taskData);
            }

            await this.loadTasks();
            this.updateProgress();
            this.hideTaskModal();
            
        } catch (error) {
            console.error('Error saving task:', error);
            alert('Error saving task. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async createTask(taskData) {
        if (this.useLocalStorage) {
            return await this.localStorage.addTask(taskData);
        }

        const response = await fetch('tables/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            throw new Error('Failed to create task');
        }

        return await response.json();
    }

    async updateTask(taskId, taskData) {
        if (this.useLocalStorage) {
            return await this.localStorage.updateTask(taskId, taskData);
        }

        const response = await fetch(`tables/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            throw new Error('Failed to update task');
        }

        return await response.json();
    }

    async deleteTask() {
        if (!this.currentEditingTask || !confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            this.showLoading();

            if (this.useLocalStorage) {
                await this.localStorage.deleteTask(this.currentEditingTask.id);
            } else {
                const response = await fetch(`tables/tasks/${this.currentEditingTask.id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Failed to delete task');
                }
            }

            await this.loadTasks();
            this.updateProgress();
            this.hideTaskModal();

        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Error deleting task. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async loadTasks() {
        // If we're already using localStorage, load from there
        if (this.useLocalStorage) {
            console.log('🏠 Loading tasks from localStorage...');
            if (this.debugLog) this.debugLog('🏠 Loading tasks from localStorage...');
            
            this.tasks = this.localStorage.getTasks();
            console.log(`📊 Loaded ${this.tasks.length} tasks from localStorage`);
            if (this.debugLog) this.debugLog(`📊 Loaded ${this.tasks.length} tasks from localStorage`);
            
            this.renderTasks();
            this.updateTaskCounts();
            return;
        }

        // Try API first
        try {
            console.log('📋 Loading tasks from API...');
            if (this.debugLog) this.debugLog('📋 Loading tasks from API...');
            
            const response = await fetch('tables/tasks?limit=1000');
            this.lastApiCall = `GET tables/tasks?limit=1000 -> ${response.status}`;
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ API Response received:', data);
                if (this.debugLog) this.debugLog(`✅ API Response: ${data.total} total tasks found`);
                
                this.tasks = data.data || [];
                console.log(`📊 Loaded ${this.tasks.length} tasks`);
                if (this.debugLog) this.debugLog(`📊 Loaded ${this.tasks.length} tasks into memory`);
            } else if (response.status === 404) {
                // API not available - switch to localStorage
                console.log('🏠 API not available (404) - switching to localStorage mode');
                if (this.debugLog) this.debugLog('🏠 API not available - switching to localStorage mode');
                await this.switchToLocalStorage();
                return;
            } else {
                const errorText = await response.text();
                console.error('❌ API response failed:', response.status, response.statusText);
                if (this.debugLog) this.debugLog(`❌ API failed: ${response.status} ${response.statusText} - ${errorText}`);
                this.tasks = [];
            }
            
        } catch (error) {
            console.error('❌ Error loading tasks:', error);
            if (this.debugLog) this.debugLog(`💥 Load error: ${error.message}`);
            
            // Network error - switch to localStorage
            console.log('🏠 Network error - switching to localStorage mode');
            if (this.debugLog) this.debugLog('🏠 Network error - switching to localStorage mode');
            await this.switchToLocalStorage();
            return;
        }
        
        // Always render what we have (even if empty)
        this.renderTasks();
        this.updateTaskCounts();
        
        console.log(`🎯 Final task count: ${this.tasks.length}`);
        if (this.debugLog) this.debugLog(`🎯 Final result: ${this.tasks.length} tasks rendered`);
    }

    async switchToLocalStorage() {
        this.useLocalStorage = true;
        await this.localStorage.initialize();
        this.tasks = this.localStorage.getTasks();
        
        console.log(`🏠 Switched to localStorage mode with ${this.tasks.length} tasks`);
        if (this.debugLog) this.debugLog(`🏠 Switched to localStorage mode with ${this.tasks.length} tasks`);
        
        this.renderTasks();
        this.updateTaskCounts();
    }

    async createSampleData() {
        try {
            console.log('Creating MGrow launch project tasks...');
            await initializeSampleData();
        } catch (error) {
            console.error('Error creating sample data:', error);
        }
    }

    async forceCreateTasks() {
        console.log('🔧 Force creating MGrow tasks...');
        if (this.debugLog) this.debugLog('🔧 Starting force task creation...');
        this.showLoading();

        // If API isn't working, switch to localStorage
        if (!this.useLocalStorage) {
            try {
                const testResponse = await fetch('tables/tasks?limit=1');
                if (!testResponse.ok) {
                    console.log('🏠 API not available - switching to localStorage for task creation');
                    if (this.debugLog) this.debugLog('🏠 API not available - switching to localStorage');
                    await this.switchToLocalStorage();
                    this.hideLoading();
                    return;
                }
            } catch (error) {
                console.log('🏠 API error - switching to localStorage for task creation');
                if (this.debugLog) this.debugLog('🏠 API error - switching to localStorage');
                await this.switchToLocalStorage();
                this.hideLoading();
                return;
            }
        }
        
        const essentialTasks = [
            {
                title: "Budget Approval & Contract Finalization",
                description: "CRITICAL: Secure budget approval for $297/month Instantly.ai account and finalize developer contract. Nothing else can proceed without this.",
                status: "week1",
                priority: "high",
                assignee: "Barry",
                tags: ["budget", "legal", "blocker"],
                completed: false,
                week: 1,
                order: 1
            },
            {
                title: "Instantly.ai Platform Setup",
                description: "Set up Instantly.ai account, configure email platform with proper authentication, domain and DNS records. Core email infrastructure.",
                status: "week1",
                priority: "high",
                assignee: "Developer",
                tags: ["infrastructure", "email", "setup"],
                completed: false,
                week: 1,
                order: 2
            },
            {
                title: "ServiceMinder API Access & Documentation",
                description: "Ensure API access and documentation availability. Gather API credentials and endpoints. Essential for CRM integration.",
                status: "week1",
                priority: "high",
                assignee: "Barry",
                tags: ["api", "crm", "access"],
                completed: false,
                week: 1,
                order: 3
            },
            {
                title: "ServiceMinder API Integration",
                description: "Build connection between lead generation system and CRM. Test data flow and synchronization with comprehensive error handling.",
                status: "week2",
                priority: "high",
                assignee: "Developer",
                tags: ["api", "integration", "crm"],
                completed: false,
                week: 2,
                order: 1
            },
            {
                title: "Email Campaign Templates & Automation",
                description: "Design email campaign templates, get Barry's approval, and build automated email sequence workflows with personalization.",
                status: "week2",
                priority: "high",
                assignee: "Developer",
                tags: ["email", "templates", "automation"],
                completed: false,
                week: 2,
                order: 2
            },
            {
                title: "🚀 LAUNCH DAY: System Launch Execution",
                description: "9:00 AM - Execute system launch for pilot territory and activate all automated workflows. THE BIG MOMENT!",
                status: "completed",
                priority: "high",
                assignee: "Developer",
                tags: ["launch", "execution", "critical"],
                completed: false,
                week: 5,
                order: 2
            }
        ];

        let successCount = 0;
        
        try {
            for (const task of essentialTasks) {
                try {
                    if (this.debugLog) this.debugLog(`Creating: ${task.title}`);
                    
                    const response = await fetch('tables/tasks', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(task)
                    });
                    
                    if (response.ok) {
                        successCount++;
                        if (this.debugLog) this.debugLog(`✅ Created: ${task.title}`);
                    } else {
                        const errorText = await response.text();
                        if (this.debugLog) this.debugLog(`❌ Failed: ${task.title} - ${response.status} ${errorText}`);
                    }
                } catch (taskError) {
                    if (this.debugLog) this.debugLog(`💥 Error creating ${task.title}: ${taskError.message}`);
                }
            }
            
            if (this.debugLog) this.debugLog(`🎯 Created ${successCount}/${essentialTasks.length} tasks`);
            
            // Reload tasks
            await this.loadTasks();
            this.updateProgress();
            
            if (this.tasks.length > 0) {
                console.log(`✅ Force creation successful! ${this.tasks.length} tasks now available.`);
                if (this.debugLog) this.debugLog(`✅ Success! Board now shows ${this.tasks.length} tasks`);
            } else {
                if (this.debugLog) this.debugLog(`⚠️ Tasks created but not showing - API issue suspected`);
            }
            
        } catch (error) {
            console.error('❌ Force creation failed:', error);
            if (this.debugLog) this.debugLog(`💥 Force creation failed: ${error.message}`);
            alert('Failed to create tasks. Check the Debug panel for details.');
        } finally {
            this.hideLoading();
        }
    }

    renderTasks() {
        // Clear all columns
        const columns = document.querySelectorAll('.column-content');
        columns.forEach(column => {
            column.innerHTML = '';
        });

        if (this.tasks.length === 0) {
            // Show create button when no tasks exist
            document.getElementById('forceCreateTasksBtn').style.display = 'inline-flex';
            
            const backlogColumn = document.querySelector('[data-column="backlog"]');
            if (backlogColumn) {
                const storageMode = this.useLocalStorage ? ' (localStorage mode)' : '';
                backlogColumn.innerHTML = `
                    <div class="no-tasks-message">
                        <div class="no-tasks-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <h3>No MGrow Tasks Found${storageMode}</h3>
                        <p>Click "Load MGrow Tasks" above to load your comprehensive 4-week launch project plan.</p>
                    </div>
                `;
            }
        } else {
            // Hide create button when tasks exist
            document.getElementById('forceCreateTasksBtn').style.display = 'none';
            
            // Show storage mode indicator
            if (this.useLocalStorage) {
                console.log('🏠 Running in localStorage mode - data persists in your browser');
            }
            // Render tasks in their respective columns
            this.tasks.forEach(task => {
                const taskElement = this.createTaskElement(task);
                const column = document.querySelector(`[data-column="${task.status}"]`);
                if (column) {
                    column.appendChild(taskElement);
                }
            });
        }
    }

    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-card ${task.completed ? 'task-completed' : ''}`;
        taskElement.dataset.taskId = task.id;

        const priorityClass = `priority-${task.priority || 'medium'}`;
        const tagsHtml = Array.isArray(task.tags) ? 
            task.tags.map(tag => `<span class="task-tag">${tag}</span>`).join('') : '';

        taskElement.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-title">${this.escapeHtml(task.title || 'Untitled Task')}</div>
            ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
            
            <div class="task-meta">
                <span class="task-priority ${priorityClass}">${task.priority || 'medium'}</span>
                <div class="task-info">
                    ${task.assignee ? `<span class="task-assignee"><i class="fas fa-user"></i> ${this.escapeHtml(task.assignee)}</span>` : ''}

                </div>
            </div>
            
            ${tagsHtml ? `<div class="task-tags">${tagsHtml}</div>` : ''}
        `;

        // Add event listeners
        taskElement.addEventListener('click', (e) => {
            if (!e.target.classList.contains('task-checkbox')) {
                this.showEditTaskModal(task.id);
            }
        });

        const checkbox = taskElement.querySelector('.task-checkbox');
        checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            this.toggleTaskCompletion(task.id, checkbox.checked);
        });

        return taskElement;
    }

    async toggleTaskCompletion(taskId, completed) {
        try {
            const newStatus = completed ? 'completed' : 'backlog';
            await this.updateTaskStatus(taskId, newStatus);
            
            // Update local task
            const taskIndex = this.tasks.findIndex(task => task.id === taskId);
            if (taskIndex !== -1) {
                this.tasks[taskIndex].completed = completed;
                this.tasks[taskIndex].status = newStatus;
            }
            
            // Re-render tasks to move to correct column
            await this.loadTasks();
            this.updateProgress();
            
        } catch (error) {
            console.error('Error toggling task completion:', error);
        }
    }

    updateTaskCounts() {
        const counts = {
            backlog: 0,
            week1: 0,
            week2: 0,
            week3: 0,
            week4: 0,
            completed: 0
        };

        this.tasks.forEach(task => {
            if (counts.hasOwnProperty(task.status)) {
                counts[task.status]++;
            }
        });

        // Update count displays
        Object.keys(counts).forEach(status => {
            const countElement = document.getElementById(`${status}Count`);
            if (countElement) {
                countElement.textContent = counts[status];
            }
        });
    }

    updateProgress() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Update progress display
        document.getElementById('progressPercentage').textContent = `${progressPercentage}%`;
        document.getElementById('progressText').textContent = `${progressPercentage}%`;

        // Update progress ring
        const ring = document.getElementById('progressRing');
        const circumference = 2 * Math.PI * 35;
        const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;
        ring.style.strokeDashoffset = strokeDashoffset;

        // Change ring color based on progress
        if (progressPercentage >= 75) {
            ring.style.stroke = '#4CAF50';
        } else if (progressPercentage >= 50) {
            ring.style.stroke = '#2196F3';
        } else {
            ring.style.stroke = '#4CAF50';
        }
    }

    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;
        const totalHours = 0; // Hours tracking removed

        document.getElementById('totalTasksStat').textContent = totalTasks;
        document.getElementById('completedTasksStat').textContent = completedTasks;
        document.getElementById('pendingTasksStat').textContent = pendingTasks;
        document.getElementById('totalHoursStat').textContent = `N/A`;

        // Update chart
        this.updateProgressChart();
    }

    updateProgressChart() {
        const ctx = document.getElementById('progressChart');
        
        if (this.progressChart) {
            this.progressChart.destroy();
        }

        const weeklyData = {
            backlog: this.tasks.filter(t => t.status === 'backlog').length,
            week1: this.tasks.filter(t => t.status === 'week1').length,
            week2: this.tasks.filter(t => t.status === 'week2').length,
            week3: this.tasks.filter(t => t.status === 'week3').length,
            week4: this.tasks.filter(t => t.status === 'week4').length,
            completed: this.tasks.filter(t => t.status === 'completed').length,
        };

        this.progressChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Backlog', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Completed'],
                datasets: [{
                    label: 'Number of Tasks',
                    data: Object.values(weeklyData),
                    backgroundColor: [
                        '#a0aec0',
                        '#4CAF50',
                        '#66BB6A',
                        '#81C784',
                        '#A5D6A7',
                        '#2196F3'
                    ],
                    borderColor: [
                        '#718096',
                        '#45a049',
                        '#5cb85c',
                        '#6fa86f',
                        '#8bc34a',
                        '#1976D2'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Task Distribution by Week'
                    }
                }
            }
        });
    }

    getWeekFromStatus(status) {
        const weekMap = {
            'backlog': 0,
            'week1': 1,
            'week2': 2,
            'week3': 3,
            'week4': 4,
            'completed': 5
        };
        return weekMap[status] || 0;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    showLoading() {
        document.getElementById('loading').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loading').classList.remove('active');
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Starting MGrow Launch Tracker...');
    window.mgrowTracker = new window.MGrowTracker();
    
    // Aggressively ensure sample data exists - try multiple times if needed
    setTimeout(async () => {
        await ensureSampleDataExists();
    }, 500);
    
    // Backup check after 3 seconds
    setTimeout(async () => {
        if (!window.mgrowTracker || window.mgrowTracker.tasks.length === 0) {
            console.log('🔄 Backup check: Still no tasks found, forcing creation...');
            await ensureSampleDataExists();
        }
    }, 3000);
});

async function ensureSampleDataExists() {
    console.log('🔍 Checking if MGrow launch tasks exist...');
    
    try {
        // Always try to create sample data to ensure it exists
        console.log('🏗️  Creating MGrow launch project tasks...');
        await initializeSampleData();
        
        // Force reload after creation
        if (window.mgrowTracker) {
            console.log('🔄 Reloading tasks after creation...');
            await window.mgrowTracker.loadTasks();
            window.mgrowTracker.updateProgress();
            
            if (window.mgrowTracker.tasks.length > 0) {
                console.log(`✅ Success! ${window.mgrowTracker.tasks.length} MGrow tasks now loaded`);
            } else {
                console.log('⚠️  Tasks created but not loading - checking API...');
                
                // Direct API check
                const testResponse = await fetch('tables/tasks?limit=5');
                if (testResponse.ok) {
                    const testData = await testResponse.json();
                    console.log('📊 Direct API test:', testData);
                } else {
                    console.error('❌ API test failed:', testResponse.status);
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Error ensuring sample data exists:', error);
        
        // Try a simpler approach - create just a few essential tasks
        console.log('🔧 Trying fallback task creation...');
        await createEssentialTasks();
    }
}

async function createEssentialTasks() {
    console.log('Creating essential tasks as fallback...');
    
    const essentialTasks = [
        {
            title: "Budget Approval & Contract Finalization",
            description: "CRITICAL: Secure budget approval and finalize developer contract",
            status: "week1",
            priority: "high",
            assignee: "Barry",
            tags: ["budget", "critical"],
            completed: false,
            week: 1,
            order: 1
        },
        {
            title: "Instantly.ai Platform Setup",
            description: "Set up core email infrastructure",
            status: "week1", 
            priority: "high",
            assignee: "Developer",
            tags: ["infrastructure", "setup"],
            completed: false,
            week: 1,
            order: 2
        },
        {
            title: "🚀 LAUNCH DAY: System Launch Execution",
            description: "9:00 AM - Execute system launch for pilot territory",
            status: "completed",
            priority: "high",
            assignee: "Developer", 
            tags: ["launch", "critical"],
            completed: false,
            week: 5,
            order: 1
        }
    ];
    
    for (const task of essentialTasks) {
        try {
            const response = await fetch('tables/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task)
            });
            
            if (response.ok) {
                console.log(`✅ Created essential task: ${task.title}`);
            } else {
                console.error(`❌ Failed to create essential task: ${task.title}`);
            }
        } catch (error) {
            console.error('Error creating essential task:', error);
        }
    }
}

async function initializeSampleData() {
    console.log('🚀 Starting MGrow Launch Project initialization...');
    
    // Don't clear existing tasks - just add if missing
    console.log('Creating MGrow launch tasks...');
    
    const sampleTasks = [
        {
            title: "Market Research & Analysis",
            description: "Conduct comprehensive market research to identify untapped opportunities and customer segments",
            status: "backlog",
            priority: "high",
            assignee: "Research Team",
            // estimated_hours: 16,
            tags: ["research", "analysis", "market"],
            completed: false,
            week: 0,
            order: 0
        },
        {
            title: "Customer Persona Development",
            description: "Create detailed customer personas based on market research findings",
            status: "week1",
            priority: "high",
            assignee: "Marketing Team",
            // estimated_hours: 8,
            tags: ["personas", "customer", "marketing"],
            completed: false,
            week: 1,
            order: 0
        },
        {
            title: "Competitive Analysis Report",
            description: "Analyze key competitors and their strategies to identify market gaps",
            status: "week1",
            priority: "medium",
            assignee: "Strategy Team",
            // estimated_hours: 12,
            tags: ["competition", "analysis", "strategy"],
            completed: false,
            week: 1,
            order: 1
        },
        {
            title: "Product MVP Development",
            description: "Build minimum viable product focusing on core features for launch",
            status: "week2",
            priority: "critical",
            assignee: "Dev Team",
            // estimated_hours: 40,
            tags: ["development", "mvp", "product"],
            completed: false,
            week: 2,
            order: 0
        },
        {
            title: "User Experience Design",
            description: "Design intuitive user interface and optimize user experience flows",
            status: "week2",
            priority: "high",
            assignee: "UX Designer",
            // estimated_hours: 24,
            tags: ["design", "ux", "interface"],
            completed: false,
            week: 2,
            order: 1
        },
        {
            title: "Brand Identity Creation",
            description: "Develop brand guidelines, logo, and visual identity system",
            status: "week3",
            priority: "medium",
            assignee: "Brand Designer",
            // estimated_hours: 20,
            tags: ["branding", "design", "identity"],
            completed: false,
            week: 3,
            order: 0
        },
        {
            title: "Marketing Campaign Strategy",
            description: "Plan and prepare comprehensive marketing campaign for launch",
            status: "week3",
            priority: "high",
            assignee: "Marketing Team",
            // estimated_hours: 16,
            tags: ["marketing", "campaign", "strategy"],
            completed: false,
            week: 3,
            order: 1
        },
        {
            title: "Quality Assurance Testing",
            description: "Comprehensive testing of all features and user flows",
            status: "week4",
            priority: "critical",
            assignee: "QA Team",
            // estimated_hours: 32,
            tags: ["testing", "qa", "quality"],
            completed: false,
            week: 4,
            order: 0
        },
        {
            title: "Launch Preparation & Deployment",
            description: "Final preparations for go-live including deployment and monitoring setup",
            status: "week4",
            priority: "critical",
            assignee: "DevOps Team",
            // estimated_hours: 16,
            tags: ["deployment", "launch", "monitoring"],
            completed: false,
            week: 4,
            order: 1
        },
        {
            title: "Initial Project Setup",
            description: "Set up project structure and initial planning documents",
            status: "completed",
            priority: "medium",
            assignee: "Project Manager",
            // estimated_hours: 4,
            tags: ["setup", "planning", "management"],
            completed: true,
            week: 5,
            order: 0
        }
    ];

    let createdCount = 0;
    
    for (const task of sampleTasks) {
        try {
            console.log(`Creating task: ${task.title}`);
            const response = await fetch('tables/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(task)
            });
            
            if (response.ok) {
                createdCount++;
                console.log(`✅ Created task: ${task.title}`);
            } else {
                console.error(`❌ Failed to create task: ${task.title}`, response.status);
            }
        } catch (error) {
            console.error(`❌ Error creating sample task "${task.title}":`, error);
        }
    }
    
    console.log(`Sample data initialization complete. Created ${createdCount}/${sampleTasks.length} tasks.`);
    
    // Reload tasks after adding sample data
    if (window.mgrowTracker) {
        console.log('Reloading tasks after sample data creation...');
        await window.mgrowTracker.loadTasks();
        window.mgrowTracker.updateProgress();
    }
}