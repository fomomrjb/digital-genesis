/* ===========================================================
   DIGITAL GENESIS — battle.js
   Deltarune-style turn battle:
     * bottom button menu (FIGHT / TECH / ITEM / ACT / DOMAIN / SPARE)
     * timing-bar combos that speed up with every hit you land
     * enemy turns are bullet-hell dodges inside a soul box
     * Black Flash / Orange Flash procs on perfect combos
     * death hands over to the ORANGE fight
   =========================================================== */
'use strict';

const VICTORY_BARKS = [
  'ORANGE: "EASY. EASY!!"',
  'ORANGE: "did you see me? i was helping."',
  'ORANGE: "deleted. next. who else."',
  'ORANGE: "ok that combo was actually clean."',
  'ORANGE: "i am going to tell everyone about that."',
  'ORANGE: "put that one on the highlight reel."'
];

const BTN = [
  { id: 'fight',  label: 'FIGHT',  col: '#ff5a5a' },
  { id: 'tech',   label: 'TECH',   col: '#3ddcff' },
  { id: 'item',   label: 'ITEM',   col: '#ffe14d' },
  { id: 'act',    label: 'ACT',    col: '#9b4dff' },
  { id: 'domain', label: 'DOMAIN', col: '#00ffa6' },
  { id: 'spare',  label: 'SPARE',  col: '#ff9ec4' }
];

const Battle = {
  active: false, st: 'intro', t: 0, btn: 0, idx: 0, scroll: 0,
  e: null, eid: null, ehp: 0, ehpMax: 0, eatk: 0, edef: 0, espr: null,
  turn: 0, msg: '', msgQ: [], log: [],
  /* combo bar */
  bar: null,
  /* dodge */
  soul: null, bullets: [], pattern: null, patT: 0, patIdx: 0, dodgeT: 0, dodgeDur: 0,
  invul: 0, graze: 0, tension: 0, tensionMax: 100,
  /* flags */
  playerBuff: {}, enemyDebuff: {}, usedOnce: {}, transform: null, transformT: 0,
  onWin: null, onLose: null, onFlee: null, spared: false, canFlee: true,
  shakeE: 0, eFlash: 0, pHurt: 0, result: null, rewards: null,
  enemyDomainDef: null, domainPending: null, phaseHit: {},
  introT: 0, sparePct: 0, bgKind: 'city', dialogueBark: '', barkT: 0,

  /* ============ start ============ */
  start(eid, opts = {}) {
    const e = ENEMIES[eid]; if (!e) return;
    this.active = true; this.st = 'intro'; this.t = 0; this.introT = 0;
    this.e = e; this.eid = eid; this.espr = e.spr;
    const scale = opts.hpScale || 1;
    this.ehpMax = Math.round(e.hp * scale); this.ehp = this.ehpMax;
    this.eatk = e.atk; this.edef = e.def;
    this.turn = 0; this.btn = 0; this.idx = 0; this.bullets = [];
    this.playerBuff = {}; this.enemyDebuff = {}; this.usedOnce = {}; this.phaseHit = {}; this.snacks = 0;
    this.transform = null; this.transformT = 0; this.tension = 0; this.graze = 0;
    this.spared = false; this.result = null; this.rewards = null; this.enemyDomainDef = null;
    /* these leak between fights if they are not cleared - a domain queued by a
       boss that died first would otherwise fire on the NEXT enemy */
    this.domainPending = null; this.forcePattern = null; this.spinInit = false;
    this.sureHit = false; this.copyList = null; this.selKind = null; this.bar = null;
    this.onWin = opts.onWin || null; this.onLose = opts.onLose || null; this.onFlee = opts.onFlee || null;
    this.canFlee = opts.canFlee !== false && !opts.boss;
    this.bgKind = opts.bg || 'city';
    this.msgQ = []; this.log = [];
    this.soul = { x: 0, y: 0, vx: 0, vy: 0 };
    if (G.flags.buff_atk) { this.playerBuff.atk = 1.3; delete G.flags.buff_atk; }
    if (G.flags.buff_def) { this.playerBuff.def = 1.4; delete G.flags.buff_def; }
    Audio.play(e.music || 'battle');
    FX.clear();
    this.say(opts.intro || ('* ' + e.name + ' blocks the way!'));
  },

  say(m) { this.msg = m; },
  bark(m) { this.dialogueBark = m; this.barkT = 2.6; },

  /* ============ update ============ */
  update(dt) {
    if (!this.active) return;
    this.t += dt;
    if (this.barkT > 0) this.barkT -= dt;
    if (this.eFlash > 0) this.eFlash -= dt;
    if (this.pHurt > 0) this.pHurt -= dt;
    if (this.shakeE > 0) this.shakeE -= dt;
    if (this.invul > 0) this.invul -= dt;
    if (this.transform) {
      this.transformT -= dt * 0;   // decremented per turn, not per second
    }
    if (FX.busy()) return;          // cinematics pause the battle

    switch (this.st) {
      case 'intro': this.upIntro(dt); break;
      case 'menu': this.upMenu(dt); break;
      case 'select': this.upSelect(dt); break;
      case 'bar': this.upBar(dt); break;
      case 'resolve': this.upResolve(dt); break;
      case 'enemyintro': this.upEnemyIntro(dt); break;
      case 'dodge': this.upDodge(dt); break;
      case 'victory': this.upVictory(dt); break;
      case 'defeat': this.upDefeat(dt); break;
      case 'fled': this.upFled(dt); break;
      case 'selectcopy': this.upSelectCopy(dt); break;
      case 'message': this.upMessage(dt); break;
    }
  },

  upIntro(dt) {
    this.introT += dt;
    if (this.introT > 1.1 || Input.just('ok')) { this.st = 'menu'; this.say('* ' + pick(this.e.barks)); }
  },

  /* ---- menu ---- */
  upMenu(dt) {
    if (Input.just('left')) { this.btn = (this.btn + BTN.length - 1) % BTN.length; Audio.sfx('move'); }
    if (Input.just('right')) { this.btn = (this.btn + 1) % BTN.length; Audio.sfx('move'); }
    if (Input.just('ok')) {
      const b = BTN[this.btn];
      if (b.id === 'fight') {
        const combos = comboAbilities();
        if (combos.length === 1) { this.beginBar(combos[0]); }
        else { this.st = 'select'; this.selKind = 'fight'; this.idx = 0; this.scroll = 0; Audio.sfx('ok'); }
      } else if (b.id === 'tech') {
        const l = this.techList();
        if (!l.length) { Audio.sfx('deny'); this.say('* No techniques unlocked yet.'); return; }
        this.st = 'select'; this.selKind = 'tech'; this.idx = 0; this.scroll = 0; Audio.sfx('ok');
      } else if (b.id === 'item') {
        if (!Object.keys(G.items).length) { Audio.sfx('deny'); this.say('* Your pockets are empty.'); return; }
        this.st = 'select'; this.selKind = 'item'; this.idx = 0; this.scroll = 0; Audio.sfx('ok');
      } else if (b.id === 'act') {
        this.st = 'select'; this.selKind = 'act'; this.idx = 0; this.scroll = 0; Audio.sfx('ok');
      } else if (b.id === 'domain') {
        const d = domainAbilities();
        if (!d.length) { Audio.sfx('deny'); this.say('* You cannot build a barrier yet. (Unlocks at LV 20.)'); return; }
        if (!d.some(a => this.canAfford(a))) {
          Audio.sfx('deny');
          this.say('* Not enough FOCUS to hold a barrier. (' + Math.floor(this.tension) + '/50)\n* Graze attacks and land perfect hits to charge it.');
          return;
        }
        this.st = 'select'; this.selKind = 'domain'; this.idx = 0; this.scroll = 0; Audio.sfx('ok');
      } else if (b.id === 'spare') {
        this.trySpare();
      }
    }
    if (Input.just('back') && this.canFlee) {
      this.st = 'fled'; this.t = 0; Audio.sfx('warp');
      this.say('* You lost interest and left. (Orange is disappointed.)');
    }
  },

  techList() {
    let l = ABILITIES.filter(a => G.has(a.id) &&
      ['attack','debuff','heal','buff','special','transform','copy'].includes(a.type) && !a.hits);
    l = l.filter(a => !(a.once && this.usedOnce[a.id]));
    // video game copy expands into witnessed techniques
    return l;
  },
  actList() {
    const l = [{ id: 'check', name: 'Check', desc: 'Read their data.' }];
    if (this.e.friendly) l.push({ id: 'talk', name: 'Talk', desc: 'Say something. Possibly rude.' });
    l.push({ id: 'snack', name: 'Eat Snack', desc: 'Heals 14 HP. Three per fight. Kenji is 12.' });
    l.push({ id: 'hype', name: 'Orange Hype', desc: 'ATK x1.35 for the fight. Does not stack.' });
    if (this.e.infinity) l.push({ id: 'observe', name: 'Read Infinity', desc: 'Stare at the equation until it resolves.' });
    return l;
  },
  domainList() { return domainAbilities(); },
  itemList() { return Object.keys(G.items).filter(k => G.items[k] > 0).map(k => ({ k, ...ITEMS[k] })); }
  ,
  curSelList() {
    switch (this.selKind) {
      case 'fight': return comboAbilities();
      case 'tech': return this.techList();
      case 'item': return this.itemList();
      case 'act': return this.actList();
      case 'domain': return this.domainList();
    } return [];
  },

  upSelect(dt) {
    const L = this.curSelList();
    if (Input.just('back')) { this.st = 'menu'; Audio.sfx('cancel'); return; }
    if (Input.just('up')) { this.idx = (this.idx + L.length - 1) % L.length; Audio.sfx('move'); }
    if (Input.just('down')) { this.idx = (this.idx + 1) % L.length; Audio.sfx('move'); }
    if (Input.just('ok')) {
      const e = L[this.idx]; if (!e) return;
      Audio.sfx('ok');
      if (this.selKind === 'fight') this.beginBar(e);
      else if (this.selKind === 'tech') this.useTech(e);
      else if (this.selKind === 'item') { useItem(e.k); this.say('* You used the ' + e.name + '.'); this.endPlayerTurn(); }
      else if (this.selKind === 'act') this.doAct(e);
      else if (this.selKind === 'domain') this.openDomain(e);
    }
  },

  /* ============ FIGHT: the timing combo bar ============ */
  beginBar(ab) {
    this.st = 'bar';
    const hits = (G.god || G.oneShot) ? 1 : (ab.hits || 3);
    this.bar = {
      ab, hits, hit: 0, pos: 0, dir: 1, speed: 320, base: 320,
      results: [], locked: false, lockT: 0, perfectAll: true, flashT: 0, shown: ''
    };
    this.say('* ' + ab.name.toUpperCase() + ': stop the marker in the centre. [Z]');
    Audio.sfx('charge');
  },
  upBar(dt) {
    const b = this.bar;
    if (b.lockT > 0) {
      b.lockT -= dt;
      if (b.lockT <= 0) {
        if (b.hit >= b.hits || b.failed) this.resolveBar();
        else { b.locked = false; b.pos = b.dir > 0 ? 0 : 1; }
      }
      return;
    }
    // marker travel (bounces back and forth; speeds up each landed hit)
    b.pos += b.dir * (b.speed / 360) * dt;
    if (b.pos > 1) { b.pos = 1; b.dir = -1; b.bounces = (b.bounces || 0) + 1; }
    if (b.pos < 0) { b.pos = 0; b.dir = 1; b.bounces = (b.bounces || 0) + 1; }
    if ((b.bounces || 0) >= 3 && !b.locked) {   // too slow => miss
      b.results.push(0); b.failed = true; b.perfectAll = false;
      b.locked = true; b.lockT = .3; Audio.sfx('deny');
      b.shown = 'MISS';
      return;
    }
    if (Input.just('ok')) {
      const d = Math.abs(b.pos - .5);            // 0 = dead centre
      let q;                                      // quality
      if (d < .035) q = 1.0;
      else if (d < .085) q = .8;
      else if (d < .16) q = .55;
      else if (d < .26) q = .3;
      else q = 0;
      if (q < 1) b.perfectAll = false;
      b.results.push(q);
      b.hit++;
      b.shown = q === 1 ? 'PERFECT!' : q >= .8 ? 'GREAT' : q >= .55 ? 'GOOD' : q > 0 ? 'WEAK' : 'MISS';
      b.flashT = .3;
      if (q === 0) { b.failed = true; Audio.sfx('deny'); }
      else {
        Audio.sfx(q === 1 ? 'crit' : 'punch');
        b.speed *= 1.18 + (q === 1 ? .07 : 0);   // <- bar gets faster every landed hit
        b.bounces = 0;
        // per-hit visual on the enemy
        this.hitSpark(q);
      }
      b.locked = true; b.lockT = .22;
    }
  },
  hitSpark(q) {
    const ex = this.enemyX(), ey = this.enemyY();
    this.eFlash = .1; this.shakeE = .12;
    FX.shake(q === 1 ? 5 : 3, .12);
    FX.burst(ex, ey, q === 1 ? 14 : 8, {
      kind: 'spark', col: q === 1 ? PAL.yellow : '#fff', size: 3, life: .4, g: 200
    });
    if (q === 1) FX.ring(ex, ey, { r: 46, col: PAL.yellow, w: 2, life: .25, kind: 'shock' });
  },

  resolveBar() {
    const b = this.bar, ab = b.ab;
    const landed = b.results.filter(r => r > 0);
    const comboN = landed.length;
    G.maxCombo = Math.max(G.maxCombo, comboN);
    if (!comboN) {
      this.say('* You whiffed completely. Orange saw that.');
      this.bar = null; this.endPlayerTurn(); return;
    }
    // accuracy -> damage
    /* average accuracy x a modest chain bonus - a long combo is better,
       but it no longer multiplies into the thousands */
    const avgQ = landed.reduce((a, q) => a + q, 0) / landed.length;
    const chain = 1 + .15 * (landed.length - 1);
    const mult = avgQ * chain;
    const perfectCount = b.results.filter(r => r === 1).length;
    const allPerfect = b.perfectAll && comboN === b.hits;
    let dmg = Math.max(1, Math.round(G.atkTotal() * ab.power * mult * 1.6 * (this.playerBuff.atk || 1)) - this.edefNow());
    if (this.inGhost()) dmg = this.ghostDmg(dmg);
    this.tension = clamp(this.tension + comboN * 5 + perfectCount * 4, 0, this.tensionMax);

    const ex = this.enemyX(), ey = this.enemyY();
    /* ---- ORANGE FLASH ---- */
    if (ab.id === 'orangeflash' && (allPerfect || G.god)) {
      dmg = Math.max(Math.round(dmg * 2), Math.ceil(this.ehpMax * .5));
      G.orangeFlashes++; this.usedOnce[ab.id] = true;
      FX.orangeFlash(ex, ey, {});
      this.dealDamage(dmg, { crit: 'orange' });
      this.say('* ORANGE FLASH. One hundred black flashes in a single fist.');
      this.bar = null; return;      // damage applied, turn ends after cinematic
    }
    /* ---- BLACK FLASH ---- */
    const bfReady = G.has('blackflash');
    const bfProc = (ab.id === 'blackflash' && allPerfect) ||
                   (bfReady && allPerfect && comboN >= 3 && Math.random() < .34) || (bfReady && G.god && allPerfect);
    if (bfProc) {
      dmg = Math.round(dmg * 2.0);
      G.blackFlashes++;
      FX.blackFlash(ex, ey, { mult: 2.0, dev: 0.000001 });
      this.dealDamage(dmg, { crit: 'black' });
      this.say('* BLACK FLASH! The space around the impact goes crunch.');
      this.tension = clamp(this.tension + 25, 0, this.tensionMax);
      this.bar = null; return;
    }
    // normal resolve
    FX.pop(ex, ey - 40, '-' + dmg, { col: allPerfect ? PAL.yellow : '#fff', scale: allPerfect ? 3 : 2, crit: allPerfect });
    if (comboN > 1) FX.pop(ex + 40, ey - 10, 'COMBO x' + comboN, { col: PAL.orange, scale: 2, life: .8 });
    Audio.sfx(allPerfect ? 'crit' : 'hit');
    this.dealDamage(dmg, {});
    this.say('* ' + comboN + '-hit ' + ab.name + '. ' + dmg + ' damage.' + (allPerfect ? ' Flawless.' : ''));
    this.bar = null;
    this.toResolve();
  },

  /* ============ techniques ============ */
  focusCost(ab) { return (G.god || G.infiniteDomain) ? 0 : (ab.focus || 0); },
  canAfford(ab) { return this.tension >= this.focusCost(ab); },

  useTech(ab) {
    const ex = this.enemyX(), ey = this.enemyY();
    const cost = this.focusCost(ab);
    if (this.tension < cost) {
      Audio.sfx('deny');
      this.say('* Not enough FOCUS. (' + Math.floor(this.tension) + '/' + cost + ')\n* Land combo hits and graze their attacks to charge it.');
      this.st = 'menu'; return;
    }
    this.tension = clamp(this.tension - cost, 0, this.tensionMax);
    if (ab.id === 'vgcopy') { this.openCopyMenu(); return; }   // its cut-in plays on the chosen mod
    if (ab.once) this.usedOnce[ab.id] = true;
    FX.techniqueCutIn(ab);

    switch (ab.id) {
      case 'o_heal':
        G.fullHeal(); Audio.sfx('orangeheal');
        FX.burst(this.playerX(), this.playerY(), 40, { kind: 'spark', col: PAL.orange, size: 4, life: 1, g: -40 });
        FX.pop(this.playerX(), this.playerY() - 30, 'FULL RESTORE', { col: PAL.orange, scale: 2 });
        this.say('* ORANGE HEAL. Your pristine files are pulled off the backup server.');
        break;
      case 'o_mute':
        this.enemyDebuff.mute = ab.turns;
        this.say('* ORANGE ADMIN MUTE. [SYSTEM MUTE: PERMISSIONS REVOKED] flashes in their brain.');
        FX.ring(ex, ey, { r: 80, col: PAL.orange, w: 4, life: .5 });
        break;
      case 'o_spectator':
        this.playerBuff.ghost = ab.turns;
        this.say('* ORANGE SPECTATOR. You go translucent. Zero cursed energy footprint.');
        break;
      case 'o_creative': {
        const d = this.calcDmg(ab) ;
        FX.burst(ex, ey, 30, { kind: 'voxel', col: PAL.orange2, size: 7, life: .9 });
        FX.shake(9, .4); Audio.sfx('bigslam');
        this.dealDamage(d, {}); FX.pop(ex, ey - 40, '-' + d, { col: PAL.orange, scale: 3 });
        this.say('* ORANGE CREATIVE MODE. You spawn an obsidian block the size of a bus and drop it.');
        break; }
      case 'o_teleport': {
        const d = this.calcDmg(ab, true);
        FX.burst(ex, ey, 22, { kind: 'pixel', col: PAL.orange, size: 5, life: .6 });
        Audio.sfx('teleport');
        this.dealDamage(d, {}); FX.pop(ex, ey - 40, '-' + d, { col: PAL.orange, scale: 3 });
        this.say('* ORANGE TELEPORT. You snap to their soul signature and hit before the frame renders.');
        break; }
      case 'o_disguise':
        this.transform = 'ghostface'; this.transformT = ab.turns;
        Audio.sfx('ghostface');
        FX.flash('#07070b', .5, .9); FX.shake(10, .8);
        FX.burst(this.playerX(), this.playerY(), 40, { kind: 'pixel', col: '#f2f2ee', size: 5, life: 1.2 });
        this.say('* ORANGE DISGUISE. Black robe. White mask. A golden knife that cuts life code.\n* Defence, binding vows and Infinity no longer apply. Two swings is all it takes.');
        this.bark(this.e.infinity
          ? 'ORANGE: "the knife doesnt go THROUGH the space. it just ARRIVES."'
          : 'ORANGE: "oh no. oh NO. he brought out the knife."');
        break;
      case 'null':
        this.enemyDebuff.null = ab.turns; this.enemyDebuff.skipNext = true;
        Audio.sfx('null');
        FX.ring(ex, ey, { r: 90, col: PAL.green, w: 3, life: .5, kind: 'hex' });
        FX.burst(ex, ey, 20, { kind: 'code', col: PAL.green, life: .8 });
        this.say('* NULL. Their attack value is set to zero. The next one blinks out of existence.');
        break;
      case 'solver': {
        const d = this.calcDmg(ab);
        FX.burst(ex, ey, 34, { kind: 'voxel', col: PAL.cyan, size: 6, life: 1 });
        FX.shake(10, .4); Audio.sfx('bigslam');
        this.dealDamage(d, {}); FX.pop(ex, ey - 40, '-' + d, { col: PAL.cyan, scale: 3 });
        this.say('* ABSOLUTE SOLVER. The street deconstructs into voxels and reassembles as a spear.');
        break; }
      case 'lagspike':
        this.enemyDebuff.lag = ab.turns; this.enemyDebuff.skipNext = true;
        Audio.sfx('glitch'); FX.glitch(.5);
        FX.pop(ex, ey - 30, 'DESYNC 3.00s', { col: PAL.yellow, scale: 2 });
        this.say('* LAG SPIKE. Their brain desynchronises from the timeline. They rubberband backwards.');
        break;
      case 'assetflip': {
        const missing = G.hpMax - G.hp;
        const swap = Math.min(missing, Math.round(this.ehp * .25));
        G.heal(missing); this.ehp = Math.max(0, this.ehp - swap);
        Audio.sfx('warp'); FX.glitch(.4);
        FX.pop(this.playerX(), this.playerY() - 30, '+' + missing, { col: PAL.pink, scale: 2 });
        FX.pop(ex, ey - 40, '-' + swap, { col: PAL.pink, scale: 3 });
        this.say('* ASSET FLIP. Your injury data is traded for their pristine health state.');
        this.checkDeath();
        break; }
      case 'vgcopy': this.openCopyMenu(); return;   // handled above
      default: {
        const d = this.calcDmg(ab);
        this.dealDamage(d, {}); FX.pop(ex, ey - 40, '-' + d, { col: ab.col, scale: 3 });
        this.say('* ' + ab.name + '. ' + d + ' damage.');
      }
    }
    this.toResolve();
  },

  upSelectCopy(dt) {
    const L = this.copyList || [];
    if (!L.length) { this.st = 'menu'; return; }
    if (Input.just('back')) { this.st = 'menu'; Audio.sfx('cancel'); return; }
    if (Input.just('up')) { this.idx = (this.idx + L.length - 1) % L.length; Audio.sfx('move'); }
    if (Input.just('down')) { this.idx = (this.idx + 1) % L.length; Audio.sfx('move'); }
    if (Input.just('ok')) { Audio.sfx('ok'); this.useCopy(L[this.idx]); }
  },

  /* fire a technique Kenji has witnessed, rendered as a neon retro-game mod */
  useCopy(c) {
    const ex = this.enemyX(), ey = this.enemyY();
    FX.techniqueCutIn({ name: c.name, jp: c.jp, kanji: null, col: c.col, colD: '#000', sfx: 'glitch' });
    const inSandbox = DomainFight.def && DomainFight.def.id === 'sandbox';
    if (c.heal) {                                   // Save / Load
      const back = Math.round(G.hpMax * .45);
      const before = G.hp; G.heal(back);
      Audio.sfx('heal');
      FX.pop(this.playerX(), this.playerY() - 30, '+' + (G.hp - before), { col: PAL.yellow, scale: 2 });
      this.say('* VIDEO GAME COPY: ' + c.name + '.\n* You load a save from five seconds ago. The damage never happened.');
    } else if (c.iframe) {                           // Invincibility Frames
      this.playerBuff.ghost = 2;
      Audio.sfx('warp');
      FX.pop(this.playerX(), this.playerY() - 30, 'I-FRAMES', { col: PAL.cyan, scale: 2 });
      this.say('* VIDEO GAME COPY: ' + c.name + '.\n* You air-dash out of your own hitbox for two turns.');
    } else {
      let d = Math.max(1, Math.round(G.atkTotal() * c.power * 1.7 * (this.playerBuff.atk || 1)) - this.edefNow());
      if (this.inGhost()) d = this.ghostDmg(d);
      if (inSandbox) d = Math.round(d * 1.5);        // maxed out inside Sandbox Mode
      FX.burst(ex, ey, 26, { kind: 'pixel', col: c.col, size: 5, life: .8 });
      FX.ring(ex, ey, { r: 80, col: c.col, w: 3, life: .4 });
      Audio.sfx('crit');
      this.dealDamage(d, {});
      FX.pop(ex, ey - 40, '-' + d, { col: c.col, scale: 3 });
      this.say('* VIDEO GAME COPY: ' + c.name + '.\n* ' + c.flavour);
    }
    this.toResolve();
  },

  openCopyMenu() {
    const list = copyableUnlocked();
    if (!list.length) {
      this.say('* No techniques witnessed yet. Watch someone use one first.');
      this.st = 'menu'; return;
    }
    this.selKind = 'copy';
    this.copyList = list.map(c => Object.assign({ desc: c.flavour, tag: 'MOD' }, c));
    this.idx = 0; this.st = 'selectcopy';
  },

  /* the Executioner's knife: ignores defensive metrics AND binding vows,
     and cuts straight into the target's life code -> half their max HP a swing */
  inGhost() { return this.transform === 'ghostface'; },
  ghostDmg(d) { return Math.max(Math.round(d * 2.4), Math.ceil(this.ehpMax * .5)); },

  calcDmg(ab, pierce) {
    const def = pierce || ab.pierce || this.inGhost() ? 0 : this.edefNow();
    let d = Math.max(1, Math.round(G.atkTotal() * (ab.power || 1) * 1.7 * (this.playerBuff.atk || 1)) - def);
    if (this.inGhost()) d = this.ghostDmg(d);
    if (G.oneShot) d = 99999;
    return d;
  },
  edefNow() {
    let d = this.edef;
    if (this.inGhost()) return 0;                        // nothing defends against the knife
    if (this.enemyDebuff.null) d = 0;
    if (this.e.infinity && !G.has('null')) d = 999;      // can't touch Gojo without Null
    if (this.e.infinity && this.enemyDebuff.null) d = 0;
    return d;
  },

  dealDamage(d, o = {}) {
    if (this.e.infinity && this.inGhost()) {
      // the golden knife does not travel through the space Infinity divides
      FX.pop(this.enemyX(), this.enemyY() - 30, 'INFINITY BYPASSED', { col: '#f2f2ee', scale: 2 });
      FX.burst(this.enemyX(), this.enemyY(), 18, { kind: 'spark', col: '#ffd24a', size: 4, life: .6 });
    }
    if (this.e.infinity && !this.inGhost() && !this.enemyDebuff.null && !this.enemyDebuff.infinityOff && !G.god) {
      FX.pop(this.enemyX(), this.enemyY() - 30, 'INFINITY', { col: PAL.cyan, scale: 2 });
      Audio.sfx('block');
      this.say('* Your hand slows to a stop an inch away. Infinity. (Try NULL.)');
      this.toResolve(); return;
    }
    this.ehp = Math.max(0, this.ehp - d);
    this.eFlash = .18; this.shakeE = .2;
    this.checkPhases();
    this.checkDeath();
  },
  checkDeath() {
    if (this.ehp <= 0 && !this.e.noDeath) { this.win(); }
    // one connect with the Executioner's knife and a sparring partner calls it
    else if (this.e.sparring && this.inGhost() && this.ehp < this.ehpMax) {
      this.say('* The knife lands. The match is over the instant it touches him.');
      this.bark('"OKAY. OKAY! Match. That\'s the match, kiddo."');
      FX.pop(this.enemyX(), this.enemyY() - 50, 'MATCH OVER', { col: '#ffd24a', scale: 3, crit: true });
      this.win(true);
    }
    else if (this.e.sparring && this.ehp / this.ehpMax <= (this.e.endAt || .35)) { this.win(true); }
  },
  checkPhases() {
    const ph = this.e.phases || [];
    ph.forEach((p, i) => {
      if (this.phaseHit[i]) return;
      if (this.ehp / this.ehpMax <= p.at) {
        this.phaseHit[i] = true;
        if (p.bark) this.bark(p.bark);
        if (p.buff) { this.eatk += p.buff.atk || 0; this.edef += p.buff.def || 0; }
        if (p.swap) this.espr = p.swap;
        if (p.pattern) this.forcePattern = p.pattern;
        if (p.domain) this.domainPending = p.domain;
        FX.shake(8, .5); Audio.sfx('alarm');
      }
    });
  },

  /* ============ ACT ============ */
  doAct(a) {
    switch (a.id) {
      case 'check':
        this.say('* ' + this.e.name + '  ATK ' + this.eatk + '  DEF ' + this.edef + '\n* ' + this.e.check);
        G.codex[this.eid] = true;
        break;
      case 'talk':
        this.sparePct = Math.min(100, this.sparePct + 34);
        this.say('* You said something only a 12-year-old would say. It landed. (' + this.sparePct + '%)');
        break;
      case 'snack': {
        this.snacks = (this.snacks || 0) + 1;
        if (this.snacks > 2) {
          Audio.sfx('deny');
          this.say('* Your pockets are empty. You ate everything. You are twelve.');
          break;
        }
        G.heal(14); Audio.sfx('heal');
        FX.pop(this.playerX(), this.playerY() - 20, '+14', { col: PAL.green, scale: 2 });
        this.say('* You ate a snack mid-fight. +14 HP. (' + (3 - this.snacks) + ' left.) Orange is furious he cannot eat.');
        break; }
      case 'hype':
        if ((this.playerBuff.atk || 1) >= 1.35) {
          Audio.sfx('deny');
          this.bark('ORANGE: "im ALREADY screaming. i cant scream MORE."');
          this.say('* Orange is already at maximum volume. (ATK buff does not stack.)');
          break;
        }
        this.playerBuff.atk = 1.35;
        Audio.sfx('orangetalk');
        this.bark('ORANGE: "YOURE HIM. YOURE LITERALLY HIM. SWING."');
        this.say('* Orange screams directly into your skull. ATK up.');
        break;
      case 'observe':
        this.enemyDebuff.infinityOff = 1;
        this.say('* You read the equation. It is a division-by-zero error. It has a value. (Infinity weakened.)');
        break;
    }
    this.toResolve();
  },

  trySpare() {
    const canSpare = this.e.spareAt != null && (this.ehp / this.ehpMax <= this.e.spareAt || this.sparePct >= 100);
    if (canSpare) {
      Audio.sfx('buy'); this.spared = true; this.win(true);
    } else {
      Audio.sfx('deny');
      this.say(this.e.spareAt == null
        ? '* It is not interested in mercy.'
        : '* Not yet. Wear them down or talk to them first.');
      this.toResolve();
    }
  },

  /* ============ DOMAIN ============ */
  openDomain(ab) {
    const def = DOMAINS[ab.domain];
    if (!this.canAfford(ab)) {
      Audio.sfx('deny');
      this.say('* Not enough FOCUS for that barrier. (' + Math.floor(this.tension) + '/' + this.focusCost(ab) + ')');
      this.st = 'menu'; return;
    }
    G.domainsUsed++;
    this.tension = Math.max(0, this.tension - this.focusCost(ab));
    FX.domainExpansion(def, { x: this.playerX(), y: this.playerY() });
    timers.after(4.1, () => {
      DomainFight.start(def, this, ab);
    });
    this.st = 'message'; this.msgWait = 4.3; this.msgT = 0;
    this.say('* DOMAIN EXPANSION: ' + def.name.toUpperCase());
  },
  upMessage(dt) {
    this.msgT += dt;
    if (this.msgT >= (this.msgWait || 1)) { this.st = 'menu'; }
  },

  /* returning from a domain fight */
  domainResult(res) {
    if (res.kill) {
      this.ehp = 0; this.win();
    } else {
      const d = res.damage || 0;
      this.ehp = Math.max(0, this.ehp - d);
      this.say('* The domain collapses. ' + d + ' damage dealt inside.');
      this.checkPhases();
      if (this.ehp <= 0) this.win(); else this.endPlayerTurn();
    }
  },

  /* ============ turn flow ============ */
  endPlayerTurn() {
    if (!this.active) return;
    if (this.result) { this.st = this.result === 'lose' ? 'defeat' : 'victory'; return; }
    if (this.ehp <= 0) { this.win(); return; }
    this.turn++;
    // tick buffs
    if (this.playerBuff.ghost) { this.playerBuff.ghost--; if (!this.playerBuff.ghost) delete this.playerBuff.ghost; }
    if (this.transform) { this.transformT--; if (this.transformT <= 0) { this.transform = null; this.say('* The Ghost Face skin dissolves back into pixels.'); } }
    Object.keys(this.enemyDebuff).forEach(k => {
      if (typeof this.enemyDebuff[k] === 'number') {
        this.enemyDebuff[k]--; if (this.enemyDebuff[k] <= 0) delete this.enemyDebuff[k];
      }
    });
    this.st = 'enemyintro'; this.t = 0;
  },
  upResolve(dt) {
    if (this.result) { this.st = this.result === 'lose' ? 'defeat' : 'victory'; this.t = 0; return; }
    if (this.t > .75 || Input.just('ok')) this.endPlayerTurn();
  },
  upEnemyIntro(dt) {
    if (this.t < .5) return;
    // enemy domain?
    if (this.domainPending) {
      const d = DOMAINS[this.domainPending]; this.domainPending = null;
      this.enemyDomainDef = d;
      FX.enemyDomain(d, { x: this.enemyX(), y: this.enemyY() });
      this.bark('"DOMAIN EXPANSION."');
      timers.after(4.2, () => {
        const mine = domainAbilities();
        if (mine.length) {
          const myDef = DOMAINS[mine[mine.length - 1].domain];
          FX.domainClash(d, myDef);
          timers.after(2.7, () => {
            Dlg.start([
              ['kenji', 'Your domain has a lot of cool visual assets. I am going to borrow them.'],
              { who: 'sys', t: 'DOMAIN CLASH RESOLVED. Closed barrier holds. Sure-hit intercepted: [ACCESS DENIED]' }
            ], () => { this.beginDodge(); });
          });
        } else {
          Dlg.start([
            { who: 'sys', t: 'WARNING: HOSTILE SURE-HIT DETECTED. NO COUNTER-BARRIER AVAILABLE.' },
            ['orange', 'kenji that is a SURE HIT. move move move MOVE'],
            { who: 'sys', t: 'ORANGE SURVIVAL engaged — hitboxes desynchronised from the collision engine.' }
          ], () => { this.beginDodge(true); });
        }
      });
      this.st = 'message'; this.msgWait = 99; this.msgT = 0;
      return;
    }
    if (this.enemyDebuff.skipNext || this.enemyDebuff.mute) {
      delete this.enemyDebuff.skipNext;
      this.say(this.enemyDebuff.mute
        ? '* [SYSTEM MUTE: PERMISSIONS REVOKED] They cannot act.'
        : '* They rubberband violently back into their previous position. Turn skipped.');
      Audio.sfx('glitch'); FX.glitch(.3);
      this.toResolve(); this.turnSkipped = true;
      timers.after(.9, () => { if (this.st === 'resolve') { this.st = 'menu'; } });
      return;
    }
    this.beginDodge();
  },

  /* ============ DODGE PHASE (bullet hell) ============ */
  beginDodge(sureHit = false) {
    this.st = 'dodge'; this.dodgeT = 0;
    const box = this.boxRect();
    this.soul.x = box.x + box.w / 2; this.soul.y = box.y + box.h / 2;
    this.bullets = [];
    const pats = this.e.patterns || [];
    this.pattern = this.forcePattern || (pats.length ? pats[this.turn % pats.length] : 'bullets');
    this.forcePattern = null;
    this.sureHit = sureHit;
    this.dodgeDur = pats.length ? 6.2 + Math.min(2.5, this.turn * .3) : 2;
    this.patT = 0; this.patIdx = 0; this.spawnT = 0; this.spawnT2 = 0; this.spinInit = false;
    this.say('* ' + (this.dialogueBark || pick(this.e.barks)));
    Audio.sfx('swing');
  },
  boxRect() { return { x: W / 2 - 152, y: 220, w: 304, h: 140 }; },

  upDodge(dt) {
    const box = this.boxRect();
    this.dodgeT += dt; this.patT += dt; this.spawnT += dt; this.spawnT2 = (this.spawnT2 || 0) + dt;
    // soul movement
    const sp = 150 * (this.playerBuff.ghost ? 1.35 : 1) * G.speedMult;
    let dx = 0, dy = 0;
    if (Input.isDown('left')) dx -= 1; if (Input.isDown('right')) dx += 1;
    if (Input.isDown('up')) dy -= 1; if (Input.isDown('down')) dy += 1;
    const m = Math.hypot(dx, dy) || 1;
    this.soul.x = clamp(this.soul.x + (dx / m) * sp * dt, box.x + 5, box.x + box.w - 5);
    this.soul.y = clamp(this.soul.y + (dy / m) * sp * dt, box.y + 5, box.y + box.h - 5);

    this.runPattern(dt, box);

    // bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.t += dt;
      if (b.up) b.up(b, dt, this, box);
      else { b.x += b.vx * dt; b.y += b.vy * dt; }
      if (b.life && b.t > b.life) { this.bullets.splice(i, 1); continue; }
      if (b.x < box.x - 90 || b.x > box.x + box.w + 90 || b.y < box.y - 120 || b.y > box.y + box.h + 120) {
        if (!b.keep) { this.bullets.splice(i, 1); continue; }
      }
      // collision
      if (!b.harmless && b.t > (b.delay || 0)) {
        const hit = b.rectW
          ? circleRect(this.soul.x, this.soul.y, 4, b.x - b.rectW / 2, b.y - b.rectH / 2, b.rectW, b.rectH)
          : dist(this.soul.x, this.soul.y, b.x, b.y) < (b.r || 6) + 4;
        if (hit) this.soulHit(b);
        else if (b.rectW ? false : dist(this.soul.x, this.soul.y, b.x, b.y) < (b.r || 6) + 14) {
          // graze
          this.graze += dt * 10; this.tension = clamp(this.tension + dt * 8, 0, this.tensionMax);
          if (Math.random() < .25) FX.part(this.soul.x, this.soul.y, { kind: 'spark', col: PAL.green, size: 2, life: .2, g: 0 });
        }
      }
    }
    if (this.dodgeT >= this.dodgeDur) {
      this.bullets = []; this.st = 'menu'; this.sureHit = false;
      this.say('* Your turn.');
      if (this.graze > 30) { this.graze = 0; }
    }
  },

  soulHit(b) {
    if (this.invul > 0 || this.playerBuff.ghost || G.god) {
      if (this.playerBuff.ghost && Math.random() < .2)
        FX.pop(this.soul.x, this.soul.y - 14, 'SPECTATOR', { col: PAL.orange, scale: 1, life: .5 });
      return;
    }
    let dmg = Math.max(1, Math.round((b.dmg || this.eatk) * (1 / (this.playerBuff.def || 1))) - Math.round(G.defTotal() * .4));
    if (G.has('solver_shield') && Math.random() < .3) {
      Audio.sfx('block');
      FX.pop(this.soul.x, this.soul.y - 16, 'PIXELIZED', { col: PAL.cyan, scale: 1, life: .6 });
      FX.burst(this.soul.x, this.soul.y, 10, { kind: 'pixel', col: PAL.cyan, size: 3, life: .4 });
      this.invul = .45; this.bullets.splice(this.bullets.indexOf(b), 1);
      return;
    }
    // ORANGE SURVIVAL: lethal hits clip through
    if (G.hp - dmg <= 0 && G.has('o_survival') && !this.usedOnce.survival) {
      this.usedOnce.survival = true;
      Audio.sfx('warp'); FX.flash(PAL.orange, .3, .6); FX.shake(8, .4);
      FX.pop(this.soul.x, this.soul.y - 20, 'ORANGE SURVIVAL', { col: PAL.orange, scale: 2, life: 1.2 });
      this.bark('ORANGE: "clipped through it. you owe me."');
      this.invul = 1.2; return;
    }
    G.hp = Math.max(0, G.hp - dmg);
    this.tension = clamp(this.tension + 6, 0, this.tensionMax);
    this.invul = .7; this.pHurt = .4;
    Audio.sfx('hurt'); FX.shake(6, .25); FX.flash('#ff3b3b', .12, .4);
    FX.pop(this.soul.x, this.soul.y - 16, '-' + dmg, { col: PAL.red, scale: 2 });
    if (G.hp <= 0) this.lose();
  },

  /* ---- bullet pattern library ---- */
  runPattern(dt, box) {
    const P = this.pattern, cx = box.x + box.w / 2, cy = box.y + box.h / 2;
    const push = b => this.bullets.push(Object.assign({ t: 0, r: 6, col: '#fff' }, b));
    const rate = (iv, fn) => { if (this.spawnT >= iv) { this.spawnT = 0; fn(); } };
    const rate2 = (iv, fn) => { if ((this.spawnT2 || 0) >= iv) { this.spawnT2 = 0; fn(); } };
    const clampSoul = () => {
      this.soul.x = clamp(this.soul.x, box.x + 5, box.x + box.w - 5);
      this.soul.y = clamp(this.soul.y, box.y + 5, box.y + box.h - 5);
    };

    switch (P) {
      case 'bullets':
        rate(.42, () => {
          const n = 5 + Math.min(4, this.turn);
          for (let i = 0; i < n; i++) {
            const a = (i / n) * TAU + this.dodgeT;
            push({ x: cx + Math.cos(a) * 150, y: cy + Math.sin(a) * 110,
              vx: -Math.cos(a) * 90, vy: -Math.sin(a) * 90, col: '#c79aff', r: 5 });
          }
        });
        break;
      case 'homing':
        rate(.7, () => {
          const side = rndi(4);
          const sx = side === 0 ? box.x - 20 : side === 1 ? box.x + box.w + 20 : rnd(box.x + box.w, box.x);
          const sy = side === 2 ? box.y - 20 : side === 3 ? box.y + box.h + 20 : rnd(box.y + box.h, box.y);
          push({ x: sx, y: sy, vx: 0, vy: 0, r: 7, col: '#ff7ad9', life: 4.5,
            up: (b, d, B) => {
              const ang = Math.atan2(B.soul.y - b.y, B.soul.x - b.x);
              b.vx = lerp(b.vx, Math.cos(ang) * 78, d * 1.6);
              b.vy = lerp(b.vy, Math.sin(ang) * 78, d * 1.6);
              b.x += b.vx * d; b.y += b.vy * d;
              if (Math.random() < .3) FX.part(b.x, b.y, { kind: 'dust', col: '#ff7ad9', size: 2, life: .25, g: 0 });
            } });
        });
        break;
      case 'rain':
        rate(.16, () => {
          push({ x: rnd(box.x + box.w - 10, box.x + 10), y: box.y - 14, vx: 0, vy: 150 + rnd(70), r: 4, col: '#ffd24a' });
        });
        break;
      case 'laser':
        rate(1.5, () => {
          const horiz = Math.random() < .5;
          const pos = horiz ? rnd(box.y + box.h - 20, box.y + 20) : rnd(box.x + box.w - 20, box.x + 20);
          push({ x: horiz ? box.x + box.w / 2 : pos, y: horiz ? pos : box.y + box.h / 2,
            rectW: horiz ? box.w : 10, rectH: horiz ? 10 : box.h,
            delay: .8, life: 1.5, col: '#ff3b3b', telegraph: true, dmg: this.eatk + 4,
            up: b => { if (b.t > .8 && !b.fired) { b.fired = true; Audio.sfx('swing'); } } });
        });
        break;
      case 'cleave':
        rate(1.25, () => {
          const vert = Math.random() < .5;
          const pos = vert ? rnd(box.x + box.w - 30, box.x + 30) : rnd(box.y + box.h - 30, box.y + 30);
          push({ x: vert ? pos : box.x + box.w / 2, y: vert ? box.y + box.h / 2 : pos,
            rectW: vert ? 16 : box.w, rectH: vert ? box.h : 16,
            delay: .62, life: 1.0, col: '#ff5a5a', telegraph: true, slash: true, dmg: this.eatk + 6,
            up: b => { if (b.t > .62 && !b.fired) { b.fired = true; Audio.sfx('swing'); FX.shake(4, .1); } } });
        });
        break;
      case 'slashrain':
        rate(.22, () => {
          const x0 = rnd(box.x + box.w + 60, box.x - 60);
          push({ x: x0, y: box.y - 20, vx: -60, vy: 230, r: 5, col: '#ff5a5a', slash: true });
        });
        break;
      case 'spin':
        if (!this.spinInit) {
          this.spinInit = true;
          for (let i = 0; i < 4; i++)
            push({ x: cx, y: cy, r: 6, col: '#ffe14d', keep: true, life: 99,
              up: (b, d, B, bx) => {
                const a = B.dodgeT * 2.1 + (i / 4) * TAU;
                const rr = 36 + Math.sin(B.dodgeT * 1.3) * 34;
                b.x = bx.x + bx.w / 2 + Math.cos(a) * rr * 1.5;
                b.y = bx.y + bx.h / 2 + Math.sin(a) * rr;
              } });
        }
        rate(.9, () => push({ x: rnd(box.x + box.w, box.x), y: box.y - 10, vx: 0, vy: 120, r: 4, col: '#ffe14d' }));
        break;
      case 'grid':
        rate(1.1, () => {
          const n = 4;
          for (let i = 0; i < n; i++) {
            const gap = rndi(n);
            if (i === gap) continue;
            push({ x: box.x - 20, y: box.y + 18 + i * (box.h - 30) / (n - 1), vx: 120, vy: 0,
              rectW: 26, rectH: 12, col: PAL.cyan, dmg: this.eatk });
          }
        });
        break;
      case 'bugs':
        rate(.3, () => {
          const fromLeft = Math.random() < .5;
          push({ x: fromLeft ? box.x - 12 : box.x + box.w + 12, y: rnd(box.y + box.h - 8, box.y + 8),
            vx: fromLeft ? 105 : -105, vy: 0, r: 5, col: '#8fbf5f',
            up: (b, d) => { b.x += b.vx * d; b.y += Math.sin(b.t * 9) * 52 * d; } });
        });
        break;
      case 'hands':
        rate(.75, () => {
          const x = rnd(box.x + box.w - 20, box.x + 20);
          push({ x, y: box.y + box.h + 20, vx: 0, vy: -96, rectW: 18, rectH: 26, col: '#e8bd9c',
            hand: true, dmg: this.eatk + 3 });
        });
        break;
      case 'fire':
        rate(.9, () => {
          const x = rnd(box.x + box.w - 24, box.x + 24);
          push({ x, y: box.y + box.h - 20, rectW: 20, rectH: 40, delay: .55, life: 1.25,
            col: '#ff7a2a', telegraph: true, fire: true, dmg: this.eatk + 5,
            up: b => { if (b.t > .55 && Math.random() < .6) FX.part(b.x + rnd(16, -16), b.y, { kind: 'ember', col: '#ffb347', size: 3, life: .4, vy: -80, g: 40 }); } });
        });
        break;
      case 'meteor':
        rate(1.4, () => {
          const x = rnd(box.x + box.w - 30, box.x + 30);
          push({ x, y: box.y - 40, vx: 0, vy: 190, r: 13, col: '#ff5a2a', dmg: this.eatk + 9,
            up: (b, d) => { b.y += b.vy * d; FX.part(b.x, b.y, { kind: 'ember', col: '#ffb347', size: 3, life: .3, g: 0 }); } });
        });
        break;
      case 'water':
        rate(.5, () => {
          push({ x: box.x - 16, y: rnd(box.y + box.h - 10, box.y + 10), vx: 110, vy: 0, r: 6, col: '#7fd9e8',
            up: (b, d) => { b.x += b.vx * d; b.y += Math.sin(b.t * 4 + b.x * .05) * 70 * d; } });
        });
        break;
      case 'thorns':
        rate(.65, () => {
          const fromBottom = Math.random() < .6;
          const x = rnd(box.x + box.w - 16, box.x + 16);
          push({ x, y: fromBottom ? box.y + box.h + 14 : box.y - 14, rectW: 10, rectH: 30,
            vx: 0, vy: fromBottom ? -120 : 120, col: '#4a7a3a', dmg: this.eatk + 2,
            up: (b, d) => { b.y += b.vy * d; b.rectH = 30 + Math.sin(b.t * 7) * 6; } });
        });
        break;
      case 'purple':
        rate(2.2, () => {
          push({ x: box.x + box.w / 2, y: box.y - 36, r: 20, col: '#9b4dff', dmg: this.eatk + 12, life: 4,
            up: (b, d, B) => {
              b.y += 44 * d;
              b.x = lerp(b.x, B.soul.x, d * .9);
              if (Math.random() < .6) FX.part(b.x + rnd(20, -20), b.y + rnd(20, -20), { kind: 'spark', col: '#d9a2ff', size: 3, life: .3, g: 0 });
            } });
        });
        rate(.001, () => {});
        break;
      case 'fuga':
        rate(1.0, () => {
          const n = 7;
          for (let i = 0; i < n; i++) {
            const a = -Math.PI / 2 + (i - (n - 1) / 2) * .22;
            push({ x: cx, y: box.y - 24, vx: Math.cos(a) * 60, vy: Math.sin(a) * -130, r: 6, col: '#ff7a2a', dmg: this.eatk + 4 });
          }
        });
        break;

      /* ===== SIGNATURE PATTERNS ===== */
      case 'redblue':            // Gojo: Blue drags your soul in, Red shoves it away
        rate(1.9, () => {
          const blue = Math.random() < .5;
          push({
            x: rnd(box.x + box.w - 40, box.x + 40), y: rnd(box.y + box.h - 30, box.y + 30),
            r: 15, life: 2.1, col: blue ? '#3ddcff' : '#ff3b3b', dmg: this.eatk + 6, orb: true,
            up: (b, d, B) => {
              const a = Math.atan2(b.y - B.soul.y, b.x - B.soul.x);
              const pull = blue ? 105 : -105;
              B.soul.x += Math.cos(a) * pull * d;
              B.soul.y += Math.sin(a) * pull * d;
              clampSoul();
            }
          });
        });
        break;
      case 'hollowpurple':       // one enormous erasing beam, heavily telegraphed
        rate(2.8, () => {
          const horiz = Math.random() < .5;
          const pos = horiz ? rnd(box.y + box.h - 28, box.y + 28) : rnd(box.x + box.w - 28, box.x + 28);
          push({ x: horiz ? box.x + box.w / 2 : pos, y: horiz ? pos : box.y + box.h / 2,
            rectW: horiz ? box.w : 36, rectH: horiz ? 36 : box.h,
            delay: 1.0, life: 1.7, col: '#9b4dff', telegraph: true, beam: true, dmg: this.eatk + 15,
            up: b => { if (b.t > b.delay && !b.fired) { b.fired = true; Audio.sfx('crit'); FX.shake(7, .25); } } });
        });
        break;
      case 'divinedogs':         // two shikigami that run you down along the floor
        rate(2.3, () => {
          [0, 1].forEach(i => push({
            x: i ? box.x + box.w + 18 : box.x - 18, y: box.y + box.h - 16,
            vx: i ? -165 : 165, vy: 0, rectW: 24, rectH: 15, col: '#4a5a7a', dog: true, dmg: this.eatk + 2,
            up: (b, d, B) => { b.x += b.vx * d; b.y += (B.soul.y - b.y) * .9 * d; }
          }));
        });
        break;
      case 'nue':                // lightning drops where you are standing
        rate(1.0, () => {
          push({ x: this.soul.x, y: box.y + box.h / 2, rectW: 13, rectH: box.h,
            delay: .62, life: 1.0, col: '#7fd9ff', telegraph: true, dmg: this.eatk + 6 });
        });
        break;
      case 'shrine':             // Malevolent Shrine: the rain never stops
        rate(.42, () => {
          const vert = Math.random() < .5;
          const pos = vert ? rnd(box.x + box.w - 18, box.x + 18) : rnd(box.y + box.h - 18, box.y + 18);
          push({ x: vert ? pos : box.x + box.w / 2, y: vert ? box.y + box.h / 2 : pos,
            rectW: vert ? 11 : box.w, rectH: vert ? box.h : 11,
            delay: .38, life: .7, col: '#ff5a5a', telegraph: true, slash: true, dmg: this.eatk + 3 });
        });
        break;
      case 'blood':              // Choso: piercing blood, supersonic once it fires
        rate(.85, () => {
          const a = Math.atan2(this.soul.y - (box.y - 10), this.soul.x - cx);
          push({ x: cx, y: box.y - 10, r: 6, col: '#8c0f0f', dmg: this.eatk + 8,
            delay: .4, telegraph: true, life: 3,
            up: (b, d) => { if (b.t > .4) { b.x += Math.cos(a) * 430 * d; b.y += Math.sin(a) * 430 * d; } } });
        });
        break;
      case 'pollen':             // Hanami: drifting poison that lingers
        rate(.75, () => {
          push({ x: rnd(box.x + box.w - 24, box.x + 24), y: box.y - 10, r: 20,
            col: '#7ba85f', dmg: this.eatk - 1, life: 3.4, cloud: true,
            up: (b, d) => { b.x += Math.sin(b.t * 2.2) * 26 * d; b.y += 34 * d; } });
        });
        break;
      case 'tsunami':            // Dagon: a wave with one gap in it
        rate(2.5, () => {
          const gapX = rnd(box.x + box.w - 90, box.x + 40), gapW = 56;
          const up = Math.random() < .5;
          const y0 = up ? box.y + box.h + 24 : box.y - 24, vy = up ? -95 : 95;
          const leftW = gapX - box.x, rightW = (box.x + box.w) - (gapX + gapW);
          if (leftW > 6) push({ x: box.x + leftW / 2, y: y0, rectW: leftW, rectH: 24, col: '#7fd9e8',
            dmg: this.eatk + 4, life: 4, wave: true, up: (b, d) => { b.y += vy * d; } });
          if (rightW > 6) push({ x: gapX + gapW + rightW / 2, y: y0, rectW: rightW, rectH: 24, col: '#7fd9e8',
            dmg: this.eatk + 4, life: 4, wave: true, up: (b, d) => { b.y += vy * d; } });
        });
        break;
      case 'fish':               // Dagon: death swarm
        rate(.26, () => {
          const fromLeft = Math.random() < .5;
          push({ x: fromLeft ? box.x - 10 : box.x + box.w + 10, y: rnd(box.y + box.h - 10, box.y + 10),
            vx: fromLeft ? 140 : -140, vy: 0, r: 6, col: '#9fe8ff', dmg: this.eatk,
            up: (b, d) => { b.x += b.vx * d; b.y += Math.sin(b.t * 7) * 64 * d; } });
        });
        break;
      case 'handwall':           // Mahito: a wall of hands with one way through
        rate(1.7, () => {
          const n = 5, gap = rndi(n);
          for (let i = 0; i < n; i++) {
            if (i === gap) continue;
            push({ x: box.x + 14 + i * (box.w - 28) / (n - 1), y: box.y + box.h + 22,
              vx: 0, vy: -88, rectW: 21, rectH: 28, col: '#e8bd9c', hand: true, dmg: this.eatk + 3,
              up: (b, d) => { b.y += b.vy * d; } });
          }
        });
        break;
      case 'soulgrab':           // Mahito: hands that chase the soul itself
        rate(1.3, () => {
          push({ x: rnd(box.x + box.w, box.x), y: box.y - 16, r: 9, col: '#ff9ec4',
            dmg: this.eatk + 6, life: 4.2, vx: 0, vy: 0,
            up: (b, d, B) => {
              const a = Math.atan2(B.soul.y - b.y, B.soul.x - b.x);
              b.vx = lerp(b.vx, Math.cos(a) * 92, d * 1.9);
              b.vy = lerp(b.vy, Math.sin(a) * 92, d * 1.9);
              b.x += b.vx * d; b.y += b.vy * d;
            } });
        });
        break;
      case 'jackpot':            // Hakari: pachinko balls bouncing off every wall
        rate(.65, () => {
          push({ x: rnd(box.x + box.w - 24, box.x + 24), y: box.y + 8, vx: rnd(170, -170), vy: 110,
            r: 7, col: '#ffd24a', dmg: this.eatk, life: 6.5, keep: true,
            up: (b, d, B, bx) => {
              b.x += b.vx * d; b.y += b.vy * d; b.vy += 230 * d;
              if (b.x < bx.x + 5) { b.x = bx.x + 5; b.vx = Math.abs(b.vx); }
              if (b.x > bx.x + bx.w - 5) { b.x = bx.x + bx.w - 5; b.vx = -Math.abs(b.vx); }
              if (b.y > bx.y + bx.h - 5) { b.y = bx.y + bx.h - 5; b.vy = -Math.abs(b.vy) * .84; }
              if (b.y < bx.y + 5) { b.y = bx.y + 5; b.vy = Math.abs(b.vy); }
            } });
        });
        break;
      case 'gavel':              // Higuruma: the gavel comes down, then the verdict scatters
        rate(2.1, () => {
          push({ x: rnd(box.x + box.w - 40, box.x + 40), y: box.y - 26, rectW: 54, rectH: 28,
            col: '#c9a227', delay: .62, telegraph: true, dmg: this.eatk + 9, life: 2.4,
            up: (b, d, B, bx) => {
              if (b.t <= b.delay) return;
              b.y += 640 * d;
              if (b.y > bx.y + bx.h - 18 && !b.boom) {
                b.boom = true; Audio.sfx('bigslam'); FX.shake(7, .22);
                for (let i = -3; i <= 3; i++) if (i) B.bullets.push({
                  x: b.x, y: bx.y + bx.h - 12, vx: i * 95, vy: -50, r: 5, t: 0,
                  col: '#ffd24a', dmg: B.eatk, life: 2.4
                });
              }
            } });
        });
        break;
      case 'electric':           // Kashimo: a live wire strung across the box
        rate(1.45, () => {
          const y0 = rnd(box.y + box.h - 22, box.y + 22), y1 = rnd(box.y + box.h - 22, box.y + 22);
          for (let i = 0; i <= 11; i++) {
            const k = i / 11;
            push({ x: box.x + k * box.w, y: lerp(y0, y1, k) + rnd(5, -5), r: 6,
              col: '#7fd9ff', delay: .55, life: 1.15, telegraph: true, dmg: this.eatk + 5 });
          }
        });
        break;
      case 'sky':                // Uro: the sky itself is the weapon
        rate(2.3, () => {
          const gapX = rnd(box.x + box.w - 100, box.x + 46), gapW = 62;
          const lw = gapX - box.x, rw = (box.x + box.w) - (gapX + gapW);
          if (lw > 6) push({ x: box.x + lw / 2, y: box.y - 18, rectW: lw, rectH: 20, col: '#9fd4ff',
            dmg: this.eatk + 6, life: 4, up: (b, d) => { b.y += 118 * d; } });
          if (rw > 6) push({ x: gapX + gapW + rw / 2, y: box.y - 18, rectW: rw, rectH: 20, col: '#9fd4ff',
            dmg: this.eatk + 6, life: 4, up: (b, d) => { b.y += 118 * d; } });
        });
        break;
      case 'granite':            // Ryu: one absurd beam, sweeping
        rate(3.2, () => {
          push({ x: box.x + 10, y: box.y + box.h / 2, rectW: 20, rectH: box.h, col: '#ff7a2a',
            delay: .85, telegraph: true, beam: true, dmg: this.eatk + 11, life: 3.6,
            up: (b, d) => { if (b.t > b.delay) b.x += 126 * d; } });
        });
        break;
      case 'comedy':             // Takaba: whatever he finds funny
        rate(.46, () => {
          const kind = rndi(4);
          if (kind === 0) push({ x: rnd(box.x + box.w, box.x), y: box.y - 10, vx: 0, vy: 160, r: 10, col: '#ffe14d', dmg: this.eatk });
          else if (kind === 1) push({ x: box.x - 12, y: rnd(box.y + box.h, box.y), vx: 210, vy: 0, rectW: 28, rectH: 11, col: '#ff4fa3', dmg: this.eatk });
          else if (kind === 2) { for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; push({ x: cx, y: cy, vx: Math.cos(a) * 115, vy: Math.sin(a) * 115, r: 5, col: '#4ddd6a', dmg: this.eatk }); } }
          else push({ x: rnd(box.x + box.w, box.x), y: box.y + box.h + 10, vx: 0, vy: -180, r: 7, col: '#3ba7ff', dmg: this.eatk });
        });
        break;
      case 'receipts':           // Reggie: paper becomes whatever was printed on it
        rate(.85, () => {
          push({ x: rnd(box.x + box.w - 24, box.x + 24), y: box.y - 14, vx: rnd(44, -44), vy: 86,
            rectW: 14, rectH: 18, col: '#e8e0cc', dmg: this.eatk, life: 4.5,
            up: (b, d) => {
              b.x += b.vx * d; b.y += b.vy * d;
              if (b.t > 1.0 && !b.became) {
                b.became = true; b.rectW = 28; b.rectH = 26; b.col = '#8a94a8';
                b.vy = 265; b.dmg += 6; Audio.sfx('glitch');
              }
            } });
        });
        break;
      case 'magnet':             // Kirara: everything attracts, including you
        rate(2.5, () => {
          const px = rnd(box.x + box.w - 44, box.x + 44), py = rnd(box.y + box.h - 34, box.y + 34);
          push({ x: px, y: py, r: 11, col: '#ff9ec4', harmless: true, life: 2.6, magnet: true,
            up: (b, d, B) => {
              const a = Math.atan2(b.y - B.soul.y, b.x - B.soul.x);
              B.soul.x += Math.cos(a) * 88 * d; B.soul.y += Math.sin(a) * 88 * d;
              clampSoul();
            } });
          for (let i = 0; i < 5; i++) {
            const a = (i / 5) * TAU;
            push({ x: px + Math.cos(a) * 76, y: py + Math.sin(a) * 76, r: 6, col: '#ffb3d9',
              dmg: this.eatk, life: 2.6,
              up: (b, d) => { const a2 = Math.atan2(py - b.y, px - b.x); b.x += Math.cos(a2) * 62 * d; b.y += Math.sin(a2) * 62 * d; } });
          }
        });
        break;
      case 'manga':              // Charles: the panel borders close in
        rate(2.7, () => {
          const safe = rndi(4);
          const sides = [
            () => push({ x: cx, y: box.y - 12, rectW: box.w, rectH: 12, col: '#e8e0cc', dmg: this.eatk, life: 3.4, up: (b, d) => { b.y += 56 * d; } }),
            () => push({ x: cx, y: box.y + box.h + 12, rectW: box.w, rectH: 12, col: '#e8e0cc', dmg: this.eatk, life: 3.4, up: (b, d) => { b.y -= 56 * d; } }),
            () => push({ x: box.x - 12, y: cy, rectW: 12, rectH: box.h, col: '#e8e0cc', dmg: this.eatk, life: 3.4, up: (b, d) => { b.x += 56 * d; } }),
            () => push({ x: box.x + box.w + 12, y: cy, rectW: 12, rectH: box.h, col: '#e8e0cc', dmg: this.eatk, life: 3.4, up: (b, d) => { b.x -= 56 * d; } })
          ];
          sides.forEach((f, i) => { if (i !== safe && Math.random() < .8) f(); });
        });
        break;
      case 'wheel':              // Mahoraga: the wheel turns, and it gets faster
        if (!this.spinInit) {
          this.spinInit = true;
          for (let i = 0; i < 3; i++) push({ x: cx, y: cy, r: 8, col: '#d9cfc0', keep: true, life: 99,
            up: (b, d, B, bx) => {
              const a = B.dodgeT * (2.0 + B.turn * .22) + (i / 3) * TAU;
              b.x = bx.x + bx.w / 2 + Math.cos(a) * 78;
              b.y = bx.y + bx.h / 2 + Math.sin(a) * 46;
            } });
        }
        rate(1.25, () => push({ x: rnd(box.x + box.w, box.x), y: box.y - 10, vx: 0, vy: 160, r: 6, col: '#ff3b3b', dmg: this.eatk + 4 }));
        break;
      case 'curses':             // Geto / Kenjaku: a spiral of borrowed curses
        rate(1.05, () => {
          const n = 7;
          for (let i = 0; i < n; i++) {
            const a0 = (i / n) * TAU + this.dodgeT * 1.3;
            push({ x: cx, y: cy, r: 6, col: '#9b4dff', dmg: this.eatk, life: 4,
              up: b => { const a2 = a0 + b.t * 1.7, rr = 18 + b.t * 115;
                b.x = cx + Math.cos(a2) * rr; b.y = cy + Math.sin(a2) * rr * .7; } });
          }
        });
        break;
      case 'chains':             // Toji: no cursed energy, just a very fast man
        rate(1.4, () => {
          push({ x: box.x + box.w / 2, y: this.soul.y, rectW: box.w, rectH: 9,
            delay: .45, life: .85, col: '#b9c2d0', telegraph: true, dmg: this.eatk + 10 });
        });
        rate2(.55, () => push({ x: rnd(box.x + box.w, box.x), y: box.y - 8, vx: 0, vy: 190, r: 5, col: '#8a94a8', dmg: this.eatk }));
        break;
      case 'artillery':          // Mechamaru: targeted bombardment
        rate(1.15, () => {
          const tx = this.soul.x, ty = this.soul.y;
          push({ x: tx, y: ty, r: 26, col: '#3ddcff', harmless: true, life: .8, reticle: true });
          push({ x: tx, y: ty, r: 11, col: '#ff7a2a', delay: .78, life: 1.1, telegraph: true, dmg: this.eatk + 7 });
        });
        break;
      default: break;
    }
  },

  /* ============ win / lose ============ */
  /* never clobber a finished battle: a killing blow must stick */
  toResolve() {
    if (this.result) {
      this.st = this.result === 'lose' ? 'defeat' : 'victory';
      return;
    }
    this.st = 'resolve'; this.t = 0;
  },
  win(spared = false) {
    if (this.result) { if (this.result !== 'lose') this.st = 'victory'; return; }
    this.result = spared ? 'spared' : 'win';
    this.st = 'victory'; this.t = 0; this.bullets = [];
    G.battlesWon++;
    const xp = Math.round(this.e.xp * (spared ? .7 : 1));
    const money = Math.round(this.e.money * (spared ? .8 : 1) * rnd(1.15, .9));
    this.rewards = { xp, money, ups: [] };
    G.gainMoney(money);
    this.rewards.ups = G.gainXP(xp);
    Audio.play('win');
    FX.burst(this.enemyX(), this.enemyY(), 50, { kind: 'pixel', col: spared ? PAL.green : '#fff', size: 5, life: 1.2 });
    FX.burst(this.enemyX(), this.enemyY(), 26, { kind: 'code', col: PAL.green, life: 1.4 });
  },
  lose() {
    if (this.result) return;
    this.result = 'lose'; this.st = 'defeat'; this.t = 0; this.bullets = [];
    G.deaths++;
    Audio.stop(); Audio.sfx('death');
    FX.shake(14, 1); FX.flash('#fff', .2, .9);
    if (G.flags.hotfix) {
      delete G.flags.hotfix;
      G.hp = Math.round(G.hpMax * .5);
      this.result = null; this.st = 'menu';
      Audio.play(this.e.music || 'battle'); Audio.sfx('heal');
      Toast.show('HOTFIX PATCH APPLIED', PAL.cyan, 3);
      this.say('* [HOTFIX PATCH] You are back up at 50%. Orange is pretending he did it.');
    }
  },

  upVictory(dt) {
    if (this.t < .6) return;
    if (Input.just('ok') || this.t > 6) {
      if (LevelUp.busy()) return;
      if (this.rewards && this.rewards.ups && this.rewards.ups.length) {
        LevelUp.trigger(this.rewards.ups);
        this.rewards.ups = [];
        return;
      }
      this.finish();
    }
  },
  upDefeat(dt) {
    if (this.t > 1.6) {
      this.active = false;
      OrangeFight.start(this, this.e);
    }
  },
  upFled(dt) {
    if (this.t > .9) { this.active = false; if (this.onFlee) this.onFlee(); else Game.toOverworld(); }
  },
  finish() {
    this.active = false; FX.clear();
    const cb = this.onWin; this.onWin = null;
    if (cb) cb({ spared: this.spared }); else Game.toOverworld();
  },
  /* called by OrangeFight after a successful revive */
  revived() {
    this.active = true; this.result = null; this.st = 'menu'; this.t = 0;
    this.bullets = []; this.invul = 1.2; this.usedOnce.survival = false;
    Audio.play(this.e.music || 'battle');
    this.say('* ORANGE HEAL. You are back. Nobody saw that. (Orange saw that.)');
  },

  /* ============ layout helpers ============ */
  enemyX() { return W / 2 + (this.shakeE > 0 ? rnd(5, -5) : 0); },
  enemyY() { return 118 + (this.shakeE > 0 ? rnd(4, -4) : 0); },
  playerX() { return 120; },
  playerY() { return 300; },

  /* ============ draw ============ */
  draw() {
    this.drawBG();
    const E = this.e;
    // ---- enemy ----
    const u = E.scale || 4, ex = this.enemyX(), ey = this.enemyY();
    ctx.save();
    if (this.eFlash > 0) ctx.globalAlpha = Math.sin(this.eFlash * 60) > 0 ? .4 : 1;
    const dead = this.st === 'victory';
    if (!dead) drawActor(this.espr, ex - 8 * u, ey - 11 * u, u, { t: this.t, dir: 0, bob: true });
    ctx.restore();
    if (this.eFlash > 0 && !dead) {
      ctx.save(); ctx.globalAlpha = .5; ctx.globalCompositeOperation = 'lighter';
      drawActor(this.espr, ex - 8 * u, ey - 11 * u, u, { t: this.t, dir: 0, bob: true });
      ctx.restore();
    }
    // enemy name + hp
    if (this.st !== 'victory') {
      const nm = E.name + '  [' + (E.grade || '?') + ']';
      textC(nm, ex, 24, { scale: 2, color: '#fff', shadow: '#000' });
      hpBar(ex - 110, 44, 220, 10, this.ehp, this.ehpMax, { col: PAL.red });
      text(this.ehp + '/' + this.ehpMax, ex + 118, 45, { scale: 1, color: '#ffb3b3' });
      // status chips
      let sx = ex - 110;
      const chip = (t, c) => { const w = textW(t, 1) + 8; rect(sx, 58, w, 11, c); text(t, sx + 4, 60, { scale: 1, color: '#0a0a0a' }); sx += w + 4; };
      if (this.enemyDebuff.null) chip('NULLED', PAL.green);
      if (this.enemyDebuff.lag) chip('LAG 3.0s', PAL.yellow);
      if (this.enemyDebuff.mute) chip('MUTED', PAL.orange);
      if (E.infinity && this.inGhost()) chip('INFINITY BYPASSED', '#f2f2ee');
      else if (E.infinity && !this.enemyDebuff.null) chip('INFINITY', PAL.cyan);
      if (this.enemyDomainDef) chip('DOMAIN', PAL.red);
    }
    // ---- player side ----
    this.drawPlayer();
    // ---- bark bubble ----
    if (this.barkT > 0 && this.st !== 'victory') {
      const lines = wrap(this.dialogueBark, 34);
      const bw = Math.max(...lines.map(l => textW(l, 1))) + 20, bh = 10 + lines.length * 11;
      const bx = ex + 60, by = ey - 40;
      rect(bx, by, bw, bh, '#05070ee6'); frameRect(bx, by, bw, bh, '#fff', 1);
      lines.forEach((l, i) => text(l, bx + 10, by + 5 + i * 11, { scale: 1, color: '#fff' }));
    }

    // ---- state-specific ----
    if (this.st === 'dodge') this.drawDodge();
    else if (this.st === 'bar') this.drawBar();
    else if (this.st === 'victory') this.drawVictory();
    else if (this.st === 'defeat') this.drawDefeatFlash();

    // ---- message box + menu ----
    if (this.st !== 'victory' && this.st !== 'defeat') this.drawUI();
    FX.drawWorld();
  },

  drawBG() {
    const t = this.t;
    switch (this.bgKind) {
      case 'city':
        rect(0, 0, W, H, '#070a16');
        dither(0, 0, W, 240, '#070a16', '#121a33', .1);
        for (let i = 0; i < 16; i++) {
          const bx = (i * 61) % W, bh = 60 + ((i * 37) % 110), bw = 44;
          rect(bx, 200 - bh, bw, bh, '#0d1326');
          for (let wy = 0; wy < bh - 10; wy += 12)
            for (let wx = 0; wx < bw - 8; wx += 10)
              if ((i + wx + wy) % 3) rect(bx + 4 + wx, 206 - bh + wy, 5, 6, (i + wx + wy) % 7 ? '#2a3450' : '#ffd79a');
        }
        rect(0, 200, W, H - 200, '#0b0f1c'); rect(0, 200, W, 3, '#1d2740');
        break;
      case 'school':
        rect(0, 0, W, H, '#0a1420');
        dither(0, 0, W, 220, '#0a1420', '#16293a', .2);
        for (let i = 0; i < 7; i++) drawTree(20 + i * 92, 120, 4, t + i);
        rect(0, 206, W, H - 206, '#13231a'); rect(0, 206, W, 3, '#24402c');
        break;
      case 'subway':
        rect(0, 0, W, H, '#07080e');
        rect(0, 150, W, 60, '#131722'); rect(0, 210, W, H - 210, '#0b0d14');
        for (let i = 0; i < 9; i++) { rect(i * 74, 60, 18, 150, '#1a1f2e'); rect(i * 74 + 14, 60, 4, 150, '#0d1017'); }
        rect(0, 206, W, 4, '#ffd24a'); 
        ctx.save(); ctx.globalAlpha = .12; for (let y = 0; y < H; y += 4) rect(0, y, W, 1, '#3ddcff'); ctx.restore();
        break;
      case 'shinjuku':
        rect(0, 0, W, H, '#140a10');
        dither(0, 0, W, 230, '#140a10', '#38161c', .05);
        for (let i = 0; i < 12; i++) {
          const bx = (i * 73) % W, bh = 70 + ((i * 53) % 120);
          rect(bx, 210 - bh, 52, bh, '#1c0f14');
          rect(bx + rndi(20), 210 - bh + rndi(40), 14, 20, '#2a1118');
        }
        rect(0, 210, W, H - 210, '#1a1014'); rect(0, 210, W, 3, '#3a1b22');
        ctx.save(); ctx.globalAlpha = .25;
        for (let i = 0; i < 6; i++) FX.parts.length < 90 && FX.part(rnd(W), 0, { kind: 'ember', col: '#ff7a2a', size: 2, life: 2.4, vy: rnd(40, 10), vx: rnd(20, -20), g: 0 });
        ctx.restore();
        break;
      case 'rooftop':
        rect(0, 0, W, H, '#060912');
        dither(0, 0, W, 200, '#060912', '#10203a', .1);
        for (let i = 0; i < 60; i++) rect((i * 97) % W, (i * 41) % 170, 2, 2, '#cfd8ff');
        for (let i = 0; i < 10; i++) { const bx = (i * 67) % W; rect(bx, 150, 40, 60, '#0a0f1c'); }
        rect(0, 204, W, H - 204, '#101522'); rect(0, 204, W, 3, '#2a3450');
        // rain
        for (let i = 0; i < 40; i++) {
          const x = (i * 83 + (t * 700 | 0)) % W, y = (i * 53 + (t * 900 | 0)) % H;
          line(x, y, x - 4, y + 12, '#3a4a6a', 1);
        }
        break;
      default: rect(0, 0, W, H, '#05060a');
    }
  },

  drawPlayer() {
    const u = 4, px = this.playerX(), py = this.playerY();
    const spr = this.transform === 'ghostface' ? 'ghostface' : skinSprite();
    ctx.save();
    if (this.pHurt > 0 && Math.sin(this.pHurt * 50) > 0) ctx.globalAlpha = .35;
    if (this.playerBuff.ghost) ctx.globalAlpha = .45;
    drawActor(spr, px - 8 * u, py - 11 * u, u, { t: this.t, dir: 2, bob: true });
    ctx.restore();
    // orange floats beside you
    drawActor('orange', px + 38, py - 6, 3, { t: this.t, hop: true, glow: this.tension > 50 });
    if (this.transform === 'ghostface') {
      ctx.save(); ctx.globalAlpha = .3 + Math.sin(this.t * 6) * .1;
      circle(px, py - 20, 44, '#f2f2ee', false); ctx.restore();
      textC('GHOST FACE  [' + this.transformT + ']', px, py - 62, { scale: 1, color: '#f2f2ee', shadow: '#000' });
    }
  },

  drawUI() {
    // message / HP strip
    const by = 396, bh = 48;
    box(16, by, W - 32, bh, { fill: '#05070e', edge: '#fff', t: 3 });
    if (this.st === 'select' || this.st === 'selectcopy') this.drawSelect(by, bh);
    else {
      wrap(this.msg, 74).slice(0, 2).forEach((l, i) =>
        text(l, 30, by + 10 + i * 16, { scale: 2, color: '#fff' }));
    }
    // player plate
    const sy = 454;
    text('KENJI', 18, sy, { scale: 2, color: PAL.cyan });
    text('LV ' + G.lv, 84, sy, { scale: 2, color: '#fff' });
    hpBar(158, sy + 1, 92, 10, G.hp, G.hpMax, {});
    text(G.hp + '/' + G.hpMax, 258, sy + 2, { scale: 1, color: '#cfe3ff' });
    // tension / focus meter (powers domains)
    const tx = 322;
    text('FOCUS', tx, sy + 2, { scale: 1, color: PAL.green });
    rect(tx + 40, sy + 1, 96, 9, '#13213a'); frameRect(tx + 40, sy + 1, 96, 9, '#2a3450', 1);
    rect(tx + 41, sy + 2, 94 * (this.tension / this.tensionMax), 7, this.tension >= 50 ? PAL.green : PAL.cyan);
    text(Math.floor(this.tension) + '/100', tx + 140, sy + 2, { scale: 1, color: '#cfe3ff' });
    if (this.tension >= 100 && Math.sin(this.t * 7) > 0) text('ULTRA READY', tx + 40, sy - 10, { scale: 1, color: PAL.orange });
    else if (this.tension >= 50 && Math.sin(this.t * 7) > 0) text('DOMAIN READY', tx + 40, sy - 10, { scale: 1, color: PAL.green });
    text('CE ∞', W - 70, sy, { scale: 2, color: PAL.green });

    // buttons
    if (this.st === 'menu') {
      const bw = 96, gap = 6, total = BTN.length * bw + (BTN.length - 1) * gap;
      let x = (W - total) / 2;
      BTN.forEach((b, i) => {
        const sel = i === this.btn;
        const y = 362 - (sel ? 3 : 0);
        rect(x, y, bw, 26, sel ? b.col : '#0b1424');
        frameRect(x, y, bw, 26, sel ? '#fff' : b.col, 2);
        textC(b.label, x + bw / 2, y + 9, { scale: 2, color: sel ? '#05060a' : b.col });
        if (b.id === 'domain' && this.tension >= 50 && !sel)
          text('!', x + bw - 10, y + 2, { scale: 1, color: PAL.yellow });
        x += bw + gap;
      });
    }
  },

  drawSelect(by, bh) {
    const L = this.st === 'selectcopy' ? this.copyList : this.curSelList();
    const per = 2;
    if (this.idx < this.scroll) this.scroll = this.idx;
    if (this.idx >= this.scroll + per) this.scroll = this.idx - per + 1;
    for (let i = 0; i < Math.min(per, L.length); i++) {
      const n = i + this.scroll, e = L[n]; if (!e) break;
      const sel = n === this.idx, y = by + 8 + i * 18;
      const nm = e.name || e.k;
      if (sel) text('→', 26, y, { scale: 2, color: PAL.yellow });
      text(nm, 46, y, { scale: 2, color: sel ? (e.col || PAL.yellow) : '#8fa0bd' });
      if (e.k && G.items[e.k]) text('x' + G.items[e.k], 262, y, { scale: 1, color: '#8fa0bd' });
      if (e.tag) text('[' + e.tag + ']', 286, y + 3, { scale: 1, color: '#55637d' });
      if (e.focus) {
        const ok = this.canAfford(e);
        text(e.focus + ' FP', 236, y + 3, { scale: 1, color: ok ? PAL.green : PAL.red });
      }
      if (sel) {
        const d = e.desc || e.flavour || '';
        wrap(d, 38).slice(0, 3).forEach((l, j) => text(l, 366, by + 5 + j * 12, { scale: 1, color: '#cfe3ff' }));
      }
    }
    if (L.length > per) text((this.idx + 1) + '/' + L.length, 300, by + bh - 14, { scale: 1, color: '#55637d' });
  },

  /* ---- the timing combo bar ---- */
  drawBar() {
    const b = this.bar; if (!b) return;
    const bw = 420, bx = (W - bw) / 2, by = 324, bh = 32;
    // frame
    rect(bx - 4, by - 4, bw + 8, bh + 8, '#05070e');
    frameRect(bx - 4, by - 4, bw + 8, bh + 8, '#fff', 3);
    rect(bx, by, bw, bh, '#0b1424');
    // zones
    const cx = bx + bw / 2;
    rect(cx - bw * .26, by, bw * .52, bh, '#13213a');
    rect(cx - bw * .16, by, bw * .32, bh, '#1d3157');
    rect(cx - bw * .085, by, bw * .17, bh, '#2b5c8f');
    rect(cx - bw * .035, by, bw * .07, bh, b.ab.col);
    line(cx, by, cx, by + bh, '#fff', 1);
    // marker
    const mx = bx + b.pos * bw;
    rect(mx - 2, by - 6, 5, bh + 12, '#fff');
    rect(mx - 1, by - 6, 2, bh + 12, b.ab.col);
    // hit pips
    for (let i = 0; i < b.hits; i++) {
      const px = bx + 10 + i * 18, q = b.results[i];
      const col = q == null ? '#39455c' : q === 1 ? PAL.yellow : q >= .8 ? PAL.green : q > 0 ? PAL.cyan : PAL.red;
      rect(px, by - 18, 14, 9, col);
    }
    // labels
    text(b.ab.name.toUpperCase() + '  HIT ' + Math.min(b.hit + 1, b.hits) + '/' + b.hits, bx, by - 34, { scale: 2, color: b.ab.col, shadow: '#000' });
    const spdPct = Math.round(b.speed / b.base * 100);
    text('BAR SPEED ' + spdPct + '%', bx + bw - textW('BAR SPEED ' + spdPct + '%', 1), by - 30, { scale: 1, color: spdPct > 150 ? PAL.red : '#8fa0bd' });
    if (b.flashT > 0) {
      b.flashT -= 1 / 60;
      const c = b.shown === 'PERFECT!' ? PAL.yellow : b.shown === 'MISS' ? PAL.red : '#fff';
      textC(b.shown, cx, by - 70, { scale: 3, color: c, shadow: '#000' });
    }
    if (b.ab.id === 'blackflash') textC('ALL PERFECT → BLACK FLASH', cx, by + bh + 10, { scale: 1, color: '#ff5a5a' });
    if (b.ab.id === 'orangeflash') textC('ALL PERFECT → ORANGE FLASH (x100)', cx, by + bh + 10, { scale: 1, color: PAL.orange });
  },

  /* ---- dodge phase visuals ---- */
  drawDodge() {
    const box = this.boxRect();
    // box
    rect(box.x - 4, box.y - 4, box.w + 8, box.h + 8, '#fff');
    rect(box.x, box.y, box.w, box.h, '#05060a');
    // bullets
    this.bullets.forEach(b => {
      const pre = b.delay && b.t < b.delay;
      ctx.save();
      if (b.rectW) {
        if (pre) {
          ctx.globalAlpha = .35 + Math.sin(b.t * 30) * .2;
          rect(b.x - b.rectW / 2, b.y - b.rectH / 2, b.rectW, b.rectH, b.col);
          frameRect(b.x - b.rectW / 2, b.y - b.rectH / 2, b.rectW, b.rectH, '#fff', 1);
        } else {
          rect(b.x - b.rectW / 2, b.y - b.rectH / 2, b.rectW, b.rectH, b.col);
          rect(b.x - b.rectW / 2, b.y - b.rectH / 2, b.rectW, 2, '#fff');
          if (b.hand) {
            for (let f = 0; f < 4; f++) rect(b.x - b.rectW / 2 + 2 + f * 4, b.y - b.rectH / 2 - 6, 3, 8, '#e8bd9c');
          }
          if (b.wave) {
            for (let w = 0; w < b.rectW; w += 10)
              rect(b.x - b.rectW / 2 + w, b.y - b.rectH / 2 - 3 + Math.sin(b.t * 9 + w * .18) * 3, 8, 5, '#cfeef7');
          }
          if (b.beam) {
            ctx.globalAlpha = .45;
            rect(b.x - b.rectW / 2 - 5, b.y - b.rectH / 2 - 5, b.rectW + 10, b.rectH + 10, b.col);
            ctx.globalAlpha = 1;
            rect(b.x - b.rectW / 2 + 3, b.y - b.rectH / 2 + 3, b.rectW - 6, b.rectH - 6, '#fff');
          }
          if (b.dog) {
            rect(b.x - b.rectW / 2 + 2, b.y - b.rectH / 2 - 5, 6, 6, b.col);
            rect(b.x + b.rectW / 2 - 4, b.y - b.rectH / 2 - 3, 4, 4, b.col);
            rect(b.x - b.rectW / 2 + 3, b.y - b.rectH / 2 - 3, 2, 2, '#ff3b3b');
          }
          if (b.slash) { ctx.globalAlpha = .5; rect(b.x - b.rectW / 2 - 3, b.y - b.rectH / 2, b.rectW + 6, b.rectH, '#fff'); }
        }
      } else if (b.reticle) {
        ctx.globalAlpha = .5 + Math.sin(b.t * 26) * .3;
        circle(b.x, b.y, b.r, b.col, false);
        line(b.x - b.r - 5, b.y, b.x - b.r + 3, b.y, b.col, 2);
        line(b.x + b.r - 3, b.y, b.x + b.r + 5, b.y, b.col, 2);
        line(b.x, b.y - b.r - 5, b.x, b.y - b.r + 3, b.col, 2);
        line(b.x, b.y + b.r - 3, b.x, b.y + b.r + 5, b.col, 2);
      } else if (b.cloud) {
        ctx.globalAlpha = .4;
        circle(b.x, b.y, b.r, b.col);
        ctx.globalAlpha = .7;
        circle(b.x - b.r * .3, b.y - b.r * .2, b.r * .5, b.col);
        circle(b.x + b.r * .35, b.y + b.r * .15, b.r * .45, b.col);
      } else if (b.magnet) {
        ctx.globalAlpha = .55 + Math.sin(b.t * 10) * .2;
        circle(b.x, b.y, b.r, b.col, false);
        circle(b.x, b.y, b.r * .45, b.col);
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * TAU + b.t * 3;
          rect(b.x + Math.cos(a) * (b.r + 7), b.y + Math.sin(a) * (b.r + 7), 2, 2, b.col);
        }
      } else if (b.orb) {
        circle(b.x, b.y, b.r + 5, '#0a0a16');
        circle(b.x, b.y, b.r, b.col);
        circle(b.x, b.y, b.r * .45, '#fff');
        ctx.globalAlpha = .35;
        circle(b.x, b.y, b.r + 9 + Math.sin(b.t * 12) * 3, b.col, false);
      } else if (b.r > 12) {
        circle(b.x, b.y, b.r + 4, '#2a1b6b'); circle(b.x, b.y, b.r, b.col); circle(b.x, b.y, b.r * .4, '#fff');
      } else {
        rect(b.x - b.r / 2, b.y - b.r / 2, b.r, b.r, b.col); rect(b.x - b.r / 2, b.y - b.r / 2, b.r, 1, '#fff');
      }
      ctx.restore();
      if (G.showHitbox) frameRect(b.x - (b.rectW || b.r) / 2, b.y - (b.rectH || b.r) / 2, b.rectW || b.r, b.rectH || b.r, '#0f0', 1);
    });
    // soul
    const s = this.soul;
    ctx.save();
    if (this.invul > 0 && Math.sin(this.invul * 40) > 0) ctx.globalAlpha = .4;
    if (this.playerBuff.ghost) ctx.globalAlpha = .5;
    // digital soul: orange diamond with a cyan core
    ctx.translate(s.x, s.y); ctx.rotate(Math.PI / 4);
    rect(-5, -5, 10, 10, PAL.orange); rect(-3, -3, 6, 6, '#ffd79a'); rect(-1, -1, 2, 2, PAL.cyan);
    ctx.restore();
    if (G.showHitbox) frameRect(s.x - 4, s.y - 4, 8, 8, '#0f0', 1);
    // timer
    const k = 1 - this.dodgeT / this.dodgeDur;
    rect(box.x, box.y - 12, box.w, 5, '#13213a');
    rect(box.x, box.y - 12, box.w * clamp(k, 0, 1), 5, PAL.cyan);
    if (this.sureHit) textC('SURE-HIT INBOUND — ORANGE SURVIVAL ACTIVE', W / 2, box.y - 28, { scale: 1, color: PAL.orange });
    textC('ARROWS / WASD TO DODGE   —   GRAZE FOR FOCUS', W / 2, box.y + box.h + 10, { scale: 1, color: '#55637d' });
  },

  drawVictory() {
    const r = this.rewards || { xp: 0, money: 0 };
    ctx.save(); ctx.globalAlpha = .75; rect(0, 0, W, H, '#05070e'); ctx.restore();
    const sc = 1 + Math.max(0, (1 - this.t * 4)) * 1.5;
    pixelGlyphs(this.result === 'spared' ? '和解' : '勝利', W / 2, 96, 96 * sc, this.result === 'spared' ? PAL.green : PAL.yellow,
      { outline: '#000', dn: 4, shadow: true });
    textC(this.result === 'spared' ? 'SPARED' : 'VICTORY', W / 2, 156, { scale: 5, color: '#fff', shadow: '#000' });
    panel(W / 2 - 160, 200, 320, 110, PAL.orange);
    text('EXP GAINED', W / 2 - 140, 214, { scale: 2, color: '#8fa0bd' });
    text('+' + r.xp, W / 2 + 60, 214, { scale: 2, color: PAL.cyan });
    text('DOLLARS', W / 2 - 140, 240, { scale: 2, color: '#8fa0bd' });
    text('+$' + fmt(r.money), W / 2 + 60, 240, { scale: 2, color: PAL.gold });
    text('TOTAL', W / 2 - 140, 266, { scale: 2, color: '#8fa0bd' });
    text('$' + fmt(G.money), W / 2 + 60, 266, { scale: 2, color: PAL.gold });
    const nx = xpFor(G.lv + 1), px = xpFor(G.lv);
    const k = clamp((G.xp - px) / Math.max(1, nx - px), 0, 1);
    text('LV ' + G.lv, W / 2 - 140, 290, { scale: 2, color: PAL.orange });
    rect(W / 2 - 80, 292, 200, 8, '#13213a'); rect(W / 2 - 80, 292, 200 * k, 8, PAL.orange);
    drawActor('orange', W / 2 - 24, 318, 4, { t: this.t, hop: true, glow: true });
    textC(VICTORY_BARKS[G.battlesWon % VICTORY_BARKS.length], W / 2, 392, { scale: 1, color: PAL.orange2 });
    if (this.t > .8 && Math.sin(this.t * 6) > -.3) textC('[ Z ] CONTINUE', W / 2, H - 28, { scale: 2, color: '#fff', shadow: '#000' });
  },
  drawDefeatFlash() {
    ctx.save(); ctx.globalAlpha = clamp(this.t, 0, 1); rect(0, 0, W, H, '#000'); ctx.restore();
    if (this.t > .4) {
      textC('HP 0', W / 2, 180, { scale: 5, color: PAL.red, shadow: '#2a0000' });
      textC('...', W / 2, 240, { scale: 4, color: '#fff' });
    }
  }
};
