var mongoose = require('mongoose');

var taiKhoanSchema = new mongoose.Schema({
    HoVaTen: { type: String, required: true },
    Email: { type: String },
    SoDienThoai: { type: String },
    TenDangNhap: { type: String, unique: true, required: true },
    MatKhau: { type: String, required: true },
    QuyenHan: { type: String, default: '0' },
    KichHoat: { type: Number, default: 1 }
});

module.exports = mongoose.models.TaiKhoan || mongoose.model('TaiKhoan', taiKhoanSchema);