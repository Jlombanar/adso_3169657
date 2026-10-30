-- Tabla de resultados de la evaluación Node + Express + Flutter.
-- Se ejecuta una sola vez en Supabase: SQL Editor → New query → pegar → Run.
--
-- Reglas de acceso (Row Level Security):
--   · Cualquiera con la página puede INSERTAR su resultado (los aprendices
--     no inician sesión).
--   · Solo el admin, con sesión iniciada, puede LEER y BORRAR resultados.
--   · Nadie puede modificar un resultado ya enviado.

create table if not exists public.resultados_evaluacion (
  id            bigint generated always as identity primary key,
  creado        timestamptz not null default now(),
  nombre        text        not null,
  -- Huella de la cédula (ver assets/js/evaluacion-cedula.js). Es única: un
  -- aprendiz solo puede enviar un resultado, aunque cambie de navegador.
  huella        text        not null unique,
  aciertos      int         not null,
  total         int         not null,
  salidas       int         not null default 0,
  enviada_sola  boolean     not null default false,
  -- Preguntas, respuestas y resultados tal como los vio el aprendiz.
  detalle       jsonb       not null
);

alter table public.resultados_evaluacion enable row level security;

create policy "aprendices envían su resultado"
  on public.resultados_evaluacion for insert
  to anon, authenticated
  with check (true);

create policy "el admin lee los resultados"
  on public.resultados_evaluacion for select
  to authenticated
  using (auth.jwt() ->> 'email' = 'jalmpa77@gmail.com');

create policy "el admin borra resultados"
  on public.resultados_evaluacion for delete
  to authenticated
  using (auth.jwt() ->> 'email' = 'jalmpa77@gmail.com');
