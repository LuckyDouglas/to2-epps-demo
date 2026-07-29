document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // PRODUCTOS DESTACADOS (SOLO PARA INICIO)
    // ==========================================

    function crearProductoHTML(producto) {
        // El asterisco aparece SIEMPRE (es un aviso de precio unitario)
        const asterisco = '<span>*</span>';
        // La etiqueta "Destacado" SOLO si el producto lo es (ya que estamos en la sección de destacados, todos lo son, pero lo dejamos por si acaso)
        const etiqueta = producto.destacado ? '<span class="badge-destacado">★ Destacado</span>' : '';

        return `
    <div class="product-card">
      <div class="product-card__image">
        <img src="${producto.imagen}" alt="${producto.nombre}">
        ${etiqueta}
      </div>
      <h3>${producto.nombre}</h3>
      <p class="price">S/ ${producto.precio.toFixed(2)} ${asterisco}</p>
      <p class="price-note">* Precio unitario</p>
      <div class="product-card__actions">
        <a href="#" class="btn btn--outline-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="cart-icon">
            <circle cx="8" cy="21" r="1"/>
            <circle cx="19" cy="21" r="1"/>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
          </svg>
          Agregar
        </a>
        <a href="#" class="btn btn--whatsapp-sm">☎ Cotizar por mayor</a>
      </div>
    </div>
  `;
    }

    function cargarProductos() {
        const grid = document.getElementById('productGrid');
        if (!grid) {
            console.error('No se encontró el elemento #productGrid');
            return;
        }

        fetch('data/productos.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }
                return response.json();
            })
            .then(productos => {
                // 🔥 FILTRO: SOLO productos con destacado === true
                const destacados = productos.filter(p => p.destacado === true);

                if (destacados.length === 0) {
                    grid.innerHTML = '<p style="text-align:center; padding:20px;">No hay productos destacados en este momento.</p>';
                    return;
                }

                // Renderizar SOLO los destacados
                grid.innerHTML = destacados.map(p => crearProductoHTML(p)).join('');
                console.log('✅ Productos destacados cargados correctamente');
            })
            .catch(error => {
                console.error('❌ Error al cargar productos.json:', error);
                grid.innerHTML = '<p style="color:red; text-align:center;">Error al cargar los productos. Verifica la consola.</p>';
            });
    }

    // ✅ ¡LLAMAR A LA FUNCIÓN PARA QUE SE EJECUTE!
    cargarProductos();










});