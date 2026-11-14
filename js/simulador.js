/* ============ ENTENDA E SIMULE O AJUSTE FISCAL ============ */
/* Renderiza os cards "O que o Senado aprovou até agora?" e os simuladores. */
/* As regras oficiais estão em js/medidas.js; nada de valor legislativo aqui. */
(function () {
  "use strict";

  var M = window.MEDIDAS;
  var estados = {}; // estado atual de cada simulador, para o comparador

  /* ---------- utilidades ---------- */
  function el(id) { return document.getElementById(id); }

  function fmtBi(v) {
    return "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " bi";
  }
  function fmtBi2(v) {
    return "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " bi";
  }
  function fmtPct(v, casas) {
    var c = casas === undefined ? 1 : casas;
    return (v * 100).toLocaleString("pt-BR", { minimumFractionDigits: c, maximumFractionDigits: c }) + "%";
  }
  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

  /* ---------- fábrica de controles (range + number sincronizados) ---------- */
  function controle(pai, cfg) {
    // cfg: {rotulo, min, max, step, valor, sufixo, inteiro}
    var wrap = document.createElement("div");
    wrap.className = "controle";

    var rot = document.createElement("label");
    rot.className = "controle-rotulo";
    rot.textContent = cfg.rotulo;

    var inputWrap = document.createElement("div");
    inputWrap.className = "controle-entradas";

    var range = document.createElement("input");
    range.type = "range";
    range.min = cfg.min; range.max = cfg.max; range.step = cfg.step; range.value = cfg.valor;

    var num = document.createElement("input");
    num.type = "number";
    num.min = cfg.min; num.max = cfg.max; num.step = cfg.step; num.value = cfg.valor;

    var id = "c" + Math.random().toString(36).slice(2, 8);
    range.id = id; num.id = id + "-num";
    range.setAttribute("aria-label", cfg.rotulo);
    num.setAttribute("aria-label", cfg.rotulo + " (valor exato)");

    rot.setAttribute("for", id);

    if (cfg.sufixo) {
      var suf = document.createElement("span");
      suf.className = "controle-sufixo";
      suf.textContent = cfg.sufixo;
      inputWrap.appendChild(num);
      inputWrap.appendChild(suf);
    } else {
      inputWrap.appendChild(num);
    }
    inputWrap.appendChild(range);

    wrap.appendChild(rot);
    wrap.appendChild(inputWrap);
    pai.appendChild(wrap);

    var valor = cfg.valor;
    function set(v, silencioso) {
      v = clamp(Number(v) || 0, Number(range.min), Number(range.max));
      valor = v;
      range.value = v;
      num.value = v;
      if (!silencioso && cfg.aoMudar) cfg.aoMudar(v);
    }
    range.addEventListener("input", function () { set(range.value); });
    num.addEventListener("change", function () { set(num.value); });
    return {
      get: function () { return valor; },
      set: set,
      setMax: function (novoMax) { range.max = novoMax; num.max = novoMax; }
    };
  }

  /* ---------- estrutura de um simulador ---------- */
  function criarSim(cfg) {
    // cfg: {id, numero, pergunta, explica, fonte, contaTexto, aviso?}
    var artigo = document.createElement("article");
    artigo.className = "sim";
    artigo.id = cfg.id;

    var h3 = document.createElement("h3");
    h3.className = "sim-pergunta";
    h3.textContent = cfg.numero + ". " + cfg.pergunta;
    artigo.appendChild(h3);

    var exp = document.createElement("p");
    exp.className = "sim-explica";
    exp.textContent = cfg.explica;
    artigo.appendChild(exp);

    var controles = document.createElement("div");
    controles.className = "sim-controles";
    artigo.appendChild(controles);

    var resultados = document.createElement("div");
    resultados.className = "sim-resultados";
    resultados.setAttribute("aria-live", "polite");
    artigo.appendChild(resultados);

    var barras = document.createElement("div");
    barras.className = "sim-barras";
    artigo.appendChild(barras);

    var interpretacao = document.createElement("p");
    interpretacao.className = "sim-interpretacao";
    artigo.appendChild(interpretacao);

    if (cfg.aviso) {
      var aviso = document.createElement("p");
      aviso.className = "sim-aviso";
      aviso.textContent = cfg.aviso;
      artigo.appendChild(aviso);
    }

    var rodape = document.createElement("div");
    rodape.className = "sim-rodape";

    var btnReset = document.createElement("button");
    btnReset.type = "button";
    btnReset.className = "btn btn-mini sim-restaurar";
    btnReset.textContent = "↺ Restaurar valores";
    rodape.appendChild(btnReset);

    var conta = document.createElement("details");
    conta.className = "sim-conta";
    var sumario = document.createElement("summary");
    sumario.textContent = "Como fizemos esta conta?";
    var contaTexto = document.createElement("p");
    contaTexto.textContent = cfg.contaTexto;
    conta.appendChild(sumario);
    conta.appendChild(contaTexto);
    rodape.appendChild(conta);
    artigo.appendChild(rodape);

    var fonte = document.createElement("p");
    fonte.className = "sim-fonte";
    fonte.textContent = "Fonte da regra: " + cfg.fonte;
    artigo.appendChild(fonte);

    el("lista-simuladores").appendChild(artigo);

    return {
      artigo: artigo,
      controles: controles,
      resultados: resultados,
      barras: barras,
      interpretacao: interpretacao,
      btnReset: btnReset,
      ui: {}
    };
  }

  function mostrarResultado(container, itens) {
    // itens: [{rotulo, valor, classe?}]
    container.replaceChildren();
    itens.forEach(function (it) {
      var box = document.createElement("div");
      box.className = "resultado" + (it.classe ? " " + it.classe : "");
      var r = document.createElement("span");
      r.className = "resultado-rotulo";
      r.textContent = it.rotulo;
      var v = document.createElement("span");
      v.className = "resultado-valor";
      v.textContent = it.valor;
      box.appendChild(r);
      box.appendChild(v);
      container.appendChild(box);
    });
  }

  function mostrarBarras(container, linhas) {
    // linhas: [{rotulo, valor (texto), largura (0-1), classe}]
    container.replaceChildren();
    var maxLargura = Math.max.apply(null, linhas.map(function (l) { return l.largura; }));
    linhas.forEach(function (l) {
      var linha = document.createElement("div");
      linha.className = "barra-linha";
      var rot = document.createElement("span");
      rot.className = "barra-rotulo";
      rot.textContent = l.rotulo;
      var trilho = document.createElement("div");
      trilho.className = "barra-trilho";
      trilho.setAttribute("role", "img");
      trilho.setAttribute("aria-label", l.rotulo + ": " + l.valor);
      var fill = document.createElement("div");
      fill.className = "barra-fill " + (l.classe || "");
      fill.style.width = (maxLargura > 0 ? (l.largura / maxLargura) * 100 : 0) + "%";
      trilho.appendChild(fill);
      var val = document.createElement("span");
      val.className = "barra-valor";
      val.textContent = l.valor;
      linha.appendChild(rot);
      linha.appendChild(trilho);
      linha.appendChild(val);
      container.appendChild(linha);
    });
  }

  /* ---------- cards "O que o Senado aprovou até agora?" ---------- */
  function renderCards() {
    var pai = el("lista-aprovado");
    M.cards.forEach(function (c) {
      var det = document.createElement("details");
      det.className = "card-aprovado";
      var sum = document.createElement("summary");
      var icone = document.createElement("span");
      icone.className = "card-icone";
      icone.textContent = c.icone;
      var titulo = document.createElement("span");
      titulo.textContent = c.titulo;
      sum.appendChild(icone);
      sum.appendChild(titulo);
      det.appendChild(sum);

      var campos = [
        ["O que acontece hoje", c.hoje],
        ["O que o projeto propõe", c.proposta],
        ["Um exemplo simples", c.exemplo],
        ["Qual pode ser o impacto", c.impacto],
        ["O que dizem os críticos", c.criticos],
        ["Justificativa dos defensores", c.defensores],
        ["Situação na tramitação", c.situacao]
      ];
      campos.forEach(function (par) {
        var h4 = document.createElement("h4");
        h4.textContent = par[0];
        var p = document.createElement("p");
        p.textContent = par[1];
        det.appendChild(h4);
        det.appendChild(p);
      });

      if (c.simulador) {
        var link = document.createElement("a");
        link.className = "btn btn-mini btn-impacto";
        link.href = "#" + c.simulador;
        link.textContent = "▶ Veja o impacto na prática";
        det.appendChild(link);
      }

      var fonte = document.createElement("p");
      fonte.className = "card-fonte";
      var a = document.createElement("a");
      a.href = c.fonteUrl;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "Fonte oficial: " + c.fonte;
      fonte.appendChild(a);
      det.appendChild(fonte);

      pai.appendChild(det);
    });
  }

  /* ---------- SIMULADOR 1: piso da saúde ---------- */
  function simPisoSaude() {
    var r = M.regras.pisoSaude;
    var s = criarSim({
      id: "sim-piso-saude",
      numero: "1",
      pergunta: "Quanto muda o piso mínimo da saúde?",
      explica: "A Constituição exige que a União invista no mínimo " + fmtPct(r.aliquota, 0) +
        " da Receita Corrente Líquida (RCL) em saúde. O texto aprovado exclui receitas de petróleo dessa base. " +
        "Aumente ou diminua os valores e veja o efeito na obrigação mínima. Os valores iniciais são os do Orçamento de 2027.",
      fonte: "Constituição (art. 198) e nota Conorf/Senado (pág. 18); números iniciais do PLOA 2027",
      contaTexto: "piso sem exclusão = receita × 15%.  piso com exclusão = (receita − parcela excluída) × 15%. " +
        "A diferença é a redução hipotética da obrigação mínima. A ferramenta simplifica a regra e pressupõe que a " +
        "parcela escolhida seja juridicamente elegível à exclusão.",
      aviso: "A diferença calculada é uma redução hipotética do piso obrigatório, e não um corte confirmado no orçamento do SUS."
    });

    var cRcl = controle(s.controles, {
      rotulo: "Receita considerada (RCL)", min: 500, max: 3000, step: 10,
      valor: r.exemploReal.rclSemExclusao, sufixo: "bi", aoMudar: function () { calcular(); }
    });
    var cExc = controle(s.controles, {
      rotulo: "Receita extraordinária excluída", min: 0, max: 500, step: 5,
      valor: r.exemploReal.rclSemExclusao - r.exemploReal.rclComExclusao, sufixo: "bi", aoMudar: function () { calcular(); }
    });

    function calcular() {
      var receita = cRcl.get();
      var exc = Math.min(cExc.get(), receita);
      cExc.setMax(receita);
      if (cExc.get() > receita) cExc.set(receita, true);

      var sem = receita * r.aliquota;
      var com = (receita - exc) * r.aliquota;
      var dif = sem - com;
      var difPct = sem > 0 ? dif / sem : 0;

      estados["sim-piso-saude"] = { sem: sem, com: com, dif: dif };

      mostrarResultado(s.resultados, [
        { rotulo: "Piso sem a exclusão", valor: fmtBi(sem), classe: "ok" },
        { rotulo: "Piso com a exclusão", valor: fmtBi(com), classe: "atencao" },
        { rotulo: "Diferença", valor: fmtBi2(dif) + " (" + fmtPct(difPct) + ")", classe: "grande" }
      ]);
      mostrarBarras(s.barras, [
        { rotulo: "Sem exclusão", valor: fmtBi(sem), largura: sem, classe: "ok" },
        { rotulo: "Com exclusão", valor: fmtBi(com), largura: com, classe: "atencao" }
      ]);
      s.interpretacao.textContent =
        "Você simulou uma receita de " + fmtBi(receita) + " e uma exclusão de " + fmtBi(exc) +
        ". Nesse cenário, o piso calculado da saúde seria " + fmtBi2(dif) + " menor que sem a exclusão (" +
        fmtPct(difPct) + " a menos de obrigação mínima). Isso não significa necessariamente que o governo gastaria " +
        "esse valor a menos: é o assoalho legal que diminui. No Orçamento de 2027, a exclusão aplicada reduziu o piso em R$ 6,8 bilhões (de R$ 279,0 bi para R$ 272,2 bi).";
      atualizarComparador();
    }
    s.btnReset.addEventListener("click", function () {
      cRcl.set(r.exemploReal.rclSemExclusao, true);
      cExc.set(r.exemploReal.rclSemExclusao - r.exemploReal.rclComExclusao, true);
      calcular();
    });
    calcular();
  }

  /* ---------- SIMULADOR 2: limite de crescimento ---------- */
  function simTeto() {
    var r = M.regras.crescimento;
    var s = criarSim({
      id: "sim-teto",
      numero: "2",
      pergunta: "Quanto muda o limite de crescimento das despesas?",
      explica: "O limite anual de gastos primários cresce pela inflação mais um crescimento real, hoje limitado a " +
        fmtPct(r.maximoAtual) + " ao ano. Nos anos com contingenciamento, o texto aprovado reduz esse teto real para " +
        fmtPct(r.maximoNovo) + ". Crescimento real é crescimento acima da inflação: nenhum dos cenários é um corte nominal. " +
        "O valor inicial é o limite de 2026 usado pela Consultoria do Senado.",
      fonte: "LC 200/2023 (art. 5º) e nota Conorf/Senado, item 3.2.3 (pág. 9); base inicial do Quadro 6",
      contaTexto: "valor nominal = valor base × (1 + inflação) × (1 + crescimento real). Calculamos com 2,5% e com 2,0% " +
        "de crescimento real e separamos a parcela da inflação da parcela de crescimento real. O teto de 2% só se aplica " +
        "nos anos em que as condições legais de contenção forem acionadas."
    });

    var cBase = controle(s.controles, {
      rotulo: "Limite de despesas do ano anterior", min: 500, max: 3000, step: 10,
      valor: 2392.6, sufixo: "bi", aoMudar: function () { calcular(); }
    });
    var cIpca = controle(s.controles, {
      rotulo: "Inflação (IPCA) do ano", min: 0, max: 15, step: 0.5,
      valor: 4, sufixo: "%", aoMudar: function () { calcular(); }
    });

    var wrapToggle = document.createElement("div");
    wrapToggle.className = "controle controle-toggle";
    var lab = document.createElement("label");
    lab.className = "toggle";
    var check = document.createElement("input");
    check.type = "checkbox";
    check.checked = true;
    check.id = "toggle-contencao";
    var txt = document.createElement("span");
    txt.textContent = "Ano com condições de contenção acionadas (teto de 2% aplicável)";
    lab.appendChild(check);
    lab.appendChild(txt);
    wrapToggle.appendChild(lab);
    s.controles.appendChild(wrapToggle);
    check.addEventListener("change", calcular);

    function calcular() {
      var base = cBase.get();
      var ipca = cIpca.get() / 100;
      var aplicavel = check.checked;

      var nominalAtual = base * (1 + ipca) * (1 + r.maximoAtual);
      var nominalNovo = base * (1 + ipca) * (1 + r.maximoNovo);
      var dif = nominalAtual - nominalNovo;

      estados["sim-teto"] = { nominalAtual: nominalAtual, nominalNovo: nominalNovo, dif: dif, aplicavel: aplicavel };

      mostrarResultado(s.resultados, [
        { rotulo: "Limite com crescimento real de " + fmtPct(r.maximoAtual), valor: fmtBi(nominalAtual), classe: "ok" },
        { rotulo: "Limite com crescimento real de " + fmtPct(r.maximoNovo), valor: fmtBi(nominalNovo), classe: aplicavel ? "atencao" : "neutro" },
        { rotulo: "Diferença de espaço", valor: fmtBi2(dif), classe: "grande" }
      ]);
      mostrarBarras(s.barras, [
        { rotulo: "Regra atual (" + fmtPct(r.maximoAtual) + " real)", valor: fmtBi(nominalAtual), largura: nominalAtual, classe: "ok" },
        { rotulo: "Texto aprovado (" + fmtPct(r.maximoNovo) + " real)", valor: fmtBi(nominalNovo), largura: nominalNovo, classe: "atencao" }
      ]);
      if (aplicavel) {
        s.interpretacao.textContent =
          "Com um limite de " + fmtBi(base) + " e inflação de " + fmtPct(ipca) + ", crescer " + fmtPct(r.maximoAtual) +
          " acima da inflação daria um limite de " + fmtBi(nominalAtual) + "; crescer " + fmtPct(r.maximoNovo) +
          " dá " + fmtBi(nominalNovo) + ". A diferença é " + fmtBi2(dif) + " de espaço a menos para expandir. " +
          "Repare: em ambos os cenários o orçamento cresce acima da inflação. Diminuir o limite de crescimento não é reduzir o orçamento.";
      } else {
        s.interpretacao.textContent =
          "Você desativou as condições de contenção. Nesse caso, o teto reduzido de " + fmtPct(r.maximoNovo) +
          " não se aplica ao ano simulado: o limite segue a regra atual, de até " + fmtPct(r.maximoAtual) +
          " de crescimento real (" + fmtBi(nominalAtual) + " no seu cenário). O 2% só vale nos anos em que as condições legais forem acionadas.";
      }
      atualizarComparador();
    }
    s.btnReset.addEventListener("click", function () {
      cBase.set(2392.6, true);
      cIpca.set(4, true);
      check.checked = true;
      calcular();
    });
    calcular();
  }

  /* ---------- SIMULADOR 3: meta fiscal e bloqueio ---------- */
  function simMeta() {
    var r = M.regras.meta;
    var s = criarSim({
      id: "sim-meta",
      numero: "3",
      pergunta: "Quando o governo pode bloquear o orçamento?",
      explica: "A meta de 2027 é superávit primário de " + fmtPct(r.centro) + " do PIB, com tolerância entre " +
        fmtPct(r.piso, 2) + " e " + fmtPct(r.teto, 2) + ": dentro dessa faixa, a meta é considerada cumprida. " +
        "A novidade do texto aprovado é permitir bloqueio preventivo mesmo quando a projeção já está dentro da faixa, " +
        "mas abaixo do centro. Mova o resultado projetado e veja o que a regra autoriza.",
      fonte: "PLDO 2027 (meta de R$ 73,2 bi) e nota Conorf/Senado, itens 3.2.1 e 3.2.2 (pág. 6-7)",
      contaTexto: "espaço de ajuste (em R$) = PIB × (referência − resultado projetado), para a referência escolhida " +
        "(piso do intervalo ou centro da meta). O bloqueio real depende de regras de execução, da lista de despesas " +
        "legalmente bloqueáveis e de avaliações fiscais a cada dois meses (RARDP).",
      aviso: "Contingenciamentos reais dependem de regras de execução, das despesas legalmente bloqueáveis e de decisões administrativas. Este exercício mostra o espaço de ajuste, não um bloqueio obrigatório."
    });

    var cPib = controle(s.controles, {
      rotulo: "PIB do ano", min: 5000, max: 30000, step: 100,
      valor: 14644, sufixo: "bi", aoMudar: function () { calcular(); }
    });
    var cResultado = controle(s.controles, {
      rotulo: "Resultado primário projetado", min: -1, max: 1, step: 0.05,
      valor: 0.35, sufixo: "% do PIB", aoMudar: function () { calcular(); }
    });
    var cCentro = controle(s.controles, {
      rotulo: "Centro da meta", min: 0.3, max: 1.5, step: 0.05,
      valor: 0.5, sufixo: "% do PIB", aoMudar: function () { calcular(); }
    });
    var cPiso = controle(s.controles, {
      rotulo: "Piso do intervalo de tolerância", min: 0.05, max: 0.5, step: 0.05,
      valor: 0.25, sufixo: "% do PIB", aoMudar: function () { calcular(); }
    });

    var faixa = document.createElement("div");
    faixa.className = "faixa-meta";
    faixa.setAttribute("role", "img");
    s.artigo.insertBefore(faixa, s.interpretacao);

    function desenharFaixa(resultado, piso, centro, teto) {
      var minEscala = -1.0, maxEscala = 1.75; // em pontos percentuais do PIB
      var pos = function (pp) {
        return clamp(((pp - minEscala) / (maxEscala - minEscala)) * 100, 0, 100);
      };
      faixa.replaceChildren();
      var faixaTolerancia = document.createElement("div");
      faixaTolerancia.className = "faixa-tolerancia";
      faixaTolerancia.style.left = pos(piso * 100) + "%";
      faixaTolerancia.style.width = (pos(teto * 100) - pos(piso * 100)) + "%";
      var marcaCentro = document.createElement("div");
      marcaCentro.className = "faixa-centro";
      marcaCentro.style.left = pos(centro * 100) + "%";
      var marcaResultado = document.createElement("div");
      marcaResultado.className = "faixa-resultado";
      marcaResultado.style.left = pos(resultado * 100) + "%";
      [faixaTolerancia, marcaCentro, marcaResultado].forEach(function (m) { faixa.appendChild(m); });
      var legenda = document.createElement("div");
      legenda.className = "faixa-legenda";
      legenda.textContent = "piso " + fmtPct(piso, 2) + " · centro " + fmtPct(centro) +
        " · projetado " + fmtPct(resultado, 2) + " do PIB";
      faixa.appendChild(legenda);
      faixa.setAttribute("aria-label",
        "Intervalo de tolerância entre " + fmtPct(piso, 2) + " e " + fmtPct(teto, 2) +
        " do PIB, centro em " + fmtPct(centro) + ", resultado projetado em " + fmtPct(resultado, 2) + " do PIB");
    }

    function calcular() {
      var pib = cPib.get();
      var resultado = cResultado.get() / 100;
      var centro = cCentro.get() / 100;
      var piso = clamp(cPiso.get() / 100, 0.0005, centro - 0.0005);
      var teto = 2 * centro - piso;

      var resultadoReais = pib * resultado;
      var gapPiso = pib * Math.max(0, piso - resultado);
      var gapCentro = pib * Math.max(0, centro - resultado);

      estados["sim-meta"] = { resultado: resultado, centro: centro, piso: piso, gapCentro: gapCentro, pib: pib };

      mostrarResultado(s.resultados, [
        { rotulo: "Resultado projetado", valor: fmtBi(resultadoReais) + " (" + fmtPct(resultado, 2) + " do PIB)" },
        { rotulo: "Piso do intervalo", valor: fmtBi(pib * piso) },
        { rotulo: "Centro da meta", valor: fmtBi(pib * centro) }
      ]);
      desenharFaixa(resultado, piso, centro, teto);

      if (resultado < piso) {
        s.interpretacao.textContent =
          "Com uma projeção de " + fmtBi(resultadoReais) + " (" + fmtPct(resultado, 2) + " do PIB), você está abaixo do piso de " +
          fmtPct(piso, 2) + ": a meta corre risco e a LRF obriga bloqueio. Para voltar ao piso seriam necessários " +
          fmtBi2(gapPiso) + " de esforço. É contingenciamento obrigatório, que recai sobre despesas discricionárias.";
      } else if (resultado < centro) {
        s.interpretacao.textContent =
          "Com uma projeção de " + fmtBi(resultadoReais) + " (" + fmtPct(resultado, 2) + " do PIB), você está dentro da faixa, " +
          "mas abaixo do centro de " + fmtPct(centro) + ". Hoje não haveria base legal para bloquear. Com o texto aprovado " +
          "(art. 6º-C), o governo fica autorizado, não obrigado, a bloquear até " + fmtBi2(gapCentro) +
          " para se aproximar do centro da meta, desde que o resultado permaneça dentro do intervalo.";
      } else {
        s.interpretacao.textContent =
          "Com uma projeção de " + fmtBi(resultadoReais) + " (" + fmtPct(resultado, 2) + " do PIB), você está no centro da meta " +
          "ou acima (" + fmtPct(centro) + "). Não há necessidade de bloqueio: a meta está garantida na projeção.";
      }
      atualizarComparador();
    }
    s.btnReset.addEventListener("click", function () {
      cPib.set(14644, true);
      cResultado.set(0.35, true);
      cCentro.set(0.5, true);
      cPiso.set(0.25, true);
      calcular();
    });
    calcular();
  }

  /* ---------- SIMULADOR 4: benefícios tributários ---------- */
  function simBeneficios() {
    var r = M.regras.beneficios;
    var s = criarSim({
      id: "sim-beneficios",
      numero: "4",
      pergunta: "Quanto muda o corte nos benefícios tributários?",
      explica: "A LC 224/2025 já cortava linearmente " + fmtPct(r.corteAtual, 0) +
        " dos benefícios tributários federais. O texto aprovado dobra o corte para " + fmtPct(r.corteNovo, 0) +
        ", com exceções (CPRB, TI e semicondutores, veículos para PcD e TEA, Zona Franca, cesta básica, Simples...). " +
        "Escolha o valor da base de benefícios sujeita ao corte.",
      fonte: "LC 224/2025 e nota Conorf/Senado, item 3.3.2 e Quadro 7 (pág. 12-13)",
      contaTexto: "corte de 10% = base × 0,10.  corte de 20% = base × 0,20.  diferença = base × 0,10. " +
        "O corte incide só sobre a base elegível, não sobre toda a renúncia tributária federal. Renúncia reduzida " +
        "não é o mesmo que arrecadação garantida: depende da reação dos contribuintes e pode ser judicializada.",
      aviso: "Benefício fiscal não é despesa orçamentária: cortar renúncia não equivale a cortar saúde ou educação, e a economia real pode diferir do valor nominal."
    });

    var cBase = controle(s.controles, {
      rotulo: "Base de benefícios sujeita ao corte", min: 10, max: 500, step: 10,
      valor: 150, sufixo: "bi", aoMudar: function () { calcular(); }
    });

    function calcular() {
      var base = cBase.get();
      var corte10 = base * r.corteAtual;
      var corte20 = base * r.corteNovo;
      var dif = corte20 - corte10;

      estados["sim-beneficios"] = { corte10: corte10, corte20: corte20, dif: dif };

      mostrarResultado(s.resultados, [
        { rotulo: "Corte na regra atual (" + fmtPct(r.corteAtual, 0) + ")", valor: fmtBi(corte10), classe: "ok" },
        { rotulo: "Corte no texto aprovado (" + fmtPct(r.corteNovo, 0) + ")", valor: fmtBi(corte20), classe: "atencao" },
        { rotulo: "Diferença", valor: fmtBi2(dif), classe: "grande" }
      ]);
      mostrarBarras(s.barras, [
        { rotulo: "Regra atual", valor: fmtBi(corte10), largura: corte10, classe: "ok" },
        { rotulo: "Texto aprovado", valor: fmtBi(corte20), largura: corte20, classe: "atencao" }
      ]);
      s.interpretacao.textContent =
        "Com uma base de " + fmtBi(base) + " sujeita ao corte, a regra atual retira " + fmtBi(corte10) +
        " de renúncia e o texto aprovado retira " + fmtBi(corte20) + ": " + fmtBi2(dif) +
        " a mais de benefício cortado. Isso é renúncia que deixa de ser concedida, não necessariamente arrecadação garantida. " +
        "No parecer do relator, a redução adicional foi estimada em R$ 15 bilhões para 2027.";
      atualizarComparador();
    }
    s.btnReset.addEventListener("click", function () {
      cBase.set(150, true);
      calcular();
    });
    calcular();
  }

  /* ---------- SIMULADOR 5: comparador entre cenários ---------- */
  function simComparador() {
    var s = criarSim({
      id: "sim-comparador",
      numero: "5",
      pergunta: "Regra atual x texto aprovado, lado a lado",
      explica: "Aqui reunimos, com os valores que você escolheu nos simuladores acima, o antes e o depois de cada " +
        "indicador. Cada medida é de uma natureza diferente: não somamos nada, porque elas interagem entre si e " +
        "somá-las seria enganoso.",
      fonte: "Regras dos simuladores 1 a 4, com os valores escolhidos por você",
      contaTexto: "O comparador apenas exibe, indicador a indicador, os dois cenários já calculados. " +
        "Não existe um total: reduzir o piso da saúde, apertar o teto de crescimento e cortar benefícios fiscais " +
        "são medidas independentes, que podem se sobrepor no mesmo ano."
    });
    s.bloco = s.barras; // reutiliza o container de barras para as linhas do comparador
    estados.__comparadorArtigo = s;
  }

  function atualizarComparador() {
    var s = estados.__comparadorArtigo;
    if (!s) return;
    var e1 = estados["sim-piso-saude"] || {};
    var e2 = estados["sim-teto"] || {};
    var e3 = estados["sim-meta"] || {};
    var e4 = estados["sim-beneficios"] || {};

    var linhas = [];
    if (e1.sem !== undefined) {
      linhas.push({ rotulo: "Piso da saúde", a: { v: e1.sem, t: fmtBi(e1.sem) }, b: { v: e1.com, t: fmtBi(e1.com) }, nota: "obrigação mínima" });
    }
    if (e2.nominalAtual !== undefined) {
      linhas.push({ rotulo: "Limite de despesas", a: { v: e2.nominalAtual, t: fmtBi(e2.nominalAtual) }, b: { v: e2.nominalNovo, t: fmtBi(e2.nominalNovo) }, nota: e2.aplicavel ? "teto aplicável" : "teto de 2% não aplicável" });
    }
    if (e3.gapCentro !== undefined) {
      linhas.push({ rotulo: "Bloqueio facultativo até o centro", a: { v: 0, t: "não autorizado hoje" }, b: { v: e3.gapCentro, t: fmtBi2(e3.gapCentro) }, nota: "art. 6º-C, se dentro da faixa" });
    }
    if (e4.corte10 !== undefined) {
      linhas.push({ rotulo: "Benefícios tributários cortados", a: { v: e4.corte10, t: fmtBi(e4.corte10) }, b: { v: e4.corte20, t: fmtBi(e4.corte20) }, nota: "renúncia retirada da base" });
    }

    s.barras.replaceChildren();
    linhas.forEach(function (l) {
      var bloco = document.createElement("div");
      bloco.className = "comp-linha";
      var titulo = document.createElement("h4");
      titulo.textContent = l.rotulo + " (" + l.nota + ")";
      bloco.appendChild(titulo);
      var maximo = Math.max(l.a.v, l.b.v, 0.0001);
      [["Regra atual", l.a, "ok"], ["Texto aprovado", l.b, "atencao"]].forEach(function (par) {
        var linha = document.createElement("div");
        linha.className = "barra-linha";
        var rot = document.createElement("span");
        rot.className = "barra-rotulo";
        rot.textContent = par[0];
        var trilho = document.createElement("div");
        trilho.className = "barra-trilho";
        trilho.setAttribute("role", "img");
        trilho.setAttribute("aria-label", l.rotulo + ", " + par[0] + ": " + par[1].t);
        var fill = document.createElement("div");
        fill.className = "barra-fill " + par[2];
        fill.style.width = (par[1].v / maximo) * 100 + "%";
        trilho.appendChild(fill);
        var val = document.createElement("span");
        val.className = "barra-valor";
        val.textContent = par[1].t;
        linha.appendChild(rot);
        linha.appendChild(trilho);
        linha.appendChild(val);
        bloco.appendChild(linha);
      });
      s.barras.appendChild(bloco);
    });
    var avisoTotal = document.createElement("p");
    avisoTotal.className = "sim-aviso";
    avisoTotal.textContent =
      "Não existe um total a somar aqui: as medidas têm naturezas diferentes e podem interagir no mesmo ano. " +
      "O parecer do relator estima o efeito conjunto sobre o resultado primário de 2027 entre R$ 45,1 e R$ 56,1 bilhões.";
    s.barras.appendChild(avisoTotal);
  }

  /* ---------- transparência ---------- */
  function renderTransparencia() {
    el("sim-versao").textContent = M.versao;
    var data = new Date(M.dataRevisao + "T12:00:00").toLocaleDateString("pt-BR");
    el("sim-revisao").textContent = data;
    var linkTexto = el("sim-link-texto");
    linkTexto.href = M.fontes.tramitacao.url;
    linkTexto.textContent = M.fontes.tramitacao.nome;
    var aviso = el("sim-aviso-desatualizado");
    if (aviso) aviso.hidden = !M.desatualizado;
  }

  /* ---------- início ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    renderCards();
    simPisoSaude();
    simTeto();
    simMeta();
    simBeneficios();
    simComparador();
    atualizarComparador();
    renderTransparencia();
  });
})();
