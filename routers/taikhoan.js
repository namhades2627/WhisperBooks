const express = require('express');
const router = express.Router();
const TaiKhoan = require('../models/taikhoan');
const { requireAdmin } = require('../utils/auth');

router.use(requireAdmin);

router.get('/', (req, res) => {
    res.redirect('/admin/tai-khoan');
});

router.get('/them', (req, res) => {
    res.redirect('/admin/tai-khoan/them');
});

router.post('/them', (req, res) => {
    res.redirect('/admin/tai-khoan/them');
});

router.get('/sua/:id', (req, res) => {
    res.redirect(`/admin/tai-khoan/sua/${encodeURIComponent(req.params.id)}`);
});

router.post('/sua/:id', (req, res) => {
    res.redirect(`/admin/tai-khoan/sua/${encodeURIComponent(req.params.id)}`);
});

router.delete('/xoa/:id', async (req, res, next) => {
    try {
        await TaiKhoan.findByIdAndDelete(req.params.id);
        req.session.success = 'Đã xóa tài khoản thành công.';
        return res.redirect('/admin/tai-khoan');
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
