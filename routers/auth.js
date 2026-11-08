const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const TaiKhoan = require('../models/taikhoan');


router.get('/dangky', async (req, res) => {
	res.render('dangky', {
		title: 'Đăng ký tài khoản'
	});
});


router.post('/dangky', async (req, res) => {
	try {
        const { HoVaTen, Email, SoDienThoai, TenDangNhap, MatKhau, XacNhanMatKhau } = req.body;
        if (
            typeof HoVaTen !== 'string' || !HoVaTen.trim() || HoVaTen.length > 120 ||
            typeof TenDangNhap !== 'string' || !/^[a-zA-Z0-9_.-]{3,40}$/.test(TenDangNhap) ||
            typeof MatKhau !== 'string' || MatKhau.length < 8 ||
            MatKhau !== XacNhanMatKhau ||
            typeof Email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)
        ) {
            req.session.error = 'Thông tin đăng ký không hợp lệ hoặc mật khẩu xác nhận không khớp.';
            return res.redirect('/dangky');
        }
        const data = {
            HoVaTen: HoVaTen.trim(),
            Email: Email.trim(),
            SoDienThoai: typeof SoDienThoai === 'string' ? SoDienThoai.trim() : '',
            TenDangNhap,
            MatKhau: await bcrypt.hash(MatKhau, 12)
        };
        await TaiKhoan.create(data);
        req.session.success = 'Đăng ký tài khoản thành công! Hãy đăng nhập nhé.';
        return res.redirect('/dangnhap');
    } catch (err) {
        console.error('Lỗi đăng ký:', err);
        req.session.error = err.code === 11000
            ? 'Tên đăng nhập đã được sử dụng.'
            : 'Đăng ký thất bại, vui lòng thử lại.';
        return res.redirect('/dangky');
    }
});


router.get('/dangnhap', async (req, res) => {
	res.render('dangnhap', {
		title: 'Đăng nhập'
	});
});



router.post('/dangnhap', async (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/');
    }

    try {
        const { TenDangNhap, MatKhau } = req.body;
        if (typeof TenDangNhap !== 'string' || typeof MatKhau !== 'string') {
            req.session.error = 'Tên đăng nhập hoặc mật khẩu không chính xác.';
            return res.redirect('/dangnhap');
        }
        const taikhoan = await TaiKhoan.findOne({ TenDangNhap }).exec();
        if (!taikhoan || !(await bcrypt.compare(MatKhau, taikhoan.MatKhau))) {
            req.session.error = 'Tên đăng nhập hoặc mật khẩu không chính xác.';
            return res.redirect('/dangnhap');
        }
        if (taikhoan.KichHoat === 0) {
            req.session.error = 'Tài khoản của bạn đã bị khóa.';
            return res.redirect('/dangnhap');
        }

        await new Promise((resolve, reject) => {
            req.session.regenerate(err => err ? reject(err) : resolve());
        });
        req.session.user = {
            _id: taikhoan._id,
            HoTen: taikhoan.HoVaTen,
            QuyenHan: taikhoan.QuyenHan
        };
        await new Promise((resolve, reject) => {
            req.session.save(err => err ? reject(err) : resolve());
        });
        return res.redirect('/');
    } catch (err) {
        return next(err);
    }
});


router.post('/dangxuat', (req, res, next) => {
    req.session.destroy(err => {
        if (err) {
            return next(err);
        }
        res.clearCookie('BookStore_Session', {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        });
        return res.redirect('/');
    });
});

module.exports = router;