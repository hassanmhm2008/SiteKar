const express = require('express');
const router = express.Router();
const db = require('../db');

// گزارش لیست تمام درخواست‌ها بر اساس وضعیت و بازه تاریخ
router.get('/requests', async (req, res) => {
    try {
        const { status, fromDate, toDate } = req.query;

        let query = `
            SELECT r.*, 
                   u.full_name as user_name,
                   d.name as department_name
            FROM requests r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN departments d ON r.department_id = d.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND r.status = ?';
            params.push(status);
        }

        if (fromDate) {
            query += ' AND DATE(r.created_at) >= ?';
            params.push(fromDate);
        }

        if (toDate) {
            query += ' AND DATE(r.created_at) <= ?';
            params.push(toDate);
        }

        query += ' ORDER BY r.created_at DESC';

        const [requests] = await db.query(query, params);

        res.json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Get requests report error:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در دریافت گزارش درخواست‌ها'
        });
    }
});

// گزارش تعداد درخواست‌ها بر اساس واحد
router.get('/by-department', async (req, res) => {
    try {
        const { fromDate, toDate, status } = req.query;

        const params = [];
        const joinConditions = ['d.id = r.department_id'];
        
        if (status) {
            joinConditions.push('r.status = ?');
            params.push(status);
        }

        let query = `
            SELECT 
                d.name as department_name,
                COUNT(r.id) as request_count,
                SUM(r.total_items) as total_items
            FROM departments d
            LEFT JOIN requests r ON ${joinConditions.join(' AND ')}
        `;

        const conditions = [];
        if (fromDate) {
            conditions.push('DATE(r.created_at) >= ?');
            params.push(fromDate);
        }

        if (toDate) {
            conditions.push('DATE(r.created_at) <= ?');
            params.push(toDate);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' GROUP BY d.id, d.name ORDER BY request_count DESC';

        const [departments] = await db.query(query, params);

        res.json({
            success: true,
            data: departments
        });
    } catch (error) {
        console.error('Get departments report error:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در دریافت گزارش واحدها'
        });
    }
});

// گزارش محصولات تجمیعی
router.get('/products-aggregate', async (req, res) => {
    try {
        const { status, fromDate, toDate } = req.query;

        let query = `
            SELECT 
                p.name as product_name,
                p.code as product_code,
                SUM(ri.quantity) as total_quantity,
                COUNT(DISTINCT r.id) as request_count
            FROM products p
            INNER JOIN request_items ri ON p.id = ri.product_id
            INNER JOIN requests r ON ri.request_id = r.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND r.status = ?';
            params.push(status);
        }

        if (fromDate) {
            query += ' AND DATE(r.created_at) >= ?';
            params.push(fromDate);
        }

        if (toDate) {
            query += ' AND DATE(r.created_at) <= ?';
            params.push(toDate);
        }

        query += ' GROUP BY p.id, p.name, p.code ORDER BY total_quantity DESC';

        const [products] = await db.query(query, params);

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Get products aggregate report error:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در دریافت گزارش محصولات'
        });
    }
});

module.exports = router;
