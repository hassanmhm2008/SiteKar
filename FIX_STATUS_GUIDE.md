# راهنمای حل مشکل وضعیت خالی در درخواست‌ها

## مشکل:
هنگام ثبت درخواست جدید، فیلد `status` خالی ثبت می‌شود.

## علت احتمالی:
1. فیلد `status` در جدول `requests` وجود ندارد
2. فیلد `status` از نوع اشتباه است (مثلاً VARCHAR به جای ENUM)
3. Migration اجرا نشده است

---

## راه حل - گام به گام:

### گام 1: بررسی وضعیت فعلی جدول

در phpMyAdmin یا MySQL command line این query را اجرا کنید:

```sql
USE sitekar_db;

SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'sitekar_db' 
  AND TABLE_NAME = 'requests' 
  AND COLUMN_NAME = 'status';
```

**خروجی ممکن:**
- اگر چیزی نمایش نداد → فیلد `status` وجود ندارد
- اگر نمایش داد → نوع فیلد را بررسی کنید

---

### گام 2: حل مشکل

#### حالت A: اگر فیلد status وجود ندارد یا نوع آن VARCHAR است

در phpMyAdmin، دیتابیس `sitekar_db` را انتخاب کنید و فایل زیر را اجرا کنید:

```
backend/migrations/fix_requests_status.sql
```

یا محتویات آن را کپی و در تب SQL بچسبانید.

#### حالت B: اگر فیلد status از نوع ENUM است ولی مقادیر قدیمی دارد

```sql
ALTER TABLE requests MODIFY COLUMN status 
ENUM('در انتظار', 'تایید رئیس', 'رد شده', 'تایید انبار', 'تحویل داده شده') 
DEFAULT 'در انتظار';

UPDATE requests SET status = 'در انتظار' 
WHERE status IS NULL OR status = '' OR status NOT IN ('در انتظار', 'تایید رئیس', 'رد شده', 'تایید انبار', 'تحویل داده شده');
```

---

### گام 3: تأیید تغییرات

بعد از اجرای migration، این query را اجرا کنید:

```sql
DESCRIBE requests;
```

باید فیلد `status` را با این مشخصات ببینید:
- **Type**: `enum('در انتظار','تایید رئیس','رد شده','تایید انبار','تحویل داده شده')`
- **Default**: `در انتظار`

---

### گام 4: ری‌استارت سرور

```bash
# در terminal
cd E:\Projects\sitekar\backend
node server.js
```

---

### گام 5: تست

1. وارد سیستم شوید
2. یک درخواست جدید ثبت کنید
3. در phpMyAdmin بررسی کنید:

```sql
SELECT id, user_id, status, created_at 
FROM requests 
ORDER BY id DESC 
LIMIT 5;
```

باید `status` همه درخواست‌های جدید `'در انتظار'` باشد.

---

## اگر هنوز مشکل حل نشد:

### بررسی کد Backend:

فایل `backend/routes/requests.js` خط ~232 را بررسی کنید:

```javascript
const [result] = await connection.query(
    `INSERT INTO requests (request_number, user_id, department_id, total_items, description, status) 
     VALUES (?, ?, ?, ?, ?, 'در انتظار')`,  // ← این خط باید 'در انتظار' داشته باشد
    [requestNumber, user_id, department_id, items.length, description]
);
```

اگر `'در انتظار'` را ندارد، آن را اضافه کنید.

---

## Query های مفید برای Debug:

### بررسی تمام درخواست‌ها با وضعیت
```sql
SELECT id, user_id, department_id, status, created_at 
FROM requests 
ORDER BY id DESC;
```

### به‌روزرسانی دستی وضعیت‌های خالی
```sql
UPDATE requests 
SET status = 'در انتظار' 
WHERE status IS NULL OR status = '';
```

### حذف درخواست‌های تست
```sql
DELETE FROM requests WHERE id > 10; -- تنها اگر داده‌های تست دارید
```

---

## خلاصه فایل‌های مهم:

1. **Migration**: `backend/migrations/fix_requests_status.sql`
2. **Backend Code**: `backend/routes/requests.js` (خط 232)
3. **دیتابیس**: جدول `requests` در `sitekar_db`

---

## پشتیبانی:

اگر بعد از این مراحل هنوز مشکل دارید:
1. خروجی `DESCRIBE requests;` را بفرستید
2. خروجی `SELECT * FROM requests ORDER BY id DESC LIMIT 1;` را بفرستید
3. لاگ کنسول سرور backend را بررسی کنید
