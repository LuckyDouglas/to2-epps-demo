let productos = [];
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
            productos = data;

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

            // Usa la función definida en main.js
            grid.innerHTML = destacados
                .map((producto, index) => crearProductoHTML(producto, index))
                .join("");

            console.log("✅ Productos destacados cargados");

        })
        .catch(error => {
            console.error("❌ Error al cargar productos.json:", error);

            grid.innerHTML = `
                    <p style="color:red; text-align:center;">
                        Error al cargar los productos. Verifica la consola.
                    </p>
                `;
        });
}

cargarProductos();
