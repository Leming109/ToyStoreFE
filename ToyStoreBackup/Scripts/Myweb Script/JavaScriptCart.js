document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (this.value.trim() !== '') {
                    alert('Đang tìm kiếm: ' + this.value);
                } else {
                    alert('Vui lòng nhập từ khóa tìm kiếm!');
                }
            }
        });
    }


    render();
});

const PRODUCTS = [
    {
        id: "p001",
        name: "Blind box Baby Three Lucky Cat Zipper Bag",
        price: 419000,
        image: "/Images/BB3.jpg",
        sku: "BT-LC-001"
    },
    {
        id: "p002",
        name: "Porsche 911 Dakar 1:64 MiniGT",
        price: 459000,
        image: "/Images/Porsche.jpg",
        sku: "MGT-911"
    },
    {
        id: "p008",
        name: "Hot Wheels Exoticars",
        price: 99000,
        image: "/Images/HotW.jpg",
        sku: "HW-EXO"
    }
];

const VOUCHERS = [
    { code: "TOYZONE10", type: "percent", value: 10, minOrder: 300000, desc: "Giảm 10%" },
    { code: "GIAM50K", type: "fixed", value: 50000, minOrder: 500000, desc: "Giảm 50.000đ" },
    { code: "FREESHIP", type: "freeship", value: 0, minOrder: 200000, desc: "Miễn phí ship" }
];

let cart = JSON.parse(localStorage.getItem("app_cart") || "[]");
let appliedVoucher = null;

function formatPrice(n) {
    return (n || 0).toLocaleString("vi-VN") + " đ";
}

function saveCart() {
    localStorage.setItem("app_cart", JSON.stringify(cart));
}

function getProduct(id) {
    return PRODUCTS.find(p => p.id === id);
}

function showToast(msg, type = "ok") {
    const box = document.getElementById("toastBox");
    if (!box) return;
    const el = document.createElement("div");
    el.className = "toast-msg " + type;
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(() => {
        el.style.opacity = "0";
        el.style.transition = "opacity .3s";
        setTimeout(() => el.remove(), 300);
    }, 2500);
}

function calc() {
    let subtotal = 0;
    cart.forEach(i => {
        const p = getProduct(i.id);
        if (p) subtotal += p.price * i.qty;
    });

    let discount = 0;
    let freeShip = false;

    if (appliedVoucher) {
        if (appliedVoucher.type === "percent") discount = Math.round(subtotal * appliedVoucher.value / 100);
        else if (appliedVoucher.type === "fixed") discount = appliedVoucher.value;
        else if (appliedVoucher.type === "freeship") freeShip = true;
    }

    const after = Math.max(0, subtotal - discount);
    const vat = Math.round(after * 0.05);
    let shipping = 0;
    if (!freeShip && subtotal > 0) shipping = after >= 1000000 ? 0 : 30000;

    return { subtotal, discount, vat, shipping, total: after + vat + shipping, freeShip };
}

function addSampleProducts() {
    ["p001", "p002", "p008"].forEach(id => {
        if (!cart.find(i => i.id === id)) cart.push({ id, qty: 1 });
    });
    saveCart();
    showToast("Đã thêm 3 sản phẩm mẫu vào giỏ!", "ok");
    render();
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty < 1) cart = cart.filter(i => i.id !== id);
    saveCart();
    render();
}

function removeItem(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    showToast("Đã xóa sản phẩm khỏi giỏ hàng", "ok");
    render();
}

function clearCart() {
    if (!cart.length) return;
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?")) {
        cart = [];
        appliedVoucher = null;
        saveCart();
        showToast("Đã xóa toàn bộ giỏ hàng", "ok");
        render();
    }
}

function applyVoucher() {
    const input = document.getElementById("voucherInput");
    if (!input) return;
    const code = input.value.trim().toUpperCase();
    if (!code) return;

    const { subtotal } = calc();
    const v = VOUCHERS.find(x => x.code === code);

    if (!v || subtotal < v.minOrder) {
        showToast("Mã không hợp lệ hoặc đơn hàng chưa đủ điều kiện!", "err");
        return;
    }

    appliedVoucher = v;
    showToast("Áp dụng mã giảm giá thành công!", "ok");
    render();
}

function removeVoucher() {
    appliedVoucher = null;
    render();
}

function checkout() {
    if (!cart.length) return;
    alert("Cảm ơn bạn đã đặt hàng! Tổng tiền thanh toán: " + formatPrice(calc().total));
    cart = [];
    appliedVoucher = null;
    saveCart();
    render();
}

function renderCartItems() {
    const box = document.getElementById("cartItems");
    if (!box) return;

    box.innerHTML = cart.map(item => {
        const p = getProduct(item.id);
        if (!p) return "";
        return `
        <div class="cart-item-row">
            <img src="${p.image}" alt="${p.name}">
            <div class="item-info">
                <div class="item-name">${p.name}</div>
                <div class="item-sku">SKU: ${p.sku}</div>
                <div class="item-price">${formatPrice(p.price)}</div>
            </div>
            <div class="qty-control">
                <button type="button" onclick="changeQty('${p.id}', -1)">-</button>
                <input type="number" value="${item.qty}" readonly>
                <button type="button" onclick="changeQty('${p.id}', 1)">+</button>
            </div>
            <div class="item-total-price">${formatPrice(p.price * item.qty)}</div>
            <button type="button" class="btn-remove-item" onclick="removeItem('${p.id}')" title="Xóa">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>`;
    }).join("");
}

function renderSummary() {
    const c = calc();
    document.getElementById("sumSubtotal").innerText = formatPrice(c.subtotal);
    document.getElementById("sumDiscount").innerText = c.discount > 0 ? "-" + formatPrice(c.discount) : "0 đ";
    document.getElementById("sumVat").innerText = formatPrice(c.vat);
    document.getElementById("sumShipping").innerText = c.freeShip ? "Miễn phí" : formatPrice(c.shipping);
    document.getElementById("sumTotal").innerText = formatPrice(c.total);

    const vBox = document.getElementById("voucherApplied");
    if (appliedVoucher) {
        vBox.style.display = "flex";
        document.getElementById("voucherText").innerText = appliedVoucher.code + " (" + appliedVoucher.desc + ")";
    } else {
        vBox.style.display = "none";
    }
}

function render() {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    const cartCountHeader = document.querySelector('.cart-count');
    const cartCountText = document.querySelector('.cart-count-text');

    if (cartCountHeader) cartCountHeader.innerText = count;
    if (cartCountText) cartCountText.innerText = count;


    const emptyBox = document.getElementById("emptyCart");
    const contentBox = document.getElementById("cartContent");

    if (!cart.length) {
        if (emptyBox) emptyBox.style.display = "block";
        if (contentBox) contentBox.style.display = "none";
    } else {
        if (emptyBox) emptyBox.style.display = "none";
        if (contentBox) contentBox.style.display = "grid";
        renderCartItems();
        renderSummary();
    }
}

