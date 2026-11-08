var mongoose = require('mongoose');

const sachSchema = new mongoose.Schema({
	TheLoai: { type: mongoose.Schema.Types.ObjectId, ref: 'TheLoai' },
	TaiKhoan: { type: mongoose.Schema.Types.ObjectId, ref: 'TaiKhoan' },
	
	NhaCungCap: { type: String }, 
    DoTuoi: { type: String },

	TenSach: { type: String, required: true },
	MoTa: { type: String,}, 
	GiaBan: { type: Number, required: true, default: 0 }, 
	SoLuong: { type: Number, required: true, default: 0 }, 
	HinhAnh: { type: String }, 
	
	NgayNhap: { type: Date, default: Date.now },
	LuotXem: { type: Number, default: 0 },
	KiemDuyet: { type: Number, default: 1 } 
});

var sachModel = mongoose.model('Sach', sachSchema);

module.exports = sachModel;