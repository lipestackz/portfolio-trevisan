# Regras do projeto

- Site de portfólio pessoal em HTML, CSS e JavaScript puro (sem frameworks).
- Antes de criar ou alterar qualquer coisa, leia `referencias.md`, `identidade.md` e `funcionalidades.md`.
- Mantenha o código organizado: um arquivo CSS (`style.css`), um JS (`script.js`), e o HTML (`index.html`) com seções nomeadas.
- Nada de layout genérico de template: siga as referências e a identidade visual do aluno.
- Sempre responsivo (celular e computador).
- Depois de cada mudança, explique em 2 linhas o que foi feito.

---

# Arquitetura e Estrutura Atual do Projeto

- **`index.html`:** Estrutura semântica com as 10 fases da descida urbana (`#topo`, `#perfil`, `#atuacao`, `#trajetoria`, `#projetos`, `#web`, `#laboratorio`, `#codigo`, `#premios`, `#batalhas`, `#contato`), os 3 canvas independentes (`#fundo`, `#cena3d`, `#jogo`), gaveta de navegação mobile acessível, HUD, controles touch responsivos, diálogo modal de pausa e formulário de contato com validação em tempo real.
- **`style.css`:** Folha de estilos única contendo tokens de design underground streetwear, tipografia retro/brutalista (`Pixelify Sans`, `Archivo`, `Silkscreen`), física de molas 3D (`perspective`), gaveta mobile, HUDs flutuantes, animações glitch e regras estritas de responsividade para celular, tablet e desktop.
- **`script.js`:** Motor modular em JavaScript puro estruturado sob o namespace `PV`:
  1. `PV.qualidade`: Ajuste adaptativo de performance com base no hardware, GPU e conexões.
  2. `PV.som`: Sintetizador Web Audio API puro com beat machine trap 808, SFX procedurais e controle de suspensão em segundo plano.
  3. `PV.sprites`: Renderizador pixel art do protagonista streetwear (Nike Air Max TN com Tuned Air laranja, moletom oversized, calça baggy jeans, fade americano e cachos) e entidades colecionáveis.
  4. `PV.mundo`: Leitura de caixas AABB sólidas com a árvore DOM em tempo real e re-calibração responsiva no resize/load.
  5. `PV.efeitos3d`: Simulação física de molas nos cartões DOM com ondas de choque e amortecimento em repouso.
  6. `PV.fundo`: Partículas 2D em paralaxe com gradiente volumétrico.
  7. `PV.cena3d`: Três geometrias Three.js r128 com deformação senoidal procedural em tempo real, anel orbital verde-limão e adaptação de câmera para telas mobile verticais.
  8. `PV.jogo`: Física de plataforma 2.5D com duplo salto, descida por plataformas, soco aéreo, desbloqueio de skills (`data-skill`), itens de café restauradores de vida (`data-cafe`), checkpoints por fase e sincronização bidirecional jogo/leitura.
  9. `PV.site`: Barra de progresso ao scroll, gaveta mobile acessível, scroll spy e formulário de contato com validação em tempo real e WCAG.
- **`assets/three.min.js`:** Biblioteca Three.js r128 armazenada localmente para funcionamento 100% offline e sem dependências externas.