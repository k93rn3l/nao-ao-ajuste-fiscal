// Exporta as falas das cenas para o gerador de áudio, sem duplicar o texto.
global.window = {};
require("../js/medidas.js");
require("../js/animacoes.js");
const roteiros = Object.fromEntries(Object.entries(window.ANIMACOES).map(([id, animacao]) =>
  [id, animacao.cenas.map(cena => cena.fala)]));
process.stdout.write(JSON.stringify(roteiros));
