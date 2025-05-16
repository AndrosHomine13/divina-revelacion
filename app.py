from flask import Flask, render_template, request, redirect, url_for, session, flash
import json, os

app = Flask(__name__)
app.secret_key = 'divina_clave_super_segura'
PRODUCTS_FILE = 'products.json'

def load_products():
    if not os.path.exists(PRODUCTS_FILE):
        return []
    with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_products(products):
    with open(PRODUCTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

@app.route('/')
def index():
    productos = load_products()
    return render_template('index.html', productos=productos)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        usuario = request.form['usuario']
        clave = request.form['clave']
        if usuario == 'admin' and clave == 'admin123':
            session['logged_in'] = True
            return redirect(url_for('admin'))
        else:
            flash('Usuario o contraseña incorrectos', 'error')
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('login'))

@app.route('/admin', methods=['GET', 'POST'])
def admin():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        nombre = request.form['nombre']
        descripcion = request.form['descripcion']
        precio = request.form['precio']
        imagen = request.form['imagen']
        productos = load_products()
        productos.append({
            'nombre': nombre,
            'descripcion': descripcion,
            'precio': precio,
            'imagen': imagen
        })
        save_products(productos)
        flash('Producto agregado correctamente', 'success')
        return redirect(url_for('admin'))
    
    productos = load_products()
    return render_template('admin.html', productos=productos)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)