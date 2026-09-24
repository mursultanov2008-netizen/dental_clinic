let callbacks = [], appointments = [];

/* ============ ЛОГИН ============ */
document.getElementById('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
        login: document.getElementById('login').value,
        password: document.getElementById('password').value
    };
    const res = await fetch('/api/admin/login', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    const r = await res.json();
    if (res.ok) {
        sessionStorage.setItem('admin', '1');
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-screen').style.display = 'block';
        loadAll();
    } else {
        toast(r.message, 'error');
    }
});

function logout() {
    sessionStorage.removeItem('admin');
    location.reload();
}

/* ============ ЗАГРУЗКА ============ */
async function loadAll() {
    const c = await (await fetch('/api/admin/callbacks')).json();
    callbacks = c;
    const a = await (await fetch('/api/admin/appointments')).json();
    appointments = a;
    document.getElementById('stat-callbacks').textContent = 'Звонки: ' + c.length;
    document.getElementById('stat-appointments').textContent = 'Записи: ' + a.length;
    renderCallbacks();
    renderAppointments();
}

/* ============ РЕНДЕР: ОБРАТНЫЕ ЗВОНКИ ============ */
function renderCallbacks() {
    const box = document.getElementById('callbacks-table');
    if (callbacks.length === 0) {
        box.innerHTML = '<div class="table-wrap"><div class="empty"><i class="fa-solid fa-phone-slash"></i>Пока нет заявок</div></div>';
        return;
    }
    let html = `<div class="table-wrap"><table><thead><tr>
        <th>ID</th><th>Дата</th><th>Имя</th><th>Телефон</th><th>Комментарий</th><th>Статус</th><th></th>
    </tr></thead><tbody>`;
    callbacks.forEach(c => {
        html += `<tr>
            <td>${c.id}</td>
            <td>${c.created_at}</td>
            <td><b>${esc(c.name)}</b></td>
            <td><a href="tel:${c.phone}" style="color:var(--teal)">${esc(c.phone)}</a></td>
            <td>${c.message ? `<div class="msg-box">${esc(c.message)}</div>` : '—'}</td>
            <td>
                <select class="status-select" onchange="updateCb(${c.id}, this.value)">
                    <option ${c.status==='Новая'?'selected':''}>Новая</option>
                    <option ${c.status==='Обработан'?'selected':''}>Обработан</option>
                    <option ${c.status==='Отменена'?'selected':''}>Отменена</option>
                </select>
            </td>
            <td><button class="btn-danger" onclick="delCb(${c.id})"><i class="fa-solid fa-trash"></i></button></td>
        </tr>`;
    });
    html += '</tbody></table></div>';
    box.innerHTML = html;
}

/* ============ РЕНДЕР: ЗАПИСИ ============ */
function renderAppointments() {
    const box = document.getElementById('appointments-table');
    if (appointments.length === 0) {
        box.innerHTML = '<div class="table-wrap"><div class="empty"><i class="fa-solid fa-calendar-xmark"></i>Пока нет записей</div></div>';
        return;
    }
    let html = `<div class="table-wrap"><table><thead><tr>
        <th>ID</th><th>Дата</th><th>Имя</th><th>Телефон</th><th>Врач</th><th>Услуга</th><th>Время</th><th>Комментарий</th><th>Статус</th><th></th>
    </tr></thead><tbody>`;
    appointments.forEach(a => {
        html += `<tr>
            <td>${a.id}</td>
            <td>${a.created_at}</td>
            <td><b>${esc(a.name)}</b></td>
            <td><a href="tel:${a.phone}" style="color:var(--teal)">${esc(a.phone)}</a></td>
            <td>${esc(a.doctor || '—')}</td>
            <td>${esc(a.service || '—')}</td>
            <td>${esc(a.preferred_time || '—')}</td>
            <td>${a.comment ? `<div class="msg-box">${esc(a.comment)}</div>` : '—'}</td>
            <td>
                <select class="status-select" onchange="updateAp(${a.id}, this.value)">
                    <option ${a.status==='Новая'?'selected':''}>Новая</option>
                    <option ${a.status==='Подтверждена'?'selected':''}>Подтверждена</option>
                    <option ${a.status==='Завершена'?'selected':''}>Завершена</option>
                    <option ${a.status==='Отменена'?'selected':''}>Отменена</option>
                </select>
            </td>
            <td><button class="btn-danger" onclick="delAp(${a.id})"><i class="fa-solid fa-trash"></i></button></td>
        </tr>`;
    });
    html += '</tbody></table></div>';
    box.innerHTML = html;
}

/* ============ ДЕЙСТВИЯ ============ */
async function updateCb(id, status) {
    await fetch(`/api/admin/callbacks/${id}`, {
        method: 'PUT', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ status })
    });
    toast('Статус обновлён', 'success');
}
async function updateAp(id, status) {
    await fetch(`/api/admin/appointments/${id}`, {
        method: 'PUT', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ status })
    });
    toast('Статус обновлён', 'success');
}
async function delCb(id) {
    if (!confirm('Удалить заявку?')) return;
    await fetch(`/api/admin/callbacks/${id}`, { method: 'DELETE' });
    toast('Удалено', 'success');
    loadAll();
}
async function delAp(id) {
    if (!confirm('Удалить запись?')) return;
    await fetch(`/api/admin/appointments/${id}`, { method: 'DELETE' });
    toast('Удалено', 'success');
    loadAll();
}

/* ============ ТАБЫ ============ */
document.querySelectorAll('.tab').forEach(t => {
    t.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        document.getElementById('tab-' + t.dataset.tab).classList.add('active');
    });
});

/* ============ УТИЛИТЫ ============ */
function esc(s) {
    return String(s).replace(/[&<>"']/g, m => ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[m]));
}
function toast(m, t='') {
    const el = document.getElementById('toast');
    el.textContent = m; el.className = 'toast show ' + t;
    setTimeout(() => el.classList.remove('show'), 3000);
}

/* ============ АВТОЛОГИН ============ */
if (sessionStorage.getItem('admin')) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-screen').style.display = 'block';
    loadAll();
}
