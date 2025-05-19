const carrito = [];

function mostrarToast(mensaje) {
  const toast = document.getElementById('toast');
  toast.textContent = mensaje;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function agregarAlCarrito(nombre, precio) {
  carrito.push({ nombre, precio });
  mostrarToast(`${nombre} agregado al carrito.`);
  actualizarCarritoUI();
  actualizarContador();
}

function actualizarCarritoUI() {
  const contenedorModal = document.getElementById('modal-carrito-contenedor');
  const contenedorSidebar = document.getElementById('sidebar-carrito-contenedor');

  // Limpia ambos
  contenedorModal.innerHTML = '';
  contenedorSidebar.innerHTML = '';

  carrito.forEach((item, indice) => {
    const divModal = document.createElement('div');
    divModal.className = 'item-carrito';
    divModal.textContent = `${item.nombre} - $${item.precio}`;

    const divSidebar = divModal.cloneNode(true);

    // Botón eliminar para modal
    const btnEliminarModal = document.createElement('button');
    btnEliminarModal.textContent = '✖';
    btnEliminarModal.style.marginLeft = '10px';
    btnEliminarModal.style.cursor = 'pointer';
    btnEliminarModal.style.border = 'none';
    btnEliminarModal.style.background = 'transparent';
    btnEliminarModal.style.color = '#a26b50';
    btnEliminarModal.style.fontWeight = 'bold';
    btnEliminarModal.onclick = () => eliminarDelCarrito(indice);

    divModal.appendChild(btnEliminarModal);

    // Botón eliminar para sidebar (igual)
    const btnEliminarSidebar = btnEliminarModal.cloneNode(true);
    btnEliminarSidebar.onclick = () => eliminarDelCarrito(indice);
    divSidebar.appendChild(btnEliminarSidebar);

    contenedorModal.appendChild(divModal);
    contenedorSidebar.appendChild(divSidebar);
  });
}

function eliminarDelCarrito(indice) {
  carrito.splice(indice, 1);
  actualizarCarritoUI();
  actualizarContador();
}

function actualizarContador() {
  document.getElementById('contador-carrito').textContent = carrito.length;
}

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
  const telefono = "573123614448";
  const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
  window.open(url);
}

function abrirSidebar() {
  document.getElementById("sidebar-carrito").style.width = "300px";
}

function cerrarSidebar() {
  document.getElementById("sidebar-carrito").style.width = "0";
}

// Cierra el sidebar si se hace clic fuera del contenido
window.onclick = function(event) {
  const sidebar = document.getElementById("sidebar-carrito");
  if (event.target == sidebar) {
    cerrarSidebar();
  }
};
