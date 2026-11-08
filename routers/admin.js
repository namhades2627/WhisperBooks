const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { requireAdmin } = require('../utils/auth');

const Sach = require('../models/sach');
const TaiKhoan = require('../models/taikhoan');
const TheLoai = require('../models/theloai');
const DonHang = require('../models/donhang');
const DanhGia = require('../models/danhgia');

router.use(requireAdmin);

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


router.get('/sach/them', async (req, res) => {
    try {
        const tl = await TheLoai.find();
        res.render('admin/sach_them', { title: 'Thêm sách mới', dsTheLoai: tl });
    } catch (err) {
        res.redirect('/admin/sach');
    }
});


router.post('/sach/them', async (req, res) => {
    try {
        const moi = new Sach({
            TenSach: req.body.TenSach,
            TheLoai: req.body.TheLoai,
            NhaCungCap: req.body.NhaCungCap,
            MoTa: req.body.MoTa,
            GiaBan: req.body.GiaBan,
            SoLuong: req.body.SoLuong,
            HinhAnh: req.body.HinhAnh || 'no-image.jpg'
        });
        
        await moi.save();
        req.session.success = 'Đã thêm sách mới thành công!';
        res.redirect('/admin/sach');
    } catch (err) {
        console.error("Lỗi khi lưu sách:", err);
        req.session.error = 'Không thể thêm sách. Vui lòng kiểm tra thông tin.';
        res.redirect('/admin/sach/them');
    }
});


router.get('/sach/sua/:id', async (req, res) => {
    try {
        const s = await Sach.findById(req.params.id);
        if (!s) {
            return res.status(404).send('Không tìm thấy sách.');
        }
        const tl = await TheLoai.find();
        res.render('admin/sach_sua', { title: 'Sửa thông tin sách', item: s, dsTheLoai: tl });
    } catch (err) {
        res.redirect('/admin/sach');
    }
});


router.post('/sach/sua/:id', async (req, res) => {
    try {
        const { TenSach, TheLoai, NhaCungCap, MoTa, GiaBan, SoLuong, HinhAnh } = req.body;
        await Sach.findByIdAndUpdate(req.params.id, {
            TenSach,
            TheLoai,
            NhaCungCap,
            MoTa,
            GiaBan,
            SoLuong,
            HinhAnh
        }, { runValidators: true });
        req.session.success = 'Cập nhật thông tin sách thành công!';
        res.redirect('/admin/sach');
    } catch (err) {
        req.session.error = 'Lỗi khi cập nhật: ' + err.message;
        res.redirect('/admin/sach/sua/' + req.params.id);
    }
});


router.delete('/sach/xoa/:id', async (req, res) => {
    try {
        await Sach.findByIdAndDelete(req.params.id);
        req.session.success = 'Đã xóa sách khỏi hệ thống!';
        res.redirect('/admin/sach');
    } catch (err) {
        req.session.error = 'Không thể xóa sách: ' + err.message;
        res.redirect('/admin/sach');
    }
});



router.get('/tai-khoan', async (req, res) => {
    try {
        const tk = await TaiKhoan.find().select('-MatKhau');
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


router.post('/tai-khoan/them', async (req, res) => {
    try {
        
        const { HoVaTen, Email, TenDangNhap, MatKhau, SoDienThoai, QuyenHan } = req.body;

        
        if (typeof MatKhau !== 'string' || MatKhau.length < 8) {
            req.session.error = 'Mật khẩu phải có ít nhất 8 ký tự.';
            return res.redirect('/admin/tai-khoan/them');
        }

        const taiKhoanMoi = new TaiKhoan({
            HoVaTen,
            Email,
            TenDangNhap,
            MatKhau: await bcrypt.hash(MatKhau, 12),
            SoDienThoai,
            QuyenHan: QuyenHan === '1' || QuyenHan === 'admin' ? 1 : 0,
            KichHoat: 1
        });

        
        await taiKhoanMoi.save();

        
        req.session.success = 'Đã thêm tài khoản mới thành công!';
        res.redirect('/admin/tai-khoan');
    } catch (err) {
        console.error("Lỗi khi thêm tài khoản:", err);
        
        req.session.error = 'Không thể thêm tài khoản. Vui lòng kiểm tra dữ liệu và tên đăng nhập.';
        res.redirect('/admin/tai-khoan/them');
    }
});

router.get('/tai-khoan/sua/:id', async (req, res) => {
    try {
        const tk = await TaiKhoan.findById(req.params.id);
        if (!tk) {
            return res.status(404).send('Không tìm thấy tài khoản.');
        }
        res.render('admin/taikhoan_sua', { 
            title: 'Sửa tài khoản', 
            item: tk 
        });
    } catch (err) {
        res.redirect('/admin/tai-khoan');
    }
});

router.post('/tai-khoan/sua/:id', async (req, res) => {
    try {
        const { HoVaTen, Email, SoDienThoai, QuyenHan, MatKhau } = req.body;
        
        
        let dataUpdate = {
            HoVaTen: HoVaTen,
            Email: Email,
            SoDienThoai: SoDienThoai,
            QuyenHan: QuyenHan === '1' || QuyenHan === 'admin' ? 1 : 0
        };
        
        if (MatKhau && MatKhau.trim() !== "") {
            if (MatKhau.length < 8) {
                req.session.error = 'Mật khẩu phải có ít nhất 8 ký tự.';
                return res.redirect('/admin/tai-khoan/sua/' + req.params.id);
            }
            dataUpdate.MatKhau = await bcrypt.hash(MatKhau, 12);
        }

        await TaiKhoan.findByIdAndUpdate(req.params.id, dataUpdate, { runValidators: true });
        
        req.session.success = 'Cập nhật tài khoản thành công!';
        res.redirect('/admin/tai-khoan');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/tai-khoan');
    }
});

router.delete('/tai-khoan/xoa/:id', async (req, res) => {
    try {
        
        await TaiKhoan.findByIdAndDelete(req.params.id);
        
        
        req.session.success = 'Đã xóa tài khoản thành công!';
        
        
        res.redirect('/admin/tai-khoan');
    } catch (err) {
        console.error("Lỗi khi xóa:", err);
        res.redirect('/admin/tai-khoan');
    }
});



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


router.get('/don-hang/chi-tiet/:id', async (req, res) => {
    try {
        const dh = await DonHang.findById(req.params.id).populate('ChiTiet.SachID');
        
        if (!dh) {
            return res.redirect('/admin/don-hang');
        }

        
        res.render('admin/donhang_chitiet', { 
            title: 'Quản lý Đơn hàng', 
            item: dh 
        });
    } catch (err) {
        console.error("Lỗi:", err);
        res.redirect('/admin/don-hang');
    }
});


router.post('/don-hang/cap-nhat-trang-thai/:id', async (req, res) => {
   try {
        const TrangThai = Number(req.body.TrangThai);
        if (![0, 1, 2, 3].includes(TrangThai)) {
            req.session.error = 'Trạng thái đơn hàng không hợp lệ.';
            return res.redirect('/admin/don-hang/chi-tiet/' + req.params.id);
        }
        await DonHang.findByIdAndUpdate(req.params.id, { 
            TrangThai
        }, { runValidators: true });
        res.redirect('/admin/don-hang/chi-tiet/' + req.params.id);
    } catch (err) {
        console.error(err);
        res.redirect('/admin/don-hang');
    }
});

router.get('/doanh-thu', async (req, res) => {
    try {
        
        const allOrders = await DonHang.find({ TrangThai: 2 }); 
        const tongDoanhThu = allOrders.reduce((sum, dh) => sum + dh.TongTien, 0);

        
        const soDonMoi = await DonHang.countDocuments({ TrangThai: 0 });

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const ordersToday = await DonHang.find({
            NgayDat: { $gte: startOfDay },
            TrangThai: 2 
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

router.get('/danh-gia', async (req, res) => {
    try {
        const dsDanhGia = await DanhGia.find()
            .populate('Sach_id', 'TenSach HinhAnh') 
            .populate('User_id', 'HoVaTen')        
            .sort({ createdAt: -1 });              

        res.render('admin/danhgia', {
            title: 'Quản lý đánh giá',
            dsDanhGia: dsDanhGia
        });
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
});

router.delete('/xoa-danh-gia/:id', async (req, res) => {
    try {
        await DanhGia.findByIdAndDelete(req.params.id);
        res.redirect('/admin/danh-gia'); 
    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
});
module.exports = router;