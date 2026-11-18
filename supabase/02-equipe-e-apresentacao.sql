-- ============================================================
-- PAINEL CASA OLIVEIRA · passo 2
-- Rodar DEPOIS de criar os usuários de Bernardo e Ane em
-- Authentication > Users. Marca todos os usuários que existem
-- agora como equipe. O nome certo é ajustado no primeiro login.
-- ============================================================

insert into perfis (id, nome, papel)
select id, split_part(email, '@', 1), 'equipe' from auth.users
on conflict (id) do update set papel = 'equipe';

-- Página de apresentação: quem recebe o link pode ver as fotos e
-- documentos dos imóveis públicos, e só deles.
create or replace function arquivo_publico(p_caminho text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from arquivos a join imoveis i on i.id = a.imovel_id
                 where a.caminho = p_caminho and i.publico);
$$;
grant execute on function arquivo_publico(text) to anon, authenticated;

drop policy if exists publico_storage on storage.objects;
create policy publico_storage on storage.objects for select to anon, authenticated
  using (bucket_id = 'materiais' and arquivo_publico(name));

-- Os quatro empreendimentos que já estão na LP (fotos e documentos
-- entram pelo painel)
insert into imoveis (id, nome, parceiro, local, tipo, status, texto_pt, texto_en, fatos) values
('arcari', 'Estância Arcari', 'Venda exclusiva', 'Rancho Queimado · Serra catarinense', 'Condomínio de lotes', 'Venda exclusiva',
 'Condomínio de alto padrão na serra catarinense, a dez minutos do centro de Rancho Queimado. Araucárias, campo aberto e vista para as montanhas.',
 'A high-end gated community in the Santa Catarina highlands, ten minutes from downtown Rancho Queimado. Araucaria pines, open fields and mountain views.',
 '[["32 lotes","quase metade já tem dono"]]'),
('makai', 'Makai Beachfront', 'Grupo OAD', 'Novo Campeche · Florianópolis', 'Apartamentos', 'Em obras',
 'Pé na areia no Novo Campeche, com paisagismo do escritório Burle Marx e compromisso lixo zero na obra.',
 'Right on the sand in Novo Campeche, with landscaping by the Burle Marx studio and a zero-waste construction commitment.',
 '[["406 apartamentos","estúdios, duplex e coberturas"],["Entrega","prevista para 2027"]]'),
('highlands', 'Highlands Vista', 'Highlands Engenharia', 'Urubici · Serra catarinense', 'Condomínio de lotes', 'Disponível',
 'Condomínio fechado em terreno elevado, a 2 minutos do centro de Urubici. Só 19 lotes, com vista para a serra e mais de 6.100 m² de área verde.',
 'A gated community on high ground, 2 minutes from downtown Urubici. Only 19 lots, with mountain views and over 6,100 m² of green space.',
 '[["19 lotes","de 420 a 635 m²"],["Galpões","e outros investimentos"]]'),
('ams', 'AMS Empreendimentos', 'AMS Empreendimentos', 'Florianópolis', 'Incorporadora', 'Lançamento',
 'Grifes globais de design, arquitetura e gestão, agora na ilha. A AMS tem mais de 25 anos de história em Florianópolis.',
 'Global names in design, architecture and management, now on the island. AMS has over 25 years in Florianópolis.',
 '[["25+ anos","de história"],["2.000+ unidades","entregues"]]')
on conflict (id) do nothing;
