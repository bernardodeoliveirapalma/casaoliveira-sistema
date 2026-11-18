-- ============================================================
-- PAINEL CASA OLIVEIRA · esquema do banco (Supabase / Postgres)
-- Rodar uma vez no SQL Editor do projeto.
-- ============================================================

-- Quem é quem: equipe (Ane e Bernardo) ou parceiro
create table if not exists perfis (
  id uuid primary key references auth.users on delete cascade,
  nome text not null,
  papel text not null default 'parceiro' check (papel in ('equipe', 'parceiro')),
  imobiliaria text,
  whatsapp text,
  acesso_ate date,
  criado_em timestamptz not null default now()
);

create or replace function eh_equipe() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from perfis where id = auth.uid() and papel = 'equipe');
$$;

-- Imóveis e empreendimentos
create table if not exists imoveis (
  id text primary key,
  nome text not null,
  parceiro text,
  local text,
  tipo text,
  status text not null default 'Disponível',
  texto_pt text,
  texto_en text,
  fatos jsonb not null default '[]',
  endereco text,
  valores text,
  mostrar_endereco boolean not null default false,
  mostrar_valor boolean not null default false,
  publico boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Fotos e documentos (arquivos no Storage, bucket "materiais")
create table if not exists arquivos (
  id uuid primary key default gen_random_uuid(),
  imovel_id text not null references imoveis on delete cascade,
  tipo text not null check (tipo in ('foto', 'book', 'tabela', 'planta', 'memorial', 'video', 'outro')),
  nome text not null,
  caminho text not null,
  ordem int not null default 0,
  para_parceiros boolean not null default true,
  criado_em timestamptz not null default now()
);

-- Quais empreendimentos cada parceiro vê
create table if not exists acessos_parceiro (
  parceiro_id uuid references perfis on delete cascade,
  imovel_id text references imoveis on delete cascade,
  primary key (parceiro_id, imovel_id)
);

-- Clientes e leads
create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  whatsapp text,
  email text,
  idioma text not null default 'pt' check (idioma in ('pt', 'en')),
  etapa text not null default 'Novo',
  origem text,
  utm jsonb,
  etiquetas text[] not null default '{}',
  aceita_whatsapp boolean not null default false,
  aceita_email boolean not null default false,
  respostas_quiz jsonb,
  lembrar_em date,
  criado_em timestamptz not null default now()
);

create table if not exists anotacoes (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes on delete cascade,
  autor uuid references perfis,
  texto text not null,
  criado_em timestamptz not null default now()
);

-- Registro de quem abriu o quê
create table if not exists aberturas (
  id bigint generated always as identity primary key,
  imovel_id text references imoveis on delete cascade,
  arquivo_id uuid references arquivos on delete set null,
  quem uuid references perfis,
  origem text,
  criado_em timestamptz not null default now()
);

-- ============================================================
-- REGRAS DE ACESSO
-- ============================================================
alter table perfis enable row level security;
alter table imoveis enable row level security;
alter table arquivos enable row level security;
alter table acessos_parceiro enable row level security;
alter table clientes enable row level security;
alter table anotacoes enable row level security;
alter table aberturas enable row level security;

-- Equipe faz tudo
create policy equipe_perfis on perfis for all using (eh_equipe()) with check (eh_equipe());
create policy equipe_imoveis on imoveis for all using (eh_equipe()) with check (eh_equipe());
create policy equipe_arquivos on arquivos for all using (eh_equipe()) with check (eh_equipe());
create policy equipe_acessos on acessos_parceiro for all using (eh_equipe()) with check (eh_equipe());
create policy equipe_clientes on clientes for all using (eh_equipe()) with check (eh_equipe());
create policy equipe_anotacoes on anotacoes for all using (eh_equipe()) with check (eh_equipe());
create policy equipe_aberturas on aberturas for select using (eh_equipe());

-- Cada pessoa lê o próprio perfil
create policy proprio_perfil on perfis for select using (id = auth.uid());

-- Parceiro vê só os imóveis liberados e dentro da validade
create policy parceiro_imoveis on imoveis for select using (
  exists (select 1 from acessos_parceiro a join perfis p on p.id = a.parceiro_id
          where a.imovel_id = imoveis.id and a.parceiro_id = auth.uid()
            and (p.acesso_ate is null or p.acesso_ate >= current_date))
);
create policy parceiro_arquivos on arquivos for select using (
  para_parceiros and exists (select 1 from acessos_parceiro a join perfis p on p.id = a.parceiro_id
          where a.imovel_id = arquivos.imovel_id and a.parceiro_id = auth.uid()
            and (p.acesso_ate is null or p.acesso_ate >= current_date))
);
create policy parceiro_meus_acessos on acessos_parceiro for select using (parceiro_id = auth.uid());

-- Qualquer pessoa pode registrar uma abertura (página do cliente)
create policy registrar_abertura on aberturas for insert with check (true);

-- Página de apresentação: leitura pública só pela função abaixo,
-- que esconde endereço e valor quando não estão liberados.
create or replace function apresentacao(p_id text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', i.id, 'nome', i.nome, 'local', i.local, 'parceiro', i.parceiro,
    'texto', jsonb_build_array(i.texto_pt, i.texto_en), 'fatos', i.fatos,
    'endereco', case when i.mostrar_endereco then i.endereco end,
    'valores', case when i.mostrar_valor then i.valores end,
    'arquivos', coalesce((select jsonb_agg(jsonb_build_object('tipo', a.tipo, 'nome', a.nome, 'caminho', a.caminho) order by a.ordem)
                          from arquivos a where a.imovel_id = i.id), '[]')
  ) from imoveis i where i.id = p_id and i.publico;
$$;
grant execute on function apresentacao(text) to anon, authenticated;

-- Leads do quiz da LP entram por esta função (sem abrir a tabela)
create or replace function novo_lead(p_nome text, p_whatsapp text, p_idioma text, p_origem text, p_utm jsonb, p_respostas jsonb)
returns void language sql security definer set search_path = public as $$
  insert into clientes (nome, whatsapp, idioma, origem, utm, respostas_quiz, etapa)
  values (left(p_nome, 120), left(p_whatsapp, 30), case when p_idioma = 'en' then 'en' else 'pt' end,
          left(p_origem, 40), p_utm, p_respostas, 'Novo');
$$;
grant execute on function novo_lead(text, text, text, text, jsonb, jsonb) to anon;

-- Storage: bucket privado "materiais"
insert into storage.buckets (id, name, public) values ('materiais', 'materiais', false)
on conflict (id) do nothing;
create policy equipe_storage on storage.objects for all
  using (bucket_id = 'materiais' and eh_equipe()) with check (bucket_id = 'materiais' and eh_equipe());
