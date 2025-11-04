-- اضافه کردن نقش "انبار دار" به جدول permissions
ALTER TABLE permissions 
MODIFY COLUMN role_name ENUM('مدیر', 'رئیس واحد', 'کارمند', 'کارشناس', 'انبار دار') NOT NULL;

-- اضافه کردن نقش "انبار دار" به جدول users (اگر قبلاً ساخته شده باشد)
ALTER TABLE users 
MODIFY COLUMN role ENUM('مدیر', 'رئیس واحد', 'کارمند', 'کارشناس', 'انبار دار') NOT NULL;

-- اضافه کردن پرمیشن‌های پیش‌فرض برای انبار دار
-- انبار دار به داشبورد، مدیریت کالاها و درخواست‌ها دسترسی دارد
INSERT INTO permissions (role_name, page_name, page_title, has_access) VALUES
('انبار دار', 'dashboard', 'داشبورد', TRUE),
('انبار دار', 'tasks', 'کارها', FALSE),
('انبار دار', 'requests', 'درخواست‌ها', TRUE),
('انبار دار', 'products', 'مدیریت کالاها', TRUE),
('انبار دار', 'users', 'مدیریت کاربران', FALSE),
('انبار دار', 'departments', 'واحدها', FALSE),
('انبار دار', 'permissions', 'دسترسی‌ها', FALSE)
ON DUPLICATE KEY UPDATE has_access = VALUES(has_access);
