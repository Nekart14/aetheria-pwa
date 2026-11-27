document.addEventListener('DOMContentLoaded', async () => {
    const productos = await AppStore.loadProducts();
    const grid = document.getElementById('catalogProductsGrid');
    const stats = document.getElementById('catalogStats');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const priceRangeSelect = document.getElementById('priceRangeSelect');
    const favOnlyCheckbox = document.getElementById('favOnlyCheckbox');
    let selectedCategory = 'todos';

    const params = new URLSearchParams(window.location.search);
    if (params.get('favs') === '1') {
        favOnlyCheckbox.checked = true;
    }

    document.querySelectorAll('#categoryChips .chip').forEach(chip => {
        chip.addEventListener('click', () => {
            selectedCategory = chip.dataset.cat;
            document.querySelectorAll('#categoryChips .chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            applyFilters();
        });
    });

    function applyFilters() {
        const query = searchInput.value.toLowerCase().trim();
        const sort = sortSelect.value;
        const priceRange = priceRangeSelect.value;
        const onlyFavs = favOnlyCheckbox.checked;

        let filtered = productos.filter(p => {
            const matchCat = selectedCategory === 'todos' || p.categoria === selectedCategory;
            const matchQuery = p.nombre.toLowerCase().includes(query) || p.descripcion.toLowerCase().includes(query);
            const matchFav = !onlyFavs || AppStore.favorites.includes(p.id);

            let matchPrice = true;
            if (priceRange === 'under-4000') matchPrice = p.precio < 4000;
            if (priceRange === '4000-10000') matchPrice = p.precio >= 4000 && p.precio <= 10000;
            if (priceRange === 'over-10000') matchPrice = p.precio > 10000;

            return matchCat && matchQuery && matchFav && matchPrice;
        });

        if (sort === 'price-asc') filtered.sort((a, b) => a.precio - b.precio);
        if (sort === 'price-desc') filtered.sort((a, b) => b.precio - a.precio);
        if (sort === 'name-asc') filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));

        stats.textContent = `Mostrando ${filtered.length} de ${productos.length} productos`;

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1rem; background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
                    <h3>No se encontraron productos</h3>
                    <p style="color: var(--text-secondary); margin: 0.5rem 0 1.25rem;">Intenta limpiar los filtros de búsqueda.</p>
                </div>
            `;
        } else {
            grid.innerHTML = filtered.map(p => UI.renderProductCard(p, 'window.applyCatalogFilters()')).join('');
        }
    }

    window.applyCatalogFilters = applyFilters;
    [searchInput, sortSelect, priceRangeSelect, favOnlyCheckbox].forEach(el => el.addEventListener('input', applyFilters));
    applyFilters();
});