-- ============================================================
-- 07 · Comunicados de WhatsApp (API oficial da Meta)
-- Modelos aprovados, comunicados e o status de cada envio.
-- Pode rodar mais de uma vez.
-- ============================================================

create table if not exists modelos (
  id uuid primary key default gen_random_uuid(),
  nome_meta text not null unique check (nome_meta ~ '^[a-z0-9_]+$' and length(nome_meta) <= 512),
  titulo text not null,
  idioma text not null default 'pt_BR',
  categoria text not null default 'MARKETING' check (categoria in ('MARKETING', 'UTILITY')),
  corpo text not null,
  botao_texto text,
  botao_url text,
  status text not null default 'Rascunho',
  motivo text,
  atualizado_em timestamptz not null default now()
);

create table if not exists comunicados (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  modelo_id uuid references modelos on delete set null,
  filtro jsonb not null default '{}',
  total int not null default 0,
  status text not null default 'Na fila' check (status in ('Na fila', 'Enviando', 'Enviado', 'Erro')),
  criado_por uuid references perfis on delete set null,
  criado_em timestamptz not null default now(),
  enviado_em timestamptz
);

create table if not exists envios (
  id bigint generated always as identity primary key,
  comunicado_id uuid not null references comunicados on delete cascade,
  cliente_id uuid references clientes on delete set null,
  nome text,
  whatsapp text not null,
  status text not null default 'fila' check (status in ('fila', 'enviado', 'entregue', 'lido', 'falhou')),
  wa_id text,
  erro text,
  atualizado_em timestamptz not null default now()
);
create index if not exists envios_comunicado on envios (comunicado_id);
create index if not exists envios_wa on envios (wa_id);

alter table modelos enable row level security;
alter table comunicados enable row level security;
alter table envios enable row level security;
drop policy if exists equipe_modelos on modelos;
drop policy if exists equipe_comunicados on comunicados;
drop policy if exists equipe_envios on envios;
create policy equipe_modelos on modelos for all using (eh_equipe()) with check (eh_equipe());
create policy equipe_comunicados on comunicados for all using (eh_equipe()) with check (eh_equipe());
create policy equipe_envios on envios for all using (eh_equipe()) with check (eh_equipe());
grant select, insert, update, delete on modelos, comunicados, envios to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- Resumo de cada comunicado (quantos enviados, entregues, lidos, com falha)
create or replace view comunicados_resumo with (security_invoker = true) as
select c.*,
  count(e.*) filter (where e.status in ('enviado', 'entregue', 'lido')) as enviados,
  count(e.*) filter (where e.status in ('entregue', 'lido')) as entregues,
  count(e.*) filter (where e.status = 'lido') as lidos,
  count(e.*) filter (where e.status = 'falhou') as falhas
from comunicados c left join envios e on e.comunicado_id = c.id
group by c.id;
grant select on comunicados_resumo to authenticated;

-- Primeiro modelo, já no tom da casa (vai para aprovação da Meta pelo painel)
insert into modelos (nome_meta, titulo, corpo, botao_texto, botao_url)
values ('novidade_casa_oliveira', 'Novidade da curadoria',
  'Olá, {{1}}. Aqui é a família Casa Oliveira. Separamos uma novidade da nossa curadoria que tem a ver com o que você procura. Quer que a gente te mande os detalhes?',
  'Falar com a Casa Oliveira', 'https://wa.me/5548992228009')
on conflict (nome_meta) do nothing;
