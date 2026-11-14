// Visor de capturas: clic o Enter amplía; clic o Escape cierra.
// Requiere en la página <div id="lb"><img id="lbi"></div> y figuras .shot img.
export function iniciarVisor() {
  const visor = document.getElementById('lb');
  const imagen = document.getElementById('lbi');
  if (!visor || !imagen) return;
  let origen = null;
  const abrir = (img) => { origen = img; imagen.src = img.src; imagen.alt = img.alt; visor.style.display = 'flex'; };
  const cerrar = () => { visor.style.display = 'none'; origen?.focus(); };
  document.querySelectorAll('.shot img').forEach((img) => {
    img.addEventListener('click', () => abrir(img));
    img.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(img); } });
  });
  visor.addEventListener('click', cerrar);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && visor.style.display === 'flex') cerrar(); });
}
