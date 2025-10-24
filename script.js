// ===============================
// 🔹 CONFIGURACIÓN DE COLORES
// ===============================
const COLORS = { 0: 'pending', 1: 'yellow', 2: 'green' };
const STATE_CLASSES = ['is-pending', 'is-yellow', 'is-green'];

// ===============================
// 🔹 CONEXIÓN CON FIREBASE (v8)
//    (asegurate de cargar los SDK v8 en el HTML ANTES de este script)
// ===============================
const firebaseConfig = {
  apiKey: "AZaSyCckk3cnd406blhgvOxRknoQbFoAfNUJc0",
  authDomain: "migracionads.firebaseapp.com",
  databaseURL: "https://migracionads-default-rtdb.firebaseio.com",
  projectId: "migracionads",
  storageBucket: "migracionads.appspot.com",
  messagingSenderId: "242255460413",
  appId: "1:242255460413:web:442ca0b9e9d97ad1dd5254"
};

// evita re-inicializar si este archivo se carga 2 veces
if (!firebase.apps || !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();
const tareasRef = db.ref("tareas");

// ===============================
// 🔹 UI HELPERS
// ===============================
function setTaskVisual(el) {
  const st = +el.dataset.state || 0;
  el.classList.remove(...STATE_CLASSES);
  el.classList.add(`is-${COLORS[st]}`);
}

function computeBlockStatus(block) {
  if (!block) return;
  const states = [...block.querySelectorAll('.task')].map(t => +t.dataset.state || 0);
  let status = 'pending';
  if (states.some(s => s === 1)) status = 'yellow';
  else if (states.length && states.every(s => s === 2)) status = 'green';
  else status = 'pending';
  block.dataset.status = status;
}

function refreshAll() {
  document.querySelectorAll('.task').forEach(setTaskVisual);
  document.querySelectorAll('.bloque').forEach(computeBlockStatus);
}

// ===============================
// 🔹 SINCRONIZACIÓN CON FIREBASE
// ===============================
let saveTimer = null;
const SAVE_DELAY_MS = 250; // debounce de guardado

async function cargarEstado() {
  try {
    const snap = await tareasRef.once('value');
    const data = snap.val() || {};
    document.querySelectorAll('.task').forEach(t => {
      const key = t.dataset.key;
      const state = key && data[key] !== undefined ? Number(data[key]) : 0;
      t.dataset.state = String(state);
      setTaskVisual(t);
    });
    document.querySelectorAll('.bloque').forEach(computeBlockStatus);
  } catch (err) {
    console.error('Error cargando estado desde Firebase:', err);
  }
}

// Guardado con debounce: escribe TODO el mapa de tareas (simple y robusto)
function guardarEstadoDebounced() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    const nuevo = {};
    document.querySelectorAll('.task').forEach(t => {
      const key = t.dataset.key;
      if (key) nuevo[key] = +t.dataset.state || 0;
    });
    try {
      await tareasRef.set(nuevo);
    } catch (err) {
      console.error('Error guardando estado en Firebase:', err);
    }
  }, SAVE_DELAY_MS);
}

// (Opcional) Suscripción en vivo para reflejar cambios de otros clientes
function suscribirTiempoReal() {
  tareasRef.on('value', snap => {
    const data = snap.val() || {};
    let changed = false;
    document.querySelectorAll('.task').forEach(t => {
      const key = t.dataset.key;
      if (!key) return;
      const remote = data[key] !== undefined ? Number(data[key]) : 0;
      const local = Number(t.dataset.state || 0);
      if (remote !== local) {
        t.dataset.state = String(remote);
        setTaskVisual(t);
        changed = true;
      }
    });
    if (changed) {
      document.querySelectorAll('.bloque').forEach(computeBlockStatus);
    }
  });
}

// ===============================
// 🔹 INTERACCIÓN (clic + teclado)
// ===============================
function handleTaskToggle(t) {
  let st = (+t.dataset.state || 0) + 1;
  if (st > 2) st = 0;       // 0→1→2→0
  t.dataset.state = String(st);
  setTaskVisual(t);
  computeBlockStatus(t.closest('.bloque'));
  guardarEstadoDebounced();
}

document.addEventListener('click', e => {
  const t = e.target.closest('.task');
  if (!t) return;
  handleTaskToggle(t);
});

document.addEventListener('keydown', e => {
  // Accesibilidad: Enter o Space sobre .task
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('task')) {
    e.preventDefault();
    handleTaskToggle(e.target);
  }
});

// ===============================
// 🔹 INICIO
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  // pinta visual por defecto
  refreshAll();
  // sincroniza con la base
  cargarEstado();
  // escucha cambios remotos
  suscribirTiempoReal();
});


