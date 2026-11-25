// ============================================================
// Monta um reel do Imobiliário Brasil a partir de um vídeo livre
// (Pixabay) e de um roteiro de frases curtas.
// Uso: node conteudo/reel.js conteudo/fila/<post>.json <pasta-de-saída>
// Gera reel.mp4 (1080x1920, H.264) e capa.jpg.
//
// No JSON do post:
//  "tipo": "reel",
//  "roteiro": {
//    "estilo": "revista" | "cinema",   (padrão: revista)
//    "editoria": "Arquitetura",        (aparece no topo)
//    "video": "<link do arquivo do Pixabay>",
//    "inicio": 0,                      (segundo do vídeo onde começa)
//    "credito": "Vídeo: Nome / Pixabay",
//    "cenas": [ { "texto": "Por que as casas são *tão coloridas*?", "seg": 3.5 }, ... ]
//  }
// Entre *asteriscos* = destaque em itálico. Cada frase entra deslizando.
// Depois da última frase vem a lâmina final (2,5s).
//
// Zonas seguras do Reels: nada importante nos 320px de baixo nem
// nos 150px da direita (botões e legenda do Instagram ficam ali).
// ============================================================
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const W = 1080, H = 1920, FIM = 2.6;
const CREME = '#F2F0EB', VERDE = '#111F0E', MARROM = '#3B2C20', LINHA = '#CFC8B8';
// Janela do vídeo no estilo revista
const JAN = { x: 60, y: 640, w: 960, h: 960 };

const base = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Jost:wght@300;400;500&display=block');
*{margin:0;box-sizing:border-box}html,body{background:transparent}
body{width:${W}px;height:${H}px;position:relative;overflow:hidden;font-family:Jost;font-weight:300}
.k{font-family:Jost;font-weight:500;font-size:22px;letter-spacing:.28em;text-transform:uppercase}
.serif{font-family:'Cormorant Garamond';font-weight:500;letter-spacing:-.012em;font-variant-numeric:lining-nums}
em{font-style:italic;font-weight:400}`;

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>')
  .replace(/\*([^*]+)\*/g, '<em>$1</em>');
const limpo = (s = '') => String(s).replace(/\*/g, '');
const dois = (n) => String(n).padStart(2, '0');

// ---------- Estilo REVISTA: vídeo emoldurado no papel creme ----------
const revista = {
  css: `${base}
  .papel{position:absolute;inset:0;background:${CREME}}
  .jan{position:absolute;left:${JAN.x}px;top:${JAN.y}px;width:${JAN.w}px;height:${JAN.h}px;background:#000}
  .top{position:absolute;left:60px;right:60px;top:118px;display:flex;justify-content:space-between;align-items:baseline;color:${VERDE}}
  .marca{font-family:'Cormorant Garamond';font-weight:500;font-size:40px;letter-spacing:.02em}
  .rule{position:absolute;left:60px;right:60px;top:178px;height:1px;background:${VERDE};opacity:.85}
  .ed{position:absolute;left:60px;top:204px;color:${MARROM};opacity:.8}
  .num{position:absolute;right:60px;top:204px;color:${MARROM};opacity:.8}
  .tx{position:absolute;left:60px;right:90px;top:262px;height:350px;display:flex;align-items:center;color:${VERDE}}
  .tx h1{font-size:84px;line-height:1.02}.tx h1.m{font-size:72px;line-height:1.04}.tx h1.p{font-size:62px;line-height:1.06}
  .tx em{color:${MARROM}}
  .pe{position:absolute;left:60px;right:60px;top:${JAN.y + JAN.h + 22}px;display:flex;justify-content:space-between;color:${MARROM};font-size:19px;letter-spacing:.06em;opacity:.85}`,
  moldura: (r) => `<div class=top><div class=marca>Imobiliário Brasil</div><div class=k style="font-size:19px;opacity:.75">Casas · Arquitetura · Mercado</div></div><div class=rule></div>`,
  cena: (c, i, n, r) => `<div class="ed k">${esc(c.rotulo || r.editoria || 'Arquitetura')}</div><div class="num k">${dois(i + 1)} / ${dois(n)}</div><div class=tx><h1 class="serif ${tam(c.texto)}">${esc(c.texto)}</h1></div><div class=pe><span>${esc(r.credito || '')}</span><span>@imobiliario.brasil</span></div>`,
};

// ---------- Estilo CINEMA: vídeo cheio, texto editorial embaixo à esquerda ----------
const cinema = {
  css: `${base}
  body{color:${CREME}}
  .gb{position:absolute;left:0;right:0;bottom:0;height:1150px;background:linear-gradient(0deg,rgba(10,12,9,.86) 0%,rgba(10,12,9,.78) 32%,rgba(10,12,9,.35) 62%,rgba(10,12,9,0) 100%)}
  .gt{position:absolute;left:0;right:0;top:0;height:360px;background:linear-gradient(180deg,rgba(10,12,9,.55),rgba(10,12,9,0))}
  .top{position:absolute;left:72px;right:72px;top:120px;display:flex;justify-content:space-between;align-items:baseline}
  .marca{font-family:'Cormorant Garamond';font-weight:500;font-size:40px;letter-spacing:.02em}
  .tx{position:absolute;left:72px;right:170px;bottom:360px}
  .ed{display:flex;align-items:center;gap:22px;margin-bottom:34px;opacity:.9}.ed i{display:block;width:64px;height:1.5px;background:${CREME}}
  .tx h1{font-size:92px;line-height:1.0;text-shadow:0 2px 30px rgba(0,0,0,.35)}.tx h1.m{font-size:78px;line-height:1.02}.tx h1.p{font-size:66px;line-height:1.05}
  .tx em{color:#E9D9BF}
  .cred{position:absolute;left:72px;bottom:322px;font-size:18px;letter-spacing:.06em;opacity:.7}`,
  moldura: (r) => `<div class=gt></div><div class=gb></div><div class=top><div class=marca>Imobiliário Brasil</div></div><div class=cred>${esc(r.credito || '')}</div>`,
  cena: (c, i, n, r) => `<div class=top><span></span><div class=k style="opacity:.85">${dois(i + 1)} / ${dois(n)}</div></div><div class=tx><div class="ed k"><i></i>${esc(c.rotulo || r.editoria || 'Arquitetura')}</div><h1 class="serif ${tam(c.texto)}">${esc(c.texto)}</h1></div>`,
};

const fimHtml = `<div style="position:absolute;inset:0;background:${VERDE};color:${CREME}">
 <div style="position:absolute;left:72px;right:72px;top:118px;display:flex;justify-content:space-between;align-items:baseline"><div style="font-family:'Cormorant Garamond';font-weight:500;font-size:40px">Imobiliário Brasil</div><div class=k style="font-size:19px;opacity:.7">Todos os dias</div></div>
 <div style="position:absolute;left:72px;right:72px;top:178px;height:1px;background:${CREME};opacity:.5"></div>
 <div style="position:absolute;left:72px;right:150px;top:560px">
  <div class=k style="opacity:.7;margin-bottom:40px">Siga para mais</div>
  <h1 class=serif style="font-size:104px;line-height:1">Casas, arquitetura<br>e o mercado,<br><em>com bom gosto.</em></h1>
  <div style="margin-top:70px;display:inline-block;border:1.5px solid ${CREME};padding:22px 36px" class=k>@imobiliario.brasil</div>
 </div>
 <div class=k style="position:absolute;left:72px;bottom:360px;font-size:19px;opacity:.6">Salve · Compartilhe · Siga</div>
</div>`;

const tam = (t) => { const n = limpo(t).length; return n > 75 ? 'p' : n > 46 ? 'm' : ''; };

async function png(page, css, html, arq) {
  const f = arq.replace(/\.png$/, '.html');
  fs.writeFileSync(f, `<html><head><meta charset=utf-8><style>${css}</style></head><body>${html}</body></html>`);
  await page.goto('file://' + f, { waitUntil: 'networkidle', timeout: 90000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: arq, omitBackground: true });
  fs.unlinkSync(f);
}

async function reel(arq, saida) {
  const post = JSON.parse(fs.readFileSync(arq, 'utf8'));
  const r = post.roteiro;
  if (!r || !r.video || !(r.cenas || []).length) throw new Error('Reel sem roteiro (video e cenas)');
  const E = r.estilo === 'cinema' ? cinema : revista;
  const emJanela = E === revista;
  fs.mkdirSync(saida, { recursive: true });

  // 1. Vídeo de origem (Pixabay)
  const bruto = path.join(saida, 'bruto.mp4');
  if (/^https?:/.test(r.video)) {
    const resp = await fetch(r.video);
    if (!resp.ok) throw new Error(`Não baixou o vídeo (${resp.status})`);
    fs.writeFileSync(bruto, Buffer.from(await resp.arrayBuffer()));
  } else fs.copyFileSync(path.resolve(path.dirname(arq), r.video), bruto);

  // 2. Camadas: moldura fixa, uma por frase e a lâmina final
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const moldura = path.join(saida, 'moldura.png');
  await png(page, E.css, E.moldura(r), moldura);
  const camadas = [];
  for (let i = 0; i < r.cenas.length; i++) {
    const f = path.join(saida, `c${i}.png`);
    await png(page, E.css, E.cena(r.cenas[i], i, r.cenas.length, r), f);
    camadas.push(f);
  }
  const fim = path.join(saida, 'fim.png');
  await png(page, base, fimHtml, fim);
  await b.close();

  // 3. Montagem
  let t = 0;
  const tempos = r.cenas.map((c) => { const a = t; t += Number(c.seg) || 3.5; return [a, t]; });
  const total = t + FIM;
  const img = (f) => ['-loop', '1', '-t', String(total), '-framerate', '30', '-i', f];
  const ins = ['-ss', String(r.inicio || 0), '-stream_loop', '-1', '-i', bruto, ...img(moldura)];
  for (const c of camadas) ins.push(...img(c));
  ins.push(...img(fim), '-f', 'lavfi', '-t', String(total), '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100');

  // Leve zoom lento no vídeo (efeito "Ken Burns") para dar vida
  const zoom = `scale=iw*1.06:ih*1.06,crop=iw/1.06:ih/1.06:(iw-iw/1.06)/2*(1-t/${total}):(ih-ih/1.06)/2`;
  let fc;
  if (emJanela) {
    fc = `color=c=${CREME.slice(1)}:s=${W}x${H}:r=30:d=${total}[papel];` +
      `[0:v]scale=${JAN.w}:${JAN.h}:force_original_aspect_ratio=increase,crop=${JAN.w}:${JAN.h},${zoom},scale=${JAN.w}:${JAN.h},setsar=1,fps=30,trim=duration=${total},setpts=PTS-STARTPTS[vid];` +
      `[papel][vid]overlay=${JAN.x}:${JAN.y}[b0];[1:v]format=rgba[mo];[b0][mo]overlay=0:0:shortest=1[v0]`;
  } else {
    fc = `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},${zoom},scale=${W}:${H},setsar=1,fps=30,trim=duration=${total},setpts=PTS-STARTPTS[vid];` +
      `[1:v]format=rgba[mo];[vid][mo]overlay=0:0:shortest=1[v0]`;
  }
  let ult = 'v0';
  camadas.forEach((_, i) => {
    const [a, z] = tempos[i];
    const k = i + 2;
    fc += `;[${k}:v]format=rgba,fade=t=in:st=${a}:d=0.45:alpha=1,fade=t=out:st=${Math.max(a, z - 0.28)}:d=0.28:alpha=1[o${i}]`;
    // entra deslizando 36px para cima
    fc += `;[${ult}][o${i}]overlay=x=0:y='if(lt(t-${a},0.45),36*(1-(t-${a})/0.45),0)':enable='between(t,${a},${z})'[v${i + 1}]`;
    ult = `v${i + 1}`;
  });
  const nf = camadas.length + 2;
  fc += `;[${nf}:v]format=rgba,fade=t=in:st=${t}:d=0.5:alpha=1[of];[${ult}][of]overlay=0:0:enable='gte(t,${t})'[vf]`;
  const mp4 = path.join(saida, 'reel.mp4');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...ins, '-filter_complex', fc, '-map', '[vf]', '-map', `${nf + 1}:a`,
    '-t', String(total), '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-maxrate', '8M', '-bufsize', '16M',
    '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', mp4]);

  // 4. Capa: quadro com a primeira frase já parada
  const capa = path.join(saida, 'capa.jpg');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(Math.min(1.5, tempos[0][1] - 0.4)), '-i', mp4, '-frames:v', '1', '-q:v', '2', capa]);
  fs.unlinkSync(bruto);
  for (const c of [moldura, ...camadas, fim]) fs.unlinkSync(c);
  return { video: mp4, capa };
}

if (require.main === module) {
  reel(process.argv[2], process.argv[3] || 'saida-reel').then((x) => console.log(x.video + '\n' + x.capa)).catch((e) => { console.error(e); process.exit(1); });
}
module.exports = { reel };
