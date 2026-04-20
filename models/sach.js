var mongoose = require('mongoose');

const sachSchema = new mongoose.Schema({
	// Liên kết tới Thể loại (thay vì ChuDe)
	TheLoai: { type: mongoose.Schema.Types.ObjectId, ref: 'TheLoai' },
	// Giữ lại người đăng (Admin nào thêm cuốn sách này)
	TaiKhoan: { type: mongoose.Schema.Types.ObjectId, ref: 'TaiKhoan' },
	
	NhaCungCap: { type: String }, 
    DoTuoi: { type: String },

	TenSach: { type: String, required: true },
	MoTa: { type: String,}, // Thay cho NoiDung
	GiaBan: { type: Number, required: true, default: 0 }, // Trường mới
	SoLuong: { type: Number, required: true, default: 0 }, // Trường mới
	HinhAnh: { type: String }, // Lưu tên file ảnh hoặc link ảnh bìa
	
	NgayNhap: { type: Date, default: Date.now },
	LuotXem: { type: Number, default: 0 },
	KiemDuyet: { type: Number, default: 1 } // Mặc định là 1 để hiện lên web luôn
});

var sachModel = mongoose.model('Sach', sachSchema);

module.exports = sachModel;