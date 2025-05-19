from flask import Flask, render_template, request, redirect, url_for, flash, session
import json
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.secret_key = 'tu_clave_secreta'

PRODUCTS_FILE = 'products.json'
UPLOAD_FOLDER = 'static/images/productos'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def load_products():
    if os.path.exists(PRODUCTS_FILE):
        with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_products(products):
    with open(PRODUCTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=4, ensure_ascii=False)

@app.route('/')
def home():
    productos = load_products()
    return render_template('index.html', productos=productos)

@app.route('/admin', methods=['GET', 'POST'])
def admin():
    if 'logged_in' not in session or not session['logged_in']:
        flash('Debes iniciar sesión para acceder al panel de administración.', 'error')
        return redirect(url_for('login'))
    
    productos = load_products()

    if request.method == 'POST':
        if 'delete' in request.form:
            index = int(request.form['delete'])
            if 0 <= index < len(productos):
                productos.pop(index)
                save_products(productos)
                flash('Producto eliminado', 'success')
            return redirect(url_for('admin'))

        nombre = request.form['nombre']
        descripcion = request.form['descripcion']
        precio = request.form['precio']
        imagen_file = request.files['imagen']

        if imagen_file:
            filename = secure_filename(imagen_file.filename)
            ruta_imagen = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            imagen_file.save(ruta_imagen)

            nuevo_producto = {
                'nombre': nombre,
                'descripcion': descripcion,
                'precio': precio,
                'imagen': filename
            }

            productos.append(nuevo_producto)
            save_products(productos)
            flash('Producto agregado correctamente', 'success')

        return redirect(url_for('admin'))

    return render_template('admin.html', productos=productos)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        usuario = request.form['usuario']
        clave = request.form['clave']
        if usuario == 'admin' and clave == 'psicologa2020':  # Cambia esto según tu lógica
            session['logged_in'] = True
            flash('Has iniciado sesión correctamente.', 'success')
            return redirect(url_for('admin'))
        else:
            flash('Credenciales incorrectas.', 'error')
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    flash('Sesión cerrada.', 'success')
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
