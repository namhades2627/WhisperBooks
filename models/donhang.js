const mongoose = require('mongoose');

const donHangSchema = new mongoose.Schema({
    TaiKhoan: { type: mongoose.Schema.Types.ObjectId, ref: 'TaiKhoan' }, 
    HoVaTen: String,
    Email: String,
    SoDienThoai: String,
    DiaChi: String,
    TongTien: Number,
    NgayDat: { type: Date, default: Date.now },
    TrangThai: { type: Number, default: 0 },
    ChiTiet: [
        {
            SachID: { type: mongoose.Schema.Types.ObjectId, ref: 'Sach' },
            SoLuong: { type: Number, default: 1 },
            Gia: { type: Number, default: 0 }
        }
    ]
});

module.exports = mongoose.models.DonHang || mongoose.model('DonHang', donHangSchema);