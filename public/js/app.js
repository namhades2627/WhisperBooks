document.addEventListener('DOMContentLoaded', function() {
    // 1. Hiệu ứng active cho Menu điều hướng
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });

    // 2. Xác nhận trước khi xóa (Sách, Thể loại, Tài khoản)
    const deleteButtons = document.querySelectorAll('.btn-delete-confirm');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (!confirm('Bạn có chắc chắn muốn xóa mục này không? Thao tác này không thể hoàn tác.')) {
                e.preventDefault();
            }
        });
    });

    // 3. Hiển thị ảnh xem trước khi dán Link URL ảnh vào ô nhập
    const urlInput = document.querySelector('input[name="HinhAnh"]');
    const previewImg = document.querySelector('#image-preview');
    if (urlInput && previewImg) {
        urlInput.addEventListener('input', function() {
            previewImg.src = this.value || '/images/noimage.png';
        });
    }

    // 4. Định dạng hiển thị số lượng và giá tiền trong trang Admin
    const priceInputs = document.querySelectorAll('.input-format-currency');
    priceInputs.forEach(input => {
        input.addEventListener('blur', function() {
            let value = this.value.replace(/,/g, '');
            if(!isNaN(value) && value !== "") {
                // Bạn có thể thêm logic định dạng ở đây nếu muốn
            }
        });
    });
});

// Hàm hỗ trợ định dạng tiền VNĐ nhanh ngoài giao diện
function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}