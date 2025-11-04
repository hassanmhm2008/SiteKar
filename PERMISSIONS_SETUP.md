# مراحل نصب سیستم دسترسی‌ها

## مرحله 1: اجرای SQL در phpMyAdmin

1. مرورگر را باز کنید و به آدرس `http://localhost/phpmyadmin` بروید
2. دیتابیس `sitekar_db` را انتخاب کنید
3. به تب "SQL" بروید
4. محتوای فایل `backend/migrations/create_permissions_table.sql` را کپی کنید
5. در پنجره SQL قرار دهید و دکمه "Go" را بزنید

## مرحله 2: ریستارت سرور

```powershell
cd E:\Projects\sitekar\backend
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
node server.js
```

## مرحله 3: دسترسی به صفحه

1. به آدرس `http://127.0.0.1:5500/permissions.html` بروید
2. با کاربر مدیر لاگین کنید
3. تنظیمات > دسترسی‌ها

## ویژگی‌های سیستم دسترسی‌ها:

✅ جدول دسترسی‌ها در MySQL ذخیره می‌شود
✅ 4 نقش: مدیر، رئیس واحد، کارمند، کارشناس  
✅ 7 صفحه: داشبورد، کارها، درخواست‌ها، کالاها، کاربران، واحدها، دسترسی‌ها
✅ رابط کاربری جدول شطرنجی با checkbox
✅ نمایش تغییرات ذخیره نشده
✅ به‌روزرسانی دسته‌ای (Bulk Update)
✅ فقط مدیر می‌تواند دسترسی‌ها را تغییر دهد

## API Endpoints:

- GET `/api/permissions` - دریافت تمام دسترسی‌ها
- GET `/api/permissions/role/:role` - دریافت دسترسی‌های یک نقش
- GET `/api/permissions/check/:role/:page` - بررسی دسترسی
- PUT `/api/permissions` - به‌روزرسانی یک دسترسی
- PUT `/api/permissions/bulk` - به‌روزرسانی چندین دسترسی
