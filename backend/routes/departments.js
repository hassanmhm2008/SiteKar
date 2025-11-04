const express = require('express');
const router = express.Router();
const db = require('../db');

// دریافت لیست واحدها
router.get('/', async (req, res) => {
    try {
        const [departments] = await db.query(
            `SELECT d.*, u.full_name as manager_name,
                    (SELECT COUNT(*) FROM users WHERE department_id = d.id) as user_count
             FROM departments d
             LEFT JOIN users u ON d.manager_id = u.id
             ORDER BY d.name`
        );

        res.json({ 
            success: true, 
            departments: departments 
        });
    } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در دریافت لیست واحدها' 
        });
    }
});

// افزودن واحد جدید
router.post('/', async (req, res) => {
    try {
        const { name, description, manager_id } = req.body;

        if (!name) {
            return res.status(400).json({ 
                success: false, 
                message: 'نام واحد الزامی است' 
            });
        }

        const [result] = await db.query(
            'INSERT INTO departments (name, description, manager_id) VALUES (?, ?, ?)',
            [name, description, manager_id || null]
        );

        res.status(201).json({ 
            success: true, 
            message: 'واحد با موفقیت ایجاد شد', 
            data: { id: result.insertId } 
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ 
                success: false, 
                message: 'این نام واحد قبلاً استفاده شده است' 
            });
        }
        console.error('Create department error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در ایجاد واحد' 
        });
    }
});

// ویرایش واحد
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, manager_id } = req.body;

        const [result] = await db.query(
            'UPDATE departments SET name = ?, description = ?, manager_id = ? WHERE id = ?',
            [name, description, manager_id || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'واحد یافت نشد' 
            });
        }

        res.json({ 
            success: true, 
            message: 'واحد با موفقیت ویرایش شد' 
        });
    } catch (error) {
        console.error('Update department error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در ویرایش واحد' 
        });
    }
});

// حذف واحد
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // بررسی اینکه آیا کاربری در این واحد وجود دارد
        const [users] = await db.query('SELECT COUNT(*) as count FROM users WHERE department_id = ?', [id]);
        
        if (users[0].count > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'امکان حذف واحد وجود ندارد. ابتدا کاربران را به واحد دیگری منتقل کنید' 
            });
        }

        const [result] = await db.query('DELETE FROM departments WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'واحد یافت نشد' 
            });
        }

        res.json({ 
            success: true, 
            message: 'واحد با موفقیت حذف شد' 
        });
    } catch (error) {
        console.error('Delete department error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در حذف واحد' 
        });
    }
});

module.exports = router;
