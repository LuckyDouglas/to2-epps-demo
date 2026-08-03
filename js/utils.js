document.addEventListener("DOMContentLoaded", () => {

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


    // ==========================================
    // AGREGAR PRODUCTO (LÓGICA CARRITO)
    // ==========================================

    window.agregarAlCarrito = function(producto) {
        let carrito = obtenerCarrito();
        const productoExistente = carrito.find(p => p.id === producto.id);

        if (productoExistente) {
            productoExistente.cantidad += 1;
        } else {
            carrito.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                imagen: producto.imagen,
                cantidad: 1
            });
        }

        guardarCarrito(carrito);
        console.log(`✅ ${producto.nombre} agregado al carrito`);
    };


    // ==========================================
    // EVENTOS: BOTÓN "AGREGAR AL CARRITO" (TARJETAS)
    // ==========================================

    document.addEventListener("click", (e) => {
        const boton = e.target.closest(".btn--outline-sm");
        if (!boton) return;

        e.preventDefault();
        const id = Number(boton.dataset.id);

        // Busca el producto en tu array global "productos"
        const producto = productos.find(p => p.id === id);

        if (!producto) {
            console.error("❌ No se encontró el producto con ID:", id);
            return;
        }

        agregarAlCarrito(producto);
    });


    // ==========================================
    // EVENTOS: BOTÓN "COTIZAR POR MAYOR" (TARJETAS)
    // ==========================================

    document.addEventListener("click", (e) => {
        const boton = e.target.closest(".btn--whatsapp-sm");
        if (!boton) return;

        e.preventDefault();
        const id = Number(boton.dataset.id);

        // Busca el producto en tu array global "productos"
        const producto = productos.find(p => p.id === id);
        if (!producto) return;

        const mensaje =
            `Hola, quiero cotizar por mayor el producto:\n\n` +
            `Producto: ${producto.nombre}\n` +
            `Precio referencial: S/ ${producto.precio.toFixed(2)}`;

        const url = `https://wa.me/519887854321?text=${encodeURIComponent(mensaje)}`;
        window.open(url, "_blank");
    });


    // ==========================================
    // CAMBIAR CANTIDAD EN EL CARRITO
    // ==========================================

    window.cambiarCantidad = function(id, nuevaCantidad) {
        let carrito = obtenerCarrito();
        const producto = carrito.find(p => p.id === Number(id));

        if (!producto) return;

        if (nuevaCantidad <= 0) {
            eliminarDelCarrito(id);
        } else {
            producto.cantidad = nuevaCantidad;
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
    // RENDERIZAR CARRITO
    // ==========================================

    function renderizarCarrito() {
        const carrito = obtenerCarrito();
        const itemsContainer = document.getElementById("cart-items-container");
        const emptyState = document.getElementById("cart-empty-state");
        const totalSpan = document.getElementById("cart-total");

        if (!itemsContainer || !emptyState || !totalSpan) {
            return;
        }

        if (carrito.length === 0) {
            itemsContainer.style.display = "none";
            emptyState.style.display = "flex";
            totalSpan.textContent = "S/ 0.00";
            return;
        }

        itemsContainer.style.display = "block";
        emptyState.style.display = "none";

        let html = "";
        let total = 0;

        carrito.forEach(producto => {
            const subtotal = producto.precio * producto.cantidad;
            total += subtotal;

            html += `
                <div class="cart-item">
                    <div class="cart-item__img">
                        <img src="${producto.imagen}" alt="${producto.nombre}">
                    </div>

                    <div class="cart-item__info">
                        <p class="cart-item__name">${producto.nombre}</p>

                        <div class="cart-item__controls">
                            <button
                                class="qty-btn"
                                onclick="cambiarCantidad(${producto.id}, ${producto.cantidad - 1})"
                            >
                                -
                            </button>

                            <span class="qty-num">${producto.cantidad}</span>

                            <button
                                class="qty-btn"
                                onclick="cambiarCantidad(${producto.id}, ${producto.cantidad + 1})"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div class="cart-item__actions">
                        <span class="cart-item__price">S/ ${subtotal.toFixed(2)}</span>
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

        itemsContainer.innerHTML = html;
        totalSpan.textContent = `S/ ${total.toFixed(2)}`;
    }


    // ==========================================
    // BADGE DEL CARRITO
    // ==========================================

    function actualizarBadge() {
        const carrito = obtenerCarrito();
        const totalItems = carrito.reduce((total, producto) => total + producto.cantidad, 0);
        const badge = document.querySelector(".cart-float__badge");

        if (!badge) return;

        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? "flex" : "none";
    }


    // ==========================================
    // PANEL DEL CARRITO
    // ==========================================

    const panel = document.getElementById("cart-panel");
    const openBtn = document.querySelector(".cart-float");
    const closeBtn = document.getElementById("cart-close-btn");
    const continueBtn = document.getElementById("btn-continue-shopping");

    if (openBtn && panel) {
        openBtn.addEventListener("click", (e) => {
            e.preventDefault();
            panel.style.transform = "translateX(0)";
            renderizarCarrito();
        });
    }

    if (closeBtn && panel) {
        closeBtn.addEventListener("click", () => {
            panel.style.transform = "translateX(100%)";
        });
    }

    if (continueBtn && panel) {
        continueBtn.addEventListener("click", () => {
            panel.style.transform = "translateX(100%)";
        });
    }


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

        let mensaje = "Hola, quiero cotizar los siguientes productos:\n\n";
        let total = 0;

        carrito.forEach(producto => {
            const subtotal = producto.precio * producto.cantidad;
            mensaje += `- ${producto.nombre} (x${producto.cantidad}) = S/ ${subtotal.toFixed(2)}\n`;
            total += subtotal;
        });

        mensaje += `\nTotal: S/ ${total.toFixed(2)}`;
        const url = `https://wa.me/519887854321?text=${encodeURIComponent(mensaje)}`;
        window.open(url, "_blank");
    }


    // ==========================================
    // INICIALIZAR CARRITO AL CARGAR LA PÁGINA
    // ==========================================

    actualizarBadge();
    renderizarCarrito();

});