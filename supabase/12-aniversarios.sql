-- ============================================================
-- 12 · Aniversários
-- Guarda o aniversário (só dia e mês) de cada cliente, recebe a data
-- pela página do link pessoal (#/aniversario/<id>) e pelo quiz da LP.
-- Pode rodar mais de uma vez.
-- ============================================================

-- dia e mês no formato MM-DD (ex.: 03-12 é 12 de março). Sem o ano.
alter table clientes add column if not exists aniversario text;
alter table clientes drop constraint if exists clientes_aniversario_ok;
alter table clientes add constraint clientes_aniversario_ok
  check (aniversario is null or aniversario ~ '^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$');

-- A página do link pessoal chama esta função (sem login).
-- Só preenche quem ainda não tem data, para ninguém trocar a data de outra pessoa.
create or replace function salvar_aniversario(p_id uuid, p_dia int, p_mes int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  d text;
begin
  if p_dia is null or p_mes is null or p_mes not between 1 and 12 or p_dia not between 1 and 31 then return false; end if;
  begin
    perform make_date(2000, p_mes, p_dia);  -- 2000 é bissexto: aceita 29/02
  exception when others then
    return false;
  end;
  d := lpad(p_mes::text, 2, '0') || '-' || lpad(p_dia::text, 2, '0');
  update clientes set aniversario = d where id = p_id and aniversario is null;
  if found then
    insert into anotacoes (cliente_id, texto)
    values (p_id, 'Informou o aniversário pelo link: ' || lpad(p_dia::text, 2, '0') || '/' || lpad(p_mes::text, 2, '0') || '.');
  end if;
  return true;
end;
$$;
revoke all on function salvar_aniversario(uuid, int, int) from public;
grant execute on function salvar_aniversario(uuid, int, int) to anon, authenticated;

-- Quiz da LP: mesma função de antes, agora com o aniversário (opcional).
drop function if exists novo_lead(text, text, text, text, jsonb, jsonb, boolean);
create or replace function novo_lead(p_nome text, p_whatsapp text, p_idioma text, p_origem text,
                                     p_utm jsonb, p_respostas jsonb, p_aceita_whatsapp boolean default false,
                                     p_aniversario text default null)
returns void language plpgsql security definer set search_path = public as $$
declare
  num text := nullif(regexp_replace(coalesce(p_whatsapp, ''), '\D', '', 'g'), '');
  aniv text := case when p_aniversario ~ '^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$' then p_aniversario end;
begin
  -- trava simples contra abuso: textos curtos e no máximo 30 leads por minuto
  if pg_column_size(p_respostas) > 4000 or pg_column_size(p_utm) > 2000 then return; end if;
  if (select count(*) from clientes where criado_em > now() - interval '1 minute' and origem in ('Site', 'Instagram', 'Anúncio')) >= 30 then return; end if;
  if num is not null and length(num) not between 10 and 15 then num := null; end if;

  insert into clientes (nome, whatsapp, idioma, origem, utm, respostas_quiz, etapa, aceita_whatsapp, etiquetas, aniversario)
  values (left(coalesce(nullif(trim(p_nome), ''), 'Visitante do site'), 120), num,
          case when p_idioma = 'en' then 'en' else 'pt' end,
          left(coalesce(p_origem, 'Site'), 40), p_utm, p_respostas, 'Novo',
          coalesce(p_aceita_whatsapp, false) and num is not null, array['Quiz do site'], aniv);
end;
$$;
revoke all on function novo_lead(text, text, text, text, jsonb, jsonb, boolean, text) from public;
grant execute on function novo_lead(text, text, text, text, jsonb, jsonb, boolean, text) to anon, authenticated;
