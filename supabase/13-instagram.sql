-- Publicação automática no Instagram (Imobiliário Brasil).
-- Cria: a gaveta de arquivos públicos "conteudo" (onde ficam as imagens
-- enquanto o Instagram as busca), a tabela que guarda a chave do Instagram
-- renovada e o histórico do que foi publicado. Pode rodar mais de uma vez.

insert into storage.buckets (id, name, public)
values ('conteudo', 'conteudo', true)
on conflict (id) do update set public = true;

create table if not exists public.instagram_token (
  id int primary key default 1 check (id = 1),
  token text not null,
  renovado_em timestamptz not null default now()
);
alter table public.instagram_token enable row level security;

create table if not exists public.publicacoes (
  id bigint generated always as identity primary key,
  criado_em timestamptz not null default now(),
  rede text not null default 'instagram',
  tipo text not null,
  titulo text,
  legenda text,
  media_id text,
  link text,
  origem text
);
alter table public.publicacoes enable row level security;

-- Só o servidor (funções) mexe nessas tabelas. A equipe logada pode ver o histórico.
grant select, insert, update, delete on public.instagram_token, public.publicacoes to service_role;
grant usage, select on all sequences in schema public to service_role;
drop policy if exists "equipe ve publicacoes" on public.publicacoes;
create policy "equipe ve publicacoes" on public.publicacoes for select to authenticated using (true);
grant select on public.publicacoes to authenticated;
