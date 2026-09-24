from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os

app = Flask(__name__, template_folder='templates', static_folder='static')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


# ================= МОДЕЛИ БД =================

class Callback(db.Model):
    """Заявки на обратный звонок"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(30), nullable=False)
    message = db.Column(db.Text, default='')
    status = db.Column(db.String(40), default='Новая')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "phone": self.phone,
            "message": self.message, "status": self.status,
            "created_at": self.created_at.strftime('%d.%m.%Y %H:%M')
        }


class Patient(db.Model):
    """Зарегистрированные пациенты"""
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(30))
    email = db.Column(db.String(120))
    login = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Appointment(db.Model):
    """Запись на приём"""
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'))
    name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(30), nullable=False)
    doctor = db.Column(db.String(120), default='')
    service = db.Column(db.String(120), default='')
    preferred_time = db.Column(db.String(60), default='')
    comment = db.Column(db.Text, default='')
    status = db.Column(db.String(40), default='Новая')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "phone": self.phone,
            "doctor": self.doctor, "service": self.service,
            "preferred_time": self.preferred_time,
            "comment": self.comment, "status": self.status,
            "patient_id": self.patient_id,
            "created_at": self.created_at.strftime('%d.%m.%Y %H:%M')
        }


class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    login = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)


# ================= ПУБЛИЧНЫЕ СТРАНИЦЫ =================

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/admin')
def admin_page():
    return render_template('admin.html')


# ================= API: ПУБЛИЧНЫЕ =================

@app.route('/api/callback', methods=['POST'])
def api_callback():
    d = request.json
    if not d.get('name') or not d.get('phone'):
        return jsonify({"message": "Заполните имя и телефон"}), 400
    cb = Callback(name=d['name'], phone=d['phone'], message=d.get('message', ''))
    db.session.add(cb)
    db.session.commit()
    return jsonify({"message": "Заявка принята! Мы перезвоним в ближайшее время."}), 201


@app.route('/api/appointment', methods=['POST'])
def api_appointment():
    d = request.json
    if not d.get('name') or not d.get('phone'):
        return jsonify({"message": "Заполните имя и телефон"}), 400
    ap = Appointment(
        name=d['name'], phone=d['phone'],
        doctor=d.get('doctor', ''), service=d.get('service', ''),
        preferred_time=d.get('preferred_time', ''),
        comment=d.get('comment', ''),
        patient_id=d.get('patient_id')
    )
    db.session.add(ap)
    db.session.commit()
    return jsonify({"message": "Запись оформлена! Мы свяжемся с вами."}), 201


# ================= API: ПАЦИЕНТЫ =================

@app.route('/api/patient/register', methods=['POST'])
def patient_register():
    d = request.json
    if Patient.query.filter_by(login=d['login']).first():
        return jsonify({"message": "Логин уже занят"}), 400
    p = Patient(
        full_name=d['full_name'],
        phone=d.get('phone', ''),
        email=d.get('email', ''),
        login=d['login'],
        password_hash=generate_password_hash(d['password'])
    )
    db.session.add(p)
    db.session.commit()
    return jsonify({"message": "Аккаунт создан"}), 201


@app.route('/api/patient/login', methods=['POST'])
def patient_login():
    d = request.json
    p = Patient.query.filter_by(login=d['login']).first()
    if p and check_password_hash(p.password_hash, d['password']):
        return jsonify({
            "id": p.id,
            "full_name": p.full_name,
            "login": p.login
        }), 200
    return jsonify({"message": "Неверный логин или пароль"}), 401


@app.route('/api/patient/requests/<int:pid>', methods=['GET'])
def patient_requests(pid):
    ap = Appointment.query.filter_by(patient_id=pid).order_by(Appointment.created_at.desc()).all()
    return jsonify([a.to_dict() for a in ap])


# ================= API: АДМИН =================

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    d = request.json
    a = Admin.query.filter_by(login=d.get('login')).first()
    if a and check_password_hash(a.password_hash, d.get('password', '')):
        return jsonify({"message": "OK", "role": "admin"}), 200
    return jsonify({"message": "Неверный логин или пароль"}), 401


@app.route('/api/admin/callbacks', methods=['GET'])
def get_callbacks():
    return jsonify([c.to_dict() for c in Callback.query.order_by(Callback.created_at.desc()).all()])


@app.route('/api/admin/appointments', methods=['GET'])
def get_appointments():
    return jsonify([a.to_dict() for a in Appointment.query.order_by(Appointment.created_at.desc()).all()])


@app.route('/api/admin/callbacks/<int:id>', methods=['PUT', 'DELETE'])
def edit_callback(id):
    cb = Callback.query.get(id)
    if not cb:
        return jsonify({"message": "Не найдено"}), 404
    if request.method == 'DELETE':
        db.session.delete(cb)
        db.session.commit()
        return jsonify({"message": "Удалено"})
    data = request.json
    if 'status' in data:
        cb.status = data['status']
    db.session.commit()
    return jsonify({"message": "Обновлено"})


@app.route('/api/admin/appointments/<int:id>', methods=['PUT', 'DELETE'])
def edit_appointment(id):
    ap = Appointment.query.get(id)
    if not ap:
        return jsonify({"message": "Не найдено"}), 404
    if request.method == 'DELETE':
        db.session.delete(ap)
        db.session.commit()
        return jsonify({"message": "Удалено"})
    data = request.json
    if 'status' in data:
        ap.status = data['status']
    db.session.commit()
    return jsonify({"message": "Обновлено"})


# ================= ИНИЦИАЛИЗАЦИЯ =================

def seed():
    if not Admin.query.filter_by(login='admin').first():
        db.session.add(Admin(
            login='admin',
            password_hash=generate_password_hash('admin123')
        ))
        db.session.commit()


if __name__ == '__main__':
    # Удаляем старую БД (для разработки)
    for f in ['database.db', 'instance/database.db']:
        if os.path.exists(f):
            try:
                os.remove(f)
                print(f'🗑️  Удалена старая БД: {f}')
            except PermissionError:
                pass
    with app.app_context():
        db.create_all()
        seed()
        print('✅ Сервер: http://127.0.0.1:5000')
        print('👤 Админ: http://127.0.0.1:5000/admin  →  admin / admin123')
    app.run(debug=True, port=5000)