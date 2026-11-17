/* ============ NÃO AO AJUSTE FISCAL: lógica do site ============ */
(function () {
  "use strict";

  /* ---------- Críticas do povo (editáveis no arquivo app.js) ---------- */
  var CRITICAS = [
    {
      id: "pisos",
      titulo: "Piso da saúde e orçamento da educação não são negociáveis",
      assunto: "Não ao PLP 299/2026: preserve o piso da saúde e o orçamento da educação",
      texto:
        "Excelência,\n\n" +
        "Venho, como eleitor(a), manifestar minha oposição às medidas do PLP 299/2026 que excluem " +
        "receitas de petróleo da base de cálculo do piso da saúde, reduzindo a obrigação mínima " +
        "da União com o SUS em R$ 6,8 bilhões no Orçamento de 2027, e que facilitam contingenciamentos " +
        "que recaem sobre universidades, bolsas e serviços públicos de educação.\n\n" +
        "Saúde e educação são direitos constitucionais e não podem ser tratados como variáveis de " +
        "ajuste. Exijo que Vossa Excelência vote contra qualquer dispositivo que reduza o piso da " +
        "saúde ou aperte o orçamento da educação.\n\n" +
        "Estarei acompanhando seu voto.\n\n" +
        "Atenciosamente,\n[seu nome], [cidade/UF]"
    },
    {
      id: "conta",
      titulo: "Quem paga a conta do ajuste?",
      assunto: "PLP 299/2026: o ajuste não pode recair sobre quem menos pode",
      texto:
        "Excelência,\n\n" +
        "O pacote de ajuste fiscal em tramitação (PLP 299/2026) amplia bloqueios de orçamento e " +
        "restringe compensações que atingem serviços e políticas públicas, enquanto corta " +
        "benefícios tributários e não toca nos rendimentos mais altos do país.\n\n" +
        "Não é justo que trabalhadores, estudantes, professores e quem depende do SUS paguem " +
        "a conta de um ajuste que poupa as maiores rendas. Exijo que Vossa Excelência defenda " +
        "que quem mais ganha contribua primeiro, antes de qualquer medida que aperte o povo.\n\n" +
        "Vote contra o pacote na forma atual.\n\n" +
        "Atenciosamente,\n[seu nome], [cidade/UF]"
    },
    {
      id: "bloqueios",
      titulo: "Direitos e serviços não podem ser contingenciados",
      assunto: "Não ao PLP 299/2026: serviços essenciais não podem ser bloqueados",
      texto:
        "Excelência,\n\n" +
        "A redução do teto de crescimento das despesas e o novo contingenciamento preventivo " +
        "previstos no PLP 299/2026 significam, na prática, menos investimento público: quem " +
        "sofre o bloqueio são as despesas discricionárias, como obras, custeio, universidades, " +
        "bolsas e atendimento a quem mais precisa.\n\n" +
        "Contingenciar serviços essenciais não é ajuste: é retrocesso. Exijo que Vossa Excelência " +
        "rejeite a ampliação dos bloqueios e qualquer medida que esvazie serviços públicos.\n\n" +
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
        "os que tratam do piso da saúde, dos bloqueios de orçamento e da compensação tributária?\n\n" +
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
        "Manifesto minha indignação com o PLP 299/2026. Um pacote que reduz a base do piso da " +
        "saúde, facilita o bloqueio de orçamento essencial e concentra o esforço em cortar " +
        "benefícios e compensações, sem tocar nos rendimentos mais altos do país, não representa " +
        "o povo que elegeu seus representantes.\n\n" +
        "O Brasil precisa de justiça fiscal, não de ajuste sobre os mais pobres. Rejeito esse " +
        "pacote em nome da minha família e da minha comunidade, e cobro coragem de Vossa " +
        "Excelência para votar com o povo.\n\n" +
        "Atenciosamente,\n[seu nome], [cidade/UF]"
    },
    {
      id: "supersalarios",
      titulo: "O ajuste tem que começar por cima: supersalários",
      assunto: "PLP 299/2026: corte os supersalários antes de cortar saúde e educação",
      texto:
        "Excelência,\n\n" +
        "O texto aprovado do PLP 299/2026 apenas dá 120 dias para o Congresso apreciar projeto " +
        "de lei sobre verbas indenizatórias: os chamados supersalários, pagamentos que somam " +
        "mais que o teto constitucional e foram apontados como gasto irregular em auditorias. " +
        "A medida não corta nada por si só; deixa o problema para depois.\n\n" +
        "Não é justo cobrar sacrifício de quem depende do SUS e da escola pública enquanto os " +
        "penduricalhos dos próprios Poderes seguem intocados. Exijo que Vossa Excelência " +
        "regulamente já as verbas indenizatórias, sem esperar o prazo vencer, e vote contra " +
        "qualquer medida que aperte saúde e educação antes de cortar os gastos irregulares " +
        "de cima.\n\n" +
        "Estarei acompanhando seu voto.\n\n" +
        "Atenciosamente,\n[seu nome], [cidade/UF]"
    }
  ];

  var LIMITE_URL = 1800; // tamanho seguro de URL para Gmail/mailto
  var LIMITE_PARA = 5;   // até este nº de destinatários vão no campo "Para" (acima: Cco)
  // Teto de destinatários por mensagem. O Gmail aceita ~500 endereços por e-mail, mas
  // enviar de uma vez para centenas de pessoas, de conta pessoal, chama atenção dos
  // filtros anti-spam: a prática recomendada é ~50 destinatários (em Cco) por mensagem,
  // espaçando os envios. Acima do teto, o site bloqueia e sugere enviar em lotes.
  var LIMITE_MAX = 50;

  /* ---------- estado ---------- */
  var todos = (window.DADOS.senado || []).concat(window.DADOS.camara || []);
  var selecionados = {};      // id -> true
  var criticaAtiva = CRITICAS[0];
  var filtroCasa = "todos";
  var ufsAtivas = [];         // UFs escolhidas no filtro (pode ser mais de uma)
  var slideAtual = 0;         // slide do carrossel de críticas

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
    // seleções salvas antes do limite podem vir maiores: mantém no máximo LIMITE_MAX
    salvo.slice(0, LIMITE_MAX).forEach(function (id) { selecionados[id] = true; });
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

  /* ---------- críticas (carrossel de slides) ---------- */
  var trilho = null;
  var slides = [];   // um <article class="critica"> por crítica
  var dots = [];     // indicadores de slide
  var botoesSel = {}; // id da crítica -> botão "Selecionar" do slide

  function renderCriticas() {
    var carrossel = el("carrossel-criticas");
    carrossel.replaceChildren();
    slides = [];
    dots = [];
    botoesSel = {};

    trilho = document.createElement("div");
    trilho.className = "carrossel-trilho";

    CRITICAS.forEach(function (c) {
      var artigo = document.createElement("article");
      artigo.className = "critica";
      artigo.dataset.id = c.id;

      var h3 = document.createElement("h3");
      h3.textContent = c.titulo;

      var p = document.createElement("p");
      p.textContent = c.texto;

      var rodape = document.createElement("div");
      rodape.className = "critica-rodape";

      var btnSel = document.createElement("button");
      btnSel.className = "btn btn-contorno";
      btnSel.textContent = "Selecionar esta crítica";
      btnSel.addEventListener("click", function () {
        criticaAtiva = c;
        aplicarCritica(c);
        atualizarBotoesCritica();
        toast('Crítica selecionada: "' + c.titulo + '". Revise a mensagem no passo 1.');
      });
      botoesSel[c.id] = btnSel;

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
      trilho.appendChild(artigo);
      slides.push(artigo);
    });

    var janela = document.createElement("div");
    janela.className = "carrossel-janela";
    janela.appendChild(trilho);

    var controles = document.createElement("div");
    controles.className = "carrossel-controles";

    var btnPrev = document.createElement("button");
    btnPrev.type = "button";
    btnPrev.className = "carrossel-seta";
    btnPrev.setAttribute("aria-label", "Crítica anterior");
    btnPrev.textContent = "←";
    btnPrev.addEventListener("click", function () { irPara(slideAtual - 1); });

    var caixaDots = document.createElement("div");
    caixaDots.className = "carrossel-dots";
    CRITICAS.forEach(function (c, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carrossel-dot";
      dot.setAttribute("aria-label", "Ver crítica " + (i + 1) + " de " + CRITICAS.length + ": " + c.titulo);
      dot.addEventListener("click", function () { irPara(i); });
      caixaDots.appendChild(dot);
      dots.push(dot);
    });

    var btnNext = document.createElement("button");
    btnNext.type = "button";
    btnNext.className = "carrossel-seta";
    btnNext.setAttribute("aria-label", "Próxima crítica");
    btnNext.textContent = "→";
    btnNext.addEventListener("click", function () { irPara(slideAtual + 1); });

    var contador = document.createElement("p");
    contador.className = "carrossel-contador";
    contador.id = "carrossel-contador";

    controles.appendChild(btnPrev);
    controles.appendChild(caixaDots);
    controles.appendChild(btnNext);
    carrossel.appendChild(janela);
    carrossel.appendChild(controles);
    carrossel.appendChild(contador);

    // setas do teclado quando uma delas está em foco
    [btnPrev, btnNext].forEach(function (btn) {
      btn.addEventListener("keydown", function (ev) {
        if (ev.key === "ArrowLeft") { ev.preventDefault(); irPara(slideAtual - 1); }
        if (ev.key === "ArrowRight") { ev.preventDefault(); irPara(slideAtual + 1); }
      });
    });

    // arrastar para o lado no toque (celular)
    var toqueX = null;
    janela.addEventListener("touchstart", function (ev) {
      toqueX = ev.touches[0].clientX;
    }, { passive: true });
    janela.addEventListener("touchend", function (ev) {
      if (toqueX === null) return;
      var delta = ev.changedTouches[0].clientX - toqueX;
      if (Math.abs(delta) > 40) irPara(slideAtual + (delta < 0 ? 1 : -1));
      toqueX = null;
    }, { passive: true });

    irPara(0);
    atualizarBotoesCritica();
  }

  function irPara(indice) {
    slideAtual = (indice + CRITICAS.length) % CRITICAS.length;
    trilho.style.transform = "translateX(-" + (slideAtual * 100) + "%)";
    slides.forEach(function (s, i) {
      var visivel = i === slideAtual;
      s.setAttribute("aria-hidden", visivel ? "false" : "true");
      s.inert = !visivel; // sem foco/clique em slides escondidos
    });
    dots.forEach(function (d, i) {
      d.classList.toggle("ativo", i === slideAtual);
      d.setAttribute("aria-current", i === slideAtual ? "true" : "false");
    });
    el("carrossel-contador").textContent = (slideAtual + 1) + " / " + CRITICAS.length;
  }

  function atualizarBotoesCritica() {
    CRITICAS.forEach(function (c, i) {
      var ativa = c === criticaAtiva;
      var btn = botoesSel[c.id];
      btn.className = "btn " + (ativa ? "btn-vermelho" : "btn-contorno");
      btn.textContent = ativa ? "✓ Selecionada" : "Selecionar esta crítica";
      slides[i].classList.toggle("selecionada", ativa);
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

  // chips das UFs adicionadas ao filtro (cada chip remove a própria UF)
  function renderUfsAtivas() {
    var box = el("ufs-ativas");
    box.replaceChildren();
    ufsAtivas.forEach(function (uf) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip-uf";
      chip.setAttribute("aria-label", "Remover " + uf + " do filtro");
      var rotulo = document.createElement("span");
      rotulo.textContent = uf;
      var fechar = document.createElement("span");
      fechar.className = "chip-uf-x";
      fechar.textContent = "✕";
      fechar.setAttribute("aria-hidden", "true");
      chip.appendChild(rotulo);
      chip.appendChild(fechar);
      chip.addEventListener("click", function () {
        ufsAtivas = ufsAtivas.filter(function (u) { return u !== uf; });
        renderUfsAtivas();
        renderLista();
        atualizarBotaoUf();
      });
      box.appendChild(chip);
    });
    box.hidden = ufsAtivas.length === 0;
  }

  function filtrados() {
    var termo = normalizar(el("busca").value.trim());
    return todos.filter(function (p) {
      if (filtroCasa !== "todos" && p.casa !== filtroCasa) return false;
      if (ufsAtivas.length && ufsAtivas.indexOf(p.uf) === -1) return false;
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
        if (selecionados[p.id]) {
          delete selecionados[p.id];
        } else {
          if (Object.keys(selecionados).length >= LIMITE_MAX) {
            check.checked = false;
            toast("Limite de " + LIMITE_MAX + " destinatários por mensagem: mais que isso " +
              "aumenta o risco de cair no spam. Desmarque alguém ou envie outra mensagem.", true);
            return;
          }
          selecionados[p.id] = true;
        }
        salvar();
        check.checked = !!selecionados[p.id];
        label.classList.toggle("marcado", !!selecionados[p.id]);
        atualizarContador();
      };
      check.addEventListener("change", alternar);
    });
    lista.appendChild(frag);
  }

  // seleciona em lote respeitando o teto anti-spam; devolve o que aconteceu
  function selecionarVarios(lista) {
    var vagas = LIMITE_MAX - Object.keys(selecionados).length;
    var resultado = { adicionados: 0, cortou: false };
    lista.forEach(function (p) {
      if (selecionados[p.id]) return;
      if (vagas <= 0) { resultado.cortou = true; return; }
      selecionados[p.id] = true;
      vagas--;
      resultado.adicionados++;
    });
    salvar();
    renderLista();
    atualizarContador();
    return resultado;
  }

  function atualizarContador() {
    var n = Object.keys(selecionados).length;
    var contador = el("contador");
    contador.textContent = n + " de " + LIMITE_MAX + " selecionados";
    contador.classList.toggle("no-limite", n >= LIMITE_MAX);
    el("aviso-limite").hidden = n < LIMITE_MAX;
    atualizarChips();
    atualizarBotaoUf();
  }

  // membros da casa que estão em tela (aplicando busca e UFs ativas)
  function filtradosDaCasa(casa) {
    var termo = normalizar(el("busca").value.trim());
    return todos.filter(function (p) {
      if (p.casa !== casa) return false;
      if (ufsAtivas.length && ufsAtivas.indexOf(p.uf) === -1) return false;
      if (termo) {
        var alvo = normalizar(p.nome + " " + p.partido + " " + p.uf);
        if (alvo.indexOf(termo) === -1) return false;
      }
      return true;
    });
  }

  function atualizarChips() {
    document.querySelectorAll(".chip[data-casa]").forEach(function (chip) {
      var casa = chip.dataset.casa;
      if (casa === "todos") return;
      var visiveis = filtradosDaCasa(casa);
      var cheio = visiveis.length > 0 && visiveis.every(function (p) { return !!selecionados[p.id]; });
      chip.classList.toggle("cheio", cheio);
    });
  }

  function atualizarBotaoUf() {
    var btn = el("sel-uf");
    var visiveis = filtrados();
    if (!visiveis.length) {
      btn.textContent = "Selecionar lista filtrada";
      return;
    }
    var completos = visiveis.every(function (p) { return !!selecionados[p.id]; });
    btn.textContent = (completos ? "Desmarcar" : "Selecionar") + " lista filtrada (" + visiveis.length + ")";
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
    // chips de casa: filtram a lista; Senado e Câmara também alternam a seleção
    // dos parlamentares listados (clicar seleciona, clicar de novo desmarca),
    // sempre respeitando o teto anti-spam de LIMITE_MAX destinatários
    document.querySelectorAll(".chip[data-casa]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        var casa = chip.dataset.casa;
        document.querySelectorAll(".chip[data-casa]").forEach(function (c) { c.classList.remove("ativo"); });
        chip.classList.add("ativo");
        filtroCasa = casa;
        renderLista();

        if (casa !== "senado" && casa !== "camara") {
          atualizarContador();
          return; // "Todos" é só filtro
        }

        var visiveis = filtrados(); // já com o filtro da casa aplicado
        var nomeCasa = casa === "senado" ? "Senado" : "Câmara";
        if (visiveis.length && visiveis.every(function (p) { return !!selecionados[p.id]; })) {
          visiveis.forEach(function (p) { delete selecionados[p.id]; });
          salvar();
          renderLista();
          atualizarContador();
          toast(nomeCasa + " desmarcado: " + visiveis.length + " parlamentares removidos.");
        } else {
          var r = selecionarVarios(visiveis);
          toast(nomeCasa + ": " + r.adicionados + " parlamentares selecionados" +
            (r.cortou ? " (limite de " + LIMITE_MAX + " atingido)" : "") + ".");
        }
      });
    });

    el("busca").addEventListener("input", function () {
      renderLista();
      atualizarContador();
    });

    // adicionar UF ao filtro (pode acumular quantas quiser; chip remove)
    el("uf").addEventListener("change", function () {
      var uf = el("uf").value;
      if (uf && ufsAtivas.indexOf(uf) === -1) {
        ufsAtivas.push(uf);
        renderUfsAtivas();
        renderLista();
        atualizarBotaoUf();
      }
      el("uf").value = ""; // volta a "+ Adicionar UF"
    });

    el("sel-uf").addEventListener("click", function () {
      var visiveis = filtrados();
      if (!visiveis.length) {
        toast("Use a busca ou adicione UFs no filtro para montar sua lista.", true);
        return;
      }
      if (visiveis.every(function (p) { return !!selecionados[p.id]; })) {
        visiveis.forEach(function (p) { delete selecionados[p.id]; });
        salvar();
        renderLista();
        atualizarContador();
        toast("Lista filtrada desmarcada (" + visiveis.length + ").");
      } else {
        var r = selecionarVarios(visiveis);
        toast(r.adicionados + " parlamentares selecionados" +
          (r.cortou ? " (limite de " + LIMITE_MAX + " atingido)" : "") + ".");
      }
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
      ufSelectPreencher();
      renderUfsAtivas();
      aplicarCritica(criticaAtiva);
      renderCriticas();
      renderLista();
      atualizarContador();
      ligarEventos();
    });
})();
