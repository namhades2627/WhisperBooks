document.addEventListener('DOMContentLoaded', function() {
    
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });

    
    const deleteButtons = document.querySelectorAll('.btn-delete-confirm');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (!confirm('Bạn có chắc chắn muốn xóa mục này không? Thao tác này không thể hoàn tác.')) {
                e.preventDefault();
            }
        });
    });

    
    const urlInput = document.querySelector('input[name="HinhAnh"]');
    const previewImg = document.querySelector('#image-preview');
    if (urlInput && previewImg) {
        urlInput.addEventListener('input', function() {
            previewImg.src = this.value || '/images/noimage.png';
        });
    }

    
    const priceInputs = document.querySelectorAll('.input-format-currency');
    priceInputs.forEach(input => {
        input.addEventListener('blur', function() {
            let value = this.value.replace(/,/g, '');
            if(!isNaN(value) && value !== "") {
                
            }
        });
    });
});


function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}