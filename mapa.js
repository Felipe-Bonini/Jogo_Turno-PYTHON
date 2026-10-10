/* ===== MAPA E EXPLORAÇÃO ===== */
const INVERT_MS = 10000;      // tempo com os controles invertidos após o veneno
const HEAL_VITORIA = 10;      // vida recuperada ao vencer uma cobra do mato
const VISAO = 4;                  // raio de visão do jogador, em tiles (menor = mais escuro)
const VIEW_W = 15, VIEW_H = 11;   // tamanho da janela do mapa mostrada na tela (tiles)
const LOOT = { damage: 4, cooldown: 120 };   // bônus ao saquear uma casa

/* X árvore | . livre | # mato alto | 1 e 2 mato com serpente 1 ou 2
   H casa abandonada (serpente 3) | T templo (PYTHON) | P início */
const MAPA_BASE = [
  "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "XP..###2##########1#1#########X",
  "X.....#####XX##X#####1X#######X",
  "X......##########...X#########X",
  "X#####X####1#####.############X",
  "X###1####1X####X###H##########X",
  "X11#####2####################.X",
  "X####X##H######X###1##..###H##X",
  "X#############X######1########X",
  "X######..#X2#X###XX...#X####1#X",
  "X##2#####..####1......#####..#X",
  "X######X###X#..1##############X",
  "X####X####2######1#..#########X",
  "X############H###....####1##1#X",
  "X#X##############....##H#X####X",
  "X############1####..######1###X",
  "X##############1########X#X###X",
  "X##H#X############H#X####1####X",
  "X####.#########X#######X#X##T#X",
  "X############1################X",
  "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
];
const TOTAL_CASAS = MAPA_BASE.join("").split("H").length - 1;   // casas a saquear para abrir o templo
const SPR_TILE = { X: "arvore", "#": "mato", 1: "mato", 2: "mato", ".": "terra", H: "casa", h: "casa", T: "templo" };
const ICONES = { X: "🌳", "#": "🌿", 1: "🌿", 2: "🌿", H: "🏚️", h: "🏚️", T: "🏛️" };
const CLASSES = { X: "tree", "#": "grass", 1: "grass", 2: "grass", H: "house", h: "house explored", T: "temple" };
const DIR = { KeyW: [0, -1], KeyA: [-1, 0], KeyS: [0, 1], KeyD: [1, 0] };

let mapa, vistos, pos, casas = 0, derrotadas = 0, ajudaAberta = false, invertidoAte = 0, ocupado = false, fim = false;

function msg(t) { $("mapMsg").textContent = t; }

function iniciarJogo() {
  mapa = MAPA_BASE.map(l => l.split(""));
  vistos = mapa.map(l => l.map(() => false));   // memória do que já foi explorado
  mapa.forEach((l, y) => l.forEach((c, x) => { if (c === "P") { pos = [x, y]; l[x] = "."; } }));
  Object.assign(jogador, { hp: 100, hpMax: 100, damage: 10, cooldown: 900 });
  invertidoAte = 0; ocupado = false; fim = false; casas = 0; derrotadas = 0; ajuda(false);
  $("mapEnd").classList.remove("show");
  msg("Use W A S D para andar. Bata no mato alto para cortá-lo com a espada.");
  desenhar();
}

function desenhar() {
  const g = $("mapGrid");
  g.innerHTML = "";
  const alt = mapa.length, larg = mapa[0].length;
  // a "câmera" segue o jogador, sem passar das bordas do mapa
  const x0 = Math.max(0, Math.min(larg - VIEW_W, pos[0] - (VIEW_W >> 1)));
  const y0 = Math.max(0, Math.min(alt - VIEW_H, pos[1] - (VIEW_H >> 1)));
  for (let vy = 0; vy < VIEW_H; vy++) for (let vx = 0; vx < VIEW_W; vx++) {
    const x = x0 + vx, y = y0 + vy, c = mapa[y][x];
    const dx = x - pos[0], dy = y - pos[1];
    const visivel = dx * dx + dy * dy <= VISAO * VISAO;   // dentro do raio de visão
    if (visivel) vistos[y][x] = true;
    const d = document.createElement("div");
    if (!visivel && !vistos[y][x]) d.className = "tile fog";           // nunca visto: escuridão
    else {
      d.className = "tile " + (CLASSES[c] || "") + (visivel ? "" : " dim");   // já visto: escurecido
      const nome = (pos[0] === x && pos[1] === y) ? "jogador" : ((c === "T" && casas < TOTAL_CASAS) ? "templo_selado" : SPR_TILE[c]);
      d.style.backgroundImage = `url(${sprite(nome)})`; d.style.backgroundSize = "100% 100%";
    }
    g.appendChild(d);
  }
  minimapa();
  hud();
}

function hud() {
  const inv = performance.now() < invertidoAte;
  $("hud").innerHTML = `Vida ${jogador.hp}/${jogador.hpMax} · Dano ${jogador.damage} · Ataque ${jogador.cooldown}ms · Casas ${casas}/${TOTAL_CASAS}` +
    (inv ? ` <span class="inv">· controles invertidos</span>` : "");
}
setInterval(hud, 300);

function lutar(chave, aoVencer) {
  ocupado = true;
  iniciarCombate(chave, r => {
    ocupado = false;
    jogador.hp = r.hp;
    if (!r.vitoria) return fimJogo(false);
    derrotadas++;
    if (r.invertido) { invertidoAte = performance.now() + INVERT_MS; Som.sfx("veneno"); msg("O veneno embaralha seus passos!"); }
    aoVencer();
    desenhar();
  });
}

function mover([dx, dy]) {
  const x = pos[0] + dx, y = pos[1] + dy, c = mapa[y][x];
  if (c === "X") return;
  if (c === "#") { mapa[y][x] = "."; Som.sfx("corte"); msg("Você corta o mato alto."); }
  else if (c === "1" || c === "2") {
    mapa[y][x] = ".";
    Som.sfx("surge");
    msg("Uma cobra surge do mato!");
    lutar("s" + c, () => { jogador.hp = Math.min(jogador.hpMax, jogador.hp + HEAL_VITORIA); });
  } else if (c === "H") {
    lutar("s3", () => {
      mapa[y][x] = "h";
      jogador.damage += LOOT.damage;
      jogador.cooldown = Math.max(450, jogador.cooldown - LOOT.cooldown);
      jogador.hp = jogador.hpMax;
      casas++;
      Som.sfx("loot");
      msg(casas >= TOTAL_CASAS
        ? "Loot! O selo do templo se rompeu. O PYTHON espera lá dentro."
        : "Loot! Sua força e velocidade aumentaram e sua vida foi restaurada.");
    });
  } else if (c === "T") {
    if (casas < TOTAL_CASAS) { Som.sfx("trancado"); msg(`A porta do templo está selada. Saqueie as casas abandonadas (${casas}/${TOTAL_CASAS}).`);
    }
    else lutar("py", () => fimJogo(true));
  } else pos = [x, y];
  desenhar();
}

function fimJogo(vitoria) {
  fim = true;
  $("mapEndTxt").textContent = vitoria ? "O PYTHON caiu. A natureza respira de novo." : "Você caiu...";
  $("mapEndStats").textContent = `Serpentes derrotadas: ${derrotadas} · Casas saqueadas: ${casas}/${TOTAL_CASAS}`;
  $("mapEnd").classList.add("show");
}

addEventListener("keydown", e => {
  if ($("mapScreen").hidden || !$("combatScreen").hidden || ocupado || fim) return;
  if (e.code === "KeyH") { e.preventDefault(); ajuda(!ajudaAberta); return; }
  if (e.code === "Escape" && ajudaAberta) { ajuda(false); return; }
  if (ajudaAberta || !(e.code in DIR)) return;
  e.preventDefault();
  let d = DIR[e.code];
  if (performance.now() < invertidoAte) d = [-d[0], -d[1]];   // veneno inverte o movimento
  mover(d);
});
function ajuda(abrir) { ajudaAberta = abrir; $("ajuda").hidden = !abrir; }

// Mini-mapa: mostra só o que já foi explorado; o quadrado branco é você.
function minimapa() {
  const k = 7, cv = $("minimap"), alt = mapa.length, larg = mapa[0].length;
  cv.width = larg * k; cv.height = alt * k;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "#05090c"; ctx.fillRect(0, 0, cv.width, cv.height);
  const cor = { X: "#172b2a", "#": "#315b43", 1: "#315b43", 2: "#315b43", ".": "#4b5a3f", H: "#c98a3c", h: "#6b5a3c", T: "#e8d27a" };
  for (let y = 0; y < alt; y++) for (let x = 0; x < larg; x++) {
    if (!vistos[y][x]) continue;
    ctx.fillStyle = cor[mapa[y][x]] || "#4b5a3f";
    ctx.fillRect(x * k, y * k, k, k);
  }
  ctx.fillStyle = "#fff"; ctx.fillRect(pos[0] * k - 1, pos[1] * k - 1, k + 2, k + 2);
}

$("helpBtn").onclick = () => ajuda(!ajudaAberta);
$("helpClose").onclick = () => ajuda(false);
$("mapRestart").onclick = () => { iniciarJogo(); Som.musica("mapa"); };
$("mapTitle").onclick = () => { iniciarJogo(); Som.musica(null); voltarAoTitulo(); };
iniciarJogo();