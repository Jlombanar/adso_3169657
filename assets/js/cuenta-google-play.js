// Guía: crear la cuenta de desarrollador de Google Play.
import { iniciarChecklist } from './google-play-checklist.js';

// La guía se abre el jueves 12 de noviembre de 2026 a las 6:00 a. m. (Colombia).
// Usa el reloj del equipo del aprendiz.
const DISPONIBLE = new Date('2026-11-12T06:00:00-05:00');

const GRUPOS = [
  { t: 'Datos y documentos', i: ['Cuenta de Google que se usará siempre para Play Console', 'Nombre completo exactamente como aparece en el documento de identidad', 'Dirección con el mismo formato del comprobante de dirección', 'Documento de identidad vigente y comprobante de dirección a mano', 'Teléfono celular con prefijo +57 para la verificación'] },
  { t: 'Pago', i: ['Tarjeta que permita pagos en dólares', 'Cuota única de 25 USD disponible', 'Mayor de 18 años'] },
  { t: 'Decisiones', i: ['Nombre de desarrollador definido y revisado (ortografía)', 'Correo público y correo de contacto definidos', 'Persona voluntaria que abrirá la cuenta'] },
];

// Visor de capturas: clic o Enter amplía; clic o Escape cierra.
function iniciarVisor() {
  const visor = document.getElementById('lb');
  const imagen = document.getElementById('lbi');
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

// Muestra la cuenta regresiva y abre la guía cuando llega la hora.
function controlarHorario() {
  const bloqueo = document.getElementById('bloqueo');
  const contenido = document.getElementById('contenido');
  const reloj = document.getElementById('bloqueo-reloj');
  const dos = (n) => String(n).padStart(2, '0');
  const revisar = () => {
    const falta = DISPONIBLE - Date.now();
    if (falta <= 0) {
      bloqueo.hidden = true;
      contenido.hidden = false;
      if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
      return true;
    }
    const s = Math.floor(falta / 1000);
    const dias = Math.floor(s / 86400);
    reloj.textContent = `⏰ Faltan ${dias ? `${dias} d ` : ''}${dos(Math.floor(s / 3600) % 24)}:${dos(Math.floor(s / 60) % 60)}:${dos(s % 60)}`;
    return false;
  };
  if (revisar()) return;
  const intervalo = setInterval(() => { if (revisar()) clearInterval(intervalo); }, 1000);
}

document.addEventListener('adso:componentsLoaded', () => {
  controlarHorario();
  iniciarVisor();
  iniciarChecklist('checklist_cuenta_desarrollador_play_v1', GRUPOS);
});
