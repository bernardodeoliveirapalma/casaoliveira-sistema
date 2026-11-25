// ============================================================
// Monta um reel do Imobiliário Brasil a partir de um vídeo livre
// (Pixabay) e de um roteiro de frases curtas.
// Uso: node conteudo/reel.js conteudo/fila/<post>.json <pasta-de-saída>
// Gera reel.mp4 (1080x1920, H.264, ~10-15s) e capa.jpg.
//
// No JSON do post:
//  "tipo": "reel",
//  "roteiro": {
//    "video": "<link do arquivo do Pixabay>",
//    "inicio": 0,                      (segundo do vídeo onde começa)
//    "credito": "Vídeo: Nome / Pixabay",
//    "cenas": [ { "texto": "Gancho forte", "seg": 3 },
//               { "rotulo": "Mercado", "texto": "Frase 2", "seg": 3.5 }, ... ]
//  }
// A última cena é seguida de 2,5s de lâmina final verde (Siga @imobiliario.brasil).
// ============================================================
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const W = 1080, H = 1920, FIM = 2.5;
const css = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Jost:wght@300;400&display=block');
*{margin:0;box-sizing:border-box}html,body{background:transparent}
body{width:${W}px;height:${H}px;position:relative;overflow:hidden;font-family:Jost;font-weight:300;color:#F2F0EB}
.g{position:absolute;left:0;right:0;top:400px;height:1000px;background:radial-gradient(ellipse at center,rgba(17,20,14,.62) 0%,rgba(17,20,14,.35) 45%,rgba(17,20,14,0) 72%)}
.t{position:absolute;left:90px;right:90px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding-bottom:120px}
.lbl{font-weight:400;font-size:26px;letter-spacing:.24em;text-transform:uppercase;opacity:.85;margin-bottom:28px}
h1{font-family:'Cormorant Garamond';font-weight:500;font-size:96px;line-height:1.05;text-shadow:0 2px 24px rgba(0,0,0,.35)}
h1.m{font-size:78px}h1.p{font-size:66px}
.mark{position:absolute;top:150px;left:0;right:0;text-align:center;font-family:'Cormorant Garamond';font-size:40px;letter-spacing:.05em;text-shadow:0 1px 12px rgba(0,0,0,.4)}
.cred{position:absolute;left:0;right:0;bottom:330px;text-align:center;font-size:20px;opacity:.75;letter-spacing:.04em;text-shadow:0 0 8px rgba(0,0,0,.6)}
.fim{position:absolute;inset:0;background:#111F0E;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}
.fim h1{font-size:92px}.fim p{font-size:34px;line-height:1.5;opacity:.85;margin:26px 120px 0}
.fim .s{font-weight:400;font-size:26px;letter-spacing:.22em;text-transform:uppercase;margin-top:70px;opacity:.9}`;

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>');
const tam = (t) => (t.length > 70 ? 'p' : t.length > 40 ? 'm' : '');

async function png(page, html, arq) {
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
  fs.mkdirSync(saida, { recursive: true });

  // 1. Baixa o vídeo do Pixabay
  const bruto = path.join(saida, 'bruto.mp4');
  if (/^https?:/.test(r.video)) {
    const resp = await fetch(r.video);
    if (!resp.ok) throw new Error(`Não baixou o vídeo (${resp.status})`);
    fs.writeFileSync(bruto, Buffer.from(await resp.arrayBuffer()));
  } else fs.copyFileSync(path.resolve(path.dirname(arq), r.video), bruto);

  // 2. Desenha as camadas de texto (PNG transparente)
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const camadas = [];
  for (let i = 0; i < r.cenas.length; i++) {
    const c = r.cenas[i];
    const f = path.join(saida, `c${i}.png`);
    await png(page, `<div class=g></div>${i === 0 ? '<div class=mark>Imobiliário Brasil</div>' : ''}<div class=t>${c.rotulo ? `<div class=lbl>${esc(c.rotulo)}</div>` : ''}<h1 class="${tam(c.texto)}">${esc(c.texto)}</h1></div><div class=cred>${esc(r.credito || '')}</div>`, f);
    camadas.push(f);
  }
  const fim = path.join(saida, 'fim.png');
  await png(page, `<div class=fim><h1>Imobiliário Brasil</h1><p>Casas, arquitetura e o mercado imobiliário, todos os dias.</p><div class=s>Salve · Compartilhe · Siga @imobiliario.brasil</div></div>`, fim);
  await b.close();

  // 3. Monta o vídeo: corta em 9:16, coloca cada frase no seu tempo e a lâmina final
  let t = 0;
  const tempos = r.cenas.map((c) => { const a = t; t += Number(c.seg) || 3; return [a, t]; });
  const total = t + FIM;
  const ins = ['-ss', String(r.inicio || 0), '-stream_loop', '-1', '-i', bruto];
  for (const c of camadas) ins.push('-loop', '1', '-t', String(total), '-framerate', '30', '-i', c);
  ins.push('-loop', '1', '-t', String(total), '-framerate', '30', '-i', fim);
  ins.push('-f', 'lavfi', '-t', String(total), '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100');
  let fc = `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,fps=30,trim=duration=${total},setpts=PTS-STARTPTS[v0]`;
  let ult = 'v0';
  camadas.forEach((_, i) => {
    const [a, z] = tempos[i];
    fc += `;[${i + 1}:v]format=rgba,fade=t=in:st=${a}:d=0.35:alpha=1,fade=t=out:st=${Math.max(a, z - 0.3)}:d=0.3:alpha=1[o${i}]`;
    fc += `;[${ult}][o${i}]overlay=0:0:enable='between(t,${a},${z})'[v${i + 1}]`;
    ult = `v${i + 1}`;
  });
  const nf = camadas.length + 1;
  fc += `;[${nf}:v]format=rgba,fade=t=in:st=${t}:d=0.5:alpha=1[of];[${ult}][of]overlay=0:0:enable='gte(t,${t})'[vf]`;
  const mp4 = path.join(saida, 'reel.mp4');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...ins, '-filter_complex', fc, '-map', '[vf]', '-map', `${nf + 1}:a`,
    '-t', String(total), '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-maxrate', '7M', '-bufsize', '14M',
    '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', mp4]);

  // 4. Capa: quadro da primeira frase
  const capa = path.join(saida, 'capa.jpg');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(Math.min(1.2, tempos[0][1] - 0.2)), '-i', mp4, '-frames:v', '1', '-q:v', '2', capa]);
  fs.unlinkSync(bruto);
  for (const c of [...camadas, fim]) fs.unlinkSync(c);
  return { video: mp4, capa };
}

if (require.main === module) {
  reel(process.argv[2], process.argv[3] || 'saida-reel').then((x) => console.log(x.video + '\n' + x.capa)).catch((e) => { console.error(e); process.exit(1); });
}
module.exports = { reel };
