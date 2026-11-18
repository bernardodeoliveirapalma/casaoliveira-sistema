-- ============================================================
-- 10 · E-mails (enviados pelo Brevo)
-- Cada e-mail, o status de cada envio e o descadastro.
-- Pode rodar mais de uma vez.
-- ============================================================

create table if not exists emails (
  id uuid primary key default gen_random_uuid(),
  assunto text not null,
  corpo text not null,
  botao_texto text,
  botao_url text,
  filtro jsonb not null default '{}',
  total int not null default 0,
  status text not null default 'Na fila' check (status in ('Na fila', 'Enviando', 'Enviado', 'Erro')),
  criado_por uuid references perfis on delete set null,
  criado_em timestamptz not null default now(),
  enviado_em timestamptz
);

create table if not exists envios_email (
  id bigint generated always as identity primary key,
  email_id uuid not null references emails on delete cascade,
  cliente_id uuid references clientes on delete set null,
  nome text,
  email text not null,
  status text not null default 'fila' check (status in ('fila', 'enviado', 'aberto', 'clicado', 'falhou')),
  msg_id text,
  erro text,
  atualizado_em timestamptz not null default now()
);
create index if not exists envios_email_email on envios_email (email_id);
create index if not exists envios_email_msg on envios_email (msg_id);

alter table emails enable row level security;
alter table envios_email enable row level security;
drop policy if exists equipe_emails on emails;
drop policy if exists equipe_envios_email on envios_email;
create policy equipe_emails on emails for all using (eh_equipe()) with check (eh_equipe());
create policy equipe_envios_email on envios_email for all using (eh_equipe()) with check (eh_equipe());
grant select, insert, update, delete on emails, envios_email to authenticated;
grant select, insert, update, delete on emails, envios_email, clientes, anotacoes, convites, imoveis, perfis to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;

-- Resumo de cada e-mail (enviados, abertos, cliques, falhas)
create or replace view emails_resumo with (security_invoker = true) as
select m.*,
  count(e.*) filter (where e.status in ('enviado', 'aberto', 'clicado')) as enviados,
  count(e.*) filter (where e.status in ('aberto', 'clicado')) as abertos,
  count(e.*) filter (where e.status = 'clicado') as cliques,
  count(e.*) filter (where e.status = 'falhou') as falhas
from emails m left join envios_email e on e.email_id = m.id
group by m.id;
grant select on emails_resumo to authenticated;

-- Descadastro: o link no fim de cada e-mail chama esta função (sem login)
create or replace function sair_email(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare achou boolean;
begin
  update clientes set aceita_email = false where id = p_id and aceita_email = true;
  achou := found;
  if achou then
    insert into anotacoes (cliente_id, texto) values (p_id, 'Pediu para não receber mais e-mails.');
  end if;
  return true;
end;
$$;
revoke all on function sair_email(uuid) from public;
grant execute on function sair_email(uuid) to anon, authenticated;
