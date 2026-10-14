/* ===========================================================
   DIGITAL GENESIS — sprites.js
   Procedural pixel-art actors drawn on an integer pixel grid.
   Every actor is 16x22 "pixels"; `u` scales them up crisply.
   =========================================================== */
'use strict';

/* pixel plotter bound to an origin + unit */
function PX(ox, oy, u) {
  return (c, r, w, h, col) => {
    if (!col) return;
    ctx.fillStyle = col;
    ctx.fillRect(ox + c * u, oy + r * u, (w || 1) * u, (h || 1) * u);
  };
}

/* ---------- character definitions ---------- */
const CHARS = {
  kenji: { kind: 'human', hair: '#2b3350', hair2: '#1a2038', style: 'spiky',
    skin: '#f6c9a0', skin2: '#d49a73', eye: '#4de2ff', top: '#1b2238', top2: '#111726',
    trim: '#ff8c00', pants: '#232c45', shoes: '#0d1120', acc: 'console', hood: true },
  kenjiOrangeSkin: { kind: 'human', hair: '#2b3350', hair2: '#1a2038', style: 'spiky',
    skin: '#f6c9a0', skin2: '#d49a73', eye: '#ffb347', top: '#ff8c00', top2: '#b25a00',
    trim: '#fff3d6', pants: '#3a2206', shoes: '#1a0f02', acc: 'console', hood: true },
  ghostface: { kind: 'ghostface' },
  purpleguy: { kind: 'human', hair: '#3a2a52', hair2: '#241636', style: 'flat',
    skin: '#6b4fa0', skin2: '#4a3273', eye: '#ffffff', top: '#6b2fd6', top2: '#45168f',
    trim: '#d9a2ff', pants: '#5a21b8', shoes: '#2a0b5c', acc: 'badge' },
  orange: { kind: 'orange' },
  gojo: { kind: 'human', hair: '#f2f4ff', hair2: '#c9cfe8', style: 'spiky',
    skin: '#f8d3b0', skin2: '#d9a782', eye: '#7fd9ff', top: '#141a2b', top2: '#0b0f1c',
    trim: '#2a3450', pants: '#141a2b', shoes: '#0a0d17', acc: 'blindfold', tall: true },
  gojoEyes: { kind: 'human', hair: '#f2f4ff', hair2: '#c9cfe8', style: 'spiky',
    skin: '#f8d3b0', skin2: '#d9a782', eye: '#8ef0ff', top: '#141a2b', top2: '#0b0f1c',
    trim: '#2a3450', pants: '#141a2b', shoes: '#0a0d17', acc: 'sixeyes', tall: true },
  sukuna: { kind: 'human', hair: '#f6e6d8', hair2: '#cbb4a4', style: 'spiky',
    skin: '#f3cfb4', skin2: '#cf9f80', eye: '#ff3b3b', top: '#1a1118', top2: '#0d080d',
    trim: '#c1121f', pants: '#2a1b22', shoes: '#120a10', acc: 'sukuna', tall: true },
  mahito: { kind: 'human', hair: '#7f94a8', hair2: '#5a6c80', style: 'messy',
    skin: '#dfe8ef', skin2: '#b3c0cc', eye: '#2a2f3a', top: '#2b3a4a', top2: '#1a242f',
    trim: '#6d8294', pants: '#242e3a', shoes: '#141a22', acc: 'stitch' },
  yuji: { kind: 'human', hair: '#ff8fa3', hair2: '#d9616f', style: 'spiky',
    skin: '#f6c9a0', skin2: '#d49a73', eye: '#4a3a2a', top: '#141a2b', top2: '#0b0f1c',
    trim: '#2a3450', pants: '#141a2b', shoes: '#0a0d17', acc: 'hoodup' },
  megumi: { kind: 'human', hair: '#1b2130', hair2: '#0d111a', style: 'spiky',
    skin: '#f3c79c', skin2: '#cf9a70', eye: '#2a5a4a', top: '#141a2b', top2: '#0b0f1c',
    trim: '#2a3450', pants: '#141a2b', shoes: '#0a0d17' },
  nobara: { kind: 'human', hair: '#c97b3a', hair2: '#9c5724', style: 'bob',
    skin: '#f8cfa8', skin2: '#d3a076', eye: '#8a5a2a', top: '#141a2b', top2: '#0b0f1c',
    trim: '#2a3450', pants: '#2a3450', shoes: '#4a2a1a', acc: 'hammer' },
  nanami: { kind: 'human', hair: '#e3c98a', hair2: '#b89d5e', style: 'flat',
    skin: '#f3c79c', skin2: '#cf9a70', eye: '#5a7a9a', top: '#2e3442', top2: '#1d2230',
    trim: '#9aa6bb', pants: '#2e3442', shoes: '#15181f', acc: 'glasses', tall: true },
  gakuganji: { kind: 'human', hair: '#cfd6e2', hair2: '#9aa3b2', style: 'flat',
    skin: '#e8c49c', skin2: '#c09a72', eye: '#3a3a3a', top: '#3a2a4a', top2: '#241633',
    trim: '#ffd24a', pants: '#2a1b36', shoes: '#140a1c' },
  kenjaku: { kind: 'human', hair: '#1b1b22', hair2: '#0d0d12', style: 'long',
    skin: '#e8c49c', skin2: '#c09a72', eye: '#c9a24a', top: '#3b2f4a', top2: '#241c30',
    trim: '#6b5a8a', pants: '#2a2136', shoes: '#140f1c', acc: 'stitch', tall: true },
  hanami: { kind: 'plant' },
  jogo: { kind: 'volcano' },
  dagon: { kind: 'fish' },
  curseBlob: { kind: 'blob', col: '#6b3fa0', col2: '#3f1f6b' },
  curseBug: { kind: 'bug', col: '#4a5a2a', col2: '#2a3416' },
  curseBig: { kind: 'bigcurse', col: '#2a1b33', col2: '#140d1c' },
  curseFinger: { kind: 'finger' },

  todo: { kind: 'human', hair: '#17171f', hair2: '#0c0c12', style: 'flat',
    skin: '#c98f66', skin2: '#a06b48', eye: '#2a2a2a', top: '#141a2b', top2: '#0b0f1c',
    trim: '#2a3450', pants: '#141a2b', shoes: '#0a0d17', tall: true, acc: 'badge' },

  /* ===== Culling Game cast ===== */
  hakari: { kind: 'human', hair: '#1e1e28', hair2: '#101018', style: 'spiky',
    skin: '#f3c79c', skin2: '#cf9a70', eye: '#8a8a9a', top: '#141a2b', top2: '#0b0f1c',
    trim: '#ffd24a', pants: '#141a2b', shoes: '#0a0d17', acc: 'badge', tall: true },
  kirara: { kind: 'human', hair: '#2b1f3a', hair2: '#1a1226', style: 'long',
    skin: '#f6cdb0', skin2: '#d3a081', eye: '#ff9ec4', top: '#3a2a4a', top2: '#241633',
    trim: '#ff9ec4', pants: '#2a1b36', shoes: '#140a1c', acc: 'star' },
  kashimo: { kind: 'human', hair: '#17171f', hair2: '#0c0c12', style: 'long',
    skin: '#e8c09a', skin2: '#c0956f', eye: '#ff4fa3', top: '#1b2436', top2: '#0e1420',
    trim: '#7fd9ff', pants: '#1b2436', shoes: '#0a0d17', acc: 'bolt', tall: true },
  higuruma: { kind: 'human', hair: '#1b1b22', hair2: '#0d0d12', style: 'messy',
    skin: '#e9c7a4', skin2: '#c29a77', eye: '#5a5a6a', top: '#2e3442', top2: '#1d2230',
    trim: '#9aa6bb', pants: '#2e3442', shoes: '#15181f', acc: 'gavel', tall: true },
  takaba: { kind: 'human', hair: '#3a2a1e', hair2: '#241a12', style: 'messy',
    skin: '#f3c79c', skin2: '#cf9a70', eye: '#4a3a2a', top: '#c9542a', top2: '#8f3618',
    trim: '#ffe14d', pants: '#2a3450', shoes: '#1a1f2b', acc: 'mic' },
  angel: { kind: 'human', hair: '#f2ead2', hair2: '#cfc3a4', style: 'long',
    skin: '#f8d9bc', skin2: '#d7ab8a', eye: '#7fd9ff', top: '#f0f3fb', top2: '#cfd6e6',
    trim: '#ffd24a', pants: '#e3e8f2', shoes: '#b9c2d0', acc: 'wings', tall: true },
  hana: { kind: 'human', hair: '#d8c9a8', hair2: '#b3a383', style: 'bob',
    skin: '#f8d3b0', skin2: '#d9a782', eye: '#6aa8d8', top: '#141a2b', top2: '#0b0f1c',
    trim: '#2a3450', pants: '#141a2b', shoes: '#0a0d17' },
  yuta: { kind: 'human', hair: '#17171f', hair2: '#0c0c12', style: 'flat',
    skin: '#f3c79c', skin2: '#cf9a70', eye: '#3a6a8a', top: '#141a2b', top2: '#0b0f1c',
    trim: '#2a3450', pants: '#141a2b', shoes: '#0a0d17', acc: 'katana', tall: true },
  maki: { kind: 'human', hair: '#1f3a2a', hair2: '#13241a', style: 'bob',
    skin: '#f3c79c', skin2: '#cf9a70', eye: '#3a7a5a', top: '#141a2b', top2: '#0b0f1c',
    trim: '#2a3450', pants: '#141a2b', shoes: '#0a0d17', acc: 'polearm', tall: true },
  toji: { kind: 'human', hair: '#15151c', hair2: '#0a0a10', style: 'spiky',
    skin: '#e8c09a', skin2: '#c0956f', eye: '#2a3a2a', top: '#17171f', top2: '#0c0c12',
    trim: '#2a2a33', pants: '#17171f', shoes: '#0a0a10', acc: 'scar', tall: true },
  junpei: { kind: 'human', hair: '#2a2630', hair2: '#17141d', style: 'messy',
    skin: '#f0c49c', skin2: '#c9936d', eye: '#5a4a6a', top: '#3a3550', top2: '#242036',
    trim: '#6b5a8a', pants: '#2a2636', shoes: '#141018', acc: 'hoodup' },
  geto: { kind: 'human', hair: '#17171f', hair2: '#0c0c12', style: 'long',
    skin: '#f0c49c', skin2: '#c9936d', eye: '#4a3a5a', top: '#2a2436', top2: '#191424',
    trim: '#6b5a8a', pants: '#221c30', shoes: '#120e1a', tall: true },
  reggie: { kind: 'human', hair: '#e8d9a8', hair2: '#bfae7e', style: 'flat',
    skin: '#f3c79c', skin2: '#cf9a70', eye: '#6a5a3a', top: '#3a3a46', top2: '#24242e',
    trim: '#d8d8e2', pants: '#3a3a46', shoes: '#1a1a22', acc: 'badge', tall: true },
  charles: { kind: 'human', hair: '#2a1b14', hair2: '#17100b', style: 'spiky',
    skin: '#8a5a3a', skin2: '#663f26', eye: '#3a2a1a', top: '#2a3450', top2: '#1a2234',
    trim: '#ff8c00', pants: '#2a3450', shoes: '#141a22', acc: 'badge' },
  megumiSukuna: { kind: 'human', hair: '#1b2130', hair2: '#0d111a', style: 'spiky',
    skin: '#f3cfb4', skin2: '#cf9f80', eye: '#ff3b3b', top: '#1a1118', top2: '#0d080d',
    trim: '#c1121f', pants: '#2a1b22', shoes: '#120a10', acc: 'sukuna', tall: true },
  tengen: { kind: 'human', hair: '#cfc3e0', hair2: '#a295b8', style: 'long',
    skin: '#e8d6c0', skin2: '#c0ad96', eye: '#9b4dff', top: '#3b2f4a', top2: '#241c30',
    trim: '#9b4dff', pants: '#2a2136', shoes: '#140f1c' },
  rika: { kind: 'rika' },
  mahoraga: { kind: 'mahoraga' }
};

/* ---------- main actor draw ---------- */
/* dir: 0 down,1 left,2 right,3 up ; frame: walk frame 0..3 ; t: time for idle bob */
function drawActor(name, x, y, u, o = {}) {
  const d = CHARS[name] || CHARS.kenji;
  const dir = o.dir || 0, fr = o.frame || 0, flip = dir === 1;
  const bob = o.bob === false ? 0 : (Math.sin((o.t || 0) * 3) > 0 ? 0 : 1);
  const step = (fr === 1 || fr === 3) ? 1 : 0;
  ctx.save();
  if (o.alpha != null) ctx.globalAlpha = o.alpha;
  if (flip) { ctx.translate(x + 16 * u, y); ctx.scale(-1, 1); x = 0; y = 0; ctx.translate(-0, 0); }
  const p = PX(flip ? 0 : x, flip ? y : y, u);
  const walking = o.walking;
  const yo = walking ? step : bob;

  switch (d.kind) {
    case 'human': drawHuman(p, d, dir, step, yo, walking, o); break;
    case 'orange': drawOrange(p, o); break;
    case 'ghostface': drawGhostface(p, yo, o); break;
    case 'plant': drawHanami(p, yo); break;
    case 'volcano': drawJogo(p, yo); break;
    case 'fish': drawDagon(p, yo); break;
    case 'blob': drawBlob(p, d, yo); break;
    case 'bug': drawBug(p, d, yo); break;
    case 'bigcurse': drawBigCurse(p, d, yo); break;
    case 'finger': drawFinger(p); break;
    case 'rika': drawRika(p, yo); break;
    case 'mahoraga': drawMahoraga(p, yo); break;
  }
  ctx.restore();
}

function drawHuman(p, d, dir, step, yo, walking, o) {
  const K = '#05060a';
  const headTop = d.tall ? 0 : 1;
  const ht = headTop + yo;
  // hair back / silhouette
  p(4, ht, 8, 2, d.hair);
  p(3, ht + 1, 10, 5, d.hair);
  // face
  p(4, ht + 2, 8, 6, d.skin);
  p(11, ht + 2, 1, 6, d.skin2);
  p(4, ht + 7, 8, 1, d.skin2);
  // hair style overlays
  if (d.style === 'spiky') {
    p(3, ht, 2, 2, d.hair); p(6, ht - 1, 2, 2, d.hair); p(9, ht, 2, 2, d.hair);
    p(3, ht + 2, 1, 3, d.hair); p(12, ht + 2, 1, 3, d.hair2);
    p(4, ht + 1, 8, 1, d.hair2);
  } else if (d.style === 'messy') {
    p(3, ht - 1, 3, 2, d.hair); p(7, ht - 1, 2, 2, d.hair); p(10, ht - 1, 3, 2, d.hair);
    p(3, ht + 2, 1, 4, d.hair2); p(12, ht + 2, 1, 4, d.hair2);
  } else if (d.style === 'bob') {
    p(3, ht + 1, 1, 7, d.hair); p(12, ht + 1, 1, 7, d.hair);
    p(4, ht + 1, 8, 1, d.hair2);
  } else if (d.style === 'long') {
    p(3, ht + 1, 1, 11, d.hair); p(12, ht + 1, 1, 11, d.hair);
    p(4, ht + 1, 8, 1, d.hair2);
  } else { // flat
    p(4, ht + 1, 8, 1, d.hair2);
  }
  // eyes
  if (dir !== 3) {
    if (d.acc === 'blindfold') {
      p(3, ht + 3, 10, 2, '#e8ecf7'); p(3, ht + 4, 10, 1, '#c6cde0');
    } else if (d.acc === 'sixeyes') {
      p(5, ht + 3, 2, 2, d.eye); p(9, ht + 3, 2, 2, d.eye);
      p(5, ht + 3, 1, 1, '#ffffff'); p(9, ht + 3, 1, 1, '#ffffff');
    } else if (d.acc === 'glasses') {
      p(4, ht + 3, 3, 2, '#dfe6f2'); p(9, ht + 3, 3, 2, '#dfe6f2');
      p(5, ht + 3, 1, 1, d.eye); p(10, ht + 3, 1, 1, d.eye); p(7, ht + 4, 2, 1, '#9aa6bb');
    } else if (d.acc === 'sukuna') {
      p(5, ht + 3, 2, 1, d.eye); p(9, ht + 3, 2, 1, d.eye);
      p(5, ht + 5, 2, 1, d.eye); p(9, ht + 5, 2, 1, d.eye); // second pair
      p(4, ht + 2, 1, 1, d.trim); p(11, ht + 2, 1, 1, d.trim);
      p(6, ht + 6, 4, 1, d.trim);
    } else {
      p(5, ht + 3, 2, 2, '#ffffff'); p(9, ht + 3, 2, 2, '#ffffff');
      p(5, ht + 4, 1, 1, d.eye); p(10, ht + 4, 1, 1, d.eye);
      if (o.angry) { p(5, ht + 2, 2, 1, d.hair2); p(9, ht + 2, 2, 1, d.hair2); }
    }
    p(7, ht + 6, 2, 1, d.skin2);
  }
  if (d.acc === 'stitch') {
    p(4, ht + 6, 8, 1, '#5a6c80');
    for (let i = 0; i < 4; i++) p(5 + i * 2, ht + 5, 1, 3, '#39475a');
    p(6, ht + 1, 1, 2, '#39475a'); p(10, ht + 1, 1, 2, '#39475a');
  }
  if (d.acc === 'hoodup') { p(2, ht + 1, 1, 8, d.trim); p(13, ht + 1, 1, 8, d.trim); }

  // body
  const by = ht + 8;
  p(5, by, 6, 1, d.trim);                       // collar
  p(4, by + 1, 8, 6, d.top);
  p(9, by + 1, 3, 6, d.top2);
  if (d.hood) { p(3, by, 10, 1, d.trim); p(4, by + 1, 1, 2, d.trim); p(11, by + 1, 1, 2, d.trim); }
  // trim stripe
  p(7, by + 1, 2, 6, d.trim === '#2a3450' ? d.top2 : d.trim);
  // arms
  const sw = walking ? (step ? 1 : -1) : 0;
  const po = o.pose;
  if (po) {
    // posed arms hang off the shoulder and clear the torso so they read
    const arm = (sx, up, len, colA, colB) => {
      const sh = by + 1;
      if (up) { p(sx, sh - len, 2, len, colA); p(sx, sh - len - 1, 2, 1, colB); }
      else { p(sx, sh, 2, len, colA); p(sx, sh + len, 2, 1, colB); }
    };
    arm(1 + (po.alx || 0), po.aup, po.all || 5, d.top, d.skin);
    arm(13 + (po.arx || 0), po.aup2, po.arl || 5, d.top2, d.skin2);
  } else {
    p(2, by + 1 + (sw > 0 ? 1 : 0), 2, 5, d.top);
    p(12, by + 1 + (sw < 0 ? 1 : 0), 2, 5, d.top2);
    p(2, by + 6 + (sw > 0 ? 1 : 0), 2, 1, d.skin);
    p(12, by + 6 + (sw < 0 ? 1 : 0), 2, 1, d.skin2);
  }
  // legs
  const ly = by + 7;
  if (po) {
    p(5 + (po.llx || 0), ly, 2, po.lll || 4, d.pants);
    p(9 + (po.rlx || 0), ly, 2, po.rll || 4, d.pants);
    p(4 + (po.llx || 0), ly + (po.lll || 4), 3, 1, d.shoes);
    p(9 + (po.rlx || 0), ly + (po.rll || 4), 3, 1, d.shoes);
  } else if (walking) {
    p(5, ly, 2, step ? 4 : 3, d.pants); p(9, ly, 2, step ? 3 : 4, d.pants);
    p(5, ly + (step ? 4 : 3), 2, 1, d.shoes); p(9, ly + (step ? 3 : 4), 2, 1, d.shoes);
  } else {
    p(5, ly, 2, 4, d.pants); p(9, ly, 2, 4, d.pants);
    p(4, ly + 4, 3, 1, d.shoes); p(9, ly + 4, 3, 1, d.shoes);
  }
  // accessories
  if (d.acc === 'console' && dir !== 3 && !o.pose) {
    p(1, by + 4, 4, 3, '#dfe6f2'); p(2, by + 5, 2, 1, '#3ddcff'); p(1, by + 4, 4, 1, '#9aa6bb');
  }
  if (d.acc === 'hammer') { p(13, by - 1, 1, 7, '#8a5a2a'); p(12, by - 2, 3, 2, '#b9c2d0'); }
  if (d.acc === 'badge') { p(5, by + 2, 2, 2, '#ffd24a'); }
  if (d.acc === 'katana') {                       // Yuta's blade
    p(14, by - 4, 1, 11, '#dfe6f2'); p(14, by - 5, 1, 1, '#ffffff');
    p(13, by + 7, 3, 1, '#8a6a2a'); p(14, by + 8, 1, 3, '#3a2a1a');
  }
  if (d.acc === 'polearm') {                      // Maki's playful cursed tool
    p(14, by - 7, 1, 18, '#4a3220'); p(13, by - 9, 3, 3, '#b9c2d0'); p(14, by - 10, 1, 1, '#ffffff');
  }
  if (d.acc === 'gavel') {                        // Higuruma
    p(13, by + 3, 1, 5, '#4a3220'); p(12, by + 1, 3, 2, '#6b4a2a');
  }
  if (d.acc === 'star') {                         // Kirara
    p(5, ht + 0, 1, 1, '#ffd24a'); p(10, ht + 0, 1, 1, '#ffd24a');
    p(2, by + 2, 1, 1, '#ff9ec4'); p(13, by + 4, 1, 1, '#ff9ec4');
  }
  if (d.acc === 'bolt') {                         // Kashimo's electricity
    for (let i = 0; i < 3; i++) {
      p(1 + i, by - 2 + i * 2, 1, 1, '#7fd9ff'); p(14 - i, by - 3 + i * 2, 1, 1, '#7fd9ff');
    }
    p(7, by - 3, 2, 1, '#cfeeff');
  }
  if (d.acc === 'wings') {                        // Angel
    p(0, by - 1, 3, 6, '#f6f8ff'); p(13, by - 1, 3, 6, '#f6f8ff');
    p(1, by - 3, 2, 3, '#e3e8f2'); p(13, by - 3, 2, 3, '#e3e8f2');
    p(6, ht - 2, 4, 1, '#ffd24a');
  }
  if (d.acc === 'scar') { p(10, ht + 6, 2, 1, '#b05a5a'); }
  if (d.acc === 'mic') { p(13, by + 2, 1, 4, '#2a2a33'); p(12, by, 3, 2, '#9aa6bb'); }
  if (d.acc === 'sukuna') {
    p(4, by + 2, 8, 1, d.trim); p(4, by + 4, 8, 1, d.trim);
    p(2, by + 2, 2, 1, d.trim); p(12, by + 2, 2, 1, d.trim);
  }
}

function drawOrange(p, o = {}) {
  const hop = o.hop ? Math.abs(Math.sin((o.t || 0) * 8)) * 2 | 0 : 0;
  const yb = 6 - hop;
  const O = '#ff8c00', O2 = '#d96d00', O3 = '#ffb347', G = '#3f8c2a';
  // vine arms
  const sw = Math.sin((o.t || 0) * 6) * 1 | 0;
  p(1, yb + 5 + sw, 3, 1, G); p(0, yb + 4 + sw, 1, 2, G);
  p(12, yb + 5 - sw, 3, 1, G); p(15, yb + 4 - sw, 1, 2, G);
  // body (round pumpkin)
  p(5, yb, 6, 1, O2);
  p(4, yb + 1, 8, 1, O);
  p(3, yb + 2, 10, 6, O);
  p(4, yb + 8, 8, 1, O);
  p(5, yb + 9, 6, 1, O2);
  // ribs
  p(6, yb + 2, 1, 6, O3); p(9, yb + 2, 1, 6, O3);
  p(11, yb + 2, 1, 6, O2); p(4, yb + 2, 1, 6, O2);
  // stem
  p(7, yb - 2, 2, 2, G); p(9, yb - 2, 1, 1, '#2e6b1f');
  // legs
  p(5, yb + 10, 1, 2, G); p(10, yb + 10, 1, 2, G);
  p(4, yb + 12, 2, 1, G); p(10, yb + 12, 2, 1, G);
  if (o.glow) { ctx.globalAlpha = .25; p(2, yb, 12, 10, '#ffd79a'); ctx.globalAlpha = 1; }
}

function drawGhostface(p, yo, o = {}) {
  const B = '#07070b', B2 = '#101018', M = '#f2f2ee', M2 = '#c9c9c2', GOLD = '#ffd24a';
  const t = o.t || 0;
  // flowing robe
  p(3, 8 + yo, 10, 13, B);
  p(2, 12 + yo, 1, 9, B2); p(13, 12 + yo, 1, 9, B2);
  p(4, 20 + yo, 2, 1, B2); p(8, 21 + yo, 2, 1, B2); p(11, 20 + yo, 2, 1, B2);
  // hood
  p(4, 1 + yo, 8, 2, B); p(3, 2 + yo, 10, 7, B);
  p(2, 4 + yo, 1, 6, B2); p(13, 4 + yo, 1, 6, B2);
  // mask
  p(5, 3 + yo, 6, 6, M); p(5, 8 + yo, 6, 1, M2);
  p(6, 4 + yo, 1, 2, '#0a0a0a'); p(9, 4 + yo, 1, 2, '#0a0a0a');   // eyes
  p(7, 6 + yo, 2, 1, M2); p(7, 7 + yo, 2, 1, '#0a0a0a');          // mouth
  // golden knife
  const kx = 13, ky = 10 + yo + (Math.sin(t * 4) > 0 ? 0 : 1);
  p(kx, ky, 1, 1, '#8a6a2a'); p(kx, ky - 5, 1, 5, GOLD); p(kx, ky - 6, 1, 1, '#fff3c4');
  ctx.globalAlpha = .35; p(kx - 1, ky - 6, 3, 7, GOLD); ctx.globalAlpha = 1;
}

function drawHanami(p, yo) {
  const G = '#4a7a3a', G2 = '#2f5526', BR = '#6b4a2a', PK = '#ff9ec4';
  p(4, 2 + yo, 8, 8, G); p(3, 4 + yo, 10, 5, G);
  p(10, 3 + yo, 3, 6, G2);
  p(5, 5 + yo, 2, 2, '#f0f6e8'); p(9, 5 + yo, 2, 2, '#f0f6e8');
  p(5, 6 + yo, 1, 1, '#2a2a2a'); p(10, 6 + yo, 1, 1, '#2a2a2a');
  p(6, 0 + yo, 1, 3, BR); p(9, 0 + yo, 1, 3, BR);
  p(5, 0 + yo, 1, 1, PK); p(10, 0 + yo, 1, 1, PK);
  p(5, 10 + yo, 6, 8, BR); p(9, 10 + yo, 2, 8, '#4a3220');
  p(2, 11 + yo, 3, 2, BR); p(11, 11 + yo, 3, 2, BR);
  p(5, 18 + yo, 2, 3, BR); p(9, 18 + yo, 2, 3, BR);
  p(6, 12 + yo, 1, 4, '#7ba85f'); p(8, 13 + yo, 1, 3, '#7ba85f');
}
function drawJogo(p, yo) {
  const R = '#8a2a1a', R2 = '#5c160a', O = '#ff7a2a', Y = '#ffd24a';
  p(4, 0 + yo, 8, 3, R2); p(3, 2 + yo, 10, 6, R);
  p(5, 0 + yo, 6, 1, '#2a0a04');
  p(6, 1 + yo, 4, 1, O); p(7, 1 + yo, 2, 1, Y);
  p(6, 4 + yo, 4, 3, '#f5e6d0'); p(7, 5 + yo, 2, 2, '#1a1a1a'); // single eye
  p(4, 8 + yo, 8, 9, R); p(9, 8 + yo, 3, 9, R2);
  p(2, 9 + yo, 2, 5, R); p(12, 9 + yo, 2, 5, R2);
  p(5, 17 + yo, 2, 3, R2); p(9, 17 + yo, 2, 3, R2);
  p(5, 10 + yo, 6, 1, O); p(5, 13 + yo, 6, 1, O);
}
function drawDagon(p, yo) {
  const B = '#2a5a6b', B2 = '#17353f', W = '#cfe8f0';
  p(4, 1 + yo, 8, 7, B); p(3, 3 + yo, 10, 5, B);
  p(10, 2 + yo, 3, 5, B2);
  p(5, 4 + yo, 2, 2, W); p(9, 4 + yo, 2, 2, W);
  p(5, 5 + yo, 1, 1, '#1a1a1a'); p(10, 5 + yo, 1, 1, '#1a1a1a');
  p(5, 7 + yo, 6, 1, '#0d1c22');
  p(4, 8 + yo, 8, 9, B); p(9, 8 + yo, 3, 9, B2);
  p(1, 9 + yo, 3, 2, B); p(12, 9 + yo, 3, 2, B2);
  p(4, 17 + yo, 3, 3, B2); p(9, 17 + yo, 3, 3, B2);
  p(6, 10 + yo, 4, 1, W); p(6, 13 + yo, 4, 1, W);
}
function drawBlob(p, d, yo) {
  p(4, 8 + yo, 8, 2, d.col2);
  p(3, 10 + yo, 10, 8, d.col);
  p(9, 10 + yo, 4, 8, d.col2);
  p(2, 13 + yo, 1, 4, d.col); p(13, 13 + yo, 1, 4, d.col2);
  p(5, 12 + yo, 2, 2, '#ffffff'); p(9, 12 + yo, 2, 2, '#ffffff');
  p(5, 13 + yo, 1, 1, '#1a0a1a'); p(10, 13 + yo, 1, 1, '#1a0a1a');
  p(6, 16 + yo, 4, 1, '#1a0a1a');
  p(4, 18 + yo, 3, 1, d.col2); p(9, 18 + yo, 3, 1, d.col2);
}
function drawBug(p, d, yo) {
  p(4, 10 + yo, 8, 6, d.col); p(9, 10 + yo, 3, 6, d.col2);
  p(5, 7 + yo, 6, 4, d.col); p(6, 8 + yo, 1, 1, '#ff3b3b'); p(9, 8 + yo, 1, 1, '#ff3b3b');
  p(5, 6 + yo, 1, 2, d.col2); p(10, 6 + yo, 1, 2, d.col2);
  for (let i = 0; i < 3; i++) { p(2, 11 + i * 2 + yo, 2, 1, d.col2); p(12, 11 + i * 2 + yo, 2, 1, d.col2); }
  p(6, 16 + yo, 4, 2, d.col2);
}
function drawBigCurse(p, d, yo) {
  p(3, 2 + yo, 10, 6, d.col); p(2, 4 + yo, 12, 5, d.col);
  p(9, 3 + yo, 5, 6, d.col2);
  p(4, 5 + yo, 2, 2, '#ff3b3b'); p(10, 5 + yo, 2, 2, '#ff3b3b');
  p(4, 8 + yo, 8, 2, '#f0e6d0');
  for (let i = 0; i < 4; i++) p(5 + i * 2, 8 + yo, 1, 2, '#2a1b33');
  p(2, 10 + yo, 12, 8, d.col); p(10, 10 + yo, 4, 8, d.col2);
  p(0, 11 + yo, 2, 5, d.col); p(14, 11 + yo, 2, 5, d.col2);
  p(3, 18 + yo, 4, 3, d.col2); p(9, 18 + yo, 4, 3, d.col2);
}
function drawRika(p, yo) {
  const W1 = '#e9eef7', W2 = '#b9c4d6', D = '#2a1b33';
  p(5, 0 + yo, 2, 4, W2); p(10, 0 + yo, 2, 4, W2);          // horns
  p(3, 3 + yo, 10, 8, W1); p(2, 5 + yo, 12, 6, W1);
  p(10, 4 + yo, 4, 7, W2);
  p(4, 6 + yo, 2, 3, D); p(10, 6 + yo, 2, 3, D);            // hollow eyes
  p(5, 6 + yo, 1, 1, '#ff3b3b'); p(10, 6 + yo, 1, 1, '#ff3b3b');
  p(4, 10 + yo, 8, 2, '#f4f7fc');
  for (let i = 0; i < 4; i++) p(5 + i * 2, 10 + yo, 1, 2, D);
  p(2, 12 + yo, 12, 7, W1); p(10, 12 + yo, 4, 7, W2);
  p(0, 13 + yo, 2, 4, W1); p(14, 13 + yo, 2, 4, W2);
  p(4, 19 + yo, 3, 2, W2); p(9, 19 + yo, 3, 2, W2);
}
function drawMahoraga(p, yo) {
  const D = '#1b1b24', D2 = '#0e0e14', BONE = '#d9cfc0';
  p(5, 0 + yo, 6, 2, BONE);                                  // the wheel
  p(4, 1 + yo, 8, 3, BONE); p(6, 2 + yo, 1, 1, D2); p(9, 2 + yo, 1, 1, D2);
  p(3, 4 + yo, 10, 6, D); p(9, 4 + yo, 4, 6, D2);
  p(4, 6 + yo, 2, 2, '#ff3b3b'); p(10, 6 + yo, 2, 2, '#ff3b3b');
  p(4, 9 + yo, 8, 1, BONE);
  p(2, 10 + yo, 12, 8, D); p(10, 10 + yo, 4, 8, D2);
  p(0, 11 + yo, 2, 6, D); p(14, 11 + yo, 2, 6, D2);
  p(3, 12 + yo, 10, 1, BONE); p(3, 15 + yo, 10, 1, BONE);
  p(3, 18 + yo, 4, 3, D2); p(9, 18 + yo, 4, 3, D2);
}
function drawFinger(p) {
  p(6, 6, 4, 12, '#d8bfa8'); p(9, 6, 2, 12, '#b89a80');
  p(6, 5, 4, 2, '#e8d4c0'); p(6, 17, 4, 2, '#8a6a52');
  p(6, 9, 4, 1, '#b89a80'); p(6, 13, 4, 1, '#b89a80');
  ctx.globalAlpha = .3; p(4, 4, 8, 16, '#8a2be2'); ctx.globalAlpha = 1;
}

/* ---------- object / tile sprites ---------- */
function drawTree(x, y, u, t = 0) {
  const p = PX(x, y, u);
  const sway = Math.sin(t * 1.5) > 0 ? 0 : 1;
  p(6, 12, 4, 10, '#4a3220'); p(8, 12, 2, 10, '#33210f');
  p(3 + sway, 2, 10, 6, '#2f5526'); p(2 + sway, 4, 12, 5, '#3f7030');
  p(4 + sway, 1, 8, 2, '#3f7030'); p(5 + sway, 0, 6, 1, '#4f8a3c');
  p(9 + sway, 4, 4, 5, '#24401c');
}
function drawLamp(x, y, u, t = 0) {
  const p = PX(x, y, u);
  p(7, 6, 2, 16, '#39455c'); p(8, 6, 1, 16, '#222b3b');
  p(5, 3, 6, 3, '#4a566e');
  const on = Math.sin(t * 20) > -.9;
  p(6, 4, 4, 2, on ? '#ffe9a8' : '#6a6a5a');
  if (on) { ctx.globalAlpha = .18; p(1, 1, 14, 14, '#ffe9a8'); ctx.globalAlpha = 1; }
}
function drawDesk(x, y, u) {
  const p = PX(x, y, u);
  p(1, 8, 14, 3, '#6b4a2a'); p(1, 11, 14, 1, '#4a3220');
  p(2, 12, 2, 8, '#4a3220'); p(12, 12, 2, 8, '#4a3220');
  p(4, 5, 7, 3, '#1a2030'); p(5, 6, 5, 1, '#3ddcff');
}
function drawVending(x, y, u, t = 0) {
  const p = PX(x, y, u);
  p(2, 2, 12, 20, '#b5342a'); p(11, 2, 3, 20, '#8a241c');
  p(3, 4, 8, 11, '#1a2030');
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++)
    p(4 + c * 2, 5 + r * 3, 1, 2, ['#ff8c00', '#3ddcff', '#00ffa6', '#ffe14d', '#ff4fa3'][(r * 3 + c) % 5]);
  p(12, 6, 1, 4, Math.sin(t * 6) > 0 ? '#ffe14d' : '#6a6a3a');
  p(3, 17, 8, 3, '#2a3245');
}
function drawTorii(x, y, u) {
  const p = PX(x, y, u);
  p(0, 2, 16, 2, '#b5342a'); p(0, 1, 16, 1, '#8a241c');
  p(1, 5, 14, 1, '#b5342a');
  p(2, 2, 2, 20, '#b5342a'); p(12, 2, 2, 20, '#b5342a');
  p(3, 2, 1, 20, '#8a241c'); p(13, 2, 1, 20, '#8a241c');
}
function drawTrain(x, y, u, t = 0) {
  const p = PX(x, y, u);
  p(0, 4, 16, 14, '#8a94a8'); p(0, 4, 16, 2, '#c3cbd8');
  p(0, 16, 16, 2, '#4a5466');
  for (let i = 0; i < 3; i++) { p(1 + i * 5, 7, 4, 5, '#1a2436'); p(1 + i * 5, 8, 4, 1, '#3ddcff'); }
  p(2, 18, 3, 2, '#222b3b'); p(11, 18, 3, 2, '#222b3b');
  p(0, 2, 2, 2, Math.sin(t * 8) > 0 ? '#ffe14d' : '#5a5a3a');
}
function drawSign(x, y, u, col = '#ff8c00') {
  const p = PX(x, y, u);
  p(7, 10, 2, 12, '#4a3220');
  p(2, 3, 12, 8, '#1a2030'); p(2, 3, 12, 1, col); p(2, 10, 12, 1, col);
  p(4, 5, 8, 1, col); p(4, 7, 6, 1, col);
}
function drawChest(x, y, u, open = false) {
  const p = PX(x, y, u);
  p(2, open ? 8 : 10, 12, 10, '#6b4a2a');
  p(2, open ? 4 : 8, 12, 3, '#8a6134');
  p(2, open ? 7 : 11, 12, 1, '#ffd24a');
  p(7, open ? 7 : 11, 2, 2, '#ffd24a');
  p(12, 10, 2, 8, '#4a3220');
}
function drawTerminal(x, y, u, t = 0) {
  const p = PX(x, y, u);
  p(2, 4, 12, 12, '#1a2436'); p(2, 4, 12, 1, '#3ddcff');
  p(3, 6, 10, 8, '#07141c');
  for (let i = 0; i < 4; i++) p(4, 7 + i * 2, 2 + ((i * 3 + (t * 4 | 0)) % 7), 1, '#00ffa6');
  p(5, 16, 6, 5, '#2a3245'); p(4, 20, 8, 2, '#39455c');
}


/* ===========================================================
   HAKARI'S JACKPOT DANCE
   The full-body one: knees bent, arms pumping overhead,
   hip swing, spin, and the pachinko jackpot going off behind him.
   =========================================================== */
const HAKARI_POSES = [
  /* 0 both arms straight up, knees wide      */ { aup: 1, aup2: 1, all: 7, arl: 7, llx: -1, rlx: 1, lll: 4, rll: 4, lean: 0, hop: 2 },
  /* 1 right fist punches up, lean left       */ { all: 4, aup2: 1, arl: 8, alx: -1, llx: -1, lll: 5, rll: 3, lean: -3, hop: 0 },
  /* 2 left fist punches up, lean right       */ { aup: 1, all: 8, arl: 4, arx: 1, rlx: 1, lll: 3, rll: 5, lean: 3, hop: 0 },
  /* 3 arms flung wide, big hop               */ { all: 4, arl: 4, alx: -2, arx: 2, llx: -2, rlx: 2, lll: 3, rll: 3, lean: 0, hop: 4 },
  /* 4 arms tucked in, mid-spin               */ { all: 4, arl: 4, alx: 2, arx: -2, lll: 4, rll: 4, lean: 0, hop: 1, spin: 1 },
  /* 5 both arms up higher, both feet off     */ { aup: 1, aup2: 1, all: 9, arl: 9, alx: -1, arx: 1, llx: -1, rlx: 1, lll: 3, rll: 3, lean: 0, hop: 5 },
  /* 6 hands to hips, knee up                 */ { all: 3, arl: 3, alx: 1, arx: -1, rlx: 1, lll: 2, rll: 5, lean: -1, hop: 0 },
  /* 7 one finger to the sky - JACKPOT        */ { all: 4, alx: -1, aup2: 1, arl: 10, arx: 1, llx: -1, rlx: 1, lll: 4, rll: 4, lean: 2, hop: 1 }
];

function drawHakariDance(spr, x, y, u, t) {
  const beat = t * 6.2;                       // ~372 bpm of pure gambling
  const i = Math.floor(beat) % HAKARI_POSES.length;
  const pose = HAKARI_POSES[i];
  const cx = x + 8 * u, cy = y + 11 * u;

  /* --- jackpot light show behind him --- */
  ctx.save();
  ctx.globalAlpha = .16 + Math.abs(Math.sin(beat * 1.5)) * .12;
  for (let r = 0; r < 10; r++) {
    const a = (r / 10) * TAU + t * 1.6;
    ctx.fillStyle = r % 2 ? '#ffd24a' : '#ff4fa3';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a - .1) * 118, cy + Math.sin(a - .1) * 118);
    ctx.lineTo(cx + Math.cos(a + .1) * 118, cy + Math.sin(a + .1) * 118);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  /* --- the dancer --- */
  ctx.save();
  if (pose.spin) {
    const k = beat % 1;
    ctx.translate(cx, cy); ctx.scale(Math.cos(k * Math.PI) >= 0 ? 1 : -1, 1); ctx.translate(-cx, -cy);
  }
  ctx.translate(pose.lean || 0, -(pose.hop || 0) * 2);
  drawActor(spr, x, y, u, { t, dir: 0, bob: false, pose });
  ctx.restore();

  /* --- pachinko balls raining out of the machine --- */
  for (let b = 0; b < 14; b++) {
    const bt = (t * 1.6 + b * 0.37) % 1;
    const bx = cx + Math.sin(b * 2.3) * 70;
    const by = cy - 70 + bt * 150;
    rect(bx, by, 4, 4, b % 3 ? '#e8ecf7' : '#ffd24a');
    rect(bx, by, 2, 2, '#ffffff');
  }
  /* --- coins + confetti --- */
  for (let c = 0; c < 10; c++) {
    const a = beat * .7 + c * 0.63;
    const rr = 64 + Math.sin(a * 1.3) * 14;
    const px = cx + Math.cos(a) * rr * 1.5, py = cy - 6 + Math.sin(a) * rr * .75;
    text('$', px, py, { scale: 2, color: '#ffd24a', shadow: '#7a4a00' });
  }
  /* --- the sign --- */
  const flash = Math.floor(beat) % 2 === 0;
  const label = 'JACKPOT';
  const w = textW(label, 2) + 14;
  rect(cx - w / 2, cy - 92, w, 20, flash ? '#ffd24a' : '#b5342a');
  frameRect(cx - w / 2, cy - 92, w, 20, '#fff', 2);
  textC(label, cx, cy - 86, { scale: 2, color: flash ? '#7a4a00' : '#ffe9a8' });
  for (let l = 0; l < 6; l++) {
    const lx = cx - w / 2 + 4 + l * ((w - 8) / 5);
    rect(lx, cy - 98, 4, 4, (Math.floor(beat * 2) + l) % 2 ? '#fff3d6' : '#8a6a2a');
  }
}
