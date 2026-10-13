/* ===========================================================
   DIGITAL GENESIS — fx.js
   Screen shake, freeze-frames, particles, and the big
   Jujutsu-Shenanigans-style cinematics:
     BLACK FLASH / ORANGE FLASH / DOMAIN EXPANSION cut-ins
   =========================================================== */
'use strict';

/* ---- pixelated CJK / big text via offscreen downscale ---- */
const _oc = document.createElement('canvas');
const _octx = _oc.getContext('2d');
function pixelGlyphs(str, cx, cy, size, color, o = {}) {
  const dn = o.dn || 4;                       // downscale factor => chunkiness
  const s = Math.max(4, Math.round(size / dn));
  _octx.font = `bold ${s}px "Hiragino Mincho ProN","Yu Mincho","MS Mincho",serif`;
  const m = _octx.measureText(str);
  const wpx = Math.ceil(m.width) + 4, hpx = Math.ceil(s * 1.35) + 4;
  _oc.width = wpx; _oc.height = hpx;
  _octx.font = `bold ${s}px "Hiragino Mincho ProN","Yu Mincho","MS Mincho",serif`;
  _octx.textBaseline = 'middle'; _octx.textAlign = 'center';
  if (o.outline) { _octx.lineWidth = Math.max(1, s / 8); _octx.strokeStyle = o.outline; _octx.strokeText(str, wpx / 2, hpx / 2); }
  _octx.fillStyle = color; _octx.fillText(str, wpx / 2, hpx / 2);
  let dw = wpx * dn, dh = hpx * dn;
  const maxW = o.maxW || (W - 36);
  if (dw > maxW) { const k = maxW / dw; dw *= k; dh *= k; }
  ctx.save(); ctx.imageSmoothingEnabled = false;
  if (o.alpha != null) ctx.globalAlpha = o.alpha;
  if (o.rot) { ctx.translate(cx, cy); ctx.rotate(o.rot); ctx.translate(-cx, -cy); }
  if (o.shadow) { ctx.globalAlpha = (o.alpha != null ? o.alpha : 1) * .9;
    ctx.drawImage(_oc, cx - dw / 2 + dn * 2, cy - dh / 2 + dn * 2, dw, dh);
    ctx.globalAlpha = (o.alpha != null ? o.alpha : 1); }
  ctx.drawImage(_oc, cx - dw / 2, cy - dh / 2, dw, dh);
  ctx.restore();
  return dw;
}

const FX = {
  shakeT: 0, shakeAmt: 0, flashT: 0, flashCol: '#fff', flashMax: .2,
  freezeT: 0, slowT: 0, slowFactor: 1,
  parts: [], pops: [], arcs: [], rings: [], lines: [],
  cine: null,              // active cinematic
  chroma: 0, glitchT: 0, vignette: 0, letterbox: 0,
  domainBg: null, domainT: 0,

  /* ---------- simple hooks ---------- */
  shake(amt = 6, t = .28) { this.shakeAmt = Math.max(this.shakeAmt, amt); this.shakeT = Math.max(this.shakeT, t); },
  flash(col = '#fff', t = .12, max = .85) { this.flashCol = col; this.flashT = t; this.flashMax = max; this.flashDur = t; },
  freeze(t = .1) { this.freezeT = Math.max(this.freezeT, t); },
  slow(f = .25, t = .5) { this.slowFactor = f; this.slowT = t; },
  glitch(t = .4) { this.glitchT = Math.max(this.glitchT, t); },

  /* ---------- particles ---------- */
  /* kind: 'pixel' digital voxel, 'spark', 'dust', 'code', 'blood'(red energy), 'ember' */
  part(x, y, o = {}) {
    this.parts.push({
      x, y, vx: o.vx != null ? o.vx : rnd(80, -80), vy: o.vy != null ? o.vy : rnd(20, -120),
      g: o.g != null ? o.g : 260, life: o.life || rnd(.9, .4), t: 0,
      size: o.size || rndi(5, 2), col: o.col || PAL.orange, kind: o.kind || 'pixel',
      spin: rnd(6, -6), rot: 0, fade: o.fade !== false, char: o.char
    });
  },
  burst(x, y, n, o = {}) { for (let i = 0; i < n; i++) this.part(x, y, o); },
  ring(x, y, o = {}) {
    this.rings.push({ x, y, r: o.r0 || 4, rMax: o.r || 90, t: 0, life: o.life || .5,
      col: o.col || PAL.orange, w: o.w || 3, kind: o.kind || 'ring', seg: o.seg || 0 });
  },
  arc(x, y, o = {}) { // lightning arc (black-flash style)
    const pts = [], n = o.seg || 7, len = o.len || 70, ang = o.ang != null ? o.ang : rnd(TAU);
    let px = x, py = y;
    for (let i = 0; i <= n; i++) {
      const d = (len / n) * i, a = ang + rnd(.9, -.9);
      px = x + Math.cos(ang) * d + Math.cos(a) * rnd(12, -12);
      py = y + Math.sin(ang) * d + Math.sin(a) * rnd(12, -12);
      pts.push([px, py]);
    }
    this.arcs.push({ pts, t: 0, life: o.life || .22, col: o.col || '#ff2d2d', col2: o.col2 || '#1a0000', w: o.w || 3 });
  },
  pop(x, y, txt, o = {}) {
    this.pops.push({ x, y, txt: String(txt), t: 0, life: o.life || .9, col: o.col || '#fff',
      scale: o.scale || 2, vy: o.vy || -46, crit: o.crit, shadow: o.shadow || '#000' });
  },
  speedLines(t = .3, col = '#fff') { this.lines.push({ t: 0, life: t, col }); },

  /* ---------- update ---------- */
  update(dt) {
    if (this.freezeT > 0) { this.freezeT -= dt; }
    if (this.shakeT > 0) { this.shakeT -= dt; if (this.shakeT <= 0) this.shakeAmt = 0; }
    if (this.flashT > 0) this.flashT -= dt;
    if (this.glitchT > 0) this.glitchT -= dt;
    if (this.slowT > 0) { this.slowT -= dt; if (this.slowT <= 0) this.slowFactor = 1; }
    this.domainT += dt;

    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i]; p.t += dt;
      if (p.t >= p.life) { this.parts.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt; p.rot += p.spin * dt;
      if (p.kind === 'code') p.vy *= .985;
      if (p.kind === 'dust') { p.vx *= .94; p.vy *= .94; }
    }
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i]; r.t += dt;
      if (r.t >= r.life) { this.rings.splice(i, 1); continue; }
      r.r = lerp(r.r, r.rMax, Math.min(1, dt * 9));
    }
    for (let i = this.arcs.length - 1; i >= 0; i--) {
      const a = this.arcs[i]; a.t += dt; if (a.t >= a.life) this.arcs.splice(i, 1);
    }
    for (let i = this.pops.length - 1; i >= 0; i--) {
      const p = this.pops[i]; p.t += dt;
      if (p.t >= p.life) { this.pops.splice(i, 1); continue; }
      p.y += p.vy * dt; p.vy += 150 * dt;
    }
    for (let i = this.lines.length - 1; i >= 0; i--) {
      const l = this.lines[i]; l.t += dt; if (l.t >= l.life) this.lines.splice(i, 1);
    }
    if (this.cine) {
      this.cine.t += dt;
      if (this.cine.update) this.cine.update(this.cine.t, dt);
      if (this.cine.t >= this.cine.dur) {
        const c = this.cine; this.cine = null;
        if (c.done) c.done();
      }
    }
  },

  busy() { return !!this.cine; },

  /* ---------- camera shake offset ---------- */
  applyShake() {
    if (this.shakeAmt <= 0) return [0, 0];
    const a = this.shakeAmt * Math.min(1, this.shakeT * 4);
    const ox = Math.round(rnd(a, -a)), oy = Math.round(rnd(a, -a));
    ctx.translate(ox, oy); return [ox, oy];
  },

  /* ---------- draw world-layer fx (before UI) ---------- */
  drawWorld() {
    // rings
    this.rings.forEach(r => {
      const k = r.t / r.life, a = 1 - k;
      ctx.save(); ctx.globalAlpha = a;
      if (r.kind === 'ring') { circle(r.x, r.y, r.r, r.col, false); ctx.lineWidth = r.w; }
      else if (r.kind === 'disc') { ctx.globalAlpha = a * .45; circle(r.x, r.y, r.r, r.col, true); }
      else if (r.kind === 'hex') { // digital polygon ring
        ctx.strokeStyle = r.col; ctx.lineWidth = r.w; ctx.beginPath();
        const n = 6;
        for (let i = 0; i <= n; i++) {
          const a2 = (i / n) * TAU + r.t * 2;
          const px = r.x + Math.cos(a2) * r.r, py = r.y + Math.sin(a2) * r.r * .82;
          i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        } ctx.stroke();
      } else if (r.kind === 'shock') { // flat anime shockwave ellipse
        ctx.strokeStyle = r.col; ctx.lineWidth = r.w * (1 - k) + 1;
        ctx.beginPath(); ctx.ellipse(r.x, r.y, r.r, r.r * .3, 0, 0, TAU); ctx.stroke();
      }
      ctx.restore();
    });
    // lightning arcs
    this.arcs.forEach(a => {
      const k = 1 - a.t / a.life;
      ctx.save(); ctx.globalAlpha = k;
      ctx.lineJoin = 'miter'; ctx.lineCap = 'butt';
      ctx.strokeStyle = a.col2; ctx.lineWidth = a.w + 4;
      ctx.beginPath(); a.pts.forEach((p, i) => i ? ctx.lineTo(p[0] | 0, p[1] | 0) : ctx.moveTo(p[0] | 0, p[1] | 0)); ctx.stroke();
      ctx.strokeStyle = a.col; ctx.lineWidth = a.w;
      ctx.beginPath(); a.pts.forEach((p, i) => i ? ctx.lineTo(p[0] | 0, p[1] | 0) : ctx.moveTo(p[0] | 0, p[1] | 0)); ctx.stroke();
      ctx.restore();
    });
    // particles
    this.parts.forEach(p => {
      const k = p.t / p.life, a = p.fade ? 1 - k : 1;
      ctx.save(); ctx.globalAlpha = a;
      if (p.kind === 'code') {
        text(p.char || pick(['0', '1', 'x', '#', '/', '7', 'E', 'r']), p.x | 0, p.y | 0, { scale: 1, color: p.col });
      } else if (p.kind === 'spark') {
        rect(p.x, p.y, p.size, p.size, p.col);
        rect(p.x - p.vx * .02, p.y - p.vy * .02, Math.max(1, p.size - 1), Math.max(1, p.size - 1), p.col);
      } else if (p.kind === 'pixel') {
        const s = Math.max(1, p.size * (1 - k * .5)) | 0;
        rect(p.x, p.y, s, s, p.col);
      } else if (p.kind === 'voxel') {
        const s = Math.max(2, p.size * (1 - k * .4)) | 0;
        rect(p.x, p.y, s, s, p.col); rect(p.x, p.y, s, 1, '#fff'); rect(p.x, p.y + s - 1, s, 1, '#0006');
      } else if (p.kind === 'dust') {
        ctx.globalAlpha = a * .5; rect(p.x, p.y, p.size, p.size, p.col);
      } else if (p.kind === 'ember') {
        rect(p.x, p.y, p.size, p.size, k > .6 ? '#ffd79a' : p.col);
      } else rect(p.x, p.y, p.size, p.size, p.col);
      ctx.restore();
    });
    // damage pops
    this.pops.forEach(p => {
      const k = p.t / p.life;
      const sc = p.crit ? p.scale + Math.max(0, (1 - k * 6)) * 2 : p.scale;
      ctx.save(); ctx.globalAlpha = k > .7 ? (1 - k) / .3 : 1;
      textC(p.txt, p.x, p.y, { scale: Math.round(sc), color: p.col, shadow: p.shadow });
      ctx.restore();
    });
  },

  /* ---------- draw fullscreen overlays (after UI) ---------- */
  drawOverlay() {
    // anime speed lines
    this.lines.forEach(l => {
      const k = 1 - l.t / l.life;
      ctx.save(); ctx.globalAlpha = k * .8;
      for (let i = 0; i < 26; i++) {
        const a = (i / 26) * TAU + l.t, r0 = 150 + Math.sin(i * 3.1) * 40;
        const x1 = W / 2 + Math.cos(a) * r0, y1 = H / 2 + Math.sin(a) * r0;
        const x2 = W / 2 + Math.cos(a) * 520, y2 = H / 2 + Math.sin(a) * 520;
        line(x1, y1, x2, y2, l.col, 2 + (i % 3));
      }
      ctx.restore();
    });
    if (this.cine && this.cine.draw) this.cine.draw(this.cine.t);
    if (this.letterbox > 0) {
      const h = this.letterbox * 56;
      rect(0, 0, W, h, '#000'); rect(0, H - h, W, h, '#000');
    }
    if (this.flashT > 0) {
      const k = this.flashT / (this.flashDur || .12);
      ctx.save(); ctx.globalAlpha = clamp(k, 0, 1) * this.flashMax;
      rect(0, 0, W, H, this.flashCol); ctx.restore();
    }
    if (this.glitchT > 0) this.drawGlitch();
  },
  drawGlitch() {
    const n = 5 + rndi(6);
    for (let i = 0; i < n; i++) {
      const y = rndi(H), h = rndi(16, 3), dx = rndi(26, -26);
      try {
        const d = ctx.getImageData(0, y, W, h);
        ctx.putImageData(d, dx, y);
      } catch (e) { /* tainted canvas guard */ }
      if (Math.random() < .4) { ctx.globalAlpha = .25; rect(0, y, W, h, pick([PAL.cyan, PAL.pink, PAL.green])); ctx.globalAlpha = 1; }
    }
  },

  /* ==========================================================
     BLACK FLASH  —  Jujutsu Shenanigans style
     freeze, desaturate to black, red-black lightning bloom,
     ring of distortion, 0.000001s readout, kanji slam, cracks
     ========================================================== */
  blackFlash(x, y, o = {}) {
    Audio.sfx('blackflash');
    this.freeze(.42); this.slow(.12, 1.0); this.shake(13, .9);
    const cracks = [];
    for (let i = 0; i < 16; i++) {
      const a = rnd(TAU), pts = [];
      let px = x, py = y;
      for (let s = 0; s < 6; s++) {
        px += Math.cos(a + rnd(.7, -.7)) * rnd(46, 18);
        py += Math.sin(a + rnd(.7, -.7)) * rnd(46, 18);
        pts.push([px, py]);
      }
      cracks.push({ pts, a });
    }
    for (let i = 0; i < 9; i++)
      timers.after(i * .035, () => this.arc(x, y, { len: rnd(140, 70), col: '#ff1f1f', col2: '#140000', w: 3, life: .3 }));
    this.ring(x, y, { r: 170, col: '#ff2d2d', w: 6, life: .55, kind: 'ring' });
    this.ring(x, y, { r: 300, col: '#2a0000', w: 14, life: .7, kind: 'ring' });
    this.ring(x, y, { r: 240, col: '#ff5555', w: 4, life: .5, kind: 'shock' });
    this.burst(x, y, 46, { kind: 'spark', col: '#ff2d2d', size: 4, life: .8, vx: rnd(300, -300), vy: rnd(300, -300), g: 60 });
    this.burst(x, y, 26, { kind: 'pixel', col: '#1a0000', size: 6, life: .9 });
    this.speedLines(.7, '#ff2d2d');
    this.cine = {
      t: 0, dur: 1.55, x, y, cracks,
      draw: (t) => {
        // 1. negative-space blackout that irises in
        const k = Math.min(1, t / .14);
        ctx.save();
        ctx.globalAlpha = t < .9 ? .82 * (1 - Math.max(0, (t - .55) / .35)) : 0;
        rect(0, 0, W, H, '#07000a');
        ctx.restore();
        // 2. red radial burst behind
        if (t < .8) {
          ctx.save(); ctx.globalAlpha = (1 - t / .8) * .9;
          const R = 40 + t * 900;
          const g = ctx.createRadialGradient(x, y, 0, x, y, R);
          g.addColorStop(0, '#ffffff'); g.addColorStop(.18, '#ff3b3b');
          g.addColorStop(.45, '#8c0f0f'); g.addColorStop(1, 'rgba(10,0,0,0)');
          ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
          ctx.restore();
        }
        // 3. jagged black cracks with red core
        if (t > .04 && t < 1.1) {
          const kk = clamp((t - .04) / .22, 0, 1);
          ctx.save(); ctx.globalAlpha = 1 - Math.max(0, (t - .6) / .5);
          cracks.forEach(c => {
            const n = Math.max(2, Math.ceil(c.pts.length * kk));
            ctx.lineWidth = 9; ctx.strokeStyle = '#0a0004';
            ctx.beginPath(); ctx.moveTo(x, y);
            for (let i = 0; i < n; i++) ctx.lineTo(c.pts[i][0] | 0, c.pts[i][1] | 0);
            ctx.stroke();
            ctx.lineWidth = 3; ctx.strokeStyle = '#ff2d2d';
            ctx.beginPath(); ctx.moveTo(x, y);
            for (let i = 0; i < n; i++) ctx.lineTo(c.pts[i][0] | 0, c.pts[i][1] | 0);
            ctx.stroke();
          });
          ctx.restore();
        }
        // 4. the signature black-red core blob
        if (t < .7) {
          const r = 26 + Math.sin(Math.min(1, t / .2) * Math.PI) * 44;
          ctx.save(); ctx.globalAlpha = 1 - t / .7;
          circle(x, y, r * 1.5, '#15000a'); circle(x, y, r, '#ff2d2d'); circle(x, y, r * .45, '#fff');
          ctx.restore();
        }
        // 5. kanji + text slam
        if (t > .1) {
          const st = clamp((t - .1) / .14, 0, 1);
          const sc = 1 + (1 - st) * 1.6;
          const alpha = t > 1.2 ? 1 - (t - 1.2) / .35 : 1;
          ctx.save(); ctx.globalAlpha = clamp(alpha, 0, 1);
          pixelGlyphs('黒閃', W / 2, 150, 118 * sc, '#ff2d2d', { outline: '#0a0004', dn: 5, shadow: true, alpha: clamp(alpha, 0, 1) });
          textC('BLACK FLASH', W / 2, 232, { scale: 4 * (sc > 1.2 ? 1 : 1), color: '#fff', shadow: '#8c0f0f' });
          if (t > .35) {
            const dev = o.dev != null ? o.dev : 0.000001;
            textC('DEVIATION ' + dev.toFixed(6) + 's', W / 2, 280, { scale: 2, color: '#ff9a9a', shadow: '#2a0000' });
            textC('x' + (o.mult || 2.5).toFixed(1) + ' DAMAGE', W / 2, 302, { scale: 2, color: PAL.yellow, shadow: '#2a0000' });
          }
          ctx.restore();
        }
        // 6. letterbox
        const lb = clamp(t / .1, 0, 1) * (t > 1.25 ? clamp(1 - (t - 1.25) / .3, 0, 1) : 1);
        rect(0, 0, W, 44 * lb, '#000'); rect(0, H - 44 * lb, W, 44 * lb, '#000');
      }
    };
  },

  /* ==========================================================
     ORANGE FLASH — "100x a black flash's impact"
     ========================================================== */
  orangeFlash(x, y, o = {}) {
    Audio.sfx('orangeflash');
    this.freeze(.9); this.slow(.08, 2.2); this.shake(26, 2.6);
    for (let i = 0; i < 26; i++)
      timers.after(i * .05, () => {
        this.arc(x, y, { len: rnd(300, 120), col: '#ffd24a', col2: '#b25a00', w: 4, life: .4 });
        this.shake(20, .4);
      });
    for (let i = 0; i < 7; i++)
      timers.after(i * .13, () => {
        this.ring(x, y, { r: 300 + i * 90, col: i % 2 ? '#fff3d6' : PAL.orange, w: 9, life: .8, kind: 'ring' });
        this.ring(x, y, { r: 420 + i * 60, col: PAL.orange2, w: 5, life: .7, kind: 'shock' });
      });
    this.burst(x, y, 150, { kind: 'spark', col: PAL.orange, size: 5, life: 1.6, vx: rnd(620, -620), vy: rnd(620, -620), g: 30 });
    this.burst(x, y, 70, { kind: 'voxel', col: PAL.orange2, size: 7, life: 1.8 });
    this.burst(x, y, 50, { kind: 'code', col: '#fff3d6', life: 1.6 });
    this.speedLines(2.0, PAL.orange);
    this.cine = {
      t: 0, dur: 3.3, x, y,
      draw: (t) => {
        // sun-core bloom
        const R = 50 + Math.min(t, 1.4) * 760;
        ctx.save();
        ctx.globalAlpha = t < 2.4 ? clamp(1 - (t - 1.6) / .8, 0, 1) : 0;
        const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(1, R));
        g.addColorStop(0, '#ffffff'); g.addColorStop(.1, '#fff3d6');
        g.addColorStop(.28, '#ffb347'); g.addColorStop(.55, '#ff8c00');
        g.addColorStop(.8, '#b25a00'); g.addColorStop(1, 'rgba(40,16,0,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        ctx.restore();
        // white-out peak
        if (t > .18 && t < .72) {
          ctx.save(); ctx.globalAlpha = Math.sin(((t - .18) / .54) * Math.PI) * .95;
          rect(0, 0, W, H, '#fff'); ctx.restore();
        }
        // rotating cross-flare
        if (t < 2.2) {
          ctx.save(); ctx.globalAlpha = clamp(1 - t / 2.2, 0, 1) * .85;
          ctx.translate(x, y); ctx.rotate(t * .5);
          for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            const L = 300 + Math.sin(t * 6 + i) * 60;
            ctx.fillStyle = i % 2 ? '#fff3d6' : PAL.orange;
            ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(L, 0); ctx.lineTo(0, 10); ctx.closePath(); ctx.fill();
          }
          ctx.restore();
        }
        // kanji slam
        if (t > .5) {
          const st = clamp((t - .5) / .16, 0, 1), sc = 1 + (1 - st) * 2.2;
          const al = t > 2.7 ? clamp(1 - (t - 2.7) / .55, 0, 1) : 1;
          pixelGlyphs('橙閃', W / 2, 142, 150 * sc, PAL.orange, { outline: '#2a1000', dn: 5, shadow: true, alpha: al });
          ctx.save(); ctx.globalAlpha = al;
          textC('ORANGE FLASH', W / 2, 238, { scale: 5, color: '#fff3d6', shadow: '#b25a00' });
          if (t > .9) {
            textC('IMPACT SCALE: x100 BLACK FLASH', W / 2, 296, { scale: 2, color: '#fff', shadow: '#8a4a00' });
            textC('ORANGE: "GO ON KENJI. DELETE HIM."', W / 2, 318, { scale: 2, color: PAL.orange2, shadow: '#2a1000' });
          }
          ctx.restore();
        }
        const lb = clamp(t / .14, 0, 1) * (t > 2.9 ? clamp(1 - (t - 2.9) / .4, 0, 1) : 1);
        rect(0, 0, W, 50 * lb, '#000'); rect(0, H - 50 * lb, W, 50 * lb, '#000');
      }
    };
  },

  /* ==========================================================
     DOMAIN EXPANSION cut-in — JJS style
     hand-sign freeze, diagonal panels, dome sweep, name slam
     ========================================================== */
  domainExpansion(def, o = {}) {
    Audio.sfx('domain');
    this.freeze(.6); this.slow(.15, 1.4); this.shake(10, 3.4);
    const cx = o.x != null ? o.x : W / 2, cy = o.y != null ? o.y : H / 2 + 20;
    this.speedLines(1.4, def.accent);
    for (let i = 0; i < 6; i++)
      timers.after(.25 + i * .14, () => {
        this.ring(cx, cy, { r: 200 + i * 110, col: def.accent, w: 7, life: 1.0, kind: 'ring' });
        this.shake(12, .5);
      });
    this.burst(cx, cy, 90, { kind: def.vox ? 'voxel' : 'code', col: def.accent, size: 6, life: 1.6, g: -40 });
    this.cine = {
      t: 0, dur: 4.0, def, cx, cy,
      draw: (t) => {
        const d = def;
        /* ---- phase 1: black drop + diagonal sorcerer panels (0 - .9) ---- */
        if (t < 1.25) {
          const k = clamp(t / .18, 0, 1);
          ctx.save(); ctx.globalAlpha = Math.min(1, k) * (t > 1.0 ? clamp(1 - (t - 1.0) / .25, 0, 1) : 1);
          rect(0, 0, W, H, '#03040a');
          // diagonal slash panels
          for (let i = 0; i < 3; i++) {
            const st = clamp((t - .08 - i * .1) / .16, 0, 1);
            if (st <= 0) continue;
            const yb = 60 + i * 120, hgt = 96;
            const off = (1 - st) * (i % 2 ? W : -W);
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(off, yb); ctx.lineTo(W + off, yb - 26);
            ctx.lineTo(W + off, yb - 26 + hgt); ctx.lineTo(off, yb + hgt);
            ctx.closePath(); ctx.clip();
            rect(0, 0, W, H, i % 2 ? '#0b1020' : '#070a16');
            // code rain inside the panel
            for (let j = 0; j < 30; j++) {
              const px = (j * 37 + (t * 300 | 0)) % W, py = yb + ((j * 53 + (t * 220 | 0)) % hgt);
              text(pick(['0', '1', '#', 'x', '/']), px, py, { scale: 1, color: d.accent, alpha: .5 });
            }
            ctx.restore();
            frameRect(off, yb - 2, W, hgt + 2, d.accent, 2);
          }
          // hand sign cut-in (center panel)
          const hs = clamp((t - .3) / .2, 0, 1);
          if (hs > 0) {
            ctx.save(); ctx.globalAlpha = hs;
            const bx = W / 2 - 120, by = 166;
            rect(bx, by, 240, 150, '#05070e');
            frameRect(bx, by, 240, 150, d.accent, 3);
            drawHandSign(d.sign, bx + 120, by + 80, 1 + hs * .2, d.accent, t);
            textC(d.signName, bx + 120, by + 126, { scale: 2, color: '#cfe3ff', shadow: '#000' });
            ctx.restore();
          }
          ctx.restore();
        }
        /* ---- phase 2: barrier dome sweeps outward (.9 - 2.0) ---- */
        if (t > .85) {
          const k = clamp((t - .85) / .7, 0, 1);
          const R = k * 740;
          ctx.save();
          // outside the dome: dark
          ctx.globalAlpha = clamp(1 - (t - 1.9) / .5, 0, 1);
          if (k < 1) { rect(0, 0, W, H, d.outside || '#04060c'); }
          // dome interior
          ctx.beginPath(); ctx.arc(cx, cy, Math.max(1, R), 0, TAU); ctx.clip();
          drawDomainInterior(d, t);
          ctx.restore();
          // dome rim: thick glowing barrier edge + hex lattice
          ctx.save();
          ctx.globalAlpha = clamp(1 - (t - 1.7) / .6, 0, 1);
          ctx.lineWidth = 10; ctx.strokeStyle = d.accent;
          ctx.beginPath(); ctx.arc(cx, cy, Math.max(1, R), 0, TAU); ctx.stroke();
          ctx.lineWidth = 3; ctx.strokeStyle = '#fff';
          ctx.beginPath(); ctx.arc(cx, cy, Math.max(1, R - 9), 0, TAU); ctx.stroke();
          for (let i = 0; i < 28; i++) {
            const a = (i / 28) * TAU + t;
            const r1 = R - 6, r2 = R + 16;
            line(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1,
                 cx + Math.cos(a) * r2, cy + Math.sin(a) * r2, d.accent, 3);
          }
          ctx.restore();
        }
        /* ---- phase 3: name slam (1.5 - end) ---- */
        if (t > 1.45) {
          const st = clamp((t - 1.45) / .15, 0, 1), sc = 1 + (1 - st) * 1.8;
          const al = t > 3.5 ? clamp(1 - (t - 3.5) / .45, 0, 1) : 1;
          ctx.save(); ctx.globalAlpha = al;
          // "DOMAIN EXPANSION" banner
          const bh = 30;
          rect(0, 86, W, bh, '#000');
          frameRect(0, 86, W, bh, d.accent, 2);
          textC('DOMAIN EXPANSION', W / 2, 94, { scale: 3, color: '#fff', shadow: d.accentD || '#000' });
          pixelGlyphs(d.kanji, W / 2, 196, 88 * sc, d.accent, { outline: '#000', dn: 4, shadow: true, alpha: al, maxW: W - 120 });
          textC(d.name.toUpperCase(), W / 2, 262, { scale: textW(d.name, 3) < W - 40 ? 3 : 2, color: '#fff', shadow: d.accentD || '#000' });
          if (t > 1.9) {
            textC(d.signName, W / 2, 300, { scale: 2, color: d.accent2 || d.accent, shadow: '#000' });
            wrap(d.effect, 52).forEach((l, i) => textC(l, W / 2, 326 + i * 22, { scale: 2, color: '#cfe3ff', shadow: '#000' }));
            textC('SURE-HIT  //  BARRIER: ' + d.barrier, W / 2, 380, { scale: 2, color: PAL.yellow, shadow: '#000' });
          }
          ctx.restore();
        }
        const lb = clamp(t / .1, 0, 1) * (t > 3.65 ? clamp(1 - (t - 3.65) / .35, 0, 1) : 1);
        rect(0, 0, W, 52 * lb, '#000'); rect(0, H - 52 * lb, W, 52 * lb, '#000');
      }
    };
  },

  /* enemy domain (Malevolent Shrine etc.) uses the same engine */
  enemyDomain(def, o = {}) { this.domainExpansion(def, o); },

  /* ---- domain collision: two domains grinding ---- */
  domainClash(defA, defB) {
    Audio.sfx('domainbreak'); this.shake(18, 2.2); this.slow(.3, 1.2);
    this.cine = {
      t: 0, dur: 2.6,
      draw: (t) => {
        const k = clamp(t / 2.6, 0, 1);
        // split screen: two domains pressing against each other
        const seam = W / 2 + Math.sin(t * 9) * (22 * (1 - k));
        ctx.save();
        ctx.beginPath(); ctx.rect(0, 0, seam, H); ctx.clip(); drawDomainInterior(defB, t); ctx.restore();
        ctx.save();
        ctx.beginPath(); ctx.rect(seam, 0, W - seam, H); ctx.clip(); drawDomainInterior(defA, t); ctx.restore();
        // seam energy
        for (let i = 0; i < 20; i++) {
          const y = (i / 20) * H + Math.sin(t * 12 + i) * 8;
          line(seam - 10 + rnd(20, -20), y, seam - 10 + rnd(20, -20), y + H / 20, i % 2 ? defA.accent : defB.accent, 3);
        }
        rect(seam - 3, 0, 6, H, '#fff');
        textC('DOMAIN CLASH', W / 2, 40, { scale: 3, color: '#fff', shadow: '#000' });
        textC(defB.name.toUpperCase() + '  VS  ' + defA.name.toUpperCase(), W / 2, 76, { scale: 2, color: PAL.yellow, shadow: '#000' });
        textC('BARRIER STRENGTH CONTEST...', W / 2, H - 60, { scale: 2, color: '#cfe3ff', shadow: '#000' });
        const lb = 1;
        rect(0, 0, W, 24 * lb, '#000'); rect(0, H - 24 * lb, W, 24 * lb, '#000');
      }
    };
  },

  /* ---- generic技 cut-in for techniques (Null, Lag Spike...) ---- */
  techniqueCutIn(ab, o = {}) {
    this.freeze(.22); this.shake(7, .4);
    if (ab.sfx) Audio.sfx(ab.sfx);
    this.cine = {
      t: 0, dur: 1.15,
      draw: (t) => {
        const st = clamp(t / .1, 0, 1), out = t > .85 ? clamp(1 - (t - .85) / .3, 0, 1) : 1;
        const al = st * out;
        ctx.save(); ctx.globalAlpha = al;
        // slanted band
        const bh = 74, by = 150;
        ctx.save();
        ctx.beginPath(); ctx.moveTo(0, by); ctx.lineTo(W, by - 18);
        ctx.lineTo(W, by - 18 + bh); ctx.lineTo(0, by + bh); ctx.closePath(); ctx.clip();
        rect(0, 0, W, H, '#05070e');
        for (let j = 0; j < 40; j++) {
          const px = (j * 31 + (t * 420 | 0)) % W;
          text(pick(['0', '1', '#', '/', 'x']), px, by + (j * 17) % bh - 10, { scale: 1, color: ab.col, alpha: .45 });
        }
        const sweep = (t / 1.15) * (W + 300) - 150;
        ctx.globalAlpha = .5; rect(sweep, 0, 90, H, ab.col); ctx.globalAlpha = 1;
        ctx.restore();
        line(0, by, W, by - 18, ab.col, 3);
        line(0, by + bh, W, by - 18 + bh, ab.col, 3);
        if (ab.kanji) pixelGlyphs(ab.kanji, 150, by + 26, 62, ab.col, { outline: '#000', dn: 4, shadow: true, alpha: al });
        text(ab.name.toUpperCase(), 250, by + 10, { scale: 3, color: '#fff', shadow: ab.colD || '#000' });
        text(ab.jp || '', 250, by + 42, { scale: 2, color: ab.col, shadow: '#000' });
        ctx.restore();
      }
    };
  },

  clear() {
    this.parts.length = 0; this.pops.length = 0; this.arcs.length = 0;
    this.rings.length = 0; this.lines.length = 0; this.cine = null;
    this.shakeT = 0; this.shakeAmt = 0; this.flashT = 0; this.letterbox = 0;
    this.slowFactor = 1; this.slowT = 0; this.freezeT = 0;
  }
};

/* ---------- hand signs ---------- */
function drawHandSign(kind, cx, cy, s, col, t = 0) {
  const u = 3 * s;
  const p = PX(cx - 24 * s, cy - 24 * s, u);
  const SK = '#f6c9a0', SK2 = '#d49a73';
  if (kind === 'power') {
    // power-button symbol made with fingers
    ctx.save();
    ctx.lineWidth = 5 * s; ctx.strokeStyle = SK;
    ctx.beginPath(); ctx.arc(cx, cy + 2 * s, 17 * s, -1.25, 1.25 + Math.PI * .5, false); ctx.stroke();
    ctx.lineWidth = 5 * s; ctx.strokeStyle = SK2;
    ctx.beginPath(); ctx.moveTo(cx, cy - 20 * s); ctx.lineTo(cx, cy - 2 * s); ctx.stroke();
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .55 + Math.sin(t * 14) * .3;
    ctx.lineWidth = 2 * s; ctx.strokeStyle = col;
    ctx.beginPath(); ctx.arc(cx, cy + 2 * s, 21 * s, 0, TAU); ctx.stroke();
    ctx.restore();
  } else if (kind === 'tv') {
    // thumbs + index forming a retro TV screen
    const x0 = cx - 20 * s, y0 = cy - 14 * s, w = 40 * s, h = 28 * s;
    ctx.save();
    ctx.lineWidth = 6 * s; ctx.strokeStyle = SK;
    ctx.strokeRect(x0, y0, w, h);
    ctx.lineWidth = 3 * s; ctx.strokeStyle = SK2;
    ctx.beginPath(); ctx.moveTo(x0 - 6 * s, y0 + h + 4 * s); ctx.lineTo(x0 + 6 * s, y0 + h - 2 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x0 + w + 6 * s, y0 + h + 4 * s); ctx.lineTo(x0 + w - 6 * s, y0 + h - 2 * s); ctx.stroke();
    ctx.restore();
    // screen contents
    ctx.save(); ctx.beginPath(); ctx.rect(x0 + 3, y0 + 3, w - 6, h - 6); ctx.clip();
    rect(x0 + 3, y0 + 3, w - 6, h - 6, '#07141c');
    for (let i = 0; i < 5; i++) rect(x0 + 5, y0 + 6 + i * 5 * s, (6 + ((i * 4 + (t * 9 | 0)) % 14)) * s, 2 * s, col);
    ctx.restore();
  } else if (kind === 'shrine') {
    ctx.save(); ctx.lineWidth = 5 * s; ctx.strokeStyle = SK;
    ctx.beginPath(); ctx.moveTo(cx - 14 * s, cy + 14 * s); ctx.lineTo(cx, cy - 16 * s); ctx.lineTo(cx + 14 * s, cy + 14 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 8 * s, cy + 2 * s); ctx.lineTo(cx + 8 * s, cy + 2 * s); ctx.stroke();
    ctx.restore();
  } else if (kind === 'onehand') {
    ctx.save(); ctx.lineWidth = 6 * s; ctx.strokeStyle = SK;
    ctx.beginPath(); ctx.moveTo(cx - 2 * s, cy + 16 * s); ctx.lineTo(cx - 2 * s, cy - 14 * s); ctx.stroke();
    ctx.lineWidth = 5 * s; ctx.strokeStyle = SK2;
    ctx.beginPath(); ctx.arc(cx + 6 * s, cy + 2 * s, 10 * s, -1.6, 1.6); ctx.stroke();
    ctx.restore();
  } else if (kind === 'hands') {
    ctx.save(); ctx.lineWidth = 5 * s; ctx.strokeStyle = SK;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(cx - 16 * s + i * 10 * s, cy + 16 * s);
      ctx.lineTo(cx - 14 * s + i * 10 * s, cy - 14 * s);
      ctx.stroke();
    }
    ctx.restore();
  }
}

/* ---------- domain interiors (shared by cut-in + domain scene) ---------- */
function drawDomainInterior(d, t, o) {
  o = o || {};
  switch (d.interior) {
    case 'void404': {
      rect(0, 0, W, H, '#f2f6ff');
      // floating neon-green code strings
      ctx.save();
      for (let i = 0; i < 46; i++) {
        const x = ((i * 97 + (t * 40 | 0)) % (W + 80)) - 40;
        const y = ((i * 61 + (t * 90 * (i % 3 + 1) | 0)) % (H + 60)) - 30;
        const str = ['01001', 'NULL', '0x00', 'E404', 'FORMAT', 'rm -rf', '1010'][i % 7];
        text(str, x, y, { scale: 1 + (i % 2), color: '#00c47a', alpha: .55 });
      }
      // glitching wireframes
      ctx.globalAlpha = .4; ctx.strokeStyle = '#00ffa6'; ctx.lineWidth = 2;
      for (let i = 0; i < 7; i++) {
        const s = 40 + i * 52 + Math.sin(t * 2 + i) * 10;
        ctx.strokeRect(W / 2 - s, H / 2 - s * .7, s * 2, s * 1.4);
      }
      ctx.restore();
      // the giant unblinking digital eye
      const ex = W / 2, ey = o.clean ? 186 : 150;
      const bw = 150, bh = 92;
      ctx.save();
      ctx.globalAlpha = .9;
      ctx.fillStyle = '#e7f6ef';
      ctx.beginPath(); ctx.ellipse(ex, ey, bw, bh, 0, 0, TAU); ctx.fill();
      ctx.lineWidth = 6; ctx.strokeStyle = '#00c47a';
      ctx.beginPath(); ctx.ellipse(ex, ey, bw, bh, 0, 0, TAU); ctx.stroke();
      const look = Math.sin(t * .7) * 26;
      circle(ex + look, ey, 54, '#042a1c');
      circle(ex + look, ey, 46, '#00ffa6');
      circle(ex + look, ey, 22, '#021512');
      circle(ex + look - 12, ey - 12, 8, '#dfffe9');
      // scanning iris rings
      ctx.globalAlpha = .5; ctx.strokeStyle = '#00c47a'; ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const r = 24 + ((t * 40 + i * 20) % 44);
        ctx.beginPath(); ctx.arc(ex + look, ey, r, 0, TAU); ctx.stroke();
      }
      ctx.restore();
      // scanlines of green
      ctx.save(); ctx.globalAlpha = .12;
      for (let y = (t * 60 | 0) % 6; y < H; y += 6) rect(0, y, W, 2, '#00ffa6');
      ctx.restore();
      break;
    }
    case 'sandbox': {
      // retro 8-bit voxel engine world
      rect(0, 0, W, H, '#5ac8fa');
      dither(0, 0, W, H / 2, '#5ac8fa', '#9ce0ff', .1);
      // sun
      rect(W - 92, 40, 40, 40, '#ffe14d'); rect(W - 96, 44, 48, 32, '#ffe14d');
      // green grid ground
      const hy = H * .56;
      rect(0, hy, W, H - hy, '#3f9d3a');
      rect(0, hy, W, 6, '#6ddd5a');
      ctx.save(); ctx.globalAlpha = .5; ctx.strokeStyle = '#1d6b1a'; ctx.lineWidth = 1;
      for (let i = 0; i <= 16; i++) {
        const x = (i / 16) * W;
        line(x, hy, W / 2 + (x - W / 2) * 3.2, H, '#2a7a28', 1);
      }
      for (let i = 1; i < 10; i++) {
        const y = hy + Math.pow(i / 10, 2.4) * (H - hy);
        line(0, y, W, y, '#2a7a28', 1);
      }
      ctx.restore();
      // floating voxel blocks
      for (let i = 0; i < 16; i++) {
        const bx = ((i * 89 + (t * 24 | 0)) % (W + 70)) - 35;
        const by = 60 + ((i * 53) % 200) + Math.sin(t * 1.6 + i) * 14;
        const s = 20 + (i % 3) * 10;
        const cols = [['#8a5a2a', '#6b4320'], ['#7a7a7a', '#5a5a5a'], ['#3f9d3a', '#2a7a28'], ['#c9a227', '#9a7a18']][i % 4];
        rect(bx, by, s, s, cols[0]); rect(bx, by, s, 4, '#ffffff44');
        rect(bx, by + s - 5, s, 5, cols[1]); frameRect(bx, by, s, s, '#00000055', 2);
      }
      // floating UI menus (decorative - cut-in only)
      if (!o.clean) for (let i = 0; i < 3; i++) {
        const mx = 40 + i * 190, my = 300 + Math.sin(t * 1.2 + i * 2) * 10;
        rect(mx, my, 150, 56, '#0b1424dd'); frameRect(mx, my, 150, 56, '#3ddcff', 2);
        rect(mx + 4, my + 4, 142, 10, '#1d3157');
        text(['world.gravity', 'player.speed', 'render.dist'][i], mx + 6, my + 5, { scale: 1, color: '#9fe8ff' });
        for (let j = 0; j < 3; j++) {
          rect(mx + 6, my + 19 + j * 11, 138, 9, j === 1 ? '#ff8c00' : '#13213a');
          text(['= false', '= 1000%', '= 0'][j], mx + 10, my + 20 + j * 11, { scale: 1, color: j === 1 ? '#140800' : '#6f85a8' });
        }
      }
      // health bars floating (decorative - cut-in only)
      if (!o.clean) for (let i = 0; i < 2; i++) {
        const hx = W - 180, hy2 = 90 + i * 34;
        rect(hx, hy2, 150, 14, '#0b1424cc'); frameRect(hx, hy2, 150, 14, '#fff', 1);
        rect(hx + 2, hy2 + 2, 146 * (i ? .2 : 1), 10, i ? '#ff3b3b' : '#00ffa6');
      }
      break;
    }
    case 'shrine': {
      rect(0, 0, W, H, '#140d14');
      dither(0, 0, W, H, '#140d14', '#2a1b22', .2);
      // skull / shrine silhouette
      const sx = W / 2, sy = H * .52;
      ctx.save();
      rect(sx - 150, sy - 30, 300, 180, '#1f1017');
      rect(sx - 170, sy - 44, 340, 18, '#2d1820');
      rect(sx - 120, sy - 150, 240, 120, '#241219');
      // torii-ish beams
      for (let i = 0; i < 5; i++) rect(sx - 110 + i * 48, sy - 30, 14, 170, '#140a10');
      // bones / teeth
      for (let i = 0; i < 9; i++) rect(sx - 130 + i * 30, sy - 46, 16, 26, '#d9c7b0');
      // the shrine's "mouth"
      rect(sx - 70, sy - 130, 140, 90, '#0a0508');
      circle(sx - 34, sy - 92, 14, '#ff3b3b'); circle(sx + 34, sy - 92, 14, '#ff3b3b');
      ctx.restore();
      // falling slash rain
      ctx.save(); ctx.globalAlpha = .75;
      for (let i = 0; i < 34; i++) {
        const px = ((i * 71 + (t * 520 | 0)) % (W + 120)) - 60;
        const py = ((i * 97 + (t * 900 | 0)) % (H + 160)) - 80;
        line(px, py, px + 34, py + 54, '#ff5a5a', 2);
        line(px + 6, py, px + 40, py + 54, '#8c0f0f', 1);
      }
      ctx.restore();
      break;
    }
    case 'infinitevoid': {
      rect(0, 0, W, H, '#01010a');
      for (let i = 0; i < 240; i++) {
        const a = i * 2.39996, r = Math.sqrt(i / 240) * 420;
        const px = W / 2 + Math.cos(a + t * .2) * r, py = H / 2 + Math.sin(a + t * .2) * r * .7;
        rect(px, py, 1 + (i % 3 === 0 ? 1 : 0), 1 + (i % 3 === 0 ? 1 : 0), i % 7 ? '#cfd8ff' : '#9b4dff');
      }
      ctx.save(); ctx.globalAlpha = .5;
      for (let i = 0; i < 5; i++) {
        const r = 60 + i * 70 + Math.sin(t * 1.1 + i) * 16;
        ctx.strokeStyle = '#6b4dff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(W / 2, H / 2, r, r * .55, t * .3 + i, 0, TAU); ctx.stroke();
      }
      ctx.restore();
      circle(W / 2, H / 2, 46, '#0a0820'); circle(W / 2, H / 2, 40, '#2a1b6b');
      circle(W / 2, H / 2, 22, '#d9d2ff');
      break;
    }
    case 'selfembodiment': {
      rect(0, 0, W, H, '#2a1a1a');
      dither(0, 0, W, H, '#2a1a1a', '#4a2a28', .25);
      for (let i = 0; i < 26; i++) {
        const hx = ((i * 83) % W), hy = ((i * 127) % H);
        const s = 22 + (i % 4) * 10, wob = Math.sin(t * 2 + i) * 4;
        // crude hand: palm + 4 fingers
        rect(hx, hy + wob, s, s * .8, '#d8a98a');
        for (let f = 0; f < 4; f++) rect(hx + 2 + f * (s / 4.4), hy - s * .5 + wob, s / 6, s * .55, '#e8bd9c');
        rect(hx, hy + s * .8 + wob, s, 4, '#a87a60');
      }
      break;
    }
    default:
      rect(0, 0, W, H, d.bg || '#000');
  }
}

/* ---------- domain definitions ---------- */
const DOMAINS = {
  sandbox: {
    id: 'sandbox', name: 'Sandbox Mode: Developer Tools',
    kanji: '箱庭', sub: 'SANDBOX MODE : DEVELOPER TOOLS',
    jp: 'サンドボックス・モード: 開発者ツール',
    effect: 'ADMIN PRIVILEGES OVER ALL RULES OF THIS SPACE',
    barrier: 'CLOSED', sign: 'tv', signName: 'HAND SIGN: RETRO SCREEN',
    accent: '#3ddcff', accent2: '#ffe14d', accentD: '#0a4a66',
    interior: 'sandbox', vox: true, music: 'sandbox'
  },
  void404: {
    id: 'void404', name: 'Error 404: Cosmos Format',
    kanji: '宇宙初期化', sub: 'ERROR 404 : COSMOS FORMAT',
    jp: 'エラー404: 宇宙初期化',
    effect: 'SURE-HIT NULL INJECTION — 3s SENSES / 10s TECHNIQUE / 30s BODY',
    barrier: 'CLOSED', sign: 'power', signName: 'HAND SIGN: POWER BUTTON',
    accent: '#00ffa6', accent2: '#ffffff', accentD: '#00603f',
    interior: 'void404', music: 'void404'
  },
  shrine: {
    id: 'shrine', name: 'Malevolent Shrine',
    kanji: '伏魔御廚子', sub: 'MALEVOLENT SHRINE',
    jp: '伏魔御廚子',
    effect: 'INFINITE CLEAVE & DISMANTLE — NO BARRIER NEEDED',
    barrier: 'OPEN', sign: 'shrine', signName: 'HAND SIGN: SHRINE',
    accent: '#ff3b3b', accent2: '#ffd24a', accentD: '#5c0a0a',
    interior: 'shrine', music: 'sukuna'
  },
  infinitevoid: {
    id: 'infinitevoid', name: 'Unlimited Void',
    kanji: '無量空処', sub: 'UNLIMITED VOID',
    jp: '無量空処',
    effect: 'INFINITE INFORMATION — TARGET CANNOT ACT',
    barrier: 'CLOSED', sign: 'onehand', signName: 'HAND SIGN: ONE-HANDED',
    accent: '#9b4dff', accent2: '#cfd8ff', accentD: '#2a1b6b',
    interior: 'infinitevoid', music: 'domain'
  },
  selfembodiment: {
    id: 'selfembodiment', name: 'Self-Embodiment of Perfection',
    kanji: '自閉円頓裹', sub: 'SELF-EMBODIMENT OF PERFECTION',
    jp: '自閉円頓裹',
    effect: 'SURE-HIT IDLE TRANSFIGURATION ON THE SOUL',
    barrier: 'CLOSED', sign: 'hands', signName: 'HAND SIGN: INTERLOCKED',
    accent: '#ff9ec4', accent2: '#ffffff', accentD: '#6b2a3a',
    interior: 'selfembodiment', music: 'domain'
  }
};
