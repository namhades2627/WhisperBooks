const mongoose = require('mongoose');

const danhGiaSchema = new mongoose.Schema({
    // Liên kết với bảng Sách
    Sach_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sach', // Phải khớp với tên Model Sách của bạn
        required: true
    },
    // Liên kết với bảng Tài khoản
    User_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TaiKhoan', // Phải khớp với tên Model Tài khoản của bạn
        required: true
    },
    // Số sao (1 đến 5)
    SoSao: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        default: 5
    },
    // Nội dung đánh giá
    NoiDung: {
        type: String,
        required: [true, 'Vui lòng nhập nội dung đánh giá'],
        trim: true
    },
    // Ngày đánh giá
    NgayDanhGia: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Tự động tạo createdAt và updatedAt
});

module.exports = mongoose.model('DanhGia', danhGiaSchema);