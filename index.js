const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');

// ==========================================
// 1. CẤU HÌNH CƠ BẢN & KẾT NỐI DB
// ==========================================
const uri = 'mongodb://namdth235702_db_user:admin123@ac-nq70ayn-shard-00-01.bd4jdak.mongodb.net:27017/QuanLyHieuSach?ssl=true&authSource=admin';
mongoose.connect(uri)
    .then(() => console.log('Đã kết nối MongoDB Atlas thành công!'))
    .catch(err => console.log('Lỗi kết nối DB:', err));

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 2. CẤU HÌNH SESSION (Phải đặt trước Middleware)
// ==========================================
app.use(session({
    name: 'BookStore_Session',
    secret: 'NhutNam_Bookstore_Secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 ngày
    }
}));

// ==========================================
// 3. MIDDLEWARE TRUYỀN BIẾN TOÀN CỤC (QUAN TRỌNG NHẤT)
// Đặt đoạn này TRƯỚC các Router để mọi trang đều nhận được dữ liệu
// ==========================================
app.use(async (req, res, next) => {
    try {
        const TheLoai = require('./models/theloai'); 
        
        // Lấy danh sách thể loại sắp xếp theo tên
        const dstl = await TheLoai.find().sort({ TenTheLoai: 1 });
        
        // Gán tất cả biến cần thiết vào res.locals
        res.locals.dsTheLoai = dstl; 
        res.locals.user = req.session.user || null; 
        res.locals.session = req.session;
        res.locals.error = req.session.error || '';
        res.locals.success = req.session.success || '';
        
        // Xóa thông báo sau khi đã gán vào locals
        delete req.session.error;
        delete req.session.success;
        
        next();
    } catch (err) {
        console.error("Lỗi Middleware tại index.js:", err);
        res.locals.dsTheLoai = []; 
        res.locals.user = req.session.user || null;
        next();
    }
});

// ==========================================
// 4. ĐIỀU HƯỚNG ROUTERS (Đặt sau Middleware)
// ==========================================
const indexRouter = require('./routers/index');
const authRouter = require('./routers/auth');
const theloaiRouter = require('./routers/theloai');
const taikhoanRouter = require('./routers/taikhoan');
const sachRouter = require('./routers/sach');
const adminRouter = require('./routers/admin');

app.use('/admin', adminRouter);
app.use('/theloai', theloaiRouter);
app.use('/taikhoan', taikhoanRouter);
app.use('/sach', sachRouter);
app.use('/', authRouter);
app.use('/', indexRouter); // indexRouter thường đặt cuối cùng để tránh trùng lặp route

// Mặc định cho admin
app.get('/admin', (req, res) => {
    res.redirect('/admin/don-hang');
});

// ==========================================
// 5. KHỞI CHẠY SERVER
// ==========================================
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Hiệu sách Whisper Books đang chạy tại: http://localhost:${port}`);
});