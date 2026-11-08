const nodemailer = require('nodemailer');

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

const sendOrderEmail = async (emailKhach, hoTen, maDonHang, tongTien) => {
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;
    if (!user || !pass) {
        throw new Error('Thiếu cấu hình MAIL_USER hoặc MAIL_PASS.');
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
    });

    const mailOptions = {
        from: `"Whisper Books" <${user}>`,
        to: emailKhach,
        subject: `[Whisper Books] Xác nhận đơn hàng #${maDonHang}`,
        html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2 style="color: #0d6efd;">Cảm ơn bạn đã đặt hàng, ${escapeHtml(hoTen)}!</h2>
                    <p>Chào bạn, đơn hàng của bạn đã được hệ thống ghi nhận thành công.</p>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                        <p><b>Mã đơn hàng:</b> ${escapeHtml(maDonHang)}</p>
                        <p><b>Tổng cộng:</b> <span style="color: #dc3545; font-size: 1.2em;">${tongTien.toLocaleString('vi-VN')}đ</span></p>
                    </div>
                    <p>Chúng tôi sẽ kiểm tra và giao hàng đến bạn trong thời gian sớm nhất.</p>
                    <hr>
                    <small>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ hotline: 0123.456.789</small>
                </div>
            `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendOrderEmail;