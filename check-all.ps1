Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  تست سلامت سیستم مدیریت کار و درخواست  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# 1. بررسی XAMPP
Write-Host "1. بررسی XAMPP..." -ForegroundColor Yellow
$xamppPath = "C:\xampp\mysql\bin\mysql.exe"
if (Test-Path $xamppPath) {
    Write-Host "   [OK] XAMPP نصب شده است" -ForegroundColor Green
} else {
    Write-Host "   [FAIL] XAMPP یافت نشد" -ForegroundColor Red
    $allGood = $false
}

# 2. بررسی MySQL Port
Write-Host "`n2. بررسی MySQL Service..." -ForegroundColor Yellow
$mysqlRunning = netstat -ano | Select-String "3306"
if ($mysqlRunning) {
    Write-Host "   [OK] MySQL در حال اجراست (Port 3306)" -ForegroundColor Green
} else {
    Write-Host "   [FAIL] MySQL در حال اجرا نیست" -ForegroundColor Red
    Write-Host "   لطفاً XAMPP Control Panel را باز کنید و MySQL را Start کنید" -ForegroundColor Yellow
    $allGood = $false
}

# 3. بررسی phpMyAdmin
Write-Host "`n3. بررسی phpMyAdmin..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost/phpmyadmin" -UseBasicParsing -TimeoutSec 3
    if ($response.StatusCode -eq 200) {
        Write-Host "   [OK] phpMyAdmin در دسترس است" -ForegroundColor Green
    }
} catch {
    Write-Host "   [FAIL] phpMyAdmin در دسترس نیست" -ForegroundColor Red
    $allGood = $false
}

# 4. بررسی فایل‌های پروژه
Write-Host "`n4. بررسی فایل‌های پروژه..." -ForegroundColor Yellow

$files = @(
    "E:\Projects\sitekar\database.sql",
    "E:\Projects\sitekar\backend\package.json",
    "E:\Projects\sitekar\backend\.env",
    "E:\Projects\sitekar\backend\server.js",
    "E:\Projects\sitekar\index.html"
)

foreach ($file in $files) {
    $fileName = Split-Path $file -Leaf
    if (Test-Path $file) {
        Write-Host "   [OK] $fileName موجود است" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] $fileName یافت نشد" -ForegroundColor Red
        $allGood = $false
    }
}

# 5. بررسی Node.js
Write-Host "`n5. بررسی Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   [OK] Node.js نصب شده است ($nodeVersion)" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] Node.js نصب نشده است" -ForegroundColor Red
    Write-Host "   لطفاً از https://nodejs.org نصب کنید" -ForegroundColor Yellow
    $allGood = $false
}

# 6. بررسی node_modules
Write-Host "`n6. بررسی وابستگی‌های Node.js..." -ForegroundColor Yellow
if (Test-Path "E:\Projects\sitekar\backend\node_modules") {
    Write-Host "   [OK] وابستگی‌ها نصب شده‌اند" -ForegroundColor Green
} else {
    Write-Host "   [WARNING] وابستگی‌ها نصب نشده‌اند" -ForegroundColor Yellow
    Write-Host "   اجرا کنید: cd backend && npm install" -ForegroundColor Cyan
}

# 7. تست اتصال به دیتابیس
Write-Host "`n7. تست اتصال به دیتابیس..." -ForegroundColor Yellow

if ($mysqlRunning -and (Test-Path "E:\Projects\sitekar\backend\node_modules")) {
    Write-Host "   در حال اجرای تست..." -ForegroundColor Cyan
    
    Push-Location "E:\Projects\sitekar\backend"
    
    try {
        $testResult = & npm run test:quick 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   [OK] اتصال به دیتابیس موفق" -ForegroundColor Green
            Write-Host ""
            Write-Host "   نتیجه تست:" -ForegroundColor Cyan
            Write-Host $testResult
        } else {
            Write-Host "   [FAIL] خطا در اتصال به دیتابیس" -ForegroundColor Red
            Write-Host $testResult
            $allGood = $false
        }
    } catch {
        Write-Host "   [FAIL] خطا در اجرای تست" -ForegroundColor Red
        $allGood = $false
    }
    
    Pop-Location
} else {
    Write-Host "   [SKIP] شرایط تست فراهم نیست" -ForegroundColor Yellow
}

# نتیجه نهایی
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "  ✓ همه چیز آماده است!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  مراحل بعدی:" -ForegroundColor Yellow
    Write-Host "  1. اجرای Backend:" -ForegroundColor White
    Write-Host "     cd backend && npm start" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  2. باز کردن index.html" -ForegroundColor White
    Write-Host "  3. ورود با admin / admin123" -ForegroundColor White
} else {
    Write-Host "  ✗ برخی مشکلات وجود دارد" -ForegroundColor Red
    Write-Host ""
    Write-Host "  لطفاً موارد بالا را بررسی و رفع کنید" -ForegroundColor Yellow
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Read-Host "برای خروج Enter را بزنید"
