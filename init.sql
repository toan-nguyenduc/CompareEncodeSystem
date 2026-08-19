CREATE DATABASE IF NOT EXISTS autoeval_db;
CREATE DATABASE IF NOT EXISTS csm_db;
CREATE DATABASE IF NOT EXISTS pe_db;

-- 0. Setup Auto Evaluation DB (Auto Evaluation Service)
USE autoeval_db;

CREATE TABLE IF NOT EXISTS tracked_videos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    csm_id BIGINT NOT NULL,
    pe_id BIGINT NOT NULL,
    convert_priority INT,
    tracking_status VARCHAR(50) DEFAULT 'pending',
    score INT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tracked_video_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tracked_video_id BIGINT NOT NULL,
    score INT,
    tracking_status VARCHAR(50),
    convert_priority INT,
    run_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tracked_video_id) REFERENCES tracked_videos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'ROLE_ADMIN'
);

-- Thêm tài khoản admin mặc định với password là '123456' đã được mã hóa BCrypt
INSERT IGNORE INTO users (username, password, role) VALUES ('admin', '$2a$10$X8j3aX5m6gR.T.N.p5hF/Ok8L4uQ2t3c6hG.rXz8K3xW1v7M8f2yW', 'ROLE_ADMIN');

-- 1. Setup CSM DB
USE csm_db;

CREATE TABLE IF NOT EXISTS csm_media (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255),
    slug VARCHAR(255),
    short_desc TEXT DEFAULT NULL,
    description TEXT DEFAULT NULL,
    status TINYINT,
    price_download DECIMAL(10,2) DEFAULT NULL,
    price_play DECIMAL(10,2) DEFAULT NULL,
    type TINYINT,
    max_quantity INT,
    published_by INT,
    created_at DATETIME,
    updated_at DATETIME,
    published_at DATETIME,
    duration INT,
    resolution VARCHAR(50),
    attributes JSON,
    cp_id INT,
    cp_info JSON,
    original_path JSON,
    image_path JSON,
    poster_path JSON DEFAULT NULL,
    file_type TINYINT,
    convert_status TINYINT,
    convert_path JSON,
    convert_priority INT,
    convert_start_time DATETIME,
    convert_end_time DATETIME,
    convert_data_id INT DEFAULT NULL,
    convert_images JSON,
    meta_info JSON DEFAULT NULL,
    censored_info JSON DEFAULT NULL,
    logo_path VARCHAR(255) DEFAULT NULL,
    need_censored TINYINT DEFAULT NULL,
    seo_title VARCHAR(255) DEFAULT NULL,
    seo_description TEXT DEFAULT NULL,
    seo_keywords VARCHAR(255) DEFAULT NULL,
    is_crawler TINYINT,
    crawler_id INT,
    crawler_info JSON,
    created_by INT,
    updated_by INT DEFAULT NULL,
    reviewed_by INT DEFAULT NULL,
    published_list JSON,
    tag VARCHAR(255) DEFAULT NULL,
    need_encryption TINYINT DEFAULT 0,
    resource_id VARCHAR(255) DEFAULT NULL,
    drm_id INT DEFAULT 0,
    convert_server VARCHAR(255),
    media_info JSON DEFAULT NULL,
    copyright_id INT DEFAULT NULL,
    copyright_info JSON DEFAULT NULL,
    last_sync_at DATETIME DEFAULT NULL,
    multi_language JSON DEFAULT NULL,
    subtitle_path JSON DEFAULT NULL,
    audio_path JSON DEFAULT NULL,
    convert_audio TINYINT DEFAULT NULL,
    is_active TINYINT DEFAULT 0,
    report_number INT DEFAULT NULL,
    auto_set_price_state TINYINT DEFAULT NULL,
    auto_set_price_date DATETIME DEFAULT NULL,
    origin_upload_status TINYINT,
    ai_review_status TINYINT DEFAULT NULL
);

-- Thêm 1 record mẫu để test (chưa encode)
INSERT INTO csm_media (id, name, status, convert_status) VALUES (1, 'Test Video 1', 1, 0);

-- 2. Setup PE DB
USE pe_db;

CREATE TABLE IF NOT EXISTS video (
    id BIGINT PRIMARY KEY,
    created_at DATETIME,
    modified_at DATETIME,
    csm_media_id BIGINT, 
    priority INT,
    meta_info JSON DEFAULT NULL,
    title VARCHAR(255) DEFAULT NULL,
    original_path JSON,
    convert_path JSON,
    resolution VARCHAR(50),
    duration INT,
    frame_rate INT, 
    chunk_count INT,
    file_path VARCHAR(255),
    logo VARCHAR(255) DEFAULT NULL,
    image_path JSON,
    poster_path JSON DEFAULT NULL,
    convert_images JSON,
    convert_start_time DATETIME,
    convert_end_time DATETIME,
    need_encryption TINYINT DEFAULT 0,
    resource_id VARCHAR(255) DEFAULT NULL,
    audio_path JSON DEFAULT NULL,
    subtitle_path JSON DEFAULT NULL,
    chunk_folder VARCHAR(255),
    file_type TINYINT,
    status TINYINT,
    convert_server INT,
    is_vmaf_evaluated TINYINT DEFAULT 0,
    label_status TINYINT DEFAULT 0
);

-- Thêm 1 record mẫu để test cho nhà PE (chưa encode xong)
INSERT INTO video (id, title, status) VALUES (1, 'Test Video PE', 1);
