document.addEventListener('DOMContentLoaded', async () => {
    const productos = await AppStore.loadProducts();
    const itemsContainer = document.getElementById('cartItemsContainer');
    const summaryBox = document.getElementById('cartSummaryBox');
    const checkoutModal = document.getElementById('checkoutModal');

    function renderCart() {
        if (AppStore.cart.length === 0) {
            itemsContainer.innerHTML = `
                <div style="text-align: center; padding: 3.5rem 1.5rem; background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
                    <h3>Tu carrito está vacío</h3>
                    <p style="color: var(--text-secondary); margin: 0.5rem 0 1.5rem;">Explora nuestro catálogo y añade equipamiento de audio a tu estudio.</p>
                    <a href="catalogo.html" class="btn btn-primary">Ir al Catálogo</a>
                </div>
            `;
            summaryBox.innerHTML = `
                <h3 style="margin-bottom: 1rem;">Resumen de Orden</h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">No hay artículos seleccionados todavía.</p>
            `;
            return;
        }

        let subtotal = 0;
        itemsContainer.innerHTML = AppStore.cart.map(item => {
            const p = productos.find(prod => prod.id === item.id);
            if (!p) return '';
            const lineTotal = p.precio * item.qty;
            subtotal += lineTotal;
            return `
                <div class="cart-item">
                    <img src="${p.imagen}" alt="${p.nombre}" class="cart-item-img">
                    <div style="flex: 1;">
                        <h4 style="font-weight: 700;"><a href="producto.html?id=${p.id}">${p.nombre}</a></h4>
                        <span style="font-size: 0.85rem; color: var(--text-secondary);">$${formatMXN(p.precio)} MXN c/u</span>
                    </div>
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="updateQty('${p.id}', -1)">−</button>
                        <span style="font-weight: 700; min-width: 22px; text-align: center;">${item.qty}</span>
                        <button class="qty-btn" onclick="updateQty('${p.id}', 1)">+</button>
                    </div>
                    <div style="font-weight: 800; min-width: 110px; text-align: right;">$${formatMXN(lineTotal)} MXN</div>
                    <button class="icon-btn" style="width: 34px; height: 34px;" onclick="removeItem('${p.id}')">✕</button>
                </div>
            `;
        }).join('');

        const shipping = subtotal > 8000 ? 0 : 250;
        const total = subtotal + shipping;

        summaryBox.innerHTML = `
            <h3 style="font-size: 1.25rem; margin-bottom: 1.25rem;">Resumen de Compra</h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; color: var(--text-secondary);">
                <span>Subtotal</span>
                <span>$${formatMXN(subtotal)} MXN</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; color: var(--text-secondary);">
                <span>Envío asegurado</span>
                <span>${shipping === 0 ? 'GRATIS' : '$' + formatMXN(shipping) + ' MXN'}</span>
            </div>
            <hr style="border: none; border-top: 1px solid var(--border-color); margin: 1rem 0;">
            <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 800; margin-bottom: 1.5rem;">
                <span>Total</span>
                <span>$${formatMXN(total)} MXN</span>
            </div>
            <button class="btn btn-primary" style="width: 100%; margin-bottom: 0.75rem;" id="openCheckoutBtn">Finalizar Compra</button>
            <a href="catalogo.html" class="btn btn-secondary" style="width: 100%; margin-bottom: 0.5rem;">+ Buscar más productos</a>
            <button class="btn btn-sm" style="width: 100%; color: var(--text-muted);" id="clearCartBtn">Vaciar Carrito</button>
        `;

        document.getElementById('openCheckoutBtn').addEventListener('click', () => {
            if (AuthManager.currentUser) {
                document.getElementById('shipName').value = AuthManager.currentUser.name || '';
                document.getElementById('shipPhone').value = AuthManager.currentUser.phone || '';
            }
            checkoutModal.classList.add('open');
        });

        document.getElementById('clearCartBtn').addEventListener('click', () => {
            AppStore.cart = [];
            AppStore.save();
            renderCart();
        });
    }

    window.updateQty = (id, delta) => {
        const item = AppStore.cart.find(i => i.id === id);
        if (!item) return;
        item.qty += delta;
        if (item.qty <= 0) {
            AppStore.cart = AppStore.cart.filter(i => i.id !== id);
        }
        AppStore.save();
        renderCart();
    };

    window.removeItem = (id) => {
        AppStore.cart = AppStore.cart.filter(i => i.id !== id);
        AppStore.save();
        renderCart();
    };

    document.getElementById('closeCheckoutBtn').addEventListener('click', () => checkoutModal.classList.remove('open'));
    document.getElementById('cancelCheckoutBtn').addEventListener('click', () => checkoutModal.classList.remove('open'));

    document.getElementById('checkoutAddressForm').addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('shipName').value.trim();
        const street = document.getElementById('shipStreet').value.trim();
        const phone = document.getElementById('shipPhone').value.trim();
        const city = document.getElementById('shipCity').value.trim();

        checkoutModal.classList.remove('open');
        AppStore.cart = [];
        AppStore.save();
        renderCart();
        UI.toast(`🎉 ¡Pedido confirmado para ${name}! Envío a ${street}, ${city} (Tel: ${phone}).`);
    });

    renderCart();
});