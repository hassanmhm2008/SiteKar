const express = require('express');
const router = express.Router();
const db = require('../db');

// دریافت لیست کارها
router.get('/', async (req, res) => {
    try {
        const { status, userId, departmentId } = req.query;
        
        let query = `
            SELECT t.*, 
                   creator.full_name as creator_name,
                   assignee.full_name as assignee_name,
                   approver.full_name as approver_name,
                   d.name as department_name
            FROM tasks t
            LEFT JOIN users creator ON t.created_by = creator.id
            LEFT JOIN users assignee ON t.assigned_to = assignee.id
            LEFT JOIN users approver ON t.approved_by = approver.id
            LEFT JOIN departments d ON t.department_id = d.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND t.status = ?';
            params.push(status);
        }

        if (userId) {
            query += ' AND (t.created_by = ? OR t.assigned_to = ?)';
            params.push(userId, userId);
        }

        if (departmentId) {
            query += ' AND t.department_id = ?';
            params.push(departmentId);
        }

        query += ' ORDER BY t.created_at DESC';

        const [tasks] = await db.query(query, params);

        res.json({ 
            success: true, 
            data: tasks 
        });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در دریافت لیست کارها' 
        });
    }
});

// دریافت کارهای در انتظار تایید کاربر
router.get('/pending/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const [tasks] = await db.query(
            `SELECT t.*, 
                    creator.full_name as creator_name,
                    assignee.full_name as assignee_name,
                    d.name as department_name
             FROM tasks t
             LEFT JOIN users creator ON t.created_by = creator.id
             LEFT JOIN users assignee ON t.assigned_to = assignee.id
             LEFT JOIN departments d ON t.department_id = d.id
             WHERE t.assigned_to = ? AND t.status = 'در انتظار تایید'
             ORDER BY t.created_at DESC`,
            [userId]
        );

        res.json({ 
            success: true, 
            data: tasks 
        });
    } catch (error) {
        console.error('Get pending tasks error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در دریافت کارهای در انتظار تایید' 
        });
    }
});

// ایجاد کار جدید
router.post('/', async (req, res) => {
    try {
        const { title, description, priority, assigned_to, department_id, deadline, created_by } = req.body;

        if (!title || !assigned_to || !created_by) {
            return res.status(400).json({ 
                success: false, 
                message: 'عنوان، ایجادکننده و تحویل‌گیرنده الزامی است' 
            });
        }

        const [result] = await db.query(
            `INSERT INTO tasks (title, description, priority, status, created_by, assigned_to, department_id, deadline) 
             VALUES (?, ?, ?, 'در انتظار تایید', ?, ?, ?, ?)`,
            [title, description, priority || 'متوسط', created_by, assigned_to, department_id || null, deadline || null]
        );

        res.status(201).json({ 
            success: true, 
            message: 'کار با موفقیت ایجاد شد و در انتظار تایید است', 
            data: { id: result.insertId } 
        });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در ایجاد کار' 
        });
    }
});

// تایید کار
router.post('/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const { approved_by } = req.body;

        const [result] = await db.query(
            `UPDATE tasks 
             SET status = 'تایید شده', approved_by = ?, approved_at = NOW()
             WHERE id = ? AND status = 'در انتظار تایید'`,
            [approved_by, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'کار یافت نشد یا قبلاً تایید شده است' 
            });
        }

        res.json({ 
            success: true, 
            message: 'کار با موفقیت تایید شد' 
        });
    } catch (error) {
        console.error('Approve task error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در تایید کار' 
        });
    }
});

// رد کار
router.post('/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const { approved_by, rejection_reason } = req.body;

        const [result] = await db.query(
            `UPDATE tasks 
             SET status = 'رد شده', approved_by = ?, rejection_reason = ?, approved_at = NOW()
             WHERE id = ? AND status = 'در انتظار تایید'`,
            [approved_by, rejection_reason, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'کار یافت نشد یا قبلاً پردازش شده است' 
            });
        }

        res.json({ 
            success: true, 
            message: 'کار رد شد' 
        });
    } catch (error) {
        console.error('Reject task error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در رد کار' 
        });
    }
});

// تغییر وضعیت کار
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        let updateQuery = 'UPDATE tasks SET status = ?';
        const params = [status];

        if (status === 'تکمیل شده') {
            updateQuery += ', completed_at = NOW()';
        }

        updateQuery += ' WHERE id = ?';
        params.push(id);

        const [result] = await db.query(updateQuery, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'کار یافت نشد' 
            });
        }

        res.json({ 
            success: true, 
            message: 'وضعیت کار به‌روزرسانی شد' 
        });
    } catch (error) {
        console.error('Update task status error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در به‌روزرسانی وضعیت کار' 
        });
    }
});

// ویرایش کار
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, priority, assigned_to, department_id, deadline } = req.body;

        const [result] = await db.query(
            `UPDATE tasks 
             SET title = ?, description = ?, priority = ?, assigned_to = ?, department_id = ?, deadline = ?
             WHERE id = ?`,
            [title, description, priority, assigned_to, department_id || null, deadline || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'کار یافت نشد' 
            });
        }

        res.json({ 
            success: true, 
            message: 'کار با موفقیت ویرایش شد' 
        });
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در ویرایش کار' 
        });
    }
});

// حذف کار
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM tasks WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'کار یافت نشد' 
            });
        }

        res.json({ 
            success: true, 
            message: 'کار با موفقیت حذف شد' 
        });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در حذف کار' 
        });
    }
});

module.exports = router;
