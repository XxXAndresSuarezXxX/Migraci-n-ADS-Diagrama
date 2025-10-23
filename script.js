// ===============================
// 🔹 CONFIGURACIÓN DE COLORES
// ===============================
const COLORS = { 0: 'pending', 1: 'yellow', 2: 'green' };

// ===============================
// 🔹 CONEXIÓN CON FIREBASE
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

// Inicializar Firebase y la base de datos
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const tareasRef = db.ref("tareas");

// ===============================
// 🔹 FUNCIONES DE SINCRONIZACIÓN
// ===============================

// Cargar estado desde Firebase
async function cargarEstado() {
  try {
    const snapshot = await tareasRef.once("value");
    const data = snapshot.val() || {};
    document.querySelectorAll(".task").forEach(t => {
      const key = t.dataset.key;
      const state = data[key] !== undefined ? data[key] : 0;
      t.dataset.state = state;
      setTaskVisual(t);
      computeBlockStatus(t.closest('.bloque'));
    });
  } catch (err) {
    console.error("Error cargando estado desde Firebase:", err);
  }
}

// Guardar estado en Firebase
async function guardarEstado() {
  const nuevo = {};
  document.querySelectorAll(".task").forEach(t => {
    nuevo[t.dataset.key] = +t.dataset.state;
  });
  await tareasRef.set(nuevo);
}

// ===============================
// 🔹 FUNCIONES DE INTERFAZ
// ===============================
function setTaskVisual(el) {
  const st = +el.dataset.state || 0;
  el.classList.remove('is-pending', 'is-yellow', 'is-green');
  el.classList.add('is-' + COLORS[st]);
}

function computeBlockStatus(block) {
  const states = [...block.querySelectorAll('.task')].map(t => +t.dataset.state || 0);
  let status = 'pending';
  if (states.some(s => s === 1)) status = 'yellow';
  else if (states.length && states.every(s => s === 2)) status = 'green';
  block.dataset.status = status;
}

// ===============================
// 🔹 EVENTOS DE INTERACCIÓN
// ===============================
document.addEventListener('click', e => {
  const t = e.target.closest('.task');
  if (!t) return;
  let st = (+t.dataset.state || 0) + 1;
  if (st > 2) st = 0;
  t.dataset.state = st;
  setTaskVisual(t);
  computeBlockStatus(t.closest('.bloque'));
  guardarEstado(); // 💾 guarda cambios en Firebase
});

// ===============================
// 🔹 INICIO AUTOMÁTICO
// ===============================
document.addEventListener('DOMContentLoaded', cargarEstado);

