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
  clientes: [
    { id: 'c1', nome: 'Marina (exemplo)', whatsapp: '5548900000001', idioma: 'pt', etapa: 'Novo', origem: 'Instagram', etiquetas: ['Serra'] },
    { id: 'c2', nome: 'Paulo (exemplo)', whatsapp: '5548900000002', idioma: 'pt', etapa: 'Em conversa', origem: 'Site', etiquetas: ['Praia', 'Investidor'] },
    { id: 'c3', nome: 'Julia (exemplo)', whatsapp: '5548900000003', idioma: 'en', etapa: 'Visita', origem: 'Anúncio', etiquetas: ['Praia'] }
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
  var CHAVE = 'co_painel_v1', db, eu = null;
  try { db = JSON.parse(localStorage.getItem(CHAVE)); } catch (e) { db = null; }
  if (!db || !db.imoveis) db = JSON.parse(JSON.stringify(SEMENTE));
  try { eu = JSON.parse(sessionStorage.getItem('co_eu')); } catch (e) {}
  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(db)); } catch (e) {} }
  function achar(id) { return db.imoveis.filter(function (i) { return i.id === id; })[0] || null; }

  return {
    demo: true,
    iniciar: function () { return Promise.resolve(); },
    eu: function () { return eu; },
    entrar: function (email, senha, nome) {
      eu = { nome: nome || email.split('@')[0], email: email, papel: 'equipe' };
      try { sessionStorage.setItem('co_eu', JSON.stringify(eu)); } catch (e) {}
      return Promise.resolve(eu);
    },
    sair: function () { eu = null; try { sessionStorage.removeItem('co_eu'); } catch (e) {} return Promise.resolve(); },
    imoveis: function () { return db.imoveis.slice(); },
    imovel: achar,
    clientes: function () { return db.clientes.slice(); },
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
  var eu = null, imoveis = [], clientes = [];

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

  function carregarTudo() {
    return Promise.all([
      sb.from('imoveis').select('*').order('criado_em', { ascending: false }),
      sb.from('arquivos').select('*').order('ordem').order('criado_em'),
      sb.from('clientes').select('*').order('criado_em', { ascending: false })
    ]).then(function (rs) {
      var ims = falhou(rs[0]), arqs = falhou(rs[1]), cls = falhou(rs[2]);
      clientes = cls.map(function (c) { return { id: c.id, nome: c.nome, whatsapp: c.whatsapp || '', idioma: c.idioma, etapa: c.etapa, origem: c.origem || '', etiquetas: c.etiquetas || [] }; });
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
      if (!r.data || r.data.papel !== 'equipe') { eu = null; throw new Error('sem-acesso'); }
      eu = { id: user.id, nome: r.data.nome, email: user.email, papel: r.data.papel };
      // Primeiro login: troca o nome provisório (parte do e-mail) pelo nome escolhido na tela
      if (nomeEscolhido && r.data.nome !== nomeEscolhido && CONFIG.equipe.indexOf(r.data.nome) < 0) {
        eu.nome = nomeEscolhido;
        sb.from('perfis').update({ nome: nomeEscolhido }).eq('id', user.id).then(function () {});
      }
      return eu;
    });
  }
  function achar(id) { return imoveis.filter(function (i) { return i.id === id; })[0] || null; }
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
      }).catch(function (e) { if (e.message === 'sem-acesso') sb.auth.signOut(); throw e; });
    },
    sair: function () { eu = null; imoveis = []; return sb.auth.signOut(); },
    recuperarSenha: function (email) {
      return sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname }).then(falhou);
    },
    imoveis: function () { return imoveis.slice(); },
    imovel: achar,
    clientes: function () { return clientes.slice(); },
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
