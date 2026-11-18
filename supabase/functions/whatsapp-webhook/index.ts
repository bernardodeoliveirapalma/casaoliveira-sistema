// ============================================================
// Função "whatsapp-webhook" (Supabase Edge Function)
// A Meta avisa aqui quando uma mensagem foi entregue ou lida,
// e quando alguém responde. Quem pede para sair deixa de receber.
// Ao criar, DESLIGUE "Enforce JWT verification" (a Meta não tem login).
//
// Segredos (Edge Functions > Secrets):
//   WA_VERIFY_TOKEN  uma palavra secreta qualquer, a mesma colocada na Meta
//   WA_APP_SECRET    "Chave secreta do app" (Meta > App > Configurações > Básico)
// ============================================================
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const VERIFY = Deno.env.get('WA_VERIFY_TOKEN') || '';
const SECRET = Deno.env.get('WA_APP_SECRET') || '';
const ORDEM: Record<string, number> = { fila: 0, enviado: 1, entregue: 2, lido: 3, falhou: 4 };
const STATUS: Record<string, string> = { sent: 'enviado', delivered: 'entregue', read: 'lido', failed: 'falhou' };
const SAIR = /^(sair|parar|pare|stop|cancelar|parar de receber|não quero|nao quero)\b/i;

async function assinaturaOk(corpo: string, assinatura: string | null) {
  if (!SECRET) return false;
  if (!assinatura || !assinatura.startsWith('sha256=')) return false;
  const chave = await crypto.subtle.importKey('raw', new TextEncoder().encode(SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', chave, new TextEncoder().encode(corpo)));
  const hex = Array.from(mac).map((b) => b.toString(16).padStart(2, '0')).join('');
  const esperado = assinatura.slice(7);
  if (hex.length !== esperado.length) return false;
  let dif = 0;
  for (let i = 0; i < hex.length; i++) dif |= hex.charCodeAt(i) ^ esperado.charCodeAt(i);
  return dif === 0;
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  if (req.method === 'GET') {
    if (url.searchParams.get('hub.mode') === 'subscribe' && VERIFY && url.searchParams.get('hub.verify_token') === VERIFY) {
      return new Response(url.searchParams.get('hub.challenge') || '', { status: 200 });
    }
    return new Response('nao', { status: 403 });
  }
  const corpo = await req.text();
  if (!(await assinaturaOk(corpo, req.headers.get('x-hub-signature-256')))) return new Response('assinatura', { status: 401 });

  try {
    const dados = JSON.parse(corpo);
    for (const entry of dados.entry || []) {
      for (const ch of entry.changes || []) {
        const v = ch.value || {};
        // 1. Entregue, lido, falhou
        for (const s of v.statuses || []) {
          const novo = STATUS[s.status]; if (!novo) continue;
          const { data: e } = await db.from('envios').select('id, status').eq('wa_id', s.id).maybeSingle();
          if (!e || ORDEM[novo] <= ORDEM[e.status] && novo !== 'falhou') continue;
          await db.from('envios').update({
            status: novo, erro: s.errors?.[0]?.title || null, atualizado_em: new Date().toISOString(),
          }).eq('id', e.id);
        }
        // 2. Respostas dos clientes
        for (const m of v.messages || []) {
          const texto = m.text?.body || m.button?.text || m.interactive?.button_reply?.title || '';
          const num = String(m.from || '').replace(/\D/g, '');
          const fim = num.slice(-8);
          const { data: cs } = await db.from('clientes').select('id, whatsapp').like('whatsapp', '%' + fim);
          const c = (cs || []).find((x: any) => String(x.whatsapp).replace(/\D/g, '').endsWith(fim));
          if (!c) continue;
          if (SAIR.test(texto.trim())) {
            await db.from('clientes').update({ aceita_whatsapp: false }).eq('id', c.id);
            await db.from('anotacoes').insert({ cliente_id: c.id, texto: 'Pediu para não receber mais comunicados pelo WhatsApp.' });
          } else if (texto) {
            await db.from('anotacoes').insert({ cliente_id: c.id, texto: 'Respondeu no WhatsApp dos comunicados: "' + texto.slice(0, 500) + '"' });
            await db.from('clientes').update({ lembrar_em: new Date().toISOString().slice(0, 10) }).eq('id', c.id);
          }
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
  return new Response('ok', { status: 200 });
});
