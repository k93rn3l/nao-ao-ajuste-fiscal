/* Histórias visuais das sete medidas. Cada cena tem roteiro, arte responsiva
   e um intervalo próprio; o áudio gravado pode substituir esse relógio. */
(function () {
  "use strict";

  const PASSO = 9;
  const CENAS = {
    saude: [
      {
        titulo: "O piso do SUS acompanha a receita",
        fala: "A União deve aplicar na saúde pelo menos quinze por cento da Receita Corrente Líquida. Quando essa base cresce, a obrigação mínima também cresce.",
        visual: { tipo: "fluxo", itens: [["Receita da União", "RCL"], ["Regra constitucional", "15%"], ["Mínimo para a saúde", "SUS"]] }
      },
      {
        titulo: "O texto reduz a base considerada",
        fala: "No projeto de Orçamento de dois mil e vinte e sete, a Receita Corrente Líquida considerada é de mil oitocentos e quatorze vírgula quatro bilhões de reais. Sem a exclusão do petróleo, seria de mil oitocentos e cinquenta e nove vírgula nove bilhões.",
        visual: { tipo: "barras", itens: [["Sem exclusão", "R$ 1.859,9 bi", 100, "azul"], ["Com exclusão", "R$ 1.814,4 bi", 97.6, "vermelho"]] }
      },
      {
        titulo: "O mínimo legal fica menor",
        fala: "Com a base menor, a obrigação mínima calculada para a saúde passa de duzentos e setenta e nove bilhões para duzentos e setenta e dois vírgula dois bilhões de reais.",
        visual: { tipo: "barras", itens: [["Sem exclusão", "R$ 279,0 bi", 100, "verde"], ["Com exclusão", "R$ 272,2 bi", 97.6, "vermelho"]] }
      },
      {
        titulo: "O que significa a diferença?",
        fala: "São seis vírgula oito bilhões de reais a menos no piso legal estimado. Isso não prova um corte no gasto efetivo do SUS. A exclusão também enfrenta controvérsia jurídica.",
        visual: { tipo: "numero", valor: "R$ 6,8 bi", rotulo: "a menos na obrigação mínima", nota: "Piso menor ≠ gasto efetivo menor" }
      }
    ],
    educacao: [
      {
        titulo: "O piso da educação segue intacto",
        fala: "O mínimo constitucional da educação é calculado sobre a receita de impostos. Ele não usa a Receita Corrente Líquida e o texto aprovado não altera essa base.",
        visual: { tipo: "numero", valor: "18%", rotulo: "da receita de impostos", nota: "Base do piso: sem mudança" }
      },
      {
        titulo: "Mas há verbas fora do piso",
        fala: "Universidades, institutos federais, bolsas e obras também dependem de despesas discricionárias. Esses valores são definidos a cada Orçamento.",
        visual: { tipo: "cartoes", itens: [["🏛️", "Universidades"], ["🔬", "Pesquisa e bolsas"], ["🛠️", "Funcionamento e obras"]] }
      },
      {
        titulo: "É essa parte que pode ser bloqueada",
        fala: "O novo contingenciamento permite bloquear despesas mesmo quando a projeção ainda está dentro da faixa de tolerância da meta. Na prática, o bloqueio atinge principalmente a verba discricionária.",
        visual: { tipo: "barras", itens: [["Piso obrigatório", "Protegido", 100, "verde"], ["Verba discricionária", "Sujeita a bloqueio", 68, "vermelho"]] }
      },
      {
        titulo: "Piso protegido, operação pressionada",
        fala: "O piso da educação permanece. O risco é faltar espaço no orçamento para o funcionamento diário das instituições e para novos investimentos.",
        visual: { tipo: "fluxo", itens: [["Piso", "preservado"], ["Custeio", "pressionado"], ["Efeito", "menos espaço"]] }
      }
    ],
    teto: [
      {
        titulo: "Existe um limite para crescer",
        fala: "Hoje, o limite de despesas pode crescer acima da inflação entre zero vírgula seis e dois vírgula cinco por cento ao ano, conforme a regra fiscal.",
        visual: { tipo: "barras", itens: [["Mínimo real", "0,6%", 24, "azul"], ["Máximo real", "2,5%", 100, "verde"]] }
      },
      {
        titulo: "Em anos de contingenciamento",
        fala: "O texto aprovado reduz o teto de crescimento real de dois vírgula cinco para dois por cento nos anos em que houver contingenciamento.",
        visual: { tipo: "barras", itens: [["Regra atual", "2,5%", 100, "azul"], ["Texto aprovado", "2,0%", 80, "vermelho"]] }
      },
      {
        titulo: "Menos espaço para expandir",
        fala: "No exemplo da Consultoria do Senado, a diferença entre os dois limites representa cerca de doze vírgula quatro bilhões de reais de espaço para despesas.",
        visual: { tipo: "numero", valor: "R$ 12,4 bi", rotulo: "de diferença no exemplo", nota: "Espaço de crescimento, não corte nominal" }
      },
      {
        titulo: "Os dois limites ainda crescem",
        fala: "Isso não é uma redução nominal do orçamento. Ambos os limites ainda permitem crescimento acima da inflação; o novo teto apenas deixa menos margem nos anos de aperto.",
        visual: { tipo: "fluxo", itens: [["Inflação", "reposta"], ["Crescimento", "+2,0% real"], ["Resultado", "menor margem"]] }
      }
    ],
    contingenciamento: [
      {
        titulo: "A meta tem uma faixa de tolerância",
        fala: "A meta de resultado primário de dois mil e vinte e sete tem centro em zero vírgula cinco por cento do PIB e tolerância de zero vírgula vinte e cinco até zero vírgula setenta e cinco por cento.",
        visual: { tipo: "regua", marcador: 50, marcadorTexto: "0,50%", itens: [["0,25%", "piso"], ["0,50%", "centro"], ["0,75%", "teto"]] }
      },
      {
        titulo: "Mesmo dentro da faixa, pode haver bloqueio",
        fala: "Uma projeção de zero vírgula trinta e cinco por cento do PIB estaria dentro da faixa. O novo texto permite, mas não obriga, um bloqueio para aproximar o resultado do centro da meta.",
        visual: { tipo: "regua", marcador: 20, marcadorTexto: "0,35%", itens: [["0,25%", "piso"], ["0,50%", "centro"], ["0,75%", "teto"]] }
      },
      {
        titulo: "A decisão passa pelo Executivo",
        fala: "O contingenciamento preventivo dá ao Executivo uma opção adicional de bloqueio. Se o bloqueio já for obrigatório, o texto também permite um valor extra.",
        visual: { tipo: "fluxo", itens: [["Projeção", "abaixo do centro"], ["Executivo", "pode bloquear"], ["Objetivo", "aproximar da meta"]] }
      },
      {
        titulo: "O impacto recai sobre a verba flexível",
        fala: "Obrigações constitucionais e legais continuam protegidas. Por isso, investimento, custeio e outras despesas discricionárias são os principais alvos práticos do bloqueio.",
        visual: { tipo: "barras", itens: [["Obrigatórias", "Protegidas", 100, "verde"], ["Discricionárias", "Mais expostas", 62, "vermelho"]] }
      }
    ],
    beneficios: [
      {
        titulo: "A lei atual já reduziu benefícios",
        fala: "A lei atual já reduz linearmente em dez por cento parte dos benefícios tributários federais, com exceções previstas em lei.",
        visual: { tipo: "moedas", retiradas: 1, rotulo: "1 de 10 partes reduzida" }
      },
      {
        titulo: "O texto dobra a redução",
        fala: "O texto-base aprovado aumenta a redução de dez para vinte por cento nas modalidades alcançadas. Em uma imagem simples, são duas partes em cada dez.",
        visual: { tipo: "moedas", retiradas: 2, rotulo: "2 de 10 partes reduzidas" }
      },
      {
        titulo: "Há exceções específicas",
        fala: "Entre as exceções estão a desoneração da folha, tecnologia da informação, semicondutores e veículos para pessoas com deficiência ou autismo.",
        visual: { tipo: "cartoes", itens: [["✓", "Desoneração da folha"], ["✓", "TI e semicondutores"], ["✓", "Veículos PcD e TEA"]] }
      },
      {
        titulo: "Estimativa não é arrecadação garantida",
        fala: "O parecer estima quinze bilhões de reais em dois mil e vinte e sete com a redução adicional. O valor realizado dependerá da economia e de possíveis disputas judiciais.",
        visual: { tipo: "numero", valor: "R$ 15 bi", rotulo: "estimativa adicional para 2027", nota: "Renúncia menor ≠ arrecadação garantida" }
      }
    ],
    supersalarios: [
      {
        titulo: "O debate são os penduricalhos",
        fala: "Verbas indenizatórias e auxílios podem fazer a remuneração total ultrapassar o teto constitucional. É o problema chamado de supersalários.",
        visual: { tipo: "barras", itens: [["Teto constitucional", "Limite", 72, "azul"], ["Com penduricalhos", "Acima do teto", 100, "vermelho"]] }
      },
      {
        titulo: "O texto fixa um prazo",
        fala: "O texto aprovado dá cento e vinte dias para o Congresso apreciar uma lei sobre verbas indenizatórias.",
        visual: { tipo: "numero", valor: "120 dias", rotulo: "prazo para o Congresso", nota: "Ainda depende de nova lei" }
      },
      {
        titulo: "A economia já teria destino",
        fala: "Se houver economia, no Executivo ela iria para segurança pública e atendimento socioeducativo. Nos demais Poderes, para recompor quadros.",
        visual: { tipo: "cartoes", itens: [["🛡️", "Executivo: segurança"], ["🏢", "Outros Poderes: quadros"]] }
      },
      {
        titulo: "Não há corte automático",
        fala: "A medida não corta nenhum pagamento por si só. Sem uma nova lei aprovada, os pagamentos atuais continuam.",
        visual: { tipo: "numero", valor: "Ainda não", rotulo: "há corte automático", nota: "O resultado depende da futura regulamentação" }
      }
    ],
    outras: [
      {
        titulo: "Repasses da Lei Kandir",
        fala: "O texto-base antecipa a devolução da parcela reduzida dos repasses entre dois mil e vinte e sete e dois mil e trinta. Esse ponto ainda está entre os destaques pendentes.",
        visual: { tipo: "fluxo", itens: [["2027–2030", "parcela reduzida"], ["Ano seguinte", "devolução"], ["Até 2037", "conclusão"]] }
      },
      {
        titulo: "Compensação de tributos",
        fala: "O projeto permite restringir o uso de créditos tributários para compensar impostos. A redução da compensação também está entre os destaques ainda não votados.",
        visual: { tipo: "fluxo", itens: [["Crédito", "da empresa"], ["Uso", "pode ser limitado"], ["Pagamento", "mais à vista"]] }
      },
      {
        titulo: "Superávit e regra de ouro",
        fala: "A desvinculação do superávit financeiro ampliaria em cem bilhões de reais a margem na regra de ouro. Esse ponto também depende dos destaques.",
        visual: { tipo: "numero", valor: "R$ 100 bi", rotulo: "de margem prevista", nota: "Destaque ainda pendente na revisão" }
      },
      {
        titulo: "Um pacote de efeitos diferentes",
        fala: "Há ainda uma subvenção ao diesel em dois mil e vinte e seis. O parecer soma impacto estimado de quarenta e cinco vírgula um a cinquenta e seis vírgula um bilhões em dois mil e vinte e sete. São estimativas, não economia realizada.",
        visual: { tipo: "numero", valor: "R$ 45,1–56,1 bi", rotulo: "impacto conjunto estimado para 2027", nota: "Parte das medidas ainda depende de votação" }
      }
    ]
  };

  function elemento(tag, classe, texto) {
    const no = document.createElement(tag);
    if (classe) no.className = classe;
    if (texto !== undefined) no.textContent = texto;
    return no;
  }

  function visualizacao(config) {
    const caixa = elemento("div", "motion-visual motion-" + config.tipo);
    const atualizadores = [];
    if (config.tipo === "barras") {
      config.itens.forEach(([rotulo, valor, largura, cor], indice) => {
        const linha = elemento("div", "motion-barra-linha");
        const topo = elemento("div", "motion-barra-topo");
        topo.append(elemento("span", "", rotulo), elemento("strong", "", valor));
        const trilho = elemento("div", "motion-barra-trilho");
        const preenchimento = elemento("div", "motion-barra-fill cor-" + cor);
        trilho.append(preenchimento);
        linha.append(topo, trilho);
        caixa.append(linha);
        atualizadores.push(p => {
          preenchimento.style.width = (largura * p).toFixed(1) + "%";
          linha.style.opacity = String(Math.min(1, p * 2.5 - indice * 0.2));
        });
      });
    } else if (config.tipo === "fluxo" || config.tipo === "cartoes") {
      config.itens.forEach(([cima, baixo], indice) => {
        const cartao = elemento("div", "motion-item");
        cartao.append(elemento("span", "motion-item-sobre", cima), elemento("strong", "", baixo));
        caixa.append(cartao);
        atualizadores.push(p => {
          const entrada = Math.max(0, Math.min(1, p * config.itens.length - indice));
          cartao.style.opacity = String(entrada);
          cartao.style.transform = "translateY(" + ((1 - entrada) * 18).toFixed(1) + "px)";
        });
      });
    } else if (config.tipo === "numero") {
      const bloco = elemento("div", "motion-numero-bloco");
      bloco.append(elemento("strong", "motion-numero", config.valor), elemento("span", "motion-numero-rotulo", config.rotulo));
      caixa.append(bloco);
      atualizadores.push(p => { bloco.style.transform = "scale(" + (0.88 + p * 0.12).toFixed(3) + ")"; bloco.style.opacity = String(0.45 + p * 0.55); });
    } else if (config.tipo === "moedas") {
      const grade = elemento("div", "motion-moedas-grade");
      for (let i = 0; i < 10; i++) {
        const moeda = elemento("span", "motion-moeda", "R$");
        grade.append(moeda);
        atualizadores.push(p => {
          const retirada = i >= 10 - config.retiradas;
          moeda.classList.toggle("retirada", retirada && p > 0.5);
          moeda.style.opacity = String(Math.min(1, Math.max(0, p * 5 - i * 0.15)));
        });
      }
      caixa.append(grade, elemento("strong", "motion-moedas-legenda", config.rotulo));
    } else if (config.tipo === "regua") {
      const trilho = elemento("div", "motion-regua-trilho");
      const marcador = elemento("div", "motion-regua-marcador", "▼ " + (config.marcadorTexto || ""));
      trilho.append(marcador);
      const marcas = elemento("div", "motion-regua-marcas");
      config.itens.forEach(([valor, rotulo]) => {
        const marca = elemento("span", "motion-regua-marca");
        marca.append(elemento("strong", "", valor), elemento("small", "", rotulo));
        marcas.append(marca);
      });
      caixa.append(trilho, marcas);
      atualizadores.push(p => { marcador.style.left = (5 + config.marcador * p * 0.9) + "%"; });
    }
    if (config.nota) caixa.append(elemento("p", "motion-nota", config.nota));
    return { caixa, atualizar: p => atualizadores.forEach(fn => fn(p)) };
  }

  function montarAnimacao(mountId, cfg) {
    const mount = document.getElementById(mountId);
    if (!mount) return;
    const id = cfg.id;
    const duracao = cfg.cenas.length * PASSO;
    const reducao = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const audioCfg = window.AUDIOS_MEDIDAS && window.AUDIOS_MEDIDAS[id];
    const audio = audioCfg && audioCfg.src ? new Audio(audioCfg.src) : null;
    if (audio) audio.preload = "none";

    const wrap = elemento("div", "anim-wrap-inner");
    const tela = elemento("div", "motion-tela");
    tela.setAttribute("role", "img");
    tela.setAttribute("aria-label", "Animação explicativa: " + cfg.cenas.map(c => c.titulo).join("; "));
    const cenas = cfg.cenas.map((cena, indice) => {
      const pagina = elemento("div", "motion-cena");
      pagina.append(elemento("span", "motion-etapa", "ETAPA " + (indice + 1) + " / " + cfg.cenas.length), elemento("h4", "motion-titulo", cena.titulo));
      const visual = visualizacao(cena.visual);
      pagina.append(visual.caixa);
      tela.append(pagina);
      return { pagina, atualizar: visual.atualizar };
    });
    const legenda = elemento("p", "anim-legenda");
    legenda.setAttribute("aria-live", "polite");
    const controles = elemento("div", "anim-controles");
    const play = elemento("button", "", "▶");
    play.type = "button";
    const reiniciar = elemento("button", "", "↻");
    reiniciar.type = "button";
    reiniciar.setAttribute("aria-label", "Reiniciar animação");
    const ouvir = elemento("button", "anim-narrar", "🔊 Ouvir");
    ouvir.type = "button";
    ouvir.setAttribute("aria-label", "Ouvir explicação narrada");
    if (!audio && (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window))) {
      ouvir.disabled = true;
      ouvir.title = "Narração indisponível neste navegador";
    }
    const faixa = elemento("input");
    faixa.type = "range";
    faixa.min = "0";
    faixa.max = String(duracao);
    faixa.step = "0.05";
    faixa.setAttribute("aria-label", "Linha do tempo da animação");
    const tempo = elemento("span", "anim-tempo");
    controles.append(play, reiniciar, ouvir, faixa, tempo);
    wrap.append(tela, legenda, controles);
    mount.append(wrap);

    let t = 0, tocando = false, narrando = false, limiteVoz = null, ultimoQuadro = null, indiceAtual = -1;
    const relogio = segundos => Math.floor(segundos / 60) + ":" + String(Math.floor(segundos % 60)).padStart(2, "0");
    function definirPlay() {
      const emCurso = tocando || (narrando && !!audio && !audio.paused);
      play.textContent = emCurso ? "Ⅱ" : "▶";
      play.setAttribute("aria-label", emCurso ? "Pausar reprodução" : "Reproduzir animação");
    }
    function tempoDoAudio(segundos) {
      const marcos = audioCfg && audioCfg.marcos;
      if (marcos && marcos.length === cfg.cenas.length + 1) {
        let i = marcos.findIndex((_, j) => j < cfg.cenas.length && segundos < marcos[j + 1]);
        if (i < 0) i = cfg.cenas.length - 1;
        const fracao = Math.max(0, Math.min(1, (segundos - marcos[i]) / Math.max(0.01, marcos[i + 1] - marcos[i])));
        return (i + fracao) * PASSO;
      }
      return Math.min(duracao, segundos / Math.max(0.01, audio.duration || duracao) * duracao);
    }
    function tempoParaAudio(tempoAnimacao) {
      const marcos = audioCfg && audioCfg.marcos;
      if (marcos && marcos.length === cfg.cenas.length + 1) {
        const i = Math.min(cfg.cenas.length - 1, Math.floor(tempoAnimacao / PASSO));
        const fracao = Math.min(1, (tempoAnimacao - i * PASSO) / PASSO);
        return marcos[i] + (marcos[i + 1] - marcos[i]) * fracao;
      }
      return tempoAnimacao / duracao * (audio.duration || duracao);
    }
    function render() {
      const indice = Math.min(cfg.cenas.length - 1, Math.floor(t / PASSO));
      const p = reducao ? 1 : Math.max(0.25, Math.min(1, Math.max(0, (t - indice * PASSO) / PASSO)));
      if (indice !== indiceAtual) {
        cenas.forEach((c, i) => c.pagina.classList.toggle("ativa", i === indice));
        legenda.textContent = cfg.cenas[indice].fala;
        indiceAtual = indice;
      }
      cenas[indice].atualizar(1 - Math.pow(1 - p, 3));
      faixa.value = String(t);
      tempo.textContent = narrando && audio && Number.isFinite(audio.duration)
        ? relogio(audio.currentTime) + " / " + relogio(audio.duration)
        : relogio(t) + " / " + relogio(duracao);
    }
    function pararVoz() {
      if (!narrando) return;
      narrando = false;
      limiteVoz = null;
      ouvir.textContent = "🔊 Ouvir";
      ouvir.setAttribute("aria-label", "Ouvir explicação narrada");
      if (audio) { audio.pause(); audio.currentTime = 0; }
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      definirPlay();
    }
    function narrarCena(i) {
      if (!narrando) return;
      if (i >= cfg.cenas.length) { pararVoz(); tocando = false; definirPlay(); return; }
      t = i * PASSO;
      limiteVoz = (i + 1) * PASSO;
      tocando = true;
      definirPlay();
      render();
      const fala = new SpeechSynthesisUtterance(cfg.cenas[i].fala);
      fala.lang = "pt-BR";
      const voz = window.speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith("pt-br"));
      if (voz) fala.voice = voz;
      fala.onend = () => { if (narrando) narrarCena(i + 1); };
      fala.onerror = () => { pararVoz(); tocando = false; definirPlay(); };
      window.speechSynthesis.speak(fala);
    }
    function quadro(agora) {
      if (ultimoQuadro === null) ultimoQuadro = agora;
      const delta = Math.min(0.05, (agora - ultimoQuadro) / 1000);
      ultimoQuadro = agora;
      if (narrando && audio && !audio.paused) {
        t = tempoDoAudio(audio.currentTime);
        render();
      } else if (tocando) {
        t = Math.min(duracao, t + delta);
        if (limiteVoz !== null && t >= limiteVoz) { t = limiteVoz; tocando = false; }
        if (t >= duracao) { tocando = false; definirPlay(); }
        render();
      }
      requestAnimationFrame(quadro);
    }
    play.addEventListener("click", () => {
      if (narrando && audio) {
        if (audio.paused) audio.play().then(definirPlay).catch(pararVoz);
        else { audio.pause(); definirPlay(); }
        return;
      }
      pararVoz();
      if (t >= duracao) t = 0;
      tocando = !tocando;
      definirPlay();
      render();
    });
    reiniciar.addEventListener("click", () => {
      if (narrando && audio) { audio.currentTime = 0; t = 0; render(); return; }
      pararVoz();
      t = 0;
      tocando = true;
      definirPlay();
      render();
    });
    faixa.addEventListener("input", () => {
      if (narrando && audio) { t = Number(faixa.value); audio.currentTime = tempoParaAudio(t); render(); return; }
      pararVoz();
      tocando = false;
      t = Number(faixa.value);
      definirPlay();
      render();
    });
    ouvir.addEventListener("click", () => {
      if (narrando) { pararVoz(); tocando = false; definirPlay(); return; }
      window.dispatchEvent(new Event("parar-narracoes"));
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      narrando = true;
      tocando = false;
      t = 0;
      ouvir.textContent = "■ Parar voz";
      ouvir.setAttribute("aria-label", "Parar narração");
      definirPlay();
      render();
      if (audio) {
        audio.currentTime = 0;
        audio.play().then(definirPlay).catch(() => {
          if (narrando) { pararVoz(); ouvir.title = "Não foi possível reproduzir o áudio"; }
        });
      } else narrarCena(0);
    });
    if (audio) audio.addEventListener("ended", () => { t = duracao; render(); pararVoz(); });
    window.addEventListener("parar-narracoes", () => { pararVoz(); tocando = false; definirPlay(); });
    if ("IntersectionObserver" in window) {
      const observador = new IntersectionObserver(entradas => {
        entradas.forEach(entrada => {
          if (entrada.isIntersecting && !reducao && !narrando && t < duracao) tocando = true;
          if (!entrada.isIntersecting) { pararVoz(); tocando = false; }
          definirPlay();
        });
      }, { threshold: 0.55 });
      observador.observe(mount);
    }
    definirPlay();
    render();
    requestAnimationFrame(quadro);
  }

  const ANIMACOES = Object.fromEntries(Object.entries(CENAS).map(([id, cenas]) => [id, {
    id,
    cenas,
    duracao: cenas.length * PASSO,
    legendas: cenas.map((cena, i) => [i * PASSO, (i + 1) * PASSO, cena.fala])
  }]));
  window.ANIMACOES = ANIMACOES;
  window.montarAnimacao = montarAnimacao;
})();
