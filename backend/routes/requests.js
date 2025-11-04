const express = require('express');
const router = express.Router();
const db = require('../db');

// دریافت لیست درخواست‌ها
router.get('/', async (req, res) => {
    try {
        const { status, userId, departmentId } = req.query;
        
        let query = `
            SELECT r.*, 
                   u.full_name as user_name,
                   d.name as department_name,
                   approver.full_name as approver_name
            FROM requests r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN departments d ON r.department_id = d.id
            LEFT JOIN users approver ON r.approved_by = approver.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND r.status = ?';
            params.push(status);
        }

        if (userId) {
            query += ' AND r.user_id = ?';
            params.push(userId);
        }

        if (departmentId) {
            query += ' AND r.department_id = ?';
            params.push(departmentId);
        }

        query += ' ORDER BY r.created_at DESC';

        const [requests] = await db.query(query, params);

        res.json({ 
            success: true, 
            requests: requests 
        });
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در دریافت لیست درخواست‌ها' 
        });
    }
});

// دریافت همه درخواست‌های در انتظار تایید (برای مدیر) - باید قبل از /:id باشد
router.get('/all/pending', async (req, res) => {
    try {
        const [requests] = await db.query(
            `SELECT r.*, 
                   u.full_name as user_name,
                   d.name as department_name,
                   (SELECT COUNT(*) FROM request_items WHERE request_id = r.id) as items_count
            FROM requests r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN departments d ON r.department_id = d.id
            WHERE r.status = 'در انتظار تایید'
            ORDER BY r.created_at DESC`
        );

        res.json({ 
            success: true, 
            requests: requests 
        });
    } catch (error) {
        console.error('Get all pending requests error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در دریافت درخواست‌های در انتظار تایید' 
        });
    }
});

// دریافت درخواست‌های یک واحد (برای رئیس واحد) - باید قبل از /:id باشد
router.get('/department/:departmentId/pending', async (req, res) => {
    try {
        const { departmentId } = req.params;

        const [requests] = await db.query(
            `SELECT r.*, 
                   u.full_name as user_name,
                   d.name as department_name,
                   (SELECT COUNT(*) FROM request_items WHERE request_id = r.id) as items_count
            FROM requests r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN departments d ON r.department_id = d.id
            WHERE r.department_id = ? AND r.status IN ('در انتظار تایید', 'تایید رئیس', 'رد شده')
            ORDER BY r.created_at DESC`,
            [departmentId]
        );

        res.json({ 
            success: true, 
            requests: requests 
        });
    } catch (error) {
        console.error('Get department requests error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در دریافت درخواست‌های واحد' 
        });
    }
});

// دریافت درخواست‌های تایید شده برای انبار - باید قبل از /:id باشد
router.get('/warehouse/approved', async (req, res) => {
    try {
        const [requests] = await db.query(
            `SELECT r.*, 
                   u.full_name as user_name,
                   d.name as department_name,
                   approver.full_name as approver_name,
                   (SELECT COUNT(*) FROM request_items WHERE request_id = r.id) as items_count
            FROM requests r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN departments d ON r.department_id = d.id
            LEFT JOIN users approver ON r.approved_by = approver.id
            WHERE r.status IN ('تایید رئیس', 'تایید موجودی', 'تحویل داده شده')
            ORDER BY r.created_at DESC`
        );

        res.json({ 
            success: true, 
            requests: requests 
        });
    } catch (error) {
        console.error('Get warehouse requests error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در دریافت درخواست‌های انبار' 
        });
    }
});

// دریافت جزئیات درخواست با آیتم‌ها
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [requests] = await db.query(
            `SELECT r.*, 
                    u.full_name as user_name,
                    d.name as department_name,
                    approver.full_name as approver_name
             FROM requests r
             LEFT JOIN users u ON r.user_id = u.id
             LEFT JOIN departments d ON r.department_id = d.id
             LEFT JOIN users approver ON r.approved_by = approver.id
             WHERE r.id = ?`,
            [id]
        );

        if (requests.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'درخواست یافت نشد' 
            });
        }

        const [items] = await db.query(
            `SELECT ri.*, p.code, p.name as product_name, p.unit
             FROM request_items ri
             LEFT JOIN products p ON ri.product_id = p.id
             WHERE ri.request_id = ?`,
            [id]
        );

        const request = requests[0];
        request.items = items;

        res.json({ 
            success: true, 
            request: request 
        });
    } catch (error) {
        console.error('Get request details error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در دریافت جزئیات درخواست' 
        });
    }
});

// ایجاد درخواست جدید
router.post('/', async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        const { user_id, description, items } = req.body;

        if (!user_id || !items || items.length === 0) {
            await connection.rollback();
            return res.status(400).json({ 
                success: false, 
                message: 'کاربر و لیست کالاها الزامی است' 
            });
        }

        // دریافت department_id از کاربر
        const [users] = await connection.query(
            'SELECT department_id FROM users WHERE id = ?',
            [user_id]
        );

        if (users.length === 0) {
            await connection.rollback();
            return res.status(404).json({ 
                success: false, 
                message: 'کاربر یافت نشد' 
            });
        }

        const department_id = users[0].department_id;

        // تولید شماره درخواست
        const requestNumber = `REQ-${Date.now()}`;

        // ایجاد درخواست با وضعیت "در انتظار تایید"
        const [result] = await connection.query(
            `INSERT INTO requests (request_number, user_id, department_id, total_items, description, status) 
             VALUES (?, ?, ?, ?, ?, 'در انتظار تایید')`,
            [requestNumber, user_id, department_id, items.length, description]
        );

        const requestId = result.insertId;

        // افزودن آیتم‌ها
        for (const item of items) {
            await connection.query(
                'INSERT INTO request_items (request_id, product_id, quantity, notes) VALUES (?, ?, ?, ?)',
                [requestId, item.product_id, item.quantity, item.notes || null]
            );
        }

        await connection.commit();

        res.status(201).json({ 
            success: true, 
            message: 'درخواست با موفقیت ایجاد شد', 
            data: { id: requestId, request_number: requestNumber } 
        });
    } catch (error) {
        await connection.rollback();
        console.error('Create request error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در ایجاد درخواست' 
        });
    } finally {
        connection.release();
    }
});

// تغییر وضعیت درخواست
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, approved_by, rejection_reason } = req.body;

        let updateQuery = 'UPDATE requests SET status = ?';
        const params = [status];

        if (status === 'تایید شده' || status === 'رد شده') {
            updateQuery += ', approved_by = ?, approved_at = NOW()';
            params.push(approved_by);
        }

        if (status === 'رد شده' && rejection_reason) {
            updateQuery += ', rejection_reason = ?';
            params.push(rejection_reason);
        }

        updateQuery += ' WHERE id = ?';
        params.push(id);

        const [result] = await db.query(updateQuery, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'درخواست یافت نشد' 
            });
        }

        res.json({ 
            success: true, 
            message: 'وضعیت درخواست به‌روزرسانی شد' 
        });
    } catch (error) {
        console.error('Update request status error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در به‌روزرسانی وضعیت درخواست' 
        });
    }
});

// تایید درخواست توسط رئیس واحد
router.post('/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const { comment, userId } = req.body;

        const [result] = await db.query(
            `UPDATE requests 
             SET status = 'تایید رئیس', 
                 supervisor_comment = ?,
                 supervisor_action_date = NOW(),
                 approved_by = ?
             WHERE id = ? AND status = 'در انتظار تایید'`,
            [comment || null, userId, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'درخواست یافت نشد یا قبلاً پردازش شده است' 
            });
        }

        res.json({ 
            success: true, 
            message: 'درخواست با موفقیت تایید شد' 
        });
    } catch (error) {
        console.error('Approve request error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در تایید درخواست' 
        });
    }
});

// رد درخواست توسط رئیس واحد
router.post('/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const { comment, userId } = req.body;

        if (!comment) {
            return res.status(400).json({ 
                success: false, 
                message: 'توضیحات رد درخواست الزامی است' 
            });
        }

        const [result] = await db.query(
            `UPDATE requests 
             SET status = 'رد شده', 
                 supervisor_comment = ?,
                 supervisor_action_date = NOW(),
                 approved_by = ?
             WHERE id = ? AND status = 'در انتظار تایید'`,
            [comment, userId, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'درخواست یافت نشد یا قبلاً پردازش شده است' 
            });
        }

        res.json({ 
            success: true, 
            message: 'درخواست رد شد' 
        });
    } catch (error) {
        console.error('Reject request error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در رد درخواست' 
        });
    }
});

// تایید موجودی توسط انبار (مرحله اول)
router.post('/:id/warehouse-check-stock', async (req, res) => {
    try {
        const { id } = req.params;
        const { comment, userId } = req.body;

        const [result] = await db.query(
            `UPDATE requests 
             SET status = 'تایید موجودی', 
                 warehouse_comment = ?,
                 warehouse_action_date = NOW()
             WHERE id = ? AND status = 'تایید رئیس'`,
            [comment || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'درخواست یافت نشد یا قبلاً پردازش شده است' 
            });
        }

        res.json({ 
            success: true, 
            message: 'موجودی تایید شد، آماده تحویل' 
        });
    } catch (error) {
        console.error('Warehouse check stock error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در تایید موجودی' 
        });
    }
});

// تایید تحویل نهایی (مرحله دوم)
router.post('/:id/warehouse-deliver', async (req, res) => {
    try {
        const { id } = req.params;
        const { comment, userId } = req.body;

        const [result] = await db.query(
            `UPDATE requests 
             SET status = 'تحویل داده شده', 
                 warehouse_comment = CONCAT(IFNULL(warehouse_comment, ''), '\n', ?),
                 warehouse_action_date = NOW()
             WHERE id = ? AND status = 'تایید موجودی'`,
            [comment || 'تحویل نهایی داده شد', id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'درخواست یافت نشد یا هنوز موجودی تایید نشده است' 
            });
        }

        res.json({ 
            success: true, 
            message: 'درخواست با موفقیت تحویل داده شد' 
        });
    } catch (error) {
        console.error('Warehouse deliver error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در تحویل نهایی' 
        });
    }
});

// رد توسط انبار
router.post('/:id/warehouse-reject', async (req, res) => {
    try {
        const { id } = req.params;
        const { comment, userId } = req.body;

        if (!comment) {
            return res.status(400).json({ 
                success: false, 
                message: 'توضیحات رد درخواست الزامی است' 
            });
        }

        const [result] = await db.query(
            `UPDATE requests 
             SET status = 'رد شده', 
                 warehouse_comment = ?,
                 warehouse_action_date = NOW()
             WHERE id = ? AND status IN ('تایید رئیس', 'تایید موجودی')`,
            [comment, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'درخواست یافت نشد یا قبلاً پردازش شده است' 
            });
        }

        res.json({ 
            success: true, 
            message: 'درخواست توسط انبار رد شد' 
        });
    } catch (error) {
        console.error('Warehouse reject error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در رد توسط انبار' 
        });
    }
});

// برگشت درخواست به کاربر
router.post('/:id/return', async (req, res) => {
    try {
        const { id } = req.params;
        const { comment, userId } = req.body;

        const [result] = await db.query(
            `UPDATE requests 
             SET status = 'بازگشت داده شده', 
                 warehouse_comment = CONCAT(IFNULL(warehouse_comment, ''), '\n', 'برگشت: ', ?),
                 warehouse_action_date = NOW()
             WHERE id = ? AND status IN ('تایید رئیس', 'تایید موجودی', 'تحویل داده شده')`,
            [comment || 'برگشت داده شد', id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'درخواست یافت نشد' 
            });
        }

        res.json({ 
            success: true, 
            message: 'درخواست برگشت داده شد' 
        });
    } catch (error) {
        console.error('Return request error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در برگشت درخواست' 
        });
    }
});

// حذف درخواست
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // حذف خودکار آیتم‌ها به دلیل CASCADE
        const [result] = await db.query('DELETE FROM requests WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'درخواست یافت نشد' 
            });
        }

        res.json({ 
            success: true, 
            message: 'درخواست با موفقیت حذف شد' 
        });
    } catch (error) {
        console.error('Delete request error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در حذف درخواست' 
        });
    }
});

// ویرایش تعداد آیتم
router.put('/:requestId/items/:itemId', async (req, res) => {
    try {
        const { requestId, itemId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ 
                success: false, 
                message: 'تعداد باید بیشتر از صفر باشد' 
            });
        }

        const [result] = await db.query(
            'UPDATE request_items SET quantity = ? WHERE id = ? AND request_id = ?',
            [quantity, itemId, requestId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'آیتم یافت نشد' 
            });
        }

        // به‌روزرسانی تعداد کل آیتم‌ها
        await db.query(
            'UPDATE requests SET total_items = (SELECT COUNT(*) FROM request_items WHERE request_id = ?) WHERE id = ?',
            [requestId, requestId]
        );

        res.json({ 
            success: true, 
            message: 'تعداد به‌روز شد' 
        });
    } catch (error) {
        console.error('Update item error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در به‌روزرسانی آیتم' 
        });
    }
});

// حذف آیتم
router.delete('/:requestId/items/:itemId', async (req, res) => {
    try {
        const { requestId, itemId } = req.params;

        const [result] = await db.query(
            'DELETE FROM request_items WHERE id = ? AND request_id = ?',
            [itemId, requestId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'آیتم یافت نشد' 
            });
        }

        // به‌روزرسانی تعداد کل آیتم‌ها
        await db.query(
            'UPDATE requests SET total_items = (SELECT COUNT(*) FROM request_items WHERE request_id = ?) WHERE id = ?',
            [requestId, requestId]
        );

        res.json({ 
            success: true, 
            message: 'آیتم حذف شد' 
        });
    } catch (error) {
        console.error('Delete item error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در حذف آیتم' 
        });
    }
});

// کپی درخواست
router.post('/:id/copy', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                message: 'شناسه کاربر الزامی است' 
            });
        }

        // دریافت department_id کاربر
        const [users] = await db.query(
            'SELECT department_id FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'کاربر یافت نشد' 
            });
        }

        const departmentId = users[0].department_id;

        // دریافت درخواست اصلی
        const [originalRequests] = await db.query(
            'SELECT * FROM requests WHERE id = ?',
            [id]
        );

        if (originalRequests.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'درخواست یافت نشد' 
            });
        }

        const originalRequest = originalRequests[0];

        // دریافت آیتم‌های درخواست اصلی
        const [originalItems] = await db.query(
            'SELECT * FROM request_items WHERE request_id = ?',
            [id]
        );

        if (originalItems.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'درخواست بدون آیتم قابل کپی نیست' 
            });
        }

        // تولید شماره درخواست جدید
        const requestNumber = `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // ایجاد درخواست جدید با وضعیت "ارسال نشده"
        const [result] = await db.query(
            `INSERT INTO requests (user_id, department_id, status, description, total_items, request_number) 
             VALUES (?, ?, 'ارسال نشده', ?, ?, ?)`,
            [userId, departmentId, originalRequest.description, originalItems.length, requestNumber]
        );

        const newRequestId = result.insertId;

        // کپی آیتم‌ها
        for (const item of originalItems) {
            await db.query(
                `INSERT INTO request_items (request_id, product_id, quantity, notes) 
                 VALUES (?, ?, ?, ?)`,
                [newRequestId, item.product_id, item.quantity, item.notes || null]
            );
        }

        res.json({ 
            success: true, 
            message: 'درخواست با موفقیت کپی شد',
            requestId: newRequestId
        });
    } catch (error) {
        console.error('Copy request error:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در کپی درخواست: ' + error.message
        });
    }
});

// ارسال درخواست برای تایید (تغییر وضعیت به "در انتظار تایید")
router.post('/:id/submit', async (req, res) => {
    try {
        const { id } = req.params;

        // بررسی وضعیت فعلی
        const [requests] = await db.query(
            'SELECT status FROM requests WHERE id = ?',
            [id]
        );

        if (requests.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'درخواست یافت نشد' 
            });
        }

        const currentStatus = requests[0].status;

        // فقط درخواست‌های با وضعیت "ارسال نشده"، "رد شده" یا "بازگشت داده شده" قابل ارسال هستند
        if (!['ارسال نشده', 'رد شده', 'بازگشت داده شده'].includes(currentStatus)) {
            return res.status(400).json({ 
                success: false, 
                message: 'فقط درخواست‌های ارسال نشده، رد شده یا برگشت داده شده قابل ارسال مجدد هستند' 
            });
        }

        // تغییر وضعیت به "در انتظار تایید"
        await db.query(
            `UPDATE requests 
             SET status = 'در انتظار تایید',
                 supervisor_comment = NULL,
                 supervisor_action_date = NULL,
                 approved_by = NULL,
                 warehouse_comment = NULL,
                 warehouse_action_date = NULL
             WHERE id = ?`,
            [id]
        );

        res.json({ 
            success: true, 
            message: 'درخواست با موفقیت ارسال شد' 
        });
    } catch (error) {
        console.error('Submit request error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در ارسال درخواست' 
        });
    }
});

module.exports = router;
