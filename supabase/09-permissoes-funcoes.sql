-- Libera as tabelas para as funções do servidor (comunicados e whatsapp-webhook).
-- Projetos novos do Supabase não dão acesso sozinhos nem para a chave do servidor.
-- Pode rodar mais de uma vez.
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
alter default privileges in schema public grant select, insert, update, delete on tables to service_role;
alter default privileges in schema public grant usage, select on sequences to service_role;
