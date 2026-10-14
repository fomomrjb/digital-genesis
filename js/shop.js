/* ===========================================================
   DIGITAL GENESIS — shop.js
   Dollars, skins, emote packs, items, codex
   =========================================================== */
'use strict';

const RARITY = {
  common:    { name: 'COMMON',    col: '#b1b6c2', mult: 1 },
  uncommon:  { name: 'UNCOMMON',  col: '#4ddd6a', mult: 2 },
  rare:      { name: 'RARE',      col: '#3ba7ff', mult: 4 },
  epic:      { name: 'EPIC',      col: '#b45cff', mult: 8 },
  legendary: { name: 'LEGENDARY', col: '#ff9b2b', mult: 16 },
  mythic:    { name: 'MYTHIC',    col: '#ffd700', mult: 30 }
};

const SKINS = {
  default:   { name: 'Kenji Sato', spr: 'kenji', rar: RARITY.common, price: 0,
    desc: 'Default build. Hoodie, handheld console, 14% battery.' },
  devbuild:  { name: 'Dev Build Kenji', spr: 'kenjiOrangeSkin', rar: RARITY.epic, price: 2400,
    desc: 'Orange recompiled your outfit. Now it is orange. Thanks Orange.' },
  ghostface: { name: 'Ghost Face Protocol', spr: 'ghostface', rar: RARITY.mythic, price: 9000,
    desc: 'The executioner skin. Golden knife included. Legally distinct from any franchise.' },
  purpleguy: { name: 'Purple Guy', spr: 'purpleguy', rar: RARITY.legendary, price: 5200,
    desc: 'Why does he look like that. Orange bought this with YOUR money.' },
  blindfold: { name: 'Honored One', spr: 'gojo', rar: RARITY.legendary, price: 5000,
    desc: 'Blindfold and white hair. Does not come with Limitless. Gojo checked.' },
  sixeyes:   { name: 'Six Eyes Unsealed', spr: 'gojoEyes', rar: RARITY.mythic, price: 8800,
    desc: 'The blindfold comes off. Your processing overhead goes up 400%.' },
  king:      { name: 'King of Curses', spr: 'sukuna', rar: RARITY.mythic, price: 9500,
    desc: 'Four eyes, black markings, zero manners. Unlocked by beating him.' },
  curse:     { name: 'Curse Hoodie', spr: 'curseBlob', rar: RARITY.uncommon, price: 700,
    desc: 'You are wearing a Grade 4 curse. It is fine. It likes you.' },
  shibuya:   { name: 'Shibuya Survivor', spr: 'mahito', rar: RARITY.rare, price: 1800,
    desc: 'Stitched coat from the subway. Smells like October 31st.' },
  highschool:{ name: 'Jujutsu High Uniform', spr: 'yuji', rar: RARITY.common, price: 300,
    desc: 'Standard issue. Megumi says you have to actually wear it sometimes.' },
  suit:      { name: 'Overtime Suit', spr: 'nanami', rar: RARITY.rare, price: 2000,
    desc: 'Nanami lent it to you. It is 7:03 PM. You are off the clock.' },
  pumpkin:   { name: 'Pumpkin Suit', spr: 'orange', rar: RARITY.epic, price: 3100,
    desc: 'You ARE the Orange now. Orange finds this deeply moving.' }
};

/* emote animation kinds are drawn by drawEmoteAnim() */
const EMOTES = {
  wave:    { name: 'Wave', kind: 'wave', rar: RARITY.common, price: 0, dur: 1.6,
    desc: 'A normal human greeting. You have practised it.' },
  console: { name: 'Console Idle', kind: 'console', rar: RARITY.common, price: 150, dur: 2.4,
    desc: 'Just stand there and play your handheld. Peak Kenji.' },
  hakari:  { name: 'Hakari Dance', kind: 'hakari', rar: RARITY.epic, price: 2800, dur: 3.4,
    desc: 'Hakari\'s jackpot dance, move for move: knees wide, arms pumping overhead, the spin, the finger to the sky. Orange has requested it 600 times.' },
  gojopeace:{ name: 'Gojo Peace Sign', kind: 'peace', rar: RARITY.rare, price: 1200, dur: 2.0,
    desc: 'Two fingers. Infinite smugness.' },
  nobara:  { name: 'Nobara Pose', kind: 'pose', rar: RARITY.uncommon, price: 600, dur: 2.0,
    desc: 'Hammer up, chin up. Tokyo is beneath you.' },
  dance:   { name: 'Default Dance', kind: 'dance', rar: RARITY.rare, price: 1000, dur: 3.0,
    desc: 'The flossing-adjacent one. Do not ask who taught you.' },
  floss:   { name: 'Floss', kind: 'floss', rar: RARITY.rare, price: 1000, dur: 3.0,
    desc: 'Arms go swish. Swish swish.' },
  takeL:   { name: 'Take The L', kind: 'takel', rar: RARITY.uncommon, price: 700, dur: 2.6,
    desc: 'Rude. Devastating. Orange cried laughing the first time.' },
  sukunapoint:{ name: 'Sukuna Finger Point', kind: 'point', rar: RARITY.legendary, price: 4200, dur: 2.4,
    desc: 'Point one finger. Everything in front of it gets ideas.' },
  wiggle:  { name: 'Orange Wiggle', kind: 'wiggle', rar: RARITY.epic, price: 2500, dur: 2.8,
    desc: 'Orange does his whole-body wiggle. You do it too. Bonding.' },
  domainflex:{ name: 'Domain Flex', kind: 'flex', rar: RARITY.legendary, price: 4800, dur: 3.2,
    desc: 'Throw the hand sign, hold it, let the barrier shimmer. Show-off.' },
  voidstare:{ name: 'Infinite Void Stare', kind: 'stare', rar: RARITY.mythic, price: 7500, dur: 3.6,
    desc: 'Stand perfectly still and perceive everything. Very rude in queues.' },
  todoclap:{ name: 'Todo Clap', kind: 'clap', rar: RARITY.rare, price: 1400, dur: 2.0,
    desc: 'Clap. Something, somewhere, swaps places.' }
};

const PACKS = {
  starter: { name: 'Starter Emote Pack', rar: RARITY.uncommon, price: 1200,
    items: ['console', 'nobara', 'takeL'], desc: 'Three emotes. Mild savings. Orange negotiated badly.' },
  hype:    { name: 'Hype Pack', rar: RARITY.epic, price: 4500,
    items: ['hakari', 'wiggle', 'dance', 'floss'], desc: 'Four dance emotes. Orange calls this "the good one".' },
  sorcerer:{ name: 'Sorcerer Pack', rar: RARITY.legendary, price: 7800,
    items: ['gojopeace', 'sukunapoint', 'todoclap', 'domainflex'], desc: 'Emote like the people who tried to kill you.' },
  skinbundle:{ name: 'Admin Skin Bundle', rar: RARITY.legendary, price: 9800,
    skins: ['devbuild', 'purpleguy', 'pumpkin'], desc: 'Three skins, one suspicious price.' }
};

const ITEMS = {
  snack:   { name: 'Convenience Snack', price: 60, heal: 22, desc: 'Heals 22 HP. Kenji is fundamentally a child.' },
  battery: { name: 'Power Bank', price: 180, heal: 55, desc: 'Heals 55 HP. Gojo bought you a crate of these.' },
  icecream:{ name: 'Premium Ice Cream', price: 320, heal: 999, desc: 'Full heal. The recruitment bribe.' },
  curseball:{ name: 'Cursed Energy Candy', price: 140, buff: 'atk', desc: 'ATK up for one battle. Tastes like 9-volt.' },
  patch:   { name: 'Hotfix Patch', price: 260, revive: true, desc: 'Auto-revives you once with 50% HP. Orange still mocks you.' },
  ramen:   { name: 'Late Ramen', price: 420, heal: 999, buff: 'def', desc: 'Full heal + DEF up. Nanami approved.' }
};

const CODEX = [
  { id: 'kenji', title: 'Kenji Sato', body: 'Age 12. Special Grade. Born to non-sorcerer parents in Tokyo. Hyper-advanced synesthesia and savant syndrome: he sees the lines of code running the world. Classified anomalous and self-awakened after the Shibuya subway incident at age 10.' },
  { id: 'digitalgenesis', title: 'Innate Technique: Digital Genesis', body: 'Treats physical law, cursed energy and souls as data he can debug, rewrite, hack or delete. Five branches: Null, Absolute Solver, Video Game Copy, Lag Spike, Asset Flip.' },
  { id: 'orange', title: 'Companion: Orange', body: 'An autonomous system entity shaped like a neon-orange pumpkin with vine limbs. Telepathically hardcoded to Kenji alone; to everyone else it is a silent, wiggling vegetable. Loyal, chaotic, hype-focused.' },
  { id: 'orangesuite', title: 'The ORANGE Suite', body: 'A restricted developer directory inside the foundational source code of Kenji\'s soul. Grants administrative control over the universe engine files: Creative Mode, Admin Mute, Heal, Survival, Spectator, Teleport, Disguise.' },
  { id: 'ce', title: 'Cursed Energy Reserve', body: 'Massive. Kenji manages energy like a mana bar and optimises to the decimal, producing near-zero waste — comparable to the Six Eyes. Functionally infinite in combat.' },
  { id: 'weakness', title: 'Psychological Weakness', body: 'He is still a child. Distracted by candy and snacks, lacks strategic maturity, may throw a tantrum or lose interest if a fight stops being fun or novel.' },
  { id: 'physical', title: 'Physical Prowess', body: 'Average for a 12-year-old. He relies on Absolute Solver and Lag Spike to avoid ever engaging in real hand-to-hand combat.' },
  { id: 'blackflash', title: 'Black Flash', body: 'Cursed energy applied within 0.000001 seconds of a physical hit. Distorts space; output multiplies by 2.5. Sorcerers who land one tend to find the rhythm afterwards.' },
  { id: 'orangeflash', title: 'Orange Flash', body: 'Orange routes the universe engine file directly through Kenji\'s fist. Impact scale is recorded at one hundred black flashes. Orange insists this one is his move, not Kenji\'s.' },
  { id: 'domain', title: 'Domain Expansion', body: 'The apex of jujutsu: a barrier built from an innate technique with a guaranteed hit inside. Kenji is one of the only sorcerers in history able to construct two distinct domains.' },
  { id: 'd404', title: 'Error 404: Cosmos Format', body: 'Hand sign: power button. An endless white void, neon-green code, glitching wireframes, a giant unblinking digital eye. Injects Null into brain and soul. 3s senses, 10s technique uninstalled, 30s body becomes pixelated smoke.' },
  { id: 'dsandbox', title: 'Sandbox Mode: Developer Tools', body: 'Hand sign: retro television screen. A hyper-colourful 8-bit voxel engine world. No lethal sure-hit — instead Kenji receives Developer Privileges over the rules of the space.' },
  { id: 'cullinggame', title: 'The Culling Game', body: 'A nationwide ritual played on a board of colonies. Sorcerers and non-sorcerers alike are given rules, points, and no exit. Someone stitched together the barriers while everyone was busy with Shibuya.' },
  { id: 'sukuna', title: 'Ryomen Sukuna', body: 'The King of Curses. A thousand years undefeated. Malevolent Shrine is an open barrier, which is why it tore through Shinjuku instead of containing it.' },
  { id: 'gojo', title: 'Satoru Gojo', body: 'The strongest. Limitless plus Six Eyes. Infinity is a mathematical rule, which means it is a rule, which means it has a value.' },
  { id: 'mahito', title: 'Mahito', body: 'A cursed spirit born from humanity\'s hatred of itself. Idle Transfiguration reshapes a soul on touch. He cannot touch what rewrites matter first.' },
  { id: 'binding', title: 'Binding Vows', body: 'A contract with the world: give something up, receive power. Sukuna used one to eject a fragment of himself out of a formatting domain. The system honoured it.' }
];

/* ---------- helpers ---------- */
function skinSprite() { return (SKINS[G.equippedSkin] || SKINS.default).spr; }
function useItem(k) {
  const it = ITEMS[k]; if (!it || !G.items[k]) return false;
  G.items[k]--; if (G.items[k] <= 0) delete G.items[k];
  if (it.heal) { const before = G.hp; G.heal(it.heal); Toast.show('+' + (G.hp - before) + ' HP', PAL.green); }
  if (it.buff) { G.flags['buff_' + it.buff] = true; Toast.show(it.buff.toUpperCase() + ' UP!', PAL.yellow); }
  if (it.revive) { G.flags.hotfix = true; Toast.show('HOTFIX ARMED', PAL.cyan); }
  Audio.sfx('heal');
  return true;
}
function giveSkin(k) { if (SKINS[k]) { G.ownedSkins[k] = true; Toast.show('SKIN UNLOCKED: ' + SKINS[k].name, SKINS[k].rar.col, 3.4); } }
function giveEmote(k) { if (EMOTES[k]) { G.ownedEmotes[k] = true; autoEquipEmote(k); Toast.show('EMOTE UNLOCKED: ' + EMOTES[k].name, EMOTES[k].rar.col, 3.4); } }
function autoEquipEmote(k) {
  if (G.equippedEmotes.includes(k)) return;
  const i = G.equippedEmotes.indexOf(null);
  if (i >= 0) G.equippedEmotes[i] = k;
}

/* ---------- active emote performance ---------- */
const Emote = { playing: null, t: 0 };
function playEmote(id) {
  const em = EMOTES[id]; if (!em) return;
  Emote.playing = em; Emote.t = 0;
  Audio.sfx('select');
  if (em.kind === 'wiggle') Audio.sfx('orangetalk');
  if (em.kind === 'flex') Audio.sfx('charge');
}
function updateEmote(dt) {
  if (!Emote.playing) return;
  Emote.t += dt;
  if (Emote.t >= Emote.playing.dur) Emote.playing = null;
}
/* drawn on top of the player in the overworld */
function drawEmoteAnim(x, y, u) {
  if (!Emote.playing) return false;
  const em = Emote.playing, t = Emote.t;
  const spr = skinSprite();
  const k = em.kind;
  if (k === 'hakari') {                       // the jackpot dance gets its own animator
    drawHakariDance(spr, x, y, u, t);
    textC(em.name, x + 8 * u, y - 14, { scale: 1, color: em.rar.col, shadow: '#000' });
    return true;
  }
  ctx.save();
  let ox = 0, oy = 0, rot = 0;
  if (k === 'dance') { ox = Math.sin(t * 9) * 5; oy = -Math.abs(Math.sin(t * 9)) * 5; }
  if (k === 'floss') { ox = Math.sin(t * 7) * 4; }
  if (k === 'wiggle') { rot = Math.sin(t * 14) * .18; }
  if (k === 'takel') { ox = Math.sin(t * 5) * 3; }
  if (k === 'flex') { oy = -Math.abs(Math.sin(t * 3)) * 3; }
  if (rot) { ctx.translate(x + 8 * u, y + 20 * u); ctx.rotate(rot); ctx.translate(-(x + 8 * u), -(y + 20 * u)); }
  drawActor(spr, x + ox, y + oy, u, { t, dir: 0, walking: k === 'dance' || k === 'hakari' || k === 'floss', frame: (t * 10 | 0) % 4 });
  ctx.restore();
  // flourishes
  const cx = x + 8 * u, cy = y + 4 * u;
  if (k === 'wave') { text('↑', cx + 12, cy + 4 + Math.sin(t * 10) * 3, { scale: 2, color: '#fff' }); }
  if (k === 'console') { text('■', cx - 20, cy + 26, { scale: 2, color: PAL.cyan }); }
  if (k === 'peace') { text('V', cx + 14, cy - 6, { scale: 3, color: '#fff', shadow: '#000' }); }
  if (k === 'point') { text('→', cx + 16, cy + 20, { scale: 3, color: PAL.red, shadow: '#000' }); }
  if (k === 'clap' && Math.sin(t * 12) > .6) { FX.part(cx, cy + 20, { kind: 'spark', col: PAL.gold, life: .3, size: 3 }); }
  if (k === 'stare') {
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * TAU + t;
      rect(cx + Math.cos(a) * (30 + Math.sin(t * 2 + i) * 8), cy + Math.sin(a) * (24 + Math.cos(t * 2 + i) * 6), 2, 2, '#cfd8ff');
    }
    ctx.restore();
  }
  if (k === 'flex') {
    ctx.save(); ctx.globalAlpha = .35 + Math.sin(t * 8) * .15;
    circle(cx, cy + 18, 34 + Math.sin(t * 4) * 6, PAL.cyan, false);
    ctx.restore();
    drawHandSign('tv', cx, cy - 12, .55, PAL.cyan, t);
  }
  if (k === 'hakari') {
    for (let i = 0; i < 3; i++) {
      const a = t * 6 + i * 2.1;
      text('$', cx + Math.cos(a) * 26, cy + 8 + Math.sin(a) * 14, { scale: 2, color: PAL.gold, shadow: '#000' });
    }
  }
  if (k === 'takel') { text('L', cx + 16, cy - 4, { scale: 3, color: PAL.pink, shadow: '#000' }); }
  if (k === 'wiggle') { drawActor('orange', x + 24, y + 6 * u, Math.max(2, u - 1), { t, hop: true }); }
  if (k === 'pose') { text('★', cx + 16, cy - 2, { scale: 2, color: PAL.yellow }); }
  // name tag
  textC(em.name, cx, y - 14, { scale: 1, color: em.rar.col, shadow: '#000' });
  return true;
}
function drawEmoteIcon(em, x, y, t) {
  const k = em.kind;
  const bob = t ? Math.sin(t * 10) * 2 : 0;
  drawActor('kenji', x - 8 * 1.5, y - 14 + bob, 1.5, { t: t || 0, dir: 0, bob: false });
  if (k === 'peace') text('V', x + 10, y - 10, { scale: 1, color: '#fff' });
  if (k === 'hakari') text('$', x + 10, y - 10, { scale: 1, color: PAL.gold });
  if (k === 'takel') text('L', x + 10, y - 10, { scale: 1, color: PAL.pink });
  if (k === 'point') text('→', x + 10, y - 6, { scale: 1, color: PAL.red });
  if (k === 'stare') text('★', x + 10, y - 10, { scale: 1, color: '#cfd8ff' });
}

/* ===========================================================
   SHOP SCENE
   =========================================================== */
const Shop = {
  open: false, tab: 0, idx: 0, scroll: 0, t: 0, msg: '', msgT: 0, who: 'orange',
  tabs: ['SKINS', 'EMOTES', 'PACKS', 'ITEMS'],

  show(who = 'orange') {
    this.open = true; this.tab = 0; this.idx = 0; this.scroll = 0; this.who = who;
    Audio.play('shop'); Audio.sfx('ok');
    this.say(who === 'orange'
      ? 'ORANGE: "welcome to my store. i stole all of this."'
      : '"Jujutsu High supply. Please do not weaponise the snacks."');
  },
  hide() { this.open = false; Audio.sfx('cancel'); Game.resumeMusic(); },
  say(m) { this.msg = m; this.msgT = 4; },

  list() {
    switch (this.tabs[this.tab]) {
      case 'SKINS': return Object.keys(SKINS).filter(k => k !== 'default' && (SKINS[k].price > 0)).map(k => ({ k, ...SKINS[k], kind: 'skin' }));
      case 'EMOTES': return Object.keys(EMOTES).filter(k => EMOTES[k].price > 0).map(k => ({ k, ...EMOTES[k], kind: 'emote' }));
      case 'PACKS': return Object.keys(PACKS).map(k => ({ k, ...PACKS[k], kind: 'pack' }));
      case 'ITEMS': return Object.keys(ITEMS).map(k => ({ k, ...ITEMS[k], kind: 'item' }));
    }
    return [];
  },
  owned(e) {
    if (e.kind === 'skin') return !!G.ownedSkins[e.k];
    if (e.kind === 'emote') return !!G.ownedEmotes[e.k];
    if (e.kind === 'pack') {
      const its = e.items || [], sks = e.skins || [];
      return its.every(i => G.ownedEmotes[i]) && sks.every(s => G.ownedSkins[s]);
    }
    return false;
  },

  update(dt) {
    if (!this.open) return;
    this.t += dt; if (this.msgT > 0) this.msgT -= dt;
    if (Input.just('back') || Input.just('esc') || Input.just('menu')) { this.hide(); return; }
    if (Input.just('left')) { this.tab = (this.tab + 3) % 4; this.idx = 0; this.scroll = 0; Audio.sfx('move'); }
    if (Input.just('right')) { this.tab = (this.tab + 1) % 4; this.idx = 0; this.scroll = 0; Audio.sfx('move'); }
    const L = this.list();
    if (Input.just('up')) { this.idx = (this.idx + L.length - 1) % L.length; Audio.sfx('move'); }
    if (Input.just('down')) { this.idx = (this.idx + 1) % L.length; Audio.sfx('move'); }
    if (Input.just('ok')) this.buy(L[this.idx]);
  },

  buy(e) {
    if (!e) return;
    if (e.kind !== 'item' && this.owned(e)) {
      if (e.kind === 'skin') { G.equippedSkin = e.k; Audio.sfx('buy'); this.say('Equipped: ' + e.name); }
      else if (e.kind === 'emote') { autoEquipEmote(e.k); playEmote(e.k); Audio.sfx('buy'); this.say('Equipped to the wheel.'); }
      else Audio.sfx('deny');
      return;
    }
    if (G.money < e.price) {
      Audio.sfx('deny');
      this.say(this.who === 'orange'
        ? 'ORANGE: "broke. go punch something with a wallet."'
        : '"Insufficient funds. Take a mission."');
      return;
    }
    G.gainMoney(-e.price); Audio.sfx('buy');
    FX.burst(W / 2, H / 2, 24, { kind: 'spark', col: PAL.gold, size: 3, life: .8, g: 160 });
    if (e.kind === 'skin') { giveSkin(e.k); G.equippedSkin = e.k; this.say('ORANGE: "ok that one actually goes hard."'); }
    else if (e.kind === 'emote') { giveEmote(e.k); playEmote(e.k); this.say('ORANGE: "DO IT AGAIN. DO IT AGAIN."'); }
    else if (e.kind === 'pack') {
      (e.items || []).forEach(giveEmote); (e.skins || []).forEach(giveSkin);
      this.say('ORANGE: "bundle!! thats value!! i think!!"');
    }
    else if (e.kind === 'item') {
      G.items[e.k] = (G.items[e.k] || 0) + 1;
      this.say('Bought ' + e.name + '. (x' + G.items[e.k] + ')');
    }
  },

  draw() {
    rect(0, 0, W, H, '#0a0612');
    // backdrop
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < 40; i++) {
      const x = (i * 97 + (this.t * 20 | 0)) % W, y = (i * 53) % H;
      text('$', x, y, { scale: 1, color: '#2a1f3a' });
    }
    ctx.restore();
    box(10, 10, W - 20, H - 20, { fill: '#0b0a18', edge: '#fff', t: 3 });
    // header
    rect(16, 16, W - 32, 26, '#1a1030');
    text(this.who === 'orange' ? "ORANGE'S DEFINITELY-LEGAL SHOP" : 'JUJUTSU HIGH SUPPLY', 26, 22, { scale: 2, color: PAL.orange });
    const mt = '$' + fmt(G.money);
    text(mt, W - 30 - textW(mt, 2), 22, { scale: 2, color: PAL.gold });
    // tabs
    let tx = 26;
    this.tabs.forEach((t, i) => {
      const sel = i === this.tab, w = textW(t, 2) + 14;
      rect(tx - 4, 48, w, 20, sel ? PAL.orange : '#1a1030');
      text(t, tx + 2, 54, { scale: 2, color: sel ? '#140800' : '#8a7aa8' });
      tx += w + 6;
    });
    // list
    const L = this.list(), per = 8;
    if (this.idx < this.scroll) this.scroll = this.idx;
    if (this.idx >= this.scroll + per) this.scroll = this.idx - per + 1;
    for (let i = 0; i < Math.min(per, L.length); i++) {
      const n = i + this.scroll, e = L[n]; if (!e) break;
      const y = 80 + i * 32, sel = n === this.idx, own = this.owned(e);
      if (sel) { rect(22, y - 4, 356, 30, '#231538'); frameRect(22, y - 4, 356, 30, PAL.orange, 1); }
      const rcol = (e.rar || RARITY.common).col;
      rect(26, y - 1, 4, 24, rcol);
      text(e.name, 38, y, { scale: 2, color: sel ? '#fff' : '#cfc3e0' });
      if (e.rar) text(e.rar.name, 38, y + 17, { scale: 1, color: rcol });
      const pt = own ? (e.kind === 'skin' && G.equippedSkin === e.k ? 'EQUIPPED' : 'OWNED') : '$' + fmt(e.price);
      text(pt, 370 - textW(pt, 2), y + 4, { scale: 2, color: own ? PAL.green : PAL.gold });
      if (e.kind === 'item' && G.items[e.k]) text('x' + G.items[e.k], 340, y + 18, { scale: 1, color: '#8a7aa8' });
    }
    if (L.length > per) text((this.idx + 1) + '/' + L.length, 346, 80 + per * 32, { scale: 1, color: '#55456d' });

    // preview pane
    const e = L[this.idx];
    const px = 394, pw = W - px - 22;
    panel(px, 76, pw, 250, e ? (e.rar || RARITY.common).col : '#39455c');
    if (e) {
      const rcol = (e.rar || RARITY.common).col;
      textC(e.name, px + pw / 2, 84, { scale: 2, color: rcol, shadow: '#000' });
      if (e.rar) { const w = textW(e.rar.name, 1) + 8; rarityTag(e.rar, px + pw / 2 - w / 2, 104, 1); }
      // preview art
      const ay = 124;
      rect(px + 10, ay, pw - 20, 110, '#05040c');
      frameRect(px + 10, ay, pw - 20, 110, '#2a1f3a', 1);
      if (e.kind === 'skin') {
        drawActor(e.spr, px + pw / 2 - 8 * 5, ay + 8, 5, { t: this.t, dir: 0 });
      } else if (e.kind === 'emote') {
        if (e.kind === 'emote' && e.k === 'hakari') {
          ctx.save();
          ctx.beginPath(); ctx.rect(px + 10, ay, pw - 20, 110); ctx.clip();
          drawHakariDance(skinSprite(), px + pw / 2 - 8 * 3, ay + 30, 3, this.t);
          ctx.restore();
        } else {
          drawActor(skinSprite(), px + pw / 2 - 8 * 4 + Math.sin(this.t * 8) * 4, ay + 16, 4,
            { t: this.t, dir: 0, walking: true, frame: (this.t * 9 | 0) % 4 });
        }
        textC(e.kind, px + pw / 2, ay + 92, { scale: 1, color: '#8a7aa8' });
      } else if (e.kind === 'pack') {
        (e.items || []).concat(e.skins || []).slice(0, 4).forEach((id, i) => {
          const o = EMOTES[id] || SKINS[id];
          text('■ ' + (o ? o.name : id), px + 20, ay + 12 + i * 16, { scale: 1, color: o ? o.rar.col : '#fff' });
        });
      } else {
        drawActor('orange', px + pw / 2 - 8 * 4, ay + 14, 4, { t: this.t, hop: true });
      }
      wrap(e.desc, Math.floor((pw - 24) / 6)).forEach((l, i) =>
        text(l, px + 12, 242 + i * 11, { scale: 1, color: '#cfc3e0' }));
    }
    // orange shopkeeper + speech
    drawActor('orange', W - 120, H - 120, 5, { t: this.t, hop: true, glow: true });
    if (this.msgT > 0) {
      const lines = wrap(this.msg, 34);
      const bh = 14 + lines.length * 12;
      rect(px, H - 150 - bh, pw, bh, '#05040c'); frameRect(px, H - 150 - bh, pw, bh, PAL.orange, 2);
      lines.forEach((l, i) => text(l, px + 8, H - 144 - bh + i * 12, { scale: 1, color: PAL.orange2 }));
    }
    textC('← → CATEGORY   ↑ ↓ ITEM   Z BUY/EQUIP   X LEAVE', W / 2, H - 26, { scale: 1, color: '#6b5a8a' });
  }
};
