/* ===== SPRITES (pixel art) =====
   Cada sprite é uma grade de letras; cada letra é uma cor da PALETA ('.' = transparente).
   Para usar uma arte sua no lugar de um sprite, salve o PNG na pasta img/ e liste aqui, por exemplo:
   const SPRITES_PNG = { jogador: "img/jogador.png", cobra1: "img/cobra1.png" };
   Os PNGs com o desenho atual já estão na pasta img/ para você editar. */
const SPRITES_PNG = {};
const PALETA = {"k": "#080d11", "n": "#172b2a", "g": "#315b43", "G": "#4e8a55", "l": "#9fcf69", "m": "#4b5a3f", "M": "#5f7048", "b": "#6b4a2f", "B": "#9a6b3f", "s": "#e0b48a", "w": "#f4edcf", "y": "#e8b53a", "r": "#d8604a", "R": "#8f3a2c", "p": "#7a5aa0", "P": "#a98bd0", "d": "#2f3d3a", "D": "#5b6b5c", "S": "#b8c5a3", "o": "#c98a3c", "O": "#e8d27a", "t": "#1f6f6a", "T": "#2f9a8e", "u": "#0f4a46", "q": "#5a2a1e"};
const SPRITES = {
  jogador: [".....kkkkkk.....", "....kbbbbbbk..k.", "....kbbbbbbk.kSk", "....kssssssk.kwk", "....kskssysk.kwk", "....kssssksk.kwk", "....kssRRssk.kwk", "...kggggggggkkSk", "..kggggggggggkSk", "..kggggggggggooo", "..kgbbbbbbbbgkbk", "..ksggggggggskbk", "...kggggggggk.k.", "....kddkkddk....", "....kddkkddk....", "...kbbbkkbbbk..."],
  jogador_ult: [".....kkkkkk..kk.", "....kbbbbbbkkGGk", "....kbbbbbbk.kGl", "....ksssssskkGGk", "....ksyssysk.kGl", "....ksksskskkGGk", "....kssRRssk.kGl", "...kggggggggkGGk", "..kgggglgggggkGl", "..kggglglggggooo", "..kgbbbbbbbbgkbk", "..ksggggggggskbk", "...kggggggggk.k.", "....kddkkddk....", "....kddkkddk....", "...kbbbkkbbbk..."],
  cobra1: [".....kkkkkk.....", "....kllllllk....", "...klyGGGGylk...", "...kGkGGGGkGk...", "...kgGkkkkGgk...", "....kgwGGwgk....", ".....kGrrGk.....", ".....krGGrk.....", "...kkkGGGGkkk...", "..kgllGgGGlggk..", ".kgGGGgGGGgGGgk.", ".kgGGgGGGgGGGgk.", ".kGGggGGgGgggGk.", "klGgGGGgGGGgGGlk", "kggGGGgGGGgGGggk", ".kkggggggggggkk."],
  cobra2: [".....kkkkkk.....", "....kPPPPPPk....", "...kPyppppyPk...", "...kpkppppkpk...", "...kdpkkkkpdk...", "....kdwppwdk....", ".....klrrpk.....", ".....klpprk.....", "...kkkppppkkk...", "..klPPplppPldk..", ".klppplppplppdk.", ".kdpplppplppplk.", ".kppldpplpddlpk.", "kPplppplppplppPk", "kdlppplppplppdlk", ".kkddldddldddkk."],
  cobra3: [".....kkkkkk.....", "....kOOOOOOk....", "...kOyrrrryOk...", "...krkrrrrkrk...", "...kRrkkkkrRk...", "....kRwrrwRk....", ".....krrrrk.....", ".....krrrrk.....", "...kkkrrrrkkk...", "..kOOOrOrrOORk..", ".kOrrrOrrrOrrRk.", ".kRrrOrrrOrrrOk.", ".krrORrrOrRROrk.", "kOrOrrrOrrrOrrOk", "kROrrrOrrrOrrROk", ".kkRRORRRORRRkk."],
  python: [".........k..kOkOOkOk..k.........", "........kOk.kOkkkkOk.kOk........", "........kOkkTTTTTTTTkkOk........", ".........kTTttttttttTTk.........", "........kTttttttttttttTk........", ".......kTttttttttttttttTk.......", "......kTttrrttttttttrrttTk......", "......ktttkttttttttttktttk......", "......kuttttttttttttttttuk......", ".......kuttttttttttttttuk.......", "........kutkkkkkkkkkktuk........", ".........kuwttttttttwuk.........", "..........kwtttrrtttwk..........", "..........kktttrrtttkk..........", "........kkuTttrttrttTukk........", ".......kTTttttttttttttTTk.......", "......kTttOtttttOtttttOtTk......", "......kuOtttttOtttttOtttuk......", "......kkuuttOtttttOtttuukk......", "....kkuTttOuuuuuOuuuuuOtTukk....", "...kuTttOtttttOtttttOtttttOuk...", "...kttOtttttOtttttOtttttOtttk...", "...kOtttttOtttttOtttttOtttttk...", "...kuuttOtttttOtttttOtttttOuk...", "...kktOuuuttOtttttOtttuuOutkk...", ".kkTOtttttOuuuuuOuuuuuOttttTOkk.", "kTOtttttOtttttOtttttOtttttOttTTk", "ktttttOtttttOtttttOtttttOtttttOk", "kuutOtttttOtttttOtttttOtttttOuuk", ".kkuutttOtttttOtttttOtttttOuukk.", "...kkuOuuuttOtttttOtttuuOuukk...", ".....kkkkkOuuuuuOuuuuukkkkk....."],
  mato: ["gggggggglggggggg", "gglgggggGggggglg", "ggGgggggGgggggGg", "ggGgggggGgglggGg", "ggGgggglGggGggGg", "ggGlgggGgggGggGg", "gggGgggGgggGgggl", "gggGgggGgggGgggG", "gggGgggGglgggggG", "glgGgggggGggglgG", "gGggglgggGgggGgG", "gGgggGgggGgggGgg", "gGgggGgggGlglGgg", "gGggglggggGgGGgg", "gggggGggggGgGggg", "gggggGggggGgGggg"],
  terra: ["MmmmmmmmmmmmmMmm", "mmmMmmmmmmmmmmmm", "mmmmmmMmmmmmmmmm", "mmmmmmmmmMmmmmmm", "mmmmmmmmmmmmMmmm", "mmMmmmmmmmmmmmmM", "mmmmmMmmmmmmmmmm", "mmmmmmmmMmmmmmmm", "mmmmmmmmmmmMmmmm", "mMmmmmmmmmmmmmMm", "mmmmMmmmmmmmmmmm", "mmmmmmmMmmmmmmmm", "mmmmmmmmmmMmmmmm", "MmmmmmmmmmmmmMmm", "mmmMmmmmmmmmmmmm", "mmmmmmMmmmmmmmmm"],
  arvore: ["nnnnnnnnnnnnnnnn", "nnnnnnggggnnnnnn", "nnnngggglgggnnnn", "nnnglGGGGggggnnn", "nngGGGGGGGggggnn", "nngGGGGGGGlgggnn", "nnggGGGGGgggggnn", "nnggglggggggggnn", "nnggggggggggggnn", "nnnggggggggggnnn", "nnnnggggggggnnnn", "nnnnnnggggnnnnnn", "nnnnnnnbbnnnnnnn", "nnnnnnnbbnnnnnnn", "nnnnnnnbbnnnnnnn", "nnnnnnnnnnnnnnnn"],
  casa: ["MmmmmmmmmmmmmMmm", "mmmMmkkkkkkmmmmm", "mmmmkRRRRRRkmmmm", "mmmkRRRRRRRRkmmm", "mmkRGRnnRRRRRkmm", "mkRGRRRRRnRRRRkM", "kRRRRRRRRRRGRRRk", "mkGGDDDDDDDDGDkm", "mklDDDDDDDDDDDkm", "mkgDyyDDDDDkDDkm", "mklDyyDkkkDDkDkm", "mkgDDDDkkkDDDDkm", "mklDDDDkkkDDDDkm", "MkgDDDDkkkDDDDkm", "mkDDDDDkkkDDDDkm", "mmkkkkkkkkkkkkmm"],
  templo: ["MmmmmmmkkmmmmMmm", "mmmMmkkOOkkmmmmm", "mmmkkOOOOOOkkmmm", "mmkOOOOOOOOOOkmm", "mkSSSSSSSSSgSSkm", "mkSggSSSSSSSgSkM", "mmkSDkkkkkkSDkmm", "mmklDkkkkkkSDkmm", "mmkSDkkkkkkSgkmm", "mMkgDkkkkkkSDkMm", "mmkSDkkkkkklDkmm", "mmkSDkkkkkkSDkmm", "mklSSSSSSSSSSSkm", "kDDDDDDDDDDDDDDk", "kDDDDDDDDDDDDDDk", "mkkkkkkkkkkkkkkm"],
  templo_selado: ["MmmmmmmkkmmmmMmm", "mmmMmkkOOkkmmmmm", "mmmkkOOOOOOkkmmm", "mmkOOOOOOOOOOkmm", "mkSSSSSSSSSgSSkm", "mkSggSSSSSSSgSkM", "mmkSDkkSSkkSDkmm", "mmklDkSkkSkSDkmm", "mmkSDkOOOOkSgkmm", "mMkgDkOkkOkSDkMm", "mmkSDkOkOOklDkmm", "mmkSDkOOOOkSDkmm", "mklSSSSSSSSSSSkm", "kDDDDDDDDDDDDDDk", "kDDDDDDDDDDDDDDk", "mkkkkkkkkkkkkkkm"]
};

const _cacheSprites = {};
function sprite(nome) {
  if (SPRITES_PNG[nome]) return SPRITES_PNG[nome];
  if (_cacheSprites[nome]) return _cacheSprites[nome];
  const g = SPRITES[nome], cv = document.createElement("canvas");
  cv.width = g[0].length; cv.height = g.length;
  const ctx = cv.getContext("2d");
  g.forEach((linha, y) => [...linha].forEach((ch, x) => { if (ch !== ".") { ctx.fillStyle = PALETA[ch]; ctx.fillRect(x, y, 1, 1); } }));
  return (_cacheSprites[nome] = cv.toDataURL());
}
