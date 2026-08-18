# Auto Evaluation Service

Đây là một service trung gian (Spring Boot Application) có nhiệm vụ tự động hóa quy trình:
**Kích hoạt mã hóa video (Encode)** ➔ **Theo dõi tiến trình** ➔ **Yêu cầu đánh giá chất lượng (VMAF/Score)** ➔ **Trả kết quả trực tiếp cho người dùng qua giao diện (WebSocket)**.

## 🚀 Tính năng chính

- **Quản lý danh sách theo dõi**: Người dùng có thể chỉ định các Video ID cụ thể cần được theo dõi tiến độ mã hóa thông qua Frontend. Dữ liệu được lưu trữ độc lập tại DB riêng của Service.
- **Kích hoạt tự động**: Tự động chọc vào Database của hệ thống CSM (`csm_db`) để thay đổi trạng thái kích hoạt tiến trình Encode.
- **Background Polling**: Chạy ngầm (CronJob) mỗi 30 giây để quét và giám sát trường `convert_end_time` của các video đang encode mà không làm quá tải hệ thống chính.
- **Tích hợp Service Đánh giá**: Tự động gọi sang Evaluation Service qua REST API khi video được mã hóa xong để lấy điểm (Score).
- **Real-time Frontend**: Trang bị sẵn giao diện Single Page Application (Client-Side Rendering) siêu nhẹ tại trang chủ. Tự động lắng nghe kết quả trả về từ Backend thông qua **WebSocket (STOMP)**.

## 🛠 Tech Stack

- **Ngôn ngữ:** Java 17
- **Framework:** Spring Boot 3.2.x (Web, Data JPA, WebSocket)
- **Database:** MySQL 8.x (Multi-database: `autoeval_db`, `csm_db`, `pe_db`)
- **Frontend:** Vanilla HTML5, CSS3, JavaScript (Fetch API, SockJS, STOMP.js)
- **Build tool:** Maven
- **Containerization:** Docker & Docker Compose (Cho môi trường Mock DB)

## 📁 Cấu trúc thư mục lõi

```text
src/main/
├── java/com/example/autoevaluation/
│   ├── config/          # Cấu hình Multiple DB (Csm, Autoeval), WebSocket, RestTemplate
│   ├── controller/      # REST API Endpoints (VideoController)
│   ├── dto/             # Data Transfer Objects
│   ├── entity/          # Các Model ánh xạ DB (CsmMedia, TrackedVideo)
│   ├── job/             # Chứa CronJob chạy ngầm (EvaluationPollingJob)
│   ├── repository/      # Spring Data JPA Repositories
│   └── service/         # Business Logic cốt lõi (AutoEvaluationService)
└── resources/
    ├── application.yml  # Cấu hình ứng dụng
    └── static/          # Source code Frontend (index.html, style.css, app.js)
```

## ⚙️ Hướng dẫn cài đặt và chạy thử (Local)

### Bước 1: Khởi tạo Mock Database bằng Docker
Hệ thống yêu cầu 3 cơ sở dữ liệu (`autoeval_db`, `csm_db`, `pe_db`). Chúng tôi đã cung cấp sẵn script SQL và Docker Compose để giả lập.

1. Mở terminal tại thư mục gốc của dự án.
2. Khởi động MySQL container:
   ```bash
   docker-compose up -d
   ```
3. Đợi khoảng 10-15 giây để MySQL load file `init.sql` và khởi tạo các bảng `tracked_videos`, `csm_media`, `video`.

### Bước 2: Khởi động Spring Boot App
1. Đảm bảo máy tính đã cài đặt Java 17 và Maven.
2. Chạy ứng dụng bằng lệnh:
   ```bash
   mvn spring-boot:run
   ```
3. Ứng dụng sẽ khởi động tại địa chỉ: `http://localhost:8080`

### Bước 3: Trải nghiệm
1. Mở trình duyệt và truy cập: **http://localhost:8080**
2. Bạn sẽ thấy giao diện **Auto Evaluation Tracking**.
3. Thử thêm một Video ID (Ví dụ: ID `1` đã được tạo sẵn trong Mock DB).
4. Nhấn **Trigger Encode**. Quan sát trạng thái chuyển sang màu cam (Encoding).
5. Để test luồng Polling, bạn có thể tự vào DB `csm_db`, bảng `csm_media` (ID = 1), và set field `convert_end_time` thành một thời gian bất kỳ (khác NULL).
6. Đợi tối đa 30s, Background Job sẽ tự quét, gọi API đánh giá và bắn điểm số realtime qua WebSocket về bảng trên màn hình!

## 🌍 Hướng dẫn tích hợp lên Production (Deployment)

Khi đưa Auto Evaluation Service lên môi trường thực tế (Production), bạn cần lưu ý thực hiện các bước cấu hình sau:

### 1. Cấu hình Biến môi trường (Environment Variables)
Tuyệt đối không hardcode thông tin nhạy cảm vào code. Khi chạy thật, hãy ghi đè cấu hình trong `application.yml` bằng các biến môi trường trên Linux hoặc file `.env` (nếu dùng Docker):
- `SPRING_DATASOURCE_AUTOEVAL_JDBC_URL`: URL thực tế của Auto Eval DB.
- `SPRING_DATASOURCE_AUTOEVAL_USERNAME` / `PASSWORD`: Thông tin đăng nhập DB riêng.
- `SPRING_DATASOURCE_CSM_JDBC_URL`: URL thực tế của CSM DB.
- `SPRING_DATASOURCE_CSM_USERNAME` / `PASSWORD`: Thông tin đăng nhập CSM DB.

*(Lưu ý: Thuộc tính `spring.jpa.hibernate.ddl-auto` hiện đã được khóa ở mức `none`, rất an toàn cho Production để tránh lỗi tự động xóa/sửa cấu trúc Database).*

### 2. Cập nhật URL thật của Service Đánh giá
Trong file `EvaluationPollingJob.java`, URL gọi sang Evaluation Service đang được gán tạm ở biến `EVAL_SERVICE_URL = "http://localhost:8081/api/evaluate"`. 
**Cách xử lý:** Đưa biến này ra cấu hình `@Value("${eval.service.url}")` trong `application.yml` và ghi đè bằng Domain thật của team AI/Eval khi lên Prod.

### 3. Đóng gói và Khởi chạy (Build & Run)
Không sử dụng `mvn spring-boot:run` trên môi trường thật. Hãy build code ra file thực thi `.jar`:
```bash
# Đóng gói ứng dụng
mvn clean package -DskipTests
```
Khởi chạy file `.jar` đã sinh ra trong thư mục `target/`:
```bash
java -jar target/auto-evaluation-0.0.1-SNAPSHOT.jar
```
*(Khuyến nghị: Bạn nên viết thêm 1 file `Dockerfile` để đóng gói file `.jar` này thành Docker Image, sau đó deploy bằng Docker Compose hoặc Kubernetes).*

### 4. Tách biệt Frontend (Tùy chọn)
Frontend hiện đang nằm tại thư mục `static` để dễ dàng chạy chung port `8080` với Backend. Tuy nhiên, nếu hệ thống có traffic lớn:
- Bạn nên host 3 file tĩnh (`index.html`, `style.css`, `app.js`) lên các máy chủ chuyên dụng như NGINX, Amazon S3, hoặc Cloudflare.
- Khi đó trong file `app.js`, nhớ sửa `API_BASE` và URL của `SockJS` thành đường dẫn tuyệt đối (VD: `https://api.yourdomain.com/videos`).
- Bổ sung cấu hình `CORS` trong code Spring Boot để cho phép Frontend từ Domain khác có thể gọi API vào.

---
*Dự án được xây dựng và thiết kế theo luồng kiến trúc Client-Side Rendering + Auto Polling Microservices.*
