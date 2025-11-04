const express = require('express');
const router = express.Router();
const db = require('../db');

// دریافت لیست کالاها
router.get('/', async (req, res) => {
    try {
        const { category, active } = req.query;
        
        let query = 'SELECT * FROM products WHERE 1=1';
        const params = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        if (active !== undefined) {
            query += ' AND is_active = ?';
            params.push(active === 'true');
        }

        query += ' ORDER BY category, name';

        const [products] = await db.query(query, params);

        res.json({ 
            success: true, 
            products: products 
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در دریافت لیست کالاها' 
        });
    }
});

// دریافت دسته‌بندی‌ها
router.get('/categories', async (req, res) => {
    try {
        const [categories] = await db.query(
            'SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category'
        );

        res.json({ 
            success: true, 
            categories: categories.map(c => c.category) 
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در دریافت دسته‌بندی‌ها' 
        });
    }
});

// افزودن کالا (فقط ادمین)
router.post('/', async (req, res) => {
    try {
        const { code, name, description, category, unit } = req.body;

        if (!code || !name) {
            return res.status(400).json({ 
                success: false, 
                message: 'کد و نام کالا الزامی است' 
            });
        }

        const [result] = await db.query(
            'INSERT INTO products (code, name, description, category, unit) VALUES (?, ?, ?, ?, ?)',
            [code, name, description, category, unit || 'عدد']
        );

        res.status(201).json({ 
            success: true, 
            message: 'کالا با موفقیت ایجاد شد', 
            data: { id: result.insertId } 
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ 
                success: false, 
                message: 'این کد کالا قبلاً استفاده شده است' 
            });
        }
        console.error('Create product error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در ایجاد کالا' 
        });
    }
});

// ویرایش کالا
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { code, name, description, category, unit, is_active } = req.body;

        const [result] = await db.query(
            `UPDATE products 
             SET code = ?, name = ?, description = ?, category = ?, unit = ?, is_active = ?
             WHERE id = ?`,
            [code, name, description, category, unit, is_active !== undefined ? is_active : true, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'کالا یافت نشد' 
            });
        }

        res.json({ 
            success: true, 
            message: 'کالا با موفقیت ویرایش شد' 
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در ویرایش کالا' 
        });
    }
});

// حذف کالا
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'کالا یافت نشد' 
            });
        }

        res.json({ 
            success: true, 
            message: 'کالا با موفقیت حذف شد' 
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در حذف کالا' 
        });
    }
});

module.exports = router;
