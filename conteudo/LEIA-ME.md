# Conteúdo do Imobiliário Brasil (@imobiliario.brasil)

- `fila/`: posts esperando publicação (um JSON por post). Entrar aqui = publicar.
- `publicados/`: o que já foi ao ar, com o link.
- `midia/`: vídeos e capas de reels.
- `render.js`: desenha as lâminas (1080x1350) a partir do JSON.
- `publicar.js`: o robô que publica (roda no GitHub, `.github/workflows/publicar-instagram.yml`).
- Para pausar tudo: criar o arquivo `conteudo/PAUSAR`.

Os caminhos de vídeo nos JSONs são relativos à pasta `fila/`.
Publicação: função Supabase `publicar` (API do Instagram via Meta Business, segredo IG_TOKEN).
