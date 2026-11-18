-- ============================================================
-- 06 · Portal de parceiros
-- Convites com link, acesso por empreendimento e prazo, e o
-- corretor criando a própria senha. Pode rodar mais de uma vez.
-- ============================================================

create table if not exists convites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  nome text not null,
  imobiliaria text,
  whatsapp text,
  imoveis text[] not null default '{}',
  acesso_ate date,
  criado_por uuid references perfis on delete set null,
  criado_em timestamptz not null default now(),
  usado_em timestamptz,
  usado_por uuid
);
alter table convites enable row level security;
drop policy if exists equipe_convites on convites;
create policy equipe_convites on convites for all using (eh_equipe()) with check (eh_equipe());
grant select, insert, update, delete on convites to authenticated;

-- A página do convite mostra para quem é e o que foi liberado (sem login).
create or replace function convite_info(p_id uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'nome', c.nome, 'email', c.email, 'imobiliaria', c.imobiliaria,
    'imoveis', coalesce((select jsonb_agg(i.nome order by i.nome) from imoveis i where i.id = any (c.imoveis)), '[]'))
  from convites c
  where c.id = p_id and c.usado_em is null and c.criado_em > now() - interval '30 days';
$$;
grant execute on function convite_info(uuid) to anon, authenticated;

-- Quando o corretor cria a senha pelo link, vira parceiro com os acessos do convite.
-- Precisa do número do convite E do mesmo e-mail.
create or replace function aceitar_convite() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  c convites;
begin
  begin
    select * into c from convites
     where id = nullif(new.raw_user_meta_data->>'convite', '')::uuid
       and lower(email) = lower(new.email)
       and usado_em is null and criado_em > now() - interval '30 days';
    if found then
      insert into perfis (id, nome, papel, imobiliaria, whatsapp, acesso_ate)
      values (new.id, c.nome, 'parceiro', c.imobiliaria, c.whatsapp, c.acesso_ate)
      on conflict (id) do nothing;
      insert into acessos_parceiro (parceiro_id, imovel_id)
      select new.id, i.id from imoveis i where i.id = any (c.imoveis)
      on conflict do nothing;
      update convites set usado_em = now(), usado_por = new.id where id = c.id;
    end if;
  exception when others then
    -- nunca travar o cadastro por causa do convite
    null;
  end;
  return new;
end;
$$;
drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario after insert on auth.users
  for each row execute function aceitar_convite();

-- Parceiro baixa os arquivos dos empreendimentos liberados para ele.
create or replace function arquivo_do_parceiro(p_caminho text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from arquivos a
      join acessos_parceiro ac on ac.imovel_id = a.imovel_id
      join perfis p on p.id = ac.parceiro_id
     where a.caminho = p_caminho and a.para_parceiros and ac.parceiro_id = auth.uid()
       and (p.acesso_ate is null or p.acesso_ate >= current_date));
$$;
grant execute on function arquivo_do_parceiro(text) to authenticated;
drop policy if exists parceiro_storage on storage.objects;
create policy parceiro_storage on storage.objects for select to authenticated
  using (bucket_id = 'materiais' and arquivo_do_parceiro(name));

-- Abertura sempre registrada em nome de quem está logado.
drop policy if exists registrar_abertura on aberturas;
create policy registrar_abertura on aberturas for insert
  with check (quem is null or quem = auth.uid());
