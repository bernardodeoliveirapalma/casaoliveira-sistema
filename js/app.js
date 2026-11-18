/* ============================================================
   PAINEL · Casa Oliveira
   Telas: entrar, hoje, imóveis, imóvel, e as áreas que chegam
   nas próximas etapas.
   ============================================================ */
(function () {
'use strict';

/* ---------- utilidades ---------- */
function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function classeStatus(s) { return 's-' + String(s).replace(/\s+/g, '-'); }
function primeiroNome(n) { return String(n || '').replace(/\s*\(.*\)\s*/, '').split(' ')[0]; }
function soNumeros(s) { return String(s || '').replace(/\D/g, ''); }

/* ---------- ícones (traço fino, combinam com a Jost 300) ---------- */
var I = {
  hoje: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  casa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/></svg>',
  pessoas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16.5 14.6c2.6.2 4.4 2 5 4.9"/></svg>',
  parceiro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.5"/></svg>',
  megafone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10v4a1 1 0 0 0 1 1h3l6 4V5L7 9H4a1 1 0 0 0-1 1Z"/><path d="M17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12"/></svg>',
  carta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>',
  mais: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  lupa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  foto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="m21 16-5-5-8 8"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
  voltar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  editar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
  olho: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
  baixar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.2.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.2Z"/></svg>',
  folha: '<svg viewBox="0 0 32 32" fill="none"><path d="M6 26C6 14 14 6 27 5c0 13-8 21-21 21Z" fill="#9DB08A"/><path d="M6 26 19 13" stroke="#F2F0EB" stroke-width="1.4" stroke-linecap="round"/></svg>',
  ramo: '<svg class="ramo" viewBox="0 0 200 200" fill="none" stroke="#F2F0EB" stroke-width="2" stroke-linecap="round"><path d="M20 190C70 140 110 90 190 20"/><path d="M60 150c-20-8-34-24-38-44 20 4 34 20 38 44Z" fill="#F2F0EB"/><path d="M60 150c8-20 24-32 44-34-6 20-22 32-44 34Z" fill="#F2F0EB"/><path d="M105 102c-20-8-34-24-38-44 20 4 34 20 38 44Z" fill="#F2F0EB"/><path d="M105 102c8-20 24-32 44-34-6 20-22 32-44 34Z" fill="#F2F0EB"/><path d="M148 58c-16-8-26-20-30-36 16 4 26 16 30 36Z" fill="#F2F0EB"/><path d="M148 58c8-16 20-26 36-28-6 16-18 26-36 28Z" fill="#F2F0EB"/></svg>'
};

/* ---------- menu ---------- */
var MENU = [
  { id: 'hoje', nome: 'Hoje', ic: 'hoje' },
  { id: 'imoveis', nome: 'Imóveis', ic: 'casa' },
  { id: 'clientes', nome: 'Clientes', ic: 'pessoas', etapa: 2 },
  { id: 'parceiros', nome: 'Parceiros', ic: 'parceiro', etapa: 3 },
  { id: 'comunicados', nome: 'Comunicados', ic: 'megafone', etapa: 4 },
  { id: 'email', nome: 'E-mail', ic: 'carta', etapa: 5 }
];

var BREVE = {
  clientes: { titulo: 'Clientes e leads', texto: 'Todas as pessoas da Casa Oliveira num lugar só, separadas por etapa e etiqueta.',
    itens: ['Leads do quiz da LP entram sozinhos, com a origem marcada', 'Quadro por etapa: novo, em conversa, visita, proposta, cliente', 'Etiquetas, anotações e lembretes de retorno', 'Importar contatos de uma planilha'] },
  parceiros: { titulo: 'Portal de parceiros', texto: 'Corretores parceiros com acesso só aos empreendimentos que vocês liberarem.',
    itens: ['Convite por e-mail, com login próprio', 'Escolher os empreendimentos de cada parceiro', 'Fotos e PDFs com marca d\'água e nome do corretor', 'Acesso com data para expirar e aviso de quem abriu'] },
  comunicados: { titulo: 'Comunicados de WhatsApp', texto: 'Mensagens para um grupo inteiro, na hora ou agendadas, pela API oficial da Meta.',
    itens: ['Escolher o grupo por etiqueta, etapa ou empreendimento', 'Modelos aprovados em português e inglês', 'Resumo antes de enviar: pessoas, modelo e custo', 'Relatório de entregues, lidas e respostas'] },
  email: { titulo: 'E-mail', texto: 'Listas e envios com a identidade da casa.',
    itens: ['Listas por etiqueta', 'Modelos prontos na voz da Casa Oliveira', 'Relatório de abertura', 'Descadastro automático'] }
};

/* ---------- sessão ---------- */
var EU = null;
function sair() { Dados.sair().then(function () { EU = null; location.hash = ''; render(); }); }
function lembrar(nome, email) { try { if (email) localStorage.setItem('co_email_' + nome, email); return localStorage.getItem('co_email_' + nome) || ''; } catch (e) { return email || ''; } }

/* ---------- aviso ---------- */
var toastTimer;
function aviso(txt) {
  var t = $('#toast');
  t.innerHTML = I.folha + '<span>' + esc(txt) + '</span>';
  t.classList.remove('mostra'); void t.offsetWidth; t.classList.add('mostra');
  clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('mostra'); }, 2800);
}

/* ---------- janela ---------- */
function abrirJanela(html, aoMontar) {
  var root = $('#modal-root');
  root.innerHTML = '<div class="fundo"><div class="janela" role="dialog" aria-modal="true">' + html + '</div></div>';
  var fundo = $('.fundo', root);
  fundo.addEventListener('click', function (e) { if (e.target === fundo) fecharJanela(); });
  $$('[data-fechar]', root).forEach(function (b) { b.addEventListener('click', fecharJanela); });
  document.addEventListener('keydown', escFecha);
  if (aoMontar) aoMontar($('.janela', root));
}
function fecharJanela() { $('#modal-root').innerHTML = ''; document.removeEventListener('keydown', escFecha); }
function escFecha(e) { if (e.key === 'Escape') fecharJanela(); }

/* ============================================================
   ENTRAR
   ============================================================ */
function telaEntrar() {
  var sel = 0;
  try { sel = Math.max(0, CONFIG.equipe.indexOf(localStorage.getItem('co_ultimo'))); } catch (e) {}
  $('#app').innerHTML =
    '<div class="login"><div class="login-caixa entra">' +
      '<img class="logo" src="assets/logo.png" alt="Casa Oliveira">' +
      '<div><h1>Bem-vindos de volta</h1><p class="suave">Quem está entrando hoje?</p></div>' +
      '<div class="contas">' + CONFIG.equipe.map(function (nome, i) {
        return '<button type="button" class="conta' + (i === sel ? ' ativa' : '') + '" data-i="' + i + '">' +
          '<span class="avatar' + (nome === 'Ane' ? ' ane' : '') + '">' + esc(nome[0]) + '</span>' + esc(nome) + '</button>';
      }).join('') + '</div>' +
      '<form id="f-entrar">' +
        '<label class="campo"><span class="rotulo">E-mail</span><input class="entrada" id="email" type="email" autocomplete="username" placeholder="seu@email.com" value="' + esc(lembrar(CONFIG.equipe[sel])) + '"></label>' +
        '<label class="campo"><span class="rotulo">Senha</span><input class="entrada" id="senha" type="password" autocomplete="current-password" placeholder="Sua senha"></label>' +
        '<button class="btn btn-verde btn-bloco" type="submit" id="b-entrar">Entrar</button>' +
      '</form>' +
      (Dados.demo ? '' : '<button type="button" class="btn btn-linha btn-pequeno" style="margin-top:14px" id="esqueci">Esqueci minha senha</button>') +
      (Dados.demo ? '<div class="aviso-demo">Modo demonstração. Qualquer senha entra, e os dados ficam só neste navegador.</div>' : '') +
    '</div></div>';

  $$('.conta').forEach(function (b) {
    b.addEventListener('click', function () {
      sel = +b.dataset.i;
      $$('.conta').forEach(function (x) { x.classList.toggle('ativa', x === b); });
      $('#email').value = lembrar(CONFIG.equipe[sel]); ($('#email').value ? $('#senha') : $('#email')).focus();
    });
  });
  $('#f-entrar').addEventListener('submit', function (e) {
    e.preventDefault();
    var email = $('#email').value.trim().toLowerCase(), senha = $('#senha').value;
    if (!email || !senha) { aviso('Preencha e-mail e senha.'); return; }
    var b = $('#b-entrar'); b.disabled = true; b.textContent = 'Entrando...';
    Dados.entrar(email, senha, CONFIG.equipe[sel]).then(function (p) {
      EU = p; lembrar(CONFIG.equipe[sel], email);
      try { localStorage.setItem('co_ultimo', CONFIG.equipe[sel]); } catch (e2) {}
      location.hash = '#/hoje'; render();
    }).catch(function (err) {
      b.disabled = false; b.textContent = 'Entrar';
      aviso(err && err.message === 'sem-acesso' ? 'Esse e-mail não tem acesso ao painel.' : 'Não consegui entrar. (' + ((err && (err.detalhe || err.message)) || 'erro desconhecido') + ')');
    });
  });
  var esq = $('#esqueci');
  if (esq) esq.addEventListener('click', function () {
    var email = $('#email').value.trim();
    if (!email) { aviso('Escreva seu e-mail primeiro.'); return; }
    Dados.recuperarSenha(email).then(function () { aviso('Mandamos um link para ' + email + '.'); }, function () { aviso('Não deu certo agora. Tente de novo.'); });
  });
}

/* ============================================================
   CASCA (menu lateral no computador, barra embaixo no celular)
   ============================================================ */
function casca(atual, miolo) {
  var lat = MENU.map(function (m) {
    return '<a href="#/' + m.id + '" class="' + (m.id === atual ? 'ativo' : '') + '">' + I[m.ic] + '<span>' + m.nome + '</span>' +
      (m.etapa ? '<span class="breve">Em breve</span>' : '') + '</a>';
  }).join('');
  var baixo = MENU.filter(function (m) { return m.id !== 'email'; }).map(function (m) {
    return '<a href="#/' + m.id + '" class="' + (m.id === atual ? 'ativo' : '') + '">' + I[m.ic] + '<span>' + m.nome + '</span></a>';
  }).join('');
  return '<div class="casca">' +
    '<aside class="lateral"><img class="logo" src="assets/logo-creme.png" alt="Casa Oliveira"><nav class="menu">' + lat + '</nav>' +
      '<div class="eu"><span class="avatar">' + esc(EU.nome[0]) + '</span><span>' + esc(EU.nome) + '</span><button type="button" data-sair>Sair</button></div></aside>' +
    '<main class="conteudo">' +
      '<div class="topo-celular"><img class="logo" src="assets/logo.png" alt="Casa Oliveira"><button class="btn btn-linha btn-pequeno" type="button" data-sair>Sair</button></div>' +
      (Dados.demo ? '<div class="faixa-demo"><span class="rotulo">Demonstração</span><span>Dados de exemplo. Nada aqui sai do seu navegador.</span></div>' : '') +
      miolo +
    '</main>' +
    '<nav class="barra-baixo">' + baixo + '</nav>' +
  '</div>';
}

/* ============================================================
   HOJE
   ============================================================ */
function saudacao() { var h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; }
function telaHoje() {
  var ims = Dados.imoveis();
  var docs = ims.reduce(function (s, i) { return s + i.docs.length; }, 0);
  var fotos = ims.reduce(function (s, i) { return s + i.fotos.length; }, 0);
  var data = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  return '<div class="entra">' +
    '<section class="ola"><span class="rotulo">' + esc(data) + '</span><h1>' + saudacao() + ', ' + esc(EU.nome) + '</h1>' +
      '<p>Aqui fica o resumo do dia. Quando os clientes chegarem na etapa 2, os leads novos e os retornos combinados aparecem neste quadro.</p>' + I.ramo + '</section>' +
    '<div class="blocos">' +
      '<div class="bloco c1"><span class="rotulo">Imóveis</span><div class="numero">' + ims.length + '</div><span class="suave">cadastrados no painel</span></div>' +
      '<div class="bloco c2"><span class="rotulo">Fotos</span><div class="numero">' + fotos + '</div><span class="suave">prontas para enviar</span></div>' +
      '<div class="bloco c3"><span class="rotulo">Documentos</span><div class="numero">' + docs + '</div><span class="suave">books, plantas e tabelas</span></div>' +
    '</div>' +
    '<span class="rotulo" style="display:block;margin-bottom:12px">O que vamos fazer agora</span>' +
    '<div class="atalhos">' +
      '<a class="atalho" data-novo-imovel><span class="ic">' + I.mais + '</span><span>Novo imóvel</span><small>Fotos, documentos e ficha</small></a>' +
      '<a class="atalho" href="#/imoveis"><span class="ic" style="background:#E7F0E1;color:#2F6B43">' + I.wa + '</span><span>Enviar material</span><small>Escolha o imóvel e o cliente</small></a>' +
      '<a class="atalho" href="#/clientes"><span class="ic" style="background:var(--t-areia);color:#6A4A12">' + I.pessoas + '</span><span>Clientes</span><small>Chega na etapa 2</small></a>' +
      '<a class="atalho" href="#/comunicados"><span class="ic" style="background:var(--t-terra);color:var(--marrom)">' + I.megafone + '</span><span>Comunicados</span><small>Chega na etapa 4</small></a>' +
    '</div></div>';
}

/* ============================================================
   IMÓVEIS
   ============================================================ */
var filtro = { busca: '', status: 'Todos' };
function cartaoImovel(im) {
  return '<a class="cartao" href="#/imovel/' + encodeURIComponent(im.id) + '">' +
    '<div class="foto" style="background-image:url(\'' + esc(im.fotos[0] || '') + '\')"><span class="selo ' + classeStatus(im.status) + ' selo">' + esc(im.status) + '</span></div>' +
    '<div class="corpo"><span class="rotulo">' + esc(im.parceiro || im.tipo) + '</span><h3>' + esc(im.nome) + '</h3><span class="suave">' + esc(im.local) + '</span>' +
      '<div class="meta"><span>' + I.foto + im.fotos.length + ' fotos</span><span>' + I.doc + im.docs.length + ' documentos</span></div></div></a>';
}
function listaFiltrada() {
  var b = filtro.busca.toLowerCase();
  return Dados.imoveis().filter(function (im) {
    if (filtro.status !== 'Todos' && im.status !== filtro.status) return false;
    if (!b) return true;
    return [im.nome, im.local, im.parceiro, im.tipo].join(' ').toLowerCase().indexOf(b) >= 0;
  });
}
function telaImoveis() {
  var opcoes = ['Todos'].concat(STATUS);
  return '<div class="entra">' +
    '<div class="topo"><div><span class="rotulo">Curadoria</span><h1>Imóveis</h1></div>' +
      '<div class="topo-acoes"><button class="btn btn-verde" type="button" data-novo-imovel>' + I.mais + 'Novo imóvel</button></div></div>' +
    '<div class="filtros"><label class="busca">' + I.lupa + '<input class="entrada" id="busca" placeholder="Buscar por nome, bairro ou parceiro" value="' + esc(filtro.busca) + '"></label>' +
      opcoes.map(function (s) { return '<button type="button" class="chip' + (s === filtro.status ? ' ativo' : '') + '" data-status="' + esc(s) + '">' + esc(s) + '</button>'; }).join('') +
    '</div>' +
    '<div class="grade" id="grade"></div></div>';
}
function preencherGrade() {
  var g = $('#grade'); if (!g) return;
  var l = listaFiltrada();
  g.innerHTML = l.map(cartaoImovel).join('') +
    '<button type="button" class="cartao novo" data-novo-imovel><span class="mais">' + I.mais + '</span><span>Adicionar imóvel</span></button>';
}

/* ============================================================
   IMÓVEL
   ============================================================ */
var idiomaFicha = 0;
function telaImovel(id) {
  var im = Dados.imovel(id);
  if (!im) return '<a class="voltar" href="#/imoveis">' + I.voltar + 'Imóveis</a><div class="breve-tela"><h2>Imóvel não encontrado</h2></div>';
  return '<div class="entra">' +
    '<a class="voltar" href="#/imoveis">' + I.voltar + 'Todos os imóveis</a>' +
    '<section class="capa" style="background-image:url(\'' + esc(im.fotos[0] || '') + '\')"><div class="sobre">' +
      '<span class="selo ' + classeStatus(im.status) + '">' + esc(im.status) + '</span>' +
      '<h1>' + esc(im.nome) + '</h1><p>' + esc(im.local) + (im.parceiro ? ' · ' + esc(im.parceiro) : '') + '</p></div></section>' +
    '<div class="acoes-imovel">' +
      '<button class="btn btn-wa" type="button" data-enviar>' + I.wa + 'Enviar pelo WhatsApp</button>' +
      '<button class="btn btn-linha" type="button" data-copiar>' + I.link + 'Copiar link da apresentação</button>' +
      '<a class="btn btn-linha" href="apresentacao.html?i=' + encodeURIComponent(im.id) + '" target="_blank" rel="noopener">' + I.olho + 'Ver como o cliente vê</a>' +
      '<button class="btn btn-linha btn-redondo" type="button" data-editar aria-label="Editar">' + I.editar + '</button>' +
    '</div>' +
    '<div class="duas"><div>' +
      '<section class="painel"><div class="painel-topo"><span class="rotulo">Sobre</span>' +
        '<div class="idiomas"><button type="button" data-idioma="0" class="' + (idiomaFicha === 0 ? 'ativo' : '') + '">PT</button><button type="button" data-idioma="1" class="' + (idiomaFicha === 1 ? 'ativo' : '') + '">EN</button></div></div>' +
        '<p>' + esc(im.texto[idiomaFicha] || '') + '</p>' +
        (im.fatos.length ? '<div class="fatos">' + im.fatos.map(function (f) { return '<div class="fato"><div class="k">' + esc(f[0]) + '</div><div class="v">' + esc(f[1]) + '</div></div>'; }).join('') + '</div>' : '') +
      '</section>' +
      '<section class="painel"><div class="painel-topo"><span class="rotulo">Fotos · ' + im.fotos.length + '</span></div><div class="fotos">' +
        im.fotos.map(function (f) { return '<div class="ft" style="background-image:url(\'' + esc(f) + '\')"></div>'; }).join('') +
        '<label class="soltar" id="soltar-fotos"><input type="file" accept="image/*" multiple hidden id="mais-fotos">Arraste fotos aqui ou toque para escolher</label>' +
      '</div></section>' +
    '</div><div>' +
      '<section class="painel"><div class="painel-topo"><span class="rotulo">Documentos · ' + im.docs.length + '</span>' +
        '<label class="btn btn-linha btn-pequeno">' + I.mais + 'Adicionar<input type="file" hidden multiple id="mais-docs" accept=".pdf,.doc,.docx,.xls,.xlsx,.mp4,.mov"></label></div><div class="docs">' +
        im.docs.map(function (d, i) {
          return '<div class="doc"><span class="ic ' + esc(d.tipo) + '">' + esc((TIPOS_DOC[d.tipo] || 'Doc').slice(0, 4)) + '</span>' +
            '<div class="nome"><div>' + esc(d.nome) + '</div><small>' + esc(TIPOS_DOC[d.tipo] || 'Documento') + (d.exemplo ? ' · exemplo, sem arquivo' : '') + '</small></div>' +
            '<button class="btn btn-linha btn-redondo btn-pequeno" style="width:40px" type="button" aria-label="Baixar" data-baixar="' + i + '">' + I.baixar + '</button></div>';
        }).join('') + '</div></section>' +
      '<section class="painel"><span class="rotulo">O que o cliente vê</span><div class="privacidade">' +
        '<label class="alavanca"><input type="checkbox" data-priv="mostrarEndereco"' + (im.mostrarEndereco ? ' checked' : '') + '><span class="trilho"></span>Mostrar endereço</label>' +
        '<label class="alavanca"><input type="checkbox" data-priv="mostrarValor"' + (im.mostrarValor ? ' checked' : '') + '><span class="trilho"></span>Mostrar valores</label>' +
        '<p class="suave" style="font-size:13px">Por padrão a página de apresentação não mostra endereço nem valor.</p>' +
      '</div></section>' +
    '</div></div></div>';
}

function linkApresentacao(im) {
  var base = Dados.demo ? location.href.replace(/[#?].*$/, '').replace(/index\.html$/, '') : CONFIG.site + '/';
  return base + 'apresentacao.html?i=' + encodeURIComponent(im.id);
}

/* ---------- Enviar pelo WhatsApp ---------- */
function mensagem(im, pessoa, idioma, docsSel) {
  var nome = primeiroNome(pessoa && pessoa.nome);
  var link = linkApresentacao(im) + (idioma === 'en' ? '&lang=en' : '');
  var lista = docsSel.length ? docsSel.map(function (d) { return '· ' + d.nome; }).join('\n') : '';
  if (idioma === 'en') {
    return 'Hello' + (nome ? ', ' + nome : '') + '. This is Casa Oliveira.\n' +
      'We have put together the ' + im.nome + ' presentation for you:\n' + link +
      (lista ? '\n\nIncluded:\n' + lista : '') +
      '\n\nWe are here for any questions.\n' + CONFIG.assinatura;
  }
  return 'Olá' + (nome ? ', ' + nome : '') + '. Aqui é a família Casa Oliveira.\n' +
    'Separamos a apresentação do ' + im.nome + ' para você:\n' + link +
    (lista ? '\n\nNela estão:\n' + lista : '') +
    '\n\nQualquer dúvida, seguimos por aqui.\n' + CONFIG.assinatura;
}

function janelaEnviar(im) {
  var clientes = Dados.clientes();
  var est = { pessoa: null, numero: '', idioma: 'pt', docs: im.docs.map(function () { return true; }) };
  abrirJanela(
    '<span class="rotulo">Enviar pelo WhatsApp</span><h2>' + esc(im.nome) + '</h2>' +
    '<div class="passo"><span class="rotulo">1. Para quem</span>' +
      '<input class="entrada" id="w-busca" placeholder="Nome do cliente ou número com DDD">' +
      '<div class="pessoas" id="w-pessoas"></div></div>' +
    '<div class="passo"><span class="rotulo">2. Idioma</span><div class="idiomas" id="w-idioma"><button type="button" data-l="pt" class="ativo">Português</button><button type="button" data-l="en">English</button></div></div>' +
    '<div class="passo"><span class="rotulo">3. O que vai junto</span><div class="marcas">' +
      im.docs.map(function (d, i) { return '<label class="marca"><input type="checkbox" data-doc="' + i + '" checked>' + esc(d.nome) + '</label>'; }).join('') +
      '<label class="marca"><input type="checkbox" checked disabled>Fotos (' + im.fotos.length + ')</label>' +
    '</div></div>' +
    '<div class="passo"><span class="rotulo">4. Mensagem</span><div class="previa" id="w-previa"></div></div>' +
    '<div class="fim"><button class="btn btn-linha" type="button" data-fechar>Cancelar</button><a class="btn btn-wa" id="w-abrir" target="_blank" rel="noopener">' + I.wa + 'Abrir no WhatsApp</a></div>' +
    '<p class="suave" style="font-size:13px;margin-top:12px">Abre o WhatsApp da Casa Oliveira com a mensagem pronta. Você só aperta enviar.</p>',
    function (j) {
      function pintarPessoas() {
        var q = $('#w-busca', j).value.trim().toLowerCase();
        var nums = soNumeros(q);
        var l = clientes.filter(function (c) { return !q || c.nome.toLowerCase().indexOf(q) >= 0 || (nums && c.whatsapp.indexOf(nums) >= 0); });
        var html = l.map(function (c) {
          return '<div class="pessoa' + (est.pessoa && est.pessoa.id === c.id ? ' ativa' : '') + '" data-c="' + c.id + '"><span class="avatar">' + esc(c.nome[0]) + '</span>' +
            '<div>' + esc(c.nome) + '<small>' + esc(c.etapa) + ' · ' + esc(c.origem) + '</small></div></div>';
        }).join('');
        if (nums.length >= 10) html = '<div class="pessoa' + (!est.pessoa && est.numero ? ' ativa' : '') + '" data-num="' + nums + '"><span class="avatar ane">+</span><div>Enviar para ' + esc(q) + '<small>Número digitado</small></div></div>' + html;
        $('#w-pessoas', j).innerHTML = html || '<p class="suave" style="padding:8px">Ninguém com esse nome. Digite o número com DDD.</p>';
      }
      function atualizar() {
        var docs = im.docs.filter(function (_, i) { return est.docs[i]; });
        $('#w-previa', j).textContent = mensagem(im, est.pessoa, est.idioma, docs);
        var num = est.pessoa ? est.pessoa.whatsapp : est.numero;
        if (num && num.length <= 11) num = '55' + num;
        var a = $('#w-abrir', j);
        a.href = 'https://wa.me/' + (num || '') + '?text=' + encodeURIComponent(mensagem(im, est.pessoa, est.idioma, docs));
        a.style.opacity = num ? 1 : .5; a.style.pointerEvents = num ? '' : 'none';
      }
      $('#w-busca', j).addEventListener('input', function () { pintarPessoas(); });
      $('#w-pessoas', j).addEventListener('click', function (e) {
        var p = e.target.closest('.pessoa'); if (!p) return;
        if (p.dataset.c) {
          est.pessoa = clientes.filter(function (c) { return c.id === p.dataset.c; })[0]; est.numero = '';
          est.idioma = est.pessoa.idioma || 'pt';
          $$('#w-idioma button', j).forEach(function (b) { b.classList.toggle('ativo', b.dataset.l === est.idioma); });
        } else { est.pessoa = null; est.numero = p.dataset.num; }
        pintarPessoas(); atualizar();
      });
      $('#w-idioma', j).addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        est.idioma = b.dataset.l;
        $$('#w-idioma button', j).forEach(function (x) { x.classList.toggle('ativo', x === b); });
        atualizar();
      });
      $$('[data-doc]', j).forEach(function (c) { c.addEventListener('change', function () { est.docs[+c.dataset.doc] = c.checked; atualizar(); }); });
      $('#w-abrir', j).addEventListener('click', function () { setTimeout(function () { fecharJanela(); aviso('Mensagem pronta no WhatsApp.'); }, 300); });
      pintarPessoas(); atualizar();
    });
}

/* ---------- Novo / editar imóvel ---------- */
function janelaImovel(im) {
  var novo = !im;
  im = im || { nome: '', parceiro: '', local: '', tipo: TIPOS[0], status: STATUS[0], texto: ['', ''], fatos: [], fotos: [], docs: [], mostrarEndereco: false, mostrarValor: false };
  function op(lista, v) { return lista.map(function (x) { return '<option' + (x === v ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join(''); }
  abrirJanela(
    '<span class="rotulo">' + (novo ? 'Novo imóvel' : 'Editar') + '</span><h2>' + (novo ? 'Vamos cadastrar' : esc(im.nome)) + '</h2>' +
    '<form id="f-im" class="grade-form" style="margin-top:20px">' +
      '<label class="campo inteiro"><span class="rotulo">Nome</span><input class="entrada" name="nome" required value="' + esc(im.nome) + '" placeholder="Ex.: Residencial Jardim"></label>' +
      '<label class="campo"><span class="rotulo">Construtora ou parceiro</span><input class="entrada" name="parceiro" value="' + esc(im.parceiro) + '"></label>' +
      '<label class="campo"><span class="rotulo">Bairro e cidade</span><input class="entrada" name="local" value="' + esc(im.local) + '" placeholder="Ex.: Jurerê · Florianópolis"></label>' +
      '<label class="campo"><span class="rotulo">Tipo</span><select class="entrada" name="tipo">' + op(TIPOS, im.tipo) + '</select></label>' +
      '<label class="campo"><span class="rotulo">Status</span><select class="entrada" name="status">' + op(STATUS, im.status) + '</select></label>' +
      '<label class="campo inteiro"><span class="rotulo">Descrição em português</span><textarea class="entrada" name="pt">' + esc(im.texto[0]) + '</textarea></label>' +
      '<label class="campo inteiro"><span class="rotulo">Descrição em inglês</span><textarea class="entrada" name="en">' + esc(im.texto[1]) + '</textarea></label>' +
      (novo ? '<label class="campo inteiro"><span class="rotulo">Foto de capa</span><input class="entrada" style="padding-top:15px" type="file" name="capa" accept="image/*"></label>' : '') +
      '<div class="fim inteiro">' + (novo ? '' : '<button class="btn btn-linha" type="button" id="remover">Remover</button>') +
        '<button class="btn btn-linha" type="button" data-fechar>Cancelar</button><button class="btn btn-verde" type="submit">Salvar</button></div>' +
    '</form>',
    function (j) {
      var f = $('#f-im', j);
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var d = new FormData(f);
        im.nome = d.get('nome').trim(); im.parceiro = d.get('parceiro').trim(); im.local = d.get('local').trim();
        im.tipo = d.get('tipo'); im.status = d.get('status'); im.texto = [d.get('pt').trim(), d.get('en').trim()];
        var capa = d.get('capa'), btn = $('button[type=submit]', f);
        btn.disabled = true; btn.textContent = 'Salvando...';
        Dados.salvarImovel(im).then(function (salvo) {
          return capa && capa.size ? Dados.adicionarFotos(salvo, [capa]) : salvo;
        }).then(function (salvo) {
          fecharJanela(); aviso(novo ? 'Imóvel cadastrado.' : 'Alterações salvas.');
          location.hash = '#/imovel/' + encodeURIComponent(salvo.id); render();
        }).catch(function () { btn.disabled = false; btn.textContent = 'Salvar'; aviso('Não consegui salvar. Tente de novo.'); });
      });
      var rm = $('#remover', j);
      if (rm) rm.addEventListener('click', function () {
        if (rm.dataset.ok) { Dados.removerImovel(im.id).then(function () { fecharJanela(); aviso('Imóvel removido.'); location.hash = '#/imoveis'; render(); }, function () { aviso('Não consegui remover.'); }); }
        else { rm.dataset.ok = 1; rm.textContent = 'Toque de novo para remover'; }
      });
    });
}

/* ============================================================
   EM BREVE
   ============================================================ */
function telaBreve(id) {
  var b = BREVE[id], m = MENU.filter(function (x) { return x.id === id; })[0];
  return '<div class="breve-tela entra"><div class="ilustra">' + I[m.ic] + '</div><span class="rotulo">Chega na etapa ' + m.etapa + '</span>' +
    '<h2>' + esc(b.titulo) + '</h2><p class="suave">' + esc(b.texto) + '</p><ul>' + b.itens.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
}

/* ============================================================
   ROTAS
   ============================================================ */
function render() {
  window.scrollTo(0, 0);
  if (!EU) { telaEntrar(); return; }
  var partes = (location.hash || '#/hoje').replace(/^#\//, '').split('/');
  var rota = partes[0] || 'hoje', arg = decodeURIComponent(partes[1] || '');
  var miolo, atual = rota;
  if (rota === 'hoje') miolo = telaHoje();
  else if (rota === 'imoveis') miolo = telaImoveis();
  else if (rota === 'imovel') { miolo = telaImovel(arg); atual = 'imoveis'; }
  else if (BREVE[rota]) miolo = telaBreve(rota);
  else { miolo = telaHoje(); atual = 'hoje'; }
  $('#app').innerHTML = casca(atual, miolo);
  ligar(rota, arg);
}

function ligar(rota, arg) {
  $$('[data-sair]').forEach(function (b) { b.addEventListener('click', sair); });
  $$('[data-novo-imovel]').forEach(function (b) { b.addEventListener('click', function () { janelaImovel(null); }); });
  if (rota === 'imoveis') {
    preencherGrade();
    $('#busca').addEventListener('input', function (e) { filtro.busca = e.target.value; preencherGrade(); });
    $$('[data-status]').forEach(function (b) {
      b.addEventListener('click', function () {
        filtro.status = b.dataset.status;
        $$('[data-status]').forEach(function (x) { x.classList.toggle('ativo', x === b); });
        preencherGrade();
      });
    });
    $('#grade').addEventListener('click', function (e) { if (e.target.closest('[data-novo-imovel]')) janelaImovel(null); });
  }
  if (rota === 'imovel') {
    var im = Dados.imovel(arg); if (!im) return;
    $('[data-enviar]').addEventListener('click', function () { janelaEnviar(im); });
    $('[data-editar]').addEventListener('click', function () { janelaImovel(JSON.parse(JSON.stringify(im))); });
    $('[data-copiar]').addEventListener('click', function () {
      var l = linkApresentacao(im);
      (navigator.clipboard ? navigator.clipboard.writeText(l) : Promise.reject()).then(function () { aviso('Link copiado.'); }, function () { prompt('Copie o link:', l); });
    });
    $$('[data-idioma]').forEach(function (b) { b.addEventListener('click', function () { idiomaFicha = +b.dataset.idioma; render(); }); });
    $$('[data-priv]').forEach(function (c) { c.addEventListener('change', function () { im[c.dataset.priv] = c.checked; Dados.salvarImovel(im).then(function () { aviso('Preferência salva.'); }, function () { aviso('Não consegui salvar.'); }); }); });
    function addFotos(files) {
      var l = Array.prototype.slice.call(files).filter(function (f) { return /^image\//.test(f.type); });
      if (!l.length) return;
      aviso('Enviando ' + l.length + (l.length > 1 ? ' fotos...' : ' foto...'));
      Dados.adicionarFotos(im, l).then(function () { render(); aviso(l.length + (l.length > 1 ? ' fotos adicionadas.' : ' foto adicionada.')); }, function () { aviso('Algumas fotos não subiram. Tente de novo.'); });
    }
    $('#mais-fotos').addEventListener('change', function (e) { addFotos(e.target.files); });
    var z = $('#soltar-fotos');
    ['dragenter', 'dragover'].forEach(function (ev) { z.addEventListener(ev, function (e) { e.preventDefault(); z.classList.add('sobre'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { z.addEventListener(ev, function () { z.classList.remove('sobre'); }); });
    z.addEventListener('drop', function (e) { e.preventDefault(); addFotos(e.dataTransfer.files); });
    $('#mais-docs').addEventListener('change', function (e) {
      var l = Array.prototype.slice.call(e.target.files);
      if (!l.length) return;
      aviso('Enviando ' + l.length + (l.length > 1 ? ' documentos...' : ' documento...'));
      Dados.adicionarDocs(im, l).then(function () { render(); aviso('Documentos adicionados.'); }, function () { aviso('Algum documento não subiu. Tente de novo.'); });
    });
    $$('[data-baixar]').forEach(function (b) {
      b.addEventListener('click', function () {
        var d = im.docs[+b.dataset.baixar];
        if (!d || !d.caminho) { aviso('Este documento é só um exemplo.'); return; }
        var w = window.open('', '_blank');
        Dados.linkArquivo(d.caminho).then(function (u) { if (u && w) w.location = u; else if (w) w.close(); });
      });
    });
  }
}

window.addEventListener('hashchange', render);
$('#app').innerHTML = '<div class="login"><img src="assets/logo.png" alt="Casa Oliveira" style="width:200px;opacity:.6"></div>';
Dados.iniciar().catch(function () {}).then(function () { EU = Dados.eu(); render(); });
})();
