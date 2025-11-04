/**
 * کتابخانه تقویم شمسی (جلالی)
 * برای استفاده در تمام صفحات
 */

// تبدیل اعداد انگلیسی به فارسی
function toPersianDigits(num) {
    if (num === null || num === undefined) return '';
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(num).replace(/\d/g, digit => persianDigits[parseInt(digit)]);
}

// تبدیل اعداد فارسی/عربی به انگلیسی برای پردازش
function toEnglishDigits(str) {
    if (str === null || str === undefined) return '';
    const persian = '۰۱۲۳۴۵۶۷۸۹';
    const arabic = '٠١٢٣٤٥٦٧٨٩';
    return String(str)
        .split('')
        .map(ch => {
            const p = persian.indexOf(ch);
            if (p !== -1) return String(p);
            const a = arabic.indexOf(ch);
            if (a !== -1) return String(a);
            return ch;
        })
        .join('');
}

// پارس تاریخ ورودی از کاربر (حمایت از yyyy/mm/dd و dd/mm/yyyy و جداکننده های مختلف)
function parseJalaliInputDate(value) {
    if (!value) return null;
    const norm = toEnglishDigits(String(value).trim()).replace(/[\.\-]/g, '/');
    // اولویت با yyyy/mm/dd
    let m = norm.match(/^([12]\d{3})\/(\d{1,2})\/(\d{1,2})$/);
    if (m) {
        const jy = parseInt(m[1], 10);
        const jm = parseInt(m[2], 10);
        const jd = parseInt(m[3], 10);
        if (jy && jm >= 1 && jm <= 12 && jd >= 1 && jd <= 31) return { jy, jm, jd };
    }
    // سپس dd/mm/yyyy
    m = norm.match(/^(\d{1,2})\/(\d{1,2})\/([12]\d{3})$/);
    if (m) {
        const jd = parseInt(m[1], 10);
        const jm = parseInt(m[2], 10);
        const jy = parseInt(m[3], 10);
        if (jy && jm >= 1 && jm <= 12 && jd >= 1 && jd <= 31) return { jy, jm, jd };
    }
    return null;
}

// بررسی سال کبیسه شمسی
function isLeapJalaliYear(year) {
    const breaks = [1, 5, 9, 13, 17, 22, 26, 30];
    const gy = year + 621;
    const leap = -14;
    let jp = breaks[0];
    
    for (let i = 1; i < breaks.length; i++) {
        const jm = breaks[i];
        const jump = jm - jp;
        
        if (year < jm) {
            let n = year - jp;
            if (jump - n < 6) n = n - jump + ((jump + 4) / 33 * 33);
            return (((n + 1) % 33 - 1) % 4) === 0;
        }
        
        jp = jm;
    }
    return false;
}

// تبدیل تاریخ میلادی به شمسی
function gregorianToJalali(gy, gm, gd) {
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    
    let jy;
    if (gy > 1600) {
        jy = 979;
        gy -= 1600;
    } else {
        jy = 0;
        gy -= 621;
    }
    
    const gy2 = (gm > 2) ? (gy + 1) : gy;
    let days = (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + 
               Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1];
    
    jy += 33 * Math.floor(days / 12053);
    days %= 12053;
    jy += 4 * Math.floor(days / 1461);
    days %= 1461;
    
    if (days > 365) {
        jy += Math.floor((days - 1) / 365);
        days = (days - 1) % 365;
    }
    
    let jm, jd;
    if (days < 186) {
        jm = 1 + Math.floor(days / 31);
        jd = 1 + (days % 31);
    } else {
        jm = 7 + Math.floor((days - 186) / 30);
        jd = 1 + ((days - 186) % 30);
    }
    
    return { jy, jm, jd };
}

// به‌دست آوردن روز هفته میلادی برای یک تاریخ شمسی با جستجوی کوچک روی تقویم میلادی
// خروجی سازگار با JS Date.getDay(): Sun=0..Sat=6
function getJsWeekdayForJalali(jy, jm, jd) {
    // سال میلادی تخمینی
    const approxGy = jy + 621;
    // از 1 مارس سال قبل تا 1 آوریل سال بعد را جستجو می‌کنیم (کافی برای پوشش سال شمسی)
    const start = new Date(approxGy - 1, 2, 1); // Mar 1
    for (let i = 0; i < 800; i++) {
        const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        const j = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
        if (j.jy === jy && j.jm === jm && j.jd === jd) {
            return d.getDay();
        }
    }
    return null;
}

// تبدیل تاریخ شمسی به میلادی
function jalaliToGregorian(jy, jm, jd) {
    let gy = (jy > 979) ? 1600 : 621;
    jy -= (jy > 979) ? 979 : 0;
    
    let days = (365 * jy) + (Math.floor(jy / 33) * 8) + Math.floor(((jy % 33) + 3) / 4) + 78 + jd;
    
    if (jm < 7) days += (jm - 1) * 31;
    else days += ((jm - 7) * 30) + 186;
    
    const g_leap = (gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0);
    let cycle_days = g_leap ? 366 : 365;
    gy += Math.floor(days / cycle_days);
    days = days % cycle_days;
    
    const g_d_m = g_leap ? [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335] : [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    
    let gm = 0;
    for (let i = 0; i < 12; i++) {
        if (days < g_d_m[i]) {
            gm = i;
            break;
        }
    }
    
    const gd = days - g_d_m[gm - 1] + 1;
    
    return { gy, gm, gd };
}

// نمایش تقویم
function showCalendar(fieldId, inputElement) {
    closeAllCalendars();
    
    const filterGroup = inputElement.closest('.filter-group') || inputElement.closest('.form-group') || inputElement.parentElement;
    if (!filterGroup) {
        console.error('Parent element not found for', fieldId);
        return;
    }
    
    let calendar = filterGroup.querySelector('.calendar-popup');
    if (!calendar) {
        calendar = document.createElement('div');
        calendar.className = 'calendar-popup';
        filterGroup.style.position = 'relative';
        filterGroup.appendChild(calendar);
    }

    // گرفتن تاریخ فعلی input یا امروز (با پشتیبانی از ارقام فارسی/عربی و فرمت های مختلف)
    const parsed = parseJalaliInputDate(inputElement.value);
    let currentYear, currentMonth;
    if (parsed) {
        currentYear = parsed.jy;
        currentMonth = parsed.jm;
    } else {
        const today = new Date();
        const jDate = gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());
        currentYear = jDate.jy;
        currentMonth = jDate.jm;
    }

    // ابتدا بدون نمایش، محتوا را رندر می‌کنیم تا بتوانیم اندازه را محاسبه کنیم
    calendar.classList.remove('open-up');
    renderCalendar(calendar, currentYear, currentMonth, fieldId);
    // برای محاسبه ارتفاع، به صورت موقت نمایش داده شود اما نامرئی
    const prevVisibility = calendar.style.visibility;
    calendar.style.visibility = 'hidden';
    calendar.classList.add('show');

    // محاسبه فضاها
    const calHeight = calendar.offsetHeight;
    const inputRect = inputElement.getBoundingClientRect();
    const spaceBelow = window.innerHeight - inputRect.bottom;
    const spaceAbove = inputRect.top;

    // اگر فضا پایین کمتر از ارتفاع تقویم بود و بالا جا داشت، رو به بالا باز شود
    if (calHeight > spaceBelow && spaceAbove >= calHeight - 10) {
        calendar.classList.add('open-up');
    } else {
        calendar.classList.remove('open-up');
    }

    // نمایش نهایی
    calendar.style.visibility = prevVisibility || '';
}

// رندر تقویم
function renderCalendar(calendarElement, year, month, fieldId) {
    const monthNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 
                       'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
    // ترتیب از شنبه تا جمعه (ستون راست تا چپ در RTL)
    const dayNames = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
    
    let html = `
        <div class="calendar-header">
            <button type="button" onclick="event.preventDefault(); event.stopPropagation(); changeMonth(${year}, ${month}, -1, '${fieldId}')">−</button>
            <span class="calendar-month-year">${monthNames[month - 1]}</span>
            <button type="button" onclick="event.preventDefault(); event.stopPropagation(); changeMonth(${year}, ${month}, 1, '${fieldId}')">+</button>
            <button type="button" onclick="event.preventDefault(); event.stopPropagation(); changeYear(${year}, ${month}, 1, '${fieldId}')">❮</button>
            <span class="calendar-month-year">${toPersianDigits(year)}</span>
            <button type="button" onclick="event.preventDefault(); event.stopPropagation(); changeYear(${year}, ${month}, -1, '${fieldId}')">❯</button>
        </div>
        <div class="calendar-days">
    `;
    
    // هدر روزهای هفته
    dayNames.forEach(day => {
        html += `<div class="calendar-day-header">${day}</div>`;
    });
    
    // محاسبه روز اول ماه (بدون اتکا به jalaliToGregorian)
    const jsWeekday = getJsWeekdayForJalali(year, month, 1);
    // تبدیل روز هفته میلادی به ایندکس آرایه بالا
    // JS: Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6
    // Persian indices (for dayNames above): Sat=0, Sun=1, Mon=2, Tue=3, Wed=4, Thu=5, Fri=6
    let firstDayOfWeek = (jsWeekday !== null) ? ((jsWeekday + 1) % 7) : 0;
    
    // تعداد روزهای ماه
    const daysInMonth = (month <= 6) ? 31 : (month <= 11) ? 30 : (isLeapJalaliYear(year) ? 30 : 29);
    
    // روزهای خالی قبل از اول ماه
    for (let i = 0; i < firstDayOfWeek; i++) {
        html += `<div class="calendar-day other-month"></div>`;
    }
    
    // تاریخ امروز
    const today = new Date();
    const todayJalali = gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());
    
    // روزهای ماه
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = (year === todayJalali.jy && month === todayJalali.jm && day === todayJalali.jd);
        const className = isToday ? 'calendar-day today' : 'calendar-day';
        html += `<div class="${className}" onclick="event.stopPropagation(); selectDate(${year}, ${month}, ${day}, '${fieldId}')">${toPersianDigits(day)}</div>`;
    }
    
    html += `
        </div>
        <div class="calendar-footer">
            <button type="button" onclick="event.preventDefault(); event.stopPropagation(); selectToday('${fieldId}')">امروز</button>
        </div>
    `;
    calendarElement.innerHTML = html;
}

// تغییر سال
function changeYear(year, month, direction, fieldId) {
    year += direction;
    
    const inputElement = document.getElementById(fieldId);
    const filterGroup = inputElement.closest('.filter-group') || inputElement.closest('.form-group') || inputElement.parentElement;
    const calendar = filterGroup.querySelector('.calendar-popup');
    
    renderCalendar(calendar, year, month, fieldId);
}

// تغییر ماه
function changeMonth(year, month, direction, fieldId) {
    month += direction;
    if (month < 1) {
        month = 12;
        year--;
    } else if (month > 12) {
        month = 1;
        year++;
    }
    
    const inputElement = document.getElementById(fieldId);
    const filterGroup = inputElement.closest('.filter-group') || inputElement.closest('.form-group') || inputElement.parentElement;
    const calendar = filterGroup.querySelector('.calendar-popup');
    
    renderCalendar(calendar, year, month, fieldId);
}

// انتخاب تاریخ
function selectDate(year, month, day, fieldId) {
    const selectedDate = `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
    document.getElementById(fieldId).value = selectedDate;
    closeAllCalendars();
}

// انتخاب تاریخ امروز
function selectToday(fieldId) {
    const today = new Date();
    const todayJalali = gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());
    selectDate(todayJalali.jy, todayJalali.jm, todayJalali.jd, fieldId);
}

// بستن همه تقویم‌ها
function closeAllCalendars() {
    document.querySelectorAll('.calendar-popup').forEach(cal => {
        cal.classList.remove('show');
    });
}

/**
 * راه‌اندازی تقویم برای یک فیلد
 * @param {string} fieldId - شناسه فیلد input
 * @param {boolean} setDefaultToday - آیا تاریخ امروز به عنوان پیش‌فرض تنظیم شود
 */
function initJalaliDatePicker(fieldId, setDefaultToday = true) {
    const field = document.getElementById(fieldId);
    if (!field) {
        console.error('Field not found:', fieldId);
        return;
    }
    
    
    // تنظیم تاریخ امروز
    if (setDefaultToday && !field.value) {
        const today = new Date();
        const jDate = gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());
        const todayJalaali = `${jDate.jy}/${String(jDate.jm).padStart(2, '0')}/${String(jDate.jd).padStart(2, '0')}`;
        field.value = todayJalaali;
        field.placeholder = 'مثال: ' + todayJalaali;
    }
    
    field.title = 'فرمت: سال/ماه/روز (مثال: 1404/08/14)';
    field.dir = 'ltr';
    
    // اضافه کردن رویداد کلیک برای نمایش تقویم
    field.addEventListener('click', function(e) {
        e.stopPropagation();
        showCalendar(fieldId, e.target);
    });
    
    // جلوگیری از بسته شدن تقویم هنگام کلیک روی input
    // از باز شدن خودکار روی فوکوس جلوگیری می‌کنیم تا هنگام باز کردن مودال، تقویم ناخواسته باز نشود
}

/**
 * راه‌اندازی تقویم برای چندین فیلد به صورت خودکار
 * @param {Array<string>} fieldIds - آرایه‌ای از شناسه‌های فیلدها
 * @param {boolean} setDefaultToday - آیا تاریخ امروز به عنوان پیش‌فرض تنظیم شود
 */
function initJalaliDatePickers(fieldIds, setDefaultToday = true) {
    fieldIds.forEach(fieldId => {
        initJalaliDatePicker(fieldId, setDefaultToday);
    });
    
    // بستن تقویم با کلیک در خارج از آن
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.filter-group') && 
            !e.target.closest('.form-group') && 
            !e.target.closest('.calendar-popup')) {
            closeAllCalendars();
        }
    });
}
