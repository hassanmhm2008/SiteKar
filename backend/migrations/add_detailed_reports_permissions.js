const db = require('../db');

async function addDetailedReportsPermissions() {
    try {
        console.log('شروع اضافه کردن دسترسی‌های جداگانه برای گزارش‌ها...\n');
        
        // حذف دسترسی کلی reports
        console.log('🗑️  حذف دسترسی کلی reports...');
        await db.query('DELETE FROM permissions WHERE page_name = ?', ['reports']);
        console.log('✓ حذف شد\n');
        
        const reportPages = [
            { name: 'reports-requests', title: 'گزارش درخواست‌ها' },
            { name: 'reports-departments', title: 'گزارش واحدها' },
            { name: 'reports-products', title: 'گزارش محصولات' }
        ];
        
        const permissions = [
            // مدیر: دسترسی به همه گزارش‌ها
            { role: 'مدیر', page: 'reports-requests', access: 1 },
            { role: 'مدیر', page: 'reports-departments', access: 1 },
            { role: 'مدیر', page: 'reports-products', access: 1 },
            
            // رئیس واحد: دسترسی به همه گزارش‌ها
            { role: 'رئیس واحد', page: 'reports-requests', access: 1 },
            { role: 'رئیس واحد', page: 'reports-departments', access: 1 },
            { role: 'رئیس واحد', page: 'reports-products', access: 1 },
            
            // کارمند: بدون دسترسی
            { role: 'کارمند', page: 'reports-requests', access: 0 },
            { role: 'کارمند', page: 'reports-departments', access: 0 },
            { role: 'کارمند', page: 'reports-products', access: 0 },
            
            // کارشناس: بدون دسترسی
            { role: 'کارشناس', page: 'reports-requests', access: 0 },
            { role: 'کارشناس', page: 'reports-departments', access: 0 },
            { role: 'کارشناس', page: 'reports-products', access: 0 },
            
            // انبار دار: فقط گزارش محصولات
            { role: 'انبار دار', page: 'reports-requests', access: 0 },
            { role: 'انبار دار', page: 'reports-departments', access: 0 },
            { role: 'انبار دار', page: 'reports-products', access: 1 }
        ];

        console.log('📝 اضافه کردن دسترسی‌های جدید:\n');
        
        for (const perm of permissions) {
            const pageTitle = reportPages.find(p => p.name === perm.page)?.title || '';
            await db.query(
                'INSERT INTO permissions (role_name, page_name, page_title, has_access) VALUES (?, ?, ?, ?)',
                [perm.role, perm.page, pageTitle, perm.access]
            );
            const accessText = perm.access ? '✅ دارد' : '❌ ندارد';
            console.log(`  ${perm.role} → ${pageTitle}: ${accessText}`);
        }

        console.log('\n✅ تمام دسترسی‌ها با موفقیت اضافه شدند!');
        console.log('\n📊 خلاصه دسترسی‌ها:');
        console.log('  مدیر: همه گزارش‌ها ✅');
        console.log('  رئیس واحد: همه گزارش‌ها ✅');
        console.log('  انبار دار: فقط گزارش محصولات ✅');
        console.log('  کارمند و کارشناس: هیچ‌کدام ❌');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ خطا:', error.message);
        process.exit(1);
    }
}

addDetailedReportsPermissions();
