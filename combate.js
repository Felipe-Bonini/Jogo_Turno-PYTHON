/* ===== CONFIGURAÇÕES (mexa aqui para balancear o jogo) ===== */
const CFG = {
  STREAK_GUARANTEED: 8,   // defesas certas seguidas sem atacar => dano garantido
  ULT_PER_HIT: 12,        // carga da ultimate por ataque que acerta
  ULT_PER_DEFENSE: 6,     // carga da ultimate por defesa certa
  ULT_DURATION: 8000,     // duração da ultimate (ms)
  ULT_MULT: 2,            // multiplicador de dano na ultimate
  WINDOW: 30,             // tolerância de acerto da nota (px)
  POISON_TICKS: 5, POISON_DMG: 3
};
const jogador = { hp: 100, hpMax: 100, damage: 10, cooldown: 900 };   // cooldown = velocidade de ataque (ms)
const ENEMIES = {
  s1: { name: "Serpente 1",        sprite: "cobra1", hp: 60,  damage: 6,  interval: 1400, speed: 180, poison: false },
  s2: { name: "Serpente 2 (veneno)", sprite: "cobra2", hp: 60,  damage: 6,  interval: 1300, speed: 190, poison: true  },
  s3: { name: "Serpente 3 (casas)", sprite: "cobra3", hp: 110, damage: 12, interval: 850,  speed: 260, poison: false },
  py: { name: "PYTHON",            sprite: "python", hp: 360, damage: 18, interval: 600, speed: 310, poison: false,
          summons: [{ at: 0.7, key: "s1" }, { at: 0.4, key: "s2" }] }   // invocações do boss
};
/* interval = tempo entre notas; speed = velocidade da nota (px/s). Mais forte = mais rápido. */

const $ = id => document.getElementById(id);
// Cada tecla aponta para uma pista: 0 = ←, 1 = ↑, 2 = ↓, 3 = →
const LANE_KEYS = { ArrowLeft: 0, ArrowUp: 1, ArrowDown: 2, ArrowRight: 3,
                    KeyA: 0,      KeyW: 1,    KeyS: 2,      KeyD: 3 };
const LANE_ICON = ["←", "↑", "↓", "→"];
const TRACK_H = 300, LINE_Y = 248, NOTE_H = 34;
let E, s;


function iniciarCombate(key, aoTerminar) {
  E = ENEMIES[key];
  Som.sfx("luta"); Som.musica(E.sprite === "python" ? "boss" : "combate");
  $("mapScreen").hidden = true; $("combatScreen").hidden = false;
  document.querySelectorAll(".note").forEach(n => n.remove());
  const now = performance.now();
  s = { php: jogador.hp, cb: aoTerminar, minion: null, doneSummon: [], pausado: false, pausaIni: 0, raf: 0, ehp: E.hp, ult: 0, ultOn: false, ultEnd: 0, streak: 0,
        lastAtk: -1e9, notes: [], nextNote: now + 1000, last: now,
        poisonTicks: 0, nextTick: 0, mapInverted: false, over: false };
  $("eName").textContent = E.name;
  setSprite("eSprite", E.sprite); setSprite("pSprite", "jogador");
  $("end").classList.remove("show");
  $("log").textContent = "Defenda com as setas ou W A S D quando a nota cruzar a linha dourada.";
  $("pauseBox").classList.remove("show");
  render();
  s.raf = requestAnimationFrame(loop);
}

function spawn(src) {
  const lane = Math.floor(Math.random() * 4);
  const el = document.createElement("div");
  el.className = "note" + (src === E ? "" : " minion");
  el.style.left = lane * 25 + "%";
  el.textContent = LANE_ICON[lane];
  $("track").appendChild(el);
  s.notes.push({ lane, y: -NOTE_H, el, dmg: src.damage, speed: src.speed, poison: src.poison, minion: src !== E });
}

function setSprite(id, nome) {
  $(id).innerHTML = '<img alt="" class="' + (nome === "python" ? "boss" : "") + '" src="' + sprite(nome) + '">';
}

function flash(id) { const e = $(id); e.classList.add("hit"); setTimeout(() => e.classList.remove("hit"), 120); }

function hurtPlayer(n, msg) {
  Som.sfx(msg ? "dano" : "tick");
  s.php = Math.max(0, s.php - n);
  flash("pSprite");
  if (msg) $("log").textContent = msg;
  if (s.php <= 0) finish(false);
}

function hurtEnemy(n) {
  s.ehp = Math.max(0, s.ehp - n);
  flash("eSprite");
  if (s.ehp <= 0) finish(true);
}

function invocar(i, t) {
  const m = E.summons[i], base = ENEMIES[m.key];
  s.doneSummon[i] = true;
  s.minion = { name: base.name, hp: base.hp, hpMax: base.hp, damage: base.damage,
               interval: base.interval, speed: base.speed, poison: base.poison, nextNote: t + 800 };
  Som.sfx("invoca");
  $("log").textContent = "O " + E.name + " invoca a " + base.name + "! Derrote-a primeiro.";
}

// Enquanto houver serpente invocada, ela é o alvo do seu ataque (o boss fica protegido).
function hurtTarget(n) {
  if (!s.minion) return hurtEnemy(n);
  s.minion.hp = Math.max(0, s.minion.hp - n);
  if (s.minion.hp <= 0) {
    s.minion = null;
    s.notes = s.notes.filter(x => { if (x.minion) x.el.remove(); return !x.minion; });
    Som.sfx("morte");
    $("log").textContent = "A serpente invocada caiu! O alvo volta a ser o boss.";
  }
}

function addUlt(n) { if (!s.ultOn) s.ult = Math.min(100, s.ult + n); }

function attack(t) {
  if (s.over) return;
  const cd = jogador.cooldown * (s.ultOn ? 0.5 : 1);
  if (t - s.lastAtk < cd) return;
  s.lastAtk = t;
  Som.sfx("ataque");
  s.streak = 0;                              // atacar zera a sequência de defesas
  hurtTarget(jogador.damage * (s.ultOn ? CFG.ULT_MULT : 1));
  addUlt(CFG.ULT_PER_HIT);
  $("log").textContent = "Você acertou a serpente!";
}

function ultimate(t) {
  if (s.over || s.ult < 100 || s.ultOn) return;
  s.ultOn = true; s.ult = 100; s.ultEnd = t + CFG.ULT_DURATION;
  Som.sfx("ultimate");
  $("eye").classList.add("snake");           // animação: olho humano -> olho de serpente
  setSprite("pSprite", "jogador_ult");         // espada "maleável"
  $("log").textContent = "O olho muda. A espada se move como uma serpente!";
}

function defend(lane, t) {
  if (s.over) return;
  const hit = s.notes.find(n => n.lane === lane && Math.abs(n.y + NOTE_H / 2 - LINE_Y) <= CFG.WINDOW);
  if (!hit) { Som.sfx("erro"); return; }
  hit.el.remove(); s.notes.splice(s.notes.indexOf(hit), 1);
  s.streak++;
  Som.sfx("defesa");
  addUlt(CFG.ULT_PER_DEFENSE);
  $("log").textContent = "Defesa perfeita!";
  if (s.streak >= CFG.STREAK_GUARANTEED) {   // não atacou: dano garantido
    s.streak = 0;
    Som.sfx("quebra");
    hurtPlayer(E.damage, "A serpente quebra sua guarda! Ataque mais!");
  }
}

function finish(win) {
  s.over = true;
  Som.musica(null);
  Som.sfx(win ? (E.sprite === "python" ? "vitoria" : "vitoriaLuta") : "derrota");
  $("endTxt").textContent = win ? "Vitória!" + (s.poisonTicks ? "" : "") : "Você caiu...";
  $("end").classList.add("show");
}

function render() {
  $("minionBox").hidden = !s.minion;
  if (s.minion) { $("mName").textContent = "🐍 " + s.minion.name + " (invocada)"; $("mHp").style.width = s.minion.hp / s.minion.hpMax * 100 + "%"; }
  $("pHp").style.width = s.php / jogador.hpMax * 100 + "%";
  $("eHp").style.width = s.ehp / E.hp * 100 + "%";
  $("ultBar").style.width = s.ult + "%";
  $("ultBtn").disabled = s.ult < 100 || s.ultOn;
  $("streakTxt").textContent = "Defesas seguidas: " + s.streak + "/" + CFG.STREAK_GUARANTEED;
  $("status").textContent = s.poisonTicks ? "Envenenado! Controles do mapa invertidos depois do duelo." : (s.mapInverted ? "Controles do mapa invertidos." : "");
  const cd = jogador.cooldown * (s.ultOn ? 0.5 : 1);
  $("cdBar").style.width = Math.min(100, (performance.now() - s.lastAtk) / cd * 100) + "%";
}

// Pausa: ao retomar, empurramos todos os temporizadores pelo tempo parado.
function pausar(on) {
  if (s.over || on === s.pausado) return;
  const t = performance.now();
  Som.sfx("pausa");
  if (on) {
    s.pausado = true; s.pausaIni = t;
    cancelAnimationFrame(s.raf);
    $("pauseBox").classList.add("show");
  } else {
    const d = t - s.pausaIni;
    s.pausado = false;
    s.nextNote += d; s.lastAtk += d; s.ultEnd += d; s.nextTick += d;
    if (s.minion) s.minion.nextNote += d;
    s.last = t;
    $("pauseBox").classList.remove("show");
    s.raf = requestAnimationFrame(loop);
  }
}

function loop(t) {
  if (s.over || s.pausado) return;
  const dt = (t - s.last) / 1000; s.last = t;

  if (!s.minion && E.summons) {
    const i = E.summons.findIndex((m, k) => !s.doneSummon[k] && s.ehp / E.hp <= m.at);
    if (i >= 0) invocar(i, t);
  }
  if (s.minion && t >= s.minion.nextNote) {
    spawn(s.minion);
    s.minion.nextNote = t + s.minion.interval * (0.8 + Math.random() * 0.4);
  }
  if (t >= s.nextNote) { spawn(E); s.nextNote = t + E.interval * (0.8 + Math.random() * 0.4); }

  s.notes = s.notes.filter(n => {
    n.y += n.speed * dt;
    n.el.style.top = n.y + "px";
    if (n.y + NOTE_H / 2 > LINE_Y + CFG.WINDOW) {   // passou sem defender
      n.el.remove();
      s.streak = 0;
      hurtPlayer(n.dmg, "A serpente te acertou!");
      if (n.poison && !s.over) { s.poisonTicks = CFG.POISON_TICKS; s.nextTick = t + 1000; s.mapInverted = true; Som.sfx("veneno"); }
      return false;
    }
    return true;
  });

  if (s.poisonTicks && t >= s.nextTick) { s.poisonTicks--; s.nextTick = t + 1000; hurtPlayer(CFG.POISON_DMG); }

  if (s.ultOn && t >= s.ultEnd) {
    s.ultOn = false; s.ult = 0; Som.sfx("ultFim");
    $("eye").classList.remove("snake"); setSprite("pSprite", "jogador");
  }
  if (s.ultOn) s.ult = Math.max(0, (s.ultEnd - t) / CFG.ULT_DURATION * 100);

  render();
  if (!s.over) s.raf = requestAnimationFrame(loop);
}

addEventListener("keydown", e => {
  if (!s || $("combatScreen").hidden) return;
  const t = performance.now();
  if (e.code === "KeyP" || e.code === "Escape") { e.preventDefault(); pausar(!s.pausado); return; }
  if (s.pausado) return;
  if (e.code in LANE_KEYS) { e.preventDefault(); defend(LANE_KEYS[e.code], t); }
  else if (e.code === "Space") { e.preventDefault(); attack(t); }
  else if (e.code === "KeyQ") ultimate(t);
});
$("atkBtn").onclick = () => attack(performance.now());
$("pauseBtn").onclick = () => pausar(true);
$("resumeBtn").onclick = () => pausar(false);
$("ultBtn").onclick = () => ultimate(performance.now());
$("again").onclick = () => {
  if (s.ehp <= 0 && E.sprite !== "python") Som.musica("mapa");
  $("combatScreen").hidden = true; $("mapScreen").hidden = false;
  s.cb({ vitoria: s.ehp <= 0, hp: s.php, invertido: s.mapInverted });
};