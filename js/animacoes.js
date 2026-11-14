/* ============ Animações "O que o Senado aprovou até agora?" ============
   Motor SVG determinístico: cada quadro é função pura de t (estilo
   explicacao-motion). Personagens: Open Peeps (CC0, Pablo Stanley). */
(function () {
"use strict";

const NS = "http://www.w3.org/2000/svg";
const W = 960, H = 540;
const PAL = {
  bg1: "#151d2c", bg2: "#0c0e12", dots: "#23324e",
  ink: "#f2f4f8", sub: "#a9b1c2",
  verde: "#46d68c", amarelo: "#ffd166", vermelho: "#e5484d",
  azul: "#4da3ff", claro: "#f4f8ff", painel: "#101828"
};

/* ---------- utilidades ---------- */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, p) => a + (b - a) * p;
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const eO = p => 1 - Math.pow(1 - p, 3);
const eIO = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

function E(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) {
    const v = attrs[k];
    if (v === null || v === undefined) continue;
    if (k === "text") { n.textContent = v; continue; }
    if (k === "fill" || k === "stroke" || k === "stopColor") { n.style[k] = v; continue; }
    n.setAttribute(k, v);
  }
  if (parent) parent.appendChild(n);
  return n;
}
function fmtBi(v, c) {
  const casas = c === undefined ? 1 : c;
  return "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas }) + " bi";
}
function fmtPct(v, c) {
  const casas = c === undefined ? 1 : c;
  return (v * 100).toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas }) + "%";
}

/* ---------- componentes reutilizáveis ---------- */
function fundo(svg) {
  const defs = E("defs", {}, svg);
  const g = E("linearGradient", { id: "gradBg", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  E("stop", { offset: "0", stopColor: PAL.bg1 }, g);
  E("stop", { offset: "1", stopColor: PAL.bg2 }, g);
  const pat = E("pattern", { id: "patDots", width: 44, height: 44, patternUnits: "userSpaceOnUse" }, defs);
  E("circle", { cx: 6, cy: 6, r: 1.6, fill: PAL.dots, opacity: .5 }, pat);
  E("rect", { x: 0, y: 0, width: W, height: H, fill: "url(#gradBg)" }, svg);
  E("rect", { x: 0, y: 0, width: W, height: H, fill: "url(#patDots)", opacity: .45 }, svg);
  E("circle", { cx: 180, cy: 120, r: 280, fill: PAL.azul, opacity: .05 }, svg);
  E("circle", { cx: 800, cy: 460, r: 300, fill: PAL.amarelo, opacity: .04 }, svg);
}

function painel(g, x, y, w, h, op) {
  return E("rect", { x: x, y: y, width: w, height: h, rx: 14, fill: PAL.painel,
    stroke: "#2a2f3b", strokeOpacity: .9, opacity: op === undefined ? 1 : op }, g);
}
function rotulo(g, x, y, txt, cor, tam, peso) {
  return E("text", { x: x, y: y, fill: cor || PAL.ink, "font-size": tam || 20,
    "font-weight": peso || 600, text: txt }, g);
}
function pivo(g, x, y, txt) {
  const n = E("text", { x: x, y: y, fill: PAL.sub, "font-size": 13,
    "text-transform": "uppercase", "letter-spacing": "1.5", "font-weight": 800, text: txt.toUpperCase() }, g);
  return n;
}
function peep(g, arquivo, x, y, altura) {
  // desenhado em coordenadas-base 160x216; escala = altura/216
  const grupo = E("g", { transform: "translate(" + x + "," + y + ") scale(" + ((altura || 190) / 216).toFixed(3) + ")" }, g);
  E("circle", { cx: 80, cy: 118, r: 136, fill: PAL.claro, opacity: .97 }, grupo);
  const img = E("image", { x: 0, y: 10, width: 160, height: 216, opacity: 0 }, grupo);
  img.setAttribute("href", "assets/svg/" + arquivo);
  img.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "assets/svg/" + arquivo);
  return { g: grupo, img: img };
}
function tambor(g, x, y, escala) {
  const grupo = E("g", { transform: "translate(" + x + "," + y + ") scale(" + (escala || 1) + ")" }, g);
  E("rect", { x: 0, y: 0, width: 54, height: 70, rx: 8, fill: "#2b3a55", stroke: PAL.amarelo, "stroke-width": 3 }, grupo);
  E("rect", { x: -6, y: 14, width: 66, height: 8, rx: 4, fill: PAL.amarelo }, grupo);
  E("rect", { x: -6, y: 44, width: 66, height: 8, rx: 4, fill: PAL.amarelo }, grupo);
  E("text", { x: 27, y: 38, "text-anchor": "middle", fill: PAL.ink, "font-size": 15, "font-weight": 800, text: "12%" }, grupo);
  return grupo;
}
function cadeado(g, x, y, escala, cor) {
  const grupo = E("g", { transform: "translate(" + x + "," + y + ") scale(" + (escala || 1) + ")" }, g);
  E("rect", { x: 0, y: 22, width: 44, height: 34, rx: 7, fill: cor || PAL.vermelho }, grupo);
  E("path", { d: "M9 22 v-8 a13 13 0 0 1 26 0 v8", fill: "none",
    stroke: cor || PAL.vermelho, "stroke-width": 7 }, grupo);
  E("circle", { cx: 22, cy: 38, r: 5, fill: PAL.painel }, grupo);
  return grupo;
}

/* ---------- motor ---------- */
function montarAnimacao(mountId, cfg) {
  const mount = document.getElementById(mountId);
  if (!mount) return null;

  const D = cfg.duracao;
  const reduzirMov = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const wrap = document.createElement("div");
  wrap.className = "anim-wrap-inner";
  mount.appendChild(wrap);

  const svg = E("svg", { viewBox: "0 0 " + W + " " + H, class: "anim-svg", role: "img",
    "aria-label": cfg.descricao || cfg.legendas.map(l => l[2]).join(" ") }, wrap);
  fundo(svg);
  const g = E("g", {}, svg);

  // legenda inferior em pílula
  const gCap = E("g", { opacity: 0 }, svg);
  const capPill = E("rect", { x: W / 2 - 5, y: H - 74, width: 10, height: 46, rx: 23,
    fill: "#0e1626", opacity: .94, stroke: "#ffffff", strokeOpacity: .12 }, gCap);
  const capText = E("text", { x: W / 2, y: H - 44, "text-anchor": "middle", fill: PAL.ink,
    "font-size": 21, "font-weight": 600, text: "" }, gCap);

  // nós da cena
  const ctx = { svg: svg, g: g, E: E, PAL: PAL, seg: seg, lerp: lerp, eO: eO, eIO: eIO,
    fmtBi: fmtBi, fmtPct: fmtPct, painel: painel, rotulo: rotulo, pivo: pivo,
    peep: peep, tambor: tambor, cadeado: cadeado, W: W, H: H, nos: {} };
  cfg.setup(ctx);

  // controles
  const controles = document.createElement("div");
  controles.className = "anim-controles";
  const btnPlay = document.createElement("button");
  btnPlay.type = "button";
  btnPlay.innerHTML = "&#9654;";
  btnPlay.setAttribute("aria-label", "Reproduzir ou pausar animação");
  const btnRestart = document.createElement("button");
  btnRestart.type = "button";
  btnRestart.innerHTML = "&#8635;";
  btnRestart.setAttribute("aria-label", "Reiniciar animação");
  const scrub = document.createElement("input");
  scrub.type = "range"; scrub.min = 0; scrub.max = D; scrub.step = 0.05; scrub.value = 0;
  scrub.setAttribute("aria-label", "Linha do tempo da animação");
  const tempo = document.createElement("span");
  tempo.className = "anim-tempo";
  wrap.appendChild(controles);
  controles.appendChild(btnPlay);
  controles.appendChild(btnRestart);
  controles.appendChild(scrub);
  controles.appendChild(tempo);

  let t = 0, tocando = !reduzirMov, ultima = null;

  function render(agora) {
    const legendaAtiva = cfg.legendas.find(l => agora >= l[0] && agora <= l[1]);
    if (legendaAtiva) {
      capText.textContent = legendaAtiva[2];
      try {
        const larg = capText.getComputedTextLength();
        capPill.setAttribute("width", larg + 44);
        capPill.setAttribute("x", W / 2 - (larg + 44) / 2);
      } catch (e) { /* sem medida */ }
      const entrada = Math.min(seg(agora, legendaAtiva[0], legendaAtiva[0] + 0.4),
        1 - seg(agora, legendaAtiva[1] - 0.4, legendaAtiva[1]));
      gCap.setAttribute("opacity", (0.35 + 0.65 * entrada).toFixed(2));
    } else {
      gCap.setAttribute("opacity", 0);
    }
    cfg.tick(ctx, agora);
    tempo.textContent = agora.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "s / " + D + "s";
    scrub.value = agora;
  }

  function quadro(ts) {
    if (ultima === null) ultima = ts;
    const dt = Math.min(0.05, (ts - ultima) / 1000);
    ultima = ts;
    if (tocando) {
      t += dt;
      if (t >= D) { t = D; tocando = false; btnPlay.innerHTML = "&#9654;"; }
    }
    render(t);
    requestAnimationFrame(quadro);
  }

  btnPlay.addEventListener("click", function () {
    if (t >= D) t = 0;
    tocando = !tocando;
    btnPlay.innerHTML = tocando ? "&#10074;&#10074;" : "&#9654;";
  });
  btnRestart.addEventListener("click", function () {
    t = 0; tocando = true; btnPlay.innerHTML = "&#10074;&#10074;";
  });
  scrub.addEventListener("input", function () {
    t = Number(scrub.value);
    render(t);
  });

  // toca automaticamente quando entra na tela; pausa quando sai
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (evs) {
      evs.forEach(function (ev) {
        if (ev.isIntersecting && !reduzirMov && t < D) {
          tocando = true; btnPlay.innerHTML = "&#10074;&#10074;";
        } else if (!ev.isIntersecting) {
          tocando = false; btnPlay.innerHTML = "&#9654;";
        }
      });
    }, { threshold: 0.55 });
    io.observe(mount);
  }

  render(0);
  requestAnimationFrame(quadro);
  return { render: render };
}

/* ================================================================
   ANIMAÇÕES (uma por medida). Números de js/medidas.js.
   ================================================================ */
const M = window.MEDIDAS;

const ANIMACOES = {};

/* ---------- 1. Saúde ---------- */
ANIMACOES.saude = {
  duracao: 26,
  legendas: [
    [0.5, 5, "A Constituição manda investir no SUS, no mínimo, 15% da Receita Corrente Líquida (RCL)."],
    [5.5, 10, "Toda receita que entra na RCL aumenta esse piso automaticamente."],
    [10.5, 16, "O texto aprovado tira da base receitas de petróleo e gás (no PLOA 2027: R$ 45,5 bi)."],
    [16.5, 21, "Com base menor, a obrigação mínima cai de R$ 279,0 bi para R$ 272,2 bi."],
    [21.5, 25.5, "Menos assoalho legal não é gasto cortado no SUS; e há controvérsia jurídica."]
  ],
  descricao: "Animação: como a exclusão de receitas de petróleo reduz a base do piso da saúde de R$ 279,0 para R$ 272,2 bilhões.",
  setup: function (c) {
    const n = c.nos;
    c.pivo(c.g, 60, 60, "piso da saúde");
    n.barra = c.E("rect", { x: 60, y: 96, width: 0, height: 54, rx: 10, fill: PAL.azul }, c.g);
    n.rotBarra = c.rotulo(c.g, 60, 84, "", PAL.sub, 17);
    n.drum = c.tambor(c.g, 900, 90, 1.05);
    n.drumTag = c.E("text", { x: 905, y: 196, "text-anchor": "end", fill: PAL.amarelo, "font-size": 15, "font-weight": 600,
      text: "imposto de exportação de petróleo (12%)" }, c.g);
    n.gPiso = c.E("g", { opacity: 0 }, c.g);
    c.pivo(n.gPiso, 60, 270, "obrigação mínima (15% da RCL)");
    n.sem = c.E("rect", { x: 60, y: 300, width: 0, height: 64, rx: 10, fill: PAL.verde }, n.gPiso);
    n.semTxt = c.rotulo(n.gPiso, 0, 0, "", PAL.ink, 18);
    n.com = c.E("rect", { x: 60, y: 402, width: 0, height: 64, rx: 10, fill: PAL.vermelho }, n.gPiso);
    n.comTxt = c.rotulo(n.gPiso, 0, 0, "", PAL.ink, 18);
    n.rotSem = c.rotulo(n.gPiso, 0, 290, "", PAL.sub, 15);
    n.rotCom = c.rotulo(n.gPiso, 0, 392, "", PAL.sub, 15);
    n.delta = c.rotulo(n.g, 700, 345, "", PAL.amarelo, 26);
    n.peep = c.peep(c.g, "peep-50.svg", 770, 300, 190);
  },
  tick: function (c, t) {
    const n = c.nos;
    const r = M.regras.pisoSaude.exemploReal;
    const p1 = c.seg(t, 0.5, 4.5);
    n.barra.setAttribute("width", 780 * c.eO(p1));
    n.rotBarra.textContent = "Receita Corrente Líquida: " + c.fmtBi(lerp(0, r.rclSemExclusao, c.eO(p1)));
    const pDrum = c.seg(t, 10.5, 13);
    const dx = lerp(770, 900, c.eIO(pDrum));
    n.drum.setAttribute("transform", "translate(" + dx + ",90) scale(1.05)");
    n.drum.setAttribute("opacity", (pDrum > 0 ? 1 : 0.25));
    n.drumTag.setAttribute("opacity", pDrum > 0 ? 1 : 0);
    const pPiso = c.seg(t, 14, 16.5);
    n.gPiso.setAttribute("opacity", pPiso > 0 ? 1 : 0);
    const base = 620;
    n.sem.setAttribute("width", base * c.eO(c.seg(t, 14.5, 16.5)));
    n.com.setAttribute("width", base * (r.minimoCom / r.minimoSem) * c.eO(c.seg(t, 17.5, 19.5)));
    const vSem = lerp(0, r.minimoSem, c.eO(c.seg(t, 14.5, 16.5)));
    const vCom = lerp(0, r.minimoCom, c.eO(c.seg(t, 17.5, 19.5)));
    n.semTxt.textContent = c.fmtBi(vSem);
    n.semTxt.setAttribute("x", 70 + base * c.eO(c.seg(t, 14.5, 16.5)));
    n.semTxt.setAttribute("y", 340);
    n.comTxt.textContent = c.fmtBi(vCom);
    n.comTxt.setAttribute("x", 70 + base * (r.minimoCom / r.minimoSem) * c.eO(c.seg(t, 17.5, 19.5)));
    n.comTxt.setAttribute("y", 444);
    n.rotSem.textContent = "sem a exclusão";
    n.rotSem.setAttribute("x", 60); n.rotSem.setAttribute("y", 292);
    n.rotCom.textContent = "com a exclusão (petróleo fora da base)";
    n.rotCom.setAttribute("x", 60); n.rotCom.setAttribute("y", 394);
    n.delta.textContent = t > 19.5 ? "− " + c.fmtBi(r.minimoSem - r.minimoCom, 2) + " de obrigação mínima" : "";
    n.peep.img.setAttribute("opacity", c.seg(t, 20.5, 21.5) * 0.96);
    n.peep.g.setAttribute("transform",
      "translate(770," + (300 + Math.sin(t * 1.6) * 4).toFixed(1) + ") scale(0.88)");
  }
};

/* ---------- 2. Educação ---------- */
ANIMACOES.educacao = {
  duracao: 20,
  legendas: [
    [0.5, 5.5, "O piso da educação incide sobre a receita de impostos, não sobre a RCL: o texto aprovado NÃO o altera."],
    [6, 11, "Mas universidades, institutos e bolsas vivem da verba discricionária, definida a cada Orçamento."],
    [11.5, 16, "É essa verba que pode ser bloqueada com mais facilidade pelo novo contingenciamento."],
    [16.5, 19.5, "Resumo: piso intacto, mas o dia a dia das instituições fica mais apertado."]
  ],
  descricao: "Animação: o piso da educação não muda, mas a verba discricionária de universidades e bolsas fica sujeita a bloqueios.",
  setup: function (c) {
    const n = c.nos;
    c.pivo(c.g, 70, 64, "educação");
    n.g1 = c.E("g", { opacity: 0 }, c.g);
    c.pivo(n.g1, 70, 116, "piso da educação (18% dos impostos)");
    n.piso = c.E("rect", { x: 70, y: 138, width: 0, height: 56, rx: 10, fill: PAL.verde }, n.g1);
    n.ok = c.rotulo(n.g1, 0, 0, "", PAL.verde, 20);
    n.g2 = c.E("g", { opacity: 0 }, c.g);
    c.pivo(n.g2, 70, 280, "verba discricionária (universidades, bolsas, obras)");
    n.disc = c.E("rect", { x: 70, y: 302, width: 0, height: 56, rx: 10, fill: PAL.azul }, n.g2);
    n.travas = [];
    for (let i = 0; i < 4; i++) {
      n.travas.push(c.cadeado(n.g2, 0, 306, 0.85));
    }
    n.fndct = c.rotulo(c.g, 70, 430, "", PAL.amarelo, 18);
    n.peep = c.peep(c.g, "peep-25.svg", 780, 250, 180);
  },
  tick: function (c, t) {
    const n = c.nos;
    n.g1.setAttribute("opacity", t > 0.3 ? 1 : 0);
    n.piso.setAttribute("width", 700 * c.eO(c.seg(t, 0.5, 3.5)));
    n.ok.textContent = t > 4 ? "✓ garantido, sem alteração" : "";
    n.ok.setAttribute("x", 90 + 700 * c.eO(c.seg(t, 0.5, 3.5)));
    n.ok.setAttribute("y", 174);
    n.g2.setAttribute("opacity", t > 5.5 ? 1 : 0);
    n.disc.setAttribute("width", 700 * c.eO(c.seg(t, 6, 9)));
    n.travas.forEach(function (tr, i) {
      const p = c.seg(t, 11.5 + i * 0.8, 12.5 + i * 0.8);
      const x = 130 + i * 160 + 40 * (1 - c.eO(p));
      tr.setAttribute("transform", "translate(" + x + ",306) scale(0.85)");
      tr.setAttribute("opacity", p);
    });
    n.fndct.textContent = t > 16 ? "Novidade: o FNDCT passa a poder custear bolsas de estudo e pesquisa." : "";
    n.peep.img.setAttribute("opacity", c.seg(t, 2, 3) * 0.96);
    n.peep.g.setAttribute("transform",
      "translate(780," + (250 + Math.sin(t * 1.5) * 4).toFixed(1) + ") scale(0.83)");
  }
};

/* ---------- 3. Teto de crescimento ---------- */
ANIMACOES.teto = {
  duracao: 20,
  legendas: [
    [0.5, 4.5, "O limite anual de gastos cresce pela inflação (IPCA) mais um crescimento real, hoje até 2,5%."],
    [5, 10, "Nos anos com contingenciamento, o texto aprovado reduz esse crescimento real para 2,0%."],
    [10.5, 15, "Na base de R$ 2.392,6 bi (limite de 2026), a diferença é de R$ 12,4 bi de espaço a menos."],
    [15.5, 19.5, "Atenção: os dois cenários crescem acima da inflação. Diminuir o teto não é cortar o orçamento."]
  ],
  descricao: "Animação: teto de crescimento real das despesas de 2,5% para 2,0% em anos de contingenciamento.",
  setup: function (c) {
    const n = c.nos;
    const r = M.regras.crescimento;
    c.pivo(c.g, 60, 60, "limite de despesas");
    n.base = c.E("rect", { x: 70, y: 320, width: 300, height: 90, rx: 10, fill: "#3c4a63" }, c.g);
    n.baseTxt = c.rotulo(c.g, 0, 0, "", PAL.ink, 16);
    n.ipca1 = c.E("rect", { x: 370, y: 320, width: 0, height: 90, fill: PAL.azul, opacity: .85 }, c.g);
    n.ipca2 = c.E("rect", { x: 70, y: 440, width: 0, height: 90, fill: PAL.azul, opacity: .85 }, c.g);
    n.real1 = c.E("rect", { x: 370, y: 320, width: 0, height: 90, rx: 4, fill: PAL.verde }, c.g);
    n.real2 = c.E("rect", { x: 70, y: 440, width: 0, height: 90, rx: 4, fill: PAL.amarelo }, c.g);
    n.leg1a = c.rotulo(c.g, 0, 0, "", PAL.sub, 15);
    n.leg1b = c.rotulo(c.g, 0, 0, "", PAL.sub, 15);
    n.leg2a = c.rotulo(c.g, 0, 0, "", PAL.sub, 15);
    n.leg2b = c.rotulo(c.g, 0, 0, "", PAL.sub, 15);
    n.tot1 = c.rotulo(c.g, 0, 0, "", PAL.verde, 20);
    n.tot2 = c.rotulo(c.g, 0, 0, "", PAL.amarelo, 20);
    n.nota = c.rotulo(c.g, 60, 92, "", PAL.ink, 18);
    n.bracket = c.rotulo(c.g, 0, 0, "", PAL.vermelho, 20);
    n.peep = c.peep(c.g, "peep-1.svg", 770, 80, 160);
  },
  tick: function (c, t) {
    const n = c.nos;
    const p1 = c.seg(t, 0.5, 3);
    n.base.setAttribute("opacity", p1);
    n.baseTxt.textContent = "base: R$ 2.392,6 bi";
    n.baseTxt.setAttribute("x", 90); n.baseTxt.setAttribute("y", 372);
    n.baseTxt.setAttribute("opacity", p1);
    const pIpca = c.eO(c.seg(t, 2, 4));
    n.ipca1.setAttribute("x", 370); n.ipca1.setAttribute("width", 180 * pIpca);
    n.ipca2.setAttribute("x", 70); n.ipca2.setAttribute("width", 180 * pIpca);
    const pR1 = c.eO(c.seg(t, 5, 7));
    const pR2 = c.eO(c.seg(t, 10, 12));
    n.real1.setAttribute("x", 550); n.real1.setAttribute("width", 130 * pR1);
    n.real2.setAttribute("x", 250); n.real2.setAttribute("width", 104 * pR2);
    n.leg1a.textContent = "IPCA"; n.leg1a.setAttribute("x", 420); n.leg1a.setAttribute("y", 312);
    n.leg1b.textContent = "+" + c.fmtPct(M.regras.crescimento.maximoAtual, 1) + " real (hoje)";
    n.leg1b.setAttribute("x", 555); n.leg1b.setAttribute("y", 312); n.leg1b.setAttribute("fill", PAL.verde);
    n.leg2a.textContent = "IPCA"; n.leg2a.setAttribute("x", 120); n.leg2a.setAttribute("y", 432);
    n.leg2b.textContent = "+" + c.fmtPct(M.regras.crescimento.maximoNovo, 1) + " real (texto aprovado)";
    n.leg2b.setAttribute("x", 255); n.leg2b.setAttribute("y", 432); n.leg2b.setAttribute("fill", PAL.amarelo);
    n.tot1.textContent = t > 7 ? "= R$ 2.550,5 bi" : "";
    n.tot1.setAttribute("x", 700); n.tot1.setAttribute("y", 372);
    n.tot2.textContent = t > 12 ? "= R$ 2.538,1 bi" : "";
    n.tot2.setAttribute("x", 380); n.tot2.setAttribute("y", 492);
    n.nota.textContent = t > 15 ? "Nenhum dos dois é corte: ambos crescem acima da inflação." : "";
    n.bracket.textContent = t > 12.5 ? "− R$ 12,4 bi de espaço" : "";
    n.bracket.setAttribute("x", 640); n.bracket.setAttribute("y", 460);
    n.peep.img.setAttribute("opacity", c.seg(t, 14.5, 15.5) * 0.96);
    n.peep.g.setAttribute("transform",
      "translate(770," + (80 + Math.sin(t * 1.4) * 4).toFixed(1) + ") scale(0.74)");
  }
};

/* ---------- 4. Meta fiscal e bloqueio ---------- */
ANIMACOES.contingenciamento = {
  duracao: 24,
  legendas: [
    [0.5, 5, "A meta de 2027 é superávit de 0,5% do PIB. Entre 0,25% e 0,75%, a meta já é considerada cumprida."],
    [5.5, 10.5, "Uma projeção de 0,35% está dentro da faixa, mas abaixo do centro: hoje, nada pode ser bloqueado."],
    [11, 16, "O texto aprovado muda isso: o governo passa a PODER bloquear para se aproximar do centro (não é obrigado)."],
    [16.5, 20, "Abaixo de 0,25%, a LRF já obriga bloqueio hoje, com corte na prática sobre a verba discricionária."],
    [20.5, 23.5, "Estimativa do parecer para 2027: R$ 12,8 a 18,3 bi de efeito do bloqueio com foco no centro."]
  ],
  descricao: "Animação: intervalo de tolerância da meta fiscal e o novo bloqueio preventivo facultativo.",
  setup: function (c) {
    const n = c.nos;
    c.pivo(c.g, 60, 60, "meta fiscal 2027");
    const yFaixa = 240;
    n.eixo = c.E("line", { x1: 80, y1: yFaixa, x2: 880, y2: yFaixa, stroke: PAL.sub, "stroke-width": 3, opacity: .6 }, c.g);
    n.faixa = c.E("rect", { x: 0, y: yFaixa - 26, width: 0, height: 52, rx: 8, fill: PAL.verde, opacity: .22 }, c.g);
    n.faixaBorda1 = c.E("line", { x1: 0, y1: yFaixa - 30, x2: 0, y2: yFaixa + 30, stroke: PAL.verde, "stroke-width": 3 }, c.g);
    n.faixaBorda2 = c.E("line", { x1: 0, y1: yFaixa - 30, x2: 0, y2: yFaixa + 30, stroke: PAL.verde, "stroke-width": 3 }, c.g);
    n.centro = c.E("line", { x1: 0, y1: yFaixa - 44, x2: 0, y2: yFaixa + 44, stroke: PAL.amarelo, "stroke-width": 4 }, c.g);
    n.marcador = c.E("circle", { cx: -30, cy: yFaixa, r: 13, fill: PAL.vermelho, stroke: PAL.claro, "stroke-width": 3 }, c.g);
    n.seta = c.E("line", { x1: 0, y1: yFaixa, x2: 0, y2: yFaixa, stroke: PAL.amarelo, "stroke-width": 6, opacity: 0 }, c.g);
    n.rotPiso = c.rotulo(c.g, 0, 0, "", PAL.verde, 16);
    n.rotCentro = c.rotulo(c.g, 0, 0, "", PAL.amarelo, 16);
    n.rotTeto = c.rotulo(c.g, 0, 0, "", PAL.verde, 16);
    n.rotMarc = c.rotulo(c.g, 0, 0, "", PAL.vermelho, 17);
    n.cadeado = c.cadeado(c.g, 0, 120, 1);
    n.nota = c.rotulo(c.g, 80, 400, "", PAL.ink, 19);
    n.peep = c.peep(c.g, "peep-75.svg", 770, 330, 150);
    const pos = pp => 80 + ((pp + 0.5) / 2.25) * 800;
    n.pos = pos;
  },
  tick: function (c, t) {
    const n = c.nos;
    const pos = n.pos;
    const yFaixa = 240;
    const pF = c.eO(c.seg(t, 0.5, 3));
    n.faixa.setAttribute("x", pos(0.25));
    n.faixa.setAttribute("width", (pos(0.75) - pos(0.25)) * pF);
    n.faixaBorda1.setAttribute("x1", pos(0.25)); n.faixaBorda1.setAttribute("x2", pos(0.25));
    n.faixaBorda1.setAttribute("opacity", pF);
    n.faixaBorda2.setAttribute("x1", pos(0.75)); n.faixaBorda2.setAttribute("x2", pos(0.75));
    n.faixaBorda2.setAttribute("opacity", pF);
    n.centro.setAttribute("x1", pos(0.5)); n.centro.setAttribute("x2", pos(0.5));
    n.centro.setAttribute("opacity", pF);
    n.rotPiso.textContent = "0,25% (piso)"; n.rotPiso.setAttribute("x", pos(0.25) - 38); n.rotPiso.setAttribute("y", yFaixa + 74);
    n.rotCentro.textContent = "0,5% (centro da meta)"; n.rotCentro.setAttribute("x", pos(0.5) - 70); n.rotCentro.setAttribute("y", yFaixa - 58);
    n.rotTeto.textContent = "0,75%"; n.rotTeto.setAttribute("x", pos(0.75) - 24); n.rotTeto.setAttribute("y", yFaixa + 74);
    const pM = c.seg(t, 5, 7);
    n.marcador.setAttribute("cx", lerp(-30, pos(0.35), c.eIO(pM)));
    n.rotMarc.textContent = t > 7 ? "projeção: 0,35% do PIB" : "";
    n.rotMarc.setAttribute("x", pos(0.35) - 70); n.rotMarc.setAttribute("y", yFaixa - 92);
    const pSeta = c.seg(t, 12, 14);
    n.seta.setAttribute("x1", pos(0.35)); n.seta.setAttribute("x2", lerp(pos(0.35), pos(0.5), pSeta));
    n.seta.setAttribute("opacity", pSeta > 0 && pSeta < 1 ? 0.9 : (t > 14 ? 0.5 : 0));
    n.cadeado.setAttribute("transform", "translate(" + lerp(pos(0.35), pos(0.5), pSeta) + ",130)");
    n.cadeado.setAttribute("opacity", c.seg(t, 11, 12));
    n.nota.textContent = t > 20 ? "Parecer: efeito estimado de R$ 12,8 a 18,3 bi em 2027 (estimativa, não economia realizada)." : "";
    n.peep.img.setAttribute("opacity", c.seg(t, 16.5, 17.5) * 0.96);
    n.peep.g.setAttribute("transform",
      "translate(770," + (330 + Math.sin(t * 1.5) * 4).toFixed(1) + ") scale(0.69)");
  }
};

/* ---------- 5. Benefícios tributários ---------- */
ANIMACOES.beneficios = {
  duracao: 20,
  legendas: [
    [0.5, 4.5, "A Lei 224/2025 já cortava linearmente 10% dos benefícios tributários federais."],
    [5, 9.5, "O texto aprovado dobra o corte para 20%, na mesma base elegível."],
    [10, 15, "Ficam de fora: CPRB, TI e semicondutores, veículos para PcD e TEA, Zona Franca, cesta básica, Simples."],
    [15.5, 19.5, "Renúncia retirada não é arrecadação garantida: empresas podem reagir ou recorrer. Estimativa: R$ 15 bi."]
  ],
  descricao: "Animação: corte linear de benefícios tributários dobra de 10% para 20%, com exceções.",
  setup: function (c) {
    const n = c.nos;
    const r = M.regras.beneficios;
    c.pivo(c.g, 60, 60, "benefícios tributários");
    n.moedas = [];
    for (let i = 0; i < 10; i++) {
      const m = c.E("g", { opacity: 0 }, c.g);
      c.E("circle", { cx: 0, cy: 0, r: 26, fill: PAL.amarelo, opacity: .9 }, m);
      c.E("text", { x: 0, y: 7, "text-anchor": "middle", "font-size": 22, "font-weight": 800, fill: "#5a4300", text: "R$" }, m);
      n.moedas.push(m);
    }
    n.tesoura = c.rotulo(c.g, 0, 0, "", PAL.sub, 30);
    n.rot10 = c.rotulo(c.g, 0, 0, "", PAL.ink, 20);
    n.rot20 = c.rotulo(c.g, 0, 0, "", PAL.ink, 20);
    n.excecoes = c.E("g", { opacity: 0 }, c.g);
    const excessões = ["CPRB", "TI e semicondutores", "veículos PcD/TEA", "Zona Franca", "cesta básica", "Simples"];
    excessões.forEach(function (nome, i) {
      const x = 90 + (i % 3) * 270, y = 300 + Math.floor(i / 3) * 78;
      c.E("rect", { x: x, y: y, width: 250, height: 58, rx: 12, fill: PAL.painel, stroke: PAL.verde, strokeOpacity: .7 }, n.excecoes);
      c.rotulo(n.excecoes, x + 14, y + 36, "✓ " + nome, PAL.verde, 17);
    });
    c.rotulo(n.excecoes, 60, 276, "Exceções (continuam intocadas):", PAL.ink, 19);
    n.nota = c.rotulo(c.g, 60, 486, "", PAL.amarelo, 18);
  },
  tick: function (c, t) {
    const n = c.nos;
    const y = 150;
    n.moedas.forEach(function (m, i) {
      const p = c.seg(t, 0.5 + i * 0.15, 1.3 + i * 0.15);
      m.setAttribute("transform", "translate(" + lerp(60, 100 + i * 78, c.eO(p)) + "," + y + ")");
      m.setAttribute("opacity", p);
      const fase10 = c.seg(t, 5, 8);
      const fase20 = c.seg(t, 9, 12);
      const cortei10 = i === 9 ? fase10 : 0;
      const cortei20 = i === 8 ? fase20 : 0;
      const fora = Math.max(cortei10, cortei20);
      if (fora > 0) {
        m.setAttribute("transform", "translate(" + (100 + i * 78 + fora * 60) + "," + (y - fora * 90) + ") scale(" + (1 - 0.4 * fora) + ")");
        m.setAttribute("opacity", String(1 - fora));
      }
    });
    n.tesoura.textContent = t > 4.4 && t < 12.5 ? "✂" : "";
    n.tesoura.setAttribute("x", 800); n.tesoura.setAttribute("y", y + 10);
    n.rot10.textContent = t > 7.5 ? "corte de 10% (lei atual): 1 em cada 10 moedas" : "";
    n.rot10.setAttribute("x", 60); n.rot10.setAttribute("y", 230);
    n.rot20.textContent = t > 11.5 ? "com 20%: 2 em cada 10 saem da base" : "";
    n.rot20.setAttribute("x", 60); n.rot20.setAttribute("y", 258);
    n.excecoes.setAttribute("opacity", c.seg(t, 10, 11));
    n.nota.textContent = t > 15 ? "Parecer: R$ 15 bi estimados da redução adicional em 2027 (renúncia retirada ≠ arrecadação garantida)." : "";
  }
};

/* ---------- 6. Supersalários ---------- */
ANIMACOES.supersalarios = {
  duracao: 18,
  legendas: [
    [0.5, 5, "Verbas indenizatórias e auxílios fazem remunerações ultrapassarem o teto constitucional: os supersalários."],
    [5.5, 10, "O texto aprovado dá 120 dias para o Congresso aprovar a lei que regulamenta o tema."],
    [10.5, 14, "E define para onde vai a economia: segurança pública no Executivo; recomposição de quadros nos outros Poderes."],
    [14.5, 17.5, "Nenhum pagamento é cortado automaticamente: sem a nova lei, tudo continua como está."]
  ],
  descricao: "Animação: supersalários ganham prazo de 120 dias para regulamentação e destinação definida para a economia.",
  setup: function (c) {
    const n = c.nos;
    c.pivo(c.g, 60, 60, "supersalários");
    n.teto = c.E("line", { x1: 60, y1: 200, x2: 560, y2: 200, stroke: PAL.vermelho, "stroke-width": 4, "stroke-dasharray": "14 10" }, c.g);
    n.rotTeto = c.rotulo(c.g, 60, 186, "teto constitucional", PAL.vermelho, 16);
    n.notas = [];
    for (let i = 0; i < 5; i++) {
      const nt = c.E("g", { opacity: 0 }, c.g);
      c.E("rect", { x: 0, y: 0, width: 84, height: 44, rx: 6, fill: PAL.verde, opacity: .92 }, nt);
      c.E("text", { x: 42, y: 29, "text-anchor": "middle", "font-size": 18, "font-weight": 800, fill: "#0c0e12", text: "R$" }, nt);
      n.notas.push(nt);
    }
    n.relogio = c.E("g", { opacity: 0 }, c.g);
    c.E("circle", { cx: 660, cy: 150, r: 62, fill: PAL.painel, stroke: PAL.amarelo, "stroke-width": 5 }, n.relogio);
    c.E("line", { x1: 660, y1: 150, x2: 660, y2: 108, stroke: PAL.amarelo, "stroke-width": 6, "stroke-linecap": "round" }, n.relogio);
    c.E("line", { x1: 660, y1: 150, x2: 690, y2: 160, stroke: PAL.amarelo, "stroke-width": 6, "stroke-linecap": "round" }, n.relogio);
    n.rot120 = c.rotulo(n.relogio, 612, 250, "120 dias para o Congresso regulamentar", PAL.amarelo, 17);
    n.destino = c.E("g", { opacity: 0 }, c.g);
    c.E("rect", { x: 90, y: 330, width: 330, height: 70, rx: 12, fill: PAL.painel, stroke: PAL.azul }, n.destino);
    c.rotulo(n.destino, 110, 372, "Executivo: segurança pública", PAL.ink, 18);
    c.E("rect", { x: 470, y: 330, width: 380, height: 70, rx: 12, fill: PAL.painel, stroke: PAL.azul }, n.destino);
    c.rotulo(n.destino, 490, 372, "Demais Poderes: recompor quadros", PAL.ink, 18);
    c.rotulo(n.destino, 60, 300, "Destino da economia (se acontecer):", PAL.ink, 19);
    n.nota = c.rotulo(c.g, 60, 470, "", PAL.sub, 18);
  },
  tick: function (c, t) {
    const n = c.nos;
    n.notas.forEach(function (nt, i) {
      const p = c.seg(t, 0.5 + i * 0.3, 1.3 + i * 0.3);
      nt.setAttribute("transform", "translate(" + (80 + i * 96) + "," + (208 + 0) + ")");
      nt.setAttribute("opacity", p);
      nt.setAttribute("transform", "translate(" + (80 + i * 96) + "," + (120 - i * 26) + ")");
    });
    n.relogio.setAttribute("opacity", c.seg(t, 5.5, 6.5));
    n.destino.setAttribute("opacity", c.seg(t, 10.5, 11.5));
    n.nota.textContent = t > 14 ? "Sem a nova lei, nenhum pagamento muda automaticamente." : "";
  }
};

/* ---------- 7. Outras medidas ---------- */
ANIMACOES.outras = {
  duracao: 22,
  legendas: [
    [0.5, 5, "Lei Kandir: repasses reduzidos entre 2027 e 2030 voltam a ser devolvidos já no ano seguinte, até 2037."],
    [5.5, 10, "Compensação tributária: restrições ao uso de créditos, estimadas em R$ 12,8 a 18,3 bi em 2027."],
    [10.5, 15, "Regra de ouro: margem ampliada em R$ 100 bi com a desvinculação do superávit financeiro."],
    [15.5, 19.5, "Diesel: até R$ 10,5 bi de subvenção em 2026 fora da apuração da meta. Juntas, as medidas somam impacto estimado de R$ 45,1 a 56,1 bi."]
  ],
  descricao: "Animação: Lei Kandir, compensação tributária, regra de ouro, diesel e o impacto total estimado.",
  setup: function (c) {
    const n = c.nos;
    c.pivo(c.g, 60, 60, "outras medidas");
    n.painelAtual = c.E("g", {}, c.g);
    n.indice = -1;
    n.peep = c.peep(c.g, "peep-105.svg", 780, 320, 150);
  },
  tick: function (c, t) {
    const n = c.nos;
    const etapa = t < 5 ? 0 : t < 10 ? 1 : t < 15 ? 2 : 3;
    if (etapa !== n.indice) {
      n.indice = etapa;
      n.painelAtual.replaceChildren();
      const g = n.painelAtual;
      const titulos = ["Lei Kandir", "Compensação tributária", "Regra de ouro", "Diesel em 2026"];
      c.rotulo(g, 60, 140, titulos[etapa], PAL.amarelo, 30);
      if (etapa === 0) {
        for (let i = 0; i < 4; i++) {
          c.E("rect", { x: 80 + i * 120, y: 200, width: 90, height: 60, rx: 8, fill: PAL.painel, stroke: PAL.sub }, g);
          c.rotulo(g, 80 + i * 120, 240, String(2027 + i), PAL.ink, 20).setAttribute("text-anchor", "middle");
        }
        c.rotulo(g, 80, 330, "devolução a partir do ano seguinte, até 2037", PAL.ink, 19);
        const seta = c.E("path", { d: "M110 300 H 520", stroke: PAL.verde, "stroke-width": 5, fill: "none" }, g);
        c.E("path", { d: "M520 300 l -16 -10 v 20 z", fill: PAL.verde }, g);
      } else if (etapa === 1) {
        c.rotulo(g, 80, 220, "empresas usam créditos para pagar menos imposto", PAL.ink, 19);
        c.E("rect", { x: 80, y: 250, width: 600, height: 40, rx: 8, fill: PAL.azul, opacity: .8 }, g);
        c.E("rect", { x: 80, y: 250, width: 600, height: 40, rx: 8, fill: PAL.painel, opacity: 0 }, g);
        c.E("rect", { x: 680, y: 250, width: 180, height: 40, rx: 8, fill: PAL.vermelho, opacity: .85 }, g);
        c.rotulo(g, 690, 280, "uso restrito", PAL.claro, 16);
        c.rotulo(g, 80, 340, "estimativa do parecer: R$ 12,8 a 18,3 bi em 2027", PAL.ink, 19);
      } else if (etapa === 2) {
        c.rotulo(g, 80, 220, "a regra de ouro limita empréstimos ao tamanho da dívida quitada", PAL.ink, 19);
        c.E("rect", { x: 80, y: 250, width: 500, height: 46, rx: 10, fill: PAL.painel, stroke: PAL.sub }, g);
        c.E("rect", { x: 80, y: 250, width: 660, height: 46, rx: 10, fill: PAL.verde, opacity: .35 }, g);
        c.rotulo(g, 100, 282, "+ R$ 100 bi de margem (superávit financeiro desvinculado)", PAL.ink, 19);
      } else {
        c.rotulo(g, 80, 220, "subvenção ao diesel rodoviário fora da apuração da meta de 2026", PAL.ink, 19);
        c.E("rect", { x: 80, y: 250, width: 420, height: 46, rx: 10, fill: PAL.amarelo, opacity: .8 }, g);
        c.rotulo(g, 100, 282, "até R$ 10,5 bi (conflito no Oriente Médio)", "#3d3000", 19);
        c.E("rect", { x: 80, y: 340, width: 800, height: 80, rx: 12, fill: PAL.painel, stroke: PAL.amarelo }, g);
        c.rotulo(g, 100, 375, "Impacto conjunto estimado em 2027: R$ 45,1 a 56,1 bi (parecer, estimativa)", PAL.ink, 20);
      }
    }
    n.painelAtual.setAttribute("opacity", t < 19.5 ? 1 : 0.9);
    n.peep.img.setAttribute("opacity", c.seg(t, 15.5, 16.5) * 0.96);
    n.peep.g.setAttribute("transform",
      "translate(780," + (320 + Math.sin(t * 1.4) * 4).toFixed(1) + ") scale(0.69)");
  }
};

window.ANIMACOES = ANIMACOES;
window.montarAnimacao = montarAnimacao;
})();
