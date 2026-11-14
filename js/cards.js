/* ============ Cartões "O que o Senado aprovou até agora?" ============ */
/* Cada medida é explicada por uma animação (js/animacoes.js); o texto
   verificado e as fontes ficam recolhidos em "Detalhes e fonte". */
(function () {
  "use strict";

  var M = window.MEDIDAS;

  function renderCards() {
    var pai = document.getElementById("lista-aprovado");
    if (!pai) return;
    var comAnimacao = !!(window.ANIMACOES && window.montarAnimacao);

    M.cards.forEach(function (c) {
      var artigo = document.createElement("article");
      artigo.className = "medida";
      artigo.id = "medida-" + c.id;

      var cab = document.createElement("header");
      cab.className = "medida-cabecalho";
      var icone = document.createElement("span");
      icone.className = "card-icone";
      icone.textContent = c.icone;
      var h3 = document.createElement("h3");
      h3.textContent = c.titulo;
      cab.appendChild(icone);
      cab.appendChild(h3);
      artigo.appendChild(cab);

      if (comAnimacao && window.ANIMACOES[c.id]) {
        var palco = document.createElement("div");
        palco.className = "anim-mount";
        palco.id = "anim-" + c.id;
        artigo.appendChild(palco);
      }

      var detalhes = document.createElement("details");
      detalhes.className = "detalhes-medida";
      var sumario = document.createElement("summary");
      sumario.textContent = "Detalhes, números e fonte oficial";
      detalhes.appendChild(sumario);

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
        detalhes.appendChild(h4);
        detalhes.appendChild(p);
      });

      var fonte = document.createElement("p");
      fonte.className = "card-fonte";
      var a = document.createElement("a");
      a.href = c.fonteUrl;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "Fonte oficial: " + c.fonte;
      fonte.appendChild(a);
      detalhes.appendChild(fonte);

      artigo.appendChild(detalhes);
      pai.appendChild(artigo);
    });

    if (comAnimacao) {
      M.cards.forEach(function (c) {
        if (window.ANIMACOES[c.id]) {
          window.montarAnimacao("anim-" + c.id, window.ANIMACOES[c.id]);
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", renderCards);
})();
