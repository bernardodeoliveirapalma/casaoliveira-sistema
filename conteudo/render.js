// ============================================================
// Desenha as lâminas de um post do Imobiliário Brasil.
// Uso: node conteudo/render.js conteudo/fila/<post>.json <pasta-de-saída>
// Gera 01.jpg, 02.jpg... em 1080x1350 (padrão do Instagram).
// Identidade: Cormorant Garamond + Jost, creme #F2F0EB, verde #111F0E.
// ============================================================
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const css = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400&family=Jost:wght@300;400&display=block');
*{margin:0;box-sizing:border-box}body{width:1080px;height:1350px;position:relative;overflow:hidden;font-family:Jost;font-weight:300;color:#F2F0EB}
.ph{position:absolute;inset:0;background-size:cover;background-position:center}
.lbl{font-weight:400;font-size:22px;letter-spacing:.22em;text-transform:uppercase}
.top{position:absolute;top:64px;left:80px;right:80px;display:flex;justify-content:space-between;opacity:.75}
h1{font-family:'Cormorant Garamond';font-weight:400;font-size:84px;line-height:1.04;margin-top:22px}
h2{font-family:'Cormorant Garamond';font-weight:400;font-size:76px;line-height:1.06;font-variant-numeric:lining-nums}
p{font-size:33px;line-height:1.5}
.gc{position:absolute;left:0;right:0;bottom:0;height:760px;background:linear-gradient(0deg,rgba(17,20,14,.80) 0%,rgba(17,20,14,.45) 45%,rgba(17,20,14,0) 100%)}
.gt{position:absolute;top:0;left:0;right:0;height:260px;background:linear-gradient(180deg,rgba(17,20,14,.45),rgba(17,20,14,0))}
.mark{position:absolute;top:60px;left:0;right:0;text-align:center;font-family:'Cormorant Garamond';font-size:44px;letter-spacing:.04em}
.tc{position:absolute;left:72px;right:72px;bottom:96px;text-align:center}
.cred{position:absolute;right:28px;bottom:22px;font-size:17px;opacity:.8;letter-spacing:.03em;text-shadow:0 0 6px rgba(0,0,0,.5)}
.capt{position:absolute;left:80px;right:80px;bottom:90px;font-size:30px;line-height:1.45}
.g{position:absolute;left:0;right:0;bottom:0;height:560px;background:linear-gradient(0deg,rgba(17,20,14,.78),rgba(17,20,14,0))}
.n{font-family:'Cormorant Garamond';font-size:120px;line-height:1;color:#3E4A36}
.claro{background:#F2F0EB;color:#111F0E}.escuro{background:#111F0E;color:#F2F0EB}
ol{list-style:none;padding:0}li{font-size:33px;line-height:1.45;padding:26px 0;border-top:1px solid #D6D0C2}li b{font-weight:400;color:#111F0E}`;

const foto = (u) => (/^https?:/.test(u) ? (u.includes('?') ? u + '&' : u + '?') + 'w=2400&q=90&fm=jpg' : u);
const esc = (s = '') => String(s);

function lamina(l, pg, tot) {
  const pag = `${pg}/${tot}`;
  switch (l.t) {
    case 'capa':
      return `<div class=ph style="background-image:url('${foto(l.foto)}')"></div><div class=gc></div>${l.marca ? '<div class=gt></div><div class=mark>Imobiliário Brasil</div>' : ''}<div class=tc><div class=lbl>${esc(l.rotulo)}</div><h1>${esc(l.titulo)}</h1></div>`;
    case 'glossario':
      return `<div class="ph escuro"></div><div class=mark>Imobiliário Brasil</div><div style="position:absolute;top:430px;left:0;right:0;text-align:center"><div class=lbl style="opacity:.7">Glossário</div><h1 style="font-size:260px;margin-top:10px">${esc(l.termo)}</h1><div style="font-size:30px;line-height:1.5;margin:20px 140px 0;opacity:.85">${esc(l.texto)}</div></div>`;
    case 'imagem':
      return `<div class=ph style="background-image:url('${l.arquivo}')"></div>`;
    case 'foto':
      return `<div class=ph style="background-image:url('${foto(l.foto)}')"></div>${l.legenda ? `<div class=g></div><div class=capt>${esc(l.legenda)}</div>` : ''}<div class=cred>${esc(l.credito)}</div>`;
    case 'texto': {
      const cl = l.escuro ? 'escuro' : 'claro';
      return `<div class="ph ${cl}"><div class="top lbl"><span>${esc(l.rotulo)}</span><span>${pag}</span></div><div style="position:absolute;left:80px;right:80px;top:${l.foto ? 190 : 300}px"><h2>${esc(l.titulo)}</h2><p style="margin-top:48px;opacity:.92;color:${l.escuro ? '#F2F0EB' : '#3B2C20'}">${esc(l.texto)}</p></div>${l.foto ? `<div style="position:absolute;left:80px;right:80px;bottom:80px;height:${l.alturaFoto || 470}px;background:url('${foto(l.foto)}') ${l.posicaoFoto || 'center'}/cover"></div>${l.notaFoto ? `<div style="position:absolute;left:80px;right:80px;bottom:34px;font-size:20px;opacity:.75;color:#3B2C20">${esc(l.notaFoto)}</div>` : ''}` : ''}</div>`;
    }
    case 'lista':
      return `<div class="ph claro"><div class="top lbl"><span>${esc(l.rotulo)}</span><span>${pag}</span></div><div style="position:absolute;left:80px;right:80px;top:230px"><h2 style="margin-bottom:44px">${esc(l.titulo)}</h2><ol style="color:#3B2C20">${l.itens.map((x) => `<li><b>${esc(x[0])}</b> ${esc(x[1])}</li>`).join('')}</ol></div></div>`;
    case 'numero':
      return `<div class="ph claro"><div class="top lbl"><span>${esc(l.rotulo || 'Guia')}</span><span>${pag}</span></div><div style="position:absolute;left:80px;right:80px;top:330px"><div class=n>${esc(l.n)}</div><h2 style="margin-top:30px">${esc(l.titulo)}</h2><p style="margin-top:40px;color:#3B2C20">${esc(l.texto)}</p></div></div>`;
    case 'fim':
      return `<div class="ph escuro" style="text-align:center"><div style="position:absolute;left:80px;right:80px;top:470px"><div style="font-family:'Cormorant Garamond';font-size:72px">Imobiliário Brasil</div><p style="margin-top:28px;opacity:.85">Casas, arquitetura e o mercado de alto padrão,<br>com a nossa leitura. Todos os dias.</p><div class=lbl style="margin-top:70px;opacity:.7">Salve · Compartilhe · Siga @imobiliario.brasil</div></div></div>`;
  }
  throw new Error('Lâmina desconhecida: ' + l.t);
}

async function render(arq, saida) {
  const post = JSON.parse(fs.readFileSync(arq, 'utf8'));
  fs.mkdirSync(saida, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  const L = post.laminas || [];
  const feitos = [];
  for (let i = 0; i < L.length; i++) {
    const l = { ...L[i] };
    if (l.arquivo) l.arquivo = 'file://' + path.resolve(path.dirname(arq), l.arquivo);
    if (l.foto && !/^https?:/.test(l.foto)) l.foto = 'file://' + path.resolve(path.dirname(arq), l.foto);
    const html = path.resolve(saida, '_l.html');
    fs.writeFileSync(html, `<html><head><meta charset=utf-8><style>${css}</style></head><body>${lamina(l, i + 1, L.length)}</body></html>`);
    await p.goto('file://' + html, { waitUntil: 'networkidle', timeout: 90000 });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(500);
    const nome = path.join(saida, String(i + 1).padStart(2, '0') + '.jpg');
    await p.screenshot({ path: nome, type: 'jpeg', quality: 93 });
    feitos.push(nome);
  }
  await b.close();
  try { fs.unlinkSync(path.resolve(saida, '_l.html')); } catch {}
  return feitos;
}

if (require.main === module) {
  render(process.argv[2], process.argv[3] || 'saida').then((f) => console.log(f.join('\n'))).catch((e) => { console.error(e); process.exit(1); });
}
module.exports = { render };
