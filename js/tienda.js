let productos = [];
let productosFiltrados = [];
let currentPage = 1;
let itemsPerPage = 12;

// --- ELEMENTOS DEL DOM ---
const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const perPageSelect = document.getElementById("perPageSelect");
const activeFiltersContainer = document.getElementById("activeFilters");
const paginationContainer = document.getElementById("pagination");
const categoryCheckboxes = document.querySelectorAll("#filtroCategorias .checkbox input");
const brandCheckboxes = document.querySelectorAll("#filtroMarcas .checkbox input");

// --- RENDERIZAR PRODUCTOS ---
function renderizarProductos() {
    if (!productGrid) return;
    const inicio = (currentPage - 1) * itemsPerPage;
    const productosPagina = productosFiltrados.slice(inicio, inicio + itemsPerPage);

    productGrid.innerHTML = productosPagina.length === 0 
        ? `<p class="no-results">No se encontraron productos con los filtros seleccionados.</p>`
        : productosPagina.map(crearProductoHTML).join("");

    renderizarPaginacion();
}

// --- PAGINACIÓN ---
function renderizarPaginacion() {
    if (!paginationContainer) return;
    const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);
    if (totalPages <= 1) return (paginationContainer.innerHTML = "");

    let html = `<button class="pagination__btn" data-page="${currentPage - 1}" ${currentPage <= 1 ? "disabled" : ""}>‹</button>`;
    
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, currentPage + 1);

    if (endPage - startPage < 4) {
        if (startPage === 1) endPage = Math.min(totalPages, startPage + 2);
        else if (endPage === totalPages) startPage = Math.max(1, endPage - 2);
    }

    if (startPage > 1) {
        html += `<button class="pagination__btn" data-page="1">1</button>`;
        if (startPage > 2) html += `<span class="pagination__btn pagination__btn--ellipsis">…</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="pagination__btn ${i === currentPage ? "pagination__btn--active" : ""}" data-page="${i}">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += `<span class="pagination__btn pagination__btn--ellipsis">…</span>`;
        html += `<button class="pagination__btn" data-page="${totalPages}">${totalPages}</button>`;
    }

    html += `<button class="pagination__btn" data-page="${currentPage + 1}" ${currentPage >= totalPages ? "disabled" : ""}>›</button>`;
    paginationContainer.innerHTML = html;

    paginationContainer.querySelectorAll("button[data-page]").forEach(btn => {
        btn.addEventListener("click", () => {
            const page = parseInt(btn.dataset.page);
            if (page >= 1 && page <= totalPages) {
                currentPage = page;
                renderizarProductos();
                document.querySelector(".shop__main")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });
}

// --- CONTADORES DE CATEGORÍAS Y MARCAS (REUTILIZABLE) ---
function actualizarContadores() {
    const contar = (checkboxes, propiedad) => {
        checkboxes.forEach(cb => {
            const label = cb.closest(".checkbox")?.querySelector(".checkbox__count");
            if (label) {
                const count = productos.filter(p => p[propiedad] === cb.value).length;
                label.textContent = `(${count})`;
            }
        });
    };
    contar(categoryCheckboxes, "categoria");
    contar(brandCheckboxes, "marca");
}

// --- OBTENER FILTROS ACTIVOS ---
function obtenerFiltrosActivos() {
    const getChecked = checkboxes => Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
    return { categorias: getChecked(categoryCheckboxes), marcas: getChecked(brandCheckboxes) };
}

// --- FILTRAR Y ORDENAR ---
function aplicarFiltrosYOrden() {
    const { categorias, marcas } = obtenerFiltrosActivos();
    const busqueda = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const orden = sortSelect ? sortSelect.value : "Más relevantes";

    let filtrados = productos.filter(p => {
        if (categorias.length > 0 && !categorias.includes(p.categoria)) return false;
        if (marcas.length > 0 && !marcas.includes(p.marca)) return false;
        if (busqueda) {
            const match = p.nombre.toLowerCase().includes(busqueda) || p.marca.toLowerCase().includes(busqueda);
            if (!match) return false;
        }
        return true;
    });

    switch (orden) {
        case "Precio: menor a mayor": filtrados.sort((a, b) => a.precio - b.precio); break;
        case "Precio: mayor a menor": filtrados.sort((a, b) => b.precio - a.precio); break;
        case "Nombre: A-Z": filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre)); break;
        default: filtrados.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0) || a.id - b.id); break;
    }

    productosFiltrados = filtrados;
    currentPage = 1;
    actualizarChips(categorias, marcas, busqueda);
    renderizarProductos();
}

// --- CHIPS DE FILTROS ---
function actualizarChips(categorias, marcas, busqueda) {
    if (!activeFiltersContainer) return;
    activeFiltersContainer.innerHTML = `<span class="active-filters__label">Filtros activos:</span>`;

    categorias.forEach(cat => activeFiltersContainer.appendChild(crearChip(cat, "categoria")));
    marcas.forEach(marca => activeFiltersContainer.appendChild(crearChip(marca, "marca")));
    if (busqueda) activeFiltersContainer.appendChild(crearChip(`"${busqueda}"`, "busqueda"));
}

function crearChip(valor, tipo) {
    const chip = document.createElement("button");
    chip.className = "filter-chip";
    chip.innerHTML = `${valor} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`;

    chip.addEventListener("click", () => {
        if (tipo === "busqueda") {
            if (searchInput) searchInput.value = "";
        } else {
            const list = tipo === "categoria" ? categoryCheckboxes : brandCheckboxes;
            const target = Array.from(list).find(cb => cb.value === valor);
            if (target) target.checked = false;
        }
        aplicarFiltrosYOrden();
    });
    return chip;
}

// --- CARGAR PRODUCTOS Y EVENTOS ---
function cargarProductos() {
    fetch("data/productos-listado.json")
        .then(res => res.ok ? res.json() : Promise.reject(`Error ${res.status}`))
        .then(data => {
            productos = data;
            const categoriaUrl = new URLSearchParams(window.location.search).get("categoria");
            if (categoriaUrl) {
                const cb = Array.from(categoryCheckboxes).find(c => c.value === categoriaUrl);
                if (cb) cb.checked = true;
            }
            actualizarContadores();
            aplicarFiltrosYOrden();
        })
        .catch(err => {
            console.error("❌ Error al cargar productos:", err);
            if (productGrid) productGrid.innerHTML = `<p class="error">No se pudieron cargar los productos.</p>`;
        });
}

[...categoryCheckboxes, ...brandCheckboxes].forEach(cb => cb.addEventListener("change", aplicarFiltrosYOrden));
searchInput?.addEventListener("input", aplicarFiltrosYOrden);
sortSelect?.addEventListener("change", aplicarFiltrosYOrden);
perPageSelect?.addEventListener("change", e => {
    itemsPerPage = parseInt(e.target.value) || 12;
    currentPage = 1;
    aplicarFiltrosYOrden();
});

const filtros = document.querySelectorAll(".filter-dropdown");
const actualizarEstadoFiltros = () => filtros.forEach(f => f.open = window.innerWidth > 960);
actualizarEstadoFiltros();
window.addEventListener("resize", actualizarEstadoFiltros);

cargarProductos();