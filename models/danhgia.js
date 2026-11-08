const mongoose = require('mongoose');

const danhGiaSchema = new mongoose.Schema({
    Sach_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sach', 
        required: true
    },
    User_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TaiKhoan', 
        required: true
    },
    SoSao: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        default: 5
    },
    NoiDung: {
        type: String,
        required: [true, 'Vui lòng nhập nội dung đánh giá'],
        trim: true
    },
    NgayDanhGia: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true 
});

module.exports = mongoose.model('DanhGia', danhGiaSchema);