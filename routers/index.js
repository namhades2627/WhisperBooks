const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const TheLoai = require('../models/theloai');
const Sach = require('../models/sach');
const DonHang = require('../models/donhang');
const sendOrderEmail = require('../utils/mailer');

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.get('/', async (req, res, next) => {
    try {
        const tl = await TheLoai.find();
        const dsSachMoi = await Sach.find({ KiemDuyet: 1 }).sort({ NgayNhap: -1 }).limit(4);
        const dsSachNoiBat = await Sach.find({ KiemDuyet: 1 }).sort({ LuotXem: -1 }).limit(4);
        return res.render('index', {
            title: 'Trang chủ',
            theloai: tl,
            sachMoi: dsSachMoi,
            sachNoiBat: dsSachNoiBat
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/the-loai/:id', async (req, res, next) => {
    try {
        const theLoaiId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(theLoaiId)) {
            return res.status(404).send('Không tìm thấy thể loại.');
        }
        const dsSach = await Sach.find({
            TheLoai: theLoaiId,
            KiemDuyet: 1
        }).populate('TheLoai');
        const theLoaiHienTai = await TheLoai.findById(theLoaiId);
        return res.render('tat_ca_sach', {
            title: `Sách thể loại: ${theLoaiHienTai ? theLoaiHienTai.TenTheLoai : 'Không xác định'}`,
            sach: dsSach,
            current: 1,
            pages: 1,
            user: req.session.user || null
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/tim-kiem', async (req, res, next) => {
    try {
        const keyword = typeof req.query.search === 'string' ? req.query.search.trim() : '';
        if (!keyword) {
            return res.redirect('/tat-ca-sach');
        }
        if (keyword.length > 100) {
            return res.status(400).send('Từ khóa tìm kiếm quá dài.');
        }
        const dsSach = await Sach.find({
            TenSach: { $regex: escapeRegex(keyword), $options: 'i' },
            KiemDuyet: 1
        }).populate('TheLoai');
        return res.render('tat_ca_sach', {
            title: `Kết quả tìm kiếm: ${keyword}`,
            sach: dsSach,
            current: 1,
            pages: 1,
            keyword
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/tat-ca-sach', async (req, res, next) => {
    try {
        const perPage = 12;
        const requestedPage = Number.parseInt(req.query.page, 10);
        const page = Number.isInteger(requestedPage) && requestedPage > 0
            ? Math.min(requestedPage, 10000)
            : 1;
        const query = { KiemDuyet: 1 };
        if (req.query.ncc) {
            query.NhaCungCap = String(req.query.ncc).slice(0, 100);
        }
        if (req.query.gia) {
            const mucGia = req.query.gia;
            if (mucGia === 'duoi100') query.GiaBan = { $lt: 100000 };
            else if (mucGia === '100-300') query.GiaBan = { $gte: 100000, $lte: 300000 };
            else if (mucGia === '300-500') query.GiaBan = { $gte: 300000, $lte: 500000 };
            else if (mucGia === 'tren500') query.GiaBan = { $gt: 500000 };
        }
        let sortOption = { _id: -1 };
        const sortType = req.query.sort;
        if (sortType === 'gia-tang') sortOption = { GiaBan: 1 };
        else if (sortType === 'gia-giam') sortOption = { GiaBan: -1 };
        else if (sortType === 'a-z') sortOption = { TenSach: 1 };
        else if (sortType === 'moi-nhat') sortOption = { _id: -1 };
        const dsSach = await Sach.find(query)
            .populate('TheLoai')
            .sort(sortOption)
            .skip((perPage * page) - perPage)
            .limit(perPage);
        const count = await Sach.countDocuments(query);
        return res.render('tat_ca_sach', {
            title: 'Tất cả sách',
            sach: dsSach,
            current: page,
            pages: Math.ceil(count / perPage)
        });
    } catch (err) {
        return next(err);
    }
});


router.get('/dangky', (req, res) => {
    res.render('dangky', { title: 'Đăng ký tài khoản' });
});

router.get('/dangnhap', (req, res) => {
    res.render('dangnhap', { title: 'Đăng nhập' });
});

router.get('/thanh-toan', (req, res) => {
    res.render('thanhtoan', { title: 'Thanh toán đơn hàng' });
});


router.post('/dat-hang', async (req, res) => {
    let session;
    try {
        if (!req.is('application/json')) {
            return res.status(415).json({ success: false, message: 'Yêu cầu phải có định dạng JSON.' });
        }
        const { HoVaTen, SoDienThoai, Email, DiaChi, DanhSachSanPham } = req.body;
        if (
            typeof HoVaTen !== 'string' || !HoVaTen.trim() || HoVaTen.length > 120 ||
            typeof SoDienThoai !== 'string' || !SoDienThoai.trim() || SoDienThoai.length > 30 ||
            typeof Email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email) ||
            typeof DiaChi !== 'string' || !DiaChi.trim() || DiaChi.length > 500 ||
            !Array.isArray(DanhSachSanPham) || !DanhSachSanPham.length || DanhSachSanPham.length > 50
        ) {
            return res.status(400).json({ success: false, message: 'Thông tin đặt hàng không hợp lệ.' });
        }

        const quantities = new Map();
        for (const item of DanhSachSanPham) {
            if (
                !item || typeof item.id !== 'string' || !mongoose.Types.ObjectId.isValid(item.id) ||
                !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 99
            ) {
                return res.status(400).json({ success: false, message: 'Sản phẩm hoặc số lượng không hợp lệ.' });
            }
            quantities.set(item.id, (quantities.get(item.id) || 0) + item.quantity);
            if (quantities.get(item.id) > 99) {
                return res.status(400).json({ success: false, message: 'Số lượng đặt vượt quá giới hạn.' });
            }
        }

        session = await mongoose.startSession();
        let donHangMoi;
        await session.withTransaction(async () => {
            const ids = [...quantities.keys()];
            const products = await Sach.find({ _id: { $in: ids }, KiemDuyet: 1 }).session(session);
            if (products.length !== ids.length) {
                const error = new Error('Một hoặc nhiều sách không còn khả dụng.');
                error.statusCode = 409;
                throw error;
            }

            let tongTien = 0;
            const chiTiet = products.map(product => {
                const SoLuong = quantities.get(String(product._id));
                if (product.SoLuong < SoLuong) {
                    const error = new Error(`Sách "${product.TenSach}" không đủ tồn kho.`);
                    error.statusCode = 409;
                    throw error;
                }
                tongTien += product.GiaBan * SoLuong;
                return { SachID: product._id, SoLuong, Gia: product.GiaBan };
            });

            if (!Number.isSafeInteger(tongTien) || tongTien <= 0) {
                const error = new Error('Tổng tiền đơn hàng không hợp lệ.');
                error.statusCode = 400;
                throw error;
            }

            for (const item of chiTiet) {
                const updated = await Sach.findOneAndUpdate(
                    { _id: item.SachID, KiemDuyet: 1, SoLuong: { $gte: item.SoLuong } },
                    { $inc: { SoLuong: -item.SoLuong } },
                    { new: true, session }
                );
                if (!updated) {
                    const error = new Error('Tồn kho vừa thay đổi. Vui lòng kiểm tra lại giỏ hàng.');
                    error.statusCode = 409;
                    throw error;
                }
            }

            donHangMoi = new DonHang({
                HoVaTen: HoVaTen.trim(),
                SoDienThoai: SoDienThoai.trim(),
                Email: Email.trim(),
                DiaChi: DiaChi.trim(),
                TongTien: tongTien,
                ChiTiet: chiTiet,
                TaiKhoan: req.session.user ? req.session.user._id : null
            });
            await donHangMoi.save({ session });
        });

        if (process.env.MAIL_USER && process.env.MAIL_PASS) {
            sendOrderEmail(Email.trim(), HoVaTen.trim(), donHangMoi._id, donHangMoi.TongTien)
                .catch(err => console.error('Lỗi gửi email xác nhận:', err.message));
        }
        return res.json({ success: true, message: 'Đặt hàng thành công!' });
    } catch (err) {
        console.error('Lỗi đặt hàng:', err);
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.statusCode ? err.message : 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.'
        });
    } finally {
        if (session) {
            await session.endSession();
        }
    }
});
module.exports = router;