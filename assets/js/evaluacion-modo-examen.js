// Modo examen: la evaluación se presenta en pantalla completa y se cuenta cada
// vez que el aprendiz se sale (cambia de pestaña, minimiza, pasa a otro
// programa o sale de pantalla completa). Una página web no puede impedir que
// se salga, pero sí detectarlo. Al llegar al máximo de salidas avisa con
// alAgotar para que la evaluación se envíe sola.
//
// Mientras el aprendiz está fuera, la ventana de aviso tapa las preguntas
// hasta que vuelve a pantalla completa con el botón.

const permitePantallaCompleta = () => Boolean(document.documentElement.requestFullscreen);

export function activarModoExamen({ salidas, maxSalidas, alSalir, alAgotar }) {
  const dialogo = document.getElementById('eval-dialogo');
  const texto = document.getElementById('eval-dialogo-texto');
  const boton = document.getElementById('eval-dialogo-boton');
  let dentro = false;

  const avisar = (mensaje) => {
    texto.textContent = mensaje;
    if (!dialogo.open) dialogo.showModal();
  };

  // Se registra una sola salida aunque el navegador dispare varios eventos
  // seguidos (por ejemplo, blur y visibilitychange al cambiar de pestaña).
  const registrarSalida = () => {
    if (!dentro) return;
    dentro = false;
    salidas += 1;
    alSalir(salidas);
    if (salidas >= maxSalidas) {
      detener();
      alAgotar();
      return;
    }
    avisar(`⚠️ Saliste de la evaluación (${salidas} de ${maxSalidas}). Si sales ${maxSalidas} veces, la evaluación se envía sola con lo que lleves validado.`);
  };

  const alCambiarVisibilidad = () => { if (document.hidden) registrarSalida(); };
  const alSalirDePantallaCompleta = () => { if (!document.fullscreenElement) registrarSalida(); };

  // Esc cierra un <dialog>; aquí no se permite, solo se vuelve con el botón.
  const alCancelar = (e) => e.preventDefault();

  const volver = async () => {
    if (permitePantallaCompleta()) {
      try { await document.documentElement.requestFullscreen(); } catch { /* el navegador lo negó */ }
    }
    dialogo.close();
    dentro = true;
  };

  function detener() {
    document.removeEventListener('visibilitychange', alCambiarVisibilidad);
    document.removeEventListener('fullscreenchange', alSalirDePantallaCompleta);
    window.removeEventListener('blur', registrarSalida);
    dialogo.removeEventListener('cancel', alCancelar);
    boton.removeEventListener('click', volver);
    if (dialogo.open) dialogo.close();
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }

  document.addEventListener('visibilitychange', alCambiarVisibilidad);
  document.addEventListener('fullscreenchange', alSalirDePantallaCompleta);
  window.addEventListener('blur', registrarSalida);
  dialogo.addEventListener('cancel', alCancelar);
  boton.addEventListener('click', volver);

  // Pantalla completa solo se puede pedir tras un clic, por eso se empieza
  // con la ventana de aviso y su botón.
  avisar(salidas === 0
    ? `La evaluación se presenta en pantalla completa. No cambies de pestaña ni abras otros programas: cada salida queda registrada y a la salida número ${maxSalidas} la evaluación se envía sola.`
    : `⚠️ Llevas ${salidas} de ${maxSalidas} salidas. Si sales ${maxSalidas} veces, la evaluación se envía sola con lo que lleves validado.`);

  return { detener };
}
