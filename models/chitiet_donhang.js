const mongoose = require('mongoose');

const chiTietDonHangSchema = new mongoose.Schema({
    // Sửa ref thành 'DonHang' và 'Sach'
    DonHang: { type: mongoose.Schema.Types.ObjectId, ref: 'DonHang' }, 
    Sach: { type: mongoose.Schema.Types.ObjectId, ref: 'Sach' },      
    SoLuong: Number,
    DonGia: Number 
});

module.exports = mongoose.model('ChiTietDonHang', chiTietDonHangSchema);