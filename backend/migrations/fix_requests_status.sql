-- حل مشکل فیلد status در جدول requests
-- این script باید در phpMyAdmin یا MySQL command line اجرا شود

USE sitekar_db;

-- ابتدا بررسی می‌کنیم که فیلد status چه نوعی است
-- اگر VARCHAR است، آن را به ENUM تبدیل می‌کنیم

-- گام 1: حذف فیلد status قدیمی (اگر وجود دارد و نوع آن اشتباه است)
-- توجه: این کار فقط در صورتی که داده‌های مهمی ندارید انجام دهید

-- بررسی کنید آیا فیلد status وجود دارد
-- SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_SCHEMA = 'sitekar_db' AND TABLE_NAME = 'requests' AND COLUMN_NAME = 'status';

-- اگر فیلد status از نوع VARCHAR است، ابتدا آن را حذف کنید:
-- ALTER TABLE requests DROP COLUMN IF EXISTS status;

-- گام 2: اضافه کردن فیلد status با نوع صحیح
ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS status ENUM('در انتظار', 'تایید رئیس', 'رد شده', 'تایید انبار', 'تحویل داده شده') 
DEFAULT 'در انتظار' AFTER approved_by;

-- گام 3: اضافه کردن فیلدهای دیگر (اگر وجود ندارند)
ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS supervisor_comment TEXT AFTER status;

ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS supervisor_action_date TIMESTAMP NULL AFTER supervisor_comment;

ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS warehouse_comment TEXT AFTER supervisor_action_date;

ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS warehouse_action_date TIMESTAMP NULL AFTER warehouse_comment;

-- گام 4: به‌روزرسانی درخواست‌های قدیمی که status خالی دارند
UPDATE requests SET status = 'در انتظار' WHERE status IS NULL OR status = '';

-- گام 5: ایجاد ایندکس‌ها
ALTER TABLE requests ADD INDEX IF NOT EXISTS idx_status (status);
ALTER TABLE requests ADD INDEX IF NOT EXISTS idx_department_status (department_id, status);

-- گام 6: نمایش ساختار نهایی
DESCRIBE requests;

SELECT 'Migration completed successfully!' as message;
