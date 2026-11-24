# Rotina diária do Imobiliário Brasil (@imobiliario.brasil)

Esta é a receita que a tarefa agendada segue 3 vezes por dia (9h, 13h e 19h de Brasília).
Cada execução cria **1 carrossel** e o coloca em `conteudo/fila/`. O robô do GitHub publica
sozinho assim que o arquivo chega (push em `conteudo/fila/**`). Bernardo não aprova antes:
a qualidade tem de sair pronta.

## 0. Antes de tudo
- Trabalhe no branch `claude/project-thread-eml3eg` do repo `bernardodeoliveirapalma/casaoliveira-sistema`
  (`git fetch origin claude/project-thread-eml3eg && git checkout -B claude/project-thread-eml3eg FETCH_HEAD`).
- Começa em 25/11/2026: antes disso, pare sem criar nada.
- Se existir `conteudo/PAUSAR`, pare: não crie nada.
- Se já existir em `conteudo/fila/` um post com a data e o horário desta execução, pare (não duplique).
- Para **não repetir tema, termo ou foto**, junte o histórico de todos os branches:
  `git fetch origin '+refs/heads/claude/*:refs/remotes/origin/claude/*'` e
  `git log --remotes='origin/claude/*' --format=%s | grep '^Publicado:' | sort -u` (títulos já postados),
  mais os `conteudo/publicados/*.json` (compare também os ids do campo `unsplash`).

## 1. Linha editorial por horário
| Horário | Linha | Exemplos |
|---|---|---|
| 9h | **Notícia ou mercado** do Brasil das últimas 48h | juros e financiamento, lançamentos, preços (FipeZap), leis, cidades que crescem |
| 13h | **Casas e design que inspiram** | um ambiente, um material, uma tendência de arquitetura, casa de campo/praia |
| 19h | **Guia ou investimento** | glossário (VGV, ITBI, permuta...), checklist de compra, como avaliar um bairro, aluguel x compra |

Alterne sub-temas para o feed ficar variado. Tom: revista (estilo Casa Vogue), positivo, claro,
frases curtas, sem jargão sem explicar, sem exagero ("imperdível", "explodiu").

## 2. Fatos (regra de ouro)
- Número, data, nome ou notícia **só com fonte confiável checada nesta execução** (WebSearch e leitura
  da página). Prefira fontes primárias (Banco Central, IBGE, FipeZap, Secovi, Abrainc, CBIC, prefeituras)
  e grandes veículos (Valor, Folha, Estadão, G1, Exame, InfoMoney).
- Coloque a fonte na legenda: `Fonte: <veículo ou órgão>, <dia/mês>.`
- Na dúvida sobre um dado, não use o dado. Nunca invente citação.
- Não copie texto de reportagem: resuma com palavras próprias.
- Não use fotos de veículos de notícia, de imobiliárias ou do Instagram de terceiros.

## 3. Fotos (só Unsplash, pela nossa função)
- Buscar: `GET https://ejyyarsxwpbwntbqewed.supabase.co/functions/v1/fotos?q=<termo em inglês>&orientacao=portrait`
  (devolve foto original em alta + autor). Limite: 50 buscas/hora, use poucas (2 a 4 buscas).
- Para cada foto usada, avisar o Unsplash: `GET .../functions/v1/fotos?usar=<id>`.
- Escolha fotos bonitas, claras, com cara de revista; nada de pessoas posando, logos ou texto na foto.
- Crédito em cada lâmina `foto` (`"credito": "Foto: Nome / Unsplash"`) e na legenda (`Fotos: A, B / Unsplash`).
- Guarde os ids em `"unsplash": [...]`.

## 4. Formato do arquivo
Nome: `conteudo/fila/AAAA-MM-DD-HHMM-assunto-curto.json` (data e hora de Brasília). Sem campo `quando`.

```json
{
 "titulo": "Título curto (aparece no histórico)",
 "tipo": "carrossel",
 "legenda": "Primeira linha forte.\nDuas ou três frases de contexto.\n\nOne-line English summary.\n\nFonte: ...\nFotos: A, B / Unsplash\n\n#imobiliariobrasil #mercadoimobiliario #arquitetura #design",
 "laminas": [ ... ],
 "unsplash": ["id1", "id2"]
}
```

Lâminas (de 4 a 8, sempre começa com `capa` e termina com `fim`):
- `capa`: `foto`, `rotulo` (1 palavra: Mercado, Notícia, Arquitetura, Guia, Investimento, Design), `titulo` (até ~6 palavras; `<br>` para quebrar linha), `marca`: false.
- `foto`: `foto`, `credito`, `legenda` (opcional, 1 frase curta).
- `texto`: `rotulo`, `titulo`, `texto` (até ~45 palavras), `escuro` opcional.
- `lista`: `rotulo`, `titulo`, `itens` = [["Negrito.", "explicação curta"], ...] (3 a 5 itens).
- `numero`: `rotulo`, `n` ("01"), `titulo`, `texto` (até ~35 palavras).
- `glossario`: `termo` (sigla curta), `texto` (até ~30 palavras). Pode substituir a capa no post de glossário.
- `fim`: lâmina verde "Siga @imobiliario.brasil".

Modelos prontos para copiar: `conteudo/publicados/2026-11-24-0*.json`.
Legenda: até ~900 caracteres, 4 a 6 hashtags, sem emojis em excesso (no máximo 1).

## 5. Conferir antes de publicar
1. `npm i --no-save playwright@1.48.2` se precisar (o Chromium já vem instalado no ambiente) e
   `node conteudo/render.js conteudo/fila/<arquivo>.json /tmp/previa`.
2. Abra **todas** as lâminas geradas e confira: texto não corta nem sobra para fora, fotos nítidas,
   crédito visível, sem erro de português, títulos bonitos. Corrija e desenhe de novo até ficar perfeito.
3. Valide o JSON (`node -e "JSON.parse(require('fs').readFileSync('<arquivo>'))"`).

## 6. Publicar
- `git add conteudo/fila/<arquivo>.json && git commit -m "Fila: <título>"` (com as linhas de autoria
  pedidas pelo ambiente) e `git pull --rebase origin claude/project-thread-eml3eg && git push origin claude/project-thread-eml3eg`.
- Se o ambiente não deixar enviar para esse branch, envie para o branch que ele indicar (criado a partir
  deste): o robô também roda lá e publica igual.
- O push dispara o robô "Publicar no Instagram". Espere uns 5 minutos e confira em `conteudo/publicados/`
  (o robô move o arquivo e faz um commit "Publicado: ...") ou na lista de execuções do GitHub Actions.
- Se falhar, rode o workflow de novo **uma vez** (workflow_dispatch, so_testar=false). O robô confere a
  conta antes de postar, então não repete post. Se falhar de novo, deixe na fila e registre o erro no resumo.

## 7. Resumo final
Termine com 2 linhas: o que foi ao ar (título + link) ou o que deu errado.
