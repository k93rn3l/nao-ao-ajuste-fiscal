/* ============ Cartões "O que o Senado aprovou até agora?" ============ */
/* Renderiza os cartões expansíveis a partir dos dados verificados em js/medidas.js. */
(function () {
  "use strict";

  var M = window.MEDIDAS;

  function renderCards() {
    var pai = document.getElementById("lista-aprovado");
    if (!pai) return;
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

  document.addEventListener("DOMContentLoaded", renderCards);
})();
