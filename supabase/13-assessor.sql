-- Assessor do dia: guarda quando o resumo do ClickUp foi enviado no WhatsApp.
-- Serve para mandar só um resumo por dia e no máximo 3 testes por dia.
-- Só a função "assessor" usa esta tabela (o painel não mostra). Pode rodar mais de uma vez.
create table if not exists public.assessor_envios (
  id bigserial primary key,
  dia date not null,
  tipo text not null,          -- 'diario' ou 'teste'
  ok boolean not null,
  detalhe text,
  criado_em timestamptz not null default now()
);
create index if not exists assessor_envios_dia on public.assessor_envios (dia, tipo);
alter table public.assessor_envios enable row level security;
grant select, insert on public.assessor_envios to service_role;
grant usage, select on sequence public.assessor_envios_id_seq to service_role;
