// Evaluación Node + Express + Flutter.
// Flujo: el aprendiz elige su nombre y confirma su cédula → se sortean las
// preguntas de selección (opciones barajadas) y las de código → se presentan
// en modo examen (pantalla completa, salidas registradas) → cada pregunta se
// valida con su botón y queda bloqueada → al enviar se muestra el resultado.
// El intento se guarda en este navegador desde que empieza: si se recarga la
// página vuelve a las mismas preguntas (y cuenta como salida), y al terminar
// no se puede repetir.
import { APRENDICES, SAL } from './evaluacion-aprendices.js';
import { cifrarCedula } from './evaluacion-cedula.js';
import { activarModoExamen } from './evaluacion-modo-examen.js';
import { BANCO, BANCO_CODIGO, CODIGO_POR_MODULO, MODULOS, PREGUNTAS_POR_MODULO } from './evaluacion-preguntas.js';

// A la salida número MAX_SALIDAS la evaluación se envía sola.
const MAX_SALIDAS = 3;

// Desde cuándo se puede presentar (hora de Colombia, UTC-5). Antes de esa hora
// la pantalla de ingreso muestra una cuenta regresiva y no deja empezar.
// Se toma la hora del computador del aprendiz.
const INICIO = new Date('2026-10-30T06:15:00-05:00');

const CLAVE_INTENTO = (huella) => `adso:evaluacion-node-flutter:${huella.slice(0, 16)}`;

// Fisher-Yates: devuelve una copia barajada sin modificar el arreglo original.
function barajar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Toma al azar, de cada módulo, la cantidad indicada en el objeto de cupos.
function sortearPorModulo(banco, cupos) {
  return Object.entries(cupos).flatMap(([modulo, cantidad]) =>
    barajar(banco.filter((p) => p.modulo === modulo)).slice(0, cantidad));
}

// Las de selección se mezclan entre sí y las de código van al final.
// Cada pregunta de selección guarda sus opciones barajadas y cuál es la
// correcta (en el banco la correcta siempre es la primera). Las de código
// guardan su posición en BANCO_CODIGO para revisarlas con sus criterios.
function sortearPreguntas() {
  const seleccion = barajar(sortearPorModulo(BANCO, PREGUNTAS_POR_MODULO)).map((pregunta) => {
    const opciones = barajar(pregunta.opciones);
    return {
      tipo: 'seleccion',
      modulo: MODULOS[pregunta.modulo],
      texto: pregunta.texto,
      opciones,
      correcta: opciones.indexOf(pregunta.opciones[0]),
    };
  });

  const codigo = barajar(sortearPorModulo(BANCO_CODIGO, CODIGO_POR_MODULO)).map((pregunta) => ({
    tipo: 'codigo',
    modulo: MODULOS[pregunta.modulo],
    texto: pregunta.texto,
    indice: BANCO_CODIGO.indexOf(pregunta),
  }));

  return [...seleccion, ...codigo];
}

// Una pregunta de código es correcta si cumple todos sus criterios.
function calificar(pregunta, respuesta) {
  if (pregunta.tipo === 'seleccion') return { bien: respuesta === pregunta.correcta };
  const { criterios } = BANCO_CODIGO[pregunta.indice];
  const cumplidos = criterios.filter((c) => c.patron.test(respuesta)).length;
  return { bien: cumplidos === criterios.length, cumplidos, total: criterios.length };
}

// Resultado de una pregunta que quedó sin validar cuando se envió la evaluación.
function sinResponder(pregunta) {
  if (pregunta.tipo === 'seleccion') return { bien: false, sinResponder: true };
  return { bien: false, sinResponder: true, cumplidos: 0, total: BANCO_CODIGO[pregunta.indice].criterios.length };
}

// Un intento nuevo empieza con todas las respuestas en null; "fecha" solo
// existe cuando la evaluación se envía.
function nuevoIntento() {
  const preguntas = sortearPreguntas();
  return { preguntas, respuestas: preguntas.map(() => null), resultados: preguntas.map(() => null), salidas: 0 };
}

function leerIntento(huella) {
  try { return JSON.parse(localStorage.getItem(CLAVE_INTENTO(huella))); } catch { return null; }
}

function guardarIntento(huella, intento) {
  try { localStorage.setItem(CLAVE_INTENTO(huella), JSON.stringify(intento)); } catch { /* sin almacenamiento */ }
}

function mostrar(idPantalla) {
  ['eval-ingreso', 'eval-preguntas', 'eval-resultado'].forEach((id) => {
    document.getElementById(id).hidden = id !== idPantalla;
  });
  window.scrollTo({ top: 0 });
}

function crearOpciones(grupo, pregunta, i) {
  pregunta.opciones.forEach((opcion, j) => {
    const etiqueta = document.createElement('label');
    etiqueta.className = 'eval-opcion';
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = `pregunta-${i}`;
    radio.value = String(j);
    const texto = document.createElement('span');
    texto.textContent = opcion;
    etiqueta.append(radio, texto);
    grupo.append(etiqueta);
  });
}

// El código se escribe a mano: se bloquea pegar y soltar texto en el editor.
function crearEditor(grupo, i) {
  const editor = document.createElement('textarea');
  editor.className = 'eval-codigo';
  editor.name = `pregunta-${i}`;
  editor.rows = 6;
  editor.spellcheck = false;
  editor.autocomplete = 'off';
  editor.setAttribute('aria-label', `Tu código para la pregunta ${i + 1}`);
  editor.placeholder = 'Escribe aquí tu código…';
  ['paste', 'drop'].forEach((evento) => editor.addEventListener(evento, (e) => e.preventDefault()));
  const aviso = document.createElement('small');
  aviso.className = 'eval-aviso';
  aviso.textContent = '✍️ Escríbelo a mano: en este campo no se puede pegar.';
  grupo.append(editor, aviso);
}

function pintarPreguntas(preguntas) {
  const lista = document.getElementById('eval-lista');
  lista.replaceChildren(...preguntas.map((pregunta, i) => {
    const item = document.createElement('li');
    const grupo = document.createElement('fieldset');
    grupo.className = 'eval-pregunta';
    grupo.id = `eval-pregunta-${i}`;
    const enunciado = document.createElement('legend');
    enunciado.textContent = `${i + 1}. ${pregunta.texto}`;
    const modulo = document.createElement('span');
    modulo.className = 'eval-modulo';
    modulo.textContent = pregunta.tipo === 'codigo' ? `${pregunta.modulo} · Escribe el código` : pregunta.modulo;
    grupo.append(enunciado, modulo);

    if (pregunta.tipo === 'codigo') crearEditor(grupo, i);
    else crearOpciones(grupo, pregunta, i);

    // Botón de validar y el mensaje que dice si la respuesta es correcta.
    const pie = document.createElement('footer');
    pie.className = 'eval-validar-fila';
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'eval-validar';
    boton.dataset.indice = String(i);
    boton.textContent = 'Validar respuesta';
    const mensaje = document.createElement('p');
    mensaje.className = 'eval-mensaje';
    mensaje.setAttribute('role', 'status');
    pie.append(boton, mensaje);
    grupo.append(pie);

    item.append(grupo);
    return item;
  }));
}

// Muestra el resultado de una pregunta validada y la deja sin poder cambiarse.
function bloquearPregunta(i, resultado) {
  const grupo = document.getElementById(`eval-pregunta-${i}`);
  const mensaje = grupo.querySelector('.eval-mensaje');
  grupo.disabled = true;
  grupo.classList.add(resultado.bien ? 'bien' : 'mal');
  mensaje.className = `eval-mensaje ${resultado.bien ? 'bien' : 'mal'}`;
  if (resultado.total) {
    mensaje.textContent = resultado.bien
      ? '✅ ¡Correcto! Tu código cumple todos los elementos.'
      : `❌ Tu código cumple ${resultado.cumplidos} de ${resultado.total} elementos.`;
  } else {
    mensaje.textContent = resultado.bien ? '✅ ¡Correcta!' : '❌ Incorrecta.';
  }
}

function pintarResultado(aprendiz, cedula, intento) {
  const total = intento.preguntas.length;
  document.getElementById('eval-nota').textContent = `${intento.aciertos} de ${total} correctas`;
  document.getElementById('eval-datos').textContent =
    `${aprendiz.nombre} · C.C. ${cedula} · ${new Date(intento.fecha).toLocaleString('es-CO')}`;

  // Cuántas veces salió el aprendiz durante la evaluación, para el instructor.
  const salidas = document.getElementById('eval-salidas');
  salidas.className = `eval-salidas ${intento.salidas ? 'mal' : 'bien'}`;
  salidas.textContent = intento.enviadaSola
    ? `🚫 Salió de la evaluación ${intento.salidas} veces: se envió sola y las preguntas sin validar cuentan como incorrectas.`
    : `${intento.salidas ? '⚠️' : '🔒'} Salidas de la evaluación: ${intento.salidas} de ${MAX_SALIDAS} permitidas.`;

  // En las de código se muestra lo que escribió el aprendiz para que el
  // instructor lo revise y, si hace falta, ajuste la nota.
  document.getElementById('eval-repaso').replaceChildren(...intento.preguntas.map((pregunta, i) => {
    const item = document.createElement('li');
    const resultado = intento.resultados[i];
    item.className = resultado.bien ? 'bien' : 'mal';
    item.textContent = `${resultado.bien ? '✅' : '❌'} ${pregunta.texto}${resultado.sinResponder ? ' (sin validar)' : ''}`;
    if (pregunta.tipo === 'codigo' && !resultado.sinResponder) {
      const detalle = document.createElement('small');
      detalle.className = 'eval-aviso';
      detalle.textContent = `Revisión automática: cumple ${resultado.cumplidos} de ${resultado.total} elementos.`;
      const codigo = document.createElement('pre');
      codigo.className = 'eval-codigo-enviado';
      codigo.textContent = intento.respuestas[i];
      item.append(detalle, codigo);
    }
    return item;
  }));
}

function iniciar() {
  const selector = document.getElementById('eval-aprendiz');
  if (!selector) return;

  // Orden alfabético por nombre para que cada aprendiz se encuentre rápido.
  // El valor de cada opción es su posición en APRENDICES.
  APRENDICES
    .map((aprendiz, indice) => ({ aprendiz, indice }))
    .sort((a, b) => a.aprendiz.nombre.localeCompare(b.aprendiz.nombre, 'es'))
    .forEach(({ aprendiz, indice }) => selector.add(new Option(aprendiz.nombre, String(indice))));

  let aprendiz = null;
  let cedula = '';
  let intento = null;
  let modoExamen = null;

  const cuestionario = document.getElementById('eval-cuestionario');
  const progreso = document.getElementById('eval-progreso');

  const actualizarProgreso = () => {
    const validadas = intento.resultados.filter(Boolean).length;
    progreso.textContent = `${validadas} de ${intento.preguntas.length} validadas`;
  };

  // Respuesta de la pregunta i: índice de la opción marcada, o el código
  // escrito. null si todavía no se ha respondido.
  const leerRespuesta = (i) => {
    if (intento.preguntas[i].tipo === 'codigo') {
      return cuestionario.elements[`pregunta-${i}`].value.trim() || null;
    }
    const marcada = cuestionario.querySelector(`[name="pregunta-${i}"]:checked`);
    return marcada ? Number(marcada.value) : null;
  };

  // Al volver a un intento a medias, se ponen las respuestas ya validadas.
  const restaurarValidadas = () => {
    intento.resultados.forEach((resultado, i) => {
      if (!resultado) return;
      const respuesta = intento.respuestas[i];
      if (intento.preguntas[i].tipo === 'codigo') cuestionario.elements[`pregunta-${i}`].value = respuesta;
      else cuestionario.querySelector(`[name="pregunta-${i}"][value="${respuesta}"]`).checked = true;
      bloquearPregunta(i, resultado);
    });
  };

  // Manda el resultado a Supabase para que el instructor lo vea en el panel
  // de admin. Se importa aquí, y no arriba, para que si la conexión falla la
  // evaluación siga funcionando y el aprendiz pueda reintentar el envío.
  const estadoEnvio = document.getElementById('eval-envio');
  const botonReintentar = document.getElementById('eval-reintentar');
  const enviarAlInstructor = async () => {
    botonReintentar.hidden = true;
    estadoEnvio.className = 'eval-envio';
    estadoEnvio.textContent = 'Enviando tu resultado al instructor…';
    try {
      const { enviarResultado } = await import('./evaluacion-supabase.js');
      const estado = await enviarResultado({
        nombre: aprendiz.nombre,
        huella: aprendiz.huella,
        aciertos: intento.aciertos,
        total: intento.preguntas.length,
        salidas: intento.salidas,
        enviada_sola: intento.enviadaSola,
        detalle: { preguntas: intento.preguntas, respuestas: intento.respuestas, resultados: intento.resultados },
      });
      intento.enviado = true;
      guardarIntento(aprendiz.huella, intento);
      estadoEnvio.className = 'eval-envio bien';
      estadoEnvio.textContent = estado === 'repetido'
        ? '✅ Tu resultado ya estaba registrado con el instructor.'
        : '✅ Resultado enviado al instructor.';
    } catch (error) {
      console.error('No se pudo enviar el resultado:', error);
      estadoEnvio.className = 'eval-envio mal';
      estadoEnvio.textContent = '⚠️ No se pudo enviar tu resultado. Revisa la conexión a internet y presiona Reintentar.';
      botonReintentar.hidden = false;
    }
  };
  botonReintentar.addEventListener('click', enviarAlInstructor);

  // Pantalla final; si el resultado aún no llegó al instructor, se reintenta.
  const mostrarFinal = () => {
    pintarResultado(aprendiz, cedula, intento);
    mostrar('eval-resultado');
    if (intento.enviado) {
      estadoEnvio.className = 'eval-envio bien';
      estadoEnvio.textContent = '✅ Resultado enviado al instructor.';
    } else {
      enviarAlInstructor();
    }
  };

  // Cierra la evaluación. Si se envía sola (por salidas), las preguntas sin
  // validar cuentan como incorrectas.
  const finalizar = (enviadaSola) => {
    modoExamen?.detener();
    intento.resultados = intento.resultados.map((r, i) => r ?? sinResponder(intento.preguntas[i]));
    intento.aciertos = intento.resultados.filter((r) => r.bien).length;
    intento.enviadaSola = enviadaSola;
    intento.fecha = new Date().toISOString();
    guardarIntento(aprendiz.huella, intento);
    mostrarFinal();
  };

  const empezarExamen = () => {
    // Si ya había empezado, volver a entrar (recargar, cerrar la pestaña)
    // cuenta como una salida.
    if (intento.iniciado) intento.salidas += 1;
    intento.iniciado = true;
    guardarIntento(aprendiz.huella, intento);
    if (intento.salidas >= MAX_SALIDAS) { finalizar(true); return; }

    pintarPreguntas(intento.preguntas);
    restaurarValidadas();
    actualizarProgreso();
    document.getElementById('eval-quien').textContent = aprendiz.nombre;
    mostrar('eval-preguntas');

    modoExamen = activarModoExamen({
      salidas: intento.salidas,
      maxSalidas: MAX_SALIDAS,
      alSalir: (salidas) => { intento.salidas = salidas; guardarIntento(aprendiz.huella, intento); },
      alAgotar: () => finalizar(true),
    });
  };

  const formulario = document.getElementById('eval-form');
  const botonEntrar = formulario.querySelector('[type="submit"]');

  // Cuenta regresiva hasta INICIO; mientras tanto el botón de empezar está
  // deshabilitado. Al llegar la hora se habilita sin recargar la página.
  const horario = document.getElementById('eval-horario');
  const fechaInicio = INICIO.toLocaleString('es-CO', {
    timeZone: 'America/Bogota', weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit',
  });
  const actualizarHorario = () => {
    const falta = INICIO - Date.now();
    if (falta <= 0) {
      horario.className = 'eval-horario abierta';
      horario.textContent = '🟢 La evaluación está abierta.';
      botonEntrar.disabled = false;
      clearInterval(reloj);
      return;
    }
    const segundos = Math.floor(falta / 1000);
    const dias = Math.floor(segundos / 86400);
    const horas = String(Math.floor((segundos % 86400) / 3600)).padStart(2, '0');
    const minutos = String(Math.floor((segundos % 3600) / 60)).padStart(2, '0');
    const segs = String(segundos % 60).padStart(2, '0');
    horario.className = 'eval-horario';
    horario.textContent = `⏰ La evaluación empieza el ${fechaInicio}. Faltan ${dias ? `${dias} d ` : ''}${horas}:${minutos}:${segs}`;
    botonEntrar.disabled = true;
  };
  const reloj = setInterval(actualizarHorario, 1000);
  actualizarHorario();

  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    const error = document.getElementById('eval-error');
    if (Date.now() < INICIO) { error.textContent = `La evaluación empieza el ${fechaInicio}.`; return; }
    aprendiz = APRENDICES[selector.value] ?? null;
    cedula = document.getElementById('eval-cedula').value.replace(/\D/g, '');

    if (!aprendiz) { error.textContent = 'Selecciona tu nombre en la lista.'; return; }
    if (!cedula) { error.textContent = 'Escribe tu cédula.'; return; }

    // Se compara la huella de lo escrito con la guardada; tarda un instante.
    botonEntrar.disabled = true;
    error.textContent = '';
    let huella = '';
    try {
      huella = await cifrarCedula(cedula, SAL);
    } catch {
      error.textContent = 'Este navegador no pudo verificar la cédula. Abre la evaluación desde el enlace https.';
    }
    botonEntrar.disabled = false;
    if (!huella) return;
    if (huella !== aprendiz.huella) { error.textContent = 'La cédula no coincide con el nombre seleccionado.'; return; }

    intento = leerIntento(aprendiz.huella);
    if (intento?.fecha) { mostrarFinal(); return; }
    if (!intento) intento = nuevoIntento();
    empezarExamen();
  });

  cuestionario.addEventListener('click', (e) => {
    const boton = e.target.closest('.eval-validar');
    if (!boton) return;
    const i = Number(boton.dataset.indice);
    const respuesta = leerRespuesta(i);
    if (respuesta === null) {
      boton.nextElementSibling.textContent = 'Responde antes de validar.';
      return;
    }

    const resultado = calificar(intento.preguntas[i], respuesta);
    intento.respuestas[i] = respuesta;
    intento.resultados[i] = resultado;
    guardarIntento(aprendiz.huella, intento);
    bloquearPregunta(i, resultado);
    actualizarProgreso();
  });

  cuestionario.addEventListener('submit', (e) => {
    e.preventDefault();
    const error = document.getElementById('eval-error-cuestionario');
    const pendiente = intento.resultados.findIndex((r) => !r);
    if (pendiente !== -1) {
      error.textContent = `Te falta validar la pregunta ${pendiente + 1}.`;
      return;
    }
    error.textContent = '';
    finalizar(false);
  });
}

// Las pantallas llegan con el cargador de componentes; se inicia cuando avisa.
document.addEventListener('adso:componentsLoaded', iniciar);
