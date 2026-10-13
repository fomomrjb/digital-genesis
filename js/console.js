/* ===========================================================
   DIGITAL GENESIS — console.js
   "/" opens a command chat. /admin opens the Sandbox dev panel.
   =========================================================== */
'use strict';

const el = id => document.getElementById(id);

const ChatConsole = {
  open: false, hist: [], histIdx: -1,

  init() {
    const inp = el('chatinput');
    inp.addEventListener('keydown', e => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        const v = inp.value.trim(); inp.value = '';
        if (v) { this.hist.push(v); this.histIdx = this.hist.length; this.run(v); }
        else this.hide();
      } else if (e.key === 'Escape') { this.hide(); }
      else if (e.key === 'ArrowUp') {
        if (this.histIdx > 0) { this.histIdx--; inp.value = this.hist[this.histIdx] || ''; }
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        if (this.histIdx < this.hist.length - 1) { this.histIdx++; inp.value = this.hist[this.histIdx] || ''; }
        else { this.histIdx = this.hist.length; inp.value = ''; }
        e.preventDefault();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const v = inp.value.replace(/^\//, '');
        const m = Object.keys(CMDS).filter(k => k.startsWith(v));
        if (m.length === 1) inp.value = '/' + m[0] + ' ';
        else if (m.length) this.log('  ' + m.join('  '), 'dim');
      }
    });
    el('apClose').addEventListener('click', () => AdminPanel.hide());
    this.log('DIGITAL GENESIS console. Type /help. (Orange has admin. Orange should not have admin.)', 'sys');
  },
  show() {
    this.open = true; Input.clear();
    el('chatoverlay').classList.remove('hidden');
    el('chatinput').value = ''; el('chatinput').focus();
    Audio.init(); Audio.sfx('blip');
  },
  hide() {
    this.open = false;
    el('chatoverlay').classList.add('hidden');
    el('chatinput').blur(); cv.focus();
  },
  log(s, cls = '') {
    const d = document.createElement('div');
    if (cls) d.className = cls;
    d.textContent = s;
    const lg = el('chatlog');
    lg.appendChild(d); lg.scrollTop = lg.scrollHeight;
    while (lg.children.length > 200) lg.removeChild(lg.firstChild);
  },
  ok(s) { this.log('✓ ' + s, 'ok'); },
  err(s) { this.log('✗ ' + s, 'err'); },

  run(line) {
    this.log('> ' + line, 'cmd');
    const raw = line.replace(/^\//, '');
    const parts = raw.split(/\s+/);
    const cmd = (parts.shift() || '').toLowerCase();
    const fn = CMDS[cmd];
    if (!fn) {
      // not a command: Orange hears you
      const near = Object.keys(CMDS).filter(k => k.startsWith(cmd.slice(0, 3)));
      this.err('Unknown command: ' + cmd + (near.length ? '  (did you mean /' + near.join(' /') + '?)' : ''));
      return;
    }
    try { fn(parts, this); } catch (e) { this.err('error: ' + e.message); }
  }
};

/* ---------- command table ---------- */
const CMDS = {
  help(a, c) {
    c.log('--- PLAYER ---', 'sys');
    c.log('/heal [n]  /stats  /save  /load  /skins  /emotes  /skin <id>  /emote <id>  /give <item> [n]');
    c.log('--- ADMIN ---', 'sys');
    c.log('/admin  /god  /noclip  /oneshot  /allunlock  /unlock <id|all>  /lv <n>  /xp <n>  /money <n>');
    c.log('/tp <area>  /areas  /battle <enemy>  /enemies  /domain <sandbox|void404>  /bf  /of');
    c.log('/speed <x>  /dmg <x>  /hitbox  /music <id>  /mute  /kill  /die  /mission <n>  /flag <k> [v]');
    c.log('/codex  /reset  /clear  /orange  /time');
    c.log('Tab completes. Up/Down for history. Esc closes.', 'dim');
  },
  heal(a, c) {
    const n = a[0] ? +a[0] : 0;
    if (n) G.heal(n); else G.fullHeal();
    c.ok('HP = ' + G.hp + '/' + G.hpMax);
    Audio.sfx('heal'); Toast.show('HEALED', PAL.green);
  },
  god(a, c) { G.god = a[0] ? a[0] === 'on' : !G.god; c.ok('god mode ' + (G.god ? 'ON' : 'OFF')); Toast.show('GOD ' + (G.god ? 'ON' : 'OFF'), PAL.pink); },
  noclip(a, c) { G.noclip = !G.noclip; c.ok('noclip ' + (G.noclip ? 'ON' : 'OFF')); Toast.show('NOCLIP ' + (G.noclip ? 'ON' : 'OFF'), PAL.pink); },
  oneshot(a, c) { G.oneShot = !G.oneShot; c.ok('one-shot ' + (G.oneShot ? 'ON' : 'OFF')); Toast.show('1-HIT ' + (G.oneShot ? 'ON' : 'OFF'), PAL.pink); },
  allunlock(a, c) {
    G.allUnlocked = !G.allUnlocked;
    if (G.allUnlocked) ABILITIES.forEach(x => G.unlocked[x.id] = true);
    c.ok('all techniques ' + (G.allUnlocked ? 'UNLOCKED' : 'back to normal'));
    Toast.show('ALL TECHNIQUES ' + (G.allUnlocked ? 'ON' : 'OFF'), PAL.cyan);
  },
  unlock(a, c) {
    const id = (a[0] || '').toLowerCase();
    if (id === 'all') { ABILITIES.forEach(x => G.unlocked[x.id] = true); c.ok('unlocked everything'); return; }
    const ab = AB[id];
    if (!ab) { c.err('no such technique. ids: ' + ABILITIES.map(x => x.id).join(' ')); return; }
    G.unlocked[ab.id] = true; Audio.sfx('unlock');
    Toast.show('UNLOCKED: ' + ab.name, ab.col, 3);
    c.ok('unlocked ' + ab.name);
  },
  lock(a, c) { const ab = AB[a[0]]; if (!ab) return c.err('no such id'); delete G.unlocked[ab.id]; c.ok('locked ' + ab.name); },
  lv(a, c) {
    const n = clamp(parseInt(a[0] || '1', 10) || 1, 1, 40);
    G.lv = 1; G.xp = 0; G.hpMax = 60; G.atk = 9; G.def = 3; G.spd = 7;
    const ups = G.gainXP(xpFor(n));
    ABILITIES.forEach(ab => { if (ab.lv <= G.lv) G.unlocked[ab.id] = true; });
    c.ok('level = ' + G.lv + '  (abilities for LV' + G.lv + ' unlocked)');
    Toast.show('LV ' + G.lv, PAL.orange);
  },
  xp(a, c) { const n = +a[0] || 0; const ups = G.gainXP(n); if (ups.length) LevelUp.trigger(ups); c.ok('xp = ' + G.xp); },
  money(a, c) { const n = +a[0]; if (isNaN(n)) return c.err('/money <n>'); G.money = Math.max(0, n); c.ok('$' + fmt(G.money)); Audio.sfx('coin'); },
  give(a, c) {
    const k = a[0], n = +a[1] || 1;
    if (!ITEMS[k]) return c.err('items: ' + Object.keys(ITEMS).join(' '));
    G.items[k] = (G.items[k] || 0) + n; c.ok('+' + n + ' ' + ITEMS[k].name);
    Toast.show('GOT ' + ITEMS[k].name + ' x' + n, PAL.cyan);
  },
  skins(a, c) { c.log(Object.keys(SKINS).map(k => k + (G.ownedSkins[k] ? '*' : '')).join('  ')); c.log('* = owned', 'dim'); },
  skin(a, c) {
    const k = a[0];
    if (!SKINS[k]) return c.err('skins: ' + Object.keys(SKINS).join(' '));
    giveSkin(k); G.equippedSkin = k; c.ok('equipped ' + SKINS[k].name);
  },
  emotes(a, c) { c.log(Object.keys(EMOTES).map(k => k + (G.ownedEmotes[k] ? '*' : '')).join('  ')); },
  emote(a, c) {
    const k = a[0];
    if (!EMOTES[k]) return c.err('emotes: ' + Object.keys(EMOTES).join(' '));
    giveEmote(k); playEmote(k); c.ok('performing ' + EMOTES[k].name);
  },
  giveall(a, c) {
    Object.keys(SKINS).forEach(giveSkin); Object.keys(EMOTES).forEach(giveEmote);
    c.ok('granted every skin and emote');
  },
  areas(a, c) { c.log(Object.keys(AREAS).join('  ')); },
  tp(a, c) {
    const k = a[0];
    if (!AREAS[k]) return c.err('areas: ' + Object.keys(AREAS).join(' '));
    c.hide(); Audio.sfx('teleport');
    Fade.out(() => { Game.toOverworld(k); Fade.in(); }, 4);
    c.ok('teleporting to ' + AREAS[k].name);
  },
  enemies(a, c) { c.log(Object.keys(ENEMIES).join('  ')); },
  battle(a, c) {
    const k = a[0];
    if (!ENEMIES[k]) return c.err('enemies: ' + Object.keys(ENEMIES).join(' '));
    c.hide(); Game.battle(k, { bg: Over.area ? Over.area.bg : 'city', canFlee: true });
    c.ok('spawning ' + ENEMIES[k].name);
  },
  spawn(a, c) { CMDS.battle(a, c); },
  domain(a, c) {
    const k = a[0] || 'sandbox';
    const d = DOMAINS[k];
    if (!d) return c.err('domains: ' + Object.keys(DOMAINS).join(' '));
    c.hide();
    if (Battle.active) {
      const ab = ABILITIES.find(x => x.domain === k) || { domain: k };
      G.unlocked[ab.id] = true; Battle.openDomain(ab);
    } else {
      FX.domainExpansion(d, { x: W / 2, y: H / 2 });
    }
    c.ok('expanding ' + d.name);
  },
  bf(a, c) { c.hide(); FX.blackFlash(W / 2, H / 2 - 40, { mult: 2.5 }); G.blackFlashes++; c.ok('BLACK FLASH'); },
  of(a, c) { c.hide(); FX.orangeFlash(W / 2, H / 2 - 40, {}); G.orangeFlashes++; c.ok('ORANGE FLASH'); },
  kill(a, c) {
    if (Battle.active) { Battle.ehp = 0; Battle.win(); c.ok('enemy deleted'); }
    else if (DomainFight.active) { DomainFight.boss.hp = 0; c.ok('boss deleted'); }
    else c.err('nothing to kill');
  },
  die(a, c) {
    if (Battle.active) { G.hp = 0; Battle.lose(); c.ok('...rude'); }
    else { G.hp = 0; c.ok('HP = 0'); }
  },
  speed(a, c) { G.speedMult = clamp(+a[0] || 1, .2, 10); c.ok('speed x' + G.speedMult); },
  dmg(a, c) { G.dmgMult = clamp(+a[0] || 1, .1, 1000); c.ok('damage x' + G.dmgMult); },
  hitbox(a, c) { G.showHitbox = !G.showHitbox; c.ok('hitboxes ' + (G.showHitbox ? 'ON' : 'OFF')); },
  music(a, c) {
    const k = a[0];
    if (!k) { c.log(Object.keys(MUSIC).join('  ')); return; }
    if (!MUSIC[k]) return c.err('no such track');
    Audio.cur = null; Audio.play(k); c.ok('playing ' + k);
  },
  sfx(a, c) { Audio.sfx(a[0] || 'ok'); c.ok('played ' + (a[0] || 'ok')); },
  mute(a, c) { c.ok('muted = ' + Audio.toggleMute()); },
  vol(a, c) {
    const m = +a[0]; if (!isNaN(m)) { G.musicVol = clamp(m, 0, 1); Audio.setMusicVol(G.musicVol); }
    const s = +a[1]; if (!isNaN(s)) { G.sfxVol = clamp(s, 0, 1); Audio.setSfxVol(G.sfxVol); }
    c.ok('music ' + G.musicVol.toFixed(2) + '  sfx ' + G.sfxVol.toFixed(2));
  },
  mission(a, c) {
    const n = parseInt(a[0], 10);
    if (isNaN(n)) { c.log('current mission: ' + G.mission + ' / ' + (MISSIONS.length - 1)); c.log(MISSIONS.map((m, i) => i + ': ' + m.title).join('\n'), 'dim'); return; }
    c.hide(); Story.jumpTo(clamp(n, 0, MISSIONS.length - 1)); c.ok('jumped to mission ' + n);
  },
  flag(a, c) {
    const k = a[0];
    if (!k) { c.log(JSON.stringify(G.flags)); return; }
    if (a.length > 1) { G.flags[k] = a[1] === 'false' ? false : a[1] === 'true' ? true : a[1]; }
    c.ok(k + ' = ' + G.flags[k]);
  },
  codex(a, c) { CODEX.forEach(x => G.codex[x.id] = true); c.ok('codex fully unlocked (' + CODEX.length + ' entries)'); },
  copy(a, c) { COPYABLE.forEach(x => G.flags['copy_' + x.id] = true); c.ok('all copyable techniques witnessed'); },
  stats(a, c) {
    c.log('LV ' + G.lv + '  XP ' + G.xp + '  HP ' + G.hp + '/' + G.hpMax + '  $' + fmt(G.money));
    c.log('ATK ' + G.atkTotal() + '  DEF ' + G.defTotal() + '  SPD ' + G.spd + '  CE INFINITE');
    c.log('mission ' + G.mission + '  playtime ' + timeStr(G.playtime));
    c.log('black flashes ' + G.blackFlashes + '  orange flashes ' + G.orangeFlashes + '  domains ' + G.domainsUsed);
    c.log('battles won ' + G.battlesWon + '  deaths ' + G.deaths + '  max combo ' + G.maxCombo);
    c.log('unlocked: ' + ABILITIES.filter(x => G.has(x.id)).map(x => x.id).join(' '));
  },
  save(a, c) { c.ok(G.save() ? 'saved' : 'save failed'); },
  load(a, c) { if (G.load()) { c.ok('loaded'); c.hide(); Game.toOverworld(); } else c.err('no save'); },
  reset(a, c) {
    if (a[0] !== 'confirm') { c.err('this wipes your save. type: /reset confirm'); return; }
    G.wipe(); G.reset(); c.ok('save wiped'); c.hide(); Game.toTitle();
  },
  admin(a, c) { AdminPanel.show(); c.ok('dev panel open'); },
  clear(a, c) { el('chatlog').innerHTML = ''; },
  time(a, c) { c.ok('playtime ' + timeStr(G.playtime)); },
  orange(a, c) {
    const lines = [
      'ORANGE: "i am legally a vegetable so none of this applies to me."',
      'ORANGE: "did you know i can see your save file. its right there."',
      'ORANGE: "type /of. do it. DO IT."',
      'ORANGE: "kenji we should buy the purple guy skin again"',
      'ORANGE: "whats a bedtime"',
      'ORANGE: "i rewrote the credits to say ORANGE six hundred times."'
    ];
    c.log(pick(lines), 'sys'); Audio.sfx('orangetalk');
  },
  version(a, c) { c.ok('DIGITAL GENESIS — Chapter 1 — build 1.0'); }
};

/* ===========================================================
   ADMIN PANEL (Sandbox Mode: Developer Tools)
   =========================================================== */
const AdminPanel = {
  open: false,
  show() { this.open = true; el('adminpanel').classList.remove('hidden'); this.render(); },
  hide() { this.open = false; el('adminpanel').classList.add('hidden'); cv.focus(); },
  toggle() { this.open ? this.hide() : this.show(); },

  render() {
    const b = el('apBody');
    b.innerHTML = '';
    const sec = (title) => {
      const d = document.createElement('div'); d.className = 'apSec';
      const h = document.createElement('h4'); h.textContent = title; d.appendChild(h);
      b.appendChild(d); return d;
    };
    const row = (parent, label) => {
      const r = document.createElement('div'); r.className = 'apRow';
      const l = document.createElement('label'); l.textContent = label; r.appendChild(l);
      parent.appendChild(r); return r;
    };
    const toggleBtn = (parent, label, get, set) => {
      const r = row(parent, label);
      const btn = document.createElement('button');
      btn.className = 'apBtn' + (get() ? ' on' : '');
      btn.textContent = get() ? 'ON' : 'OFF';
      btn.onclick = () => { set(!get()); this.render(); Audio.sfx('select'); };
      r.appendChild(btn);
    };
    const slider = (parent, label, min, max, step, get, set) => {
      const r = row(parent, label);
      const i = document.createElement('input');
      i.type = 'range'; i.min = min; i.max = max; i.step = step; i.value = get();
      const v = document.createElement('span'); v.textContent = (+get()).toFixed(2); v.style.color = '#ff8c00';
      i.oninput = () => { set(+i.value); v.textContent = (+i.value).toFixed(2); };
      r.appendChild(i); r.appendChild(v);
    };
    const btn = (parent, label, fn) => {
      const x = document.createElement('button');
      x.className = 'apBtn'; x.textContent = label;
      x.onclick = () => { fn(); Audio.sfx('select'); };
      parent.appendChild(x); return x;
    };
    const grid = (parent) => { const g = document.createElement('div'); g.className = 'apGrid'; parent.appendChild(g); return g; };

    /* cheats */
    const s1 = sec('CHEATS');
    toggleBtn(s1, 'god mode (no damage)', () => G.god, v => G.god = v);
    toggleBtn(s1, 'one-shot kills', () => G.oneShot, v => G.oneShot = v);
    toggleBtn(s1, 'noclip (walk anywhere)', () => G.noclip, v => G.noclip = v);
    toggleBtn(s1, 'all techniques', () => G.allUnlocked, v => {
      G.allUnlocked = v; if (v) ABILITIES.forEach(x => G.unlocked[x.id] = true);
    });
    toggleBtn(s1, 'free domains (no focus)', () => G.infiniteDomain, v => G.infiniteDomain = v);
    toggleBtn(s1, 'show hitboxes', () => G.showHitbox, v => G.showHitbox = v);
    slider(s1, 'move speed', .3, 4, .1, () => G.speedMult, v => G.speedMult = v);
    slider(s1, 'damage mult', .2, 50, .2, () => G.dmgMult, v => G.dmgMult = v);

    /* player */
    const s2 = sec('PLAYER');
    const r1 = row(s2, 'level  (' + G.lv + ')');
    const lvi = document.createElement('input');
    lvi.type = 'range'; lvi.min = 1; lvi.max = 40; lvi.step = 1; lvi.value = G.lv;
    lvi.onchange = () => { CMDS.lv([lvi.value], ChatConsole); this.render(); };
    r1.appendChild(lvi);
    const r2 = row(s2, 'dollars');
    const mi = document.createElement('input');
    mi.type = 'number'; mi.value = G.money; mi.style.width = '90px';
    mi.style.background = '#13213a'; mi.style.color = '#cfe3ff'; mi.style.border = '1px solid #2b4068';
    mi.onchange = () => { G.money = Math.max(0, +mi.value | 0); };
    r2.appendChild(mi);
    const g2 = grid(s2);
    btn(g2, 'FULL HEAL', () => { G.fullHeal(); Audio.sfx('heal'); });
    btn(g2, '+10 LEVELS', () => { CMDS.lv([Math.min(40, G.lv + 10)], ChatConsole); this.render(); });
    btn(g2, '+$10,000', () => { G.gainMoney(10000); Audio.sfx('coin'); });
    btn(g2, 'ALL SKINS+EMOTES', () => CMDS.giveall([], ChatConsole));
    btn(g2, 'ALL CODEX', () => CMDS.codex([], ChatConsole));
    btn(g2, 'ALL COPY TECHS', () => CMDS.copy([], ChatConsole));

    /* techniques */
    const s3 = sec('TECHNIQUES');
    const g3 = grid(s3);
    ABILITIES.forEach(ab => {
      const x = btn(g3, ab.name.length > 16 ? ab.name.slice(0, 15) + '.' : ab.name, () => {
        if (G.unlocked[ab.id]) delete G.unlocked[ab.id]; else { G.unlocked[ab.id] = true; Audio.sfx('unlock'); }
        this.render();
      });
      if (G.has(ab.id)) x.classList.add('on');
      x.title = ab.name + ' (LV ' + ab.lv + ')';
    });

    /* fx */
    const s4 = sec('CINEMATICS');
    const g4 = grid(s4);
    btn(g4, 'BLACK FLASH', () => { this.hide(); FX.blackFlash(W / 2, H / 2 - 40, { mult: 2.5 }); });
    btn(g4, 'ORANGE FLASH', () => { this.hide(); FX.orangeFlash(W / 2, H / 2 - 40, {}); });
    Object.values(DOMAINS).forEach(d => {
      btn(g4, d.sub.split(':')[0].trim().slice(0, 14), () => { this.hide(); FX.domainExpansion(d, { x: W / 2, y: H / 2 }); });
    });
    btn(g4, 'DOMAIN CLASH', () => { this.hide(); FX.domainClash(DOMAINS.shrine, DOMAINS.sandbox); });
    btn(g4, 'GLITCH', () => FX.glitch(.8));

    /* world */
    const s5 = sec('WORLD');
    const g5 = grid(s5);
    Object.keys(AREAS).forEach(k => {
      btn(g5, k, () => { this.hide(); Fade.out(() => { Game.toOverworld(k); Fade.in(); }, 4); });
    });

    /* battles */
    const s6 = sec('SPAWN BATTLE');
    const g6 = grid(s6);
    Object.keys(ENEMIES).forEach(k => {
      btn(g6, k, () => { this.hide(); Game.battle(k, { bg: Over.area ? Over.area.bg : 'city', canFlee: true }); });
    });

    /* story */
    const s7 = sec('STORY JUMP');
    const g7 = grid(s7);
    MISSIONS.forEach((m, i) => {
      const x = btn(g7, i + '. ' + m.title.slice(0, 13), () => { this.hide(); Story.jumpTo(i); });
      if (G.mission === i) x.classList.add('on');
    });

    /* audio + save */
    const s8 = sec('AUDIO / SAVE');
    slider(s8, 'music', 0, 1, .02, () => G.musicVol, v => { G.musicVol = v; Audio.setMusicVol(v); });
    slider(s8, 'sfx', 0, 1, .02, () => G.sfxVol, v => { G.sfxVol = v; Audio.setSfxVol(v); });
    const g8 = grid(s8);
    btn(g8, 'SAVE', () => { G.save(); Toast.show('SAVED', PAL.green); });
    btn(g8, 'LOAD', () => { if (G.load()) { this.hide(); Game.toOverworld(); } });
    btn(g8, 'TITLE', () => { this.hide(); Game.toTitle(); });
    btn(g8, 'WIPE SAVE', () => { if (confirm('Wipe the save file?')) { G.wipe(); G.reset(); this.hide(); Game.toTitle(); } });
  }
};
