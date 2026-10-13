/* ===========================================================
   DIGITAL GENESIS — audio.js
   Chiptune synth: pulse/tri/noise channels, tracker, SFX
   =========================================================== */
'use strict';

const NOTES = { C:0, 'C#':1, Db:1, D:2, 'D#':3, Eb:3, E:4, F:5, 'F#':6, Gb:6,
                G:7, 'G#':8, Ab:8, A:9, 'A#':10, Bb:10, B:11 };
function freq(n) {
  if (!n || n === 'r') return 0;
  const m = /^([A-G][#b]?)(-?\d)$/.exec(n);
  if (!m) return 0;
  return 440 * Math.pow(2, (NOTES[m[1]] + (+m[2] - 4) * 12 - 9) / 12);
}

const Audio = {
  ctx: null, master: null, musicGain: null, sfxGain: null,
  musicVol: 0.34, sfxVol: 0.42, muted: false,
  cur: null, nextTick: 0, step: 0, track: null, pending: null,
  noiseBuf: null, started: false,

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain(); this.master.gain.value = 1;
    this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain(); this.musicGain.gain.value = this.musicVol;
    this.sfxGain = this.ctx.createGain(); this.sfxGain.gain.value = this.sfxVol;
    this.musicGain.connect(this.master); this.sfxGain.connect(this.master);
    // noise buffer
    const len = this.ctx.sampleRate * 1.2;
    this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.started = true;
  },
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },

  /* ---- raw voice ---- */
  tone(f, dur, o = {}) {
    if (!this.ctx || this.muted || !f) return;
    const t = this.ctx.currentTime + (o.delay || 0);
    const g = this.ctx.createGain();
    const dest = o.sfx ? this.sfxGain : this.musicGain;
    const vol = (o.vol != null ? o.vol : .3);
    let osc;
    if (o.wave === 'noise') {
      osc = this.ctx.createBufferSource(); osc.buffer = this.noiseBuf; osc.loop = true;
      const bp = this.ctx.createBiquadFilter();
      bp.type = o.filter || 'bandpass'; bp.frequency.value = f || 1200; bp.Q.value = o.q || 1.2;
      osc.connect(bp); bp.connect(g);
    } else {
      osc = this.ctx.createOscillator();
      osc.type = o.wave || 'square';
      osc.frequency.setValueAtTime(f, t);
      if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.slideTo), t + dur);
      if (o.vib) {
        const lfo = this.ctx.createOscillator(), lg = this.ctx.createGain();
        lfo.frequency.value = o.vib; lg.gain.value = o.vibAmt || 6;
        lfo.connect(lg); lg.connect(osc.frequency); lfo.start(t); lfo.stop(t + dur + .1);
      }
      osc.connect(g);
    }
    const a = o.atk != null ? o.atk : .005;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + a);
    if (o.sustain) {
      g.gain.setValueAtTime(vol, t + dur * .7);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    } else {
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    }
    g.connect(dest);
    osc.start(t); osc.stop(t + dur + .05);
  },

  /* ---- SFX library ---- */
  sfx(name) {
    if (!this.ctx) return; this.resume();
    const S = { sfx: true };
    switch (name) {
      case 'blip': this.tone(1400, .035, { wave: 'square', vol: .10, ...S }); break;
      case 'blip2': this.tone(880, .03, { wave: 'triangle', vol: .09, ...S }); break;
      case 'move': this.tone(520, .05, { wave: 'square', vol: .14, ...S }); break;
      case 'ok': this.tone(660, .05, { wave: 'square', vol: .18, ...S });
                 this.tone(990, .08, { wave: 'square', vol: .16, delay: .05, ...S }); break;
      case 'cancel': this.tone(300, .09, { wave: 'square', vol: .16, slideTo: 150, ...S }); break;
      case 'deny': this.tone(170, .18, { wave: 'square', vol: .2, slideTo: 90, ...S }); break;
      case 'punch':
        this.tone(220, .07, { wave: 'square', vol: .22, slideTo: 70, ...S });
        this.tone(1800, .05, { wave: 'noise', vol: .16, ...S }); break;
      case 'swing': this.tone(2600, .08, { wave: 'noise', vol: .10, filter: 'highpass', ...S }); break;
      case 'hit':
        this.tone(140, .12, { wave: 'square', vol: .24, slideTo: 60, ...S });
        this.tone(900, .08, { wave: 'noise', vol: .18, ...S }); break;
      case 'crit':
        this.tone(1200, .05, { wave: 'square', vol: .22, ...S });
        this.tone(180, .22, { wave: 'square', vol: .26, slideTo: 60, delay: .03, ...S });
        this.tone(2400, .14, { wave: 'noise', vol: .2, delay: .02, ...S }); break;
      case 'hurt':
        this.tone(340, .16, { wave: 'square', vol: .22, slideTo: 110, ...S });
        this.tone(700, .1, { wave: 'noise', vol: .14, ...S }); break;
      case 'block':
        this.tone(1500, .07, { wave: 'square', vol: .16, slideTo: 2600, ...S });
        this.tone(3000, .06, { wave: 'noise', vol: .1, filter: 'highpass', ...S }); break;
      case 'dodge': this.tone(1800, .07, { wave: 'noise', vol: .09, filter: 'highpass', ...S }); break;
      case 'charge':
        for (let i = 0; i < 8; i++) this.tone(300 + i * 160, .1, { wave: 'square', vol: .07, delay: i * .055, ...S });
        break;
      case 'blackflash':
        // deep sub + reversed-ish swell + crack
        this.tone(55, .9, { wave: 'triangle', vol: .42, slideTo: 32, ...S });
        this.tone(120, .7, { wave: 'square', vol: .22, slideTo: 40, delay: .02, ...S });
        this.tone(2600, .5, { wave: 'noise', vol: .3, q: .6, ...S });
        for (let i = 0; i < 5; i++) this.tone(900 - i * 120, .18, { wave: 'square', vol: .16, delay: .1 + i * .06, ...S });
        break;
      case 'orangeflash':
        this.tone(44, 2.0, { wave: 'triangle', vol: .5, slideTo: 26, ...S });
        this.tone(3200, 1.4, { wave: 'noise', vol: .34, q: .5, ...S });
        for (let i = 0; i < 14; i++)
          this.tone(300 + i * 230, .4, { wave: 'square', vol: .13, delay: i * .07, ...S });
        this.tone(90, 1.2, { wave: 'square', vol: .3, slideTo: 1200, delay: .5, ...S });
        break;
      case 'domain':
        this.tone(70, 2.4, { wave: 'triangle', vol: .4, slideTo: 300, ...S });
        this.tone(40, 2.6, { wave: 'square', vol: .22, ...S });
        for (let i = 0; i < 12; i++)
          this.tone(200 + i * 90, 1.1, { wave: 'square', vol: .08, delay: i * .09, ...S });
        this.tone(1800, 2.0, { wave: 'noise', vol: .18, q: .4, delay: .3, ...S });
        break;
      case 'domainbreak':
        this.tone(900, .9, { wave: 'noise', vol: .34, ...S });
        this.tone(300, .8, { wave: 'square', vol: .3, slideTo: 40, ...S });
        for (let i = 0; i < 10; i++) this.tone(rnd(2400, 400), .1, { wave: 'square', vol: .1, delay: i * .07, ...S });
        break;
      case 'null':
        this.tone(1600, .3, { wave: 'square', vol: .18, slideTo: 60, ...S });
        this.tone(80, .25, { wave: 'triangle', vol: .2, delay: .05, ...S }); break;
      case 'glitch':
        for (let i = 0; i < 7; i++) this.tone(rnd(3000, 200), .04, { wave: 'square', vol: .12, delay: i * .035, ...S });
        break;
      case 'heal':
        [523, 659, 784, 1047].forEach((f, i) =>
          this.tone(f, .3, { wave: 'triangle', vol: .2, delay: i * .07, ...S })); break;
      case 'orangeheal':
        [392, 523, 659, 784, 1047, 1319].forEach((f, i) =>
          this.tone(f, .5, { wave: 'triangle', vol: .22, delay: i * .09, ...S }));
        this.tone(60, 1.2, { wave: 'triangle', vol: .2, slideTo: 200, ...S }); break;
      case 'levelup':
        [523, 659, 784, 1047, 1319, 1568].forEach((f, i) =>
          this.tone(f, .22, { wave: 'square', vol: .2, delay: i * .08, ...S })); break;
      case 'unlock':
        [330, 440, 554, 740].forEach((f, i) =>
          this.tone(f, .3, { wave: 'square', vol: .19, delay: i * .1, ...S }));
        this.tone(2000, .3, { wave: 'noise', vol: .08, delay: .3, ...S }); break;
      case 'coin':
        this.tone(1319, .06, { wave: 'square', vol: .16, ...S });
        this.tone(1760, .16, { wave: 'square', vol: .16, delay: .06, ...S }); break;
      case 'buy':
        [659, 880, 1319].forEach((f, i) => this.tone(f, .14, { wave: 'square', vol: .18, delay: i * .08, ...S })); break;
      case 'death':
        this.tone(400, 1.1, { wave: 'square', vol: .28, slideTo: 40, ...S });
        this.tone(200, 1.3, { wave: 'triangle', vol: .22, slideTo: 25, delay: .1, ...S }); break;
      case 'shatter':
        this.tone(2800, .5, { wave: 'noise', vol: .3, filter: 'highpass', ...S });
        for (let i = 0; i < 9; i++) this.tone(rnd(3400, 900), .12, { wave: 'square', vol: .09, delay: i * .05, ...S }); break;
      case 'warp':
        this.tone(200, .5, { wave: 'square', vol: .18, slideTo: 2400, ...S }); break;
      case 'teleport':
        this.tone(2400, .25, { wave: 'square', vol: .16, slideTo: 300, ...S });
        this.tone(300, .25, { wave: 'square', vol: .14, slideTo: 2400, delay: .12, ...S }); break;
      case 'select': this.tone(784, .07, { wave: 'square', vol: .18, ...S }); break;
      case 'typewriter': this.tone(1100 + rnd(240, -120), .02, { wave: 'square', vol: .07, ...S }); break;
      case 'orangetalk':
        this.tone(900 + rnd(400), .05, { wave: 'triangle', vol: .12, slideTo: 1500, ...S }); break;
      case 'bigslam':
        this.tone(60, .6, { wave: 'triangle', vol: .4, slideTo: 30, ...S });
        this.tone(1200, .3, { wave: 'noise', vol: .22, ...S }); break;
      case 'ghostface':
        this.tone(140, 1.4, { wave: 'triangle', vol: .3, slideTo: 60, ...S });
        this.tone(1800, 1.0, { wave: 'noise', vol: .14, q: .5, ...S });
        this.tone(330, .9, { wave: 'square', vol: .12, slideTo: 110, delay: .3, ...S }); break;
      case 'alarm':
        for (let i = 0; i < 4; i++) {
          this.tone(880, .18, { wave: 'square', vol: .18, delay: i * .36, ...S });
          this.tone(660, .18, { wave: 'square', vol: .18, delay: i * .36 + .18, ...S });
        } break;
    }
  },

  /* ---- music tracker ---- */
  play(name) {
    this.init(); this.resume();
    if (this.cur === name) return;
    this.cur = name; this.track = MUSIC[name] || null;
    this.step = 0; this.nextTick = this.ctx ? this.ctx.currentTime + .05 : 0;
  },
  stop() { this.cur = null; this.track = null; },
  update() {
    if (!this.ctx || !this.track || this.muted) return;
    const t = this.track, spb = 60 / t.bpm / 4; // 16th steps
    let guard = 0;
    while (this.nextTick < this.ctx.currentTime + .18 && guard++ < 64) {
      t.ch.forEach(c => {
        const pat = c.p, L = pat.length;
        const cell = pat[this.step % L];
        if (cell && cell[0] && cell[0] !== 'r') {
          const dur = (cell[1] || 1) * spb * .95;
          this.tone(freq(cell[0]) * (c.oct ? Math.pow(2, c.oct) : 1), dur, {
            wave: c.w, vol: (c.v != null ? c.v : .22) * (t.vol || 1),
            delay: this.nextTick - this.ctx.currentTime,
            vib: c.vib, vibAmt: c.vibAmt, sustain: c.sus, atk: c.atk,
            slideTo: cell[2] ? freq(cell[2]) : 0, q: c.q, filter: c.filter
          });
        }
      });
      this.step++; this.nextTick += spb;
      if (this.step >= (t.len || 64)) this.step = 0;
    }
  },
  setMusicVol(v) { this.musicVol = clamp(v, 0, 1); if (this.musicGain) this.musicGain.gain.value = this.musicVol; },
  setSfxVol(v) { this.sfxVol = clamp(v, 0, 1); if (this.sfxGain) this.sfxGain.gain.value = this.sfxVol; },
  toggleMute() { this.muted = !this.muted; if (this.master) this.master.gain.value = this.muted ? 0 : 1; return this.muted; }
};

/* ---- note helpers for writing patterns ---- */
const r_ = ['r', 1];
function P(str) { // "c4:2 e4 g4 r:4" -> cells
  const out = [];
  str.trim().split(/\s+/).forEach(tok => {
    const [n, l] = tok.split(':');
    const len = l ? +l : 1;
    const note = n === 'r' ? 'r' : n[0].toUpperCase() + n.slice(1);
    out.push([note, len]);
    for (let i = 1; i < len; i++) out.push(null);
  });
  return out;
}

const MUSIC = {
  /* ---- title: ominous retro, orange glow ---- */
  title: { bpm: 96, len: 64, vol: 1, ch: [
    { w: 'square', v: .17, p: P('a3:4 c4:2 e4:2 a4:4 g4:4 e4:2 d4:2 c4:4 r:4 f3:4 a3:2 c4:2 e4:4 d4:4 c4:2 a3:2 e3:4 r:4') },
    { w: 'triangle', v: .22, p: P('a2:8 f2:8 c3:8 g2:8 a2:8 f2:8 g2:8 e2:8') },
    { w: 'noise', v: .05, q: .8, p: P('c6:4 r:4 c6:4 r:4 c6:4 r:4 c6:2 c6:2 r:4') }
  ]},
  /* ---- jujutsu high: calm school ---- */
  high: { bpm: 104, len: 64, vol: 1, ch: [
    { w: 'triangle', v: .2, p: P('e4:2 g4:2 b4:4 a4:2 g4:2 e4:4 d4:2 e4:2 g4:4 b4:4 r:4 c5:2 b4:2 g4:4 e4:2 d4:2 e4:4 r:8 g4:2 a4:2 b4:4') },
    { w: 'square', v: .1, p: P('e3:4 b3:4 c4:4 g3:4 a3:4 e4:4 d4:4 b3:4 e3:4 b3:4 c4:4 g3:4 d3:4 a3:4 e3:4 b3:4') },
    { w: 'square', v: .08, p: P('e2:8 c2:8 a2:8 b2:8 e2:8 c2:8 d2:8 b2:8') }
  ]},
  /* ---- city overworld ---- */
  city: { bpm: 126, len: 64, vol: 1, ch: [
    { w: 'square', v: .15, p: P('d4:2 f4:2 a4:2 d5:2 c5:2 a4:2 f4:2 a4:2 g4:2 bb4:2 d5:2 g5:2 f5:2 d5:2 bb4:2 d5:2 c5:2 e5:2 g5:2 c6:2 bb5:2 g5:2 e5:2 g5:2 a4:4 d5:4 f5:4 a5:4') },
    { w: 'triangle', v: .2, p: P('d2:4 d2:4 g2:4 g2:4 c3:4 c3:4 a2:4 a2:4 d2:4 d2:4 g2:4 g2:4 bb2:4 bb2:4 a2:4 a2:4') },
    { w: 'noise', v: .07, p: P('c6:2 r:2 c6:2 c6:2 c6:2 r:2 c6:2 r:2 c6:2 r:2 c6:2 c6:2 c6:2 r:2 c6:2 r:2') }
  ]},
  /* ---- normal battle ---- */
  battle: { bpm: 158, len: 64, vol: 1, ch: [
    { w: 'square', v: .17, p: P('a4:2 a4:1 r:1 c5:2 e5:2 d5:2 c5:2 a4:2 g4:2 a4:2 c5:2 e5:4 r:2 g5:2 f5:2 e5:2 d5:2 c5:2 a4:2 e4:2 g4:2 a4:4 r:4 e5:2 d5:2 c5:2 b4:2 a4:4') },
    { w: 'square', v: .1, p: P('a3:2 e3:2 a3:2 c4:2 a3:2 e3:2 a3:2 c4:2 f3:2 c4:2 f3:2 a3:2 g3:2 d4:2 g3:2 b3:2 a3:2 e3:2 a3:2 c4:2 a3:2 e3:2 a3:2 c4:2 e3:2 b3:2 e3:2 g3:2 a3:4') },
    { w: 'triangle', v: .24, p: P('a1:2 a1:2 a1:2 a1:2 f1:2 f1:2 f1:2 f1:2 g1:2 g1:2 g1:2 g1:2 e1:2 e1:2 e1:2 e1:2') },
    { w: 'noise', v: .09, p: P('c6:2 c6:2 c7:2 c6:2 c6:2 c6:2 c7:2 c6:2') }
  ]},
  /* ---- boss battle ---- */
  boss: { bpm: 172, len: 64, vol: 1, ch: [
    { w: 'square', v: .18, p: P('d5:1 r:1 d5:1 r:1 f5:2 d5:2 a4:2 c5:2 d5:2 r:2 g5:2 f5:2 d5:2 c5:2 a4:2 bb4:2 c5:2 d5:4 r:2 a5:2 g5:2 f5:2 e5:2 d5:2 c5:2 d5:2 e5:2 f5:2 d5:4') },
    { w: 'square', v: .12, p: P('d3:1 d3:1 d3:1 d3:1 d3:1 d3:1 d3:1 d3:1 bb2:1 bb2:1 bb2:1 bb2:1 bb2:1 bb2:1 bb2:1 bb2:1 c3:1 c3:1 c3:1 c3:1 c3:1 c3:1 c3:1 c3:1 a2:1 a2:1 a2:1 a2:1 a2:1 a2:1 a2:1 a2:1') },
    { w: 'triangle', v: .26, p: P('d1:2 d1:2 d1:1 d1:1 d1:2 bb0:2 bb0:2 c1:2 c1:2 a0:2 a0:2 a0:2') },
    { w: 'noise', v: .11, p: P('c6:1 c6:1 c7:2 c6:1 c6:1 c6:2 c7:2 c6:2') }
  ]},
  /* ---- sukuna / king of curses ---- */
  sukuna: { bpm: 84, len: 64, vol: 1, ch: [
    { w: 'square', v: .18, p: P('d4:4 eb4:2 d4:2 bb3:4 d4:4 g4:4 f4:2 eb4:2 d4:8 r:4 bb4:4 a4:2 g4:2 f4:4 eb4:4 d4:8 r:4') },
    { w: 'triangle', v: .3, p: P('d1:8 d1:8 eb1:8 eb1:8 d1:8 d1:8 bb0:8 c1:8') },
    { w: 'noise', v: .08, q: .5, p: P('c5:8 r:8 c5:8 r:8 c5:4 c5:4 r:8 c5:8 r:8') }
  ]},
  /* ---- domain expansion ---- */
  domain: { bpm: 70, len: 64, vol: 1, ch: [
    { w: 'triangle', v: .28, p: P('c2:16 g1:16 ab1:16 bb1:16') },
    { w: 'square', v: .13, vib: 5, vibAmt: 4, p: P('c5:8 eb5:4 g5:4 ab5:8 g5:8 eb5:4 c5:4 bb4:8 c5:8 g4:8 ab4:8') },
    { w: 'square', v: .07, p: P('c4:4 eb4:4 g4:4 c5:4 bb4:4 g4:4 eb4:4 c4:4 ab4:4 c5:4 eb5:4 ab5:4 g5:4 eb5:4 c5:4 g4:4') }
  ]},
  /* ---- sandbox mode domain (hyper 8-bit) ---- */
  sandbox: { bpm: 168, len: 64, vol: 1, ch: [
    { w: 'square', v: .16, p: P('c5:1 e5:1 g5:1 c6:1 g5:1 e5:1 c5:1 e5:1 d5:1 f5:1 a5:1 d6:1 a5:1 f5:1 d5:1 f5:1 e5:1 g5:1 b5:1 e6:1 b5:1 g5:1 e5:1 g5:1 f5:1 a5:1 c6:1 f6:1 c6:1 a5:1 f5:1 a5:1 g5:2 e5:2 c5:2 e5:2 g5:2 b5:2 c6:4') },
    { w: 'triangle', v: .24, p: P('c2:2 c2:2 g2:2 c2:2 d2:2 d2:2 a2:2 d2:2 e2:2 e2:2 b2:2 e2:2 f2:2 f2:2 c3:2 f2:2') },
    { w: 'noise', v: .1, p: P('c6:2 c6:1 c6:1 c7:2 c6:2') }
  ]},
  /* ---- error 404 (white void) ---- */
  void404: { bpm: 60, len: 64, vol: 1, ch: [
    { w: 'triangle', v: .3, p: P('a1:16 a1:16 ab1:16 g1:16') },
    { w: 'square', v: .09, vib: 3, vibAmt: 8, p: P('a4:16 e5:8 f5:8 e5:16 c5:8 b4:8') },
    { w: 'noise', v: .05, q: .3, p: P('c4:16 c4:16 c4:16 c4:16') }
  ]},
  /* ---- orange theme (goofy hype) ---- */
  orange: { bpm: 150, len: 64, vol: 1, ch: [
    { w: 'square', v: .18, p: P('g4:2 g4:1 r:1 b4:2 d5:2 g5:2 d5:2 b4:2 c5:2 c5:1 r:1 e5:2 g5:2 c6:2 g5:2 e5:2 a4:2 c5:2 e5:2 a5:2 g5:2 e5:2 c5:2 a4:2 d5:4 g5:4 b5:4 d6:4') },
    { w: 'triangle', v: .22, p: P('g2:4 g2:4 c3:4 c3:4 a2:4 a2:4 d3:4 d3:4 g2:4 g2:4 c3:4 c3:4 d3:4 d3:4 g2:4 g2:4') },
    { w: 'noise', v: .09, p: P('c6:2 r:2 c6:2 c7:2') }
  ]},
  /* ---- shibuya / horror ---- */
  shibuya: { bpm: 112, len: 64, vol: 1, ch: [
    { w: 'triangle', v: .26, p: P('e2:8 e2:8 f2:8 e2:8 d2:8 e2:8 bb1:8 e2:8') },
    { w: 'square', v: .11, p: P('e4:4 f4:2 e4:2 b3:4 e4:4 g4:4 f4:2 e4:2 b3:8 r:8 e4:4 bb4:4 a4:4 e4:4') },
    { w: 'noise', v: .07, q: .6, p: P('c5:4 r:4 c5:4 r:4 c5:2 c5:2 r:4 c5:4 r:4') }
  ]},
  /* ---- victory ---- */
  win: { bpm: 150, len: 32, vol: 1, ch: [
    { w: 'square', v: .2, p: P('c5:2 e5:2 g5:2 c6:4 g5:2 c6:6 r:8 e5:2 g5:2 c6:2 e6:4 c6:2 e6:6') },
    { w: 'triangle', v: .22, p: P('c3:4 c3:4 g2:4 c3:4 e3:4 e3:4 c3:4 c3:4') }
  ]},
  /* ---- game over ---- */
  over: { bpm: 72, len: 32, vol: 1, ch: [
    { w: 'triangle', v: .26, p: P('a3:4 g3:4 f3:4 e3:8 d3:4 c3:8') },
    { w: 'square', v: .1, p: P('a2:8 f2:8 d2:8 c2:8') }
  ]},
  /* ---- culling game announcement ---- */
  culling: { bpm: 90, len: 64, vol: 1, ch: [
    { w: 'triangle', v: .3, p: P('d2:4 d2:4 d2:4 d2:4 eb2:4 eb2:4 d2:4 d2:4 bb1:4 bb1:4 c2:4 c2:4 d2:8 d2:8') },
    { w: 'square', v: .14, p: P('d5:4 r:4 f5:4 r:4 eb5:4 r:4 d5:4 r:4 bb4:4 d5:4 f5:4 bb5:4 a5:8 r:8') },
    { w: 'noise', v: .1, q: .4, p: P('c6:4 r:12 c6:4 r:12 c6:4 r:12 c6:4 c6:4 c6:4 r:4') }
  ]},
  /* ---- shop ---- */
  shop: { bpm: 132, len: 64, vol: 1, ch: [
    { w: 'square', v: .15, p: P('f4:2 a4:2 c5:2 f5:2 e5:2 c5:2 a4:2 c5:2 d5:2 f5:2 a5:2 d6:2 c6:2 a5:2 f5:2 a5:2 g4:2 bb4:2 d5:2 g5:2 f5:2 d5:2 bb4:2 d5:2 c5:4 e5:4 g5:4 c6:4') },
    { w: 'triangle', v: .2, p: P('f2:4 f2:4 d2:4 d2:4 g2:4 g2:4 c3:4 c3:4 f2:4 f2:4 d2:4 d2:4 g2:4 g2:4 c3:4 c3:4') }
  ]}
};
