/* ============ Cartões "O que o Senado aprovou até agora?" ============ */
/* Cada medida tem um vídeo narrado; texto e fontes ficam nos detalhes. */
(function () {
  "use strict";

  var M = window.MEDIDAS;

  function renderCards() {
    var pai = document.getElementById("lista-aprovado");
    if (!pai) return;
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

      var resumo = document.createElement("p");
      resumo.className = "medida-resumo";
      resumo.textContent = c.impacto;
      artigo.appendChild(resumo);

      var areaVideo = document.createElement("div");
      areaVideo.className = "medida-video-area";
      var video = document.createElement("video");
      video.className = "medida-video";
      video.controls = true;
      video.playsInline = true;
      video.preload = "none";
      video.poster = "assets/videos/" + c.id + ".jpg";
      video.setAttribute("aria-label", "Vídeo explicativo: " + c.titulo);
      var fonteVideo = document.createElement("source");
      fonteVideo.src = "assets/videos/" + c.id + ".mp4";
      fonteVideo.type = "video/mp4";
      video.appendChild(fonteVideo);
      var legenda = document.createElement("track");
      legenda.kind = "subtitles";
      legenda.label = "Português";
      legenda.srclang = "pt-BR";
      legenda.src = "assets/videos/" + c.id + ".vtt";
      video.appendChild(legenda);
      areaVideo.appendChild(video);
      artigo.appendChild(areaVideo);

      var detalhes = document.createElement("details");
      detalhes.className = "detalhes-medida";
      var sumario = document.createElement("summary");
      sumario.textContent = "Ler a explicação completa e a fonte oficial";
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

  }

  document.addEventListener("DOMContentLoaded", renderCards);
})();
