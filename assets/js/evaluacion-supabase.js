// Conexión con Supabase para la evaluación: los aprendices envían su
// resultado y el admin inicia sesión para verlos.
//
// Configuración: en Supabase, Project Settings → API, copia la "Project URL"
// y la llave "publishable" (antes "anon public") en estas dos constantes. Esa
// llave es pública a propósito: lo que protege los datos son las reglas de
// scripts/supabase-evaluacion.sql. Nunca pongas aquí la llave secret
// (sb_secret_…) ni la service_role.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.50.0/+esm';

const SUPABASE_URL = 'https://obhxliieqcxsrilgiiqt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SeZ5lPjOopBL3hETtFUVgA_h0bQvYeA';

const TABLA = 'resultados_evaluacion';

export const supabaseConfigurado = !SUPABASE_URL.startsWith('PEGA_AQUI');
const supabase = supabaseConfigurado ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const sinConfigurar = () => new Error('Falta configurar Supabase en assets/js/evaluacion-supabase.js');

// Devuelve 'enviado', o 'repetido' si ese aprendiz ya tenía un resultado.
// Lanza un error si no hay conexión, para poder reintentar.
export async function enviarResultado(registro) {
  if (!supabase) throw sinConfigurar();
  const { error } = await supabase.from(TABLA).insert(registro);
  if (error?.code === '23505') return 'repetido';
  if (error) throw error;
  return 'enviado';
}

export async function iniciarSesion(correo, contrasena) {
  if (!supabase) throw sinConfigurar();
  const { error } = await supabase.auth.signInWithPassword({ email: correo, password: contrasena });
  if (error) throw error;
}

export async function cerrarSesion() {
  await supabase?.auth.signOut();
}

export async function haySesion() {
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  return Boolean(data.session);
}

export async function listarResultados() {
  if (!supabase) throw sinConfigurar();
  const { data, error } = await supabase.from(TABLA).select('*').order('creado', { ascending: false });
  if (error) throw error;
  return data;
}

export async function borrarResultado(id) {
  if (!supabase) throw sinConfigurar();
  const { error } = await supabase.from(TABLA).delete().eq('id', id);
  if (error) throw error;
}
