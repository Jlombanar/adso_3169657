// Banco de preguntas de la evaluación Node + Express + Flutter + Render.
// Selección múltiple: la PRIMERA opción es la correcta; evaluacion.js sortea
// por módulo la cantidad de PREGUNTAS_POR_MODULO y baraja preguntas y opciones.
// Código: el aprendiz escribe la respuesta y se revisa con los criterios de
// BANCO_CODIGO; se sortean CODIGO_POR_MODULO y van al final de la evaluación.

export const MODULOS = {
  backend: 'Módulo 1 · Backend (Node.js y Express)',
  flutter: 'Módulo 2 · Flutter y conexión con la API',
  despliegue: 'Módulo 3 · Despliegue en Render',
};

// 10 de selección (4 + 3 + 3) + 2 de código (1 + 1) = 12 preguntas por aprendiz.
export const PREGUNTAS_POR_MODULO = { backend: 4, flutter: 3, despliegue: 3 };
export const CODIGO_POR_MODULO = { backend: 1, flutter: 1 };

// Cada criterio es una expresión regular que debe aparecer en el código del
// aprendiz. Aceptan comillas simples, dobles o invertidas y espacios de más.
// La pregunta cuenta como correcta solo si cumple todos los criterios.
export const BANCO_CODIGO = [
  {
    modulo: 'backend',
    texto: "Escribe en Express una ruta GET en '/api/saludo' que responda en JSON { mensaje: 'Hola ADSO' }.",
    criterios: [
      { descripcion: "Ruta app.get en '/api/saludo'", patron: /app\.get\(\s*['"`]\/api\/saludo['"`]/ },
      { descripcion: 'Función que recibe req y res', patron: /\(\s*req\s*,\s*res\s*\)/ },
      { descripcion: 'Responde con res.json()', patron: /res\s*(\.status\(\s*200\s*\))?\s*\.json\(/ },
      { descripcion: 'Envía la propiedad mensaje', patron: /mensaje\s*:/ },
    ],
  },
  {
    modulo: 'backend',
    texto: "Escribe en Express una ruta POST en '/api/productos' que responda con código 201 y devuelva en JSON lo que llegó en el cuerpo de la petición.",
    criterios: [
      { descripcion: "Ruta app.post en '/api/productos'", patron: /app\.post\(\s*['"`]\/api\/productos['"`]/ },
      { descripcion: 'Función que recibe req y res', patron: /\(\s*req\s*,\s*res\s*\)/ },
      { descripcion: 'Código de estado 201', patron: /res\s*\.status\(\s*201\s*\)/ },
      { descripcion: 'Devuelve req.body con .json()', patron: /\.json\(\s*req\.body\s*\)/ },
    ],
  },
  {
    modulo: 'backend',
    texto: 'Escribe las dos líneas que hacen que Express escuche en el puerto que asigna Render, o en el 3000 si esa variable no existe.',
    criterios: [
      { descripcion: 'Lee process.env.PORT', patron: /process\.env\.PORT/ },
      { descripcion: 'Usa 3000 como respaldo con ||', patron: /\|\|\s*3000/ },
      { descripcion: 'Llama a app.listen()', patron: /app\.listen\(/ },
    ],
  },
  {
    modulo: 'flutter',
    texto: "Escribe en Dart la línea que hace una petición GET a '$baseUrl/productos' con el paquete http y guarda el resultado en la variable respuesta.",
    criterios: [
      { descripcion: 'Variable respuesta', patron: /respuesta\s*=/ },
      { descripcion: 'Espera la petición con await', patron: /await\s+http\.get\(/ },
      { descripcion: 'Convierte la URL con Uri.parse()', patron: /Uri\.parse\(/ },
      { descripcion: 'Apunta a /productos', patron: /\/productos/ },
    ],
  },
  {
    modulo: 'flutter',
    texto: 'Escribe las carpetas que necesitas dentro de lib/ para consumir la API del backend en Flutter, y el archivo donde va la URL base de la API. Escribe una ruta por línea, por ejemplo: lib/carpeta/archivo.dart',
    criterios: [
      { descripcion: 'Carpeta models (los modelos con fromJson)', patron: /\b(models|modelos)\b/i },
      { descripcion: 'Carpeta services (las peticiones http)', patron: /\b(services|servicios)\b/i },
      { descripcion: 'Archivo api_config.dart con la URL base', patron: /api_config\.dart/i },
    ],
  },
  {
    modulo: 'flutter',
    texto: 'Escribe en Dart el if que comprueba que la respuesta llegó con código 200 y, dentro, convierte el cuerpo con jsonDecode en una variable datos.',
    criterios: [
      { descripcion: 'Compara respuesta.statusCode == 200', patron: /respuesta\.statusCode\s*==\s*200/ },
      { descripcion: 'Variable datos', patron: /datos\s*=/ },
      { descripcion: 'Usa jsonDecode(respuesta.body)', patron: /jsonDecode\(\s*respuesta\.body\s*\)/ },
    ],
  },
];

export const BANCO = [
  // ── Módulo 1: Backend ──────────────────────────────────────────────
  {
    modulo: 'backend',
    texto: 'En la arquitectura de Express, ¿dónde y cómo se debe proteger una ruta para que solo ingresen usuarios autenticados con un rol específico (ej. "admin")?',
    opciones: [
      'Mediante dos middlewares encadenados en la definición de la ruta: primero el que verifica la validez del JWT y luego el que valida si el rol del usuario tiene permisos.',
      "Dentro del archivo de conexión a la base de datos, agregando una condición WHERE rol = 'admin'.",
      'En el archivo .env configurando la variable ALLOWED_ROLES=admin.',
      'En el controlador final, usando un bloque try/catch que capture errores de sintaxis en el token.',
    ],
  },
  {
    modulo: 'backend',
    texto: 'Al implementar la subida de archivos (como imágenes de productos o avatares) con librerías como multer, ¿por qué la información de los campos de texto no llega en req.body si no se configura adecuadamente?',
    opciones: [
      'Porque Express por defecto solo procesa peticiones application/json o application/x-www-form-urlencoded, y el envío de archivos usa multipart/form-data.',
      'Porque Node.js bloquea los textos cuando viajan junto a un archivo binario por motivos de seguridad.',
      'Porque los archivos deben subirse siempre mediante el método HTTP GET.',
      'Porque req.body solo funciona si los archivos se guardan como cadenas Base64 dentro de la base de datos.',
    ],
  },
  {
    modulo: 'backend',
    texto: 'Cuando un usuario inicia sesión en el endpoint /api/auth/login, ¿cuál es la forma correcta de gestionar la contraseña para verificar su identidad?',
    opciones: [
      'Usar bcrypt.compare() para contrastar la contraseña en texto plano enviada por el usuario con el hash guardado en la base de datos.',
      'Desencriptar la contraseña almacenada en la base de datos y compararla con el texto plano recibido.',
      'Enviar la contraseña por la URL como parámetro de consulta (query param) y validarla con el token.',
      'Comparar directamente los strings mediante req.body.password === user.password.',
    ],
  },
  {
    modulo: 'backend',
    texto: '¿Qué ocurre si en un middleware de autenticación de Express olvidas invocar next() tras validar con éxito el token JWT?',
    opciones: [
      'La petición queda "colgada" en espera indefinida y el cliente termina recibiendo un error por tiempo de espera agotado (timeout).',
      'El servidor lanza inmediatamente un error 500 Internal Server Error.',
      'La petición salta automáticamente al siguiente controlador sin pasar por las validaciones restantes.',
      'El token JWT se destruye y el usuario es deslogueado de inmediato.',
    ],
  },
  {
    modulo: 'backend',
    texto: "Un usuario con sesión válida pero con rol 'cliente' intenta entrar a una ruta exclusiva de 'admin'. ¿Qué código HTTP debe responder la API?",
    opciones: [
      '403 Forbidden: el usuario está identificado, pero no tiene permiso para ese recurso.',
      '200 OK, porque el token es válido.',
      '201 Created, porque la petición llegó al servidor.',
      '500 Internal Server Error, porque el rol no coincide.',
    ],
  },
  {
    modulo: 'backend',
    texto: 'Después de validar el usuario y la contraseña en el login, ¿qué debe responder el servidor a la app?',
    opciones: [
      'Un JWT firmado con la clave secreta (jwt.sign) y los datos básicos del usuario, sin incluir la contraseña.',
      'El hash de la contraseña para que la app lo guarde y lo envíe en cada petición.',
      'El contenido del archivo .env para que la app conozca la clave secreta.',
      'Un código 404 para indicar que la sesión fue creada.',
    ],
  },
  {
    modulo: 'backend',
    texto: '¿Qué hace la línea app.use(express.json()) en el servidor?',
    opciones: [
      'Convierte el cuerpo JSON de las peticiones en un objeto de JavaScript disponible en req.body.',
      'Hace que todas las respuestas del servidor se envíen obligatoriamente en formato JSON.',
      'Crea automáticamente las rutas GET y POST de la API.',
      'Conecta Express con la base de datos y convierte las tablas en JSON.',
    ],
  },
  {
    modulo: 'backend',
    texto: 'En un proyecto de Node.js, ¿para qué sirve el archivo package.json?',
    opciones: [
      'Registra las dependencias del proyecto (express, cors, jsonwebtoken…) y los scripts como start para ejecutarlo.',
      'Guarda las contraseñas y claves secretas del servidor.',
      'Contiene los datos de la base de datos en formato JSON.',
      'Define las pantallas que mostrará la app de Flutter.',
    ],
  },

  // ── Módulo 2: Flutter y conexión con la API ────────────────────────
  {
    modulo: 'flutter',
    texto: 'Al consumir la API de Express desde Flutter para realizar peticiones protegidas (como crear un producto o ver el perfil), ¿dónde y cómo se debe enviar el JWT obtenido en el login?',
    opciones: [
      'En los encabezados (headers) HTTP de la petición, comúnmente bajo la cabecera Authorization: Bearer <token>.',
      'Concatenado al final de la URL en cada petición: https://mi-api.onrender.com/productos?token=MI_JWT.',
      'Dentro del archivo pubspec.yaml de Flutter como dependencia global.',
      'En el cuerpo (body) de la petición serializado como un widget de tipo Text().',
    ],
  },
  {
    modulo: 'flutter',
    texto: 'Al probar la app de Flutter en un emulador Android apuntando al backend local de Node.js, ¿qué dirección IP se debe usar en lugar de localhost o 127.0.0.1?',
    opciones: ['10.0.2.2', '192.168.0.0', '0.0.0.0', '255.255.255.255'],
  },
  {
    modulo: 'flutter',
    texto: 'En un formulario de Flutter para crear o editar un registro (CRUD), ¿cuál es el mecanismo estándar para gestionar el texto ingresado y liberar la memoria al destruir la pantalla?',
    opciones: [
      'Usar TextEditingController inicializados en el estado y llamar a .dispose() dentro del ciclo de vida del widget.',
      'Usar variables globales en un archivo separado y limpiarlas con null.',
      'Utilizar directamente variables de entorno en el dispositivo.',
      'Reinstalar el paquete http cada vez que el usuario presione el botón de guardar.',
    ],
  },
  {
    modulo: 'flutter',
    texto: 'La API responde con un texto JSON. ¿Qué se hace en Flutter para poder usar esos datos como objetos del modelo?',
    opciones: [
      'Convertir respuesta.body con jsonDecode() y luego crear los objetos con un constructor como Producto.fromJson().',
      'Mostrar respuesta.body directamente dentro de un ListView sin convertirlo.',
      'Guardar el texto en pubspec.yaml para que Flutter lo convierta al compilar.',
      'Usar jsonEncode() sobre la respuesta para leer cada campo.',
    ],
  },
  {
    modulo: 'flutter',
    texto: 'Una petición protegida desde Flutter responde 401 Unauthorized porque el token expiró. ¿Qué debería hacer la app?',
    opciones: [
      'Borrar el token guardado y llevar al usuario a la pantalla de login para que inicie sesión de nuevo.',
      'Repetir la misma petición en un ciclo infinito hasta que responda 200.',
      'Mostrar los datos de la última respuesta como si la petición hubiera funcionado.',
      'Desinstalar y reinstalar la app automáticamente.',
    ],
  },
  {
    modulo: 'flutter',
    texto: '¿Por qué los métodos del servicio que llaman a la API en Flutter se declaran async y devuelven un Future?',
    opciones: [
      'Porque la respuesta del servidor tarda en llegar, y con await se espera sin congelar la interfaz.',
      'Porque Dart no permite importar el paquete http en funciones normales.',
      'Porque así la petición viaja más rápido por la red.',
      'Porque Express solo responde a clientes que usan funciones async.',
    ],
  },
  {
    modulo: 'flutter',
    texto: '¿Dónde se agrega el paquete http para poder consumir la API desde Flutter?',
    opciones: [
      'En la sección dependencies del archivo pubspec.yaml, y luego se ejecuta flutter pub get.',
      'En el archivo package.json del backend.',
      'En el AndroidManifest.xml, dentro de la etiqueta <application>.',
      'No hace falta agregarlo: viene incluido en main.dart.',
    ],
  },
  {
    modulo: 'flutter',
    texto: 'Para enviar desde Flutter un producto con su foto al backend (que usa multer), ¿qué tipo de petición se debe construir?',
    opciones: [
      'Un http.MultipartRequest con los campos de texto en fields y la imagen agregada en files.',
      'Un http.get con la foto escrita dentro de la URL.',
      'Un http.post con la imagen convertida en un widget Image() dentro del body.',
      'Un http.delete, porque reemplaza la foto anterior.',
    ],
  },

  // ── Módulo 3: Despliegue en Render ─────────────────────────────────
  {
    modulo: 'despliegue',
    texto: 'En el plan gratuito de Render para Web Services, ¿qué ocurre cuando la API de Node.js no recibe peticiones durante 15 minutos continuos?',
    opciones: [
      'La instancia entra en suspensión ("duerme"), y la siguiente petición puede tardar entre 30 y 60 segundos mientras el servicio arranca de nuevo.',
      'Render borra el código fuente y obliga a hacer un nuevo despliegue manual.',
      'La base de datos asociada se formatea automáticamente.',
      'El certificado SSL expira y debe renovarse manualmente desde el panel.',
    ],
  },
  {
    modulo: 'despliegue',
    texto: 'Al desplegar el backend en Render, ¿cuál es la forma correcta de asignar el puerto en el que Express escucha peticiones?',
    opciones: [
      'Leer el puerto que asigna la plataforma mediante la variable de entorno: process.env.PORT || 3000.',
      'Dejar fijo app.listen(3000), ya que Render siempre redirige internamente al puerto 3000.',
      'Configurar el puerto en el archivo package.json dentro de la sección "author".',
      'Dejar app.listen() sin ningún parámetro para que el sistema operativo elija al azar.',
    ],
  },
  {
    modulo: 'despliegue',
    texto: '¿Por qué es un error grave subir el archivo .env al repositorio de GitHub antes de desplegar en Render?',
    opciones: [
      'Porque expone credenciales críticas (clave secreta del JWT, contraseñas de la base de datos, llaves de API) en el historial de Git; deben configurarse en la pestaña "Environment" de Render.',
      'Porque Git no permite subir archivos cuyo nombre empiece con un punto (.).',
      'Porque Render solo puede leer variables de entorno escritas dentro de un archivo .txt.',
      'Porque Render duplica el archivo .env en cada despliegue y satura el almacenamiento.',
    ],
  },
  {
    modulo: 'despliegue',
    texto: 'La app funciona en el emulador, pero el APK instalado en un celular real no carga datos. ¿Cuál es la causa más probable?',
    opciones: [
      'La URL base sigue apuntando a 10.0.2.2; para el APK se debe usar la URL pública de Render (useRemote = true).',
      'El celular no tiene instalado Node.js.',
      'Express no es compatible con celulares Android.',
      'Faltó ejecutar npm install dentro del celular.',
    ],
  },
  {
    modulo: 'despliegue',
    texto: '¿Para qué se configura en UptimeRobot un monitor sobre la ruta /health del backend desplegado?',
    opciones: [
      'Para comprobar cada pocos minutos que la API responde y evitar que Render la suspenda por inactividad.',
      'Para revisar la batería y la memoria del celular donde está instalada la app.',
      'Para borrar los registros antiguos de la base de datos cada noche.',
      'Para que Flutter descargue automáticamente las nuevas versiones del APK.',
    ],
  },
  {
    modulo: 'despliegue',
    texto: '¿Qué comando se configura como Start Command en Render para levantar la API de Node.js?',
    opciones: [
      'npm start, que ejecuta el script start del package.json (por ejemplo, node index.js).',
      'flutter run',
      'npm install, porque instala y arranca el servidor al mismo tiempo.',
      'git push origin main',
    ],
  },
  {
    modulo: 'despliegue',
    texto: 'Haces git push con un cambio del backend a la rama conectada a Render. ¿Qué ocurre?',
    opciones: [
      'Render detecta el nuevo commit y hace un nuevo despliegue automático (Auto-Deploy).',
      'Nada: hay que borrar el servicio en Render y crearlo de nuevo.',
      'Se actualiza solo el APK que está instalado en los celulares.',
      'Render borra la base de datos para cargar el código nuevo.',
    ],
  },
  {
    modulo: 'despliegue',
    texto: 'El despliegue en Render falla y el servicio no queda en estado Live. ¿Dónde se revisa la causa del error?',
    opciones: [
      'En la pestaña Logs del servicio en Render, donde aparece el error del build o del arranque.',
      'En el archivo pubspec.yaml de la app Flutter.',
      'En el archivo .gitignore del repositorio.',
      'En la configuración de UptimeRobot.',
    ],
  },
];
