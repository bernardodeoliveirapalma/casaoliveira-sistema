// ============================================================
// Função "fotos" (Supabase Edge Function)
// Busca fotos no Unsplash para a máquina de conteúdo do
// Imobiliário Brasil. A chave fica guardada no Supabase
// (segredo UNSPLASH_ACCESS_KEY) e nunca aparece no código.
// Ao criar, DESLIGUE "Verify JWT".
//
// Buscar:  GET /functions/v1/fotos?q=casa%20moderna&orientacao=portrait&pagina=1
// Usar:    GET /functions/v1/fotos?usar=<id da foto>
//          (avisa o Unsplash que a foto foi usada, regra deles)
// ============================================================
const KEY = Deno.env.get('UNSPLASH_ACCESS_KEY') || '';
const API = 'https://api.unsplash.com';
const UTM = 'utm_source=imobiliario_brasil&utm_medium=referral';
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Content-Type': 'application/json; charset=utf-8',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: cors });

async function unsplash(path: string) {
  const r = await fetch(API + path, { headers: { Authorization: `Client-ID ${KEY}`, 'Accept-Version': 'v1' } });
  const restantes = r.headers.get('x-ratelimit-remaining');
  if (!r.ok) throw new Error(`Unsplash respondeu ${r.status}`);
  return { dados: await r.json(), restantes };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (!KEY) return json({ erro: 'Segredo UNSPLASH_ACCESS_KEY não cadastrado' }, 500);
  const u = new URL(req.url);
  try {
    const usar = u.searchParams.get('usar');
    if (usar) {
      const id = usar.replace(/[^A-Za-z0-9_-]/g, '');
      const { restantes } = await unsplash(`/photos/${id}/download`);
      return json({ ok: true, restantes });
    }
    const q = (u.searchParams.get('q') || '').slice(0, 100);
    if (!q) return json({ erro: 'Informe ?q= com o que buscar' }, 400);
    const ori = ['landscape', 'portrait', 'squarish'].includes(u.searchParams.get('orientacao') || '')
      ? `&orientation=${u.searchParams.get('orientacao')}` : '';
    const pagina = Math.min(Math.max(parseInt(u.searchParams.get('pagina') || '1') || 1, 1), 20);
    const { dados, restantes } = await unsplash(
      `/search/photos?query=${encodeURIComponent(q)}&per_page=20&page=${pagina}&content_filter=high${ori}`);
    const fotos = (dados.results || []).map((f: any) => ({
      id: f.id,
      largura: f.width,
      altura: f.height,
      cor: f.color,
      descricao: f.alt_description || f.description || '',
      original: f.urls?.raw,
      grande: f.urls?.full,
      previa: f.urls?.small,
      pagina: `${f.links?.html}?${UTM}`,
      fotografo: f.user?.name,
      perfil: `${f.user?.links?.html}?${UTM}`,
      credito: `Foto: ${f.user?.name} / Unsplash`,
    }));
    return json({ total: dados.total, pagina, restantes, fotos });
  } catch (e) {
    return json({ erro: String((e as Error).message || e) }, 502);
  }
});
