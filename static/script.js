// ============ МОДАЛЬНЫЕ ОКНА ============
function openModal(id) {
    document.getElementById(id).classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    document.body.style.overflow = '';
}
function switchModal(fromId, toId) {
    closeModal(fromId);
    setTimeout(() => openModal(toId), 150);
}

// Закрытие по клику на фон и по Esc
document.querySelectorAll('.modal').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) closeModal(m.id); });
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.querySelectorAll('.modal.active').forEach(m => closeModal(m.id));
});

// ============ TOAST ============
function toast(msg, type = '') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'toast show ' + type;
    setTimeout(() => el.classList.remove('show'), 3500);
}

// ============ ФОРМА ОБРАТНОГО ЗВОНКА ============
async function submitCallback(e, formEl) {
    e.preventDefault();
    const form = formEl || e.target;
    const data = {
        name: form.querySelector('[name=name]').value,
        phone: form.querySelector('[name=phone]').value,
        message: form.querySelector('[name=message]')?.value || ''
    };
    const res = await fetch('/api/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const r = await res.json();
    if (res.ok) {
        toast(r.message, 'success');
        form.reset();
        closeModal('modal-callback');
    } else {
        toast(r.message, 'error');
    }
}

// ============ ФОРМА ЗАПИСИ ============
async function submitAppointment(e, formEl) {
    e.preventDefault();
    const form = formEl || e.target;
    const patient = JSON.parse(localStorage.getItem('patient') || 'null');
    const data = {
        name: form.querySelector('[name=name]').value,
        phone: form.querySelector('[name=phone]').value,
        doctor: form.querySelector('[name=doctor]').value,
        service: form.querySelector('[name=service]').value,
        preferred_time: form.querySelector('[name=preferred_time]').value,
        comment: form.querySelector('[name=comment]').value,
        patient_id: patient ? patient.id : null
    };
    const res = await fetch('/api/appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const r = await res.json();
    if (res.ok) {
        toast(r.message, 'success');
        form.reset();
        closeModal('modal-appointment');
    } else {
        toast(r.message, 'error');
    }
}

// ============ РЕГИСТРАЦИЯ ПАЦИЕНТА ============
document.getElementById('form-patient-register')?.addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target;
    const data = {
        full_name: f.full_name.value,
        phone: f.phone.value,
        email: f.email.value,
        login: f.login.value,
        password: f.password.value
    };
    const res = await fetch('/api/patient/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    const r = await res.json();
    if (res.ok) {
        toast('Регистрация успешна! Войдите в аккаунт.', 'success');
        f.reset();
        switchModal('modal-register', 'modal-login');
    } else {
        toast(r.message, 'error');
    }
});

// ============ ВХОД ПАЦИЕНТА ============
document.getElementById('form-patient-login')?.addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target;
    const data = { login: f.login.value, password: f.password.value };
    const res = await fetch('/api/patient/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    const r = await res.json();
    if (res.ok) {
        localStorage.setItem('patient', JSON.stringify(r));
        toast('Добро пожаловать, ' + r.full_name, 'success');
        f.reset();
        closeModal('modal-login');
        updateUserIcon(r.full_name);
    } else {
        toast(r.message, 'error');
    }
});

// ============ ИКОНКА ПОЛЬЗОВАТЕЛЯ ============
function updateUserIcon(name) {
    const btn = document.querySelector('.user-link');
    if (!btn) return;
    btn.innerHTML = `<i class="fa-solid fa-user-check"></i>`;
    btn.title = name;
    btn.setAttribute('onclick', 'openAccount()');
}

// ============ ЛИЧНЫЙ КАБИНЕТ ============
async function openAccount() {
    const p = JSON.parse(localStorage.getItem('patient') || 'null');
    if (!p) return openModal('modal-login');
    document.getElementById('account-name').textContent = p.full_name;
    openModal('modal-account');
    const res = await fetch('/api/patient/requests/' + p.id);
    const data = await res.json();
    const box = document.getElementById('account-requests');
    if (data.length === 0) {
        box.innerHTML = '<p style="text-align:center;color:var(--text-dim);padding:24px">У вас пока нет заявок</p>';
        return;
    }
    box.innerHTML = data.map(r => `
        <div class="acc-req">
            <div>
                <b>${r.service || 'Обратный звонок'}</b>
                <p>${r.doctor ? 'Врач: ' + r.doctor + ' · ' : ''}${r.preferred_time || r.created_at}</p>
            </div>
            <span class="st ${r.status}">${r.status}</span>
        </div>
    `).join('');
}

// ============ ВЫХОД ============
function logoutPatient() {
    localStorage.removeItem('patient');
    closeModal('modal-account');
    toast('Вы вышли из аккаунта');
    const btn = document.querySelector('.user-link');
    if (btn) {
        btn.innerHTML = '<i class="fa-regular fa-user"></i>';
        btn.title = 'Вход';
        btn.setAttribute('onclick', "openModal('modal-login')");
    }
}

// ============ КУКИ ============
function acceptCookies() {
    localStorage.setItem('cookiesAccepted', '1');
    document.getElementById('cookie-banner').style.display = 'none';
}

// ============ ПРИ ЗАГРУЗКЕ ============
window.addEventListener('DOMContentLoaded', () => {
    // Проверка cookie
    if (localStorage.getItem('cookiesAccepted')) {
        document.getElementById('cookie-banner').style.display = 'none';
    }
    // Проверка авторизации пациента
    const p = JSON.parse(localStorage.getItem('patient') || 'null');
    if (p) updateUserIcon(p.full_name);
    // Табы пресс-центра
    document.querySelectorAll('.press-tab').forEach(t => {
        t.addEventListener('click', () => {
            document.querySelectorAll('.press-tab').forEach(x => x.classList.remove('active'));
            t.classList.add('active');
        });
    });
    // Точки hero-слайдера
    document.querySelectorAll('.hero-dots .dot').forEach(d => {
        d.addEventListener('click', () => {
            document.querySelectorAll('.hero-dots .dot').forEach(x => x.classList.remove('active'));
            d.classList.add('active');
        });
    });
});