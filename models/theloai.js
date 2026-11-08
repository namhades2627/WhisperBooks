var mongoose = require('mongoose');

var theLoaiSchema = new mongoose.Schema({
    TenTheLoai: { type: String, required: true },
    TenTheLoaiKhongDau: { type: String } 
});

module.exports = mongoose.model('TheLoai', theLoaiSchema);