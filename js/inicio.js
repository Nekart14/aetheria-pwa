document.addEventListener('DOMContentLoaded', async () => {
    const productos = await AppStore.loadProducts();
    const destacados = productos.filter(p => p.destacado);
    const grid = document.getElementById('featuredProductsGrid');
    if (!grid) return;

    const renderFeatured = () => {
        grid.innerHTML = destacados.map(p => UI.renderProductCard(p, 'window.renderFeaturedPage()')).join('');
    };

    window.renderFeaturedPage = renderFeatured;
    renderFeatured();
});