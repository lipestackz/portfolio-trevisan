/**
 * ==========================================================================
 * PORTFÓLIO JOGÁVEL — FELIPE TREVISAN
 * Arquitetura e Engenharia inspiradas em pvwebprojects.com/pedro/
 * Streetwear, Nike Air Max TN, Three.js, WebGL e Web Audio API
 * ==========================================================================
 */

window.PV = window.PV || {};

(function () {
  'use strict';

  /* ==========================================================================
     1. QUALIDADE & DESEMPENHO (PV.qualidade)
     ========================================================================== */
  PV.qualidade = (function () {
    var NIVEIS = ['baixo', 'medio', 'alto'];
    var ouvintes = [];
    var escolha = 'auto';
    try { escolha = localStorage.getItem('descida.qualidade') || 'auto'; } catch (e) {}
    if (escolha !== 'auto' && NIVEIS.indexOf(escolha) < 0) escolha = 'auto';

    function placaDeVideo() {
      var r = { webgl: false, software: false, fraca: false };
      try {
        var c = document.createElement('canvas');
        var gl = c.getContext('webgl', { failIfMajorPerformanceCaveat: true });
        if (!gl) {
          gl = c.getContext('webgl');
          if (gl) r.software = true;
        }
        if (!gl) return r;
        r.webgl = true;
        var info = gl.getExtension('WEBGL_debug_renderer_info');
        var nome = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER) || '');
        if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(nome)) r.software = true;
        if (/intel.*(hd|uhd) graphics (4|5|6)\d\d\b|intel.*hd graphics\b(?! \d)|mali-[gt]\d{1,2}\b|adreno[^0-9]*[3-5]\d\d|powervr|gma/i.test(nome)) r.fraca = true;
        var fim = gl.getExtension('WEBGL_lose_context');
        if (fim) fim.loseContext();
      } catch (e) {}
      return r;
    }

    function palpite() {
      var nucleos = navigator.hardwareConcurrency || 4;
      var memoria = navigator.deviceMemory || 8;
      var rede = navigator.connection || {};
      var p = 2;
      if (nucleos <= 4 || memoria <= 4) p = 1;
      if (nucleos <= 2 || memoria <= 2 || rede.saveData) p = 0;
      var gpu = placaDeVideo();
      if (!gpu.webgl || gpu.software) p = Math.min(p, 0);
      else if (gpu.fraca) p = Math.min(p, 1);
      if (window.matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 820) p = Math.min(p, 1);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) p = Math.min(p, 1);
      return NIVEIS[p];
    }

    var nivel = escolha === 'auto' ? palpite() : escolha;

    function aplicarClasse() {
      var h = document.documentElement;
      NIVEIS.forEach(function (n) { h.classList.remove('q-' + n); });
      h.classList.add('q-' + nivel);
    }
    aplicarClasse();

    var avisoEl = null, avisou = false;
    function avisar() {
      avisoEl = avisoEl || document.getElementById('aviso');
      if (!avisoEl || avisou) return;
      avisou = true;
      avisoEl.textContent = 'Qualidade ajustada para o seu aparelho';
      avisoEl.classList.add('on');
      setTimeout(function () { avisoEl.classList.remove('on'); }, 2600);
    }

    function mudar(n, automatico) {
      if (n === nivel) return;
      nivel = n;
      aplicarClasse();
      ouvintes.forEach(function (fn) { try { fn(nivel); } catch (e) { console.error(e); } });
      if (automatico) avisar();
    }

    return {
      get nivel() { return nivel; },
      get escolha() { return escolha; },
      aoMudar: function (fn) { ouvintes.push(fn); },
      escolher: function (e) {
        escolha = e;
        try { localStorage.setItem('descida.qualidade', e); } catch (err) {}
        mudar(e === 'auto' ? palpite() : e, false);
      },
      tem3d: function () { return nivel !== 'baixo'; }
    };
  })();

  /* ==========================================================================
     2. SOM & BEAT TRAP 808 (PV.som)
     ========================================================================== */
  PV.som = (function () {
    var ctx = null, mestre = null, ruidoBuf = null;
    var mudo = false;
    var trapLigado = false;
    var timerTrap = null;
    var step = 0;
    var bpm = 130;
    var stepInterval = (60 / bpm) / 4;

    try { mudo = localStorage.getItem('descida.mudo') === '1'; } catch (e) {}

    function ativar() {
      if (!ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        ctx = new AC();
        mestre = ctx.createGain();
        mestre.gain.value = 0.22;
        mestre.connect(ctx.destination);

        ruidoBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        var d = ruidoBuf.getChannelData(0);
        for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      if (ctx.state === 'suspended') ctx.resume();
    }

    function nota(freq, dur, tipo, vol, deslize, atraso) {
      if (!ctx || mudo) return;
      var t = ctx.currentTime + (atraso || 0);
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = tipo || 'square';
      o.frequency.setValueAtTime(freq, t);
      if (deslize && deslize !== 1) {
        o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * deslize), t + dur);
      }
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.4, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(mestre);
      o.onended = function () {
        try { o.disconnect(); g.disconnect(); } catch (err) {}
      };
      o.start(t); o.stop(t + dur + 0.03);
    }

    function ruido(dur, vol, corte, atraso) {
      if (!ctx || mudo) return;
      var t = ctx.currentTime + (atraso || 0);
      var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = ruidoBuf;
      f.type = 'lowpass'; f.frequency.value = corte || 1200;
      g.gain.setValueAtTime(vol || 0.3, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(mestre);
      s.onended = function () {
        try { s.disconnect(); f.disconnect(); g.disconnect(); } catch (err) {}
      };
      s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
    }

    // Suspende e retoma o áudio ao alternar de aba para evitar desperdício de CPU
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (ctx && ctx.state === 'running') ctx.suspend();
      } else {
        if (ctx && ctx.state === 'suspended' && !mudo) ctx.resume();
      }
    });

    function arpejo(freqs, passo, tipo, vol, dur) {
      freqs.forEach(function (f, i) { nota(f, dur || 0.13, tipo, vol, 1, i * passo); });
    }

    // Sequenciador do beat trap 808
    function trapLoop() {
      if (!trapLigado || mudo || !ctx) return;
      var s = step % 32;
      var t = ctx.currentTime;

      if (s === 0 || s === 16) {
        // Kick + 808 punch
        nota(140, 0.18, 'sine', 0.6, 0.3, 0);
        nota(46, 0.45, 'sine', 0.5, 0.95, 0.02);
      } else if (s === 6 || s === 22) {
        nota(120, 0.12, 'sine', 0.4, 0.35, 0);
      } else if (s === 10) {
        nota(52, 0.38, 'sine', 0.45, 0.98, 0);
      } else if (s === 26) {
        nota(39, 0.42, 'sine', 0.48, 0.98, 0);
      }

      if (s === 8 || s === 24) {
        // Snare
        ruido(0.12, 0.35, 2200, 0);
        nota(190, 0.08, 'triangle', 0.25, 0.5, 0);
      }

      // Hi-hats
      if (s >= 28) {
        ruido(0.02, 0.18, 7500, 0);
      } else if (s % 2 === 0) {
        ruido(0.025, 0.14, 6500, 0);
      }

      step++;
      timerTrap = setTimeout(trapLoop, stepInterval * 1000);
    }

    var efeitos = {
      pulo:      function () { nota(330, 0.13, 'square', 0.28, 2.1); },
      pulo2:     function () { nota(520, 0.1, 'square', 0.24, 2); nota(880, 0.12, 'triangle', 0.22, 1.4, 0.05); },
      pouso:     function () { ruido(0.07, 0.22, 700); },
      passo:     function () { ruido(0.025, 0.06, 2400); },
      bit:       function (seq) { nota(988 * Math.pow(2, Math.min(seq || 0, 12) / 12), 0.08, 'square', 0.2, 1.02); },
      skill:     function () { arpejo([523, 659, 784, 1047, 1319], 0.055, 'square', 0.22); },
      trofeu:    function () { arpejo([392, 523, 659, 784, 1047, 784, 1047], 0.07, 'square', 0.24, 0.16); },
      cafe:      function () { arpejo([660, 880, 1100], 0.06, 'triangle', 0.3); },
      esmaga:    function (c) { nota(260 + (c || 0) * 60, 0.12, 'square', 0.32, 0.45); ruido(0.08, 0.25, 1800); },
      dano:      function () { nota(220, 0.32, 'sawtooth', 0.32, 0.35); ruido(0.18, 0.2, 900); },
      socoIni:   function () { nota(700, 0.12, 'triangle', 0.2, 0.5); },
      soco:      function () { nota(110, 0.4, 'sine', 0.75, 0.35); ruido(0.32, 0.5, 520); },
      fase:      function () { arpejo([392, 494, 587, 784], 0.075, 'square', 0.22, 0.14); },
      panico:    function () { arpejo([440, 370, 311, 262, 196], 0.11, 'sawtooth', 0.26, 0.2); },
      buraco:    function () { nota(600, 0.25, 'triangle', 0.18, 0.4); },
      fim:       function () {
        arpejo([523, 659, 784, 1047], 0.09, 'square', 0.24, 0.18);
        [1047, 1319, 1568, 2093].forEach(function (f, i) { nota(f, 0.35, 'triangle', 0.2, 1, 0.42 + i * 0.1); });
      },
      bloco:     function () { nota(180, 0.09, 'square', 0.3, 0.7); nota(700, 0.07, 'triangle', 0.18, 1.3, 0.03); },
      moeda:     function () { nota(1320, 0.06, 'square', 0.16, 1); nota(1760, 0.12, 'square', 0.16, 1, 0.05); },
      clique:    function () { nota(1200, 0.04, 'square', 0.12, 1); }
    };

    return {
      ativar: ativar,
      tocar: function (nome, arg) { if (efeitos[nome]) efeitos[nome](arg); },
      alternar: function () {
        ativar();
        mudo = !mudo;
        trapLigado = !mudo;
        try { localStorage.setItem('descida.mudo', mudo ? '1' : '0'); } catch (e) {}
        if (trapLigado) {
          step = 0;
          trapLoop();
        } else if (timerTrap) {
          clearTimeout(timerTrap);
        }
        return mudo;
      },
      iniciarTrap: function () {
        ativar();
        if (!mudo && !trapLigado) {
          trapLigado = true;
          step = 0;
          trapLoop();
        }
      },
      pararTrap: function () {
        trapLigado = false;
        if (timerTrap) clearTimeout(timerTrap);
      },
      get mudo() { return mudo; }
    };
  })();

  /* ==========================================================================
     3. SPRITES PIXEL ART — PROTAGONISTA STREETWEAR (PV.sprites)
     ========================================================================== */
  PV.sprites = (function () {
    // Paleta de cores urbana com cabelo cacheado, moletom oversized e Nike Air Max TN
    var COR = {
      K: '#060a12',                           // Contorno
      H: '#3a2110', h: '#5c381c',              // Cabelo castanho cacheado
      S: '#f4ceb2', s: '#d99e7b',              // Pele e fade nas têmporas
      E: '#121724', m: '#9e523f',              // Olho, boca
      P: '#1e2229', c: '#14171d', L: '#35d0e5', // Moletom oversized chumbo/preto
      J: '#1b2333', j: '#131926',              // Calça baggy jeans escura
      T: '#ffffff', t: '#95a1af',              // Tênis Nike TN branco/cinza
      O: '#ff6600', o: '#ff9933',              // Bolha de ar Tuned Air laranja brilhante
      R: '#ff4d7e', r: '#ffb3c8', V: '#c2265a', // Bug
      b: '#8a2450', W: '#ffffff', a: '#ff8fae',
      Q: '#9b5cff', q: '#e1d0ff',              // Glitch
      G: '#35d0e5', g: '#c9f6fc',              // Bit ciano
      Y: '#e0a84f', y: '#fff0c4', B: '#7a4f1a', // Troféu ouro
      k: '#24364b', M: '#f4efe6', C: '#6b3b1f'  // Café
    };

    // Cabeça com cachos volumosos e degradê americano (low/mid fade)
    var CABECA = [
      '....KKHHHHHK....',
      '..KKHHHhhHHhKK..',
      '.KHHHhhhhHHhhHK.',
      '.KHHHHhHHhhhhHK.',
      'KHHHssssssHHHHK.',
      'KHHsSSSSSSSHHHK.',
      '.KsSSSSSSSSSSK..',
      '.KsSSSSESSEESK..',
      '.KsSSSSESSEESK..',
      '..KsSSSSSSSSSK..',
      '..KKSSSSSmmSK...',
      '....KKSSSSKK....'
    ];
    var CABECA_PISCA = CABECA.map(function (l, i) { return (i === 7 || i === 8) ? l.replace(/E/g, 'S') : l; });

    // Tronco: Moletom oversized com caimento largo sobre a calça
    function tronco(add, y) {
      y = y || 12;
      add(3, y, 10, 6, 'P');        // Moletom oversized
      add(5, y, 6, 2, 'c');         // Capuz / gola funda
      add(8, y + 3, 2, 1, 'L');     // Tag ciano no peito
      add(3, y + 6, 10, 1, 'c');    // Barra elástica do moletom
    }

    function braco(add, x, y, paraCima) {
      if (paraCima) {
        add(x, y, 3, 2, 'P');
        add(x, y - 2, 2, 2, 'S');
      } else {
        add(x, y, 3, 3, 'P');
        add(x, y + 3, 2, 2, 'S');
      }
    }

    // Perna e Tênis Nike Air Max TN com bolha de ar alaranjada
    function pernaTN(add, x, y, h, corJeans, sx, sy) {
      add(x, y, 3, h, corJeans);    // Calça baggy jeans larga
      add(sx, sy, 4, 2, 'T');       // Base do Nike TN
      add(sx + 1, sy + 1, 2, 1, 'O'); // Bolha de ar Tuned Air laranja
      add(sx + 3, sy, 1, 2, 'K');   // Solado traseiro
    }

    function pose(nome, q) {
      var partes = [], cab = 0, dy = 0, pisca = false;
      function add(x, y, w, h, cor) { partes.push([x, y + dy, w, h, cor]); }

      switch (nome) {
        case 'correr':
          dy = (q % 2) ? -1 : 0; cab = dy;
          tronco(add);
          if (q === 0) {
            braco(add, 1, 14); braco(add, 12, 12);
            pernaTN(add, 3, 18, 2, 'j', 1, 20);
            pernaTN(add, 9, 18, 3, 'J', 9, 21);
          } else if (q === 2) {
            braco(add, 1, 12); braco(add, 12, 14);
            pernaTN(add, 9, 18, 3, 'j', 9, 21);
            pernaTN(add, 3, 18, 2, 'J', 1, 20);
          } else {
            braco(add, 1, 13); braco(add, 12, 13);
            pernaTN(add, 5, 18, 3, 'j', 4, 21);
            pernaTN(add, 7, 18, 3, 'J', 8, 21);
          }
          break;

        case 'pulo':
          tronco(add);
          braco(add, 1, 13);
          braco(add, 12, 10, true);
          pernaTN(add, 4, 18, 2, 'j', 3, 20);
          pernaTN(add, 8, 18, 2, 'J', 9, 20);
          break;

        case 'cair':
        case 'dano':
          tronco(add);
          add(0, 11, 3, 2, 'P'); add(0, 9, 2, 2, 'S');
          add(13, 11, 3, 2, 'P'); add(14, 9, 2, 2, 'S');
          pernaTN(add, 3, 18, 3, 'j', 2, 21);
          pernaTN(add, 9, 18, 3, 'J', 9, 21);
          break;

        case 'soco':
          cab = 3;
          tronco(add, 14);
          add(1, 15, 3, 2, 'P'); add(1, 17, 2, 2, 'S');
          add(12, 15, 3, 2, 'P'); add(12, 17, 2, 2, 'S');
          pernaTN(add, 3, 20, 1, 'j', 2, 21);
          pernaTN(add, 9, 20, 1, 'J', 9, 21);
          add(4, 19, 3, 1, 'j'); add(8, 19, 3, 1, 'J');
          break;

        default: // Parado / Respiração
          cab = (q === 1) ? 1 : 0;
          pisca = (q === 2);
          tronco(add);
          braco(add, 1, 13); braco(add, 12, 13);
          pernaTN(add, 4, 18, 3, 'j', 3, 21);
          pernaTN(add, 8, 18, 3, 'J', 8, 21);
      }
      return { partes: partes, cab: cab, pisca: pisca };
    }

    function desenharMapa(c, mapa, ox, oy) {
      for (var y = 0; y < mapa.length; y++) {
        var linha = mapa[y];
        for (var x = 0; x < linha.length; x++) {
          var ch = linha[x];
          if (ch === '.') continue;
          c.fillStyle = COR[ch];
          c.fillRect(ox + x, oy + y, 1, 1);
        }
      }
    }

    function novoCanvas(w, h) {
      var cv = document.createElement('canvas');
      cv.width = Math.max(1, Math.ceil(w)); cv.height = Math.max(1, Math.ceil(h));
      var c = cv.getContext('2d');
      c.imageSmoothingEnabled = false;
      return { cv: cv, c: c };
    }

    function renderPersonagem(nome, q, esc) {
      var inf = pose(nome, q);
      var obj = novoCanvas(16 * esc, 24 * esc);
      obj.c.scale(esc, esc);
      inf.partes.forEach(function (p) {
        obj.c.fillStyle = COR[p[4]];
        obj.c.fillRect(p[0], p[1], p[2], p[3]);
      });
      desenharMapa(obj.c, inf.pisca ? CABECA_PISCA : CABECA, 0, inf.cab);
      return obj.cv;
    }

    // Inimigos e Colecionáveis
    var BUG = [
      '..K......K..',
      '.KRK....KRK.',
      '..KRRRRRRK..',
      '.KRRVRRVRRK.',
      'KRRWRRRRWRRK',
      'KRRERRRRERRK',
      'KRRRRRRRRRRK',
      '.KRRrrrrRRK.',
      '.KKRRRRRRKK.',
      'K.KKKKKKKK.K',
      'K..K....K..K',
      '.KK......KK.'
    ];

    var BIT = [
      '..GGGG..',
      '.GggggG.',
      'GggGGggG',
      'GggGGggG',
      'GggGGggG',
      'GggGGggG',
      '.GggggG.',
      '..GGGG..'
    ];

    var TROFEU = [
      'YYYYYYYY',
      '.YYYYYY.',
      '..YYYY..',
      '...YY...',
      '..YYYY..',
      '.YYYYYY.',
      'YYYYYYYY'
    ];

    var CAFE = [
      '..KKKK..',
      '.KMMMMK.',
      'KMMCCMMK',
      'KMMCCMMK',
      '.KMMMMK.',
      '..KKKK..'
    ];

    var cache = {};
    function get(chave, esc, construtor) {
      var k = chave + '@' + esc;
      if (!cache[k]) cache[k] = construtor(esc);
      return cache[k];
    }

    return {
      personagem: function (nome, q, esc) {
        return get('p_' + nome + '_' + q, esc, function (e) { return renderPersonagem(nome, q, e); });
      },
      bug: function (esc) {
        return get('bug', esc, function (e) {
          var o = novoCanvas(12 * e, 12 * e);
          o.c.scale(e, e);
          desenharMapa(o.c, BUG, 0, 0);
          return o.cv;
        });
      },
      bit: function (esc) {
        return get('bit', esc, function (e) {
          var o = novoCanvas(8 * e, 8 * e);
          o.c.scale(e, e);
          desenharMapa(o.c, BIT, 0, 0);
          return o.cv;
        });
      },
      trofeu: function (esc) {
        return get('trofeu', esc, function (e) {
          var o = novoCanvas(8 * e, 8 * e);
          o.c.scale(e, e);
          desenharMapa(o.c, TROFEU, 0, 0);
          return o.cv;
        });
      },
      cafe: function (esc) {
        return get('cafe', esc, function (e) {
          var o = novoCanvas(8 * e, 8 * e);
          o.c.scale(e, e);
          desenharMapa(o.c, CAFE, 0, 0);
          return o.cv;
        });
      }
    };
  })();

  /* ==========================================================================
     4. MUNDO & GEOMETRIA DO DOM (PV.mundo)
     ========================================================================== */
  PV.mundo = (function () {
    var M = {
      plats: [],
      porEl: new Map(),
      fases: [],
      pisos: [],
      W: 0, H: 0,
      esc: 3,
      versao: 0
    };

    function posDoc(el) {
      var x = 0, y = 0, n = el;
      while (n) {
        x += n.offsetLeft; y += n.offsetTop;
        var pai = n.offsetParent;
        if (pai) { x += pai.clientLeft; y += pai.clientTop; }
        n = pai;
      }
      return { x: x, y: y };
    }

    var medidor = document.createElement('canvas').getContext('2d');
    function topoDasLetras(el) {
      var cs = getComputedStyle(el), fs = parseFloat(cs.fontSize);
      medidor.font = cs.fontWeight + ' ' + fs + 'px ' + cs.fontFamily;
      var m = medidor.measureText('H');
      var sobe = m.fontBoundingBoxAscent, desce = m.fontBoundingBoxDescent, cap = m.actualBoundingBoxAscent;
      if (!(sobe > 0) || !(cap > 0)) return 0.14 * fs;
      var lh = cs.lineHeight === 'normal' ? sobe + desce : parseFloat(cs.lineHeight);
      return (lh - (sobe + desce)) / 2 + sobe - cap;
    }

    function separarLetras(el) {
      if (el.querySelector('.l')) return;
      var texto = el.textContent.replace(/\s+/g, ' ').trim();
      if (!el.closest('h1')) el.setAttribute('aria-label', texto);
      el.textContent = '';
      var caixa = document.createElement('span');
      caixa.setAttribute('aria-hidden', 'true');
      texto.split(' ').forEach(function (palavra, i) {
        if (i) caixa.appendChild(document.createTextNode(' '));
        var p = document.createElement('span');
        p.className = 'pal';
        Array.prototype.forEach.call(palavra, function (ch) {
          var l = document.createElement('span');
          l.className = 'l'; l.textContent = ch;
          p.appendChild(l);
        });
        caixa.appendChild(p);
      });
      el.appendChild(caixa);
    }

    var ALTURA_CHAO = 10;
    function montarChao(f, buraco) {
      var el = f.el._chao;
      if (!el) {
        el = document.createElement('div');
        el.className = 'chao';
        el.setAttribute('aria-hidden', 'true');
        el.innerHTML = buraco ? '<i></i><i></i><b class="buraco"></b>' : '<i></i>';
        if (!buraco) el.classList.add('fim');
        f.el.appendChild(el);
        f.el._chao = el;
      }
      if (!buraco) return;
      var x0 = buraco.x0 - f.x, x1 = buraco.x1 - f.x, partes = el.children;
      partes[0].style.cssText = 'left:0;width:' + x0 + 'px';
      partes[1].style.cssText = 'left:' + x1 + 'px;right:0';
      partes[2].style.cssText = 'left:' + x0 + 'px;width:' + (x1 - x0) + 'px';
    }

    M.preparar = function () {
      document.querySelectorAll('[data-letras]').forEach(separarLetras);
    };

    M.medir = function () {
      var raiz = document.documentElement;
      M.W = raiz.clientWidth;
      M.H = raiz.scrollHeight;
      M.esc = M.W < 720 ? 2 : 3;
      M.plats = [];
      M.porEl = new Map();

      document.querySelectorAll('[data-plat]').forEach(function (el) {
        var w = el.offsetWidth;
        if (!el.offsetParent || w < 16) return;
        var p = posDoc(el), dy = 0, afunda = 0;
        if (el.hasAttribute('data-letras')) {
          dy = topoDasLetras(el);
          afunda = 0.05 * parseFloat(getComputedStyle(el).fontSize);
        } else if (el.dataset.dy) {
          dy = parseFloat(el.dataset.dy) * parseFloat(getComputedStyle(el).fontSize);
        }
        var plat = {
          x: p.x, y: Math.round(p.y + dy), w: w, el: el,
          solido: false, cartao: el.classList.contains('cartao'), letras: null, afunda: afunda,
          base: p.y + el.offsetHeight
        };
        if (el.hasAttribute('data-letras')) {
          var ls = el.querySelectorAll('.l');
          if (ls.length) {
            var topo = posDoc(ls[0]).y;
            plat.letras = [];
            for (var i = 0; i < ls.length; i++) {
              var q = posDoc(ls[i]);
              if (Math.abs(q.y - topo) > 6) break;
              plat.letras.push({ x0: q.x, x1: q.x + ls[i].offsetWidth, el: ls[i] });
            }
            if (plat.letras.length) {
              plat.x = plat.letras[0].x0;
              plat.w = plat.letras[plat.letras.length - 1].x1 - plat.x;
            }
          }
        }
        M.plats.push(plat);
        M.porEl.set(el, plat);
      });

      // Medição das Fases e Chãos
      M.fases = [];
      var secoes = document.querySelectorAll('.fase[data-fase]');
      secoes.forEach(function (sec, idx) {
        var p = posDoc(sec);
        M.fases.push({
          idx: idx,
          id: sec.id,
          nome: sec.dataset.nome || sec.id,
          el: sec,
          x: p.x, y: p.y,
          w: sec.offsetWidth, h: sec.offsetHeight
        });
      });

      // Buracos e pisos
      M.pisos = [];
      for (var f = 0; f < M.fases.length; f++) {
        var fa = M.fases[f];
        var yPiso = fa.y + fa.h - ALTURA_CHAO;
        var buraco = null;
        if (f < M.fases.length - 1) {
          var px = (f % 2 === 0) ? (fa.w * 0.72) : (fa.w * 0.28);
          buraco = { x0: Math.round(px - 45), x1: Math.round(px + 45) };
        }
        montarChao(fa, buraco);
        if (buraco) {
          M.plats.push({ x: fa.x, y: yPiso, w: buraco.x0 - fa.x, el: fa.el, solido: true, base: yPiso + ALTURA_CHAO });
          M.plats.push({ x: buraco.x1, y: yPiso, w: fa.x + fa.w - buraco.x1, el: fa.el, solido: true, base: yPiso + ALTURA_CHAO });
        } else {
          M.plats.push({ x: fa.x, y: yPiso, w: fa.w, el: fa.el, solido: true, base: yPiso + ALTURA_CHAO });
        }
      }

      M.plats.sort(function (a, b) { return a.y - b.y; });
      M.versao++;
    };

    window.addEventListener('resize', function () {
      M.medir();
    });
    window.addEventListener('load', function () {
      M.medir();
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        M.medir();
      });
    }

    return M;
  })();

  /* ==========================================================================
     5. EFEITOS 3D NOS ELEMENTOS (PV.efeitos3d)
     ========================================================================== */
  PV.efeitos3d = (function () {
    var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var estados = new Map();
    var RAD = Math.PI / 180;

    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function (e) {
      semMovimento = e.matches;
      if (semMovimento) {
        estados.forEach(function (s) { s.el.style.transform = ''; });
      }
    });

    function estado(el) {
      var s = estados.get(el);
      if (!s) {
        s = { el: el, ty: 0, rz: 0, rx: 0, ry: 0, v: { ty: 0, rz: 0, rx: 0, ry: 0 }, alvo: { ty: 0, rz: 0, rx: 0, ry: 0 }, ativo: false };
        el.style.transformOrigin = '50% 0';
        el.style.willChange = 'transform';
        estados.set(el, s);
      }
      s.ativo = true;
      return s;
    }

    function peso(el, fr, largura) {
      if (semMovimento || !el) return;
      var s = estado(el), lado = Math.max(-1, Math.min(1, (fr - 0.5) * 2));
      var maxRz = Math.min(2.4, Math.asin(Math.min(1, 9 / Math.max(20, largura / 2))) / RAD);
      s.alvo.ty = 4; s.alvo.rz = lado * maxRz; s.alvo.rx = 6; s.alvo.ry = lado * 6;
      s.ativo = true;
    }

    function pouso(el, fr, forca) {
      if (semMovimento || !el) return;
      var s = estado(el);
      s.v.ty += 160 * forca; s.v.rx += 140 * forca; s.v.rz += (fr - 0.5) * 110 * forca;
      s.ativo = true;
    }

    function cabecada(el, fr) {
      if (semMovimento || !el) return;
      var s = estado(el);
      s.v.ty -= 280; s.v.rx -= 150; s.v.rz += (0.5 - fr) * 120;
      s.ativo = true;
    }

    function onda(cx, cy, raio, forca) {
      if (semMovimento || !PV.mundo) return;
      PV.mundo.plats.forEach(function (pl) {
        if (!pl.el || pl.solido) return;
        var alto = pl.base - pl.y;
        var dx = Math.max(0, pl.x - cx, cx - (pl.x + pl.w));
        var dy = Math.max(0, pl.y - cy, cy - (pl.y + alto));
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d > raio) return;
        var f = forca * (1 - d / raio);
        setTimeout(function () {
          var s = estado(pl.el);
          s.v.ty += 320 * f; s.v.rx += 280 * f;
          s.ativo = true;
        }, d * 0.7);
      });
    }

    function entrar(el) {
      if (semMovimento) return;
      var s = estado(el);
      s.rx = -75; s.ty = -14; s.v.rx = 0; s.v.ty = 0;
      s.ativo = true;
    }

    // Loop de molas otimizado
    var antes = performance.now();
    function loopMolas(agora) {
      requestAnimationFrame(loopMolas);
      if (document.hidden || semMovimento) return;
      var dt = Math.min((agora - antes) / 1000, 0.05);
      antes = agora;

      estados.forEach(function (s) {
        if (!s.ativo) return;

        ['ty', 'rx', 'rz', 'ry'].forEach(function (eixo) {
          var diff = s.alvo[eixo] - s[eixo];
          s.v[eixo] += (diff * 240 - s.v[eixo] * 14) * dt;
          s[eixo] += s.v[eixo] * dt;
        });
        s.alvo.ty *= 0.9;
        s.alvo.rx *= 0.9;
        s.alvo.rz *= 0.9;
        s.alvo.ry *= 0.9;

        var emMovimento = Math.abs(s.ty) > 0.05 || Math.abs(s.rx) > 0.05 || Math.abs(s.rz) > 0.05 || Math.abs(s.ry) > 0.05 || Math.abs(s.v.ty) > 0.5;

        if (emMovimento) {
          s.el.style.transform = 'perspective(900px) translateY(' + s.ty.toFixed(1) + 'px) rotateX(' + s.rx.toFixed(1) + 'deg) rotateZ(' + s.rz.toFixed(1) + 'deg) rotateY(' + s.ry.toFixed(1) + 'deg)';
        } else {
          s.ty = 0; s.rx = 0; s.rz = 0; s.ry = 0;
          s.v.ty = 0; s.v.rx = 0; s.v.rz = 0; s.v.ry = 0;
          s.alvo.ty = 0; s.alvo.rx = 0; s.alvo.rz = 0; s.alvo.ry = 0;
          s.el.style.transform = '';
          s.ativo = false; // Entra em repouso até o próximo impacto
        }
      });
    }
    requestAnimationFrame(loopMolas);

    return {
      peso: peso,
      pouso: pouso,
      cabecada: cabecada,
      onda: onda,
      entrar: entrar
    };
  })();

  /* ==========================================================================
     6. FUNDO PARALAXE 2D (PV.fundo)
     ========================================================================== */
  PV.fundo = (function () {
    var cv = document.getElementById('fundo');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    var W = 0, H = 0, DPR = 1, parts = [];
    var CAMADAS = [0.12, 0.3, 0.55];
    var PARADAS = [
      [0.00, [53, 208, 229]],
      [0.45, [96, 160, 230]],
      [0.75, [224, 168, 79]],
      [1.00, [255, 110, 70]]
    ];

    function corEm(t) {
      for (var i = 1; i < PARADAS.length; i++) {
        if (t <= PARADAS[i][0]) {
          var a = PARADAS[i - 1], b = PARADAS[i], f = (t - a[0]) / (b[0] - a[0]);
          return [0, 1, 2].map(function (k) { return Math.round(a[1][k] + (b[1][k] - a[1][k]) * f); });
        }
      }
      return PARADAS[PARADAS.length - 1][1];
    }

    function medir() {
      DPR = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
      parts = [];
      var n = Math.min(120, Math.round((W * H) / 10000));
      for (var i = 0; i < n; i++) {
        var c = i % 3;
        parts.push({
          x: Math.random() * W, y: Math.random() * H, c: c,
          tam: c === 2 ? 3 : (c === 1 ? 2 : 1.5),
          deriva: 6 + Math.random() * 12 * (c + 1),
          alfa: 0.25 + c * 0.2 + Math.random() * 0.15
        });
      }
    }

    var ultimoY = window.scrollY, vel = 0, antes = performance.now();
    function desenhar(dt) {
      var y = window.scrollY, d = y - ultimoY;
      ultimoY = y;
      vel += (d - vel) * 0.25;

      var alt = Math.max(1, document.documentElement.scrollHeight - H);
      var prof = Math.min(1, Math.max(0, y / alt));
      var cor = corEm(prof);

      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // Gradiente suave de profundidade
      var g = ctx.createRadialGradient(W / 2, H * 1.15, 0, W / 2, H * 1.15, Math.max(W, H) * 0.9);
      var forca = 0.04 + prof * prof * 0.22;
      g.addColorStop(0, 'rgba(' + cor.join(',') + ',' + forca + ')');
      g.addColorStop(1, 'rgba(' + cor.join(',') + ',0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      var risco = Math.min(Math.abs(vel), 60);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i], f = CAMADAS[p.c];
        p.y -= d * f + p.deriva * dt;
        if (p.y < -80) { p.y += H + 160; p.x = Math.random() * W; }
        if (p.y > H + 80) { p.y -= H + 160; p.x = Math.random() * W; }
        var comp = p.tam + risco * f * 1.6;
        ctx.fillStyle = 'rgba(' + cor.join(',') + ',' + p.alfa + ')';
        ctx.fillRect(p.x, vel > 0 ? p.y : p.y - comp + p.tam, p.tam, comp);
      }
    }

    function laco(agora) {
      requestAnimationFrame(laco);
      var dt = Math.min((agora - antes) / 1000, 0.1);
      antes = agora;
      if (!document.hidden) desenhar(dt);
    }

    window.addEventListener('resize', medir);
    medir();
    requestAnimationFrame(laco);
  })();

  /* ==========================================================================
     7. CENA 3D COM THREE.JS LOCAL (PV.cena3d)
     ========================================================================== */
  PV.cena3d = (function () {
    var cv = document.getElementById('cena3d');
    if (!cv || !window.THREE) return { evento: function () {} };

    var T = window.THREE;
    var render, cena, camera;
    var malhaMicro, malhaGeom, malhaTrofeu, anelOrbital;
    var posOrig2 = null;
    var W = window.innerWidth, H = window.innerHeight;

    try {
      render = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: true, powerPreference: 'high-performance' });
      render.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      render.setSize(W, H);
    } catch (e) {
      return { evento: function () {} };
    }

    cena = new T.Scene();
    camera = new T.PerspectiveCamera(35, W / H, 1, 800);
    camera.position.set(0, 0, 110);

    // Luzes
    var amb = new T.AmbientLight(0xffffff, 0.7);
    cena.add(amb);
    var dir = new T.DirectionalLight(0x35d0e5, 1.4);
    dir.position.set(40, 60, 50);
    cena.add(dir);

    // 1. Objeto 3D Fase Atuação (Microcontrolador Wireframe)
    var g1 = new T.BoxGeometry(26, 14, 4, 8, 8, 4);
    var m1 = new T.MeshStandardMaterial({ color: 0x35d0e5, wireframe: true, transparent: true, opacity: 0.35 });
    malhaMicro = new T.Mesh(g1, m1);
    malhaMicro.position.set(38, 20, -10);
    cena.add(malhaMicro);

    // 2. Objeto 3D Fase Laboratório (Icosaedro Quântico Deformável Proceduralmente)
    var g2 = new T.IcosahedronGeometry(15, 2);
    posOrig2 = g2.attributes.position.clone();
    var m2 = new T.MeshStandardMaterial({ color: 0x7c3aed, wireframe: true, transparent: true, opacity: 0.45 });
    malhaGeom = new T.Mesh(g2, m2);
    malhaGeom.position.set(-36, -30, -10);
    cena.add(malhaGeom);

    // Anel orbital com tom verde limão da identidade urbana
    var gAnel = new T.TorusGeometry(20, 0.4, 8, 48);
    var mAnel = new T.MeshBasicMaterial({ color: 0xc6ff00, wireframe: true, transparent: true, opacity: 0.35 });
    anelOrbital = new T.Mesh(gAnel, mAnel);
    malhaGeom.add(anelOrbital);

    // 3. Objeto 3D Fase Prêmios (Troféu Wireframe Dourado)
    var g3 = new T.CylinderGeometry(8, 2, 18, 12, 6, true);
    var m3 = new T.MeshStandardMaterial({ color: 0xe0a84f, wireframe: true, transparent: true, opacity: 0.45 });
    malhaTrofeu = new T.Mesh(g3, m3);
    malhaTrofeu.position.set(36, -90, -10);
    cena.add(malhaTrofeu);

    function redimensionar() {
      W = window.innerWidth; H = window.innerHeight;
      var aspecto = W / H;
      camera.aspect = aspecto;
      // Adapta distância Z em smartphones para que as geometrias nunca fiquem cortadas fora da tela
      if (aspecto < 1) {
        camera.position.z = 110 / Math.max(0.48, aspecto);
      } else {
        camera.position.z = 110;
      }
      camera.updateProjectionMatrix();
      render.setSize(W, H);
    }
    window.addEventListener('resize', redimensionar);
    redimensionar();

    // Tratamento de perda e restauração de contexto WebGL
    cv.addEventListener('webglcontextlost', function (e) {
      e.preventDefault();
    }, false);
    cv.addEventListener('webglcontextrestored', function () {
      redimensionar();
    }, false);

    // Sincronização de qualidade
    if (PV.qualidade) {
      PV.qualidade.aoMudar(function (n) {
        cv.style.display = (n === 'baixo') ? 'none' : 'block';
      });
      if (!PV.qualidade.tem3d()) cv.style.display = 'none';
    }

    var pulso = 0;
    function animar(agora) {
      requestAnimationFrame(animar);
      if (document.hidden || (PV.qualidade && !PV.qualidade.tem3d())) return;

      var t = agora * 0.001;
      var yScroll = window.scrollY;
      var totalH = Math.max(1, document.documentElement.scrollHeight - H);
      var pScroll = yScroll / totalH;

      pulso *= 0.92;

      // Posição vertical da câmera acompanha o scroll
      camera.position.y = (0.5 - pScroll) * 120;

      malhaMicro.rotation.x = t * 0.3;
      malhaMicro.rotation.y = t * 0.5;
      malhaMicro.scale.setScalar(1 + pulso * 0.25);

      // Deformação senoidal matemática em tempo real nos vértices do icosaedro
      var posAttr = g2.attributes.position;
      var origArr = posOrig2.array;
      var arr = posAttr.array;
      var freq = 0.15;
      var amp = 1.4 + pulso * 4.2;
      for (var k = 0; k < arr.length; k += 3) {
        var ox = origArr[k], oy = origArr[k + 1], oz = origArr[k + 2];
        var dist = Math.sqrt(ox * ox + oy * oy + oz * oz) || 1;
        var nx = ox / dist, ny = oy / dist, nz = oz / dist;
        var onda = Math.sin(ox * freq + t * 2.8) * Math.cos(oy * freq + t * 2.2);
        arr[k] = ox + nx * onda * amp;
        arr[k + 1] = oy + ny * onda * amp;
        arr[k + 2] = oz + nz * onda * amp;
      }
      posAttr.needsUpdate = true;

      malhaGeom.rotation.x = t * 0.4;
      malhaGeom.rotation.y = t * 0.35;
      malhaGeom.scale.setScalar(1 + pulso * 0.3);

      anelOrbital.rotation.x = t * 0.8;
      anelOrbital.rotation.y = t * 1.2;

      malhaTrofeu.rotation.y = t * 0.6;
      malhaTrofeu.scale.setScalar(1 + pulso * 0.2);

      render.render(cena, camera);
    }
    requestAnimationFrame(animar);

    return {
      evento: function (tipo) {
        if (tipo === 'pulo') pulso = 0.4;
        else if (tipo === 'soco') pulso = 0.85;
        else if (tipo === 'moeda') pulso = 0.5;
      }
    };
  })();

  /* ==========================================================================
     8. MOTOR PRINCIPAL DO JOGO DE PLATAFORMA (PV.jogo)
     ========================================================================== */
  PV.jogo = (function () {
    var M = PV.mundo, S = PV.sprites, som = PV.som;
    var cv = document.getElementById('jogo');
    if (!cv) return { init: function () {}, jogar: function () {} };
    var ctx = cv.getContext('2d');
    var painel = document.getElementById('painel');
    var caixa = document.getElementById('painelCaixa');
    var avisoEl = document.getElementById('aviso');
    var btnSom = document.getElementById('btnSom');
    var btnPausa = document.getElementById('btnPausa');

    var W = 0, H = 0, DPR = 1;
    var FONTE = 'Silkscreen, ui-monospace, monospace';

    // Detecção adaptativa de dispositivos com toque
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches) {
      document.body.classList.add('tem-toque');
      document.documentElement.classList.add('tem-toque');
    }

    var C = {
      grav: 2300, pulo: 800, pulo2: 690, corrida: 350,
      acel: 3000, atrito: 2800, acelAr: 1900,
      quedaMax: 1150, socoVel: 1750, quique: 600,
      coyote: 0.1, buffer: 0.13, invuln: 1.3
    };

    var E = {
      modo: 'menu',
      ents: [], parts: [], textos: [],
      t: 0, crono: 0,
      pontos: 0, bits: 0, bitsTotal: 0, trofeus: 0, trofeusTotal: 4, bugs: 0,
      combo: 0,
      faseAtual: 0, checkpoint: 0,
      cam: 0
    };

    var p = {
      x: 0, y: 0, w: 30, h: 63, vx: 0, vy: 0, pesAntes: 0,
      chao: null, virado: false, pulosAr: 1, coyote: 0, buffer: 0,
      socando: 0, invuln: 0, vidas: 3,
      animT: 0, passoT: 0
    };

    var inp = { esq: false, dir: false, pulo: false, baixo: false, ap: { pulo: false, baixo: false } };
    var TECLAS = {
      ArrowLeft: 'esq', KeyA: 'esq', ArrowRight: 'dir', KeyD: 'dir',
      ArrowUp: 'pulo', KeyW: 'pulo', Space: 'pulo',
      ArrowDown: 'baixo', KeyS: 'baixo'
    };

    function apertar(a) {
      if (!inp[a] && inp.ap[a] !== undefined) inp.ap[a] = true;
      inp[a] = true;
    }
    function soltar(a) { inp[a] = false; }
    function emJogo() { return E.modo === 'jogando'; }

    window.addEventListener('keydown', function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (!painel.hasAttribute('hidden')) {
        if (e.code === 'Escape' || e.code === 'KeyP') {
          e.preventDefault();
          if (E.modo === 'fim') sairLeitura();
          else continuar();
        }
        return;
      }
      if (emJogo()) {
        var a = TECLAS[e.code];
        if (a) { e.preventDefault(); if (!e.repeat) apertar(a); return; }
        if (e.code === 'Escape' || e.code === 'KeyP') { e.preventDefault(); pausar(); return; }
        if (e.code === 'KeyM') { alternarSom(); return; }
      } else if (e.code === 'Enter') {
        var elAtivo = document.activeElement;
        if (elAtivo && (elAtivo.tagName === 'INPUT' || elAtivo.tagName === 'TEXTAREA' || elAtivo.tagName === 'A' || elAtivo.tagName === 'BUTTON')) return;
        jogar();
      }
    });

    window.addEventListener('keyup', function (e) {
      var a = TECLAS[e.code]; if (a) soltar(a);
    });

    // Controles Touch adaptados para múltiplos dedos e com captura de ponteiro
    document.querySelectorAll('[data-tecla]').forEach(function (b) {
      var a = b.dataset.tecla;
      b.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        try { b.setPointerCapture(e.pointerId); } catch (err) {}
        apertar(a);
        b.classList.add('on');
      });
      b.addEventListener('pointerup', function (e) {
        soltar(a);
        b.classList.remove('on');
      });
      b.addEventListener('pointercancel', function (e) {
        soltar(a);
        b.classList.remove('on');
      });
      b.addEventListener('pointerleave', function (e) {
        soltar(a);
        b.classList.remove('on');
      });
      b.addEventListener('contextmenu', function (e) {
        e.preventDefault();
      });
    });

    function medir() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
      p.w = 10 * M.esc;
      p.h = 21 * M.esc;
    }

    function popularEntidades() {
      E.ents = [];
      E.bitsTotal = 0;
      document.querySelectorAll('[data-bits]').forEach(function (el) {
        var n = parseInt(el.dataset.bits, 10) || 3;
        var r = el.getBoundingClientRect();
        var yDoc = r.top + window.scrollY - 30;
        for (var i = 0; i < n; i++) {
          var xDoc = r.left + window.scrollX + (r.width / (n + 1)) * (i + 1);
          E.ents.push({ tipo: 'bit', x: xDoc, y: yDoc, coletado: false });
          E.bitsTotal++;
        }
      });

      document.querySelectorAll('[data-bugs]').forEach(function (el) {
        var r = el.getBoundingClientRect();
        var xDoc = r.left + window.scrollX + r.width * 0.5;
        var yDoc = r.top + window.scrollY - 20;
        E.ents.push({ tipo: 'bug', x: xDoc, y: yDoc, x0: xDoc - 40, x1: xDoc + 40, dir: 1, vivo: true });
      });

      document.querySelectorAll('[data-trofeu]').forEach(function (el) {
        var r = el.getBoundingClientRect();
        var xDoc = r.left + window.scrollX + r.width * 0.85;
        var yDoc = r.top + window.scrollY - 34;
        E.ents.push({ tipo: 'trofeu', x: xDoc, y: yDoc, nome: el.dataset.trofeu, coletado: false });
      });
      E.trofeusTotal = document.querySelectorAll('[data-trofeu]').length;

      document.querySelectorAll('[data-cafe]').forEach(function (el) {
        var r = el.getBoundingClientRect();
        var xDoc = r.left + window.scrollX + r.width * 0.15;
        var yDoc = r.top + window.scrollY - 30;
        E.ents.push({ tipo: 'cafe', x: xDoc, y: yDoc, coletado: false });
      });
    }

    function jogar() {
      M.medir();
      medir();
      som.ativar();
      som.iniciarTrap();
      document.body.classList.add('modo-jogo');
      document.documentElement.classList.add('modo-jogo');
      E.modo = 'jogando';
      E.pontos = 0;
      E.bits = 0;
      E.trofeus = 0;
      E.bugs = 0;
      E.faseAtual = 0;
      E.checkpoint = 0;
      p.vidas = 3;
      p.socando = 0;
      p.invuln = 0;
      document.querySelectorAll('[data-skill]').forEach(function (el) { el._skillColetada = false; });
      popularEntidades();

      // Sincronização bidirecional: posiciona o jogador no ponto correspondente ao scroll
      var posicionado = false;
      if (window.scrollY > 300) {
        var faseVisivel = M.fases.find(function (f) {
          return window.scrollY >= f.y - 120 && window.scrollY <= f.y + f.h;
        });
        if (faseVisivel && faseVisivel.idx > 0) {
          var pousoLocal = faseVisivel.el.querySelector('[data-pouso]') || faseVisivel.el.querySelector('[data-plat]');
          if (pousoLocal && M.porEl.get(pousoLocal)) {
            var pl = M.porEl.get(pousoLocal);
            p.x = pl.x + pl.w * 0.5 - p.w * 0.5;
            p.y = pl.y - p.h - 10;
            E.faseAtual = faseVisivel.idx;
            E.checkpoint = faseVisivel.idx;
            posicionado = true;
          }
        }
      }

      if (!posicionado) {
        var pouso = document.querySelector('[data-pouso]');
        if (pouso) {
          var plat = M.porEl.get(pouso);
          if (plat) {
            p.x = plat.x + plat.w * 0.5 - p.w * 0.5;
            p.y = plat.y - p.h - 10;
          }
        }
      }
      p.vx = 0; p.vy = 0;
      E.cam = Math.max(0, p.y - H * 0.45);
      window.scrollTo(0, Math.round(E.cam));
      avisar('Use as setas para andar, saltar e soco para baixo!');
    }

    function pausar() {
      E.modo = 'pausado';
      som.pararTrap();
      if (!painel || !caixa) return;
      caixa.innerHTML = `
        <p class="kicker">Jogo Pausado</p>
        <h2 id="painelTitulo">Portfólio em Pausa</h2>
        <p class="sub">Você desceu até a fase <strong>${E.faseAtual}</strong>. Deseja continuar?</p>
        <div class="painel-botoes">
          <button type="button" class="botao-pixel" id="btnContinuar">Retomar Jogo ▶</button>
          <button type="button" class="botao-sec" id="btnModoLeitura">Sair para Leitura ✕</button>
        </div>
      `;
      painel.removeAttribute('hidden');
      document.getElementById('btnContinuar').onclick = continuar;
      document.getElementById('btnModoLeitura').onclick = sairLeitura;
    }

    function continuar() {
      if (painel) painel.setAttribute('hidden', '');
      E.modo = 'jogando';
      som.iniciarTrap();
    }

    function sairLeitura() {
      if (painel) painel.setAttribute('hidden', '');
      E.modo = 'menu';
      document.body.classList.remove('modo-jogo');
      document.documentElement.classList.remove('modo-jogo');
      som.pararTrap();
    }

    function fim() {
      E.modo = 'fim';
      som.pararTrap();
      som.tocar('fim');
      document.body.classList.remove('modo-jogo');
      document.documentElement.classList.remove('modo-jogo');
      var notaRank = E.bits > (E.bitsTotal * 0.7) ? 'S' : (E.bits > (E.bitsTotal * 0.4) ? 'A' : 'B');
      caixa.innerHTML = `
        <p class="kicker">Missão Cumprida</p>
        <h2 id="painelTitulo">Fim da Descida!</h2>
        <div class="rank">
          <div class="rank-letra">${notaRank}</div>
          <p><b>Classificação Final</b> Você explorou todo o portfólio de Felipe Trevisan até o fim da cidade.</p>
        </div>
        <dl class="placar">
          <div><dt>Pontos</dt><dd>${E.pontos}</dd></div>
          <div><dt>Bits Coletados</dt><dd>${E.bits}/${E.bitsTotal}</dd></div>
          <div><dt>Troféus</dt><dd>${E.trofeus}/${E.trofeusTotal}</dd></div>
          <div><dt>Bugs Eliminados</dt><dd>${E.bugs}</dd></div>
        </dl>
        <div class="painel-botoes">
          <button type="button" class="botao-pixel" id="btnJogarDeNovo">Jogar Novamente ↺</button>
          <a href="#contato" class="botao-sec" id="btnMandarMsg">Falar com o Felipe →</a>
        </div>
      `;
      painel.removeAttribute('hidden');
      document.getElementById('btnJogarDeNovo').onclick = function () {
        painel.setAttribute('hidden', '');
        jogar();
      };
      document.getElementById('btnMandarMsg').onclick = function () {
        sairLeitura();
      };
    }

    function avisar(txt) {
      if (!avisoEl) return;
      avisoEl.textContent = txt;
      avisoEl.classList.add('on');
      setTimeout(function () { avisoEl.classList.remove('on'); }, 2500);
    }

    function alternarSom() {
      var m = som.alternar();
      atualizarBtnSom(m);
      avisar(m ? 'Som desativado' : 'Som & Beat Trap 808 ativados ♪');
    }

    function atualizarBtnSom(mudo) {
      if (!btnSom) return;
      btnSom.setAttribute('aria-pressed', mudo ? 'true' : 'false');
      btnSom.textContent = mudo ? '🔇' : '♪';
      btnSom.title = mudo ? 'Som (M) - Mudo' : 'Som (M) - Ativado';
      btnSom.setAttribute('aria-label', mudo ? 'Som desativado' : 'Som ativado');
    }

    if (btnSom) {
      btnSom.onclick = alternarSom;
      atualizarBtnSom(som.mudo);
    }
    if (btnPausa) btnPausa.onclick = pausar;

    if (painel) {
      painel.addEventListener('click', function (e) {
        if (e.target === painel) {
          if (E.modo === 'fim') sairLeitura();
          else continuar();
        }
      });
    }

    // Partículas
    function particulas(x, y, cor, n) {
      for (var i = 0; i < (n || 8); i++) {
        E.parts.push({
          x: x, y: y,
          vx: (Math.random() - 0.5) * 260,
          vy: (Math.random() - 0.5) * 260 - 80,
          cor: cor, vida: 0.4 + Math.random() * 0.3, t: 0
        });
      }
    }

    // Loop de física e renderização do jogo
    var antes = performance.now();
    function loop(agora) {
      requestAnimationFrame(loop);
      var dt = Math.min((agora - antes) / 1000, 0.05);
      antes = agora;

      if (E.modo !== 'jogando') {
        if (cv) {
          ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
          ctx.clearRect(0, 0, W, H);
        }
        return;
      }

      E.t += dt;
      E.crono += dt;

      // Movimentação horizontal
      var ax = 0;
      if (inp.esq) { ax -= (p.chao ? C.acel : C.acelAr); p.virado = true; }
      if (inp.dir) { ax += (p.chao ? C.acel : C.acelAr); p.virado = false; }
      p.vx += ax * dt;

      if (!inp.esq && !inp.dir) {
        var atr = C.atrito * dt;
        if (p.vx > 0) p.vx = Math.max(0, p.vx - atr);
        else if (p.vx < 0) p.vx = Math.min(0, p.vx + atr);
      }
      p.vx = Math.max(-C.corrida, Math.min(C.corrida, p.vx));
      p.x += p.vx * dt;
      p.x = Math.max(0, Math.min(M.W - p.w, p.x));

      // Descida através de plataformas não-sólidas
      if (p.chao && !p.chao.solido && inp.ap.baixo) {
        inp.ap.baixo = false;
        p.y += 6;
        p.chao = null;
        p.vy = 180;
      }

      // Gravidade e Pulo
      if (p.chao) {
        p.coyote = C.coyote;
        p.pulosAr = 1;
        p.socando = 0;
      } else {
        p.coyote -= dt;
      }

      if (inp.ap.pulo) {
        inp.ap.pulo = false;
        p.buffer = C.buffer;
      } else {
        p.buffer -= dt;
      }

      if (p.buffer > 0) {
        if (p.coyote > 0) {
          p.vy = -C.pulo;
          p.chao = null;
          p.coyote = 0;
          p.buffer = 0;
          som.tocar('pulo');
          PV.cena3d.evento('pulo');
          particulas(p.x + p.w / 2, p.y + p.h, '#ffffff', 6);
        } else if (p.pulosAr > 0) {
          p.vy = -C.pulo2;
          p.pulosAr = 0;
          p.buffer = 0;
          som.tocar('pulo2');
          PV.cena3d.evento('pulo');
          particulas(p.x + p.w / 2, p.y + p.h, '#35d0e5', 8);
        }
      }

      // Soco no ar para descer rápido
      if (inp.ap.baixo && !p.chao) {
        inp.ap.baixo = false;
        p.vy = C.socoVel;
        p.socando = 1;
        som.tocar('socoIni');
      }

      p.vy += C.grav * dt;
      p.vy = Math.min(C.quedaMax * (p.socando ? 1.6 : 1), p.vy);
      p.pesAntes = p.y + p.h;
      p.y += p.vy * dt;

      // Colisão com plataformas do DOM
      var pes = p.y + p.h;
      var chaoNovo = null;
      for (var i = 0; i < M.plats.length; i++) {
        var plat = M.plats[i];
        if (p.x + p.w > plat.x && p.x < plat.x + plat.w) {
          if (p.vy >= 0 && p.pesAntes <= plat.y + 4 && pes >= plat.y) {
            p.y = plat.y - p.h;
            p.vy = 0;
            chaoNovo = plat;
            if (p.socando) {
              som.tocar('soco');
              PV.cena3d.evento('soco');
              PV.efeitos3d.onda(p.x + p.w / 2, plat.y, 280, 1.2);
              particulas(p.x + p.w / 2, plat.y, '#e0a84f', 16);
              p.socando = 0;
            } else {
              som.tocar('pouso');
              PV.efeitos3d.pouso(plat.el, (p.x + p.w / 2 - plat.x) / plat.w, 0.8);
            }
            if (plat.cartao) plat.el.classList.add('pisado');

            // Habilidades de programação desbloqueadas ao pisar em cartões marcados
            if (plat.el && plat.el.dataset && plat.el.dataset.skill && !plat.el._skillColetada) {
              plat.el._skillColetada = true;
              som.tocar('skill');
              E.pontos += 150;
              PV.cena3d.evento('moeda');
              particulas(p.x + p.w / 2, plat.y, '#35d0e5', 10);
              avisar('Habilidade: ' + plat.el.dataset.skill + ' (+150 pts)');
            }

            // Animação de glitch se o elemento possuir data-glitch
            if (plat.el && plat.el.dataset && plat.el.dataset.glitch) {
              plat.el.classList.add('glitch-ativo');
              setTimeout(function () { plat.el.classList.remove('glitch-ativo'); }, 400);
            }

            if (plat.letras) {
              plat.letras.forEach(function (l) {
                if (p.x + p.w >= l.x0 && p.x <= l.x1) {
                  l.el.classList.add('pisada');
                  setTimeout(function () { l.el.classList.remove('pisada'); }, 300);
                }
              });
            }
            break;
          }
        }
      }
      p.chao = chaoNovo;

      // Efeito de passos
      if (p.chao && Math.abs(p.vx) > 30) {
        p.passoT += dt;
        if (p.passoT > 0.28) {
          p.passoT = 0;
          som.tocar('passo');
          particulas(p.x + (p.virado ? p.w : 0), p.y + p.h, 'rgba(255,255,255,0.4)', 2);
        }
      }

      // Interação com entidades (bits, bugs, troféus, café)
      E.ents.forEach(function (ent) {
        if (ent.tipo === 'bit' && !ent.coletado) {
          if (Math.hypot(p.x + p.w / 2 - ent.x, p.y + p.h / 2 - ent.y) < 32) {
            ent.coletado = true;
            E.bits++;
            E.pontos += 100;
            som.tocar('bit', E.bits);
            PV.cena3d.evento('moeda');
            particulas(ent.x, ent.y, '#35d0e5', 8);
          }
        } else if (ent.tipo === 'bug' && ent.vivo) {
          ent.x += ent.dir * 45 * dt;
          if (ent.x < ent.x0) { ent.x = ent.x0; ent.dir = 1; }
          if (ent.x > ent.x1) { ent.x = ent.x1; ent.dir = -1; }
          if (Math.hypot(p.x + p.w / 2 - ent.x, p.y + p.h / 2 - ent.y) < 30) {
            if (p.vy > 100) {
              ent.vivo = false;
              p.vy = -540;
              E.bugs++;
              E.pontos += 250;
              som.tocar('esmaga');
              particulas(ent.x, ent.y, '#ff4d7e', 12);
            } else if (p.invuln <= 0) {
              p.vidas--;
              p.invuln = C.invuln;
              p.vy = -380;
              som.tocar('dano');
              avisar('Você tomou dano!');
              if (p.vidas <= 0) {
                p.vidas = 3;
                p.invuln = 2.0;
                var cpFase = M.fases[E.checkpoint] || M.fases[0];
                p.x = cpFase.x + cpFase.w * 0.5 - p.w * 0.5;
                p.y = cpFase.y + 40;
                p.vx = 0; p.vy = 0;
                avisar('Reiniciando na Fase ' + E.checkpoint + ' (' + (cpFase.nome || '') + ')');
              }
            }
          }
        } else if (ent.tipo === 'trofeu' && !ent.coletado) {
          if (Math.hypot(p.x + p.w / 2 - ent.x, p.y + p.h / 2 - ent.y) < 34) {
            ent.coletado = true;
            E.trofeus++;
            E.pontos += 500;
            som.tocar('trofeu');
            particulas(ent.x, ent.y, '#e0a84f', 14);
            avisar('Troféu conquistado: ' + ent.nome);
          }
        } else if (ent.tipo === 'cafe' && !ent.coletado) {
          if (Math.hypot(p.x + p.w / 2 - ent.x, p.y + p.h / 2 - ent.y) < 32) {
            ent.coletado = true;
            p.vidas = Math.min(3, p.vidas + 1);
            E.pontos += 300;
            som.tocar('cafe');
            particulas(ent.x, ent.y, '#e0a84f', 12);
            avisar('Café coletado: +1 Vida restaurada! ☕');
          }
        }
      });

      if (p.invuln > 0) p.invuln -= dt;

      // Câmera: rola a janela dinamicamente para manter o personagem centralizado
      var alvoCam = p.y - H * 0.45;
      alvoCam = Math.max(0, Math.min(M.H - H, alvoCam));
      E.cam += (alvoCam - E.cam) * 0.12;
      window.scrollTo(0, Math.round(E.cam));

      // Checa fase atual e atualiza checkpoint
      for (var f = 0; f < M.fases.length; f++) {
        if (p.y >= M.fases[f].y && p.y <= M.fases[f].y + M.fases[f].h) {
          if (E.faseAtual !== f) {
            E.faseAtual = f;
            E.checkpoint = f;
            M.fases.forEach(function (fa, idx) {
              fa.el.classList.toggle('fase-ativa', idx === f);
            });
            som.tocar('fase');
          }
        }
      }

      // Fim do jogo (chegou na última fase / contato)
      if (p.y >= M.H - H * 0.6) {
        fim();
        return;
      }

      // RENDERIZAÇÃO
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);

      var camY = window.scrollY;

      // Desenhar Entidades
      E.ents.forEach(function (ent) {
        var telaY = ent.y - camY;
        if (telaY < -50 || telaY > H + 50) return;
        if (ent.tipo === 'bit' && !ent.coletado) {
          var flutua = Math.sin(E.t * 5 + ent.x) * 4;
          var bitSpr = S.bit(M.esc);
          ctx.drawImage(bitSpr, ent.x - bitSpr.width / 2, telaY + flutua);
        } else if (ent.tipo === 'bug' && ent.vivo) {
          var bugSpr = S.bug(M.esc);
          ctx.drawImage(bugSpr, ent.x - bugSpr.width / 2, telaY);
        } else if (ent.tipo === 'trofeu' && !ent.coletado) {
          var trofeuSpr = S.trofeu(M.esc);
          ctx.drawImage(trofeuSpr, ent.x - trofeuSpr.width / 2, telaY);
        } else if (ent.tipo === 'cafe' && !ent.coletado) {
          var flutuaC = Math.sin(E.t * 4 + ent.x) * 3;
          var cafeSpr = S.cafe(M.esc);
          ctx.drawImage(cafeSpr, ent.x - cafeSpr.width / 2, telaY + flutuaC);
        }
      });

      // Desenhar Partículas
      for (var k = E.parts.length - 1; k >= 0; k--) {
        var pt = E.parts[k];
        pt.t += dt;
        if (pt.t >= pt.vida) { E.parts.splice(k, 1); continue; }
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.vy += 800 * dt;
        ctx.fillStyle = pt.cor;
        ctx.fillRect(pt.x, pt.y - camY, 3, 3);
      }

      // Desenhar Personagem Streetwear
      if (p.invuln <= 0 || Math.floor(E.t * 18) % 2 === 0) {
        var animNome = 'parado', quadro = 0;
        if (!p.chao) {
          animNome = p.socando ? 'soco' : (p.vy < 0 ? 'pulo' : 'cair');
        } else if (Math.abs(p.vx) > 30) {
          animNome = 'correr';
          quadro = Math.floor(E.t * 9) % 4;
        } else {
          quadro = Math.floor(E.t * 3) % 4;
        }

        var spr = S.personagem(animNome, quadro, M.esc);
        var telaPX = Math.round(p.x);
        var telaPY = Math.round(p.y - camY);

        ctx.save();
        if (p.virado) {
          ctx.translate(telaPX + spr.width, telaPY);
          ctx.scale(-1, 1);
          ctx.drawImage(spr, 0, 0);
        } else {
          ctx.drawImage(spr, telaPX, telaPY);
        }
        ctx.restore();
      }

      // HUD Superior Responsivo (Vidas, Bits, Pontos)
      ctx.fillStyle = '#eaf1f5';
      ctx.font = '11px ' + FONTE;
      if (W < 600) {
        ctx.fillText('VIDAS: ' + '♥ '.repeat(p.vidas), 16, 26);
        ctx.fillText('BITS: ' + E.bits + '/' + E.bitsTotal, 16, 44);
        ctx.fillText('PTS: ' + E.pontos, 110, 44);
      } else {
        ctx.fillText('VIDAS: ' + '♥ '.repeat(p.vidas), 20, 32);
        ctx.fillText('BITS: ' + E.bits + '/' + E.bitsTotal, 140, 32);
        ctx.fillText('PONTOS: ' + E.pontos, 260, 32);
      }
    }

    requestAnimationFrame(loop);

    function init() {
      medir();
      window.addEventListener('resize', function () {
        medir();
      });
      document.querySelectorAll('[data-acao="jogar"]').forEach(function (b) {
        b.addEventListener('click', jogar);
      });
    }

    return {
      init: init,
      jogar: jogar,
      pausar: pausar
    };
  })();

  /* ==========================================================================
     9. COMPORTAMENTO DO SITE & INTERFACE (PV.site)
     ========================================================================== */
  PV.site = (function () {
    function init() {
      var barra = document.getElementById('progresso');
      var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
      var secoes = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });

      window.addEventListener('scroll', function () {
        var y = window.scrollY, alt = document.documentElement.scrollHeight - window.innerHeight;
        if (barra) barra.style.width = (alt > 0 ? (y / alt) * 100 : 0) + '%';
        var atual = -1;
        for (var i = 0; i < secoes.length; i++) {
          if (secoes[i] && secoes[i].getBoundingClientRect().top <= window.innerHeight * 0.35) atual = i;
        }
        links.forEach(function (a, i) { a.classList.toggle('ativo', i === atual); });
      }, { passive: true });

      // Menu mobile e gaveta de navegação
      var btnMenu = document.getElementById('btnMenuMobile');
      var navGaveta = document.getElementById('navGaveta');
      if (btnMenu && navGaveta) {
        btnMenu.addEventListener('click', function () {
          var aberto = !navGaveta.hasAttribute('hidden');
          if (aberto) {
            navGaveta.setAttribute('hidden', '');
            btnMenu.classList.remove('aberto');
            btnMenu.setAttribute('aria-expanded', 'false');
          } else {
            navGaveta.removeAttribute('hidden');
            btnMenu.classList.add('aberto');
            btnMenu.setAttribute('aria-expanded', 'true');
          }
        });
        navGaveta.querySelectorAll('a').forEach(function (a) {
          a.addEventListener('click', function () {
            navGaveta.setAttribute('hidden', '');
            btnMenu.classList.remove('aberto');
            btnMenu.setAttribute('aria-expanded', 'false');
          });
        });
        window.addEventListener('keydown', function (e) {
          if (e.code === 'Escape' && !navGaveta.hasAttribute('hidden')) {
            navGaveta.setAttribute('hidden', '');
            btnMenu.classList.remove('aberto');
            btnMenu.setAttribute('aria-expanded', 'false');
          }
        });
      }

      // Validação em tempo real do formulário de contato com acessibilidade WCAG
      var form = document.getElementById('formContato');
      if (form) {
        var campoNome = document.getElementById('contatoNome');
        var campoEmail = document.getElementById('contatoEmail');
        var campoMsg = document.getElementById('contatoMensagem');
        var erroNome = document.getElementById('erroNome');
        var erroEmail = document.getElementById('erroEmail');
        var erroMsg = document.getElementById('erroMensagem');
        var feedback = document.getElementById('formFeedback');

        function limparErro(campo, span) {
          if (campo) campo.classList.remove('invalido');
          if (span) span.textContent = '';
        }

        function setErro(campo, span, msg) {
          if (campo) campo.classList.add('invalido');
          if (span) span.textContent = msg;
        }

        [campoNome, campoEmail, campoMsg].forEach(function (c) {
          if (c) {
            c.addEventListener('input', function () {
              c.classList.remove('invalido');
              if (c === campoNome && erroNome) erroNome.textContent = '';
              if (c === campoEmail && erroEmail) erroEmail.textContent = '';
              if (c === campoMsg && erroMsg) erroMsg.textContent = '';
            });
          }
        });

        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var valido = true;
          var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

          if (!campoNome.value.trim() || campoNome.value.trim().length < 2) {
            setErro(campoNome, erroNome, 'Por favor, informe seu nome (mínimo 2 caracteres).');
            valido = false;
          } else {
            limparErro(campoNome, erroNome);
          }

          if (!campoEmail.value.trim() || !emailRegex.test(campoEmail.value.trim())) {
            setErro(campoEmail, erroEmail, 'Informe um e-mail válido para retorno.');
            valido = false;
          } else {
            limparErro(campoEmail, erroEmail);
          }

          if (!campoMsg.value.trim() || campoMsg.value.trim().length < 8) {
            setErro(campoMsg, erroMsg, 'Sua mensagem deve conter pelo menos 8 caracteres.');
            valido = false;
          } else {
            limparErro(campoMsg, erroMsg);
          }

          if (!valido) {
            if (feedback) {
              feedback.className = 'form-feedback erro';
              feedback.textContent = 'Verifique os campos destacados acima.';
            }
            var primeiroInvalido = form.querySelector('.invalido');
            if (primeiroInvalido) primeiroInvalido.focus();
            return;
          }

          if (feedback) {
            feedback.className = 'form-feedback sucesso';
            feedback.textContent = 'Mensagem enviada com sucesso! Retornarei em breve. ✉';
          }
          PV.som.tocar('moeda');
          form.reset();
          setTimeout(function () {
            if (feedback) feedback.textContent = '';
          }, 6000);
        });
      }

      // Revelação progressiva dos elementos ao scroll
      var alvos = document.querySelectorAll(
        '.fase .kicker, .fase h2, .col > p, .cartao, .lista li, .specs > div, .pontos li, .citacao, ' +
        '.heroi-texto, .heroi-acoes, .controles, .heroi-rodape'
      );
      if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            e.target.classList.add('dentro');
            obs.unobserve(e.target);
            if (e.target.classList.contains('cartao') && PV.efeitos3d) PV.efeitos3d.entrar(e.target);
          });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
        alvos.forEach(function (el) { el.classList.add('rev'); obs.observe(el); });
      }
    }

    return { init: init };
  })();

  /* ==========================================================================
     INICIALIZAÇÃO DO ECOSSISTEMA
     ========================================================================== */
  function iniciar() {
    PV.mundo.preparar();
    PV.mundo.medir();
    PV.jogo.init();
    PV.site.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
