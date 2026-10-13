/* ===========================================================
   DIGITAL GENESIS — abilities.js
   Every technique, when it unlocks, and how it behaves.
   Lv1  : PUNCH + the entire ORANGE suite
   Then : Digital Genesis branches, Black Flash, Domains, Orange Flash
   =========================================================== */
'use strict';

const ABILITIES = [
  /* ============ BASICS ============ */
  { id: 'punch', name: 'Punch', jp: 'パンチ', kanji: '拳', lv: 1, type: 'attack',
    cost: 0, power: 1.0, hits: 3, col: '#ffffff', colD: '#6a7893', sfx: 'punch',
    tag: 'COMBO', branch: 'Basics',
    desc: 'Average strength for a 12-year-old. Three-hit timing combo. The bar speeds up every hit you land.' },
  { id: 'cestrike', name: 'CE Strike', jp: '呪力打撃', kanji: '呪', lv: 2, type: 'attack',
    cost: 0, power: 1.35, hits: 4, col: '#3ddcff', colD: '#0a4a66', sfx: 'hit',
    tag: 'COMBO', branch: 'Basics',
    desc: 'Cursed energy wrapped around the fist. Four-hit combo, faster bar, bigger payout.' },

  /* ============ ORANGE SUITE — all available from the start ============ */
  { id: 'o_creative', name: 'Orange Creative Mode', jp: 'オレンジ・クリエイティブモード', kanji: '創', lv: 1,
    type: 'attack', cost: 0, power: 1.6, col: '#ff8c00', colD: '#b25a00', sfx: 'bigslam',
    tag: 'ORANGE', branch: 'ORANGE Suite', aoe: true,
    desc: 'Spawn obsidian and steel out of nothing and drop it on them. Flight + hazard immunity while active.' },
  { id: 'o_mute', name: 'Orange Admin Mute', jp: 'オレンジ・アドミンミュート', kanji: '黙', lv: 1,
    type: 'debuff', cost: 0, col: '#ff8c00', colD: '#b25a00', sfx: 'null',
    tag: 'ORANGE', branch: 'ORANGE Suite', turns: 3,
    desc: 'Revokes output permissions. Target cannot use techniques or expand a domain for 3 turns.' },
  { id: 'o_heal', name: 'Orange Heal', jp: 'オレンジ・ヒール', kanji: '癒', lv: 1,
    type: 'heal', cost: 0, power: 999, col: '#ff8c00', colD: '#b25a00', sfx: 'orangeheal',
    tag: 'ORANGE', branch: 'ORANGE Suite',
    desc: 'Pulls your pristine biological files off the world backup server. Full restore. Can even revive the dead.' },
  { id: 'o_survival', name: 'Orange Survival', jp: 'オレンジ・サバイバル', kanji: '生', lv: 1,
    type: 'passive', cost: 0, col: '#ff8c00', colD: '#b25a00',
    tag: 'PASSIVE', branch: 'ORANGE Suite',
    desc: 'Background script. Unavoidable lethal hits clip straight through your hitbox for zero damage.' },
  { id: 'o_spectator', name: 'Orange Spectator', jp: 'オレンジ・ギャラリー', kanji: '幽', lv: 1,
    type: 'buff', cost: 0, col: '#ff8c00', colD: '#b25a00', sfx: 'warp',
    tag: 'ORANGE', branch: 'ORANGE Suite', turns: 2,
    desc: 'Go translucent and intangible. Zero cursed energy footprint — you dodge everything for 2 turns.' },
  { id: 'o_teleport', name: 'Orange Teleport', jp: 'オレンジ・テレポート', kanji: '転', lv: 1,
    type: 'attack', cost: 0, power: 1.45, col: '#ff8c00', colD: '#b25a00', sfx: 'teleport',
    tag: 'ORANGE', branch: 'ORANGE Suite', pierce: true,
    desc: 'Snap your coordinates next to their soul signature and hit before the frame renders. Ignores defence.' },
  { id: 'o_disguise', name: 'Orange Disguise', jp: 'オレンジ・スキン', kanji: '貌', lv: 1,
    type: 'transform', cost: 0, power: 3.4, col: '#f2f2ee', colD: '#07070b', sfx: 'ghostface',
    tag: 'ULTRA', branch: 'ORANGE Suite', turns: 4, once: true,
    desc: 'Ghost Face robe, white mask, golden Executioner knife. Every strike ignores defence and binding vows and cuts life code directly. ONE use per fight.' },

  /* ============ DIGITAL GENESIS ============ */
  { id: 'null', name: 'Null', jp: 'ヌル', kanji: '零', lv: 3, type: 'debuff',
    cost: 0, col: '#00ffa6', colD: '#00603f', sfx: 'null',
    tag: 'NULLIFY', branch: 'Digital Genesis', turns: 2,
    desc: 'Set a value to zero. Deletes their next attack outright and zeroes their attack stat for 2 turns.' },
  { id: 'solver', name: 'Absolute Solver', jp: 'アブソリュート・ソルバー', kanji: '構', lv: 5, type: 'attack',
    cost: 0, power: 1.8, col: '#3ddcff', colD: '#0a4a66', sfx: 'bigslam',
    tag: 'HEAVY', branch: 'Digital Genesis', aoe: true,
    desc: 'Deconstruct the architecture into floating voxels and reassemble it as a dense projectile.' },
  { id: 'solver_shield', name: 'Passive Shielding', jp: 'パッシブ・シールド', kanji: '盾', lv: 5, type: 'passive',
    cost: 0, col: '#3ddcff', colD: '#0a4a66',
    tag: 'PASSIVE', branch: 'Digital Genesis',
    desc: 'Incoming matter is automatically rewritten into harmless 8-bit pixels before it touches your skin.' },
  { id: 'vgcopy', name: 'Video Game Copy', jp: 'ビデオゲーム・コピー', kanji: '模', lv: 8, type: 'copy',
    cost: 0, power: 2.0, col: '#9b4dff', colD: '#3a1b6b', sfx: 'glitch',
    tag: 'MIMIC', branch: 'Digital Genesis',
    desc: 'Replicate any technique you have witnessed as a digital mod — neon retro-game version, zero waste.' },
  { id: 'lagspike', name: 'Lag Spike', jp: 'ラグ・スパイク', kanji: '遅', lv: 11, type: 'debuff',
    cost: 0, col: '#ffe14d', colD: '#8a7a10', sfx: 'glitch',
    tag: 'CONTROL', branch: 'Digital Genesis', turns: 2,
    desc: 'Desync their brain from the flow of time by 3 seconds. They skip a turn, then rubberband backwards.' },
  { id: 'assetflip', name: 'Asset Flip', jp: 'アセット・フリップ', kanji: '換', lv: 14, type: 'special',
    cost: 0, col: '#ff4fa3', colD: '#8a1b4a', sfx: 'warp',
    tag: 'SWAP', branch: 'Digital Genesis',
    desc: 'Swap two assets. Trade your damage data for their pristine health state — or swap an incoming attack behind them.' },
  { id: 'blackflash', name: 'Black Flash', jp: '黒閃', kanji: '黒閃', lv: 17, type: 'attack',
    cost: 0, power: 2.5, hits: 5, col: '#ff2d2d', colD: '#2a0000', sfx: 'blackflash',
    tag: 'COMBO+', branch: 'Digital Genesis',
    desc: 'Distort space within 0.000001s of the impact. Five-hit combo — land every hit dead centre to trigger it.' },
  { id: 'orangeflash', name: 'Orange Flash', jp: '橙閃', kanji: '橙閃', lv: 30, type: 'attack',
    cost: 0, power: 14.0, hits: 7, col: '#ff8c00', colD: '#b25a00', sfx: 'orangeflash',
    tag: 'ULTRA', branch: 'ORANGE Suite', once: true,
    desc: 'One hundred times the impact of a Black Flash. Orange routes the universe engine through your fist. ONE use per fight.' },

  /* ============ DOMAINS ============ */
  { id: 'd_sandbox', name: 'Sandbox Mode: Developer Tools', jp: 'サンドボックス・モード', kanji: '箱', lv: 20,
    type: 'domain', domain: 'sandbox', cost: 0, col: '#3ddcff', colD: '#0a4a66',
    tag: 'DOMAIN', branch: 'Domain Expansion',
    desc: 'Closed barrier. Admin access over every rule inside: gravity, speed, render distance. Video Game Copy maxes out, zero cost.' },
  { id: 'd_404', name: 'Error 404: Cosmos Format', jp: 'エラー404: 宇宙初期化', kanji: '零', lv: 25,
    type: 'domain', domain: 'void404', cost: 0, col: '#00ffa6', colD: '#00603f',
    tag: 'DOMAIN', branch: 'Domain Expansion',
    desc: 'Sure-hit Null injected into the soul. 3s: senses gone. 10s: technique uninstalled. 30s: body becomes pixelated smoke.' }
];

const AB = {};
ABILITIES.forEach(a => AB[a.id] = a);

/* unlock milestones — shown on level-up */
const MILESTONES = {
  2:  ['cestrike'],
  3:  ['null'],
  5:  ['solver', 'solver_shield'],
  8:  ['vgcopy'],
  11: ['lagspike'],
  14: ['assetflip'],
  17: ['blackflash'],
  20: ['d_sandbox'],
  25: ['d_404'],
  30: ['orangeflash']
};

/* flavour text Orange screams in Kenji's head when something unlocks */
const UNLOCK_HYPE = {
  cestrike:  'ORANGE: "OK OK OK put the energy IN the fist. yes. YES."',
  null:      'ORANGE: "dude you just found the delete key for REALITY"',
  solver:    'ORANGE: "admin access to BUILDINGS?? throw a skyscraper!!"',
  solver_shield: 'ORANGE: "i will personally pixel-ify anything that touches you."',
  vgcopy:    'ORANGE: "steal their homework. steal ALL the homework."',
  lagspike:  'ORANGE: "lag them. LAG THEM. 400 ping on their SOUL."',
  assetflip: 'ORANGE: "swap your bruises for his face. do it. do it!!"',
  blackflash: 'ORANGE: "0.000001 SECONDS. THE SPACE WENT CRUNCH. I SAW IT."',
  d_sandbox: 'ORANGE: "CREATIVE MODE BUT ITS A WAR CRIME. im so proud."',
  d_404:     'ORANGE: "...kenji. that one deletes people. for real. ok cool."',
  orangeflash: 'ORANGE: "this is MY move. 100 black flashes in one punch. SWING IT."'
};

function abilityList(filterFn) { return ABILITIES.filter(filterFn); }
function battleAbilities() {
  return ABILITIES.filter(a => G.has(a.id) && ['attack','debuff','heal','buff','copy','special','transform'].includes(a.type));
}
function domainAbilities() { return ABILITIES.filter(a => G.has(a.id) && a.type === 'domain'); }
function comboAbilities() {
  return ABILITIES.filter(a => G.has(a.id) && a.hits && a.type === 'attack');
}
function unlocksAt(lv) { return (MILESTONES[lv] || []).map(id => AB[id]).filter(Boolean); }
