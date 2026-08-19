CREATE DATABASE IF NOT EXISTS autoeval_db;
CREATE DATABASE IF NOT EXISTS csm_db;
CREATE DATABASE IF NOT EXISTS pe_db;

-- 0. Setup Auto Evaluation DB (Auto Evaluation Service)
USE autoeval_db;

CREATE TABLE IF NOT EXISTS tracked_videos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    csm_id BIGINT NOT NULL,
    pe_id BIGINT NOT NULL,
    video_name VARCHAR(255),
    convert_priority INT,
    tracking_status VARCHAR(50) DEFAULT 'pending',
    score INT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
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

-- Tài khoản admin mặc định sẽ được tạo tự động trong code Spring Boot (SecurityConfig.java)

-- Thêm 15 record mẫu cho tracked_videos để test Pagination ngay khi khởi động
INSERT INTO tracked_videos (id, csm_id, pe_id, video_name, convert_priority, tracking_status, score) VALUES
(1, 1, 101, 'Avengers: Endgame', 10000, 'completed', 95),
(2, 2, 102, 'Inception', 10000, 'completed', 82),
(3, 3, 103, 'Interstellar', 10000, 'completed', 88),
(4, 4, 104, 'The Dark Knight', 10000, 'error', NULL),
(5, 5, 105, 'Avatar: The Way of Water', 10000, 'evaluating', NULL),
(6, 6, 106, 'Spider-Man: No Way Home', 10000, 'encoding', NULL),
(7, 7, 107, 'Titanic', 10000, 'pending', NULL),
(8, 8, 108, 'The Matrix', 10000, 'completed', 91),
(9, 9, 109, 'Oppenheimer', 10000, 'completed', 75),
(10, 10, 110, 'Parasite', 10000, 'completed', 86),
(11, 1, 111, 'Avengers: Endgame (Dub)', 10000, 'completed', 99),
(12, 2, 112, 'Inception (4K)', 10000, 'pending', NULL),
(13, 3, 113, 'Interstellar (IMAX)', 10000, 'encoding', NULL),
(14, 4, 114, 'The Dark Knight (Remastered)', 10000, 'error', NULL),
(15, 5, 115, 'Avatar 2 (3D)', 10000, 'completed', 80);

-- Thêm vài record lịch sử mẫu cho video 1 và 2
INSERT INTO tracked_video_history (tracked_video_id, score, tracking_status, convert_priority) VALUES
(1, 70, 'error', 10000),
(1, 85, 'completed', 10000),
(1, 95, 'completed', 10000),
(2, 82, 'completed', 10000);

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

-- Thêm 10 record mẫu để test (chưa encode)
INSERT INTO csm_media (id, name, status, convert_status) VALUES 
(1, 'Avengers: Endgame', 1, 0),
(2, 'Inception', 1, 0),
(3, 'Interstellar', 1, 0),
(4, 'The Dark Knight', 1, 0),
(5, 'Avatar: The Way of Water', 1, 0),
(6, 'Spider-Man: No Way Home', 1, 0),
(7, 'Titanic', 1, 0),
(8, 'The Matrix', 1, 0),
(9, 'Oppenheimer', 1, 0),
(10, 'Parasite', 1, 0);

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

-- Thêm 10 record mẫu để test cho nhà PE (chưa encode xong)
INSERT INTO video (id, title, status, csm_media_id) VALUES 
(101, 'Avengers: Endgame - Master File', 1, 1),
(102, 'Inception_1080p_Clean', 1, 2),
(103, 'Interstellar_IMAX_Raw', 1, 3),
(104, 'TDK_Final_Render_v2', 1, 4),
(105, 'Avatar2_3D_LeftEye', 1, 5),
(106, 'SpiderMan_NWH_WebDL', 1, 6),
(107, 'Titanic_4K_Remaster', 1, 7),
(108, 'Matrix_GreenFilter', 1, 8),
(109, 'Oppenheimer_70mm_Scan', 1, 9),
(110, 'Parasite_BW_Edition', 1, 10);
