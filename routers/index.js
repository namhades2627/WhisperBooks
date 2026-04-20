const express = require('express');
const router = express.Router();
const TheLoai = require('../models/theloai');
const Sach = require('../models/sach');
const DonHang = require('../models/donhang');
const ChiTietDonHang = require('../models/chitiet_donhang');
const sendOrderEmail = require('../utils/mailer');
// GET: Trang chủ
// GET: Trang chủ
// GET: Trang chủ
router.get('/', async (req, res) => {
    try {
        // 1. Lấy Thể loại cho Navbar (Dùng song song để tốc độ nhanh hơn nếu cần)
        const tl = await TheLoai.find();

        // 2. Lấy 4 cuốn mới nhất
        const dsSachMoi = await Sach.find({ KiemDuyet: 1 }).sort({ NgayNhap: -1 }).limit(4);

        // 3. Lấy 4 cuốn nổi bật
        const dsSachNoiBat = await Sach.find({ KiemDuyet: 1 }).sort({ LuotXem: -1 }).limit(4);
        
        // 4. TRUYỀN BIẾN SANG EJS
        res.render('index', { 
            title: 'Trang chủ',
            theloai: tl,       
            sachMoi: dsSachMoi, 
            sachNoiBat: dsSachNoiBat,
        });
    } catch (err) {
        console.log("Lỗi trang chủ:", err);
        // CẬP NHẬT: Trong phần catch cũng cần truyền 'user' để header không bị lỗi undefined
        res.render('index', { 
            title: 'Trang chủ',
            theloai: [], 
            sachMoi: [], 
            sachNoiBat: [],
        });
    }
});

router.get('/the-loai/:id', async (req, res) => {
    try {
        const theLoaiId = req.params.id;
        
        // Tìm tất cả sách có trường TheLoai khớp với ID truyền vào
        const dsSach = await Sach.find({ 
            TheLoai: theLoaiId,
            KiemDuyet: 1 
        }).populate('TheLoai');

        // Tìm thông tin thể loại hiện tại để hiện tên lên tiêu đề trang
        const theLoaiHienTai = await TheLoai.findById(theLoaiId);

        res.render('tat_ca_sach', {
            title: `Sách thể loại: ${theLoaiHienTai ? theLoaiHienTai.TenTheLoai : 'Không xác định'}`,
            sach: dsSach,
            current: 1,
            pages: 1,
            user: req.session.user || null
        });
    } catch (err) {
        console.error(err);
        res.redirect('/tat-ca-sach');
    }
});

router.get('/tim-kiem', async (req, res) => {
    try {
        const keyword = req.query.search; // Lấy từ khóa người dùng nhập vào

        // Nếu người dùng không nhập gì mà bấm tìm kiếm
        if (!keyword || keyword.trim() === "") {
            return res.redirect('/tat-ca-sach');
        }

        // Tìm kiếm linh hoạt với Regex
        const dsSach = await Sach.find({
            // Tìm sách có TenSach chứa từ khóa keyword
            TenSach: { $regex: keyword, $options: 'i' }, 
            KiemDuyet: 1
        }).populate('TheLoai');

        // Trả kết quả về trang hiển thị (dùng chung giao diện tat_ca_sach)
        res.render('tat_ca_sach', {
            title: `Kết quả tìm kiếm: ${keyword}`,
            sach: dsSach,
            current: 1, // Reset về trang 1
            pages: 1,   // Tạm thời hiển thị 1 trang kết quả
            keyword: keyword // Gửi lại từ khóa để hiển thị trên giao diện nếu cần
        });
    } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
        res.redirect('/');
    }
});

// GET: Xem chi tiết sách
router.get('/sach/:id', async (req, res) => {
    try {
        // Tìm sách theo ID và lấy luôn thông tin Thể loại để hiển thị
        const s = await Sach.findById(req.params.id).populate('TheLoai');
        
        // Cập nhật lượt xem (tăng lên 1 mỗi lần click)
        s.LuotXem = (s.LuotXem || 0) + 1;
        await s.save();

        res.render('sach_chitiet', { 
            title: s.TenSach, 
            s: s,
            user: req.session.user || null
        });
    } catch (err) {
        console.error("Lỗi xem chi tiết sách:", err);
        res.redirect('/tat-ca-sach');
    }
});

router.get('/tat-ca-sach', async (req, res) => {
    try {
        const perPage = 12; 
        const page = parseInt(req.query.page) || 1; 
        let query = {};

        // 1. Lọc theo Nhà cung cấp
        if (req.query.ncc) {
            query.NhaCungCap = req.query.ncc; 
        }

        // 2. Lọc theo Mức giá
        if (req.query.gia) {
            const mucGia = req.query.gia;
            if (mucGia === 'duoi100') query.GiaBan = { $lt: 100000 };
            else if (mucGia === '100-300') query.GiaBan = { $gte: 100000, $lte: 300000 };
            else if (mucGia === '300-500') query.GiaBan = { $gte: 300000, $lte: 500000 };
            else if (mucGia === 'tren500') query.GiaBan = { $gt: 500000 };
        }

        // 3. Xử lý Sắp xếp
        let sortOption = { _id: -1 };
        const sortType = req.query.sort;
        if (sortType === 'gia-tang') sortOption = { GiaBan: 1 };
        else if (sortType === 'gia-giam') sortOption = { GiaBan: -1 };
        else if (sortType === 'a-z') sortOption = { TenSach: 1 };
        else if (sortType === 'moi-nhat') sortOption = { _id: -1 };

        // 4. Thực hiện truy vấn có Phân trang
        const dsSach = await Sach.find(query)
            .populate('TheLoai')
            .sort(sortOption)
            .skip((perPage * page) - perPage) // Bỏ qua số sách của các trang trước
            .limit(perPage); // Chỉ lấy đúng số lượng sách quy định cho 1 trang

        // 5. Đếm tổng số sách khớp với query để tính tổng số trang
        const count = await Sach.countDocuments(query);

        res.render('tat_ca_sach', {
            title: 'Tất cả sách',
            sach: dsSach,
            current: page,
            pages: Math.ceil(count / perPage) // Tính tổng số trang (Ví dụ: 24/12 = 2 trang)
        });
    } catch (err) {
        console.error("Lỗi:", err);
        res.redirect('/');
    }
});

// GET: Trang đăng ký
router.get('/dangky', async (req, res) => {
    const tl = await TheLoai.find();
    res.render('dangky', { title: 'Đăng ký tài khoản', theloai: tl });
});

router.get('/dangnhap', async (req, res) => {
    const tl = await TheLoai.find();
    res.render('dangnhap', { title: 'Đăng nhập', theloai: tl });
});

router.get('/thanh-toan', (req, res) => {
    res.render('thanhtoan', { title: 'Thanh toán đơn hàng' });
});

// Route nhận đơn hàng (Kết nối với Admin)
router.post('/dat-hang', async (req, res) => {
   try {
        const { HoVaTen, SoDienThoai, Email, DiaChi, DanhSachSanPham, TongTien } = req.body;

        const chiTietDonHang = DanhSachSanPham.map(item => ({
            SachID: item.id,
            SoLuong: item.quantity,
            Gia: item.gia
        }));

        const soTien = parseInt(TongTien.replace(/[^0-9]/g, ''));

        const donHangMoi = new DonHang({
            HoVaTen,
            SoDienThoai,
            Email,
            DiaChi,
            TongTien: soTien,
            ChiTiet: chiTietDonHang,
            TaiKhoan: req.session.user ? req.session.user._id : null
        });

        // 1. Lưu đơn hàng
        await donHangMoi.save();

        // 2. Trừ số lượng kho
        for (const item of DanhSachSanPham) {
            await Sach.findByIdAndUpdate(item.id, {
                $inc: { SoLuong: -item.quantity } 
            });
        }

        // 3. Gửi email thông báo (Chạy ngầm, không dùng await để khách đỡ đợi)
        if (Email) {
            sendOrderEmail(Email, HoVaTen, donHangMoi._id, donHangMoi.TongTien)
                .catch(e => console.error("Lỗi gửi mail ngầm:", e));
        }

        // 4. CHỈ TRẢ VỀ JSON MỘT LẦN DUY NHẤT TẠI ĐÂY
        res.json({ success: true, message: 'Đặt hàng thành công!' });

    } catch (err) {
        console.error("Lỗi đặt hàng:", err);
        // Trả về lỗi nếu có biến cố
        if (!res.headersSent) {
            res.json({ success: false, message: 'Có lỗi xảy ra khi đặt hàng' });
        }
    }
});
module.exports = router;