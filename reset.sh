#!/bin/bash

echo "========================================="
echo "🔴 BẮT ĐẦU RESET DATABASE (DOCKER)"
echo "========================================="

# 1. Xóa sạch dữ liệu Docker (DB)
echo "[1/3] Đang dọn dẹp Docker Containers và Volumes..."
docker compose down -v

# 2. Khởi động lại Docker
echo "[2/3] Đang khởi động lại hệ thống cơ sở dữ liệu..."
docker compose up -d

# 3. Đợi Database khởi tạo
echo "[3/3] Đang chờ MySQL khởi động (15 giây)..."
sleep 15
echo "  -> Cơ sở dữ liệu đã sẵn sàng!"

echo "========================================="
echo "🟢 RESET DATABASE THÀNH CÔNG!"
echo "Bạn có thể khởi động lại Spring Boot bây giờ."
echo "========================================="
