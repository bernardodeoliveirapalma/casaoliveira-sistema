// ============================================================
// Robô de publicação do Imobiliário Brasil.
// Roda no GitHub (publicar-instagram.yml). Para cada post da pasta
// conteudo/fila (em ordem de nome), desenha as lâminas, manda para a
// função "publicar" do Supabase e move o arquivo para conteudo/publicados.
// Para pausar tudo: crie o arquivo conteudo/PAUSAR.
// ============================================================
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const render = (...a) => require('./render').render(...a);

const FUNCAO = 'https://ejyyarsxwpbwntbqewed.supabase.co/functions/v1/publicar';
const FILA = path.join(__dirname, 'fila');
const FEITOS = path.join(__dirname, 'publicados');

async function cracha() {
  const u = process.env.ACTIONS_ID_TOKEN_REQUEST_URL, t = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
  if (!u || !t) throw new Error('Sem crachá do GitHub (id-token: write)');
  const r = await fetch(`${u}&audience=casaoliveira-publicar`, { headers: { Authorization: `bearer ${t}` } });
  return (await r.json()).value;
}

async function chamar(campos, arquivos = []) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(campos)) fd.append(k, v);
  for (const [k, f] of arquivos) {
    const tipo = f.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg';
    fd.append(k, new Blob([fs.readFileSync(f)], { type: tipo }), path.basename(f));
  }
  const r = await fetch(FUNCAO, { method: 'POST', headers: { Authorization: `Bearer ${await cracha()}` }, body: fd });
  const j = await r.json().catch(() => ({}));
  if (r.status >= 400) throw new Error(j.erro || `Erro ${r.status}`);
  return { status: r.status, ...j };
}

const resumo = (s) => { console.log(s); if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, s + '\n'); };

(async () => {
  if (process.env.SO_TESTAR === 'true') {
    const c = await chamar({ acao: 'conta' });
    resumo(`✅ Conexão ok com o Instagram @${c.conta}. Nada foi publicado.`);
    resumo(`\nPosts na conta (${(c.posts || []).length}), do mais novo ao mais antigo:`);
    for (const p of c.posts || []) resumo(`- ${p.quando} · ${p.titulo} · ${p.link}`);
    return;
  }
  if (fs.existsSync(path.join(__dirname, 'PAUSAR'))) return resumo('Publicação pausada (existe conteudo/PAUSAR).');
  const conta = await chamar({ acao: 'conta' });
  resumo(`## Instagram @${conta.conta}`);
  const agora = Date.now();
  const fila = fs.readdirSync(FILA).filter((f) => f.endsWith('.json')).sort();
  let falhas = 0;
  for (const nome of fila) {
    const arq = path.join(FILA, nome);
    const post = JSON.parse(fs.readFileSync(arq, 'utf8'));
    if (post.quando && new Date(post.quando).getTime() > agora) { resumo(`- ${post.titulo}: agendado para ${post.quando}`); continue; }
    try {
      let arquivos, campos = { acao: 'preparar', tipo: post.tipo, legenda: post.legenda };
      if (post.tipo === 'reel') {
        arquivos = [['arquivo', path.resolve(FILA, post.video)]];
        if (post.capa) arquivos.push(['capa', path.resolve(FILA, post.capa)]);
      } else {
        const imgs = await render(arq, path.join('/tmp/laminas', nome.replace('.json', '')));
        arquivos = imgs.map((f) => ['arquivo', f]);
      }
      let prep;
      for (let t = 1; t <= 3; t++) {
        try { prep = await chamar(campos, arquivos); break; } catch (e) {
          // O Instagram às vezes não consegue baixar a imagem na primeira vez; tenta de novo.
          if (t === 3) throw e;
          console.log(`Tentativa ${t} falhou (${e.message}). Tentando de novo em 30s.`);
          await new Promise((r) => setTimeout(r, 30000));
        }
      }
      let pub = prep.ja ? { ok: true, link: prep.link, media_id: prep.media_id } : null;
      if (pub) resumo(`- ${post.titulo}: já estava no Instagram, não publiquei de novo`);
      for (let i = 0; i < 20 && !pub; i++) {
        try {
          pub = await chamar({ acao: 'publicar', criacao: prep.criacao, arquivos: prep.arquivos.join(','), tipo: post.tipo, titulo: post.titulo, legenda: post.legenda });
        } catch (e) {
          // Erro ou demora do Instagram: tenta de novo. A função confere se já publicou, então não repete.
          if (i >= 5) throw e;
          console.log(`Publicar falhou (${e.message}). Tentando de novo em 15s.`);
          pub = { ok: false };
        }
        if (pub.ok) break;
        pub = null;
        await new Promise((r) => setTimeout(r, 15000));
      }
      if (!pub) throw new Error('O Instagram não terminou de processar a tempo');
      fs.mkdirSync(FEITOS, { recursive: true });
      post.publicado = { em: new Date().toISOString(), link: pub.link, media_id: pub.media_id };
      fs.writeFileSync(path.join(FEITOS, nome), JSON.stringify(post, null, 1));
      fs.unlinkSync(arq);
      execSync(`git add -A conteudo && git commit -qm "Publicado: ${post.titulo.replace(/"/g, '')}" && git push -q`, { stdio: 'inherit' });
      resumo(`- ✅ ${post.titulo}: ${pub.link || pub.media_id}`);
      await new Promise((r) => setTimeout(r, 20000));
    } catch (e) {
      falhas++;
      resumo(`- ❌ ${post.titulo}: ${e.message}`);
      break; // mantém a ordem da grade: para no primeiro erro
    }
  }
  if (falhas) process.exit(1);
})().catch((e) => { resumo('❌ ' + e.message); process.exit(1); });
