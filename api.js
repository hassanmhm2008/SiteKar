// تنظیمات API
const API_BASE_URL = 'http://localhost:3000/api';

// Helper function برای ارسال درخواست به API
async function apiRequest(endpoint, method = 'GET', data = null) {
    try {
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
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// API Functions

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
    
    create: (userData) => 
        apiRequest('/users', 'POST', userData),
    
    update: (userId, userData) => 
        apiRequest(`/users/${userId}`, 'PUT', userData),
    
    delete: (userId) => 
        apiRequest(`/users/${userId}`, 'DELETE')
};

// Departments
const departmentsAPI = {
    getAll: () => 
        apiRequest('/departments'),
    
    create: (departmentData) => 
        apiRequest('/departments', 'POST', departmentData),
    
    update: (departmentId, departmentData) => 
        apiRequest(`/departments/${departmentId}`, 'PUT', departmentData),
    
    delete: (departmentId) => 
        apiRequest(`/departments/${departmentId}`, 'DELETE')
};

// Tasks
const tasksAPI = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams(filters);
        return apiRequest(`/tasks?${params.toString()}`);
    },
    
    getPending: (userId) => 
        apiRequest(`/tasks/pending/${userId}`),
    
    create: (taskData) => 
        apiRequest('/tasks', 'POST', taskData),
    
    update: (taskId, taskData) => 
        apiRequest(`/tasks/${taskId}`, 'PUT', taskData),
    
    updateStatus: (taskId, status) => 
        apiRequest(`/tasks/${taskId}/status`, 'PUT', { status }),
    
    approve: (taskId, approvedBy) => 
        apiRequest(`/tasks/${taskId}/approve`, 'POST', { approved_by: approvedBy }),
    
    reject: (taskId, approvedBy, reason) => 
        apiRequest(`/tasks/${taskId}/reject`, 'POST', { approved_by: approvedBy, rejection_reason: reason }),
    
    delete: (taskId) => 
        apiRequest(`/tasks/${taskId}`, 'DELETE')
};

// Requests
const requestsAPI = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams(filters);
        return apiRequest(`/requests?${params.toString()}`);
    },
    
    getById: (requestId) => 
        apiRequest(`/requests/${requestId}`),
    
    create: (requestData) => 
        apiRequest('/requests', 'POST', requestData),
    
    updateStatus: (requestId, status, approvedBy, rejectionReason = null) => 
        apiRequest(`/requests/${requestId}/status`, 'PUT', { 
            status, 
            approved_by: approvedBy, 
            rejection_reason: rejectionReason 
        }),
    
    delete: (requestId) => 
        apiRequest(`/requests/${requestId}`, 'DELETE')
};

// Products
const productsAPI = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams(filters);
        return apiRequest(`/products?${params.toString()}`);
    },
    
    getCategories: () => 
        apiRequest('/products/categories'),
    
    create: (productData) => 
        apiRequest('/products', 'POST', productData),
    
    update: (productId, productData) => 
        apiRequest(`/products/${productId}`, 'PUT', productData),
    
    delete: (productId) => 
        apiRequest(`/products/${productId}`, 'DELETE')
};

// Permissions
const permissionsAPI = {
    getAll: () => 
        apiRequest('/permissions'),
    
    getByRole: (role) => 
        apiRequest(`/permissions/role/${encodeURIComponent(role)}`),
    
    checkAccess: (role, page) => 
        apiRequest(`/permissions/check/${encodeURIComponent(role)}/${page}`),
    
    update: (permissionData) => 
        apiRequest('/permissions', 'PUT', permissionData),
    
    bulkUpdate: (permissions) => 
        apiRequest('/permissions/bulk', 'PUT', { permissions })
};

// Helper Functions
function showSuccess(message) {
    alert('✓ ' + message);
}

function showError(message) {
    alert('✗ ' + message);
}

function handleAPIError(error) {
    console.error('API Error:', error);
    showError(error.message || 'خطا در ارتباط با سرور');
}
