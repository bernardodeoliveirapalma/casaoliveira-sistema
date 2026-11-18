// ============================================================
// Função "emails" (Supabase Edge Function)
// Envia os e-mails da Casa Oliveira pelo Brevo: os e-mails para
// clientes (por etiqueta), o teste para quem está logado e o
// convite dos corretores parceiros. Só a equipe consegue chamar.
//
// Segredos (Edge Functions > Secrets):
//   BREVO_API_KEY    chave da API do Brevo (começa com xkeysib-)
//   EMAIL_REMETENTE  endereço que envia, ex.: contato@casaoliveira.site
//   EMAIL_RESPOSTA   (opcional) para onde vão as respostas, ex.: o Gmail de vocês
//   PAINEL_URL       (opcional) padrão https://painel.casaoliveira.site
// ============================================================
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const URL = Deno.env.get('SUPABASE_URL')!;
const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const CHAVE = Deno.env.get('BREVO_API_KEY') || '';
const DE = Deno.env.get('EMAIL_REMETENTE') || '';
const RESPOSTA = Deno.env.get('EMAIL_RESPOSTA') || '';
const PAINEL = (Deno.env.get('PAINEL_URL') || 'https://painel.casaoliveira.site').replace(/\/$/, '');
const NOME = 'Casa Oliveira';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const esc = (s: string) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
function primeiroNome(n: string | null) {
  const p = String(n || '').replace(/\s*\(.*\)\s*/, '').trim().split(' ')[0];
  return p ? p[0].toUpperCase() + p.slice(1).toLowerCase() : '';
}

// Monta o e-mail com a cara da Casa Oliveira
function montar(corpo: string, nome: string, botao?: { texto?: string | null; url?: string | null }, sair?: string) {
  const pn = primeiroNome(nome);
  const texto = corpo.replace(/\{nome\}/g, pn || 'tudo bem').replace(/\n{3,}/g, '\n\n').trim();
  const paragrafos = texto.split(/\n\n/).map((p) =>
    '<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#3B3328">' + esc(p).replace(/\n/g, '<br>') + '</p>').join('');
  const btn = botao?.texto && botao?.url && /^https:\/\//.test(botao.url)
    ? '<p style="margin:26px 0 8px"><a href="' + esc(botao.url) + '" style="display:inline-block;background:#3F4A3A;color:#F7F3EC;text-decoration:none;padding:13px 26px;border-radius:999px;font-size:15px">' + esc(botao.texto) + '</a></p>'
    : '';
  const rodape = sair
    ? 'Você recebe este e-mail porque tem contato com a Casa Oliveira. <a href="' + esc(sair) + '" style="color:#8A7D6B">Não quero mais receber</a>.'
    : 'Casa Oliveira · Curadoria imobiliária em Florianópolis';
  const html = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>' +
    '<body style="margin:0;background:#F2EEE6;font-family:Georgia,\'Times New Roman\',serif">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F2EEE6"><tr><td align="center" style="padding:32px 16px">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">' +
    '<tr><td style="padding:0 8px 18px;font-size:22px;letter-spacing:4px;color:#3F4A3A;text-transform:uppercase">Casa Oliveira</td></tr>' +
    '<tr><td style="background:#FFFFFF;border-radius:18px;padding:34px 30px">' + paragrafos + btn +
    '<p style="margin:22px 0 0;font-size:16px;color:#3B3328">Ane &amp; Bernardo<br><span style="color:#8A7D6B">Casa Oliveira</span></p></td></tr>' +
    '<tr><td style="padding:18px 8px;font-size:12px;line-height:1.6;color:#8A7D6B;font-family:Arial,sans-serif">' + rodape + '</td></tr>' +
    '</table></td></tr></table></body></html>';
  return { html, texto: texto + (botao?.texto && botao?.url ? '\n\n' + botao.texto + ': ' + botao.url : '') + '\n\nAne & Bernardo, Casa Oliveira' + (sair ? '\n\nNão quer mais receber? ' + sair : '') };
}

async function brevo(para: { email: string; nome?: string }, assunto: string, m: { html: string; texto: string }, sair?: string) {
  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': CHAVE, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: NOME, email: DE },
      to: [{ email: para.email, ...(para.nome ? { name: para.nome } : {}) }],
      ...(RESPOSTA ? { replyTo: { email: RESPOSTA, name: NOME } } : {}),
      subject: assunto,
      htmlContent: m.html,
      textContent: m.texto,
      tags: ['casa-oliveira'],
      ...(sair ? { headers: { 'List-Unsubscribe': '<' + sair + '>' } } : {}),
    }),
  });
  const corpo = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(corpo?.message || 'Erro ' + r.status);
  return String(corpo.messageId || '');
}

async function enviarEmail(db: ReturnType<typeof createClient>, id: string) {
  const { data: m, error } = await db.from('emails').select('*').eq('id', id).single();
  if (error || !m) throw new Error('E-mail não encontrado');
  await db.from('emails').update({ status: 'Enviando' }).eq('id', id);
  let falhas = 0;
  while (true) {
    const { data: lote, error: e2 } = await db.from('envios_email').select('*').eq('email_id', id).eq('status', 'fila').limit(10);
    if (e2) throw e2;
    if (!lote || !lote.length) break;
    await Promise.all(lote.map(async (e: any) => {
      try {
        const sair = e.cliente_id ? PAINEL + '/#/sair/' + e.cliente_id : undefined;
        const msgId = await brevo({ email: e.email, nome: e.nome }, m.assunto, montar(m.corpo, e.nome, { texto: m.botao_texto, url: m.botao_url }, sair), sair);
        await db.from('envios_email').update({ status: 'enviado', msg_id: msgId, atualizado_em: new Date().toISOString() }).eq('id', e.id);
      } catch (err) {
        falhas++;
        await db.from('envios_email').update({ status: 'falhou', erro: String((err as Error).message).slice(0, 300), atualizado_em: new Date().toISOString() }).eq('id', e.id);
      }
    }));
    await new Promise((ok) => setTimeout(ok, 300));
  }
  await db.from('emails').update({ status: falhas && falhas === m.total ? 'Erro' : 'Enviado', enviado_em: new Date().toISOString() }).eq('id', id);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const auth = req.headers.get('Authorization') || '';
    const quem = createClient(URL, ANON, { global: { headers: { Authorization: auth } } });
    const { data: eh } = await quem.rpc('eh_equipe');
    if (eh !== true) return json({ erro: 'Sem acesso' }, 403);
    const db = createClient(URL, SERVICE);
    const b = await req.json();

    if (b.acao === 'status') return json({ conectado: !!(CHAVE && DE) });
    if (!CHAVE || !DE) return json({ erro: 'E-mail ainda não conectado ao Brevo' }, 400);

    if (b.acao === 'enviar') {
      // responde na hora e continua enviando em segundo plano
      // @ts-ignore EdgeRuntime existe no Supabase
      EdgeRuntime.waitUntil(enviarEmail(db, b.id).catch(async (e) => {
        await db.from('emails').update({ status: 'Erro' }).eq('id', b.id);
        console.error(e);
      }));
      return json({ ok: true });
    }

    if (b.acao === 'teste') {
      // manda o rascunho para o e-mail de quem está logado
      const { data: u } = await quem.auth.getUser();
      const para = u?.user?.email;
      if (!para) return json({ erro: 'Não achei seu e-mail' }, 400);
      const { data: p } = await db.from('perfis').select('nome').eq('id', u!.user!.id).maybeSingle();
      await brevo({ email: para, nome: p?.nome }, '[Teste] ' + String(b.assunto || ''), montar(String(b.corpo || ''), p?.nome || '', { texto: b.botaoTexto, url: b.botaoUrl }, PAINEL + '/#/sair/teste'));
      return json({ ok: true, para });
    }

    if (b.acao === 'convite') {
      const { data: c } = await db.from('convites').select('*').eq('id', b.id).single();
      if (!c) return json({ erro: 'Convite não encontrado' }, 404);
      const { data: ims } = await db.from('imoveis').select('nome').in('id', c.imoveis || []);
      const l = (ims || []).map((i: any) => i.nome);
      const lista = l.length > 1 ? l.slice(0, -1).join(', ') + ' e ' + l[l.length - 1] : l[0] || 'nossos empreendimentos';
      const link = PAINEL + '/#/convite/' + c.id;
      const corpo = 'Olá, {nome}. Aqui é a família Casa Oliveira.\n\n' +
        'Liberamos para você o material de ' + lista + ': fotos, books, plantas e tabelas, tudo num lugar só.\n\n' +
        'Para entrar, crie sua senha no botão abaixo usando este e-mail (' + c.email + '). O link vale por 30 dias.';
      await brevo({ email: c.email, nome: c.nome }, 'Seu acesso ao portal de parceiros da Casa Oliveira', montar(corpo, c.nome, { texto: 'Criar minha senha', url: link }));
      return json({ ok: true });
    }
    return json({ erro: 'Ação desconhecida' }, 400);
  } catch (e) {
    return json({ erro: String((e as Error).message) }, 500);
  }
});
