const CANCHAS = [
  { id:1, nombre:'El Potrero', dueno:'Don Carlos Méndez', precio:4000, color:'#4ade80', emoji:'P' },
  { id:2, nombre:'La Bombonera Chica', dueno:'Familia Rojas', precio:3500, color:'#facc15', emoji:'B' },
  { id:3, nombre:'Canchas del Centro', dueno:'Municipalidad', precio:3000, color:'#60a5fa', emoji:'C' },
  { id:4, nombre:'Complejo Los Pinos', dueno:'Miguel Herrera', precio:4500, color:'#f97316', emoji:'P' },
];
const HORAS = ['08:00','09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const HOY = new Date(2026,3,16);

let reservas = [
  { id:1, canchaId:1, fecha:'2026-04-17', hora:'18:00', nombre:'Rodrigo Paz', tel:'381-111-2222', jugadores:10, estado:'confirmado' },
  { id:2, canchaId:2, fecha:'2026-04-17', hora:'20:00', nombre:'Equipo Rayo FC', tel:'381-333-4444', jugadores:10, estado:'pendiente' },
  { id:3, canchaId:1, fecha:'2026-04-18', hora:'19:00', nombre:'Los Pibes', tel:'381-555-6666', jugadores:8, estado:'pendiente' },
  { id:4, canchaId:3, fecha:'2026-04-19', hora:'17:00', nombre:'Club Amigos', tel:'381-777-8888', jugadores:10, estado:'confirmado' },
  { id:5, canchaId:4, fecha:'2026-04-16', hora:'21:00', nombre:'La Banda del Barrio', tel:'381-999-0000', jugadores:10, estado:'confirmado' },
];
let nextId = 6;
let selCancha = 1, selFecha = null, selHora = null;
let calMes = new Date(2026,3,1);
let filtroAdmin = 'todos';
let adminLogueado = false;

// Tab actual
let currentTab = 'canchas';

function goTab(tab, btn, bnavId) {
  currentTab = tab;
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.getElementById('tab-'+tab).classList.add('active');

  // Desktop nav
  document.querySelectorAll('.desktop-nav button').forEach(b=>b.classList.remove('active'));
  if(btn && btn.closest('.desktop-nav')) btn.classList.add('active');

  // Bottom nav
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
  const bnav = bnavId ? document.getElementById(bnavId) : document.getElementById('bnav-'+tab);
  if(bnav) bnav.classList.add('active');

  // Sync desktop nav visual
  const deskBtns = document.querySelectorAll('.desktop-nav button');
  deskBtns.forEach(b => {
    if(b.getAttribute('onclick') && b.getAttribute('onclick').includes("'"+tab+"'")) b.classList.add('active');
  });

  if(tab==='reservar') { renderSelCanchas(); renderCal(); renderHorarios(); actualizarStepBar(); }
  if(tab==='admin' && adminLogueado) renderAdminPanel();
  if(tab==='canchas') renderCanchas();

  // Scroll top suave
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ===== STEP BAR ===== */
function actualizarStepBar() {
  const s1 = document.getElementById('sdot-1');
  const s2 = document.getElementById('sdot-2');
  const s3 = document.getElementById('sdot-3');
  if(!s1) return;
  if(selFecha && selHora) {
    s1.className='step-dot done'; s2.className='step-dot done'; s3.className='step-dot active';
  } else if(selFecha) {
    s1.className='step-dot done'; s2.className='step-dot active'; s3.className='step-dot';
  } else {
    s1.className='step-dot active'; s2.className='step-dot'; s3.className='step-dot';
  }
}

/* ===== CANCHAS ===== */
function renderCanchas() {
  const hoyStr = fmtFecha(HOY);
  document.getElementById('stats-row').innerHTML = `
    <div class="stat-pill"><strong>${CANCHAS.length}</strong> canchas</div>
    <div class="stat-pill"><strong>${reservas.filter(r=>r.fecha===hoyStr).length}</strong> hoy</div>
    <div class="stat-pill"><strong>${reservas.filter(r=>r.estado==='pendiente').length}</strong> pendientes</div>
  `;
  document.getElementById('canchas-grid').innerHTML = CANCHAS.map(c=>{
    const hoyR = reservas.filter(r=>r.canchaId===c.id && r.fecha===hoyStr).length;
    const libres = HORAS.length - hoyR;
    return `<div class="cancha-card${selCancha===c.id?' selected':''}" style="--accent:${c.color};--accent-bg:${c.color}22" onclick="irReservar(${c.id})">
      <div class="cancha-header">
        <div class="cancha-icon">${c.emoji}</div>
        <div class="cancha-libre-count">${libres} libres hoy</div>
      </div>
      <div class="cancha-nombre">${c.nombre}</div>
      <div class="cancha-dueno">${c.dueno}</div>
      <div class="cancha-footer">
        <div class="cancha-precio">$${c.precio.toLocaleString()} <span>/hora</span></div>
        <button class="btn-reservar-card">Reservar →</button>
      </div>
    </div>`;
  }).join('');
}

function irReservar(id) {
  selCancha = id; selFecha = null; selHora = null;
  // Activar tab reservar
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.getElementById('tab-reservar').classList.add('active');
  currentTab = 'reservar';
  // Actualizar navs
  document.querySelectorAll('.desktop-nav button').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.desktop-nav button').forEach(b=>{
    if(b.getAttribute('onclick') && b.getAttribute('onclick').includes("'reservar'")) b.classList.add('active');
  });
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
  document.getElementById('bnav-reservar').classList.add('active');
  renderSelCanchas(); renderCal(); renderHorarios(); actualizarStepBar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ===== RESERVAR ===== */
function renderSelCanchas() {
  document.getElementById('sel-canchas').innerHTML = CANCHAS.map(c=>`
    <button class="sel-cancha-chip${selCancha===c.id?' active':''}" onclick="cambiarCancha(${c.id})">
      <div class="dot" style="background:${c.color}"></div>
      ${c.nombre}
      <span class="price">$${c.precio.toLocaleString()}</span>
    </button>
  `).join('');
}

function cambiarCancha(id) { selCancha=id; selFecha=null; selHora=null; renderSelCanchas(); renderCal(); actualizarForm(); actualizarStepBar(); }

function renderCal() {
  document.getElementById('cal-mes').textContent = MESES[calMes.getMonth()] + ' ' + calMes.getFullYear();
  const primerDia = new Date(calMes.getFullYear(), calMes.getMonth(), 1).getDay();
  const diasMes = new Date(calMes.getFullYear(), calMes.getMonth()+1, 0).getDate();
  let html = '';
  for(let i=0;i<primerDia;i++) html+=`<div class="cal-day empty"></div>`;
  for(let d=1;d<=diasMes;d++) {
    const f = fmtDia(calMes.getFullYear(), calMes.getMonth()+1, d);
    const esHoy = f===fmtFecha(HOY);
    const esSel = f===selFecha;
    const pasado = new Date(f) < new Date(fmtFecha(HOY));
    const tieneRes = reservas.some(r=>r.canchaId===selCancha && r.fecha===f);
    let cls = 'cal-day';
    if(pasado) cls+=' pasado';
    if(esHoy) cls+=' hoy';
    if(esSel) cls+=' selected';
    if(tieneRes && !pasado) cls+=' tiene-res';
    html+=`<div class="${cls}" onclick="${pasado?'':'selDia(\''+f+'\')'}">${d}</div>`;
  }
  document.getElementById('cal-days').innerHTML = html;
}

function selDia(f) { selFecha=f; selHora=null; renderCal(); renderHorarios(); actualizarForm(); actualizarStepBar(); }

function renderHorarios() {
  if(!selFecha) { document.getElementById('horarios-wrap').style.display='none'; return; }
  document.getElementById('horarios-wrap').style.display='block';
  document.getElementById('horarios-titulo').textContent = 'Horario · ' + selFecha.split('-').reverse().join('/');
  const ocupados = reservas.filter(r=>r.canchaId===selCancha && r.fecha===selFecha).map(r=>r.hora);
  document.getElementById('horarios-grid').innerHTML = HORAS.map(h=>{
    const ocup = ocupados.includes(h);
    const sel = h===selHora;
    return `<button class="hora-btn ${ocup?'ocupado':sel?'selected':''}" onclick="${ocup?'':'selHora2(\''+h+'\')'}">${h}</button>`;
  }).join('');
}

function selHora2(h) { selHora=h; renderHorarios(); actualizarForm(); actualizarStepBar(); }

function actualizarForm() {
  const fc = document.getElementById('form-content');
  if(!selCancha||!selFecha||!selHora) {
    fc.innerHTML=`<div class="empty-state"><div class="icon" style="margin-bottom:8px;"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>${!selFecha?'Elegí una fecha':'Elegí un horario'} para continuar</div>`;
    return;
  }
  const c = CANCHAS.find(c=>c.id===selCancha);
  fc.innerHTML=`
    <div class="resumen-reserva">
      <strong>${c.nombre}</strong> · ${c.dueno}<br>
      ${selFecha.split('-').reverse().join('/')} a las <strong>${selHora} hs</strong>
      <div class="precio-tag">$${c.precio.toLocaleString()}</div>
      <small style="color:var(--gris-texto)">Pago en cancha el día del turno</small>
    </div>
    <label>Tu nombre completo</label>
    <input id="inp-nombre" type="text" placeholder="Ej: Lucas García" autocomplete="name" />
    <label>WhatsApp / Teléfono</label>
    <input id="inp-tel" type="tel" placeholder="Ej: 381 555-1234" autocomplete="tel" />
    <label>Cantidad de jugadores</label>
    <input id="inp-jug" type="number" min="2" max="10" value="10" inputmode="numeric" />
    <button class="btn-main" onclick="confirmarReserva()">Confirmar reserva ✓</button>
  `;
}

function confirmarReserva() {
  const nombre = document.getElementById('inp-nombre').value.trim();
  const tel = document.getElementById('inp-tel').value.trim();
  const jug = document.getElementById('inp-jug').value;
  if(!nombre||!tel) { toast('Completá nombre y WhatsApp',''); return; }
  reservas.push({ id:nextId++, canchaId:selCancha, fecha:selFecha, hora:selHora, nombre, tel, jugadores:jug, estado:'pendiente' });
  toast('¡Reserva enviada! El dueño la confirmará pronto','verde');
  selFecha=null; selHora=null;
  renderCal(); renderHorarios(); actualizarForm(); renderCanchas(); actualizarStepBar();
}

function cambiarMes(d) { calMes.setMonth(calMes.getMonth()+d); renderCal(); }

/* ===== ADMIN ===== */
function loginAdmin() {
  const pass = document.getElementById('admin-pass').value;
  if(pass==='admin123') {
    adminLogueado=true;
    document.getElementById('admin-login-section').style.display='none';
    document.getElementById('admin-panel').style.display='block';
    renderAdminPanel();
  } else {
    toast('Contraseña incorrecta','');
    document.getElementById('admin-pass').value='';
  }
}

function logoutAdmin() {
  adminLogueado=false;
  document.getElementById('admin-login-section').style.display='block';
  document.getElementById('admin-panel').style.display='none';
  document.getElementById('admin-pass').value='';
}

function setFiltro(f, btn) {
  filtroAdmin=f;
  document.querySelectorAll('.filtro-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderAdminPanel();
}

function renderAdminPanel() {
  const total=reservas.length, pend=reservas.filter(r=>r.estado==='pendiente').length, conf=reservas.filter(r=>r.estado==='confirmado').length;
  document.getElementById('admin-stats').innerHTML=`
    <div class="admin-stat"><div class="num">${total}</div><div class="lbl">Total</div></div>
    <div class="admin-stat"><div class="num" style="color:var(--amarillo)">${pend}</div><div class="lbl">Pendientes</div></div>
    <div class="admin-stat"><div class="num" style="color:var(--verde-neon)">${conf}</div><div class="lbl">Confirmadas</div></div>
  `;
  const hoyStr = fmtFecha(HOY);
  let filtradas = [...reservas];
  if(filtroAdmin==='pendiente') filtradas=filtradas.filter(r=>r.estado==='pendiente');
  else if(filtroAdmin==='confirmado') filtradas=filtradas.filter(r=>r.estado==='confirmado');
  else if(filtroAdmin==='hoy') filtradas=filtradas.filter(r=>r.fecha===hoyStr);
  filtradas.sort((a,b)=>a.fecha.localeCompare(b.fecha)||a.hora.localeCompare(b.hora));
  if(!filtradas.length) {
    document.getElementById('reservas-lista').innerHTML='<div class="empty-state"><div class="icon" style="margin-bottom:8px;"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg></div>No hay reservas para este filtro</div>';
    return;
  }
  document.getElementById('reservas-lista').innerHTML=filtradas.map(r=>{
    const c=CANCHAS.find(c=>c.id===r.canchaId);
    return `<div class="reserva-item">
      <div class="reserva-top">
        <div class="reserva-cancha-dot" style="background:${c?c.color:'#888'}"></div>
        <div class="reserva-body">
          <div class="reserva-nombre">${r.nombre}</div>
          <div class="reserva-detalle">
            ${c?c.nombre:''} · ${r.fecha.split('-').reverse().join('/')} · ${r.hora} hs · ${r.jugadores} jug.<br>
            Tel: ${r.tel}
          </div>
        </div>
        <span class="chip ${r.estado==='confirmado'?'chip-confirmado':'chip-pendiente'}">${r.estado}</span>
      </div>
      <div class="reserva-actions">
        ${r.estado==='pendiente'?`<button class="btn-sm confirmar" onclick="accionReserva(${r.id},'confirmar')">✓ Confirmar</button>`:''}
        <button class="btn-sm cancelar" onclick="accionReserva(${r.id},'cancelar')">Cancelar</button>
      </div>
    </div>`;
  }).join('');
}

function accionReserva(id, accion) {
  if(accion==='cancelar') { reservas=reservas.filter(r=>r.id!==id); toast('Reserva cancelada',''); }
  else { const r=reservas.find(r=>r.id===id); if(r){r.estado='confirmado';toast('Reserva confirmada ✓','verde');} }
  renderAdminPanel(); renderCanchas();
}

/* ===== UTILS ===== */
function fmtFecha(d) { return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function fmtDia(y,m,d) { return y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0'); }

function toast(msg, tipo) {
  const t=document.getElementById('toast');
  t.textContent=msg; t.className='toast show'+(tipo?' '+tipo:'');
  setTimeout(()=>t.className='toast',3000);
}

renderCanchas();
