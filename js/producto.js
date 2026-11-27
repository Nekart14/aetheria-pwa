document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const productos = await AppStore.loadProducts();
    const product = productos.find(p => p.id === id);

    if (!product) {
        window.location.href = '404.html';
        return;
    }

    function renderDetail() {
        const isFav = AppStore.favorites.includes(product.id);
        const isDev = AuthManager.isDeveloper();
        document.getElementById('productDetailContainer').innerHTML = `
            <div class="product-detail-card">
                <div class="detail-artwork">
                    <img src="${product.imagen}" alt="${product.nombre}">
                </div>
                <div>
                    <span class="hero-tag">${product.categoria}</span>
                    <h1 style="font-size: 2.1rem; font-weight: 800; line-height: 1.2;">${product.nombre}</h1>
                    <div style="font-size: 1.75rem; font-weight: 800; color: var(--accent-primary); margin: 0.75rem 0;">
                        $${formatMXN(product.precio)} <span style="font-size: 0.9rem; color: var(--text-muted);">MXN</span>
                    </div>
                    <p style="color: var(--text-secondary); font-size: 1rem;">${product.descripcion}</p>
                    <ul class="specs-list">
                        ${(product.specs || []).map(spec => `<li>✓ ${spec}</li>`).join('')}
                    </ul>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1.5rem;">
                        <button class="btn btn-primary" onclick="AppStore.addToCart('${product.id}')">Agregar al Carrito</button>
                        <button class="btn btn-secondary" id="detailFavBtn">
                            ${isFav ? '♥ En tus Favoritos' : '♡ Guardar en Favoritos'}
                        </button>
                        ${isDev ? `
                            <button class="btn btn-warning" onclick="DevManager.openProductModal('${product.id}')">✏️ Editar</button>
                            <button class="btn btn-danger" onclick="DevManager.deleteProduct('${product.id}')">🗑️ Eliminar</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('detailFavBtn').addEventListener('click', () => {
            AppStore.toggleFavorite(product.id, renderDetail);
        });
    }

    renderDetail();
});