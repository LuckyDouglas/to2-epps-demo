// ─── VARIABLES GLOBALES ──────────────────────────────
// Creamos una variable para guardar el catálogo entero cuando se cargue el JSON
let productosGlobal = [];

// ─── 1. LEER EL ID DE LA URL ─────────────────────────
const params = new URLSearchParams(window.location.search);
const productoId = Number(params.get("id"));


// ─── 2. FETCH AL JSON Y RENDERIZAR ───────────────────
fetch("data/productos.json")
    .then(res => {
        if (!res.ok) throw new Error("No se pudo cargar productos.json");
        return res.json();
    })
    .then(productos => {
        // Guardamos los productos en la variable global para que el botón de agregar los encuentre
        productosGlobal = productos;

        const producto = productos.find(p => p.id === productoId);

        if (!producto) {
            mostrarError("Producto no encontrado.");
            return;
        }

        renderizarProducto(producto);
        
        // 👇 NUEVO: Llamamos a la función de relacionados pasándole los datos
        cargarProductosRelacionados(productos, producto);
    })
    .catch(err => {
        console.error(err);
        mostrarError("Error al cargar el producto. Intenta de nuevo.");
    });


// ─── 3. FUNCIÓN PRINCIPAL DE RENDERIZADO ─────────────
function renderizarProducto(p) {

    // ── Título de la pestaña del navegador
    document.title = `${p.nombre} | TO2EPPS`;

    // ── Breadcrumb
    const breadcrumb = document.querySelector(".breadcrumb");
    if (breadcrumb) {
        breadcrumb.innerHTML = `
            <a href="/">Inicio</a> /
            <a href="Tienda.html?categoria=${p.categoria}">${p.categoria}s</a> /
            ${p.nombre}
        `;
    }

    // ── Título del hero
    const heroTitle = document.querySelector(".shop-hero__content h1");
    if (heroTitle) heroTitle.textContent = p.nombre;

    // ── Galería principal
    const mainImg = document.getElementById("main-img");
    if (mainImg) {
        mainImg.src = p.imagenes[0];
        mainImg.alt = p.nombre;
    }

    // ── Miniaturas (thumbs)
    const thumbsContainer = document.querySelector(".gallery-thumbs");
    if (thumbsContainer) {
        thumbsContainer.innerHTML = p.imagenes.map((src, i) => `
    <div class="thumb ${i === 0 ? "active" : ""}"
         onclick="changeImage(this, '${src}')">
        <img 
            src="${src}" 
            alt="Vista ${i + 1} de ${p.nombre}"
            loading="${i === 0 ? "eager" : "lazy"}"
        >
    </div>
`).join("");
    }

    // ── Badge de marca y categoría
    const brandBadge = document.querySelector(".brand-badge");
    if (brandBadge) {
        brandBadge.textContent = `Marca: ${p.marca} | Categoría: ${p.categoria}`;
    }

    // ── Título del producto
    const productTitle = document.querySelector(".product-title");
    if (productTitle) productTitle.textContent = p.nombre;

    // ── Precio
    const priceMain = document.querySelector(".price-main");
    if (priceMain) priceMain.textContent = `S/ ${p.precio.toFixed(2)}`;

    // ── Descripción
    const description = document.querySelector(".description");
    if (description) description.textContent = p.descripcion;

    // ── Info adicional (colores y tallas)
    const infoBox = document.querySelector(".info-box");
    if (infoBox) {
        const colores = p.colores.length > 0 ? p.colores.join(", ") : "Consultar";
        const tallas = p.tallas.length > 0 ? p.tallas.join(", ") : "Consultar";

        infoBox.innerHTML = `
            <p>🎨 <strong>Colores disponibles:</strong> ${colores}</p>
            <p>📏 <strong>Talla disponible:</strong> ${tallas}</p>
        `;
    }

    // ── Especificaciones técnicas
    const specsBody = document.querySelector(".specs-table tbody");
    if (specsBody) {
        specsBody.innerHTML = p.especificaciones.map(spec => `
            <tr>
                <td class="label">${spec.etiqueta}</td>
                <td class="value">${spec.valor}</td>
            </tr>
        `).join("");
    }

    // ── Preparar el botón de Agregar al Carrito de esta página
    const btnAgregarCarrito = document.querySelector(".btn--outline-sm");
    if (btnAgregarCarrito) {
        btnAgregarCarrito.dataset.id = p.id;
        btnAgregarCarrito.classList.add("btn-principal-detalle");
    }
}


// ─── 4. FUNCIÓN DE GALERÍA (changeImage) ─────────────
function changeImage(thumb, src) {
    const mainImg = document.getElementById("main-img");
    if (mainImg) mainImg.src = src;

    document.querySelectorAll(".thumb").forEach(t => t.classList.remove("active"));
    thumb.classList.add("active");
}

// ─── 5. MOSTRAR ERROR SI NO EXISTE EL PRODUCTO ───────
function mostrarError(mensaje) {
    const section = document.querySelector(".product-detail-card");
    if (section) {
        section.innerHTML = `
            <div style="padding: 60px 20px; text-align: center;">
                <p style="font-size: 18px; color: #666;">${mensaje}</p>
                <a href="Tienda.html"
                   style="display:inline-block; margin-top:16px; padding:10px 24px;
                          background:#1a3a5c; color:#fff; border-radius:8px;
                          text-decoration:none;">
                    Volver a la tienda
                </a>
            </div>
        `;
    }
}

// ====================================================================
// 👇 NUEVAS FUNCIONES PARA LOS PRODUCTOS RELACIONADOS 👇
// ====================================================================

// ─── 6. CARGAR PRODUCTOS RELACIONADOS ────────────────
function cargarProductosRelacionados(todosLosProductos, productoActual) {
    const contenedorRelacionados = document.getElementById("contenedor-relacionados");
    if (!contenedorRelacionados) return;

    // Filtrar por misma categoría, excluyendo el producto que estamos viendo
    const productosMismaCategoria = todosLosProductos.filter(p => 
        p.categoria === productoActual.categoria && p.id !== productoActual.id
    );

    // Tomar solo 4 productos
    const productosMostrar = productosMismaCategoria.slice(0, 4);

    // Si no hay productos relacionados, podríamos ocultar la sección entera
    if (productosMostrar.length === 0) {
        contenedorRelacionados.parentElement.style.display = "none";
        return;
    }

    // Generar e inyectar el HTML
    let html = "";
    productosMostrar.forEach((producto, index) => {
        html += crearProductoHTML(producto, index);
    });

    contenedorRelacionados.innerHTML = html;
}

// ─── 7. TEMPLATE HTML DEL PRODUCTO (Tarjeta) ─────────
function crearProductoHTML(producto, index) {
    const urlDetalle = `${window.location.origin}/detalle.html?id=${producto.id}`;
    const loading = index < 4 ? "eager" : "lazy";

    return `
        <div class="product-card">

            <a 
                href="detalle.html?id=${producto.id}" 
                class="product-card__cover-link" 
                aria-label="Ver detalle de ${producto.nombre}"
            ></a>

            <div class="product-card__image">
                <img
                    src="${producto.imagen}"
                    alt="${producto.nombre}"
                    loading="${loading}"
                >
            </div>

            <h3>${producto.nombre}</h3>

            <p class="price">
                S/ ${producto.precio.toFixed(2)}
                <span>*</span>
            </p>

            <p class="price-note">
                * Precio unitario
            </p>

            <div class="product-card__actions">

                <button 
                    type="button"
                    class="btn btn--outline-sm"
                    data-id="${producto.id}"
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        stroke-width="3" 
                        stroke-linecap="round" 
                        stroke-linejoin="round"
                    >
                        <circle cx="8" cy="21" r="1"/>
                        <circle cx="19" cy="21" r="1"/>
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                    </svg> 
                    Agregar
                </button>

                <button
                    type="button"
                    class="btn btn--whatsapp-sm"
                    data-nombre="${producto.nombre}"
                    data-url="${urlDetalle}"
                >
                    ☎ Cotizar
                </button>

            </div>
        </div>
    `;
}