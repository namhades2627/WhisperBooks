// 1. Khởi tạo hoặc lấy giỏ hàng từ localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// 2. Hàm cập nhật số lượng hiển thị trên icon giỏ hàng (Badge)
function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.innerText = totalItems;
    }
}

// 3. Hàm vẽ (render) danh sách sản phẩm vào Side Cart
function renderCart() {
    const cartContent = document.getElementById('cartContent');
    const totalElement = document.querySelector('.cart-footer .text-danger');
    
    if (!cartContent) return; // Nếu không tìm thấy vùng chứa thì thoát

    // Trường hợp giỏ hàng trống
    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-cart-x fs-1 text-muted"></i>
                <p class="mt-3 text-muted">Giỏ hàng đang trống</p>
            </div>`;
        if (totalElement) totalElement.innerText = '0đ';
        return;
    }

    // Trường hợp có sản phẩm: Duyệt mảng cart để tạo HTML
    let html = '<div class="list-group list-group-flush">';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.gia * item.quantity;
        html += `
            <div class="list-group-item py-3 border-0 border-bottom">
                <div class="row align-items-center">
                    <div class="col-3">
                        <img src="/images/${item.hinh}" class="img-fluid rounded shadow-sm" alt="${item.ten}">
                    </div>
                    <div class="col-7">
                        <h6 class="mb-1 fw-bold text-truncate" style="max-width: 150px;">${item.ten}</h6>
                        <small class="text-muted d-block">${item.gia.toLocaleString()}đ x ${item.quantity}</small>
                    </div>
                    <div class="col-2 text-end">
                        <button class="btn btn-sm text-danger p-0" onclick="removeFromCart(${index})">
                            <i class="bi bi-trash fs-5"></i>
                        </button>
                    </div>
                </div>
            </div>`;
    });

    html += '</div>';
    cartContent.innerHTML = html;
    
    // Cập nhật tổng tiền ở footer của Side Cart
    if (totalElement) {
        totalElement.innerText = total.toLocaleString() + 'đ';
    }
}

// 4. Hàm thêm sản phẩm vào giỏ (Cập nhật badge và vẽ lại giỏ ngay)
function addToCart(id, ten, gia, hinh, qty = 1) {
    // Ép kiểu giá về số để tính toán cho chuẩn
    const numericPrice = typeof gia === 'string' ? parseInt(gia.replace(/[^0-9]/g, '')) : gia;
    
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += qty;
    } else {
        cart.push({ id, ten, gia: numericPrice, hinh, quantity: qty });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    renderCart(); // Cập nhật nội dung Side Cart ngay lập tức
    const sideCartElement = document.getElementById('sideCart');
    if (sideCartElement) {
        const bsOffcanvas = new bootstrap.Offcanvas(sideCartElement);
        bsOffcanvas.show();
    }
}

// 5. Hàm xóa sản phẩm khỏi giỏ
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    renderCart();
}

// 6. Xử lý Thanh toán & Mua ngay (Dùng chung cho cả 2 trường hợp)
function proceedToCheckout(type, productData = null) {
    if (type === 'single' && productData) {
        // Lưu món mua ngay vào bộ nhớ tạm để thanh toán
        localStorage.setItem('checkout_items', JSON.stringify([productData]));
    } else {
        // Thanh toán toàn bộ giỏ hàng
        if (cart.length === 0) {
            alert('Giỏ hàng của bạn đang trống!');
            return;
        }
        localStorage.setItem('checkout_items', JSON.stringify(cart));
    }
    // Chuyển hướng đến trang điền thông tin khách hàng
    window.location.href = '/thanh-toan';
}

// 7. Khi trang load xong thì khởi động các tính năng
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    renderCart();
});