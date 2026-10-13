/* ===========================================================
   DIGITAL GENESIS — domain.js
   Inside a Domain Expansion the game becomes a Hollow-Knight
   style side-view action fight. Each domain plays differently:
     SANDBOX MODE  -> admin dev-menu platformer brawl
     ERROR 404     -> survive & fill the FORMAT meter (sure-hit)
   =========================================================== */
'use strict';

const DomainFight = {
  active: false, def: null, parent: null, ab: null, t: 0,
  p: null, boss: null, plats: [], proj: [], slashes: [], pickups: [],
  dmgDealt: 0, format: 0, timeLeft: 0, over: false, overT: 0, outcome: '',
  devOpen: false, devIdx: 0, dev: {}, msg: '', msgT: 0, hitStop: 0,
  senses: 3, shakeT: 0, introT: 0, bossMaxHp: 0,

  start(def, parent, ab) {
    this.active = true; this.def = def; this.parent = parent; this.ab = ab;
    this.t = 0; this.introT = 0; this.over = false; this.overT = 0; this.outcome = '';
    this.dmgDealt = 0; this.format = 0; this.devOpen = false; this.devIdx = 0;
    this.dev = { gravity: false, speed: false, render: false, purple: 0 };
    this.proj = []; this.slashes = []; this.pickups = []; this.senses = 3;
    this.timeLeft = def.id === 'void404' ? 30 : 34;
    this.msg = ''; this.msgT = 0; this.hitStop = 0;

    const floorY = 400;
    this.plats = [
      { x: 0, y: floorY, w: W, h: 80, solid: true },
      { x: 60, y: 310, w: 120, h: 14 },
      { x: W - 180, y: 310, w: 120, h: 14 },
      { x: W / 2 - 70, y: 240, w: 140, h: 14 },
      { x: 20, y: 180, w: 80, h: 14 },
      { x: W - 100, y: 180, w: 80, h: 14 }
    ];
    this.p = {
      x: 90, y: floorY - 40, w: 22, h: 34, vx: 0, vy: 0, onGround: false,
      face: 1, atkT: 0, atkDir: 0, dashT: 0, dashCd: 0, iframe: 0, jumps: 0,
      hitT: 0, airDash: true, focus: 0, holdJump: false
    };
    const e = parent ? parent.e : ENEMIES.grade4;
    this.bossMaxHp = Math.max(60, Math.round((parent ? parent.ehp : 100) * .55));
    this.boss = {
      x: W - 160, y: 240, w: 46, h: 58, vx: 0, vy: 0, hp: this.bossMaxHp,
      spr: parent ? parent.espr : 'curseBig', scale: 3,
      state: 'idle', stateT: 0, atkCd: 1.4, face: -1, stun: 0, hitFlash: 0,
      floating: true, blinded: false, slowed: false, gravityOff: false,
      name: e.name, atk: (parent ? parent.eatk : 12)
    };
    Audio.play(def.music || 'domain');
    FX.clear();
    this.say(def.id === 'void404'
      ? 'HOLD THEM INSIDE. LAND HITS TO RUN THE FORMAT.'
      : 'ADMIN ACCESS GRANTED. [C] OPENS THE DEV MENU.');
  },
  say(m, t = 3.2) { this.msg = m; this.msgT = t; },

  /* ============ update ============ */
  update(dt) {
    if (!this.active) return;
    this.t += dt; this.introT += dt;
    if (this.msgT > 0) this.msgT -= dt;
    if (this.hitStop > 0) { this.hitStop -= dt; return; }
    if (this.over) { this.upOver(dt); return; }
    if (this.introT < 1.0) return;

    this.timeLeft -= dt;
    if (this.timeLeft <= 0) { this.finish(this.def.id === 'void404' && this.format >= 100 ? 'format' : 'timeout'); return; }

    if (this.devOpen) { this.upDev(dt); return; }
    if (Input.just('menu') && this.def.id === 'sandbox') { this.devOpen = true; this.devIdx = 0; Audio.sfx('ok'); return; }

    this.upPlayer(dt);
    this.upBoss(dt);
    this.upProj(dt);
    // slashes fade
    for (let i = this.slashes.length - 1; i >= 0; i--) {
      const s = this.slashes[i]; s.t += dt; if (s.t > .18) this.slashes.splice(i, 1);
    }
    // pickups (soul shards in sandbox)
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const u = this.pickups[i]; u.t += dt; u.y += Math.sin(u.t * 4) * .3;
      if (aabb({ x: u.x - 8, y: u.y - 8, w: 16, h: 16 }, this.p)) {
        this.pickups.splice(i, 1); this.p.focus = clamp(this.p.focus + 25, 0, 100);
        Audio.sfx('coin'); FX.part(u.x, u.y, { kind: 'spark', col: PAL.cyan, life: .4 });
      } else if (u.t > 12) this.pickups.splice(i, 1);
    }
    // format meter progress in 404
    if (this.def.id === 'void404') {
      this.format = clamp(this.format + dt * 1.6, 0, 100);
      const prevS = this.senses;
      if (this.format > 12) this.senses = 2;
      if (this.format > 36) this.senses = 1;
      if (this.format > 66) this.senses = 0;
      if (this.senses !== prevS) {
        this.boss.blinded = this.senses <= 1;
        Audio.sfx('glitch');
        this.say(this.senses === 2 ? '3s: SIGHT, HEARING AND TOUCH REVOKED.'
          : this.senses === 1 ? '10s: CURSED TECHNIQUE UNINSTALLED.'
          : '20s: PHYSICAL FORM IS BECOMING WIREFRAME.');
      }
      if (this.format >= 100) { this.finish('format'); return; }
    }
    if (this.boss.hp <= 0) { this.finish('kill'); return; }
    if (G.hp <= 0) { this.finish('dead'); return; }
  },

  /* ---- player ---- */
  upPlayer(dt) {
    const p = this.p;
    const spdBase = 190 * (this.dev.speed ? 2.6 : 1) * G.speedMult;
    if (p.iframe > 0) p.iframe -= dt;
    if (p.hitT > 0) p.hitT -= dt;
    if (p.atkT > 0) p.atkT -= dt;
    if (p.dashCd > 0) p.dashCd -= dt;

    if (p.dashT > 0) {
      p.dashT -= dt;
      p.vx = p.face * 520 * (this.dev.speed ? 1.6 : 1);
      p.vy = 0; p.iframe = Math.max(p.iframe, .06);
      FX.part(p.x + p.w / 2, p.y + p.h / 2, { kind: 'pixel', col: this.def.accent, size: 4, life: .25, g: 0, vx: -p.face * 60, vy: rnd(30, -30) });
    } else {
      let dx = 0;
      if (Input.isDown('left')) dx -= 1;
      if (Input.isDown('right')) dx += 1;
      if (dx) p.face = dx;
      p.vx = approach(p.vx, dx * spdBase, 2200 * dt);
      // gravity (creative-mode flight if sandbox + gravity toggled)
      if (this.dev.gravity && this.def.id === 'sandbox') {
        p.vy = approach(p.vy, (Input.isDown('up') ? -220 : Input.isDown('down') ? 220 : 0), 1400 * dt);
      } else {
        p.vy += 1500 * dt;
        if (p.vy > 640) p.vy = 640;
        // variable jump
        if (Input.just('ok') && (p.onGround || p.jumps < 1)) {
          if (!p.onGround) p.jumps++;
          p.vy = -470; p.onGround = false; Audio.sfx('swing');
          FX.burst(p.x + p.w / 2, p.y + p.h, 6, { kind: 'dust', col: '#fff', size: 2, life: .3, g: 120 });
        }
        if (!Input.isDown('ok') && p.vy < -140) p.vy = -140;   // short hop
      }
    }
    // dash
    if (Input.just('dash') && p.dashCd <= 0 && (p.onGround || p.airDash)) {
      p.dashT = .16; p.dashCd = .42; if (!p.onGround) p.airDash = false;
      Audio.sfx('dodge');
    }
    // attack (nail slash)
    if (Input.just('back') && p.atkT <= 0) {
      p.atkT = .26;
      p.atkDir = Input.isDown('up') ? -1 : (Input.isDown('down') && !p.onGround) ? 1 : 0;
      Audio.sfx('swing');
      const sx = p.atkDir === 0 ? p.x + p.w / 2 + p.face * 34 : p.x + p.w / 2;
      const sy = p.atkDir === 0 ? p.y + p.h / 2 : p.y + p.h / 2 + p.atkDir * 34;
      this.slashes.push({ x: sx, y: sy, t: 0, dir: p.atkDir, face: p.face });
      this.tryHit(sx, sy, p.atkDir);
    }
    // focus heal (hold special)
    if (Input.isDown('special') && p.focus >= 33 && p.onGround) {
      p.focusT = (p.focusT || 0) + dt;
      if (p.focusT > .75) {
        p.focusT = 0; p.focus -= 33; G.heal(12);
        Audio.sfx('heal'); FX.pop(p.x + p.w / 2, p.y - 10, '+12', { col: PAL.green, scale: 2 });
        FX.burst(p.x + p.w / 2, p.y + p.h / 2, 14, { kind: 'spark', col: '#fff', size: 3, life: .5, g: -60 });
      }
    } else p.focusT = 0;

    // integrate + collide
    p.x = clamp(p.x + p.vx * dt, 0, W - p.w);
    const oldY = p.y;
    p.y += p.vy * dt;
    p.onGround = false;
    this.plats.forEach(pl => {
      if (p.x + p.w > pl.x && p.x < pl.x + pl.w) {
        if (oldY + p.h <= pl.y + 1 && p.y + p.h >= pl.y && p.vy >= 0) {
          p.y = pl.y - p.h; p.vy = 0; p.onGround = true; p.jumps = 0; p.airDash = true;
        }
      }
    });
    if (p.y > H + 60) { p.y = 0; p.vy = 0; }
  },

  tryHit(sx, sy, dir) {
    const b = this.boss;
    const hb = { x: sx - 26, y: sy - 22, w: 52, h: 44 };
    const bb = { x: b.x, y: b.y, w: b.w, h: b.h };
    if (aabb(hb, bb)) {
      let dmg = Math.round(G.atkTotal() * .55 * (this.def.id === 'sandbox' ? 1.35 : 1));
      if (G.oneShot) dmg = 9999;
      b.hp -= dmg; this.dmgDealt += dmg; b.hitFlash = .14; b.stun = .16;
      this.hitStop = .055;
      Audio.sfx('hit'); FX.shake(5, .14);
      FX.pop(b.x + b.w / 2, b.y - 8, '-' + dmg, { col: '#fff', scale: 2, life: .6 });
      FX.burst(sx, sy, 10, { kind: 'spark', col: this.def.accent, size: 3, life: .35, g: 160 });
      // pogo
      if (dir === 1) { this.p.vy = -420; this.p.airDash = true; }
      else this.p.vx -= this.p.face * 120;
      this.p.focus = clamp(this.p.focus + 11, 0, 100);
      if (this.def.id === 'void404') this.format = clamp(this.format + 4.5, 0, 100);
      if (this.def.id === 'sandbox' && Math.random() < .45)
        this.pickups.push({ x: b.x + b.w / 2 + rnd(30, -30), y: b.y + rnd(20, -20), t: 0 });
    }
    // slash also clears projectiles
    for (let i = this.proj.length - 1; i >= 0; i--) {
      const pr = this.proj[i];
      if (!pr.unblockable && dist(pr.x, pr.y, sx, sy) < 40) {
        this.proj.splice(i, 1); Audio.sfx('block');
        FX.burst(pr.x, pr.y, 6, { kind: 'pixel', col: this.def.accent, size: 3, life: .3 });
      }
    }
  },

  /* ---- boss ---- */
  upBoss(dt) {
    const b = this.boss, p = this.p;
    if (b.hitFlash > 0) b.hitFlash -= dt;
    if (b.stun > 0) { b.stun -= dt; return; }
    b.stateT -= dt;
    const slowK = this.dev.speed ? .35 : 1;
    const blind = b.blinded || this.dev.render;
    b.face = (p.x < b.x) ? -1 : 1;

    if (this.dev.gravityOff || this.dev.gravity) { /* boss floats regardless */ }

    switch (b.state) {
      case 'idle': {
        // drift toward player (badly, if blinded)
        const tx = blind ? b.x + Math.sin(this.t * 1.3) * 160 : p.x;
        const ty = blind ? 200 + Math.sin(this.t * .9) * 60 : p.y - 40;
        b.vx = approach(b.vx, clamp((tx - b.x) * 1.6, -150, 150) * slowK, 300 * dt);
        b.vy = approach(b.vy, clamp((ty - b.y) * 1.6, -110, 110) * slowK, 300 * dt);
        if (b.stateT <= 0) {
          const opts = this.def.id === 'void404' ? ['burst', 'charge', 'rain'] : ['burst', 'charge', 'rain', 'slam'];
          b.state = pick(opts); b.stateT = .5;
          if (b.state === 'charge') Audio.sfx('charge');
        }
        break;
      }
      case 'burst':
        if (b.stateT <= 0) {
          const n = blind ? 5 : 9;
          for (let i = 0; i < n; i++) {
            const a = (i / n) * TAU + (blind ? rnd(1) : Math.atan2(p.y - b.y, p.x - b.x));
            this.proj.push({ x: b.x + b.w / 2, y: b.y + b.h / 2, vx: Math.cos(a) * 180, vy: Math.sin(a) * 180, r: 7, t: 0, col: this.def.accent2 || '#ff5a5a', dmg: b.atk });
          }
          Audio.sfx('swing');
          b.state = 'idle'; b.stateT = 1.1 / slowK;
        }
        break;
      case 'charge':
        if (b.stateT > 0) { b.vx = 0; b.vy = 0; }
        else {
          b.vx = (blind ? pick([-1, 1]) : sign(p.x - b.x)) * 420 * slowK;
          b.vy = (blind ? 0 : sign(p.y - b.y)) * 120 * slowK;
          b.state = 'dash'; b.stateT = .55;
          FX.burst(b.x + b.w / 2, b.y + b.h / 2, 12, { kind: 'pixel', col: '#fff', size: 4, life: .3 });
        }
        break;
      case 'dash':
        if (b.stateT <= 0) { b.state = 'idle'; b.stateT = 1.3 / slowK; b.vx *= .2; }
        break;
      case 'rain':
        if (b.stateT <= 0) {
          for (let i = 0; i < 7; i++) {
            const x = blind ? rnd(W) : clamp(p.x + rnd(150, -150), 20, W - 20);
            this.proj.push({ x, y: -20 - i * 26, vx: 0, vy: 240 * slowK, r: 8, t: 0, col: this.def.accent, dmg: b.atk, rainy: true });
          }
          Audio.sfx('swing');
          b.state = 'idle'; b.stateT = 1.4 / slowK;
        }
        break;
      case 'slam':
        if (b.stateT <= 0) {
          b.vy = 700 * slowK;
          b.state = 'slamdown'; b.stateT = 1.1;
        }
        break;
      case 'slamdown':
        if (b.y + b.h > 398) {
          b.y = 398 - b.h; b.vy = -180;
          Audio.sfx('bigslam'); FX.shake(10, .3);
          for (let i = 0; i < 10; i++)
            this.proj.push({ x: b.x + b.w / 2, y: 392, vx: (i - 5) * 70, vy: -200, r: 6, t: 0, col: this.def.accent, dmg: b.atk, grav: 600 });
          b.state = 'idle'; b.stateT = 1.4 / slowK;
        }
        break;
    }
    b.x = clamp(b.x + b.vx * dt, 0, W - b.w);
    b.y = clamp(b.y + b.vy * dt, 20, H - 60);
    // boss body contact
    if (p.iframe <= 0 && aabb({ x: p.x, y: p.y, w: p.w, h: p.h }, { x: b.x, y: b.y, w: b.w, h: b.h }))
      this.hurt(Math.round(b.atk * .7));
    // purple spawns from the dev menu
    if (this.dev.purple > 0 && this.t % 1 < .02) { /* handled on toggle */ }
  },

  upProj(dt) {
    const p = this.p;
    for (let i = this.proj.length - 1; i >= 0; i--) {
      const o = this.proj[i]; o.t += dt;
      if (o.grav) o.vy += o.grav * dt;
      o.x += o.vx * dt; o.y += o.vy * dt;
      if (o.friendly) {
        // player's spawned Hollow Purples
        const b = this.boss;
        if (aabb({ x: o.x - o.r, y: o.y - o.r, w: o.r * 2, h: o.r * 2 }, { x: b.x, y: b.y, w: b.w, h: b.h })) {
          const dmg = Math.round(G.atkTotal() * 1.1);
          b.hp -= dmg; this.dmgDealt += dmg; b.hitFlash = .2; this.hitStop = .06;
          if (this.def.id === 'void404') this.format = clamp(this.format + 6, 0, 100);
          FX.pop(b.x + b.w / 2, b.y - 14, '-' + dmg, { col: '#d9a2ff', scale: 3 });
          FX.burst(o.x, o.y, 22, { kind: 'spark', col: '#9b4dff', size: 4, life: .6 });
          FX.shake(8, .3); Audio.sfx('crit');
          this.proj.splice(i, 1); continue;
        }
      } else if (p.iframe <= 0 && dist(o.x, o.y, p.x + p.w / 2, p.y + p.h / 2) < o.r + 12) {
        this.hurt(o.dmg || 10); this.proj.splice(i, 1); continue;
      }
      if (o.x < -60 || o.x > W + 60 || o.y < -120 || o.y > H + 80 || o.t > 8) this.proj.splice(i, 1);
    }
  },

  hurt(d) {
    const p = this.p;
    if (p.iframe > 0 || G.god) return;
    if (G.has('o_survival') && G.hp - d <= 0 && !this.usedSurvival) {
      this.usedSurvival = true;
      p.iframe = 1.4; Audio.sfx('warp');
      FX.pop(p.x + p.w / 2, p.y - 14, 'ORANGE SURVIVAL', { col: PAL.orange, scale: 2, life: 1.2 });
      FX.flash(PAL.orange, .25, .5);
      return;
    }
    G.hp = Math.max(0, G.hp - d);
    p.iframe = .95; p.hitT = .3;
    p.vx = -p.face * 260; p.vy = -180;
    this.hitStop = .07;
    Audio.sfx('hurt'); FX.shake(7, .25); FX.flash('#ff3b3b', .14, .45);
    FX.pop(p.x + p.w / 2, p.y - 10, '-' + d, { col: PAL.red, scale: 2 });
    if (G.hp <= 0) this.finish('dead');
  },

  /* ---- sandbox dev menu ---- */
  devItems() {
    return [
      { k: 'gravity', t: 'world.gravity', v: () => this.dev.gravity ? 'FALSE' : 'TRUE', d: 'Turn gravity off. You fly; they flail.' },
      { k: 'speed', t: 'player.speed', v: () => this.dev.speed ? '1000%' : '100%', d: 'Increase your own speed by 1000%. Everything else slows.' },
      { k: 'render', t: 'render.distance', v: () => this.dev.render ? '0' : 'MAX', d: 'Set render distance to zero. The target is blinded.' },
      { k: 'purple', t: 'spawn.hollowPurple', v: () => 'x' + this.dev.purple, d: 'Video Game Copy at max: spawn Hollow Purple. Zero cost.' },
      { k: 'close', t: '< close menu >', v: () => '', d: 'Back to the fight.' }
    ];
  },
  upDev(dt) {
    const L = this.devItems();
    if (Input.just('up')) { this.devIdx = (this.devIdx + L.length - 1) % L.length; Audio.sfx('move'); }
    if (Input.just('down')) { this.devIdx = (this.devIdx + 1) % L.length; Audio.sfx('move'); }
    if (Input.just('back') || Input.just('menu')) { this.devOpen = false; Audio.sfx('cancel'); }
    if (Input.just('ok')) {
      const it = L[this.devIdx];
      Audio.sfx('select');
      if (it.k === 'close') { this.devOpen = false; return; }
      if (it.k === 'purple') {
        this.dev.purple++;
        const b = this.boss;
        this.proj.push({
          x: b.x + b.w / 2 + rnd(80, -80), y: -40, vx: 0, vy: 150, r: 22, t: 0,
          col: '#9b4dff', friendly: true
        });
        Audio.sfx('charge');
        this.say('HOLLOW PURPLE SPAWNED. Red times Blue. Zero cursed energy cost.');
      } else {
        this.dev[it.k] = !this.dev[it.k];
        if (it.k === 'render') this.boss.blinded = this.dev.render;
        if (it.k === 'gravity') this.boss.gravityOff = this.dev.gravity;
        Audio.sfx('glitch'); FX.glitch(.25);
        this.say('[' + it.t + '] = ' + it.v());
      }
    }
  },

  /* ---- end ---- */
  finish(outcome) {
    if (this.over) return;
    this.over = true; this.outcome = outcome; this.overT = 0;
    if (outcome === 'format' || outcome === 'kill') { Audio.sfx('domainbreak'); FX.flash('#fff', .4, .9); }
    else if (outcome === 'dead') { Audio.sfx('death'); }
    else { Audio.sfx('domainbreak'); }
    FX.shake(14, 1.2);
    FX.burst(W / 2, H / 2, 70, { kind: this.def.vox ? 'voxel' : 'pixel', col: this.def.accent, size: 6, life: 1.6, g: 120 });
  },
  upOver(dt) {
    this.overT += dt;
    if (this.overT > 1.6 && (Input.just('ok') || this.overT > 5)) {
      this.active = false;
      const res = {
        damage: this.dmgDealt,
        kill: this.outcome === 'format' || this.outcome === 'kill',
        dead: this.outcome === 'dead'
      };
      if (res.dead) { this.parent.active = false; OrangeFight.start(this.parent, this.parent.e); return; }
      this.parent.active = true;
      Audio.play(this.parent.e.music || 'battle');
      this.parent.domainResult(res);
    }
  },

  /* ============ draw ============ */
  draw() {
    drawDomainInterior(this.def, this.t, { clean: true });
    if (this.dev.render) { ctx.save(); ctx.globalAlpha = .82; rect(0, 0, W, H, '#05060a'); ctx.restore(); }

    // platforms
    const sand = this.def.id === 'sandbox';
    this.plats.forEach(pl => {
      if (pl.solid) {
        rect(pl.x, pl.y, pl.w, pl.h, sand ? '#6b4320' : '#2a3f38');
        rect(pl.x, pl.y, pl.w, 5, sand ? '#8a5a2a' : '#00c47a');
        if (sand)
          for (let x = pl.x; x < pl.x + pl.w; x += 32) { rect(x, pl.y, 32, 5, '#3f9d3a'); frameRect(x, pl.y, 32, 32, '#00000033', 1); }
        else
          for (let x = pl.x; x < pl.x + pl.w; x += 48) frameRect(x, pl.y, 48, 48, '#00ffa633', 1);
      } else {
        rect(pl.x, pl.y, pl.w, pl.h, sand ? '#8a5a2a' : '#1d3a32');
        rect(pl.x, pl.y, pl.w, 3, sand ? '#3f9d3a' : '#00ffa6');
        frameRect(pl.x, pl.y, pl.w, pl.h, sand ? '#00000055' : '#042a1c', 1);
      }
    });
    // pickups
    this.pickups.forEach(u => {
      const b = Math.sin(u.t * 6) * 3;
      rect(u.x - 5, u.y - 5 + b, 10, 10, PAL.cyan); rect(u.x - 2, u.y - 2 + b, 4, 4, '#fff');
    });
    // projectiles
    this.proj.forEach(o => {
      if (o.friendly) {
        circle(o.x, o.y, o.r + 6, '#2a1b6b'); circle(o.x, o.y, o.r, '#9b4dff');
        circle(o.x, o.y, o.r * .5, '#fff');
        ctx.save(); ctx.globalAlpha = .4; circle(o.x, o.y, o.r + 10 + Math.sin(this.t * 14) * 3, '#d9a2ff', false); ctx.restore();
      } else {
        rect(o.x - o.r / 2, o.y - o.r / 2, o.r, o.r, o.col);
        rect(o.x - o.r / 2, o.y - o.r / 2, o.r, 2, '#fff');
      }
    });
    // boss
    const b = this.boss;
    ctx.save();
    if (b.hitFlash > 0) ctx.globalAlpha = .45;
    if (b.blinded) ctx.globalAlpha = (ctx.globalAlpha || 1) * .7;
    drawActor(b.spr, b.x - 8, b.y - 10, 3, { t: this.t, dir: b.face < 0 ? 1 : 2, bob: true });
    ctx.restore();
    if (b.state === 'charge') {
      ctx.save(); ctx.globalAlpha = .4 + Math.sin(this.t * 30) * .2;
      circle(b.x + b.w / 2, b.y + b.h / 2, 40, '#fff', false); ctx.restore();
    }
    if (b.blinded) textC('[BLINDED]', b.x + b.w / 2, b.y - 22, { scale: 1, color: PAL.cyan });
    if (this.def.id === 'void404' && this.senses < 3)
      textC(['BODY FAILING', 'TECHNIQUE UNINSTALLED', 'SENSES GONE'][this.senses], b.x + b.w / 2, b.y - 22, { scale: 1, color: '#00c47a' });

    // player
    const p = this.p;
    ctx.save();
    if (p.iframe > 0 && Math.sin(p.iframe * 50) > 0) ctx.globalAlpha = .4;
    if (p.dashT > 0) {
      ctx.globalAlpha = .5;
      for (let i = 1; i <= 3; i++) drawActor(skinSprite(), p.x - 3 - p.face * i * 12, p.y - 10, 2, { t: this.t, dir: p.face < 0 ? 1 : 2, bob: false });
      ctx.globalAlpha = 1;
    }
    drawActor(skinSprite(), p.x - 3, p.y - 10, 2, { t: this.t, dir: p.face < 0 ? 1 : 2, bob: false, walking: Math.abs(p.vx) > 20, frame: (this.t * 10 | 0) % 4 });
    ctx.restore();
    // orange follows
    drawActor('orange', p.x - 26 - p.face * 10, p.y + 2, 2, { t: this.t, hop: true });
    // slashes
    this.slashes.forEach(s => {
      const k = s.t / .18;
      ctx.save(); ctx.globalAlpha = 1 - k;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 5 - k * 3;
      ctx.beginPath();
      if (s.dir === 0) ctx.arc(s.x - s.face * 20, s.y, 34, -1.1, 1.1, s.face < 0);
      else ctx.arc(s.x, s.y - s.dir * 20, 32, s.dir < 0 ? Math.PI + .4 : .4, s.dir < 0 ? -.4 : Math.PI - .4);
      ctx.stroke();
      ctx.strokeStyle = this.def.accent; ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    });

    // ---- HUD ----
    this.drawHUD();
    FX.drawWorld();

    if (this.introT < 1.0) {
      ctx.save(); ctx.globalAlpha = clamp(1 - this.introT, 0, 1); rect(0, 0, W, H, '#000'); ctx.restore();
    }
    if (this.devOpen) this.drawDev();
    if (this.over) this.drawOver();
  },

  drawHUD() {
    // player hp
    rect(10, 8, 200, 48, '#05070ecc'); frameRect(10, 8, 200, 48, this.def.accent, 2);
    text('KENJI', 18, 13, { scale: 2, color: '#fff' });
    hpBar(84, 14, 100, 10, G.hp, G.hpMax, {});
    text(G.hp + '/' + G.hpMax, 18, 28, { scale: 1, color: '#cfe3ff' });
    // focus
    text('FOCUS', 18, 45, { scale: 1, color: PAL.cyan });
    rect(56, 44, 148, 8, '#13213a'); frameRect(56, 44, 148, 8, '#2a3450', 1);
    rect(57, 45, 146 * (this.p.focus / 100), 6, PAL.cyan);
    if (this.p.focus >= 33) text('[V] HEAL', 214, 45, { scale: 1, color: PAL.green });

    // boss hp
    const bw = 260;
    rect(W - bw - 10, 8, bw, 36, '#05070ecc'); frameRect(W - bw - 10, 8, bw, 36, PAL.red, 2);
    text(this.boss.name, W - bw - 2, 12, { scale: 1, color: '#ffb3b3' });
    hpBar(W - bw - 2, 24, bw - 18, 10, Math.max(0, this.boss.hp), this.bossMaxHp, { col: PAL.red });

    // domain banner + timer (sits below the two corner plates)
    const nm = this.def.name.toUpperCase();
    const nw = textW(nm, 1) + 16;
    rect(W / 2 - nw / 2, 64, nw, 13, '#05070ecc');
    textC(nm, W / 2, 66, { scale: 1, color: this.def.accent, shadow: '#000' });
    const tl = Math.max(0, this.timeLeft);
    rect(W / 2 - 110, 80, 220, 7, '#13213a'); frameRect(W / 2 - 110, 80, 220, 7, '#2a3450', 1);
    rect(W / 2 - 109, 81, 218 * clamp(tl / (this.def.id === 'void404' ? 30 : 34), 0, 1), 5, this.def.accent);
    textC('BARRIER ' + tl.toFixed(1) + 's', W / 2, 90, { scale: 1, color: tl < 8 ? PAL.red : '#8fa0bd' });

    // 404 format meter
    if (this.def.id === 'void404') {
      const fy = H - 54;
      rect(W / 2 - 180, fy, 360, 26, '#05070ecc'); frameRect(W / 2 - 180, fy, 360, 26, '#00ffa6', 2);
      text('FORMAT', W / 2 - 172, fy + 9, { scale: 2, color: '#00ffa6' });
      rect(W / 2 - 80, fy + 7, 220, 12, '#062018');
      rect(W / 2 - 80, fy + 7, 220 * (this.format / 100), 12, '#00ffa6');
      text(Math.floor(this.format) + '%', W / 2 + 146, fy + 9, { scale: 2, color: '#fff' });
      for (let i = 0; i < 3; i++) {
        const lab = ['3s SENSES', '10s TECHNIQUE', '30s BODY'][i];
        const on = [12, 36, 66][i] < this.format;
        text(lab, W / 2 - 180 + i * 122, fy - 12, { scale: 1, color: on ? '#00ffa6' : '#3a4a5a' });
      }
    } else {
      // sandbox dev hint
      const fy = H - 44;
      rect(W / 2 - 200, fy, 400, 20, '#05070ecc'); frameRect(W / 2 - 200, fy, 400, 20, PAL.cyan, 1);
      let s = '[C] DEV MENU   ';
      s += this.dev.gravity ? 'GRAV:OFF  ' : '';
      s += this.dev.speed ? 'SPD:1000%  ' : '';
      s += this.dev.render ? 'RENDER:0  ' : '';
      s += this.dev.purple ? 'PURPLE x' + this.dev.purple : '';
      text(s, W / 2 - 192, fy + 6, { scale: 1, color: PAL.cyan });
      text('DMG ' + this.dmgDealt, W / 2 + 140, fy + 6, { scale: 1, color: PAL.yellow });
    }
    // controls
    textC('←→ MOVE   Z JUMP   X SLASH (+↑/↓)   R DASH   V FOCUS-HEAL', W / 2, H - 16, { scale: 1, color: '#55637d' });
    if (this.msgT > 0) {
      const w = textW(this.msg, 1) + 20;
      ctx.save(); ctx.globalAlpha = clamp(this.msgT, 0, 1);
      rect(W / 2 - w / 2, 104, w, 18, '#05070ee6'); frameRect(W / 2 - w / 2, 104, w, 18, this.def.accent, 1);
      text(this.msg, W / 2 - w / 2 + 10, 110, { scale: 1, color: this.def.accent });
      ctx.restore();
    }
  },

  drawDev() {
    ctx.save(); ctx.globalAlpha = .55; rect(0, 0, W, H, '#000'); ctx.restore();
    const L = this.devItems();
    const bw = 400, bh = 40 + L.length * 26, bx = (W - bw) / 2, by = 120;
    rect(bx, by, bw, bh, '#0b1424f2'); frameRect(bx, by, bw, bh, PAL.cyan, 3);
    rect(bx, by, bw, 20, PAL.cyan);
    text('SANDBOX MODE :: DEVELOPER TOOLS', bx + 8, by + 6, { scale: 2, color: '#021018' });
    L.forEach((it, i) => {
      const y = by + 28 + i * 26, sel = i === this.devIdx;
      if (sel) { rect(bx + 6, y - 3, bw - 12, 22, '#1d3157'); text('→', bx + 10, y, { scale: 2, color: PAL.yellow }); }
      text(it.t, bx + 30, y, { scale: 2, color: sel ? '#fff' : '#9fe8ff' });
      const v = it.v(); if (v) text('= ' + v, bx + bw - 30 - textW('= ' + v, 2), y, { scale: 2, color: PAL.orange });
      if (sel) text(it.d, bx + 30, y + 16, { scale: 1, color: '#6f85a8' });
    });
    textC('↑↓ SELECT   Z APPLY   X/C CLOSE   (the fight is paused)', W / 2, by + bh + 10, { scale: 1, color: '#55637d' });
  },

  drawOver() {
    const k = clamp(this.overT / .5, 0, 1);
    ctx.save(); ctx.globalAlpha = k * .85; rect(0, 0, W, H, '#05070e'); ctx.restore();
    const o = this.outcome;
    const title = o === 'format' ? 'FORMAT COMPLETE' : o === 'kill' ? 'TARGET DELETED'
      : o === 'timeout' ? 'BARRIER COLLAPSED' : 'DOMAIN LOST';
    const col = o === 'format' || o === 'kill' ? PAL.green : o === 'timeout' ? PAL.yellow : PAL.red;
    const kan = o === 'format' ? '初期化' : o === 'kill' ? '削除' : o === 'timeout' ? '崩壊' : '敗北';
    pixelGlyphs(kan, W / 2, 140, 100, col, { outline: '#000', dn: 4, shadow: true });
    textC(title, W / 2, 200, { scale: 4, color: '#fff', shadow: '#000' });
    textC('DAMAGE DEALT INSIDE: ' + this.dmgDealt, W / 2, 250, { scale: 2, color: PAL.yellow });
    if (this.def.id === 'void404') textC('FORMAT PROGRESS: ' + Math.floor(this.format) + '%', W / 2, 276, { scale: 2, color: '#00ffa6' });
    if (o === 'format') textC('Their technique is uninstalled. Their body is pixelated smoke.', W / 2, 310, { scale: 1, color: '#cfe3ff' });
    if (o === 'timeout') textC('Your brain is overheating from domain burnout.', W / 2, 310, { scale: 1, color: '#cfe3ff' });
    if (this.overT > 1.6) textC('[ Z ] CONTINUE', W / 2, H - 50, { scale: 2, color: '#fff', shadow: '#000' });
  }
};
