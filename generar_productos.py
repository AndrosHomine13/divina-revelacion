import pdfplumber
import os
import re
import unicodedata

# 📂 Rutas
PDF_FILE = "catalogo.pdf"
IMAGES_FOLDER = "productos/imagenes"
OUTPUT_FOLDER = "productos"

# Crear carpetas si no existen
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
os.makedirs(IMAGES_FOLDER, exist_ok=True)

# 🧾 Expresiones regulares
precio_regex = re.compile(r"Precio:\s*\$?(\d{1,3}(?:\.\d{3})*|\d+)", re.IGNORECASE)
material_regex = re.compile(r"Material:\s*(.+)", re.IGNORECASE)
nombre_regex = re.compile(
    r"^(Cad|Chocker|Conjunto|Collar|Puls|Set|Tobillera|Anillo|Topos|Cand|Aretes|Trío|Ear|Pulseras|Caimán|Horquilla|Banana|Joyero)\.?[^\n]*",
    re.IGNORECASE
)

# 🔤 Limpieza del nombre para usarlo como filename
def limpiar_nombre(nombre):
    nombre = nombre.lower().strip()
    nombre = unicodedata.normalize("NFD", nombre).encode("ascii", "ignore").decode("utf-8")
    nombre = nombre.replace("ñ", "n")
    nombre = re.sub(r"[^a-z0-9\s\-]", "", nombre)
    nombre = re.sub(r"\s+", "-", nombre)
    nombre = re.sub(r"-{2,}", "-", nombre)
    return nombre.strip("-")

def main():
    productos = []

    # 📖 Extraer texto del PDF
    with pdfplumber.open(PDF_FILE) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if not text:
                continue

            lines = [l.strip() for l in text.split("\n") if l.strip()]

            i = 0
            while i < len(lines):
                line = lines[i]

                # Buscar nombre
                if nombre_regex.match(line):
                    nombre = line
                    material = ""
                    precio = ""

                    # Revisar las siguientes líneas para material y precio
                    j = i + 1
                    while j < len(lines):
                        next_line = lines[j]

                        if material_regex.search(next_line):
                            material = material_regex.search(next_line).group(1).strip()
                        elif precio_regex.search(next_line):
                            precio = precio_regex.search(next_line).group(1).replace(".", "")
                            break  # fin del bloque del producto
                        j += 1

                    if precio:  # Solo guardar si hay precio
                        productos.append({
                            "nombre": nombre,
                            "material": material,
                            "precio": precio
                        })
                        i = j  # saltar al final del bloque
                i += 1

    # 📝 Crear los archivos Markdown
    for p in productos:
        nombre, material, precio = p["nombre"], p["material"], p["precio"]
        filename = f"{limpiar_nombre(nombre)}.md"
        filepath = os.path.join(OUTPUT_FOLDER, filename)

        # 🔍 Buscar imagen con ruta compatible
        img_path = ""
        for ext in [".jpg", ".png", ".jpeg"]:
            possible = os.path.join(IMAGES_FOLDER, limpiar_nombre(nombre) + ext)
            if os.path.exists(possible):
                # Convertir siempre a formato web con '/'
                img_path = "/" + possible.replace("\\", "/")
                break

        # ✏️ Crear el archivo .md (YAML seguro)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write("---\n")
            f.write(f'title: "{nombre}"\n')
            f.write(f'material: "{material}"\n')
            f.write(f"price: {precio}\n")
            f.write(f'image: "{img_path}"\n')
            f.write("---\n\n")

        print(f"✅ {nombre} → {filename}")

    print(f"\n✨ Total de productos generados: {len(productos)}")

if __name__ == "__main__":
    main()