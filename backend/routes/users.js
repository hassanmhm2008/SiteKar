const express = require('express');
const router = express.Router();
const db = require('../db');

// دریافت لیست تمام کاربران
router.get('/', async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT u.*, d.name as department_name, 
                    s.full_name as supervisor_name
             FROM users u
             LEFT JOIN departments d ON u.department_id = d.id
             LEFT JOIN users s ON u.supervisor_id = s.id
             ORDER BY u.created_at DESC`
        );

        // حذف رمز عبور از پاسخ
        users.forEach(user => delete user.password);

        console.log('تعداد کاربران:', users.length);
        if (users.length > 0) {
            console.log('نمونه کاربر اول:', users[0]);
        }

        res.json({ 
            success: true, 
            users: users 
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در دریافت لیست کاربران' 
        });
    }
});

// دریافت کاربران یک واحد
router.get('/department/:departmentId', async (req, res) => {
    try {
        const { departmentId } = req.params;

        const [users] = await db.query(
            `SELECT u.*, d.name as department_name, s.full_name as supervisor_name
             FROM users u
             LEFT JOIN departments d ON u.department_id = d.id
             LEFT JOIN users s ON u.supervisor_id = s.id
             WHERE u.department_id = ?
             ORDER BY u.role, u.full_name`,
            [departmentId]
        );

        users.forEach(user => delete user.password);

        res.json({ 
            success: true, 
            users: users 
        });
    } catch (error) {
        console.error('Get department users error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در دریافت کاربران واحد' 
        });
    }
});

// افزودن کاربر جدید
router.post('/', async (req, res) => {
    try {
        const { username, password, full_name, email, phone, role, department_id, supervisor_id } = req.body;

        console.log('=== ایجاد کاربر جدید ===');
        console.log('داده‌های دریافتی:', { username, password: '***', full_name, email, phone, role, department_id, supervisor_id });

        if (!username || !password || !full_name || !role || !department_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'فیلدهای الزامی را پر کنید' 
            });
        }

        // بررسی تکراری بودن نام کاربری
        const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(409).json({ 
                success: false, 
                message: 'این نام کاربری قبلاً استفاده شده است' 
            });
        }

        const query = `INSERT INTO users (username, password, full_name, email, phone, role, department_id, supervisor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [username, password, full_name, email, phone, role, department_id, supervisor_id || null];
        
        console.log('Query:', query);
        console.log('Values:', values);

        const [result] = await db.query(query, values);

        console.log('نتیجه ایجاد:', result);

        res.status(201).json({ 
            success: true, 
            message: 'کاربر با موفقیت ایجاد شد', 
            data: { id: result.insertId } 
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در ایجاد کاربر' 
        });
    }
});

// ویرایش کاربر
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        console.log('=== ویرایش کاربر ===');
        console.log('شناسه کاربر:', id);
        console.log('داده‌های دریافتی:', updateData);

        // حذف فیلدهای undefined یا null
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        // اگر هیچ فیلدی برای آپدیت نباشد
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'هیچ فیلدی برای به‌روزرسانی ارسال نشده است' 
            });
        }

        // ساخت query به صورت پویا
        const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updateData);
        values.push(id);

        const query = `UPDATE users SET ${fields} WHERE id = ?`;
        console.log('Query:', query);
        console.log('Values:', values);

        const [result] = await db.query(query, values);

        console.log('نتیجه آپدیت:', result);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'کاربر یافت نشد' 
            });
        }

        res.json({ 
            success: true, 
            message: 'کاربر با موفقیت ویرایش شد' 
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در ویرایش کاربر' 
        });
    }
});

// حذف کاربر
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // جلوگیری از حذف ادمین اصلی
        if (id === '1') {
            return res.status(403).json({ 
                success: false, 
                message: 'امکان حذف ادمین اصلی وجود ندارد' 
            });
        }

        const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'کاربر یافت نشد' 
            });
        }

        res.json({ 
            success: true, 
            message: 'کاربر با موفقیت حذف شد' 
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در حذف کاربر' 
        });
    }
});

module.exports = router;
