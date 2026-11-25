// ============================================================
// Função "videos" (Supabase Edge Function)
// Busca vídeos livres no Pixabay para os reels do Imobiliário Brasil.
// A chave fica no Supabase (segredo PIXABAY_KEY), nunca no código.
// Ao criar, DESLIGUE "Verify JWT".
//
// Buscar: GET /functions/v1/videos?q=modern%20house&pagina=1
// Devolve os vídeos com o link do arquivo em melhor qualidade,
// duração, tamanho e o crédito ("Vídeo: Nome / Pixabay").
// Regras do Pixabay: não guardar os links por mais de 24h
// (baixamos o arquivo na hora de montar o reel).
// ============================================================
const KEY = Deno.env.get('PIXABAY_KEY') || '';
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Content-Type': 'application/json; charset=utf-8',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: cors });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (!KEY) return json({ erro: 'Segredo PIXABAY_KEY não cadastrado' }, 500);
  const u = new URL(req.url);
  const q = (u.searchParams.get('q') || '').slice(0, 100);
  if (!q) return json({ erro: 'Informe ?q= com o que buscar' }, 400);
  const pagina = Math.min(Math.max(parseInt(u.searchParams.get('pagina') || '1') || 1, 1), 20);
  try {
    const r = await fetch(`https://pixabay.com/api/videos/?key=${KEY}&q=${encodeURIComponent(q)}` +
      `&per_page=20&page=${pagina}&safesearch=true&video_type=film`);
    if (!r.ok) return json({ erro: `Pixabay respondeu ${r.status}` }, 502);
    const d = await r.json();
    const videos = (d.hits || []).map((v: any) => {
      const melhor = v.videos?.large?.url ? v.videos.large : v.videos?.medium;
      return {
        id: v.id,
        duracao: v.duration,
        largura: melhor?.width,
        altura: melhor?.height,
        arquivo: melhor?.url,
        previa: v.videos?.tiny?.url || v.videos?.small?.url,
        miniatura: melhor?.thumbnail,
        tags: v.tags,
        pagina: v.pageURL,
        autor: v.user,
        credito: `Vídeo: ${v.user} / Pixabay`,
      };
    }).filter((v: any) => v.arquivo);
    return json({ ok: true, total: d.totalHits, videos, restantes: r.headers.get('x-ratelimit-remaining') });
  } catch (e) {
    return json({ erro: String((e as Error).message || e) }, 500);
  }
});
