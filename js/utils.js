// --- ESTADO Y ALMACENAMIENTO ---
function obtenerCarrito() {
    const carrito = localStorage.getItem("carrito");
    return carrito ? JSON.parse(carrito) : [];
}

function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarBadge();
    renderizarCarrito();
}

function crearProductoHTML(producto, index) {
    const urlDetalle = `${window.location.origin}/detalle.html?id=${producto.id}`;
    const loading = index < (window.innerWidth <= 768 ? 2 : 4) ? "eager" : "lazy";
    const fetchPriority = index === 0 ? "high" : "auto";

    return `
        <div class="product-card">
            <a href="detalle.html?id=${producto.id}" class="product-card__cover-link" aria-label="Ver detalle de ${producto.nombre}"></a>
            <div class="product-card__image">
                <img src="${producto.imagen}" alt="${producto.nombre}" loading="${loading}" fetchpriority="${fetchPriority}" decoding="async" width="400" height="400">
            </div>
            <h3>${producto.nombre}</h3>
            <p class="price">S/ ${producto.precio.toFixed(2)} <span>*</span></p>
            <p class="price-note">* Precio unitario</p>
            <div class="product-card__actions">
                <button type="button" class="btn btn--outline-sm" data-id="${producto.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg> Agregar
                </button>
                <button type="button" class="btn btn--whatsapp-sm" data-nombre="${producto.nombre}" data-url="${urlDetalle}">
                    <svg viewBox="0 0 16 16" fill="none" width="20" height="20"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.33335 8C2.33335 4.86799 4.86797 2.33333 8 2.33333C11.132 2.33333 13.6667 4.86799 13.6667 8C13.6667 11.132 11.132 13.6667 8 13.6667C6.88522 13.6667 5.85102 13.3455 4.97521 12.7907C4.81227 12.6875 4.61273 12.6599 4.4279 12.7151L2.50513 13.2879L3.22782 11.5969C3.31324 11.397 3.29587 11.1681 3.18125 10.3367C2.6438 9.47062 2.33335 8.44929 2.33335 8ZM8 1C4.13401 1 1 4.13401 1 8C1 9.22542 1.31544 10.3789 1.86976 11.3817L0.720315 14.0713C0.618698 14.3091 0.66374 14.5842 0.835882 14.7771C1.00802 14.97 1.27621 15.0461 1.52399 14.9721L4.52361 14.077C5.54564 14.6644 6.7358 15 8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1ZM9.52834 9.45495L8.65222 10.0721C8.24187 9.83832 7.78822 9.51206 7.33313 9.05697C6.86005 8.58389 6.50935 8.09555 6.25075 7.64753L6.80755 7.17493C7.04649 6.97216 7.11187 6.63022 6.96468 6.35352L6.25523 5.02019C6.1597 4.84065 5.98747 4.71454 5.78744 4.67769C5.58742 4.64085 5.38154 4.69733 5.22831 4.83106L5.01797 5.01463C4.51216 5.4561 4.213 6.1782 4.46094 6.91609C4.71799 7.67756 5.26656 8.876 6.39568 10.0051C7.60608 11.2155 8.83422 11.6917 9.55243 11.8766C10.1311 12.0255 10.6787 11.8258 11.0645 11.5114L11.4589 11.1901C11.6275 11.0527 11.7185 10.8416 11.7026 10.6246C11.6868 10.4076 11.5659 10.212 11.379 10.1006L10.2599 9.43394C10.0341 9.29935 9.75017 9.30985 9.52834 9.45495Z" fill="#ffffff"></path></svg> Cotizar
                </button>
            </div>
        </div>
    `;
}

// --- MENÚ HAMBURGUESA ---
const burger = document.getElementById("burger");
const mobileNav = document.getElementById("mobile-nav");

function closeMenu() {
    mobileNav?.classList.remove("open");
    if (burger) {
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
    }
}

if (burger && mobileNav) {
    burger.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = mobileNav.classList.toggle("open");
        burger.classList.toggle("open");
        burger.setAttribute("aria-expanded", isOpen);
    });

    document.querySelectorAll(".mobile-nav__link").forEach(link => link.addEventListener("click", closeMenu));
    document.addEventListener("click", (e) => {
        if (mobileNav.classList.contains("open") && !mobileNav.contains(e.target) && !burger.contains(e.target)) closeMenu();
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && mobileNav.classList.contains("open")) closeMenu(); });
}

// --- ANIMACIÓN FLY TO CART ---
function animarParticulaAlCarrito(botonOrigen, cantidad = 1) {
    const carritoFloat = document.querySelector('.cart-float');
    if (!carritoFloat || !botonOrigen) return;

    const rectBoton = botonOrigen.getBoundingClientRect();
    const rectCarrito = carritoFloat.getBoundingClientRect();

    const particula = document.createElement('div');
    particula.classList.add('cart-fly-particle');
    particula.textContent = `+${cantidad}`;

    const startX = rectBoton.left + rectBoton.width / 2 - 12;
    const startY = rectBoton.top + rectBoton.height / 2 - 12;

    particula.style.left = `${startX}px`;
    particula.style.top = `${startY}px`;
    document.body.appendChild(particula);

    const targetX = rectCarrito.left + rectCarrito.width / 2 - 12;
    const targetY = rectCarrito.top + rectCarrito.height / 2 - 12;

    requestAnimationFrame(() => {
        particula.style.transform = `translate(${targetX - startX}px, ${targetY - startY}px) scale(0.3)`;
        particula.style.opacity = '0.3';
    });

    setTimeout(() => {
        particula.remove();
        carritoFloat.classList.add('bounce');
        setTimeout(() => carritoFloat.classList.remove('bounce'), 500);
    }, 600);
}

// --- MODIFICACIÓN DE DATOS DEL CARRITO ---
window.agregarAlCarrito = function (producto, cantidadAgregada = 1) {
    let carrito = obtenerCarrito();
    const pExistente = carrito.find(p => p.id === producto.id);
    if (pExistente) pExistente.cantidad += cantidadAgregada;
    else carrito.push({ ...producto, cantidad: cantidadAgregada });

    guardarCarrito(carrito);
};

window.cambiarCantidad = function (id, nuevaCantidad) {
    let cantidad = Number(nuevaCantidad);
    if (isNaN(cantidad)) cantidad = 1;

    if (cantidad <= 0) eliminarDelCarrito(id);
    else {
        let carrito = obtenerCarrito();
        const producto = carrito.find(p => p.id === Number(id));
        if (producto) {
            producto.cantidad = cantidad;
            guardarCarrito(carrito);
        }
    }
};

window.eliminarDelCarrito = function (id) {
    guardarCarrito(obtenerCarrito().filter(p => p.id !== Number(id)));
};

// --- RENDERIZADO DEL CARRITO ---
function renderizarCarrito() {
    const carrito = obtenerCarrito();

    const itemsContainer = document.getElementById("cart-items-container");
    const emptyState = document.getElementById("cart-empty-state");
    const totalSpan = document.getElementById("cart-total");
    const pageItemsContainer = document.getElementById("page-cart-items");
    const pageEmptyState = document.getElementById("page-cart-empty");

    const totalUnidades = carrito.reduce((sum, p) => sum + p.cantidad, 0);
    if (totalSpan) totalSpan.textContent = `${totalUnidades} ${totalUnidades === 1 ? 'unidad' : 'unidades'}`;

    // A. Panel Lateral
    if (itemsContainer && emptyState) {
        const estaVacio = carrito.length === 0;
        itemsContainer.style.display = estaVacio ? "none" : "block";
        emptyState.style.display = estaVacio ? "flex" : "none";

        if (!estaVacio) {
            itemsContainer.innerHTML = carrito.map(p => `
                <div class="cart-item">
                    <div class="cart-item__img"><img src="${p.imagen}" alt="${p.nombre}"></div>
                    <div class="cart-item__info">
                        <p class="cart-item__name">${p.nombre}</p>
                        <div class="cart-item__controls">
                            <button class="qty-btn" onclick="cambiarCantidad(${p.id}, ${p.cantidad - 1})">-</button>
                            <input type="number" class="qty-input-cart" value="${p.cantidad}" min="1" onchange="cambiarCantidad(${p.id}, this.value)">
                            <button class="qty-btn" onclick="cambiarCantidad(${p.id}, ${p.cantidad + 1})">+</button>
                        </div>
                    </div>
                    <div class="cart-item__actions">
                        <button class="delete-btn" onclick="eliminarDelCarrito(${p.id})">🗑️</button>
                    </div>
                </div>
            `).join("");
        }
    }

    // B. Página Principal del Carrito
    if (pageItemsContainer) {
        const estaVacio = carrito.length === 0;
        pageItemsContainer.style.display = estaVacio ? "none" : "block";
        if (pageEmptyState) pageEmptyState.style.display = estaVacio ? "block" : "none";

        if (!estaVacio) {
            pageItemsContainer.innerHTML = carrito.map(p => `
                <article class="cart-item">
                    <button class="btn-delete" aria-label="Eliminar producto" onclick="eliminarDelCarrito(${p.id})">🗑️</button>
                    <div class="item-image"><img src="${p.imagen}" alt="${p.nombre}"></div>
                    <h3 class="item-title">${p.nombre}</h3>
                    <div class="item-quantity">
                        <span class="qty-label">CANTIDAD</span>
                        <div class="qty-controls">
                            <button class="btn-minus" type="button" onclick="cambiarCantidad(${p.id}, ${p.cantidad - 1})">−</button>
                            <input type="number" class="qty-input" value="${p.cantidad}" min="1" onchange="cambiarCantidad(${p.id}, this.value)">
                            <button class="btn-plus" type="button" onclick="cambiarCantidad(${p.id}, ${p.cantidad + 1})">+</button>
                        </div>
                    </div>
                </article>
            `).join("");
        }
    }
}

// --- ACTUALIZAR BADGE DE FORMA SEGURA ---
function actualizarBadge() {
    const totalItems = obtenerCarrito().reduce((total, p) => total + p.cantidad, 0);
    const badge = document.querySelector(".cart-float__badge");
    const badgeNav = document.querySelector(".quote-badge");

    if (badgeNav) badgeNav.textContent = totalItems;
    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? "flex" : "none";
    }
}

// --- CONTADORES Y DELEGACIÓN DE EVENTOS GLOBAL ---
document.addEventListener("click", (e) => {
    // 1. Agregar al carrito
    const btnAgregar = e.target.closest(".btn--outline-sm");
    if (btnAgregar) {
        e.preventDefault();
        const id = Number(btnAgregar.dataset.id);
        const lista = typeof productos !== "undefined" ? productos : (typeof productosGlobal !== "undefined" ? productosGlobal : []);
        const producto = lista.find(p => p.id === id);

        if (producto) {
            let cantidadDeseada = 1;
            if (btnAgregar.classList.contains("btn-principal-detalle")) {
                cantidadDeseada = Number(document.querySelector("#qty-input")?.value) || 1;
            } else {
                cantidadDeseada = Number(btnAgregar.closest(".product-card")?.querySelector(".input-cantidad")?.value) || 1;
            }

            agregarAlCarrito(producto, cantidadDeseada);
            animarParticulaAlCarrito(btnAgregar, cantidadDeseada);

            const contenidoOriginal = btnAgregar.innerHTML;
            btnAgregar.innerHTML = "✓ ¡Agregado!";
            btnAgregar.style.backgroundColor = "#22c55e";
            btnAgregar.style.color = "#ffffff";
            btnAgregar.style.borderColor = "#22c55e";
            btnAgregar.disabled = true;

            setTimeout(() => {
                btnAgregar.innerHTML = contenidoOriginal;
                btnAgregar.style.backgroundColor = "";
                btnAgregar.style.color = "";
                btnAgregar.style.borderColor = "";
                btnAgregar.disabled = false;
            }, 800);
        }
        return;
    }

    // 2. Botón WhatsApp
    const btnWsp = e.target.closest(".btn--whatsapp-sm");
    if (btnWsp) {
        e.preventDefault();
        const nombre = btnWsp.dataset.nombre || "Producto";
        const urlProducto = btnWsp.dataset.url || window.location.href;
        const mensaje = encodeURIComponent(`Hola, estoy interesado en el producto: ${nombre}.\nEnlace del producto: ${urlProducto}\n¿Tienen stock disponible?`);
        window.open(`https://wa.me/51978689577?text=${mensaje}`, "_blank");
        return;
    }

    // 3. Botones + / -
    const btnMenos = e.target.closest(".qty-btn-minus, .btn-restar");
    const btnMas = e.target.closest(".qty-btn-plus, .btn-sumar");
    if (btnMenos || btnMas) {
        const contenedor = e.target.closest(".qty-selector, .product-detail-card, .product-card") || e.target.parentElement;
        const input = contenedor?.querySelector("input[type='number']");
        if (input) {
            let val = Number(input.value) || 1;
            input.value = btnMenos ? Math.max(1, val - 1) : val + 1;
        }
    }
});

// --- PANEL LATERAL Y WHATSAPP GENERAL ---
const panel = document.getElementById("cart-panel");
const openBtn = document.querySelector(".cart-float");
const closeBtn = document.getElementById("cart-close-btn");

openBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (panel) panel.style.transform = "translateX(0)";
    renderizarCarrito();
});

closeBtn?.addEventListener("click", () => {
    if (panel) panel.style.transform = "translateX(100%)";
});

document.addEventListener("click", (e) => {
    if (panel && (panel.style.transform === "translateX(0px)" || panel.style.transform === "translateX(0)")) {
        const fueDentro = !e.target.isConnected || panel.contains(e.target);
        const fueBotonAbrir = openBtn && openBtn.contains(e.target);
        if (!fueDentro && !fueBotonAbrir) panel.style.transform = "translateX(100%)";
    }
});

document.getElementById("btn-whatsapp-cart")?.addEventListener("click", () => {
    const carrito = obtenerCarrito();
    if (carrito.length === 0) return alert("El carrito está vacío");

    let mensaje = "Hola, quiero cotizar mi carrito:\n\n";
    let totalUnidades = 0;
    carrito.forEach(p => {
        mensaje += `- ${p.nombre} (x${p.cantidad})\n`;
        totalUnidades += p.cantidad;
    });
    mensaje += `\nTotal a cotizar: ${totalUnidades} productos`;
    window.open(`https://wa.me/51978689577?text=${encodeURIComponent(mensaje)}`, "_blank");
});

// --- INICIALIZACIÓN ---
actualizarBadge();
renderizarCarrito();