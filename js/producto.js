/* =====================================================
   producto.js
   Renderiza la página de detalle según ?id= en la URL
   ===================================================== */

// ─── 1. LEER EL ID DE LA URL ─────────────────────────
const params     = new URLSearchParams(window.location.search);
const productoId = Number(params.get("id"));

// ─── 2. FETCH AL JSON Y RENDERIZAR ───────────────────
fetch("data/productos.json")
    .then(res => {
        if (!res.ok) throw new Error("No se pudo cargar productos.json");
        return res.json();
    })
    .then(productos => {
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
                <img src="${src}" alt="Vista ${i + 1} de ${p.nombre}">
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
        const colores = p.colores.length > 0
            ? p.colores.join(", ")
            : "Consultar";

        const tallas = p.tallas.length > 0
            ? p.tallas.join(", ")
            : "Consultar";

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

    // ── Botón de WhatsApp con mensaje dinámico
    const btnWhatsapp = document.querySelector(".btn--whatsapp-sm");
    if (btnWhatsapp) {
        const mensaje = encodeURIComponent(
            `Hola, estoy interesado en el producto: ${p.nombre} (S/ ${p.precio.toFixed(2)}). ¿Tienen stock disponible?`
        );
        btnWhatsapp.onclick = () => {
            window.open(`https://wa.me/51917989472?text=${mensaje}`, "_blank");
        };
    }

    // ── Botón "Agregar al carrito" con data-id correcto
    const btnCarrito = document.querySelector(".btn--outline-sm");
    if (btnCarrito) {
        btnCarrito.setAttribute("data-id", p.id);
    }
}


// ─── 4. FUNCIÓN DE GALERÍA (changeImage) ─────────────
// Reemplaza la versión inline del HTML (onclick="changeImage(...)")
function changeImage(thumb, src) {
    // Cambiar imagen principal
    const mainImg = document.getElementById("main-img");
    if (mainImg) mainImg.src = src;

    // Actualizar clase active en los thumbs
    document.querySelectorAll(".thumb").forEach(t => t.classList.remove("active"));
    thumb.classList.add("active");
}


// ─── 5. CONTADOR DE CANTIDAD ─────────────────────────
// Reemplaza las funciones inline onclick="updateQty(...)" del HTML
function updateQty(delta) {
    const input = document.getElementById("qty-input");
    if (!input) return;

    const nuevaCantidad = Math.max(1, Number(input.value) + delta);
    input.value = nuevaCantidad;
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