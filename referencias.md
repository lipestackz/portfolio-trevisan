Site 1 — Format
https://format.obys.agency/
- O que copiar: A revelação progressiva de elementos durante a rolagem, as animações suaves, a tipografia expressiva e o uso de cores simples com forte impacto visual. Utilizar transições para apresentar projetos e informações conforme o usuário avança pela página, mantendo uma identidade visual consistente.
- O que NÃO copiar: A reprodução exata das animações, da composição das páginas ou da identidade visual do site. Evitar excesso de efeitos e elementos que apareçam de maneira exagerada, prejudicando a leitura e a fluidez da navegação.
Justificativa: A principal inspiração é a reatividade da interface ao scroll, que torna a navegação dinâmica e mantém o interesse do visitante sem exigir interações complexas.

Site 2 — Overworld Audio
https://overworldaudio.com/
- O que copiar: A ideia de transformar a navegação em uma experiência exploratória, inspirada em mapas e ambientes de jogos. Adaptar essa proposta com elementos interativos, movimentos sutis de câmera, pontos clicáveis para acessar projetos e efeitos visuais que reforcem a sensação de imersão. Essa referência pode ser especialmente interessante para explorar recursos visuais e interativos no Antigravity.
- O que NÃO copiar: A reprodução integral do cenário 3D, do posicionamento dos elementos ou da navegação original. Evitar que a experiência dependa exclusivamente de movimentos complexos ou de recursos pesados, dificultando o acesso em dispositivos menos potentes.
Justificativa: A referência demonstra como um portfólio pode ir além de uma sequência tradicional de páginas, transformando a apresentação dos projetos em uma experiência interativa. A ideia é aproveitar esse conceito sem comprometer a usabilidade.

Site 3 — Fromanother
https://huyml.co/
- O que copiar: A combinação de animações fluidas, imagens de destaque, tipografia marcante e transições cinematográficas. Utilizar alternância entre seções claras e escuras para criar contraste visual, além de movimentos que valorizem os projetos e reforcem a identidade do portfólio.
- O que NÃO copiar: A reprodução exata da composição, dos efeitos de transição ou do estilo visual da marca. Evitar animações em todos os elementos simultaneamente e imagens excessivamente grandes que prejudiquem a organização das informações.
Justificativa: O principal aprendizado é que movimento, tipografia e composição visual podem trabalhar juntos para criar uma experiência sofisticada. Esses recursos devem destacar o conteúdo, e não competir com ele.

//Site 4 — Nick Ho Motorsports
https://nickho-motorsports.nl/
- O que copiar: A identidade visual forte, o contraste entre preto e branco, a tipografia robusta, os números em destaque e a apresentação cronológica de informações durante a rolagem. Esses recursos podem ser adaptados para organizar a trajetória do desenvolvedor, apresentar habilidades, destacar projetos e demonstrar a evolução dos trabalhos.
- O que NÃO copiar: A temática automobilística, os elementos gráficos específicos das corridas e a estrutura exata da página. Evitar utilizar números e textos de grande dimensão sem uma função clara na hierarquia visual.
Justificativa: O site demonstra como uma identidade visual bem definida pode transmitir personalidade e profissionalismo. A proposta é aproveitar a força gráfica e a organização das informações, adaptando-as à temática do portfólio.


Site 5 — Ciao Energy
https://www.ciaoenergy.com/
- O que copiar: A apresentação de um objeto tridimensional como elemento central da experiência, as animações sincronizadas com a rolagem e os movimentos suaves que dão destaque ao produto. No portfólio, esse conceito pode ser adaptado para apresentar um objeto 3D, um elemento gráfico interativo ou uma representação visual relacionada aos projetos.
- O que NÃO copiar: A reprodução exata da lata, dos elementos de identidade da marca ou das animações específicas do produto. Evitar utilizar modelos 3D apenas como decoração, principalmente quando eles aumentarem o tempo de carregamento sem agregar valor à experiência.
Justificativa: A principal inspiração é a capacidade de transformar a apresentação de um elemento em uma experiência visual interativa. O recurso deve ter uma função dentro do portfólio e contribuir para a identidade do projeto.

---

## Mapeamento e Implementação Concreta no Código

Cada uma das cinco referências foi minuciosamente traduzida para elementos reais em `index.html`, `style.css` e `script.js`:

1. **Format:**
   - Implementado na função `initScrollReveal()` em `script.js` com classes `.reveal-section` e `.animate-item` em `style.css`.
   - Utilização de `IntersectionObserver` com offsets sutis que revelam blocos textuais e visuais em cascata.

2. **Overworld Audio:**
   - Implementado na função `initOverworld3DMap()` em `script.js` com o canvas `#overworld3DCanvas` e os controles HUD `.overworld-hud-controls`.
   - Construção do cenário espacial isométrico com 3 monólitos tridimensionais (equalizador sonoro, prisma editorial e giroscópio quântico) conectados por condutos de dados em Spline 3D com pacotes luminosos em fluxo contínuo.
   - Implementação do módulo `SpatialAudioEngine` com Web Audio API para síntese procedural de acordes harmônicos sem carregamento de arquivos externos.

3. **Fromanother:**
   - Implementado no canvas `#bg3DCanvas` através da função `initAmbient3DUniverse()`, gerando um campo estelar com profundidade tridimensional que acompanha a rolagem de toda a página e responde ao cursor.
   - Uso de cartões com *glassmorphism* de alto contraste (`.interactive-card`, `.project-card`, `.overworld-node-preview`).

4. **Nick Ho Motorsports:**
   - Implementado na seção `// 01. TRAJETÓRIA` (`#sobre`) com o grid `.metrics-grid` e cartões `.metric-card`.
   - Números de grande porte (`+4`, `100%`, `+30`) em `Space Grotesk` com acento luminoso em verde-limão (`#C6FF00`), transmitindo autoridade e precisão técnica.

5. **Ciao Energy:**
   - Implementado na função `initHero3DExperience()` em `script.js` dentro da Fase 05 (Laboratório Criativo).
   - Objeto 3D central (núcleo cristalino + casca de icosaedro geodésico deformável proceduralmente via senoide matemática + anéis de órbita).
   - Reatividade direta ao movimento do mouse, arrasto livre (*drag*) e emissão de pulso quântico expansivo ao clique.

6. **Pedro — PVWebProjects (Game Design de Plataforma & Cidade Virtual):**
   - URL: https://www.pvwebprojects.com/pedro/
   - **O que copiar:** A experiência de navegação gamificada com personagem controlável atravessando regiões de uma cidade estilizada, física de colisões, suporte a pulo duplo, acompanhamento de câmera suave (*lerp*), sincronização entre o modo jogo e a navegação convencional (acessível) e pontos de interesse com atalhos de interação (`[E]` e botões contextuais).
   - **Adaptação Original:** Estética urbana underground brasileira de Rap, Trap e Streetwear (moletom oversized, calça baggy, tênis Nike Air Max TN clássico com amortecimento Tuned Air e corte americano com cachos castanhos), aliada a um sintetizador procedural de batida Trap 808 via Web Audio API e reatividade de luzes aos graves da música.
   - **Implementado:** No canvas `#urbanGameCanvas` pela função `initUrbanPlatformerGame()` e gerenciado pelo módulo `CityNavigator` em `script.js`.