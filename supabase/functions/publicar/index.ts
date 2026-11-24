// ============================================================
// Função "publicar" (Supabase Edge Function)
// Publica no Instagram do Imobiliário Brasil (@imobiliario.brasil)
// pela API oficial do Instagram. Quem chama é o robô do GitHub
// (arquivo .github/workflows/publicar-instagram.yml), que se
// identifica com o crachá oficial do GitHub (OIDC). Nenhum outro
// site ou pessoa consegue publicar por aqui.
// Ao criar, DESLIGUE "Verify JWT".
//
// Segredo (Edge Functions > Secrets):
//   IG_TOKEN   chave do "usuário do sistema" do portfólio Imobiliário
//              Brasil no Meta Business (não vence). Se um dia trocar,
//              basta atualizar o segredo. SQL 13 cria gaveta e histórico.
//
// Passos (campo "acao" no formulário):
//   conta      confere a conexão e devolve o @ da conta
//   preparar   recebe as imagens (ou o vídeo), guarda na gaveta
//              "conteudo" e cria o post no Instagram, ainda sem publicar
//   publicar   publica o que foi preparado e apaga os arquivos da gaveta
// ============================================================
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';
import { createRemoteJWKSet, jwtVerify } from 'npm:jose@5.9.6';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const REPO = 'bernardodeoliveirapalma/casaoliveira-sistema';
const IG = 'https://graph.facebook.com/v21.0';
const IG_ID = '17841437643215213'; // @imobiliario.brasil (portfólio Imobiliário Brasil · Mercado e Casas)
const GAVETA = 'conteudo';
const JWKS = createRemoteJWKSet(new URL('https://token.actions.githubusercontent.com/.well-known/jwks'));
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

async function autorizado(req: Request) {
  const t = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!t) return false;
  try {
    const { payload } = await jwtVerify(t, JWKS, {
      issuer: 'https://token.actions.githubusercontent.com',
      audience: 'casaoliveira-publicar',
    });
    return payload.repository === REPO;
  } catch {
    return false;
  }
}

async function chave(): Promise<string> {
  const token = Deno.env.get('IG_TOKEN') || '';
  if (!token) throw new Error('Chave do Instagram (IG_TOKEN) não cadastrada');
  return token;
}

async function ig(path: string, token: string, params: Record<string, string> = {}, metodo = 'POST') {
  const q = new URLSearchParams({ ...params, access_token: token });
  const r = metodo === 'GET' ? await fetch(`${IG}${path}?${q}`) : await fetch(`${IG}${path}`, { method: 'POST', body: q });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(`Instagram: ${j.error?.message || r.status}`);
  return j;
}

// Procura nos posts recentes da conta um com a mesma legenda (evita postar duas vezes).
const inicio = (t: string) => t.replace(/\s+/g, ' ').trim().slice(0, 120);
async function jaPublicado(uid: string, token: string, legenda: string) {
  if (!legenda.trim()) return null;
  const r = await ig(`/${uid}/media`, token, { fields: 'id,caption,permalink', limit: '30' }, 'GET');
  return (r.data || []).find((m: { caption?: string }) => m.caption && inicio(m.caption) === inicio(legenda)) || null;
}

// O Instagram às vezes falha ao baixar uma imagem recém-enviada; espera e tenta de novo.
async function criar(uid: string, token: string, params: Record<string, string>) {
  for (let t = 1; ; t++) {
    try {
      return (await ig(`/${uid}/media`, token, params)).id as string;
    } catch (e) {
      if (t >= 4) throw new Error(`${(e as Error).message} [${params.is_carousel_item ? 'lâmina ' + params.image_url.split('/').pop() : params.media_type || 'post'}]`);
      await new Promise((r) => setTimeout(r, 6000 * t));
    }
  }
}

async function guardar(f: File, pasta: string, i: number) {
  const ext = (f.type.includes('mp4') || f.name.endsWith('.mp4')) ? 'mp4' : 'jpg';
  const caminho = `${pasta}/${String(i).padStart(2, '0')}.${ext}`;
  const { error } = await db.storage.from(GAVETA).upload(caminho, f, {
    contentType: ext === 'mp4' ? 'video/mp4' : 'image/jpeg', upsert: true,
  });
  if (error) throw new Error('Não guardou o arquivo: ' + error.message);
  return { caminho, url: db.storage.from(GAVETA).getPublicUrl(caminho).data.publicUrl };
}

async function esperar(id: string, token: string, segundos: number) {
  const fim = Date.now() + segundos * 1000;
  while (Date.now() < fim) {
    const s = await ig(`/${id}`, token, { fields: 'status_code' }, 'GET');
    if (s.status_code === 'FINISHED') return 'FINISHED';
    if (s.status_code === 'ERROR' || s.status_code === 'EXPIRED') throw new Error('Instagram recusou o arquivo: ' + s.status_code);
    await new Promise((r) => setTimeout(r, 3000));
  }
  return 'IN_PROGRESS';
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ erro: 'Use POST' }, 405);
  if (!(await autorizado(req))) return json({ erro: 'Não autorizado' }, 401);
  try {
    const form = await req.formData();
    const acao = String(form.get('acao') || '');
    const token = await chave();
    const eu = await ig(`/${IG_ID}`, token, { fields: 'username' }, 'GET');
    const uid = IG_ID;

    if (acao === 'conta') {
      const r = await ig(`/${uid}/media`, token, { fields: 'id,caption,permalink,timestamp', limit: '30' }, 'GET');
      const posts = (r.data || []).map((m: { caption?: string; permalink?: string; timestamp?: string }) =>
        ({ quando: m.timestamp, link: m.permalink, titulo: (m.caption || '').split('\n')[0].slice(0, 70) }));
      return json({ ok: true, conta: eu.username, posts });
    }

    if (acao === 'preparar') {
      const tipo = String(form.get('tipo') || 'carrossel');
      const legenda = String(form.get('legenda') || '');
      const antes = await jaPublicado(uid, token, legenda);
      if (antes) return json({ ok: true, ja: true, media_id: antes.id, link: antes.permalink || '' });
      const pasta = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID().slice(0, 8)}`;
      const arquivos = form.getAll('arquivo').filter((x) => x instanceof File) as File[];
      if (!arquivos.length) return json({ erro: 'Nenhum arquivo enviado' }, 400);
      const salvos = [];
      for (let i = 0; i < arquivos.length; i++) salvos.push(await guardar(arquivos[i], pasta, i + 1));
      await new Promise((r) => setTimeout(r, 3000)); // dá tempo do arquivo ficar disponível
      let criacao: string;
      if (tipo === 'reel') {
        const capa = form.get('capa');
        const c = capa instanceof File ? await guardar(capa, pasta, 0) : null;
        if (c) salvos.push(c);
        const p: Record<string, string> = { media_type: 'REELS', video_url: salvos[0].url, caption: legenda, share_to_feed: 'true' };
        if (c) p.cover_url = c.url;
        criacao = await criar(uid, token, p);
      } else if (salvos.length === 1) {
        criacao = await criar(uid, token, { image_url: salvos[0].url, caption: legenda });
      } else {
        const filhos = [];
        for (const s of salvos.slice(0, 10)) {
          filhos.push(await criar(uid, token, { image_url: s.url, is_carousel_item: 'true' }));
        }
        criacao = await criar(uid, token, { media_type: 'CAROUSEL', children: filhos.join(','), caption: legenda });
      }
      const status = await esperar(criacao, token, tipo === 'reel' ? 20 : 60);
      return json({ ok: true, criacao, status, arquivos: salvos.map((s) => s.caminho) });
    }

    if (acao === 'publicar') {
      const criacao = String(form.get('criacao') || '');
      const status = await esperar(criacao, token, 90);
      if (status !== 'FINISHED') return json({ ok: false, status: 'IN_PROGRESS' }, 202);
      let pub: { id: string };
      try {
        pub = await ig(`/${uid}/media_publish`, token, { creation_id: criacao });
      } catch (e) {
        // Às vezes o Instagram publica e mesmo assim responde com erro. Confere antes de desistir.
        await new Promise((r) => setTimeout(r, 15000));
        const achado = await jaPublicado(uid, token, String(form.get('legenda') || ''));
        if (!achado) throw e;
        pub = { id: achado.id };
      }
      let link = '';
      try { link = (await ig(`/${pub.id}`, token, { fields: 'permalink' }, 'GET')).permalink || ''; } catch { /* sem link */ }
      const arquivos = String(form.get('arquivos') || '').split(',').filter(Boolean);
      if (arquivos.length) await db.storage.from(GAVETA).remove(arquivos);
      await db.from('publicacoes').insert({
        tipo: String(form.get('tipo') || ''), titulo: String(form.get('titulo') || ''),
        legenda: String(form.get('legenda') || ''), media_id: pub.id, link, origem: 'github',
      });
      return json({ ok: true, media_id: pub.id, link });
    }
    return json({ erro: 'Ação desconhecida' }, 400);
  } catch (e) {
    return json({ erro: String((e as Error).message || e) }, 500);
  }
});
