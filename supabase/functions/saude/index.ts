// ============================================================
// Função "saude" (Supabase Edge Function)
// Check-up diário do sistema da Casa Oliveira. Um robô do GitHub
// chama esta função todo dia: isso mantém o Supabase acordado e
// confere se o Brevo (e-mail) e a YCloud (WhatsApp) estão de pé.
// Só responde "está ok / não está ok". Não mostra nenhum dado.
// Ao criar, DESLIGUE "Verify JWT".
// Usa os segredos que já existem: BREVO_API_KEY, YCLOUD_API_KEY,
// WA_FROM e WA_WABA_ID.
// ============================================================
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const BREVO = Deno.env.get('BREVO_API_KEY') || '';
const YCLOUD = Deno.env.get('YCLOUD_API_KEY') || '';
const FROM = (Deno.env.get('WA_FROM') || '').replace(/\D/g, '');
const WABA = Deno.env.get('WA_WABA_ID') || '';

type Item = { nome: string; ok: boolean; detalhe: string };

async function banco(): Promise<Item> {
  const { error } = await db.from('clientes').select('id', { head: true, count: 'exact' });
  return { nome: 'Banco de dados', ok: !error, detalhe: error ? 'Não respondeu' : 'Acordado e respondendo' };
}

async function brevo(): Promise<Item> {
  if (!BREVO) return { nome: 'E-mail (Brevo)', ok: false, detalhe: 'Chave do Brevo não cadastrada' };
  const r = await fetch('https://api.brevo.com/v3/smtp/statistics/aggregatedReport?days=1', {
    headers: { 'api-key': BREVO, Accept: 'application/json' },
  });
  if (r.status === 401) return { nome: 'E-mail (Brevo)', ok: false, detalhe: 'A chave do Brevo venceu ou foi apagada: gerar uma nova' };
  if (r.ok || r.status === 403) return { nome: 'E-mail (Brevo)', ok: true, detalhe: 'Chave funcionando' };
  return { nome: 'E-mail (Brevo)', ok: false, detalhe: 'Brevo respondeu com erro ' + r.status };
}

async function ycloud(path: string) {
  const r = await fetch('https://api.ycloud.com/v2' + path, { headers: { 'X-API-Key': YCLOUD, Accept: 'application/json' } });
  return { status: r.status, corpo: await r.json().catch(() => ({})) };
}

async function whatsapp(): Promise<Item[]> {
  if (!YCLOUD) return [{ nome: 'WhatsApp (YCloud)', ok: false, detalhe: 'Chave da YCloud não cadastrada' }];
  const n = await ycloud('/whatsapp/phoneNumbers?limit=100&filter.wabaId=' + encodeURIComponent(WABA));
  if (n.status === 401 || n.status === 403) return [{ nome: 'WhatsApp (YCloud)', ok: false, detalhe: 'A chave da YCloud não funciona mais' }];
  const itens: Item[] = [];
  if (n.status === 200) {
    const nums = (n.corpo.items || []) as any[];
    const meu = nums.find((x) => String(x.phoneNumber || x.displayPhoneNumber || '').replace(/\D/g, '').endsWith(FROM.slice(-8))) || nums[0];
    if (!meu) itens.push({ nome: 'Número do WhatsApp', ok: false, detalhe: 'O número não aparece mais na YCloud' });
    else {
      const st = String(meu.status || '').toUpperCase();
      const q = String(meu.qualityRating || '').toUpperCase();
      const ruim = /BANNED|DISCONNECTED|FLAGGED|RESTRICTED|DELETED|OFFLINE/.test(st) || q === 'RED';
      itens.push({ nome: 'Número do WhatsApp', ok: !ruim,
        detalhe: 'Situação: ' + (st || 'sem informação') + (q ? ' · qualidade: ' + q : '') + (meu.messagingLimit ? ' · limite: ' + meu.messagingLimit : '') });
    }
  } else itens.push({ nome: 'Número do WhatsApp', ok: false, detalhe: 'YCloud respondeu com erro ' + n.status });
  const t = await ycloud('/whatsapp/templates?limit=100&filter.wabaId=' + encodeURIComponent(WABA));
  if (t.status === 200) {
    const ts = (t.corpo.items || []) as any[];
    const aprov = ts.filter((x) => x.status === 'APPROVED').length;
    const ruins = ts.filter((x) => /REJECTED|PAUSED|DISABLED/.test(String(x.status))).map((x) => x.name);
    itens.push({ nome: 'Modelos do WhatsApp', ok: true,
      detalhe: aprov + ' aprovado(s) de ' + ts.length + (ruins.length ? ' · com problema: ' + ruins.join(', ') : '') });
  }
  return itens;
}

Deno.serve(async () => {
  const itens: Item[] = [];
  for (const f of [banco, brevo]) {
    try { itens.push(await f()); } catch (e) { itens.push({ nome: f.name, ok: false, detalhe: String((e as Error).message) }); }
  }
  try { itens.push(...(await whatsapp())); } catch (e) { itens.push({ nome: 'WhatsApp (YCloud)', ok: false, detalhe: String((e as Error).message) }); }
  const ok = itens.every((i) => i.ok);
  return new Response(JSON.stringify({ ok, quando: new Date().toISOString(), itens }, null, 2), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
});
