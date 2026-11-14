/* ============ NÃO AO AJUSTE FISCAL: lógica do site ============ */
(function () {
  "use strict";

  /* ---------- Críticas do povo (editáveis no arquivo app.js) ---------- */
  var CRITICAS = [
    {
      id: "pisos",
      titulo: "Pisos de saúde e educação não são negociáveis",
      assunto: "Não ao PLP 299/2026: preserve os pisos da saúde e da educação",
      texto:
        "Excelência,\n\n" +
        "Venho, como eleitor(a), manifestar minha oposição à mudança no cálculo dos pisos " +
        "constitucionais de saúde e educação prevista no PLP 299/2026. Enquanto filas nos " +
        "hospitais e escolas sem estrutura seguem na rotina do povo brasileiro, o Congresso " +
        "discute reduzir o mínimo obrigatório investido nessas áreas.\n\n" +
        "Saúde e educação são direitos constitucionais e não podem ser tratadas como variáveis " +
        "de ajuste. Exijo que Vossa Excelência vote contra qualquer dispositivo que reduza ou " +
        "flexibilize os pisos da saúde e da educação.\n\n" +
        "Estarei acompanhando seu voto.\n\n" +
        "Atenciosamente,\n[seu nome], [cidade/UF]"
    },
    {
      id: "conta",
      titulo: "Quem paga a conta do ajuste?",
      assunto: "PLP 299/2026: o ajuste não pode recair sobre quem menos pode",
      texto:
        "Excelência,\n\n" +
        "O pacote de ajuste fiscal em tramitação (PLP 299/2026) propõe bloqueios de gastos e " +
        "cortes que atingem serviços públicos essenciais, enquanto a tributação de lucros e " +
        "dividendos e de salários altíssimos segue sendo tratada como se fosse opcional.\n\n" +
        "Não é justo que trabalhadores, estudantes, professores e quem depende do SUS paguem " +
        "a conta de um ajuste que poupa as maiores rendas do país. Exijo que Vossa Excelência " +
        "defenda que quem mais ganha contribua primeiro, antes de qualquer corte que afete o povo.\n\n" +
        "Vote contra o pacote na forma atual.\n\n" +
        "Atenciosamente,\n[seu nome], [cidade/UF]"
    },
    {
      id: "bloqueios",
      titulo: "Direitos não podem ser contingenciados",
      assunto: "Não ao PLP 299/2026: direitos não podem ser contingenciados",
      texto:
        "Excelência,\n\n" +
        "A redução do limite de crescimento das despesas e a ampliação do poder de bloqueio de " +
        "gastos obrigatórios previstas no PLP 299/2026 significam, na prática, menos vagas em " +
        "escolas e hospitais, menos medicamentos, menos investimento público e menos atendimento " +
        "a quem mais precisa.\n\n" +
        "Contingenciar direitos não é ajuste: é retrocesso. Exijo que Vossa Excelência rejeite a " +
        "ampliação dos bloqueios e qualquer medida que esvazie serviços públicos essenciais.\n\n" +
        "Atenciosamente,\n[seu nome], [cidade/UF]"
    },
    {
      id: "transparencia",
      titulo: "Cobro posição pública e transparência",
      assunto: "Exijo posicionamento público sobre o PLP 299/2026",
      texto:
        "Excelência,\n\n" +
        "Como seu eleitor(a), exijo um posicionamento público e claro sobre o PLP 299/2026, o " +
        "chamado ajuste fiscal: como Vossa Excelência votará o texto e os destaques, especialmente " +
        "os que tratam dos pisos de saúde e educação e da tributação de altas rendas?\n\n" +
        "O povo tem o direito de saber, antes da votação, quem representa seus interesses. Meu " +
        "acompanhamento e meu voto nas próximas eleições refletirão sua resposta e sua atuação.\n\n" +
        "Responda a este e-mail e assuma publicamente sua posição.\n\n" +
        "Atenciosamente,\n[seu nome], [cidade/UF]"
    },
    {
      id: "indignacao",
      titulo: "Indignação: não em meu nome",
      assunto: "Rejeito o ajuste fiscal: não em meu nome",
      texto:
        "Excelência,\n\n" +
        "Manifesto minha indignação com o PLP 299/2026. Um pacote que flexibiliza os pisos de " +
        "saúde e educação, amplia bloqueios de gastos essenciais e ainda reluta em tributar de " +
        "fato lucros, dividendos e salários altíssimos não representa o povo que elegeu seus " +
        "representantes.\n\n" +
        "O Brasil precisa de justiça fiscal, não de ajuste sobre os mais pobres. Rejeito esse " +
        "pacote em nome da minha família e da minha comunidade, e cobro coragem de Vossa " +
        "Excelência para votar com o povo.\n\n" +
        "Atenciosamente,\n[seu nome], [cidade/UF]"
    }
  ];

  var LIMITE_URL = 1800; // tamanho seguro de URL para Gmail/mailto
  var LIMITE_PARA = 5;   // até este nº de destinatários vão no campo "Para" (acima: Cco)

  /* ---------- estado ---------- */
  var todos = (window.DADOS.senado || []).concat(window.DADOS.camara || []);
  var selecionados = {};      // id -> true
  var criticaAtiva = CRITICAS[0];
  var filtroCasa = "todos";

  var el = function (id) { return document.getElementById(id); };

  var normalizar = function (s) {
    return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  var iniciais = function (nome) {
    var partes = nome.trim().split(/\s+/);
    return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
  };

  /* ---------- persistência local ---------- */
  var CHAVE = "nao-ajuste-fiscal-selecao";
  try {
    var salvo = JSON.parse(localStorage.getItem(CHAVE) || "[]");
    salvo.forEach(function (id) { selecionados[id] = true; });
  } catch (e) { /* sem localStorage */ }

  var salvar = function () {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(Object.keys(selecionados)));
    } catch (e) { /* sem localStorage */ }
  };

  /* ---------- toast ---------- */
  var timerToast = null;
  function toast(msg, atencao) {
    var t = el("toast");
    t.textContent = msg;
    t.className = "toast visivel" + (atencao ? " atencao" : "");
    clearTimeout(timerToast);
    timerToast = setTimeout(function () { t.className = "toast"; }, 5000);
  }

  /* ---------- copiar ---------- */
  function copiar(texto, avisoOk) {
    var concluido = function () { if (avisoOk) toast(avisoOk); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(concluido, function () { copiarFallback(texto, concluido); });
    } else {
      copiarFallback(texto, concluido);
    }
  }
  function copiarFallback(texto, concluido) {
    var ta = document.createElement("textarea");
    ta.value = texto;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); concluido(); }
    catch (e) { toast("Não consegui copiar automaticamente. Selecione e copie manualmente.", true); }
    document.body.removeChild(ta);
  }

  /* ---------- críticas ---------- */
  function renderCriticas() {
    var container = el("lista-criticas");
    container.replaceChildren();
    CRITICAS.forEach(function (c) {
      var artigo = document.createElement("article");
      artigo.className = "critica" + (c === criticaAtiva ? " selecionada" : "");
      artigo.dataset.id = c.id;

      var h3 = document.createElement("h3");
      h3.textContent = c.titulo;

      var p = document.createElement("p");
      p.textContent = c.texto;

      var rodape = document.createElement("div");
      rodape.className = "critica-rodape";

      var btnSel = document.createElement("button");
      btnSel.className = "btn " + (c === criticaAtiva ? "btn-vermelho" : "btn-contorno");
      btnSel.textContent = c === criticaAtiva ? "✓ Selecionada" : "Selecionar esta crítica";
      btnSel.addEventListener("click", function () {
        criticaAtiva = c;
        aplicarCritica(c);
        renderCriticas();
        toast('Crítica selecionada: "' + c.titulo + '". Revise a mensagem no passo 1.');
      });

      var btnCop = document.createElement("button");
      btnCop.className = "btn btn-mini";
      btnCop.textContent = "📋 Copiar texto";
      btnCop.addEventListener("click", function () {
        copiar(c.assunto + "\n\n" + c.texto, "Texto e assunto copiados!");
      });

      rodape.appendChild(btnSel);
      rodape.appendChild(btnCop);
      artigo.appendChild(h3);
      artigo.appendChild(p);
      artigo.appendChild(rodape);
      container.appendChild(artigo);
    });
  }

  function aplicarCritica(c) {
    el("assunto").value = c.assunto;
    el("mensagem").value = c.texto;
  }

  /* ---------- lista de parlamentares ---------- */
  function ufSelectPreencher() {
    var ufs = [];
    todos.forEach(function (p) { if (p.uf && ufs.indexOf(p.uf) === -1) ufs.push(p.uf); });
    ufs.sort();
    var sel = el("uf");
    ufs.forEach(function (uf) {
      var opt = document.createElement("option");
      opt.value = uf;
      opt.textContent = uf;
      sel.appendChild(opt);
    });
  }

  function filtrados() {
    var termo = normalizar(el("busca").value.trim());
    var uf = el("uf").value;
    return todos.filter(function (p) {
      if (filtroCasa !== "todos" && p.casa !== filtroCasa) return false;
      if (uf && p.uf !== uf) return false;
      if (termo) {
        var alvo = normalizar(p.nome + " " + p.partido + " " + p.uf);
        if (alvo.indexOf(termo) === -1) return false;
      }
      return true;
    });
  }

  function renderLista() {
    var lista = el("lista-parlamentares");
    lista.innerHTML = "";
    var frag = document.createDocumentFragment();
    filtrados().forEach(function (p) {
      var li = document.createElement("li");

      var label = document.createElement("label");
      label.className = "parlamentar" + (selecionados[p.id] ? " marcado" : "");

      var check = document.createElement("input");
      check.type = "checkbox";
      check.checked = !!selecionados[p.id];
      check.setAttribute("aria-label", "Selecionar " + p.nome);

      var avatar = document.createElement("span");
      avatar.className = "avatar";
      avatar.textContent = iniciais(p.nome);
      if (p.foto) {
        var img = document.createElement("img");
        img.src = p.foto;
        img.alt = "";
        img.loading = "lazy";
        img.addEventListener("error", function () { img.remove(); });
        avatar.appendChild(img);
      }

      var info = document.createElement("span");
      info.className = "parlamentar-info";
      var nome = document.createElement("div");
      nome.className = "parlamentar-nome";
      nome.textContent = p.nome;
      var meta = document.createElement("div");
      meta.className = "parlamentar-meta";
      meta.textContent = p.partido + " · " + p.uf + " · " + p.email;
      info.appendChild(nome);
      info.appendChild(meta);

      var tag = document.createElement("span");
      tag.className = "tag-casa " + (p.casa === "senado" ? "tag-senado" : "tag-camara");
      tag.textContent = p.casa === "senado" ? "Senado" : "Câmara";

      label.appendChild(check);
      label.appendChild(avatar);
      label.appendChild(info);
      label.appendChild(tag);
      li.appendChild(label);
      frag.appendChild(li);

      var alternar = function () {
        if (selecionados[p.id]) delete selecionados[p.id];
        else selecionados[p.id] = true;
        salvar();
        check.checked = !!selecionados[p.id];
        label.classList.toggle("marcado", !!selecionados[p.id]);
        atualizarContador();
      };
      check.addEventListener("change", alternar);
    });
    lista.appendChild(frag);
  }

  function selecionarVarios(lista) {
    lista.forEach(function (p) { selecionados[p.id] = true; });
    salvar();
    renderLista();
    atualizarContador();
  }

  function atualizarContador() {
    var n = Object.keys(selecionados).length;
    el("contador").textContent = n === 1 ? "1 selecionado" : n + " selecionados";
    el("aviso-limite").hidden = n <= 20;
  }

  /* ---------- e-mail ---------- */
  function destinatariosSelecionados() {
    return todos.filter(function (p) { return !!selecionados[p.id]; });
  }

  function urlGmail(para, cco, assunto, corpo) {
    var u = "https://mail.google.com/mail/?view=cm&fs=1";
    if (para.length) u += "&to=" + encodeURIComponent(para.join(","));
    if (cco.length) u += "&bcc=" + encodeURIComponent(cco.join(","));
    u += "&su=" + encodeURIComponent(assunto);
    u += "&body=" + encodeURIComponent(corpo);
    return u;
  }

  function urlMailto(para, cco, assunto, corpo) {
    var u = "mailto:" + (para.length ? encodeURIComponent(para.join(",")) : "");
    if (cco.length) u += "?bcc=" + encodeURIComponent(cco.join(","));
    else u += "?";
    u += "subject=" + encodeURIComponent(assunto);
    u += "&body=" + encodeURIComponent(corpo);
    return u;
  }

  function abrir(tipo) {
    var alvo = destinatariosSelecionados();
    if (!alvo.length) {
      toast("Selecione pelo menos um parlamentar no passo 2.", true);
      el("lista-parlamentares").scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    var assunto = el("assunto").value.trim() || criticaAtiva.assunto;
    var corpo = el("mensagem").value.trim() || criticaAtiva.texto;
    var emails = alvo.map(function (p) { return p.email; });
    var para = emails.length <= LIMITE_PARA ? emails : [];
    var cco = emails.length > LIMITE_PARA ? emails : [];

    var url = tipo === "gmail" ? urlGmail(para, cco, assunto, corpo) : urlMailto(para, cco, assunto, corpo);

    if (url.length > LIMITE_URL) {
      // URL longa demais: destinatários ficariam de fora. Copia a lista (sem aviso
      // próprio, para não competir com a instrução abaixo) e abre sem destinatários.
      copiar(emails.join(", "), null);
      var urlVazia = tipo === "gmail"
        ? urlGmail([], [], assunto, corpo)
        : urlMailto([], [], assunto, corpo);
      window.open(urlVazia, "_blank");
      toast("São muitos destinatários para o link. Cole a lista copiada no campo Cco do e-mail que abriu.", true);
      return;
    }

    if (tipo === "gmail") {
      window.open(url, "_blank");
      toast(emails.length > LIMITE_PARA
        ? "Abrindo o Gmail… Destinatários incluídos em Cco (cópia oculta)."
        : "Abrindo o Gmail… Revise e envie!");
    } else {
      window.location.href = url;
      toast("Abrindo seu app de e-mail… Revise e envie!");
    }
  }

  /* ---------- eventos ---------- */
  function ligarEventos() {
    // chips de casa
    document.querySelectorAll(".chip[data-casa]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        document.querySelectorAll(".chip[data-casa]").forEach(function (c) { c.classList.remove("ativo"); });
        chip.classList.add("ativo");
        filtroCasa = chip.dataset.casa;
        renderLista();
      });
    });

    el("busca").addEventListener("input", renderLista);
    el("uf").addEventListener("change", renderLista);

    el("sel-senado").addEventListener("click", function () {
      selecionarVarios(todos.filter(function (p) { return p.casa === "senado"; }));
      toast("Todos os senadores selecionados (81).");
    });
    el("sel-camara").addEventListener("click", function () {
      selecionarVarios(todos.filter(function (p) { return p.casa === "camara"; }));
      toast("Todos os deputados selecionados (513).");
    });
    el("sel-uf").addEventListener("click", function () {
      var uf = el("uf").value;
      if (!uf) {
        toast("Escolha uma UF no filtro acima para selecionar seu estado.", true);
        return;
      }
      var doEstado = todos.filter(function (p) { return p.uf === uf; });
      selecionarVarios(doEstado);
      toast(doEstado.length + " parlamentares de " + uf + " selecionados.");
    });
    el("limpar").addEventListener("click", function () {
      selecionados = {};
      salvar();
      renderLista();
      atualizarContador();
      toast("Seleção limpa.");
    });

    el("btn-gmail").addEventListener("click", function () { abrir("gmail"); });
    el("btn-mailto").addEventListener("click", function () { abrir("mailto"); });
    el("btn-copiar-emails").addEventListener("click", function () {
      var alvo = destinatariosSelecionados();
      if (!alvo.length) {
        toast("Selecione pelo menos um parlamentar no passo 2.", true);
        return;
      }
      copiar(alvo.map(function (p) { return p.email; }).join(", "), alvo.length + " e-mails copiados!");
    });
  }

  /* ---------- início ---------- */
    document.addEventListener("DOMContentLoaded", function () {
      el("data-geracao").textContent = window.DADOS.geradoEm
        ? new Date(window.DADOS.geradoEm + "T12:00:00").toLocaleDateString("pt-BR")
        : "data não disponível";
      el("sel-senado").textContent = "Selecionar todo o Senado (" +
        (window.DADOS.senado || []).length + ")";
      el("sel-camara").textContent = "Selecionar toda a Câmara (" +
        (window.DADOS.camara || []).length + ")";
      ufSelectPreencher();
    aplicarCritica(criticaAtiva);
    renderCriticas();
    renderLista();
    atualizarContador();
    ligarEventos();
  });
})();
