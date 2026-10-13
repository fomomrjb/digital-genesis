/* ===========================================================
   DIGITAL GENESIS — dialogue.js
   Undertale-style typewriter box, portraits, choices
   Script line forms:
     ['kenji', 'text...']            speaker + text
     {who,t,face,col,shake,wave,sfx}
     {choice:[{t,go|fn}], q:'question'}
     {fn: () => {...}}               instant side-effect
     {wait: 0.6}
   =========================================================== */
'use strict';

const SPEAKERS = {
  kenji:   { name: 'KENJI',    spr: 'kenji',      col: '#9fe8ff', voice: 'blip' },
  orange:  { name: 'ORANGE',   spr: 'orange',     col: '#ff8c00', voice: 'orangetalk' },
  gojo:    { name: 'GOJO',     spr: 'gojo',       col: '#e8ecf7', voice: 'blip2' },
  gojoe:   { name: 'GOJO',     spr: 'gojoEyes',   col: '#8ef0ff', voice: 'blip2' },
  sukuna:  { name: 'SUKUNA',   spr: 'sukuna',     col: '#ff3b3b', voice: 'blip2' },
  mahito:  { name: 'MAHITO',   spr: 'mahito',     col: '#dfe8ef', voice: 'blip2' },
  yuji:    { name: 'YUJI',     spr: 'yuji',       col: '#ff8fa3', voice: 'blip' },
  megumi:  { name: 'MEGUMI',   spr: 'megumi',     col: '#9ab8ff', voice: 'blip2' },
  nobara:  { name: 'NOBARA',   spr: 'nobara',     col: '#ffc08a', voice: 'blip' },
  nanami:  { name: 'NANAMI',   spr: 'nanami',     col: '#e3c98a', voice: 'blip2' },
  todo:    { name: 'TODO',     spr: 'yuji',       col: '#ffd24a', voice: 'blip2' },
  hanami:  { name: 'HANAMI',   spr: 'hanami',     col: '#7ba85f', voice: 'blip2' },
  jogo:    { name: 'JOGO',     spr: 'jogo',       col: '#ff7a2a', voice: 'blip2' },
  dagon:   { name: 'DAGON',    spr: 'dagon',      col: '#7fd9e8', voice: 'blip2' },
  kenjaku: { name: '???',      spr: 'kenjaku',    col: '#c9a24a', voice: 'blip2' },
  ghost:   { name: 'KENJI',    spr: 'ghostface',  col: '#f2f2ee', voice: 'blip2' },
  sys:     { name: 'SYSTEM',   spr: null,         col: '#00ffa6', voice: 'typewriter' },
  narr:    { name: null,       spr: null,         col: '#cfe3ff', voice: 'typewriter' },
  curse:   { name: 'CURSE',    spr: 'curseBlob',  col: '#c79aff', voice: 'blip2' }
};

const Dlg = {
  active: false, lines: [], i: 0, chars: 0, done: false,
  cur: null, wrapped: [], speed: 2.4, timer: 0, onEnd: null,
  choice: null, choiceIdx: 0, waitT: 0, portraitT: 0,
  skipHeld: 0, boxY: 0, bigBox: false,

  start(lines, onEnd) {
    this.lines = lines.slice(); this.i = -1; this.active = true;
    this.onEnd = onEnd || null; this.choice = null; this.waitT = 0;
    this.next();
  },
  stop() { this.active = false; this.lines = []; this.cur = null; this.choice = null;
           const cb = this.onEnd; this.onEnd = null; if (cb) cb(); },

  next() {
    this.i++;
    if (this.i >= this.lines.length) { this.stop(); return; }
    let L = this.lines[this.i];
    if (Array.isArray(L)) L = { who: L[0], t: L[1], face: L[2] };
    if (typeof L === 'string') L = { who: 'narr', t: L };
    if (L.fn) { L.fn(); this.next(); return; }
    if (L.wait) { this.waitT = L.wait; this.cur = null; return; }
    if (L.choice) {
      this.choice = L; this.choiceIdx = 0;
      this.cur = { who: L.who || 'narr', t: L.q || '', col: null };
      this.wrapped = wrap(this.cur.t, 46); this.chars = 0; this.done = !this.cur.t;
      return;
    }
    this.cur = L; this.chars = 0; this.done = false; this.timer = 0;
    this.bigBox = !!L.big;
    this.wrapped = wrap(L.t || '', L.big ? 52 : 46);
    if (L.sfx) Audio.sfx(L.sfx);
    if (L.music) Audio.play(L.music);
  },

  totalChars() { return this.wrapped.reduce((a, l) => a + l.length, 0); },

  update(dt) {
    if (!this.active) return;
    this.portraitT += dt;
    if (this.waitT > 0) {
      this.waitT -= dt;
      if (this.waitT <= 0) this.next();
      return;
    }
    if (!this.cur) return;
    if (!this.done) {
      const fast = Input.isDown('ok') || Input.isDown('back');
      this.timer += dt * (fast ? 4.2 : 1) * G.textSpeed;
      const target = Math.floor(this.timer * 52 * this.speed / 2.4);
      while (this.chars < target && this.chars < this.totalChars()) {
        this.chars++;
        const sp = SPEAKERS[this.cur.who] || SPEAKERS.narr;
        if (this.chars % 2 === 0) Audio.sfx(this.cur.voice || sp.voice);
      }
      if (this.chars >= this.totalChars()) this.done = true;
    }
    if (this.choice && this.done) {
      const n = this.choice.choice.length;
      if (Input.just('up') || Input.just('left')) { this.choiceIdx = (this.choiceIdx + n - 1) % n; Audio.sfx('move'); }
      if (Input.just('down') || Input.just('right')) { this.choiceIdx = (this.choiceIdx + 1) % n; Audio.sfx('move'); }
      if (Input.just('ok')) {
        Audio.sfx('ok');
        const c = this.choice.choice[this.choiceIdx];
        this.choice = null;
        if (c.fn) c.fn();
        if (c.lines) { this.lines.splice(this.i + 1, 0, ...c.lines); }
        this.next();
      }
      return;
    }
    if (Input.just('ok') || Input.just('back')) {
      if (!this.done) { this.chars = this.totalChars(); this.done = true; }
      else this.next();
    }
  },

  draw() {
    if (!this.active || !this.cur) return;
    const sp = SPEAKERS[this.cur.who] || SPEAKERS.narr;
    const big = this.bigBox;
    const bw = big ? 600 : 560, bh = big ? 160 : 132;
    const bx = (W - bw) / 2, by = H - bh - 18;
    // box
    box(bx, by, bw, bh, { fill: '#05070e', edge: '#ffffff', t: 3 });
    frameRect(bx + 4, by + 4, bw - 8, bh - 8, '#1d2740', 1);
    // portrait
    let tx = bx + 18;
    if (sp.spr) {
      const pw = 86;
      rect(bx + 10, by + 10, pw, bh - 20, '#0b1020');
      frameRect(bx + 10, by + 10, pw, bh - 20, sp.col, 2);
      const u = 4;
      drawActor(sp.spr, bx + 10 + (pw - 16 * u) / 2, by + 16, u, { t: this.portraitT, dir: 0, angry: this.cur.face === 'angry' });
      tx = bx + 10 + pw + 14;
    }
    // name plate
    if (sp.name) {
      const nw = textW(sp.name, 2) + 12;
      rect(tx - 4, by - 10, nw, 18, '#05070e');
      frameRect(tx - 4, by - 10, nw, 18, sp.col, 2);
      text(sp.name, tx + 2, by - 6, { scale: 2, color: sp.col });
    }
    // text with reveal
    let left = this.chars, ty = by + 20;
    const col = this.cur.col || '#ffffff';
    for (let li = 0; li < this.wrapped.length; li++) {
      const l = this.wrapped[li];
      const shown = l.slice(0, Math.max(0, Math.min(l.length, left)));
      left -= l.length;
      if (shown.length) {
        text(shown, tx, ty, {
          scale: 2, color: col, shadow: '#000',
          wave: this.cur.wave ? this.portraitT * 7 + li : 0, waveAmp: 2
        });
      }
      ty += 22;
      if (left <= 0) break;
    }
    // choices
    if (this.choice && this.done) {
      const cs = this.choice.choice;
      const cy = by + bh - 10 - cs.length * 20;
      cs.forEach((c, i) => {
        const sel = i === this.choiceIdx;
        const y = cy + i * 20;
        if (sel) { text('→', tx - 2, y, { scale: 2, color: PAL.yellow }); }
        text(c.t, tx + 18, y, { scale: 2, color: sel ? PAL.yellow : '#8fa0bd', shadow: '#000' });
      });
    } else if (this.done) {
      const bl = Math.sin(this.portraitT * 7) > 0;
      if (bl) text('■', bx + bw - 26, by + bh - 24, { scale: 2, color: '#fff' });
    }
  }
};

/* quick helper: show a system toast line */
const Toast = {
  list: [],
  show(txt, col = PAL.orange, t = 2.6) { this.list.push({ txt, col, t, life: t }); Audio.sfx('select'); },
  update(dt) { for (let i = this.list.length - 1; i >= 0; i--) { this.list[i].t -= dt; if (this.list[i].t <= 0) this.list.splice(i, 1); } },
  draw() {
    this.list.forEach((o, i) => {
      const k = o.t / o.life;
      const a = k > .8 ? (1 - k) / .2 : (k < .25 ? k / .25 : 1);
      const w = textW(o.txt, 2) + 24, x = W - w - 14, y = 64 + i * 26;
      ctx.save(); ctx.globalAlpha = clamp(a, 0, 1);
      rect(x, y, w, 22, '#05070ecc'); frameRect(x, y, w, 22, o.col, 2);
      text(o.txt, x + 12, y + 7, { scale: 2, color: o.col });
      ctx.restore();
    });
  }
};
