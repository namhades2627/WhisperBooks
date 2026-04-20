// Cấu hình các thông số chung cho giao diện Client
const UI_CONFIG = {
    currencySymbol: 'đ',
    locale: 'vi-VN',
    toastDuration: 3000 // 3 giây
};

// Cấu hình mặc định cho SweetAlert2 (nếu bạn nhúng thư viện này)
const Toast = (typeof Swal !== 'undefined') ? Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: UI_CONFIG.toastDuration,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
}) : null;