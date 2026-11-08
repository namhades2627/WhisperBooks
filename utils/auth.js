function requireLogin(req, res, next) {
    if (!req.session.user) {
        req.session.error = 'Vui lòng đăng nhập để tiếp tục.';
        return res.redirect('/dangnhap');
    }

    next();
}

function requireAdmin(req, res, next) {
    if (!req.session.user) {
        req.session.error = 'Vui lòng đăng nhập bằng tài khoản quản trị.';
        return res.redirect('/dangnhap');
    }

    const TaiKhoan = require('../models/taikhoan');
    return TaiKhoan.findById(req.session.user._id).select('QuyenHan KichHoat')
        .then(account => {
            if (!account || account.KichHoat === 0) {
                return res.status(401).send('Tài khoản không còn hoạt động. Vui lòng đăng nhập lại.');
            }
            const role = account.QuyenHan;
            if (role !== 1 && role !== '1' && role !== 'admin') {
                return res.status(403).send('Bạn không có quyền truy cập chức năng này.');
            }
            req.session.user.QuyenHan = role;
            return next();
        })
        .catch(next);
}

module.exports = { requireLogin, requireAdmin };
