=========================================================================================
    ĐỒ ÁN TRANG WEB QUẢN LÝ HIỆU SÁCH - NODEJS & MONGODB
=========================================================================================

1. GIỚI THIỆU
- Đồ án môn học: Điện toán đám mây
- Sinh viên thực hiện: Tống Nhựt Nam_DTH235702_Nhóm 30
- Công nghệ sử dụng: NodeJS (Express), MongoDB Atlas, EJS, Bootstrap 5.

2. CẤU HÌNH CÀI ĐẶT
Bước 1: Giải nén thư mục đồ án (nhom30).
Bước 2: Mở Terminal tại thư mục dự án và cài đặt thư viện:
        npm install
Bước 3: Tạo file .env từ .env.example và cấu hình MONGODB_URI, SESSION_SECRET.
Bước 4: Chạy ứng dụng:
        npm start
        Hoặc chạy chế độ phát triển: npm run dev
Bước 5: Truy cập trình duyệt: http://localhost:3000

Link render: https://whisperbooks.onrender.com/

3. TÀI KHOẢN DEMO
- Tạo tài khoản demo riêng trong cơ sở dữ liệu của bạn.
- Không sử dụng mật khẩu mặc định hoặc chia sẻ thông tin đăng nhập quản trị trên môi trường công khai.

4. CÁC CHỨC NĂNG CHÍNH
- Trang chủ: Hiển thị sách mới cập nhật và sách nổi bật.
- Cửa hàng: Bộ lọc sách theo thể loại và tìm kiếm thông minh.
- Giỏ hàng: Sử dụng LocalStorage để lưu trữ sản phẩm tạm thời.
- Thanh toán: Gửi email thông báo đơn hàng tự động qua API.
- Bản đồ: Tích hợp Leaflet Maps định vị cơ sở tại Long Xuyên, An Giang.
- Đánh giá: Hệ thống bình luận và chấm điểm sao cho từng đầu sách.

5. CẤU TRÚC THƯ MỤC QUAN TRỌNG
- /database: chứa cơ sở dữ liệu
- /models: Chứa Schema định nghĩa dữ liệu (Sách, Đơn hàng, Đánh giá...).
- /routers: Chứa các file xử lý logic (index.js, admin.js, sach.js...).
- /views: Giao diện hiển thị (EJS).
- /public: Chứa hình ảnh sản phẩm, CSS và JavaScript phía Client.

6. CẤU HÌNH BIẾN MÔI TRƯỜNG
- Sao chép .env.example thành .env tại thư mục gốc rồi điền cấu hình.
- Cấu hình MONGODB_URI và SESSION_SECRET trước khi chạy ứng dụng.
- MAIL_USER và MAIL_PASS chỉ cần thiết nếu muốn gửi email xác nhận đơn hàng.
- Trên Render, thêm MONGODB_URI, SESSION_SECRET và thông tin email tùy chọn trong mục Environment.
- Không đưa file .env hoặc thông tin bí mật lên GitHub.
- Nếu thông tin email từng được chia sẻ hoặc đưa lên kho mã, hãy thu hồi và tạo mật khẩu ứng dụng mới.

===========================================================