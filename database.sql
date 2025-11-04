-- ایجاد پایگاه داده
CREATE DATABASE IF NOT EXISTS sitekar_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sitekar_db;

-- جدول واحدها
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    manager_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_department_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول کاربران
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    role ENUM('مدیر', 'رئیس واحد', 'کارمند', 'کارشناس') NOT NULL DEFAULT 'کارمند',
    department_id INT NULL,
    supervisor_id INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_department (department_id),
    INDEX idx_supervisor (supervisor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- به‌روزرسانی foreign key برای مدیر واحد
ALTER TABLE departments 
ADD CONSTRAINT fk_department_manager 
FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;

-- جدول کالاها (برای درخواست‌ها)
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit VARCHAR(50) DEFAULT 'عدد',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول کارها
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority ENUM('بحرانی', 'بالا', 'متوسط', 'پایین') NOT NULL DEFAULT 'متوسط',
    status ENUM('در انتظار تایید', 'تایید شده', 'در حال انجام', 'تکمیل شده', 'رد شده') NOT NULL DEFAULT 'در انتظار تایید',
    created_by INT NOT NULL,
    assigned_to INT NOT NULL,
    department_id INT NULL,
    deadline DATE,
    approved_by INT NULL,
    approved_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_creator (created_by),
    INDEX idx_assignee (assigned_to),
    INDEX idx_department (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول درخواست‌ها
CREATE TABLE IF NOT EXISTS requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_number VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    department_id INT NULL,
    status ENUM('جدید', 'در حال بررسی', 'تایید شده', 'رد شده', 'تکمیل شده') NOT NULL DEFAULT 'جدید',
    total_items INT DEFAULT 0,
    description TEXT,
    approved_by INT NULL,
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_user (user_id),
    INDEX idx_department (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول آیتم‌های درخواست
CREATE TABLE IF NOT EXISTS request_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_request (request_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول نظرات و تاریخچه
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type ENUM('task', 'request') NOT NULL,
    entity_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- درج داده‌های اولیه

-- واحد اصلی
INSERT INTO departments (name, description) VALUES 
('مدیریت', 'واحد مدیریت اصلی'),
('فروش', 'واحد فروش و بازاریابی'),
('فنی', 'واحد فنی و پشتیبانی'),
('مالی', 'واحد مالی و حسابداری');

-- کاربر ادمین
INSERT INTO users (username, password, full_name, email, phone, role, department_id) VALUES 
('admin', 'admin123', 'مدیر سیستم', 'admin@company.com', '09121234567', 'مدیر', 1);

-- کالاهای نمونه
INSERT INTO products (code, name, description, category, unit) VALUES 
('P001', 'کاغذ A4', 'کاغذ تحریر سایز A4', 'لوازم اداری', 'بسته'),
('P002', 'قلم آبی', 'خودکار آبی', 'لوازم اداری', 'عدد'),
('P003', 'پوشه', 'پوشه کاغذ', 'لوازم اداری', 'عدد'),
('P004', 'دفتر', 'دفتر 100 برگ', 'لوازم اداری', 'عدد'),
('P005', 'پاکن', 'پاک‌کن سفید', 'لوازم اداری', 'عدد'),
('P006', 'ماژیک', 'ماژیک وایت برد', 'لوازم اداری', 'عدد'),
('P007', 'چسب', 'چسب مایع', 'لوازم اداری', 'عدد'),
('P008', 'کیبورد', 'کیبورد کامپیوتر', 'تجهیزات', 'عدد'),
('P009', 'ماوس', 'ماوس کامپیوتر', 'تجهیزات', 'عدد'),
('P010', 'هدفون', 'هدفون استریو', 'تجهیزات', 'عدد');

-- نمایش ساختار جداول
SHOW TABLES;
