var express = require('express');
var router = express.Router();
var TheLoai = require('../models/theloai'); // Đã đổi tên model

// GET: Danh sách thể loại
router.get('/', async (req, res) => {
	var tl = await TheLoai.find();
	res.render('theloai', {
		title: 'Danh sách thể loại',
		theloai: tl
	});
});

// GET: Thêm thể loại
router.get('/them', async (req, res) => {
	res.render('theloai_them', {
		title: 'Thêm thể loại sách'
	});
});

// POST: Thêm thể loại
router.post('/them', async (req, res) => {
	var data = {
		TenTheLoai: req.body.TenTheLoai
	};
	await TheLoai.create(data);
	res.redirect('/theloai');
});

// GET: Sửa thể loại
router.get('/sua/:id', async (req, res) => {
	var id = req.params.id;
	var tl = await TheLoai.findById(id);
	res.render('theloai_sua', {
		title: 'Sửa thể loại',
		theloai: tl
	});
});

// POST: Sửa thể loại
router.post('/sua/:id', async (req, res) => {
	var id = req.params.id;
	var data = {
		TenTheLoai: req.body.TenTheLoai
	};
	await TheLoai.findByIdAndUpdate(id, data);
	res.redirect('/theloai');
});

// GET: Xóa thể loại
router.get('/xoa/:id', async (req, res) => {
	var id = req.params.id;
	await TheLoai.findByIdAndDelete(id);
	res.redirect('/theloai');
});

module.exports = router;