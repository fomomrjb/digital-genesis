/* ===========================================================
   DIGITAL GENESIS — state.js
   Player data, levels, unlocks, money, save/load
   =========================================================== */
'use strict';

const SAVE_KEY = 'digitalgenesis_ch1_save_v1';

/* XP needed to reach level n (cumulative) */
function xpFor(lv) { return Math.round(28 * Math.pow(lv - 1, 1.72)); }

const G = {   // global game state
  /* --- identity / progression --- */
  lv: 1, xp: 0, money: 420,
  hp: 60, hpMax: 60,
  ce: 999, ceMax: 999,            // cursed energy: effectively infinite
  atk: 14, def: 3, spd: 7,
  unlocked: {},                   // abilityId -> true
  seenUnlock: {},
  equippedSkin: 'default',
  ownedSkins: { default: true },
  ownedEmotes: { wave: true },
  equippedEmotes: ['wave', null, null, null, null, null],
  items: { 'snack': 3, 'battery': 1 },
  /* --- story --- */
  chapter: 1, scene: 'title', mission: 0,
  flags: {},
  completed: {},                  // mission id -> true
  challenges: {},                 // orange challenge id -> best
  codex: {},                      // lore entries found
  /* --- meta --- */
  playtime: 0, deaths: 0, blackFlashes: 0, orangeFlashes: 0,
  domainsUsed: 0, battlesWon: 0, maxCombo: 0, perfectDodges: 0,
  /* --- cheats / admin --- */
  god: false, noclip: false, oneShot: false, infiniteDomain: false,
  speedMult: 1, dmgMult: 1, showHitbox: false, allUnlocked: false,
  /* --- settings --- */
  musicVol: .34, sfxVol: .42, textSpeed: 1, scanlines: true,

  /* ---------- derived ---------- */
  has(id) { return !!(this.unlocked[id] || this.allUnlocked); },
  atkTotal() { return Math.round(this.atk * this.dmgMult); },   // atk already grows +2 per level
  defTotal() { return Math.round(this.def * (1 + (this.lv - 1) * .1)); },

  /* ---------- xp / level ---------- */
  gainXP(n) {
    this.xp += n;
    const ups = [];
    while (this.lv < 40 && this.xp >= xpFor(this.lv + 1)) {
      this.lv++;
      this.hpMax += 7 + Math.floor(this.lv / 3);
      this.hp = this.hpMax;
      this.atk += 2; this.def += 1; if (this.lv % 2 === 0) this.spd += 1;
      ups.push(this.lv);
    }
    return ups;
  },
  gainMoney(n) { this.money = Math.max(0, this.money + n); },
  heal(n) { this.hp = clamp(this.hp + n, 0, this.hpMax); },
  fullHeal() { this.hp = this.hpMax; },

  unlock(id) {
    if (this.unlocked[id]) return false;
    this.unlocked[id] = true; return true;
  },

  /* ---------- save / load ---------- */
  save(slot = SAVE_KEY) {
    try {
      const d = {};
      ['lv','xp','money','hp','hpMax','ce','ceMax','atk','def','spd','unlocked','seenUnlock',
       'equippedSkin','ownedSkins','ownedEmotes','equippedEmotes','items','chapter','scene',
       'mission','flags','completed','challenges','codex','playtime','deaths','blackFlashes',
       'orangeFlashes','domainsUsed','battlesWon','maxCombo','perfectDodges','musicVol','sfxVol',
       'textSpeed','scanlines'].forEach(k => d[k] = this[k]);
      d._v = 1; d._saved = Date.now();
      localStorage.setItem(slot, JSON.stringify(d));
      return true;
    } catch (e) { return false; }
  },
  load(slot = SAVE_KEY) {
    try {
      const raw = localStorage.getItem(slot); if (!raw) return false;
      const d = JSON.parse(raw);
      Object.keys(d).forEach(k => { if (k[0] !== '_' && k in this) this[k] = d[k]; });
      Audio.setMusicVol(this.musicVol); Audio.setSfxVol(this.sfxVol);
      return true;
    } catch (e) { return false; }
  },
  hasSave(slot = SAVE_KEY) { try { return !!localStorage.getItem(slot); } catch (e) { return false; } },
  wipe(slot = SAVE_KEY) { try { localStorage.removeItem(slot); } catch (e) {} },
  saveInfo(slot = SAVE_KEY) {
    try {
      const d = JSON.parse(localStorage.getItem(slot));
      return d ? { lv: d.lv, mission: d.mission, playtime: d.playtime || 0, money: d.money } : null;
    } catch (e) { return null; }
  },

  reset() {
    const fresh = {
      lv: 1, xp: 0, money: 420, hp: 60, hpMax: 60, ce: 999, ceMax: 999, atk: 14, def: 3, spd: 7,
      unlocked: {}, seenUnlock: {}, equippedSkin: 'default', ownedSkins: { default: true },
      ownedEmotes: { wave: true }, equippedEmotes: ['wave', null, null, null, null, null],
      items: { snack: 3, battery: 1 }, chapter: 1, mission: 0, flags: {}, completed: {},
      challenges: {}, codex: {}, playtime: 0, deaths: 0, blackFlashes: 0, orangeFlashes: 0,
      domainsUsed: 0, battlesWon: 0, maxCombo: 0, perfectDodges: 0,
      god: false, noclip: false, oneShot: false, infiniteDomain: false,
      speedMult: 1, dmgMult: 1, showHitbox: false, allUnlocked: false
    };
    Object.assign(this, fresh);
    ABILITIES.forEach(a => { if (a.lv <= 1) this.unlocked[a.id] = true; });
  }
};

function timeStr(sec) {
  const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = Math.floor(sec % 60);
  return (h ? h + ':' : '') + String(m).padStart(h ? 2 : 1, '0') + ':' + String(s).padStart(2, '0');
}
