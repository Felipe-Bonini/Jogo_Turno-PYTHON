/* ===== INTRODUÇÃO: título -> prólogo -> missão -> como jogar -> mapa ===== */
(() => {
  const q = id => document.querySelector(id);
  const telas = {
    titulo: q('#title-screen'),
    prologo: q('#intro-screen'),
    missao: q('#mission-screen'),
    tut1: q('#tutorial-1'),
    tut2: q('#tutorial-2')
  };

  // Esconde todas as telas da introdução e mostra só a escolhida.
  function mostrar(tela) {
    Object.values(telas).forEach(t => t.classList.add('hidden'));
    tela.classList.remove('hidden');
  }

  q('#start-button').addEventListener('click', () => { Som.musica('mapa'); mostrar(telas.prologo); });
  q('#back-button').addEventListener('click', () => mostrar(telas.titulo));
  q('#continue-button').addEventListener('click', () => mostrar(telas.missao));

  // Missão -> tutorial (2 telas) -> jogo
  q('#finish-intro-button').addEventListener('click', () => mostrar(telas.tut1));
  q('#tut1-back').addEventListener('click', () => mostrar(telas.missao));
  q('#tut1-next').addEventListener('click', () => mostrar(telas.tut2));
  q('#tut2-back').addEventListener('click', () => mostrar(telas.tut1));

  // Usado pelo botão "Voltar ao título" da tela de fim de jogo.
  window.voltarAoTitulo = () => {
    document.getElementById('mapScreen').hidden = true;
    document.getElementById('abertura').hidden = false;
    mostrar(telas.titulo);
  };

  // Fim da introdução: esconde a abertura e mostra o mapa do jogo.
  q('#start-game-button').addEventListener('click', () => {
    document.getElementById('abertura').hidden = true;
    document.getElementById('mapScreen').hidden = false;
  });
})();