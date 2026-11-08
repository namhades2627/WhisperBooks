const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Sach = require('../models/sach');
const DanhGia = require('../models/danhgia');
const sanitizeHtml = require('sanitize-html');
const { requireAdmin, requireLogin } = require('../utils/auth');

router.get('/', requireAdmin, (req, res) => {
    res.redirect('/admin/sach');
});

router.post('/danh-gia', requireLogin, async (req, res) => {
    try {
        const { Sach_id, SoSao, NoiDung } = req.body;
        const rating = Number(SoSao);
        if (
            typeof Sach_id !== 'string' || !mongoose.Types.ObjectId.isValid(Sach_id) ||
            !Number.isInteger(rating) || rating < 1 || rating > 5 ||
            typeof NoiDung !== 'string' || !NoiDung.trim() || NoiDung.length > 2000
        ) {
            req.session.error = 'Thông tin đánh giá không hợp lệ.';
            return res.redirect('back');
        }

        const bookExists = await Sach.exists({ _id: Sach_id, KiemDuyet: 1 });
        if (!bookExists) {
            req.session.error = 'Không tìm thấy sách để đánh giá.';
            return res.redirect('/tat-ca-sach');
        }

        await DanhGia.create({
            Sach_id,
            User_id: req.session.user._id,
            SoSao: rating,
            NoiDung: NoiDung.trim()
        });
        req.session.success = 'Cảm ơn bạn đã gửi đánh giá.';
        return res.redirect(`/sach/${Sach_id}`);
    } catch (err) {
        console.error('Lỗi gửi đánh giá:', err);
        req.session.error = 'Không thể gửi đánh giá. Vui lòng thử lại.';
        return res.redirect('back');
    }
});

router.get('/them', requireAdmin, (req, res) => {
    res.redirect('/admin/sach/them');
});

router.post('/them', requireAdmin, (req, res) => {
    res.redirect('/admin/sach/them');
});

router.get('/sua/:id', requireAdmin, (req, res) => {
    res.redirect(`/admin/sach/sua/${encodeURIComponent(req.params.id)}`);
});

router.post('/sua/:id', requireAdmin, (req, res) => {
    res.redirect(`/admin/sach/sua/${encodeURIComponent(req.params.id)}`);
});

router.delete('/xoa/:id', requireAdmin, async (req, res) => {
    try {
        await Sach.findByIdAndDelete(req.params.id);
        req.session.success = 'Đã xóa sách khỏi hệ thống.';
        return res.redirect('/admin/sach');
    } catch (err) {
        console.error('Lỗi xóa sách:', err);
        req.session.error = 'Không thể xóa sách.';
        return res.redirect('/admin/sach');
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).send('Không tìm thấy sách.');
        }
        const s = await Sach.findOne({ _id: req.params.id, KiemDuyet: 1 }).populate('TheLoai');
        if (!s) {
            return res.status(404).send('Không tìm thấy sách.');
        }
        s.MoTa = sanitizeHtml(s.MoTa || '');
        const dsDanhGia = await DanhGia.find({ Sach_id: req.params.id })
            .populate('User_id', 'HoVaTen')
            .sort({ createdAt: -1 });
        return res.render('sach_chitiet', {
            title: s.TenSach,
            s,
            dsDanhGia,
            user: req.session.user || null
        });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
