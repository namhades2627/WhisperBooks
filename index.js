require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const methodOverride = require('method-override');

const uri = process.env.MONGODB_URI;
const sessionSecret = process.env.SESSION_SECRET;

if (!uri || !sessionSecret || sessionSecret.length < 32) {
    throw new Error('Cần cấu hình MONGODB_URI và SESSION_SECRET dài tối thiểu 32 ký tự.');
}

const app = express();

mongoose.connect(uri)
    .then(() => console.log('Đã kết nối MongoDB Atlas thành công!'))
    .catch(err => console.error('Lỗi kết nối DB:', err.message));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(session({
    name: 'BookStore_Session',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    }
}));

app.get('/health', (req, res) => {
    const databaseReady = mongoose.connection.readyState === 1;
    res.status(databaseReady ? 200 : 503).json({
        status: databaseReady ? 'ok' : 'database-unavailable'
    });
});

app.use(async (req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.session = req.session;
    res.locals.error = req.session.error || '';
    res.locals.success = req.session.success || '';
    delete req.session.error;
    delete req.session.success;

    if (mongoose.connection.readyState !== 1) {
        res.locals.dsTheLoai = [];
        return res.status(503).send('Dịch vụ dữ liệu hiện không khả dụng. Vui lòng thử lại sau.');
    }

    try {
        const TheLoai = require('./models/theloai');
        res.locals.dsTheLoai = await TheLoai.find().sort({ TenTheLoai: 1 });
        return next();
    } catch (err) {
        return next(err);
    }
});

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
app.use('/', indexRouter);

app.get('/admin', (req, res) => {
    res.redirect('/admin/don-hang');
});

app.use((err, req, res, next) => {
    console.error('Lỗi xử lý request:', err);
    if (res.headersSent) {
        return next(err);
    }
    const status = mongoose.connection.readyState === 1 ? 500 : 503;
    return res.status(status).send(status === 503
        ? 'Dịch vụ dữ liệu hiện không khả dụng. Vui lòng thử lại sau.'
        : 'Đã xảy ra lỗi khi xử lý yêu cầu.');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Hiệu sách Whisper Books đang chạy tại: http://localhost:${port}`);
});
