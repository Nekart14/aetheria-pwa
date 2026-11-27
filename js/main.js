/* ==========================================================================
   js/main.js - Estado Global, Sesiones (Comprador / Desarrollador),
   Gestión de Catálogo, Carrito, Favoritos y Tema
   ========================================================================== */

const formatMXN = (amount) => Number(amount).toLocaleString('es-MX');

const readStorageJSON = (key, fallback) => {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value ?? fallback;
    } catch (error) {
        localStorage.removeItem(key);
        return fallback;
    }
};

const AppStore = {
    products: [],
    cart: readStorageJSON('aetheria_cart', []),
    favorites: readStorageJSON('aetheria_favs', []),

    async loadProducts() {
        const cached = readStorageJSON('aetheria_products', null);
        if (Array.isArray(cached) && cached.length > 0) {
            this.products = cached;
            return this.products;
        }
        try {
            const response = await fetch('data/productos.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            this.products = await response.json();
            localStorage.setItem('aetheria_products', JSON.stringify(this.products));
        } catch (err) {
            console.error('Error cargando data/productos.json:', err);
            this.products = [];
        }
        return this.products;
    },

    save() {
        localStorage.setItem('aetheria_products', JSON.stringify(this.products));
        localStorage.setItem('aetheria_cart', JSON.stringify(this.cart));
        localStorage.setItem('aetheria_favs', JSON.stringify(this.favorites));
        this.updateBadges();
    },

    updateBadges() {
        const cartBadge = document.getElementById('cartBadge');
        const favBadge = document.getElementById('favBadge');
        if (cartBadge) {
            cartBadge.textContent = this.cart.reduce((sum, item) => sum + item.qty, 0);
        }
        if (favBadge) {
            favBadge.textContent = this.favorites.length;
        }
    },

    addToCart(id) {
        const existing = this.cart.find(item => item.id === id);
        if (existing) {
            existing.qty++;
        } else {
            this.cart.push({ id, qty: 1 });
        }
        this.save();
        // Redirige directamente al carrito al agregar un artículo
        window.location.href = 'carrito.html';
    },

    toggleFavorite(id, onComplete = null) {
        const idx = this.favorites.indexOf(id);
        if (idx === -1) {
            this.favorites.push(id);
            UI.toast('♥ Agregado a favoritos');
        } else {
            this.favorites.splice(idx, 1);
            UI.toast('Eliminado de favoritos');
        }
        this.save();
        if (typeof onComplete === 'function') onComplete();
    },

    addProduct(newProd) {
        this.products.unshift(newProd);
        this.save();
    },

    updateProduct(updatedProd) {
        const idx = this.products.findIndex(p => p.id === updatedProd.id);
        if (idx !== -1) {
            this.products[idx] = updatedProd;
            this.save();
        }
    },

    deleteProduct(id) {
        this.products = this.products.filter(p => p.id !== id);
        this.cart = this.cart.filter(item => item.id !== id);
        this.favorites = this.favorites.filter(fid => fid !== id);
        this.save();
    }
};

/* ==========================================================================
   Gestión de Perfiles y Sesión (Comprador y Desarrollador Hugo Ayala)
   ========================================================================== */
const AuthManager = {
    DEV_ACCOUNT: {
        name: 'Hugo Ayala',
        email: 'hugo-saul@hotmail.com',
        role: 'desarrollador'
    },
    users: [],
    currentUser: null,
    mode: 'login',

    init() {
        const storedUsers = readStorageJSON('aetheria_users', []);
        const safeUsers = Array.isArray(storedUsers) ? storedUsers : [];
        const withoutDev = safeUsers.filter(u => u?.email?.toLowerCase() !== this.DEV_ACCOUNT.email.toLowerCase());
        this.users = [{ ...this.DEV_ACCOUNT, password: 'DEV' }, ...withoutDev];
        localStorage.setItem('aetheria_users', JSON.stringify(this.users));

        this.currentUser = readStorageJSON('aetheria_session', null);
        this.injectModals();
        this.updateUI();
    },

    isDeveloper() {
        return this.currentUser && this.currentUser.role === 'desarrollador';
    },

    injectModals() {
        const container = document.getElementById('globalModalsContainer');
        if (!container) return;

        container.innerHTML = `
            <!-- Modal de Inicio / Creación de Sesión -->
            <div class="modal-backdrop" id="authModal">
                <div class="modal-card">
                    <div class="modal-header">
                        <h2 id="authModalTitle">Iniciar Sesión</h2>
                        <button class="icon-btn" style="width: 34px; height: 34px;" onclick="AuthManager.closeModal()">✕</button>
                    </div>

                    <div style="display: flex; gap: 0.5rem; margin-bottom: 1.25rem; background: var(--bg-primary); padding: 0.3rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                        <button type="button" id="tabLoginBtn" class="btn btn-sm btn-primary" style="flex: 1;" onclick="AuthManager.switchTab('login')">Iniciar Sesión</button>
                        <button type="button" id="tabRegisterBtn" class="btn btn-sm btn-secondary" style="flex: 1; border: none;" onclick="AuthManager.switchTab('register')">Crear Cuenta</button>
                    </div>

                    <form id="authForm">
                        <div class="form-group" id="authNameGroup" style="display: none;">
                            <label for="authName">Nombre de usuario *</label>
                            <input type="text" id="authName" class="form-control" placeholder="Ej. Sofía Mendoza">
                        </div>

                        <div class="form-group" id="authPhoneGroup" style="display: none;">
                            <label for="authPhone">Teléfono *</label>
                            <input type="tel" id="authPhone" class="form-control" placeholder="Ej. 33 1234 5678">
                        </div>

                        <div class="form-group">
                            <label for="authEmail">Correo electrónico *</label>
                            <input type="email" id="authEmail" class="form-control" placeholder="usuario@correo.com" required>
                        </div>

                        <div class="form-group">
                            <label for="authPassword">Contraseña *</label>
                            <input type="password" id="authPassword" class="form-control" placeholder="Mínimo 4 caracteres" required minlength="4">
                        </div>

                        <button type="submit" id="authSubmitBtn" class="btn btn-primary" style="width: 100%; margin-top: 0.5rem;">Entrar</button>
                    </form>
                </div>
            </div>

            <!-- Modal de Edición/Creación de Artículo (Solo Desarrollador) -->
            <div class="modal-backdrop" id="productEditorModal">
                <div class="modal-card">
                    <div class="modal-header">
                        <h2 id="editorModalTitle">Agregar Artículo</h2>
                        <button class="icon-btn" style="width: 34px; height: 34px;" onclick="DevManager.closeProductModal()">✕</button>
                    </div>

                    <form id="productEditorForm">
                        <input type="hidden" id="editProdId">
                        <div class="form-group">
                            <label for="editProdName">Nombre del artículo *</label>
                            <input type="text" id="editProdName" class="form-control" required placeholder="Ej. Sintetizador Modular Aether-X">
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
                            <div class="form-group">
                                <label for="editProdCategory">Categoría *</label>
                                <select id="editProdCategory" class="form-control">
                                    <option value="Audio">Audio</option>
                                    <option value="Sintetizadores">Sintetizadores</option>
                                    <option value="Periféricos">Periféricos</option>
                                    <option value="Accesorios">Accesorios</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="editProdPrice">Precio (MXN) *</label>
                                <input type="number" id="editProdPrice" class="form-control" min="1" step="1" required placeholder="5990">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
                            <div class="form-group">
                                <label for="editProdImg">Imagen SVG</label>
                                <select id="editProdImg" class="form-control">
                                    <option value="img/p1.svg">Audífonos Studio (p1.svg)</option>
                                    <option value="img/p2.svg">Monitor Acústico (p2.svg)</option>
                                    <option value="img/p3.svg">Sintetizador (p3.svg)</option>
                                    <option value="img/p4.svg">Teclado Mecánico (p4.svg)</option>
                                    <option value="img/p5.svg">Micrófono (p5.svg)</option>
                                    <option value="img/p6.svg">Interfaz DAC (p6.svg)</option>
                                    <option value="img/p7.svg">Mouse Ergonómico (p7.svg)</option>
                                    <option value="img/p8.svg">Cable XLR (p8.svg)</option>
                                </select>
                            </div>
                            <div class="form-group" style="display: flex; align-items: center; padding-top: 1.5rem;">
                                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                    <input type="checkbox" id="editProdFeatured" style="width: 17px; height: 17px;">
                                    Destacar en Inicio
                                </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="editProdDesc">Descripción *</label>
                            <textarea id="editProdDesc" rows="3" class="form-control" required></textarea>
                        </div>

                        <div class="form-group">
                            <label for="editProdSpecs">Especificaciones (separadas por coma)</label>
                            <input type="text" id="editProdSpecs" class="form-control" placeholder="Ej. Drivers 50mm, USB-C, Garantía 2 años">
                        </div>

                        <div style="display: flex; gap: 0.75rem; margin-top: 1.25rem;">
                            <button type="submit" class="btn btn-primary" style="flex: 1;">Guardar Cambios</button>
                            <button type="button" class="btn btn-secondary" onclick="DevManager.closeProductModal()">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('authForm').addEventListener('submit', e => {
            e.preventDefault();
            this.handleSubmit();
        });

        document.getElementById('productEditorForm').addEventListener('submit', e => {
            e.preventDefault();
            DevManager.saveProduct();
        });
    },

    openModal(mode = 'login') {
        this.switchTab(mode);
        document.getElementById('authModal').classList.add('open');
    },

    closeModal() {
        document.getElementById('authModal').classList.remove('open');
        document.getElementById('authForm').reset();
    },

    switchTab(mode) {
        this.mode = mode;
        const isRegister = mode === 'register';
        document.getElementById('authModalTitle').textContent = isRegister ? 'Crear Cuenta' : 'Iniciar Sesión';
        document.getElementById('authSubmitBtn').textContent = isRegister ? 'Registrarme e Iniciar Sesión' : 'Entrar';
        document.getElementById('authNameGroup').style.display = isRegister ? 'block' : 'none';
        document.getElementById('authName').required = isRegister;
        document.getElementById('authPhoneGroup').style.display = isRegister ? 'block' : 'none';
        document.getElementById('authPhone').required = isRegister;

        document.getElementById('tabLoginBtn').className = isRegister ? 'btn btn-sm btn-secondary' : 'btn btn-sm btn-primary';
        document.getElementById('tabRegisterBtn').className = isRegister ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary';
    },

    handleSubmit() {
        const email = document.getElementById('authEmail').value.trim().toLowerCase();
        const password = document.getElementById('authPassword').value.trim();

        if (this.mode === 'register') {
            const name = document.getElementById('authName').value.trim();
            const phone = document.getElementById('authPhone').value.trim();
            if (name.length < 2) {
                UI.toast('Ingresa un nombre válido');
                return;
            }
            if (phone.replace(/\D/g, '').length < 10) {
                UI.toast('Ingresa un teléfono válido (mínimo 10 dígitos)');
                return;
            }
            if (this.users.some(u => u.email.toLowerCase() === email)) {
                UI.toast('Este correo ya está registrado. Inicia sesión.');
                this.switchTab('login');
                return;
            }

            const newUser = { name, phone, email, password, role: 'comprador' };
            this.users.push(newUser);
            localStorage.setItem('aetheria_users', JSON.stringify(this.users));
            this.setSession(newUser);
            UI.toast(`✓ Cuenta creada. ¡Bienvenido, ${name}!`);
        } else {
            const user = this.users.find(u => u.email.toLowerCase() === email);
            if (!user) {
                UI.toast('No existe una cuenta con ese correo. Crea una primero.');
                return;
            }
            if (user.role === 'desarrollador') {
                if (password !== 'DEV') {
                    UI.toast('Contraseña de desarrollador incorrecta. Usa DEV.');
                    return;
                }
            } else if (user.password !== password) {
                UI.toast('Contraseña incorrecta.');
                return;
            }
            this.setSession(user);
            window.location.reload();
        }
        this.closeModal();
    },

    setSession(user) {
        this.currentUser = { name: user.name, phone: user.phone || '', email: user.email, role: user.role };
        localStorage.setItem('aetheria_session', JSON.stringify(this.currentUser));
        this.updateUI();
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('aetheria_session');
        window.location.reload();
    },

    updateUI() {
        const area = document.getElementById('authHeaderArea');
        const devToolbar = document.getElementById('devCatalogToolbar');
        if (!area) return;

        if (this.currentUser) {
            const isDev = this.isDeveloper();
            area.innerHTML = `
                <span class="role-pill ${isDev ? 'dev' : ''}" title="${this.currentUser.email}">
                    ${isDev ? '🛠️ Dev:' : '🛍️'} ${this.currentUser.name.split(' ')[0]}
                </span>
                <button class="btn btn-sm btn-secondary" onclick="AuthManager.logout()">Salir</button>
            `;
            if (devToolbar) devToolbar.classList.toggle('visible', isDev);
        } else {
            area.innerHTML = `<button class="btn btn-sm btn-primary" onclick="AuthManager.openModal('login')">Iniciar Sesión</button>`;
            if (devToolbar) devToolbar.classList.remove('visible');
        }
    }
};

/* ==========================================================================
   Controlador CRUD del Desarrollador
   ========================================================================== */
const DevManager = {
    openProductModal(productId = null) {
        if (!AuthManager.isDeveloper()) return;
        const modal = document.getElementById('productEditorModal');
        const title = document.getElementById('editorModalTitle');
        document.getElementById('productEditorForm').reset();

        if (productId) {
            const prod = AppStore.products.find(p => p.id === productId);
            if (!prod) return;
            title.textContent = `Editar: ${prod.nombre}`;
            document.getElementById('editProdId').value = prod.id;
            document.getElementById('editProdName').value = prod.nombre;
            document.getElementById('editProdCategory').value = prod.categoria;
            document.getElementById('editProdPrice').value = prod.precio;
            document.getElementById('editProdImg').value = prod.imagen || 'img/p1.svg';
            document.getElementById('editProdFeatured').checked = !!prod.destacado;
            document.getElementById('editProdDesc').value = prod.descripcion;
            document.getElementById('editProdSpecs').value = (prod.specs || []).join(', ');
        } else {
            title.textContent = 'Agregar Nuevo Artículo';
            document.getElementById('editProdId').value = '';
        }
        modal.classList.add('open');
    },

    closeProductModal() {
        document.getElementById('productEditorModal').classList.remove('open');
    },

    saveProduct() {
        const id = document.getElementById('editProdId').value;
        const nombre = document.getElementById('editProdName').value.trim();
        const categoria = document.getElementById('editProdCategory').value;
        const precio = Number(document.getElementById('editProdPrice').value);
        const imagen = document.getElementById('editProdImg').value;
        const destacado = document.getElementById('editProdFeatured').checked;
        const descripcion = document.getElementById('editProdDesc').value.trim();
        const specsRaw = document.getElementById('editProdSpecs').value.trim();
        const specs = specsRaw ? specsRaw.split(',').map(s => s.trim()).filter(Boolean) : ['Garantía Aetheria 2 años'];

        if (!nombre || precio <= 0 || !descripcion) return;

        if (id) {
            AppStore.updateProduct({ id, nombre, categoria, precio, imagen, destacado, descripcion, specs });
        } else {
            AppStore.addProduct({ id: 'p' + Date.now(), nombre, categoria, precio, imagen, destacado, descripcion, specs });
        }
        this.closeProductModal();
        window.location.reload();
    },

    deleteProduct(id) {
        if (!AuthManager.isDeveloper()) return;
        AppStore.deleteProduct(id);
        window.location.href = 'catalogo.html';
    }
};

/* ==========================================================================
   Componentes UI Compartidos
   ========================================================================== */
const UI = {
    renderProductCard(product, refreshCallbackName = 'location.reload()') {
        const isFav = AppStore.favorites.includes(product.id);
        const isDev = AuthManager.isDeveloper();
        return `
            <article class="product-card">
                <div class="product-media" onclick="window.location.href='producto.html?id=${product.id}'">
                    <span class="category-pill">${product.categoria}</span>
                    <button class="fav-btn ${isFav ? 'active' : ''}"
                            title="${isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}"
                            onclick="event.stopPropagation(); AppStore.toggleFavorite('${product.id}', () => { ${refreshCallbackName} })">
                        ♥
                    </button>
                    <img src="${product.imagen}" alt="${product.nombre}">
                </div>
                <div class="product-body">
                    <h3 class="product-title" onclick="window.location.href='producto.html?id=${product.id}'">${product.nombre}</h3>
                    <p class="product-desc">${product.descripcion}</p>
                    <div class="product-footer">
                        <span class="product-price">$${formatMXN(product.precio)} <small>MXN</small></span>
                        <button class="btn btn-sm btn-primary" onclick="AppStore.addToCart('${product.id}')">+ Añadir</button>
                    </div>
                    ${isDev ? `
                        <div class="dev-card-actions">
                            <button class="btn btn-sm btn-warning" style="flex: 1;" onclick="DevManager.openProductModal('${product.id}')">✏️ Editar</button>
                            <button class="btn btn-sm btn-danger" style="flex: 1;" onclick="DevManager.deleteProduct('${product.id}')">🗑️ Eliminar</button>
                        </div>
                    ` : ''}
                </div>
            </article>
        `;
    },

    toast(message) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const el = document.createElement('div');
        el.className = 'toast';
        el.textContent = message;
        container.appendChild(el);
        setTimeout(() => el.remove(), 2600);
    }
};

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(error => {
            console.warn('No fue posible registrar el Service Worker:', error);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('aetheria_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    AppStore.updateBadges();
    AuthManager.init();

    const toggleBtn = document.getElementById('themeToggleBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('aetheria_theme', next);
        });
    }
});