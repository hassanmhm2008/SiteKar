# راهنمای استفاده از تقویم شمسی

## فایل‌های مورد نیاز

1. **jalali-calendar.css** - استایل‌های تقویم
2. **jalali-calendar.js** - توابع و منطق تقویم

## نحوه استفاده

### 1. اضافه کردن فایل‌ها به صفحه HTML

```html
<head>
    <link rel="stylesheet" href="jalali-calendar.css">
</head>
<body>
    <!-- محتوای صفحه -->
    
    <script src="jalali-calendar.js"></script>
</body>
```

### 2. راه‌اندازی تقویم برای یک فیلد

```javascript
// راه‌اندازی برای یک فیلد با تاریخ امروز به صورت پیش‌فرض
initJalaliDatePicker('fieldId', true);

// راه‌اندازی بدون تاریخ پیش‌فرض
initJalaliDatePicker('fieldId', false);
```

### 3. راه‌اندازی برای چند فیلد به صورت همزمان

```javascript
const dateFields = ['fromDate', 'toDate', 'birthDate'];
initJalaliDatePickers(dateFields, true);
```

### 4. مثال کامل

#### HTML:
```html
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="jalali-calendar.css">
</head>
<body>
    <div class="filter-group">
        <label>تاریخ:</label>
        <input type="text" id="myDate" placeholder="1404/08/14" dir="ltr">
    </div>

    <script src="jalali-calendar.js"></script>
    <script>
        // راه‌اندازی تقویم
        initJalaliDatePicker('myDate', true);
    </script>
</body>
</html>
```

#### JavaScript:
```javascript
// برای صفحه گزارش‌ها
function initializeDatePickers() {
    const dateFields = ['fromDate1', 'toDate1', 'fromDate2', 'toDate2'];
    initJalaliDatePickers(dateFields, true);
}

// برای صفحه کارها
setTimeout(() => {
    initJalaliDatePicker('taskDeadline', false);
}, 500);
```

## ویژگی‌ها

✅ تبدیل خودکار میلادی به شمسی و بالعکس  
✅ نمایش اعداد فارسی  
✅ دکمه "امروز" برای انتخاب سریع  
✅ دکمه‌های تغییر ماه و سال  
✅ مشخص کردن تاریخ امروز با رنگ آبی  
✅ بسته شدن خودکار با کلیک خارج از تقویم  
✅ طراحی ریسپانسیو و کوچک  

## توابع قابل استفاده

### تبدیل تاریخ
```javascript
// میلادی به شمسی
const jalaliDate = gregorianToJalali(2025, 11, 5);
// خروجی: { jy: 1404, jm: 8, jd: 14 }

// شمسی به میلادی
const gregorianDate = jalaliToGregorian(1404, 8, 14);
// خروجی: { gy: 2025, gm: 11, gd: 5 }
```

### تبدیل اعداد
```javascript
const persianNumber = toPersianDigits(1404);
// خروجی: "۱۴۰۴"
```

### بررسی سال کبیسه
```javascript
const isLeap = isLeapJalaliYear(1403);
// خروجی: true یا false
```

### کنترل تقویم
```javascript
// نمایش تقویم
showCalendar('fieldId', inputElement);

// بستن همه تقویم‌ها
closeAllCalendars();

// انتخاب تاریخ امروز
selectToday('fieldId');
```

## استفاده در صفحات مختلف

### صفحه گزارش‌ها (reports.html)
```javascript
function initializeDatePickers() {
    const dateFields = ['fromDate1', 'toDate1', 'fromDate2', 'toDate2', 'fromDate3', 'toDate3'];
    initJalaliDatePickers(dateFields, true);
}
```

### صفحه کارها (tasks.html)
```javascript
setTimeout(() => {
    initJalaliDatePicker('taskDeadline', false);
}, 500);
```

### صفحه درخواست‌ها (مثال)
```javascript
// در modal ایجاد درخواست
function openNewRequestModal() {
    // ... کد قبلی
    initJalaliDatePicker('requestDate', true);
}
```

## نکات مهم

1. **فیلد input باید داخل یک div با class "filter-group" یا هر element دیگری باشد**
2. **direction فیلد را ltr تنظیم کنید**: `dir="ltr"`
3. **برای modal‌ها از setTimeout استفاده کنید** تا بعد از رندر شدن modal تقویم راه‌اندازی شود
4. **فرمت تاریخ**: `YYYY/MM/DD` (مثلا: `1404/08/14`)

## پشتیبانی

این تقویم در تمام مرورگرهای مدرن کار می‌کند و نیازی به کتابخانه خارجی ندارد.
