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
//   IG_TOKEN   chave de publicação gerada no painel da Meta
//              (depois a função renova sozinha e guarda na tabela
//              instagram_token; precisa do SQL 13).
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
const IG = 'https://graph.instagram.com/v21.0';
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
  const { data } = await db.from('instagram_token').select('token, renovado_em').eq('id', 1).maybeSingle();
  let token = data?.token || Deno.env.get('IG_TOKEN') || '';
  if (!token) throw new Error('Chave do Instagram (IG_TOKEN) não cadastrada');
  const dias = data ? (Date.now() - new Date(data.renovado_em).getTime()) / 864e5 : 999;
  if (dias > 7) {
    // A chave vale 60 dias; renovando toda semana ela nunca vence.
    try {
      const r = await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`);
      const j = await r.json();
      if (j.access_token) {
        token = j.access_token;
        await db.from('instagram_token').upsert({ id: 1, token, renovado_em: new Date().toISOString() });
      } else if (!data) {
        await db.from('instagram_token').upsert({ id: 1, token, renovado_em: new Date().toISOString() });
      }
    } catch { /* tenta de novo na próxima */ }
  }
  return token;
}

async function ig(path: string, token: string, params: Record<string, string> = {}, metodo = 'POST') {
  const q = new URLSearchParams({ ...params, access_token: token });
  const r = metodo === 'GET' ? await fetch(`${IG}${path}?${q}`) : await fetch(`${IG}${path}`, { method: 'POST', body: q });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(`Instagram: ${j.error?.message || r.status}`);
  return j;
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
    const eu = await ig('/me', token, { fields: 'user_id,username' }, 'GET');
    const uid = eu.user_id || eu.id;

    if (acao === 'conta') return json({ ok: true, conta: eu.username });

    if (acao === 'preparar') {
      const tipo = String(form.get('tipo') || 'carrossel');
      const legenda = String(form.get('legenda') || '');
      const pasta = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID().slice(0, 8)}`;
      const arquivos = form.getAll('arquivo').filter((x) => x instanceof File) as File[];
      if (!arquivos.length) return json({ erro: 'Nenhum arquivo enviado' }, 400);
      const salvos = [];
      for (let i = 0; i < arquivos.length; i++) salvos.push(await guardar(arquivos[i], pasta, i + 1));
      let criacao: string;
      if (tipo === 'reel') {
        const capa = form.get('capa');
        const c = capa instanceof File ? await guardar(capa, pasta, 0) : null;
        if (c) salvos.push(c);
        const p: Record<string, string> = { media_type: 'REELS', video_url: salvos[0].url, caption: legenda, share_to_feed: 'true' };
        if (c) p.cover_url = c.url;
        criacao = (await ig(`/${uid}/media`, token, p)).id;
      } else if (salvos.length === 1) {
        criacao = (await ig(`/${uid}/media`, token, { image_url: salvos[0].url, caption: legenda })).id;
      } else {
        const filhos = [];
        for (const s of salvos.slice(0, 10)) {
          filhos.push((await ig(`/${uid}/media`, token, { image_url: s.url, is_carousel_item: 'true' })).id);
        }
        criacao = (await ig(`/${uid}/media`, token, { media_type: 'CAROUSEL', children: filhos.join(','), caption: legenda })).id;
      }
      const status = await esperar(criacao, token, tipo === 'reel' ? 20 : 60);
      return json({ ok: true, criacao, status, arquivos: salvos.map((s) => s.caminho) });
    }

    if (acao === 'publicar') {
      const criacao = String(form.get('criacao') || '');
      const status = await esperar(criacao, token, 90);
      if (status !== 'FINISHED') return json({ ok: false, status: 'IN_PROGRESS' }, 202);
      const pub = await ig(`/${uid}/media_publish`, token, { creation_id: criacao });
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
