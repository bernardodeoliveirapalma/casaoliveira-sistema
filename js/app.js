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
function telBonito(n) {
  var d = soNumeros(n); if (!d) return '';
  var m = d.match(/^55(\d{2})(\d{4,5})(\d{4})$/);
  return m ? '+55 ' + m[1] + ' ' + m[2] + '-' + m[3] : '+' + d;
}

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
  filtro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
  fechar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  sino: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15Z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.2.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.2Z"/></svg>',
  folha: '<svg viewBox="0 0 32 32" fill="none"><path d="M6 26C6 14 14 6 27 5c0 13-8 21-21 21Z" fill="#9DB08A"/><path d="M6 26 19 13" stroke="#F2F0EB" stroke-width="1.4" stroke-linecap="round"/></svg>',
  ramo: '<svg class="ramo" viewBox="0 0 200 200" fill="none" stroke="#F2F0EB" stroke-width="2" stroke-linecap="round"><path d="M20 190C70 140 110 90 190 20"/><path d="M60 150c-20-8-34-24-38-44 20 4 34 20 38 44Z" fill="#F2F0EB"/><path d="M60 150c8-20 24-32 44-34-6 20-22 32-44 34Z" fill="#F2F0EB"/><path d="M105 102c-20-8-34-24-38-44 20 4 34 20 38 44Z" fill="#F2F0EB"/><path d="M105 102c8-20 24-32 44-34-6 20-22 32-44 34Z" fill="#F2F0EB"/><path d="M148 58c-16-8-26-20-30-36 16 4 26 16 30 36Z" fill="#F2F0EB"/><path d="M148 58c8-16 20-26 36-28-6 16-18 26-36 28Z" fill="#F2F0EB"/></svg>'
};

/* ---------- menu ---------- */
var MENU = [
  { id: 'hoje', nome: 'Hoje', ic: 'hoje' },
  { id: 'imoveis', nome: 'Imóveis', ic: 'casa' },
  { id: 'clientes', nome: 'Clientes', ic: 'pessoas' },
  { id: 'parceiros', nome: 'Parceiros', ic: 'parceiro' },
  { id: 'comunicados', nome: 'Comunicados', ic: 'megafone' },
  { id: 'email', nome: 'E-mail', ic: 'carta' }
];

var BREVE = {};

/* ---------- sessão ---------- */
var EU = null;
function sair() { if (EU && EU.papel === 'parceiro') modoLogin = 'parceiro'; Dados.sair().then(function () { EU = null; location.hash = ''; render(); }); }
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
var modoLogin = 'equipe';
function telaEntrar() {
  if (modoLogin === 'parceiro') { telaEntrarParceiro(); return; }
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
      '<button type="button" class="link-suave" id="sou-parceiro" style="margin-top:18px">Sou corretor parceiro</button>' +
    '</div></div>';
  $('#sou-parceiro').addEventListener('click', function () { modoLogin = 'parceiro'; telaEntrar(); });

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
      aviso(err && err.message === 'sem-acesso' ? 'Esse e-mail não tem acesso ao painel.' : err && err.message === 'expirado' ? 'O seu acesso terminou. Fale com a Casa Oliveira.' : 'Não consegui entrar. (' + ((err && (err.detalhe || err.message)) || 'erro desconhecido') + ')');
    });
  });
  var esq = $('#esqueci');
  if (esq) esq.addEventListener('click', function () {
    var email = $('#email').value.trim();
    if (!email) { aviso('Escreva seu e-mail primeiro.'); return; }
    Dados.recuperarSenha(email).then(function () { aviso('Mandamos um link para ' + email + '.'); }, function () { aviso('Não deu certo agora. Tente de novo.'); });
  });
}

function telaEntrarParceiro() {
  $('#app').innerHTML =
    '<div class="login"><div class="login-caixa entra">' +
      '<img class="logo" src="assets/logo.png" alt="Casa Oliveira">' +
      '<div><span class="rotulo">Portal de parceiros</span><h1>Olá, corretor</h1><p class="suave">Entre com o e-mail e a senha que você criou pelo convite.</p></div>' +
      '<form id="f-entrar">' +
        '<label class="campo"><span class="rotulo">E-mail</span><input class="entrada" id="email" type="email" autocomplete="username" placeholder="seu@email.com" value="' + esc(lembrar('parceiro')) + '"></label>' +
        '<label class="campo"><span class="rotulo">Senha</span><input class="entrada" id="senha" type="password" autocomplete="current-password" placeholder="Sua senha"></label>' +
        '<button class="btn btn-verde btn-bloco" type="submit" id="b-entrar">Entrar</button>' +
      '</form>' +
      (Dados.demo ? '<div class="aviso-demo">Modo demonstração: entra como a parceira de exemplo.</div>' : '<button type="button" class="btn btn-linha btn-pequeno" style="margin-top:14px" id="esqueci">Esqueci minha senha</button>') +
      '<button type="button" class="link-suave" id="sou-equipe" style="margin-top:18px">Sou da equipe Casa Oliveira</button>' +
    '</div></div>';
  $('#sou-equipe').addEventListener('click', function () { modoLogin = 'equipe'; telaEntrar(); });
  $('#f-entrar').addEventListener('submit', function (e) {
    e.preventDefault();
    var email = $('#email').value.trim().toLowerCase(), senha = $('#senha').value;
    if (!email || !senha) { aviso('Preencha e-mail e senha.'); return; }
    var b = $('#b-entrar'); b.disabled = true; b.textContent = 'Entrando...';
    Dados.entrar(email, senha, null, 'parceiro').then(function (p) {
      EU = p; lembrar('parceiro', email); location.hash = '#/hoje'; render();
    }).catch(function (err) {
      b.disabled = false; b.textContent = 'Entrar';
      aviso(err && err.message === 'expirado' ? 'O seu acesso terminou. Fale com a Casa Oliveira.' : err && err.message === 'sem-acesso' ? 'Esse e-mail ainda não tem acesso. Use o link do convite.' : 'E-mail ou senha não conferem.');
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
  var menu = ehParceiro() ? [{ id: 'hoje', nome: 'Empreendimentos', ic: 'casa' }] : MENU;
  var lat = menu.map(function (m) {
    return '<a href="#/' + m.id + '" class="' + (m.id === atual ? 'ativo' : '') + '">' + I[m.ic] + '<span>' + m.nome + '</span>' +
      (m.etapa ? '<span class="breve">Em breve</span>' : '') + '</a>';
  }).join('');
  var baixo = (ehParceiro() ? [] : menu).filter(function (m) { return m.id !== 'email'; }).map(function (m) {
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
    (baixo ? '<nav class="barra-baixo">' + baixo + '</nav>' : '') +
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
  var cls = Dados.clientes(), h = hojeISO(), semana = maisDias(-7);
  var retornos = cls.filter(function (c) { return c.lembrarEm && c.lembrarEm <= h; }).sort(function (a, b) { return a.lembrarEm < b.lembrarEm ? -1 : 1; });
  var novos = cls.filter(function (c) { return c.etapa === 'Novo' && c.criadoEm && c.criadoEm.slice(0, 10) >= semana && !(c.respostas && c.respostas['Importado de']); });
  var anivs = cls.filter(function (c) { var n = anivEmDias(c.aniversario); return n !== null && n <= 7; })
    .sort(function (a, b) { return anivEmDias(a.aniversario) - anivEmDias(b.aniversario); });
  var anivHoje = anivs.filter(function (c) { return anivEmDias(c.aniversario) === 0; });
  function linhaHoje(c, extra) {
    return '<a class="linha-cli" href="#/cliente/' + encodeURIComponent(c.id) + '"><span class="avatar' + (c.idioma === 'en' ? ' ane' : '') + '">' + esc((primeiroNome(c.nome) || '?')[0]) + '</span>' +
      '<div class="cli-nome"><div>' + esc(c.nome) + '</div><small>' + esc(extra) + '</small></div><span class="selo" style="background:' + (COR_ETAPA[c.etapa] || 'var(--creme)') + '">' + esc(c.etapa) + '</span></a>';
  }
  var resumo = retornos.length || novos.length ?
    'Hoje tem ' + [retornos.length ? retornos.length + (retornos.length > 1 ? ' retornos combinados' : ' retorno combinado') : '', novos.length ? novos.length + (novos.length > 1 ? ' leads novos na semana' : ' lead novo na semana') : ''].filter(Boolean).join(' e ') + '.' :
    'Nenhum retorno para hoje. Bom dia para cadastrar imóveis ou chamar alguém da base.';
  if (anivHoje.length) resumo += ' ' + (anivHoje.length > 1 ? anivHoje.length + ' pessoas fazem aniversário hoje.' : primeiroNome(anivHoje[0].nome) + ' faz aniversário hoje.');
  return '<div class="entra">' +
    '<section class="ola"><span class="rotulo">' + esc(data) + '</span><h1>' + saudacao() + ', ' + esc(EU.nome) + '</h1>' +
      '<p>' + esc(resumo) + '</p>' + I.ramo + '</section>' +
    '<div class="blocos">' +
      '<div class="bloco c1"><span class="rotulo">Imóveis</span><div class="numero">' + ims.length + '</div><span class="suave">cadastrados no painel</span></div>' +
      '<div class="bloco c2"><span class="rotulo">Clientes</span><div class="numero">' + cls.length + '</div><span class="suave">pessoas na base</span></div>' +
      '<div class="bloco c3"><span class="rotulo">Material</span><div class="numero">' + (fotos + docs) + '</div><span class="suave">' + fotos + ' fotos e ' + docs + ' documentos</span></div>' +
    '</div>' +
    (retornos.length ? '<span class="rotulo" style="display:block;margin-bottom:12px">Para retornar</span><div class="lista-cli" style="margin-bottom:28px">' +
      retornos.slice(0, 8).map(function (c) { return linhaHoje(c, retornoTexto(c)); }).join('') + '</div>' : '') +
    (anivs.length ? '<span class="rotulo" style="display:block;margin-bottom:12px">Aniversários desta semana</span><div class="lista-cli" style="margin-bottom:28px">' +
      anivs.slice(0, 10).map(function (c) {
        var n = anivEmDias(c.aniversario);
        return '<div class="linha-cli linha-aniv"><a class="aniv-quem" href="#/cliente/' + encodeURIComponent(c.id) + '"><span class="avatar' + (c.idioma === 'en' ? ' ane' : '') + '">' + esc((primeiroNome(c.nome) || '?')[0]) + '</span>' +
          '<div class="cli-nome"><div>' + esc(c.nome) + '</div><small>' + esc(anivTexto(c.aniversario)) + ' · ' + (n === 0 ? 'hoje' : n === 1 ? 'amanhã' : 'em ' + n + ' dias') + '</small></div></a>' +
          (n === 0 && c.whatsapp ? '<a class="btn btn-wa btn-mini" target="_blank" rel="noopener" href="' + esc(linkWa(c, msgParabens(c))) + '">' + I.wa + 'Dar parabéns</a>' : '') + '</div>';
      }).join('') + '</div>' : '') +
    (novos.length ? '<span class="rotulo" style="display:block;margin-bottom:12px">Chegaram esta semana</span><div class="lista-cli" style="margin-bottom:28px">' +
      novos.slice(0, 6).map(function (c) { return linhaHoje(c, (c.origem || 'Sem origem') + ' · ' + quando(c.criadoEm)); }).join('') + '</div>' : '') +
    '<span class="rotulo" style="display:block;margin-bottom:12px">O que vamos fazer agora</span>' +
    '<div class="atalhos">' +
      '<a class="atalho" data-novo-imovel><span class="ic">' + I.mais + '</span><span>Novo imóvel</span><small>Fotos, documentos e ficha</small></a>' +
      '<a class="atalho" href="#/imoveis"><span class="ic" style="background:#E7F0E1;color:#2F6B43">' + I.wa + '</span><span>Enviar material</span><small>Escolha o imóvel e o cliente</small></a>' +
      '<a class="atalho" href="#/clientes"><span class="ic" style="background:var(--t-areia);color:#6A4A12">' + I.pessoas + '</span><span>Clientes</span><small>Base, etapas e etiquetas</small></a>' +
      '<a class="atalho" href="#/comunicados"><span class="ic" style="background:var(--t-terra);color:var(--marrom)">' + I.megafone + '</span><span>Comunicados</span><small>Mensagem para um grupo inteiro</small></a>' +
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

function janelaEnviar(im, pessoaInicial) {
  var clientes = Dados.clientes();
  var est = { pessoa: pessoaInicial || null, numero: '', idioma: (pessoaInicial && pessoaInicial.idioma) || 'pt', docs: im.docs.map(function () { return true; }) };
  abrirJanela(
    '<span class="rotulo">Enviar pelo WhatsApp</span><h2>' + esc(im.nome) + '</h2>' +
    '<div class="passo"><span class="rotulo">1. Para quem</span>' +
      '<input class="entrada" id="w-busca" placeholder="Nome do cliente ou número com DDD">' +
      '<div class="pessoas" id="w-pessoas"></div></div>' +
    '<div class="passo"><span class="rotulo">2. Idioma</span><div class="idiomas" id="w-idioma"><button type="button" data-l="pt"' + (est.idioma === 'pt' ? ' class="ativo"' : '') + '>Português</button><button type="button" data-l="en"' + (est.idioma === 'en' ? ' class="ativo"' : '') + '>English</button></div></div>' +
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
        var l = clientes.filter(function (c) { return !q || c.nome.toLowerCase().indexOf(q) >= 0 || (nums && (c.whatsapp || '').indexOf(nums) >= 0); });
        if (est.pessoa) l = [est.pessoa].concat(l.filter(function (c) { return c.id !== est.pessoa.id; }));
        l = l.slice(0, 30);
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
   CLIENTES E LEADS
   ============================================================ */
var filtroCli = { busca: '', etiqueta: '', vista: 'quadro', limite: 100 };
var POR_COLUNA = 30;
try { filtroCli.vista = localStorage.getItem('co_vista') || 'quadro'; } catch (e) {}
var COR_ETAPA = { 'Novo': 'var(--t-verde)', 'Em conversa': 'var(--t-areia)', 'Visita': 'var(--t-ceu)', 'Proposta': 'var(--t-terra)', 'Cliente': '#D6E3C9', 'Pausado': '#E9E4DC' };

function hojeISO() { var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }
function maisDias(n) { var d = new Date(); d.setDate(d.getDate() + n); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }
function dataCurta(iso) { if (!iso) return ''; var d = new Date(iso.length === 10 ? iso + 'T12:00:00' : iso); return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }); }
function quando(iso) {
  if (!iso) return '';
  var dias = Math.round((new Date(hojeISO() + 'T12:00:00') - new Date(iso.slice(0, 10) + 'T12:00:00')) / 864e5);
  return dias <= 0 ? 'hoje' : dias === 1 ? 'ontem' : 'há ' + dias + ' dias';
}
function retornoTexto(c) {
  if (!c.lembrarEm) return '';
  var h = hojeISO();
  return c.lembrarEm < h ? 'Retorno atrasado' : c.lembrarEm === h ? 'Retorno hoje' : 'Retorno ' + dataCurta(c.lembrarEm);
}
function todasEtiquetas() {
  var m = {};
  Dados.clientes().forEach(function (c) { (c.etiquetas || []).forEach(function (t) { m[t] = 1; }); });
  return Object.keys(m).sort();
}
function msgOla(c) {
  var n = primeiroNome(c.nome);
  return c.idioma === 'en' ? 'Hello' + (n ? ', ' + n : '') + '. This is Casa Oliveira.' : 'Olá' + (n ? ', ' + n : '') + '. Aqui é a família Casa Oliveira.';
}
function linkWa(c, texto) {
  var num = soNumeros(c.whatsapp); if (num && num.length <= 11) num = '55' + num;
  return 'https://wa.me/' + num + '?text=' + encodeURIComponent(texto || msgOla(c));
}
/* ---------- aniversários (guardados como MM-DD, sem o ano) ---------- */
var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function anivTexto(a) { if (!a) return ''; var p = a.split('-'); return (+p[1]) + ' de ' + MESES[+p[0] - 1]; }
function anivEmDias(a) {
  // quantos dias faltam (0 = hoje)
  if (!a) return null;
  var p = a.split('-'), h = new Date(); h.setHours(0, 0, 0, 0);
  var d = new Date(h.getFullYear(), +p[0] - 1, +p[1]);
  if (+p[0] === 2 && +p[1] === 29 && d.getMonth() !== 1) d = new Date(h.getFullYear(), 1, 28);
  if (d < h) d.setFullYear(h.getFullYear() + 1);
  return Math.round((d - h) / 86400000);
}
function msgParabens(c) {
  var n = primeiroNome(c.nome);
  return c.idioma === 'en'
    ? 'Hello' + (n ? ', ' + n : '') + '. Today is your birthday and we could not let it pass. We wish you a beautiful new year of life. Ane & Bernardo, Casa Oliveira.'
    : 'Olá' + (n ? ', ' + n : '') + '. Hoje é o seu aniversário e não podíamos deixar passar. Desejamos um novo ano muito bonito para você. Ane & Bernardo, Casa Oliveira.';
}
function seletorAniv(a) {
  var p = a ? a.split('-') : ['', ''], dias = '<option value="">Dia</option>', meses = '<option value="">Mês</option>';
  for (var i = 1; i <= 31; i++) dias += '<option value="' + i + '"' + (+p[1] === i ? ' selected' : '') + '>' + i + '</option>';
  MESES.forEach(function (m, i) { meses += '<option value="' + (i + 1) + '"' + (+p[0] === i + 1 ? ' selected' : '') + '>' + m + '</option>'; });
  return '<div class="grade-2 aniv-sel"><select class="entrada" name="anivDia" aria-label="Dia">' + dias + '</select><select class="entrada" name="anivMes" aria-label="Mês">' + meses + '</select></div>';
}
function lerAniv(dia, mes) {
  dia = +dia; mes = +mes; if (!dia || !mes) return '';
  var max = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mes - 1];
  if (dia > max) return null;
  return ('0' + mes).slice(-2) + '-' + ('0' + dia).slice(-2);
}
function clientesFiltrados() {
  var b = filtroCli.busca.toLowerCase(), nb = soNumeros(b);
  return Dados.clientes().filter(function (c) {
    if (filtroCli.etiqueta && (c.etiquetas || []).indexOf(filtroCli.etiqueta) < 0) return false;
    if (!b) return true;
    return [c.nome, c.email, c.origem].concat(c.etiquetas || []).join(' ').toLowerCase().indexOf(b) >= 0 || (nb && soNumeros(c.whatsapp).indexOf(nb) >= 0);
  });
}
function cartaoCliente(c) {
  var r = retornoTexto(c), atraso = c.lembrarEm && c.lembrarEm <= hojeISO();
  return '<a class="cli" draggable="true" data-cli="' + esc(c.id) + '" href="#/cliente/' + encodeURIComponent(c.id) + '">' +
    '<div class="cli-topo"><span class="avatar' + (c.idioma === 'en' ? ' ane' : '') + '">' + esc((primeiroNome(c.nome) || '?')[0]) + '</span>' +
      '<div class="cli-nome"><div>' + esc(c.nome) + '</div><small>' + esc(c.origem || 'Sem origem') + ' · ' + quando(c.criadoEm) + '</small></div></div>' +
    ((c.etiquetas || []).length ? '<div class="tags">' + c.etiquetas.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>' : '') +
    (r ? '<div class="lembrete' + (atraso ? ' urgente' : '') + '">' + I.sino + esc(r) + '</div>' : '') +
  '</a>';
}
var GRUPOS_TAG = [
  { nome: 'De onde veio', tags: ['Encontros Motor', 'Club M', 'Instagram', 'Indicação'] },
  { nome: 'Eventos', teste: function (t) { return /20\d\d/.test(t); } },
  { nome: 'Relação com a casa', tags: ['Já nos conhece', 'Mapeado', 'Círculo próximo', 'Contato compartilhado'] }
];
function gruposDeTags(tags) {
  var usados = {}, out = [];
  GRUPOS_TAG.forEach(function (g) {
    var l = tags.filter(function (t) { return !usados[t] && (g.tags ? g.tags.indexOf(t) >= 0 : g.teste(t)); });
    l.forEach(function (t) { usados[t] = 1; });
    if (l.length) out.push({ nome: g.nome, tags: l });
  });
  var resto = tags.filter(function (t) { return !usados[t]; });
  if (resto.length) out.push({ nome: 'Interesse e outras', tags: resto });
  return out;
}
function contaTag(t) { return Dados.clientes().filter(function (c) { return (c.etiquetas || []).indexOf(t) >= 0; }).length; }
function telaClientes() {
  var tags = todasEtiquetas(), f = filtroCli.etiqueta;
  return '<div class="entra">' +
    '<div class="topo"><div><span class="rotulo">Base da Casa Oliveira</span><h1>Clientes e leads</h1></div>' +
      '<div class="topo-acoes"><button class="btn btn-linha" type="button" data-sequencia>' + I.wa + 'Mandar para vários</button><button class="btn btn-verde" type="button" data-novo-cliente>' + I.mais + 'Novo cliente</button></div></div>' +
    '<div class="filtros"><label class="busca">' + I.lupa + '<input class="entrada" id="busca-cli" placeholder="Buscar por nome, telefone ou etiqueta" value="' + esc(filtroCli.busca) + '"></label>' +
      '<div class="idiomas" id="vista"><button type="button" data-v="quadro" class="' + (filtroCli.vista === 'quadro' ? 'ativo' : '') + '">Quadro</button><button type="button" data-v="lista" class="' + (filtroCli.vista === 'lista' ? 'ativo' : '') + '">Lista</button></div>' +
      (tags.length ? '<button type="button" class="chip btn-filtro' + (filtroCli.aberto ? ' aberto' : '') + (f ? ' com' : '') + '" id="abre-filtros">' + I.filtro + 'Filtrar' + (f ? '<span class="bolinha">1</span>' : '') + '</button>' : '') +
    '</div>' +
    (f && !filtroCli.aberto ? '<div class="filtro-ativo"><span class="suave">Mostrando só</span><button type="button" class="tag tira" data-tag="">' + esc(f) + ' ' + I.fechar + '</button></div>' : '') +
    (tags.length && filtroCli.aberto ? '<div class="painel-filtros">' +
      '<div class="pf-topo"><span class="rotulo">Filtrar por etiqueta</span>' + (f ? '<button type="button" class="link-suave" data-tag="">Limpar filtro</button>' : '') + '</div>' +
      gruposDeTags(tags).map(function (g) {
        return '<div class="pf-grupo"><small>' + esc(g.nome) + '</small><div class="tags">' + g.tags.map(function (t) {
          return '<button type="button" class="chip' + (f === t ? ' ativo' : '') + '" data-tag="' + esc(t) + '">' + esc(t) + ' <span class="n">' + contaTag(t) + '</span></button>';
        }).join('') + '</div></div>';
      }).join('') + '</div>' : '') +
    '<div id="area-cli"></div></div>';
}
function preencherClientes() {
  var area = $('#area-cli'); if (!area) return;
  var l = clientesFiltrados();
  if (!Dados.clientes().length) {
    area.innerHTML = '<div class="breve-tela"><div class="ilustra">' + I.pessoas + '</div><h2>Ainda não há ninguém aqui</h2>' +
      '<p class="suave">Quando alguém responder o quiz da LP, aparece aqui sozinho. Você também pode cadastrar à mão.</p>' +
      '<button class="btn btn-verde" style="margin-top:20px" type="button" data-novo-cliente>' + I.mais + 'Cadastrar o primeiro</button></div>';
    return;
  }
  if (filtroCli.vista === 'lista') {
    var total = l.length; l = l.slice(0, filtroCli.limite);
    area.innerHTML = '<p class="suave conta-lista">' + total + (total === 1 ? ' pessoa' : ' pessoas') + '</p><div class="lista-cli">' + (l.length ? l.map(function (c) {
      return '<a class="linha-cli" href="#/cliente/' + encodeURIComponent(c.id) + '"><span class="avatar' + (c.idioma === 'en' ? ' ane' : '') + '">' + esc((primeiroNome(c.nome) || '?')[0]) + '</span>' +
        '<div class="cli-nome"><div>' + esc(c.nome) + '</div><small>' + esc(c.origem || 'Sem origem') + ' · ' + quando(c.criadoEm) + '</small></div>' +
        '<span class="selo" style="background:' + (COR_ETAPA[c.etapa] || 'var(--creme)') + '">' + esc(c.etapa) + '</span>' +
        '<span class="suave so-pc" style="font-size:13px;min-width:120px;text-align:right">' + esc(retornoTexto(c)) + '</span></a>';
    }).join('') : '<p class="suave" style="padding:20px">Ninguém com esse filtro.</p>') + '</div>' +
      (total > l.length ? '<div style="text-align:center;margin-top:18px"><button class="btn btn-linha" type="button" id="mais-lista">Mostrar mais ' + Math.min(100, total - l.length) + '</button></div>' : '');
    var ml = $('#mais-lista'); if (ml) ml.addEventListener('click', function () { filtroCli.limite += 100; preencherClientes(); });
    return;
  }
  area.innerHTML = '<div class="quadro">' + ETAPAS.map(function (e) {
    var da = l.filter(function (c) { return c.etapa === e; });
    var resto = da.length - POR_COLUNA;
    return '<section class="coluna" data-etapa="' + esc(e) + '"><header style="background:' + COR_ETAPA[e] + '"><span>' + esc(e) + '</span><span class="conta-n">' + da.length + '</span></header>' +
      '<div class="cartoes">' + da.slice(0, POR_COLUNA).map(cartaoCliente).join('') +
      (resto > 0 ? '<p class="suave mais-cli">E mais ' + resto + '. Use a busca ou as etiquetas para achar alguém.</p>' : '') + '</div></section>';
  }).join('') + '</div>';
  ligarQuadro();
}
function ligarQuadro() {
  var arrastando = null;
  $$('.cli[draggable]').forEach(function (el) {
    el.addEventListener('dragstart', function (e) { arrastando = el.dataset.cli; el.classList.add('arrastando'); e.dataTransfer.effectAllowed = 'move'; });
    el.addEventListener('dragend', function () { el.classList.remove('arrastando'); });
  });
  $$('.coluna').forEach(function (col) {
    col.addEventListener('dragover', function (e) { e.preventDefault(); col.classList.add('alvo'); });
    col.addEventListener('dragleave', function () { col.classList.remove('alvo'); });
    col.addEventListener('drop', function (e) {
      e.preventDefault(); col.classList.remove('alvo');
      var c = arrastando && Dados.cliente(arrastando); if (!c || c.etapa === col.dataset.etapa) return;
      var copia = JSON.parse(JSON.stringify(c)); copia.etapa = col.dataset.etapa;
      Dados.salvarCliente(copia).then(function () { preencherClientes(); aviso(primeiroNome(c.nome) + ' foi para ' + copia.etapa + '.'); }, function () { aviso('Não consegui mover.'); });
    });
  });
}

function telaCliente(id) {
  var c = Dados.cliente(id);
  if (!c) return '<a class="voltar" href="#/clientes">' + I.voltar + 'Clientes</a><div class="breve-tela"><h2>Cliente não encontrado</h2></div>';
  var resp = c.respostas && typeof c.respostas === 'object' ? Object.keys(c.respostas) : [];
  return '<div class="entra">' +
    '<a class="voltar" href="#/clientes">' + I.voltar + 'Todos os clientes</a>' +
    '<section class="ficha-cli">' +
      '<span class="avatar grande' + (c.idioma === 'en' ? ' ane' : '') + '">' + esc((primeiroNome(c.nome) || '?')[0]) + '</span>' +
      '<div style="flex:1;min-width:0"><span class="rotulo">' + esc(c.origem || 'Sem origem') + ' · desde ' + esc(dataCurta(c.criadoEm)) + '</span><h1>' + esc(c.nome) + '</h1>' +
        '<div class="etapas" id="etapas">' + ETAPAS.map(function (e) {
          return '<button type="button" class="chip' + (e === c.etapa ? ' ativo' : '') + '" data-etapa="' + esc(e) + '">' + esc(e) + '</button>';
        }).join('') + '</div></div>' +
    '</section>' +
    '<div class="acoes-imovel">' +
      (c.whatsapp ? '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + esc(linkWa(c)) + '">' + I.wa + 'Conversar no WhatsApp</a>' : '') +
      '<button class="btn btn-linha" type="button" data-material>' + I.casa + 'Enviar material</button>' +
      '<button class="btn btn-linha btn-redondo" type="button" data-editar-cli aria-label="Editar">' + I.editar + '</button>' +
    '</div>' +
    '<div class="duas"><div>' +
      '<section class="painel"><span class="rotulo">Anotações</span>' +
        '<form id="f-nota" class="nota-nova"><textarea class="entrada" id="nota" placeholder="O que conversamos, o que a pessoa procura, próximos passos"></textarea>' +
        '<button class="btn btn-verde" type="submit">Anotar</button></form>' +
        '<div id="notas" class="notas"><p class="suave">Carregando...</p></div>' +
      '</section>' +
    '</div><div>' +
      '<section class="painel"><span class="rotulo">Lembrete de retorno</span>' +
        '<p style="margin-bottom:12px">' + (c.lembrarEm ? esc(retornoTexto(c)) : 'Nenhum retorno marcado.') + '</p>' +
        '<div class="filtros" style="margin:0">' +
          '<button type="button" class="chip" data-lembrar="1">Amanhã</button><button type="button" class="chip" data-lembrar="3">Em 3 dias</button>' +
          '<button type="button" class="chip" data-lembrar="7">Em 1 semana</button>' + (c.lembrarEm ? '<button type="button" class="chip" data-lembrar="0">Limpar</button>' : '') +
        '</div></section>' +
      '<section class="painel"><span class="rotulo">Contato</span><div class="dados-cli">' +
        '<div><small>WhatsApp</small>' + esc(telBonito(c.whatsapp) || 'Sem número') + '</div>' +
        '<div><small>E-mail</small>' + esc(c.email || 'Sem e-mail') + '</div>' +
        '<div><small>Idioma</small>' + (c.idioma === 'en' ? 'Inglês' : 'Português') + '</div>' +
        '<div><small>Aniversário</small>' + (c.aniversario ? esc(anivTexto(c.aniversario)) + (anivEmDias(c.aniversario) === 0 ? ' · é hoje' : '') : 'Não sabemos ainda') + '</div>' +
        '<div><small>Aceita receber</small>' + ([c.aceitaWhatsapp ? 'WhatsApp' : '', c.aceitaEmail ? 'E-mail' : ''].filter(Boolean).join(' e ') || 'Ainda não') + '</div>' +
      '</div></section>' +
      '<section class="painel"><span class="rotulo">Etiquetas</span><div class="tags" id="tags">' +
        (c.etiquetas || []).map(function (t) { return '<button type="button" class="tag tira" data-tira="' + esc(t) + '" title="Tirar">' + esc(t) + ' ×</button>'; }).join('') +
        '</div><form id="f-tag" class="nota-nova" style="margin-top:12px"><input class="entrada" id="tag" list="lista-tags" placeholder="Nova etiqueta, ex.: Serra"><datalist id="lista-tags">' +
        todasEtiquetas().map(function (t) { return '<option value="' + esc(t) + '">'; }).join('') + '</datalist><button class="btn btn-linha" type="submit">Pôr</button></form></section>' +
      (resp.length ? '<section class="painel"><span class="rotulo">Informações</span><div class="dados-cli">' +
        resp.map(function (k) { return '<div><small>' + esc(k) + '</small>' + esc(c.respostas[k]) + '</div>'; }).join('') + '</div></section>' : '') +
    '</div></div></div>';
}

function janelaCliente(c) {
  var novo = !c;
  c = c || { nome: '', whatsapp: '', email: '', idioma: 'pt', etapa: 'Novo', origem: 'WhatsApp', etiquetas: [], aceitaWhatsapp: true, aceitaEmail: false, lembrarEm: null };
  function op(lista, v) { return lista.map(function (x) { return '<option' + (x === v ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join(''); }
  abrirJanela(
    '<span class="rotulo">' + (novo ? 'Novo cliente' : 'Editar') + '</span><h2>' + (novo ? 'Quem chegou?' : esc(c.nome)) + '</h2>' +
    '<form id="f-cli" class="grade-form" style="margin-top:20px">' +
      '<label class="campo inteiro"><span class="rotulo">Nome</span><input class="entrada" name="nome" required value="' + esc(c.nome) + '"></label>' +
      '<label class="campo"><span class="rotulo">WhatsApp com DDD</span><input class="entrada" name="whatsapp" inputmode="tel" value="' + esc(c.whatsapp) + '" placeholder="48 99999 9999"></label>' +
      '<label class="campo"><span class="rotulo">E-mail</span><input class="entrada" name="email" type="email" value="' + esc(c.email) + '"></label>' +
      '<label class="campo"><span class="rotulo">De onde veio</span><select class="entrada" name="origem">' + op(ORIGENS, c.origem) + '</select></label>' +
      '<label class="campo"><span class="rotulo">Etapa</span><select class="entrada" name="etapa">' + op(ETAPAS, c.etapa) + '</select></label>' +
      '<label class="campo"><span class="rotulo">Idioma</span><select class="entrada" name="idioma"><option value="pt"' + (c.idioma !== 'en' ? ' selected' : '') + '>Português</option><option value="en"' + (c.idioma === 'en' ? ' selected' : '') + '>Inglês</option></select></label>' +
      '<label class="campo"><span class="rotulo">Etiquetas</span><input class="entrada" name="etiquetas" value="' + esc((c.etiquetas || []).join(', ')) + '" placeholder="Serra, Investidor"></label>' +
      '<div class="campo"><span class="rotulo">Aniversário (dia e mês)</span>' + seletorAniv(c.aniversario) + '</div>' +
      '<div class="campo inteiro privacidade">' +
        '<label class="alavanca"><input type="checkbox" name="aceitaWhatsapp"' + (c.aceitaWhatsapp ? ' checked' : '') + '><span class="trilho"></span>Aceita receber comunicados por WhatsApp</label>' +
        '<label class="alavanca"><input type="checkbox" name="aceitaEmail"' + (c.aceitaEmail ? ' checked' : '') + '><span class="trilho"></span>Aceita receber e-mails</label>' +
      '</div>' +
      '<div class="fim inteiro">' + (novo ? '' : '<button class="btn btn-linha" type="button" id="remover">Remover</button>') +
        '<button class="btn btn-linha" type="button" data-fechar>Cancelar</button><button class="btn btn-verde" type="submit">Salvar</button></div>' +
    '</form>',
    function (j) {
      var f = $('#f-cli', j);
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var d = new FormData(f);
        c.nome = d.get('nome').trim(); c.whatsapp = soNumeros(d.get('whatsapp')); c.email = d.get('email').trim();
        c.origem = d.get('origem'); c.etapa = d.get('etapa'); c.idioma = d.get('idioma');
        c.etiquetas = d.get('etiquetas').split(',').map(function (t) { return t.trim(); }).filter(Boolean);
        c.aceitaWhatsapp = !!d.get('aceitaWhatsapp'); c.aceitaEmail = !!d.get('aceitaEmail');
        var an = lerAniv(d.get('anivDia'), d.get('anivMes'));
        if (an === null) { aviso('Esse dia não existe nesse mês.'); return; }
        if (!an && (d.get('anivDia') || d.get('anivMes'))) { aviso('Escolha o dia e o mês do aniversário, ou deixe os dois em branco.'); return; }
        c.aniversario = an;
        var btn = $('button[type=submit]', f); btn.disabled = true; btn.textContent = 'Salvando...';
        Dados.salvarCliente(c).then(function (s) {
          fecharJanela(); aviso(novo ? primeiroNome(s.nome) + ' entrou na base.' : 'Alterações salvas.');
          location.hash = '#/cliente/' + encodeURIComponent(s.id); render();
        }, function () { btn.disabled = false; btn.textContent = 'Salvar'; aviso('Não consegui salvar. Tente de novo.'); });
      });
      var rm = $('#remover', j);
      if (rm) rm.addEventListener('click', function () {
        if (rm.dataset.ok) { Dados.removerCliente(c.id).then(function () { fecharJanela(); aviso('Cliente removido.'); location.hash = '#/clientes'; render(); }); }
        else { rm.dataset.ok = 1; rm.textContent = 'Toque de novo para remover'; }
      });
    });
}

function janelaEscolherImovel(c) {
  var ims = Dados.imoveis();
  abrirJanela('<span class="rotulo">Enviar material para ' + esc(primeiroNome(c.nome)) + '</span><h2>Qual imóvel?</h2>' +
    '<div class="pessoas" style="max-height:none;margin-top:18px">' + ims.map(function (im) {
      return '<div class="pessoa" data-im="' + esc(im.id) + '"><span class="avatar" style="background:url(\'' + esc(im.fotos[0] || '') + '\') center/cover, var(--verde)"></span><div>' + esc(im.nome) + '<small>' + esc(im.local) + '</small></div></div>';
    }).join('') + '</div><div class="fim"><button class="btn btn-linha" type="button" data-fechar>Cancelar</button></div>',
    function (j) {
      $$('[data-im]', j).forEach(function (el) { el.addEventListener('click', function () { var im = Dados.imovel(el.dataset.im); fecharJanela(); janelaEnviar(im, c); }); });
    });
}

function ligarCliente(id) {
  var c = Dados.cliente(id); if (!c) return;
  function salvarCom(mudar, msg) {
    var copia = JSON.parse(JSON.stringify(c)); mudar(copia);
    return Dados.salvarCliente(copia).then(function () { render(); if (msg) aviso(msg); }, function () { aviso('Não consegui salvar.'); });
  }
  $$('#etapas [data-etapa]').forEach(function (b) {
    b.addEventListener('click', function () { var e = b.dataset.etapa; if (e !== c.etapa) salvarCom(function (x) { x.etapa = e; }, primeiroNome(c.nome) + ' agora está em ' + e + '.'); });
  });
  $$('[data-lembrar]').forEach(function (b) {
    b.addEventListener('click', function () {
      var n = +b.dataset.lembrar;
      salvarCom(function (x) { x.lembrarEm = n ? maisDias(n) : null; }, n ? 'Lembrete marcado para ' + dataCurta(maisDias(n)) + '.' : 'Lembrete tirado.');
    });
  });
  $('[data-editar-cli]').addEventListener('click', function () { janelaCliente(JSON.parse(JSON.stringify(c))); });
  $('[data-material]').addEventListener('click', function () { janelaEscolherImovel(c); });
  $$('[data-tira]').forEach(function (b) {
    b.addEventListener('click', function () { var t = b.dataset.tira; salvarCom(function (x) { x.etiquetas = x.etiquetas.filter(function (y) { return y !== t; }); }); });
  });
  $('#f-tag').addEventListener('submit', function (e) {
    e.preventDefault(); var t = $('#tag').value.trim(); if (!t) return;
    salvarCom(function (x) { x.etiquetas = (x.etiquetas || []).filter(function (y) { return y !== t; }).concat([t]); }, 'Etiqueta posta.');
  });
  function pintarNotas() {
    Dados.anotacoes(c.id).then(function (l) {
      var box = $('#notas'); if (!box) return;
      box.innerHTML = l.length ? l.map(function (n) {
        return '<div class="nota"><small>' + esc(n.autor || '') + (n.autor ? ' · ' : '') + esc(dataCurta(n.criadoEm)) + '</small><p>' + esc(n.texto) + '</p></div>';
      }).join('') : '<p class="suave">Nenhuma anotação ainda.</p>';
    }, function () { var box = $('#notas'); if (box) box.innerHTML = '<p class="suave">Não consegui carregar as anotações.</p>'; });
  }
  $('#f-nota').addEventListener('submit', function (e) {
    e.preventDefault(); var t = $('#nota').value.trim(); if (!t) return;
    Dados.anotar(c.id, t).then(function () { $('#nota').value = ''; pintarNotas(); aviso('Anotado.'); }, function () { aviso('Não consegui anotar.'); });
  });
  pintarNotas();
}


/* ============================================================
   PARCEIROS (visão da equipe)
   ============================================================ */
var PRAZOS = [[30, '30 dias'], [90, '3 meses'], [180, '6 meses'], [0, 'Sem prazo']];
function ehParceiro() { return EU && EU.papel === 'parceiro'; }
function nomesImoveis(ids) {
  return ids.map(function (i) { var im = Dados.imovel(i); return im ? im.nome : null; }).filter(Boolean);
}
function situacao(pa) {
  if (!pa.imoveis.length) return ['Sem acesso', 'var(--creme)'];
  if (pa.acessoAte && pa.acessoAte < hojeISO()) return ['Expirado', '#E9E4DC'];
  return [pa.acessoAte ? 'Até ' + dataCurta(pa.acessoAte) : 'Ativo', 'var(--t-verde)'];
}
function linkConvite(c) {
  var base = Dados.demo ? location.href.replace(/[#?].*$/, '') : CONFIG.site + '/';
  return base + '#/convite/' + c.id;
}
function msgConvite(c) {
  var l = nomesImoveis(c.imoveis);
  return 'Olá, ' + primeiroNome(c.nome) + '. Aqui é a família Casa Oliveira.\n\n' +
    'Liberamos para você o material de ' + (l.length > 1 ? l.slice(0, -1).join(', ') + ' e ' + l[l.length - 1] : l[0] || 'nossos empreendimentos') + ': fotos, books, plantas e tabelas.\n\n' +
    'Crie sua senha neste link, com o e-mail ' + c.email + ':\n' + linkConvite(c) + '\n\n' + CONFIG.assinatura;
}
function avatarDe(nome, extra) { return '<span class="avatar' + (extra || '') + '">' + esc((primeiroNome(nome) || '?')[0]) + '</span>'; }

function telaParceiros() {
  var ps = Dados.parceiros(), cs = Dados.convites();
  return '<div class="entra">' +
    '<div class="topo"><div><span class="rotulo">Portal de parceiros</span><h1>Corretores parceiros</h1></div>' +
      '<div class="topo-acoes"><button class="btn btn-verde" type="button" data-convidar>' + I.mais + 'Convidar parceiro</button></div></div>' +
    '<p class="suave" style="max-width:640px;margin:-8px 0 24px">Cada corretor tem login próprio e vê só os empreendimentos que vocês liberarem, pelo tempo que vocês escolherem. Tudo que ele abre ou baixa fica registrado aqui.</p>' +
    (cs.length ? '<span class="rotulo" style="display:block;margin-bottom:12px">Convites esperando a senha</span><div class="lista-cli" style="margin-bottom:28px">' +
      cs.map(function (c) {
        return '<div class="linha-cli">' + avatarDe(c.nome, ' ane') +
          '<div class="cli-nome"><div>' + esc(c.nome) + '</div><small>' + esc(c.email) + ' · enviado ' + quando(c.criadoEm) + '</small></div>' +
          '<button class="btn btn-linha btn-pequeno" type="button" data-ver-convite="' + esc(c.id) + '">Ver convite</button></div>';
      }).join('') + '</div>' : '') +
    (ps.length ? '<span class="rotulo" style="display:block;margin-bottom:12px">Com acesso</span><div class="grade-parc">' + ps.map(function (pa) {
      var st = situacao(pa), ims = nomesImoveis(pa.imoveis);
      return '<a class="cartao-parc" href="#/parceiro/' + encodeURIComponent(pa.id) + '">' +
        '<div class="cli-topo">' + avatarDe(pa.nome) + '<div class="cli-nome"><div>' + esc(pa.nome) + '</div><small>' + esc(pa.imobiliaria || 'Corretor parceiro') + '</small></div>' +
        '<span class="selo" style="background:' + st[1] + '">' + esc(st[0]) + '</span></div>' +
        '<div class="tags">' + (ims.length ? ims.map(function (n) { return '<span class="tag">' + esc(n) + '</span>'; }).join('') : '<span class="suave" style="font-size:13px">Nenhum empreendimento liberado</span>') + '</div></a>';
    }).join('') + '</div>' :
    (cs.length ? '' : '<div class="breve-tela"><div class="ilustra">' + I.parceiro + '</div><h2>Nenhum parceiro ainda</h2>' +
      '<p class="suave">Convide um corretor, escolha os empreendimentos e mande o link pelo WhatsApp. Ele cria a senha e já vê o material.</p>' +
      '<button class="btn btn-verde" style="margin-top:20px" type="button" data-convidar>' + I.mais + 'Convidar o primeiro</button></div>')) +
  '</div>';
}

function escolhaImoveis(sel) {
  return '<div class="marcas">' + Dados.imoveis().map(function (im) {
    return '<label class="marca"><input type="checkbox" name="im" value="' + esc(im.id) + '"' + (sel.indexOf(im.id) >= 0 ? ' checked' : '') + '>' + esc(im.nome) + '</label>';
  }).join('') + '</div>';
}
function escolhaPrazo(atual) {
  return '<div class="filtros" style="margin:0" id="prazos">' + PRAZOS.map(function (p) {
    return '<button type="button" class="chip' + (p[0] === atual ? ' ativo' : '') + '" data-prazo="' + p[0] + '">' + p[1] + '</button>';
  }).join('') + '</div>';
}
function ligarPrazo(j, est) {
  $$('[data-prazo]', j).forEach(function (b) {
    b.addEventListener('click', function () { est.prazo = +b.dataset.prazo; $$('[data-prazo]', j).forEach(function (x) { x.classList.toggle('ativo', x === b); }); });
  });
}

function janelaConvite() {
  var est = { prazo: 90 };
  abrirJanela(
    '<span class="rotulo">Convidar parceiro</span><h2>Quem vai receber o material?</h2>' +
    '<form id="f-conv" class="grade-form" style="margin-top:20px">' +
      '<label class="campo"><span class="rotulo">Nome</span><input class="entrada" name="nome" required></label>' +
      '<label class="campo"><span class="rotulo">Imobiliária</span><input class="entrada" name="imobiliaria" placeholder="Ou corretor autônomo"></label>' +
      '<label class="campo"><span class="rotulo">E-mail para o login</span><input class="entrada" name="email" type="email" required></label>' +
      '<label class="campo"><span class="rotulo">WhatsApp com DDD</span><input class="entrada" name="whatsapp" inputmode="tel" placeholder="48 99999 9999"></label>' +
      '<div class="campo inteiro"><span class="rotulo">Empreendimentos liberados</span>' + escolhaImoveis([]) + '</div>' +
      '<div class="campo inteiro"><span class="rotulo">Por quanto tempo</span>' + escolhaPrazo(90) + '</div>' +
      '<div class="fim inteiro"><button class="btn btn-linha" type="button" data-fechar>Cancelar</button><button class="btn btn-verde" type="submit">Criar convite</button></div>' +
    '</form>',
    function (j) {
      ligarPrazo(j, est);
      var f = $('#f-conv', j);
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var d = new FormData(f), ims = d.getAll('im');
        if (!ims.length) { aviso('Escolha pelo menos um empreendimento.'); return; }
        var num = soNumeros(d.get('whatsapp')); if (num && num.length <= 11) num = '55' + num;
        var c = { nome: d.get('nome').trim(), imobiliaria: d.get('imobiliaria').trim(), email: d.get('email').trim().toLowerCase(), whatsapp: num,
          imoveis: ims, acessoAte: est.prazo ? maisDias(est.prazo) : null };
        var btn = $('button[type=submit]', f); btn.disabled = true; btn.textContent = 'Criando...';
        Dados.convidar(c).then(function (s) {
          fecharJanela(); render();
          Dados.conviteEmail(s.id).then(function () { s.emailEnviado = true; janelaVerConvite(s); }, function () { janelaVerConvite(s); });
        },
          function () { btn.disabled = false; btn.textContent = 'Criar convite'; aviso('Não consegui criar o convite. Tente de novo.'); });
      });
    });
}

function janelaVerConvite(c) {
  var l = linkConvite(c), msg = msgConvite(c);
  abrirJanela(
    '<span class="rotulo">Convite pronto</span><h2>Agora é só mandar para ' + esc(primeiroNome(c.nome)) + '</h2>' +
    (c.emailEnviado ? '<div class="aviso-ok" style="margin:14px 0 0">' + I.carta + '<span>Já mandamos o convite por e-mail para ' + esc(c.email) + '. Falta só o WhatsApp.</span></div>' : '') +
    '<p class="suave" style="margin-top:8px">O link vale por 30 dias e só funciona com o e-mail ' + esc(c.email) + '.</p>' +
    '<div class="passo"><span class="rotulo">Mensagem</span><div class="previa">' + esc(msg) + '</div></div>' +
    '<div class="fim">' +
      '<button class="btn btn-linha" type="button" id="cancelar-conv">Cancelar convite</button>' +
      '<button class="btn btn-linha" type="button" id="copiar-conv">' + I.link + 'Copiar link</button>' +
      '<button class="btn btn-linha" type="button" id="email-conv">' + I.carta + (c.emailEnviado ? 'Mandar e-mail de novo' : 'Enviar por e-mail') + '</button>' +
      '<a class="btn btn-wa" target="_blank" rel="noopener" href="https://wa.me/' + esc(c.whatsapp || '') + '?text=' + encodeURIComponent(msg) + '">' + I.wa + 'Enviar pelo WhatsApp</a>' +
    '</div>',
    function (j) {
      $('#copiar-conv', j).addEventListener('click', function () {
        (navigator.clipboard ? navigator.clipboard.writeText(l) : Promise.reject()).then(function () { aviso('Link copiado.'); }, function () { prompt('Copie o link:', l); });
      });
      var be = $('#email-conv', j);
      be.addEventListener('click', function () {
        be.disabled = true; be.textContent = 'Enviando...';
        Dados.conviteEmail(c.id).then(function () { be.disabled = false; be.innerHTML = I.carta + 'Mandar e-mail de novo'; aviso('Convite enviado para ' + c.email + '.'); },
          function () {
            be.disabled = false; be.innerHTML = I.carta + 'Enviar por e-mail';
            location.href = 'mailto:' + c.email + '?subject=' + encodeURIComponent('Seu acesso ao portal de parceiros da Casa Oliveira') + '&body=' + encodeURIComponent(msg);
          });
      });
      var cc = $('#cancelar-conv', j);
      cc.addEventListener('click', function () {
        if (!cc.dataset.ok) { cc.dataset.ok = 1; cc.textContent = 'Toque de novo para cancelar'; return; }
        Dados.cancelarConvite(c.id).then(function () { fecharJanela(); aviso('Convite cancelado.'); render(); }, function () { aviso('Não consegui cancelar.'); });
      });
    });
}

function telaParceiro(id) {
  var pa = Dados.parceiro(id);
  if (!pa) return '<a class="voltar" href="#/parceiros">' + I.voltar + 'Parceiros</a><div class="breve-tela"><h2>Parceiro não encontrado</h2></div>';
  var st = situacao(pa), prazo = pa.acessoAte ? 'Acesso até ' + dataCurta(pa.acessoAte) : 'Acesso sem prazo';
  return '<div class="entra">' +
    '<a class="voltar" href="#/parceiros">' + I.voltar + 'Todos os parceiros</a>' +
    '<section class="ficha-cli">' + avatarDe(pa.nome, ' grande') +
      '<div style="flex:1;min-width:0"><span class="rotulo">' + esc(pa.imobiliaria || 'Corretor parceiro') + ' · desde ' + esc(dataCurta(pa.criadoEm)) + '</span><h1>' + esc(pa.nome) + '</h1>' +
      '<span class="selo" style="background:' + st[1] + '">' + esc(st[0]) + '</span></div></section>' +
    (pa.whatsapp ? '<div class="acoes-imovel"><a class="btn btn-wa" target="_blank" rel="noopener" href="https://wa.me/' + esc(pa.whatsapp) + '?text=' + encodeURIComponent('Olá, ' + primeiroNome(pa.nome) + '. Aqui é a família Casa Oliveira.') + '">' + I.wa + 'Conversar no WhatsApp</a></div>' : '') +
    '<div class="duas"><div>' +
      '<section class="painel"><span class="rotulo">Empreendimentos liberados</span><div class="privacidade">' +
        Dados.imoveis().map(function (im) {
          return '<label class="alavanca"><input type="checkbox" data-acesso="' + esc(im.id) + '"' + (pa.imoveis.indexOf(im.id) >= 0 ? ' checked' : '') + '><span class="trilho"></span>' + esc(im.nome) + '</label>';
        }).join('') + '</div></section>' +
      '<section class="painel"><span class="rotulo">O que abriu e baixou</span><div id="aberturas" class="notas"><p class="suave">Carregando...</p></div></section>' +
    '</div><div>' +
      '<section class="painel"><span class="rotulo">Prazo</span><p>' + esc(prazo) + '</p><p class="suave" style="font-size:13px;margin:4px 0 12px">Mudar para, a partir de hoje:</p>' +
        '<div class="filtros" style="margin:0">' + PRAZOS.map(function (p) { return '<button type="button" class="chip" data-novo-prazo="' + p[0] + '">' + p[1] + '</button>'; }).join('') + '</div></section>' +
      '<section class="painel"><span class="rotulo">Tirar o acesso</span><p class="suave" style="margin-bottom:12px">Ele deixa de ver tudo na hora. Dá para liberar de novo depois.</p>' +
        '<button class="btn btn-linha" type="button" id="tirar">Tirar acesso de ' + esc(primeiroNome(pa.nome)) + '</button></section>' +
    '</div></div></div>';
}
function ligarParceiro(id) {
  var pa = Dados.parceiro(id); if (!pa) return;
  function salvarCom(mudar, msg) {
    var c = JSON.parse(JSON.stringify(pa)); mudar(c);
    return Dados.salvarParceiro(c).then(function () { render(); if (msg) aviso(msg); }, function () { aviso('Não consegui salvar.'); render(); });
  }
  $$('[data-acesso]').forEach(function (cb) {
    cb.addEventListener('change', function () {
      var i = cb.dataset.acesso, on = cb.checked, im = Dados.imovel(i);
      salvarCom(function (c) { c.imoveis = on ? c.imoveis.concat([i]) : c.imoveis.filter(function (x) { return x !== i; }); },
        (on ? 'Liberado: ' : 'Tirado: ') + (im ? im.nome : i));
    });
  });
  $$('[data-novo-prazo]').forEach(function (b) {
    b.addEventListener('click', function () {
      var n = +b.dataset.novoPrazo;
      salvarCom(function (c) { c.acessoAte = n ? maisDias(n) : null; }, n ? 'Acesso até ' + dataCurta(maisDias(n)) + '.' : 'Acesso sem prazo.');
    });
  });
  var t = $('#tirar');
  t.addEventListener('click', function () {
    if (!t.dataset.ok) { t.dataset.ok = 1; t.textContent = 'Toque de novo para confirmar'; return; }
    salvarCom(function (c) { c.imoveis = []; }, 'Acesso tirado.');
  });
  Dados.aberturas(id).then(function (l) {
    var box = $('#aberturas'); if (!box) return;
    box.innerHTML = l.length ? l.slice(0, 30).map(function (a) {
      var im = Dados.imovel(a.imovelId);
      return '<div class="nota"><small>' + esc(dataCurta(a.criadoEm)) + ' · ' + esc(new Date(a.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })) + '</small><p>' +
        (a.arquivo ? 'Baixou ' + esc(a.arquivo) : 'Abriu ' + esc(im ? im.nome : a.imovelId)) + '</p></div>';
    }).join('') : '<p class="suave">Ainda não abriu nada.</p>';
  }, function () { var box = $('#aberturas'); if (box) box.innerHTML = '<p class="suave">Não consegui carregar.</p>'; });
}

/* ============================================================
   PORTAL DO PARCEIRO (visão do corretor)
   ============================================================ */
function telaParceiroInicio() {
  var ims = Dados.imoveis();
  return '<div class="entra">' +
    '<section class="ola"><span class="rotulo">Portal de parceiros · Casa Oliveira</span><h1>' + saudacao() + ', ' + esc(primeiroNome(EU.nome)) + '</h1>' +
      '<p>' + (ims.length ? 'Aqui estão os empreendimentos liberados para você. Fotos, books, plantas e tabelas, sempre na versão mais recente.' : 'Ainda não há empreendimentos liberados para você. Fale com a Casa Oliveira.') + '</p>' + I.ramo + '</section>' +
    '<div class="grade">' + ims.map(cartaoImovel).join('') + '</div>' +
    '<p class="suave" style="margin-top:28px;font-size:14px">Dúvidas? <a href="https://wa.me/' + esc(CONFIG.whatsapp) + '?text=' + encodeURIComponent('Olá, família Casa Oliveira. Aqui é ' + primeiroNome(EU.nome) + ', do portal de parceiros.') + '" target="_blank" rel="noopener">Fale com a Ane e o Bernardo no WhatsApp</a>.</p>' +
  '</div>';
}
function telaImovelParceiro(id) {
  var im = Dados.imovel(id);
  if (!im) return '<a class="voltar" href="#/hoje">' + I.voltar + 'Empreendimentos</a><div class="breve-tela"><h2>Este empreendimento não está liberado para você</h2></div>';
  return '<div class="entra">' +
    '<a class="voltar" href="#/hoje">' + I.voltar + 'Empreendimentos</a>' +
    '<section class="capa" style="background-image:url(\'' + esc(im.fotos[0] || '') + '\')"><div class="sobre">' +
      '<span class="selo ' + classeStatus(im.status) + '">' + esc(im.status) + '</span>' +
      '<h1>' + esc(im.nome) + '</h1><p>' + esc(im.local) + '</p></div></section>' +
    '<div class="duas"><div>' +
      '<section class="painel"><div class="painel-topo"><span class="rotulo">Sobre</span>' +
        '<div class="idiomas"><button type="button" data-idioma="0" class="' + (idiomaFicha === 0 ? 'ativo' : '') + '">PT</button><button type="button" data-idioma="1" class="' + (idiomaFicha === 1 ? 'ativo' : '') + '">EN</button></div></div>' +
        '<p>' + esc(im.texto[idiomaFicha] || '') + '</p>' +
        (im.fatos.length ? '<div class="fatos">' + im.fatos.map(function (f) { return '<div class="fato"><div class="k">' + esc(f[0]) + '</div><div class="v">' + esc(f[1]) + '</div></div>'; }).join('') + '</div>' : '') +
        (im.valores ? '<p style="margin-top:16px"><span class="rotulo">Valores</span><br>' + esc(im.valores) + '</p>' : '') +
        (im.endereco ? '<p style="margin-top:12px"><span class="rotulo">Endereço</span><br>' + esc(im.endereco) + '</p>' : '') +
      '</section>' +
      '<section class="painel"><div class="painel-topo"><span class="rotulo">Fotos · ' + im.fotos.length + '</span></div><div class="fotos">' +
        im.fotos.map(function (f, i) { return '<button type="button" class="ft ft-baixar" data-foto="' + i + '" style="background-image:url(\'' + esc(f) + '\')" aria-label="Baixar foto">' + I.baixar + '</button>'; }).join('') +
      '</div><p class="suave" style="font-size:13px;margin-top:10px">Toque numa foto para baixar. Ela sai com a marca da Casa Oliveira e o seu nome.</p></section>' +
    '</div><div>' +
      '<section class="painel"><div class="painel-topo"><span class="rotulo">Documentos · ' + im.docs.length + '</span></div><div class="docs">' +
        (im.docs.length ? im.docs.map(function (d, i) {
          return '<div class="doc"><span class="ic ' + esc(d.tipo) + '">' + esc((TIPOS_DOC[d.tipo] || 'Doc').slice(0, 4)) + '</span>' +
            '<div class="nome"><div>' + esc(d.nome) + '</div><small>' + esc(TIPOS_DOC[d.tipo] || 'Documento') + '</small></div>' +
            '<button class="btn btn-linha btn-redondo btn-pequeno" style="width:40px" type="button" aria-label="Baixar" data-baixar="' + i + '">' + I.baixar + '</button></div>';
        }).join('') : '<p class="suave">Nenhum documento ainda.</p>') + '</div></section>' +
    '</div></div></div>';
}
function baixarFotoComMarca(url, nomeArq) {
  return new Promise(function (ok, falha) {
    var img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = function () {
      try {
        var c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
        var x = c.getContext('2d'); x.drawImage(img, 0, 0);
        var t = Math.max(14, Math.round(c.width / 60)), txt = 'Casa Oliveira · material para ' + EU.nome + (EU.imobiliaria ? ' · ' + EU.imobiliaria : '');
        x.font = '300 ' + t + 'px Jost, Helvetica, Arial, sans-serif'; x.textAlign = 'right'; x.textBaseline = 'bottom';
        var w = x.measureText(txt).width, pad = t * 0.8;
        x.fillStyle = 'rgba(17,31,14,.45)'; x.fillRect(c.width - w - pad * 2.4, c.height - t - pad * 2.2, w + pad * 2.4, t + pad * 2.2);
        x.fillStyle = 'rgba(242,240,235,.92)'; x.fillText(txt, c.width - pad * 1.2, c.height - pad * 1.1);
        c.toBlob(function (b) {
          if (!b) { falha(); return; }
          var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = nomeArq; document.body.appendChild(a); a.click();
          setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500); ok();
        }, 'image/jpeg', 0.9);
      } catch (e) { falha(e); }
    };
    img.onerror = falha; img.src = url;
  });
}
function ligarImovelParceiro(id) {
  var im = Dados.imovel(id); if (!im) return;
  Dados.registrarAbertura(im.id, null);
  $$('[data-idioma]').forEach(function (b) { b.addEventListener('click', function () { idiomaFicha = +b.dataset.idioma; render(); }); });
  $$('[data-foto]').forEach(function (b) {
    b.addEventListener('click', function () {
      var i = +b.dataset.foto, foto = im._fotos && im._fotos[i];
      aviso('Preparando a foto...');
      baixarFotoComMarca(im.fotos[i], im.id + '-' + (i + 1) + '.jpg').then(function () {
        Dados.registrarAbertura(im.id, foto ? { id: foto.id, nome: 'foto ' + (i + 1) } : { nome: 'foto ' + (i + 1) });
      }, function () { window.open(im.fotos[i], '_blank'); });
    });
  });
  $$('[data-baixar]').forEach(function (b) {
    b.addEventListener('click', function () {
      var d = im.docs[+b.dataset.baixar];
      if (!d || !d.caminho) { aviso('Este documento é só um exemplo.'); Dados.registrarAbertura(im.id, d); return; }
      var w = window.open('', '_blank');
      Dados.linkArquivo(d.caminho).then(function (u) { if (u && w) w.location = u; else if (w) w.close(); });
      Dados.registrarAbertura(im.id, d);
    });
  });
}

/* ---------- convite (sem login) ---------- */
function telaConvite(id) {
  $('#app').innerHTML = '<div class="login"><div class="login-caixa entra"><img class="logo" src="assets/logo.png" alt="Casa Oliveira"><p class="suave">Abrindo o convite...</p></div></div>';
  Dados.conviteInfo(id).then(function (c) {
    if (!c) {
      $('#app').innerHTML = '<div class="login"><div class="login-caixa entra"><img class="logo" src="assets/logo.png" alt="Casa Oliveira">' +
        '<div><h1>Convite indisponível</h1><p class="suave">Este link já foi usado ou passou do prazo. Se você já criou sua senha, é só entrar.</p></div>' +
        '<a class="btn btn-verde btn-bloco" href="#/" data-ir-parceiro>Entrar no portal</a></div></div>';
      $('[data-ir-parceiro]').addEventListener('click', function () { modoLogin = 'parceiro'; });
      return;
    }
    $('#app').innerHTML = '<div class="login"><div class="login-caixa entra">' +
      '<img class="logo" src="assets/logo.png" alt="Casa Oliveira">' +
      '<div><span class="rotulo">Portal de parceiros</span><h1>Olá, ' + esc(primeiroNome(c.nome)) + '</h1>' +
        '<p class="suave">A Casa Oliveira liberou para você o material de:</p></div>' +
      '<div class="tags" style="justify-content:center;margin-bottom:8px">' + (c.imoveis || []).map(function (n) { return '<span class="tag">' + esc(n) + '</span>'; }).join('') + '</div>' +
      '<form id="f-conv-senha">' +
        '<label class="campo"><span class="rotulo">E-mail</span><input class="entrada" id="email" type="email" autocomplete="username" value="' + esc(c.email) + '" readonly></label>' +
        '<label class="campo"><span class="rotulo">Crie uma senha</span><input class="entrada" id="senha" type="password" autocomplete="new-password" minlength="8" placeholder="Pelo menos 8 caracteres"></label>' +
        '<label class="campo"><span class="rotulo">Repita a senha</span><input class="entrada" id="senha2" type="password" autocomplete="new-password" placeholder="A mesma senha"></label>' +
        '<button class="btn btn-verde btn-bloco" type="submit" id="b-criar">Criar senha e entrar</button>' +
      '</form></div></div>';
    $('#f-conv-senha').addEventListener('submit', function (e) {
      e.preventDefault();
      var s1 = $('#senha').value, s2 = $('#senha2').value;
      if (s1.length < 8) { aviso('A senha precisa ter pelo menos 8 caracteres.'); return; }
      if (s1 !== s2) { aviso('As duas senhas não são iguais.'); return; }
      var b = $('#b-criar'); b.disabled = true; b.textContent = 'Criando...';
      Dados.aceitarConvite(id, c.email, s1).then(function (p) {
        EU = p; try { localStorage.setItem('co_email_parceiro', c.email); } catch (e2) {}
        location.hash = '#/hoje'; aviso('Bem-vindo ao portal, ' + primeiroNome(p.nome) + '.');
      }).catch(function (err) {
        b.disabled = false; b.textContent = 'Criar senha e entrar';
        aviso(err && err.message === 'sem-acesso' ? 'O convite não foi aceito. Fale com a Casa Oliveira.' :
          'Não consegui criar a senha. (' + ((err && (err.detalhe || err.message)) || 'erro desconhecido') + ')');
      });
    });
  });
}

/* ============================================================
   COMUNICADOS DE WHATSAPP
   ============================================================ */
var CUSTO_MSG = 0.32; // marketing no Brasil, tabela da Meta de out/2026 (aprox.)
var WA = { conectado: null };
function reais(v) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
function podeReceber(c) { return c.aceitaWhatsapp && soNumeros(c.whatsapp).length >= 10; }
function publico(f) {
  var et = f.etiquetas || [], ep = f.etapas || [];
  return Dados.clientes().filter(function (c) {
    if (et.length && !(c.etiquetas || []).some(function (t) { return et.indexOf(t) >= 0; })) return false;
    if (ep.length && ep.indexOf(c.etapa) < 0) return false;
    if (f.idioma && (c.idioma === 'en' ? 'en' : 'pt') !== f.idioma) return false;
    if (f.semAniversario && c.aniversario) return false;
    if (f.anivHoje && anivEmDias(c.aniversario) !== 0) return false;
    return true;
  });
}
function previaModelo(m, nome) {
  return esc(m.corpo).replace(/\{\{1\}\}/g, '<b>' + esc(primeiroNome(nome) || 'Marina') + '</b>');
}
function seloModelo(st) {
  var cor = { 'Aprovado': '#E1E9D9', 'Em análise': '#F1E3C8', 'Recusado': '#EBDDD0', 'Rascunho': 'var(--creme)' }[st] || 'var(--creme)';
  return '<span class="selo" style="background:' + cor + '">' + esc(st) + '</span>';
}

function telaComunicados() {
  var cls = Dados.clientes(), aceitam = cls.filter(podeReceber).length;
  return '<div class="entra">' +
    '<div class="topo"><div><span class="rotulo">WhatsApp oficial</span><h1>Comunicados</h1></div>' +
      '<div class="topo-acoes"><button class="btn btn-linha" type="button" data-sequencia>' + I.wa + 'Enviar em sequência</button><button class="btn btn-verde" type="button" data-novo-com>' + I.megafone + 'Novo comunicado</button></div></div>' +
    '<div class="dois-modos"><div><b>Enviar em sequência</b><span>Pelo WhatsApp de sempre, sem custo. O painel prepara a mensagem de cada pessoa com o nome dela e você aperta enviar. Bom para grupos pequenos, como quem foi a um evento.</span></div>' +
      '<div><b>Comunicado</b><span>Sai tudo de uma vez pela API oficial da Meta, para quem autorizou. Bom para grupos grandes.</span></div></div>' +
    '<div id="wa-status"></div>' +
    '<div class="blocos">' +
      '<div class="bloco c1"><span class="rotulo">Podem receber</span><div class="numero">' + aceitam + '</div><span class="suave">autorizaram comunicados</span></div>' +
      '<div class="bloco c2"><span class="rotulo">Sem autorização</span><div class="numero">' + (cls.length - aceitam) + '</div><span class="suave">não recebem comunicados</span></div>' +
      '<div class="bloco c3"><span class="rotulo">Custo por pessoa</span><div class="numero" style="font-size:44px">' + reais(CUSTO_MSG) + '</div><span class="suave">cobrado pela Meta, aproximado</span></div>' +
    '</div>' +
    '<span class="rotulo" style="display:block;margin-bottom:12px">Enviados</span><div id="lista-com" class="lista-cli" style="margin-bottom:28px"><p class="suave" style="padding:18px">Carregando...</p></div>' +
    '<div class="painel-topo"><span class="rotulo">Modelos de mensagem</span><div style="display:flex;gap:8px">' +
      '<button class="btn btn-linha btn-pequeno" type="button" data-atualizar-modelos>Atualizar status</button>' +
      '<button class="btn btn-linha btn-pequeno" type="button" data-novo-modelo>' + I.mais + 'Novo modelo</button></div></div>' +
    '<p class="suave" style="font-size:14px;margin:-6px 0 14px">A Meta só deixa mandar comunicado com modelo aprovado por ela. A aprovação leva de minutos a um dia.</p>' +
    '<div id="lista-modelos" class="grade-parc"></div>' +
  '</div>';
}
function preencherComunicados() {
  Dados.whatsappStatus().then(function (st) {
    WA.conectado = !!st.conectado;
    var box = $('#wa-status'); if (!box) return;
    box.innerHTML = st.conectado ? (st.demo ? '' : '<div class="aviso-ok">' + I.wa + '<span>WhatsApp oficial conectado. Os comunicados saem na hora.</span></div>') :
      '<div class="aviso-pendente">' + I.wa + '<span><b>Falta conectar o WhatsApp oficial.</b> Você já pode montar os modelos e escolher o público. O envio libera quando o número estiver ligado à Meta.</span></div>';
  });
  Dados.comunicados().then(function (l) {
    var box = $('#lista-com'); if (!box) return;
    box.innerHTML = l.length ? l.map(function (c) {
      var pct = function (n) { return c.total ? Math.round(n / c.total * 100) : 0; };
      return '<div class="linha-cli linha-com"><span class="avatar">' + I.megafone + '</span>' +
        '<div class="cli-nome"><div>' + esc(c.titulo) + '</div><small>' + esc(dataCurta(c.criadoEm)) + ' · ' + c.total + ' pessoas · ' + esc(c.status) + '</small>' +
          '<div class="barra-com"><i style="width:' + pct(c.lidos) + '%"></i><i class="ent" style="width:' + Math.max(0, pct(c.entregues) - pct(c.lidos)) + '%"></i></div></div>' +
        '<div class="nums-com so-pc"><span><b>' + c.entregues + '</b> entregues</span><span><b>' + c.lidos + '</b> lidos</span>' + (c.falhas ? '<span><b>' + c.falhas + '</b> falharam</span>' : '') + '</div></div>';
    }).join('') : '<p class="suave" style="padding:18px">Nenhum comunicado enviado ainda.</p>';
  }, function () { var box = $('#lista-com'); if (box) box.innerHTML = '<p class="suave" style="padding:18px">Rode o passo 07 no Supabase para ver os comunicados.</p>'; });
  Dados.modelos().then(function (l) {
    var box = $('#lista-modelos'); if (!box) return;
    box.innerHTML = l.map(function (m, i) {
      return '<div class="cartao-parc modelo"><div class="painel-topo" style="margin-bottom:10px"><b class="t-modelo">' + esc(m.titulo) + '</b>' + seloModelo(m.status) + '</div>' +
        '<div class="bolha">' + previaModelo(m, 'Marina') + (m.botaoTexto ? '<span class="bolha-botao">' + esc(m.botaoTexto) + '</span>' : '') + '</div>' +
        (m.motivo ? '<p class="suave" style="font-size:13px;margin-top:8px">Motivo da recusa: ' + esc(m.motivo) + '</p>' : '') +
        '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">' +
          (m.status === 'Rascunho' || m.status === 'Recusado' ? '<button class="btn btn-verde btn-pequeno" type="button" data-aprovar="' + i + '">Mandar para aprovação</button>' : '') +
          (m.status === 'Rascunho' || m.status === 'Recusado' ? '<button class="btn btn-linha btn-pequeno" type="button" data-editar-modelo="' + i + '">Editar</button>' : '') +
        '</div></div>';
    }).join('');
    $$('[data-aprovar]', box).forEach(function (b) {
      b.addEventListener('click', function () {
        b.disabled = true; b.textContent = 'Mandando...';
        Dados.aprovarModelo(l[+b.dataset.aprovar].id).then(function () { aviso('Modelo enviado para a Meta aprovar.'); preencherComunicados(); },
          function (e) { b.disabled = false; b.textContent = 'Mandar para aprovação'; aviso('Não deu: ' + (e.detalhe || 'tente de novo') + '.'); });
      });
    });
    $$('[data-editar-modelo]', box).forEach(function (b) { b.addEventListener('click', function () { janelaModelo(l[+b.dataset.editarModelo]); }); });
  }, function () {});
}

function janelaModelo(m) {
  var novo = !m;
  m = m || { titulo: '', corpo: 'Olá, {{1}}. Aqui é a família Casa Oliveira. ', botaoTexto: 'Ver o site', botaoUrl: 'https://casaoliveira.site', categoria: 'MARKETING', idioma: 'pt_BR' };
  abrirJanela(
    '<span class="rotulo">' + (novo ? 'Novo modelo' : 'Editar modelo') + '</span><h2>O que a mensagem vai dizer?</h2>' +
    '<form id="f-modelo" class="grade-form" style="margin-top:20px">' +
      '<label class="campo inteiro"><span class="rotulo">Nome do modelo (só para vocês)</span><input class="entrada" name="titulo" required value="' + esc(m.titulo) + '" placeholder="Ex.: Lançamento na serra"></label>' +
      '<label class="campo inteiro"><span class="rotulo">Mensagem</span><textarea class="entrada" name="corpo" rows="5" maxlength="1000" required>' + esc(m.corpo) + '</textarea>' +
        '<small class="suave">Onde estiver {{1}} entra o primeiro nome da pessoa. A Meta não aceita a mensagem começando ou terminando com {{1}}.</small></label>' +
      '<label class="campo"><span class="rotulo">Texto do botão</span><input class="entrada" name="botaoTexto" maxlength="25" value="' + esc(m.botaoTexto) + '"></label>' +
      '<label class="campo"><span class="rotulo">Link do botão</span><input class="entrada" name="botaoUrl" value="' + esc(m.botaoUrl) + '"></label>' +
      '<div class="campo inteiro"><span class="rotulo">Prévia</span><div class="bolha" id="previa-modelo"></div>' +
        '<small class="suave">Todo comunicado ganha também o botão "Parar de receber". Quem tocar sai da lista sozinho.</small></div>' +
      '<div class="fim inteiro">' + (novo ? '' : '<button class="btn btn-linha" type="button" id="remover">Apagar</button>') +
        '<button class="btn btn-linha" type="button" data-fechar>Cancelar</button><button class="btn btn-verde" type="submit">Salvar modelo</button></div>' +
    '</form>',
    function (j) {
      var f = $('#f-modelo', j);
      function previa() {
        var d = new FormData(f);
        $('#previa-modelo', j).innerHTML = previaModelo({ corpo: d.get('corpo') }, 'Marina') + (d.get('botaoTexto') ? '<span class="bolha-botao">' + esc(d.get('botaoTexto')) + '</span>' : '') + '<span class="bolha-botao">Parar de receber</span>';
      }
      f.addEventListener('input', previa); previa();
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var d = new FormData(f);
        m.titulo = d.get('titulo').trim(); m.corpo = d.get('corpo').trim(); m.botaoTexto = d.get('botaoTexto').trim(); m.botaoUrl = d.get('botaoUrl').trim();
        if (/wa\.me|whatsapp\.com/i.test(m.botaoUrl)) { aviso('A Meta não aceita link de WhatsApp no botão. Use o site ou deixe o link vazio: a pessoa já pode responder direto.'); return; }
        if (m.botaoUrl && !/^https:\/\//i.test(m.botaoUrl)) m.botaoUrl = 'https://' + m.botaoUrl.replace(/^https?:\/\//i, '');
        if (!m.nomeMeta) m.nomeMeta = m.titulo.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 60) + '_' + Date.now().toString(36);
        Dados.salvarModelo(m).then(function () { fecharJanela(); aviso('Modelo salvo. Agora é mandar para aprovação.'); preencherComunicados(); }, function () { aviso('Não consegui salvar o modelo.'); });
      });
      var rm = $('#remover', j);
      if (rm) rm.addEventListener('click', function () {
        if (!rm.dataset.ok) { rm.dataset.ok = 1; rm.textContent = 'Toque de novo para apagar'; return; }
        Dados.removerModelo(m.id).then(function () { fecharJanela(); preencherComunicados(); });
      });
    });
}

function janelaComunicado() {
  Dados.modelos().then(function (ms) {
    var aprovados = ms.filter(function (m) { return m.status === 'Aprovado'; });
    var est = { etiquetas: [], etapas: [], modelo: aprovados[0] || null };
    var tags = todasEtiquetas();
    abrirJanela(
      '<span class="rotulo">Novo comunicado</span><h2>Para quem e o quê?</h2>' +
      '<div class="passo"><span class="rotulo">1. Nome do comunicado (só para vocês)</span><input class="entrada" id="c-titulo" placeholder="Ex.: Lançamento Makai, novembro"></div>' +
      '<div class="passo"><span class="rotulo">2. Quem recebe</span>' +
        '<small class="suave" style="display:block;margin-bottom:8px">Sem escolher nada, vai para todos que autorizaram. Escolhendo, vai para quem tem qualquer uma das etiquetas.</small>' +
        '<div class="tags" id="c-tags">' + tags.map(function (t) { return '<button type="button" class="chip" data-ct="' + esc(t) + '">' + esc(t) + '</button>'; }).join('') + '</div>' +
        '<div class="tags" id="c-etapas" style="margin-top:12px">' + ETAPAS.map(function (e) { return '<button type="button" class="chip" data-ce="' + esc(e) + '">' + esc(e) + '</button>'; }).join('') + '</div></div>' +
      '<div class="passo"><span class="rotulo">3. Mensagem</span>' +
        (aprovados.length ? '<div class="marcas" id="c-modelos">' + aprovados.map(function (m, i) {
          return '<label class="marca"><input type="radio" name="modelo" value="' + i + '"' + (i === 0 ? ' checked' : '') + '>' + esc(m.titulo) + '</label>';
        }).join('') + '</div><div class="bolha" id="c-previa" style="margin-top:12px"></div>' :
        '<p class="suave">Nenhum modelo aprovado ainda. Crie um modelo e mande para aprovação da Meta.</p>') + '</div>' +
      '<div class="resumo-com" id="c-resumo"></div>' +
      '<div class="fim"><button class="btn btn-linha" type="button" data-fechar>Cancelar</button><button class="btn btn-wa" type="button" id="c-enviar">' + I.wa + 'Enviar</button></div>',
      function (j) {
        function pessoas() { return publico(est).filter(podeReceber); }
        function atualizar() {
          var todos = publico(est), ok = todos.filter(podeReceber), fora = todos.length - ok.length;
          $('#c-resumo', j).innerHTML = '<div><b>' + ok.length + '</b><span>vão receber</span></div>' +
            '<div><b>' + reais(ok.length * CUSTO_MSG) + '</b><span>custo aproximado</span></div>' +
            (fora ? '<div><b>' + fora + '</b><span>ficam de fora, sem autorização</span></div>' : '');
          if (est.modelo && $('#c-previa', j)) $('#c-previa', j).innerHTML = previaModelo(est.modelo, ok[0] ? ok[0].nome : 'Marina') +
            (est.modelo.botaoTexto ? '<span class="bolha-botao">' + esc(est.modelo.botaoTexto) + '</span>' : '') + '<span class="bolha-botao">Parar de receber</span>';
          var b = $('#c-enviar', j); delete b.dataset.ok;
          var pode = ok.length && est.modelo && WA.conectado !== false;
          b.disabled = !pode;
          b.innerHTML = I.wa + (WA.conectado === false ? 'Conecte o WhatsApp oficial para enviar' : !est.modelo ? 'Falta um modelo aprovado' : 'Enviar para ' + ok.length + (ok.length === 1 ? ' pessoa' : ' pessoas'));
        }
        function alternar(lista, v) { var i = lista.indexOf(v); if (i >= 0) lista.splice(i, 1); else lista.push(v); }
        $$('[data-ct]', j).forEach(function (b) { b.addEventListener('click', function () { alternar(est.etiquetas, b.dataset.ct); b.classList.toggle('ativo'); atualizar(); }); });
        $$('[data-ce]', j).forEach(function (b) { b.addEventListener('click', function () { alternar(est.etapas, b.dataset.ce); b.classList.toggle('ativo'); atualizar(); }); });
        $$('[name=modelo]', j).forEach(function (r) { r.addEventListener('change', function () { est.modelo = aprovados[+r.value]; atualizar(); }); });
        atualizar();
        var b = $('#c-enviar', j);
        b.addEventListener('click', function () {
          var ps = pessoas(); if (!ps.length || !est.modelo) return;
          if (!b.dataset.ok) { b.dataset.ok = 1; b.innerHTML = I.wa + 'Toque de novo para enviar para ' + ps.length + ' pessoas'; return; }
          b.disabled = true; b.textContent = 'Enviando...';
          var titulo = $('#c-titulo', j).value.trim() || est.modelo.titulo + ' · ' + dataCurta(new Date().toISOString());
          Dados.criarComunicado({ titulo: titulo, modeloId: est.modelo.id, filtro: { etiquetas: est.etiquetas, etapas: est.etapas } }, ps).then(function () {
            fecharJanela(); aviso('Comunicado saindo para ' + ps.length + ' pessoas.'); render();
          }, function (e) { b.disabled = false; aviso('Não deu: ' + ((e && e.detalhe) || 'tente de novo') + '.'); atualizar(); });
        });
      });
  }, function () { aviso('Rode o passo 07 no Supabase antes.'); });
}


/* ============================================================
   E-MAIL (Brevo)
   ============================================================ */
var EM = { conectado: null };
function podeEmail(c) { return c.aceitaEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(c.email || '').trim()); }
function temEmail(c) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(c.email || '').trim()); }
function previaEmail(m, nome) {
  var t = String(m.corpo || '').replace(/\{nome\}/g, primeiroNome(nome) || 'tudo bem').replace(/\n{3,}/g, '\n\n').trim();
  return '<div class="email-previa"><div class="ep-marca">Casa Oliveira</div><div class="ep-cartao">' +
    (m.assunto ? '<div class="ep-assunto">' + esc(m.assunto) + '</div>' : '') +
    t.split(/\n\n/).map(function (p) { return '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>'; }).join('') +
    (m.botaoTexto && m.botaoUrl ? '<span class="ep-botao">' + esc(m.botaoTexto) + '</span>' : '') +
    '<p class="ep-ass">Ane &amp; Bernardo<br><span>Casa Oliveira</span></p></div>' +
    '<div class="ep-rodape">Você recebe este e-mail porque tem contato com a Casa Oliveira. <u>Não quero mais receber</u>.</div></div>';
}
var MODELOS_EMAIL = [
  { nome: 'Material do evento', assunto: 'O material que prometemos, {nome}', corpo: 'Olá, {nome}.\n\nFoi muito bom ter você com a gente. Como combinado, separamos o material para você ver com calma.\n\nQualquer dúvida, é só responder este e-mail.', botaoTexto: 'Ver o material', botaoUrl: 'https://casaoliveira.site' },
  { nome: 'Novidade da curadoria', assunto: 'Uma novidade da nossa curadoria', corpo: 'Olá, {nome}.\n\nSeparamos uma novidade que tem a ver com o que você procura. Escolhemos com o mesmo cuidado de sempre: lugar, construtora e potencial.\n\nSe quiser os detalhes, é só responder este e-mail.', botaoTexto: 'Conhecer', botaoUrl: 'https://casaoliveira.site' },
  { nome: 'Pedir aniversário', assunto: '{nome}, queremos lembrar do seu dia', corpo: 'Olá, {nome}.\n\nNa Casa Oliveira nós cuidamos das pessoas, não só dos imóveis. Por isso gostaríamos de saber quando é o seu aniversário, para lembrar do seu dia.\n\nÉ só tocar no botão abaixo e escolher o dia e o mês. Leva poucos segundos e não pedimos o ano.', botaoTexto: 'Contar meu aniversário', botaoUrl: '{aniversario}', semAniversario: true, idioma: 'pt' },
  { nome: 'Birthday (English)', assunto: '{nome}, we would love to remember your day', corpo: 'Hello, {nome}.\n\nAt Casa Oliveira we care for people, not only for homes. That is why we would love to know when your birthday is, so we can remember your day.\n\nJust tap the button below and choose the day and month. It takes a few seconds and we do not ask for the year.', botaoTexto: 'Share my birthday', botaoUrl: '{aniversario}', semAniversario: true, idioma: 'en' },
  { nome: 'Em branco', assunto: '', corpo: 'Olá, {nome}.\n\n', botaoTexto: '', botaoUrl: '' }
];

function telaEmail() {
  var cls = Dados.clientes(), com = cls.filter(temEmail).length, ok = cls.filter(podeEmail).length;
  return '<div class="entra">' +
    '<div class="topo"><div><span class="rotulo">E-mail</span><h1>E-mails</h1></div>' +
      '<div class="topo-acoes"><button class="btn btn-verde" type="button" data-novo-email>' + I.carta + 'Novo e-mail</button></div></div>' +
    '<p class="suave" style="max-width:640px;margin:-8px 0 20px">Cada pessoa recebe com o próprio nome, com a cara da Casa Oliveira. Quem pede para sair é tirado da lista sozinho, e vocês veem quem abriu e quem clicou.</p>' +
    '<div id="em-status"></div>' +
    '<div class="blocos">' +
      '<div class="bloco c1"><span class="rotulo">Podem receber</span><div class="numero">' + ok + '</div><span class="suave">têm e-mail e autorizaram</span></div>' +
      '<div class="bloco c2"><span class="rotulo">Sem autorização</span><div class="numero">' + (com - ok) + '</div><span class="suave">têm e-mail, mas não autorizaram</span></div>' +
      '<div class="bloco c3"><span class="rotulo">Sem e-mail</span><div class="numero">' + (cls.length - com) + '</div><span class="suave">só WhatsApp</span></div>' +
    '</div>' +
    '<span class="rotulo" style="display:block;margin-bottom:12px">Enviados</span><div id="lista-em" class="lista-cli"><p class="suave" style="padding:18px">Carregando...</p></div>' +
  '</div>';
}
function preencherEmail() {
  Dados.emailStatus().then(function (st) {
    EM.conectado = !!st.conectado;
    var box = $('#em-status'); if (!box) return;
    box.innerHTML = st.conectado ? (st.demo ? '' : '<div class="aviso-ok">' + I.carta + '<span>E-mail conectado. Os envios saem na hora.</span></div>') :
      '<div class="aviso-pendente">' + I.carta + '<span><b>Falta conectar o Brevo.</b> Você já pode escrever e escolher o público. O envio libera quando a conta estiver ligada.</span></div>';
  });
  Dados.emails().then(function (l) {
    var box = $('#lista-em'); if (!box) return;
    box.innerHTML = l.length ? l.map(function (m) {
      var pct = function (n) { return m.total ? Math.round(n / m.total * 100) : 0; };
      return '<div class="linha-cli linha-com"><span class="avatar">' + I.carta + '</span>' +
        '<div class="cli-nome"><div>' + esc(m.assunto.replace(/\{nome\}/g, '…')) + '</div><small>' + esc(dataCurta(m.criadoEm)) + ' · ' + m.total + (m.total === 1 ? ' pessoa · ' : ' pessoas · ') + esc(m.status) + '</small>' +
          '<div class="barra-com"><i style="width:' + pct(m.cliques) + '%"></i><i class="ent" style="width:' + Math.max(0, pct(m.abertos) - pct(m.cliques)) + '%"></i></div></div>' +
        '<div class="nums-com so-pc"><span><b>' + m.abertos + '</b> abriram</span><span><b>' + m.cliques + '</b> clicaram</span>' + (m.falhas ? '<span><b>' + m.falhas + '</b> voltaram</span>' : '') + '</div></div>';
    }).join('') : '<p class="suave" style="padding:18px">Nenhum e-mail enviado ainda.</p>';
  }, function () { var box = $('#lista-em'); if (box) box.innerHTML = '<p class="suave" style="padding:18px">Rode o passo 10 no Supabase para ver os e-mails.</p>'; });
}
function janelaEmail() {
  var est = { etiquetas: [], etapas: [], idioma: '', semAniversario: false, m: JSON.parse(JSON.stringify(MODELOS_EMAIL[0])) };
  var tags = todasEtiquetas();
  abrirJanela(
    '<span class="rotulo">Novo e-mail</span><h2>Para quem e o quê?</h2>' +
    '<div class="passo"><span class="rotulo">1. Quem recebe</span>' +
      '<small class="suave" style="display:block;margin-bottom:8px">Sem escolher nada, vai para todos que autorizaram. Escolhendo, vai para quem tem qualquer uma das etiquetas.</small>' +
      '<div class="tags">' + tags.map(function (t) { return '<button type="button" class="chip" data-et="' + esc(t) + '">' + esc(t) + '</button>'; }).join('') + '</div>' +
      '<div class="tags" style="margin-top:12px">' + ETAPAS.map(function (e) { return '<button type="button" class="chip" data-ee="' + esc(e) + '">' + esc(e) + '</button>'; }).join('') + '</div>' +
      '<div class="tags" style="margin-top:12px"><button type="button" class="chip" data-ei="pt">Só português</button><button type="button" class="chip" data-ei="en">Só inglês</button>' +
        '<button type="button" class="chip" data-sem-aniv>Só quem não contou o aniversário</button></div></div>' +
    '<div class="passo"><span class="rotulo">2. Começar de</span><div class="tags">' + MODELOS_EMAIL.map(function (m, i) {
      return '<button type="button" class="chip' + (i === 0 ? ' ativo' : '') + '" data-mod="' + i + '">' + esc(m.nome) + '</button>'; }).join('') + '</div></div>' +
    '<div class="passo"><span class="rotulo">3. O e-mail</span>' +
      '<label class="campo"><span class="rotulo">Assunto</span><input class="entrada" id="e-assunto"></label>' +
      '<label class="campo"><span class="rotulo">Texto</span><textarea class="entrada" id="e-corpo" rows="7"></textarea></label>' +
      '<small class="suave" style="display:block;margin:-4px 0 10px">{nome} vira o primeiro nome da pessoa. Deixe uma linha em branco entre os parágrafos. No link do botão, {aniversario} vira o link pessoal para a pessoa contar o aniversário.</small>' +
      '<div class="grade-2"><label class="campo"><span class="rotulo">Texto do botão (opcional)</span><input class="entrada" id="e-btxt"></label>' +
      '<label class="campo"><span class="rotulo">Link do botão</span><input class="entrada" id="e-burl" placeholder="https://"></label></div></div>' +
    '<div class="passo"><span class="rotulo" id="e-como">Como fica</span><div id="e-previa"></div></div>' +
    '<div class="resumo-com" id="e-resumo"></div>' +
    '<div class="fim"><button class="btn btn-linha" type="button" data-fechar>Cancelar</button>' +
      '<button class="btn btn-linha" type="button" id="e-teste">' + I.carta + 'Mandar teste para mim</button>' +
      '<button class="btn btn-verde" type="button" id="e-enviar">' + I.carta + 'Enviar</button></div>',
    function (j) {
      function pessoas() { return publico(est).filter(podeEmail); }
      function lerCampos() {
        est.m.assunto = $('#e-assunto', j).value; est.m.corpo = $('#e-corpo', j).value;
        est.m.botaoTexto = $('#e-btxt', j).value.trim(); est.m.botaoUrl = $('#e-burl', j).value.trim();
        if (est.m.botaoUrl && !/^https?:\/\//i.test(est.m.botaoUrl) && est.m.botaoUrl.indexOf('{aniversario}') < 0) est.m.botaoUrl = 'https://' + est.m.botaoUrl;
      }
      function pintarFiltros() {
        $$('[data-ei]', j).forEach(function (x) { x.classList.toggle('ativo', x.dataset.ei === est.idioma); });
        var sa = $('[data-sem-aniv]', j); if (sa) sa.classList.toggle('ativo', !!est.semAniversario);
      }
      function escrever() {
        $('#e-assunto', j).value = est.m.assunto; $('#e-corpo', j).value = est.m.corpo;
        $('#e-btxt', j).value = est.m.botaoTexto; $('#e-burl', j).value = est.m.botaoUrl;
      }
      function atualizar() {
        lerCampos();
        var todos = publico(est), ok = todos.filter(podeEmail), fora = todos.length - ok.length;
        var ex = ok[0] ? ok[0].nome : 'Marina';
        $('#e-como', j).textContent = 'Como fica para ' + (primeiroNome(ex) || 'Marina');
        $('#e-previa', j).innerHTML = previaEmail({ assunto: est.m.assunto.replace(/\{nome\}/g, primeiroNome(ex)), corpo: est.m.corpo, botaoTexto: est.m.botaoTexto, botaoUrl: est.m.botaoUrl }, ex);
        $('#e-resumo', j).innerHTML = '<div><b>' + ok.length + '</b><span>vão receber</span></div><div><b>Grátis</b><span>até 300 por dia no Brevo</span></div>' +
          (fora ? '<div><b>' + fora + '</b><span>ficam de fora, sem e-mail ou sem autorização</span></div>' : '');
        var b = $('#e-enviar', j); delete b.dataset.ok;
        var pronto = ok.length && est.m.assunto.trim() && est.m.corpo.trim();
        b.disabled = !pronto || EM.conectado === false;
        b.innerHTML = I.carta + (EM.conectado === false ? 'Conecte o Brevo para enviar' : !est.m.assunto.trim() ? 'Falta o assunto' : 'Enviar para ' + ok.length + (ok.length === 1 ? ' pessoa' : ' pessoas'));
      }
      function alternar(lista, v) { var i = lista.indexOf(v); if (i >= 0) lista.splice(i, 1); else lista.push(v); }
      $$('[data-et]', j).forEach(function (b) { b.addEventListener('click', function () { alternar(est.etiquetas, b.dataset.et); b.classList.toggle('ativo'); atualizar(); }); });
      $$('[data-ee]', j).forEach(function (b) { b.addEventListener('click', function () { alternar(est.etapas, b.dataset.ee); b.classList.toggle('ativo'); atualizar(); }); });
      $$('[data-ei]', j).forEach(function (b) { b.addEventListener('click', function () { est.idioma = est.idioma === b.dataset.ei ? '' : b.dataset.ei; pintarFiltros(); atualizar(); }); });
      $('[data-sem-aniv]', j).addEventListener('click', function () { est.semAniversario = !est.semAniversario; pintarFiltros(); atualizar(); });
      $$('[data-mod]', j).forEach(function (b) {
        b.addEventListener('click', function () {
          est.m = JSON.parse(JSON.stringify(MODELOS_EMAIL[+b.dataset.mod])); escrever();
          if (est.m.semAniversario) est.semAniversario = true;
          if (est.m.idioma) est.idioma = est.m.idioma;
          pintarFiltros();
          $$('[data-mod]', j).forEach(function (x) { x.classList.toggle('ativo', x === b); }); atualizar();
        });
      });
      ['#e-assunto', '#e-corpo', '#e-btxt', '#e-burl'].forEach(function (id) { $(id, j).addEventListener('input', atualizar); });
      escrever(); atualizar();
      var t = $('#e-teste', j);
      t.addEventListener('click', function () {
        lerCampos(); if (!est.m.assunto.trim() || !est.m.corpo.trim()) { aviso('Escreva o assunto e o texto antes.'); return; }
        t.disabled = true; t.textContent = 'Mandando...';
        Dados.testeEmail(est.m).then(function (r) { t.disabled = false; t.innerHTML = I.carta + 'Mandar teste para mim'; aviso('Teste enviado para ' + ((r && r.para) || 'o seu e-mail') + '.'); },
          function (e) { t.disabled = false; t.innerHTML = I.carta + 'Mandar teste para mim'; aviso('Não deu: ' + ((e && e.detalhe) || 'tente de novo') + '.'); });
      });
      var b = $('#e-enviar', j);
      b.addEventListener('click', function () {
        lerCampos(); var ps = pessoas(); if (!ps.length) return;
        if (!b.dataset.ok) { b.dataset.ok = 1; b.innerHTML = I.carta + 'Toque de novo para enviar para ' + ps.length + (ps.length === 1 ? ' pessoa' : ' pessoas'); return; }
        b.disabled = true; b.textContent = 'Enviando...';
        Dados.criarEmail({ assunto: est.m.assunto.trim(), corpo: est.m.corpo.trim(), botaoTexto: est.m.botaoTexto, botaoUrl: est.m.botaoUrl,
          filtro: { etiquetas: est.etiquetas, etapas: est.etapas, idioma: est.idioma || null, semAniversario: !!est.semAniversario } }, ps).then(function () {
          fecharJanela(); aviso('E-mail saindo para ' + ps.length + (ps.length === 1 ? ' pessoa.' : ' pessoas.')); render();
        }, function (e) { b.disabled = false; aviso('Não deu: ' + ((e && e.detalhe) || 'tente de novo') + '.'); atualizar(); });
      });
    });
}
function telaSairEmail(id) {
  $('#app').innerHTML = '<div class="login"><div class="login-caixa entra"><img class="logo" src="assets/logo.png" alt="Casa Oliveira"><p class="suave">Um instante...</p></div></div>';
  var feito = function () {
    $('#app').innerHTML = '<div class="login"><div class="login-caixa entra"><img class="logo" src="assets/logo.png" alt="Casa Oliveira">' +
      '<div><h1>Pronto</h1><p class="suave">Você não vai mais receber nossos e-mails. Se mudar de ideia, é só nos chamar no WhatsApp.</p></div>' +
      '<a class="btn btn-linha btn-bloco" href="https://casaoliveira.site">Ir para o site da Casa Oliveira</a></div></div>';
  };
  if (id === 'teste') { feito(); return; }
  Dados.sairEmail(id).then(feito, feito);
}

/* ---------- página pública: a pessoa conta o aniversário ---------- */
function telaAniversario(id) {
  var en = false;
  try { en = String(navigator.language || '').slice(0, 2).toLowerCase() === 'en'; } catch (e) {}
  var T = {
    titulo: ['Quando é o seu aniversário?', 'When is your birthday?'],
    texto: ['Queremos lembrar do seu dia. Escolha o dia e o mês. Não pedimos o ano.', 'We would love to remember your day. Choose the day and month. We do not ask for the year.'],
    dia: ['Dia', 'Day'], mes: ['Mês', 'Month'], salvar: ['Guardar a data', 'Save the date'],
    falta: ['Escolha o dia e o mês.', 'Choose the day and the month.'], invalido: ['Esse dia não existe nesse mês.', 'That day does not exist in that month.'],
    pronto: ['Obrigado', 'Thank you'], prontoTxt: ['Guardamos a sua data com carinho. Até lá.', 'We saved your date with care. See you then.'],
    erro: ['Não conseguimos guardar agora. Tente de novo em instantes.', 'We could not save it right now. Please try again in a moment.'],
    site: ['Ir para o site da Casa Oliveira', 'Visit the Casa Oliveira website'], troca: ['English', 'Português'],
    ass: ['Ane & Bernardo, Casa Oliveira', 'Ane & Bernardo, Casa Oliveira']
  };
  function t(k) { return T[k][en ? 1 : 0]; }
  function desenhar() {
    var dias = '<option value="">' + t('dia') + '</option>', meses = '<option value="">' + t('mes') + '</option>';
    for (var i = 1; i <= 31; i++) dias += '<option value="' + i + '">' + i + '</option>';
    (en ? MONTHS : MESES).forEach(function (m, i) { meses += '<option value="' + (i + 1) + '">' + m + '</option>'; });
    $('#app').innerHTML = '<div class="login"><div class="login-caixa entra aniv-caixa"><img class="logo" src="assets/logo.png" alt="Casa Oliveira">' +
      '<div><h1>' + esc(t('titulo')) + '</h1><p class="suave">' + esc(t('texto')) + '</p></div>' +
      '<form id="f-aniv" class="aniv-form"><div class="grade-2"><select class="entrada" name="dia" aria-label="' + esc(t('dia')) + '">' + dias + '</select>' +
        '<select class="entrada" name="mes" aria-label="' + esc(t('mes')) + '">' + meses + '</select></div>' +
        '<button class="btn btn-verde btn-bloco" type="submit">' + esc(t('salvar')) + '</button></form>' +
      '<p class="suave aniv-ass">' + esc(t('ass')) + '</p>' +
      '<button type="button" class="btn-texto" id="aniv-lingua">' + esc(t('troca')) + '</button></div></div>';
    $('#aniv-lingua').addEventListener('click', function () { en = !en; desenhar(); });
    var f = $('#f-aniv');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(f), an = lerAniv(d.get('dia'), d.get('mes'));
      if (an === '') { aviso(t('falta')); return; }
      if (an === null) { aviso(t('invalido')); return; }
      var b = $('button[type=submit]', f); b.disabled = true;
      var feito = function () {
        $('#app').innerHTML = '<div class="login"><div class="login-caixa entra"><img class="logo" src="assets/logo.png" alt="Casa Oliveira">' +
          '<div><h1>' + esc(t('pronto')) + '</h1><p class="suave">' + esc(t('prontoTxt')) + '</p></div>' +
          '<p class="suave aniv-ass">' + esc(t('ass')) + '</p>' +
          '<a class="btn btn-linha btn-bloco" href="https://casaoliveira.site">' + esc(t('site')) + '</a></div></div>';
      };
      if (id === 'teste') { feito(); return; }
      Dados.salvarAniversario(id, +d.get('dia'), +d.get('mes')).then(function (ok) {
        if (ok === false) { b.disabled = false; aviso(t('invalido')); return; }
        feito();
      }, function () { b.disabled = false; aviso(t('erro')); });
    });
  }
  desenhar();
}

/* ---------- envio em sequência (pelo WhatsApp de sempre, sem custo) ---------- */
/* textos prontos. "marca" é a etiqueta que a pessoa ganha quando a mensagem é aberta no WhatsApp.
   "etiqueta": se existir alguém com ela, a janela já abre filtrada nela e com este texto. */
var SEQ_MODELOS = [
  { nome: 'Material do evento', marca: '', texto: 'Olá, {nome}. Aqui é a família Casa Oliveira.\n\nFoi muito bom ter você com a gente. Como combinado, separamos o material para você:\n{material}\n\nQualquer dúvida, é só responder por aqui.' },
  { nome: 'Primeiro contato Porsche', marca: 'Primeiro contato Porsche', etiqueta: 'Porsche lote 1',
    texto: 'Olá, {nome}. Aqui é o Bernardo, da Casa Oliveira. Nos conhecemos no encontro da Porsche da Encontros Motor, que organizo junto com o Pedro.\n\n' +
      'Este é o WhatsApp da Casa Oliveira, a curadoria imobiliária de alto padrão que conduzo com a minha mãe, Ane, em Florianópolis. Nascemos para ser a casa de confiança que nossos clientes procuram quando precisam tomar uma grande decisão: comprar, vender ou construir.\n\n' +
      'Há pouco fizemos um encontro de supercarros na Serra Catarinense. Está no topo da nossa página, fixado no meio: https://www.instagram.com/casaoliveiracuradoria/\n\n' +
      'Que essa conexão dê bons frutos. Espero te ver nos próximos encontros.\nUm grande abraço,\nBernardo' }
];
function janelaSequencia() {
  var est = { etiqueta: '', busca: '', sel: {}, imovel: '', passo: 1, fila: [], i: 0, marca: '' };
  var tags = todasEtiquetas();
  var TXT = SEQ_MODELOS[0].texto;
  SEQ_MODELOS.forEach(function (m) { if (!est.etiqueta && m.etiqueta && tags.indexOf(m.etiqueta) >= 0) { est.etiqueta = m.etiqueta; est.texto = m.texto; est.marca = m.marca; } });
  abrirJanela('<div id="seq"></div>', function (j) {
    var box = $('#seq', j);
    function lista() {
      var b = est.busca.toLowerCase(), nb = soNumeros(b);
      return Dados.clientes().filter(function (c) {
        if (soNumeros(c.whatsapp).length < 10) return false;
        if (est.etiqueta && (c.etiquetas || []).indexOf(est.etiqueta) < 0) return false;
        return !b || c.nome.toLowerCase().indexOf(b) >= 0 || (nb && soNumeros(c.whatsapp).indexOf(nb) >= 0);
      });
    }
    function escolhidos() { return Dados.clientes().filter(function (c) { return est.sel[c.id]; }); }
    function montar(c) {
      var im = est.imovel && Dados.imovel(est.imovel);
      return est.texto.replace(/\{nome\}/g, primeiroNome(c.nome)).replace(/\{material\}/g, im ? linkApresentacao(im) : '').replace(/\n{3,}/g, '\n\n').trim();
    }
    function passo1() {
      var l = lista(), n = escolhidos().length;
      box.innerHTML = '<span class="rotulo">Enviar em sequência · 1 de 2</span><h2>Para quem?</h2>' +
        '<p class="suave" style="margin-top:6px">Sai pelo WhatsApp de sempre, sem custo. Cada pessoa recebe com o próprio nome.</p>' +
        '<div class="passo"><input class="entrada" id="s-busca" placeholder="Buscar por nome ou telefone" value="' + esc(est.busca) + '">' +
        (tags.length ? '<select class="entrada" id="s-tag" style="margin-top:10px"><option value="">Todas as etiquetas</option>' + tags.map(function (t) { return '<option' + (t === est.etiqueta ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select>' : '') +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px"><small class="suave">' + l.length + ' na lista</small>' +
          '<button type="button" class="link-suave" id="s-todos">Marcar os ' + Math.min(l.length, 50) + ' da lista</button></div>' +
        '<div class="pessoas" style="max-height:300px">' + l.slice(0, 200).map(function (c) {
          return '<label class="pessoa' + (est.sel[c.id] ? ' ativa' : '') + '"><input type="checkbox" data-s="' + esc(c.id) + '"' + (est.sel[c.id] ? ' checked' : '') + ' style="accent-color:var(--verde)">' +
            avatarDe(c.nome) + '<div>' + esc(c.nome) + '<small>' + esc(telBonito(c.whatsapp)) + '</small></div></label>';
        }).join('') + '</div></div>' +
        '<div class="fim"><button class="btn btn-linha" type="button" data-fechar>Cancelar</button><button class="btn btn-verde" type="button" id="s-seguir"' + (n ? '' : ' disabled') + '>Seguir com ' + n + (n === 1 ? ' pessoa' : ' pessoas') + '</button></div>';
      $('#s-busca', box).addEventListener('input', function (e) { est.busca = e.target.value; var p = e.target.selectionStart; passo1(); var x = $('#s-busca', box); x.focus(); x.setSelectionRange(p, p); });
      var st = $('#s-tag', box); if (st) st.addEventListener('change', function () { est.etiqueta = st.value; passo1(); });
      $('#s-todos', box).addEventListener('click', function () { l.slice(0, 50).forEach(function (c) { est.sel[c.id] = true; }); passo1(); });
      $$('[data-s]', box).forEach(function (cb) { cb.addEventListener('change', function () { if (cb.checked) est.sel[cb.dataset.s] = true; else delete est.sel[cb.dataset.s]; passo1(); }); });
      $('#s-seguir', box).addEventListener('click', passo2);
      $('[data-fechar]', box).addEventListener('click', fecharJanela);
    }
    function passo2() {
      est.texto = est.texto || TXT;
      var ps = escolhidos();
      box.innerHTML = '<span class="rotulo">Enviar em sequência · 2 de 2</span><h2>A mensagem</h2>' +
        '<div class="passo"><span class="rotulo">Começar de</span><div class="tags">' + SEQ_MODELOS.map(function (m, i) {
          return '<button type="button" class="chip' + (est.texto === m.texto ? ' ativo' : '') + '" data-sm="' + i + '">' + esc(m.nome) + '</button>'; }).join('') + '</div></div>' +
        '<div class="passo"><span class="rotulo">Material (opcional)</span><select class="entrada" id="s-imovel"><option value="">Sem material</option>' +
          Dados.imoveis().map(function (im) { return '<option value="' + esc(im.id) + '"' + (im.id === est.imovel ? ' selected' : '') + '>' + esc(im.nome) + '</option>'; }).join('') + '</select></div>' +
        '<div class="passo"><span class="rotulo">Texto</span><textarea class="entrada" id="s-texto" rows="7">' + esc(est.texto) + '</textarea>' +
          '<small class="suave">{nome} vira o primeiro nome. {material} vira o link da apresentação do imóvel.</small></div>' +
        '<div class="passo"><span class="rotulo">Etiqueta para quem receber (opcional)</span><input class="entrada" id="s-marca" placeholder="Ex.: Primeiro contato Porsche" value="' + esc(est.marca) + '">' +
          '<small class="suave">Assim vocês sabem depois quem já recebeu esta mensagem.</small></div>' +
        '<div class="passo"><span class="rotulo">Como fica para ' + esc(primeiroNome(ps[0].nome)) + '</span><div class="previa" id="s-previa"></div></div>' +
        '<div class="fim"><button class="btn btn-linha" type="button" id="s-voltar">Voltar</button><button class="btn btn-wa" type="button" id="s-comecar">' + I.wa + 'Começar a enviar</button></div>';
      function previa() { $('#s-previa', box).textContent = montar(ps[0]); }
      $('#s-imovel', box).addEventListener('change', function (e) { est.imovel = e.target.value; previa(); });
      $('#s-texto', box).addEventListener('input', function (e) { est.texto = e.target.value; previa(); });
      $('#s-marca', box).addEventListener('input', function (e) { est.marca = e.target.value.trim(); });
      $$('[data-sm]', box).forEach(function (b) { b.addEventListener('click', function () { var m = SEQ_MODELOS[+b.dataset.sm]; est.texto = m.texto; est.marca = m.marca; passo2(); }); });
      previa();
      $('#s-voltar', box).addEventListener('click', passo1);
      $('#s-comecar', box).addEventListener('click', function () { est.fila = ps; est.i = 0; passo3(); });
    }
    function passo3() {
      if (est.i >= est.fila.length) {
        box.innerHTML = '<div style="text-align:center;padding:10px 0"><div class="ilustra-ok">' + I.folha + '</div><h2>Pronto!</h2><p class="suave" style="margin-top:8px">' + est.fila.length + ' mensagens preparadas.</p>' +
          '<div class="fim" style="justify-content:center"><button class="btn btn-verde" type="button" data-fechar>Fechar</button></div></div>';
        $('[data-fechar]', box).addEventListener('click', fecharJanela);
        return;
      }
      var c = est.fila[est.i], msg = montar(c), pct = Math.round(est.i / est.fila.length * 100);
      box.innerHTML = '<span class="rotulo">' + (est.i + 1) + ' de ' + est.fila.length + '</span>' +
        '<div class="barra-com" style="max-width:none;margin:10px 0 18px"><i style="width:' + pct + '%"></i></div>' +
        '<div class="ficha-cli" style="box-shadow:none;padding:0;margin:0 0 14px">' + avatarDe(c.nome) + '<div><h2>' + esc(c.nome) + '</h2><span class="suave">' + esc(telBonito(c.whatsapp)) + '</span></div></div>' +
        '<div class="previa">' + esc(msg) + '</div>' +
        '<div class="fim"><button class="btn btn-linha" type="button" id="s-pular">Pular</button>' +
          '<a class="btn btn-wa" id="s-abrir" target="_blank" rel="noopener" href="' + esc(linkWa(c, msg)) + '">' + I.wa + 'Abrir WhatsApp de ' + esc(primeiroNome(c.nome)) + '</a></div>' +
        '<p class="suave" style="font-size:13px;margin-top:12px;text-align:center">Aperte enviar no WhatsApp e volte aqui. A próxima pessoa já estará pronta.</p>';
      $('#s-pular', box).addEventListener('click', function () { est.i++; passo3(); });
      $('#s-abrir', box).addEventListener('click', function () {
        Dados.anotar(c.id, 'Mensagem enviada em sequência' + (est.imovel ? ' com o material de ' + (Dados.imovel(est.imovel) || {}).nome : '') + '.').catch(function () {});
        if (est.marca && (c.etiquetas || []).indexOf(est.marca) < 0) {
          var copia = JSON.parse(JSON.stringify(c)); copia.etiquetas = (copia.etiquetas || []).concat(est.marca);
          Dados.salvarCliente(copia).catch(function () {});
        }
        setTimeout(function () { est.i++; passo3(); }, 400);
      });
    }
    passo1();
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
  var partes = (location.hash || '#/hoje').replace(/^#\//, '').split('/');
  var rota = partes[0] || 'hoje', arg = decodeURIComponent(partes[1] || '');
  if (rota === 'sair') { telaSairEmail(arg); return; }
  if (rota === 'aniversario') { telaAniversario(arg); return; }
  if (rota === 'convite' && !EU) { telaConvite(arg); return; }
  if (!EU) { telaEntrar(); return; }
  if (rota === 'convite') { location.hash = '#/hoje'; return; }
  var miolo, atual = rota;
  if (ehParceiro()) {
    if (rota === 'imovel') miolo = telaImovelParceiro(arg); else { rota = 'hoje'; miolo = telaParceiroInicio(); }
    $('#app').innerHTML = casca('hoje', miolo);
    $$('[data-sair]').forEach(function (b) { b.addEventListener('click', sair); });
    if (rota === 'imovel') ligarImovelParceiro(arg);
    return;
  }
  if (rota === 'hoje') miolo = telaHoje();
  else if (rota === 'imoveis') miolo = telaImoveis();
  else if (rota === 'imovel') { miolo = telaImovel(arg); atual = 'imoveis'; }
  else if (rota === 'clientes') miolo = telaClientes();
  else if (rota === 'parceiros') miolo = telaParceiros();
  else if (rota === 'comunicados') miolo = telaComunicados();
  else if (rota === 'email') miolo = telaEmail();
  else if (rota === 'parceiro') { miolo = telaParceiro(arg); atual = 'parceiros'; }
  else if (rota === 'cliente') { miolo = telaCliente(arg); atual = 'clientes'; }
  else if (BREVE[rota]) miolo = telaBreve(rota);
  else { miolo = telaHoje(); atual = 'hoje'; }
  $('#app').innerHTML = casca(atual, miolo);
  ligar(rota, arg);
}

function ligar(rota, arg) {
  $$('[data-sair]').forEach(function (b) { b.addEventListener('click', sair); });
  $$('[data-novo-imovel]').forEach(function (b) { b.addEventListener('click', function () { janelaImovel(null); }); });
  $$('[data-novo-cliente]').forEach(function (b) { b.addEventListener('click', function () { janelaCliente(null); }); });
  if (rota === 'clientes') {
    preencherClientes();
    $('#area-cli').addEventListener('click', function (e) { if (e.target.closest('[data-novo-cliente]')) janelaCliente(null); });
    $('#busca-cli').addEventListener('input', function (e) { filtroCli.busca = e.target.value; filtroCli.limite = 100; preencherClientes(); });
    $$('#vista [data-v]').forEach(function (b) {
      b.addEventListener('click', function () {
        filtroCli.vista = b.dataset.v; try { localStorage.setItem('co_vista', filtroCli.vista); } catch (e) {}
        $$('#vista [data-v]').forEach(function (x) { x.classList.toggle('ativo', x === b); });
        preencherClientes();
      });
    });
    var af = $('#abre-filtros');
    if (af) af.addEventListener('click', function () { filtroCli.aberto = !filtroCli.aberto; render(); });
    $$('[data-tag]').forEach(function (b) {
      b.addEventListener('click', function () {
        filtroCli.etiqueta = b.dataset.tag === filtroCli.etiqueta ? '' : b.dataset.tag;
        filtroCli.limite = 100; filtroCli.aberto = false; render();
        if (filtroCli.etiqueta) aviso('Mostrando: ' + filtroCli.etiqueta);
      });
    });
  }
  if (rota === 'cliente') ligarCliente(arg);
  $$('[data-novo-email]').forEach(function (b) { b.addEventListener('click', janelaEmail); });
  if (rota === 'email') preencherEmail();
  $$('[data-sequencia]').forEach(function (b) { b.addEventListener('click', janelaSequencia); });
  $$('[data-convidar]').forEach(function (b) { b.addEventListener('click', janelaConvite); });
  $$('[data-ver-convite]').forEach(function (b) {
    b.addEventListener('click', function () { var c = Dados.convites().filter(function (x) { return x.id === b.dataset.verConvite; })[0]; if (c) janelaVerConvite(c); });
  });
  if (rota === 'parceiro') ligarParceiro(arg);
  if (rota === 'comunicados') {
    preencherComunicados();
    $$('[data-novo-com]').forEach(function (b) { b.addEventListener('click', janelaComunicado); });
    $$('[data-novo-modelo]').forEach(function (b) { b.addEventListener('click', function () { janelaModelo(null); }); });
    $$('[data-atualizar-modelos]').forEach(function (b) {
      b.addEventListener('click', function () {
        b.disabled = true;
        Dados.atualizarModelos().then(function () { aviso('Status dos modelos atualizado.'); preencherComunicados(); b.disabled = false; },
          function (e) { aviso('Não deu: ' + ((e && e.detalhe) || 'tente de novo') + '.'); b.disabled = false; });
      });
    });
  }
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
