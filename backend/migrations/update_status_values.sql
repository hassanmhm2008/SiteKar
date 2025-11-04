-- به‌روزرسانی مقادیر وضعیت از "در انتظار" به "در انتظار تایید"
-- اضافه کردن وضعیت "تایید موجودی" برای فلوی انبار

USE sitekar_db;

-- 1. به‌روزرسانی رکوردهای موجود
UPDATE requests 
SET status = 'در انتظار تایید' 
WHERE status = 'در انتظار';

-- 2. تغییر ستون status به ENUM جدید با وضعیت "تایید موجودی"، "بازگشت داده شده" و "ارسال نشده"
ALTER TABLE requests 
MODIFY COLUMN status ENUM(
    'ارسال نشده',
    'در انتظار تایید',
    'تایید رئیس', 
    'رد شده', 
    'تایید موجودی',
    'تحویل داده شده',
    'بازگشت داده شده'
) DEFAULT 'ارسال نشده';

-- 3. بررسی نتیجه
SELECT 'Migration completed successfully!' AS message;
SELECT 'فلوی جدید: در انتظار تایید → تایید رئیس → تایید موجودی → تحویل داده شده' AS workflow;
SELECT status, COUNT(*) as count 
FROM requests 
GROUP BY status;
