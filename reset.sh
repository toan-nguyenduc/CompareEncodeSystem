#!/bin/bash

echo "========================================="
echo "🔴 BẮT ĐẦU RESET DATABASE (DOCKER)"
echo "========================================="

# 1. Xóa sạch dữ liệu Docker (DB)
echo "[1/2] Đang dọn dẹp Docker Containers và Volumes..."
docker compose down -v

# 2. Khởi động lại Docker và chờ MySQL sẵn sàng
echo "[2/2] Đang khởi động và chờ MySQL sẵn sàng..."
docker compose up -d --wait
echo "  -> Cơ sở dữ liệu đã sẵn sàng!"

echo "========================================="
echo "🟢 RESET DATABASE THÀNH CÔNG!"
echo "Bạn có thể khởi động lại Spring Boot bây giờ."
echo "========================================="
