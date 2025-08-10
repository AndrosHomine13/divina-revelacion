const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const productosDir = path.join(__dirname, "productos");
const outputFile = path.join(__dirname, "static/productos.json");

const productos = [];

fs.readdirSync(productosDir).forEach(file => {
  const filePath = path.join(productosDir, file);
  const fileContent = fs.readFileSync(filePath, "utf8");
  const { data } = matter(fileContent);

  productos.push(data);
});

fs.writeFileSync(outputFile, JSON.stringify(productos, null, 2));
console.log("✅ Archivo productos.json generado.");
