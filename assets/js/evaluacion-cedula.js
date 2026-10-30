// Cifrado de cédulas para la evaluación.
// En el repositorio no se guarda el número de cédula sino su "huella": el
// resultado de pasarlo por PBKDF2 (SHA-256, muchas repeticiones) con una sal.
// Para verificar, se calcula la huella de lo que escribe el aprendiz y se
// compara. De la huella no se puede leer la cédula de vuelta.
//
// Lo usan la página (evaluacion.js) y el script scripts/cifrar-cedulas.mjs,
// así ambos calculan exactamente lo mismo. Necesita crypto.subtle, que el
// navegador solo ofrece en https o en localhost (Live Server).
export const ITERACIONES = 100000;

export async function cifrarCedula(cedula, sal) {
  const codificador = new TextEncoder();
  const clave = await crypto.subtle.importKey('raw', codificador.encode(cedula), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: codificador.encode(sal), iterations: ITERACIONES },
    clave,
    256,
  );
  return [...new Uint8Array(bits)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
