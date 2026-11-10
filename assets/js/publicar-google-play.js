// Guía: publicar la app Flutter en Google Play Store.
import { iniciarChecklist } from './google-play-checklist.js';

const GRUPOS = [
  { t: 'A. Cuenta y decisiones', i: ['Definida la cuenta de desarrollador que se usará', 'Documento de identidad y prueba de dirección listos (nombre y dirección coinciden con el documento)', 'Registro y verificación de identidad en Play Console completados', 'Pago de registro realizado (valor vigente verificado)'] },
  { t: 'B. Proyecto Flutter', i: ['<code>applicationId</code> propio y único (sin com.example)', '<code>version</code> con versionCode correcto en pubspec.yaml', 'Nombre visible, ícono y permiso INTERNET configurados', '<code>useRemote = true</code> con la URL de Render', 'Plan de pruebas ejecutado: sin errores graves abiertos'] },
  { t: 'C. Firma y bundle', i: ['Keystore creado y guardado con copia de seguridad', '<code>key.properties</code> creado y fuera de GitHub', 'Firma configurada en build.gradle', '<code>flutter build appbundle --release</code> genera el .aab sin errores'] },
  { t: 'D. Ficha y políticas', i: ['Política de privacidad publicada con URL', 'Descripciones corta y larga redactadas', 'Ícono y capturas de pantalla listos', 'Seguridad de los datos y clasificación del contenido completadas', 'Credenciales de prueba (usuario y contraseña) cargadas para los revisores'] },
  { t: 'E. Pruebas con testers', i: ['App creada en Play Console', '.aab subido a Prueba interna', 'Prueba cerrada creada y enlace de invitación compartido', 'Mínimo 12 testers invitados con cuenta de Google', 'Registro de comentarios y correcciones llevado durante 14 días', 'Solicitud de acceso a producción enviada'] },
  { t: 'F. Servicios', i: ['Backend en Render con estado Live', 'Monitor de UptimeRobot activo', 'Usuario de prueba verificado funcionando en la app instalada'] },
];

document.addEventListener('adso:componentsLoaded', () => {
  // Los bloques de código no se copian: se escriben a mano.
  document.querySelectorAll('.code-block').forEach((bloque) => {
    ['copy', 'cut', 'contextmenu', 'dragstart', 'selectstart'].forEach((ev) => bloque.addEventListener(ev, (e) => e.preventDefault()));
  });
  document.getElementById('btn-imprimir')?.addEventListener('click', () => window.print());
  iniciarChecklist('checklist_publicar_google_play_v1', GRUPOS);
});
