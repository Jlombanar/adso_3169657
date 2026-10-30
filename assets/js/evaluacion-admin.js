// Panel de admin de la evaluación: el instructor inicia sesión con su cuenta
// de Supabase y ve quién aprobó, quién no y quién no ha presentado, con las
// respuestas de cada aprendiz pregunta por pregunta.
// La contraseña no está en este código: la valida Supabase, y las reglas de
// scripts/supabase-evaluacion.sql solo dejan leer resultados a la cuenta admin.
import { APRENDICES } from './evaluacion-aprendices.js';
import { BANCO_CODIGO } from './evaluacion-preguntas.js';
import {
  borrarResultado, cerrarSesion, haySesion, iniciarSesion, listarResultados, supabaseConfigurado,
} from './evaluacion-supabase.js';

// Porcentaje mínimo de respuestas correctas para aprobar.
const NOTA_APROBATORIA = 0.7;

const aprobo = (r) => r.aciertos / r.total >= NOTA_APROBATORIA;
const fecha = (iso) => new Date(iso).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });

// Crea un elemento con clase y texto en una sola línea.
function crear(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

// Une la lista de la ficha con los resultados: cada aprendiz queda con su
// resultado o como pendiente. Los resultados se buscan por la huella.
function filasPorAprendiz(resultados) {
  const porHuella = new Map(resultados.map((r) => [r.huella, r]));
  return APRENDICES
    .map((aprendiz) => {
      const resultado = porHuella.get(aprendiz.huella) ?? null;
      const estado = !resultado ? 'pendiente' : aprobo(resultado) ? 'aprobo' : 'reprobo';
      return { nombre: aprendiz.nombre, resultado, estado };
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

const ETIQUETAS = { aprobo: '✅ Aprobó', reprobo: '❌ No aprobó', pendiente: '⏳ Sin presentar' };

function pintarResumen(filas) {
  const contar = (estado) => filas.filter((f) => f.estado === estado).length;
  document.getElementById('admin-presentaron').textContent = `${filas.length - contar('pendiente')} de ${filas.length}`;
  document.getElementById('admin-aprobaron').textContent = contar('aprobo');
  document.getElementById('admin-reprobaron').textContent = contar('reprobo');
  document.getElementById('admin-pendientes').textContent = contar('pendiente');
}

function pintarTabla(filas, filtro, alVer) {
  const cuerpo = document.getElementById('admin-filas');
  const visibles = filtro === 'todos' ? filas : filas.filter((f) => f.estado === filtro);
  if (visibles.length === 0) {
    const fila = crear('tr');
    const celda = crear('td', 'admin-vacio', 'No hay aprendices en este grupo.');
    celda.colSpan = 6;
    fila.append(celda);
    cuerpo.replaceChildren(fila);
    return;
  }

  cuerpo.replaceChildren(...visibles.map(({ nombre, resultado, estado }) => {
    const fila = crear('tr', `admin-fila ${estado}`);
    fila.append(crear('td', 'admin-nombre', nombre));
    fila.append(crear('td', '', resultado ? `${resultado.aciertos} / ${resultado.total} (${Math.round((resultado.aciertos / resultado.total) * 100)}%)` : '—'));
    fila.append(crear('td', '', ETIQUETAS[estado]));
    fila.append(crear('td', '', resultado ? `${resultado.salidas}${resultado.enviada_sola ? ' · se envió sola' : ''}` : '—'));
    fila.append(crear('td', '', resultado ? fecha(resultado.creado) : '—'));

    const celdaBoton = crear('td');
    if (resultado) {
      const boton = crear('button', 'eval-validar admin-ver', 'Ver respuestas');
      boton.type = 'button';
      boton.addEventListener('click', () => alVer(resultado));
      celdaBoton.append(boton);
    }
    fila.append(celdaBoton);
    return fila;
  }));
}

// Una pregunta de selección: todas las opciones, marcando la que eligió el
// aprendiz y cuál era la correcta.
function detalleSeleccion(pregunta, respuesta) {
  const lista = crear('ul', 'admin-opciones');
  pregunta.opciones.forEach((opcion, j) => {
    const esCorrecta = j === pregunta.correcta;
    const elegida = j === respuesta;
    const marca = esCorrecta ? '✅ ' : elegida ? '❌ ' : '';
    const item = crear('li', `${esCorrecta ? 'correcta' : ''} ${elegida ? 'elegida' : ''}`.trim(), `${marca}${opcion}`);
    if (elegida) item.append(crear('b', 'admin-eligio', ' ← eligió'));
    lista.append(item);
  });
  return lista;
}

// Una pregunta de código: lo que escribió y cada criterio revisado de nuevo.
function detalleCodigo(pregunta, respuesta) {
  const contenedor = crear('div');
  contenedor.append(crear('pre', 'eval-codigo-enviado', respuesta ?? '(sin responder)'));
  const criterios = BANCO_CODIGO[pregunta.indice]?.criterios ?? [];
  const lista = crear('ul', 'admin-criterios');
  criterios.forEach((c) => {
    const cumple = respuesta ? c.patron.test(respuesta) : false;
    lista.append(crear('li', cumple ? 'bien' : 'mal', `${cumple ? '✅' : '❌'} ${c.descripcion}`));
  });
  contenedor.append(lista);
  return contenedor;
}

function pintarRespuestas(resultado) {
  const { preguntas, respuestas, resultados } = resultado.detalle;
  document.getElementById('admin-respuestas-titulo').textContent = resultado.nombre;
  document.getElementById('admin-respuestas-datos').textContent =
    `${resultado.aciertos} de ${resultado.total} correctas · ${aprobo(resultado) ? 'Aprobó' : 'No aprobó'} · `
    + `${resultado.salidas} salidas${resultado.enviada_sola ? ' (se envió sola)' : ''} · ${fecha(resultado.creado)}`;

  document.getElementById('admin-respuestas-lista').replaceChildren(...preguntas.map((pregunta, i) => {
    const r = resultados[i];
    const item = crear('li', `admin-respuesta ${r.bien ? 'bien' : 'mal'}`);
    item.append(crear('p', 'admin-respuesta-texto', `${r.bien ? '✅' : '❌'} ${i + 1}. ${pregunta.texto}${r.sinResponder ? ' (sin validar)' : ''}`));
    item.append(crear('span', 'eval-modulo', pregunta.modulo));
    item.append(pregunta.tipo === 'codigo' ? detalleCodigo(pregunta, respuestas[i]) : detalleSeleccion(pregunta, respuestas[i]));
    return item;
  }));
}

function mostrar(idPantalla) {
  ['admin-ingreso', 'admin-panel'].forEach((id) => {
    document.getElementById(id).hidden = id !== idPantalla;
  });
  document.getElementById('admin-salir').hidden = idPantalla !== 'admin-panel';
}

async function iniciar() {
  const formulario = document.getElementById('admin-form');
  if (!formulario) return;

  const errorIngreso = document.getElementById('admin-error');
  const errorPanel = document.getElementById('admin-error-panel');
  const filtro = document.getElementById('admin-filtro');
  const dialogo = document.getElementById('admin-respuestas');
  let filas = [];
  let abierto = null;

  document.getElementById('admin-criterio').textContent =
    `Aprueba quien responde bien al menos el ${Math.round(NOTA_APROBATORIA * 100)}% de las preguntas. Ficha con ${APRENDICES.length} aprendices.`;

  const verRespuestas = (resultado) => {
    abierto = resultado;
    pintarRespuestas(resultado);
    dialogo.showModal();
  };

  const cargar = async () => {
    errorPanel.textContent = '';
    try {
      filas = filasPorAprendiz(await listarResultados());
      pintarResumen(filas);
      pintarTabla(filas, filtro.value, verRespuestas);
    } catch (error) {
      console.error(error);
      errorPanel.textContent = `No se pudieron cargar los resultados: ${error.message}`;
    }
  };

  const entrarAlPanel = async () => {
    mostrar('admin-panel');
    await cargar();
  };

  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorIngreso.textContent = '';
    const boton = formulario.querySelector('[type="submit"]');
    boton.disabled = true;
    try {
      await iniciarSesion(
        document.getElementById('admin-correo').value.trim(),
        document.getElementById('admin-contrasena').value,
      );
      formulario.reset();
      await entrarAlPanel();
    } catch (error) {
      errorIngreso.textContent = supabaseConfigurado ? 'Correo o contraseña incorrectos.' : error.message;
    }
    boton.disabled = false;
  });

  document.getElementById('admin-salir').addEventListener('click', async (e) => {
    e.preventDefault();
    await cerrarSesion();
    mostrar('admin-ingreso');
  });

  document.getElementById('admin-actualizar').addEventListener('click', cargar);
  filtro.addEventListener('change', () => pintarTabla(filas, filtro.value, verRespuestas));
  document.getElementById('admin-respuestas-cerrar').addEventListener('click', () => dialogo.close());

  document.getElementById('admin-respuestas-borrar').addEventListener('click', async () => {
    if (!abierto || !confirm(`¿Borrar el resultado de ${abierto.nombre}? Podrá presentar la evaluación de nuevo.`)) return;
    try {
      await borrarResultado(abierto.id);
      dialogo.close();
      await cargar();
    } catch (error) {
      alert(`No se pudo borrar: ${error.message}`);
    }
  });

  // Si la sesión sigue abierta de antes, se entra directo al panel.
  if (await haySesion()) await entrarAlPanel();
  else mostrar('admin-ingreso');
}

// Las pantallas llegan con el cargador de componentes; se inicia cuando avisa.
document.addEventListener('adso:componentsLoaded', iniciar);
