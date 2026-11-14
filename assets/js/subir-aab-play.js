// Guía: subir el AAB a prueba interna en Google Play Console.
import { iniciarChecklist } from './google-play-checklist.js';
import { iniciarVisor } from './google-play-visor.js';

const GRUPOS = [
  { t: 'Crear la app', i: ['App creada con el nombre del paquete igual al <code>applicationId</code>', 'Idioma es-419, Aplicación y Gratis seleccionados', 'Las tres declaraciones aceptadas'] },
  { t: 'Prueba interna', i: ['Lista de correos de verificadores creada y seleccionada', '<code>app-release.aab</code> subido con el versionCode correcto', 'Notas de la versión escritas', 'Versión publicada: la pista dice Activo', 'Vínculo de prueba compartido y app instalada desde Google Play'] },
  { t: 'Firma y Google Sign-In', i: ['SHA-1 de la clave de firma de la app copiada desde Play Console', 'Cliente Android creado en Google Cloud con el paquete y esa SHA-1', 'Login con Google probado en la app descargada de Play'] },
];

document.addEventListener('adso:componentsLoaded', () => {
  iniciarVisor();
  // Las secciones se cargan después del HTML: ir al ancla de la URL al terminar.
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  iniciarChecklist('checklist_subir_aab_play_v1', GRUPOS);
});
