-- 05 · Leads do quiz da LP
-- O quiz agora manda também o WhatsApp e se a pessoa aceitou receber novidades.
-- Pode rodar mais de uma vez.

drop function if exists novo_lead(text, text, text, text, jsonb, jsonb);

create or replace function novo_lead(p_nome text, p_whatsapp text, p_idioma text, p_origem text,
                                     p_utm jsonb, p_respostas jsonb, p_aceita_whatsapp boolean default false)
returns void language plpgsql security definer set search_path = public as $$
declare
  num text := nullif(regexp_replace(coalesce(p_whatsapp, ''), '\D', '', 'g'), '');
begin
  -- trava simples contra abuso: textos curtos e no máximo 30 leads por minuto
  if pg_column_size(p_respostas) > 4000 or pg_column_size(p_utm) > 2000 then return; end if;
  if (select count(*) from clientes where criado_em > now() - interval '1 minute' and origem in ('Site', 'Instagram', 'Anúncio')) >= 30 then return; end if;
  if num is not null and length(num) not between 10 and 15 then num := null; end if;

  insert into clientes (nome, whatsapp, idioma, origem, utm, respostas_quiz, etapa, aceita_whatsapp, etiquetas)
  values (left(coalesce(nullif(trim(p_nome), ''), 'Visitante do site'), 120), num,
          case when p_idioma = 'en' then 'en' else 'pt' end,
          left(coalesce(p_origem, 'Site'), 40), p_utm, p_respostas, 'Novo',
          coalesce(p_aceita_whatsapp, false) and num is not null, array['Quiz do site']);
end;
$$;

revoke all on function novo_lead(text, text, text, text, jsonb, jsonb, boolean) from public;
grant execute on function novo_lead(text, text, text, text, jsonb, jsonb, boolean) to anon, authenticated;
