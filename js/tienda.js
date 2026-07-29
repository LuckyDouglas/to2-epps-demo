document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. ELEMENTOS DEL DOM
    // ==========================================
    const productGrid = document.getElementById('productGrid');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const perPageSelect = document.getElementById('perPageSelect');
    const activeFiltersContainer = document.getElementById('activeFilters');
    const paginationContainer = document.getElementById('pagination');

    // FIX: antes se usaba ".filter-group details:first-child" / ":last-child".
    // Como cada .filter-group solo tiene UN <details> adentro, ese details
    // es a la vez ":first-child" Y ":last-child" de su propio contenedor,
    // así que ambas listas terminaban trayendo TODOS los checkboxes
    // (categorías + marcas mezclados). Ahora cada grupo tiene su propio id
    // en el HTML (#filtroCategorias y #filtroMarcas) y los separamos por ahí.
    const categoryCheckboxes = document.querySelectorAll('#filtroCategorias .checkbox input');
    const brandCheckboxes = document.querySelectorAll('#filtroMarcas .checkbox input');

    // ==========================================
    // 2. ESTADO
    // ==========================================
    let productos = [];
    let productosFiltrados = [];
    let currentPage = 1;
    let itemsPerPage = 12;

    // ==========================================
    // 3. FUNCIONES DE RENDERIZADO
    // ==========================================

    // Función que genera el HTML de una tarjeta de producto
    function crearProductoHTML(producto) {
        const asterisco = '<span>*</span>';

        return `
        <div class="product-card">
            <div class="product-card__image">
                <img src="${producto.imagen}" alt="${producto.nombre}">
            </div>
            <h3><a href="detalle.html?id=${producto.id}" class="product-link">${producto.nombre}</a></h3>
            <p class="price">S/ ${producto.precio.toFixed(2)} ${asterisco}</p>
            <p class="price-note">* Precio unitario</p>
            <div class="product-card__actions">
                <a href="#" class="btn btn--outline-sm" data-id="${producto.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="cart-icon">
                        <circle cx="8" cy="21" r="1"/>
                        <circle cx="19" cy="21" r="1"/>
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                    </svg>
                    Agregar
                </a>
                <a href="#" class="btn btn--whatsapp-sm" data-id="${producto.id}">☎ Cotizar por mayor</a>
            </div>
        </div>
        `;
    }

    // Renderizar productos en el grid (con paginación)
    function renderizarProductos() {
        if (!productGrid) return;

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const productosPagina = productosFiltrados.slice(start, end);

        if (productosPagina.length === 0) {
            productGrid.innerHTML = `<p class="no-results">No se encontraron productos con los filtros seleccionados.</p>`;
        } else {
            productGrid.innerHTML = productosPagina.map(p => crearProductoHTML(p)).join('');
        }

        renderizarPaginacion();
    }

    // Renderizar los botones de paginación
    function renderizarPaginacion() {
        if (!paginationContainer) return;
        const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let html = '';
        html += `<button class="pagination__btn" data-page="${currentPage - 1}" ${currentPage <= 1 ? 'disabled' : ''}>‹</button>`;

        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);
        if (endPage - startPage < 4) {
            if (startPage === 1) endPage = Math.min(totalPages, startPage + 4);
            else if (endPage === totalPages) startPage = Math.max(1, endPage - 4);
        }

        if (startPage > 1) {
            html += `<button class="pagination__btn" data-page="1">1</button>`;
            if (startPage > 2) html += `<span class="pagination__btn pagination__btn--ellipsis">…</span>`;
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="pagination__btn ${i === currentPage ? 'pagination__btn--active' : ''}" data-page="${i}">${i}</button>`;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) html += `<span class="pagination__btn pagination__btn--ellipsis">…</span>`;
            html += `<button class="pagination__btn" data-page="${totalPages}">${totalPages}</button>`;
        }

        html += `<button class="pagination__btn" data-page="${currentPage + 1}" ${currentPage >= totalPages ? 'disabled' : ''}>›</button>`;

        paginationContainer.innerHTML = html;

        paginationContainer.querySelectorAll('button[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.dataset.page);
                if (page >= 1 && page <= totalPages) {
                    currentPage = page;
                    renderizarProductos();
                    document.querySelector('.shop__main').scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // Actualizar contadores en los filtros (categorías y marcas)
    function actualizarContadores() {
        // FIX: antes se contaba por POSICIÓN/ÍNDICE, comparando el índice del
        // checkbox en el DOM contra el índice de una lista de categorías/marcas
        // únicas sacada de productos.json. Como el orden y la cantidad de esas
        // dos listas no siempre coinciden (por ejemplo el checkbox de "Uvex"
        // terminaba mostrando el conteo de "Delta Plus"), los números salían
        // mal. Ahora se cuenta directamente por el VALOR real del checkbox,
        // así el número siempre corresponde a la categoría o marca correcta
        // (y si no hay productos para esa opción, mostrará "(0)" en vez de
        // un número inventado).
        categoryCheckboxes.forEach(cb => {
            const label = cb.closest('.checkbox').querySelector('.checkbox__count');
            if (label) {
                const count = productos.filter(p => p.categoria === cb.value).length;
                label.textContent = `(${count})`;
            }
        });

        brandCheckboxes.forEach(cb => {
            const label = cb.closest('.checkbox').querySelector('.checkbox__count');
            if (label) {
                const count = productos.filter(p => p.marca === cb.value).length;
                label.textContent = `(${count})`;
            }
        });
    }

    // ==========================================
    // 4. FUNCIONES DE FILTRADO Y ORDEN
    // ==========================================

    // Obtener filtros activos
    function getActiveFilters() {
        const categoriasActivas = [];
        categoryCheckboxes.forEach(cb => {
            if (cb.checked) categoriasActivas.push(cb.value);
        });

        const marcasActivas = [];
        brandCheckboxes.forEach(cb => {
            if (cb.checked) marcasActivas.push(cb.value);
        });

        return { categoriasActivas, marcasActivas };
    }

    // Aplicar filtros y orden, actualizar productosFiltrados
    function aplicarFiltrosYOrden() {
        const { categoriasActivas, marcasActivas } = getActiveFilters();
        const busqueda = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const orden = sortSelect ? sortSelect.value : 'Más relevantes';

        let filtrados = productos.filter(p => {
            if (categoriasActivas.length > 0 && !categoriasActivas.includes(p.categoria)) return false;
            if (marcasActivas.length > 0 && !marcasActivas.includes(p.marca)) return false;
            if (busqueda) {
                const nombreMatch = p.nombre.toLowerCase().includes(busqueda);
                const marcaMatch = p.marca.toLowerCase().includes(busqueda);
                if (!nombreMatch && !marcaMatch) return false;
            }
            return true;
        });

        switch (orden) {
            case 'Precio: menor a mayor':
                filtrados.sort((a, b) => a.precio - b.precio);
                break;
            case 'Precio: mayor a menor':
                filtrados.sort((a, b) => b.precio - a.precio);
                break;
            case 'Nombre: A-Z':
                filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
                break;
            default: // Más relevantes
                filtrados.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0) || a.id - b.id);
                break;
        }

        productosFiltrados = filtrados;
        currentPage = 1; // Reiniciar a la primera página al filtrar

        actualizarChips(categoriasActivas, marcasActivas, busqueda);
        renderizarProductos();
    }

    // Actualizar los chips de filtros activos
    function actualizarChips(categorias, marcas, busqueda) {
        if (!activeFiltersContainer) return;

        activeFiltersContainer.innerHTML = '';

        const label = document.createElement('span');
        label.className = 'active-filters__label';
        label.textContent = 'Filtros activos:';
        activeFiltersContainer.appendChild(label);

        const chips = [];
        categorias.forEach(cat => chips.push(crearChip(cat, 'categoria')));
        marcas.forEach(marca => chips.push(crearChip(marca, 'marca')));
        if (busqueda) chips.push(crearChip(`"${busqueda}"`, 'busqueda'));

        chips.forEach(chip => activeFiltersContainer.appendChild(chip));
    }

    // Crear un chip individual
    function crearChip(valor, tipo) {
        const chip = document.createElement('button');
        chip.className = 'filter-chip';
        chip.innerHTML = `${valor} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`;
        chip.dataset.tipo = tipo;
        chip.dataset.valor = valor;

        chip.addEventListener('click', () => {
            if (tipo === 'categoria') {
                const cb = document.querySelector(`#filtroCategorias .checkbox input[value="${valor}"]`);
                if (cb) cb.checked = false;
            } else if (tipo === 'marca') {
                const cb = document.querySelector(`#filtroMarcas .checkbox input[value="${valor}"]`);
                if (cb) cb.checked = false;
            } else if (tipo === 'busqueda') {
                if (searchInput) searchInput.value = '';
            }
            aplicarFiltrosYOrden();
        });

        return chip;
    }

    // ==========================================
    // 5. CARGA DE DATOS Y INICIALIZACIÓN
    // ==========================================

    function cargarProductos() {
        fetch('data/productos.json')
            .then(response => {
                if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
                return response.json();
            })
            .then(data => {
                productos = data;
                actualizarContadores();
                aplicarFiltrosYOrden();
            })
            .catch(error => {
                console.error('❌ Error al cargar productos:', error);
                if (productGrid) {
                    productGrid.innerHTML = `<p class="error">No se pudieron cargar los productos. Intenta más tarde.</p>`;
                }
            });
    }

    // ==========================================
    // 6. EVENT LISTENERS
    // ==========================================

    categoryCheckboxes.forEach(cb => cb.addEventListener('change', aplicarFiltrosYOrden));
    brandCheckboxes.forEach(cb => cb.addEventListener('change', aplicarFiltrosYOrden));

    if (searchInput) searchInput.addEventListener('input', aplicarFiltrosYOrden);
    if (sortSelect) sortSelect.addEventListener('change', aplicarFiltrosYOrden);
    if (perPageSelect) {
        perPageSelect.addEventListener('change', (e) => {
            itemsPerPage = parseInt(e.target.value) || 12;
            currentPage = 1;
            aplicarFiltrosYOrden();
        });
    }

    // ==========================================
    // 7. INICIAR
    // ==========================================

    cargarProductos();
});

// ==========================================
// Mostrar/ocultar los <details> de filtros según el ancho de pantalla
// ==========================================
const filtros = document.querySelectorAll(".filter-dropdown");

function actualizarEstadoFiltros() {
    filtros.forEach(filtro => {
        filtro.open = window.innerWidth > 960;
    });
}

actualizarEstadoFiltros();
window.addEventListener("resize", actualizarEstadoFiltros);