-- اضافه کردن صفحات جدید به جدول permissions

-- ابتدا اطمینان حاصل کنید که فیلدهای جدید در جدول requests اضافه شده‌اند
-- اگر خطا داد، نگران نباشید - یعنی قبلاً اجرا شده

ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS status ENUM('در انتظار', 'تایید رئیس', 'رد شده', 'تایید انبار', 'تحویل داده شده') 
    DEFAULT 'در انتظار' AFTER approved_by,
ADD COLUMN IF NOT EXISTS supervisor_comment TEXT AFTER status,
ADD COLUMN IF NOT EXISTS supervisor_action_date TIMESTAMP NULL AFTER supervisor_comment,
ADD COLUMN IF NOT EXISTS warehouse_comment TEXT AFTER supervisor_action_date,
ADD COLUMN IF NOT EXISTS warehouse_action_date TIMESTAMP NULL AFTER warehouse_comment;

-- ایجاد ایندکس برای جستجوی سریع‌تر
ALTER TABLE requests 
ADD INDEX IF NOT EXISTS idx_status (status),
ADD INDEX IF NOT EXISTS idx_department_status (department_id, status);

-- اضافه کردن صفحات جدید به permissions
INSERT INTO permissions (role_name, page_name, page_title, has_access) VALUES
-- درخواست‌های واحد برای رئیس واحد
('مدیر', 'department-requests', 'درخواست‌های واحد', TRUE),
('رئیس واحد', 'department-requests', 'درخواست‌های واحد', TRUE),
('کارمند', 'department-requests', 'درخواست‌های واحد', FALSE),
('کارشناس', 'department-requests', 'درخواست‌های واحد', FALSE),
('انبار دار', 'department-requests', 'درخواست‌های واحد', FALSE),

-- درخواست‌های انبار برای انبار دار
('مدیر', 'warehouse-requests', 'درخواست‌های انبار', TRUE),
('رئیس واحد', 'warehouse-requests', 'درخواست‌های انبار', FALSE),
('کارمند', 'warehouse-requests', 'درخواست‌های انبار', FALSE),
('کارشناس', 'warehouse-requests', 'درخواست‌های انبار', FALSE),
('انبار دار', 'warehouse-requests', 'درخواست‌های انبار', TRUE)
ON DUPLICATE KEY UPDATE has_access = VALUES(has_access);

-- به‌روزرسانی درخواست‌های قدیمی که status ندارند
UPDATE requests SET status = 'در انتظار' WHERE status IS NULL OR status = '';
