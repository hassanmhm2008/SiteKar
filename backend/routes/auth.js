const express = require('express');
const router = express.Router();
const db = require('../db');

// ورود کاربر
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'نام کاربری و رمز عبور الزامی است' 
            });
        }

        const [users] = await db.query(
            `SELECT u.*, d.name as department_name 
             FROM users u 
             LEFT JOIN departments d ON u.department_id = d.id 
             WHERE u.username = ? AND u.password = ? AND u.is_active = TRUE`,
            [username, password]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'نام کاربری یا رمز عبور اشتباه است' 
            });
        }

        const user = users[0];
        delete user.password; // حذف رمز عبور از پاسخ

        res.json({ 
            success: true, 
            message: 'ورود موفق', 
            user: user 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در ورود به سیستم' 
        });
    }
});

// دریافت اطلاعات کاربر جاری
router.get('/me/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const [users] = await db.query(
            `SELECT u.*, d.name as department_name 
             FROM users u 
             LEFT JOIN departments d ON u.department_id = d.id 
             WHERE u.id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'کاربر یافت نشد' 
            });
        }

        const user = users[0];
        delete user.password;

        res.json({ 
            success: true, 
            user: user 
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در دریافت اطلاعات کاربر' 
        });
    }
});

module.exports = router;
