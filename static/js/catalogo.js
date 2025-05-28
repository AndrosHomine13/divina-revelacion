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

  // Muestra el distribuidor seleccionado debajo del total
  const selectDistribuidor = document.getElementById('lista-distribuidores');
  let nombreDistribuidor = 'Ninguno';
  if (selectDistribuidor && selectDistribuidor.options.length > 0) {
    nombreDistribuidor = selectDistribuidor.options[selectDistribuidor.selectedIndex].text;
  }

  const distribuidorDiv = document.createElement('div');
  distribuidorDiv.className = 'distribuidor-carrito';
  distribuidorDiv.style.marginTop = '8px';
  distribuidorDiv.style.fontWeight = 'bold';
  distribuidorDiv.style.color = '#a26b50';
  distribuidorDiv.textContent = `Distribuidor: ${nombreDistribuidor}`;

  contenedorSidebar.appendChild(distribuidorDiv);
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

// Al cargar la página, cargar carrito y distribuidores, actualizar UI
window.onload = function() {
  cargarCarritoDesdeLocalStorage();
  cargarDistribuidores();
  actualizarCarritoUI();
  actualizarContador();
};