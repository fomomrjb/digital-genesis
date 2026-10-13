/* ===========================================================
   DIGITAL GENESIS — util.js
   Core helpers: 5x7 bitmap font, input, math, canvas plumbing
   =========================================================== */
'use strict';

const W = 640, H = 480;
const cv = document.getElementById('game');
const ctx = cv.getContext('2d', { alpha: false });
ctx.imageSmoothingEnabled = false;

/* ---------- math ---------- */
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a = 1, b = 0) => Math.random() * (a - b) + b;
const rndi = (a, b = 0) => Math.floor(rnd(a, b));
const pick = arr => arr[rndi(arr.length)];
const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
const sign = v => v < 0 ? -1 : v > 0 ? 1 : 0;
const approach = (v, t, s) => v < t ? Math.min(v + s, t) : Math.max(v - s, t);
const TAU = Math.PI * 2;
function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
function circleRect(cx, cy, r, rx, ry, rw, rh) {
  const nx = clamp(cx, rx, rx + rw), ny = clamp(cy, ry, ry + rh);
  return (cx - nx) ** 2 + (cy - ny) ** 2 < r * r;
}
function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

/* ---------- 5x7 bitmap font ---------- */
const GLYPH = {
  'A':[14,17,17,31,17,17,17],'B':[30,17,17,30,17,17,30],'C':[14,17,16,16,16,17,14],
  'D':[30,17,17,17,17,17,30],'E':[31,16,16,30,16,16,31],'F':[31,16,16,30,16,16,16],
  'G':[14,17,16,23,17,17,14],'H':[17,17,17,31,17,17,17],'I':[31,4,4,4,4,4,31],
  'J':[7,2,2,2,2,18,12],'K':[17,18,20,24,20,18,17],'L':[16,16,16,16,16,16,31],
  'M':[17,27,21,21,17,17,17],'N':[17,25,21,19,17,17,17],'O':[14,17,17,17,17,17,14],
  'P':[30,17,17,30,16,16,16],'Q':[14,17,17,17,21,18,13],'R':[30,17,17,30,20,18,17],
  'S':[15,16,16,14,1,1,30],'T':[31,4,4,4,4,4,4],'U':[17,17,17,17,17,17,14],
  'V':[17,17,17,17,17,10,4],'W':[17,17,17,21,21,27,17],'X':[17,17,10,4,10,17,17],
  'Y':[17,17,10,4,4,4,4],'Z':[31,1,2,4,8,16,31],
  'a':[0,0,14,1,15,17,15],'b':[16,16,30,17,17,17,30],'c':[0,0,14,17,16,17,14],
  'd':[1,1,15,17,17,17,15],'e':[0,0,14,17,31,16,14],'f':[6,9,8,28,8,8,8],
  'g':[0,15,17,17,15,1,14],'h':[16,16,30,17,17,17,17],'i':[4,0,4,4,4,4,4],
  'j':[2,0,2,2,2,18,12],'k':[16,16,18,20,24,20,18],'l':[12,4,4,4,4,4,14],
  'm':[0,0,26,21,21,21,21],'n':[0,0,30,17,17,17,17],'o':[0,0,14,17,17,17,14],
  'p':[0,0,30,17,17,30,16],'q':[0,0,15,17,17,15,1],'r':[0,0,13,18,16,16,16],
  's':[0,0,15,16,14,1,30],'t':[8,8,28,8,8,9,6],'u':[0,0,17,17,17,17,15],
  'v':[0,0,17,17,17,10,4],'w':[0,0,17,17,21,21,10],'x':[0,0,17,10,4,10,17],
  'y':[0,0,17,17,15,1,14],'z':[0,0,31,2,4,8,31],
  '0':[14,17,19,21,25,17,14],'1':[4,12,4,4,4,4,31],'2':[14,17,1,2,4,8,31],
  '3':[31,2,4,2,1,17,14],'4':[2,6,10,18,31,2,2],'5':[31,16,30,1,1,17,14],
  '6':[6,8,16,30,17,17,14],'7':[31,1,2,4,8,8,8],'8':[14,17,17,14,17,17,14],
  '9':[14,17,17,15,1,2,12],
  ' ':[0,0,0,0,0,0,0],'.':[0,0,0,0,0,12,12],',':[0,0,0,0,12,4,8],
  '!':[4,4,4,4,4,0,4],'?':[14,17,1,6,4,0,4],"'":[4,4,0,0,0,0,0],
  '"':[10,10,0,0,0,0,0],'-':[0,0,0,31,0,0,0],'+':[0,4,4,31,4,4,0],
  ':':[0,12,12,0,12,12,0],';':[0,12,12,0,12,4,8],'/':[1,2,2,4,8,8,16],
  '\\':[16,8,8,4,2,2,1],'(':[2,4,8,8,8,4,2],')':[8,4,2,2,2,4,8],
  '[':[14,8,8,8,8,8,14],']':[14,2,2,2,2,2,14],'<':[1,2,4,8,4,2,1],
  '>':[16,8,4,2,4,8,16],'=':[0,31,0,0,31,0,0],'*':[0,10,4,31,4,10,0],
  '%':[17,2,2,4,8,8,17],'#':[10,31,10,10,31,10,0],'$':[4,15,20,14,5,30,4],
  '&':[12,18,20,8,21,18,13],'@':[14,17,23,21,23,16,14],'^':[4,10,17,0,0,0,0],
  '_':[0,0,0,0,0,0,31],'|':[4,4,4,4,4,4,4],'~':[0,0,9,21,18,0,0],
  '{':[6,4,4,12,4,4,6],'}':[12,4,4,6,4,4,12],
  '←':[0,4,8,31,8,4,0],'→':[0,4,2,31,2,4,0],
  '↑':[4,14,21,4,4,4,0],'↓':[0,4,4,21,14,4,0],
  '♥':[0,10,31,31,14,4,0],'★':[4,4,31,14,10,17,0],
  '■':[0,14,14,14,14,0,0],'°':[4,10,4,0,0,0,0],
  '—':[0,0,0,31,0,0,0],'–':[0,0,0,31,0,0,0],'·':[0,0,0,12,12,0,0],
  '∞':[0,0,27,21,27,0,0],'…':[0,0,0,0,0,0,21],
  '‘':[4,8,0,0,0,0,0],'’':[4,2,0,0,0,0,0],
  '“':[10,20,0,0,0,0,0],'”':[10,5,0,0,0,0,0]
};
const CW = 6, CH = 8; // advance incl. 1px gap

/* Draw bitmap text. opts: {scale,color,shadow,wave,waveAmp,alpha,maxW} */
function text(str, x, y, opts = {}) {
  const s = opts.scale || 1, col = opts.color || '#fff';
  const sh = opts.shadow, wave = opts.wave, amp = opts.waveAmp || 2;
  if (opts.alpha != null) { ctx.save(); ctx.globalAlpha = opts.alpha; }
  str = String(str);
  let cx = x;
  for (let i = 0; i < str.length; i++) {
    const g = GLYPH[str[i]] || GLYPH[str[i].toUpperCase()] || GLYPH['?'];
    let oy = 0;
    if (wave) oy = Math.round(Math.sin(wave + i * 0.5) * amp);
    for (let r = 0; r < 7; r++) {
      const row = g[r]; if (!row) continue;
      for (let c = 0; c < 5; c++) {
        if (row & (16 >> c)) {
          const px = cx + c * s, py = y + (r + oy) * s;
          if (sh) { ctx.fillStyle = sh; ctx.fillRect(px + s, py + s, s, s); }
          ctx.fillStyle = col; ctx.fillRect(px, py, s, s);
        }
      }
    }
    cx += CW * s;
  }
  if (opts.alpha != null) ctx.restore();
  return cx - x;
}
const textW = (str, s = 1) => String(str).length * CW * s;
function textC(str, cx, y, opts = {}) {
  const s = opts.scale || 1;
  return text(str, Math.round(cx - textW(str, s) / 2), y, opts);
}
/* word-wrap into array of lines */
function wrap(str, maxChars) {
  const out = [];
  String(str).split('\n').forEach(para => {
    const words = para.split(' '); let line = '';
    words.forEach(w => {
      if (!line.length) { line = w; }
      else if ((line + ' ' + w).length <= maxChars) { line += ' ' + w; }
      else { out.push(line); line = w; }
    });
    out.push(line);
  });
  return out;
}

/* ---------- drawing helpers ---------- */
function rect(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x | 0, y | 0, w | 0, h | 0); }
function frameRect(x, y, w, h, c, t = 1) {
  ctx.fillStyle = c;
  ctx.fillRect(x | 0, y | 0, w | 0, t); ctx.fillRect(x | 0, (y + h - t) | 0, w | 0, t);
  ctx.fillRect(x | 0, y | 0, t, h | 0); ctx.fillRect((x + w - t) | 0, y | 0, t, h | 0);
}
/* classic 8-bit windowed box */
function box(x, y, w, h, o = {}) {
  const fill = o.fill || '#000', edge = o.edge || '#fff';
  rect(x, y, w, h, fill);
  frameRect(x, y, w, h, edge, o.t || 3);
  if (o.inner) frameRect(x + 5, y + 5, w - 10, h - 10, o.inner, 1);
}
function line(x1, y1, x2, y2, c, t = 1) {
  ctx.strokeStyle = c; ctx.lineWidth = t; ctx.beginPath();
  ctx.moveTo(x1 + .5 | 0, y1 + .5 | 0); ctx.lineTo(x2 + .5 | 0, y2 + .5 | 0); ctx.stroke();
}
function circle(x, y, r, c, fill = true) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU);
  if (fill) { ctx.fillStyle = c; ctx.fill(); } else { ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.stroke(); }
}
/* gradient-free dither fill used for retro skies */
function dither(x, y, w, h, c1, c2, bias = .5) {
  rect(x, y, w, h, c1); ctx.fillStyle = c2;
  for (let py = 0; py < h; py += 2) for (let px = (py / 2 % 2) * 2; px < w; px += 4) {
    if (py / h > bias) ctx.fillRect(x + px, y + py, 2, 2);
  }
}

/* ---------- input ---------- */
const Input = {
  down: {}, pressed: {}, released: {}, anyKey: false, lockUntil: 0,
  map: {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right',
    KeyZ: 'ok', Enter: 'ok', Space: 'ok', NumpadEnter: 'ok',
    KeyX: 'back', ShiftLeft: 'back', ShiftRight: 'back', Escape: 'esc', Backspace: 'back',
    KeyC: 'menu', ControlLeft: 'menu', KeyB: 'emote', KeyQ: 'prev', KeyE: 'next',
    KeyR: 'dash', ShiftRight2: 'dash', KeyV: 'special', KeyF: 'fs', Tab: 'tab',
    Digit1: 'n1', Digit2: 'n2', Digit3: 'n3', Digit4: 'n4', Digit5: 'n5',
    Digit6: 'n6', Digit7: 'n7', Digit8: 'n8', Digit9: 'n9', Digit0: 'n0'
  },
  isDown(a) { return !!this.down[a]; },
  just(a) { return !!this.pressed[a]; },
  frameEnd() { this.pressed = {}; this.released = {}; this.anyKey = false; },
  clear() { this.down = {}; this.pressed = {}; }
};
addEventListener('keydown', e => {
  if (window.ChatConsole && ChatConsole.open) return;        // chat eats input
  const a = Input.map[e.code];
  if (e.code === 'Slash' && !e.repeat) { if (window.ChatConsole) ChatConsole.show(); e.preventDefault(); return; }
  if (!a) return;
  e.preventDefault();
  if (!e.repeat) { Input.pressed[a] = true; Input.anyKey = true; }
  Input.down[a] = true;
}, { passive: false });
addEventListener('keyup', e => {
  const a = Input.map[e.code]; if (!a) return;
  Input.down[a] = false; Input.released[a] = true;
});
addEventListener('blur', () => Input.clear());

/* fullscreen on F */
function toggleFS() {
  const el = document.getElementById('screenwrap');
  if (!document.fullscreenElement) el.requestFullscreen?.().catch(() => {});
  else document.exitFullscreen?.();
}

/* ---------- simple tween/timer bag ---------- */
class Timers {
  constructor() { this.list = []; }
  after(sec, fn) { this.list.push({ t: sec, fn }); }
  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const o = this.list[i]; o.t -= dt;
      if (o.t <= 0) { this.list.splice(i, 1); o.fn(); }
    }
  }
  clear() { this.list.length = 0; }
}
const timers = new Timers();

/* ---------- palette ---------- */
const PAL = {
  orange: '#ff8c00', orange2: '#ffb347', orangeD: '#b25a00',
  cyan: '#3ddcff', green: '#00ffa6', greenD: '#00b374',
  purple: '#9b4dff', purple2: '#d9a2ff', pink: '#ff4fa3',
  red: '#ff3b3b', redD: '#8c0f0f', blood: '#c1121f',
  white: '#ffffff', ink: '#05060a', night: '#0b1020',
  gray: '#6a7893', grayD: '#39455c', yellow: '#ffe14d',
  skin: '#f6c9a0', skinD: '#c98f66', hair: '#2b2f3f',
  uniform: '#141a2b', uniform2: '#232c45', gold: '#ffd24a'
};
