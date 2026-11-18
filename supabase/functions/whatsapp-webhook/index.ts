// ============================================================
// Função "whatsapp-webhook" (Supabase Edge Function)
// A YCloud avisa aqui quando uma mensagem foi entregue ou lida,
// e quando alguém responde. Quem pede para sair deixa de receber.
// Ao criar, DESLIGUE "Enforce JWT verification" (a YCloud não tem login).
//
// Segredo (Edge Functions > Secrets):
//   YCLOUD_WEBHOOK_SECRET  o "secret" (whsec_...) do endpoint criado na YCloud
// ============================================================
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const SECRET = Deno.env.get('YCLOUD_WEBHOOK_SECRET') || '';
const ORDEM: Record<string, number> = { fila: 0, enviado: 1, entregue: 2, lido: 3, falhou: 4 };
const STATUS: Record<string, string> = { sent: 'enviado', delivered: 'entregue', read: 'lido', failed: 'falhou' };
const SAIR = /^(sair|parar|pare|stop|cancelar|parar de receber|não quero|nao quero)\b/i;

async function assinaturaOk(corpo: string, cabecalho: string | null) {
  if (!SECRET || !cabecalho) return false;
  const partes = Object.fromEntries(cabecalho.split(',').map((p) => p.trim().split('=') as [string, string]));
  const t = partes.t, s = partes.s;
  if (!t || !s) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const chave = await crypto.subtle.importKey('raw', new TextEncoder().encode(SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', chave, new TextEncoder().encode(t + '.' + corpo)));
  const hex = Array.from(mac).map((b) => b.toString(16).padStart(2, '0')).join('');
  if (hex.length !== s.length) return false;
  let dif = 0;
  for (let i = 0; i < hex.length; i++) dif |= hex.charCodeAt(i) ^ s.charCodeAt(i);
  return dif === 0;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('ok', { status: 200 });
  const corpo = await req.text();
  if (!(await assinaturaOk(corpo, req.headers.get('ycloud-signature')))) return new Response('assinatura', { status: 401 });

  try {
    const ev = JSON.parse(corpo);
    // 1. Entregue, lido, falhou
    if (ev.type === 'whatsapp.message.updated' && ev.whatsappMessage) {
      const m = ev.whatsappMessage, novo = STATUS[m.status];
      if (novo) {
        const { data: e } = await db.from('envios').select('id, status').eq('wa_id', m.id).maybeSingle();
        if (e && (novo === 'falhou' || ORDEM[novo] > ORDEM[e.status])) {
          await db.from('envios').update({ status: novo, erro: m.errorMessage || null, atualizado_em: new Date().toISOString() }).eq('id', e.id);
        }
      }
    }
    // 2. Respostas dos clientes
    if (ev.type === 'whatsapp.inbound_message.received' && ev.whatsappInboundMessage) {
      const m = ev.whatsappInboundMessage;
      const texto = m.text?.body || m.button?.text || m.interactive?.button_reply?.title || '';
      const fim = String(m.from || '').replace(/\D/g, '').slice(-8);
      if (fim) {
        const { data: cs } = await db.from('clientes').select('id, whatsapp').like('whatsapp', '%' + fim);
        const c = (cs || []).find((x: any) => String(x.whatsapp).replace(/\D/g, '').endsWith(fim));
        if (c && SAIR.test(texto.trim())) {
          await db.from('clientes').update({ aceita_whatsapp: false }).eq('id', c.id);
          await db.from('anotacoes').insert({ cliente_id: c.id, texto: 'Pediu para não receber mais comunicados pelo WhatsApp.' });
        } else if (c && texto && m.context?.id) {
          // só anota respostas a um comunicado (conversas normais ficam no app)
          await db.from('anotacoes').insert({ cliente_id: c.id, texto: 'Respondeu a um comunicado: "' + texto.slice(0, 500) + '"' });
          await db.from('clientes').update({ lembrar_em: new Date().toISOString().slice(0, 10) }).eq('id', c.id);
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
  return new Response('ok', { status: 200 });
});
