const db = require('../db');

async function addReportsPermissions() {
    try {
        console.log('شروع اضافه کردن دسترسی‌های صفحه گزارش‌ها...');
        
        const permissions = [
            { role: 'مدیر', page: 'reports', access: 1 },
            { role: 'رئیس واحد', page: 'reports', access: 1 },
            { role: 'کارمند', page: 'reports', access: 0 },
            { role: 'کارشناس', page: 'reports', access: 0 },
            { role: 'انبار دار', page: 'reports', access: 0 }
        ];

        for (const perm of permissions) {
            await db.query(
                'INSERT INTO permissions (role_name, page_name, has_access) VALUES (?, ?, ?)',
                [perm.role, perm.page, perm.access]
            );
            console.log(`✓ ${perm.role}: ${perm.access ? 'دارد' : 'ندارد'}`);
        }

        console.log('\n✅ تمام دسترسی‌ها با موفقیت اضافه شدند!');
        process.exit(0);
    } catch (error) {
        console.error('❌ خطا:', error.message);
        process.exit(1);
    }
}

addReportsPermissions();
