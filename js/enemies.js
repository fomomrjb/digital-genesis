/* ===========================================================
   DIGITAL GENESIS — enemies.js
   Enemy stats, bullet-pattern playlists, barks, boss phases
   =========================================================== */
'use strict';

/* pattern ids are implemented in battle.js :: runPattern() */
const ENEMIES = {
  /* ---------- fodder ---------- */
  grade4: {
    name: 'Grade 4 Curse', spr: 'curseBlob', hp: 40, atk: 7, def: 1, xp: 26, money: 55,
    scale: 3, patterns: ['bullets', 'homing'], music: 'battle', grade: '4',
    check: 'A badly coded program. 40 HP. It smells like a wet gym bag.',
    barks: ['*gurgling*', 'The curse wobbles menacingly.', 'It tries to look big.'],
    spareAt: .3
  },
  swarm: {
    name: 'Curse Swarm', spr: 'curseBug', hp: 60, atk: 8, def: 2, xp: 40, money: 80,
    scale: 3, patterns: ['bugs', 'bullets'], music: 'battle', grade: '4',
    check: 'Several small curses pretending to be one big curse.',
    barks: ['*skittering*', 'They are arguing about who leads.', 'Chitter chitter.']
  },
  grade2: {
    name: 'Grade 2 Curse', spr: 'curseBlob', hp: 110, atk: 12, def: 4, xp: 85, money: 150,
    scale: 4, patterns: ['bullets', 'homing', 'rain'], music: 'battle', grade: '2',
    check: '110 HP. Actually finished its tutorial, unlike the last one.',
    barks: ['It roars with real weight.', 'The air gets heavy.', '*SHRIEK*']
  },
  grade1: {
    name: 'Grade 1 Curse', spr: 'curseBig', hp: 210, atk: 17, def: 7, xp: 180, money: 300,
    scale: 4, patterns: ['cleave', 'rain', 'homing', 'spin'], music: 'battle', grade: '1',
    check: 'Grade 1. 210 HP. It has a mouth where a mouth should not be.',
    barks: ['It grins with a hundred teeth.', 'The floor cracks under it.', '*ROAAAR*']
  },
  fingerBearer: {
    name: 'Finger Bearer', spr: 'curseBig', hp: 300, atk: 20, def: 9, xp: 240, money: 420,
    scale: 5, patterns: ['cleave', 'spin', 'rain', 'grid'], music: 'boss', grade: 'SP',
    check: 'It swallowed one of Sukuna\'s fingers. The finger is doing the thinking.',
    barks: ['The finger pulses.', 'It moves like something else is driving.', '*WET GURGLE*']
  },
  specialSubway: {
    name: 'Special Grade Curse', spr: 'curseBig', hp: 100, atk: 22, def: 6, xp: 150, money: 200,
    scale: 5, patterns: ['cleave', 'rain', 'homing'], music: 'boss', grade: 'SP',
    check: 'Special Grade. 100 HP. It is killing everyone in this station. ...It is also very poorly coded.',
    barks: ['It tears a pillar out of the ceiling.', 'Screaming echoes down the platform.', '*HOWLING*'],
    tutorial: true
  },

  /* ---------- orange challenge targets ---------- */
  dummy: {
    name: 'Training Dummy', spr: 'curseBlob', hp: 999, atk: 0, def: 0, xp: 5, money: 5,
    scale: 3, patterns: [], music: 'battle', grade: 'T',
    check: 'A straw dummy. Orange drew a face on it. The face is rude.',
    barks: ['The dummy says nothing.', 'Orange is holding it upright.', 'It judges your combo timing.'],
    noDeath: true
  },
  droneSwarm: {
    name: 'Orange Target Drones', spr: 'curseBug', hp: 320, atk: 14, def: 3, xp: 150, money: 260,
    scale: 3, patterns: ['bullets', 'grid', 'laser', 'spin'], music: 'orange', grade: 'C',
    check: 'Orange spawned these out of Creative Mode. He insists they are "legally distinct".',
    barks: ['ORANGE: "dodge this one!! DODGE IT"', 'The drones re-render.', 'ORANGE: "im not even trying yet"']
  },

  /* ---------- named ---------- */
  todo: {
    name: 'Aoi Todo', spr: 'yuji', hp: 360, atk: 19, def: 8, xp: 300, money: 500,
    scale: 4, patterns: ['cleave', 'homing', 'spin'], music: 'boss', grade: '1',
    check: 'Grade 1 sorcerer. 360 HP. Will ask you about your type of woman mid-swing.',
    barks: ['"WHAT KIND OF WOMAN IS YOUR TYPE?"', '"Boogie Woogie."', '"My brother!!"'],
    friendly: true, spareAt: .35
  },
  hanami: {
    name: 'Hanami', spr: 'hanami', hp: 520, atk: 22, def: 12, xp: 420, money: 700,
    scale: 5, patterns: ['thorns', 'rain', 'homing', 'grid'], music: 'boss', grade: 'SP',
    check: 'Special Grade. 520 HP. It wants the humans gone so the forest can breathe.',
    barks: ['"...Jujutsu sorcerer."', 'Wooden branches creak outward.', 'Flower buds open — poison.'],
    phases: [{ at: .5, bark: 'Hanami hardens its bark. Defence up.', buff: { def: 6 } }]
  },
  jogo: {
    name: 'Jogo', spr: 'jogo', hp: 500, atk: 26, def: 10, xp: 400, money: 680,
    scale: 5, patterns: ['fire', 'rain', 'homing'], music: 'boss', grade: 'SP',
    check: 'Special Grade. 500 HP. Claims to be as strong as Hanami. Nobody agrees.',
    barks: ['"Insolent monkey."', 'The air shimmers at 200°C.', '"I will erase this city."'],
    phases: [{ at: .4, bark: 'Jogo prepares MAXIMUM: METEOR.', pattern: 'meteor' }]
  },
  dagon: {
    name: 'Dagon', spr: 'dagon', hp: 560, atk: 24, def: 11, xp: 430, money: 720,
    scale: 5, patterns: ['water', 'homing', 'grid'], music: 'boss', grade: 'SP',
    check: 'Special Grade. 560 HP. Newly born. Already drowning a whole district.',
    barks: ['"...Shikigami."', 'Water rises out of nothing.', 'Death Swarm: fish.'],
    domain: 'selfembodiment'
  },
  mahito: {
    name: 'Mahito', spr: 'mahito', hp: 650, atk: 25, def: 10, xp: 520, money: 900,
    scale: 5, patterns: ['hands', 'homing', 'bugs', 'grid'], music: 'shibuya', grade: 'SP',
    check: 'Special Grade. 650 HP. Souls are toys to him. Your soul is a toy he cannot open.',
    barks: ['"A child? Jujutsu High must be desperate!"', '"Let me see what shape your soul takes!"',
            '"Idle Transfiguration!"'],
    phases: [
      { at: .6, bark: 'Mahito scatters into a swarm of insects.', pattern: 'bugs' },
      { at: .3, bark: 'Mahito forms the hand signs inside his mouth.', domain: 'selfembodiment' }
    ]
  },
  mahitoFinal: {
    name: 'Mahito (Perfected)', spr: 'mahito', hp: 560, atk: 32, def: 14, xp: 600, money: 1100,
    scale: 5, patterns: ['hands', 'grid', 'cleave'], music: 'shibuya', grade: 'SP',
    check: 'He has shed everything unnecessary. 560 HP of pure transfiguration.',
    barks: ['"I understand now. You are not changing the body."', '"You interrupt the connection!"',
            '"I will become perfect!"']
  },
  gojoSpar: {
    name: 'Satoru Gojo', spr: 'gojo', hp: 360, atk: 26, def: 10, xp: 700, money: 1200,
    scale: 5, patterns: ['purple', 'homing', 'laser', 'grid'], music: 'boss', grade: 'SP',
    check: 'The strongest. Infinity means you cannot touch him. ...Unless you turn the rule off.',
    barks: ['"Go ahead. Try to touch me."', '"Nah, Infinity."', '"Hollow Technique: Purple."'],
    infinity: true, sparring: true, endAt: .55,
    phases: [
      { at: .8, bark: 'Gojo pulls the blindfold off. Six Eyes.', swap: 'gojoEyes' },
      { at: .5, bark: 'Gojo forms a one-handed sign.', domain: 'infinitevoid' }
    ]
  },
  sukuna: {
    name: 'Ryomen Sukuna', spr: 'sukuna', hp: 1500, atk: 38, def: 18, xp: 2000, money: 3000,
    scale: 6, patterns: ['cleave', 'slashrain', 'fuga', 'spin', 'grid'], music: 'sukuna', grade: 'SP+',
    check: 'The King of Curses. 1500 HP. A thousand years of winning. He is already bored of you.',
    barks: ['"Is that your best attack?"', '"Stand proud. You are strong."', '"Cleave."', '"Dismantle."',
            '"A child cannot rewrite the King."'],
    phases: [
      { at: .72, bark: 'Sukuna stops smiling. "Enough games."', buff: { atk: 6 } },
      { at: .45, bark: 'Sukuna brings his hands together.', domain: 'shrine' },
      { at: .18, bark: 'Sukuna uses a binding vow. His output doubles.', buff: { atk: 10, def: 6 } }
    ]
  },
  kenjaku: {
    name: '???', spr: 'kenjaku', hp: 1, atk: 0, def: 0, xp: 0, money: 0,
    scale: 5, patterns: [], music: 'culling', grade: '??',
    check: 'The stitched man. You cannot read his data. Something is wrong with the file.',
    barks: ['"Hello, little administrator."']
  }
};
/* enemy techniques referenced by Video Game Copy (things Kenji has witnessed) */
const COPYABLE = [
  { id: 'dismantle', name: 'Cleave / Dismantle', from: 'sukuna', power: 2.2, col: '#ff3b3b',
    jp: '解 / 捌', flavour: 'Neon retro laser cuts. Zero wasted energy.' },
  { id: 'purple', name: 'Hollow Purple', from: 'gojo', power: 3.0, col: '#9b4dff',
    jp: '虚式「茈」', flavour: 'Red times Blue. Imaginary mass, erases on contact.' },
  { id: 'fuga', name: 'Divine Flame', from: 'jogo', power: 2.4, col: '#ff7a2a',
    jp: '蒼炎', flavour: 'A pixel-perfect firestorm.' },
  { id: 'thorns', name: 'Wooden Ravage', from: 'hanami', power: 2.0, col: '#4a7a3a',
    jp: '樹操', flavour: 'Spawned from the ground like level geometry.' },
  { id: 'transfig', name: 'Idle Transfiguration', from: 'mahito', power: 2.3, col: '#ff9ec4',
    jp: '無為転変', flavour: 'You edit the shape, not the soul. Cleaner that way.' },
  { id: 'savestate', name: 'Save / Load', from: 'videogame', power: 0, col: '#ffe14d',
    jp: 'セーブ＆ロード', flavour: 'Rewind your own damage by 5 seconds.', heal: true },
  { id: 'iframes', name: 'Invincibility Frames', from: 'videogame', power: 0, col: '#3ddcff',
    jp: '無敵時間', flavour: 'Air-dash cancel. You simply do not have a hitbox for a bit.', iframe: true },
  { id: 'boogie', name: 'Boogie Woogie', from: 'todo', power: 1.7, col: '#ffd24a',
    jp: 'ブギウギ', flavour: 'Clap. Swap. Punch from where they are not looking.' }
];

function copyableUnlocked() {
  return COPYABLE.filter(c => G.flags['copy_' + c.id]);
}
