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
        // Le inyectamos el ID del producto dinámicamente al botón
        btnAgregarCarrito.dataset.id = p.id;
        // Le añadimos una clase para saber que es el botón principal y debe leer la cantidad
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

// ─── 6. MOSTRAR ERROR SI NO EXISTE EL PRODUCTO ───────
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

