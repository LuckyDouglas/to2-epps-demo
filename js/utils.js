document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. MENÚ HAMBURGUESA
    // ==========================================
    const burger = document.getElementById("burger");
    const mobileNav = document.getElementById("mobile-nav");

    // Definir la función closeMenu ANTES de usarla
    function closeMenu() {
        if (mobileNav) mobileNav.classList.remove("open");
        if (burger) {
            burger.classList.remove("open");
            burger.setAttribute("aria-expanded", "false");
        }
    }

    // Solo configurar el menú si los elementos existen
    if (burger && mobileNav) {
        // 1. Abrir / Cerrar al presionar el botón hamburguesa
        burger.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = mobileNav.classList.toggle("open");
            burger.classList.toggle("open");
            burger.setAttribute("aria-expanded", isOpen);
        });

        // 2. Cerrar al hacer clic en un enlace del menú
        document.querySelectorAll(".mobile-nav__link").forEach((link) => {
            link.addEventListener("click", closeMenu);
        });

        // 3. Cerrar si hace clic fuera del menú desplegado
        document.addEventListener("click", (e) => {
            if (
                mobileNav.classList.contains("open") &&
                !mobileNav.contains(e.target) &&
                !burger.contains(e.target)
            ) {
                closeMenu();
            }
        });

        // 4. (Extra opcional) Cerrar con la tecla Escape, por accesibilidad
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && mobileNav.classList.contains("open")) {
                closeMenu();
            }
        });
    }

});