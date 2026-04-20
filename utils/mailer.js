const nodemailer = require('nodemailer');

const sendOrderEmail = async (emailKhach, hoTen, maDonHang, tongTien) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'namhades2627@gmail.com', 
                pass: 'czah muhe rjat olyt'    
            }
        });

        const mailOptions = {
            from: '"Whisper Books 📚" <namhades2627@gmail.com>',
            to: emailKhach,
            subject: `[Whisper Books] Xác nhận đơn hàng #${maDonHang}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2 style="color: #0d6efd;">Cảm ơn bạn đã đặt hàng, ${hoTen}!</h2>
                    <p>Chào bạn, đơn hàng của bạn đã được hệ thống ghi nhận thành công.</p>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                        <p><b>Mã đơn hàng:</b> ${maDonHang}</p>
                        <p><b>Tổng cộng:</b> <span style="color: #dc3545; font-size: 1.2em;">${tongTien.toLocaleString('vi-VN')}đ</span></p>
                    </div>
                    <p>Chúng tôi sẽ kiểm tra và giao hàng đến bạn trong thời gian sớm nhất.</p>
                    <hr>
                    <small>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ hotline: 0123.456.789</small>
                </div>
            `
        };

        // 3. Thực hiện gửi
        await transporter.sendMail(mailOptions);
        console.log('=> Email thông báo đã được gửi tới: ' + emailKhach);
    } catch (error) {
        console.error('Lỗi gửi mail:', error);
    }
};

module.exports = sendOrderEmail;