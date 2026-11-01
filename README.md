# Portfólio Felipe Trevisan — Experiência Urbana 2.5D & Three.js

Portfólio interativo de **Felipe Trevisan** (Desenvolvedor Web & Front-end) transformado em um universo urbano explorável que funde **game design de plataforma 2.5D**, **Three.js (WebGL)**, a **estética underground do rap e do trap brasileiro** (com a atmosfera e energia inspiradas no Puma PJL), streetwear autêntico e a **Web Audio API**.

Construído em **HTML5 semântico, CSS3 e JavaScript puro**, com **zero dependências externas** e funcionamento 100% autônomo offline.

---

## ✦ O Protagonista Streetwear

Fielmente modelado e estilizado para refletir a cultura urbana e a identidade visual solicitada:
- **Características Físicas:** Homem jovem branco, de pele clara, cabelo castanho cacheado bem definido no topo com corte americano (*low/mid fade*) limpo nas laterais e nuca.
- **Vestuário Streetwear:**
  - **Moletom Oversized:** Modelagem chumbo/preta com caimento amplo, capuz volumoso repousando nos ombros, bolso canguru e mangas largas.
  - **Calça Baggy:** Jeans escuro de modelagem streetwear ampla com dobras naturais caindo sobre o tênis.
  - **Nike Air Max TN (Tuned Air):** Solado robusto tratorado escuro com 4 câmaras de ar Tuned visíveis e luminescentes, além dos clássicos veios ondulados no cabedal.
- **Animações Procedurais:**
  - *Idle:* Respiração e leve oscilação do capuz e tronco.
  - *Run:* Passadas com flexão do solado do TN, rotação alternada de pernas e braços e emissão de poeira.
  - *Jump & Double Jump:* Salto acrobático com recolhimento de pernas e física ajustada.
  - *Land:* Aterrissagem com *squash & stretch* elástico, tremor sutil de câmera e partículas de impacto.
  - *Interact:* Lata de tinta spray acionada com borrifador sonoro e partículas de tinta neon na parede.

---

## ✦ As 7 Fases Urbanas da Cidade

O portfólio é estruturado como uma expedição contínua através de 7 regiões conectadas:
1. **Fase 01 — O Personagem (`#hero`):** Beco de concreto com apresentação, foto real em estúdio com iluminação neon e avatar do protagonista em streetwear com flash fotográfico analógico.
2. **Fase 02 — O Corre (`#corre`):** Arsenal tecnológico estilizado como murais de lambe-lambes, cartazes de festas underground sobrepostos e tags de graffiti (*Three.js*, *Web Audio API*, *JavaScript puro*, *CSS experimental*, *WCAG*).
3. **Fase 03 — A Caminhada (`#caminhada`):** Trajetória, evolução e métricas expressivas inspiradas na precisão visual do *Nick Ho Motorsports* sobre textura de muro de concreto e asfalto com números gigantes (`+4`, `100%`, `+30`).
4. **Fase 04 — Os Projetos (`#projetos`):** Galeria com filtros temáticos e murais dos cases (*SonicScape*, *Interface Magazine*, *Quantum Finance*), além do Mapa Espacial Isométrico 3D (*Overworld Audio*) com condutos de dados em Spline e raycasting interativo.
5. **Fase 05 — Laboratório Criativo (`#laboratorio`):** Núcleo 3D procedural com casca deformável senoidalmente em tempo real, anéis giroscópicos, seletor de vórtice/quântico/ressonância e pulso quântico expansivo.
6. **Fase 06 — Conquistas (`#conquistas`):** Certificações, realizações e marcos de excelência técnica verificáveis.
7. **Fase 07 — Conexões (`#contato`):** Quadra noturna de rua, canais diretos (GitHub, LinkedIn, E-mail) e formulário de contato com validação em tempo real e acessibilidade WCAG.

---

## ✦ Navegação Dupla Sincronizada (CityNavigator)

- **Modo Exploração (Jogo 2.5D):** Controle o protagonista de tênis TN pelo cenário urbano através das teclas `A`/`D` ou Setas (`←`/`→`), pule plataformas com `Espaço` (suporte a duplo pulo), interaja com totens e murais usando `E` ou `Enter`, ou utilize os controles virtuais de toque (D-Pad touch) em smartphones e tablets.
- **Modo Leitura Convencional:** Rápido, acessível e sem barreiras para recrutadores e leitores que preferem scroll vertical tradicional.
- **Sincronização em Tempo Real:** Mudar de fase pelo jogo atualiza a seção ativa e o menu; clicar em qualquer seção no menu ou rolar a página no modo leitura desloca suavemente o protagonista no jogo para a coordenada correspondente.
- **Alternador Global:** Botão fixo no header e no HUD, com suporte ao atalho de teclado `ESC`.

---

## ✦ Trilha Sonora & Reatividade Sonora (Web Audio API)

- **Sintetizador Trap Underground 808 Nativo:** Síntese procedural sem necessidade de arquivos externos ou streaming:
  - Grave 808 analógico quente com envelope de afinação e saturação via `WaveShaperNode`.
  - Trap kick curto e encorpado, hi-hat rolls em semicolcheias e snares estalados.
  - Melodia sombria lo-fi em acordes menores de trap (vibe Puma PJL).
  - Efeitos sonoros dedicados para passos no asfalto, pulo, duplo pulo, aterrissagem e spray de tinta.
- **Analisador Espectral FFT (`AnalyserNode`):** As frequências subgraves do beat modulam em tempo real a intensidade das luzes de vapor de sódio dos postes de rua, o brilho dos grafites e as barras do HUD!

---

## ✦ Como Executar o Projeto

Como o projeto é construído em código web puro, não exige compiladores, bundlers ou instalações pesadas:

### Opção 1: Servidor HTTP Local com Node.js
```bash
node -e "const http = require('http'); const fs = require('fs'); const path = require('path'); const server = http.createServer((req, res) => { let filePath = '.' + req.url; if (filePath === './') filePath = './index.html'; const ext = path.extname(filePath); const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png' }; fs.readFile(filePath, (err, content) => { if (err) { res.writeHead(404); res.end('Not found'); } else { res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' }); res.end(content); } }); }); server.listen(8080, () => console.log('Servidor rodando em http://localhost:8080'));"
```
Acesse no seu navegador: `http://localhost:8080`

### Opção 2: Live Server do VS Code / Antigravity IDE
Clique com o botão direito em `index.html` e selecione **Open with Live Server**.