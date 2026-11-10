// Checklist con avance guardado en este navegador (localStorage).
// Recibe la clave de almacenamiento y los grupos [{t, i:[...]}].
export function iniciarChecklist(clave, grupos) {
  const cont = document.getElementById('cLista');
  if (!cont) return;
  let estado = {};
  try { estado = JSON.parse(localStorage.getItem(clave) || '{}') || {}; } catch { /* sin almacenamiento */ }
  let total = 0;
  grupos.forEach((g, gi) => {
    const grupo = document.createElement('div');
    grupo.className = 'grupo';
    grupo.innerHTML = `<h3>${g.t}</h3>` + g.i.map((x, ii) => {
      total++;
      return `<label class="chk"><input type="checkbox" data-id="${gi}-${ii}"><span>${x}</span></label>`;
    }).join('');
    cont.appendChild(grupo);
  });
  const actualizar = () => {
    let hechos = 0;
    cont.querySelectorAll('input').forEach((c) => {
      const on = !!estado[c.dataset.id];
      c.checked = on;
      c.parentNode.classList.toggle('hecho', on);
      if (on) hechos++;
    });
    const pct = Math.round((hechos / total) * 100);
    document.getElementById('cHechos').textContent = hechos;
    document.getElementById('cTotal').textContent = total;
    document.getElementById('cPct').textContent = `${pct}%`;
    document.getElementById('cBarra').style.width = `${pct}%`;
  };
  cont.addEventListener('change', (e) => {
    if (!e.target.dataset.id) return;
    estado[e.target.dataset.id] = e.target.checked;
    try { localStorage.setItem(clave, JSON.stringify(estado)); } catch { /* sin almacenamiento */ }
    actualizar();
  });
  document.getElementById('cReset')?.addEventListener('click', () => {
    if (!confirm('¿Reiniciar el checklist?')) return;
    estado = {};
    try { localStorage.removeItem(clave); } catch { /* sin almacenamiento */ }
    actualizar();
  });
  actualizar();
}
