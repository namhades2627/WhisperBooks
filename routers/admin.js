const express = require('express');
const router = express.Router();
// Nhớ kiểm tra đường dẫn tới thư mục models cho đúng
const Sach = require('../models/sach');
const TaiKhoan = require('../models/taikhoan');
const TheLoai = require('../models/theloai');
const DonHang = require('../models/donhang');

// Quản lý sách
router.get('/sach', async (req, res) => {
    try {
        const s = await Sach.find().populate('TheLoai');
        res.render('admin/sach', { 
            title: 'Quản lý Sách', 
            dsSach: s,
            user: req.session.user 
        });
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
});

// 1. Trang Thêm Sách (GET)
router.get('/sach/them', async (req, res) => {
    try {
        const tl = await TheLoai.find();
        res.render('admin/sach_them', { title: 'Thêm sách mới', dsTheLoai: tl });
    } catch (err) {
        res.redirect('/admin/sach');
    }
});

// 2. Xử lý Thêm Sách (POST)
router.post('/sach/them', async (req, res) => {
    try {
        console.log("Dữ liệu nhận được:", req.body); // Dòng này để debug xem dữ liệu có lên tới server không
        
        const moi = new Sach({
            TenSach: req.body.TenSach,
            TheLoai: req.body.TheLoai,
            GiaBan: req.body.GiaBan,
            SoLuong: req.body.SoLuong,
            HinhAnh: req.body.HinhAnh || 'no-image.jpg'
        });
        
        await moi.save();
        req.session.success = 'Đã thêm sách mới thành công!';
        res.redirect('/admin/sach');
    } catch (err) {
        console.error("Lỗi khi lưu sách:", err);
        res.send("Lỗi rồi Nhựt Nam ơi: " + err.message); // Hiện lỗi thẳng lên màn hình để dễ sửa
    }
});

// 3. Trang Sửa Sách (GET)
router.get('/sach/sua/:id', async (req, res) => {
    try {
        const s = await Sach.findById(req.params.id);
        const tl = await TheLoai.find();
        res.render('admin/sach_sua', { title: 'Sửa thông tin sách', item: s, dsTheLoai: tl });
    } catch (err) {
        res.redirect('/admin/sach');
    }
});

// 4. Xử lý Cập nhật Sách (POST)
router.post('/sach/sua/:id', async (req, res) => {
    try {
        await Sach.findByIdAndUpdate(req.params.id, req.body);
        req.session.success = 'Cập nhật thông tin sách thành công!';
        res.redirect('/admin/sach');
    } catch (err) {
        req.session.error = 'Lỗi khi cập nhật: ' + err.message;
        res.redirect('/admin/sach/sua/' + req.params.id);
    }
});

// 5. Xử lý Xóa Sách (GET)
router.get('/sach/xoa/:id', async (req, res) => {
    try {
        await Sach.findByIdAndDelete(req.params.id);
        req.session.success = 'Đã xóa sách khỏi hệ thống!';
        res.redirect('/admin/sach');
    } catch (err) {
        req.session.error = 'Không thể xóa sách: ' + err.message;
        res.redirect('/admin/sach');
    }
});


// Quản lý tài khoản
router.get('/tai-khoan', async (req, res) => {
    try {
        const tk = await TaiKhoan.find();
        res.render('admin/taikhoan', { 
            title: 'Quản lý Tài khoản', 
            dsTaiKhoan: tk,
            user: req.session.user 
        });
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
});

router.get('/tai-khoan/them', (req, res) => {
    res.render('admin/taikhoan_them', { title: 'Thêm tài khoản' });
});

// Xử lý THÊM tài khoản mới (POST)
router.post('/tai-khoan/them', async (req, res) => {
    try {
        // Lấy dữ liệu từ các ô input trong Form
        const { HoVaTen, Email, TenDangNhap, MatKhau, SoDienThoai, QuyenHan } = req.body;

        // Tạo một tài khoản mới từ Model
        const taiKhoanMoi = new TaiKhoan({
            HoVaTen: HoVaTen,
            Email: Email,
            TenDangNhap: TenDangNhap,
            MatKhau: MatKhau, // Nhựt Nam nên dùng bcrypt mã hóa sau này cho bảo mật nhé
            SoDienThoai: SoDienThoai,
            QuyenHan: QuyenHan,
            KichHoat: 1
        });

        // Lưu vào MongoDB
        await taiKhoanMoi.save();

        // Gán thông báo thành công và quay về trang danh sách
        req.session.success = 'Đã thêm tài khoản mới thành công!';
        res.redirect('/admin/tai-khoan');
    } catch (err) {
        console.error("Lỗi khi thêm tài khoản:", err);
        // Nếu lỗi do trùng TenDangNhap (vì bạn để unique: true)
        res.send("Lỗi: Có thể tên đăng nhập đã tồn tại hoặc thiếu dữ liệu bắt buộc!");
    }
});

router.get('/tai-khoan/sua/:id', async (req, res) => {
    try {
        const tk = await TaiKhoan.findById(req.params.id);
        res.render('admin/taikhoan_sua', { 
            title: 'Sửa tài khoản', 
            item: tk // Truyền dữ liệu tài khoản vào biến 'item'
        });
    } catch (err) {
        res.redirect('/admin/tai-khoan');
    }
});

router.post('/tai-khoan/sua/:id', async (req, res) => {
    try {
        const { HoVaTen, Email, SoDienThoai, QuyenHan, MatKhau } = req.body;
        
        // Tạo đối tượng dữ liệu cập nhật
        let dataUpdate = {
            HoVaTen: HoVaTen,
            Email: Email,
            SoDienThoai: SoDienThoai,
            QuyenHan: QuyenHan
        };

        // Nếu người dùng có nhập mật khẩu mới thì mới cập nhật mật khẩu
        if (MatKhau && MatKhau.trim() !== "") {
            // Lưu ý: Nếu có dùng bcrypt thì nhớ mã hóa ở đây nhé Nhựt Nam
            dataUpdate.MatKhau = MatKhau; 
        }

        await TaiKhoan.findByIdAndUpdate(req.params.id, dataUpdate);
        
        req.session.success = 'Cập nhật tài khoản thành công!';
        res.redirect('/admin/tai-khoan');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/tai-khoan');
    }
});

router.get('/tai-khoan/xoa/:id', async (req, res) => {
    try {
        // Tìm và xóa tài khoản dựa vào ID trên đường dẫn
        await TaiKhoan.findByIdAndDelete(req.params.id);
        
        // Gán thông báo thành công
        req.session.success = 'Đã xóa tài khoản thành công!';
        
        // Quay lại trang danh sách tài khoản
        res.redirect('/admin/tai-khoan');
    } catch (err) {
        console.error("Lỗi khi xóa:", err);
        res.redirect('/admin/tai-khoan');
    }
});

//Quan lý đơn hàng
// Hiển thị danh sách đơn hàng
router.get('/don-hang', async (req, res) => {
    try {
        const dsDonHang = await DonHang.find().sort({ NgayDat: -1 });
        res.render('admin/donhang', { 
            title: 'Quản lý Đơn hàng', 
            dsDonHang: dsDonHang,
            success: req.session.success || null
        });
        delete req.session.success;
    } catch (err) {
        res.redirect('/admin');
    }
});

// Xem chi tiết đơn hàng (Trả về dữ liệu JSON để hiện Modal hoặc render trang mới)
router.get('/don-hang/chi-tiet/:id', async (req, res) => {
    try {
        const dh = await DonHang.findById(req.params.id).populate('ChiTiet.SachID');
        
        if (!dh) {
            return res.redirect('/admin/don-hang');
        }

        // TRUYỀN ĐẦY ĐỦ BIẾN title VÀ item
        res.render('admin/donhang_chitiet', { 
            title: 'Quản lý Đơn hàng', // Để Sidebar không bị lỗi undefined
            item: dh 
        });
    } catch (err) {
        console.error("Lỗi:", err);
        res.redirect('/admin/don-hang');
    }
});

// Cập nhật trạng thái đơn hàng (POST)
router.post('/don-hang/cap-nhat-trang-thai/:id', async (req, res) => {
   try {
        const { TrangThai } = req.body;
        // Ép kiểu TrangThai sang Number để khớp với Model DonHang
        await DonHang.findByIdAndUpdate(req.params.id, { 
            TrangThai: parseInt(TrangThai) 
        });
        res.redirect('/admin/don-hang/chi-tiet/' + req.params.id);
    } catch (err) {
        console.error(err);
        res.redirect('/admin/don-hang');
    }
});
//Quản lý doanh thu
router.get('/doanh-thu', async (req, res) => {
    try {
        // Thay vì tìm { TrangThai: 'Đã giao' }, bạn hãy dùng con số (ví dụ: 2)
        const allOrders = await DonHang.find({ TrangThai: 2 }); 
        const tongDoanhThu = allOrders.reduce((sum, dh) => sum + dh.TongTien, 0);

        // Đếm số đơn mới (Trạng thái 0 là Chờ xử lý)
        const soDonMoi = await DonHang.countDocuments({ TrangThai: 0 });

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const ordersToday = await DonHang.find({
            NgayDat: { $gte: startOfDay },
            TrangThai: 2 // Dùng số 2 thay vì chữ
        });
        
        const doanhThuHomNay = ordersToday.reduce((sum, dh) => sum + dh.TongTien, 0);

        res.render('admin/doanhthu', {
            title: 'Thống kê doanh thu',
            tongDoanhThu,
            soDonMoi,
            doanhThuHomNay,
            user: req.session.user
        });
    } catch (err) {
        console.error("Lỗi chi tiết:", err);
        res.status(500).send("Có lỗi xảy ra khi tính toán doanh thu.");
    }
});

module.exports = router;