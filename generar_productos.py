import pdfplumber
import os
import re

# Rutas
PDF_FILE = "catalogo.pdf"
IMAGES_FOLDER = "productos/imagenes"
OUTPUT_FOLDER = "productos"

# Crear carpetas si no existen
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
os.makedirs(IMAGES_FOLDER, exist_ok=True)

# Limpiar archivos viejos
def limpiar_carpetas():
    for f in os.listdir(OUTPUT_FOLDER):
        if f.endswith(".md"):
            os.remove(os.path.join(OUTPUT_FOLDER, f))
    for f in os.listdir(IMAGES_FOLDER):
        if f.lower().endswith((".jpg", ".jpeg", ".png")):
            os.remove(os.path.join(IMAGES_FOLDER, f))
    print("🧹 Carpetas limpiadas.\n")

# Expresiones regulares
precio_regex = re.compile(r"Precio:\s*\$?(\d{1,3}(?:\.\d{3})*)", re.IGNORECASE)
material_regex = re.compile(r"Material:\s*(.+)", re.IGNORECASE)
nombre_regex = re.compile(r"^Cad\.\s*(.+)", re.IGNORECASE)

def limpiar_nombre(nombre):
    return (
        nombre.lower()
        .replace(" ", "-")
        .replace("ñ", "n")
        .replace(".", "")
        .replace(",", "")
    )

def main():
    limpiar_carpetas()

    with pdfplumber.open(PDF_FILE) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if not text:
                continue

            lines = text.split("\n")
            nombre, material, precio = None, None, None

            for line in lines:
                line = line.strip()

                # Buscar nombre
                if nombre_regex.search(line):
                    nombre = nombre_regex.search(line).group(1).strip()

                # Buscar material
                elif material_regex.search(line):
                    material = material_regex.search(line).group(1).strip()

                # Buscar precio
                elif precio_regex.search(line):
                    precio = precio_regex.search(line).group(1).replace(".", "")
                    
                    # Cuando se encuentra el precio, se asume que el bloque está completo
                    if nombre:
                        img_name = f"{nombre}.jpg"
                        img_path = os.path.join(IMAGES_FOLDER, img_name)
                        if not os.path.exists(img_path):
                            img_name = f"{nombre}.png"
                            img_path = os.path.join(IMAGES_FOLDER, img_name)
                        if not os.path.exists(img_path):
                            img_path = None

                        # Crear Markdown
                        filename = f"{limpiar_nombre(nombre)}.md"
                        filepath = os.path.join(OUTPUT_FOLDER, filename)
                        with open(filepath, "w", encoding="utf-8") as f:
                            f.write("---\n")
                            f.write(f'title: "{nombre}"\n')
                            if material:
                                f.write(f'description: "Material: {material}"\n')
                            else:
                                f.write('description: ""\n')
                            f.write(f'price: {precio}\n')
                            if img_path:
                                f.write(f'image: "/{IMAGES_FOLDER}/{os.path.basename(img_path)}"\n')
                            else:
                                f.write('image: ""\n')
                            f.write("---\n\n")
                        
                        print(f"✅ Producto generado: {nombre}")

                        # Reiniciar para el siguiente producto
                        nombre, material, precio = None, None, None

if __name__ == "__main__":
    main()