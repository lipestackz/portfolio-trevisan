Identidade visual — Felipe Trevisan
- Cor principal: #7C3AED — roxo vibrante.
- Cor de fundo: #0A0A0A — preto profundo.
- Cor de destaque: #C6FF00 — verde-limão.
- Fonte de títulos: Space Grotesk.
- Fonte de texto: Inter.
- Tom: Direto, criativo, descontraído e tecnológico.
- Nome: Felipe Trevisan.
- Cargo: Desenvolvedor Web / Desenvolvedor Front-end.
- Frase de apresentação: “Transformando ideias em experiências digitais interativas, criativas e memoráveis.”
- Universo Artístico: Cultura de rua brasileira, graffiti, underground rap & trap nacional (vibe Puma PJL), fotografia analógica com flash direto e lambe-lambes sobrepostos.

---

## ✦ O Protagonista Streetwear

- **Aparência Física:** Masculino, pele clara, rosto jovem descontraído, cabelo castanho cacheado bem definido no topo com corte americano (low/mid fade) nas laterais e nuca.
- **Moletom Oversized:** Modelagem volumosa chumbo/preto com capuz e caimento solto.
- **Calça Baggy:** Jeans escuro streetwear amplo com dobras caindo sobre o tênis.
- **Nike Air Max TN (Tuned Air):** Solado robusto tratorado com 4 câmaras de ar visíveis (amortecimento Tuned Air) e veios/nervuras onduladas no cabedal.
- **Animações Procedurais:** Idle, Walk, Run, Jump, Double Jump, Fall, Land (impacto com poeira) e Interact (borrifador de tinta spray com som e partículas).

---

## Aplicação Técnica da Identidade no Projeto

- **Tokens CSS (`style.css`):**
  - `--primary-color: #7C3AED;` (roxo trap)
  - `--bg-color: #0A0A0A;` (asfalto e concreto)
  - `--accent-color: #C6FF00;` (verde-limão spray)
  - `--font-heading: 'Space Grotesk', sans-serif;`
  - `--font-body: 'Inter', sans-serif;`
  - `--font-street: 'Bebas Neue', 'Space Grotesk', sans-serif;`
  - `--font-display: 'Syne', sans-serif;`

- **Tradução para Three.js & WebGL (`script.js`):**
  - Cenário urbano com asfalto, guias amarelas, muros de concreto e postes de vapor de sódio (`0xFFA500`) com SpotLights e cones volumétricos.
  - Sincronização sonora: AnalyserNode (FFT) analisa o subgrave do beat trap 808 e pulsa as luzes dos postes e do núcleo holográfico.
  - Partículas dinâmicas de poeira de aterrissagem e tinta spray de grafite.
  - Sincronização de tema: adaptação automática das luzes e opacidades entre modo escuro e claro.