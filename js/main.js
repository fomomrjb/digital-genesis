/* ===========================================================
   DIGITAL GENESIS — main.js
   Boot, scene router, title screen, mission board,
   challenge terminal, credits, and the main loop.
   =========================================================== */
'use strict';

const Game = {
  mode: 'title', t: 0, last: 0, booted: false,
  titleIdx: 0, titleT: 0, chapIdx: 0,
  boardIdx: 0, boardScroll: 0, boardKind: 'missions',
  chalIdx: 0, rush: null, rushIdx: 0,
  creditsT: 0, prevMusic: null,

  /* ---------- scene switches ---------- */
  toTitle() {
    this.mode = 'title'; this.titleIdx = G.hasSave() ? 0 : 0; this.titleT = 0;
    Battle.active = false; DomainFight.active = false; OrangeFight.active = false;
    Over.active = false; Shop.open = false; Menu.open = false; Dlg.active = false;
    FX.clear(); Audio.play('title');
  },
  newGame() {
    G.reset(); G.wipe();
    Story.buildHub();
    Fade.out(() => { Story.begin(); Fade.in(); }, 2.2);
  },
  continueGame() {
    if (!G.load()) { this.newGame(); return; }
    Story.buildHub(); Story.syncUnlocks();
    Fade.out(() => {
      this.mode = 'over';
      const a = G.flags.area && AREAS[G.flags.area] ? G.flags.area : MISSIONS[G.mission].area;
      const m = MISSIONS[G.mission]; if (m) m.setup();
      Story.buildHub();
      Over.enter(a);
      Fade.in();
    }, 2.2);
  },
  toOverworld(area) {
    this.mode = 'over';
    Battle.active = false; DomainFight.active = false; OrangeFight.active = false; Shop.open = false;
    FX.clear();
    const id = area || Over.areaId || (MISSIONS[G.mission] && MISSIONS[G.mission].area) || 'jjhigh';
    Over.enter(id);
  },
  resumeMusic() {
    if (Over.active && Over.area) { Audio.cur = null; Audio.play(Over.area.music || 'city'); }
  },
  battle(eid, opts = {}) {
    this.mode = 'battle';
    const o = Object.assign({}, opts);
    if (!o.onWin) o.onWin = () => { this.toOverworld(); };
    if (!o.onFlee) o.onFlee = () => { this.toOverworld(); };
    Battle.start(eid, o);
  },
  shop(who) { this.prevMode = this.mode; this.mode = 'shop'; Shop.show(who); },
  missionBoard() { this.mode = 'board'; this.boardKind = 'missions'; this.boardIdx = 0; Audio.sfx('ok'); },
  challenges() { this.mode = 'board'; this.boardKind = 'challenges'; this.boardIdx = 0; Audio.sfx('ok'); },
  toCredits() { this.mode = 'credits'; this.creditsT = 0; Audio.cur = null; Audio.play('title'); },

  /* ---------- boot ---------- */
  boot() {
    if (this.booted) return; this.booted = true;
    ABILITIES.forEach(a => { if (a.lv <= 1) G.unlocked[a.id] = true; });
    ChatConsole.init();
    cv.setAttribute('tabindex', '0');
    cv.addEventListener('mousedown', () => { Audio.init(); Audio.resume(); cv.focus(); });
    addEventListener('keydown', e => {
      if (ChatConsole.open) return;
      if (e.code === 'KeyF' && !e.repeat) toggleFS();
      if (e.code === 'Backquote' && !e.repeat) AdminPanel.toggle();
    });
    this.toTitle();
    this.last = performance.now();
    requestAnimationFrame(t => this.loop(t));
  },

  /* ---------- main loop ---------- */
  loop(now) {
    let dt = (now - this.last) / 1000;
    this.last = now;
    if (dt > .1) dt = .1;              // clamp after tab-outs
    const raw = dt;
    this.t += dt;
    if (!ChatConsole.open && !AdminPanel.open) G.playtime += raw;

    Audio.update();
    timers.update(raw);
    Fade.update(raw);
    Toast.update(raw);
    FX.update(raw * (FX.freezeT > 0 ? .08 : 1));
    updateEmote(raw);

    const slowed = dt * (FX.slowT > 0 ? FX.slowFactor : 1) * (FX.freezeT > 0 ? .04 : 1);

    /* ---- overlays that eat input ---- */
    if (LevelUp.busy()) { LevelUp.update(raw); }
    else if (Menu.open) { Menu.update(raw); }
    else if (EmoteWheel.open) { EmoteWheel.update(raw); }
    else if (Dlg.active) { Dlg.update(raw); }
    else if (!ChatConsole.open && !AdminPanel.open) {
      /* ---- scene update ---- */
      switch (this.mode) {
        case 'title': this.upTitle(raw); break;
        case 'chapters': this.upChapters(raw); break;
        case 'over':
          Over.update(slowed);
          if (Input.just('menu')) Menu.show();
          if (Input.just('emote')) EmoteWheel.show();
          break;
        case 'battle':
          if (DomainFight.active) { DomainFight.update(slowed); this.mode = 'domain'; }
          else if (OrangeFight.active) { this.mode = 'orange'; }
          else { Battle.update(slowed); if (!Battle.active && this.mode === 'battle' && !Fade.busy() && !Battle.result) this.toOverworld(); }
          break;
        case 'domain':
          DomainFight.update(slowed);
          if (!DomainFight.active) this.mode = OrangeFight.active ? 'orange' : 'battle';
          break;
        case 'orange':
          OrangeFight.update(slowed);
          if (!OrangeFight.active) this.mode = Battle.active ? 'battle' : 'over';
          break;
        case 'shop':
          Shop.update(raw);
          if (!Shop.open) this.mode = this.prevMode === 'battle' ? 'over' : (this.prevMode || 'over');
          break;
        case 'board': this.upBoard(raw); break;
        case 'credits': this.upCredits(raw); break;
      }
    }
    // battle hand-offs can happen during dialogue too
    if (this.mode === 'battle' && DomainFight.active) this.mode = 'domain';
    if ((this.mode === 'battle' || this.mode === 'domain') && OrangeFight.active) this.mode = 'orange';

    /* ---- draw ---- */
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    rect(0, 0, W, H, '#05060a');
    ctx.save();
    FX.applyShake();
    switch (this.mode) {
      case 'title': this.drawTitle(); break;
      case 'chapters': this.drawChapters(); break;
      case 'over': if (Over.active) Over.draw(); break;
      case 'battle': Battle.draw(); break;
      case 'domain': DomainFight.draw(); break;
      case 'orange': OrangeFight.draw(); break;
      case 'shop': Shop.draw(); break;
      case 'board': this.drawBoard(); break;
      case 'credits': this.drawCredits(); break;
    }
    ctx.restore();

    FX.drawOverlay();
    if (Dlg.active) Dlg.draw();
    Toast.draw();
    if (Menu.open) Menu.draw();
    if (EmoteWheel.open) EmoteWheel.draw();
    if (LevelUp.busy()) LevelUp.draw();
    if (ChatConsole.open) {
      ctx.save(); ctx.globalAlpha = .35; rect(0, 0, W, H, '#000'); ctx.restore();
      const cmsg = 'CONSOLE OPEN — type /help — Esc to close';
      const cbw = textW(cmsg, 2) + 24;
      rect(W / 2 - cbw / 2, 4, cbw, 22, '#031410');
      frameRect(W / 2 - cbw / 2, 4, cbw, 22, PAL.green, 2);
      textC(cmsg, W / 2, 11, { scale: 2, color: PAL.green });
    }
    Fade.draw();

    Input.frameEnd();
    requestAnimationFrame(t => this.loop(t));
  },

  /* ===================== TITLE ===================== */
  upTitle(dt) {
    this.titleT += dt;
    const opts = this.titleOpts();
    if (Input.just('up')) { this.titleIdx = (this.titleIdx + opts.length - 1) % opts.length; Audio.sfx('move'); }
    if (Input.just('down')) { this.titleIdx = (this.titleIdx + 1) % opts.length; Audio.sfx('move'); }
    if (Input.just('ok')) {
      Audio.init(); Audio.resume(); Audio.sfx('ok');
      opts[this.titleIdx].fn();
    }
  },
  titleOpts() {
    const o = [];
    if (G.hasSave()) o.push({ t: 'CONTINUE', fn: () => this.continueGame() });
    o.push({ t: G.hasSave() ? 'NEW GAME' : 'START CHAPTER 1', fn: () => this.newGame() });
    if (G.flags.ch1_done && CHAPTERS.length > 1)
      o.push({ t: 'CHAPTER SELECT', fn: () => { this.mode = 'chapters'; this.chapIdx = 0; Audio.sfx('ok'); } });
    o.push({ t: 'HOW TO PLAY', fn: () => this.showHelp() });
    o.push({ t: 'COMMAND CONSOLE', fn: () => ChatConsole.show() });
    return o;
  },

  /* ---------- spoiler gate ---------- */
  spoilerGate(ch, go) {
    Dlg.start([
      { who: 'sys', t: 'SPOILER CHECK', col: PAL.yellow },
      { who: 'sys', t: 'CHAPTER ' + ch.n + ' STARTS AFTER THE SHIBUYA INCIDENT.\nIt covers the Culling Game: Tengen and the rules, the Tokyo colonies,\nHakari and Kirara, Sendai, Higuruma, Takaba and Kashimo.' },
      { who: 'sys', t: 'It stops before anything later. Nothing about what happens to\nGojo, Megumi or Sukuna after Shibuya appears anywhere in it.' },
      { q: 'Has the anime got this far for you?', choice: [
        { t: 'Yes \u2014 play Chapter 2', fn: () => { G.flags.spoiler_ok = true; G.save(); go(); } },
        { t: 'Not yet \u2014 take me back', fn: () => { Audio.sfx('cancel'); } }
      ] }
    ]);
  },

  /* ---------- chapter select ---------- */
  upChapters(dt) {
    const n = CHAPTERS.length;
    if (Input.just('up')) { this.chapIdx = (this.chapIdx + n - 1) % n; Audio.sfx('move'); }
    if (Input.just('down')) { this.chapIdx = (this.chapIdx + 1) % n; Audio.sfx('move'); }
    if (Input.just('back') || Input.just('esc')) { this.mode = 'title'; Audio.sfx('cancel'); }
    if (Input.just('ok')) {
      const ch = CHAPTERS[this.chapIdx];
      if (ch.n > 1 && !G.flags['ch' + (ch.n - 1) + '_done']) { Audio.sfx('deny'); return; }
      Audio.sfx('ok');
      const start = () => Fade.out(() => { Story.startChapter(ch.n); Fade.in(); }, 2.2);
      /* anything after Chapter 1 goes past the Shibuya Incident - ask first */
      if (ch.n > 1 && !G.flags.spoiler_ok) { this.spoilerGate(ch, start); return; }
      start();
    }
  },
  drawChapters() {
    rect(0, 0, W, H, '#07050c');
    ctx.save(); ctx.globalAlpha = .8;
    const g = ctx.createRadialGradient(W / 2, 240, 10, W / 2, 240, 420);
    g.addColorStop(0, '#3a1a00'); g.addColorStop(1, '#07050c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
    pixelGlyphs('\u7AE0', W / 2, 62, 60, PAL.orange, { outline: '#1a0a00', dn: 3, shadow: true });
    textC('CHAPTER SELECT', W / 2, 104, { scale: 3, color: '#fff', shadow: PAL.orangeD });
    CHAPTERS.forEach((ch, i) => {
      const sel = i === this.chapIdx, y = 150 + i * 92;
      const locked = ch.n > 1 && !G.flags['ch' + (ch.n - 1) + '_done'];
      const done = !!G.flags['ch' + ch.n + '_done'];
      rect(60, y, W - 120, 78, sel ? '#1a0f04' : '#0b0a12');
      frameRect(60, y, W - 120, 78, sel ? PAL.orange : '#2a2438', sel ? 3 : 2);
      textC('CHAPTER ' + ch.n, W / 2, y + 10, { scale: 2, color: locked ? '#55637d' : PAL.orange2 });
      textC(ch.title.toUpperCase(), W / 2, y + 30, { scale: 3, color: locked ? '#3a4254' : '#fff', shadow: '#000' });
      textC(locked ? 'FINISH CHAPTER ' + (ch.n - 1) + ' FIRST' : ch.sub, W / 2, y + 58,
        { scale: 1, color: locked ? PAL.red : '#8fa0bd' });
      if (ch.n > 1 && !locked)
        text(G.flags.spoiler_ok ? '' : 'POST-SHIBUYA', W - 150, y + 24, { scale: 1, color: PAL.yellow });
      if (done) text('CLEARED', W - 150, y + 10, { scale: 1, color: PAL.green });
      text(ch.missions.length + ' MISSIONS', 76, y + 10, { scale: 1, color: '#55637d' });
    });
    textC('Chapter 2 picks up at your current level. Your save carries over.', W / 2, H - 52, { scale: 1, color: '#55637d' });
    textC('\u2191\u2193 SELECT    Z START    X BACK', W / 2, H - 30, { scale: 1, color: '#55637d' });
  },
  showHelp() {
    Dlg.start([
      { who: 'sys', t: 'CONTROLS\nArrows / WASD  move & dodge\nZ or Enter  confirm / jump\nX or Shift  cancel / slash / run\nC  menu (and the domain dev-menu)\nB  emote wheel\nR  dash   V  focus-heal\n/  command console   F  fullscreen' },
      { who: 'sys', t: 'BATTLE\nFIGHT: stop the marker in the centre of the bar.\nEvery hit you land makes the bar FASTER — land them all for a combo finish.\nAll-perfect combos can trigger BLACK FLASH (x2.5).' },
      { who: 'sys', t: 'DODGE\nOn the enemy turn, move your soul inside the box.\nYour cursed energy is infinite, so every technique is free \u2014 but grazing\nattacks charges FOCUS, and a DOMAIN costs 50 FOCUS to hold.' },
      { who: 'sys', t: 'DOMAINS\nInside a domain the game becomes a side-view action fight.\nSANDBOX MODE gives you a developer menu over the rules of the space.\nERROR 404 runs a 30-second format on the target\'s existence.' },
      { who: 'sys', t: 'DEATH\nIf Kenji hits 0 HP you take control of ORANGE.\nWin as a pumpkin, then run ORANGE HEAL to bring Kenji back.' },
      { who: 'sys', t: 'MONEY\nExorcisms pay dollars. Spend them on skins and emote packs\nat Orange\'s shop. Rarities run COMMON to MYTHIC.' }
    ]);
  },
  drawTitle() {
    const t = this.titleT;
    // backdrop: dark city + orange sun
    rect(0, 0, W, H, '#07050c');
    ctx.save(); ctx.globalAlpha = .9;
    const g = ctx.createRadialGradient(W / 2, 250, 10, W / 2, 250, 420);
    g.addColorStop(0, '#6b2f00'); g.addColorStop(.4, '#2a1203'); g.addColorStop(1, '#07050c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.restore();
    // code rain
    for (let i = 0; i < 44; i++) {
      const x = (i * 37) % W, y = ((i * 97) + t * (24 + (i % 5) * 16)) % (H + 40) - 20;
      text(pick(['0', '1', 'x', '#', '/']), x, y, { scale: 1, color: '#2a3450', alpha: .5 });
    }
    // skyline
    for (let i = 0; i < 16; i++) {
      const bx = (i * 43) % W, bh = 60 + ((i * 67) % 120);
      rect(bx, H - 120 - bh, 40, bh, '#0a0810');
      for (let k = 0; k < 4; k++) if ((i + k) % 3) rect(bx + 6 + (k % 2) * 18, H - 114 - bh + k * 18, 10, 12, '#2a1a0a');
    }
    rect(0, H - 120, W, 120, '#0a0810');
    // orange floating
    drawActor('orange', W / 2 + 150 + Math.sin(t) * 10, 300 + Math.cos(t * 1.3) * 8, 4, { t, hop: true, glow: true });
    // kenji
    drawActor('kenji', W / 2 - 220, 272, 5, { t, dir: 2 });
    // logo
    pixelGlyphs('呪術デジタル', W / 2, 92, 58, PAL.orange, { outline: '#1a0a00', dn: 4, shadow: true, alpha: .95 });
    const pulse = 1 + Math.sin(t * 2) * .012;
    ctx.save();
    ctx.translate(W / 2, 160); ctx.scale(pulse, pulse); ctx.translate(-W / 2, -160);
    textC('DIGITAL GENESIS', W / 2, 142, { scale: 6, color: '#fff', shadow: PAL.orangeD });
    ctx.restore();
    textC('KENJI SATO  //  CHAPTER ONE', W / 2, 196, { scale: 2, color: PAL.orange2, shadow: '#000' });
    textC('a jujutsu story about a twelve-year-old with admin rights', W / 2, 222, { scale: 1, color: '#8a7a6a' });

    // menu
    const opts = this.titleOpts();
    opts.forEach((o, i) => {
      const sel = i === this.titleIdx, y = 310 + i * 28;
      if (sel) {
        rect(W / 2 - 130, y - 5, 260, 24, '#1a0f04');
        frameRect(W / 2 - 130, y - 5, 260, 24, PAL.orange, 2);
      }
      textC(o.t, W / 2, y, { scale: 2, color: sel ? PAL.orange : '#6a5a4a', shadow: '#000' });
    });
    const inf = G.saveInfo();
    if (inf) textC('SAVE: LV ' + inf.lv + '   MISSION ' + inf.mission + '   ' + timeStr(inf.playtime), W / 2, H - 56, { scale: 1, color: '#55637d' });
    textC('↑↓ SELECT    Z CONFIRM', W / 2, H - 38, { scale: 1, color: '#55637d' });
    textC('v1.0  ·  press / for the command console', W / 2, H - 22, { scale: 1, color: '#3a3038' });
    FX.drawWorld();
  },

  /* ===================== MISSION BOARD / CHALLENGES ===================== */
  curBoardList() {
    if (this.boardKind === 'missions') return SIDE_MISSIONS.filter(m => m.minLv <= G.lv + 2);
    return CHALLENGES.filter(c => c.minLv <= G.lv + 4);
  },
  upBoard(dt) {
    const L = this.curBoardList();
    if (Input.just('back') || Input.just('esc') || Input.just('menu')) { Audio.sfx('cancel'); this.mode = 'over'; return; }
    if (Input.just('left') || Input.just('right')) {
      this.boardKind = this.boardKind === 'missions' ? 'challenges' : 'missions';
      this.boardIdx = 0; Audio.sfx('move'); return;
    }
    if (Input.just('up')) { this.boardIdx = (this.boardIdx + L.length - 1) % L.length; Audio.sfx('move'); }
    if (Input.just('down')) { this.boardIdx = (this.boardIdx + 1) % L.length; Audio.sfx('move'); }
    if (Input.just('ok')) {
      const e = L[this.boardIdx]; if (!e) return;
      if (e.minLv > G.lv) { Audio.sfx('deny'); Toast.show('LV ' + e.minLv + ' REQUIRED', PAL.red); return; }
      if (e.need && !G.has(e.need)) { Audio.sfx('deny'); Toast.show('TECHNIQUE REQUIRED', PAL.red); return; }
      Audio.sfx('ok');
      if (e.rush) { this.startRush(e); return; }
      const pay = e.pay;
      const done = () => {
        G.gainMoney(pay);
        Toast.show('PAID +$' + fmt(pay), PAL.gold, 3);
        if (!G.completed[e.id]) { G.completed[e.id] = true; const ups = G.gainXP(Math.round(pay * .5)); if (ups.length) LevelUp.trigger(ups); }
        G.save();
        this.toOverworld();
      };
      this.mode = 'battle';
      Battle.start(e.eid, {
        bg: (AREAS[e.area] && AREAS[e.area].bg) || 'city',
        boss: e.grade === 'SP', canFlee: true,
        onWin: done, onFlee: () => this.toOverworld()
      });
    }
  },
  startRush(c) {
    this.rush = c; this.rushIdx = 0;
    const step = () => {
      if (this.rushIdx >= c.rush.length) {
        G.gainMoney(c.pay);
        const ups = G.gainXP(Math.round(c.pay * .6));
        Toast.show('BOSS RUSH CLEARED  +$' + fmt(c.pay), PAL.gold, 4);
        if (ups.length) LevelUp.trigger(ups);
        G.challenges[c.id] = (G.challenges[c.id] || 0) + 1;
        G.save(); this.rush = null; this.toOverworld(); return;
      }
      const eid = c.rush[this.rushIdx++];
      this.mode = 'battle';
      Battle.start(eid, {
        bg: 'shinjuku', boss: true, canFlee: false,
        intro: '* BOSS RUSH ' + this.rushIdx + '/' + c.rush.length + ': ' + ENEMIES[eid].name,
        onWin: () => { G.heal(Math.round(G.hpMax * .4)); timers.after(.4, step); }
      });
    };
    step();
  },
  drawBoard() {
    rect(0, 0, W, H, '#0a0d16');
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < 40; i++) text('■', (i * 97) % W, (i * 53) % H, { scale: 1, color: '#151c2c' });
    ctx.restore();
    box(14, 14, W - 28, H - 28, { fill: '#0b1018', edge: '#fff', t: 3 });
    const isM = this.boardKind === 'missions';
    // tabs
    ['JUJUTSU HIGH MISSIONS', 'ORANGE CHALLENGES'].forEach((t, i) => {
      const sel = (i === 0) === isM, x = 30 + i * 270;
      rect(x, 26, 256, 22, sel ? (i ? PAL.orange : PAL.cyan) : '#13213a');
      textC(t, x + 128, 32, { scale: 2, color: sel ? '#05060a' : '#55637d' });
    });
    const L = this.curBoardList();
    L.forEach((e, i) => {
      const y = 66 + i * 44, sel = i === this.boardIdx;
      const locked = e.minLv > G.lv || (e.need && !G.has(e.need));
      if (sel) { rect(26, y - 4, 380, 40, '#13213a'); frameRect(26, y - 4, 380, 40, isM ? PAL.cyan : PAL.orange, 1); }
      const gcol = { '4': '#b1b6c2', '3': '#4ddd6a', '2': '#3ba7ff', '1': '#b45cff', 'SP': '#ff9b2b' }[e.grade] || PAL.orange;
      rect(32, y, 26, 26, gcol);
      textC(e.grade || 'C', 45, y + 9, { scale: 2, color: '#05060a' });
      text(e.title, 68, y, { scale: 2, color: locked ? '#55637d' : sel ? '#fff' : '#cfe3ff' });
      text('$' + fmt(e.pay) + (G.completed[e.id] ? '   [DONE]' : '') + (e.repeat ? '   [REPEATABLE]' : ''),
        68, y + 18, { scale: 1, color: locked ? '#55637d' : PAL.gold });
      if (locked) text('LV ' + e.minLv + (e.need ? ' + ' + AB[e.need].name : ''), 330, y + 18, { scale: 1, color: PAL.red });
    });
    // detail
    const e = L[this.boardIdx];
    const px = 420, pw = W - px - 26;
    panel(px, 66, pw, 300, isM ? PAL.cyan : PAL.orange);
    if (e) {
      textC(e.title, px + pw / 2, 76, { scale: textW(e.title, 2) < pw - 14 ? 2 : 1, color: isM ? PAL.cyan : PAL.orange, shadow: '#000' });
      wrap(e.desc, Math.floor((pw - 20) / 6)).forEach((l, i) => text(l, px + 10, 102 + i * 11, { scale: 1, color: '#cfe3ff' }));
      let y = 150;
      const row = (k, v, c) => { text(k, px + 10, y, { scale: 1, color: '#55637d' }); text(v, px + 110, y, { scale: 1, color: c || '#fff' }); y += 14; };
      row('PAY', '$' + fmt(e.pay), PAL.gold);
      row('EXP', '+' + Math.round(e.pay * (e.rush ? .6 : .5)), PAL.cyan);
      row('MIN LEVEL', String(e.minLv), e.minLv > G.lv ? PAL.red : PAL.green);
      if (e.need) row('REQUIRES', AB[e.need].name, G.has(e.need) ? PAL.green : PAL.red);
      if (e.rush) row('TARGETS', e.rush.map(r => ENEMIES[r].name).join(', '));
      else if (e.eid) row('TARGET', ENEMIES[e.eid].name);
      if (e.hint) { y += 6; wrap(e.hint, Math.floor((pw - 20) / 6)).forEach((l, i) => text(l, px + 10, y + i * 11, { scale: 1, color: PAL.yellow })); }
      // target portrait
      if (e.eid && ENEMIES[e.eid]) {
        const u = 4;
        drawActor(ENEMIES[e.eid].spr, px + pw / 2 - 8 * u, 250, u, { t: this.t, dir: 0 });
      }
      if (e.rush) e.rush.forEach((r, i) => drawActor(ENEMIES[r].spr, px + 20 + i * 70, 250, 3, { t: this.t + i, dir: 0 }));
    }
    drawActor('orange', 40, H - 110, 4, { t: this.t, hop: true });
    textC(isM ? 'Jujutsu High pays per exorcism. In dollars. Nobody will explain why.'
      : 'ORANGE: "i made all of these. they are all fair. mostly."', W / 2 + 60, H - 70, { scale: 1, color: '#8fa0bd' });
    textC('←→ TAB   ↑↓ SELECT   Z ACCEPT   X LEAVE', W / 2, H - 42, { scale: 1, color: '#55637d' });
  },

  /* ===================== CREDITS ===================== */
  upCredits(dt) {
    this.creditsT += dt;
    if (this.creditsT > 2 && (Input.just('ok') || Input.just('back'))) {
      if (this.creditsT > 2 && this.creditsT < 1e9) { this.creditsT += 6; }
    }
    if (this.creditsT > 64) this.toTitle();
  },
  drawCredits() {
    const t = this.creditsT;
    rect(0, 0, W, H, '#05060a');
    // stars / code
    for (let i = 0; i < 60; i++) {
      const x = (i * 83) % W, y = ((i * 59) + t * 12) % H;
      rect(x, y, 2, 2, i % 5 ? '#1d2740' : '#2a3450');
    }
    /* phase 1: TO BE CONTINUED */
    if (t < 9) {
      const k = clamp(t / .8, 0, 1);
      ctx.save(); ctx.globalAlpha = k;
      pixelGlyphs('続く', W / 2, 150, 120, PAL.orange, { outline: '#1a0a00', dn: 5, shadow: true });
      textC('TO BE CONTINUED', W / 2, 232, { scale: 5, color: '#fff', shadow: PAL.orangeD });
      textC('IN CHAPTER 2: THE CULLING GAME', W / 2, 284, { scale: 3, color: PAL.orange2, shadow: '#000' });
      if (t > 2.4) textC('PLAYER REGISTERED · POINTS 0 · COLONY UNASSIGNED', W / 2, 330, { scale: 2, color: PAL.green });
      if (t > 3.6) textC('RULE 10: A PLAYER MAY ADD A NEW RULE TO THE GAME.', W / 2, 358, { scale: 2, color: PAL.yellow });
      if (t > 5) textC('ORANGE: "we are going to add SO many rules."', W / 2, 386, { scale: 2, color: PAL.orange2 });
      ctx.restore();
      drawActor(skinSprite(), W / 2 - 74, 404, 3, { t, dir: 2 });
      drawActor('orange', W / 2 + 26, 414, 3, { t, hop: true, glow: true });
      if (t > 7.6) textC('[ Z ] SKIP AHEAD', W / 2, H - 14, { scale: 1, color: '#55637d' });
      return;
    }
    /* phase 2: scrolling stats + credits */
    const sy = H - (t - 9) * 46;
    const lines = [
      ['DIGITAL GENESIS', 4, PAL.orange],
      ['CHAPTER ONE — COMPLETE', 2, '#fff'],
      ['', 1, '#fff'],
      ['FINAL RECORD', 3, PAL.cyan],
      ['LEVEL ' + G.lv, 2, '#fff'],
      ['PLAYTIME ' + timeStr(G.playtime), 2, '#fff'],
      ['DOLLARS EARNED $' + fmt(G.money), 2, PAL.gold],
      ['BATTLES WON ' + G.battlesWon, 2, '#fff'],
      ['BLACK FLASHES ' + G.blackFlashes, 2, '#ff5a5a'],
      ['ORANGE FLASHES ' + G.orangeFlashes, 2, PAL.orange],
      ['DOMAINS EXPANDED ' + G.domainsUsed, 2, PAL.green],
      ['LONGEST COMBO ' + G.maxCombo, 2, PAL.yellow],
      ['TIMES ORANGE SAVED YOU ' + G.deaths, 2, PAL.orange2],
      ['SKINS OWNED ' + Object.keys(G.ownedSkins).length + '/' + Object.keys(SKINS).length, 2, '#fff'],
      ['EMOTES OWNED ' + Object.keys(G.ownedEmotes).length + '/' + Object.keys(EMOTES).length, 2, '#fff'],
      ['', 1, '#fff'],
      ['CAST', 3, PAL.cyan],
      ['KENJI SATO — twelve, special grade, 14% battery', 1, '#cfe3ff'],
      ['ORANGE — a pumpkin with administrator privileges', 1, PAL.orange2],
      ['SATORU GOJO — bought the ice cream', 1, '#cfe3ff'],
      ['RYOMEN SUKUNA — formatted', 1, '#ff5a5a'],
      ['MAHITO — uninstalled', 1, '#ff9ec4'],
      ['HANAMI, JOGO, DAGON — special grades, deleted', 1, '#cfe3ff'],
      ['AOI TODO — small brother', 1, PAL.yellow],
      ['KENJAKU — has write access. for now.', 1, '#c9a24a'],
      ['', 1, '#fff'],
      ['TECHNIQUES UNLOCKED', 3, PAL.cyan]
    ];
    ABILITIES.filter(a => G.has(a.id)).forEach(a => lines.push([a.name, 1, a.col]));
    lines.push(['', 1, '#fff']);
    if ((G.chapter || 1) < CHAPTERS.length) {
      lines.push(['NEXT CHAPTER', 3, PAL.orange]);
      lines.push(['THE CULLING GAME', 2, '#fff']);
      lines.push(['19 DAYS. 10 RULES. ONE OF THEM IS WRITE ACCESS.', 1, PAL.yellow]);
    } else {
      lines.push(['THE STORY STOPS HERE FOR NOW', 3, PAL.orange]);
      lines.push(['this game follows the anime, and the anime', 1, '#cfe3ff']);
      lines.push(['has not gone further than this yet.', 1, '#cfe3ff']);
      lines.push(['no spoilers. more when there is more.', 1, PAL.yellow]);
    }
    lines.push(['', 1, '#fff']);
    lines.push(['THANK YOU FOR PLAYING', 3, PAL.orange]);
    let y = sy;
    lines.forEach(([s, sc, c]) => {
      if (y > -30 && y < H + 20 && s) textC(s, W / 2, y, { scale: sc, color: c, shadow: '#000' });
      y += 12 + sc * 9;
    });
    drawActor('orange', W - 90, H - 90 + Math.sin(t * 2) * 6, 4, { t, hop: true, glow: true });
    if (t > 11) textC('[ Z ] FAST FORWARD    [ X ] TITLE', W / 2, H - 18, { scale: 1, color: '#55637d' });
    if (Input.just('back')) this.toTitle();
  }
};

/* ---------- responsive guard ---------- */
function fitCheck() {
  // only block when the window is genuinely too narrow to read the HUD
  const small = innerWidth < 360;
  el('rotate').classList.toggle('hidden', !small);
}
addEventListener('resize', fitCheck);

/* ---------- go ---------- */
fitCheck();
Game.boot();
