  let productos = [];
  
document.addEventListener("DOMContentLoaded", () => {

// ==========================================
// CREAR TARJETA DE PRODUCTO
// ==========================================

function crearProductoHTML(producto) {

    return `
        <div class="product-card">

            <!-- Enlace invisible que cubre TODA la tarjeta -->
            <a href="detalle.html?id=${producto.id}" class="product-card__cover-link" aria-label="Ver detalle de ${producto.nombre}"></a>

            <div class="product-card__image">
                <img
                    src="${producto.imagen}"
                    alt="${producto.nombre}"
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
                        class="cart-icon"
                    >
                        <circle cx="8" cy="21" r="1"/>
                        <circle cx="19" cy="21" r="1"/>
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                    </svg>
                    Agregar
                </button>

                <a
                    href="https://wa.me/tu_numero"
                    target="_blank"
                    class="btn btn--whatsapp-sm"
                    data-id="${producto.id}"
                >
                    ☎ Cotizar por mayor
                </a>

            </div>

        </div>
    `;
}


  // ==========================================
  // CARGAR PRODUCTOS DESDE JSON
  // ==========================================

  function cargarProductos() {

    const grid = document.getElementById("productGrid");

    if (!grid) {
      console.error("❌ No se encontró #productGrid");
      return;
    }

    fetch("data/productos.json")

      .then(response => {

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        return response.json();
      })

      .then(data => {

        // Guardamos TODOS los productos
        productos = data;

        // Solo mostramos destacados
        const destacados = productos.filter(
          producto => producto.destacado === true
        );

        if (destacados.length === 0) {

          grid.innerHTML = `
                        <p style="text-align:center; padding:20px;">
                            No hay productos destacados en este momento.
                        </p>
                    `;

          return;
        }

        // Generamos las tarjetas
        grid.innerHTML = destacados
          .map(producto => crearProductoHTML(producto))
          .join("");

        console.log("✅ Productos destacados cargados");

      })

      .catch(error => {

        console.error(
          "❌ Error al cargar productos.json:",
          error
        );

        grid.innerHTML = `
                    <p style="color:red; text-align:center;">
                        Error al cargar los productos.
                        Verifica la consola.
                    </p>
                `;
      });
  }


  // ==========================================
  // INICIAR
  // ==========================================

  cargarProductos();

});