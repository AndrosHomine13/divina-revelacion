// Variable global para almacenar los productos en el carrito
let carrito = [];

// Muestra una notificación breve en pantalla
function mostrarToast(mensaje) {
  const toast = document.getElementById('toast');
  toast.textContent = mensaje;
  toast.classList.add('show');

  // Oculta el toast después de 3 segundos
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Agrega un producto al carrito
function agregarAlCarrito(nombre, precio) {
  carrito.push({ nombre, precio }); // Agrega el producto como objeto
  guardarCarritoEnLocalStorage();   // Guarda el carrito en localStorage
  mostrarToast(`${nombre} agregado al carrito.`); // Notificación
  actualizarCarritoUI();            // Actualiza el HTML del carrito
  actualizarContador();             // Actualiza el contador del icono
}

// Actualiza la interfaz del carrito (modal y sidebar)
function actualizarCarritoUI() {
  const contenedorModal = document.getElementById('modal-carrito-contenedor');
  const contenedorSidebar = document.getElementById('sidebar-carrito-contenedor');

  // Limpia el contenido anterior
  contenedorModal.innerHTML = '';
  contenedorSidebar.innerHTML = '';

  // Si el carrito está vacío, mostrar el mensaje en ambos contenedores
  if (carrito.length === 0) {
    const mensajeVacioModal = document.createElement('p');
    mensajeVacioModal.textContent = 'El carrito está vacío.';
    mensajeVacioModal.style.color = '#888';

    const mensajeVacioSidebar = mensajeVacioModal.cloneNode(true);

    contenedorModal.appendChild(mensajeVacioModal);
    contenedorSidebar.appendChild(mensajeVacioSidebar);
    return;
  }

  let total = 0; // Acumulador para el total

  // Recorre los productos del carrito
  carrito.forEach((item, indice) => {
    // Crea el elemento del producto para el modal
    const divModal = document.createElement('div');
    divModal.className = 'item-carrito';
    divModal.textContent = `${item.nombre} - $${item.precio}`;

    // Clona para usar en el sidebar
    const divSidebar = divModal.cloneNode(true);

    // Crea botón de eliminar para el modal
    const btnEliminarModal = document.createElement('button');
    btnEliminarModal.textContent = '✖';
    btnEliminarModal.style.marginLeft = '10px';
    btnEliminarModal.style.cursor = 'pointer';
    btnEliminarModal.style.border = 'none';
    btnEliminarModal.style.background = 'transparent';
    btnEliminarModal.style.color = '#a26b50';
    btnEliminarModal.style.fontWeight = 'bold';
    btnEliminarModal.onclick = () => eliminarDelCarrito(indice); // Elimina por índice

    // Agrega el botón al producto en el modal
    divModal.appendChild(btnEliminarModal);

    // Botón eliminar para el sidebar (clonado pero con evento propio)
    const btnEliminarSidebar = btnEliminarModal.cloneNode(true);
    btnEliminarSidebar.onclick = () => eliminarDelCarrito(indice);
    divSidebar.appendChild(btnEliminarSidebar);

    // Agrega los productos al DOM
    contenedorModal.appendChild(divModal);
    contenedorSidebar.appendChild(divSidebar);

    total += item.precio; // Suma el precio al total
  });

  // Muestra el total de la compra en el sidebar
  const totalDiv = document.createElement('div');
  totalDiv.className = 'total-carrito';
  totalDiv.style.marginTop = '15px';
  totalDiv.style.fontWeight = 'bold';
  totalDiv.style.borderTop = '1px solid #ccc';
  totalDiv.style.paddingTop = '10px';
  totalDiv.textContent = `Total: $${total}`;

  contenedorSidebar.appendChild(totalDiv);
}

// Elimina un producto del carrito por su índice
function eliminarDelCarrito(indice) {
  carrito.splice(indice, 1);         // Elimina el producto
  guardarCarritoEnLocalStorage();   // Actualiza el localStorage
  actualizarCarritoUI();            // Refresca la UI
  actualizarContador();             // Actualiza el contador
}

// Actualiza el número de ítems en el contador del carrito
function actualizarContador() {
  document.getElementById('contador-carrito').textContent = carrito.length;
}

// Envia el pedido a WhatsApp con el resumen del carrito
function enviarPorWhatsApp() {
  if (carrito.length === 0) {
    alert("El carrito está vacío.");
    return;
  }

  let mensaje = "Hola, quiero estos productos:\n";
  let total = 0;

  carrito.forEach(p => {
    mensaje += `- ${p.nombre} ($${p.precio})\n`;
    total += p.precio;
  });

  mensaje += `\nTotal: $${total}`;

  const telefono = "573123614448"; // Número de destino en WhatsApp
  const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
  window.open(url); // Abre WhatsApp en una nueva pestaña
}

// Abre el sidebar del carrito
function abrirSidebar() {
  document.getElementById("sidebar-carrito").style.width = "300px";
}

// Cierra el sidebar del carrito
function cerrarSidebar() {
  document.getElementById("sidebar-carrito").style.width = "0";
}

// Cierra el sidebar si el usuario hace clic fuera de él
window.onclick = function(event) {
  const sidebar = document.getElementById("sidebar-carrito");
  if (event.target == sidebar) {
    cerrarSidebar();
  }
};

// Guarda el carrito en localStorage
function guardarCarritoEnLocalStorage() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Carga el carrito desde localStorage al iniciar la página
function cargarCarritoDesdeLocalStorage() {
  const carritoGuardado = localStorage.getItem('carrito');
  if (carritoGuardado) {
    carrito = JSON.parse(carritoGuardado);
  }
}

// Ejecuta cuando la página ha terminado de cargar
document.addEventListener('DOMContentLoaded', () => {
  cargarCarritoDesdeLocalStorage(); // Recupera carrito anterior si existe
  actualizarCarritoUI();           // Muestra contenido
  actualizarContador();            // Refresca contador
});