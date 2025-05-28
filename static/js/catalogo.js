// Variable global para almacenar los productos en el carrito
let carrito = [];

// Carga los distribuidores desde un archivo JSON
async function cargarDistribuidores() {
  try {
    const response = await fetch('/static/distribuidores.json'); // Asegúrate de que esta ruta sea correcta
    if (!response.ok) throw new Error('No se pudo cargar el archivo de distribuidores');

    const distribuidores = await response.json(); 

    const select = document.getElementById('lista-distribuidores');
    select.innerHTML = ''; // Limpia opciones previas

    distribuidores.forEach(dist => {
      const option = document.createElement('option');
      option.value = dist.nombre;
      option.textContent = dist.nombre;
      select.appendChild(option);
    });

    // Actualizar el carrito si cambia el distribuidor
    select.addEventListener('change', actualizarCarritoUI);
  } catch (error) {
    console.error('Error cargando distribuidores:', error);
  }
}

// Muestra u oculta el selector de distribuidores
function toggleDistribuidores() {
  const tipoCompra = document.getElementById('tipo-compra').value;
  const contenedorDistribuidor = document.getElementById('seleccion-distribuidor');

  if (tipoCompra === 'distribuidor') {
    contenedorDistribuidor.style.display = 'block';
    cargarDistribuidores(); // Cargar distribuidores solo si se necesita
  } else {
    contenedorDistribuidor.style.display = 'none';
  }

  actualizarCarritoUI(); // Refresca el carrito
}

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

function abrirModalCarrito() {
  document.getElementById('modal-carrito').style.display = 'block';
}

function cerrarModalCarrito() {
  document.getElementById('modal-carrito').style.display = 'none';
}

function abrirSidebar() {
  document.getElementById('sidebar-carrito').classList.add('abierto');
}

function cerrarSidebar() {
  document.getElementById('sidebar-carrito').classList.remove('abierto');
}

// Actualiza la interfaz del carrito (modal y sidebar)
function actualizarCarritoUI() {
  const contenedorModal = document.getElementById('modal-carrito-contenedor');
  const contenedorSidebar = document.getElementById('sidebar-carrito-contenedor');

  // Limpia solo los productos, no total ni distribuidor
  contenedorModal.innerHTML = '';
  contenedorSidebar.innerHTML = '';

  if (carrito.length === 0) {
    const mensajeVacioModal = document.createElement('p');
    mensajeVacioModal.textContent = 'El carrito está vacío.';
    mensajeVacioModal.style.color = '#888';

    const mensajeVacioSidebar = mensajeVacioModal.cloneNode(true);

    contenedorModal.appendChild(mensajeVacioModal);
    contenedorSidebar.appendChild(mensajeVacioSidebar);

    // También actualiza total y distribuidor para carrito vacío
    document.getElementById('total-monto').textContent = '$0';
    document.getElementById('nombre-distribuidor').textContent = 'Ninguno';

    return;
  }

  let total = 0;

  carrito.forEach((item, indice) => {
    // Crea elementos para modal
    const divModal = document.createElement('div');
    divModal.className = 'item-carrito';
    divModal.textContent = `${item.nombre} - $${item.precio}`;

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
    contenedorModal.appendChild(divModal);

    // Para sidebar, clonamos el divModal
    const divSidebar = divModal.cloneNode(true);
    // Ajustamos evento eliminar para el sidebar
    const btnEliminarSidebar = divSidebar.querySelector('button');
    btnEliminarSidebar.onclick = () => eliminarDelCarrito(indice);

    contenedorSidebar.appendChild(divSidebar);

    total += item.precio;
  });

  // Actualiza el total y distribuidor en los divs específicos (NO agregar nodos nuevos)
  document.getElementById('total-monto').textContent = `$${total}`;

  const selectDistribuidor = document.getElementById('lista-distribuidores');
  let nombreDistribuidor = 'Ninguno';
  if (selectDistribuidor && selectDistribuidor.options.length > 0) {
    nombreDistribuidor = selectDistribuidor.options[selectDistribuidor.selectedIndex].text;
  }
  document.getElementById('nombre-distribuidor').textContent = nombreDistribuidor;
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

// Guardar carrito en localStorage
function guardarCarritoEnLocalStorage() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Cargar carrito desde localStorage
function cargarCarritoDesdeLocalStorage() {
  const carritoGuardado = localStorage.getItem('carrito');
  if (carritoGuardado) {
    carrito = JSON.parse(carritoGuardado);
  }
}

function enviarPorWhatsApp() {
  if (carrito.length === 0) {
    alert("El carrito está vacío. Agrega productos antes de enviar el pedido.");
    return;
  }

  const numeroTelefono = "573123614448";
  
  // Construir mensaje con productos y total
  let mensaje = "Hola, quiero hacer el siguiente pedido:%0A";

  carrito.forEach(item => {
    mensaje += `- ${item.nombre} - $${item.precio}%0A`;
  });

  const total = carrito.reduce((sum, item) => sum + item.precio, 0);
  mensaje += `%0ATotal: $${total}%0A`;

  // Agregar distribuidor si está seleccionado
  const selectDistribuidor = document.getElementById('lista-distribuidores');
  if (selectDistribuidor && selectDistribuidor.options.length > 0) {
    const distribuidor = selectDistribuidor.options[selectDistribuidor.selectedIndex].text;
    if (distribuidor && distribuidor !== "Ninguno") {
      mensaje += `Distribuidor: ${distribuidor}%0A`;
    }
  }

  // URL para abrir WhatsApp con mensaje prellenado
  const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${mensaje}`;

  // Abrir WhatsApp en nueva pestaña
  window.open(urlWhatsApp, '_blank');
}


// Al cargar la página, cargar carrito y distribuidores, actualizar UI
window.onload = function() {
  cargarCarritoDesdeLocalStorage();
  cargarDistribuidores();
  actualizarCarritoUI();
  actualizarContador();
};