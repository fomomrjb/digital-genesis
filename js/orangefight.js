/* ===========================================================
   DIGITAL GENESIS — orangefight.js
   Kenji hits 0 HP -> you become ORANGE.
   Win as a pumpkin, then run ORANGE HEAL to revive Kenji.
   Lose as Orange -> real GAME OVER.
   =========================================================== */
'use strict';

const OrangeFight = {
  active: false, st: 'intro', t: 0, parent: null, e: null,
  o: null, boss: null, proj: [], hitsNeeded: 5, hits: 0,
  exposed: false, expT: 0, cycle: 0, msg: '', msgT: 0,
  healSeq: [], healIdx: 0, healT: 0, shakeT: 0, deadT: 0, overIdx: 0,

  start(parent, e) {
    this.active = true; this.st = 'intro'; this.t = 0;
    this.parent = parent; this.e = e;
    this.hits = 0; this.hitsNeeded = e.grade === 'SP+' ? 7 : e.grade === 'SP' ? 6 : 5;
    this.proj = []; this.exposed = false; this.expT = 0; this.cycle = 0;
    this.o = { x: W / 2, y: H - 110, vx: 0, vy: 0, hp: 3, hpMax: 3, iframe: 0, dashT: 0, dashCd: 0, face: 1 };
    this.boss = { x: W / 2, y: 140, vx: 60, vy: 0, w: 60, h: 70, spr: parent ? parent.espr : e.spr, atkT: 1.2, flash: 0 };
    this.msg = ''; this.msgT = 0; this.overIdx = 0;
    Audio.stop();
    Audio.sfx('shatter');
    FX.clear(); FX.shake(16, 1.2); FX.flash('#fff', .4, 1);
    G.hp = 0;
  },
  say(m, t = 3) { this.msg = m; this.msgT = t; },

  update(dt) {
    if (!this.active) return;
    this.t += dt;
    if (this.msgT > 0) this.msgT -= dt;
    switch (this.st) {
      case 'intro': this.upIntro(dt); break;
      case 'fight': this.upFight(dt); break;
      case 'heal': this.upHeal(dt); break;
      case 'over': this.upOver(dt); break;
    }
  },

  upIntro(dt) {
    if (this.t > 1.2 && !this.introStarted) {
      this.introStarted = true;
      Audio.play('orange');
      Dlg.start([
        { who: 'sys', t: 'KENJI.HP = 0\nPLAYER ENTITY UNRESPONSIVE.' },
        { who: 'orange', t: 'kenji. kenji get up. KENJI.', col: PAL.orange },
        { who: 'orange', t: '...ok. ok ok ok. my turn. MY TURN.' },
        { who: 'sys', t: 'CONTROL TRANSFERRED: ORANGE (AUTONOMOUS SYSTEM ENTITY)' },
        { who: 'orange', t: 'i am a VEGETABLE with ADMIN RIGHTS and i am VERY ANGRY.' },
        { who: 'orange', t: 'listen: i cant hurt him properly. i have to wait until he OPENS UP. then i SLAM.' },
        { who: 'orange', t: 'hit him ' + this.hitsNeeded + ' times. i only have 3 hearts. then i heal kenji. DO NOT DIE.' }
      ], () => { this.st = 'fight'; this.t = 0; this.say('WAIT FOR [EXPOSED], THEN DASH INTO HIM. [R] DASH', 4); });
    }
  },

  upFight(dt) {
    const o = this.o, b = this.boss;
    if (o.iframe > 0) o.iframe -= dt;
    if (o.dashCd > 0) o.dashCd -= dt;
    if (b.flash > 0) b.flash -= dt;

    // orange movement: floaty, quick
    let dx = 0, dy = 0;
    if (Input.isDown('left')) dx -= 1; if (Input.isDown('right')) dx += 1;
    if (Input.isDown('up')) dy -= 1; if (Input.isDown('down')) dy += 1;
    if (dx) o.face = dx;
    const m = Math.hypot(dx, dy) || 1;
    if (o.dashT > 0) {
      o.dashT -= dt;
      o.iframe = Math.max(o.iframe, .05);
      FX.part(o.x, o.y, { kind: 'spark', col: PAL.orange, size: 3, life: .25, g: 0 });
    } else {
      o.vx = approach(o.vx, (dx / m) * 260, 1600 * dt);
      o.vy = approach(o.vy, (dy / m) * 240, 1600 * dt);
    }
    if (Input.just('dash') && o.dashCd <= 0) {
      o.dashCd = .5; o.dashT = .18;
      const a = Math.atan2(dy || (b.y - o.y), dx || (b.x - o.x));
      o.vx = Math.cos(a) * 620; o.vy = Math.sin(a) * 620;
      Audio.sfx('dodge');
    }
    o.x = clamp(o.x + o.vx * dt, 16, W - 16);
    o.y = clamp(o.y + o.vy * dt, 60, H - 40);

    // boss drifts and attacks
    b.x += b.vx * dt;
    if (b.x < 70 || b.x > W - 70) b.vx *= -1;
    b.y = 140 + Math.sin(this.t * 1.4) * 26;
    b.atkT -= dt;
    if (b.atkT <= 0 && !this.exposed) {
      b.atkT = 1.15;
      const kind = rndi(3);
      if (kind === 0) {
        const n = 8;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * TAU + this.t;
          this.proj.push({ x: b.x, y: b.y, vx: Math.cos(a) * 165, vy: Math.sin(a) * 165, r: 7, t: 0, col: '#ff5a5a' });
        }
      } else if (kind === 1) {
        const a = Math.atan2(o.y - b.y, o.x - b.x);
        for (let i = -2; i <= 2; i++)
          this.proj.push({ x: b.x, y: b.y, vx: Math.cos(a + i * .2) * 230, vy: Math.sin(a + i * .2) * 230, r: 6, t: 0, col: '#ffd24a' });
      } else {
        for (let i = 0; i < 6; i++)
          this.proj.push({ x: rnd(W - 40, 40), y: -20, vx: 0, vy: 220, r: 8, t: 0, col: '#c79aff' });
      }
      Audio.sfx('swing');
    }

    // exposure cycle: boss over-extends and becomes hittable
    this.expT -= dt;
    if (this.expT <= 0) {
      this.exposed = !this.exposed;
      this.expT = this.exposed ? 1.9 : rnd(3.4, 2.2);
      if (this.exposed) {
        Audio.sfx('alarm');
        this.say('[EXPOSED] GO GO GO', 1.6);
        FX.ring(b.x, b.y, { r: 70, col: PAL.orange, w: 3, life: .4 });
      }
    }

    // orange slam
    if (this.exposed && dist(o.x, o.y, b.x, b.y) < 46 && o.dashT > 0) {
      this.hits++; this.exposed = false; this.expT = rnd(3.2, 2.0);
      b.flash = .25;
      Audio.sfx('crit'); FX.shake(9, .3);
      FX.pop(b.x, b.y - 40, 'WIGGLE SLAM ' + this.hits + '/' + this.hitsNeeded, { col: PAL.orange, scale: 2, life: 1 });
      FX.burst(b.x, b.y, 24, { kind: 'spark', col: PAL.orange, size: 4, life: .7, g: 150 });
      o.vx = -o.vx * .6; o.vy = -o.vy * .6;
      this.say(pick(['ORANGE: "THAT WAS FOR KENJI"', 'ORANGE: "I AM A VEGETABLE. FEAR ME."',
        'ORANGE: "SLAM. SLAM!!"', 'ORANGE: "did that hurt? i hope it hurt."']), 1.8);
      if (this.hits >= this.hitsNeeded) { this.beginHeal(); return; }
    }

    // projectiles
    for (let i = this.proj.length - 1; i >= 0; i--) {
      const p = this.proj[i]; p.t += dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.x < -40 || p.x > W + 40 || p.y < -60 || p.y > H + 40 || p.t > 7) { this.proj.splice(i, 1); continue; }
      if (o.iframe <= 0 && dist(p.x, p.y, o.x, o.y) < p.r + 9) {
        this.proj.splice(i, 1);
        o.hp--; o.iframe = 1.3;
        Audio.sfx('hurt'); FX.shake(7, .3); FX.flash('#ff3b3b', .18, .5);
        FX.pop(o.x, o.y - 18, '-1', { col: PAL.red, scale: 2 });
        this.say(o.hp === 2 ? 'ORANGE: "ow. OW. thats one."' : o.hp === 1 ? 'ORANGE: "one heart left. dont. please."' : '', 2);
        if (o.hp <= 0) { this.st = 'over'; this.t = 0; this.deadT = 0; Audio.stop(); Audio.sfx('death'); }
      }
    }
  },

  /* ---- ORANGE HEAL QTE ---- */
  beginHeal() {
    this.st = 'heal'; this.t = 0; this.healIdx = 0; this.healT = 0;
    this.proj = [];
    const keys = ['up', 'down', 'left', 'right'];
    this.healSeq = [];
    for (let i = 0; i < 5; i++) this.healSeq.push(pick(keys));
    Audio.play('win');
    Audio.sfx('levelup');
    FX.flash(PAL.orange, .4, .8);
    FX.burst(W / 2, H / 2, 60, { kind: 'spark', col: PAL.orange, size: 5, life: 1.4, g: -40 });
  },
  upHeal(dt) {
    this.healT += dt;
    if (this.healT < 1.4) return;
    const need = this.healSeq[this.healIdx];
    ['up', 'down', 'left', 'right'].forEach(k => {
      if (Input.just(k)) {
        if (k === need) {
          this.healIdx++; Audio.sfx('ok');
          FX.burst(W / 2, 300, 12, { kind: 'spark', col: PAL.orange, size: 4, life: .5, g: -80 });
          if (this.healIdx >= this.healSeq.length) this.finishHeal();
        } else { Audio.sfx('deny'); FX.shake(4, .15); }
      }
    });
  },
  finishHeal() {
    Audio.sfx('orangeheal');
    FX.flash('#fff', .6, 1); FX.shake(10, .8);
    FX.burst(W / 2, H / 2, 90, { kind: 'spark', col: PAL.orange, size: 5, life: 1.8, g: -60 });
    for (let i = 0; i < 5; i++)
      timers.after(i * .12, () => FX.ring(W / 2, H / 2, { r: 160 + i * 60, col: i % 2 ? '#fff3d6' : PAL.orange, w: 5, life: .7 }));
    this.st = 'revive'; this.t = 0;
    timers.after(2.0, () => {
      G.fullHeal();
      Dlg.start([
        { who: 'sys', t: 'ORANGE HEAL\nPULLING PRISTINE BIOLOGICAL FILES FROM BACKUP SERVER...' },
        { who: 'sys', t: 'KENJI.HP RESTORED: ' + G.hpMax + ' / ' + G.hpMax + '\nCONTROL RETURNED TO PLAYER.' },
        { who: 'kenji', t: '...Ugh. What happened?' },
        { who: 'orange', t: 'NOTHING HAPPENED. nothing happened at all. you were AMAZING.' },
        { who: 'kenji', t: 'Why is there a dent in the floor shaped like a pumpkin.' },
        { who: 'orange', t: 'thats a design choice. anyway. finish him.' }
      ], () => {
        this.active = false;
        FX.clear();
        if (this.parent) this.parent.revived();
      });
    });
  },
  upOver(dt) {
    this.deadT += dt;
    if (this.deadT < 1.6) return;
    const opts = 2;
    if (Input.just('up') || Input.just('down')) { this.overIdx = (this.overIdx + 1) % opts; Audio.sfx('move'); }
    if (Input.just('ok')) {
      Audio.sfx('ok');
      this.active = false;
      if (this.overIdx === 0) {
        // retry from the last save
        Fade.out(() => {
          if (!G.load()) G.reset();
          G.fullHeal(); FX.clear();
          Game.toOverworld();
          Fade.in();
        }, 2);
      } else {
        Fade.out(() => { Game.toTitle(); Fade.in(); }, 2);
      }
    }
  },

  /* ============ draw ============ */
  draw() {
    // arena backdrop: cracked/glitched version of the battle
    rect(0, 0, W, H, '#0a0510');
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < 50; i++) {
      const x = (i * 83 + (this.t * 14 | 0)) % W, y = (i * 47) % H;
      text(pick(['0', '1', 'x', '#']), x, y, { scale: 1, color: '#3a1f2a' });
    }
    ctx.restore();
    // kenji's body on the ground
    ctx.save(); ctx.globalAlpha = .55;
    ctx.translate(90, H - 60); ctx.rotate(-Math.PI / 2);
    drawActor(skinSprite(), 0, 0, 3, { t: 0, dir: 0, bob: false });
    ctx.restore();
    textC('KENJI  [HP 0]', 104, H - 28, { scale: 1, color: PAL.red });

    if (this.st === 'intro') {
      ctx.save(); ctx.globalAlpha = clamp(1.2 - this.t, 0, 1); rect(0, 0, W, H, '#fff'); ctx.restore();
      // shatter lines
      ctx.save(); ctx.globalAlpha = clamp(1.6 - this.t * .6, 0, 1);
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * TAU;
        line(W / 2, H / 2, W / 2 + Math.cos(a) * 600, H / 2 + Math.sin(a) * 600, '#1a0a14', 3);
      }
      ctx.restore();
      drawActor('orange', W / 2 - 40, H / 2 - 40, 5, { t: this.t, hop: true, glow: true });
      return;
    }
    if (this.st === 'over') { this.drawOver(); return; }

    // boss
    const b = this.boss;
    ctx.save();
    if (b.flash > 0) ctx.globalAlpha = .4;
    if (this.exposed) {
      ctx.globalAlpha = 1;
      ctx.save(); ctx.globalAlpha = .35 + Math.sin(this.t * 14) * .15;
      circle(b.x, b.y + 10, 56, PAL.orange); ctx.restore();
    }
    drawActor(b.spr, b.x - 8 * 4, b.y - 11 * 4, 4, { t: this.t, dir: 0, bob: true });
    ctx.restore();
    if (this.exposed) textC('[EXPOSED]', b.x, b.y - 58, { scale: 2, color: PAL.orange, shadow: '#000' });

    // projectiles
    this.proj.forEach(p => {
      rect(p.x - p.r / 2, p.y - p.r / 2, p.r, p.r, p.col);
      rect(p.x - p.r / 2, p.y - p.r / 2, p.r, 2, '#fff');
    });

    // orange
    const o = this.o;
    ctx.save();
    if (o.iframe > 0 && Math.sin(o.iframe * 40) > 0) ctx.globalAlpha = .4;
    if (o.dashT > 0) {
      ctx.globalAlpha = .4;
      for (let i = 1; i <= 3; i++) drawActor('orange', o.x - 8 * 3 - o.vx * .012 * i, o.y - 10 * 3 - o.vy * .012 * i, 3, { t: this.t });
      ctx.globalAlpha = 1;
    }
    drawActor('orange', o.x - 8 * 3, o.y - 10 * 3, 3, { t: this.t, hop: true, glow: this.exposed });
    ctx.restore();

    // HUD
    rect(10, 10, 230, 40, '#05070ecc'); frameRect(10, 10, 230, 40, PAL.orange, 2);
    text('ORANGE', 18, 15, { scale: 2, color: PAL.orange });
    for (let i = 0; i < o.hpMax; i++)
      text('♥', 18 + i * 16, 32, { scale: 2, color: i < o.hp ? PAL.red : '#39455c' });
    text('SLAMS ' + this.hits + '/' + this.hitsNeeded, 110, 32, { scale: 1, color: PAL.yellow });
    textC(b.spr && this.e ? this.e.name.toUpperCase() : 'ENEMY', W / 2, 16, { scale: 2, color: '#ffb3b3', shadow: '#000' });

    if (this.st === 'heal') this.drawHeal();
    else if (this.st === 'revive') {
      ctx.save(); ctx.globalAlpha = clamp(this.t / 1.2, 0, .9); rect(0, 0, W, H, '#fff3d6'); ctx.restore();
      pixelGlyphs('復元', W / 2, 180, 110, PAL.orange, { outline: '#fff', dn: 4, shadow: true });
      textC('ORANGE HEAL', W / 2, 250, { scale: 5, color: '#b25a00', shadow: '#fff' });
    }
    else {
      if (this.msgT > 0) {
        const w = textW(this.msg, 2) + 20;
        ctx.save(); ctx.globalAlpha = clamp(this.msgT, 0, 1);
        rect(W / 2 - w / 2, H - 70, w, 22, '#05070ee6'); frameRect(W / 2 - w / 2, H - 70, w, 22, PAL.orange, 2);
        text(this.msg, W / 2 - w / 2 + 10, H - 63, { scale: 2, color: PAL.orange2 });
        ctx.restore();
      }
      textC('ARROWS MOVE   R DASH (dash into him while [EXPOSED])', W / 2, H - 18, { scale: 1, color: '#55637d' });
    }
    FX.drawWorld();
  },

  drawHeal() {
    ctx.save(); ctx.globalAlpha = .8; rect(0, 0, W, H, '#1a0a04'); ctx.restore();
    pixelGlyphs('オレンジ・ヒール', W / 2, 90, 54, PAL.orange, { outline: '#000', dn: 3, shadow: true });
    textC('ORANGE HEAL', W / 2, 140, { scale: 4, color: '#fff3d6', shadow: '#b25a00' });
    textC('ENTER THE RESTORE SEQUENCE', W / 2, 180, { scale: 2, color: PAL.orange2 });
    const arrows = { up: '↑', down: '↓', left: '←', right: '→' };
    const n = this.healSeq.length, sw = 54;
    const x0 = W / 2 - (n * sw) / 2;
    this.healSeq.forEach((k, i) => {
      const done = i < this.healIdx, cur = i === this.healIdx;
      const x = x0 + i * sw;
      rect(x, 220, 46, 46, done ? PAL.orange : '#13213a');
      frameRect(x, 220, 46, 46, cur ? '#fff' : done ? '#fff3d6' : '#2a3450', cur ? 3 : 2);
      textC(arrows[k], x + 23, 234, { scale: 3, color: done ? '#140800' : cur ? '#fff' : '#55637d' });
    });
    if (this.healT < 1.4) textC('GET READY...', W / 2, 300, { scale: 2, color: '#fff' });
    else textC('PRESS THE ARROWS IN ORDER', W / 2, 300, { scale: 2, color: PAL.yellow });
    drawActor('orange', W / 2 - 24, 330, 5, { t: this.t, hop: true, glow: true });
    textC('ORANGE: "hold still. im pulling your backup."', W / 2, 420, { scale: 1, color: PAL.orange2 });
  },

  drawOver() {
    ctx.save(); ctx.globalAlpha = clamp(this.deadT / 1.2, 0, 1); rect(0, 0, W, H, '#000'); ctx.restore();
    if (this.deadT < .6) return;
    pixelGlyphs('敗北', W / 2, 110, 110, PAL.red, { outline: '#2a0000', dn: 4, shadow: true });
    textC('GAME OVER', W / 2, 176, { scale: 5, color: PAL.red, shadow: '#2a0000' });
    textC('Orange fell. Nobody was left to pull the backup.', W / 2, 224, { scale: 2, color: '#8fa0bd' });
    textC('DEATHS: ' + G.deaths, W / 2, 252, { scale: 1, color: '#55637d' });
    if (this.deadT > 1.6) {
      ['CONTINUE FROM LAST SAVE', 'RETURN TO TITLE'].forEach((t, i) => {
        const sel = i === this.overIdx;
        textC((sel ? '→ ' : '  ') + t, W / 2, 310 + i * 30, { scale: 2, color: sel ? PAL.yellow : '#55637d' });
      });
    }
  }
};
