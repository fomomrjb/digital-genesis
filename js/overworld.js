/* ===========================================================
   DIGITAL GENESIS — overworld.js
   Top-down exploration: areas, collision, NPCs, triggers,
   encounter zones, shops, save points, mission board.
   =========================================================== */
'use strict';

const Over = {
  active: false, area: null, areaId: null, t: 0,
  p: { x: 320, y: 300, dir: 0, frame: 0, anim: 0, walking: false },
  cam: { x: 0, y: 0 },
  near: null, encT: 0, zoneWarn: 0, locked: false,
  pendingEnc: null,

  enter(id, x, y, dir) {
    const a = AREAS[id]; if (!a) { console.warn('no area', id); return; }
    this.active = true; this.area = a; this.areaId = id; this.t = 0;
    G.flags.area = id;
    if (x != null) { this.p.x = x; this.p.y = y; }
    else if (a.spawn) { this.p.x = a.spawn[0]; this.p.y = a.spawn[1]; }
    this.p.dir = dir != null ? dir : 0;
    this.locked = false; this.encT = rnd(6, 3);
    Audio.play(a.music || 'city');
    this.clampCam(true);
    if (a.onEnter) a.onEnter();
    // fire enter-triggers
    (a.ents || []).forEach(e => {
      if (e.type === 'trigger' && e.onEnterArea && !(e.once && G.flags[e.flag]))
        e.onEnterArea();
    });
  },

  /* ---------- update ---------- */
  update(dt) {
    if (!this.active) return;
    this.t += dt;
    if (this.zoneWarn > 0) this.zoneWarn -= dt;
    if (Dlg.active || this.locked || Fade.busy()) { this.p.walking = false; return; }

    const sp = 132 * G.speedMult * (Input.isDown('back') ? 1.7 : 1);
    let dx = 0, dy = 0;
    if (Input.isDown('left')) dx -= 1;
    if (Input.isDown('right')) dx += 1;
    if (Input.isDown('up')) dy -= 1;
    if (Input.isDown('down')) dy += 1;
    const moving = !!(dx || dy);
    if (moving && !Emote.playing) {
      if (dy < 0) this.p.dir = 3; else if (dy > 0) this.p.dir = 0;
      if (dx < 0) this.p.dir = 1; else if (dx > 0) this.p.dir = 2;
      const m = Math.hypot(dx, dy) || 1;
      this.move((dx / m) * sp * dt, (dy / m) * sp * dt);
      this.p.anim += dt * (sp / 26);
      this.p.frame = Math.floor(this.p.anim) % 4;
    }
    this.p.walking = moving && !Emote.playing;

    // find nearest interactable
    this.near = null;
    let best = 1e9;
    (this.area.ents || []).forEach(e => {
      if (!e.type) return;
      if (e.hidden && e.hidden()) return;
      if (['npc', 'shop', 'save', 'board', 'sign', 'chest', 'warp', 'terminal'].includes(e.type)) {
        const d = dist(this.p.x, this.p.y, e.x, e.y);
        if (d < 46 && d < best) { best = d; this.near = e; }
      }
    });
    if (this.near && Input.just('ok')) this.interact(this.near);

    // doors
    (this.area.ents || []).forEach(e => {
      if (e.type !== 'door') return;
      if (aabb({ x: this.p.x - 7, y: this.p.y - 6, w: 14, h: 14 }, { x: e.x, y: e.y, w: e.w, h: e.h })) {
        if (e.locked && e.locked()) {
          if (!this.zoneWarn) { this.zoneWarn = 2; Toast.show(e.lockMsg || 'It will not open yet.', PAL.red); }
          return;
        }
        this.locked = true;
        Audio.sfx('warp');
        Fade.out(() => { Over.enter(e.to, e.tx, e.ty, e.tdir); Fade.in(); }, 4);
      }
    });
    // zone triggers
    (this.area.ents || []).forEach(e => {
      if (e.type !== 'trigger' || !e.w) return;
      if (e.once && G.flags[e.flag]) return;
      if (aabb({ x: this.p.x - 7, y: this.p.y - 6, w: 14, h: 14 }, { x: e.x, y: e.y, w: e.w, h: e.h })) {
        if (e.flag) G.flags[e.flag] = true;
        this.locked = true;
        e.fn();
      }
    });

    // random encounters
    if (this.area.encounters && this.area.encounters.length && moving) {
      this.encT -= dt;
      if (this.encT <= 0) {
        this.encT = rnd(16, 8);
        if (Math.random() < .55) {
          const eid = pick(this.area.encounters);
          this.locked = true;
          Audio.sfx('alarm'); FX.flash('#fff', .25, .7); FX.shake(5, .3);
          timers.after(.5, () => Game.battle(eid, { bg: this.area.bg, canFlee: true }));
        }
      }
    }
    this.clampCam();
  },

  move(dx, dy) {
    const solids = this.area.solids || [];
    const bb = { x: 0, y: 0, w: 14, h: 12 };
    if (!G.noclip) {
      bb.x = this.p.x + dx - 7; bb.y = this.p.y - 6;
      if (!solids.some(s => aabb(bb, s))) this.p.x += dx;
      bb.x = this.p.x - 7; bb.y = this.p.y + dy - 6;
      if (!solids.some(s => aabb(bb, s))) this.p.y += dy;
    } else { this.p.x += dx; this.p.y += dy; }
    const aw = this.area.w || W, ah = this.area.h || H;
    this.p.x = clamp(this.p.x, 12, aw - 12);
    this.p.y = clamp(this.p.y, 24, ah - 12);
  },
  clampCam(snap) {
    const aw = this.area.w || W, ah = this.area.h || H;
    const tx = clamp(this.p.x - W / 2, 0, Math.max(0, aw - W));
    const ty = clamp(this.p.y - H / 2, 0, Math.max(0, ah - H));
    if (snap) { this.cam.x = tx; this.cam.y = ty; }
    else { this.cam.x = lerp(this.cam.x, tx, .14); this.cam.y = lerp(this.cam.y, ty, .14); }
  },

  interact(e) {
    Audio.sfx('select');
    switch (e.type) {
      case 'npc':
        this.locked = true;
        if (e.face != null) e.dir = e.face;
        Dlg.start(typeof e.lines === 'function' ? e.lines() : e.lines, () => { this.locked = false; if (e.after) e.after(); });
        break;
      case 'sign':
        this.locked = true;
        Dlg.start([{ who: 'narr', t: typeof e.text === 'function' ? e.text() : e.text }], () => { this.locked = false; });
        break;
      case 'shop': Game.shop(e.who || 'orange'); break;
      case 'save':
        this.locked = true;
        Dlg.start([
          { who: 'sys', t: 'SAVE POINT\nLV ' + G.lv + '   HP ' + G.hp + '/' + G.hpMax + '   $' + fmt(G.money) + '\nPLAYTIME ' + timeStr(G.playtime) },
          { q: 'Save and restore HP?', choice: [
            { t: 'Yes', fn: () => { G.fullHeal(); G.save(); Audio.sfx('buy'); Toast.show('SAVED. HP RESTORED.', PAL.green, 3); } },
            { t: 'No', fn: () => Audio.sfx('cancel') }
          ] }
        ], () => { this.locked = false; });
        break;
      case 'board': Game.missionBoard(); break;
      case 'terminal':
        this.locked = true;
        Dlg.start([
          { who: 'sys', t: 'JUJUTSU HIGH TERMINAL\n> Kenji keeps rewriting the login screen into a boss-rush menu.' },
          { q: 'Open?', choice: [
            { t: 'Orange Challenges', fn: () => Game.challenges() },
            { t: 'Codex / Records', fn: () => { Menu.show(); Menu.tab = 5; } },
            { t: 'Close', fn: () => {} }
          ] }
        ], () => { this.locked = false; });
        break;
      case 'chest':
        if (G.flags['chest_' + e.id]) { Toast.show('Already looted.', PAL.gray); return; }
        G.flags['chest_' + e.id] = true;
        Audio.sfx('coin');
        if (e.money) { G.gainMoney(e.money); Toast.show('+$' + e.money, PAL.gold, 2.6); }
        if (e.item) { G.items[e.item] = (G.items[e.item] || 0) + 1; Toast.show('GOT ' + ITEMS[e.item].name, PAL.cyan, 2.6); }
        if (e.skin) giveSkin(e.skin);
        if (e.emote) giveEmote(e.emote);
        if (e.codex) { G.codex[e.codex] = true; Toast.show('CODEX UPDATED', PAL.cyan, 2.6); }
        break;
      case 'warp':
        this.locked = true;
        Dlg.start([{ q: e.q || 'Travel?', choice: [
          { t: 'Yes', fn: () => { Fade.out(() => { Over.enter(e.to, e.tx, e.ty); Fade.in(); }, 3); } },
          { t: 'No', fn: () => {} }
        ] }], () => { this.locked = false; });
        break;
    }
  },

  /* ---------- draw ---------- */
  draw() {
    const a = this.area;
    ctx.save();
    ctx.translate(-Math.round(this.cam.x), -Math.round(this.cam.y));
    if (a.draw) a.draw(this.t);
    // deco props
    (a.deco || []).forEach(d => {
      const u = d.u || 3;
      switch (d.k) {
        case 'tree': drawTree(d.x, d.y, u, this.t + d.x); break;
        case 'lamp': drawLamp(d.x, d.y, u, this.t + d.x); break;
        case 'vending': drawVending(d.x, d.y, u, this.t); break;
        case 'torii': drawTorii(d.x, d.y, u); break;
        case 'train': drawTrain(d.x, d.y, u, this.t); break;
        case 'sign': drawSign(d.x, d.y, u, d.col); break;
        case 'desk': drawDesk(d.x, d.y, u); break;
        case 'terminal': drawTerminal(d.x, d.y, u, this.t); break;
      }
    });
    // entities
    const ents = (a.ents || []).filter(e => ['npc', 'shop', 'save', 'board', 'chest', 'terminal', 'sign'].includes(e.type) && !(e.hidden && e.hidden()));
    const all = ents.concat([{ type: 'player', x: this.p.x, y: this.p.y }]);
    all.sort((m, n) => m.y - n.y);
    all.forEach(e => {
      if (e.type === 'player') { this.drawPlayer(); return; }
      const u = e.u || 3;
      if (e.type === 'npc') {
        drawActor(e.spr, e.x - 8 * u, e.y - 20 * u + 4, u, { t: this.t + (e.x % 7), dir: e.dir || 0 });
        if (e.label !== false) textC(e.name, e.x, e.y - 20 * u - 10, { scale: 1, color: e.col || '#cfe3ff', shadow: '#000' });
        if (e.quest) text('!', e.x + 14, e.y - 20 * u - 12 + Math.sin(this.t * 5) * 2, { scale: 2, color: PAL.yellow, shadow: '#000' });
      } else if (e.type === 'shop') {
        drawVending(e.x - 24, e.y - 60, 3, this.t);
        textC(e.who === 'orange' ? "ORANGE'S SHOP" : 'SUPPLY', e.x, e.y + 6, { scale: 1, color: PAL.orange, shadow: '#000' });
      } else if (e.type === 'save') {
        const g = .5 + Math.sin(this.t * 3) * .5;
        ctx.save(); ctx.globalAlpha = .25 + g * .3;
        circle(e.x, e.y - 10, 22, PAL.green); ctx.restore();
        rect(e.x - 3, e.y - 30, 6, 30, '#1d2740');
        rect(e.x - 10, e.y - 42, 20, 14, PAL.green);
        text('S', e.x - 3, e.y - 39, { scale: 2, color: '#042a1c' });
      } else if (e.type === 'board') {
        rect(e.x - 30, e.y - 48, 60, 44, '#6b4a2a'); frameRect(e.x - 30, e.y - 48, 60, 44, '#4a3220', 2);
        for (let i = 0; i < 4; i++) rect(e.x - 24 + (i % 2) * 26, e.y - 42 + Math.floor(i / 2) * 18, 22, 15, '#e8e0cc');
        rect(e.x - 4, e.y - 4, 8, 8, '#4a3220');
        textC('MISSIONS', e.x, e.y + 6, { scale: 1, color: PAL.yellow, shadow: '#000' });
      } else if (e.type === 'chest') {
        drawChest(e.x - 24, e.y - 48, 3, !!G.flags['chest_' + e.id]);
      } else if (e.type === 'terminal') {
        drawTerminal(e.x - 24, e.y - 60, 3, this.t);
      } else if (e.type === 'sign') {
        drawSign(e.x - 24, e.y - 60, 3, e.col || PAL.cyan);
      }
    });
    // interaction prompt
    if (this.near && !Dlg.active) {
      const y = this.near.y - 70 + Math.sin(this.t * 6) * 3;
      textC('[ Z ]', this.near.x, y, { scale: 2, color: PAL.yellow, shadow: '#000' });
    }
    FX.drawWorld();
    ctx.restore();

    // HUD
    HUD.draw({ area: a.name, objective: Story.objective() });
    if (this.area.hint && this.t < 7) {
      ctx.save(); ctx.globalAlpha = clamp(7 - this.t, 0, 1);
      textC(this.area.hint, W / 2, H - 52, { scale: 1, color: '#8fa0bd', shadow: '#000' });
      ctx.restore();
    }
  },

  drawPlayer() {
    const u = 3;
    if (Emote.playing) {
      if (drawEmoteAnim(this.p.x - 8 * u, this.p.y - 20 * u + 4, u)) return;
    }
    drawActor(skinSprite(), this.p.x - 8 * u, this.p.y - 20 * u + 4, u,
      { t: this.t, dir: this.p.dir, walking: this.p.walking, frame: this.p.frame });
    // orange trails behind you
    const ox = this.p.x - 22 + Math.sin(this.t * 2) * 4, oy = this.p.y - 14 + Math.cos(this.t * 2.6) * 3;
    drawActor('orange', ox - 8 * 2, oy - 10 * 2, 2, { t: this.t, hop: true });
  }
};

/* ===========================================================
   AREA DEFINITIONS
   =========================================================== */
const AREAS = {};

/* ---- shared backdrop painters ---- */
function groundTiles(x, y, w, h, c1, c2, size = 32) {
  rect(x, y, w, h, c1);
  for (let gy = 0; gy < h; gy += size)
    for (let gx = 0; gx < w; gx += size)
      if (((gx / size) + (gy / size)) % 2 === 0) rect(x + gx, y + gy, size, size, c2);
}
function roadH(y, h) {
  rect(0, y, 4000, h, '#23262e');
  rect(0, y, 4000, 3, '#2f333d');
  for (let x = 10; x < 4000; x += 70) rect(x, y + h / 2 - 2, 36, 4, '#d9d2b0');
}
function building(x, y, w, h, col, win = '#ffd79a') {
  rect(x, y, w, h, col);
  rect(x, y, w, 5, '#00000055');
  for (let wy = 10; wy < h - 14; wy += 22)
    for (let wx = 8; wx < w - 12; wx += 20)
      rect(x + wx, y + wy, 12, 14, ((wx + wy + x) % 3) ? '#1a2030' : win);
  rect(x + w / 2 - 14, y + h - 26, 28, 26, '#1a1f2b');
}

/* =============== PROLOGUE: SHIBUYA SUBWAY (age 10) =============== */
AREAS.subway_prologue = {
  name: 'SHIBUYA STN. B3 — 2 YEARS AGO', music: 'shibuya', bg: 'subway',
  w: 1280, h: 480, spawn: [90, 330],
  hint: 'Arrows/WASD to move. Z to interact.',
  draw(t) {
    rect(0, 0, 1280, 480, '#07080e');
    rect(0, 0, 1280, 150, '#0d0f16');
    for (let i = 0; i < 18; i++) { rect(i * 74, 60, 20, 180, '#161b28'); rect(i * 74 + 15, 60, 5, 180, '#0b0e15'); }
    // platform
    groundTiles(0, 240, 1280, 240, '#171b24', '#13161d', 40);
    rect(0, 236, 1280, 6, '#ffd24a');
    for (let x = 0; x < 1280; x += 20) rect(x, 244, 10, 4, '#2a2f3a');
    // flickering lights
    for (let i = 0; i < 9; i++) {
      const on = Math.sin(t * 9 + i * 2) > -.6;
      rect(i * 150 + 40, 70, 70, 10, on ? '#ffe9a8' : '#4a4a3a');
      if (on) { ctx.save(); ctx.globalAlpha = .07; rect(i * 150 + 10, 70, 130, 220, '#ffe9a8'); ctx.restore(); }
    }
    // blood / debris
    rect(300, 300, 60, 8, '#3a0c10'); rect(520, 390, 90, 10, '#3a0c10');
    for (let i = 0; i < 24; i++) rect((i * 97) % 1280, 270 + (i * 53) % 190, 8, 4, '#2a2f3a');
    // smoke
    ctx.save(); ctx.globalAlpha = .12;
    for (let i = 0; i < 8; i++) circle(((i * 211 + t * 14) % 1400) - 60, 200 + Math.sin(t + i) * 20, 70, '#6a7893');
    ctx.restore();
  },
  solids: [{ x: 0, y: 0, w: 1280, h: 244 }],
  deco: [{ k: 'train', x: 80, y: 120, u: 4 }, { k: 'train', x: 340, y: 120, u: 4 }],
  ents: []
};

/* =============== ROOFTOP (Gojo recruitment) =============== */
AREAS.rooftop = {
  name: 'TOKYO ROOFTOP — RAIN', music: 'city', bg: 'rooftop',
  w: 640, h: 480, spawn: [90, 360],
  draw(t) {
    rect(0, 0, 640, 480, '#060912');
    for (let i = 0; i < 90; i++) rect((i * 97) % 640, (i * 41) % 200, 2, 2, '#aab6d8');
    // skyline
    for (let i = 0; i < 12; i++) {
      const bx = (i * 57) % 640, bh = 50 + ((i * 37) % 90);
      building(bx, 200 - bh, 48, bh, '#0a0f1c');
    }
    // roof deck
    groundTiles(0, 240, 640, 240, '#1a1f2b', '#161a25', 32);
    rect(0, 236, 640, 5, '#2a3450');
    // puddles reflecting neon
    [[120, 330], [400, 390], [280, 300], [520, 350]].forEach(([x, y], i) => {
      ctx.save(); ctx.globalAlpha = .35;
      ctx.beginPath(); ctx.ellipse(x, y, 34, 10, 0, 0, TAU);
      ctx.fillStyle = i % 2 ? '#3ddcff' : '#ff8c00'; ctx.fill(); ctx.restore();
    });
    // railing
    rect(0, 232, 640, 4, '#39455c');
    for (let x = 10; x < 640; x += 40) rect(x, 212, 4, 24, '#39455c');
    // rain
    for (let i = 0; i < 70; i++) {
      const x = (i * 83 + (t * 800 | 0)) % 640, y = (i * 53 + (t * 1100 | 0)) % 480;
      line(x, y, x - 5, y + 14, '#49597c', 1);
    }
  },
  solids: [{ x: 0, y: 0, w: 640, h: 236 }],
  ents: []
};

/* =============== JUJUTSU HIGH (hub) =============== */
AREAS.jjhigh = {
  name: 'TOKYO JUJUTSU HIGH', music: 'high', bg: 'school',
  w: 1280, h: 480, spawn: [200, 340],
  hint: 'C = menu   B = emotes   / = command console',
  draw(t) {
    rect(0, 0, 1280, 480, '#0a1420');
    dither(0, 0, 1280, 160, '#0a1420', '#16293a', .2);
    // distant mountains
    for (let i = 0; i < 7; i++) {
      const mx = i * 200 - 40;
      ctx.fillStyle = '#132231'; ctx.beginPath();
      ctx.moveTo(mx, 170); ctx.lineTo(mx + 100, 70); ctx.lineTo(mx + 200, 170); ctx.closePath(); ctx.fill();
    }
    // grass
    groundTiles(0, 160, 1280, 320, '#1b3524', '#17301f', 40);
    // stone path
    rect(0, 300, 1280, 60, '#2a3140');
    for (let x = 0; x < 1280; x += 48) { rect(x + 2, 304, 44, 24, '#333b4c'); rect(x + 2, 332, 44, 24, '#2e3545'); }
    // school building
    rect(430, 90, 420, 160, '#2b2017');
    rect(430, 90, 420, 14, '#1d1610');
    rect(420, 82, 440, 12, '#3a2a1c');
    for (let i = 0; i < 8; i++) rect(450 + i * 48, 120, 30, 40, ((i % 2) ? '#1a2030' : '#ffd79a'));
    rect(610, 190, 60, 60, '#1a1f2b');
    rect(610, 190, 60, 6, '#8a6134');
    textC('TOKYO JUJUTSU HIGH', 640, 60, { scale: 2, color: '#8a6134' });
    // sakura petals
    ctx.save(); ctx.globalAlpha = .6;
    for (let i = 0; i < 26; i++) {
      const x = (i * 149 + t * 24) % 1340 - 30;
      const y = ((i * 97) + t * 36) % 500;
      rect(x, y, 3, 3, '#ff9ec4');
    }
    ctx.restore();
  },
  solids: [
    { x: 0, y: 0, w: 1280, h: 250 },
    { x: 0, y: 0, w: 8, h: 480 }, { x: 1272, y: 0, w: 8, h: 480 }
  ],
  deco: [
    { k: 'tree', x: 60, y: 200, u: 4 }, { k: 'tree', x: 180, y: 190, u: 4 },
    { k: 'tree', x: 1000, y: 195, u: 4 }, { k: 'tree', x: 1140, y: 205, u: 4 },
    { k: 'torii', x: 300, y: 180, u: 4 }, { k: 'lamp', x: 420, y: 250, u: 3 },
    { k: 'lamp', x: 860, y: 250, u: 3 }
  ],
  ents: []
};

/* =============== KENJI'S DORM ROOM =============== */
AREAS.dorm = {
  name: "KENJI'S ROOM", music: 'high', bg: 'school',
  w: 640, h: 480, spawn: [320, 380],
  draw(t) {
    rect(0, 0, 640, 480, '#141826');
    // wall
    rect(0, 0, 640, 220, '#1d2334');
    for (let x = 0; x < 640; x += 64) rect(x, 0, 2, 220, '#232b40');
    // floor
    groundTiles(0, 220, 640, 260, '#3a2d20', '#33281c', 48);
    // window with night sky
    rect(60, 50, 120, 90, '#060912'); frameRect(60, 50, 120, 90, '#39455c', 4);
    for (let i = 0; i < 16; i++) rect(66 + (i * 37) % 108, 56 + (i * 53) % 78, 2, 2, '#cfd8ff');
    // bed
    rect(420, 230, 160, 90, '#2a3450'); rect(420, 230, 160, 24, '#e8ecf7');
    rect(420, 310, 160, 12, '#1d2740');
    // tv / monitor wall
    rect(230, 70, 180, 110, '#0b0f1a'); frameRect(230, 70, 180, 110, '#39455c', 3);
    for (let i = 0; i < 5; i++) rect(240, 82 + i * 18, 20 + ((i * 7 + (t * 6 | 0)) % 140), 12, i % 2 ? '#1d3157' : '#0f2a44');
    textC('NOW PLAYING: everything', 320, 186, { scale: 1, color: '#55637d' });
    // snack pile
    for (let i = 0; i < 9; i++) rect(100 + (i * 23) % 120, 350 + (i * 17) % 40, 14, 9, ['#ff8c00', '#3ddcff', '#ffe14d', '#ff4fa3'][i % 4]);
    textC('(snack graveyard)', 160, 410, { scale: 1, color: '#55637d' });
  },
  solids: [{ x: 0, y: 0, w: 640, h: 224 }, { x: 410, y: 224, w: 180, h: 100 }],
  deco: [{ k: 'desk', x: 240, y: 250, u: 4 }, { k: 'terminal', x: 60, y: 240, u: 3 }],
  ents: []
};

/* =============== JUVENILE DETENTION (mission 1) =============== */
AREAS.detention = {
  name: 'ABANDONED JUVENILE DETENTION', music: 'shibuya', bg: 'subway',
  w: 1280, h: 480, spawn: [70, 340],
  draw(t) {
    rect(0, 0, 1280, 480, '#0b0c12');
    rect(0, 0, 1280, 200, '#14161f');
    for (let i = 0; i < 16; i++) {
      rect(i * 82 + 10, 60, 56, 120, '#0d0f16');
      for (let b = 0; b < 5; b++) rect(i * 82 + 14 + b * 11, 64, 4, 112, '#2a2f3a');
    }
    groundTiles(0, 200, 1280, 280, '#1a1c24', '#16181f', 40);
    rect(0, 196, 1280, 5, '#2a2f3a');
    // graffiti + grime
    text('GRADE 2 SIGHTING', 300, 150, { scale: 2, color: '#3a1c22' });
    for (let i = 0; i < 40; i++) rect((i * 137) % 1280, 210 + (i * 71) % 250, 10, 5, '#22252e');
    ctx.save(); ctx.globalAlpha = .1;
    for (let i = 0; i < 7; i++) circle(((i * 311 + t * 9) % 1400) - 60, 260 + Math.sin(t + i) * 24, 90, '#6a7893');
    ctx.restore();
  },
  solids: [{ x: 0, y: 0, w: 1280, h: 204 }],
  encounters: ['grade4', 'swarm'],
  deco: [{ k: 'lamp', x: 200, y: 210, u: 3 }, { k: 'lamp', x: 700, y: 210, u: 3 }],
  ents: []
};

/* =============== YASOHACHI BRIDGE =============== */
AREAS.bridge = {
  name: 'YASOHACHI BRIDGE', music: 'city', bg: 'city',
  w: 1280, h: 480, spawn: [70, 350],
  draw(t) {
    rect(0, 0, 1280, 480, '#070a16');
    dither(0, 0, 1280, 200, '#070a16', '#15203a', .1);
    for (let i = 0; i < 70; i++) rect((i * 131) % 1280, (i * 47) % 170, 2, 2, '#aab6d8');
    // river
    rect(0, 200, 1280, 110, '#102033');
    for (let i = 0; i < 40; i++) {
      const x = (i * 71 + (t * 26 | 0)) % 1280;
      rect(x, 210 + (i * 23) % 90, 24, 2, '#1c3550');
    }
    // bridge deck
    rect(0, 300, 1280, 70, '#2a2f3a');
    rect(0, 296, 1280, 6, '#39455c');
    rect(0, 366, 1280, 6, '#1d2028');
    for (let x = 0; x < 1280; x += 60) rect(x, 272, 6, 26, '#39455c');
    rect(0, 268, 1280, 5, '#4a566e');
    groundTiles(0, 372, 1280, 108, '#1a1c24', '#16181f', 40);
    for (let x = 20; x < 1280; x += 90) rect(x, 306, 50, 4, '#d9d2b0');
  },
  solids: [{ x: 0, y: 0, w: 1280, h: 300 }, { x: 0, y: 372, w: 1280, h: 10 }],
  deco: [{ k: 'lamp', x: 150, y: 250, u: 3 }, { k: 'lamp', x: 560, y: 250, u: 3 }, { k: 'lamp', x: 980, y: 250, u: 3 }],
  ents: []
};

/* =============== KYOTO GOODWILL ARENA =============== */
AREAS.arena_kyoto = {
  name: 'KYOTO GOODWILL EVENT — ARENA', music: 'high', bg: 'school',
  w: 640, h: 480, spawn: [320, 400],
  draw(t) {
    rect(0, 0, 640, 480, '#0e1a12');
    dither(0, 0, 640, 150, '#0e1a12', '#1d3324', .2);
    // stands
    for (let r = 0; r < 4; r++) {
      rect(0, 90 + r * 22, 640, 20, r % 2 ? '#1d2334' : '#232b40');
      for (let i = 0; i < 20; i++) if ((i + r) % 3) rect(i * 32 + 6, 92 + r * 22, 14, 14, ['#ff8fa3', '#9ab8ff', '#ffc08a', '#e3c98a'][(i + r) % 4]);
    }
    rect(0, 178, 640, 8, '#39455c');
    // sand arena
    groundTiles(0, 186, 640, 294, '#5a4a30', '#51422a', 40);
    ctx.save(); ctx.globalAlpha = .5;
    circle(320, 340, 170, '#6b5838', false); ctx.lineWidth = 4; ctx.restore();
    textC('GOODWILL EVENT', 320, 60, { scale: 2, color: '#8a6134' });
  },
  solids: [{ x: 0, y: 0, w: 640, h: 190 }],
  ents: []
};

/* =============== FOREST (Hanami) =============== */
AREAS.forest = {
  name: 'JUJUTSU HIGH — WEST WOODS', music: 'high', bg: 'school',
  w: 1280, h: 480, spawn: [70, 360],
  draw(t) {
    rect(0, 0, 1280, 480, '#0a1a12');
    dither(0, 0, 1280, 200, '#0a1a12', '#143024', .2);
    groundTiles(0, 180, 1280, 300, '#16331f', '#122b1a', 40);
    // winding dirt path
    for (let x = 0; x < 1280; x += 20) {
      const y = 330 + Math.sin(x * .012) * 40;
      rect(x, y, 22, 36, '#3a2d20');
    }
    // mist
    ctx.save(); ctx.globalAlpha = .13;
    for (let i = 0; i < 10; i++) circle(((i * 191 + t * 11) % 1400) - 60, 250 + Math.sin(t * .8 + i) * 26, 86, '#7ba85f');
    ctx.restore();
    // pollen
    for (let i = 0; i < 26; i++) {
      const x = (i * 157 + t * 16) % 1300, y = 200 + ((i * 83) + t * 22) % 260;
      rect(x, y, 2, 2, '#ffd79a');
    }
  },
  solids: [{ x: 0, y: 0, w: 1280, h: 184 }],
  encounters: ['grade4', 'grade2', 'swarm'],
  deco: (() => {
    const d = [];
    for (let i = 0; i < 16; i++) d.push({ k: 'tree', x: 40 + i * 78, y: 150 + (i % 3) * 18, u: 4 });
    return d;
  })(),
  ents: []
};

/* =============== SHIBUYA STATION (incident) =============== */
AREAS.shibuya = {
  name: 'SHIBUYA STN. — OCT 31', music: 'shibuya', bg: 'subway',
  w: 1920, h: 480, spawn: [70, 350],
  draw(t) {
    rect(0, 0, 1920, 480, '#07080e');
    rect(0, 0, 1920, 170, '#0d0f16');
    for (let i = 0; i < 26; i++) { rect(i * 76, 50, 22, 200, '#161b28'); rect(i * 76 + 17, 50, 5, 200, '#0b0e15'); }
    // curtain barrier glow at the far end
    ctx.save(); ctx.globalAlpha = .22 + Math.sin(t * 2) * .06;
    rect(1700, 0, 220, 480, '#6b2fd6'); ctx.restore();
    for (let i = 0; i < 20; i++) rect(1700 + (i * 37) % 200, (i * 61) % 480, 3, 3, '#d9a2ff');
    groundTiles(0, 250, 1920, 230, '#171b24', '#13161d', 40);
    rect(0, 246, 1920, 6, '#ffd24a');
    // crowd debris, dropped phones, broken escalator
    for (let i = 0; i < 60; i++) rect((i * 97) % 1920, 270 + (i * 53) % 190, 9, 5, '#262a34');
    rect(900, 190, 200, 60, '#1a1f2b');
    for (let i = 0; i < 10; i++) rect(900 + i * 20, 190 + i * 6, 20, 8, '#2a3040');
    // flickering emergency light
    const on = Math.sin(t * 7) > -.3;
    for (let i = 0; i < 12; i++) {
      rect(i * 160 + 30, 60, 60, 8, on ? '#ff6b6b' : '#4a2a2a');
      if (on) { ctx.save(); ctx.globalAlpha = .06; rect(i * 160, 60, 120, 200, '#ff6b6b'); ctx.restore(); }
    }
    ctx.save(); ctx.globalAlpha = .14;
    for (let i = 0; i < 12; i++) circle(((i * 271 + t * 13) % 2100) - 90, 220 + Math.sin(t + i) * 22, 95, '#6a7893');
    ctx.restore();
  },
  solids: [{ x: 0, y: 0, w: 1920, h: 254 }],
  encounters: ['grade2', 'grade1', 'swarm'],
  deco: [{ k: 'train', x: 120, y: 120, u: 4 }, { k: 'train', x: 420, y: 120, u: 4 }, { k: 'train', x: 1500, y: 120, u: 4 }],
  ents: []
};

/* =============== SHINJUKU (Sukuna) =============== */
AREAS.shinjuku = {
  name: 'SHINJUKU — RUINED WASTELAND', music: 'sukuna', bg: 'shinjuku',
  w: 1280, h: 480, spawn: [70, 370],
  draw(t) {
    rect(0, 0, 1280, 480, '#140a10');
    dither(0, 0, 1280, 230, '#140a10', '#3a161c', .05);
    // burning skyline, half-collapsed
    for (let i = 0; i < 14; i++) {
      const bx = (i * 93) % 1280, bh = 60 + ((i * 67) % 130);
      rect(bx, 230 - bh, 60, bh, '#1c0f14');
      // sheared top
      rect(bx, 230 - bh, 60, 8, '#2a1118');
      for (let k = 0; k < 4; k++) rect(bx + 6 + k * 14, 230 - bh + 20 + (k % 2) * 20, 10, 14, (k % 2) ? '#ff7a2a' : '#2a1118');
    }
    groundTiles(0, 230, 1280, 250, '#1f1216', '#1a0f13', 40);
    // rubble + craters
    for (let i = 0; i < 50; i++) rect((i * 137) % 1280, 250 + (i * 71) % 220, 14, 7, '#2a1b20');
    [[300, 380], [800, 330], [1100, 420]].forEach(([x, y]) => {
      ctx.save(); ctx.globalAlpha = .6; ctx.beginPath(); ctx.ellipse(x, y, 60, 18, 0, 0, TAU);
      ctx.fillStyle = '#120a0e'; ctx.fill(); ctx.restore();
    });
    // embers
    for (let i = 0; i < 30; i++) {
      const x = (i * 163 + t * 18) % 1280, y = 480 - ((i * 97 + t * 60) % 480);
      rect(x, y, 2, 2, (i % 3) ? '#ff7a2a' : '#ffd24a');
    }
  },
  solids: [{ x: 0, y: 0, w: 1280, h: 234 }],
  deco: [],
  ents: []
};

/* =============== ORANGE'S ARENA (challenges) =============== */
AREAS.arena_orange = {
  name: "ORANGE'S TRAINING VOID", music: 'orange', bg: 'school',
  w: 640, h: 480, spawn: [320, 390],
  draw(t) {
    rect(0, 0, 640, 480, '#120a02');
    // orange grid void
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i <= 16; i++) {
      const x = (i / 16) * 640;
      line(x, 200, 320 + (x - 320) * 3.2, 480, '#4a2a06', 1);
    }
    for (let i = 1; i < 12; i++) {
      const y = 200 + Math.pow(i / 12, 2.2) * 280;
      line(0, y, 640, y, '#4a2a06', 1);
    }
    ctx.restore();
    rect(0, 196, 640, 4, PAL.orange);
    // floating pumpkins
    for (let i = 0; i < 6; i++) {
      const x = 60 + i * 100 + Math.sin(t + i) * 14, y = 90 + Math.cos(t * 1.3 + i) * 18;
      drawActor('orange', x, y, 2, { t: t + i, hop: true });
    }
    textC('ORANGE TRAINING VOID', 320, 40, { scale: 2, color: PAL.orange });
    textC('"i built this. with my MIND."', 320, 62, { scale: 1, color: PAL.orange2 });
  },
  solids: [{ x: 0, y: 0, w: 640, h: 200 }],
  ents: []
};

/* =============== EPILOGUE: CULLING GAME ANNOUNCEMENT =============== */
AREAS.culling = {
  name: 'TOKYO — SOMEWHERE ABOVE IT ALL', music: 'culling', bg: 'city',
  w: 640, h: 480, spawn: [120, 360],
  draw(t) {
    rect(0, 0, 640, 480, '#06040a');
    // colony barriers rising over the skyline
    for (let i = 0; i < 10; i++) {
      const bx = (i * 67) % 640, bh = 60 + ((i * 53) % 100);
      building(bx, 240 - bh, 56, bh, '#0b0a12', '#2a2440');
    }
    groundTiles(0, 240, 640, 240, '#13101c', '#100d18', 32);
    // the ritual veil
    ctx.save();
    ctx.globalAlpha = .3 + Math.sin(t * 1.2) * .08;
    for (let i = 0; i < 9; i++) {
      const r = 60 + i * 44 + Math.sin(t + i) * 8;
      ctx.strokeStyle = i % 2 ? '#9b4dff' : '#ff3b3b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(320, 160, r, r * .4, 0, 0, TAU); ctx.stroke();
    }
    ctx.restore();
    for (let i = 0; i < 30; i++) {
      const x = (i * 157 + t * 12) % 640, y = (i * 83 + t * 20) % 240;
      rect(x, y, 2, 2, i % 2 ? '#d9a2ff' : '#ff8c8c');
    }
  },
  solids: [{ x: 0, y: 0, w: 640, h: 244 }],
  ents: []
};

/* ===========================================================
   CHAPTER 1 EXTRA + CHAPTER 2 AREAS
   =========================================================== */

AREAS.theatre = {
  name: 'CINEMA — SCREEN 3', music: 'shibuya', bg: 'subway',
  w: 640, h: 480, spawn: [80, 380],
  draw(t) {
    rect(0, 0, 640, 480, '#0a0710');
    rect(60, 40, 520, 200, '#0d0d12');
    frameRect(60, 40, 520, 200, '#2a1b2a', 4);
    // the film still running
    ctx.save(); ctx.globalAlpha = .5 + Math.sin(t * 9) * .08;
    rect(70, 50, 500, 180, '#1a1424');
    for (let i = 0; i < 9; i++) rect(90 + ((i * 71 + (t * 40 | 0)) % 460), 70 + (i * 23) % 140, 30, 10, '#3a2a4a');
    ctx.restore();
    groundTiles(0, 250, 640, 230, '#2a1420', '#231018', 32);
    // rows of seats
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 10; c++)
        rect(20 + c * 62, 300 + r * 46, 44, 34, r % 2 ? '#4a1f2e' : '#3e1826');
    rect(0, 246, 640, 4, '#4a1f2e');
  },
  solids: [{ x: 0, y: 0, w: 640, h: 250 }],
  ents: []
};

AREAS.past_tokyo = {
  name: 'OKINAWA — TWELVE YEARS AGO', music: 'high', bg: 'city',
  w: 1280, h: 480, spawn: [70, 360],
  draw(t) {
    rect(0, 0, 1280, 480, '#10203a');
    dither(0, 0, 1280, 220, '#10203a', '#2a4a7a', .3);
    // sun low over the sea
    circle(980, 150, 54, '#ffb347');
    rect(0, 220, 1280, 120, '#1d4a6b');
    for (let i = 0; i < 50; i++) {
      const x = (i * 53 + (t * 22 | 0)) % 1280;
      rect(x, 232 + (i * 17) % 100, 26, 2, '#2f6a92');
    }
    // beach
    groundTiles(0, 330, 1280, 150, '#c9b183', '#bda575', 40);
    rect(0, 326, 1280, 5, '#e3d2a8');
    for (let i = 0; i < 26; i++) rect((i * 97) % 1280, 350 + (i * 61) % 110, 7, 4, '#a8906a');
  },
  solids: [{ x: 0, y: 0, w: 1280, h: 330 }],
  deco: [{ k: 'tree', x: 200, y: 280, u: 4 }, { k: 'tree', x: 1020, y: 290, u: 4 }],
  ents: []
};

AREAS.tengen = {
  name: "TENGEN'S CHAMBER", music: 'domain', bg: 'school',
  w: 640, h: 480, spawn: [320, 400],
  draw(t) {
    rect(0, 0, 640, 480, '#0b0814');
    // barrier lattice
    ctx.save(); ctx.globalAlpha = .4;
    for (let i = 0; i < 10; i++) {
      const r = 50 + i * 40 + Math.sin(t + i) * 6;
      ctx.strokeStyle = i % 2 ? '#9b4dff' : '#3ddcff'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(320, 200, r, r * .5, 0, 0, TAU); ctx.stroke();
    }
    ctx.restore();
    groundTiles(0, 300, 640, 180, '#1d1830', '#171326', 32);
    rect(0, 296, 640, 4, '#9b4dff');
    // the throne
    rect(270, 180, 100, 120, '#2a2140'); rect(260, 170, 120, 16, '#3a2f55');
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * TAU + t * .3;
      rect(320 + Math.cos(a) * 140, 200 + Math.sin(a) * 70, 3, 3, '#d9a2ff');
    }
  },
  solids: [{ x: 0, y: 0, w: 640, h: 300 }],
  ents: []
};

AREAS.colony1 = {
  name: 'TOKYO NO.1 COLONY', music: 'culling', bg: 'city',
  w: 1280, h: 480, spawn: [70, 360],
  draw(t) {
    rect(0, 0, 1280, 480, '#0a0812');
    dither(0, 0, 1280, 200, '#0a0812', '#1c1430', .15);
    for (let i = 0; i < 16; i++) {
      const bx = (i * 83) % 1280, bh = 70 + ((i * 59) % 120);
      building(bx, 230 - bh, 62, bh, '#120f1c', '#2a2440');
    }
    // the colony barrier wall, humming
    ctx.save(); ctx.globalAlpha = .25 + Math.sin(t * 1.6) * .07;
    rect(0, 0, 1280, 240, '#6b2fd6'); ctx.restore();
    for (let i = 0; i < 30; i++) rect((i * 137 + (t * 9 | 0)) % 1280, (i * 71) % 230, 3, 3, '#d9a2ff');
    groundTiles(0, 230, 1280, 250, '#171326', '#13101f', 40);
    roadH(320, 70);
    for (let i = 0; i < 30; i++) rect((i * 97) % 1280, 250 + (i * 53) % 190, 12, 6, '#231b36');
  },
  solids: [{ x: 0, y: 0, w: 1280, h: 234 }],
  encounters: ['grade2', 'grade1'],
  deco: [{ k: 'lamp', x: 200, y: 250, u: 3 }, { k: 'lamp', x: 700, y: 250, u: 3 }, { k: 'sign', x: 420, y: 250, u: 3, col: '#9b4dff' }],
  ents: []
};

AREAS.colony2 = {
  name: 'TOKYO NO.2 COLONY — THE PARLOUR', music: 'orange', bg: 'city',
  w: 1280, h: 480, spawn: [70, 370],
  draw(t) {
    rect(0, 0, 1280, 480, '#1a0a14');
    dither(0, 0, 1280, 220, '#1a0a14', '#2e1024', .2);
    // neon pachinko strip
    for (let i = 0; i < 9; i++) {
      const bx = i * 150, on = Math.sin(t * 4 + i) > -.4;
      rect(bx, 90, 130, 150, '#241020');
      rect(bx + 10, 100, 110, 34, on ? '#ff4fa3' : '#5a1b38');
      rect(bx + 10, 142, 110, 90, '#160a12');
      for (let k = 0; k < 12; k++) rect(bx + 16 + (k % 4) * 27, 150 + Math.floor(k / 4) * 28, 20, 20, (k + i) % 3 ? '#2a1420' : '#ffd24a');
    }
    groundTiles(0, 240, 1280, 240, '#2a1420', '#231018', 40);
    rect(0, 236, 1280, 4, '#ffd24a');
    // coins on the floor
    for (let i = 0; i < 40; i++) rect((i * 73) % 1280, 260 + (i * 51) % 200, 6, 6, '#ffd24a');
    ctx.save(); ctx.globalAlpha = .12 + Math.abs(Math.sin(t * 3)) * .1;
    for (let r = 0; r < 10; r++) {
      const a = (r / 10) * TAU + t;
      ctx.fillStyle = r % 2 ? '#ffd24a' : '#ff4fa3';
      ctx.beginPath(); ctx.moveTo(640, 300);
      ctx.lineTo(640 + Math.cos(a - .1) * 700, 300 + Math.sin(a - .1) * 700);
      ctx.lineTo(640 + Math.cos(a + .1) * 700, 300 + Math.sin(a + .1) * 700);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  },
  solids: [{ x: 0, y: 0, w: 1280, h: 244 }],
  ents: []
};

AREAS.sendai = {
  name: 'SENDAI COLONY', music: 'culling', bg: 'city',
  w: 1280, h: 480, spawn: [70, 360],
  draw(t) {
    rect(0, 0, 1280, 480, '#0a1018');
    dither(0, 0, 1280, 210, '#0a1018', '#182a3a', .2);
    for (let i = 0; i < 14; i++) {
      const bx = (i * 95) % 1280, bh = 60 + ((i * 71) % 110);
      building(bx, 220 - bh, 70, bh, '#101a26', '#2a4055');
      if (i % 3 === 0) { rect(bx + 10, 220 - bh - 18, 50, 18, '#1a2a3a'); }
    }
    groundTiles(0, 220, 1280, 260, '#14202c', '#101a24', 40);
    // snow drifting through the barrier
    for (let i = 0; i < 60; i++) {
      const x = (i * 83 + t * 18) % 1280, y = (i * 61 + t * 42) % 480;
      rect(x, y, 2, 2, '#cfe3ff');
    }
    rect(0, 216, 1280, 4, '#3a5a7a');
  },
  solids: [{ x: 0, y: 0, w: 1280, h: 224 }],
  encounters: ['grade1', 'fingerBearer'],
  deco: [{ k: 'torii', x: 300, y: 160, u: 4 }, { k: 'lamp', x: 820, y: 240, u: 3 }],
  ents: []
};

AREAS.courthouse = {
  name: 'TOKYO DISTRICT COURT — SEALED', music: 'domain', bg: 'school',
  w: 640, h: 480, spawn: [320, 410],
  draw(t) {
    rect(0, 0, 640, 480, '#0d0b14');
    dither(0, 0, 640, 200, '#0d0b14', '#191430', .25);
    // pillars and pediment
    rect(60, 60, 520, 24, '#2a2438');
    for (let i = 0; i < 6; i++) rect(90 + i * 80, 84, 34, 160, '#241f33');
    rect(60, 244, 520, 18, '#2a2438');
    groundTiles(0, 262, 640, 220, '#171326', '#13101f', 32);
    // steps
    for (let i = 0; i < 4; i++) rect(100 - i * 10, 262 + i * 12, 440 + i * 20, 12, '#201a30');
    // scales above the door
    const sway = Math.sin(t * 1.2) * 5;
    rect(318, 100, 4, 40, '#c9a227');
    rect(280, 118 + sway, 80, 3, '#c9a227');
    circle(282, 128 + sway, 9, '#c9a227', false);
    circle(358, 128 - sway, 9, '#c9a227', false);
  },
  solids: [{ x: 0, y: 0, w: 640, h: 266 }],
  ents: []
};

AREAS.shinjuku_showdown = {
  name: 'SHINJUKU — DECEMBER 24TH', music: 'sukuna', bg: 'shinjuku',
  w: 1280, h: 480, spawn: [70, 370],
  draw(t) {
    rect(0, 0, 1280, 480, '#0d0810');
    dither(0, 0, 1280, 230, '#0d0810', '#2a1020', .1);
    for (let i = 0; i < 16; i++) {
      const bx = (i * 83) % 1280, bh = 80 + ((i * 61) % 140);
      rect(bx, 230 - bh, 66, bh, '#160e18');
      for (let k = 0; k < 5; k++) rect(bx + 8 + (k % 3) * 20, 230 - bh + 14 + k * 22, 12, 14, (k + i) % 4 ? '#241626' : '#ff7a2a');
    }
    // the sky split open
    ctx.save(); ctx.globalAlpha = .3 + Math.sin(t * 2) * .1;
    for (let i = 0; i < 6; i++) {
      const y = 20 + i * 14;
      line(200 + i * 40, 0, 900 - i * 30, y + 60, '#9b4dff', 2);
    }
    ctx.restore();
    groundTiles(0, 230, 1280, 250, '#1a1016', '#160d12', 40);
    for (let i = 0; i < 60; i++) rect((i * 113) % 1280, 250 + (i * 67) % 220, 14, 7, '#2a1b20');
    // craters
    [[260, 390], [720, 330], [1080, 410]].forEach(([x, y]) => {
      ctx.save(); ctx.globalAlpha = .65; ctx.beginPath(); ctx.ellipse(x, y, 70, 20, 0, 0, TAU);
      ctx.fillStyle = '#0d0509'; ctx.fill(); ctx.restore();
    });
    for (let i = 0; i < 34; i++) {
      const x = (i * 163 + t * 16) % 1280, y = 480 - ((i * 97 + t * 54) % 480);
      rect(x, y, 2, 2, (i % 3) ? '#ff7a2a' : '#ffd24a');
    }
  },
  solids: [{ x: 0, y: 0, w: 1280, h: 234 }],
  deco: [],
  ents: []
};
