// Cargador de componentes: busca cada elemento con data-component,
// descarga el HTML de esa ruta y reemplaza el marcador por el contenido.
// Al terminar emite el evento global "adso:componentsLoaded".
//
// Un mismo componente puede usarse desde index.html (raíz) y desde paginas/.
// Por eso sus enlaces escriben {{raiz}} y aquí se cambia por la ruta hasta la
// raíz del sitio, tomada de <html data-raiz="../"> ("" si no existe).
const RAIZ = document.documentElement.dataset.raiz || '';

async function cargarComponente(marcador) {
  const ruta = marcador.dataset.component;
  try {
    const respuesta = await fetch(ruta);
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    const html = await respuesta.text();
    marcador.outerHTML = html.replaceAll('{{raiz}}', RAIZ);
  } catch (error) {
    console.error(`No se pudo cargar el componente "${ruta}":`, error);
    marcador.innerHTML = `<p class="nota" role="alert">⚠️ No se pudo cargar <code>${ruta}</code>. Abre el proyecto con un servidor local (por ejemplo, Live Server).</p>`;
  }
}

async function cargarComponentes() {
  const marcadores = document.querySelectorAll('[data-component]');
  // Se descargan todos en paralelo; el orden en la página lo da cada marcador.
  await Promise.all([...marcadores].map(cargarComponente));
  document.dispatchEvent(new CustomEvent('adso:componentsLoaded'));
}

document.addEventListener('DOMContentLoaded', cargarComponentes);
