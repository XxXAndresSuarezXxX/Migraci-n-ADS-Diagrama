const COLORS = {0:'pending',1:'yellow',2:'green'};

// Cargar estado.json
async function cargarEstado() {
  try {
    const res = await fetch('estado.json?_=' + Date.now());
    const data = await res.json();
    document.querySelectorAll('.task').forEach(t => {
      const key = t.dataset.key;
      const val = data[key];
      const state = val ? 2 : 0;
      t.dataset.state = state;
      setTaskVisual(t);
      computeBlockStatus(t.closest('.bloque'));
    });
  } catch (err) {
    console.error('Error cargando estado:', err);
  }
}

// Guardar estado en el servidor
async function guardarEstado() {
  const nuevo = {};
  document.querySelectorAll('.task').forEach(t => {
    nuevo[t.dataset.key] = (+t.dataset.state === 2);
  });
  await fetch('/guardar', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(nuevo)
  });
}

function setTaskVisual(el){
  const st = +el.dataset.state || 0;
  el.classList.remove('is-pending','is-yellow','is-green');
  el.classList.add('is-'+COLORS[st]);
}

function computeBlockStatus(block){
  const states = [...block.querySelectorAll('.task')].map(t => +t.dataset.state || 0);
  let status = 'pending';
  if (states.some(s => s === 1)) status = 'yellow';
  else if (states.length && states.every(s => s === 2)) status = 'green';
  block.dataset.status = status;
}

document.addEventListener('click', e=>{
  const t = e.target.closest('.task');
  if(!t) return;
  let st = (+t.dataset.state || 0) + 1;
  if(st>2) st=0;
  t.dataset.state = st;
  setTaskVisual(t);
  computeBlockStatus(t.closest('.bloque'));
  guardarEstado(); // 💾 guarda cambios
});

document.addEventListener('DOMContentLoaded', cargarEstado);
