const express = require('express');
const router = express.Router();
const TheLoai = require('../models/theloai');
const Sach = require('../models/sach');
const DanhGia = require('../models/danhgia');

// GET: Danh sách sách
router.get('/', async (req, res) => {
	const s = await Sach.find()
		.populate('TheLoai')
		.populate('TaiKhoan').exec();
	res.render('admin/sach', {
		title: 'Danh sách sách',
		dsSach: s,
		dsDanhGia: []
	});
});

router.post('/danh-gia', async (req, res) => {
    try {
        // 1. Kiểm tra đăng nhập
        if (!req.session.user) {
            req.session.error = 'Bạn cần đăng nhập để gửi đánh giá!';
            return res.redirect('back'); // Quay lại trang chi tiết sách
        }

        // 2. Lấy dữ liệu từ Modal gửi lên
        const { Sach_id, SoSao, NoiDung } = req.body;

        // 3. Tạo bản ghi mới
        const moi = new DanhGia({
            Sach_id: Sach_id,
            User_id: req.session.user._id, // Lấy ID người dùng từ Session
            SoSao: parseInt(SoSao),
            NoiDung: NoiDung
        });

        await moi.save();
        req.session.success = 'Cảm ơn Nhựt Nam! Đánh giá của bạn đã được gửi.';
        res.redirect('back');
    } catch (err) {
        console.error(err);
        req.session.error = 'Lỗi khi gửi đánh giá: ' + err.message;
        res.redirect('back');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const s = await Sach.findById(req.params.id).populate('TheLoai');
        
        // Lấy danh sách đánh giá của sách này
        const dsDanhGia = await DanhGia.find({ Sach_id: req.params.id })
            .populate('User_id', 'HoVaTen')
            .sort({ createdAt: -1 });

        res.render('sach_chitiet', {
            title: s.TenSach,
            s: s,
            dsDanhGia: dsDanhGia,
            user: req.session.user || null
        });
    } catch (err) {
        console.error("Lỗi trang chi tiết:", err);
        res.redirect('/sach');
    }
});

// GET: Thêm sách
router.get('/them', async (req, res) => {
	const tl = await TheLoai.find();
	res.render('sach_them', {
		title: 'Thêm sách mới',
		theloai: tl
	});
});

// POST: Thêm sách
router.post('/them', async (req, res) => {
	if(req.session.MaNguoiDung) {
		const data = {
			TheLoai: req.body.MaTheLoai,
			TaiKhoan: req.session.MaNguoiDung,
			TenSach: req.body.TenSach,
			NhaCungCap: req.body.NhaCungCap,
			MoTa: req.body.MoTa,
			GiaBan: req.body.GiaBan,
			SoLuong: req.body.SoLuong,
			HinhAnh: req.body.HinhAnh // Nhận trực tiếp Link URL từ form
		};
		await Sach.create(data);
		req.session.success = 'Đã thêm sách thành công.';
		res.redirect('/success');
	} else {
		res.redirect('/dangnhap');
	}
});

// GET: Sửa sách
router.get('/sua/:id', async (req, res) => {
	const id = req.params.id;
	const tl = await TheLoai.find();
	const s = await Sach.findById(id);
	res.render('sach_sua', {
		title: 'Sửa thông tin sách',
		theloai: tl,
		sach: s
	});
});

// POST: Sửa sách
router.post('/sua/:id', async (req, res) => {
	const id = req.params.id;
	const data = {
		TheLoai: req.body.MaTheLoai,
		TenSach: req.body.TenSach,
		NhaCungCap: req.body.NhaCungCap,
		MoTa: req.body.MoTa,
		GiaBan: req.body.GiaBan,
		SoLuong: req.body.SoLuong,
		HinhAnh: req.body.HinhAnh
	};
	await Sach.findByIdAndUpdate(id, data);
	req.session.success = 'Đã cập nhật sách thành công.';
	res.redirect('/success');
});

// GET: Xóa sách
router.get('/xoa/:id', async (req, res) => {
	await Sach.findByIdAndDelete(req.params.id);
	res.redirect(req.get('Referrer') || '/sach');
});

module.exports = router;