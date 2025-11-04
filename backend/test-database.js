const mysql = require('mysql2/promise');
require('dotenv').config();

// رنگ‌ها برای خروجی
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
    console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function error(message) {
    console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function info(message) {
    console.log(`${colors.cyan}ℹ${colors.reset} ${message}`);
}

async function testDatabase() {
    let connection;
    let allTestsPassed = true;

    try {
        log('\n=== شروع تست دیتابیس ===\n', 'bold');

        // تست 1: اتصال به MySQL
        log('1. تست اتصال به MySQL...', 'cyan');
        try {
            connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                port: process.env.DB_PORT || 3306
            });
            success('اتصال به MySQL موفق');
        } catch (err) {
            error('خطا در اتصال به MySQL: ' + err.message);
            allTestsPassed = false;
            return;
        }

        // تست 2: وجود دیتابیس
        log('\n2. بررسی وجود دیتابیس sitekar_db...', 'cyan');
        try {
            const [databases] = await connection.query('SHOW DATABASES LIKE "sitekar_db"');
            if (databases.length > 0) {
                success('دیتابیس sitekar_db وجود دارد');
            } else {
                error('دیتابیس sitekar_db یافت نشد');
                allTestsPassed = false;
                return;
            }
        } catch (err) {
            error('خطا در بررسی دیتابیس: ' + err.message);
            allTestsPassed = false;
            return;
        }

        // انتخاب دیتابیس
        await connection.query('USE sitekar_db');

        // تست 3: بررسی جداول
        log('\n3. بررسی جداول...', 'cyan');
        const requiredTables = [
            'departments',
            'users',
            'products',
            'tasks',
            'requests',
            'request_items',
            'comments'
        ];

        const [tables] = await connection.query('SHOW TABLES');
        const existingTables = tables.map(t => Object.values(t)[0]);

        let allTablesExist = true;
        for (const table of requiredTables) {
            if (existingTables.includes(table)) {
                success(`جدول ${table} موجود است`);
            } else {
                error(`جدول ${table} یافت نشد`);
                allTablesExist = false;
                allTestsPassed = false;
            }
        }

        if (!allTablesExist) {
            error('برخی جداول وجود ندارند. لطفاً دوباره database.sql را import کنید');
            return;
        }

        // تست 4: بررسی ساختار جدول departments
        log('\n4. بررسی ساختار جدول departments...', 'cyan');
        const [deptColumns] = await connection.query('DESCRIBE departments');
        const deptRequiredColumns = ['id', 'name', 'description', 'manager_id', 'created_at', 'updated_at'];
        checkColumns('departments', deptColumns, deptRequiredColumns);

        // تست 5: بررسی ساختار جدول users
        log('\n5. بررسی ساختار جدول users...', 'cyan');
        const [userColumns] = await connection.query('DESCRIBE users');
        const userRequiredColumns = ['id', 'username', 'password', 'full_name', 'email', 'phone', 'role', 'department_id', 'supervisor_id', 'is_active'];
        checkColumns('users', userColumns, userRequiredColumns);

        // تست 6: بررسی ساختار جدول products
        log('\n6. بررسی ساختار جدول products...', 'cyan');
        const [prodColumns] = await connection.query('DESCRIBE products');
        const prodRequiredColumns = ['id', 'code', 'name', 'description', 'category', 'unit', 'is_active'];
        checkColumns('products', prodColumns, prodRequiredColumns);

        // تست 7: بررسی ساختار جدول tasks
        log('\n7. بررسی ساختار جدول tasks...', 'cyan');
        const [taskColumns] = await connection.query('DESCRIBE tasks');
        const taskRequiredColumns = ['id', 'title', 'description', 'priority', 'status', 'created_by', 'assigned_to', 'department_id', 'deadline', 'approved_by'];
        checkColumns('tasks', taskColumns, taskRequiredColumns);

        // تست 8: بررسی ساختار جدول requests
        log('\n8. بررسی ساختار جدول requests...', 'cyan');
        const [reqColumns] = await connection.query('DESCRIBE requests');
        const reqRequiredColumns = ['id', 'request_number', 'user_id', 'department_id', 'status', 'total_items', 'approved_by'];
        checkColumns('requests', reqColumns, reqRequiredColumns);

        // تست 9: بررسی داده‌های اولیه
        log('\n9. بررسی داده‌های اولیه...', 'cyan');

        // بررسی واحدها
        const [departments] = await connection.query('SELECT COUNT(*) as count FROM departments');
        if (departments[0].count > 0) {
            success(`${departments[0].count} واحد در دیتابیس موجود است`);
            const [deptList] = await connection.query('SELECT name FROM departments');
            deptList.forEach(d => info(`  - ${d.name}`));
        } else {
            error('هیچ واحدی در دیتابیس وجود ندارد');
            allTestsPassed = false;
        }

        // بررسی کاربر ادمین
        const [adminUser] = await connection.query('SELECT * FROM users WHERE username = "admin"');
        if (adminUser.length > 0) {
            success('کاربر admin موجود است');
            info(`  - نام: ${adminUser[0].full_name}`);
            info(`  - نقش: ${adminUser[0].role}`);
            info(`  - ایمیل: ${adminUser[0].email}`);
        } else {
            error('کاربر admin یافت نشد');
            allTestsPassed = false;
        }

        // بررسی کالاها
        const [products] = await connection.query('SELECT COUNT(*) as count FROM products');
        if (products[0].count > 0) {
            success(`${products[0].count} کالا در دیتابیس موجود است`);
        } else {
            error('هیچ کالایی در دیتابیس وجود ندارد');
            allTestsPassed = false;
        }

        // تست 10: بررسی Foreign Keys
        log('\n10. بررسی Foreign Keys...', 'cyan');
        const [fks] = await connection.query(`
            SELECT 
                TABLE_NAME,
                COLUMN_NAME,
                CONSTRAINT_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = 'sitekar_db'
            AND REFERENCED_TABLE_NAME IS NOT NULL
        `);

        if (fks.length > 0) {
            success(`${fks.length} Foreign Key یافت شد`);
            fks.forEach(fk => {
                info(`  - ${fk.TABLE_NAME}.${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
            });
        } else {
            error('هیچ Foreign Key یافت نشد');
            allTestsPassed = false;
        }

        // تست 11: بررسی Indexes
        log('\n11. بررسی Indexes...', 'cyan');
        const [indexes] = await connection.query(`
            SELECT DISTINCT TABLE_NAME, INDEX_NAME
            FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_SCHEMA = 'sitekar_db'
            AND INDEX_NAME != 'PRIMARY'
        `);

        if (indexes.length > 0) {
            success(`${indexes.length} Index یافت شد`);
        } else {
            error('هیچ Index یافت نشد');
        }

        // تست 12: تست Insert و Delete
        log('\n12. تست عملیات Insert و Delete...', 'cyan');
        try {
            // تست Insert
            await connection.query(`
                INSERT INTO departments (name, description) 
                VALUES ('تست واحد', 'این یک واحد تستی است')
            `);
            success('Insert موفق');

            // تست Select
            const [testDept] = await connection.query('SELECT * FROM departments WHERE name = "تست واحد"');
            if (testDept.length > 0) {
                success('Select موفق');
            } else {
                error('Select ناموفق');
                allTestsPassed = false;
            }

            // تست Delete
            await connection.query('DELETE FROM departments WHERE name = "تست واحد"');
            success('Delete موفق');
        } catch (err) {
            error('خطا در تست عملیات: ' + err.message);
            allTestsPassed = false;
        }

        // تست 13: بررسی Character Set
        log('\n13. بررسی Character Set...', 'cyan');
        const [charset] = await connection.query(`
            SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME
            FROM INFORMATION_SCHEMA.SCHEMATA
            WHERE SCHEMA_NAME = 'sitekar_db'
        `);

        if (charset[0].DEFAULT_CHARACTER_SET_NAME === 'utf8mb4') {
            success('Character Set صحیح است (utf8mb4)');
        } else {
            error(`Character Set نادرست است: ${charset[0].DEFAULT_CHARACTER_SET_NAME}`);
            allTestsPassed = false;
        }

        // نتیجه نهایی
        log('\n' + '='.repeat(50), 'bold');
        if (allTestsPassed) {
            log('✓ تمام تست‌ها با موفقیت انجام شد!', 'green');
            log('دیتابیس شما آماده استفاده است.', 'green');
        } else {
            log('✗ برخی تست‌ها ناموفق بودند', 'red');
            log('لطفاً فایل database.sql را دوباره import کنید', 'yellow');
        }
        log('='.repeat(50) + '\n', 'bold');

    } catch (err) {
        error('خطای غیرمنتظره: ' + err.message);
        allTestsPassed = false;
    } finally {
        if (connection) {
            await connection.end();
        }
    }

    process.exit(allTestsPassed ? 0 : 1);
}

function checkColumns(tableName, actualColumns, requiredColumns) {
    const actualColumnNames = actualColumns.map(c => c.Field);
    let allColumnsExist = true;

    for (const col of requiredColumns) {
        if (actualColumnNames.includes(col)) {
            success(`  ستون ${col} موجود است`);
        } else {
            error(`  ستون ${col} یافت نشد`);
            allColumnsExist = false;
        }
    }

    if (!allColumnsExist) {
        error(`ساختار جدول ${tableName} کامل نیست`);
    }
}

// اجرای تست
testDatabase();
