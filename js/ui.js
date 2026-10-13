/* ===========================================================
   DIGITAL GENESIS — ui.js
   HUD, pause menu, level-up / unlock cinematics, emote wheel
   =========================================================== */
'use strict';

/* ---------- screen fade ---------- */
const Fade = {
  a: 0, target: 0, speed: 3, col: '#000', cb: null, holding: false,
  out(cb, speed = 3, col = '#000') { this.target = 1; this.speed = speed; this.col = col; this.cb = cb; },
  in(speed = 3) { this.target = 0; this.speed = speed; this.cb = null; },
  update(dt) {
    if (this.a === this.target) return;
    this.a = approach(this.a, this.target, dt * this.speed);
    if (this.a === 1 && this.cb) { const c = this.cb; this.cb = null; c(); }
  },
  draw() { if (this.a > 0) { ctx.save(); ctx.globalAlpha = this.a; rect(0, 0, W, H, this.col); ctx.restore(); } },
  busy() { return this.a > 0.001 && this.a < .999 || this.target === 1; }
};

/* ---------- HP bar helper ---------- */
function hpBar(x, y, w, h, hp, max, o = {}) {
  rect(x - 2, y - 2, w + 4, h + 4, '#05070e');
  frameRect(x - 2, y - 2, w + 4, h + 4, o.edge || '#fff', 2);
  rect(x, y, w, h, '#2a1420');
  const k = clamp(hp / max, 0, 1);
  const col = o.col || (k > .5 ? '#2fe36b' : k > .25 ? PAL.yellow : PAL.red);
  rect(x, y, Math.ceil(w * k), h, col);
  // ticks
  ctx.save(); ctx.globalAlpha = .25;
  for (let i = 1; i < 10; i++) rect(x + (w / 10) * i, y, 1, h, '#000');
  ctx.restore();
  if (o.label) text(Math.max(0, Math.ceil(hp)) + ' / ' + max, x + w + 8, y + (h - 7) / 2, { scale: o.ls || 2, color: '#fff', shadow: '#000' });
}

/* ---------- overworld HUD ---------- */
const HUD = {
  draw(o = {}) {
    // top-left plate
    const bx = 8, by = 8, bw = 262;
    rect(bx, by, bw, 46, '#05070ed9');
    frameRect(bx, by, bw, 46, '#2a3450', 2);
    text('KENJI', bx + 8, by + 6, { scale: 2, color: PAL.cyan });
    text('LV ' + G.lv, bx + 76, by + 6, { scale: 2, color: '#fff' });
    const mt = '$' + fmt(G.money);
    text(mt, bx + bw - 8 - textW(mt, 2), by + 6, { scale: 2, color: PAL.gold });
    hpBar(bx + 8, by + 26, 104, 9, G.hp, G.hpMax, {});
    text(G.hp + '/' + G.hpMax, bx + 120, by + 27, { scale: 1, color: '#cfe3ff' });
    // xp sliver
    const nx = xpFor(G.lv + 1), px = xpFor(G.lv);
    const k = G.lv >= 40 ? 1 : clamp((G.xp - px) / Math.max(1, nx - px), 0, 1);
    rect(bx + 8, by + 39, bw - 16, 3, '#1d2740');
    rect(bx + 8, by + 39, (bw - 16) * k, 3, PAL.orange);
    // CE (infinite)
    text('CE ∞', bx + 206, by + 27, { scale: 1, color: PAL.green });

    if (o.area) {
      const w = textW(o.area, 2) + 20;
      rect(W - w - 8, 8, w, 22, '#05070ecc');
      frameRect(W - w - 8, 8, w, 22, PAL.orange, 2);
      text(o.area, W - w + 2, 15, { scale: 2, color: PAL.orange2 });
    }
    if (o.objective) {
      const t = '■ ' + o.objective;
      const w = textW(t, 1) + 16;
      rect(W - w - 8, 34, w, 16, '#05070ecc');
      text(t, W - w + 0, 39, { scale: 1, color: PAL.yellow });
    }
    if (G.god || G.allUnlocked || G.oneShot || G.noclip) {
      let s = [G.god && 'GOD', G.noclip && 'NOCLIP', G.oneShot && '1HIT', G.allUnlocked && 'ALL'].filter(Boolean).join(' ');
      text('[ADMIN: ' + s + ']', 10, H - 18, { scale: 1, color: PAL.pink });
    }
  }
};

/* ---------- level-up / unlock cinematic ---------- */
const LevelUp = {
  queue: [], active: null, t: 0,
  push(lv, abs) { this.queue.push({ lv, abs }); },
  trigger(ups) {
    ups.forEach(lv => this.push(lv, unlocksAt(lv).filter(a => G.unlock(a.id))));
  },
  update(dt) {
    if (!this.active) {
      if (!this.queue.length) return false;
      this.active = this.queue.shift(); this.t = 0;
      Audio.sfx(this.active.abs.length ? 'unlock' : 'levelup');
      FX.flash(PAL.orange, .3, .5); FX.shake(5, .3);
      FX.burst(W / 2, H / 2, 40, { kind: 'spark', col: PAL.orange, size: 4, life: 1.2, g: 90 });
      return true;
    }
    this.t += dt;
    if (this.t > .55 && (Input.just('ok') || Input.just('back'))) {
      Audio.sfx('ok'); this.active = null;
      return this.queue.length > 0;
    }
    return true;
  },
  busy() { return !!this.active || this.queue.length > 0; },
  draw() {
    if (!this.active) return;
    const a = this.active, t = this.t;
    ctx.save(); ctx.globalAlpha = clamp(t / .2, 0, 1) * .88; rect(0, 0, W, H, '#05070e'); ctx.restore();
    const pop = clamp(t / .18, 0, 1);
    const sc = 1 + (1 - pop) * 1.5;
    // rays
    ctx.save(); ctx.globalAlpha = .3;
    for (let i = 0; i < 20; i++) {
      const ang = (i / 20) * TAU + t * .4;
      line(W / 2, 150, W / 2 + Math.cos(ang) * 420, 150 + Math.sin(ang) * 420, PAL.orange, 6);
    }
    ctx.restore();
    pixelGlyphs('LEVEL UP', W / 2, 92, 72 * sc, PAL.orange, { outline: '#2a1000', dn: 4, shadow: true, dn: 4 });
    textC('LV ' + (a.lv - 1) + '  →  LV ' + a.lv, W / 2, 140, { scale: 4, color: '#fff', shadow: PAL.orangeD });
    textC('HP ' + G.hpMax + '   ATK ' + G.atkTotal() + '   DEF ' + G.defTotal() + '   SPD ' + G.spd,
      W / 2, 178, { scale: 2, color: '#9fe8ff', shadow: '#000' });

    if (a.abs.length) {
      const y0 = 214;
      rect(60, y0 - 10, W - 120, 34 + a.abs.length * 62, '#070c18');
      frameRect(60, y0 - 10, W - 120, 34 + a.abs.length * 62, PAL.cyan, 2);
      textC('■ NEW DATA UNPACKED ■', W / 2, y0 - 2, { scale: 2, color: PAL.cyan });
      a.abs.forEach((ab, i) => {
        const y = y0 + 22 + i * 62;
        const st = clamp((t - .3 - i * .25) / .3, 0, 1);
        if (st <= 0) return;
        ctx.save(); ctx.globalAlpha = st;
        rect(74, y, W - 148, 54, '#0b1424'); frameRect(74, y, W - 148, 54, ab.col, 2);
        if (ab.kanji) pixelGlyphs(ab.kanji, 100, y + 27, 42, ab.col, { dn: 2, outline: '#000', maxW: 44 });
        text(ab.name, 130, y + 6, { scale: 2, color: ab.col, shadow: '#000' });
        text('[' + ab.tag + ']', 130, y + 24, { scale: 1, color: '#7f90ad' });
        if (ab.jp) pixelGlyphs(ab.jp, 196 + Math.min(180, ab.jp.length * 7), y + 26, 14, '#8ea3c4', { dn: 1, maxW: 360 });
        wrap(ab.desc, 72).slice(0, 2).forEach((l, j) => text(l, 130, y + 36 + j * 9, { scale: 1, color: '#cfe3ff' }));
        ctx.restore();
      });
      const hype = UNLOCK_HYPE[a.abs[0].id];
      if (hype && t > .9) textC(hype, W / 2, H - 56, { scale: 1, color: PAL.orange2, shadow: '#000' });
    }
    if (t > .6 && Math.sin(t * 6) > -.3)
      textC('[ Z ] CONTINUE', W / 2, H - 30, { scale: 2, color: '#fff', shadow: '#000' });
  }
};

/* ---------- pause menu ---------- */
const Menu = {
  open: false, tab: 0, idx: 0, sub: null, scroll: 0,
  tabs: ['STAT', 'TECHNIQUE', 'ITEM', 'SKIN', 'EMOTE', 'CODEX', 'CONFIG', 'SAVE'],
  show() { this.open = true; this.tab = 0; this.idx = 0; this.sub = null; Audio.sfx('ok'); },
  hide() { this.open = false; Audio.sfx('cancel'); },

  update(dt) {
    if (!this.open) return;
    if (Input.just('menu') || Input.just('back') || Input.just('esc')) {
      if (this.sub) { this.sub = null; Audio.sfx('cancel'); } else this.hide();
      return;
    }
    if (!this.sub) {
      if (Input.just('left')) { this.tab = (this.tab + this.tabs.length - 1) % this.tabs.length; this.idx = 0; this.scroll = 0; Audio.sfx('move'); }
      if (Input.just('right')) { this.tab = (this.tab + 1) % this.tabs.length; this.idx = 0; this.scroll = 0; Audio.sfx('move'); }
    }
    const list = this.curList();
    if (list.length) {
      if (Input.just('up')) { this.idx = (this.idx + list.length - 1) % list.length; Audio.sfx('move'); }
      if (Input.just('down')) { this.idx = (this.idx + 1) % list.length; Audio.sfx('move'); }
      if (Input.just('ok')) this.activate(list[this.idx]);
    }
  },
  curList() {
    switch (this.tabs[this.tab]) {
      case 'TECHNIQUE': return ABILITIES.filter(a => G.has(a.id));
      case 'ITEM': return Object.keys(G.items).filter(k => G.items[k] > 0).map(k => ({ k, item: ITEMS[k] }));
      case 'SKIN': return Object.keys(SKINS).filter(k => G.ownedSkins[k]).map(k => ({ k, skin: SKINS[k] }));
      case 'EMOTE': return Object.keys(EMOTES).filter(k => G.ownedEmotes[k]).map(k => ({ k, em: EMOTES[k] }));
      case 'CODEX': return CODEX.filter(c => G.codex[c.id]);
      case 'CONFIG': return [
        { c: 'music', t: 'MUSIC VOLUME' }, { c: 'sfx', t: 'SFX VOLUME' },
        { c: 'text', t: 'TEXT SPEED' }, { c: 'scan', t: 'SCANLINES' }, { c: 'mute', t: 'MUTE ALL' }];
      case 'SAVE': return [{ c: 'save', t: 'SAVE GAME' }, { c: 'load', t: 'LOAD GAME' }, { c: 'title', t: 'RETURN TO TITLE' }];
      default: return [];
    }
  },
  activate(e) {
    const tab = this.tabs[this.tab];
    if (tab === 'ITEM') { useItem(e.k); Audio.sfx('heal'); }
    else if (tab === 'SKIN') { G.equippedSkin = e.k; Audio.sfx('buy'); Toast.show('SKIN EQUIPPED: ' + e.skin.name, e.skin.rar.col); }
    else if (tab === 'EMOTE') { playEmote(e.k); this.hide(); }
    else if (tab === 'CONFIG') {
      if (e.c === 'music') { G.musicVol = (G.musicVol + .12 > 1.01) ? 0 : G.musicVol + .12; Audio.setMusicVol(G.musicVol); }
      if (e.c === 'sfx') { G.sfxVol = (G.sfxVol + .12 > 1.01) ? 0 : G.sfxVol + .12; Audio.setSfxVol(G.sfxVol); Audio.sfx('ok'); }
      if (e.c === 'text') { G.textSpeed = G.textSpeed >= 2 ? .6 : G.textSpeed + .4; }
      if (e.c === 'scan') { G.scanlines = !G.scanlines; document.getElementById('scanlines').style.display = G.scanlines ? '' : 'none'; }
      if (e.c === 'mute') { Audio.toggleMute(); }
      Audio.sfx('select');
    }
    else if (tab === 'SAVE') {
      if (e.c === 'save') { G.save(); Toast.show('GAME SAVED.', PAL.green); Audio.sfx('buy'); }
      if (e.c === 'load') { if (G.load()) { Toast.show('LOADED.', PAL.green); this.hide(); Game.toOverworld(); } else Audio.sfx('deny'); }
      if (e.c === 'title') { this.hide(); Fade.out(() => Game.toTitle(), 2.2); }
    }
  },

  draw() {
    if (!this.open) return;
    ctx.save(); ctx.globalAlpha = .9; rect(0, 0, W, H, '#05070e'); ctx.restore();
    // frame
    box(14, 14, W - 28, H - 28, { fill: '#070c18', edge: '#fff', t: 3, inner: '#1d2740' });
    // tabs
    let tx = 30;
    this.tabs.forEach((t, i) => {
      const sel = i === this.tab, w = textW(t, 1) + 12;
      if (sel) { rect(tx - 4, 26, w, 16, PAL.orange); }
      text(t, tx + 2, 31, { scale: 1, color: sel ? '#140800' : '#7f90ad' });
      tx += w + 4;
    });
    rect(26, 46, W - 52, 2, PAL.orange);
    const tab = this.tabs[this.tab];
    const list = this.curList();

    if (tab === 'STAT') {
      const u = 6;
      drawActor(skinSprite(), 46, 70, u, { t: performance.now() / 1000, dir: 0 });
      let y = 70;
      const L = (k, v, c) => { text(k, 180, y, { scale: 2, color: '#7f90ad' }); text(v, 330, y, { scale: 2, color: c || '#fff' }); y += 24; };
      text('KENJI SATO', 180, 62 - 20 + 8, { scale: 3, color: PAL.cyan, shadow: '#000' });
      y = 100;
      L('GRADE', 'SPECIAL', PAL.red);
      L('LV', String(G.lv), PAL.orange);
      L('HP', G.hp + ' / ' + G.hpMax);
      L('CURSED ENERGY', 'INFINITE', PAL.green);
      L('ATK', String(G.atkTotal()));
      L('DEF', String(G.defTotal()));
      L('SPD', String(G.spd));
      L('EXP', fmt(G.xp));
      L('NEXT', G.lv >= 40 ? 'MAX' : fmt(Math.max(0, xpFor(G.lv + 1) - G.xp)));
      L('DOLLARS', '$' + fmt(G.money), PAL.gold);
      y += 6;
      text('PLAYTIME  ' + timeStr(G.playtime), 180, y, { scale: 1, color: '#7f90ad' }); y += 12;
      text('BLACK FLASHES  ' + G.blackFlashes + '    ORANGE FLASHES  ' + G.orangeFlashes, 180, y, { scale: 1, color: '#7f90ad' }); y += 12;
      text('BATTLES WON  ' + G.battlesWon + '    DEATHS  ' + G.deaths + '    MAX COMBO  ' + G.maxCombo, 180, y, { scale: 1, color: '#7f90ad' });
      // orange sidekick
      drawActor('orange', 52, 300, 5, { t: performance.now() / 1000, hop: true });
      textC('ORANGE', 92, 400, { scale: 1, color: PAL.orange });
      textC('co-pilot / hype-man', 92, 412, { scale: 1, color: '#7f90ad' });
    }
    else if (tab === 'TECHNIQUE') {
      this.drawList(list, (a, x, y, sel) => {
        text(a.name, x, y, { scale: 2, color: sel ? a.col : '#cfe3ff' });
        text('[' + a.tag + ']', x + 300, y, { scale: 1, color: '#7f90ad' });
      });
      const a = list[this.idx];
      if (a) {
        const dy = H - 136;
        rect(30, dy, W - 60, 102, '#0b1424'); frameRect(30, dy, W - 60, 102, a.col, 2);
        if (a.kanji) pixelGlyphs(a.kanji, 68, dy + 50, 56, a.col, { dn: 2, outline: '#000', maxW: 62 });
        text(a.name, 110, dy + 8, { scale: 2, color: a.col });
        if (a.jp) pixelGlyphs(a.jp, 114 + Math.min(220, a.jp.length * 8), dy + 28, 16, '#8ea3c4', { dn: 1, maxW: 440 });
        text('BRANCH: ' + a.branch + '   UNLOCK: LV ' + a.lv + '   COST: ' + (a.cost || 0) + ' CE', 110, dy + 44, { scale: 1, color: PAL.yellow });
        wrap(a.desc, 82).forEach((l, i) => text(l, 110, dy + 58 + i * 11, { scale: 1, color: '#cfe3ff' }));
      }
      // locked preview
      const nextLocked = ABILITIES.find(x => !G.has(x.id));
      if (nextLocked) text('NEXT UNLOCK: LV ' + nextLocked.lv + ' — ' + nextLocked.name, 30, H - 150, { scale: 1, color: '#55637d' });
    }
    else if (tab === 'ITEM') {
      if (!list.length) text('No items. Buy snacks at the vending machine.', 40, 70, { scale: 2, color: '#7f90ad' });
      this.drawList(list, (e, x, y, sel) => {
        text(e.item.name, x, y, { scale: 2, color: sel ? PAL.yellow : '#cfe3ff' });
        text('x' + G.items[e.k], x + 330, y, { scale: 2, color: '#fff' });
      });
      const e = list[this.idx];
      if (e) text(e.item.desc, 40, H - 60, { scale: 1, color: '#cfe3ff' });
    }
    else if (tab === 'SKIN') {
      this.drawList(list, (e, x, y, sel) => {
        const eq = G.equippedSkin === e.k;
        text((eq ? '★ ' : '  ') + e.skin.name, x, y, { scale: 2, color: sel ? e.skin.rar.col : '#cfe3ff' });
        text(e.skin.rar.name, x + 300, y, { scale: 1, color: e.skin.rar.col });
      });
      const e = list[this.idx];
      if (e) {
        const px = W - 180;
        rect(px - 40, 70, 150, 190, '#0b1424'); frameRect(px - 40, 70, 150, 190, e.skin.rar.col, 2);
        drawActor(e.skin.spr, px - 40 + (150 - 16 * 5) / 2, 86, 5, { t: performance.now() / 1000 });
        textC(e.skin.rar.name, px + 35, 232, { scale: 1, color: e.skin.rar.col });
        wrap(e.skin.desc, 40).forEach((l, i) => textC(l, px + 35, 244 + i * 10, { scale: 1, color: '#cfe3ff' }));
      }
    }
    else if (tab === 'EMOTE') {
      this.drawList(list, (e, x, y, sel) => {
        text(e.em.name, x, y, { scale: 2, color: sel ? e.em.rar.col : '#cfe3ff' });
        text(e.em.rar.name, x + 300, y, { scale: 1, color: e.em.rar.col });
      });
      text('Press Z to perform. B opens the wheel in the overworld.', 40, H - 60, { scale: 1, color: '#7f90ad' });
    }
    else if (tab === 'CODEX') {
      if (!list.length) text('No entries yet. Explore and talk to people.', 40, 70, { scale: 2, color: '#7f90ad' });
      this.drawList(list, (c, x, y, sel) => text(c.title, x, y, { scale: 2, color: sel ? PAL.cyan : '#cfe3ff' }));
      const c = list[this.idx];
      if (c) {
        const dy = H - 150;
        rect(30, dy, W - 60, 118, '#0b1424'); frameRect(30, dy, W - 60, 118, PAL.cyan, 2);
        text(c.title, 42, dy + 8, { scale: 2, color: PAL.cyan });
        wrap(c.body, 88).forEach((l, i) => text(l, 42, dy + 30 + i * 11, { scale: 1, color: '#cfe3ff' }));
      }
    }
    else if (tab === 'CONFIG') {
      this.drawList(list, (e, x, y, sel) => {
        text(e.t, x, y, { scale: 2, color: sel ? PAL.yellow : '#cfe3ff' });
        let v = '';
        if (e.c === 'music') v = Math.round(G.musicVol * 100) + '%';
        if (e.c === 'sfx') v = Math.round(G.sfxVol * 100) + '%';
        if (e.c === 'text') v = G.textSpeed.toFixed(1) + 'x';
        if (e.c === 'scan') v = G.scanlines ? 'ON' : 'OFF';
        if (e.c === 'mute') v = Audio.muted ? 'MUTED' : 'ON';
        text(v, x + 300, y, { scale: 2, color: '#fff' });
      });
      text('Press / at any time for the command console.', 40, H - 60, { scale: 1, color: '#7f90ad' });
    }
    else if (tab === 'SAVE') {
      this.drawList(list, (e, x, y, sel) => text(e.t, x, y, { scale: 2, color: sel ? PAL.yellow : '#cfe3ff' }));
      const inf = G.saveInfo();
      if (inf) text('SAVE FOUND: LV ' + inf.lv + '  MISSION ' + inf.mission + '  ' + timeStr(inf.playtime), 40, H - 60, { scale: 1, color: PAL.green });
      else text('No save file.', 40, H - 60, { scale: 1, color: '#7f90ad' });
    }
    textC('← → TABS   ↑ ↓ SELECT   Z CONFIRM   C/X CLOSE', W / 2, H - 34, { scale: 1, color: '#55637d' });
  },
  drawList(list, fn) {
    const perPage = 10;
    if (this.idx < this.scroll) this.scroll = this.idx;
    if (this.idx >= this.scroll + perPage) this.scroll = this.idx - perPage + 1;
    for (let i = 0; i < Math.min(perPage, list.length); i++) {
      const n = i + this.scroll, e = list[n]; if (!e) break;
      const y = 64 + i * 24, sel = n === this.idx;
      if (sel) { rect(34, y - 3, 380, 22, '#13213a'); text('→', 36, y, { scale: 2, color: PAL.yellow }); }
      fn(e, 58, y, sel);
    }
    if (list.length > perPage)
      text((this.idx + 1) + '/' + list.length, 380, 64 + perPage * 24 + 4, { scale: 1, color: '#55637d' });
  }
};

/* ---------- emote wheel ---------- */
const EmoteWheel = {
  open: false, idx: 0, t: 0,
  show() { this.open = true; this.t = 0; Audio.sfx('ok'); },
  hide() { this.open = false; },
  update(dt) {
    if (!this.open) return;
    this.t += dt;
    if (Input.just('left')) { this.idx = (this.idx + 5) % 6; Audio.sfx('move'); }
    if (Input.just('right')) { this.idx = (this.idx + 1) % 6; Audio.sfx('move'); }
    if (Input.just('ok')) {
      const id = G.equippedEmotes[this.idx];
      if (id) { playEmote(id); this.hide(); } else Audio.sfx('deny');
    }
    if (Input.just('back') || Input.just('emote') || Input.just('esc')) this.hide();
  },
  draw() {
    if (!this.open) return;
    ctx.save(); ctx.globalAlpha = .55; rect(0, 0, W, H, '#000'); ctx.restore();
    const cx = W / 2, cy = H / 2;
    textC('EMOTE WHEEL', cx, cy - 150, { scale: 3, color: PAL.orange, shadow: '#000' });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU - Math.PI / 2;
      const x = cx + Math.cos(a) * 110, y = cy + Math.sin(a) * 100;
      const id = G.equippedEmotes[i], em = id ? EMOTES[id] : null;
      const sel = i === this.idx;
      rect(x - 46, y - 30, 92, 60, sel ? '#1d3157' : '#0b1424');
      frameRect(x - 46, y - 30, 92, 60, sel ? PAL.yellow : (em ? em.rar.col : '#39455c'), 2);
      if (em) {
        textC(em.name, x, y - 22, { scale: 1, color: em.rar.col });
        drawEmoteIcon(em, x, y + 8, sel ? this.t : 0);
      } else textC('EMPTY', x, y - 4, { scale: 1, color: '#55637d' });
      text(String(i + 1), x - 42, y + 18, { scale: 1, color: '#55637d' });
    }
    drawActor(skinSprite(), cx - 32, cy - 44, 4, { t: this.t, dir: 0 });
    textC('← → SELECT   Z PERFORM   B/X CLOSE', cx, cy + 160, { scale: 1, color: '#8fa0bd' });
  }
};

/* ---------- small shared widgets ---------- */
function rarityTag(r, x, y, s = 1) {
  const w = textW(r.name, s) + 8;
  rect(x, y, w, 7 * s + 4, r.col);
  text(r.name, x + 4, y + 2, { scale: s, color: '#0a0a0a' });
  return w;
}
function panel(x, y, w, h, col) {
  rect(x, y, w, h, '#070c18'); frameRect(x, y, w, h, col || '#2a3450', 2);
}
