// ============================================================
// Função "comunicados" (Supabase Edge Function)
// Fala com a API oficial do WhatsApp (Meta) em nome do painel.
// Só a equipe (Ane e Bernardo) consegue chamar.
//
// Segredos (Edge Functions > Secrets):
//   WA_TOKEN      token permanente do usuário do sistema na Meta
//   WA_PHONE_ID   ID do número de telefone (WhatsApp Manager)
//   WA_WABA_ID    ID da conta do WhatsApp Business
//   WA_API        versão da API, opcional (padrão v23.0)
// ============================================================
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const URL = Deno.env.get('SUPABASE_URL')!;
const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TOKEN = Deno.env.get('WA_TOKEN') || '';
const PHONE = Deno.env.get('WA_PHONE_ID') || '';
const WABA = Deno.env.get('WA_WABA_ID') || '';
const API = 'https://graph.facebook.com/' + (Deno.env.get('WA_API') || 'v23.0');

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

async function meta(path: string, init: RequestInit = {}) {
  const r = await fetch(API + path, {
    ...init,
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const corpo = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(corpo?.error?.error_user_msg || corpo?.error?.message || 'Erro ' + r.status);
  return corpo;
}

function primeiroNome(n: string | null) {
  const p = String(n || '').replace(/\s*\(.*\)\s*/, '').trim().split(' ')[0];
  return p ? p[0].toUpperCase() + p.slice(1).toLowerCase() : 'tudo bem';
}

async function enviarComunicado(db: ReturnType<typeof createClient>, id: string) {
  const { data: c } = await db.from('comunicados').select('*, modelos(*)').eq('id', id).single();
  if (!c || !c.modelos) throw new Error('Comunicado sem modelo');
  await db.from('comunicados').update({ status: 'Enviando' }).eq('id', id);
  const m = c.modelos;
  let falhas = 0;
  while (true) {
    const { data: lote } = await db.from('envios').select('*').eq('comunicado_id', id).eq('status', 'fila').limit(20);
    if (!lote || !lote.length) break;
    await Promise.all(lote.map(async (e: any) => {
      try {
        const r = await meta('/' + PHONE + '/messages', {
          method: 'POST',
          body: JSON.stringify({
            messaging_product: 'whatsapp', to: e.whatsapp, type: 'template',
            template: {
              name: m.nome_meta, language: { code: m.idioma },
              components: m.corpo.includes('{{1}}') ? [{ type: 'body', parameters: [{ type: 'text', text: primeiroNome(e.nome) }] }] : [],
            },
          }),
        });
        await db.from('envios').update({ status: 'enviado', wa_id: r.messages?.[0]?.id, atualizado_em: new Date().toISOString() }).eq('id', e.id);
      } catch (err) {
        falhas++;
        await db.from('envios').update({ status: 'falhou', erro: String((err as Error).message).slice(0, 300), atualizado_em: new Date().toISOString() }).eq('id', e.id);
      }
    }));
  }
  await db.from('comunicados').update({ status: falhas && falhas === c.total ? 'Erro' : 'Enviado', enviado_em: new Date().toISOString() }).eq('id', id);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    // Quem está chamando? Só a equipe passa.
    const quem = createClient(URL, ANON, { global: { headers: { Authorization: req.headers.get('Authorization') || '' } } });
    const { data: eh } = await quem.rpc('eh_equipe');
    if (eh !== true) return json({ erro: 'Sem acesso' }, 403);
    const db = createClient(URL, SERVICE);
    const { acao, id } = await req.json();

    if (acao === 'status') return json({ conectado: !!(TOKEN && PHONE && WABA) });
    if (!TOKEN || !PHONE || !WABA) return json({ erro: 'WhatsApp oficial ainda não conectado' }, 400);

    if (acao === 'enviar') {
      // responde na hora e continua enviando em segundo plano
      // @ts-ignore EdgeRuntime existe no Supabase
      EdgeRuntime.waitUntil(enviarComunicado(db, id).catch(async (e) => {
        await db.from('comunicados').update({ status: 'Erro' }).eq('id', id);
        console.error(e);
      }));
      return json({ ok: true });
    }

    if (acao === 'aprovar_modelo') {
      const { data: m } = await db.from('modelos').select('*').eq('id', id).single();
      const comps: any[] = [{
        type: 'BODY', text: m.corpo,
        ...(m.corpo.includes('{{1}}') ? { example: { body_text: [['Marina']] } } : {}),
      }];
      const botoes: any[] = [];
      if (m.botao_texto && m.botao_url) botoes.push({ type: 'URL', text: m.botao_texto, url: m.botao_url });
      if (m.categoria === 'MARKETING') botoes.push({ type: 'QUICK_REPLY', text: 'Parar de receber' });
      if (botoes.length) comps.push({ type: 'BUTTONS', buttons: botoes });
      await meta('/' + WABA + '/message_templates', {
        method: 'POST',
        body: JSON.stringify({ name: m.nome_meta, language: m.idioma, category: m.categoria, components: comps }),
      });
      await db.from('modelos').update({ status: 'Em análise', motivo: null, atualizado_em: new Date().toISOString() }).eq('id', id);
      return json({ ok: true });
    }

    if (acao === 'atualizar_modelos') {
      const r = await meta('/' + WABA + '/message_templates?fields=name,status,rejected_reason,language&limit=200');
      const nomes: Record<string, string> = { APPROVED: 'Aprovado', PENDING: 'Em análise', REJECTED: 'Recusado', PAUSED: 'Pausado', DISABLED: 'Desativado' };
      for (const t of r.data || []) {
        await db.from('modelos').update({
          status: nomes[t.status] || t.status,
          motivo: t.rejected_reason && t.rejected_reason !== 'NONE' ? t.rejected_reason : null,
          atualizado_em: new Date().toISOString(),
        }).eq('nome_meta', t.name);
      }
      return json({ ok: true });
    }
    return json({ erro: 'Ação desconhecida' }, 400);
  } catch (e) {
    return json({ erro: String((e as Error).message) }, 500);
  }
});
