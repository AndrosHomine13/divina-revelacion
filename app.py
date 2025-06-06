from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.secret_key = 'tu_clave_secreta'

# Conexión a PostgreSQL (usa la variable de entorno en Render)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Carpeta para subir imágenes
UPLOAD_FOLDER = 'static/images/productos'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Modelo de Producto
class Producto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.String(255), nullable=False)
    precio = db.Column(db.String(20), nullable=False)
    imagen = db.Column(db.String(255), nullable=False)

# Crear tabla al iniciar
with app.app_context():
    db.create_all()

@app.route('/')
def index():
    productos = Producto.query.all()
    return render_template('index.html', productos=productos)

@app.route('/admin', methods=['GET', 'POST'])
def admin():
    if 'logged_in' not in session or not session['logged_in']:
        flash('Debes iniciar sesión para acceder al panel de administración.', 'error')
        return redirect(url_for('login'))

    productos = Producto.query.all()

    if request.method == 'POST':
        if 'delete' in request.form:
            id = int(request.form['delete'])
            producto = Producto.query.get(id)
            if producto:
                db.session.delete(producto)
                db.session.commit()
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

            nuevo_producto = Producto(
                nombre=nombre,
                descripcion=descripcion,
                precio=precio,
                imagen=filename
            )
            db.session.add(nuevo_producto)
            db.session.commit()
            flash('Producto agregado correctamente', 'success')

        return redirect(url_for('admin'))

    return render_template('admin.html', productos=productos)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        usuario = request.form['usuario']
        clave = request.form['clave']
        if usuario == 'admin' and clave == 'psicologa2020':
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

@app.route('/editar/<int:id>', methods=['GET', 'POST'])
def editar_producto(id):
    if 'logged_in' not in session or not session['logged_in']:
        flash('Debes iniciar sesión para acceder al panel de administración.', 'error')
        return redirect(url_for('login'))

    producto = Producto.query.get(id)
    if not producto:
        flash('Producto no encontrado.', 'error')
        return redirect(url_for('admin'))

    if request.method == 'POST':
        producto.nombre = request.form['nombre']
        producto.descripcion = request.form['descripcion']
        producto.precio = request.form['precio']

        imagen_file = request.files['imagen']
        if imagen_file and imagen_file.filename != '':
            filename = secure_filename(imagen_file.filename)
            imagen_file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            producto.imagen = filename

        db.session.commit()
        flash('Producto actualizado correctamente', 'success')
        return redirect(url_for('admin'))

    return render_template('editar_producto.html', producto=producto)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
