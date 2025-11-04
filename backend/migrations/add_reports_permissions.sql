-- اضافه کردن صفحه reports به جدول دسترسی‌ها
-- فقط مدیر و رئیس واحد به گزارش‌ها دسترسی دارند

INSERT INTO permissions (role_name, page_name, has_access) VALUES 
('مدیر', 'reports', 1),
('رئیس واحد', 'reports', 1),
('کارمند', 'reports', 0),
('کارشناس', 'reports', 0),
('انبار دار', 'reports', 0);
