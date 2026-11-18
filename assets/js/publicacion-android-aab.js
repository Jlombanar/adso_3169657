// Módulo 2 · Publicación Android (AAB).
// Las secciones llegan con component-loader.js; todo se inicia al terminar la carga.

// Agrega un botón "Copiar" a cada bloque de código.
function iniciarBotonesCopiar() {
  document.querySelectorAll('.code-block').forEach((bloque) => {
    const envoltura = document.createElement('div');
    envoltura.className = 'code-wrap';
    bloque.parentNode.insertBefore(envoltura, bloque);
    envoltura.appendChild(bloque);
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'copy-btn';
    boton.textContent = 'Copiar';
    boton.addEventListener('click', async () => {
      const texto = bloque.innerText.replace(/\s+$/, '');
      try {
        await navigator.clipboard.writeText(texto);
        boton.textContent = '¡Copiado!';
        boton.classList.add('ok');
        setTimeout(() => { boton.textContent = 'Copiar'; boton.classList.remove('ok'); }, 1600);
      } catch {
        boton.textContent = 'Selecciona y copia';
      }
    });
    envoltura.appendChild(boton);
  });
}

// Checklist con avance guardado en este navegador.
function iniciarChecklist() {
  const CLAVE = 'sena-checklist-publicacion-aab';
  const cajas = [...document.querySelectorAll('.check-item input')];
  if (!cajas.length) return;
  let guardado = {};
  try { guardado = JSON.parse(localStorage.getItem(CLAVE) || '{}') || {}; } catch { /* sin almacenamiento */ }
  const actualizar = () => {
    const hechos = cajas.filter((c) => c.checked).length;
    cajas.forEach((c) => c.closest('.check-item').classList.toggle('hecho', c.checked));
    document.getElementById('ck-hechos').textContent = hechos;
    document.getElementById('ck-total').textContent = cajas.length;
    document.getElementById('ck-barra').style.width = `${(hechos / cajas.length) * 100}%`;
    document.getElementById('ck-final').classList.toggle('visible', hechos === cajas.length);
  };
  const guardar = () => {
    const estado = Object.fromEntries(cajas.map((c) => [c.dataset.id, c.checked]));
    try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch { /* sin almacenamiento */ }
  };
  cajas.forEach((c) => {
    c.checked = !!guardado[c.dataset.id];
    c.addEventListener('change', () => { actualizar(); guardar(); });
  });
  document.querySelectorAll('.ci-ref').forEach((a) => a.addEventListener('click', (e) => e.stopPropagation()));
  document.getElementById('ck-reset')?.addEventListener('click', () => {
    cajas.forEach((c) => { c.checked = false; });
    actualizar(); guardar();
  });
  actualizar();
}

document.addEventListener('adso:componentsLoaded', () => {
  iniciarBotonesCopiar();
  iniciarChecklist();
  // Ir al ancla de la URL cuando ya existen las secciones.
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
});
