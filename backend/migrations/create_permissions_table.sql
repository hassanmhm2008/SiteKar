CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name ENUM('مدیر', 'رئیس واحد', 'کارمند', 'کارشناس') NOT NULL,
    page_name VARCHAR(50) NOT NULL,
    page_title VARCHAR(100) NOT NULL,
    has_access BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_role_page (role_name, page_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO permissions (role_name, page_name, page_title, has_access) VALUES
('مدیر', 'dashboard', 'داشبورد', TRUE),
('مدیر', 'tasks', 'کارها', TRUE),
('مدیر', 'requests', 'درخواست‌ها', TRUE),
('مدیر', 'products', 'مدیریت کالاها', TRUE),
('مدیر', 'users', 'مدیریت کاربران', TRUE),
('مدیر', 'departments', 'واحدها', TRUE),
('مدیر', 'permissions', 'دسترسی‌ها', TRUE),

('رئیس واحد', 'dashboard', 'داشبورد', TRUE),
('رئیس واحد', 'tasks', 'کارها', TRUE),
('رئیس واحد', 'requests', 'درخواست‌ها', TRUE),
('رئیس واحد', 'products', 'مدیریت کالاها', FALSE),
('رئیس واحد', 'users', 'مدیریت کاربران', FALSE),
('رئیس واحد', 'departments', 'واحدها', FALSE),
('رئیس واحد', 'permissions', 'دسترسی‌ها', FALSE),

('کارمند', 'dashboard', 'داشبورد', TRUE),
('کارمند', 'tasks', 'کارها', TRUE),
('کارمند', 'requests', 'درخواست‌ها', TRUE),
('کارمند', 'products', 'مدیریت کالاها', FALSE),
('کارمند', 'users', 'مدیریت کاربران', FALSE),
('کارمند', 'departments', 'واحدها', FALSE),
('کارمند', 'permissions', 'دسترسی‌ها', FALSE),

('کارشناس', 'dashboard', 'داشبورد', TRUE),
('کارشناس', 'tasks', 'کارها', TRUE),
('کارشناس', 'requests', 'درخواست‌ها', TRUE),
('کارشناس', 'products', 'مدیریت کالاها', FALSE),
('کارشناس', 'users', 'مدیریت کاربران', FALSE),
('کارشناس', 'departments', 'واحدها', FALSE),
('کارشناس', 'permissions', 'دسترسی‌ها', FALSE)
ON DUPLICATE KEY UPDATE has_access = VALUES(has_access);
