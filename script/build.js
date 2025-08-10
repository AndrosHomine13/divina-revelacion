const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Directorio de productos y archivo de salida
const productosDir = path.join(process.cwd(), 'productos');
const outputFile = path.join(process.cwd(), 'static', 'productos.json');

function generarProductos() {
  // Verificar si existe la carpeta de productos
  if (!fs.existsSync(productosDir)) {
    console.error(`❌ No se encontró la carpeta de productos en: ${productosDir}`);
    process.exit(1);
  }

  // Leer todos los .md de la carpeta productos
  const archivos = fs.readdirSync(productosDir).filter(file => file.endsWith('.md'));

  if (archivos.length === 0) {
    console.warn('⚠️ No se encontraron archivos .md en la carpeta productos.');
  }

  // Procesar cada archivo y extraer datos del frontmatter
  const productos = archivos.map(filename => {
    const filePath = path.join(productosDir, filename);
    const contenido = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(contenido);

    return {
      title: data.title || '',
      description: data.description || '',
      price: data.price || 0,
      image: data.image || ''
    };
  });

  // Crear carpeta static si no existe
  const staticDir = path.dirname(outputFile);
  if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir, { recursive: true });
  }

  // Guardar JSON formateado
  fs.writeFileSync(outputFile, JSON.stringify(productos, null, 2), 'utf8');

  console.log(`✅ Archivo productos.json generado con ${productos.length} productos.`);
}

generarProductos();
