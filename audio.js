/* ===== SOM: tudo é gerado por código (Web Audio API), sem arquivos de áudio =====
   Som.sfx("nome")    toca um efeito      |  Som.musica("mapa" | "combate" | "boss" | null)  troca a música
   Tecla M (ou o botão SOM) liga/desliga.  Os navegadores só liberam áudio depois do primeiro clique/tecla. */
const Som = (() => {
  let ctx = null, mestre = null, faixaGain = null, atual = null, desejada = null, timer = null, passo = 0, proximo = 0;
  let mudo = false;
  try { mudo = localStorage.getItem("som-mudo") === "1"; } catch (e) {}

  function iniciar() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      mestre = ctx.createGain(); mestre.gain.value = mudo ? 0 : 0.7; mestre.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    if (desejada && !atual) musica(desejada);
  }
  ["pointerdown", "keydown"].forEach(ev => addEventListener(ev, iniciar));

  // ---- blocos básicos: uma nota (oscilador) e um chiado (ruído) ----
  function tom(f, dur, tipo = "square", vol = 0.15, f2 = null, atraso = 0, destino = mestre) {
    if (!ctx) return;
    const t = ctx.currentTime + atraso, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(destino); o.start(t); o.stop(t + dur + 0.05);
  }
  function ruido(dur, vol = 0.15, filtro = 1200, tipoF = "lowpass", atraso = 0, destino = mestre) {
    if (!ctx) return;
    const n = Math.floor(ctx.sampleRate * dur), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), t = ctx.currentTime + atraso;
    s.buffer = b; f.type = tipoF; f.frequency.value = filtro;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(destino); s.start(t);
  }
  const hz = semitons => 440 * Math.pow(2, semitons / 12);   // 0 = lá central (A4)

  // ---- efeitos sonoros ----
  const efeitos = {
    clique:  () => tom(900, 0.05, "square", 0.06),
    corte:   () => { ruido(0.12, 0.22, 3000, "highpass"); tom(300, 0.08, "triangle", 0.06, 120); },
    surge:   () => { tom(330, 0.1, "square", 0.1); tom(440, 0.1, "square", 0.1, null, 0.09); tom(330, 0.18, "sawtooth", 0.08, 200, 0.18); },
    luta:    () => { tom(110, 0.25, "sawtooth", 0.12, 70); tom(165, 0.25, "sawtooth", 0.08, 100, 0.12); },
    ataque:  () => { ruido(0.14, 0.2, 2500, "highpass"); tom(700, 0.12, "sawtooth", 0.08, 200); tom(180, 0.12, "square", 0.12, 90, 0.08); },
    defesa:  () => { tom(660, 0.07, "triangle", 0.14); tom(990, 0.1, "triangle", 0.14, null, 0.06); },
    erro:    () => tom(130, 0.07, "square", 0.05),
    dano:    () => { ruido(0.22, 0.3, 700); tom(150, 0.25, "sawtooth", 0.14, 55); },
    tick:    () => tom(200, 0.08, "sawtooth", 0.07, 120),
    quebra:  () => { ruido(0.3, 0.3, 1800, "bandpass"); tom(90, 0.3, "square", 0.15, 40); },
    veneno:  () => { for (let i = 0; i < 4; i++) tom(260 - i * 35, 0.12, "sawtooth", 0.09, 200 - i * 35, i * 0.1); },
    ultimate:() => { tom(180, 0.7, "sawtooth", 0.12, 900); tom(360, 0.7, "square", 0.06, 1800); ruido(0.5, 0.1, 5000, "highpass", 0.2); },
    ultFim:  () => tom(500, 0.4, "triangle", 0.1, 120),
    invoca:  () => { tom(80, 0.6, "sawtooth", 0.15, 50); tom(120, 0.6, "square", 0.06, 70, 0.05); ruido(0.5, 0.12, 400); },
    morte:   () => { tom(300, 0.25, "square", 0.12, 60); ruido(0.2, 0.15, 900); },
    loot:    () => [523, 659, 784, 1047].forEach((f, i) => tom(f, 0.14, "square", 0.1, null, i * 0.09)),
    trancado:() => { tom(140, 0.1, "square", 0.1); tom(110, 0.14, "square", 0.1, null, 0.1); },
    pausa:   () => tom(440, 0.1, "triangle", 0.1, 330),
    vitoriaLuta: () => [392, 523, 659].forEach((f, i) => tom(f, 0.15, "square", 0.1, null, i * 0.1)),
    vitoria: () => [392, 523, 659, 784, 659, 784, 1047].forEach((f, i) => tom(f, 0.2, "square", 0.11, null, i * 0.14)),
    derrota: () => [330, 277, 233, 196].forEach((f, i) => tom(f, 0.35, "sawtooth", 0.1, f * 0.95, i * 0.25))
  };
  function sfx(nome) { if (ctx && !mudo && efeitos[nome]) efeitos[nome](); }

  // ---- músicas (loops gerados passo a passo) ----
  const acordes = [-24, -28, -26, -29];   // raízes do pad do mapa
  const penta = [0, 3, 5, 7, 10];
  const baixoC = [-36, null, -36, null, -33, null, -36, null, -29, null, -36, null, -34, null, -31, null];
  const baixoB = [-36, -36, null, -36, -33, -33, null, -36, -29, -29, null, -36, -27, -31, -34, -31];
  const faixas = {
    mapa: { passo: 0.5, tocar(p) {                       // clima calmo e sombrio
      if (p % 8 === 0) { const r = acordes[(p / 8) % 4]; [0, 7, 12].forEach(i => tom(hz(r + i), 4.2, "triangle", 0.05, null, 0, faixaGain)); }
      if (p % 16 === 0) ruido(3, 0.03, 500, "lowpass", 0, faixaGain);
      if (Math.random() < 0.15) tom(hz(12 + penta[Math.floor(Math.random() * 5)]), 1.2, "sine", 0.04, null, 0, faixaGain);
    } },
    combate: { passo: 0.18, tocar(p) {                   // batida tensa
      const s = p % 16, b = baixoC[s];
      if (b !== null) tom(hz(b), 0.28, "sawtooth", 0.07, null, 0, faixaGain);
      if (s % 4 === 0) tom(120, 0.12, "sine", 0.2, 40, 0, faixaGain);
      if (s % 2 === 1) ruido(0.03, 0.04, 6000, "highpass", 0, faixaGain);
    } },
    boss: { passo: 0.14, tocar(p) {                      // mais rápida e agressiva
      const s = p % 16, b = baixoB[s];
      if (b !== null) tom(hz(b), 0.2, "sawtooth", 0.08, null, 0, faixaGain);
      if (s % 4 === 0) tom(120, 0.12, "sine", 0.22, 40, 0, faixaGain);
      if (s === 4 || s === 12) ruido(0.1, 0.09, 1800, "bandpass", 0, faixaGain);
      if (s % 2 === 0) tom(hz([0, 3, 7, 10][(s / 2) % 4]), 0.1, "square", 0.03, null, 0, faixaGain);
    } }
  };
  function agendar() {
    const f = faixas[atual];
    if (!f || !ctx) return;
    while (proximo < ctx.currentTime + 0.25) { f.tocar(passo); passo++; proximo += f.passo; }
  }
  function musica(nome) {
    desejada = nome;
    if (nome === atual && timer) return;
    clearInterval(timer); timer = null; atual = null;
    if (!ctx) return;
    if (faixaGain) { const velho = faixaGain; velho.gain.setTargetAtTime(0, ctx.currentTime, 0.15); setTimeout(() => velho.disconnect(), 1500); faixaGain = null; }
    if (!nome) return;
    faixaGain = ctx.createGain(); faixaGain.gain.value = 0.5; faixaGain.connect(mestre);
    atual = nome; passo = 0; proximo = ctx.currentTime + 0.1;
    timer = setInterval(agendar, 60);
  }

  // ---- mudo: tecla M e botões SOM ----
  function botoes() { document.querySelectorAll(".somBtn").forEach(b => b.textContent = mudo ? "SOM: OFF" : "SOM: ON"); }
  function alternarMudo() {
    mudo = !mudo;
    try { localStorage.setItem("som-mudo", mudo ? "1" : "0"); } catch (e) {}
    if (mestre) mestre.gain.setTargetAtTime(mudo ? 0 : 0.7, ctx.currentTime, 0.05);
    botoes();
  }
  addEventListener("keydown", e => { if (e.code === "KeyM") alternarMudo(); });
  document.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.classList.contains("somBtn")) alternarMudo(); else sfx("clique");
  });
  botoes();

  return { sfx, musica, iniciar };
})();
