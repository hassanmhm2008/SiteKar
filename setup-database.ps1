# اسکریپت راه‌اندازی MySQL و نصب دیتابیس

Write-Host "=== راه‌اندازی MySQL و نصب دیتابیس ===" -ForegroundColor Cyan
Write-Host ""

# بررسی XAMPP
$xamppPath = "C:\xampp\mysql\bin\mysql.exe"
$mysqlServiceName = "MySQL80"

Write-Host "1. بررسی XAMPP..." -ForegroundColor Yellow

if (Test-Path $xamppPath) {
    Write-Host "✓ XAMPP پیدا شد!" -ForegroundColor Green
    Write-Host ""
    Write-Host "لطفاً XAMPP Control Panel را باز کنید و MySQL را Start کنید." -ForegroundColor Cyan
    Write-Host ""
    
    $response = Read-Host "آیا MySQL در XAMPP استارت شد؟ (y/n)"
    
    if ($response -eq "y") {
        Write-Host ""
        Write-Host "2. نصب دیتابیس..." -ForegroundColor Yellow
        
        # مسیر فایل SQL
        $sqlFile = "E:\Projects\sitekar\database.sql"
        
        if (Test-Path $sqlFile) {
            Write-Host "فایل SQL پیدا شد." -ForegroundColor Green
            Write-Host ""
            
            # اجرای دستور
            Write-Host "در حال اجرای دستور..." -ForegroundColor Cyan
            
            try {
                & $xamppPath -u root < $sqlFile
                Write-Host ""
                Write-Host "✓ دیتابیس با موفقیت نصب شد!" -ForegroundColor Green
            } catch {
                Write-Host "✗ خطا در نصب دیتابیس" -ForegroundColor Red
                Write-Host "لطفاً از phpMyAdmin استفاده کنید:" -ForegroundColor Yellow
                Write-Host "http://localhost/phpmyadmin" -ForegroundColor Cyan
            }
        } else {
            Write-Host "✗ فایل database.sql پیدا نشد!" -ForegroundColor Red
        }
    }
} else {
    Write-Host "✗ XAMPP پیدا نشد." -ForegroundColor Red
    Write-Host ""
    Write-Host "لطفاً یکی از موارد زیر را انجام دهید:" -ForegroundColor Yellow
    Write-Host "1. XAMPP را نصب کنید: https://www.apachefriends.org/" -ForegroundColor Cyan
    Write-Host "2. یا MySQL Service را استارت کنید:" -ForegroundColor Cyan
    Write-Host "   net start MySQL80" -ForegroundColor White
    Write-Host ""
    
    # بررسی MySQL Service
    Write-Host "بررسی MySQL Service..." -ForegroundColor Yellow
    $service = Get-Service -Name $mysqlServiceName -ErrorAction SilentlyContinue
    
    if ($service) {
        if ($service.Status -eq "Running") {
            Write-Host "✓ MySQL Service در حال اجراست" -ForegroundColor Green
        } else {
            Write-Host "MySQL Service یافت شد اما در حال اجرا نیست" -ForegroundColor Yellow
            $response = Read-Host "آیا می‌خواهید MySQL Service را استارت کنید؟ (y/n)"
            
            if ($response -eq "y") {
                try {
                    Start-Service -Name $mysqlServiceName
                    Write-Host "✓ MySQL Service استارت شد" -ForegroundColor Green
                } catch {
                    Write-Host "✗ خطا در استارت MySQL Service" -ForegroundColor Red
                    Write-Host "لطفاً PowerShell را با دسترسی Administrator اجرا کنید" -ForegroundColor Yellow
                }
            }
        }
    } else {
        Write-Host "✗ MySQL Service پیدا نشد" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== راهنمای استفاده از phpMyAdmin ===" -ForegroundColor Cyan
Write-Host "1. XAMPP را استارت کنید" -ForegroundColor White
Write-Host "2. به http://localhost/phpmyadmin بروید" -ForegroundColor White
Write-Host "3. Import را انتخاب کنید" -ForegroundColor White
Write-Host "4. فایل database.sql را انتخاب کنید" -ForegroundColor White
Write-Host "5. Go را بزنید" -ForegroundColor White
Write-Host ""

Read-Host "برای خروج Enter را بزنید"
