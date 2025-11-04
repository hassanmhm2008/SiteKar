const express = require('express');
const router = express.Router();
const db = require('../db');

// دریافت تمام دسترسی‌ها
router.get('/', async (req, res) => {
    try {
        const [permissions] = await db.query(
            `SELECT * FROM permissions ORDER BY role_name, page_name`
        );

        res.json({ 
            success: true, 
            permissions: permissions 
        });
    } catch (error) {
        console.error('Get permissions error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در دریافت دسترسی‌ها' 
        });
    }
});

// دریافت دسترسی‌های یک نقش خاص
router.get('/role/:role', async (req, res) => {
    try {
        const { role } = req.params;
        
        const [permissions] = await db.query(
            `SELECT * FROM permissions WHERE role_name = ? ORDER BY page_name`,
            [role]
        );

        res.json({ 
            success: true, 
            permissions: permissions 
        });
    } catch (error) {
        console.error('Get role permissions error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در دریافت دسترسی‌های نقش' 
        });
    }
});

// بررسی دسترسی یک نقش به یک صفحه
router.get('/check/:role/:page', async (req, res) => {
    try {
        const { role, page } = req.params;
        
        const [permissions] = await db.query(
            `SELECT has_access FROM permissions WHERE role_name = ? AND page_name = ?`,
            [role, page]
        );

        if (permissions.length === 0) {
            return res.json({ 
                success: true, 
                hasAccess: false 
            });
        }

        res.json({ 
            success: true, 
            hasAccess: permissions[0].has_access === 1 
        });
    } catch (error) {
        console.error('Check permission error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در بررسی دسترسی' 
        });
    }
});

// به‌روزرسانی دسترسی
router.put('/', async (req, res) => {
    try {
        const { role_name, page_name, has_access } = req.body;

        if (!role_name || !page_name || has_access === undefined) {
            return res.status(400).json({ 
                success: false, 
                message: 'اطلاعات ناقص است' 
            });
        }

        const [result] = await db.query(
            `UPDATE permissions SET has_access = ? WHERE role_name = ? AND page_name = ?`,
            [has_access, role_name, page_name]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'دسترسی یافت نشد' 
            });
        }

        res.json({ 
            success: true, 
            message: 'دسترسی با موفقیت به‌روزرسانی شد' 
        });
    } catch (error) {
        console.error('Update permission error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در به‌روزرسانی دسترسی' 
        });
    }
});

// به‌روزرسانی دسترسی‌های یک نقش (چندتایی)
router.put('/bulk', async (req, res) => {
    try {
        const { permissions } = req.body;

        if (!permissions || !Array.isArray(permissions)) {
            return res.status(400).json({ 
                success: false, 
                message: 'فرمت اطلاعات نامعتبر است' 
            });
        }

        // استفاده از transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            for (const perm of permissions) {
                await connection.query(
                    `UPDATE permissions SET has_access = ? WHERE role_name = ? AND page_name = ?`,
                    [perm.has_access, perm.role_name, perm.page_name]
                );
            }

            await connection.commit();
            connection.release();

            res.json({ 
                success: true, 
                message: 'دسترسی‌ها با موفقیت به‌روزرسانی شدند' 
            });
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Bulk update permissions error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در به‌روزرسانی دسترسی‌ها' 
        });
    }
});

module.exports = router;
