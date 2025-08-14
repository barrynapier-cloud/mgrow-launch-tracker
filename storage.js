/**
 * Local Storage Fallback for Task Management
 * Used when the tables API is not available (404 errors)
 */

class LocalStorageManager {
    constructor() {
        this.storageKey = 'mgrow_tasks';
        this.initialized = false;
    }

    // Initialize with sample data if no tasks exist
    async initialize() {
        if (this.initialized) return;
        
        const tasks = this.getTasks();
        if (tasks.length === 0) {
            console.log('🏠 No tasks in localStorage, creating MGrow sample data...');
            await this.createSampleTasks();
        }
        
        this.initialized = true;
        console.log(`🏠 LocalStorage initialized with ${this.getTasks().length} tasks`);
    }

    // Get all tasks from localStorage
    getTasks() {
        try {
            const tasksJson = localStorage.getItem(this.storageKey);
            return tasksJson ? JSON.parse(tasksJson) : [];
        } catch (error) {
            console.error('Error reading tasks from localStorage:', error);
            return [];
        }
    }

    // Save tasks to localStorage
    saveTasks(tasks) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(tasks));
            return true;
        } catch (error) {
            console.error('Error saving tasks to localStorage:', error);
            return false;
        }
    }

    // Add a single task
    async addTask(task) {
        const tasks = this.getTasks();
        
        // Generate ID if not provided
        if (!task.id) {
            task.id = 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        
        // Add timestamps
        task.created_at = Date.now();
        task.updated_at = Date.now();
        
        tasks.push(task);
        this.saveTasks(tasks);
        
        console.log(`🏠 Added task: ${task.title}`);
        return task;
    }

    // Update a task
    async updateTask(taskId, updates) {
        const tasks = this.getTasks();
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex === -1) {
            throw new Error(`Task not found: ${taskId}`);
        }
        
        // Update the task
        tasks[taskIndex] = { ...tasks[taskIndex], ...updates, updated_at: Date.now() };
        this.saveTasks(tasks);
        
        console.log(`🏠 Updated task: ${tasks[taskIndex].title}`);
        return tasks[taskIndex];
    }

    // Delete a task
    async deleteTask(taskId) {
        const tasks = this.getTasks();
        const filteredTasks = tasks.filter(t => t.id !== taskId);
        
        if (filteredTasks.length === tasks.length) {
            throw new Error(`Task not found: ${taskId}`);
        }
        
        this.saveTasks(filteredTasks);
        console.log(`🏠 Deleted task: ${taskId}`);
        return true;
    }

    // Clear all tasks
    async clearAllTasks() {
        localStorage.removeItem(this.storageKey);
        console.log('🏠 All tasks cleared from localStorage');
        return true;
    }

    // Create sample MGrow tasks
    async createSampleTasks() {
        const sampleTasks = [
            {
                title: "Budget Approval & Contract Finalization",
                description: "CRITICAL: Secure budget approval for $297/month Instantly.ai account and finalize developer contract. Nothing else can proceed without this.",
                status: "week1",
                priority: "high",
                assignee: "Barry",
                tags: ["budget", "legal", "blocker"],
                completed: false,
                week: 1,
                order: 1,
                due_date: "2024-08-15T17:00:00Z"
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
                order: 2,
                due_date: "2024-08-16T17:00:00Z"
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
                order: 3,
                due_date: "2024-08-15T17:00:00Z"
            },
            {
                title: "N8N Workflow Platform Setup",
                description: "Configure N8N automation platform and create initial workflow structure. Foundation for all automation processes.",
                status: "week1",
                priority: "high",
                assignee: "Developer",
                tags: ["automation", "n8n", "infrastructure"],
                completed: false,
                week: 1,
                order: 4,
                due_date: "2024-08-16T17:00:00Z"
            },
            {
                title: "Pilot Territory Selection",
                description: "Choose 1-2 franchise territories for initial deployment and identify target business verticals in selected areas.",
                status: "week1",
                priority: "high",
                assignee: "Barry",
                tags: ["strategy", "territories", "targeting"],
                completed: false,
                week: 1,
                order: 5,
                due_date: "2024-08-16T17:00:00Z"
            },
            {
                title: "Basic Web Scraping Workflow (MVP)",
                description: "Create N8N workflows for property management company data collection. Test basic scraping functionality and implement data validation.",
                status: "week1",
                priority: "medium",
                assignee: "Developer",
                tags: ["scraping", "data", "validation"],
                completed: false,
                week: 1,
                order: 6,
                due_date: "2024-08-16T17:00:00Z"
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
                order: 1,
                due_date: "2024-08-19T17:00:00Z"
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
                order: 2,
                due_date: "2024-08-20T17:00:00Z"
            },
            {
                title: "Advanced Web Scraping & Data Collection",
                description: "Expand scraping to cover all target business verticals, add support for multiple data sources, and implement contact enrichment.",
                status: "week2",
                priority: "high",
                assignee: "Developer",
                tags: ["scraping", "data", "enrichment"],
                completed: false,
                week: 2,
                order: 3,
                due_date: "2024-08-21T17:00:00Z"
            },
            {
                title: "Lead Scoring & Qualification System",
                description: "Create automated lead qualification system with scoring criteria and thresholds. Implement duplicate detection and data validation.",
                status: "week2",
                priority: "high",
                assignee: "Developer",
                tags: ["scoring", "qualification", "automation"],
                completed: false,
                week: 2,
                order: 4,
                due_date: "2024-08-22T17:00:00Z"
            },
            {
                title: "Response Tracking & Management System",
                description: "Build system to track and categorize email responses with automated response handling and basic reporting dashboard.",
                status: "week2",
                priority: "medium",
                assignee: "Developer",
                tags: ["tracking", "responses", "reporting"],
                completed: false,
                week: 2,
                order: 5,
                due_date: "2024-08-23T17:00:00Z"
            },
            {
                title: "End-to-End System Testing (Phase 1)",
                description: "Complete system validation and bug fixes. Test full workflow from scraping to CRM integration with basic performance testing.",
                status: "week2",
                priority: "high",
                assignee: "Developer",
                tags: ["testing", "validation", "workflow"],
                completed: false,
                week: 2,
                order: 6,
                due_date: "2024-08-23T17:00:00Z"
            },
            {
                title: "Multi-Step Email Drip Campaigns",
                description: "Create sophisticated email sequence workflows with conditional logic and branching based on prospect behavior and responses.",
                status: "week3",
                priority: "high",
                assignee: "Developer",
                tags: ["email", "automation", "sequences"],
                completed: false,
                week: 3,
                order: 1,
                due_date: "2024-08-26T17:00:00Z"
            },
            {
                title: "Performance Optimization & Security",
                description: "Optimize system performance, implement caching, add security measures, access controls, and data encryption for production readiness.",
                status: "week3",
                priority: "high",
                assignee: "Developer",
                tags: ["performance", "security", "optimization"],
                completed: false,
                week: 3,
                order: 2,
                due_date: "2024-08-27T17:00:00Z"
            },
            {
                title: "Advanced Reporting Dashboard",
                description: "Create comprehensive performance monitoring dashboard with key metrics, KPIs, and real-time analytics for business intelligence.",
                status: "week3",
                priority: "medium",
                assignee: "Developer",
                tags: ["reporting", "dashboard", "analytics"],
                completed: false,
                week: 3,
                order: 3,
                due_date: "2024-08-28T17:00:00Z"
            },
            {
                title: "Data Quality & Deliverability Testing",
                description: "Verify 90%+ data accuracy and 95%+ email deliverability. Test spam filters, inbox placement, and contact validation systems.",
                status: "week3",
                priority: "high",
                assignee: "Developer",
                tags: ["quality", "deliverability", "validation"],
                completed: false,
                week: 3,
                order: 4,
                due_date: "2024-08-29T17:00:00Z"
            },
            {
                title: "Integration & Load Testing",
                description: "Test all system integrations under expected load. Validate system can handle 1,000+ contacts per month with <5 second response times.",
                status: "week3",
                priority: "high",
                assignee: "Developer",
                tags: ["testing", "integration", "performance"],
                completed: false,
                week: 3,
                order: 5,
                due_date: "2024-08-30T17:00:00Z"
            },
            {
                title: "User Documentation & Training Materials",
                description: "Complete all user guides, troubleshooting documentation, and create training materials for franchise owners.",
                status: "week3",
                priority: "medium",
                assignee: "Developer",
                tags: ["documentation", "training", "guides"],
                completed: false,
                week: 3,
                order: 6,
                due_date: "2024-08-30T17:00:00Z"
            },
            {
                title: "User Acceptance Testing & Training",
                description: "Coordinate UAT with pilot franchise owner, gather feedback, and provide comprehensive system training with support materials.",
                status: "week4",
                priority: "high",
                assignee: "Barry",
                tags: ["uat", "training", "feedback"],
                completed: false,
                week: 4,
                order: 1,
                due_date: "2024-09-02T17:00:00Z"
            },
            {
                title: "Production Environment Deployment",
                description: "Deploy all components to production servers, set up monitoring dashboards, and configure performance tracking systems.",
                status: "week4",
                priority: "high",
                assignee: "Developer",
                tags: ["deployment", "production", "monitoring"],
                completed: false,
                week: 4,
                order: 2,
                due_date: "2024-09-03T17:00:00Z"
            },
            {
                title: "Final System Validation & Testing",
                description: "Complete comprehensive pre-launch system validation, run full end-to-end testing, and verify all success criteria are met.",
                status: "week4",
                priority: "high",
                assignee: "Developer",
                tags: ["validation", "testing", "criteria"],
                completed: false,
                week: 4,
                order: 3,
                due_date: "2024-09-05T17:00:00Z"
            },
            {
                title: "Backup & Recovery Procedures",
                description: "Test backup and rollback procedures, ensure data recovery capabilities, and verify emergency response protocols.",
                status: "week4",
                priority: "medium",
                assignee: "Developer",
                tags: ["backup", "recovery", "emergency"],
                completed: false,
                week: 4,
                order: 4,
                due_date: "2024-09-04T17:00:00Z"
            },
            {
                title: "Launch Day Procedures Rehearsal",
                description: "Practice launch day workflows, test emergency procedures, and ensure all team members understand their roles and responsibilities.",
                status: "week4",
                priority: "high",
                assignee: "Barry & Developer",
                tags: ["rehearsal", "procedures", "preparation"],
                completed: false,
                week: 4,
                order: 5,
                due_date: "2024-09-06T17:00:00Z"
            },
            {
                title: "Go/No-Go Decision Meeting",
                description: "Final decision meeting on launch readiness. Review all completion criteria, assess risks, and make the official launch decision.",
                status: "week4",
                priority: "high",
                assignee: "Barry",
                tags: ["decision", "criteria", "launch"],
                completed: false,
                week: 4,
                order: 6,
                due_date: "2024-09-06T17:00:00Z"
            },
            {
                title: "🚀 LAUNCH DAY: Final System Checks",
                description: "8:00 AM - Complete final pre-launch validation and verify all systems are operational. Last chance to catch any issues.",
                status: "completed",
                priority: "high",
                assignee: "Developer",
                tags: ["launch", "validation", "critical"],
                completed: false,
                week: 5,
                order: 1,
                due_date: "2024-09-10T08:00:00Z"
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
                order: 2,
                due_date: "2024-09-10T09:00:00Z"
            },
            {
                title: "🚀 LAUNCH DAY: Real-Time Monitoring",
                description: "11:00 AM - Monitor system performance during launch day and address any issues immediately. All hands on deck.",
                status: "completed",
                priority: "high",
                assignee: "Developer",
                tags: ["launch", "monitoring", "support"],
                completed: false,
                week: 5,
                order: 3,
                due_date: "2024-09-10T11:00:00Z"
            },
            {
                title: "🚀 LAUNCH DAY: Performance Review",
                description: "3:00 PM - Review initial performance metrics and assess system stability and functionality with stakeholders.",
                status: "completed",
                priority: "high",
                assignee: "Barry & Developer",
                tags: ["launch", "review", "metrics"],
                completed: false,
                week: 5,
                order: 4,
                due_date: "2024-09-10T15:00:00Z"
            },
            {
                title: "🚀 LAUNCH DAY: Success Confirmation",
                description: "5:00 PM - Confirm successful launch, document lessons learned, and plan next steps for scaling the system.",
                status: "completed",
                priority: "high",
                assignee: "Barry",
                tags: ["launch", "success", "planning"],
                completed: false,
                week: 5,
                order: 5,
                due_date: "2024-09-10T17:00:00Z"
            },
            {
                title: "Risk Mitigation & Backup Planning",
                description: "Identify backup developer, research alternative email platforms, document manual processes, and prepare emergency contacts.",
                status: "backlog",
                priority: "medium",
                assignee: "Barry",
                tags: ["risk", "backup", "planning"],
                completed: false,
                week: 0,
                order: 1,
                due_date: "2024-08-20T17:00:00Z"
            },
            {
                title: "Daily Standup Meeting Setup",
                description: "Establish daily 9:00 AM standup meetings (15 min) to track progress, identify blockers, and coordinate team efforts.",
                status: "backlog",
                priority: "low",
                assignee: "Barry",
                tags: ["meetings", "communication", "process"],
                completed: false,
                week: 0,
                order: 2,
                due_date: "2024-08-15T17:00:00Z"
            },
            {
                title: "Success Criteria Validation Framework",
                description: "Create framework to validate: 1000+ contacts/month, 95%+ deliverability, 90%+ data accuracy, 99%+ uptime, <5s response times.",
                status: "backlog",
                priority: "medium",
                assignee: "Developer",
                tags: ["criteria", "validation", "metrics"],
                completed: false,
                week: 0,
                order: 3,
                due_date: "2024-08-25T17:00:00Z"
            }
        ];

        // Add all sample tasks
        for (const task of sampleTasks) {
            await this.addTask(task);
        }

        console.log(`🏠 Created ${sampleTasks.length} MGrow launch tasks in localStorage`);
        return sampleTasks;
    }
}

// Export for use in main.js
window.LocalStorageManager = LocalStorageManager;