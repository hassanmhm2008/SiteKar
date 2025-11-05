// Mock API برای سیتکار - شبیه‌سازی Backend
// این فایل جایگزین api.js اصلی می‌شود و از LocalStorage استفاده می‌کند

// تنظیمات Mock API
const MOCK_API_ENABLED = true;
const API_BASE_URL = MOCK_API_ENABLED ? 'mock://localhost' : 'http://localhost:3000/api';

// Mock Database در LocalStorage
class MockDatabase {
    constructor() {
        this.initializeData();
    }

    initializeData() {
        // اگر داده‌ها وجود ندارند، آنها را ایجاد کن
        if (!localStorage.getItem('mock_users')) {
            this.seedData();
        }
    }

    seedData() {
        // کاربران پیش‌فرض
        const users = [
            {
                id: 1,
                username: 'admin',
                password: 'admin123',
                name: 'مدیر سیستم',
                role: 'admin',
                department_id: 1,
                is_active: 1,
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                username: 'manager',
                password: 'manager123',
                name: 'مدیر عملیات',
                role: 'manager',
                department_id: 2,
                is_active: 1,
                created_at: new Date().toISOString()
            },
            {
                id: 3,
                username: 'user1',
                password: 'user123',
                name: 'کاربر عادی',
                role: 'user',
                department_id: 3,
                is_active: 1,
                created_at: new Date().toISOString()
            }
        ];

        // دپارتمان‌ها
        const departments = [
            { id: 1, name: 'مدیریت', description: 'دپارتمان مدیریت', is_active: 1 },
            { id: 2, name: 'فروش', description: 'دپارتمان فروش', is_active: 1 },
            { id: 3, name: 'انبار', description: 'دپارتمان انبار', is_active: 1 },
            { id: 4, name: 'حسابداری', description: 'دپارتمان حسابداری', is_active: 1 }
        ];

        // محصولات
        const products = [
            { id: 1, name: 'محصول A', category: 'دسته 1', price: 100000, stock: 50, is_active: 1 },
            { id: 2, name: 'محصول B', category: 'دسته 2', price: 200000, stock: 30, is_active: 1 },
            { id: 3, name: 'محصول C', category: 'دسته 1', price: 150000, stock: 25, is_active: 1 }
        ];

        // کارها
        const tasks = [
            {
                id: 1,
                title: 'بررسی گزارش فروش',
                description: 'بررسی گزارش فروش ماهیانه',
                assigned_to: 2,
                created_by: 1,
                status: 'pending',
                priority: 'high',
                due_date: '2025-11-10',
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                title: 'موجودی انبار',
                description: 'بررسی موجودی کالاهای انبار',
                assigned_to: 3,
                created_by: 1,
                status: 'in_progress',
                priority: 'medium',
                due_date: '2025-11-08',
                created_at: new Date().toISOString()
            }
        ];

        // درخواست‌ها
        const requests = [
            {
                id: 1,
                title: 'درخواست خرید تجهیزات',
                description: 'خرید تجهیزات دفتری',
                requester_id: 3,
                department_id: 3,
                status: 'pending',
                priority: 'medium',
                request_type: 'purchase',
                created_at: new Date().toISOString()
            }
        ];

        // مجوزها
        const permissions = [
            { id: 1, name: 'users_view', description: 'مشاهده کاربران' },
            { id: 2, name: 'users_edit', description: 'ویرایش کاربران' },
            { id: 3, name: 'tasks_view', description: 'مشاهده کارها' },
            { id: 4, name: 'tasks_edit', description: 'ویرایش کارها' },
            { id: 5, name: 'reports_view', description: 'مشاهده گزارشات' }
        ];

        // ذخیره در LocalStorage
        localStorage.setItem('mock_users', JSON.stringify(users));
        localStorage.setItem('mock_departments', JSON.stringify(departments));
        localStorage.setItem('mock_products', JSON.stringify(products));
        localStorage.setItem('mock_tasks', JSON.stringify(tasks));
        localStorage.setItem('mock_requests', JSON.stringify(requests));
        localStorage.setItem('mock_permissions', JSON.stringify(permissions));
        
        console.log('🎯 Mock Database initialized with sample data');
    }

    getUsers() {
        return JSON.parse(localStorage.getItem('mock_users') || '[]');
    }

    getDepartments() {
        return JSON.parse(localStorage.getItem('mock_departments') || '[]');
    }

    getProducts() {
        return JSON.parse(localStorage.getItem('mock_products') || '[]');
    }

    getTasks() {
        return JSON.parse(localStorage.getItem('mock_tasks') || '[]');
    }

    getRequests() {
        return JSON.parse(localStorage.getItem('mock_requests') || '[]');
    }

    getPermissions() {
        return JSON.parse(localStorage.getItem('mock_permissions') || '[]');
    }

    saveUsers(users) {
        localStorage.setItem('mock_users', JSON.stringify(users));
    }

    saveTasks(tasks) {
        localStorage.setItem('mock_tasks', JSON.stringify(tasks));
    }

    saveRequests(requests) {
        localStorage.setItem('mock_requests', JSON.stringify(requests));
    }
}

// نمونه Mock Database
const mockDB = new MockDatabase();

// Helper function برای شبیه‌سازی تاخیر شبکه
function simulateNetworkDelay(min = 100, max = 500) {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
}

// Mock API Request Handler
async function mockApiRequest(endpoint, method = 'GET', data = null) {
    await simulateNetworkDelay();
    
    console.log(`🔄 Mock API: ${method} ${endpoint}`, data);

    // Authentication endpoints
    if (endpoint === '/auth/login' && method === 'POST') {
        const users = mockDB.getUsers();
        const user = users.find(u => u.username === data.username && u.password === data.password);
        
        if (user) {
            // حذف رمز عبور از response
            const { password, ...userWithoutPassword } = user;
            return {
                success: true,
                message: 'ورود موفقیت‌آمیز',
                user: userWithoutPassword,
                token: 'mock_token_' + Date.now()
            };
        } else {
            throw new Error('نام کاربری یا رمز عبور اشتباه است');
        }
    }

    if (endpoint.startsWith('/auth/me/')) {
        const userId = parseInt(endpoint.split('/').pop());
        const users = mockDB.getUsers();
        const user = users.find(u => u.id === userId);
        
        if (user) {
            const { password, ...userWithoutPassword } = user;
            return { success: true, user: userWithoutPassword };
        } else {
            throw new Error('کاربر یافت نشد');
        }
    }

    // Users endpoints
    if (endpoint === '/users' && method === 'GET') {
        const users = mockDB.getUsers();
        return {
            success: true,
            users: users.map(({ password, ...user }) => user)
        };
    }

    if (endpoint.startsWith('/users/department/')) {
        const departmentId = parseInt(endpoint.split('/').pop());
        const users = mockDB.getUsers();
        const departmentUsers = users.filter(u => u.department_id === departmentId);
        return {
            success: true,
            users: departmentUsers.map(({ password, ...user }) => user)
        };
    }

    // Departments endpoints
    if (endpoint === '/departments' && method === 'GET') {
        return {
            success: true,
            departments: mockDB.getDepartments()
        };
    }

    // Products endpoints
    if (endpoint === '/products' && method === 'GET') {
        return {
            success: true,
            products: mockDB.getProducts()
        };
    }

    // Tasks endpoints
    if (endpoint === '/tasks' && method === 'GET') {
        return {
            success: true,
            tasks: mockDB.getTasks()
        };
    }

    if (endpoint === '/tasks' && method === 'POST') {
        const tasks = mockDB.getTasks();
        const newTask = {
            id: Math.max(...tasks.map(t => t.id), 0) + 1,
            ...data,
            created_at: new Date().toISOString()
        };
        tasks.push(newTask);
        mockDB.saveTasks(tasks);
        return { success: true, task: newTask };
    }

    // Requests endpoints
    if (endpoint === '/requests' && method === 'GET') {
        return {
            success: true,
            requests: mockDB.getRequests()
        };
    }

    if (endpoint === '/requests' && method === 'POST') {
        const requests = mockDB.getRequests();
        const newRequest = {
            id: Math.max(...requests.map(r => r.id), 0) + 1,
            ...data,
            created_at: new Date().toISOString()
        };
        requests.push(newRequest);
        mockDB.saveRequests(requests);
        return { success: true, request: newRequest };
    }

    // Permissions endpoints
    if (endpoint === '/permissions' && method === 'GET') {
        return {
            success: true,
            permissions: mockDB.getPermissions()
        };
    }

    // Reports endpoints
    if (endpoint === '/reports/dashboard' && method === 'GET') {
        const users = mockDB.getUsers();
        const tasks = mockDB.getTasks();
        const requests = mockDB.getRequests();
        
        return {
            success: true,
            stats: {
                total_users: users.length,
                active_users: users.filter(u => u.is_active).length,
                total_tasks: tasks.length,
                pending_tasks: tasks.filter(t => t.status === 'pending').length,
                completed_tasks: tasks.filter(t => t.status === 'completed').length,
                total_requests: requests.length,
                pending_requests: requests.filter(r => r.status === 'pending').length
            }
        };
    }

    // اگر endpoint یافت نشد
    throw new Error(`Mock API: Endpoint ${endpoint} not implemented`);
}

// اصلی API Request Handler
async function apiRequest(endpoint, method = 'GET', data = null) {
    try {
        if (MOCK_API_ENABLED) {
            return await mockApiRequest(endpoint, method, data);
        } else {
            // Real API request (همان کد قبلی)
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                }
            };

            if (data && (method === 'POST' || method === 'PUT')) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'خطا در ارتباط با سرور');
            }

            return result;
        }
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// API Functions (همان interface قبلی)

// Authentication
const authAPI = {
    login: (data) => 
        apiRequest('/auth/login', 'POST', data),
    
    getCurrentUser: (userId) => 
        apiRequest(`/auth/me/${userId}`)
};

// Users
const usersAPI = {
    getAll: () => 
        apiRequest('/users'),
    
    getByDepartment: (departmentId) => 
        apiRequest(`/users/department/${departmentId}`),
    
    create: (data) => 
        apiRequest('/users', 'POST', data),
    
    update: (id, data) => 
        apiRequest(`/users/${id}`, 'PUT', data),
    
    delete: (id) => 
        apiRequest(`/users/${id}`, 'DELETE')
};

// Departments
const departmentsAPI = {
    getAll: () => 
        apiRequest('/departments'),
    
    create: (data) => 
        apiRequest('/departments', 'POST', data),
    
    update: (id, data) => 
        apiRequest(`/departments/${id}`, 'PUT', data),
    
    delete: (id) => 
        apiRequest(`/departments/${id}`, 'DELETE')
};

// Products
const productsAPI = {
    getAll: () => 
        apiRequest('/products'),
    
    create: (data) => 
        apiRequest('/products', 'POST', data),
    
    update: (id, data) => 
        apiRequest(`/products/${id}`, 'PUT', data),
    
    delete: (id) => 
        apiRequest(`/products/${id}`, 'DELETE')
};

// Tasks
const tasksAPI = {
    getAll: () => 
        apiRequest('/tasks'),
    
    getByUser: (userId) => 
        apiRequest(`/tasks/user/${userId}`),
    
    create: (data) => 
        apiRequest('/tasks', 'POST', data),
    
    update: (id, data) => 
        apiRequest(`/tasks/${id}`, 'PUT', data),
    
    delete: (id) => 
        apiRequest(`/tasks/${id}`, 'DELETE')
};

// Requests
const requestsAPI = {
    getAll: () => 
        apiRequest('/requests'),
    
    getByDepartment: (departmentId) => 
        apiRequest(`/requests/department/${departmentId}`),
    
    create: (data) => 
        apiRequest('/requests', 'POST', data),
    
    update: (id, data) => 
        apiRequest(`/requests/${id}`, 'PUT', data),
    
    delete: (id) => 
        apiRequest(`/requests/${id}`, 'DELETE')
};

// Permissions
const permissionsAPI = {
    getAll: () => 
        apiRequest('/permissions'),
    
    getUserPermissions: (userId) => 
        apiRequest(`/permissions/user/${userId}`)
};

// Reports
const reportsAPI = {
    getDashboardStats: () => 
        apiRequest('/reports/dashboard')
};

// وضعیت Mock API را نمایش بده
if (MOCK_API_ENABLED) {
    console.log('🎭 Mock API is ENABLED - Using LocalStorage as database');
    console.log('📊 Available test accounts:');
    console.log('  👨‍💼 Admin: admin / admin123');
    console.log('  👨‍💻 Manager: manager / manager123');  
    console.log('  👤 User: user1 / user123');
} else {
    console.log('🌐 Real API is ENABLED - Using backend server');
}