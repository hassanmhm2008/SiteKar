// توابع مشترک سیستم مدیریت

// تبدیل اعداد انگلیسی به فارسی
function toPersianNumber(num) {
    if (num === null || num === undefined) return '';
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(num).replace(/\d/g, digit => persianDigits[parseInt(digit)]);
}

// بررسی احراز هویت
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    const currentPage = window.location.pathname;
    
    // صفحات عمومی که نیاز به احراز هویت ندارند
    const publicPages = [
        'index.html',
        'login.html', 
        'home.html',
        'test-mock-api.html',
        '/',
        ''
    ];
    
    // بررسی اینکه آیا در صفحه عمومی هستیم
    const isPublicPage = publicPages.some(page => 
        currentPage.endsWith(page) || currentPage === '/' || currentPage === ''
    );
    
    // اگر کاربر وارد نشده و در صفحه خصوصی است، به صفحه ورود هدایت کن
    if (!currentUser && !isPublicPage) {
        console.log('User not authenticated, redirecting to login');
        window.location.href = 'index.html';
        return false;
    }
    
    // اگر کاربر وارد شده و در صفحه ورود است، به داشبورد هدایت کن
    if (currentUser && (currentPage.endsWith('index.html') || currentPage.endsWith('login.html'))) {
        console.log('User already authenticated, redirecting to dashboard');
        window.location.href = 'dashboard.html';
        return false;
    }
    
    return true;
}

// نمایش اطلاعات کاربر جاری
function displayCurrentUser() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        const userNameElements = document.querySelectorAll('.user-name');
        const userRoleElements = document.querySelectorAll('.user-role');
        
        // استفاده از name بجای fullName (بر اساس ساختار Mock API)
        const displayName = currentUser.name || currentUser.fullName || currentUser.username;
        const displayRole = currentUser.role;
        
        userNameElements.forEach(el => el.textContent = displayName);
        userRoleElements.forEach(el => el.textContent = displayRole);
        
        console.log('User info displayed:', displayName, displayRole);
    }
}

// خروج از سیستم
function logout() {
    if (confirm('آیا می‌خواهید از سیستم خارج شوید؟')) {
        window.location.href = 'logout.html';
    }
}

// ایجاد داده‌های نمونه برای تست
function createSampleData() {
    // بررسی اینکه آیا قبلاً داده‌ها ایجاد شده‌اند
    const dataCreated = localStorage.getItem('sampleDataCreated');
    if (dataCreated) return;

    // ایجاد کاربران نمونه
    const sampleUsers = [
        {
            id: 1,
            username: 'admin',
            password: 'admin123',
            fullName: 'محمد احمدی',
            role: 'مدیر',
            supervisor: null,
            email: 'admin@company.com',
            phone: '09121234567',
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            username: 'manager1',
            password: 'pass123',
            fullName: 'سارا محمدی',
            role: 'رئیس',
            supervisor: 1,
            email: 'sara@company.com',
            phone: '09122345678',
            createdAt: new Date().toISOString()
        },
        {
            id: 3,
            username: 'user1',
            password: 'pass123',
            fullName: 'علی رضایی',
            role: 'کارمند',
            supervisor: 2,
            email: 'ali@company.com',
            phone: '09123456789',
            createdAt: new Date().toISOString()
        },
        {
            id: 4,
            username: 'user2',
            password: 'pass123',
            fullName: 'فاطمه کریمی',
            role: 'کارشناس',
            supervisor: 2,
            email: 'fatemeh@company.com',
            phone: '09124567890',
            createdAt: new Date().toISOString()
        }
    ];

    // ایجاد کارهای نمونه
    const sampleTasks = [
        {
            id: 1,
            title: 'بررسی گزارش ماهانه',
            description: 'بررسی و تحلیل گزارش فروش ماه گذشته',
            priority: 'بالا',
            status: 'در حال انجام',
            assignedTo: 3,
            deadline: '2025-11-15',
            createdBy: 1,
            createdAt: new Date('2025-11-01').toISOString()
        },
        {
            id: 2,
            title: 'آماده‌سازی ارائه',
            description: 'آماده‌سازی پرزنتیشن برای جلسه هفته آینده',
            priority: 'متوسط',
            status: 'جدید',
            assignedTo: 4,
            deadline: '2025-11-10',
            createdBy: 2,
            createdAt: new Date('2025-11-02').toISOString()
        },
        {
            id: 3,
            title: 'تماس با مشتریان',
            description: 'پیگیری نظرسنجی از مشتریان جدید',
            priority: 'پایین',
            status: 'تکمیل شده',
            assignedTo: 3,
            deadline: '2025-11-05',
            createdBy: 2,
            createdAt: new Date('2025-10-28').toISOString()
        },
        {
            id: 4,
            title: 'به‌روزرسانی سیستم',
            description: 'نصب آپدیت‌های امنیتی سیستم',
            priority: 'بحرانی',
            status: 'در حال انجام',
            assignedTo: 4,
            deadline: '2025-11-08',
            createdBy: 1,
            createdAt: new Date('2025-11-01').toISOString()
        },
        {
            id: 5,
            title: 'جلسه تیمی',
            description: 'برگزاری جلسه هماهنگی با تیم فروش',
            priority: 'متوسط',
            status: 'جدید',
            assignedTo: 2,
            deadline: '2025-11-12',
            createdBy: 1,
            createdAt: new Date('2025-11-03').toISOString()
        }
    ];

    // ذخیره داده‌ها در localStorage
    localStorage.setItem('users', JSON.stringify(sampleUsers));
    localStorage.setItem('tasks', JSON.stringify(sampleTasks));
    localStorage.setItem('sampleDataCreated', 'true');
}

// فرمت‌دهی تاریخ به شمسی
function formatDateToPersian(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR');
}

// محاسبه تعداد روزهای باقی‌مانده تا مهلت
function getDaysRemaining(deadline) {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// دریافت رنگ بر اساس اولویت
function getPriorityColor(priority) {
    const colors = {
        'بحرانی': '#dc3545',
        'بالا': '#ffc107',
        'متوسط': '#17a2b8',
        'پایین': '#28a745'
    };
    return colors[priority] || '#6c757d';
}

// دریافت رنگ بر اساس وضعیت
function getStatusColor(status) {
    const colors = {
        'جدید': '#007bff',
        'در حال انجام': '#ffc107',
        'تکمیل شده': '#28a745',
        'لغو شده': '#dc3545'
    };
    return colors[status] || '#6c757d';
}

// اعتبارسنجی ایمیل
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// اعتبارسنجی شماره تلفن ایرانی
function validateIranianPhone(phone) {
    const re = /^09\d{9}$/;
    return re.test(phone);
}

// جستجوی کاربر بر اساس شناسه
function getUserById(userId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find(u => u.id === userId);
}

// جستجوی کار بر اساس شناسه
function getTaskById(taskId) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    return tasks.find(t => t.id === taskId);
}

// دریافت کارهای یک کاربر
function getUserTasks(userId) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    return tasks.filter(t => t.assignedTo === userId);
}

// دریافت زیرمجموعه‌های یک کاربر
function getUserSubordinates(userId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.filter(u => u.supervisor === userId);
}

// شمارش کارها بر اساس وضعیت
function countTasksByStatus(status) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    return tasks.filter(t => t.status === status).length;
}

// شمارش کارها بر اساس اولویت
function countTasksByPriority(priority) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    return tasks.filter(t => t.priority === priority).length;
}

// مرتب‌سازی آرایه بر اساس فیلد
function sortBy(array, field, ascending = true) {
    return array.sort((a, b) => {
        if (a[field] < b[field]) return ascending ? -1 : 1;
        if (a[field] > b[field]) return ascending ? 1 : -1;
        return 0;
    });
}

// نمایش پیام موفقیت
function showSuccessMessage(message) {
    alert('✓ ' + message);
}

// نمایش پیام خطا
function showErrorMessage(message) {
    alert('✗ ' + message);
}

// تایید عملیات
function confirmAction(message) {
    return confirm(message);
}

// Export/Import داده‌ها به JSON
function exportDataToJSON() {
    const data = {
        users: JSON.parse(localStorage.getItem('users') || '[]'),
        tasks: JSON.parse(localStorage.getItem('tasks') || '[]'),
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
}

function importDataFromJSON(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.users) localStorage.setItem('users', JSON.stringify(data.users));
            if (data.tasks) localStorage.setItem('tasks', JSON.stringify(data.tasks));
            showSuccessMessage('داده‌ها با موفقیت بازیابی شدند');
            location.reload();
        } catch (error) {
            showErrorMessage('خطا در بازیابی داده‌ها');
        }
    };
    reader.readAsText(file);
}

// مدیریت منوی تنظیمات و دسترسی‌ها
function initializeMenu() {
    const currentPage = window.location.pathname.split('/').pop();
    const settingsPages = ['users.html', 'departments.html', 'products.html', 'permissions.html'];
    
    if (settingsPages.includes(currentPage)) {
        const submenu = document.querySelector('.nav-submenu.admin-menu');
        if (submenu) {
            submenu.classList.add('show');
        }
    }
}

function toggleSubmenu(element) {
    const submenu = element.nextElementSibling;
    if (submenu && submenu.classList.contains('nav-submenu')) {
        submenu.classList.toggle('show');
    }
}

// بارگذاری دسترسی‌ها برای نقش فعلی و ذخیره در localStorage
async function loadPermissionsForRole(role) {
    if (!role) return null;
    try {
        const result = await permissionsAPI.getByRole(role);
        if (result.success && result.permissions) {
            const map = {};
            result.permissions.forEach(p => map[p.page_name] = !!p.has_access);
            const payload = { role, map };
            localStorage.setItem('permissionsMap', JSON.stringify(payload));
            return map;
        }
    } catch (err) {
        console.error('Failed to load permissions for role', role, err);
    }
    return null;
}

// گرفتن دسترسی‌های ذخیره‌شده (اگر برای نقش فعلی باشند)
function getStoredPermissionsForCurrentRole() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser) return null;
    try {
        const stored = JSON.parse(localStorage.getItem('permissionsMap') || 'null');
        if (stored && stored.role === currentUser.role) return stored.map;
    } catch (e) {
        // ignore parse errors
    }
    return null;
}

// اعمال دسترسی‌ها روی منوها (نمایش/مخفی کردن)
function applyPermissionsToMenu(map) {
    if (!map) return;

    // صفحات قابل کنترل - اضافه شد: department-requests و warehouse-requests
    const pages = ['dashboard', 'tasks', 'requests', 'department-requests', 'warehouse-requests', 
                   'products', 'users', 'departments', 'permissions'];

    pages.forEach(page => {
        const anchor = document.querySelector(`a[href="${page}.html"]`);
        if (!anchor) return;

        // اگر لینک درون زیرمنو است، کنترل مستقیم روی خود لینک انجام می‌شود
        const inSubmenu = !!anchor.closest('.nav-submenu');
        if (inSubmenu) {
            anchor.style.display = map[page] ? '' : 'none';
            if (map[page]) anchor.classList.add('visible');
            else anchor.classList.remove('visible');
        } else {
            // لینک‌های سطح بالا و منوهای خاص (مثل department-requests و warehouse-requests)
            // اگر class admin-menu دارند، باید با visible کنترل شوند
            if (anchor.classList.contains('admin-menu')) {
                if (map[page]) {
                    anchor.classList.add('visible');
                    anchor.style.display = '';
                } else {
                    anchor.classList.remove('visible');
                    anchor.style.display = 'none';
                }
            } else {
                anchor.style.display = map[page] ? '' : 'none';
            }
        }
    });

    // تنظیم منطق والد تنظیمات: اگر حداقل یکی از زیرمجموعه‌ها اجازه داشت، والد را نشان بده
    const settingsChildren = ['users', 'departments', 'products', 'permissions'];
    const hasAnySettingsAccess = settingsChildren.some(p => !!map[p]);
    const settingsParent = document.querySelector('.nav-item-parent.admin-menu');
    const settingsSubmenu = document.querySelector('.nav-submenu.admin-menu');

    if (hasAnySettingsAccess) {
        if (settingsParent) settingsParent.classList.add('visible');
        if (settingsSubmenu) settingsSubmenu.classList.add('visible');
        // همچنین برای هر آیتم زیرمنو نمایش را بر اساس map تنظیم می‌کنیم
        settingsChildren.forEach(p => {
            const a = document.querySelector(`a[href="${p}.html"]`);
            if (a) a.style.display = map[p] ? '' : 'none';
        });
    } else {
        if (settingsParent) settingsParent.classList.remove('visible');
        if (settingsSubmenu) settingsSubmenu.classList.remove('visible');
    }
}

// بررسی و نمایش منوها بر اساس دسترسی (از کش استفاده می‌کند)
async function checkPagePermissions() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser) return;

    // ابتدا از localStorage تلاش کن
    let map = getStoredPermissionsForCurrentRole();
    if (!map) {
        map = await loadPermissionsForRole(currentUser.role);
    }
    
    // اگر هنوز map نداریم (API خطا داد)، از قوانین پیش‌فرض استفاده کن
    if (!map) {
        console.warn('Permissions API failed, using default role-based access');
        // برای مدیر همه دسترسی‌ها
        if (currentUser.role === 'مدیر') {
            map = {
                dashboard: true,
                tasks: true,
                requests: true,
                'department-requests': true,
                'warehouse-requests': true,
                products: true,
                users: true,
                departments: true,
                permissions: true
            };
        } else if (currentUser.role === 'رئیس واحد') {
            map = {
                dashboard: true,
                tasks: true,
                requests: true,
                'department-requests': true,
                'warehouse-requests': false,
                products: false,
                users: false,
                departments: false,
                permissions: false
            };
        } else if (currentUser.role === 'انبار دار') {
            map = {
                dashboard: true,
                tasks: false,
                requests: true,
                'department-requests': false,
                'warehouse-requests': true,
                products: true,
                users: false,
                departments: false,
                permissions: false
            };
        } else {
            // برای بقیه (کارمند، کارشناس) فقط داشبورد، کارها و درخواست‌ها
            map = {
                dashboard: true,
                tasks: true,
                requests: true,
                'department-requests': false,
                'warehouse-requests': false,
                products: false,
                users: false,
                departments: false,
                permissions: false
            };
        }
    }
    
    if (map) applyPermissionsToMenu(map);
}

// قدیمی - نگهداری نام برای سازگاری
function checkAdminMenus() {
    return checkPagePermissions();
}

// چک کردن دسترسی به صفحه فعلی
async function checkCurrentPageAccess() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser) {
        window.location.href = 'index.html';
        return false;
    }

    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    
    // صفحات عمومی که همه به آن دسترسی دارند
    const publicPages = ['dashboard', 'tasks', 'requests', 'index'];
    if (publicPages.includes(currentPage)) return true;

    // صفحه reports دسترسی داخلی دارد (هر تب بررسی می‌کند)
    if (currentPage === 'reports') {
        // بررسی اینکه حداقل به یکی از گزارش‌ها دسترسی دارد
        let map = getStoredPermissionsForCurrentRole();
        if (!map) {
            map = await loadPermissionsForRole(currentUser.role);
        }
        
        if (!map) {
            if (currentUser.role !== 'مدیر') {
                alert('شما به این بخش دسترسی ندارید');
                window.location.href = 'dashboard.html';
                return false;
            }
            return true;
        }

        // بررسی دسترسی به حداقل یکی از گزارش‌ها
        const hasAnyReportAccess = map['reports-requests'] || map['reports-departments'] || map['reports-products'];
        if (!hasAnyReportAccess) {
            alert('شما به هیچ گزارشی دسترسی ندارید');
            window.location.href = 'dashboard.html';
            return false;
        }
        
        return true;
    }

    // بررسی دسترسی از permissions
    let map = getStoredPermissionsForCurrentRole();
    if (!map) {
        map = await loadPermissionsForRole(currentUser.role);
    }

    // اگر permissions نیامد، فقط مدیر دسترسی دارد
    if (!map) {
        if (currentUser.role !== 'مدیر') {
            alert('شما به این بخش دسترسی ندارید');
            window.location.href = 'dashboard.html';
            return false;
        }
        return true;
    }

    // چک کردن دسترسی از map
    if (!map[currentPage]) {
        alert('شما به این بخش دسترسی ندارید');
        window.location.href = 'dashboard.html';
        return false;
    }

    return true;
}

// ایجاد داده‌های نمونه هنگام بارگذاری اولیه
if (typeof window !== 'undefined') {
    // بررسی اینکه آیا در صفحه ورود هستیم یا خیر
    if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
        checkAuth();
    }
}
