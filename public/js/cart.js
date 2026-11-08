
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.innerText = totalItems;
    }
}


function renderCart() {
    const cartContent = document.getElementById('cartContent');
    const totalElement = document.querySelector('.cart-footer .text-danger');
    
    if (!cartContent) return; 

    
    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-cart-x fs-1 text-muted"></i>
                <p class="mt-3 text-muted">Giỏ hàng đang trống</p>
            </div>`;
        if (totalElement) totalElement.innerText = '0đ';
        return;
    }

    
    let html = '<div class="list-group list-group-flush">';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.gia * item.quantity;
        html += `
            <div class="list-group-item py-3 border-0 border-bottom">
                <div class="row align-items-center">
                    <div class="col-3">
                        <img src="/images/${encodeURIComponent(String(item.hinh || ''))}" class="img-fluid rounded shadow-sm" alt="${escapeHtml(item.ten)}">
                    </div>
                    <div class="col-7">
                        <h6 class="mb-1 fw-bold text-truncate" style="max-width: 150px;">${escapeHtml(item.ten)}</h6>
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
    
    
    if (totalElement) {
        totalElement.innerText = total.toLocaleString() + 'đ';
    }
}


function addToCart(id, ten, gia, hinh, qty = 1) {
    
    const numericPrice = typeof gia === 'string' ? parseInt(gia.replace(/[^0-9]/g, '')) : gia;
    
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += qty;
    } else {
        cart.push({ id, ten, gia: numericPrice, hinh, quantity: qty });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    renderCart(); 
    const sideCartElement = document.getElementById('sideCart');
    if (sideCartElement) {
        const bsOffcanvas = new bootstrap.Offcanvas(sideCartElement);
        bsOffcanvas.show();
    }
}


function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    renderCart();
}


function proceedToCheckout(type, productData = null) {
    if (type === 'single' && productData) {
        
        localStorage.setItem('checkout_items', JSON.stringify([productData]));
    } else {
        
        if (cart.length === 0) {
            alert('Giỏ hàng của bạn đang trống!');
            return;
        }
        localStorage.setItem('checkout_items', JSON.stringify(cart));
    }
    
    window.location.href = '/thanh-toan';
}


document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    renderCart();
});