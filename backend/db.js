const mysql = require('mysql2');
require('dotenv').config();

// ایجاد Pool برای مدیریت بهتر اتصالات
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sitekar_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
});

// استفاده از Promise برای سهولت کار
const promisePool = pool.promise();

// تست اتصال
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ خطا در اتصال به پایگاه داده:', err.message);
        return;
    }
    console.log('✅ اتصال به پایگاه داده MySQL برقرار شد');
    connection.release();
});

module.exports = promisePool;
