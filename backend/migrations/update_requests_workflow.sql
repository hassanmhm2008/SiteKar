-- به‌روزرسانی جدول requests برای سیستم تایید/رد درخواست‌ها

-- اضافه کردن فیلدهای جدید به جدول requests
ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS status ENUM('در انتظار', 'تایید رئیس', 'رد شده', 'تایید انبار', 'تحویل داده شده') 
    DEFAULT 'در انتظار' AFTER approved_by,
ADD COLUMN IF NOT EXISTS supervisor_comment TEXT AFTER status,
ADD COLUMN IF NOT EXISTS supervisor_action_date TIMESTAMP NULL AFTER supervisor_comment,
ADD COLUMN IF NOT EXISTS warehouse_comment TEXT AFTER supervisor_action_date,
ADD COLUMN IF NOT EXISTS warehouse_action_date TIMESTAMP NULL AFTER warehouse_comment;

-- ایجاد ایندکس برای جستجوی سریع‌تر
ALTER TABLE requests 
ADD INDEX idx_status (status),
ADD INDEX idx_department_status (department_id, status);
