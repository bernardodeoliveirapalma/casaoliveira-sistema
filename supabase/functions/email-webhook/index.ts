// ============================================================
// Função "email-webhook" (Supabase Edge Function)
// O Brevo avisa aqui quando um e-mail foi aberto, clicado, voltou
// ou quando alguém pediu para sair. Quem pede para sair deixa de receber.
// Ao criar, DESLIGUE "Verify JWT" (o Brevo não tem login).
//
// Segredo (Edge Functions > Secrets):
//   EMAIL_WEBHOOK_TOKEN  uma senha longa inventada por vocês; vai no fim
//                        do endereço cadastrado no Brevo (?t=...)
// ============================================================
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const TOKEN = Deno.env.get('EMAIL_WEBHOOK_TOKEN') || '';
const ORDEM: Record<string, number> = { fila: 0, enviado: 1, aberto: 2, clicado: 3, falhou: 4 };
const STATUS: Record<string, string> = {
  opened: 'aberto', open: 'aberto', unique_opened: 'aberto', first_opening: 'aberto', proxy_open: 'aberto', loaded_by_proxy: 'aberto',
  click: 'clicado', clicked: 'clicado',
  hard_bounce: 'falhou', soft_bounce: 'falhou', blocked: 'falhou', invalid_email: 'falhou', invalid: 'falhou', error: 'falhou',
};
const SAIR = new Set(['unsubscribed', 'unsubscribe', 'spam', 'complaint', 'hard_bounce']);
// O Brevo manda os nomes de jeitos diferentes (hard_bounce, hardBounce, "Hard bounce"): deixa tudo igual
const nomeEvento = (e: unknown) => String(e || '').replace(/([a-z])([A-Z])/g, '$1_$2').replace(/[\s-]+/g, '_').toLowerCase();

function igual(a: string, b: string) {
  if (!a || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('ok', { status: 200 });
  const t = new globalThis.URL(req.url).searchParams.get('t') || '';
  if (!TOKEN || !igual(t, TOKEN)) return new Response('token', { status: 401 });
  try {
    const corpo = await req.json();
    for (const bruto of Array.isArray(corpo) ? corpo : [corpo]) {
      const ev = { ...(bruto?.data || {}), ...bruto };
      ev.event = nomeEvento(ev.event || ev.type || ev.eventType);
      ev.email = ev.email || ev.recipient || ev.to;
      console.log('evento', ev.event);
      const msg = String(ev['message-id'] || ev.messageId || ev.message_id || ev['Message-Id'] || '');
      const novo = STATUS[ev.event];
      if (msg && novo) {
        const { data: e } = await db.from('envios_email').select('id, status, cliente_id').eq('msg_id', msg).maybeSingle();
        if (e && (novo === 'falhou' || ORDEM[novo] > ORDEM[e.status])) {
          await db.from('envios_email').update({ status: novo, erro: novo === 'falhou' ? String(ev.reason || ev.event).slice(0, 300) : null, atualizado_em: new Date().toISOString() }).eq('id', e.id);
        }
      }
      if (SAIR.has(ev.event) && ev.email) {
        const { data: cs } = await db.from('clientes').select('id').ilike('email', String(ev.email)).eq('aceita_email', true);
        for (const c of cs || []) {
          await db.from('clientes').update({ aceita_email: false }).eq('id', c.id);
          const motivo = ev.event === 'spam' ? 'Marcou um e-mail nosso como spam. Paramos de enviar.'
            : ev.event === 'hard_bounce' ? 'O e-mail dele não existe mais (voltou). Paramos de enviar.'
            : 'Pediu para não receber mais e-mails.';
          await db.from('anotacoes').insert({ cliente_id: c.id, texto: motivo });
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
  return new Response('ok', { status: 200 });
});
