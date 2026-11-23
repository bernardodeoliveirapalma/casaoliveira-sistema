// ============================================================
// Função "assessor" (Supabase Edge Function)
// Todo dia de manhã manda para o WhatsApp de Bernardo as tarefas
// do dia (e as atrasadas) que estão no ClickUp.
//
// Quem chama: o robô do GitHub (.github/workflows/assessor.yml),
// todo dia às 7h (Brasília). Ao criar, DESLIGUE "Verify JWT".
//
// Endereços (abrir no navegador):
//   .../functions/v1/assessor?acao=preparar  envia o modelo "resumo_do_dia" para a Meta aprovar
//   .../functions/v1/assessor?acao=status    mostra se o modelo já foi aprovado
//   .../functions/v1/assessor?acao=teste     manda o resumo agora (até 3 testes por dia)
//   .../functions/v1/assessor                envio do dia (só 1 por dia, entre 5h e 12h)
// Nenhum endereço mostra as tarefas na tela: elas só vão para o WhatsApp.
//
// Segredos (Edge Functions > Secrets):
//   CLICKUP_TOKEN   chave pessoal do ClickUp (começa com pk_)
//   ASSESSOR_PARA   WhatsApp que recebe os avisos, ex.: +5548999999999
//   ASSESSOR_NOME   (opcional) nome no "Bom dia", padrão Bernardo
// Usa também os que já existem: YCLOUD_API_KEY, WA_FROM, WA_WABA_ID.
// ============================================================
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const CLICKUP = Deno.env.get('CLICKUP_TOKEN') || '';
const PARA = Deno.env.get('ASSESSOR_PARA') || '';
const NOME = Deno.env.get('ASSESSOR_NOME') || 'Bernardo';
const YCLOUD = Deno.env.get('YCLOUD_API_KEY') || '';
const FROM = Deno.env.get('WA_FROM') || '';
const WABA = Deno.env.get('WA_WABA_ID') || '';
const MODELO = 'resumo_do_dia';
const FUSO = -3; // Brasília, sem horário de verão

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b, null, 2), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

// ---------- datas no horário de Brasília ----------
function agoraBR() {
  const d = new Date(Date.now() + FUSO * 3600_000);
  return { dia: d.toISOString().slice(0, 10), hora: d.getUTCHours() };
}
function fimDeHojeMs() {
  const { dia } = agoraBR();
  return Date.parse(dia + 'T23:59:59.999Z') - FUSO * 3600_000;
}
function inicioDeHojeMs() {
  const { dia } = agoraBR();
  return Date.parse(dia + 'T00:00:00.000Z') - FUSO * 3600_000;
}
function horaDe(ms: number) {
  const d = new Date(ms + FUSO * 3600_000);
  const h = d.getUTCHours(), m = d.getUTCMinutes();
  return h + 'h' + (m ? String(m).padStart(2, '0') : '');
}
function diaMes(ms: number) {
  const d = new Date(ms + FUSO * 3600_000);
  return String(d.getUTCDate()).padStart(2, '0') + '/' + String(d.getUTCMonth() + 1).padStart(2, '0');
}

// ---------- ClickUp ----------
async function clickup(path: string) {
  const r = await fetch('https://api.clickup.com/api/v2' + path, { headers: { Authorization: CLICKUP } });
  const corpo = await r.json().catch(() => ({}));
  if (r.status === 401) throw new Error('A chave do ClickUp não funciona mais: gerar uma nova e trocar o segredo CLICKUP_TOKEN');
  if (!r.ok) throw new Error('ClickUp respondeu com erro ' + r.status + ' ' + (corpo?.err || ''));
  return corpo;
}

type Tarefa = { nome: string; vence: number; comHora: boolean; prioridade: number };

async function tarefasDoDia() {
  const eu = (await clickup('/user')).user;
  const times = (await clickup('/team')).teams || [];
  const fim = fimDeHojeMs();
  const lista: Tarefa[] = [];
  const vistas = new Set<string>();
  for (const t of times) {
    for (let page = 0; page < 10; page++) {
      const r = await clickup(`/team/${t.id}/task?page=${page}&subtasks=true&include_closed=false&due_date_lt=${fim}&order_by=due_date`);
      for (const k of r.tasks || []) {
        if (vistas.has(k.id)) continue;
        vistas.add(k.id);
        const resp = (k.assignees || []).map((a: any) => a.id);
        // minhas: atribuídas a mim, ou sem ninguém atribuído
        if (resp.length && !resp.includes(eu.id)) continue;
        if (k.status?.type === 'closed' || k.status?.type === 'done') continue;
        if (!k.due_date) continue;
        lista.push({
          nome: String(k.name || '').replace(/\s+/g, ' ').trim(),
          vence: Number(k.due_date),
          comHora: !!k.due_date_time,
          prioridade: Number(k.priority?.orderindex || 9),
        });
      }
      if (r.last_page !== false || !(r.tasks || []).length) break;
    }
  }
  const inicio = inicioDeHojeMs();
  const hoje = lista.filter((t) => t.vence >= inicio).sort((a, b) =>
    (a.comHora === b.comHora ? 0 : a.comHora ? -1 : 1) || a.vence - b.vence || a.prioridade - b.prioridade);
  const atrasadas = lista.filter((t) => t.vence < inicio).sort((a, b) => a.vence - b.vence);
  return { hoje, atrasadas };
}

// O WhatsApp não aceita quebra de linha dentro do texto variável,
// então a lista vem numa linha só, separada por " · ".
function emLinha(ts: Tarefa[], tipo: 'hoje' | 'atrasada', limite: number) {
  if (!ts.length) return tipo === 'hoje' ? 'nenhuma tarefa marcada para hoje' : 'nenhuma';
  const partes: string[] = [];
  let tamanho = 0;
  for (let i = 0; i < ts.length; i++) {
    const t = ts[i];
    const quando = tipo === 'hoje' ? (t.comHora ? ' (' + horaDe(t.vence) + ')' : '') : ' (desde ' + diaMes(t.vence) + ')';
    const item = (i + 1) + '. ' + t.nome.slice(0, 90) + quando;
    if (tamanho + item.length > limite) {
      partes.push('e mais ' + (ts.length - i));
      break;
    }
    partes.push(item);
    tamanho += item.length + 3;
  }
  return partes.join(' · ');
}

// ---------- WhatsApp (YCloud) ----------
async function ycloud(path: string, init: RequestInit = {}) {
  const r = await fetch('https://api.ycloud.com/v2' + path, {
    ...init,
    headers: { 'X-API-Key': YCLOUD, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const corpo = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(corpo?.error?.message || corpo?.message || 'YCloud respondeu com erro ' + r.status);
  return corpo;
}

const TEXTO_MODELO =
  'Bom dia, {{1}}. Estas são as suas tarefas de hoje no ClickUp: {{2}}.\n\nAtrasadas: {{3}}.\n\nTenha um bom dia de trabalho.';

async function prepararModelo() {
  return await ycloud('/whatsapp/templates', {
    method: 'POST',
    body: JSON.stringify({
      wabaId: WABA, name: MODELO, language: 'pt_BR', category: 'UTILITY',
      components: [
        {
          type: 'BODY', text: TEXTO_MODELO,
          example: { body_text: [['Bernardo', '1. Visita no Highlands (10h) · 2. Enviar proposta para cliente', 'nenhuma']] },
        },
        { type: 'BUTTONS', buttons: [{ type: 'URL', text: 'Abrir o ClickUp', url: 'https://app.clickup.com' }] },
      ],
    }),
  });
}

async function statusModelo() {
  const r = await ycloud('/whatsapp/templates?limit=100&filter.wabaId=' + encodeURIComponent(WABA));
  const t = (r.items || []).find((x: any) => x.name === MODELO);
  if (!t) return 'ainda não enviado para a Meta (abra ?acao=preparar)';
  const nomes: Record<string, string> = { APPROVED: 'aprovado', PENDING: 'em análise na Meta', REJECTED: 'recusado', PAUSED: 'pausado', DISABLED: 'desativado' };
  return (nomes[t.status] || t.status) + (t.reason && t.reason !== 'NONE' ? ' (motivo: ' + t.reason + ')' : '') +
    (t.category && t.category !== 'UTILITY' ? ' · a Meta classificou como ' + t.category : '');
}

async function enviarResumo() {
  const { hoje, atrasadas } = await tarefasDoDia();
  const r = await ycloud('/whatsapp/messages', {
    method: 'POST',
    body: JSON.stringify({
      from: FROM, to: '+' + PARA.replace(/\D/g, ''), type: 'template',
      template: {
        name: MODELO, language: { code: 'pt_BR' },
        components: [{
          type: 'body', parameters: [
            { type: 'text', text: NOME },
            { type: 'text', text: emLinha(hoje, 'hoje', 650) },
            { type: 'text', text: emLinha(atrasadas, 'atrasada', 250) },
          ],
        }],
      },
    }),
  });
  return { hoje: hoje.length, atrasadas: atrasadas.length, mensagem: r.id };
}

async function registrar(tipo: string, ok: boolean, detalhe: string) {
  await db.from('assessor_envios').insert({ dia: agoraBR().dia, tipo, ok, detalhe: detalhe.slice(0, 300) });
}
async function contar(tipo: string, soOk = true) {
  let q = db.from('assessor_envios').select('id', { head: true, count: 'exact' }).eq('dia', agoraBR().dia).eq('tipo', tipo);
  if (soOk) q = q.eq('ok', true);
  const { count, error } = await q;
  if (error) throw new Error('Tabela assessor_envios não encontrada: rodar o SQL 13');
  return count || 0;
}

Deno.serve(async (req) => {
  const acao = new URL(req.url).searchParams.get('acao') || 'diario';
  try {
    const faltando = [
      !CLICKUP && 'CLICKUP_TOKEN', !PARA && 'ASSESSOR_PARA', !YCLOUD && 'YCLOUD_API_KEY', !FROM && 'WA_FROM', !WABA && 'WA_WABA_ID',
    ].filter(Boolean);

    if (acao === 'preparar') {
      if (!YCLOUD || !WABA) return json({ ok: false, detalhe: 'Faltam os segredos da YCloud' }, 400);
      try {
        await prepararModelo();
      } catch (e) {
        const msg = String((e as Error).message);
        if (!/exist|duplicate|já/i.test(msg)) throw e;
      }
      return json({ ok: true, detalhe: 'Modelo "resumo_do_dia": ' + (await statusModelo()) });
    }

    if (acao === 'status') {
      return json({
        ok: !faltando.length,
        modelo: YCLOUD && WABA ? await statusModelo() : 'faltam os segredos da YCloud',
        segredos_faltando: faltando,
        enviado_hoje: (await contar('diario')) > 0,
      });
    }

    if (faltando.length) return json({ ok: false, detalhe: 'Faltam os segredos: ' + faltando.join(', ') }, 400);

    if (acao === 'teste') {
      if ((await contar('teste', false)) >= 3) return json({ ok: false, detalhe: 'Já foram 3 testes hoje. Tente amanhã.' }, 429);
      try {
        const r = await enviarResumo();
        await registrar('teste', true, JSON.stringify(r));
        return json({ ok: true, detalhe: `Enviado: ${r.hoje} para hoje, ${r.atrasadas} atrasadas. Confira o WhatsApp.` });
      } catch (e) {
        await registrar('teste', false, String((e as Error).message));
        throw e;
      }
    }

    // envio do dia: uma vez só, de manhã
    const { hora } = agoraBR();
    if (hora < 5 || hora >= 12) return json({ ok: true, detalhe: 'Fora do horário do resumo (5h às 12h).' });
    if ((await contar('diario')) > 0) return json({ ok: true, detalhe: 'O resumo de hoje já foi enviado.' });
    try {
      const r = await enviarResumo();
      await registrar('diario', true, JSON.stringify(r));
      return json({ ok: true, detalhe: `Resumo enviado: ${r.hoje} para hoje, ${r.atrasadas} atrasadas.` });
    } catch (e) {
      await registrar('diario', false, String((e as Error).message));
      throw e;
    }
  } catch (e) {
    return json({ ok: false, detalhe: String((e as Error).message) }, 500);
  }
});
