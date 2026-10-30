// Genera assets/js/evaluacion-aprendices.js a partir de un archivo CSV con la
// lista de la ficha, guardando la huella de cada cédula y no el número.
//
// Uso (desde la raíz del repositorio):
//   node scripts/cifrar-cedulas.mjs aprendices.csv
//
// Cada línea del CSV: cédula y luego el nombre, separados por coma, punto y
// coma o tabulación. Si nombres y apellidos vienen en columnas distintas, se
// unen. Ejemplo:  1234567890;MARIA CAMILA;PEREZ GOMEZ
// Las líneas cuya primera columna no es un número (como el encabezado) se
// ignoran. El CSV está en .gitignore: no lo subas al repositorio.
import { readFile, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { cifrarCedula } from '../assets/js/evaluacion-cedula.js';

const DESTINO = new URL('../assets/js/evaluacion-aprendices.js', import.meta.url);

const archivo = process.argv[2];
if (!archivo) {
  console.error('Indica el archivo CSV. Ejemplo: node scripts/cifrar-cedulas.mjs aprendices.csv');
  process.exit(1);
}

const lineas = (await readFile(archivo, 'utf8')).replace(/^﻿/, '').split(/\r?\n/);
const filas = lineas
  .map((linea) => linea.split(/[;,\t]/).map((columna) => columna.trim().replace(/^"|"$/g, '')))
  .filter(([cedula]) => /^\d+[\d.]*$/.test(cedula ?? ''))
  .map(([cedula, ...nombre]) => ({
    cedula: cedula.replace(/\D/g, ''),
    nombre: nombre.filter(Boolean).join(' ').replace(/\s+/g, ' ').toUpperCase(),
  }));

if (filas.length === 0) {
  console.error('No se encontró ninguna fila con cédula en el archivo.');
  process.exit(1);
}

// Una sal nueva cada vez que se genera la lista.
const sal = randomBytes(16).toString('hex');
const aprendices = [];
for (const { cedula, nombre } of filas) {
  aprendices.push({ nombre, huella: await cifrarCedula(cedula, sal) });
}

const contenido = `// Aprendices que pueden presentar la evaluación.
// Archivo generado con scripts/cifrar-cedulas.mjs: no lo edites a mano.
// "huella" es la cédula cifrada (ver evaluacion-cedula.js); el número real
// no está guardado aquí.

export const SAL = '${sal}';

export const APRENDICES = [
${aprendices.map((a) => `  { nombre: ${JSON.stringify(a.nombre)}, huella: '${a.huella}' },`).join('\n')}
];
`;

await writeFile(DESTINO, contenido);
console.log(`Listo: ${aprendices.length} aprendices guardados en assets/js/evaluacion-aprendices.js`);
