const express = require('express');
const router = express.Router();
const TheLoai = require('../models/theloai');
const Sach = require('../models/sach');

// GET: Danh sách sách
router.get('/', async (req, res) => {
	const s = await Sach.find()
		.populate('TheLoai')
		.populate('TaiKhoan').exec();
	res.render('sach', {
		title: 'Danh sách sách',
		sach: s
	});
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