/* ============================================================
   DADOS DO PAINEL
   Sem Supabase configurado (CONFIG.supabaseUrl/Key vazios), roda
   em modo demonstração, com dados de exemplo no navegador.
   Com Supabase, lê e grava no banco e guarda fotos e documentos
   no Storage (bucket privado "materiais").
   ============================================================ */
var DEMO = !(CONFIG.supabaseUrl && CONFIG.supabaseAnonKey && window.supabase);

var STATUS = ['Disponível', 'Lançamento', 'Em obras', 'Venda exclusiva', 'Pausado'];
var TIPOS = ['Apartamentos', 'Condomínio de lotes', 'Casa', 'Comercial', 'Incorporadora'];
var ETAPAS = ['Novo', 'Em conversa', 'Visita', 'Proposta', 'Cliente', 'Pausado'];
var ORIGENS = ['Evento', 'Instagram', 'Anúncio', 'Site', 'Indicação', 'WhatsApp', 'Parceiro', 'Outro'];
var TIPOS_DOC = { book: 'Book', tabela: 'Tabela', planta: 'Planta', memorial: 'Memorial', video: 'Vídeo', outro: 'Documento' };

/* Os quatro empreendimentos abaixo vêm dos cartões da LP (casaoliveira.site).
   Os documentos são só exemplos, para ver como a tela fica. */
var SEMENTE = {
  imoveis: [
    { id: 'arcari', nome: 'Estância Arcari', parceiro: 'Venda exclusiva', local: 'Rancho Queimado · Serra catarinense',
      tipo: 'Condomínio de lotes', status: 'Venda exclusiva',
      texto: ['Condomínio de alto padrão na serra catarinense, a dez minutos do centro de Rancho Queimado. Araucárias, campo aberto e vista para as montanhas.',
              'A high-end gated community in the Santa Catarina highlands, ten minutes from downtown Rancho Queimado. Araucaria pines, open fields and mountain views.'],
      fatos: [['32 lotes', 'quase metade já tem dono']],
      fotos: ['assets/imoveis/arcari.jpg'],
      docs: [{ nome: 'Apresentação Estância Arcari', tipo: 'book', exemplo: true },
             { nome: 'Mapa de lotes disponíveis', tipo: 'planta', exemplo: true },
             { nome: 'Condições de pagamento', tipo: 'tabela', exemplo: true }],
      mostrarEndereco: false, mostrarValor: false },
    { id: 'makai', nome: 'Makai Beachfront', parceiro: 'Grupo OAD', local: 'Novo Campeche · Florianópolis',
      tipo: 'Apartamentos', status: 'Em obras',
      texto: ['Pé na areia no Novo Campeche, com paisagismo do escritório Burle Marx e compromisso lixo zero na obra.',
              'Right on the sand in Novo Campeche, with landscaping by the Burle Marx studio and a zero-waste construction commitment.'],
      fatos: [['406 apartamentos', 'estúdios, duplex e coberturas'], ['Entrega', 'prevista para 2027']],
      fotos: ['assets/imoveis/makai.jpg'],
      docs: [{ nome: 'Book Makai Beachfront', tipo: 'book', exemplo: true },
             { nome: 'Plantas dos estúdios e duplex', tipo: 'planta', exemplo: true },
             { nome: 'Memorial descritivo', tipo: 'memorial', exemplo: true }],
      mostrarEndereco: false, mostrarValor: false },
    { id: 'highlands', nome: 'Highlands Vista', parceiro: 'Highlands Engenharia', local: 'Urubici · Serra catarinense',
      tipo: 'Condomínio de lotes', status: 'Disponível',
      texto: ['Condomínio fechado em terreno elevado, a 2 minutos do centro de Urubici. Só 19 lotes, com vista para a serra e mais de 6.100 m² de área verde.',
              'A gated community on high ground, 2 minutes from downtown Urubici. Only 19 lots, with mountain views and over 6,100 m² of green space.'],
      fatos: [['19 lotes', 'de 420 a 635 m²'], ['Galpões', 'e outros investimentos']],
      fotos: ['assets/imoveis/highlands.jpg'],
      docs: [{ nome: 'Implantação dos lotes', tipo: 'planta', exemplo: true },
             { nome: 'Apresentação Highlands Vista', tipo: 'book', exemplo: true }],
      mostrarEndereco: false, mostrarValor: false },
    { id: 'ams', nome: 'AMS Empreendimentos', parceiro: 'AMS Empreendimentos', local: 'Florianópolis',
      tipo: 'Incorporadora', status: 'Lançamento',
      texto: ['Grifes globais de design, arquitetura e gestão, agora na ilha. A AMS tem mais de 25 anos de história em Florianópolis.',
              'Global names in design, architecture and management, now on the island. AMS has over 25 years in Florianópolis.'],
      fatos: [['25+ anos', 'de história'], ['2.000+ unidades', 'entregues']],
      fotos: ['assets/imoveis/ams.jpg'],
      docs: [{ nome: 'Portfólio AMS', tipo: 'book', exemplo: true }],
      mostrarEndereco: false, mostrarValor: false }
  ],
  // Pessoas fictícias, só para testar o envio
  parceiros: [
    { id: 'p1', nome: 'Carla (exemplo)', imobiliaria: 'Imobiliária Exemplo', email: 'carla@exemplo.com', whatsapp: '5548900000010',
      acessoAte: null, imoveis: ['makai', 'highlands'], criadoEm: '2026-11-10T12:00:00Z' },
    { id: 'p2', nome: 'Diego (exemplo)', imobiliaria: 'Corretor autônomo', email: 'diego@exemplo.com', whatsapp: '5548900000011',
      acessoAte: '2026-11-30', imoveis: ['arcari'], criadoEm: '2026-11-12T12:00:00Z' }
  ],
  convites: [],
  aberturas: [
    { parceiroId: 'p1', imovelId: 'makai', arquivo: 'Book Makai Beachfront', criadoEm: '2026-11-17T14:20:00Z' },
    { parceiroId: 'p1', imovelId: 'makai', arquivo: '', criadoEm: '2026-11-17T14:18:00Z' }
  ],
  clientes: [
    { id: 'c1', nome: 'Marina (exemplo)', whatsapp: '5548900000001', email: '', idioma: 'pt', etapa: 'Novo', origem: 'Instagram', etiquetas: ['Serra'],
      aceitaWhatsapp: true, aceitaEmail: false, lembrarEm: null, criadoEm: '2026-11-18T12:00:00Z',
      respostas: { 'O que procura': 'Casa de campo', 'Prazo': 'Até 6 meses' }, notas: [] },
    { id: 'c2', nome: 'Paulo (exemplo)', whatsapp: '5548900000002', email: '', idioma: 'pt', etapa: 'Em conversa', origem: 'Site', etiquetas: ['Praia', 'Investidor'],
      aceitaWhatsapp: true, aceitaEmail: true, lembrarEm: '2026-11-18', criadoEm: '2026-11-15T12:00:00Z', respostas: null,
      notas: [{ texto: 'Gostou do Makai. Quer ver a planta do duplex.', autor: 'Bernardo', criadoEm: '2026-11-16T15:00:00Z' }] },
    { id: 'c3', nome: 'Julia (exemplo)', whatsapp: '5548900000003', email: '', idioma: 'en', etapa: 'Visita', origem: 'Anúncio', etiquetas: ['Praia'],
      aceitaWhatsapp: true, aceitaEmail: false, lembrarEm: null, criadoEm: '2026-11-10T12:00:00Z', respostas: null, notas: [] },
    { id: 'c4', nome: 'Rafael (exemplo)', whatsapp: '5548900000004', email: '', idioma: 'pt', etapa: 'Proposta', origem: 'Indicação', etiquetas: ['Serra', 'Investidor'],
      aceitaWhatsapp: true, aceitaEmail: false, lembrarEm: '2026-11-20', criadoEm: '2026-11-02T12:00:00Z', respostas: null, notas: [] },
    { id: 'c5', nome: 'Helena (exemplo)', whatsapp: '5548900000005', email: '', idioma: 'pt', etapa: 'Novo', origem: 'Anúncio', etiquetas: [],
      aceitaWhatsapp: false, aceitaEmail: false, lembrarEm: null, criadoEm: '2026-11-18T09:00:00Z',
      respostas: { 'O que procura': 'Apartamento na praia', 'Prazo': 'Só pesquisando' }, notas: [] }
  ]
};

/* ---------- utilidades comuns ---------- */
function slug(nome, existe) {
  var base = String(nome).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'imovel';
  var id = base, n = 2;
  while (existe(id)) id = base + '-' + n++;
  return id;
}
function tipoPorNome(nome) {
  return /tabela|preco|preço|valores/i.test(nome) ? 'tabela' : /planta|implanta/i.test(nome) ? 'planta' : /memorial/i.test(nome) ? 'memorial' :
    /\.(mp4|mov)$/i.test(nome) ? 'video' : /book|apresenta/i.test(nome) ? 'book' : 'outro';
}
/* Reduz a foto (lado maior 1600 px) antes de guardar ou enviar */
function reduzirFoto(arq, max) {
  max = max || 1600;
  return new Promise(function (ok, erro) {
    var url = URL.createObjectURL(arq), img = new Image();
    img.onload = function () {
      var s = Math.min(1, max / Math.max(img.width, img.height));
      var c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob(function (b) { ok(b); }, 'image/jpeg', .85);
    };
    img.onerror = erro; img.src = url;
  });
}
function blobParaDataUrl(b) {
  return new Promise(function (ok) { var r = new FileReader(); r.onload = function () { ok(r.result); }; r.readAsDataURL(b); });
}

/* ============================================================
   MODO DEMONSTRAÇÃO
   ============================================================ */
function DadosDemo() {
  var CHAVE = 'co_painel_v2', db, eu = null;
  try { db = JSON.parse(localStorage.getItem(CHAVE)); } catch (e) { db = null; }
  if (!db || !db.imoveis) db = JSON.parse(JSON.stringify(SEMENTE));
  if (!db.parceiros) { db.parceiros = JSON.parse(JSON.stringify(SEMENTE.parceiros)); db.convites = []; db.aberturas = SEMENTE.aberturas.slice(); }
  try { eu = JSON.parse(sessionStorage.getItem('co_eu')); } catch (e) {}
  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(db)); } catch (e) {} }
  function achar(id) { return db.imoveis.filter(function (i) { return i.id === id; })[0] || null; }
  function parc(id) { return db.parceiros.filter(function (x) { return x.id === id; })[0] || null; }

  return {
    demo: true,
    iniciar: function () { return Promise.resolve(); },
    eu: function () { return eu; },
    entrar: function (email, senha, nome, modo) {
      if (modo === 'parceiro') {
        var pa = db.parceiros[0];
        eu = { id: pa.id, nome: pa.nome, email: pa.email, papel: 'parceiro', imobiliaria: pa.imobiliaria };
      } else eu = { nome: nome || email.split('@')[0], email: email, papel: 'equipe' };
      try { sessionStorage.setItem('co_eu', JSON.stringify(eu)); } catch (e) {}
      return Promise.resolve(eu);
    },
    sair: function () { eu = null; try { sessionStorage.removeItem('co_eu'); } catch (e) {} return Promise.resolve(); },
    imoveis: function () {
      if (eu && eu.papel === 'parceiro') { var pa = parc(eu.id); return db.imoveis.filter(function (i) { return pa && pa.imoveis.indexOf(i.id) >= 0; }); }
      return db.imoveis.slice();
    },
    imovel: achar,
    parceiros: function () { return db.parceiros.slice(); },
    parceiro: parc,
    convites: function () { return db.convites.filter(function (c) { return !c.usadoEm; }); },
    convidar: function (c) {
      c.id = 'cv' + Date.now(); c.criadoEm = new Date().toISOString(); db.convites.unshift(c); salvar(); return Promise.resolve(c);
    },
    cancelarConvite: function (id) { db.convites = db.convites.filter(function (c) { return c.id !== id; }); salvar(); return Promise.resolve(); },
    salvarParceiro: function (pa) {
      var i = db.parceiros.findIndex(function (x) { return x.id === pa.id; }); if (i >= 0) db.parceiros[i] = pa; salvar(); return Promise.resolve(pa);
    },
    aberturas: function (pid) {
      return Promise.resolve(db.aberturas.filter(function (a) { return !pid || a.parceiroId === pid; }).sort(function (a, b) { return a.criadoEm < b.criadoEm ? 1 : -1; }));
    },
    registrarAbertura: function (imovelId, arquivo) {
      if (eu && eu.papel === 'parceiro') { db.aberturas.push({ parceiroId: eu.id, imovelId: imovelId, arquivo: arquivo ? arquivo.nome : '', criadoEm: new Date().toISOString() }); salvar(); }
      return Promise.resolve();
    },
    conviteInfo: function (id) {
      var c = db.convites.filter(function (x) { return x.id === id && !x.usadoEm; })[0];
      return Promise.resolve(c ? { nome: c.nome, email: c.email, imobiliaria: c.imobiliaria, imoveis: c.imoveis.map(function (i) { var im = achar(i); return im ? im.nome : i; }) } : null);
    },
    aceitarConvite: function (id, email, senha) {
      var c = db.convites.filter(function (x) { return x.id === id; })[0];
      if (!c || c.email.toLowerCase() !== email.toLowerCase()) return Promise.reject(new Error('convite'));
      var pa = { id: 'p' + Date.now(), nome: c.nome, imobiliaria: c.imobiliaria, email: c.email, whatsapp: c.whatsapp, acessoAte: c.acessoAte, imoveis: c.imoveis.slice(), criadoEm: new Date().toISOString() };
      db.parceiros.unshift(pa); c.usadoEm = pa.criadoEm; salvar();
      eu = { id: pa.id, nome: pa.nome, email: pa.email, papel: 'parceiro', imobiliaria: pa.imobiliaria };
      try { sessionStorage.setItem('co_eu', JSON.stringify(eu)); } catch (e) {}
      return Promise.resolve(eu);
    },
    clientes: function () { return db.clientes.slice(); },
    cliente: function (id) { return db.clientes.filter(function (c) { return c.id === id; })[0] || null; },
    salvarCliente: function (c) {
      if (!c.id) { c.id = 'c' + Date.now(); c.criadoEm = new Date().toISOString(); c.notas = []; db.clientes.unshift(c); }
      else { var i = db.clientes.findIndex(function (x) { return x.id === c.id; }); if (i >= 0) db.clientes[i] = c; }
      salvar(); return Promise.resolve(c);
    },
    removerCliente: function (id) { db.clientes = db.clientes.filter(function (c) { return c.id !== id; }); salvar(); return Promise.resolve(); },
    anotacoes: function (id) { var c = this.cliente(id); return Promise.resolve(c && c.notas ? c.notas.slice().reverse() : []); },
    anotar: function (id, texto) {
      var c = this.cliente(id); c.notas = c.notas || [];
      c.notas.push({ texto: texto, autor: eu ? eu.nome : '', criadoEm: new Date().toISOString() }); salvar();
      return Promise.resolve();
    },
    salvarImovel: function (im) {
      if (!im.id) { im.id = slug(im.nome, achar); db.imoveis.unshift(im); }
      else {
        var i = db.imoveis.findIndex(function (x) { return x.id === im.id; });
        if (i >= 0) db.imoveis[i] = im; else db.imoveis.unshift(im);
      }
      salvar(); return Promise.resolve(im);
    },
    removerImovel: function (id) { db.imoveis = db.imoveis.filter(function (i) { return i.id !== id; }); salvar(); return Promise.resolve(); },
    adicionarFotos: function (im, arquivos) {
      return Promise.all(arquivos.map(function (f) { return reduzirFoto(f, 1200).then(blobParaDataUrl); }))
        .then(function (urls) { var x = achar(im.id); x.fotos = x.fotos.concat(urls); salvar(); return x; });
    },
    adicionarDocs: function (im, arquivos) {
      var x = achar(im.id);
      arquivos.forEach(function (f) { x.docs.push({ nome: f.name.replace(/\.[^.]+$/, ''), tipo: tipoPorNome(f.name), exemplo: true }); });
      salvar(); return Promise.resolve(x);
    },
    linkArquivo: function () { return Promise.resolve(null); }
  };
}

/* ============================================================
   SUPABASE
   ============================================================ */
function DadosSupabase() {
  var sb = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey);
  var BUCKET = 'materiais';
  var eu = null, imoveis = [], clientes = [], parceiros = [], convites = [];

  function deLinha(r, arqs, urls) {
    var meus = arqs.filter(function (a) { return a.imovel_id === r.id; });
    var fotos = meus.filter(function (a) { return a.tipo === 'foto'; });
    return {
      id: r.id, nome: r.nome, parceiro: r.parceiro || '', local: r.local || '', tipo: r.tipo || '', status: r.status,
      texto: [r.texto_pt || '', r.texto_en || ''], fatos: r.fatos || [],
      endereco: r.endereco || '', valores: r.valores || '',
      mostrarEndereco: r.mostrar_endereco, mostrarValor: r.mostrar_valor,
      fotos: fotos.map(function (a) { return urls[a.caminho] || ''; }),
      _fotos: fotos,
      docs: meus.filter(function (a) { return a.tipo !== 'foto'; }).map(function (a) { return { id: a.id, nome: a.nome, tipo: a.tipo, caminho: a.caminho }; })
    };
  }
  function paraLinha(im) {
    return {
      id: im.id, nome: im.nome, parceiro: im.parceiro || null, local: im.local || null, tipo: im.tipo || null, status: im.status,
      texto_pt: im.texto[0] || null, texto_en: im.texto[1] || null, fatos: im.fatos || [],
      endereco: im.endereco || null, valores: im.valores || null,
      mostrar_endereco: !!im.mostrarEndereco, mostrar_valor: !!im.mostrarValor, atualizado_em: new Date().toISOString()
    };
  }
  function falhou(r) { if (r.error) throw r.error; return r.data; }
  function clienteDeLinha(c) {
    return { id: c.id, nome: c.nome, whatsapp: c.whatsapp || '', email: c.email || '', idioma: c.idioma, etapa: c.etapa, origem: c.origem || '',
      etiquetas: c.etiquetas || [], aceitaWhatsapp: c.aceita_whatsapp, aceitaEmail: c.aceita_email, lembrarEm: c.lembrar_em,
      respostas: c.respostas_quiz, utm: c.utm, criadoEm: c.criado_em };
  }
  function clienteParaLinha(c) {
    return { nome: c.nome, whatsapp: c.whatsapp || null, email: c.email || null, idioma: c.idioma || 'pt', etapa: c.etapa || 'Novo',
      origem: c.origem || null, etiquetas: c.etiquetas || [], aceita_whatsapp: !!c.aceitaWhatsapp, aceita_email: !!c.aceitaEmail,
      lembrar_em: c.lembrarEm || null };
  }

  function carregarTudo() {
    return Promise.all([
      sb.from('imoveis').select('*').order('criado_em', { ascending: false }),
      sb.from('arquivos').select('*').order('ordem').order('criado_em'),
      equipe() ? sb.from('clientes').select('*').order('criado_em', { ascending: false }) : Promise.resolve({ data: [] }),
      equipe() ? sb.from('perfis').select('*').eq('papel', 'parceiro').order('criado_em', { ascending: false }) : Promise.resolve({ data: [] }),
      equipe() ? sb.from('acessos_parceiro').select('*') : Promise.resolve({ data: [] }),
      equipe() ? sb.from('convites').select('*').is('usado_em', null).order('criado_em', { ascending: false }) : Promise.resolve({ data: [] })
    ]).then(function (rs) {
      var ims = falhou(rs[0]), arqs = falhou(rs[1]), cls = falhou(rs[2]), pfs = falhou(rs[3]), acs = falhou(rs[4]), cvs = falhou(rs[5]);
      clientes = cls.map(clienteDeLinha);
      parceiros = pfs.map(function (p) {
        return { id: p.id, nome: p.nome, imobiliaria: p.imobiliaria || '', whatsapp: p.whatsapp || '', acessoAte: p.acesso_ate, criadoEm: p.criado_em,
          imoveis: acs.filter(function (a) { return a.parceiro_id === p.id; }).map(function (a) { return a.imovel_id; }) };
      });
      convites = cvs.map(function (c) {
        return { id: c.id, nome: c.nome, email: c.email, imobiliaria: c.imobiliaria || '', whatsapp: c.whatsapp || '', imoveis: c.imoveis || [], acessoAte: c.acesso_ate, criadoEm: c.criado_em };
      });
      var caminhos = arqs.filter(function (a) { return a.tipo === 'foto'; }).map(function (a) { return a.caminho; });
      var p = caminhos.length ? sb.storage.from(BUCKET).createSignedUrls(caminhos, 60 * 60 * 12) : Promise.resolve({ data: [] });
      return p.then(function (r) {
        var urls = {};
        (r.data || []).forEach(function (u) { if (u.signedUrl) urls[u.path] = u.signedUrl; });
        imoveis = ims.map(function (i) { return deLinha(i, arqs, urls); });
      });
    });
  }
  function carregarPerfil(user, nomeEscolhido) {
    return sb.from('perfis').select('*').eq('id', user.id).maybeSingle().then(function (r) {
      if (r.error) throw r.error;
      if (!r.data) { eu = null; throw new Error('sem-acesso'); }
      if (r.data.papel === 'parceiro' && r.data.acesso_ate && r.data.acesso_ate < hoje()) { eu = null; throw new Error('expirado'); }
      eu = { id: user.id, nome: r.data.nome, email: user.email, papel: r.data.papel, imobiliaria: r.data.imobiliaria || '' };
      if (eu.papel !== 'equipe') return eu;
      // Primeiro login: troca o nome provisório (parte do e-mail) pelo nome escolhido na tela
      if (nomeEscolhido && r.data.nome !== nomeEscolhido && CONFIG.equipe.indexOf(r.data.nome) < 0) {
        eu.nome = nomeEscolhido;
        sb.from('perfis').update({ nome: nomeEscolhido }).eq('id', user.id).then(function () {});
      }
      return eu;
    });
  }
  function achar(id) { return imoveis.filter(function (i) { return i.id === id; })[0] || null; }
  function equipe() { return eu && eu.papel === 'equipe'; }
  function hoje() { var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }
  function enviar(im, arquivo, tipo, nome) {
    var ext = (arquivo.name || 'foto.jpg').split('.').pop().toLowerCase();
    var caminho = im.id + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + (tipo === 'foto' ? 'jpg' : ext);
    return sb.storage.from(BUCKET).upload(caminho, arquivo, { contentType: arquivo.type || undefined, upsert: false })
      .then(falhou)
      .then(function () { return sb.from('arquivos').insert({ imovel_id: im.id, tipo: tipo, nome: nome, caminho: caminho }); })
      .then(falhou);
  }

  return {
    demo: false,
    iniciar: function () {
      return sb.auth.getSession().then(function (r) {
        var s = r.data && r.data.session;
        if (!s) return;
        return carregarPerfil(s.user).then(carregarTudo).catch(function () { eu = null; return sb.auth.signOut(); });
      });
    },
    eu: function () { return eu; },
    entrar: function (email, senha, nome) {
      return sb.auth.signInWithPassword({ email: email, password: senha }).then(function (r) {
        if (r.error) { var e = new Error('senha'); e.detalhe = r.error.message || String(r.error); throw e; }
        return carregarPerfil(r.data.user, nome).then(function (p) { return carregarTudo().then(function () { return p; }); });
      }).catch(function (e) { if (e.message === 'sem-acesso' || e.message === 'expirado') sb.auth.signOut(); throw e; });
    },
    parceiros: function () { return parceiros.slice(); },
    parceiro: function (id) { return parceiros.filter(function (x) { return x.id === id; })[0] || null; },
    convites: function () { return convites.slice(); },
    convidar: function (c) {
      return sb.from('convites').insert({ email: c.email.trim().toLowerCase(), nome: c.nome, imobiliaria: c.imobiliaria || null, whatsapp: c.whatsapp || null,
        imoveis: c.imoveis, acesso_ate: c.acessoAte || null, criado_por: eu && eu.id }).select().single()
        .then(falhou).then(function (l) { c.id = l.id; c.criadoEm = l.criado_em; convites.unshift(c); return c; });
    },
    cancelarConvite: function (id) {
      return sb.from('convites').delete().eq('id', id).then(falhou).then(function () { convites = convites.filter(function (c) { return c.id !== id; }); });
    },
    salvarParceiro: function (pa) {
      var antes = (this.parceiro(pa.id) || { imoveis: [] }).imoveis;
      var tirar = antes.filter(function (i) { return pa.imoveis.indexOf(i) < 0; });
      var por = pa.imoveis.filter(function (i) { return antes.indexOf(i) < 0; });
      return sb.from('perfis').update({ acesso_ate: pa.acessoAte || null, imobiliaria: pa.imobiliaria || null, whatsapp: pa.whatsapp || null }).eq('id', pa.id).then(falhou)
        .then(function () { return tirar.length ? sb.from('acessos_parceiro').delete().eq('parceiro_id', pa.id).in('imovel_id', tirar).then(falhou) : null; })
        .then(function () { return por.length ? sb.from('acessos_parceiro').insert(por.map(function (i) { return { parceiro_id: pa.id, imovel_id: i }; })).then(falhou) : null; })
        .then(function () { var i = parceiros.findIndex(function (x) { return x.id === pa.id; }); if (i >= 0) parceiros[i] = pa; return pa; });
    },
    aberturas: function (pid) {
      var q = sb.from('aberturas').select('imovel_id, criado_em, quem, arquivos(nome)').not('quem', 'is', null).order('criado_em', { ascending: false }).limit(200);
      if (pid) q = q.eq('quem', pid);
      return q.then(falhou).then(function (l) {
        return l.map(function (a) { return { parceiroId: a.quem, imovelId: a.imovel_id, arquivo: a.arquivos ? a.arquivos.nome : '', criadoEm: a.criado_em }; });
      });
    },
    registrarAbertura: function (imovelId, arquivo) {
      if (!eu || eu.papel !== 'parceiro') return Promise.resolve();
      return sb.from('aberturas').insert({ imovel_id: imovelId, arquivo_id: arquivo && arquivo.id || null, quem: eu.id, origem: 'parceiro' }).then(function () {});
    },
    conviteInfo: function (id) {
      return sb.rpc('convite_info', { p_id: id }).then(function (r) { return r.error ? null : r.data; });
    },
    aceitarConvite: function (id, email, senha) {
      return sb.auth.signUp({ email: email, password: senha, options: { data: { convite: id } } }).then(function (r) {
        if (r.error) { var e = new Error('cadastro'); e.detalhe = r.error.message; throw e; }
        if (!r.data.session) {
          return sb.auth.signInWithPassword({ email: email, password: senha }).then(function (x) {
            if (x.error) { var e2 = new Error('confirmar'); e2.detalhe = x.error.message; throw e2; }
            return x.data.user;
          });
        }
        return r.data.user;
      }).then(function (user) { return carregarPerfil(user).then(function (p) { return carregarTudo().then(function () { return p; }); }); });
    },
    sair: function () { eu = null; imoveis = []; return sb.auth.signOut(); },
    recuperarSenha: function (email) {
      return sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname }).then(falhou);
    },
    imoveis: function () { return imoveis.slice(); },
    imovel: achar,
    clientes: function () { return clientes.slice(); },
    cliente: function (id) { return clientes.filter(function (c) { return c.id === id; })[0] || null; },
    salvarCliente: function (c) {
      var q = c.id ? sb.from('clientes').update(clienteParaLinha(c)).eq('id', c.id).select().single()
                   : sb.from('clientes').insert(clienteParaLinha(c)).select().single();
      return q.then(falhou).then(function (linha) {
        var novo = clienteDeLinha(linha), i = clientes.findIndex(function (x) { return x.id === novo.id; });
        if (i >= 0) clientes[i] = novo; else clientes.unshift(novo);
        return novo;
      });
    },
    removerCliente: function (id) {
      return sb.from('clientes').delete().eq('id', id).then(falhou).then(function () { clientes = clientes.filter(function (c) { return c.id !== id; }); });
    },
    anotacoes: function (id) {
      return sb.from('anotacoes').select('texto, criado_em, perfis(nome)').eq('cliente_id', id).order('criado_em', { ascending: false })
        .then(falhou).then(function (l) { return l.map(function (a) { return { texto: a.texto, criadoEm: a.criado_em, autor: a.perfis ? a.perfis.nome : '' }; }); });
    },
    anotar: function (id, texto) { return sb.from('anotacoes').insert({ cliente_id: id, texto: texto, autor: eu && eu.id }).then(falhou); },
    salvarImovel: function (im) {
      var novo = !im.id;
      if (novo) im.id = slug(im.nome, achar);
      return sb.from('imoveis').upsert(paraLinha(im)).then(falhou).then(carregarTudo).then(function () { return achar(im.id); });
    },
    removerImovel: function (id) {
      var im = achar(id);
      var caminhos = im ? im._fotos.map(function (a) { return a.caminho; }).concat(im.docs.map(function (d) { return d.caminho; })) : [];
      var p = caminhos.length ? sb.storage.from(BUCKET).remove(caminhos) : Promise.resolve();
      return p.then(function () { return sb.from('imoveis').delete().eq('id', id); }).then(falhou).then(carregarTudo);
    },
    adicionarFotos: function (im, arquivos) {
      return arquivos.reduce(function (p, f) {
        return p.then(function () { return reduzirFoto(f).then(function (b) { return enviar(im, b, 'foto', f.name); }); });
      }, Promise.resolve()).then(carregarTudo).then(function () { return achar(im.id); });
    },
    adicionarDocs: function (im, arquivos) {
      return arquivos.reduce(function (p, f) {
        return p.then(function () { return enviar(im, f, tipoPorNome(f.name), f.name.replace(/\.[^.]+$/, '')); });
      }, Promise.resolve()).then(carregarTudo).then(function () { return achar(im.id); });
    },
    linkArquivo: function (caminho) {
      return sb.storage.from(BUCKET).createSignedUrl(caminho, 60 * 10).then(function (r) { return r.data && r.data.signedUrl; });
    },
    _sb: sb
  };
}

var Dados = DEMO ? DadosDemo() : DadosSupabase();
