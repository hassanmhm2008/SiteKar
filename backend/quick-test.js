const mysql = require('mysql2/promise');
require('dotenv').config();

async function quickTest() {
    console.log('\n🔍 تست سریع دیتابیس...\n');
    
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'sitekar_db',
            port: process.env.DB_PORT || 3306
        });

        console.log('✓ اتصال به دیتابیس موفق\n');

        // تعداد رکوردها
        const [depts] = await connection.query('SELECT COUNT(*) as count FROM departments');
        const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
        const [products] = await connection.query('SELECT COUNT(*) as count FROM products');
        const [tasks] = await connection.query('SELECT COUNT(*) as count FROM tasks');
        const [requests] = await connection.query('SELECT COUNT(*) as count FROM requests');

        console.log('📊 آمار دیتابیس:');
        console.log(`   واحدها: ${depts[0].count}`);
        console.log(`   کاربران: ${users[0].count}`);
        console.log(`   کالاها: ${products[0].count}`);
        console.log(`   کارها: ${tasks[0].count}`);
        console.log(`   درخواست‌ها: ${requests[0].count}`);

        // کاربران
        console.log('\n👥 لیست کاربران:');
        const [userList] = await connection.query('SELECT username, full_name, role FROM users');
        userList.forEach(u => {
            console.log(`   - ${u.full_name} (${u.username}) - ${u.role}`);
        });

        // واحدها
        console.log('\n🏢 لیست واحدها:');
        const [deptList] = await connection.query('SELECT name, description FROM departments');
        deptList.forEach(d => {
            console.log(`   - ${d.name}: ${d.description || 'بدون توضیحات'}`);
        });

        // کالاها (5 عدد اول)
        console.log('\n📦 نمونه کالاها:');
        const [prodList] = await connection.query('SELECT code, name, category FROM products LIMIT 5');
        prodList.forEach(p => {
            console.log(`   - ${p.code}: ${p.name} (${p.category || 'بدون دسته'})`);
        });

        await connection.end();

        console.log('\n✅ دیتابیس کاملاً سالم است و آماده استفاده!\n');
        process.exit(0);

    } catch (err) {
        console.error('\n❌ خطا:', err.message);
        console.error('\n💡 راه‌حل‌ها:');
        console.error('   1. مطمئن شوید MySQL در حال اجراست');
        console.error('   2. فایل .env را بررسی کنید');
        console.error('   3. فایل database.sql را دوباره import کنید\n');
        process.exit(1);
    }
}

quickTest();
