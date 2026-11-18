/* ============================================================
   CONFIGURAÇÕES DO PAINEL · Casa Oliveira
   Tudo o que muda de tempos em tempos fica aqui.
   ============================================================ */
var CONFIG = {
  // WhatsApp da Casa Oliveira (o mesmo da LP)
  whatsapp: '5548992228009',

  // Endereço público das páginas de apresentação
  site: 'https://painel.casaoliveira.site',

  // Supabase (banco, logins e arquivos). A chave publishable é pública
  // por natureza: quem protege os dados são as regras do banco.
  // Se ficar vazio,
  // o painel roda em modo demonstração, com dados de exemplo
  // guardados só neste navegador.
  supabaseUrl: 'https://ejyyarsxwpbwntbqewed.supabase.co',
  supabaseAnonKey: 'sb_publishable_w6xQZGdPAngffq37GFtr1w_si4wuQS0',

  // Contas da casa (os e-mails ficam só no Supabase, nunca aqui)
  equipe: ['Bernardo', 'Ane'],

  assinatura: 'Ane & Bernardo, Casa Oliveira'
};
