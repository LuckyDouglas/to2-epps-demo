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

 window.agregarAlCarrito = function(producto, cantidadAgregada = 1) {
    let carrito = obtenerCarrito();
    const productoExistente = carrito.find(p => p.id === producto.id);

    if (productoExistente) {
        // Suma la cantidad que eligió el usuario (por defecto 1)
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
    // EVENTOS: BOTÓN "AGREGAR AL CARRITO" (UNIFICADO PARA TODAS LAS PÁGINAS)
    // ==========================================

    document.addEventListener("click", (e) => {
        const boton = e.target.closest(".btn--outline-sm");
        if (!boton) return;

        e.preventDefault();
        const id = Number(boton.dataset.id);
        let producto = null;

        // 1. BUSCAR EL PRODUCTO DEPENDIENDO DE LA PÁGINA
        // Si estamos en Inicio/Tienda, usamos 'productos'. Si estamos en Detalle, usamos 'productosGlobal'.
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

        // Escenario A: El clic viene de la página de detalle (botón principal)
        if (boton.classList.contains("btn-principal-detalle")) {
            const inputCantidadDetalle = document.querySelector("#qty-input");
            if (inputCantidadDetalle) {
                cantidadDeseada = Number(inputCantidadDetalle.value);
            }
        } 
        // Escenario B: El clic viene de una tarjeta en Inicio/Tienda (preparado para el futuro)
        else {
            const tarjeta = boton.closest(".product-card"); 
            if (tarjeta) {
                const inputCantidadTarjeta = tarjeta.querySelector(".input-cantidad");
                if (inputCantidadTarjeta) {
                    cantidadDeseada = Number(inputCantidadTarjeta.value);
                }
            }
        }

        // 3. ENVIAR AL CARRITO
        agregarAlCarrito(producto, cantidadDeseada);
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
    // VALIDAR (+ / - Y ESCRITURA MANUAL)
    // ==========================================
    window.cambiarCantidad = function(id, nuevaCantidad) {
    let cantidad = Number(nuevaCantidad);
    
    // Si escribe un texto vacío, 0 o un número negativo, se restablece a 1
    if (isNaN(cantidad) || cantidad <= 0) {
        cantidad = 1;
    }

    let carrito = obtenerCarrito();
    const producto = carrito.find(p => p.id === Number(id));

    if (!producto) return;

    producto.cantidad = cantidad;
    guardarCarrito(carrito);
};
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

if (continueBtn && panel) {
    continueBtn.addEventListener("click", () => {
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