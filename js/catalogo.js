// Variable global para almacenar los productos en el carrito
let carrito = [];

// Cargar productos y renderizar en el DOM
async function cargarProductos() {
  try {
    const response = await fetch('/static/productos.json');
    if (!response.ok) throw new Error('No se pudo cargar productos.json');

    const productos = await response.json();
    const contenedor = document.getElementById('productos');
    contenedor.innerHTML = '';

    productos.forEach(prod => {
      const precioFormateado = prod.price.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      const div = document.createElement('div');
      div.classList.add('producto');

      div.innerHTML = `
        <img src="${prod.image}" alt="${prod.title}" style="max-width: 150px; height: auto;">
        <h2 style="font-size: 22px">${prod.title}</h2>
        <p>${prod.description}</p>
        <p>Precio: $${precioFormateado}</p>
      `;

      const btn = document.createElement('button');
      btn.classList.add('btn-ver-carrito');
      btn.textContent = '🛒 Agregar al carrito';
      // Guardamos el precio numérico para la suma, no el formateado
      btn.addEventListener('click', () => {
        agregarAlCarrito(prod.title, prod.price);
      });

      div.appendChild(btn);
      contenedor.appendChild(div);
    });

  } catch (error) {
    console.error('Error al cargar productos.json:', error);
  }
}

// Carga los distribuidores desde un archivo JSON
async function cargarDistribuidores() {
  try {
    const response = await fetch('/static/distribuidores.json');
    if (!response.ok) throw new Error('No se pudo cargar el archivo de distribuidores');

    const distribuidores = await response.json();

    const select = document.getElementById('lista-distribuidores');
    select.innerHTML = '';

    distribuidores.forEach(dist => {
      const option = document.createElement('option');
      option.value = dist.nombre;
      option.textContent = dist.nombre;
      select.appendChild(option);
    });

    // Restaurar distribuidor guardado
    const distribuidorGuardado = localStorage.getItem('distribuidorSeleccionado');
    if (distribuidorGuardado) {
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === distribuidorGuardado) {
          select.selectedIndex = i;
          break;
        }
      }
    }

    // Guardar distribuidor al cambiar
    select.addEventListener('change', () => {
      localStorage.setItem('distribuidorSeleccionado', select.value);
      actualizarCarritoUI();
    });

  } catch (error) {
    console.error('Error cargando distribuidores:', error);
  }
}

// Muestra u oculta el selector de distribuidores y guarda tipo de compra
function toggleDistribuidores() {
  const tipoCompra = document.getElementById('tipo-compra').value;
  const divDistribuidor = document.getElementById('seleccion-distribuidor');

  divDistribuidor.style.display = tipoCompra === "distribuidor" ? "block" : "none";

  // Guardar tipo de compra
  localStorage.setItem('tipoCompra', tipoCompra);

  actualizarCarritoUI();
}

// Muestra una notificación breve en pantalla
function mostrarToast(mensaje) {
  const toast = document.getElementById('toast');
  toast.textContent = mensaje;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Agrega un producto al carrito
function agregarAlCarrito(nombre, precio) {
  carrito.push({ nombre, precio });
  guardarCarritoEnLocalStorage();
  mostrarToast(`${nombre} agregado al carrito.`);
  actualizarCarritoUI();
  actualizarContador();
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

  contenedorModal.innerHTML = '';
  contenedorSidebar.innerHTML = '';

  if (carrito.length === 0) {
    const mensajeVacio = document.createElement('p');
    mensajeVacio.textContent = 'El carrito está vacío.';
    mensajeVacio.style.color = '#888';

    contenedorModal.appendChild(mensajeVacio.cloneNode(true));
    contenedorSidebar.appendChild(mensajeVacio);

    document.getElementById('total-monto').textContent = '$0';
    document.getElementById('nombre-distribuidor').textContent = 'Ninguno';
    return;
  }

  let total = 0;

  carrito.forEach((item, indice) => {
    const divModal = document.createElement('div');
    divModal.className = 'item-carrito';

    // Formateamos el precio aquí para mostrarlo bonito
    const precioFormateado = item.precio.toLocaleString('es-ES', {minimumFractionDigits: 0, maximumFractionDigits: 0});
    divModal.textContent = `${item.nombre} - $${precioFormateado}`;

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

    const divSidebar = divModal.cloneNode(true);
    divSidebar.querySelector('button').onclick = () => eliminarDelCarrito(indice);
    contenedorSidebar.appendChild(divSidebar);

    total += item.precio;  // suma numérica real
  });

  document.getElementById('total-monto').textContent = `$${total.toLocaleString('es-ES', {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;

  const tipoCompra = document.getElementById('tipo-compra').value;
  const selectDistribuidor = document.getElementById('lista-distribuidores');

  let nombreDistribuidor = 'Ninguno';
  if (tipoCompra === "distribuidor" && selectDistribuidor && selectDistribuidor.options.length > 0) {
    nombreDistribuidor = selectDistribuidor.options[selectDistribuidor.selectedIndex].text;
  }

  document.getElementById('nombre-distribuidor').textContent = nombreDistribuidor;
}

// Elimina un producto del carrito por su índice
function eliminarDelCarrito(indice) {
  carrito.splice(indice, 1);
  guardarCarritoEnLocalStorage();
  actualizarCarritoUI();
  actualizarContador();
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

// Enviar pedido por WhatsApp
function enviarPorWhatsApp() {
  if (carrito.length === 0) {
    mostrarNotificacionError("El carrito está vacío. Agrega productos antes de enviar el pedido.");
    return;
  }

  const numeroTelefono = "573123614448";
  let mensaje = "Hola, quiero hacer el siguiente pedido:%0A";

  carrito.forEach(item => {
    const precioFormateado = item.precio.toLocaleString('es-ES', {minimumFractionDigits: 0, maximumFractionDigits: 0});
    mensaje += `- ${item.nombre} - $${precioFormateado}%0A`;
  });

  const total = carrito.reduce((sum, item) => sum + item.precio, 0);
  const totalFormateado = total.toLocaleString('es-ES', {minimumFractionDigits: 0, maximumFractionDigits: 0});
  mensaje += `%0ATotal: $${totalFormateado}%0A`;

  const tipoCompra = document.getElementById('tipo-compra').value;
  const selectDistribuidor = document.getElementById('lista-distribuidores');

  if (tipoCompra === "distribuidor" && selectDistribuidor && selectDistribuidor.options.length > 0) {
    const distribuidor = selectDistribuidor.options[selectDistribuidor.selectedIndex]?.text;
    if (distribuidor && distribuidor !== "Ninguno") {
      mensaje += `Distribuidor: ${distribuidor}%0A`;
    }
  }

  const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${mensaje}`;
  window.open(urlWhatsApp, '_blank');
}

function mostrarNotificacionError(mensaje) {
  const noti = document.getElementById("notificacion-error");
  noti.querySelector("p").textContent = mensaje;

  noti.classList.remove("oculto");
  noti.classList.add("visible");

  setTimeout(() => {
    noti.classList.remove("visible");
    noti.classList.add("oculto");
  }, 3000);
}

// Al cargar la página
window.onload = async function () {
  cargarCarritoDesdeLocalStorage();

  await cargarDistribuidores();
  await cargarProductos();

  const tipoCompraGuardado = localStorage.getItem('tipoCompra');
  if (tipoCompraGuardado) {
    document.getElementById('tipo-compra').value = tipoCompraGuardado;
    toggleDistribuidores();
  }

  actualizarCarritoUI();
  actualizarContador();
};
