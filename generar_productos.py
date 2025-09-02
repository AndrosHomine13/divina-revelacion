import pdfplumber
import os
import re

# 📂 Rutas
PDF_FILE = "catalogo.pdf"
IMAGES_FOLDER = "productos/imagenes"
OUTPUT_FOLDER = "productos"

# Crear carpeta de salida si no existe
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Expresión regular para detectar precio en formato "$xx.xxx"
precio_regex = re.compile(r"\$(\d{1,3}(?:\.\d{3})*)")

def limpiar_nombre(nombre):
    """Limpia el nombre del producto para usarlo en el nombre del archivo"""
    return nombre.lower().replace(" ", "-").replace("ñ", "n")

def main():
    with pdfplumber.open(PDF_FILE) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if not text:
                continue

            # Dividir el texto por líneas
            lines = text.split("\n")
            
            i = 0
            while i < len(lines):
                line = lines[i].strip()

                # Buscar líneas con precio
                if precio_regex.search(line):
                    precio = precio_regex.search(line).group(1).replace(".", "")
                    
                    # El nombre del producto está arriba del precio
                    nombre = lines[i-2].strip() if i >= 2 else lines[i-1].strip()
                    descripcion = lines[i-1].strip() if i >= 1 else ""

                    # Buscar imagen
                    img_name = f"{nombre}.jpg"
                    img_path = os.path.join(IMAGES_FOLDER, img_name)
                    if not os.path.exists(img_path):
                        img_name = f"{nombre}.png"
                        img_path = os.path.join(IMAGES_FOLDER, img_name)
                    if not os.path.exists(img_path):
                        img_path = None  # no se encontró la imagen

                    # Crear archivo Markdown
                    filename = f"{limpiar_nombre(nombre)}.md"
                    filepath = os.path.join(OUTPUT_FOLDER, filename)

                    with open(filepath, "w", encoding="utf-8") as f:
                        f.write("---\n")
                        f.write(f'title: "{nombre}"\n')
                        f.write(f'description: "{descripcion}"\n')
                        f.write(f'price: {precio}\n')
                        if img_path:
                            f.write(f'image: "/{IMAGES_FOLDER}/{os.path.basename(img_path)}"\n')
                        else:
                            f.write(f'image: ""\n')
                        f.write("---\n\n")
                    
                    print(f"✅ Producto generado: {nombre}")
                i += 1

if __name__ == "__main__":
    main()
