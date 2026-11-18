-- ============================================================
-- PAINEL CASA OLIVEIRA · passo 3
-- Projetos novos do Supabase não liberam as tabelas para o site
-- automaticamente. Aqui liberamos o acesso básico; quem decide o
-- que cada pessoa vê continuam sendo as regras (RLS) do passo 1.
-- Pode rodar quantas vezes precisar.
-- ============================================================
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- A página do cliente só registra aberturas
grant insert on aberturas to anon;
grant usage, select on all sequences in schema public to anon;

grant execute on function eh_equipe() to authenticated;
grant execute on function apresentacao(text) to anon, authenticated;
grant execute on function arquivo_publico(text) to anon, authenticated;
grant execute on function novo_lead(text, text, text, text, jsonb, jsonb) to anon;

-- Tabelas criadas no futuro já nascem liberadas para a equipe
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant usage, select on sequences to authenticated;
