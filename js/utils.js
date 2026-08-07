    // ==========================================
    // FUNCIONES DEL CARRITO
    // ==========================================

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

    // Las primeras 4 imágenes se cargan normalmente.
    // Las demás se cargan de forma diferida.
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


    // ==========================================
    // MENÚ HAMBURGUESA
    // ==========================================

    const burger = document.getElementById("burger");
    const mobileNav = document.getElementById("mobile-nav");

    function closeMenu() {
        if (mobileNav) {
            mobileNav.classList.remove("open");
        }

        if (burger) {
            burger.classList.remove("open");
            burger.setAttribute("aria-expanded", "false");
        }
    }

    if (burger && mobileNav) {

        // Abrir / cerrar menú
        burger.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = mobileNav.classList.toggle("open");
            burger.classList.toggle("open");
            burger.setAttribute("aria-expanded", isOpen);
        });

        // Cerrar al pulsar un enlace
        document
            .querySelectorAll(".mobile-nav__link")
            .forEach(link => {
                link.addEventListener("click", closeMenu);
            });

        // Cerrar al hacer clic fuera
        document.addEventListener("click", (e) => {
            if (
                mobileNav.classList.contains("open") &&
                !mobileNav.contains(e.target) &&
                !burger.contains(e.target)
            ) {
                closeMenu();
            }
        });

        // Cerrar con Escape
        document.addEventListener("keydown", (e) => {
            if (
                e.key === "Escape" &&
                mobileNav.classList.contains("open")
            ) {
                closeMenu();
            }
        });
    }

    // ==========================================
// FUNCIÓN: ANIMACIÓN "FLY TO CART" (+1 VOLADOR)
// ==========================================
function animarParticulaAlCarrito(botonOrigen, cantidad = 1) {
    const carritoFloat = document.querySelector('.cart-float');
    if (!carritoFloat || !botonOrigen) return;

    // 1. Obtener coordenadas del botón y del carrito flotante
    const rectBoton = botonOrigen.getBoundingClientRect();
    const rectCarrito = carritoFloat.getBoundingClientRect();

    // 2. Crear la partícula (+1)
    const particula = document.createElement('div');
    particula.classList.add('cart-fly-particle');
    particula.textContent = `+${cantidad}`;

    // 3. Posicionar al inicio (centro del botón presionado)
    const startX = rectBoton.left + rectBoton.width / 2 - 12;
    const startY = rectBoton.top + rectBoton.height / 2 - 12;

    particula.style.left = `${startX}px`;
    particula.style.top = `${startY}px`;

    document.body.appendChild(particula);

    // 4. Coordenadas destino (centro del botón flotante)
    const targetX = rectCarrito.left + rectCarrito.width / 2 - 12;
    const targetY = rectCarrito.top + rectCarrito.height / 2 - 12;

    // 5. Iniciar traslación
    requestAnimationFrame(() => {
        particula.style.transform = `translate(${targetX - startX}px, ${targetY - startY}px) scale(0.3)`;
        particula.style.opacity = '0.3';
    });

    // 6. Al terminar el recorrido, hacer rebotar el botón del carrito y remover la partícula
    setTimeout(() => {
        particula.remove();
        carritoFloat.classList.add('bounce');
        setTimeout(() => carritoFloat.classList.remove('bounce'), 500);
    }, 600);
}



// ==========================================
    // AGREGAR PRODUCTO (LÓGICA CARRITO - SOLO DATOS)
    // ==========================================

    window.agregarAlCarrito = function(producto, cantidadAgregada = 1) {
        let carrito = obtenerCarrito();
        const productoExistente = carrito.find(p => p.id === producto.id);

        if (productoExistente) {
            productoExistente.cantidad += cantidadAgregada;
        } else {
            carrito.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                imagen: producto.imagen,
                cantidad: cantidadAgregada
            });
        }
        
        guardarCarrito(carrito);
        console.log(`✅ ${producto.nombre} agregado al carrito (${cantidadAgregada} unidades)`);
    };


    // ==========================================
    // EVENTOS: BOTÓN "AGREGAR AL CARRITO" (ANIMACIÓN Y LÓGICA)
    // ==========================================

    document.addEventListener("click", (e) => {
        const boton = e.target.closest(".btn--outline-sm");
        if (!boton) return;

        e.preventDefault();
        const id = Number(boton.dataset.id);
        let producto = null;

        // 1. BUSCAR EL PRODUCTO DEPENDIENDO DE LA PÁGINA
        if (typeof productos !== "undefined") {
            producto = productos.find(p => p.id === id);
        } else if (typeof productosGlobal !== "undefined") {
            producto = productosGlobal.find(p => p.id === id);
        }

        if (!producto) {
            console.error("❌ No se encontró el producto con ID:", id);
            return;
        }

        // 2. DETERMINAR LA CANTIDAD DESEADA (Por defecto 1)
        let cantidadDeseada = 1; 

        if (boton.classList.contains("btn-principal-detalle")) {
            const inputCantidadDetalle = document.querySelector("#qty-input");
            if (inputCantidadDetalle) {
                cantidadDeseada = Number(inputCantidadDetalle.value);
            }
        } 
        else {
            const tarjeta = boton.closest(".product-card"); 
            if (tarjeta) {
                const inputCantidadTarjeta = tarjeta.querySelector(".input-cantidad");
                if (inputCantidadTarjeta) {
                    cantidadDeseada = Number(inputCantidadTarjeta.value);
                }
            }
        }

        // 3. ENVIAR AL CARRITO (Aquí llamamos a la función de arriba)
        agregarAlCarrito(producto, cantidadDeseada);

        // 4. 🌟 DISPARAR ANIMACIÓN DEL CÍRCULO VOLADOR
        animarParticulaAlCarrito(boton, cantidadDeseada);

        // 5. 🌟 FEEDBACK VISUAL EN EL BOTÓN PRESIONADO
        const contenidoOriginal = boton.innerHTML;
        boton.innerHTML = "✓ ¡Agregado!";
        boton.style.backgroundColor = "#22c55e";
        boton.style.color = "#ffffff";
        boton.style.borderColor = "#22c55e";
        boton.disabled = true;

        setTimeout(() => {
            boton.innerHTML = contenidoOriginal;
            boton.style.backgroundColor = "";
            boton.style.color = "";
            boton.style.borderColor = "";
            boton.disabled = false;
        }, 800);
    });





    // ==========================================
    // EVENTOS: BOTÓN "COTIZAR" GLOBAL
    // ==========================================
// Listener global para WhatsApp
document.addEventListener("click", (e) => {
    const boton = e.target.closest(".btn--whatsapp-sm");
    if (!boton) return;

    e.preventDefault();

    // Obtiene el nombre y la URL desde los dataset del botón
    const nombre = boton.dataset.nombre || "Producto";
    const urlProducto = boton.dataset.url || window.location.href;

    const telefono = "51917989472";
    const mensaje = encodeURIComponent(
        `Hola, estoy interesado en el producto: ${nombre}.\n` +
        `Enlace del producto: ${urlProducto}\n` +
        `¿Tienen stock disponible?`
    );

    window.open(`https://wa.me/${telefono}?text=${mensaje}`, "_blank");
});


// ==========================================
    // CAMBIAR CANTIDAD EN EL CARRITO (UNIFICADO)
    // ==========================================
    window.cambiarCantidad = function(id, nuevaCantidad) {
        let cantidad = Number(nuevaCantidad);

        // Si el usuario escribe letras o deja el campo vacío, se asigna 1
        if (isNaN(cantidad)) {
            cantidad = 1;
        }

        let carrito = obtenerCarrito();
        const producto = carrito.find(p => p.id === Number(id));

        if (!producto) return;

        // Si al restar la cantidad llega a 0 o menos, elimina el producto
        if (cantidad <= 0) {
            eliminarDelCarrito(id);
        } else {
            producto.cantidad = cantidad;
            guardarCarrito(carrito);
        }
    };


    // ==========================================
    // ELIMINAR PRODUCTO DEL CARRITO
    // ==========================================

    window.eliminarDelCarrito = function(id) {
        let carrito = obtenerCarrito();
        carrito = carrito.filter(p => p.id !== Number(id));
        guardarCarrito(carrito);
    };


// ==========================================
    // RENDERIZAR CARRITO (PANEL LATERAL Y PÁGINA)
    // ==========================================

    function renderizarCarrito() {
        const carrito = obtenerCarrito();
        
        // Elementos del Panel Lateral (Tus IDs)
        const itemsContainer = document.getElementById("cart-items-container");
        const emptyState = document.getElementById("cart-empty-state");
        const totalSpan = document.getElementById("cart-total");

        // Elementos de la Página Principal del Carrito
        const pageItemsContainer = document.getElementById("page-cart-items");
        const pageEmptyState = document.getElementById("page-cart-empty");

        // Calculamos el total de unidades
        const totalUnidades = carrito.reduce((sum, p) => sum + p.cantidad, 0);

        // Actualizamos el contador del panel lateral
        if (totalSpan) {
            totalSpan.textContent = `${totalUnidades} ${totalUnidades === 1 ? 'unidad' : 'unidades'}`;
        }

        // ----------------------------------------------------
        // A. RENDERIZAR PANEL LATERAL
        // ----------------------------------------------------
        if (itemsContainer && emptyState) {
            if (carrito.length === 0) {
                itemsContainer.style.display = "none";
                emptyState.style.display = "flex";
            } else {
                itemsContainer.style.display = "block";
                emptyState.style.display = "none";

                let htmlPanel = "";
                carrito.forEach(producto => {
                    htmlPanel += `
                        <div class="cart-item">
                            <div class="cart-item__img">
                                <img src="${producto.imagen}" alt="${producto.nombre}">
                            </div>

                            <div class="cart-item__info">
                                <p class="cart-item__name">${producto.nombre}</p>

                                <div class="cart-item__controls">
                                    <button class="qty-btn" onclick="cambiarCantidad(${producto.id}, ${producto.cantidad - 1})">-</button>
                                    <input 
                                        type="number" 
                                        class="qty-input-cart" 
                                        value="${producto.cantidad}" 
                                        min="1"
                                        onchange="cambiarCantidad(${producto.id}, this.value)"
                                    >
                                    <button class="qty-btn" onclick="cambiarCantidad(${producto.id}, ${producto.cantidad + 1})">+</button>
                                </div>
                            </div>

                            <div class="cart-item__actions">
                                <button
                                    class="delete-btn"
                                    onclick="eliminarDelCarrito(${producto.id})"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    `;
                });
                itemsContainer.innerHTML = htmlPanel;
            }
        }

        // ----------------------------------------------------
        // B. RENDERIZAR PÁGINA PRINCIPAL DEL CARRITO
        // ----------------------------------------------------
        if (pageItemsContainer) {
            if (carrito.length === 0) {
                pageItemsContainer.style.display = "none";
                if (pageEmptyState) pageEmptyState.style.display = "block";
            } else {
                pageItemsContainer.style.display = "block";
                if (pageEmptyState) pageEmptyState.style.display = "none";

                let htmlPagina = "";
                carrito.forEach(producto => {
                    htmlPagina += `
                        <article class="cart-item">
                            <button 
                                class="btn-delete" 
                                aria-label="Eliminar producto"
                                onclick="eliminarDelCarrito(${producto.id})"
                            >
                                🗑️
                            </button>

                            <div class="item-image">
                                <img src="${producto.imagen}" alt="${producto.nombre}">
                            </div>

                            <h3 class="item-title">${producto.nombre}</h3>

                            <div class="item-quantity">
                                <span class="qty-label">CANTIDAD</span>
                                <div class="qty-controls">
                                    <button 
                                        class="btn-minus" 
                                        type="button"
                                        onclick="cambiarCantidad(${producto.id}, ${producto.cantidad - 1})"
                                    >−</button>
                                    <input 
                                        type="number" 
                                        class="qty-input" 
                                        value="${producto.cantidad}" 
                                        min="1"
                                        onchange="cambiarCantidad(${producto.id}, this.value)"
                                    >
                                    <button 
                                        class="btn-plus" 
                                        type="button"
                                        onclick="cambiarCantidad(${producto.id}, ${producto.cantidad + 1})"
                                    >+</button>
                                </div>
                            </div>
                        </article>
                    `;
                });
                pageItemsContainer.innerHTML = htmlPagina;
            }
        }
    }

// ==========================================
    // CONTADOR GLOBAL (+ / - Y ESCRITURA MANUAL)
    // ==========================================
    document.addEventListener("click", (e) => {
        const btnMenos = e.target.closest(".qty-btn-minus, .btn-restar");
        const btnMas = e.target.closest(".qty-btn-plus, .btn-sumar");

        if (!btnMenos && !btnMas) return;

        // Buscamos el contenedor del contador o la tarjeta padre
        const contenedor = e.target.closest(".qty-selector, .product-detail-card, .product-card") || e.target.parentElement;
        const input = contenedor ? contenedor.querySelector("input[type='number']") : null;

        if (!input) return;

        let cantidadActual = Number(input.value) || 1;

        if (btnMenos) {
            input.value = Math.max(1, cantidadActual - 1);
        } else if (btnMas) {
            input.value = cantidadActual + 1;
        }
    });

    // ==========================================
    // BADGE DEL CARRITO
    // ==========================================

    function actualizarBadge() {
        const carrito = obtenerCarrito();
        const totalItems = carrito.reduce((total, producto) => total + producto.cantidad, 0);
        const badge = document.querySelector(".cart-float__badge");
        const badgeNav = document.querySelector(".quote-badge");

        if (!badge) return;
        badgeNav.textContent = totalItems;
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? "flex" : "none";
    }


// ==========================================
// PANEL DEL CARRITO
// ==========================================

const panel = document.getElementById("cart-panel");
const openBtn = document.querySelector(".cart-float");
const closeBtn = document.getElementById("cart-close-btn");


if (openBtn && panel) {
    openBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation(); // 👈 Evita que el clic del botón se propague al document
        panel.style.transform = "translateX(0)";
        renderizarCarrito();
    });
}

if (closeBtn && panel) {
    closeBtn.addEventListener("click", () => {
        panel.style.transform = "translateX(100%)";
    });
}


// 🌟 Cerrar al hacer clic fuera del panel
document.addEventListener("click", (e) => {
    if (!panel) return;

    // Evaluamos correctamente si el panel está abierto
    const isOpen = panel.style.transform === "translateX(0px)" || panel.style.transform === "translateX(0)";

    if (isOpen) {
        // !e.target.isConnected detecta si el elemento fue eliminado del DOM por renderizarCarrito() al presionar +, - o eliminar
        const fueDentroDelPanel = !e.target.isConnected || panel.contains(e.target);
        const fueBotonAbrir = openBtn && openBtn.contains(e.target);

        if (!fueDentroDelPanel && !fueBotonAbrir) {
            panel.style.transform = "translateX(100%)";
        }
    }
});


 // ==========================================
    // WHATSAPP GENERAL DEL CARRITO
    // ==========================================

    const whatsappBtn = document.getElementById("btn-whatsapp-cart");

    if (whatsappBtn) {
        whatsappBtn.addEventListener("click", generarMensajeWhatsApp);
    }

    function generarMensajeWhatsApp() {
        const carrito = obtenerCarrito();

        if (carrito.length === 0) {
            alert("El carrito está vacío");
            return;
        }

        let mensaje = "Hola, quiero cotizar mi carrito:\n\n";
        let totalUnidades = 0;

        carrito.forEach(producto => {
            // Solo se envía el nombre y la cantidad
            mensaje += `- ${producto.nombre} (x${producto.cantidad})\n`;
            totalUnidades += producto.cantidad;
        });

        // Se agrega el total de unidades solicitadas al final del mensaje
        mensaje += `\nTotal a cotizar: ${totalUnidades} productos`;
        const url = `https://wa.me/51917989472?text=${encodeURIComponent(mensaje)}`; // Asegúrate de colocar bien tu número
        window.open(url, "_blank");
    }

    // ==========================================
    // INICIALIZAR CARRITO AL CARGAR LA PÁGINA
    // ==========================================

    actualizarBadge();
    renderizarCarrito();

