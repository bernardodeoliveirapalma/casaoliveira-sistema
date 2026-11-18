/* ============================================================
   DADOS DO PAINEL
   Modo demonstração: dados de exemplo guardados no navegador.
   Quando o Supabase for ligado (CONFIG.supabaseUrl), esta camada
   passa a ler e gravar no banco, sem mudar as telas.
   ============================================================ */
var DEMO = !CONFIG.supabaseUrl;

var STATUS = ['Disponível', 'Lançamento', 'Em obras', 'Venda exclusiva', 'Pausado'];
var TIPOS = ['Apartamentos', 'Condomínio de lotes', 'Casa', 'Comercial', 'Incorporadora'];
var TIPOS_DOC = { book: 'Book', tabela: 'Tabela', planta: 'Planta', memorial: 'Memorial', video: 'Vídeo', outro: 'Documento' };

/* Os quatro empreendimentos abaixo vêm dos cartões da LP (casaoliveira.site).
   Os documentos são só exemplos, para ver como a tela fica. */
var SEMENTE = {
  imoveis: [
    { id: 'arcari', nome: 'Estância Arcari', parceiro: 'Venda exclusiva', local: 'Rancho Queimado · Serra catarinense',
      tipo: 'Condomínio de lotes', status: 'Venda exclusiva', cor: 'verde',
      texto: ['Condomínio de alto padrão na serra catarinense, a dez minutos do centro de Rancho Queimado. Araucárias, campo aberto e vista para as montanhas.',
              'A high-end gated community in the Santa Catarina highlands, ten minutes from downtown Rancho Queimado. Araucaria pines, open fields and mountain views.'],
      fatos: [['32 lotes', 'quase metade já tem dono']],
      fotos: ['assets/imoveis/arcari.jpg'],
      docs: [{ nome: 'Apresentação Estância Arcari', tipo: 'book', exemplo: true },
             { nome: 'Mapa de lotes disponíveis', tipo: 'planta', exemplo: true },
             { nome: 'Condições de pagamento', tipo: 'tabela', exemplo: true }],
      mostrarEndereco: false, mostrarValor: false },
    { id: 'makai', nome: 'Makai Beachfront', parceiro: 'Grupo OAD', local: 'Novo Campeche · Florianópolis',
      tipo: 'Apartamentos', status: 'Em obras', cor: 'areia',
      texto: ['Pé na areia no Novo Campeche, com paisagismo do escritório Burle Marx e compromisso lixo zero na obra.',
              'Right on the sand in Novo Campeche, with landscaping by the Burle Marx studio and a zero-waste construction commitment.'],
      fatos: [['406 apartamentos', 'estúdios, duplex e coberturas'], ['Entrega', 'prevista para 2027']],
      fotos: ['assets/imoveis/makai.jpg'],
      docs: [{ nome: 'Book Makai Beachfront', tipo: 'book', exemplo: true },
             { nome: 'Plantas dos estúdios e duplex', tipo: 'planta', exemplo: true },
             { nome: 'Memorial descritivo', tipo: 'memorial', exemplo: true }],
      mostrarEndereco: false, mostrarValor: false },
    { id: 'highlands', nome: 'Highlands Vista', parceiro: 'Highlands Engenharia', local: 'Urubici · Serra catarinense',
      tipo: 'Condomínio de lotes', status: 'Disponível', cor: 'musgo',
      texto: ['Condomínio fechado em terreno elevado, a 2 minutos do centro de Urubici. Só 19 lotes, com vista para a serra e mais de 6.100 m² de área verde.',
              'A gated community on high ground, 2 minutes from downtown Urubici. Only 19 lots, with mountain views and over 6,100 m² of green space.'],
      fatos: [['19 lotes', 'de 420 a 635 m²'], ['Galpões', 'e outros investimentos']],
      fotos: ['assets/imoveis/highlands.jpg'],
      docs: [{ nome: 'Implantação dos lotes', tipo: 'planta', exemplo: true },
             { nome: 'Apresentação Highlands Vista', tipo: 'book', exemplo: true }],
      mostrarEndereco: false, mostrarValor: false },
    { id: 'ams', nome: 'AMS Empreendimentos', parceiro: 'AMS Empreendimentos', local: 'Florianópolis',
      tipo: 'Incorporadora', status: 'Lançamento', cor: 'terra',
      texto: ['Grifes globais de design, arquitetura e gestão, agora na ilha. A AMS tem mais de 25 anos de história em Florianópolis.',
              'Global names in design, architecture and management, now on the island. AMS has over 25 years in Florianópolis.'],
      fatos: [['25+ anos', 'de história'], ['2.000+ unidades', 'entregues']],
      fotos: ['assets/imoveis/ams.jpg'],
      docs: [{ nome: 'Portfólio AMS', tipo: 'book', exemplo: true }],
      mostrarEndereco: false, mostrarValor: false }
  ],
  // Pessoas fictícias, só para testar o envio
  clientes: [
    { id: 'c1', nome: 'Marina (exemplo)', whatsapp: '5548900000001', idioma: 'pt', etapa: 'Novo', origem: 'Instagram', etiquetas: ['Serra'] },
    { id: 'c2', nome: 'Paulo (exemplo)', whatsapp: '5548900000002', idioma: 'pt', etapa: 'Em conversa', origem: 'Site', etiquetas: ['Praia', 'Investidor'] },
    { id: 'c3', nome: 'Julia (exemplo)', whatsapp: '5548900000003', idioma: 'en', etapa: 'Visita', origem: 'Anúncio', etiquetas: ['Praia'] }
  ]
};

var Dados = (function () {
  var CHAVE = 'co_painel_v1';
  var db;

  function carregar() {
    try { db = JSON.parse(localStorage.getItem(CHAVE)); } catch (e) { db = null; }
    if (!db || !db.imoveis) db = JSON.parse(JSON.stringify(SEMENTE));
  }
  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(db)); } catch (e) {} }
  function idDe(nome) {
    var base = String(nome).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'imovel';
    var id = base, n = 2;
    while (db.imoveis.some(function (i) { return i.id === id; })) id = base + '-' + n++;
    return id;
  }

  carregar();

  return {
    demo: DEMO,
    imoveis: function () { return db.imoveis.slice(); },
    imovel: function (id) { return db.imoveis.filter(function (i) { return i.id === id; })[0] || null; },
    salvarImovel: function (im) {
      if (!im.id) { im.id = idDe(im.nome); db.imoveis.unshift(im); }
      else {
        var i = db.imoveis.findIndex(function (x) { return x.id === im.id; });
        if (i >= 0) db.imoveis[i] = im; else db.imoveis.unshift(im);
      }
      salvar(); return im;
    },
    removerImovel: function (id) { db.imoveis = db.imoveis.filter(function (i) { return i.id !== id; }); salvar(); },
    clientes: function () { return db.clientes.slice(); },
    restaurar: function () { db = JSON.parse(JSON.stringify(SEMENTE)); salvar(); }
  };
})();
