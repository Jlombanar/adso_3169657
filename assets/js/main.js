// Los bloques de código llegan con los componentes, así que la protección
// contra copiar se aplica cuando el cargador avisa que terminó.
document.addEventListener('adso:componentsLoaded', () => {
  const eventosBloqueados = ['copy', 'cut', 'contextmenu', 'dragstart', 'selectstart'];
  document.querySelectorAll('.code-block').forEach((bloque) => {
    eventosBloqueados.forEach((evento) => {
      bloque.addEventListener(evento, (e) => e.preventDefault());
    });
    bloque.setAttribute('oncopy', 'return false');
  });

  // Si la página se abrió con un enlace a una sección (#render), se baja hasta
  // ella ahora que el contenido existe.
  if (location.hash) {
    document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }

  // Botón de accesibilidad (pantallas de inicio): agranda el texto y recuerda
  // la preferencia del visitante.
  const btnAccesibilidad = document.querySelector('.btn-accesibilidad');
  if (btnAccesibilidad) {
    const aplicar = (activo) => {
      document.documentElement.classList.toggle('texto-grande', activo);
      btnAccesibilidad.setAttribute('aria-pressed', String(activo));
    };
    try { aplicar(localStorage.getItem('adso:textoGrande') === '1'); } catch { /* sin almacenamiento */ }
    btnAccesibilidad.addEventListener('click', () => {
      const activo = btnAccesibilidad.getAttribute('aria-pressed') !== 'true';
      aplicar(activo);
      try { localStorage.setItem('adso:textoGrande', activo ? '1' : '0'); } catch { /* sin almacenamiento */ }
    });
  }
});
