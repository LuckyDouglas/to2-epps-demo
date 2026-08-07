// ==========================================
// ENVÍO DE FORMULARIO A WHATSAPP
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const formCotizacion = document.getElementById("form-cotizacion");

    if (formCotizacion) {
        formCotizacion.addEventListener("submit", (e) => {
            e.preventDefault(); // Evita que la página se recargue

            // Identificar qué botón disparó el submit
            const submitter = e.submitter;
            
            if (submitter && submitter.id === "btn-submit-whatsapp") {
                enviarCotizacionWhatsApp();
            } else if (submitter && submitter.id === "btn-submit-email") {
                enviarCotizacionCorreo();
            }
        });
    }


    function enviarCotizacionWhatsApp() {
        // 1. Validar que el carrito tenga productos
        const carrito = obtenerCarrito();
        if (carrito.length === 0) {
            alert("Tu carrito está vacío. Agrega productos antes de cotizar.");
            return;
        }

        // 2. Obtener los valores del formulario
        const nombres = document.getElementById("nombres").value.trim();
        const telefono = document.getElementById("telefono").value.trim();
        const correo = document.getElementById("correo").value.trim();
        // Si no escriben documento, lo dejamos vacío o ponemos "No especificado"
        const documento = document.getElementById("documento").value.trim() || "No especificado"; 

        // 3. Procesar los productos del carrito
        let listaProductos = [];
        let totalUnidades = 0;

        carrito.forEach(producto => {
            // Formato: Nombre del Producto (x2)
            listaProductos.push(`${producto.nombre} (x${producto.cantidad})`);
            totalUnidades += producto.cantidad;
        });

        // Unimos los productos con el separador de guion (" - ")
        const productosTexto = listaProductos.join(" - ");

        // 4. Generar un número de referencia aleatorio de 4 dígitos
        const refCotizacion = Math.floor(1000 + Math.random() * 9000);

        // 5. Construir el mensaje con el formato exacto (usando saltos de línea para que se lea mejor en la app)
        const mensaje = `Hola, quiero solicitar una cotización.\n` +
                        `Cliente: ${nombres}\n` +
                        `Teléfono: ${telefono}\n` +
                        `Correo: ${correo}\n` +
                        `Documento (DNI/RUC): ${documento}\n` +
                        `Productos: ${productosTexto}\n` +
                        `Total a cotizar: ${totalUnidades} productos\n` +
                        `Ref. cotización #${refCotizacion}`;

        // 6. Enviar a la API de WhatsApp
        const numeroWhatsApp = "51917989472"; // Reemplaza con tu número si es diferente
        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
        
        window.open(url, "_blank");
    }
    function enviarCotizacionCorreo() {
        // 1. Validar que el carrito tenga productos
        const carrito = window.obtenerCarrito();
        if (carrito.length === 0) {
            alert("Tu carrito está vacío. Agrega productos antes de cotizar.");
            return;
        }

        // 2. Obtener los valores del formulario
        const nombres = document.getElementById("nombres").value.trim();
        const telefono = document.getElementById("telefono").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const documento = document.getElementById("documento").value.trim() || "No especificado"; 

        // 3. Procesar los productos del carrito
        let listaProductos = [];
        let totalUnidades = 0;

        carrito.forEach(producto => {
            listaProductos.push(`${producto.nombre} (x${producto.cantidad})`);
            totalUnidades += producto.cantidad;
        });

        const productosTexto = listaProductos.join(" - ");
        const refCotizacion = Math.floor(1000 + Math.random() * 9000);

        // 4. Construir el cuerpo del mensaje
        const mensaje = `Hola, quiero solicitar una cotización.\n\n` +
                        `Cliente: ${nombres}\n` +
                        `Teléfono: ${telefono}\n` +
                        `Correo: ${correo}\n` +
                        `Documento (DNI/RUC): ${documento}\n\n` +
                        `Productos: ${productosTexto}\n` +
                        `Total a cotizar: ${totalUnidades} productos\n\n` +
                        `Ref. cotización #${refCotizacion}`;

        // 5. Configurar los datos del correo
        const correoDestino = "tu-correo@ejemplo.com"; // REEMPLAZA CON TU CORREO
        const asunto = `Cotización TO2-EPPS #${refCotizacion} - ${nombres}`;
        
        // 6. Crear el enlace mailto y abrirlo
        const url = `mailto:${correoDestino}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(mensaje)}`;
        
        // Usamos location.href en lugar de window.open para que abra la app de correo fluidamente
        window.location.href = url;
    }
});