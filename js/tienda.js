    let productos = [];
    // ==========================================
    // 1. ELEMENTOS DEL DOM
    // ==========================================

    const productGrid =
        document.getElementById("productGrid");

    const searchInput =
        document.getElementById("searchInput");

    const sortSelect =
        document.getElementById("sortSelect");

    const perPageSelect =
        document.getElementById("perPageSelect");

    const activeFiltersContainer =
        document.getElementById("activeFilters");

    const paginationContainer =
        document.getElementById("pagination");

    const categoryCheckboxes =
        document.querySelectorAll(
            "#filtroCategorias .checkbox input"
        );

    const brandCheckboxes =
        document.querySelectorAll(
            "#filtroMarcas .checkbox input"
        );


    // ==========================================
    // 2. ESTADO
    // ==========================================

    let productosFiltrados = [];

    let currentPage = 1;

    let itemsPerPage = 12;

    // ==========================================
    // 4. RENDERIZAR PRODUCTOS
    // ==========================================

    function renderizarProductos() {

        if (!productGrid) return;


        const inicio =
            (currentPage - 1) * itemsPerPage;

        const fin =
            inicio + itemsPerPage;


        const productosPagina =
            productosFiltrados.slice(inicio, fin);


        if (productosPagina.length === 0) {

            productGrid.innerHTML = `
                <p class="no-results">
                    No se encontraron productos
                    con los filtros seleccionados.
                </p>
            `;

        } else {

            productGrid.innerHTML =
                productosPagina
                    .map(crearProductoHTML)
                    .join("");

        }


        renderizarPaginacion();
    }


    // ==========================================
    // 5. PAGINACIÓN
    // ==========================================

    function renderizarPaginacion() {

        if (!paginationContainer) return;


        const totalPages =
            Math.ceil(
                productosFiltrados.length /
                itemsPerPage
            );


        if (totalPages <= 1) {

            paginationContainer.innerHTML = "";

            return;
        }


        let html = "";


        // Botón anterior

        html += `
            <button
                class="pagination__btn"
                data-page="${currentPage - 1}"
                ${currentPage <= 1 ? "disabled" : ""}
            >
                ‹
            </button>
        `;


        let startPage =
            Math.max(
                1,
                currentPage - 1
            );


        let endPage =
            Math.min(
                totalPages,
                currentPage + 1
            );


        if (endPage - startPage < 4) {

            if (startPage === 1) {

                endPage =
                    Math.min(
                        totalPages,
                        startPage + 2
                    );

            } else if (endPage === totalPages) {

                startPage =
                    Math.max(
                        1,
                        endPage - 2 
                    );
            }
        }


        // Primera página

        if (startPage > 1) {

            html += `
                <button
                    class="pagination__btn"
                    data-page="1"
                >
                    1
                </button>
            `;


            if (startPage > 2) {

                html += `
                    <span
                        class="pagination__btn pagination__btn--ellipsis"
                    >
                        …
                    </span>
                `;
            }
        }


        // Páginas

        for (
            let i = startPage;
            i <= endPage;
            i++
        ) {

            html += `
                <button
                    class="pagination__btn
                    ${i === currentPage
                        ? "pagination__btn--active"
                        : ""}"
                    data-page="${i}"
                >
                    ${i}
                </button>
            `;
        }


        // Última página

        if (endPage < totalPages) {

            if (endPage < totalPages - 1) {

                html += `
                    <span
                        class="pagination__btn pagination__btn--ellipsis"
                    >
                        …
                    </span>
                `;
            }


            html += `
                <button
                    class="pagination__btn"
                    data-page="${totalPages}"
                >
                    ${totalPages}
                </button>
            `;
        }


        // Botón siguiente

        html += `
            <button
                class="pagination__btn"
                data-page="${currentPage + 1}"
                ${currentPage >= totalPages ? "disabled" : ""}
            >
                ›
            </button>
        `;


        paginationContainer.innerHTML = html;


        // Eventos de botones

        paginationContainer
            .querySelectorAll("button[data-page]")
            .forEach(btn => {

                btn.addEventListener(
                    "click",
                    () => {

                        const page =
                            parseInt(
                                btn.dataset.page
                            );


                        if (
                            page >= 1 &&
                            page <= totalPages
                        ) {

                            currentPage = page;

                            renderizarProductos();


                            const shopMain =
                                document.querySelector(
                                    ".shop__main"
                                );


                            if (shopMain) {

                                shopMain.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start"
                                });

                            }
                        }
                    }
                );

            });
    }


    // ==========================================
    // 6. CONTADORES DE CATEGORÍAS Y MARCAS
    // ==========================================

    function actualizarContadores() {

        categoryCheckboxes.forEach(cb => {

            const label =
                cb
                    .closest(".checkbox")
                    ?.querySelector(
                        ".checkbox__count"
                    );


            if (!label) return;


            const count =
                productos.filter(
                    producto =>
                        producto.categoria === cb.value
                ).length;


            label.textContent =
                `(${count})`;

        });


        brandCheckboxes.forEach(cb => {

            const label =
                cb
                    .closest(".checkbox")
                    ?.querySelector(
                        ".checkbox__count"
                    );


            if (!label) return;


            const count =
                productos.filter(
                    producto =>
                        producto.marca === cb.value
                ).length;


            label.textContent =
                `(${count})`;

        });
    }


    // ==========================================
    // 7. OBTENER FILTROS ACTIVOS
    // ==========================================

    function obtenerFiltrosActivos() {

        const categorias = [];

        categoryCheckboxes.forEach(cb => {

            if (cb.checked) {
                categorias.push(cb.value);
            }

        });


        const marcas = [];

        brandCheckboxes.forEach(cb => {

            if (cb.checked) {
                marcas.push(cb.value);
            }

        });


        return {
            categorias,
            marcas
        };
    }


    // ==========================================
    // 8. FILTRAR Y ORDENAR
    // ==========================================

    function aplicarFiltrosYOrden() {

        const {
            categorias,
            marcas
        } = obtenerFiltrosActivos();


        const busqueda =
            searchInput
                ? searchInput.value
                    .toLowerCase()
                    .trim()
                : "";


        const orden =
            sortSelect
                ? sortSelect.value
                : "Más relevantes";


        let filtrados =
            productos.filter(producto => {


                // Categoría

                if (
                    categorias.length > 0 &&
                    !categorias.includes(
                        producto.categoria
                    )
                ) {
                    return false;
                }


                // Marca

                if (
                    marcas.length > 0 &&
                    !marcas.includes(
                        producto.marca
                    )
                ) {
                    return false;
                }


                // Búsqueda

                if (busqueda) {

                    const nombreMatch =
                        producto.nombre
                            .toLowerCase()
                            .includes(busqueda);


                    const marcaMatch =
                        producto.marca
                            .toLowerCase()
                            .includes(busqueda);


                    if (
                        !nombreMatch &&
                        !marcaMatch
                    ) {
                        return false;
                    }
                }


                return true;

            });


        // ======================================
        // ORDEN
        // ======================================

        switch (orden) {

            case "Precio: menor a mayor":

                filtrados.sort(
                    (a, b) =>
                        a.precio - b.precio
                );

                break;


            case "Precio: mayor a menor":

                filtrados.sort(
                    (a, b) =>
                        b.precio - a.precio
                );

                break;


            case "Nombre: A-Z":

                filtrados.sort(
                    (a, b) =>
                        a.nombre.localeCompare(
                            b.nombre
                        )
                );

                break;


            default:

                filtrados.sort(
                    (a, b) =>
                        (b.destacado ? 1 : 0) -
                        (a.destacado ? 1 : 0) ||
                        a.id - b.id
                );

                break;
        }


        productosFiltrados = filtrados;

        currentPage = 1;


        actualizarChips(
            categorias,
            marcas,
            busqueda
        );


        renderizarProductos();
    }


    // ==========================================
    // 9. CHIPS DE FILTROS
    // ==========================================

    function actualizarChips(
        categorias,
        marcas,
        busqueda
    ) {

        if (!activeFiltersContainer) return;


        activeFiltersContainer.innerHTML = "";


        const label =
            document.createElement("span");


        label.className =
            "active-filters__label";


        label.textContent =
            "Filtros activos:";


        activeFiltersContainer.appendChild(label);


        categorias.forEach(
            categoria =>
                activeFiltersContainer.appendChild(
                    crearChip(
                        categoria,
                        "categoria"
                    )
                )
        );


        marcas.forEach(
            marca =>
                activeFiltersContainer.appendChild(
                    crearChip(
                        marca,
                        "marca"
                    )
                )
        );


        if (busqueda) {

            activeFiltersContainer.appendChild(
                crearChip(
                    `"${busqueda}"`,
                    "busqueda"
                )
            );
        }
    }


    // ==========================================
    // 10. CREAR CHIP
    // ==========================================

    function crearChip(valor, tipo) {

        const chip =
            document.createElement("button");


        chip.className =
            "filter-chip";


        chip.innerHTML = `
            ${valor}

            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
            >
                <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
        `;


        chip.addEventListener(
            "click",
            () => {

                if (tipo === "categoria") {

                    const checkbox =
                        Array.from(
                            categoryCheckboxes
                        ).find(
                            cb =>
                                cb.value === valor
                        );


                    if (checkbox) {
                        checkbox.checked = false;
                    }

                }


                else if (tipo === "marca") {

                    const checkbox =
                        Array.from(
                            brandCheckboxes
                        ).find(
                            cb =>
                                cb.value === valor
                        );


                    if (checkbox) {
                        checkbox.checked = false;
                    }

                }


                else if (tipo === "busqueda") {

                    if (searchInput) {
                        searchInput.value = "";
                    }

                }


                aplicarFiltrosYOrden();

            }
        );


        return chip;
    }


    // ==========================================
    // 11. CARGAR PRODUCTOS
    // ==========================================

    function cargarProductos() {

        fetch("data/productos-listado.json")

            .then(response => {

                if (!response.ok) {

                    throw new Error(
                        `Error HTTP: ${response.status}`
                    );
                }

                return response.json();
            })

            .then(data => {

                productos = data;


                // ==================================
                // CATEGORÍA DESDE LA URL
                // ==================================

                const params =
                    new URLSearchParams(
                        window.location.search
                    );


                const categoriaUrl =
                    params.get("categoria");


                if (categoriaUrl) {

                    const checkboxTarget =
                        Array.from(
                            categoryCheckboxes
                        ).find(
                            cb =>
                                cb.value === categoriaUrl
                        );


                    if (checkboxTarget) {

                        checkboxTarget.checked = true;


                        // const detailsParent =
                        //     checkboxTarget.closest(
                        //         "details"
                        //     );


                        // if (detailsParent) {
                        //     detailsParent.open = true;
                        // }
                    }
                }


                // ==================================
                // INICIAR
                // ==================================

                actualizarContadores();

                aplicarFiltrosYOrden();

            })


            .catch(error => {

                console.error(
                    "❌ Error al cargar productos:",
                    error
                );


                if (productGrid) {

                    productGrid.innerHTML = `
                        <p class="error">
                            No se pudieron cargar
                            los productos.
                            Intenta más tarde.
                        </p>
                    `;
                }

            });
    }


    // ==========================================
    // 12. EVENTOS DE FILTROS
    // ==========================================

    categoryCheckboxes.forEach(
        checkbox =>
            checkbox.addEventListener(
                "change",
                aplicarFiltrosYOrden
            )
    );


    brandCheckboxes.forEach(
        checkbox =>
            checkbox.addEventListener(
                "change",
                aplicarFiltrosYOrden
            )
    );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            aplicarFiltrosYOrden
        );

    }


    if (sortSelect) {

        sortSelect.addEventListener(
            "change",
            aplicarFiltrosYOrden
        );

    }


    if (perPageSelect) {

        perPageSelect.addEventListener(
            "change",
            e => {

                itemsPerPage =
                    parseInt(
                        e.target.value
                    ) || 12;


                currentPage = 1;

                aplicarFiltrosYOrden();

            }
        );

    }


    // ==========================================
    // 13. FILTROS RESPONSIVOS
    // ==========================================

    const filtros =
        document.querySelectorAll(
            ".filter-dropdown"
        );


    function actualizarEstadoFiltros() {

        filtros.forEach(filtro => {

            filtro.open =
                window.innerWidth > 960;

        });
    }


    actualizarEstadoFiltros();


    window.addEventListener(
        "resize",
        actualizarEstadoFiltros
    );


    // ==========================================
    // 14. INICIAR TIENDA
    // ==========================================

    cargarProductos();

