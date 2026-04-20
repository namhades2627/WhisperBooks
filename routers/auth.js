const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const TaiKhoan = require('../models/taikhoan');

// GET: Đăng ký
router.get('/dangky', async (req, res) => {
	res.render('dangky', {
		title: 'Đăng ký tài khoản'
	});
});

// POST: Đăng ký
router.post('/dangky', async (req, res) => {
	try {
        const salt = bcrypt.genSaltSync(10);
        const data = {
            HoVaTen: req.body.HoVaTen,
            Email: req.body.Email,
            SoDienThoai: req.body.SoDienThoai,
            TenDangNhap: req.body.TenDangNhap,
            MatKhau: bcrypt.hashSync(req.body.MatKhau, salt)
        };
        await TaiKhoan.create(data);
        
        // Thay vì redirect sang /success không tồn tại
        // Hãy gửi thông báo thành công và quay về trang Đăng nhập
        req.session.success = 'Đăng ký tài khoản thành công! Hãy đăng nhập nhé.';
        res.redirect('/dangnhap'); 
    } catch (err) {
        req.session.error = 'Đăng ký thất bại, vui lòng thử lại.';
        res.redirect('/dangky');
    }
});

// GET: Đăng nhập
router.get('/dangnhap', async (req, res) => {
	res.render('dangnhap', {
		title: 'Đăng nhập'
	});
});

// POST: Đăng nhập
// POST: Đăng nhập (Đã sửa lỗi redirect và đồng bộ tên biến)
router.post('/dangnhap', async (req, res) => {
    if(req.session.user) { // Đổi từ MaNguoiDung sang user cho đồng bộ
        return res.redirect('/');
    }

    try {
        const taikhoan = await TaiKhoan.findOne({ TenDangNhap: req.body.TenDangNhap }).exec();
        
        if(taikhoan) {
            if(bcrypt.compareSync(req.body.MatKhau, taikhoan.MatKhau)) {
                if(taikhoan.KichHoat == 0) {
                    req.session.error = 'Tài khoản của bạn đã bị khóa.';
                    return res.redirect('/dangnhap'); // Quay lại trang login
                } else {
                    // LƯU USER VÀO SESSION (Đồng bộ với middleware ở index.js)
                    req.session.user = {
                        _id: taikhoan._id,
                        HoTen: taikhoan.HoVaTen,
                        QuyenHan: taikhoan.QuyenHan
                    };
                    return res.redirect('/');
                }
            } else {
                req.session.error = 'Mật khẩu không chính xác.';
                return res.redirect('/dangnhap');
            }
        } else {
            req.session.error = 'Tên đăng nhập không tồn tại.';
            return res.redirect('/dangnhap');
        }
    } catch (err) {
        req.session.error = 'Lỗi hệ thống, vui lòng thử lại sau.';
        return res.redirect('/dangnhap');
    }
});

// GET: Đăng xuất
router.get('/dangxuat', async (req, res) => {
	if (req.session.user) {
        delete req.session.user;
    }
    // Sau khi xóa thì quay về trang chủ
    res.redirect('/');
});

module.exports = router;