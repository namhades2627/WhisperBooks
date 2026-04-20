var mongoose = require('mongoose');

var theLoaiSchema = new mongoose.Schema({
    TenTheLoai: { type: String, required: true },
    TenTheLoaiKhongDau: { type: String } // Dùng làm slug cho URL
});

// Chú ý: Đặt tên model là 'TheLoai' để khớp với 'ref' ở các file khác
module.exports = mongoose.model('TheLoai', theLoaiSchema);